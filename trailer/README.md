## Version 4 (actuelle) — les missions

- `ZionCity_BandeAnnonce_v4_HD.mp4` (1920×1080, 2 min 24) et `ZionCity_BandeAnnonce_v4_WhatsApp.mp4` (1280×720, < 10 Mo).
- Nouvelle séquence « Missions, comme dans San Andreas » : ambulancier, contrat zémidjan / taxi avec un patron, comptes du soir, courses de moto, jeux publics et quiz bibliques sur la place de l'Indépendance, boutique (améliorations, investissements, dons), prière du matin, jeûne, culte du soir.
- Fin sans lien affiché : la voix annonce que le jeu est disponible gratuitement, à installer sur téléphone ou ordinateur, ou à jouer sans installation dans le navigateur avec le lien partagé sous la vidéo.
- Sources : `source-v4/`.

# Bande-annonce Zion City

- `ZionCity_BandeAnnonce_HD.mp4` — 16:9, 1920×1080, 82 s (YouTube, Facebook, site)
- `ZionCity_BandeAnnonce_Vertical.mp4` — 9:16, 1080×1920 (TikTok, Reels, Shorts, statut WhatsApp)

Toutes les images viennent du jeu (tournage image par image avec `tools/trailer/`, caméra libre, heure dorée).
Voix off : voix neuronale française « Henri » (repli : le compte ElevenLabs a refusé la génération).
Musique et bruitages : composés pour la bande-annonce (`source/music.py`, `source/sfx_mix.py`) — libres de droits.
Verset affiché : Matthieu 5:14 (Louis Segond 1910).

Refaire : `tools/trailer/film.cjs` (plans de Lomé) et `cities.cjs` (villes) → `source/build.py` → `render.cjs h|v video …` → `sfx_mix.py` → ffmpeg.

## Version 3 (images 100 % du jeu)

- `ZionCity_BandeAnnonce_v3_HD.mp4` — 16:9, 1 min 47
- `ZionCity_BandeAnnonce_v3_WhatsApp.mp4` — 720p, < 10 Mo, pour WhatsApp
- `ZionCity_BandeAnnonce_v3_Vertical.mp4` — 9:16 (TikTok, Reels, statut WhatsApp)

Toutes les séquences sont filmées dans le jeu (`tools/trailer/film3.cjs`) : le joueur roule à moto autour du
Monument de l'Indépendance, devant la cathédrale du Sacré-Cœur et jusqu'à la Colombe de la Paix (monuments
modélisés dans Blender). Accroche : GTA, San Andreas, « CJ » ; message : le jeu qui édifie la foi
(jeunes, enfants, familles). Montage : `source-v3/`.
