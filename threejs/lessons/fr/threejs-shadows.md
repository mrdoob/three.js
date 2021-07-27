Title: Les ombres dans Three.js
Description: Les ombres dans Three.js
TOC: Shadows

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là.
L'[article précédent qui s'intéressait caméras](threejs-cameras.html) est à lire ainsi que [celui à propos des lumières](threejs-lights.html) avant d'entamer cet article-ci.

Les ombres peuvent être un sujet compliqué. Il existe différentes solutions et toutes ont des compromis, y compris les solutions disponibles dans Three.js.

Three.js, par défaut, utilise des *shadow maps*. Comment ça marche ? *pour chaque lumière qui projette des ombres, tous les objets marqués pour projeter des ombres sont rendus du point de vue de la lumière*. **RELISEZ ENCORE UNE FOIS** pour que ça soit bien clair pour vous.

En d'autres termes, si vous avez 20 objets et 5 lumières, et que les 20 objets projettent des ombres et que les 5 lumières projettent des ombres, toute votre scène sera dessinée 6 fois. Les 20 objets seront dessinés pour la lumière #1, puis les 20 objets seront dessinés pour la lumière #2, puis #3, et ainsi de suite. Enfin la scène sera dessinée en utilisant les données des 5 premiers rendus.

C'est pire, si vous avez une 'pointLight' projetant des ombres, la scène devra être dessinée 6 fois juste pour cette lumière !

Pour ces raisons, il est courant de trouver d'autres solutions que d'avoir un tas de lumières générant toutes des ombres. Une solution courante consiste à avoir plusieurs lumières mais une seule lumière directionnelle générant des ombres.

Une autre solution consiste à utiliser des lightmaps et/ou des maps d'occlusion ambiante pour pré-calculer les effets de l'éclairage hors ligne. Cela se traduit par un éclairage statique ou des soupçons d'éclairage statique, mais au moins c'est rapide. Nous verrons cela dans un autre article.

Une autre solution consiste à utiliser de fausses ombres. Créez un plan, placez une texture en niveaux de gris dans le plan qui se rapproche d'une ombre, dessinez-la au-dessus du sol sous votre objet.

Par exemple, utilisons cette texture comme une fausse ombre.

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

