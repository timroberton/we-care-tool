# Méthodologie du modèle

> **Limites du modèle** : Ce modèle fournit une représentation simplifiée des parcours de soins liés à l'avortement et ne reflète pas toute la complexité des systèmes de santé réels. Utilisez les résultats comme des indications pour l'exploration et la planification, et non comme des prédictions définitives.

## Vue d'ensemble

We Care met en œuvre un modèle de cohorte déterministe qui suit les individus depuis un état de non-grossesse jusqu'à la grossesse, la prestation de services et les résultats finaux. Le modèle calcule comment les interventions affectent la sécurité de l'avortement en modélisant la cascade depuis la planification familiale jusqu'à la prestation de services d'avortement et de soins post-avortement, fondé sur les recommandations du Guide de soins liés à l'avortement de l'OMS, Deuxième édition (2025).

Le modèle fonctionne par **étapes de calcul séquentielles** :

## Planification familiale → Grossesses non désirées

La planification familiale est le point d'intervention le plus en amont. L'amélioration de l'accès à la contraception et de son efficacité réduit les grossesses non désirées et peut réduire le besoin d'avortement.

**Calcul :**

- Les grossesses non désirées de référence sont spécifiées en entrée
- Proportion non désirée = 1 - (efficacité de la méthode × demande de PF × demande satisfaite de PF)
- Le nombre total de grossesses est calculé à rebours à partir des grossesses non désirées de référence
- Les ajustements de scénario aux paramètres de PF modifient la proportion de grossesses non désirées tout en maintenant **les grossesses désirées constantes** (permettant au total des grossesses de varier)

**Élément clé :** C'est la catégorie d'intervention à plus fort effet de levier. Réduire les grossesses non désirées réduit le besoin d'avortement en aval.

## Demande → Qui cherche un avortement

À partir des grossesses non désirées, le modèle détermine qui cherche un avortement provoqué.

**Parcours :**

- Certaines grossesses se terminent naturellement par une fausse couche avant la recherche de soins
- Certaines ont des contre-indications médicales nécessitant un avortement (incluses avec les personnes cherchant un avortement provoqué)
- Parmi les grossesses non désirées restantes, une proportion cherche un avortement provoqué (paramètre de demande)
- Le reste continue jusqu'à une naissance vivante

**Sortie :** Le total des personnes cherchant un avortement provoqué passe à l'étape d'accès.

## Recherche de soins → Établissement vs Hors établissement

Parmi ceux qui cherchent un avortement, les personnes accèdent à des prestataires en établissement et hors établissement.

**Paramètre « Acceptabilité » :** Proportion préférant les soins en établissement. Cela reflète les facteurs sociaux et personnels affectant la prise de décision concernant les établissements.

- Acceptabilité élevée → la plupart cherchent d'abord les soins en établissement
- Acceptabilité faible → la plupart vont directement vers des prestataires hors établissement

## Barrières d'accès → Qui atteint les services

Les personnes naviguent à travers les barrières pour atteindre les soins. Le modèle suit les parcours en établissement et hors établissement séparément avec une **logique de réorientation critique**.

**Barrières d'accès aux établissements (multiplicatives) :**

