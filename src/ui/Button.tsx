import { Pressable, Text } from 'react-native';
import { colors } from './tokens';

type Props = { label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean };

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : colors.surface;
  const fg = variant === 'secondary' ? colors.text : colors.bg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ backgroundColor: bg, opacity: disabled ? 0.4 : 1, paddingVertical: 14,
        borderRadius: 12, alignItems: 'center' }}
    >
      <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