Utilisons une partie du code de [l'article précédent](threejs-cameras.html).

Réglons la couleur de fond sur blanc.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

Ensuite, nous allons configurer le même sol en damier, mais cette fois, nous utilisons un [`MeshBasicMaterial`](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial) car nous n'avons pas besoin d'éclairage pour le sol.

```js
+const loader = new THREE.TextureLoader();

{
  const planeSize = 40;

-  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
+  planeMat.color.setRGB(1.5, 1.5, 1.5);
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
```

Notez que nous définissons la couleur sur `1.5, 1.5, 1.5`. Cela multipliera les couleurs de la texture du damier par 1,5, 1,5, 1,5. Puisque les couleurs de la texture sont 0x808080 et 0xC0C0C0, c'est-à-dire gris moyen et gris clair, les multiplier par 1,5 nous donnera un damier blanc et gris clair.

Chargeons la texture de l'ombre

```js
const shadowTexture = loader.load('resources/images/roundshadow.png');
```

et créons un tableau pour mémoriser chaque sphère et les objets associés.

```js
const sphereShadowBases = [];
```

Ensuite, créons une sphère.

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
```

Et un plan pour simuler l'ombre.

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);
```

Maintenant, nous allons faire un tas de sphères. Pour chaque sphère, nous allons créer une `base` `THREE.Object3D` et nous allons créer à la fois le maillage du plan d'ombre et le maillage de la sphère enfants de la base. De cette façon, si nous déplaçons la base, la sphère et l'ombre bougeront. Nous devons placer l'ombre légèrement au-dessus du sol pour éviter les combats en Z. Nous définissons également `depthWrite` sur false pour que les ombres ne se gâchent pas. Nous reviendrons sur ces deux problèmes dans un [autre article](threejs-transparency.html). L'ombre est un `MeshBasicMaterial` car elle n'a pas besoin d'éclairage.

Nous donnons à chaque sphère une teinte différente, puis nous enregistrons la base, le maillage de la sphère, le maillage de l'ombre et la position y initiale de chaque sphère.

```js
const numSpheres = 15;
for (let i = 0; i < numSpheres; ++i) {
   // créer une base pour l'ombre et la sphère
   // donc ils bougent ensemble.
  const base = new THREE.Object3D();
  scene.add(base);

   // ajoute l'ombre à la base
   // remarque : nous fabriquons un nouveau matériau pour chaque sphère
   // afin que nous puissions définir la transparence matérielle de cette sphère
   // séparément.
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,    // pour que nous puissions voir le sol
    depthWrite: false,    // donc nous n'avons pas à trier
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001;  // donc nous sommes légèrement au-dessus du sol
  shadowMesh.rotation.x = Math.PI * -.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // ajouter la sphère à la base
  const u = i / numSpheres;   // passe de 0 à 1 au fur et à mesure que nous itérons les sphères.
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, .75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // rappelez-vous tous les 3 plus la position y
  sphereShadowBases.push({base, sphereMesh, shadowMesh, y: sphereMesh.position.y});
}
```

Nous avons installé 2 lumières. L'un est un [`HemisphereLight`](https://threejs.org/docs/#api/en/lights/HemisphereLight) avec une intensité réglée sur 2 pour vraiment illuminer les choses.

```js
{
  const skyColor = 0xB1E1FF;  // bleu
  const groundColor = 0xB97A20;  // orange brun
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

L'autre est un `DirectionalLight` donc les sphères ont une définition

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 5);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}
```

Il rendrait tel quel mais animons les sphères. Pour chaque sphère, ombre, jeu de base, nous déplaçons la base dans le plan xz, nous déplaçons la sphère de haut en bas en utilisant [`Math.abs(Math.sin(time))`](https://threejs.org/docs/#api/en/math/Math.abs(Math.sin(time))) qui nous donne une animation rebondissante. Et, nous avons également défini l'opacité du matériau d'ombre de sorte qu'à mesure que chaque sphère monte, son ombre s'estompe.

```js
function render(time) {
  time *= 0.001;  // convertir en secondes

  ...

  sphereShadowBases.forEach((sphereShadowBase, ndx) => {
    const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;

    // u est une valeur qui va de 0 à 1 au fur et à mesure que l'on itère les sphères
    const u = ndx / sphereShadowBases.length;

    // calculer une position pour la base. Cela va bouger
    // à la fois la sphère et son ombre
    const speed = time * .2;
    const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
    const radius = Math.sin(speed - ndx) * 10;
    base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // yOff est une valeur allant de 0 à 1
    const yOff = Math.abs(Math.sin(time * 2 + ndx));
    // déplace la sphère de haut en bas
    sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
    // estompe l'ombre au fur et à mesure que la sphère monte
    shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
  });

  ...
```

Et voici 15 balles rebondissantes.

{{{example url="../threejs-shadows-fake.html" }}}

Dans certaines applications, il est courant d'utiliser une ombre ronde ou ovale pour tout, mais bien sûr, vous pouvez également utiliser différentes textures d'ombre de forme. Vous pouvez également donner à l'ombre un bord plus dur. Un bon exemple d'utilisation de ce type d'ombre est [Animal Crossing Pocket Camp](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots) où vous pouvez voir que chaque personnage a une simple ombre ronde. C'est efficace et pas cher. [Monument Valley](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch) semble également utiliser ce type d'ombre pour le personnage principal.

Donc, en passant aux cartes d'ombre, il y a 3 lumières qui peuvent projeter des ombres. Le `DirectionalLight`, le `PointLight` et le `SpotLight`.

Commençons avec la `DirectionalLight` avec l'aide de [l'article sur les lumières](threejs-lights.html).

La première chose à faire est d'activer les ombres dans le renderer (moteur de rendu).

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.shadowMap.enabled = true;
```

Ensuite, nous devons également dire à la lumière de projeter une ombre.

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

Nous devons également aller sur chaque maillage de la scène et décider s'il doit à la fois projeter des ombres et/ou recevoir des ombres.

Faisons en sorte que le 'plane' (le sol) ne reçoive que des ombres car nous ne nous soucions pas vraiment de ce qui se passe en dessous.

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

Pour le cube et la sphère faisons en sorte qu'ils reçoivent et projettent des ombres.

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

Et puis nous l'exécutons.

{{{example url="../threejs-shadows-directional-light.html" }}}

Que s'est-il passé? Pourquoi des parties des ombres manquent-elles ?

C'est parce que les shadow maps sont créées en rendant la scène du point de vue de la lumière. C'est comme si il y avait une caméra dans la [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) qui regardait sa cible. Tout comme [la caméra de l'article précédent](threejs-cameras.html), la 'caméra de la lumière' définit une zone à l'intérieur de laquelle les ombres sont projetées. Dans l'exemple ci-dessus, cette zone est trop petite.

Afin de bien visualiser cette zone, ajoutons un `CameraHelper` à la scène.

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

Maintenant, on peut voir cette zone où les ombres sont projetés.

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

Ajustez la valeur x cible dans les deux sens et il devrait être assez clair que seul ce qui se trouve à l'intérieur de la boîte de la caméra d'ombre de la lumière est l'endroit où les ombres sont dessinées.

Nous pouvons ajuster la taille de cette boîte en ajustant la caméra d'ombre de la lumière.

Ajoutons quelques paramètres à dat.GUI pour ajuster les ombres. Étant donné qu'une [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) représente la lumière allant dans une direction parallèle, la [`DirectionalLight`](https://threejs.org/docs/#api/en/lights/DirectionalLight) utilise une [`OrthographicCamera`](https://threejs.org/docs/#api/en/cameras/OrthographicCamera) pour sa caméra d'ombre. Nous avons expliqué le fonctionnement d'une caméra orthographique dans [l'article précédent sur les caméras](threejs-cameras.html).

Pour rappel, une `OrthographicCamera` définit son *frustum* par ses propriètès `left`, `right`, `top`, `bottom`, `near`, `far` et `zoom`.

Créons à nouveau un helper pour dat.GUI. Appelons-le `DimensionGUIHelper`
et passons-lui un objet et 2 propriétés. Il dispose d'une propriété que dat.GUI peut ajuster et en réponse définit les deux propriétés, une positive et une négative.
Nous pouvons l'utiliser pour définir `left` et `right` en tant que `width` et `up`, `down` en tant que `height`.

```js
class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.maxProp] * 2;
  }
  set value(v) {
    this.obj[this.maxProp] = v /  2;
    this.obj[this.minProp] = v / -2;
  }
}
```

Utilisons aussi le `MinMaxGUIHelper` que nous avons créé dans [l'article sur les caméra](threejs-cameras.html) pour paramètrer `near` et `far`.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+{
+  const folder = gui.addFolder('Shadow Camera');
+  folder.open();
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 100)
+    .name('width')
+    .onChange(updateCamera);
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 100)
+    .name('height')
+    .onChange(updateCamera);
+  const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
+  folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+  folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+  folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
+}
```