- Restrictions légales (proportion pour laquelle l'avortement est légal)
- Disponibilité des services (proportion d'établissements offrant l'avortement)
- Barrière combinée de distance et d'accessibilité financière (voir ci-dessous)

**Barrières d'accès hors établissement :**

- Barrière combinée de distance et d'accessibilité financière

**Corrélation distance et accessibilité financière :** Le modèle suppose une corrélation partielle entre la distance géographique et les barrières d'accessibilité financière, reflétant le fait que ces barrières affectent souvent les mêmes populations (par exemple, les populations rurales pauvres font face aux deux). Le modèle utilise un mélange 50/50 :

- 50 % suppose **l'indépendance** : les barrières se multiplient (Distance × Coût)
- 50 % suppose **une corrélation parfaite** : la pire barrière domine (min(Distance, Coût))
- Barrière combinée finale = 0,5 × (Distance × Coût) + 0,5 × min(Distance, Coût)

Exemple avec Distance=80 %, Coût=60 % :

- Indépendant : 80 % × 60 % = 48 %
- Corrélé : min(80 %, 60 %) = 60 %
- Final : 0,5 × 48 % + 0,5 × 60 % = 54 %

Cela donne des taux d'accès plus élevés que l'indépendance pure (qui donnerait 48 %) mais plus bas que la corrélation pure (qui donnerait 60 %), reflétant un chevauchement partiel réaliste des barrières.

**RÉORIENTATION CRITIQUE :** Tous ceux qui échouent aux barrières d'accès aux établissements tentent d'accéder aux soins hors établissement (taux de réorientation de 100 %). Seuls ceux qui échouent aux barrières hors établissement se retrouvent sans accès.

## Préparation des services → Quelles composantes sont disponibles

La disponibilité des composantes détermine quelles méthodes d'avortement peuvent être fournies. Le modèle suit la préparation pour :

- **Agents de santé compétents** (prestataires compétents)
- **Médicaments :** misoprostol, mifépristone (inclut la gestion de la douleur)
- **Équipement :** aspiration par le vide, dilatation et évacuation (D&E), dilatation et curetage (D&C)
- **Fournitures :** gants en latex, antiseptique, antibiotiques

Chaque méthode nécessite des combinaisons spécifiques de composantes.

## Réception des services → Quelle méthode reçue

Selon la disponibilité des composantes, les personnes reçoivent des méthodes spécifiques classifiées selon les normes de sécurité de l'OMS.

**Méthode d'allocation :** Le modèle mélange deux approches d'allocation basées sur la disponibilité des agents de santé :

- **Allocation par priorité :** Les méthodes plus sûres sont allouées en premier (utilisée quand les agents de santé sont présents)
- **Allocation proportionnelle :** Les services sont alloués proportionnellement à la disponibilité (utilisée quand les agents de santé sont absents)
- **Poids du mélange :** $1 - p_{healthworker}$ détermine le mélange

Une disponibilité plus élevée des agents de santé augmente l'utilisation de services recommandés plus sûrs. Une disponibilité nulle des agents de santé entraîne une distribution proportionnelle entre tous les services disponibles.

**Secteur des établissements (en établissement) :**

- **Méthodes sécurisées :**
  - Avortement médicamenteux avec mifépristone + misoprostol (prestataire compétent)
  - Avortement médicamenteux avec misoprostol seul (prestataire compétent)
  - Aspiration par le vide (prestataire compétent + équipement + fournitures)
  - Dilatation et évacuation - D&E (prestataire compétent + équipement + fournitures)
- **Méthodes moins sécurisées :**
  - Dilatation et curetage - D&C (méthode tranchante, risque plus élevé)
  - Toute méthode sécurisée tentée sans prestataire compétent
- **Méthodes les moins sécurisées :**
  - D&C sans prestataire compétent

**Secteur hors établissement :**

- **Méthodes sécurisées :**
  - Autogestion de l'avortement médicamenteux avec des médicaments de qualité garantie (misoprostol et mifépristone, ou misoprostol seul) et accès à un agent de santé compétent (qui fournit des informations précises, y compris la gestion de la douleur, et peut faciliter l'orientation vers des services en établissement si nécessaire ou souhaité)
- **Méthodes moins sécurisées :**
  - Avortement médicamenteux sans soutien d'un agent de santé compétent
- **Méthodes les moins sécurisées :**
  - Autres méthodes traditionnelles ou dangereuses

**Personnes ne recevant « aucun avortement » :** Celles qui atteignent un prestataire mais ne peuvent recevoir aucune méthode (toutes les composantes épuisées) aboutissent à une fausse couche ou une naissance vivante.

## Issues de l'avortement → Classifications de sécurité

Tous les parcours s'agrègent en issues de grossesse :

**Avortements provoqués par catégorie de sécurité :**

- **Sécurisé :** Méthode recommandée par l'OMS avec un agent de santé compétent (en établissement ou autogéré avec soutien d'un agent de santé fournissant information, gestion de la douleur et accès à l'orientation)
- **Moins sécurisé :** Méthode correcte sans soutien d'un agent de santé compétent OU méthode non recommandée (D&C)
- **Le moins sécurisé :** Méthodes dangereuses

**Naissances vivantes provenant de :**

- N'a jamais cherché d'avortement (a choisi de poursuivre la grossesse)
- A cherché mais n'a pas eu accès
- Est arrivé à l'établissement mais n'a pas reçu d'avortement

**Fausses couches provenant de :**

- Étape 1 : Fausses couches spontanées naturelles avant la recherche de soins (début de grossesse)
- Étape 2 : Fausses couches parmi celles qui ont cherché un avortement mais n'ont pas eu accès
- Étape 2 : Fausses couches parmi celles qui ont atteint un établissement mais n'ont pas reçu d'avortement
- Note : Le même taux de fausse couche est appliqué aux deux étapes (simplification de modélisation)

## Complications → Qui subit des complications

Les services d'avortement comportent des risques de complications variables. Le modèle suit six types de complications selon la sécurité du service :

**Complications modérées :**

