import React from 'react';
import { parsePinyinWithTones } from '../utils/pinyinUtils';

export function ToneColorPinyin({ pinyin, className = '', applySandhi = true, showSandhiIndicator = true }) {
  if (!pinyin) return null;

  const syllables = parsePinyinWithTones(pinyin, applySandhi);

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {syllables.map((item, idx) => {
        let tooltipText = undefined;
        if (item.isSandhi) {
          tooltipText = `San Sheng Bian Dao (三声变调): 3rd tone shifts to 2nd tone (${item.syllable})`;
        } else if (item.isHalfThird) {
          tooltipText = `Bàn Sān Shēng (半三声): Half-Third tone low pitch (${item.syllable})`;
        }

        return (
          <span
            key={idx}
            className={`relative inline-flex items-center ${item.colorClass} tracking-wide font-sans transition-colors`}
            title={tooltipText}
          >
            <span>{item.syllable || item.text}</span>
            {item.trailingPunct && <span className="text-slate-400 font-normal">{item.trailingPunct}</span>}

            {item.isSandhi && showSandhiIndicator && (
              <span
                className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                title="Tone 3 Sandhi (Pronounced as 2nd Tone)"
              />
            )}
            {item.isHalfThird && showSandhiIndicator && (
              <span
                className="ml-0.5 inline-block w-1 h-1 rounded-full bg-sky-400/60"
                title="Half-Third Tone (Low pitch)"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
