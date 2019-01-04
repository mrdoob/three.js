Title: Three.js Loading a .GLTF File
Description: Loading a .GLTF File

In a previous lesson we [loaded an .OBJ file](threejs-load-obj.html). If
you haven't read it you might want to check it out first.

As pointed out over there the .OBJ file format is very old and fairly
simple. It provides no scene graph so everything loaded is one large
mesh. It was designed mostly as a simple way to pass data between
3D editors.

[The gLTF format](https://github.com/KhronosGroup/glTF) is actually
a format designed from the ground up for be used for displaying
graphics. 3D formats can be divided into 3 or 4 basic types.

* 3D Editor Formats

  This are formats specific to a single app. .blend (Blender), .max (3d Studio Max),
  .mb and .ma (Maya), etc...

* Exchange formats

  These are formats like .OBJ, .DAE (Collada), .FBX. They are designed to help exchange
  information between 3D editors. As such they are usually much larger than needed with
  extra info used only inside 3d editors

* App formats

  These are usually specific to certain apps, usually games.

* Transmission formats

  gLTF might be the first truely transmission format. I suppose VRML might be considered
  one but VRML was actually a pretty poor format.

  gLTF is designed to do 3 things well that all those other formats don't do

  1. Be small for transmission

     For example this means much of their large data, like vertices, is stored in
     binary. When you download a .gLTF file that data can be uploaded to the GPU
     with zero processing. It's ready as is. This is in contrast to say VRML, .OBJ,
     or .DAE where vertices are stored as text and have to be parsed.

  2. Be ready to render

     This again is different from other formats except maybe App formats. The data
     in a glTF file is mean to be rendered, not edited. Data that's not important to
     rendering has generally been removed. Polygons have been convered to triangles.
     Materials have known values that are supposed to work everywhere.

gLTF was specifically designed so you should be able to download a glTF file and
display it with a minimum of trouble. Let's cross our fingers that's truely the case
as none of the other formats have been able to do this.

I wasn't really sure what I should show. At some level loading and displaying a gLTF file
is simpler than an .OBJ file. Unlike a .OBJ file materials are directly part of the format.
That said I thought I should at least load one up and I think going over the issues I ran 
into might provide some good info.

Searching the net I found [this low-poly city](https://sketchfab.com/models/edd1c604e1e045a0a2a552ddd9a293e6)
by [antonmoek](https://sketchfab.com/antonmoek) which seemed like if we're lucky
might make a good example.

<div class="threejs_center"><img src="resources/images/cartoon_lowpoly_small_city_free_pack.jpg"></div>

Starting with [an example from the .OBJ article](threejs-load-obj.html) I removed the code
for loading .OBJ and replaced it with code for loading .GLTF

The old .OBJ code was

```js
const objLoader = new THREE.OBJLoader2();
objLoader.loadMtl('resources/models/windmill/windmill-fixed.mtl', null, (materials) => {
  materials.Material.side = THREE.DoubleSide;
  objLoader.setMaterials(materials);
  objLoader.load('resources/models/windmill/windmill.obj', (event) => {
    const root = event.detail.loaderRootNode;
    scene.add(root);
    ...
  });
});
```

The new .GLTF code is

```js
{
  const gltfLoader = new THREE.GLTFLoader();
  const url = 'resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf';
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    ...
  });
```

I kept the auto framing code as before

We also need to include the `GLTFLoader` and we can get rid of the `OBJLoader2`.

```html
-<script src="resources/threejs/r98/js/loaders/LoaderSupport.js"></script>
-<script src="resources/threejs/r98/js/loaders/OBJLoader2.js"></script>
-<script src="resources/threejs/r98/js/loaders/MTLLoader.js"></script>
+<script src="resources/threejs/r98/js/loaders/GLTFLoader.js"></script>
```

And running that we get

{{{example url="../threejs-load-gltf.html" }}}

Magic! It just works, textures and all.

Next I wanted to see if I could animate the cars driving around so
I needed to check if the scene had the cars as separate entities
and if they were setup in a way I could use them.

I wrote some code to dump put the scenegraph to the JavaScript
console.

Here's the code to print out the scenegraph.

```js
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
```

And I just called it right after loading the scene.

```js
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
  const root = gltf.scene;
  scene.add(root);
  console.log(dumpObject(root).join('\n'));
```

[Running that](.../threejs-load-gltf-dump-scenegraph.html) I got this listing

```text
OSG_Scene [Scene]
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    └─RootNode_(model_correction_matrix) [Object3D]
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        └─RootNode [Object3D]
          │ ...
          ├─Cars [Object3D]
          │ ├─CAR_03_1 [Object3D]
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ ├─CAR_03 [Object3D]
          │ │ └─CAR_03_World_ap_0 [Mesh]
          │ ├─Car_04 [Object3D]
          │ │ └─Car_04_World_ap_0 [Mesh]
          │ ├─CAR_03_2 [Object3D]
          │ │ └─CAR_03_2_World_ap_0 [Mesh]
          │ ├─Car_04_1 [Object3D]
          │ │ └─Car_04_1_World_ap_0 [Mesh]
          │ ├─Car_04_2 [Object3D]
          │ │ └─Car_04_2_World_ap_0 [Mesh]
          │ ├─Car_04_3 [Object3D]
          │ │ └─Car_04_3_World_ap_0 [Mesh]
          │ ├─Car_04_4 [Object3D]
          │ │ └─Car_04_4_World_ap_0 [Mesh]
          │ ├─Car_08_4 [Object3D]
          │ │ └─Car_08_4_World_ap8_0 [Mesh]
          │ ├─Car_08_3 [Object3D]
          │ │ └─Car_08_3_World_ap9_0 [Mesh]
          │ ├─Car_04_1_2 [Object3D]
          │ │ └─Car_04_1_2_World_ap_0 [Mesh]
          │ ├─Car_08_2 [Object3D]
          │ │ └─Car_08_2_World_ap11_0 [Mesh]
          │ ├─CAR_03_1_2 [Object3D]
          │ │ └─CAR_03_1_2_World_ap_0 [Mesh]
          │ ├─CAR_03_2_2 [Object3D]
          │ │ └─CAR_03_2_2_World_ap_0 [Mesh]
          │ ├─Car_04_2_2 [Object3D]
          │ │ └─Car_04_2_2_World_ap_0 [Mesh]
          ...
```

From that we can see all the cars happen to be under parent
called `"Cars"`

```text
*          ├─Cars [Object3D]
          │ ├─CAR_03_1 [Object3D]
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ ├─CAR_03 [Object3D]
          │ │ └─CAR_03_World_ap_0 [Mesh]
          │ ├─Car_04 [Object3D]
          │ │ └─Car_04_World_ap_0 [Mesh]
```

So as a simple test I thought I would just try rotating
all the children of the "Cars" node around their Y axis

I looked up the "Cars" node after loading the scene
and saved the result.

```js
+let cars;
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);
+    cars = root.getObjectByName('Cars');
```

Then in the `render` function we can just set the rotation
of each child of `cars`

```js
+function render(time) {
+  time *= 0.001;  // convert to seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  if (cars) {
+    for (const car of cars.children) {
+      car.rotation.y = time;
+    }
+  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

And we get

{{{example url="../threejs-load-gltf-rotate-cars.html" }}}

Hmmm, it looks like unfortunately this scene wasn't designed to
animate the cars as their origins are not setup for that purpose. The trucks are rotating in the wrong direction.

This brings up an important point which is if you're going to
do something in 3D you need to plan ahead and design your assets
so they have their origins in the correct places, so they are
the correct scale, etc.

Since I'm not an artist and I don't know blender that well I
will hack this example. We'll take each car and parent it to
another `Object3D`. We will then move those `Object3D` objects
to move the cars but separately we can set the car's `Object3D`
to re-orient it so it's about where we really need it.

Looking back at the scene graph listing it looks like there
are really only 3 types of cars, "Car_08", "CAR_03", and "Car_04".
Each type of car will work with the same adjustments.

I wrote this code to go through each car, parent it to a new `Object3D`, parent that new `Object3D` to the scene, and apply some per car *type* settings to fix its orientation, and add
the new `Object3D` a `cars` array.

```js
-let cars;
+const cars = [];
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);

-    cars = root.getObjectByName('Cars');
+    const loadedCars = root.getObjectByName('Cars');
+    const fixes = [
+      { prefix: 'Car_08', rot: [Math.PI * .5, 0, Math.PI +* .5], },
+      { prefix: 'CAR_03', rot: [0, Math.PI, 0], },
+      { prefix: 'Car_04', rot: [0, Math.PI, 0], },
+    ];
+
+     root.updateMatrixWorld();
+    for (const car of loadedCars.children.slice()) {
+      const fix = fixes.find(fix => car.name.startsWith+(fix.prefix));
+      const obj = new THREE.Object3D();
+      car.getWorldPosition(obj.position);
+      car.position.set(0, 0, 0);
+      car.rotation.set(...fix.rot);
+      obj.add(car);
+      scene.add(obj);
+      cars.push(obj);
+    }
     ...
```

This fixes the orientation of the cars. 

{{{example url="../threejs-load-gltf-rotate-cars-fixed.html" }}}

Now let's drive them around

Making even a simple driving system is too much for this post but
it seems instead we could just make one convoluted path that
drives down all the roads and then put the cars on the path.
Here's a picture from Blender about half way through building
the path.

<div class="threejs_center"><img src="resources/images/making-path-for-cars.jpg" style="width: 1094px"></div>

I needed as way to get the data for that path out of Blender.
Fortunately I was able to select just my path and export .OBJ checking "write nurbs".

<div class="threejs_center"><img src="resources/images/blender-export-obj-write-nurbs.jpg" style="width: 498px"></div>

Opening the .OBJ file I was able to get a list of points
which I formated into this

```js
const controlPoints = [
  [1.118281, 5.115846, -3.681386],
  [3.948875, 5.115846, -3.641834],
  [3.960072, 5.115846, -0.240352],
  [3.985447, 5.115846, 4.585005],
  [-3.793631, 5.115846, 4.585006],
  [-3.826839, 5.115846, -14.736200],
  [-14.542292, 5.115846, -14.765865],
  [-14.520929, 5.115846, -3.627002],
  [-5.452815, 5.115846, -3.634418],
  [-5.467251, 5.115846, 4.549161],
  [-13.266233, 5.115846, 4.567083],
  [-13.250067, 5.115846, -13.499271],
  [4.081842, 5.115846, -13.435463],
  [4.125436, 5.115846, -5.334928],
  [-14.521364, 5.115846, -5.239871],
  [-14.510466, 5.115846, 5.486727],
  [5.745666, 5.115846, 5.510492],
  [5.787942, 5.115846, -14.728308],
  [-5.423720, 5.115846, -14.761919],
  [-5.373599, 5.115846, -3.704133],
  [1.004861, 5.115846, -3.641834],
];
```

THREE.js has some curve classes. The `CatmullRomCurve3` seemed
like it might work. The thing about that kind of curve is
it tries to make a smooth curve going through the points.

In fact putting those points in directly will generate
a curve like this

<div class="threejs_center"><img src="resources/images/car-curves-before.png" style="width: 400px"></div>

but we want a sharper corners. It seemed like if we computed
some extra points we could get what we want. For each pair
of points we'll compute a point 10% of the way between
the 2 points and another 90% of the way between the 2 points
and pass the result to `CatmullRomCurve3`

This will give us a curve like this

<div class="threejs_center"><img src="resources/images/car-curves-after.png" style="width: 400px"></div>

Here's the code to make the curve 

```js
let curve;
let curveObject;
{
  const controlPoints = [
    [1.118281, 5.115846, -3.681386],
    [3.948875, 5.115846, -3.641834],
    [3.960072, 5.115846, -0.240352],
    [3.985447, 5.115846, 4.585005],
    [-3.793631, 5.115846, 4.585006],
    [-3.826839, 5.115846, -14.736200],
    [-14.542292, 5.115846, -14.765865],
    [-14.520929, 5.115846, -3.627002],
    [-5.452815, 5.115846, -3.634418],
    [-5.467251, 5.115846, 4.549161],
    [-13.266233, 5.115846, 4.567083],
    [-13.250067, 5.115846, -13.499271],
    [4.081842, 5.115846, -13.435463],
    [4.125436, 5.115846, -5.334928],
    [-14.521364, 5.115846, -5.239871],
    [-14.510466, 5.115846, 5.486727],
    [5.745666, 5.115846, 5.510492],
    [5.787942, 5.115846, -14.728308],
    [-5.423720, 5.115846, -14.761919],
    [-5.373599, 5.115846, -3.704133],
    [1.004861, 5.115846, -3.641834],
  ];
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  curve = new THREE.CatmullRomCurve3(
    controlPoints.map((p, ndx) => {
      p0.set(...p);
      p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);
      return [
        (new THREE.Vector3()).copy(p0),
        (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
        (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
      ];
    }).flat(),
    true,
  );
  {
    const points = curve.getPoints(250);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: 0xff0000});
    curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
  }
}
```

The first part of that code makes a curve.
The second part of that code generaetes 250 points
from the curve and then creates an object to display
the lines made by connecting those 250 points.

Running [the example](../threejs-load-gltf-car-path.html) I didn't see the curve. To make it
visible made it ignore the depth test and render last

```js
    curveObject = new THREE.Line(geometry, material);
+    material.depthTest = false;
+    curveObject.renderOrder = 1;
```

And that's when I discovered it was way too small.

<div class="threejs_center"><img src="resources/images/car-curves-too-small.png" style="width: 498px"></div>

Checking the heirarchy in Blender I found out that the artist had
scaled the node all the cars are parented to.

<div class="threejs_center"><img src="resources/images/cars-scale-0.01.png" style="width: 342px;"></div>

Scaling is bad for real time 3D apps. It causes all kinds of
issues and ends up being no end of frustrating when doing
real time 3D. Artists often don't know this because it's so
easy to scale an entire scene in a 3D editing program but if you decide to make a real time 3D app I suggest you instructor your
artists to never scale anything. If they change the scale
they should find a way to apply that scale to the vertices
so that when it ends up making it your app you can ignore
scale.

And not just scale, in this case the cars are rotated and offset
by their parent, the `Cars` node. This will make it hard at runtime
to move the cars around in world space. To be clear, in this case
we want cars to drive around in world space which is why these
issues are coming up. If something that is meant to be manipulated
in a local space, the the moon revolving around the earth this
is less of an issue.

Going back to the function we wrote above to dump the scene graph,
let's dump the position, rotation, and scale of each node.

```js
+function dumpVec3(v3, precision = 3) {
+  return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
+}

function dumpObject(obj, lines, isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
+  const dataPrefix = obj.children.length
+     ? (isLast ? '  │ ' : '│ │ ')
+     : (isLast ? '    ' : '│   ');
+  lines.push(`${prefix}${dataPrefix}  pos: ${dumpVec3(obj.position)}`);
+  lines.push(`${prefix}${dataPrefix}  rot: ${dumpVec3(obj.rotation)}`);
+  lines.push(`${prefix}${dataPrefix}  scl: ${dumpVec3(obj.scale)}`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
```

And the result from [running it](.../threejs-load-gltf-dump-scenegraph-extra.html)

```text
OSG_Scene [Scene]
  │   pos: 0.000, 0.000, 0.000
  │   rot: 0.000, 0.000, 0.000
  │   scl: 1.000, 1.000, 1.000
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    │   pos: 0.000, 0.000, 0.000
    │   rot: -1.571, 0.000, 0.000
    │   scl: 1.000, 1.000, 1.000
    └─RootNode_(model_correction_matrix) [Object3D]
      │   pos: 0.000, 0.000, 0.000
      │   rot: 0.000, 0.000, 0.000
      │   scl: 1.000, 1.000, 1.000
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        │   pos: 0.000, 0.000, 0.000
        │   rot: 1.571, 0.000, 0.000
        │   scl: 1.000, 1.000, 1.000
        └─RootNode [Object3D]
          │   pos: 0.000, 0.000, 0.000
          │   rot: 0.000, 0.000, 0.000
          │   scl: 1.000, 1.000, 1.000
          ├─Cars [Object3D]
*          │ │   pos: -369.069, -90.704, -920.159
*          │ │   rot: 0.000, 0.000, 0.000
*          │ │   scl: 1.000, 1.000, 1.000
          │ ├─CAR_03_1 [Object3D]
          │ │ │   pos: 22.131, 14.663, -475.071
          │ │ │   rot: -3.142, 0.732, 3.142
          │ │ │   scl: 1.500, 1.500, 1.500
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ │       pos: 0.000, 0.000, 0.000
          │ │       rot: 0.000, 0.000, 0.000
          │ │       scl: 1.000, 1.000, 1.000
```

This shows us that `Cars` in the original scene has had its rotation and scale removed and applied to its children. That suggests either whatever exporter was used to create the .GLTF file did some special work here
or more likely the artist exported a different version of the file than the corresponding .blend file, which is why things don't match.

The moral of that is I should have probably downloaded the .blend
file and exported myself. Before exporting I should have inspected
all the major nodes and removed any transformations.

All these nodes at the top

```text
OSG_Scene [Scene]
  │   pos: 0.000, 0.000, 0.000
  │   rot: 0.000, 0.000, 0.000
  │   scl: 1.000, 1.000, 1.000
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    │   pos: 0.000, 0.000, 0.000
    │   rot: -1.571, 0.000, 0.000
    │   scl: 1.000, 1.000, 1.000
    └─RootNode_(model_correction_matrix) [Object3D]
      │   pos: 0.000, 0.000, 0.000
      │   rot: 0.000, 0.000, 0.000
      │   scl: 1.000, 1.000, 1.000
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        │   pos: 0.000, 0.000, 0.000
        │   rot: 1.571, 0.000, 0.000
        │   scl: 1.000, 1.000, 1.000
```

are also a waste.

Ideally the scene would consist of a single
"root" node with no position, rotation, or scale. A runtime I could then
pull all the children out of that root and parent them to the scene itself.
There might be children of the root like "Cars" which would
help me find all the cars but ideally it would also have no
translation, rotation, or scale so I could reparent the cars
to the scene with the minimal amount of work.

In any case the quickest though maybe not the best fix is to just
adjust the object we're using to view the curve.

Here's what I ended up with.

First I adjusted the position of the curve and after I found values
that seemd to work. I then hid it.

```js
{
  const points = curve.getPoints(250);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({color: 0xff0000});
  curveObject = new THREE.Line(geometry, material);
+  curveObject.scale.set(100, 100, 100);
+  curveObject.position.y = -621;
+  curveObject.visible = false;
  material.depthTest = false;
  curveObject.renderOrder = 1;
  scene.add(curveObject);
}
```

Then I wrote code to move the cars along the curve. For each car we pick
a position from 0 to 1 along the curve and compute a point in world space
using the `curveObject` to transform the point. We then pick another point
slightly further down the curve. We set the car's orientation using `lookAt` and put the car at the mid point between the 2 points.

```js
// create 2 Vector3s we can use for path calculations
const carPosition = new THREE.Vector3();
const carTarget = new THREE.Vector3();

function render(time) {
  ...

-  for (const car of cars) {
-    car.rotation.y = time;
-  }

+  {
+    const pathTime = time * .01;
+    const targetOffset = 0.01;
+    cars.forEach((car, ndx) => {
+      // a number between 0 and 1 to evenly space the cars
+      const u = pathTime + ndx / cars.length;
+
+      // get the first point
+      curve.getPointAt(u % 1, carPosition);
+      carPosition.applyMatrix4(curveObject.matrixWorld);
+
+      // get a second point slightly further down the curve
+      curve.getPointAt((u + targetOffset) % 1, carTarget);
+      carTarget.applyMatrix4(curveObject.matrixWorld);
+
+      // put the car at the first point (temporarily)
+      car.position.copy(carPosition);
+      // point the car the second point
+      car.lookAt(carTarget);
+
+      // put the car between the 2 points
+      car.position.lerpVectors(carPosition, carTarget, 0.5);
+    });
+  }
```

and when I ran it I found out for each type of car, their height above their origins
are not consistently set and so I needed to offset each one
a little.

```js
const loadedCars = root.getObjectByName('Cars');
const fixes = [
-  { prefix: 'Car_08', rot: [Math.PI * .5, 0, Math.PI * .5], },
-  { prefix: 'CAR_03', rot: [0, Math.PI, 0], },
-  { prefix: 'Car_04', rot: [0, Math.PI, 0], },
+  { prefix: 'Car_08', y: 0,  rot: [Math.PI * .5, 0, Math.PI * .5], },
+  { prefix: 'CAR_03', y: 33, rot: [0, Math.PI, 0], },
+  { prefix: 'Car_04', y: 40, rot: [0, Math.PI, 0], },
];

root.updateMatrixWorld();
for (const car of loadedCars.children.slice()) {
  const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
  const obj = new THREE.Object3D();
  car.getWorldPosition(obj.position);
-  car.position.set(0, 0, 0);
+  car.position.set(0, fix.y, 0);
  car.rotation.set(...fix.rot);
  obj.add(car);
  scene.add(obj);
  cars.push(obj);
}
```

And the result.

{{{example url="../threejs-load-gltf-animated-cars.html" }}}

Not bad for a few minutes work.

The last thing I wanted to do is turn on shadows.

To do this I grabbed all the GUI code from the `DirectionalLight` shadows
example in [the article on shadows](threejs-shadows.html) and pasted it
into our latest code.

Then, after loading, we need to turn on shadows on all the objects.

```js
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);

+    root.traverse((obj) => {
+      if (obj.castShadow !== undefined) {
+        obj.castShadow = true;
+        obj.receiveShadow = true;
+      }
+    });
```

I then spent nearly 4 hours trying to figure out why the shadow helpers
were not working. It was because I forgot to enable shadows with

```js
renderer.shadowMap.enabled = true;
```

😭

I then adjusted the values until our `DirectionLight`'s shadow camera
had a frustum that covered the entire scene. These are the settings
I ended up with.

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
+  light.castShadow = true;
*  light.position.set(-250, 800, -850);
*  light.target.position.set(-550, 40, -450);

+  light.shadow.bias = -0.004;
+  light.shadow.mapSize.width = 2048;
+  light.shadow.mapSize.height = 2048;

  scene.add(light);
  scene.add(light.target);
+  const cam = light.shadow.camera;
+  cam.near = 1;
+  cam.far = 2000;
+  cam.left = -1500;
+  cam.right = 1500;
+  cam.top = 1500;
+  cam.bottom = -1500;
...
```

and I set the background color to light blue.

```js
const scene = new THREE.Scene();
-scene.background = new THREE.Color('black');
+scene.background = new THREE.Color('#DEFEFF');
```

And ... shadows

{{{example url="../threejs-load-gltf-shadows.html" }}}

I hope walking through that example was useful and showed some
good examples of working though some of the issues of loading
a file with a scenegraph.

One interesting thing is that comparing the .blend file to the .gltf
file, the .blend file has several lights but they are not lights
after being loaded into the scene. A .GLTF file is just a JSON
file so you can easily look inside. It consists of several
arrays of things and each item in an array is referenced by index
else where. While there are extensions in the works they point
to a problem with almost all 3d formats. **They can never cover every
case**.

There is always a need for more data. For example we manually exported
a path for the cars to follow. Ideally that info could have been in
the .GLTF file but to do that we'd need to write our own exporter
and some how mark nodes for how we want them exported or use a
naming scheme or someting along those lines to get data from
whatever tool we're using to create the data into our app.

All of that is left as an exercise to the reader.

