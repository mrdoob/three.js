Title: Lumières en Three.js
Description: Configuration des lumières
TOC: Lumières

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html). Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là ou aussi voir l'article sur [la configuartion de votre environnement](threejs-setup.html). L'
[article précédent](threejs-textures.html) parlait des textures.

Voyons comment utiliser les différents types de lumières.

En commençant par l'un de nos exemples précédents, mettons à jour la caméra. Nous allons régler le champ de vision à 45 degrés, le plan éloigné à 100 unités, et nous déplacerons la caméra de 10 unités vers le haut et 20 unités en arrière de l'origine.

```js
*const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

Ajoutons ensuite `OrbitControls`. `OrbitControls` permet à l'utilisateur de tourner ou de mettre la caméra en *orbite* autour d'un certain point. Il s'agit d'une fonctionnalité facultative de Three.js, nous devons donc d'abord l'importer

```js
import * as THREE from './resources/three/r131/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r131/examples/jsm/controls/OrbitControls.js';
```

Ensuite, nous pouvons l'utiliser. Nous passons à `OrbitControls` une caméra à contrôler et l'élément DOM à utiliser.

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

Nous plaçons également la cible en orbite, 5 unités au-dessus de l'origine
et appelons `controls.update` afin que les contrôles utilisent la nouvelle cible.

Ensuite, créons des choses à éclairer. Nous allons d'abord faire un plan au sol. Nous allons appliquer une petite texture en damier de 2x2 pixels qui ressemble à ceci

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

Tout d'abord, chargeons la texture, définissons-la sur répétition, définissons le filtrage au plus proche et définissons le nombre de fois que nous voulons qu'elle se répète. Étant donné que la texture est un damier de 2x2 pixels, en répétant et en définissant la répétition à la moitié de la taille du plan, chaque case sur le damier aura exactement 1 unité de large ;

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

Nous fabriquons ensuite une géométrie 'plane', un matériau et une 'mesh' pour l'insérer dans la scène. Les plans sont par défaut dans le plan XY, mais le sol est dans le plan XZ, nous le faisons donc pivoter.

```js
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

Ajoutons un cube et une sphère, ainsi nous aurons 3 choses à éclairer dont le plan

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Maintenant que nous avons une scène à éclairer, ajoutons des lumières !

## `AmbientLight`

D'abord mettons en place une `AmbientLight`

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

Faisons aussi en sorte que nous puissions ajuster les paramètres de la lumière.
Utilisons à nouveau [dat.GUI](https://github.com/dataarts/dat.gui).
Pour pouvoir ajuster la couleur via dat.GUI, nous avons besoin d'un petit 'helper' qui fournit à dat.GUI une couleur en hexadécimale (eg: `#FF8844`). Notre 'helper' obtiendra la couleur d'une propriété nommée, la convertira en une chaîne hexadécimale à offrir à dat.GUI. Lorsque dat.GUI essaie de définir la propriété de l'assistant, nous attribuons le résultat à la couleur de la lumière.

Voici notre 'helper':

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

Et voici le code de configuartion de dat.GUI

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

Le résultat :

{{{example url="../threejs-lights-ambient.html" }}}

Cliquez/glissez pour mettre la caméra en *orbite*.

Remarquez qu'il n'y a pas de définition. Les formes sont plates. L'`AmbientLight` multiplie simplement la couleur du matériau par la couleur de la lumière multipliée par l'intensité.

    color = materialColor * light.color * light.intensity;

C'est ça. Il n'a pas de direction. Ce style d'éclairage ambiant n'est en fait pas très utile en tant qu'éclairage, à part changer la couleur de toute la scène, ce n'est pas vraiment un éclairage, ça rend juste les ténèbres moins sombres.


XXXXXXXXXXXXXXXXXXXXXXX

## `HemisphereLight`

Passons à une `HemisphereLight`. Une `HemisphereLight` prend une couleur de ciel et une couleur de sol et multiplie simplement la couleur du matériau entre ces 2 couleurs : la couleur du ciel si la surface de l'objet pointe vers le haut et la couleur du sol si la surface de l'objet pointe vers le bas.

Voici le nouveau code

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // light blue
+const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

Mettons aussi à jour le dat.GUI avec ces 2 couleurs

```js
const gui = new GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

Le resultat :

{{{example url="../threejs-lights-hemisphere.html" }}}

Remarquez encore une fois qu'il n'y a presque pas de définition, tout a l'air plutôt plat. L'`HemisphereLight` utilisée en combinaison avec une autre lumière peut aider à donner une belle sorte d'influence de la couleur du ciel et du sol. Retenez qu'il est préférable de l'utiliser en combinaison avec une autre lumière ou à la place d'une `AmbientLight`.

## `DirectionalLight`

Remplaçons le code par une `DirectionalLight`.
Une `DirectionalLight` est souvent utiliser pour représenter la lumière du soleil.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

Notez que nous avons dû ajouter une `light` et une `light.target`
à la scéne. Une `DirectionalLight` doit illuminer une cible.

Faisons en sorte que nous puissions déplacer la cible en l'ajoutant à dat.GUI.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

C'est un peu difficile de voir ce qui se passe. Three.js a un tas de 'helper' que nous pouvons ajouter à la scène pour voir les objets invibles. Utilisons, dans ce cas, 
`DirectionalLightHelper` qui a représente la source de lumière en direction de sa cible. Il suffit de lui ajouter une lumière et de l'ajouter à la scène.

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

Pendant que nous y sommes, faisons en sorte que nous puissions définir à la fois la position de la lumière et la cible. Pour ce faire, nous allons créer une fonction qui, étant donné un `Vector3`, ajustera ses propriétés `x`, `y` et `z` à l'aide de `dat.GUI`.

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

Notez que nous devons appeler la fonction `update` du 'helper' à chaque fois que nous modifions quelque chose afin que l'assistant sache se mettre à jour. En tant que tel, nous passons une fonction `onChangeFn` pour être appelée à chaque fois que dat.GUI met à jour une valeur.

Ensuite, nous pouvons l'utiliser à la fois pour la position de la lumière et la position de la cible comme ceci

```js
+function updateLight() {
+  light.target.updateMatrixWorld();
+  helper.update();
+}
+updateLight();

const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);

