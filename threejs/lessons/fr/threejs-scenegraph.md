Title: Graphe de scène Three.js
Description: What's a scene graph?
TOC: Scenegraph

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là.

Le coeurs de Three.js est sans aucun doute son objet scène. Une scène est une représentation arborescente des objets que l’on souhaite afficher, où chaque nœud représente un espace local.

<img src="resources/images/scenegraph-generic.svg" align="center">

C'est un peu abstrait, alors essayons de donner quelques exemples.

On pourrait prendre comme exemple le système solaire, le soleil, la terre, la lune.

<img src="resources/images/scenegraph-solarsystem.svg" align="center">

La Terre tourne autour du Soleil. La Lune tourne autour de la Terre. La Lune se déplace en cercle autour de la Terre. Du point de vue de la Lune, elle tourne dans "l'espace local" de la Terre. Même si son mouvement par rapport au Soleil est une courbe folle comme un spirographe du point de vue de la Lune, il n'a qu'à se préoccuper de tourner autour de l'espace local de la Terre.

{{{diagram url="resources/moon-orbit.html" }}}

Pour le voir autrement, vous qui vivez sur Terre n'avez pas à penser à la rotation de la Terre sur son axe ni à sa rotation autour du Soleil. Vous marchez ou conduisez ou nagez ou courez comme si la Terre ne bougeait pas ou ne tournait pas du tout. Vous marchez, conduisez, nagez, courez et vivez dans "l'espace local" de la Terre même si par rapport au soleil, vous tournez autour de la terre à environ 1 600 km/h et autour du soleil à environ 107000km/h. Votre position dans le système solaire est similaire à celle de la lune au-dessus, mais vous n'avez pas à vous en préoccuper. Vous vous souciez simplement de votre position par rapport à la terre dans son "espace local".

Allons-y une étape à la fois. Imaginez que nous voulions faire un diagramme du soleil, de la terre et de la lune. Nous allons commencer par le soleil en créant simplement une sphère et en la mettant à l'origine. Remarque : Nous utilisons le soleil, la terre et la lune comme démonstration de l'utilisation d'une scène. Bien sûr, le vrai soleil, la terre et la lune utilisent la physique, mais pour nos besoins, nous allons faire semblant.

```js
// un tableau d'objets dont la rotation à mettre à jour
const objects = [];

// utiliser une seule sphère pour tout
const radius = 1;
const widthSegments = 6;
const heightSegments = 6;
const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);  // agrandir le soleil
scene.add(sunMesh);
objects.push(sunMesh);
```

Nous utilisons une sphère à très faible polygone. Seulement 6 segments autour de son équateur. C'est ainsi qu'il est facile de voir la rotation.

Nous allons réutiliser la même sphère pour tout, nous allons juste grossir la `sunMesh` 5 fois.

Nous avons également défini la propriété `emissive` du matériau phong sur jaune. La propriété émissive d'un matériau phong est essentiellement la couleur qui sera dessinée sans que la lumière ne frappe la surface. La lumière est ajoutée à cette couleur.

Mettons également une 'point light' au centre de la scène. Nous entrerons dans les détails plus tard, mais pour l'instant, la version simple est une lumière qui émane d'un seul point.

```js
{
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);
}
```

Pour faciliter la visualisation, nous allons placer la caméra directement au-dessus de l'origine en regardant vers le bas. Le moyen le plus simple de le faire est d'utiliser la fonction `lookAt`. Cette fonction oriente la caméra pour "regarder" vers la position que nous passons à `lookAt`. Avant de faire cela, nous devons cependant indiquer à la caméra dans quelle direction le haut de la caméra est orienté ou plutôt dans quelle direction est "vers le haut" pour la caméra. Pour la plupart des situations, un Y positif est suffisant, mais puisque nous regardons vers le bas, nous devons dire à la caméra que Z positif est levé.

```js
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
```

Dans la boucle de rendu, issue des exemples précédents, nous faisons pivoter tous les objets de notre tableau `objects` avec ce code.

```js
objects.forEach((obj) => {
  obj.rotation.y = time;
});
```

Ajouter la `sunMesh` au tableau `objects`, la fait pivoter.

{{{example url="../threejs-scenegraph-sun.html" }}}

Ajoutons maintenant la terre.

```js
const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
scene.add(earthMesh);
objects.push(earthMesh);
```

