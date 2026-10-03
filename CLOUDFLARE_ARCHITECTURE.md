# BiHua (筆畫) - Cloudflare Workers + Static Assets + Hono + D1 Architecture

สถาปัตยกรรมแบบ **Unified Single-Repository (Monorepo)** ที่รวม **Frontend (Vite React SPA + PWA)** และ **Backend (Hono Edge Worker + D1 Database)** อยู่ในโดเมนเดียวกัน (Same-Domain Architecture) พร้อมระบบความปลอดภัยด้วย **HttpOnly Cookie**

---

## 🏛️ ภาพรวมสถาปัตยกรรม (System Architecture)

```
                            [ ผู้ใช้งาน (Web Browser / PWA Native) ]
                                                │
                                    (HTTPS: / และ /api/*)
                                                ▼
                   ┌────────────────────────────────────────────────────────┐
                   │           Cloudflare Edge Network (Global CDN)         │
                   └────────────────────────────┬───────────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   Cloudflare Worker   │
                                    │    (Hono Framework)   │
                                    │  `server/index.js`    │
                                    └───────────┬───────────┘
                                                │
                        ┌───────────────────────┴───────────────────────┐
                        │ เส้นทาง API (/api/*)                         │ เส้นทาง Assets ทั่วไป & SPA
                        ▼                                               ▼
     ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
     │           Hono API Router           │         │  Cloudflare Workers Static Assets   │
     │                                     │         │         (`env.ASSETS`)              │
     ├─────────────────────────────────────┤         ├─────────────────────────────────────┤
     │ • POST /api/auth/register           │         │ • dist/index.html (SPA Fallback)    │
     │ • POST /api/auth/login              │         │ • dist/assets/*.js, *.css           │
     │ • POST /api/auth/logout             │         │ • public/stroke/*.json (1,800 ตัว)  │
     │ • GET  /api/auth/me                 │         │ • dist/manifest.webmanifest         │
     │ • GET/POST /api/sync/bookmarks      │         │ • dist/sw.js (Service Worker PWA)   │
     └──────────────────┬──────────────────┘         └─────────────────────────────────────┘
                        │
                        ▼
     ┌─────────────────────────────────────┐
     │        Cloudflare D1 Database       │
     │            (`env.DB`)               │
     ├─────────────────────────────────────┤
     │ • `users` (PBKDF2 Password + Salt)  │
     │ • `sessions` (HttpOnly Session ID)  │
     │ • `user_bookmarks` (Cloud Sync)     │
     │ • `user_progress` (SRS Study State) │
     └─────────────────────────────────────┘
```

---

## 🔒 ทำไมต้อง Same-Domain + HttpOnly Cookie?

1. **ป้องกัน XSS Token Theft 100%**:
   - บราวเซอร์หรือสคริปต์ JavaScript (`document.cookie`, `localStorage`) จะ**ไม่สามารถอ่านค่า Cookie นี้ได้** แม้เว็บจะโดน Third-party Script โจมตี
2. **ไม่ต้องกังวลเรื่อง CORS / Preflight Request**:
   - เมื่อ Frontend และ Backend อยู่บนโดเมนเดียวกัน (เช่น `bihua.app` และ `bihua.app/api/*`) รีเควสต์จะไม่ติดข้อจำกัด Cross-Origin และไม่ต้องส่ง `OPTIONS` preflight ซ้ำซ้อน ช่วยให้ API ตอบสนองได้รวดเร็วระดับ Edge Latency (< 15ms)
