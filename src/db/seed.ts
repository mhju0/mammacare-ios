import { db } from './client';
import { food } from './schema';
import { CATALOG } from './catalog';

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select({ id: food.id }).from(food).limit(1);
  if (existing.length > 0) return;
  await db.insert(food).values(
    CATALOG.map((c) => ({
      id: c.id,
      name: `foodName.${c.id}`,
      isCustom: false,
      allergenGroup: c.group,
    })),
  );
}
