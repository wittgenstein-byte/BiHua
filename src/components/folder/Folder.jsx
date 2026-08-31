import React, { useState } from 'react';
import './Folder.css';

const darkenColor = (hex, percent) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color.slice(0, 6), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const Folder = ({
  color = '#5227FF',
  size = 1,
  items = [],
  isOpen = false,
  onToggle,
  className = ''
}) => {
  const maxItems = 3;
  // Only keep valid items (no padding with empty null items)
  const papers = items.filter(Boolean).slice(0, maxItems);
  const totalPapers = papers.length;

  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.12);
  const paper1 = '#f8fafc';
  const paper2 = '#f1f5f9';
  const paper3 = '#ffffff';

  const handlePaperMouseMove = (e, index) => {
    if (!isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.18;
    const offsetY = (e.clientY - centerY) * 0.18;
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e, index) => {
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  };

  const folderClassName = `folder ${isOpen ? 'open' : ''} ${totalPapers === 0 ? 'folder--empty' : ''}`.trim();
  const scaleStyle = { transform: `scale(${size})`, transformOrigin: 'center center' };

  return (
    <div style={scaleStyle} className={className}>
      <div
        className={folderClassName}
        style={folderStyle}
        onClick={onToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle?.();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close folder' : 'Open folder'}
      >
        <div className="folder__back">
          {/* Render ONLY real paper items according to actual count */}
          {papers.map((item, i) => (
            <div
              key={i}
              className={`paper paper-${i + 1} paper-count-${totalPapers}`}
              onMouseMove={e => handlePaperMouseMove(e, i)}
              onMouseLeave={e => handlePaperMouseLeave(e, i)}
              style={
                isOpen
                  ? {
                      '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                      '--magnet-y': `${paperOffsets[i]?.y || 0}px`
                    }
                  : {}
              }
            >
              {item}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
