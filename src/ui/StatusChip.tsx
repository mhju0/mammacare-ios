import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FoodStatus } from '../domain/status';
import { colors, statusIcon } from './tokens';

export function StatusChip({ status }: { status: FoodStatus }) {
  const { t } = useTranslation();
  const c = colors.status[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.bg,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: c.fg, fontSize: 12 }}>{statusIcon[status]}</Text>
      <Text style={{ color: c.fg, fontSize: 12, fontWeight: '600' }}>{t(`status.${status}`)}</Text>
    </View>
  );
}
