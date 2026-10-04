import { analyze, toHtml, type Dossier, type Report } from "../src/index.mjs";
import { createJevClient } from "../src/jev.mjs";
import * as adapters from "../src/adapters.mjs";
const dossier: Dossier = {
  query: {
    docId: "a",
    resourceId: "ressource-synthetique-42",
    definition: "Nombre d’inscriptions, et non de personnes distinctes.",
    unit: "inscriptions",
    filters: {
      year: 2025,
      territory: "75",
    },
    rows: [
      {
        value: 120,
        year: 2025,
        territory: "75",
      },
      {
        value: 80,
        year: 2025,
        territory: "75",
      },
    ],
    totalRows: 2,
    hasNext: false,
  },
  answer: {
    docId: "b",
    description:
      "Nombre total d’inscriptions ; une personne peut s’inscrire plusieurs fois.",
    value: 200,
    unit: "inscriptions",
    year: 2025,
    territory: "75",
  },
  id: "jev-datagouv-answer-proof-dev-paraphrase",
  documents: [
    {
      id: "a",
      text: 'dossier.query : {"resourceId": "ressource-synthetique-42", "definition": "Nombre d’inscriptions, et non de personnes distinctes.", "unit": "inscriptions", "filters": {"year": 2025, "territory": "75"}, "rows": [{"value": 120, "year": 2025, "territory": "75"}, {"value": 80, "year": 2025, "territory": "75"}], "totalRows": 2, "hasNext": false}',
      source: {
        uri: "fixture:a",
        date: "2026-10-04",
        licence: "CC0",
        kind: "synthetique",
      },
    },
    {
      id: "b",
      text: 'dossier.answer : {"description": "Nombre total d’inscriptions ; une personne peut s’inscrire plusieurs fois.", "value": 200, "unit": "inscriptions", "year": 2025, "territory": "75"}',
      source: {
        uri: "fixture:b",
        date: "2026-10-04",
        licence: "CC0",
        kind: "synthetique",
      },
    },
  ],
};
const report: Report = await analyze(dossier, {
  mode: "jev",
  provider: createJevClient({ apiKey: "exemple-de-type" }),
});
const html: string = toHtml(report);
void html;
void adapters;
// @ts-expect-error Un dossier vide ne respecte pas le contrat métier.
await analyze({ id: "incomplet", documents: [] });
