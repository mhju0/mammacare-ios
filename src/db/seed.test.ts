// Foods removed from CATALOG (e.g. greenbean, dropped 2026-07) linger in DBs
// seeded by older builds and render as raw i18n keys. seedIfEmpty must
// reconcile: delete seeded (non-custom) foods no longer in the catalog, but
// never ones with trial history. Asserted on the generated SQL via a
// capturing sqlite-proxy driver, per the no-incidental-behavior test rule.
const mockCaptured: { sql: string; params: unknown[] }[] = [];

jest.mock('./client', () => {
  const { drizzle } = jest.requireActual('drizzle-orm/sqlite-proxy');
  return {
    db: drizzle(async (sql: string, params: unknown[]) => {
      mockCaptured.push({ sql, params });
      // Non-empty food table → seedIfEmpty takes the already-seeded path.
      return sql.trim().toLowerCase().startsWith('select') ? { rows: [['egg']] } : { rows: [] };
    }),
  };
});

import { seedIfEmpty } from './seed';
import { CATALOG } from './catalog';

test('seedIfEmpty deletes catalog-removed seeded foods without trial history', async () => {
  await seedIfEmpty();
  const del = mockCaptured.find((c) => c.sql.toLowerCase().startsWith('delete'));
  expect(del).toBeDefined();
  const sql = del!.sql.toLowerCase();
  expect(sql).toContain('delete from "food"');
  expect(sql).toContain('"is_custom" = ?'); // custom foods are never touched
  expect(sql).toContain('not in'); // id not in catalog
  expect(sql).toContain('from "trial"'); // ...and not referenced by any trial
  for (const c of CATALOG) expect(del!.params).toContain(c.id); // full catalog is the keep-list
});
