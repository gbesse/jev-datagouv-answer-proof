import { getJson, document } from "./io.mjs";
export async function discoverDataset(slug, options) {
  if (typeof slug !== "string" || !/^[a-zA-Z0-9-]+$/.test(slug))
    throw new TypeError("Slug data.gouv.fr invalide");
  const d = await getJson(
    "https://www.data.gouv.fr/api/1/datasets/" + slug + "/",
    {
      ...options,
      headers: {
        "X-Fields": "id,title,license,resources{id,title,url,format}",
      },
    },
  );
  return {
    id: d.id,
    title: d.title,
    licence: d.license,
    resources: d.resources.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      format: r.format,
    })),
  };
}
export async function queryAllPages(
  resourceId,
  { fetchImpl, signal, maxPages = 20, filters = {} } = {},
) {
  if (
    !/^[0-9a-f-]{36}$/.test(resourceId) ||
    !Number.isInteger(maxPages) ||
    maxPages < 1 ||
    maxPages > 100
  )
    throw new TypeError("Ressource UUID et maxPages requis");
  const prefix = `https://tabular-api.data.gouv.fr/api/resources/${resourceId}/data/`;
  const first = new URL(prefix);
  first.searchParams.set("page_size", "200");
  for (const [k, v] of Object.entries(filters))
    first.searchParams.set(k, String(v));
  let next = first.href;
  const rows = [],
    pages = [],
    seen = new Set();
  let totalRows;
  for (let n = 0; next && n < maxPages; n++) {
    const u = new URL(next);
    if (
      u.origin !== "https://tabular-api.data.gouv.fr" ||
      u.pathname !== new URL(prefix).pathname
    )
      throw new TypeError("Lien de pagination inattendu");
    if (seen.has(next)) throw new TypeError("Boucle de pagination");
    seen.add(next);
    const d = await getJson(next, { fetchImpl, signal });
    if (!Array.isArray(d.data))
      throw new TypeError("Réponse tabulaire invalide");
    rows.push(...d.data);
    if (Number.isSafeInteger(d.meta?.total)) {
      if (totalRows !== undefined && totalRows !== d.meta.total)
        throw new TypeError("Le total change pendant la pagination");
      totalRows = d.meta.total;
    }
    pages.push({ url: next, count: d.data.length });
    next = d.links?.next ?? null;
    if (next) next = new URL(next, prefix).href;
  }
  if (next) throw new RangeError("Pagination incomplète : maxPages atteint");
  return { resourceId, rows, totalRows, hasNext: false, pages };
}
export function importQueryProof(
  query,
  answer,
  { at = new Date().toISOString().slice(0, 10) } = {},
) {
  return {
    id: "preuve-reponse",
    query: { ...query, docId: "requete" },
    answer: { ...answer, docId: "reponse" },
    documents: [
      document("requete", JSON.stringify(query), {
        uri: "export:requete/" + query.resourceId,
        date: at,
        kind: "requete",
        licence: "À renseigner",
      }),
      document("reponse", JSON.stringify(answer), {
        uri: "fichier:reponse.json",
        date: at,
        kind: "importe",
        licence: "Privé",
      }),
    ],
  };
}