Nous fabriquons un matériau bleu mais nous lui donnons une petite quantité de bleu émissif pour qu'il apparaisse sur notre fond noir.

Nous utilisons la même `sphereGeometry` avec notre nouveau `EarthMaterial` bleu pour faire une `earthMesh`. 
Nous positionnons ces 10 unités à gauche du soleil et l'ajoutons à la scène. L'ajouter à notre tableau `objects`, la met en mouvement également.

{{{example url="../threejs-scenegraph-sun-earth.html" }}}

Vous pouvez voir que le soleil et la terre tournent mais que la terre ne tourne pas autour du soleil. Faisons de la terre un enfant du soleil

```js
-scene.add(earthMesh);
+sunMesh.add(earthMesh);
```

et...

{{{example url="../threejs-scenegraph-sun-earth-orbit.html" }}}

Que s'est-il passé? Pourquoi la terre a-t-elle la même taille que le soleil et pourquoi est-elle si loin ? En fait, j'ai dû déplacer la caméra de 50 à 150 unités au-dessus pour voir la terre.

Nous avons fait de `earthMesh` un enfant du `sunMesh`. 
La `sunMesh` a son échelle définie sur 5x grâce à `sunMesh.scale.set(5, 5, 5)`. Cela signifie que l'espace local sunMeshs est 5 fois plus grand. 
Tout ce qui est mis dans cet espace sera multiplié par 5. Cela signifie que la Terre est maintenant 5 fois plus grande et sa distance par rapport au soleil (`earthMesh.position.x = 10`) est également 5 fois plus grande.

 Notre scène ressemble maintenant à celà

<img src="resources/images/scenegraph-sun-earth.svg" align="center">

Pour résoudre ce problème, ajoutons un nœud vide. Nous lions le soleil et la terre à ce nœud.

```js
+const solarSystem = new THREE.Object3D();
+scene.add(solarSystem);
+objects.push(solarSystem);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);
-scene.add(sunMesh);
+solarSystem.add(sunMesh);
objects.push(sunMesh);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
-sunMesh.add(earthMesh);
+solarSystem.add(earthMesh);
objects.push(earthMesh);
```
Ici, nous avons fait un `Object3D`. Comme une `Mesh`, c'est aussi un nœud, mais contrairement à une `Mesh`, il n'a ni matériau ni géométrie. Il ne représente qu'un espace local.

Notre nouvelle scène ressemble à ceci :

<img src="resources/images/scenegraph-sun-earth-fixed.svg" align="center">

La  `sunMesh` et la `earthMesh` sont tous les deux des enfants de `solarSystem`. Les trois sont en train de tournés, et comme `earthMesh` n'est pas un enfant de `sunMesh`, elle n'est plus mise à l'échelle.

{{{example url="../threejs-scenegraph-sun-earth-orbit-fixed.html" }}}

Encore mieux. La Terre est plus petite que le Soleil, elle tourne autour de lui et sur elle-même.

Sur le même schéma, ajoutons une Lune.

```js
+const earthOrbit = new THREE.Object3D();
+earthOrbit.position.x = 10;
+solarSystem.add(earthOrbit);
+objects.push(earthOrbit);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
-earthMesh.position.x = 10; // note that this offset is already set in its parent's THREE.Object3D object "earthOrbit"
-solarSystem.add(earthMesh);
+earthOrbit.add(earthMesh);
objects.push(earthMesh);

+const moonOrbit = new THREE.Object3D();
+moonOrbit.position.x = 2;
+earthOrbit.add(moonOrbit);

+const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
+const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
+moonMesh.scale.set(.5, .5, .5);
+moonOrbit.add(moonMesh);
+objects.push(moonMesh);
```
XXXXXXXXXXXXXXXX


Again we added more invisible scene graph nodes. The first, an `Object3D` called `earthOrbit`
and added both the `earthMesh` and the `moonOrbit` to it, also new. We then added the `moonMesh`
to the `moonOrbit`. The new scene graph looks like this.

<img src="resources/images/scenegraph-sun-earth-moon.svg" align="center">

and here's that

{{{example url="../threejs-scenegraph-sun-earth-moon.html" }}}

You can see the moon follows the spirograph pattern shown at the top
of this article but we didn't have to manually compute it. We just
setup our scene graph to do it for us.

It is often useful to draw something to visualize the nodes in the scene graph.
Three.js has some helpful ummmm, helpers to ummm, ... help with this.

