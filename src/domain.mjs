import { text, list, cents, date, ref, check, pair } from "./index.mjs";

export function prepare(x) {
  const q = x.query,
    a = x.answer;
  if (!q || !a) throw new TypeError("query et answer requis");
  const rows = Array.isArray(q.rows) ? q.rows : null;
  const refs = ref(q.docId, a.docId);
  text(q.resourceId);
  text(a.unit);
  text(q.unit);
  const count = q.totalRows;
  if (count !== undefined) cents(count, "nombre de lignes");
  const complete =
    rows && count !== undefined
      ? rows.length === count && q.hasNext === false
      : null;
  if (rows) {
    for (const r of rows) {
      if (!Number.isSafeInteger(r.value) || Math.abs(r.value) > 1e12)
        throw new TypeError("Valeur de ligne entière requise");
    }
  }
  const values = rows?.filter(
    (r) =>
      (q.filters?.territory === undefined ||
        r.territory === q.filters.territory) &&
      (q.filters?.year === undefined || r.year === q.filters.year),
  );
  const sum = values?.reduce((s, r) => s + r.value, 0);
  if (sum !== undefined && !Number.isSafeInteger(sum))
    throw new RangeError("Agrégat trop grand");
  if (!Number.isSafeInteger(a.value))
    throw new TypeError("Valeur annoncée entière requise");
  return {
    checks: [
      check(
        "pagination",
        "Toutes les pages récupérées",
        complete,
        refs,
        "Récupérer les pages restantes avant de calculer un total.",
      ),
      check("unite", "Unité de la réponse", a.unit === q.unit, refs),
      check(
        "millesime",
        "Millésime et territoire de la requête",
        q.filters?.year === undefined || q.filters?.territory === undefined
          ? null
          : a.year === q.filters.year && a.territory === q.filters.territory,
        refs,
      ),
      check(
        "calcul",
        "Agrégat reproduit",
        complete === true ? sum === a.value : null,
        refs,
      ),
    ],
    pairs: [
      pair(
        "portee",
        "Réponse / définition des données",
        a.description,
        q.definition,
        refs,
        "La réponse de gauche conserve-t-elle la portée, les limites et la définition de la ressource à droite ?",
      ),
    ],
    outputs: {
      reproduction: {
        resourceId: q.resourceId,
        filters: q.filters ?? {},
        operation: "sum(value)",
        rowCount: rows?.length ?? 0,
        totalRows: count ?? null,
        computedValue: complete === true ? sum : null,
      },
      limite:
        "La complétude déclarée doit être confirmée par le connecteur ; une réponse à pagination inconnue est laissée en revue.",
    },
  };
}

function requiredDoc(o) {
  if (!o || typeof o !== "object") throw new TypeError("Objet métier requis");
  text(o.docId, "docId requis");
}
export function validateInput(x) {
  requiredDoc(x.query);
  requiredDoc(x.answer);
  if (x.query.hasNext !== undefined && typeof x.query.hasNext !== "boolean")
    throw new TypeError("hasNext doit être booléen");
  if (x.query.rows?.length > 20000)
    throw new TypeError("20 000 lignes maximum");
}
