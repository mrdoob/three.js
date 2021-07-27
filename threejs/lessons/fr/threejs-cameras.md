Title: Caméras dans Three.js
Description: Comment utiliser les Cameras dans Three.js
TOC: Cameras

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là.

Parlons des caméras dans Three.js. Nous en avons déjà parlé dans [le premier article](threejs-fundamentals.html) mais ici nous allons entrer dans le détail.

La caméra la plus courante dans Three.js et celle que nous avons utilisée jusqu'à présent, la [`PerspectiveCamera`](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera). Elle donne une vue 3D où les choses lointaines semblent plus petites que les plus proches.

La `PerspectiveCamera` définit un *frustum*. [Un frustum (tronc) est une forme pyramidale solide dont la pointe est coupée](https://fr.wikipedia.org/wiki/Tronc_(g%C3%A9om%C3%A9trie)). Par nom de solide, j'entends par exemple un cube, un cône, une sphère, un cylindre et un frustum sont tous des noms de différents types de solides.

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>cube</div></div>
  <div><div data-diagram="shapeCone"></div><div>cone</div></div>
  <div><div data-diagram="shapeSphere"></div><div>sphere</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>cylinder</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>frustum</div></div>
</div>

Je le signale seulement parce que je ne le savais pas. Et quand je voyais le mot *frustum* dans un livre mes yeux buggaient. Comprendre que c'est le nom d'un type de forme solide a rendu ces descriptions soudainement plus logiques &#128517;

Une `PerspectiveCamera` définit son frustum selon 4 propriétés. `near` définit l'endroit où commence l'avant du frustum. `far` où il finit. `fov`, le champ de vision, définit la hauteur de l'avant et de l'arrière du tronc en fonction de la propriété `near`. L'`aspect` se rapporte à la largeur de l'avant et de l'arrière du tronc. La largeur du tronc est juste la hauteur multipliée par l'aspect.

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

Utilisons la scène de [l'article précédent](threejs-lights.html) avec son plan, sa sphère et son cube, et faisons en sorte que nous puissions ajuster les paramètres de la caméra.

Pour ce faire, nous allons créer un `MinMaxGUIHelper` pour les paramètres `near` et `far` où `far`
est toujours supérieur `near`. Il aura des propriétés `min` et `max` que dat.GUI
pourra ajuster. Une fois ajustés, ils définiront les 2 propriétés que nous spécifions.

```js
class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;  // this will call the min setter
  }
}
```

Maintenant, nous pouvons configurer dat.GUI comme ça

```js
function updateCamera() {
  camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
```

Chaque fois que les paramètres de la caméra changent, il faut appeler la fonction
[`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix). Nous avons donc créé une fonction `updateCamera` transmise à dat.GUI pour l'appeler lorsque les choses changent.

{{{example url="../threejs-cameras-perspective.html" }}}

Vous pouvez ajuster les valeurs et voir comment elles fonctionnent. Notez que nous n'avons pas rendu `aspect` réglable car il est pris à partir de la taille de la fenêtre, donc si vous souhaitez ajuster l'aspect, ouvrez l'exemple dans une nouvelle fenêtre, puis redimensionnez la fenêtre.

Néanmoins, je pense que c'est un peu difficile à voir, alors modifions l'exemple pour qu'il ait 2 caméras. L'un montrera notre scène telle que nous la voyons ci-dessus, l'autre montrera une autre caméra regardant la scène que la première caméra dessine et montrant le frustum de cette caméra.

Pour ce faire, nous pouvons utiliser la fonction ciseaux de three.js. Modifions-le pour dessiner 2 scènes avec 2 caméras côte à côte en utilisant la fonction ciseaux.

Tout d'abord, utilisons du HTML et du CSS pour définir 2 éléments côte à côte. Cela nous aidera également avec les événements afin que les deux caméras puissent facilement avoir leurs propres `OrbitControls`.

```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

Et le CSS qui fera apparaître ces 2 vues côte à côte sur le canevas

```css
.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.split>div {
  width: 100%;
  height: 100%;
}
```

Ensuite, ajoutons un `CameraHelper`. Un `CameraHelper` dessine le frustum d'une `Camera`.

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

Récupérons maintenant nos 2 éléments.

```js
const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');
```

Et nous allons configurer nos `OrbitControls` pour qu'ils répondent uniquement au premier élément.

```js
-const controls = new OrbitControls(camera, canvas);
+const controls = new OrbitControls(camera, view1Elem);
```

Ajoutons une nouvelle `PerspectiveCamera` et un second `OrbitControls`.
Le deuxième `OrbitControls` est lié à la deuxième caméra et reçoit view2Elem en paramètre.

```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // fov
  2,   // aspect
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

Enfin, nous devons rendre la scène du point de vue de chaque caméra en utilisant la fonction `setScissor` pour ne rendre qu'une partie du canvas.

Voici une fonction qui, étant donné un élément, calculera le rectangle de cet élément qui chevauche le canvas. Il définira ensuite les ciseaux et la fenêtre sur ce rectangle et renverra l'aspect pour cette taille.

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // calculer un rectangle relatif au canvas
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // configurer les ciseaux pour ne rendre que cette partie du canvas
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // retourne aspect
  return width / height;
}
```

Et maintenant, nous pouvons utiliser cette fonction pour dessiner la scène deux fois dans notre fonction `render`

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // déclenche la fonction setScissorTest
+    renderer.setScissorTest(true);
+
+    // rend la vue originelle
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // adjuste la caméra pour cet aspect
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // ne pas ajouter le camera helper dans la vue originelle
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // rendu
+      renderer.render(scene, camera);
+    }
+
+    // rendu de la 2e caméra
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // adjuste la caméra
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // camera helper dans la 2e vue
+      cameraHelper.visible = true;
+
+      scene.background.set(0x000040);
+
+      renderer.render(scene, camera2);
+    }

-    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
```

Le code ci-dessus définit la couleur d'arrière-plan de la scène lors du rendu de la deuxième vue en bleu foncé juste pour faciliter la distinction des deux vues.

Nous pouvons également supprimer notre code `updateCamera` puisque nous mettons tout à jour dans la fonction `render`.

```js
-function updateCamera() {
-  camera.updateProjectionMatrix();
-}

const gui = new GUI();
-gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
+gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
-gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
+gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
```

Et maintenant, vous pouvez utiliser une vue pour voir le frustum de l'autre.

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

Sur la gauche, vous pouvez voir la vue d'origine et sur la droite, vous pouvez voir une vue montrant le frustum sur la gauche. Lorsque vous ajustez `near`, `far`, `fov` et déplacez la caméra avec la souris, vous pouvez voir que seul ce qui se trouve à l'intérieur du frustum montré à droite apparaît dans la scène à gauche.

Ajustez `near` d'environ 20 et vous verrez facilement le devant des objets disparaître car ils ne sont plus dans le tronc. Ajustez `far` en dessous de 35 et vous commencerez à voir le plan de masse disparaître car il n'est plus dans le tronc.

Cela soulève la question, pourquoi ne pas simplement définir `near` de 0,0000000001 et `far` de 100000000000000 ou quelque chose comme ça pour que vous puissiez tout voir? Parce que votre GPU n'a qu'une précision limitée pour décider si quelque chose est devant ou derrière quelque chose d'autre. Cette précision se répartit entre `near` et `far`. Pire, par défaut la précision au plus près de la caméra est précise tandis que celle la plus lointaine de la caméra est grossière. Les unités commencent par `near` et s'étendent lentement à mesure qu'elles s'approchent de `far`.

En commençant par l'exemple du haut, modifions le code pour insérer 20 sphères d'affilée.

```js
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const numSpheres = 20;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereMat = new THREE.MeshPhongMaterial();
    sphereMat.color.setHSL(i * .73, 1, 0.5);
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
    scene.add(mesh);
  }
}
```

et définissons `near` à 0.00001

```js
const fov = 45;
const aspect = 2;  // valeur par défaut
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