+makeXYZGUI(gui, light.position, 'position', updateLight);
+makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

Maintenant, nous pouvons bouger la lumière, et sa cible.

{{{example url="../threejs-lights-directional-w-helper.html" }}}

Mettez la caméra en orbite et il devient plus facile de voir. Le plan représente une lumière directionnelle car une lumière directionnelle calcule la lumière venant dans une direction. Il n'y a aucun point d'où vient la lumière, c'est un plan de lumière infini qui projette des rayons de lumière parallèles.

## `PointLight`

Un `PointLight` est une lumière qui se trouve en un point et projette de la lumière dans toutes les directions à partir de ce point. Changeons le code.

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
-light.target.position.set(-5, 0, 0);
scene.add(light);
-scene.add(light.target);
```

Passons également à un `PointLightHelper`

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

et comme il n'y a pas de cible la fonction `onChange` peut être simplifiée.

```js
function updateLight() {
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

Notez qu'à un certain niveau, un `PointLightHelper` n'a pas de point. Il dessine juste un petit diamant filaire. Ou n'importe quelle autre forme que vous voulez, ajoutez simplement un maillage à la lumière elle-même.

Une `PointLight` a une propriété supplémentaire, [`distance`](PointLight.distance).
Si la `distance` est de 0, le `PointLight` brille à l'infini. Si la `distance` est supérieure à 0, la lumière brille de toute son intensité vers la lumière et s'estompe jusqu'à n'avoir aucune influence à des unités de `distance` de la lumière.

Mettons à jour dat.GUI pour pouvoir modifier la distance.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

Et maintennat, testons.

{{{example url="../threejs-lights-point.html" }}}

Remarquez comment la lumière s'éteint lorsque la `distance` est > 0.

## `SpotLight`

La `SpotLight` (projecteur), c'est une lumière ponctuelle avec un cône attaché où la lumière ne brille qu'à l'intérieur du cône. Il y a en fait 2 cônes. Un cône extérieur et un cône intérieur. Entre le cône intérieur et le cône extérieur, la lumière passe de la pleine intensité à zéro.

Pour utiliser une `SpotLight`, nous avons besoin d'une cible tout comme la lumière directionnelle. Le cône de lumière s'ouvrira vers la cible.

Modifions notre `DirectionalLight` avec le 'helper' vu plus haut

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

L'angle du cône de la `Spotlight` est défini avec la propriété [`angle`](SpotLight.angle)
en radians. Utilisons notre `DegRadHelper` vu dans
[l'article sur les textures](threejs-textures.html) pour modifier l'angle avec dat.GUI.

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

Le cône intérieur est défini en paramétrant la propriété [`penumbra`](SpotLight.penumbra) en pourcentage du cône extérieur. En d'autres termes, lorsque la pénombre est de 0, le cône intérieur a la même taille (0 = aucune différence) que le cône extérieur. Lorsque la pénombre est de 1, la lumière s'estompe en partant du centre du cône jusqu'au cône extérieur. Lorsque la pénombre est de 0,5, la lumière s'estompe à partir de 50 % entre le centre du cône extérieur.

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

Remarquez qu'avec la `penumbra` par défaut à 0, le projecteur a un bord très net alors que lorsque vous l'ajustez à 1, le bord devient flou.

Il peut être difficile de voir le *cône* des spotlight. C'est parce qu'il se trouve sous le sol. Raccourcissez la distance à environ 5 et vous verrez l'extrémité ouverte du cône.

## `RectAreaLight`

Il existe un autre type de lumière, la [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight), qui ressemble à une zone de lumière rectangulaire comme une longue lampe fluorescente ou peut-être une lucarne dépolie dans un plafond.

Le [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) ne fonctionne qu'avec les [`MeshStandardMaterial`](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial) et [`MeshPhysicalMaterial`](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) donc changeons tous nos matériaux en `MeshStandardMaterial`

```js
  ...

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
-  const planeMat = new THREE.MeshPhongMaterial({
+  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
- const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
+ const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

Pour utiliser [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) nous devons importer [`RectAreaLightHelper`](https://threejs.org/docs/#api/en/helpers/RectAreaLightHelper) pour nous aider à voir la lumière.

```js
import * as THREE from './resources/three/r131/build/three.module.js';
+import {RectAreaLightUniformsLib} from './resources/threejs/r131/examples/jsm/lights/RectAreaLightUniformsLib.js';
+import {RectAreaLightHelper} from './resources/threejs/r131/examples/jsm/helpers/RectAreaLightHelper.js';
```

et nous devons appeler `RectAreaLightUniformsLib.init`

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  RectAreaLightUniformsLib.init();
```

Si vous oubliez les données, la lumière fonctionnera toujours, mais ça pourrait paraître bizarre, alors n'oubliez pas d'inclure les données supplémentaires.

Maintenant, nous pouvons créer la lumière

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);

*const helper = new RectAreaLightHelper(light);
*light.add(helper);
```

Une chose à noter est que contrairement au [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) et à la [`SpotLight`](https://threejs.org/docs/#api/en/lights/SpotLight), la [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) n'utilise pas de cible. Elle utilise juste sa rotation. Une autre chose à noter est que le 'helper' doit être un enfant de la lumière. Ce n'est pas un enfant de la scène comme les autres 'helpers'.

Ajustons-la également à dat.GUI. Nous allons le faire pour que nous puissions faire pivoter la lumière et ajuster sa `width` et sa `height`

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20);
gui.add(light, 'height', 0, 20);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

makeXYZGUI(gui, light.position, 'position');
```

Et voici ce que ça donne.

{{{example url="../threejs-lights-rectarea.html" }}}

Une chose que nous n'avons pas vu, c'est qu'il existe un paramètre sur le [`WebGLRenderer`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer) appelé `physicalCorrectLights`. Il affecte la façon dont la lumière tombe en tant que distance de la lumière. Cela n'affecte que [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) et [`SpotLight`](https://threejs.org/docs/#api/en/lights/SpotLight). [`RectAreaLight`](https://threejs.org/docs/#api/en/lights/RectAreaLight) le fait automatiquement.

Pour les lumières, l'idée de base est de ne pas définir de distance pour qu'elles s'éteignent, et vous ne définissez pas `intensity`. Au lieu de cela, vous définissez la [`power`](PointLight.power) de la lumière en lumens, puis three.js utilisera des calculs physiques comme de vraies lumières. Les unités de three.js dans ce cas sont des mètres et une ampoule de 60w aurait environ 800 lumens. Il y a aussi une propriété [`decay`](PointLight.decay). Elle doit être réglé sur 2 pour une apparence réaliste.

Testons ça.

D'abord, définissons `physicallyCorrectLights` sur true

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.physicallyCorrectLights = true;
```

Ensuite, réglons la `power` à 800 lumens, la `decay` à 2, et
la `distance` sur `Infinity`.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

et mettons à jour dat.GUI pour pouvoir changer `power` et `decay`

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

Il est important de noter que chaque lumière que vous ajoutez à la scène ralentit la vitesse à laquelle Three.js rend la scène, vous devez donc toujours essayer d'en utiliser le moins possible pour atteindre vos objectifs.

Passons maintenant à [la gestion des caméras](threejs-cameras.html).

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lights.js"></script>
