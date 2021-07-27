Title: Brouillard dans Three.js
Description: Brouillard dans Three.js
TOC: Brouillard

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là. Si vous n'avez pas lu l'artcile concernant [les caméras](threejs-cameras.html) lisez-le avant celui-ci.

Le brouillard dans un moteur 3D est généralement un moyen de passer à une couleur spécifique en fonction de la distance par rapport à la caméra. Dans Three.js, vous ajoutez du brouillard en créant un objet [`Fog`](https://threejs.org/docs/#api/en/scenes/Fog) ou [`FogExp2`](https://threejs.org/docs/#api/en/scenes/FogExp2) et en le définissant sur la propriété `fog de la scène.

`Fog` permet de définir les paramètres `near` et `far` en tant que distance par rapport à la caméra. Ce qui se trouve entre la caméra et `near` n'est pas affecté par le brouillard.
Ce qui est au-delà de `far` est complètement dans le brouillard. Ce qui se trouve entre les deux, est altéré par le brouillard.

Il y a aussi `FogExp2` qui croît de façon exponentielle avec la distance par rapport à la caméra.

Pour utiliser `Fog`, suivez cet exemple. 

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // white
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

ou pour `FogExp2`, celui-ci.

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2` est plus proche de la réalité mais `Fog` est plus souvent utilisé car il permet de choisir un endroit où appliquer le brouillard, ce faisant on peut choisir de montrer une scène bien clair et du brouillard qu'au-delà.

<div class="spread">
  <div>
    <div data-diagram="fog" style="height: 300px;"></div>
    <div class="code">THREE.Fog</div>
  </div>
  <div>
    <div data-diagram="fogExp2" style="height: 300px;"></div>
    <div class="code">THREE.FogExp2</div>
  </div>
</div>

Il est important de noter que le brouillard est appliqué aux choses qui sont rendues. Il fait partie du calcul de chaque pixel de la couleur de l'objet. Cela signifie que si vous voulez que votre scène s'estompe avec une certaine couleur, vous devez définir le brouillard et la couleur d'arrière-plan sur la même couleur. La couleur d'arrière-plan est définie à l'aide de la propriété [`scene.background`](Scene.background). Pour choisir une couleur d'arrière-plan, vous lui attachez une `THREE.Color`. Comme ceci :

```js
scene.background = new THREE.Color('#F00');  // red
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background red</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background blue</div>
  </div>
</div>

Voici l'un de nos exemples précédents avec du brouillard. Juste après la configuration de la scène, nous ajoutons le brouillard et définissons la couleur d'arrière-plan de la scène.

```js
const scene = new THREE.Scene();

+{
+  const near = 1;
+  const far = 2;
+  const color = 'lightblue';
+  scene.fog = new THREE.Fog(color, near, far);
+  scene.background = new THREE.Color(color);
+}
```

Dans l'exemple ci-dessous, le 'near' de la caméra est à 0,1 et le `far` à 5. La position z de la caméra est à 2. Les cubes mesurent 1 unité de large et à Z = 0. Les réglages du brouillard, `near` = 1 et `far` = 2. Ainsi, les cubes s'estompent juste autour de leur centre.

{{{example url="../threejs-fog.html" }}}

Mettons à jour notre dat.GUI pour jouer avec le brouillard.
[dat.GUI](https://github.com/dataarts/dat.gui) prend un objet et une propriété et crée automatiquement une interface de contrôle pour cette propriété. Nous pourrions simplement le laisser manipuler les propriétés `near` et `far` du brouillard, mais il est impossible que `near` soit supérieur à `far`. Assurons-nous de cela.

```js
// On utilise cette classe pour passer à dat.gui
// donc quand il manipule near ou far
// near n'est jamais > far et far n'est jamais < near
class FogGUIHelper {
  constructor(fog) {
    this.fog = fog;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
}
```

On peut l'ajouter comme ceci.

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
+
+  const fogGUIHelper = new FogGUIHelper(scene.fog);
+  gui.add(fogGUIHelper, 'near', near, far).listen();
+  gui.add(fogGUIHelper, 'far', near, far).listen();
}
```

Les paramètres `near` et `far` définissent les valeurs minimales et maximales pour ajuster le brouillard. Ils sont définis lors de la configuration de la caméra.

Le `.listen()` à la fin des 2 lignes, dit à dat.GUI *d'écouter*
les changements. Ainsi, que nous changions `near` ou `far`, dat.GUI mettra automatiquement à jour les deux propriétés pour nous.

Il peut également être agréable de pouvoir changer la couleur du brouillard, mais comme mentionné ci-dessus, nous devons synchroniser la couleur du brouillard et la couleur de l'arrière-plan. Ajoutons donc une autre propriété *virtuelle* à notre helper qui définira les deux couleurs lorsque dat.GUI la manipule.

dat.GUI peut manipuler les couleurs de 4 façons différentes. Sous la forme d'une chaîne hexadécimale à 6 chiffres (ex : `#112233`). Sous la forme HSL (ex : `{h: 60, s: 1, v: }`).
En tant que tableau RGB (ex : `[255, 128, 64]`). Ou, comme un tableau RGBA (ex : `[127, 200, 75, 0.3]`).

Il est plus simple d'utiliser la première solution, la version chaîne hexadécimale, ainsi 
dat.GUI nemanipule qu'une seule valeur. Heureusement, `THREE.Color`
a une méthode pour cela : [`getHexString`](Color.getHexString) qui permet d'obtenir une telle chaîne, il suffit juste d'ajouter un '#' au début.

```js
/// On utilise cette classe pour passer à dat.gui
// donc quand il manipule near ou far
// near n'est jamais > far et far n'est jamais < near
+// Aussi, lorsque dat.gui manipule la couleur, nous allons
+// mettre à jour les couleurs du brouillard et de l'arrière-plan.
class FogGUIHelper {
*  constructor(fog, backgroundColor) {
    this.fog = fog;
+    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
+  get color() {
+    return `#${this.fog.color.getHexString()}`;
+  }
+  set color(hexString) {
+    this.fog.color.set(hexString);
+    this.backgroundColor.set(hexString);
+  }
}
```

Ensuite, nous appelons `gui.addColor` pour ajouter une couleur à notre propriété virtuelle.

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);

*  const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
  gui.add(fogGUIHelper, 'near', near, far).listen();
  gui.add(fogGUIHelper, 'far', near, far).listen();
+  gui.addColor(fogGUIHelper, 'color');
}
```