One is called an `AxesHelper`. It draws 3 lines representing the local
<span style="color:red">X</span>,
<span style="color:green">Y</span>, and
<span style="color:blue">Z</span> axes. Let's add one to every node we
created.

```js
// add an AxesHelper to each node
objects.forEach((node) => {
  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  node.add(axes);
});
```

On our case we want the axes to appear even though they are inside the spheres.
To do this we set their material's `depthTest` to false which means they will
not check to see if they are drawing behind something else. We also
set their `renderOrder` to 1 (the default is 0) so that they get drawn after
all the spheres. Otherwise a sphere might draw over them and cover them up.

{{{example url="../threejs-scenegraph-sun-earth-moon-axes.html" }}}

We can see the
<span style="color:red">x (red)</span> and
<span style="color:blue">z (blue)</span> axes. Since we are looking
straight down and each of our objects is only rotating around its
y axis we don't see much of the <span style="color:green">y (green)</span> axes.

It might be hard to see some of them as there are 2 pairs of overlapping axes. Both the `sunMesh`
and the `solarSystem` are at the same position. Similarly the `earthMesh` and
`earthOrbit` are at the same position. Let's add some simple controls to allow us
to turn them on/off for each node.
While we're at it let's also add another helper called the `GridHelper`. It
makes a 2D grid on the X,Z plane. By default the grid is 10x10 units.

We're also going to use [dat.GUI](https://github.com/dataarts/dat.gui) which is
a UI library that is very popular with three.js projects. dat.GUI takes an
object and a property name on that object and based on the type of the property
automatically makes a UI to manipulate that property.

We want to make both a `GridHelper` and an `AxesHelper` for each node. We need
a label for each node so we'll get rid of the old loop and switch to calling
some function to add the helpers for each node

```js
-// add an AxesHelper to each node
-objects.forEach((node) => {
-  const axes = new THREE.AxesHelper();
-  axes.material.depthTest = false;
-  axes.renderOrder = 1;
-  node.add(axes);
-});

+function makeAxisGrid(node, label, units) {
+  const helper = new AxisGridHelper(node, units);
+  gui.add(helper, 'visible').name(label);
+}
+
+makeAxisGrid(solarSystem, 'solarSystem', 25);
+makeAxisGrid(sunMesh, 'sunMesh');
+makeAxisGrid(earthOrbit, 'earthOrbit');
+makeAxisGrid(earthMesh, 'earthMesh');
+makeAxisGrid(moonOrbit, 'moonOrbit');
+makeAxisGrid(moonMesh, 'moonMesh');
```

`makeAxisGrid` makes an `AxisGridHelper` which is a class we'll create
to make dat.GUI happy. Like it says above dat.GUI
will automagically make a UI that manipulates the named property
of some object. It will create a different UI depending on the type
of property. We want it to create a checkbox so we need to specify
a `bool` property. But, we want both the axes and the grid
to appear/disappear based on a single property so we'll make a class
that has a getter and setter for a property. That way we can let dat.GUI
think it's manipulating a single property but internally we can set
the visible property of both the `AxesHelper` and `GridHelper` for a node.

```js
// Turns both axes and grid visible on/off
// dat.GUI requires a property that returns a bool
// to decide to make a checkbox so we make a setter
// and getter for `visible` which we can tell dat.GUI
// to look at.
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;  // after the grid
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}
```

One thing to notice is we set the `renderOrder` of the `AxesHelper`
to 2 and for the `GridHelper` to 1 so that the axes get drawn after the grid.
Otherwise the grid might overwrite the axes.

{{{example url="../threejs-scenegraph-sun-earth-moon-axes-grids.html" }}}

Turn on the `solarSystem` and you'll see how the earth is exactly 10
units out from the center just like we set above. You can see how the
earth is in the *local space* of the `solarSystem`. Similarly if you
turn on the `earthOrbit` you'll see how the moon is exactly 2 units
from the center of the *local space* of the `earthOrbit`.

A few more examples of scene graphs. An automobile in a simple game world might have a scene graph like this

<img src="resources/images/scenegraph-car.svg" align="center">

If you move the car's body all the wheels will move with it. If you wanted the body
to bounce separate from the wheels you might parent the body and the wheels to a "frame" node
that represents the car's frame.

Another example is a human in a game world.

<img src="resources/images/scenegraph-human.svg" align="center">