Nous devons également modifier un peu le code de dat.GUI pour autoriser 0,00001 si la valeur est modifiée.

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

Que pensez-vous qu'il va se passer ?

{{{example url="../threejs-cameras-z-fighting.html" }}}

Ceci est un exemple de *z fighting* où le GPU de votre ordinateur n'a pas assez de précision pour décider quels pixels sont devant et quels pixels sont derrière.

Juste au cas où le problème ne s'afficherait pas sur votre machine, voici ce que je vois sur la mienne.

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

Une solution consiste à indiquer à Three.js d'utiliser une méthode différente pour calculer quels pixels sont devant et lesquels sont derrière. Nous pouvons le faire en activant `logarithmicDepthBuffer` lorsque nous créons le [`WebGLRenderer`](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)

```js
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  logarithmicDepthBuffer: true,
+});
```

et avec ça, ça devrait marcher.

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

Si cela n'a pas résolu le problème pour vous, vous avez rencontré une raison pour laquelle vous ne pouvez pas toujours utiliser cette solution. Cette raison est due au fait que seuls certains GPU le prennent en charge. En septembre 2018, presque aucun appareil mobile ne prenait en charge cette solution, contrairement à la plupart des ordinateurs de bureau.

Une autre raison de ne pas choisir cette solution est qu'elle peut être nettement plus lente que la solution standard.

