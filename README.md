# Zion City

Un jeu en monde ouvert qui édifie : on incarne un personnage africain qui marche avec Dieu dans de vraies villes, en commençant par **Lomé**.

- **La Marche chrétienne** : 21 étapes et 7 grades, de la nouvelle naissance à la maturité (Nouveau-né en Christ, Disciple, Serviteur, Témoin, Soldat de Christ, Faiseur de disciples, Ambassadeur de Christ).
- **Lumière dans la ville** : 21 missions libres (le bon Samaritain, le fils prodigue, artisan de paix…).
- **7 villes réelles** : Lomé, Cotonou, Accra, Abidjan, Lagos, Paris, Londres. Les rues, les bâtiments et les côtes viennent d'OpenStreetMap.
- Français par défaut, anglais au choix. Jouable sur ordinateur, tablette et téléphone.

## Nouveautés de la version 2

- **Véhicules réalistes** : berline, taxi, citadine, 4x4, pick-up, minibus avec galerie, bus, et la moto 125 des zémidjans. Le joueur est visible sur sa moto et au volant.
- **Zémidjans et taxis** : on choisit sa destination, on discute le prix, et le trajet suit les vraies rues.
- **Argent (F CFA)** : bouteilles à recycler, livraisons, travail de zémidjan avec sa propre moto. Dépenses : transport, carburant, repas, vêtements chez le tailleur, billets de voyage, offrandes.
- **Carburant** : jauge et stations-service placées aux vrais emplacements de la carte.
- **Radios** : Radio Akwaba, Radio Cantiques, Radio Paix, Radio Jeunesse, et « Ma musique » pour ses propres chansons.
- **Ville plus vivante** : façades variées avec relief, boutiques, murs de clôture, poteaux et fils électriques, véhicules garés, vendeuses sous parasol, kiosques, rues en terre hors du centre.

## Activités et imprévus

De grandes icônes dans la ville signalent des activités rejouables, avec chrono et record :

| Icône | Activité | Où |
| --- | --- | --- |
| 🏁 | Course de moto à travers la ville, de point de contrôle en point de contrôle | Monument |
| 🚑 | Ambulancier : ramener 3 blessés à l'hôpital | Hôpital |
| ⚽ | Tirs au but face au gardien | Stade |
| 🎵 | Chorale de l'église (jeu de rythme, touches D F J K ou écran tactile) | Église |
| 📖 | Quiz éclair : retrouver la référence de 8 versets | École |
| 🧹 | Grand nettoyage du quartier | Jardin |

Des imprévus ❗ surgissent aussi en se promenant : un voleur à rattraper, un enfant perdu à ramener à sa maman, une grand-mère à accompagner à l'église, une voiture en panne à pousser. Le menu ☰ → Activités affiche la liste et trace l'itinéraire GPS sur la mini-carte.

## Lancer le jeu

Le jeu est un site statique, sans étape de compilation. Il faut le servir par HTTP :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`. Il peut aussi être publié tel quel sur GitHub Pages.

## Commandes

| Action | Ordinateur | Téléphone |
| --- | --- | --- |
| Se déplacer | ZQSD / WASD / flèches | manette à gauche |
| Courir | Maj, ou double appui sur une direction | bouton », double-tape la manette |
| Pause | P ou Échap | bouton ⏸ |
| Regarder | glisser la souris | glisser à droite |
| Action (parler, saluer, voyager) | E | bouton E |
| Monter / descendre du véhicule | F | bouton 🚗 |
| Changer de radio | R | bouton 📻 |
| Klaxon | H | bouton 📯 |
| Travailler comme zémidjan (sur sa moto) | J | bouton 💼 |
| Menu (missions, Bible, grades, musique, options) | Tab | bouton ☰ |

## Organisation

- `js/world.js` : construction des villes à partir de `assets/cities/*.json`
- `js/content.js` : versets, grades et missions (texte bilingue)
- `js/missions.js` : moteur de missions
- `js/main.js` : boucle de jeu, menus, mini-carte
- `tools/` : scripts qui ont servi à préparer les données (cartes, personnages, animations)

## Crédits et licences

- Plans des villes : © les contributeurs d'OpenStreetMap, licence ODbL.
- Personnages et animations : Microsoft Rocketbox Avatar Library, licence MIT.
- Musique : Kevin MacLeod (incompetech.com), licence Creative Commons Attribution 4.0 ; cantiques du projet Open Hymnal (domaine public).
- Textures : Poly Haven, CC0. Texture d'eau et moteur 3D : three.js, licence MIT.
- Versets : Louis Segond 1910 et King James Version (domaine public).
