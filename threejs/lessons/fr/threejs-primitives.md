Title: Primitives de Three.js
Description: Un tour des primitives de  three.js
TOC: Primitives

Cet article fait partie d'une série consacrée à three.js.
Le premier article est [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là.

Three.js a un grand nombre de primitives. Les primitives
sont généralement des formes 3D qui sont générées à l'exécution
avec un tas de paramètres.

Il est courant d'utiliser des primitives des objets comme des sphère
pour un globe ou un tas de boîtes pour dessiner un graphique en 3D.
Il est particulièrement courant d'utiliser des primitives  pour faire
des expériences et se lancer dans la 3D. Pour la majorité des
applications 3D, il est courant de demander à un artiste de faire des modèles 3D dans un programme de modélisation 3D comme [Blender](https://blender.org), [Maya](https://www.autodesk.com/products/maya/) ou [Cinema 4D](https://www.maxon.net/en-us/products/cinema-4d/). Plus tard dans cette série,
nous aborderons la conception et le chargement de données de
plusieurs programme de modélisation 3D. Pour l'instant, passons
en revue certaines primitives disponibles.

La plupart des primitives ci-dessous ont des valeurs par défaut
pour certains ou tous leurs paramètres. Vous pouvez donc les
utiliser en fonction de vos besoins.

<div id="Diagram-BoxBufferGeometry" data-primitive="BoxBufferGeometry">Une Boîte</div>
<div id="Diagram-CircleBufferGeometry" data-primitive="CircleBufferGeometry">Un Cercle plat</div>
<div id="Diagram-ConeBufferGeometry" data-primitive="ConeBufferGeometry">Un Cône</div>
<div id="Diagram-CylinderBufferGeometry" data-primitive="CylinderBufferGeometry">Un Cylindre</div>
<div id="Diagram-DodecahedronBufferGeometry" data-primitive="DodecahedronBufferGeometry">Un Dodécaèdre (12 côtés)</div>
<div id="Diagram-ExtrudeBufferGeometry" data-primitive="ExtrudeBufferGeometry">Une forme 2D extrudée avec un biseautage optionnel. Ici, nous extrudons une forme de cœur. Notez qu'il s'agit du principe de fonctionnement pour les <code>TextBufferGeometry</code> et les <code>TextGeometry</code>.</div>
<div id="Diagram-IcosahedronBufferGeometry" data-primitive="IcosahedronBufferGeometry">Un Icosaèdre (20 côtés)</div>
<div id="Diagram-LatheBufferGeometry" data-primitive="LatheBufferGeometry">Une forme généré par la rotation d'une ligne pour, par exemple, dessiner une lampe, une quille, bougies, bougeoirs, verres à vin, verres à boire, etc... vous fournisssez une silhouette comme une série de points et vous dites ensuite à three.js combien de subdivisions il faut faire en faisant tourner la silhouette autour d'un axe.</div>
<div id="Diagram-OctahedronBufferGeometry" data-primitive="OctahedronBufferGeometry">Un Octaèdre (8 côtés)</div>
<div id="Diagram-ParametricBufferGeometry" data-primitive="ParametricBufferGeometry">Une surface générée en fournissante à la fonction un point 2D d'une grille et retourne le point 3D correspondant.</div>
<div id="Diagram-PlaneBufferGeometry" data-primitive="PlaneBufferGeometry">Un plan 2D</div>
<div id="Diagram-PolyhedronBufferGeometry" data-primitive="PolyhedronBufferGeometry">Prend un ensemble de triangles centrés autour d'un point et les projette sur une sphère</div>
<div id="Diagram-RingBufferGeometry" data-primitive="RingBufferGeometry">Un disque 2D avec un trou au centre</div>
<div id="Diagram-ShapeBufferGeometry" data-primitive="ShapeBufferGeometry">Un tracé 2D qui se triangule</div>
<div id="Diagram-SphereBufferGeometry" data-primitive="SphereBufferGeometry">une sphère</div>
<div id="Diagram-TetrahedronBufferGeometry" data-primitive="TetrahedronBufferGeometry">Un tétraèdre (4 côtés)</div>
<div id="Diagram-TextBufferGeometry" data-primitive="TextBufferGeometry">Texte 3D généré à partir d'une police 3D et d'une chaîne de caractères</div>
<div id="Diagram-TorusBufferGeometry" data-primitive="TorusBufferGeometry">Un tore (donut)</div>
<div id="Diagram-TorusKnotBufferGeometry" data-primitive="TorusKnotBufferGeometry">Un nœud torique</div>
<div id="Diagram-TubeBufferGeometry" data-primitive="TubeBufferGeometry">Extrusion controlée d'un cercle le long d'un tracé</div>
<div id="Diagram-EdgesGeometry" data-primitive="EdgesGeometry">Un objet d'aide qui prend une autre
géométrie en entrée et génère des arêtes que si l'angle entre les faces est supérieur à un certain
seuil. Par exemple, si vous regardez en haut de la boîte, elle montre une ligne passant par chaque
face et montrant chaque triangle qui forme la boîte. Si vous utilisez une
<code>EdgesGeometry</code> les lignes du milieu sont supprimées. Ajustez le "thresholdAngle"
ci-dessous et vous verrez les arêtes en dessous de ce seuil disparatre.</div>
<div id="Diagram-WireframeGeometry" data-primitive="WireframeGeometry">Génère une géométrie qui
contient un segment de droite (2 points) par arête dans la géométrie donnée. Sans cela, il vous
manquerait souvent des arêtes ou vous obtiendriez des arêtes supplémentaines puisque WebGL exige
généralement 2 points par segment de ligne. Par exemple, si vous n'aviez d'un seul triangle, il
n'y aurait que 3 points. Si vous essayez de le dessiner en utilisant un un matériau avec
<code>wireframe: true</code> vous n'obtiendrez qu'une seule ligne. Si vous passez cette géométrie
triagulaire à un <code>WireframeGeometry</code> vous obtenez une nouvelle géométrie qui comporte
3 segments de lignes utilisant 6 points..</div>

Vous remarquerez que la plupart d'entre eux sont des paires de `Geometry`
ou `BufferGeometry`. La différence entre ces deux types est en fait la flexibilité par rapport à la performance.

Les primitives basées sur la `BufferGeometry` sont des types orientés vers les performances. Les
sommets de la géométrie sont générés directement dans un format de tableau typé efficace, prêt à
être envoyé au GPU pour le rendu. Cela signifie qu'ils sont plus rapides à démarrer et prennent
moins de mémoire, mais si vous voulez modifier leurs données, ils nécessitent ce qui est souvent
considéré comme une programmation plus complexe à manipuler.

Les primitives basées sur la `Geometry` sont les plus flexibles et les plus faciles à manipuler.
Ils sont construits à partir de classes JavaScript comme `Vector3` pour les points 3D, `Face3`
pour les triangles.
Ils demandent beaucoup de mémoire et avant de pouvoir être rendus, three.js devra les convertir
en quelque chose de similaire à la représentation correspondante de `BufferGeometry`.

Si vous savez que vous n'allez pas manipuler une primitive
ou si vous êtes à l'aise pour faire le calcul pour manipuler
ses internes, alors il est préférable d'opter pour les primitives
basées sur la `BufferGeometry`. Si, par contre, vous
souhaitez modifier certaines choses avant le rendu, vous trouverez
peut-être les primitives basées sur la `Geometry` plus faciles à manipuler.

Pour prendre un exemple simple, une `BufferGeometry` ne peut pas facilement
avoir de nouveaux sommets ajoutés. Le nombre de sommets utilisés
est décidé au moment de la création, le stockage est créé, puis les données
relatives aux sommets sont fournies. Alors que pour la `Geometry`, vous
pouvez ajouter des sommets au fur et à mesure.

Nous reviendrons sur la création de géométrie personnalisée dans
[un autre article](threejs-custom-geometry.html). Pour l'instant,
faisons un exemple en créant chaque type de primitive. Nous
commencerons par les [exemples de l'article précédent](threejs-responsive.html).

Mais d'abord, définissons un couleur de fond


```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color(0xAAAAAA);
```

Cela indique à three.js de passer au gris clair.

La caméra doit changer de position pour que nous puissions voir tous les objets.

```js
-const fov = 75;
+const fov = 40; // champ de vue (field of view)
const aspect = 2;
const near = 0.1; // distance minimum
-const far = 5;
+const far = 1000; // distance maximum
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 120;
```

Ajoutons une fonction, `addObject`, qui prend une position x, y et un `Object3D`
et ajoute l'objet à la scène.

```js
const objects = [];
const spread = 15;

function addObject (x, y, obj) {
  obj.position.x = x * spread;
  obj.position.y = y * spread;

  scene.add(obj);
  objects.push(obj);
}
```

Faisons aussi une fonction pour créer un matériau coloré aléatoire.
Nous utiliserons une fonction de `Color` qui vous permet de définir
une couleur en fonction de la teinte, de la saturation et de la luminosité.

La `hue` (teinte) va de 0 à 1 autour de la roue des couleurs avec
le rouge à 0, le vert à 0,33 et le bleu à 0,66. La `saturation`
va de 0 à 1,0 n'ayant pat de couleur et 1 étant saturé. La `luminance`
(luminosité) va de 0 à 1, 0 étant le noir, 1 le blanc et 0,5 la
quantité maximale de la couleur En d'autres termes, lorsque la
`luminance` va de 0,0 à 0,5, la couleur passe du noir à la `hue`.
De 0,5 à 1,0 la couleur passe de la `hue` au blanc.

```js
function createMaterial () {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random(); // teinte
  const saturation = 1;
  const luminance = .5; // luminosité
  material.color.setHSL(hue, saturation, luminance);

  return material;
}
```

Nous avons également passé `side: THREE.DoubleSide` au matériau.
Cela indique à three de dessiner les deux côtés des triangles
qui constituent une forme. Pour un solide comme une sphère
ou un cube, il n'y a généralement pas de raison de dessiner les
côtés arrière des triangles car ils sont tous tournés ver l'intérieur
de la forme. Dans notre cas, cependant, nous dessinons des objets
comme la `PlaneBufferGeometry` ou la `ShapeBufferGeometry`
qui sont bidimensionnnels et n'ont donc pas d'intérieur.
Sans le paramètre `side: THREE.DoubleSide` elle disparaîtraient
quand on regarderait leur dos.

Notons qu'il est plus rapide de dessiner quand on ne met **pas**
`side: THREE.DoubleSide`, donc l'idéal serait de ne le mettre que sur
les matériaux qui en ont vraiment besoin, mais dans ce cas, nous
ne dessinons pas trop, donc il n'y a pas de raisons de s'en inquiéter

Faisons une fonction, `addSolidGeometry`, qui
reçoit une géométrie et crée un matériau coloré
aléatoire via `createMaterial` et l'ajoute à la
scène via `addObject`.

```js
function addSolidGeometry(x, y, geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  addObject(x, y, mesh);
}
```

Nous pouvons maintenant l'utiliser pour la majorité des primitives que nous créons.
Par exemple, la création d'une boîte

```js
{
  const width = 8; // largeur
  const height = 8; // hauteur
  const depth = 8; // profondeur
  addSolidGeometry(-2, -2, new THREE.BoxBufferGeometry(width, height, depth));
}
```

Si vous regardez dans le code ci-dessous, vous verrez une section similaire pour chaque type de géométrie.

Voici le résultat :

{{{example url="../threejs-primitives.html" }}}

Il y a quelques exceptions notables au modèle ci-dessus.
La plus grande est probablement le `TextBufferGeometry`. Il doit charger
des données de police en 3D avant de pouvoir générer un maillage pour le texte.
Ces données se chargent de manière asynchrone, nous devons donc attendre
qu'elles se chargent avant d'essayer de créer la géométrie. En "promettant"
le chargement des polices, nous pouvons faciliter la tâche.
Une créons un `FontLoader` et une fonction `loadFont` qui retourne
une promesse, qui une fois résolue, nous donnera la police. Nous créons
une fonction `async` appelée `doit` et chargeons la police en utilisant `await`.
Et enfin, nous créons la géométrie et appelons `addObject` pour l'ajouter à la scène.

```js
{
  const loader = new THREE.FontLoader();
  // promisify font loading
  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  async function doit() {
    const font = await loadFont('../resources/threejs/fonts/helvetiker_regular.typeface.json');  /* threejsfundamentals: url */
    const geometry = new THREE.TextBufferGeometry('three.js', {
      font: font,
      size: 3.0,
      height: .2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: .3,
      bevelSegments: 5,
    });
    const mesh = new THREE.Mesh(geometry, createMaterial());
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.add(mesh);

    addObject(-1, -1, parent);
  }
  doit();
}
```

Il y a une autre différence. Nous voulons faire tourner le texte autour de son
centre, mais par défaut three.js crée le texte de telle sorte que son centre de rotation
se trouve sur le bord gauche. Pour contourner ce problème, nous pouvons demander à
three.js de calculer la zone de délimition de la géométrie.
Nous pouvons alors appeler la méthode `getCenter` de la zone de délimitation
et lui passer la position du mallage de notre objet. La méthode
`getCenter` copie le centre de la zone dans la position.
Elle renvoie également l'objet position afin que nous puisssions appler
`multiplyScalar(-1)` pour positionnner l'objet entier de telle sorte que son
centre de rotation soit au centre de l'objet.

Si nous appelons juste `addSolidGeometry` comme dans les
exemples précédents, il s'établierait une position
qui n'est pas bonne. Donc, dans ce cas, nous créons un `Object3D`
qui est un nœud standard pour les scènes three.js. `Mesh`
hérite également de `Object3D`. Nous allons voir
[comment la scène fonctione dans un article](threejs-scenegraph.html).
Pout l'instant, il suffit de savoir que,
comme les nœuds DOM, les enfants sont en relatifs à leur parent.
En créant un `Object3D` et en faisant de notre maillage (mesh) un
enfant de celui-ci nous pouvons positionner l'`Object3D` où nous
voulons tout en conservant le décalage central que nous avons
fixé précédemment.

Si nous ne faisions pas ça, le texte serait décentré.

{{{example url="../threejs-primitives-text.html" }}}

Notons que celui de gauche ne tourne pas autour de son centre
alors que celui de droite le fait.

Les autres exceptions sont les exemples de 2 lignes pour la `EdgesGeometry`
et la `WireframeGeometry`. Au lieu d'appeler `addSolidGeometry` ils appellent
`addLineGeometry` qui lui ressemble

```js
function addLineGeometry(x, y, geometry) {
  const material = new THREE.LineBasicMaterial({color: 0x000000});
  const mesh = new THREE.LineSegments(geometry, material);
  addObject(x, y, mesh);
}
```

Cela crée un `LineBasicMaterial` noir et ensuite un objet `LineSegments`
qui est enveloppé par le `Mesh` qui premet à three de savoir que vous
affichez des segments de ligne (2 points par segment).

Chacune des primitives a plusieurs paramètres que vous pouvez passer à la création
et il est préférable de [regarder la documentation](https://threejs.org/docs/) 
pour tous ces paramètres plutôt que de les répéter ici.
Vous pouvez également cliquer sur les liens ci-dessus à côté de chaque
forme pour accéder directement à la documentation correspondante

Il y a une paire de classes qui ne correspond pas vaiment aux modèles ci-dessus. Il s'agit des
classses `PointsMaterial` et  `Points`. Les `Points` sont comme les `LineSegments` ci-dessus en
ce sens qu'ils prennent une `Geometry` ou une `BufferGeometry` mais dessinent des points à chaque
sommet au lieu de lignes.
Pour l'utiliser, vous devez également lui passer un `PointsMaterial` qui
prend une taille ([`size`](PointsMaterial.size)) pour la taille des points.

```js
const radius = 7; // rayon
const widthSegments = 12;
const heightSegments = 8;
const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
const material = new THREE.PointsMaterial({
    color: 'red',
    size: 0.2, // en unités du monde
});
const points = new THREE.Points(geometry, material);
scene.add(points);
```

<div class="spread">
<div data-diagram="Points"></div>
</div>

Vous pouvez désactiver l'option [`sizeAttenuation`](PointsMaterial.sizeAttenuation) en la réglant
sur "false" si vous souhaitez que les points soient de la même taille quelle que soit leur
distance par rapport à la camera.

```js
const material = new THREE.PointsMaterial({
    color: 'red',
+    sizeAttenuation: false,
+    size: 3, // en pixels
-    size: 0.2, // en unités du monde
});
...
```

<div class="spread">
<div data-diagram="PointsUniformSize"></div>
</div>

Une autre chose qu'il est important de souligner, c'est que presque toutes les formes ont des
réglages différents pour ce qui est de leur subdivisions. Un bon exemple pourrait être les
géométries des sphères prennent des paramètres pour le nombre de divisions à faire autour et de
haut en bas, par exemple

<div class="spread">
<div data-diagram="SphereBufferGeometryLow"></div>
<div data-diagram="SphereBufferGeometryMedium"></div>
<div data-diagram="SphereBufferGeometryHigh"></div>
</div>

La première sphère a un tour de 5 segments et 3 de haut, soit 15 segments ou 30 triangles.
La deuxième sphère a 24 segments sur 10. cela fait 240 segments ou 480 triangles. Le dernier a
50 par 50, soir 2500 segments ou 5000 triangles.

C'est à vous de décider du nombre de subdivisions dont vous avez besoin. Il peut sembler que vous
ayez besoin d'un grand nombre de segments, mais si vous  enlevez les lignes et les ombres plates
et nous obtenons ceci

<div class="spread">
<div data-diagram="SphereBufferGeometryLowSmooth"></div>
<div data-diagram="SphereBufferGeometryMediumSmooth"></div>
<div data-diagram="SphereBufferGeometryHighSmooth"></div>
</div>

Il est moins perceptible que celle de droite avec 5000 triangles est meilleure que celle avec
seulement 480 triangles. Si vous ne dessinez que quelques sphères, comme par exemple, un seul
globe pour une carte de la terre, alors une sphère de 10 000 triagles n'est pas un mauvais choix.
Si, par contre, vous essayez de dessiner 1000 sphères alors 1000 sphères multipliées par 10000
triangles représentent chacune 10 millions de triangles. Pour que l'animation soit fluide,
il faut que le navigateur dessine à 60 images par seconde pour que vous demandiez au navigateur
de dessiner 600 millions de triangles par seconde. Ça fait beaucoup de calcul.

Parfois, il est facile de choisir. Par exemple, vous pouvez aussi choisir
de subdiviser un plan.

<div class="spread">
<div data-diagram="PlaneBufferGeometryLow"></div>
<div data-diagram="PlaneBufferGeometryHigh"></div>
</div>

Le plan à gauche est composé de 2 triangles. Le plan de droite est composé de 200 triangles.
Contrairement à la sphère, il n'y a pas vraiment de compromis sur la qualité pour la plupart des
cas d'utilisation d'un plan. Vous ne subdiviserez probablement un plan que si vous vous attendez
à vouloir le modifier ou le déformer d'une manière ou d'une autre. Même as pour la boîte.

Choisissez donc ce qui convient le mieux à votre situation. Moins vous choisirez de subdivisions,
plus les choses auront des chances de se dérouler sans heurts et moins il vous faudra de mémoire.
Vous devrez décider vous-même du compromis qui convient le mieux à cas d'utilisation.

Si aucune des formes ci-dessus ne correspond à votre cas d'utilisation, vous pouvez
charger la géométrie par exemple à partir d'un [fichier .obj](threejs-load-obj.html)
ou d'un [fichier .gltf](threejs-load-gltf.html).
Vous pouvez également créer votre [Geometry](threejs-custom-geometry.html)
ou votre [BufferGeometry](threejs-custom-buffergeometry.html).

Voyons maintenant [comment fonctionne la scène de tree
et comment l'utiliser](threejs-scenegraph.html).

<link rel="stylesheet" href="../resources/threejs-primitives.css">
<script type="module" src="../resources/threejs-primitives.js"></script>

