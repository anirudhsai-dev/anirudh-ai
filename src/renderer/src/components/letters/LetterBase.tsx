import React from 'react';
import letterA from '../../assets/letters/letter_a.png';
import letterN from '../../assets/letters/letter_n.png';
import letterI from '../../assets/letters/letter_i.png';
import letterR from '../../assets/letters/letter_r.png';
import letterU from '../../assets/letters/letter_u.png';
import letterD from '../../assets/letters/letter_d.png';
import letterH from '../../assets/letters/letter_h.png';

const letterImages: Record<string, string> = {
  A: letterA,
  N: letterN,
  I: letterI,
  R: letterR,
  U: letterU,
  D: letterD,
  H: letterH,
};

export interface LetterProps {
  active: boolean;
  status: 'idle' | 'active' | 'completed' | 'error';
  glyph: string;
}

export const LetterBase: React.FC<LetterProps> = ({ active, status, glyph }) => {
  const imageSrc = letterImages[glyph];
  
  return (
    <div
      className={`letter ${active ? 'active' : 'idle'} ${status}`}
      data-glyph={glyph}
      aria-label={glyph}
    >
      <img src={imageSrc} alt={glyph} className="letter-image" />
    </div>
  );
};

export const LetterA: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="A" />;
export const LetterN: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="N" />;
export const LetterI: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="I" />;
export const LetterR: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="R" />;
export const LetterU: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="U" />;
export const LetterD: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="D" />;
export const LetterH: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="H" />;