3. **ป้องกัน CSRF**:
   - Cookie ถูกตั้งค่า `SameSite: Lax` และ `Secure: true` (บน HTTPS) ร่วมกับการรับส่งข้อมูลแบบ JSON Body บน API Endpoints

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
BiHua/
├── dist/                         # ผลลัพธ์ build ของ Vite React SPA + PWA
├── public/                       # Static Assets (favicon, icons, stroke json, dictionary)
├── src/                          # Frontend Source Code (React 18 + Tailwind)
│   ├── components/
│   │   ├── AuthModal.jsx         # กล่อง Login / Register สวยงาม
│   │   ├── Navbar.jsx            # แถบเมนูด้านบน แสดง User Chip และปุ่ม Offline
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.jsx           # Auth Context จัดการ Login, Register, Logout อัตโนมัติ
│   │   └── ...
│   └── App.jsx                   # ครอบด้วย <AuthProvider>
├── server/                       # Backend Source Code (Cloudflare Edge Worker)
│   ├── db/
│   │   └── schema.sql            # โครงสร้างตาราง D1 (users, sessions, bookmarks, progress)
│   ├── middleware/
│   │   └── auth.js               # Middleware ตรวจสอบ Session Cookie จาก D1
│   ├── routes/
│   │   ├── auth.js               # API Login, Register, Logout, Me
│   │   └── sync.js               # API ซิงก์คำศัพท์และ Bookmark ขึ้นคลาวด์
│   ├── utils/
│   │   ├── crypto.js             # Web Crypto API (PBKDF2 SHA-256 + Salt)
│   │   └── cookies.js            # จัดการ HttpOnly Cookie ผ่าน Hono Cookie API
│   └── index.js                  # Entry point ของ Hono Worker และ Asset Fallback
├── wrangler.jsonc                # ตั้งค่า Cloudflare Workers + Static Assets + D1
├── vite.config.js                # ตั้งค่า Vite + PWA + Proxy ไปยัง Worker ในช่วง Dev
└── package.json                  # สคริปต์สั่งรันและ deploy
```

---

## 🛠️ วิธีการรันและพัฒนา (Development Guide)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน D1 Database Migration บนเครื่อง Local
สร้างตาราง `users`, `sessions`, `user_bookmarks`, `user_progress` ในฐานข้อมูลจำลองของ Cloudflare:
```bash
npm run db:migrate:local
```

### 3. รันเพื่อพัฒนา (Local Development)
เปิด 2 หน้าต่าง Terminal:

**Terminal 1: รัน Cloudflare Worker Backend (Hono + D1)**
```bash
npm run server:dev
# จะรันบน http://127.0.0.1:8787
```

**Terminal 2: รัน Vite Frontend (พร้อม Proxy ไปหา Backend)**
```bash
npm run dev
# จะรันบน http://localhost:3000
# ทุกการเรียก /api/* จาก Vite จะถูกส่งต่อไปยัง Worker พอร์ต 8787 โดยอัตโนมัติ
```

---

## 🚀 การ Deploy ขึ้น Cloudflare (Production Deployment)

### 1. สร้างฐานข้อมูล D1 บน Cloudflare Dashboard หรือ CLI
```bash
npx wrangler d1 create bihua-db
```
นำ `database_id` ที่ได้มาใส่ในไฟล์ `wrangler.jsonc`:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bihua-db",
    "database_id": "<YOUR_D1_DATABASE_ID>"
  }
]
```

### 2. รัน Migration บน Production D1
```bash
npm run db:migrate:remote
```

### 3. Build Frontend & Deploy สู่ Cloudflare Worker
คำสั่งเดียวจะทำการ build dictionary data, compile React Vite + PWA assets และอัปโหลดไปยัง Cloudflare Worker:
```bash
npm run deploy
```

เมื่อ Deploy เรียบร้อย:
- หน้าเว็บ Frontend และ Assets ทั้งหมดจะถูก Serve ผ่าน Cloudflare CDN (Global Edge)
- เส้นทาง `/api/*` ทั้งหมดจะถูกคำนวณและประมวลผลผ่าน Hono Edge Worker
- ฐานข้อมูล D1 จะรันอยู่ที่ Edge ใกล้ผู้ใช้งานที่สุดพร้อมระบบ HttpOnly Session ที่ปลอดภัยสูงสุด