Même avec cette solution, la résolution est encore limitée. Rendez `near` encore plus petit ou `far` plus grand et vous finirez par rencontrer les mêmes problèmes.

Cela signifie que vous devez toujours faire un effort pour choisir un paramètre `near` et `far` qui correspond à votre cas d'utilisation. Placez `near` aussi loin que possible de la caméra et rien ne disparaîtra. Placez `far` aussi près que possible de la caméra et, de même, tout restera visible. Si vous essayez de dessiner une scène géante et de montrer en gros plan un visage de façon à voir ses cils, tandis qu'en arrière-plan il possible de voir les montagnes à 50 kilomètres de distance, vous devrez en trouver d'autres solutions créatives, nous-y reviendrons peut-être plus tard. Pour l'instant, sachez que vous devez prendre soin de choisir des valeurs proches et éloignées appropriées à vos besoins.

La deuxième caméra la plus courante est l'[`OrthographicCamera`](https://threejs.org/docs/#api/en/cameras/OrthographicCamera). Plutôt que de définir un frustum, il spécifie une boîte avec les paramètres `left`, `right`, `top`, `bottom`, `near` et `far`. Comme elle projette une boîte, il n'y a pas de perspective.

Changeons notre exemple précédent pour utiliser une `OrthographicCamera` dans la première vue.

D'abord, paramétrons notre `OrthographicCamera`.

```js
const left = -1;
const right = 1;
const top = 1;
const bottom = -1;
const near = 5;
const far = 50;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 0.2;
```

Définissons `left` and `bottom` à -1 et `right` et `top` à 1. On devrait obtenir une boîte de 2 unités de large et 2 unités de haut, mais nous allons ajuster `left` et `top` en fonction de l'aspect du rectangle sur lequel nous dessinons. Nous utiliserons la propriété `zoom` pour faciliter le réglage du nombre d'unités réellement affichées par la caméra.

Ajoutons un nouveau paramètre à dat.GUI pour le `zoom`.

