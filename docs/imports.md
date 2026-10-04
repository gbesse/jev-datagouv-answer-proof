# Importer des données

`discoverDataset` lit les métadonnées officielles. `queryAllPages` suit les pages de l’API Tabular sur la même ressource, avec un plafond explicite. Un total de lignes absent reste inconnu, jamais supposé complet. Le mapping des colonnes en `value`, `year`, `territory` est explicite avant `importQueryProof`. Le calcul implémenté est une somme d’entiers, pas un moteur SQL ni une analyse statistique générale. Ce projet complète le MCP officiel data.gouv.fr, il ne le remplace pas.

```sh
npm run demo:import
```

[Code complet de l’import](../examples/import.mjs). Ce parcours passe réellement du format source au rapport JSON/HTML. Les fichiers générés ne contiennent que des données synthétiques. Pour des documents réels confidentiels, écrire les rapports dans `reports/private/` (ignoré par Git), contrôler les droits de fichier et informer les personnes concernées avant un envoi externe.
