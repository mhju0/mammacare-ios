import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../drizzle/migrations';
import i18n from '../src/i18n';
import { db } from '../src/db/client';
import { seedIfEmpty } from '../src/db/seed';
import { useBaby } from '../src/data/queries';
import { initNotificationHandler } from '../src/services/notify';
import { colors } from '../src/ui/tokens';

initNotificationHandler();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (success) seedIfEmpty().then(() => setSeeded(true)).catch((e) => setSeedError(e instanceof Error ? e : new Error(String(e))));
  }, [success]);

  if (error || seedError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.danger }}>DB init failed: {(error ?? seedError)!.message}</Text>
      </View>
    );
  }
  if (!success || !seeded) return null;
  return <LocalizedStack />;
}

function LocalizedStack() {
  const { t } = useTranslation(); // subscribes — titles relabel on language change
  const baby = useBaby();
  useEffect(() => {
    if (baby?.locale && i18n.language !== baby.locale) i18n.changeLanguage(baby.locale);
  }, [baby?.locale]);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('home.title') }} />
      <Stack.Screen name="foods" options={{ title: t('foods.title') }} />
      <Stack.Screen name="food/[id]" options={{ title: '' }} />
      <Stack.Screen name="log-reaction" options={{ title: t('reaction.title'), presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title'), presentation: 'modal' }} />
    </Stack>
  );
}
