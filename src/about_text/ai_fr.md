# Assistant IA

We Care inclut un assistant IA alimenté par Claude (Anthropic) pour vous aider à analyser les scénarios, modifier les paramètres et générer des rapports grâce à une conversation en langage naturel.

## Comment l'IA est instruite

**Nous instruisons explicitement l'IA sur les limitations critiques du modèle :**

> **Limites du modèle** : Ce modèle fournit une représentation simplifiée des parcours de soins liés à l'avortement et ne reflète pas toute la complexité des systèmes de santé réels. Utilisez les résultats comme des indications pour l'exploration et la planification, et non comme des prédictions définitives.
>
> **Données d'entrée peu fiables** : Les données d'entrée peuvent être incomplètes, obsolètes ou peu fiables.
>
> **Faire preuve de prudence** : Tous les résultats doivent être présentés avec les mises en garde et réserves appropriées.
>
> **Signaler les valeurs extrêmes** : Les scénarios avec des valeurs de paramètres extrêmes (par exemple, 100 %) doivent être explicitement signalés comme irréalistes.

L'IA est instruite de reconnaître ces limitations dans son analyse et d'éviter de surestimer la confiance dans les résultats.

## Ce que l'IA peut faire

**Analyser et comparer les scénarios :**

- Expliquer les différences dans les résultats de sécurité entre les scénarios
- Identifier les facteurs clés de changement (effets de cascade)
- Comparer les impacts des interventions

**Modifier les paramètres :**

- Mettre à jour les valeurs des paramètres dans les scénarios
- Créer de nouveaux scénarios
- Supprimer des scénarios

**Générer des rapports :**

- Créer des rapports complets avec graphiques intégrés
- Modifier les rapports existants
- Exporter des analyses avec visualisations

**Exemples de requêtes :**

- « Qu'est-ce qui explique la différence entre la référence et le scénario 1 ? »
- « Créer un scénario avec 90 % de besoins satisfaits en planification familiale »
- « Générer un rapport comparant tous les scénarios »
- « Quelle intervention a le plus grand impact sur les avortements non sécurisés ? »

## Ce que l'IA connaît

L'IA a reçu :

- Le contexte et les recommandations du Guide de soins liés à l'avortement de l'OMS, Deuxième édition (2025)
- La méthodologie complète du modèle (cascade de calcul, barrières d'accès, classifications de sécurité)
- Toutes les définitions des paramètres et hypothèses du modèle
- Les résultats et paramètres de votre projet actuel

## Limitations

L'IA ne peut pas :

- Accéder à des données externes au-delà de ce qui est dans l'outil
- Déterminer l'exactitude des données d'entrée
- Modifier les paramètres de référence (uniquement les scénarios)
- Prendre des décisions politiques définitives
- Effectuer des tests statistiques ou des analyses d'incertitude

## Confidentialité

**Stockage local** : Tous les calculs et données sont stockés dans votre navigateur
**Interactions IA** : Vos requêtes et résultats du modèle sont envoyés à l'API d'Anthropic lors de l'utilisation des fonctionnalités IA
**Pas de persistance** : Les conversations ne sont pas stockées côté serveur ; les rapports enregistrent uniquement le contenu généré localement