Disons à dat.GUI d'appeler la fonction `updateCamera` à chaque changement.
Écrivons cette fonction pour mettre à jour la lumière et son helper, la caméra d'ombre de la lumière et son helper.

```js
function updateCamera() {
  // mettre à jour le MatrixWorld de la cible de lumière car il est requis par le helper
  light.target.updateMatrixWorld();
  helper.update();
  // mettre à jour la matrice de projection de la caméra d'ombre de la lumière
  light.shadow.camera.updateProjectionMatrix();
  // et maintenant mettre à jour l'assistant de caméra que nous utilisons pour afficher la caméra d'ombre de la lumière
  cameraHelper.update();
}
updateCamera();
```

Et maintenant que nous avons accès aux propriètès de la caméra d'ombre, jouons avec.

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

Réglez `width` et `height` sur 30 et vous verrez que les ombres sont correctement projetées.

Mais cela soulève la question, pourquoi ne pas simplement définir `width` et `height` avec des chiffres plus grands ? Réglez la largeur et la hauteur sur 100 et vous pourriez voir quelque chose comme ceci.

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

Que se passe-t-il avec ces ombres basse résolution ?!

Ce problème est lié à un autre paramètres des ombres. Les textures d'ombre sont des textures dans lesquelles les ombres sont dessinées. Ces textures ont une taille. La zone de la caméra d'ombre que nous avons définie ci-dessus est étirée sur cette taille. Cela signifie que plus la zone que vous définissez est grande, plus vos ombres seront en blocs.

