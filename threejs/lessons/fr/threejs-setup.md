Title: Configuration de Three.js
Description: Comment configurer votre environnement de développement pour Three.js
TOC: Configuration

Cette article fait parti d'une série consacrée à Three.js. Le premier article traité des [fondements de Three.js](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous devriez peut-être commencer par là.

Avant d'aller plus loin, parlons du paramètrage de votre environnement de travail. Pour des raisons de sécurité
WebGL ne peut pas utiliser des images provenant de votre disque dur. Cela signifie qu'il faille utiliser
un serveur web. Heureusement, ils sont très facile à utiliser.

Tout d'abord, si vous le souhaitez, vous pouvez télécharger l'intégralité de ce site depuis [ce lien](https://github.com/gfxfundamentals/threejsfundamentals/archive/gh-pages.zip).
Une fois téléchargé, dézippez le dossier. 

Ensuite, téléchargez l'un des web serveurs suivants.

Si vous en préférez un avec une interface graphique, voici [Servez](https://greggman.github.io/servez)

{{{image url="resources/servez.gif" className="border" }}}

Pointez-le simplement sur le dossier où vous avez décompressé les fichiers, cliquez sur "Démarrer", puis accédez-y dans votre navigateur à l'adresse suivante [`http://localhost:8080/`](http://localhost:8080/) ou si vous voulez souhaitez parcourir les exemples, accédez à [`http://localhost:8080/threejs`](http://localhost:8080/threejs).

Pour arrêter le serveur, cliquez sur stop ou quittez Servez.

Si vous préférez la ligne de commande, une autre façon consiste à utiliser [node.js](https://nodejs.org).
Téléchargez-le, installez-le, puis ouvrez une fenêtre d'invite de commande / console / terminal. Si vous êtes sous Windows, le programme d'installation ajoutera une "Invite de commande de nœud" spéciale, alors utilisez-la.

Ensuite installez [`servez`](https://github.com/greggman/servez-cli) avec ces commandes

    npm -g install servez

Ou si vous êtes sous OSX

    sudo npm -g install servez

Une fois que c'est fait, tapez cette commande

    servez path/to/folder/where/you/unzipped/files

Ou si vous êtes comme moi

    cd path/to/folder/where/you/unzipped/files
    servez

Il devrait imprimer quelque chose ça

{{{image url="resources/servez-response.png" }}}

Ensuite, ouvrez [`http://localhost:8080/`](http://localhost:8080/) dans votre navigateur.

Si vous ne spécifiez pas de chemin, Servez choisira le dossier courant.

Si ces options ne vous conviennent pas, vous pouvez choisir 
[d'autres alternatives](https://stackoverflow.com/questions/12905426/what-is-a-faster-alternative-to-pythons-servez-or-simplehttpserver).

Maintenant que vous avez un serveur configuré, nous pouvons passer aux [textures](threejs-textures.html).
