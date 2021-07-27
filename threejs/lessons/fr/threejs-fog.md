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

The `near` and `far` parameters set the minimum and maximum values
for adjusting the fog. They are set when we setup the camera.

The `.listen()` at the end of the last 2 lines tells dat.GUI to *listen*
for changes. That way when we change `near` because of an edit to `far`
or we change `far` in response to an edit to `near` dat.GUI will update
the other property's UI for us.

It might also be nice to be able to change the fog color but like was
mentioned above we need to keep both the fog color and the background
color in sync. So, let's add another *virtual* property to our helper
that will set both colors when dat.GUI manipulates it.

dat.GUI can manipulate colors in 4 ways, as a CSS 6 digit hex string (eg: `#112233`). As an hue, saturation, value, object (eg: `{h: 60, s: 1, v: }`).
As an RGB array (eg: `[255, 128, 64]`). Or, as an RGBA array (eg: `[127, 200, 75, 0.3]`).

It's easiest for our purpose to use the hex string version since that way
dat.GUI is only manipulating a single value. Fortunately `THREE.Color`
as a [`getHexString`](Color.getHexString) method
we get use to easily get such a string, we just have to prepend a '#' to the front.

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
+// Also when dat.gui manipulates color we'll
+// update both the fog and background colors.
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

We then call `gui.addColor` to add a color UI for our helper's virtual property.

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

You can see setting `near` to like 1.9 and `far` to 2.0 gives
a very sharp transition between un-fogged and completely fogged.
where as `near` = 1.1 and `far` = 2.9 should just about be
the smoothest given our cubes are spinning 2 units away from the camera.

One last thing, there is a boolean [`fog`](Material.fog)
property on a material for whether or not objects rendered
with that material are affected by fog. It defaults to `true`
for most materials. As an example of why you might want
to turn the fog off, imagine you're making a 3D vehicle
simulator with a view from the driver's seat or cockpit.
You probably want the fog off for everything inside the vehicle when
viewing from inside the vehicle.

A better example might be a house
and thick fog outside house. Let's say the fog is set to start
2 meters away (near = 2) and completely fogged out at 4 meters (far = 4).
Rooms are longer than 2 meters and the house is probably longer
than 4 meters so you need to set the materials for the inside
of the house to not apply fog otherwise when standing inside the
house looking outside the wall at the far end of the room will look
like it's in the fog.

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

Notice the walls and ceiling at the far end of the room are getting fog applied.
By turning fog off on the materials for the house we can fix that issue.

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-fog.js"></script>
