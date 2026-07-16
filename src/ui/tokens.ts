export const colors = {
  bg: '#FFFFFF',
  surface: '#F7F7F5',
  text: '#1C1C1E',
  textMuted: '#6E6E73',
  border: '#E3E3E0',
  accent: '#1C1C1E',
  danger: '#B91C1C',
  status: {
    untried: { fg: '#55555A', bg: '#EFEFED' },
    testing: { fg: '#8A5A00', bg: '#FCF0D3' },
    safe:    { fg: '#166534', bg: '#DDF3E1' },
    reacted: { fg: '#991B1B', bg: '#FBE2E0' },
  },
} as const;

export const statusIcon = {
  untried: '○', testing: '◐', safe: '✓', reacted: '✕',
} as const;