You can see the scene graph gets pretty complex for a human. In fact
that scene graph above is simplified. For example you might extend it
to cover every finger (at least another 28 nodes) and every toe
(yet another 28 nodes) plus ones for the face and jaw, the eyes and maybe more.

Let's make one semi-complex scene graph. We'll make a tank. The tank will have
6 wheels and a turret. The tank will follow a path. There will be a sphere that
moves around and the tank will target the sphere.

Here's the scene graph. The meshes are colored in green, the `Object3D`s in blue,
the lights in gold, and the cameras in purple. One camera has not been added
to the scene graph.

<div class="threejs_center"><img src="resources/images/scenegraph-tank.svg" style="width: 800px;"></div>

Look in the code to see the setup of all of these nodes.

For the target, the thing the tank is aiming at, there is a `targetOrbit`
(`Object3D`) which just rotates similar to the `earthOrbit` above. A
`targetElevation` (`Object3D`) which is a child of the `targetOrbit` provides an
offset from the `targetOrbit` and a base elevation. Childed to that is another
`Object3D` called `targetBob` which just bobs up and down relative to the
`targetElevation`. Finally there's the `targetMesh` which is just a cube we
rotate and change its colors

```js
// move target
targetOrbit.rotation.y = time * .27;
targetBob.position.y = Math.sin(time * 2) * 4;
targetMesh.rotation.x = time * 7;
targetMesh.rotation.y = time * 13;
targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
targetMaterial.color.setHSL(time * 10 % 1, 1, .25);
```

For the tank there's an `Object3D` called `tank` which is used to move everything
below it around. The code uses a `SplineCurve` which it can ask for positions
along that curve. 0.0 is the start of the curve. 1.0 is the end of the curve. It
asks for the current position where it puts the tank. It then asks for a
position slightly further down the curve and uses that to point the tank in that
direction using `Object3D.lookAt`.

```js
const tankPosition = new THREE.Vector2();
const tankTarget = new THREE.Vector2();

...

// move tank
const tankTime = time * .05;
curve.getPointAt(tankTime % 1, tankPosition);
curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
tank.position.set(tankPosition.x, 0, tankPosition.y);
tank.lookAt(tankTarget.x, 0, tankTarget.y);
```

The turret on top of the tank is moved automatically by being a child
of the tank. To point it at the target we just ask for the target's world position
and then again use `Object3D.lookAt`

```js
const targetPosition = new THREE.Vector3();

...

// face turret at target
targetMesh.getWorldPosition(targetPosition);
turretPivot.lookAt(targetPosition);
```

There's a `turretCamera` which is a child of the `turretMesh` so
it will move up and down and rotate with the turret. We make that
aim at the target.

```js
// make the turretCamera look at target
turretCamera.lookAt(targetPosition);
```

There is also a `targetCameraPivot` which is a child of `targetBob` so it floats
around with the target. We aim that back at the tank. Its purpose is to allow the
`targetCamera` to be offset from the target itself. If we instead made the camera
a child of `targetBob` and just aimed the camera itself it would be inside the
target.

```js
// make the targetCameraPivot look at the tank
tank.getWorldPosition(targetPosition);
targetCameraPivot.lookAt(targetPosition);
```

Finally we rotate all the wheels

```js
wheelMeshes.forEach((obj) => {
  obj.rotation.x = time * 3;
});
```

For the cameras we setup an array of all 4 cameras at init time with descriptions.

```js
const cameras = [
  { cam: camera, desc: 'detached camera', },
  { cam: turretCamera, desc: 'on turret looking at target', },
  { cam: targetCamera, desc: 'near target looking at tank', },
  { cam: tankCamera, desc: 'above back of tank', },
];

const infoElem = document.querySelector('#info');
```

and cycle through our cameras at render time.

```js
const camera = cameras[time * .25 % cameras.length | 0];
infoElem.textContent = camera.desc;
```

{{{example url="../threejs-scenegraph-tank.html"}}}

I hope this gives some idea of how scene graphs work and how you might use them.
Making `Object3D` nodes and parenting things to them is an important step to using
a 3D engine like three.js well. Often it might seem like some complex math is necessary
to make something move and rotate the way you want. For example without a scene graph
computing the motion of the moon or where to put the wheels of the car relative to its
body would be very complicated but using a scene graph it becomes much easier.

[Next up we'll go over materials](threejs-materials.html).
