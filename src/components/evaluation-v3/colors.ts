// Shared color palette for evaluation components
// Only 5 core colors: emerald (green), orange, blue, violet (purple), red

export type ColorName = 'emerald' | 'blue' | 'violet' | 'orange' | 'red';

export interface ColorSet {
  filled: string;
  bg: string;
  dot: string;
}

export const colors: Record<ColorName, ColorSet> = {
  emerald: { filled: '#10b981', bg: '#d1fae5', dot: '#a7f3d0' },
  blue: { filled: '#3b82f6', bg: '#dbeafe', dot: '#bfdbfe' },
  violet: { filled: '#8b5cf6', bg: '#ede9fe', dot: '#ddd6fe' },
  orange: { filled: '#f97316', bg: '#ffedd5', dot: '#fed7aa' },
  red: { filled: '#ef4444', bg: '#fee2e2', dot: '#fecaca' },
};

export const getColor = (name: string): ColorSet => colors[name as ColorName] || colors.emerald;

// Score-based color selection using our core palette
// < 50% = red, 50-75% = orange, >= 75% = emerald (green)
export const getScoreColor = (percentage: number): ColorSet => {
  if (percentage >= 75) return colors.emerald;
  if (percentage >= 50) return colors.orange;
  return colors.red;
};