Vous pouvez définir la résolution de la texture de l'ombre en définissant `light.shadow.mapSize.width` et `light.shadow.mapSize.height`. Ils sont par défaut à 512x512. Plus vous les agrandissez, plus ils prennent de mémoire et plus ils sont lents à s'afficher, vous voulez donc les définir aussi petits que possible tout en faisant fonctionner votre scène. La même chose est vraie avec la zone d'ombre. Plus petite signifie des ombres plus belles, alors réduisez la zone autant que possible tout en couvrant votre scène. Sachez que la machine de chaque utilisateur a une taille de texture maximale autorisée qui est disponible sur le renderer en tant que [`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities).

<!--
Ok but what about `near` and `far` I hear you thinking. Can we set `near` to 0.00001 and far to `100000000`
-->

En passant à une `SpotLight` la caméra d'ombre devient une `PerspectiveCamera`. Contrairement à la caméra d'ombre de la `DirectionalLight` où nous pouvons régler manuellement la plupart de ses paramètres, celle de la `SpotLight`est auto-controlée. Le `fov` de la caméra d'ombre est directement connecté au réglage de l'`angle` de la `SpotLight`.
L'`aspect` est directement définit en fonction de la taille de la zone d'ombre.

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

Rajoutons les paramètres `penumbra` et `angle` vu dans [l'article sur les lumières](threejs-lights.html).

{{{example url="../threejs-shadows-spot-light-with-camera-gui.html" }}}

<!--
You can notice, just like the last example if we set the angle high
then the shadow map, the texture is spread over a very large area and
the resolution of our shadows gets really low.

div class="threejs_center"><img src="resources/images/low-res-shadow-map-spotlight.png" style="width: 344px"></div>

You can increase the size of the shadow map as mentioned above. You can
also blur the result

{{{example url="../threejs-shadows-spot-light-with-shadow-radius" }}}
-->


Et enfin il y a les ombres avec un [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight). Étant donné qu'un [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) brille dans toutes les directions, les seuls paramètres pertinents sont `near` et `far`. Sinon, l'ombre PointLight est effectivement constituée de 6 ombres [`SpotLight`](https://threejs.org/docs/#api/en/lights/SpotLight), chacune pointant vers la face d'un cube autour de la lumière. Cela signifie que les ombres [`PointLight`](https://threejs.org/docs/#api/en/lights/PointLight) sont beaucoup plus lentes car la scène entière doit être dessinée 6 fois, une pour chaque direction.

Mettons un cadre autour de notre scène afin que nous puissions voir des ombres sur les murs et le plafond. Nous allons définir la propriété `side` du matériau sur `THREE.BackSide` afin de rendre l'intérieur de la boîte au lieu de l'extérieur. Comme le sol, nous ne le paramétrons pour recevoir des ombres. Nous allons également définir la position de la boîte de sorte que son fond soit légèrement en dessous du sol afin d'éviter un problème de z-fighting.

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: '#CCC',
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
```

Et bien sûr, il faut passer la lumière en `PointLight`.

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// afin que nous puissions facilement voir où se trouve la spotLight
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

Utilisez les paramètres position de dat.GUI pour déplacer la lumière et vous verrez les ombres se projeter sur tous les murs. Vous pouvez également ajuster les paramètres near et far et voir comment les autres ombres se comportent.

<!--
self shadow, shadow acne
-->