- Avortement incomplet (rétention de produits de conception)
- Grossesse évolutive (échec de l'avortement)
- Infection

**Complications sévères :**

- Traumatisme utérin/perforation
- Hémorragie
- Autres complications sévères

**Taux de complications spécifiques aux services :**

Chaque service a des taux de complications dérivés empiriquement. Les méthodes sécurisées (avortement médicamenteux avec agent de santé compétent, aspiration par le vide) ont des taux de complications substantiellement plus bas que les méthodes moins sécurisées (D&C, médicaments sans soutien d'agent de santé) ou les méthodes les moins sécurisées (pratiques traditionnelles dangereuses).

**Calcul :**

Pour chaque personne recevant un service spécifique, les complications sont déterminées en appliquant le taux de complications de ce service. Total des complications = complications modérées + complications sévères.

**Celles sans complications** retournent à un état de non-grossesse sans nécessiter d'intervention médicale supplémentaire.

## Soins post-avortement → Traitement des complications

Celles qui subissent des complications nécessitent des soins post-avortement (SPA). Le modèle calcule qui reçoit un traitement efficace à travers les parcours d'accès et de préparation.

### Barrières d'accès aux SPA

**Différence critique avec l'accès à l'avortement :** Les restrictions légales NE S'APPLIQUENT PAS aux SPA. Même là où l'avortement est restreint, la recherche de traitement pour les complications est légale.

**Barrières d'accès aux SPA :**

- Disponibilité des services (proportion d'établissements offrant des services de SPA)
- Barrière combinée de distance et d'accessibilité financière (utilise le même mélange de corrélation 50/50 que l'accès à l'avortement)

**Note importante :** Les complications d'origine établissement et hors établissement font face aux mêmes barrières d'accès aux SPA. Les personnes qui ont réussi à accéder aux établissements pour l'avortement ont déjà démontré qu'elles peuvent surmonter les barrières de distance/coût, donc elles font face au même taux lors de la recherche de SPA.

### Efficacité des SPA

Des SPA efficaces nécessitent différentes composantes selon la sévérité des complications :

**Complications modérées** (avortement incomplet, grossesse évolutive, infection) :

- Nécessitent : Agent de santé compétent × Antibiotiques

**Complications sévères** (traumatisme, hémorragie, autres) :

- Nécessitent : Soins obstétricaux et néonatals d'urgence complets (SONUC)

L'efficacité des SPA dépend à la fois de l'accès aux services et de la préparation (disponibilité des composantes appropriées), où la préparation diffère selon la sévérité des complications (modérées nécessitent personnel compétent de base + antibiotiques ; sévères nécessitent SONUC).

**Issues finales des SPA :**

- **Recevant des soins efficaces :** Ont accès ET services efficaces disponibles
- **Ne recevant pas de soins efficaces :** Manquent d'accès OU services indisponibles/inefficaces

---

## Formulation mathématique

**Notation clé :** $N$ = compte (nombre de personnes), $p$ = proportion (0-1)

### Planification familiale

$$p_{unintended} = 1 - (demand \times met\_demand \times effectiveness)$$

Les scénarios maintiennent les grossesses désirées constantes, donc le total des grossesses s'ajuste en fonction de la proportion de grossesses désirées.

### Barrières d'accès

La barrière combinée distance/accessibilité financière tient compte de la corrélation partielle (contrôlée par $\alpha = 0,5$) :

$$Combined(p_{dist}, p_{cost}) = \alpha \times \min(p_{dist}, p_{cost}) + (1-\alpha) \times (p_{dist} \times p_{cost})$$

Les barrières d'accès aux établissements se multiplient :

$$p_{facility\_arrive} = p_{legal} \times p_{facilities} \times Combined(p_{distance}, p_{cost})$$

Accès hors établissement :

$$p_{outOfFacility\_arrive} = Combined(p_{distance}^{OOF}, p_{cost}^{OOF})$$

Ceux qui échouent à l'accès aux établissements sont réorientés pour tenter l'accès hors établissement (taux de réorientation de 100 %).

### Réception des services

Les services sont alloués selon la disponibilité des composantes. Chaque service nécessite des combinaisons spécifiques de composantes (agent de santé, médicaments, équipement, fournitures).

L'allocation mélange les méthodes par priorité et proportionnelle :

$$\text{poids proportionnel} = 1 - p_{healthworker}$$

Une disponibilité plus élevée des agents de santé oriente l'allocation vers des services recommandés plus sûrs.

### Issues de l'avortement

$$N_{total} = N_{livebirth} + N_{miscarriage} + N_{abortions}$$

Les avortements sont catégorisés comme sécurisé, moins sécurisé ou le moins sécurisé selon la méthode et le type de prestataire.

### Soins post-avortement

L'accès aux SPA exclut les restrictions légales et utilise la même barrière combinée distance/coût :

$$p_{PAC\_access} = p_{facilities\_PAC} \times Combined(p_{distance}, p_{cost})$$

L'efficacité des SPA dépend de la sévérité des complications :

$$p_{moderate\_effective} = p_{health\_worker} \times p_{antibiotics}$$

$$p_{severe\_effective} = p_{CEmONC}$$

Issues finales :

$$N_{effective\_PAC} = N_{complications} \times p_{PAC\_access} \times p_{effectiveness}$$
