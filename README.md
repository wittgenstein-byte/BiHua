# BiHua (筆畫) - HSK 1-6 Chinese Character & Stroke Order Master

BiHua (筆畫) is a premium, interactive EdTech web application designed for learning Chinese character stroke orders, practicing handwriting on a digital grid with real-time feedback, exploring the HSK 1–6 vocabulary database, and scheduling reviews with a Spaced Repetition System (SRS).

---

## ✨ Features

- **✍️ Interactive Stroke Practice**: Draw directly on a traditional red Tianzige (田字格) grid with active touch/mouse event tracking. Powered by `hanzi-writer` for direction checking, automatic coordinate mapping, and mistake calculation.
- **🎬 Animated Stroke Visualizer**: Render vector stroke animations step-by-step with play/pause, stepping, speed controls (0.5x to 2x), and radical stroke highlighting (using custom color configurations).
- **🧠 FSRS Spaced Repetition System**: A modern spaced repetition scheduler powered by `ts-fsrs` and stored asynchronously in IndexedDB via `Dexie.js` for fast query times and high storage limits.
- **🔍 Multi-Query Vocabulary Explorer**: Real-time HSK dictionary search bar supporting toneless pinyin (e.g. `baba`), tone-marked pinyin (`bàba`), English translations, or Chinese characters. Filter words instantly by HSK levels 1–6.
- **🔗 Cross-Referencing Vocabulary**: Breakdown multi-character words and click any single character to instantly cross-reference and list all other HSK vocabulary entries containing that character.
- **🚀 On-Demand Stroke Loading**: High-performance pipeline that fetches character vector stroke JSON files dynamically on-demand from the client, keeping bundle sizes small.

---

## 🛠️ Technology Stack

- **Core Framework**: React 18 & Vite
- **Styling**: Tailwind CSS
- **Vector Animations & Quiz Matching**: `hanzi-writer`
- **Database & Storage**: IndexedDB (`Dexie.js`)
- **SRS Scheduling**: FSRS (`ts-fsrs` package)
- **Icons**: Lucide React
- **Data Preprocessing**: Node.js (Pandas/Regex logic translated to MJS pipeline)

---

## 📦 Directory Structure

```text
BiHua/
├── public/
│   ├── data/
│   │   └── hsk_master_dictionary.json   # Cleaned master dictionary (5,456 entries)
│   └── stroke/
│       └── [char].json                  # Individual stroke JSON files (1,800 characters)
├── scripts/
│   ├── build-dictionary.mjs             # Normalizes dictionary to hsk-words.json & hsk-chars.json
│   └── check-stroke-coverage.mjs        # Audits stroke file coverage against the dataset
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                   # Navigation, mode tab switcher, and SRS status
│   │   ├── SearchBar.jsx                # Search input & HSK filter pills
│   │   ├── VocabularyGrid.jsx           # Grid of vocabulary word cards
│   │   ├── CharacterDetailModal.jsx     # Animator, practice canvas, and related words list
│   │   └── SRSFlashcardView.jsx         # Flashcard practice panel with FSRS ratings
│   ├── data/
│   │   ├── hsk-words.json               # Word list output from Task 0
│   │   ├── hsk-chars.json               # Unique character reference map
│   │   └── missing-chars.json           # Output audit listing missing characters (0 found)
│   ├── db/
│   │   └── schema.js                    # Dexie.js database model definition
│   ├── engine/
│   │   ├── srs.js                       # ts-fsrs wrapper and grade mapping
│   │   ├── strokeAnimator.js            # hanzi-writer animation playback & speed controller
│   │   └── strokeWriter.js              # hanzi-writer quiz instantiator
│   ├── hooks/
│   │   ├── useDictionary.js             # Vocabulary loading and relation hook
│   │   ├── useSearch.js                 # Search and filter state management
│   │   └── useSRS.js                    # Active review list manager
│   ├── App.jsx                          # Main UI routing and page wrapper
│   ├── main.jsx                         # App React rendering entry point
│   └── index.css                        # Design system tokens and Tianzige styling
├── tailwind.config.js                   # Tailwind configurations
├── postcss.config.js                    # PostCSS plugins setup
├── vite.config.js                       # Vite dev server and folder aliasing configuration
└── package.json                         # Node dependency manifest
```

---

## 🚦 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd BiHua
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Dataset Processing & Verification

To process the master dictionary and check the stroke data coverage, run:

```bash
npm run build:data
```

This runs:
- `build-dictionary.mjs` to clean raw dictionary entries.
- `check-stroke-coverage.mjs` to verify that all characters in the dictionary have a corresponding stroke file in `public/stroke/` (Achieved **100% stroke coverage**).

### Run Locally

Start the Vite local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To compile a minified production build:

```bash
npm run build
```

The output will be bundled in the `dist/` directory.

---

## 🧠 Spaced Repetition (FSRS) Logic

BiHua implements the **Free Spaced Repetition Scheduler (FSRS)**. When you practice writing a character, the mistake count from the drawing canvas maps onto FSRS ratings:
- **0 Mistakes**: Mapped to `Good` or `Easy` (depending on review performance). Schedules next review in 3 to 7 days.
- **1-2 Mistakes**: Mapped to `Hard`. Schedules next review in 1 day.
- **3+ Mistakes**: Mapped to `Again`. Schedules next review immediately under learning state.