{{{example url="../threejs-fog-gui.html" }}}

Vous pouvez voir qu'un réglage `near` à 1.9 et `far` à 2,0 donne une transition très nette entre non embué et complètement dans le brouillard. `near` = 1,1 et `far` = 2,9 devrait être la meilleure configuration étant donné que nos cubes tournent à 2 unités de la caméra.

Une dernière chose, il existe une propriété [les matériaux](Material.fog) pour savoir si les objets rendus avec ce matériau sont affectés ou non par le brouillard. La valeur par défaut est `true` pour la plupart des matériaux. Pour illustrer pourquoi vous pourriez vouloir désactiver le brouillard, imaginez que vous créez un simulateur de véhicule 3D avec une vue depuis le siège du conducteur ou le cockpit. Vous voulez probablement que le brouillard se dissipe pour tout ce qui se trouve à l'intérieur du véhicule lorsque vous regardez de l'intérieur du véhicule.

Prenons un autre exemple. Une maison avec un épais brouillard à l'extérieur. Disons que pour commencer, le brouillard est réglé pour commencer à 2 mètres (near = 2) et être complet à 4 mètres (far = 4). Les pièces et la maison faisant probablement plus de 4 mètres, il faudra donc définir les matériaux utilisés à l'intérieur de la maison pour qu'il n'y est pas de brouillard. Sinon, ça donnerait ceci.

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

Remarquez que les murs et le plafond au fond de la pièce sont dans le brouillard. En désactivant le brouillard sur les matériaux de la maison, on résoud le problème.

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-fog.js"></script>
