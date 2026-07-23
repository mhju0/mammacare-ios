import * as Notifications from 'expo-notifications';
import i18n from '../i18n';
import type { PlannedNotification } from '../domain/notifications';

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function isPermissionGranted(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function content(p: PlannedNotification, foodLabel: string) {
  if (p.kind === 'checkin') {
    return {
      title: i18n.t('notif.checkinTitle', { day: p.day, food: foodLabel }),
      body: i18n.t('notif.checkinBody', { food: foodLabel }),
    };
  }
  return {
    title: i18n.t('notif.windowEndTitle', { food: foodLabel }),
    body: i18n.t('notif.windowEndBody', { food: foodLabel }),
  };
}

export async function scheduleTrialNotifications(
  trialId: string, foodLabel: string, planned: PlannedNotification[], now: Date,
): Promise<void> {
  for (const p of planned) {
    if (p.fireAt.getTime() <= now.getTime()) continue; // never schedule the past
    await Notifications.scheduleNotificationAsync({
      identifier: `${trialId}:${p.kind}${p.kind === 'checkin' ? p.day : ''}`,
      content: content(p, foodLabel),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.fireAt },
    });
  }
}

export async function cancelTrialNotifications(trialId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(`${trialId}:`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