```js
const gui = new GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

L'appel à `listen` dit à dat.GUI de surveiller les changements. Il faut faire cela parce que `OrbitControls` peut contrôler le zoom. Par exemple, la molette de défilement d'une souris zoomera via les `OrbitControls`.

Enfin, nous avons juste besoin de changer la partie qui rend le côté gauche pour mettre à jour la `OrthographicCamera`.

```js
{
  const aspect = setScissorForElement(view1Elem);

  // mettre à jour la caméra pour cet aspect
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // ne pas dessiner le camera helper dans la vue d'origine
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

et maintenant vous pouvez voir une `OrthographicCamera` au boulot.

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

Une `OrthographicCamera` est souvent utilisée pour dessiner des objets en 2D. Il faut décider du nombre d'unités que la caméra doit afficher. Par exemple, si vous voulez qu'un pixel du canvas corresponde à une unité de l'appareil photo, vous pouvez faire quelque chose comme.


Pour mettre l'origine au centre et avoir 1 pixel = 1 unité three.js quelque chose comme

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.height / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

Ou si nous voulions que l'origine soit en haut à gauche comme un canvas 2D, nous pourrions utiliser ceci

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

Dans ce cas, le coin supérieur gauche serait à 0,0 tout comme un canvas 2D.

Essayons! Commençons par installer la caméra.

```js
const left = 0;
const right = 300;  // taille par défaut
const top = 0;
const bottom = 150;  // taille par défaut
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

Chargeons ensuite 6 textures et créons 6 plans, un pour chaque texture. Nous allons associer chaque plan à un `THREE.Object3D` pour faciliter le décalage du plan afin que son centre semble être dans son coin supérieur gauche.

Pour travailler en local sur votre machine, vous aurez besoin d'une [configuration spécifique](threejs-setup.html).
Vous voudrez peut-être en savoir plus sur [l'utilisation des textures](threejs-textures.html).

```js
const loader = new THREE.TextureLoader();
const textures = [
  loader.load('resources/images/flower-1.jpg'),
  loader.load('resources/images/flower-2.jpg'),
  loader.load('resources/images/flower-3.jpg'),
  loader.load('resources/images/flower-4.jpg'),
  loader.load('resources/images/flower-5.jpg'),
  loader.load('resources/images/flower-6.jpg'),
];
const planeSize = 256;
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planes = textures.map((texture) => {
  const planePivot = new THREE.Object3D();
  scene.add(planePivot);
  texture.magFilter = THREE.NearestFilter;
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  planePivot.add(mesh);
  // déplacer le plan pour que le coin supérieur gauche soit l'origine
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

et nous devons mettre à jour la caméra si la taille de la toile change.

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes` est un tableau de `THREE.Mesh`.
Déplaçons-les en fonction du temps.

```js
function render(time) {
  time *= 0.001;  // convertir en secondes;

  ...

  const distAcross = Math.max(20, canvas.width - planeSize);
  const distDown = Math.max(20, canvas.height - planeSize);

  // distance totale à parcourir
  const xRange = distAcross * 2;
  const yRange = distDown * 2;
  const speed = 180;

  planes.forEach((plane, ndx) => {
    // calculer un temps unique pour chaque plan
    const t = time * speed + ndx * 300;

    // définir une valeur entre 0 et une plage
    const xt = t % xRange;
    const yt = t % yRange;

    // définit notre position en avant si 0 à la moitié de la plage
     // et vers l'arrière si la moitié de la plage à la plage
    const x = xt < distAcross ? xt : xRange - xt;
    const y = yt < distDown   ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

Et vous pouvez voir les images rebondir parfaitement sur les bords de la toile en utilisant les mathématiques des pixels, tout comme une toile 2D.

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

Une autre utilisation courante d'une caméra orthographique est de dessiner les vues haut, bas, gauche, droite, avant et arrière d'un programme de modélisation 3D ou d'un éditeur de moteur de jeu.

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

Dans la capture d'écran ci-dessus, vous pouvez voir que 1 vue est une vue en perspective et 3 vues sont des vues orthogonales.

C'est la base des caméras. Nous aborderons quelques façons courantes de déplacer les caméras dans d'autres articles. Pour l'instant passons aux [ombres](threejs-shadows.html).

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-cameras.js"></script>
