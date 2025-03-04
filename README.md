# TokMoney - TikTok Earnings Estimator

Une extension Chrome qui affiche une estimation des revenus pour chaque vidéo TikTok directement sur la page.

## Fonctionnalités

- Affiche un badge sur chaque vidéo avec une estimation des revenus
- Mise à jour automatique lors du défilement de la page
- Distinction entre les contenus éligibles et non éligibles
- Calcul basé sur les taux de monétisation réels de TikTok
- Jauge de RPM ajustable (faible, moyen, élevé) pour personnaliser les estimations

## Comment ça marche

- Les badges verts montrent les revenus estimés pour les vidéos
- Les badges rouges (0€) indiquent les contenus non éligibles à la monétisation
- Faites défiler la page pour voir plus de vidéos et leurs estimations
- Ajustez le niveau de RPM selon votre audience pour des estimations plus précises

## Calcul des revenus

- Environ 40% des vues sont considérées comme éligibles
- Trois niveaux de RPM disponibles :
  - Faible : 0,20€ pour 1000 vues
  - Moyen : 0,45€ pour 1000 vues (par défaut)
  - Élevé : 0,70€ pour 1000 vues

## Installation (Beta Privée)

Cette extension est actuellement en phase de beta privée. Suivez ces instructions détaillées pour l'installer :

### Prérequis
- Vous devez utiliser un ordinateur (PC ou Mac)
- Vous devez avoir le navigateur Google Chrome installé

### Étapes d'installation

1. **Téléchargez le fichier ZIP**
   - Cliquez sur le bouton vert "Code" en haut de cette page
   - Sélectionnez "Download ZIP" dans le menu déroulant
   - Le fichier ZIP sera téléchargé dans votre dossier de téléchargements

2. **Décompressez le fichier ZIP**
   - Localisez le fichier ZIP téléchargé (généralement dans votre dossier "Téléchargements")
   - Faites un clic droit sur le fichier et sélectionnez "Extraire tout..." (Windows) ou double-cliquez dessus (Mac)
   - Choisissez un emplacement facile à retrouver, comme votre Bureau

3. **Ouvrez Chrome et accédez à la page des extensions**
   - Ouvrez Google Chrome
   - Tapez `chrome://extensions/` dans la barre d'adresse et appuyez sur Entrée
   - OU cliquez sur le menu à trois points en haut à droite → "Plus d'outils" → "Extensions"

4. **Activez le Mode développeur**
   - Recherchez le bouton "Mode développeur" en haut à droite de la page des extensions
   - Activez-le en cliquant sur le bouton (il devrait passer de gris à bleu)

5. **Chargez l'extension**
   - Cliquez sur le bouton "Charger l'extension non empaquetée" qui apparaît en haut à gauche
   - Naviguez jusqu'au dossier que vous avez extrait à l'étape 2
   - Sélectionnez ce dossier (ne sélectionnez pas un fichier spécifique à l'intérieur)
   - Cliquez sur "Sélectionner un dossier" (Windows) ou "Ouvrir" (Mac)

6. **Vérifiez l'installation**
   - L'extension TokMoney devrait maintenant apparaître dans votre liste d'extensions
   - Une icône "T€" devrait apparaître dans la barre d'outils de Chrome en haut à droite

## Utilisation

1. Naviguez vers un profil TikTok (ex: tiktok.com/@pseudo)
2. Les badges d'estimation de revenus apparaîtront automatiquement sur chaque vidéo
3. Ajustez le niveau de RPM dans le popup de l'extension selon votre audience
4. Faites défiler la page pour charger plus de vidéos et voir leurs estimations
5. Utilisez le bouton "Rafraîchir les estimations" si nécessaire

## Limitations actuelles (Beta/MVP)

- L'extension considère actuellement toutes les vidéos comme éligibles à la monétisation, y compris celles de moins d'une minute (qui normalement ne sont pas éligibles selon les règles de TikTok)
- Les estimations sont basées sur des moyennes et peuvent varier considérablement selon les régions et l'engagement
- Certains éléments de l'interface TikTok peuvent ne pas être correctement détectés en raison des mises à jour fréquentes de la plateforme

## Remarques importantes

- Ces estimations sont approximatives et peuvent varier selon plusieurs facteurs
- Les revenus réels dépendent de nombreux facteurs comme la région des spectateurs, l'engagement, etc.
- Ajustez le niveau de RPM pour obtenir des estimations plus précises selon votre audience

## Compatibilité

- Chrome (principal)
- Autres navigateurs basés sur Chromium (Edge, Brave, etc.)

## Feedback et contributions

Cette extension est actuellement en version beta/MVP. Vos idées et suggestions sont les bienvenues pour améliorer l'outil !

## Contact

Pour toute question ou suggestion, vous pouvez contacter l'auteur à : oscardavase@gmail.com

## Auteur

Développé par Oscar DAVASE

## Licence

MIT