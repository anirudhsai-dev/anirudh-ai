import React from 'react';

export interface LetterProps {
  active: boolean;
  status: 'idle' | 'active' | 'completed' | 'error';
  glyph: string;
}

export const LetterBase: React.FC<LetterProps> = ({ active, status, glyph }) => {
  return (
    <span
      className={`letter ${active ? 'active' : 'idle'} ${status}`}
      aria-label={glyph}
    >
      {glyph}
    </span>
  );
};

export const LetterA: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="A" />;
export const LetterN: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="N" />;
export const LetterI: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="I" />;
export const LetterR: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="R" />;
export const LetterU: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="U" />;
export const LetterD: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="D" />;
export const LetterH: React.FC<{ active: boolean; status: any }> = (p) => <LetterBase {...p} glyph="H" />;