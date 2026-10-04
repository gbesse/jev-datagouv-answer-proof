import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { analyze } from "../src/index.mjs";
const base = JSON.parse(
  await readFile(new URL("../examples/dossier.json", import.meta.url), "utf8"),
);
const clone = structuredClone;

import { queryAllPages } from "../src/adapters.mjs";
const rid = "00000000-0000-4000-8000-000000000042";
test("Total inconnu n’est pas remplacé par la taille de la page", async () => {
  const result = await queryAllPages(rid, {
    fetchImpl: async () => Response.json({ data: [], links: { next: null } }),
  });
  assert.equal(result.totalRows, undefined);
  const x = clone(base);
  delete x.query.totalRows;
  assert.equal(
    (await analyze(x)).findings.find((f) => f.id === "calcul").status,
    "a_revoir",
  );
});
test("Lien externe de pagination refusé", async () => {
  await assert.rejects(
    queryAllPages(rid, {
      fetchImpl: async () =>
        Response.json({
          data: [],
          links: { next: "https://example.org/private" },
        }),
    }),
    /inattendu/,
  );
});
test("Plafond de pagination et mutation du total sont détectés", async () => {
  await assert.rejects(
    queryAllPages(rid, {
      maxPages: 1,
      fetchImpl: async () =>
        Response.json({
          data: [],
          meta: { total: 2 },
          links: {
            next: `https://tabular-api.data.gouv.fr/api/resources/${rid}/data/?page=2`,
          },
        }),
    }),
    /incomplète/,
  );
  let n = 0;
  await assert.rejects(
    queryAllPages(rid, {
      fetchImpl: async () =>
        Response.json({
          data: [],
          meta: { total: ++n },
          links: {
            next: `https://tabular-api.data.gouv.fr/api/resources/${rid}/data/?page=${n + 1}`,
          },
        }),
    }),
    /total change/,
  );
});
