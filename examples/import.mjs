import { readFile, mkdir, writeFile } from "node:fs/promises";
import { analyze, toHtml } from "../src/index.mjs";
const base = JSON.parse(
  await readFile(new URL("./dossier.json", import.meta.url), "utf8"),
);

import { queryAllPages, importQueryProof } from "../src/adapters.mjs";
const id = "00000000-0000-4000-8000-000000000042";
let page = 0;
const result = await queryAllPages(id, {
  fetchImpl: async () => {
    page++;
    return Response.json({
      data: [base.query.rows[page - 1]],
      meta: { total: 2 },
      links: {
        next:
          page === 1
            ? `https://tabular-api.data.gouv.fr/api/resources/${id}/data/?page=2`
            : null,
      },
    });
  },
});
const dossier = importQueryProof({ ...base.query, ...result }, base.answer);
dossier.documents.forEach((d) => {
  d.source.uri = "fixture:" + d.id;
  d.source.kind = "synthetique";
  d.source.licence = "CC0";
});

for (const d of dossier.documents) {
  d.source.kind = "synthetique";
  d.source.licence = "CC0";
  if (!d.source.uri.startsWith("fixture:")) d.source.uri = "fixture:" + d.id;
}
const report = await analyze(dossier);
await mkdir(new URL("../reports/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../reports/import.html", import.meta.url),
  toHtml(report),
);
console.log(
  JSON.stringify(
    {
      id: report.id,
      status: report.status,
      summary: report.summary,
      outputs: report.outputs,
    },
    null,
    2,
  ),
);
export { dossier, report };
