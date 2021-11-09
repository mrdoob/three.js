Title: Three.js VR - 3DOF Point to Select
Description: How to implement 3DOF Point to Select.
TOC: VR - Point To Select

**NOTE: The examples on this page require a VR capable
device with a pointing device. Without one they won't work. See [this article](threejs-webvr.html)
as to why**

In the [previous article](threejs-webvr-look-to-select.html) we went over
a very simple VR example where we let the user choose things by
pointing via looking. In this article we will take it one step further
and let the user choose with a pointing device 

Three.js makes is relatively easy by providing 2 controller objects in VR
and tries to handle both cases of a single 3DOF controller and two 6DOF
controllers. Each of the controllers are `Object3D` objects which give
the orientation and position of that controller. They also provide 
`selectstart`, `select` and `selectend` events when the user starts pressing,
is pressing, and stops pressing (ends) the "main" button on the controller.

Starting with the last example from [the previous article](threejs-webvr-look-to-select.html)
let's change the `PickHelper` into a `ControllerPickHelper`.

Our new implementation will emit a `select` event that gives us the object that was picked
so to use it we'll just need to do this.

```js
const pickHelper = new ControllerPickHelper(scene);
pickHelper.addEventListener('select', (event) => {
  event.selectedObject.visible = false;
  const partnerObject = meshToMeshMap.get(event.selectedObject);
  partnerObject.visible = true;
});
```

Remember from our previous code `meshToMeshMap` maps our boxes and spheres to
each other so if we have one we can look up its partner through `meshToMeshMap` 
so here we're just hiding the selected object and un-hiding its partner.

As for the actual implementation of `ControllerPickHelper`, first we need
to add the VR controller objects to the scene and to those add some 3D lines
we can use to display where the user is pointing. We save off both the controllers
and the their lines.

```js
class ControllerPickHelper {
  constructor(scene) {
    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    this.controllers = [];
    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
      scene.add(controller);

      const line = new THREE.Line(pointerGeometry);
      line.scale.z = 5;
      controller.add(line);
      this.controllers.push({controller, line});
    }
  }
}
```

Without doing anything else this alone would give us 1 or 2 lines in the scene
showing where the user's pointing devices are and which way they are pointing.

Next let's add some code to pick from the controllers. This is the first time
we've picked with something not the camera. In our [article on picking](threejs-picking.html)
the user uses the mouse or finger to pick which means picking comes from the camera
into the screen. In [the previous article](threejs-webvr-look-to-select.html) we 
were picking based on which way the user is looking so again that comes from the
camera. This time though we're picking from the position of the controllers so
we're not using the camera.

```js
class ControllerPickHelper {
  constructor(scene) {
+    this.raycaster = new THREE.Raycaster();
+    this.objectToColorMap = new Map();
+    this.controllerToObjectMap = new Map();
+    this.tempMatrix = new THREE.Matrix4();
    
    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    this.controllers = [];
    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
      scene.add(controller);

      const line = new THREE.Line(pointerGeometry);
      line.scale.z = 5;
      controller.add(line);
      this.controllers.push({controller, line});
    }
  }
+  update(scene, time) {
+    this.reset();
+    for (const {controller, line} of this.controllers) {
+      // cast a ray through the from the controller
+      this.tempMatrix.identity().extractRotation(controller.matrixWorld);
+      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
+      this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
+      // get the list of objects the ray intersected
+      const intersections = this.raycaster.intersectObjects(scene.children);
+      if (intersections.length) {
+        const intersection = intersections[0];
+        // make the line touch the object
+        line.scale.z = intersection.distance;
+        // pick the first object. It's the closest one
+        const pickedObject = intersection.object;
+        // save which object this controller picked
+        this.controllerToObjectMap.set(controller, pickedObject);
+        // highlight the object if we haven't already
+        if (this.objectToColorMap.get(pickedObject) === undefined) {
+          // save its color
+          this.objectToColorMap.set(pickedObject, pickedObject.material.emissive.getHex());
+          // set its emissive color to flashing red/yellow
+          pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFF2000 : 0xFF0000);
+        }
+      } else {
+        line.scale.z = 5;
+      }
+    }
+  }
}
```

Like before we use a `Raycaster` but this time we take the ray from the controller.
Our previous `PickHelper` there was only one thing picking but here we have up to 2
controllers, one for each hand. We save off which object each controller is
looking at in `controllerToObjectMap`. We also save off the original emissive color in
`objectToColorMap` and we make the line long enough to touch whatever it's pointing at.

We need to add some code to reset these settings every frame.

```js
class ControllerPickHelper {
  
  ...

+  _reset() {
+    // restore the colors
+    this.objectToColorMap.forEach((color, object) => {
+      object.material.emissive.setHex(color);
+    });
+    this.objectToColorMap.clear();
+    this.controllerToObjectMap.clear();
+  }
  update(scene, time) {
+    this._reset();

    ...

}
```

Next we want to emit a `select` event when the user clicks the controller.
To do that we can extend three.js's `EventDispatcher` and then we'll check
when we get a `select` event from the controller, then if that controller
is pointing at something we emit what that controller is pointing at
as our own `select` event.

```js
-class ControllerPickHelper {
+class ControllerPickHelper extends THREE.EventDispatcher {
  constructor(scene) {
+    super();
    this.raycaster = new THREE.Raycaster();
    this.objectToColorMap = new Map();  // object to save color and picked object
    this.controllerToObjectMap = new Map();
    this.tempMatrix = new THREE.Matrix4();

    const pointerGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    this.controllers = [];
    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
+      controller.addEventListener('select', (event) => {
+        const controller = event.target;
+        const selectedObject = this.controllerToObjectMap.get(controller);
+        if (selectedObject) {
+          this.dispatchEvent({type: 'select', controller, selectedObject});
+        }
+      });
      scene.add(controller);

      const line = new THREE.Line(pointerGeometry);
      line.scale.z = 5;
      controller.add(line);
      this.controllers.push({controller, line});
    }
  }
}
```

All that is left is to call `update` in our render loop

```js
function render(time) {

  ...

+  pickHelper.update(scene, time);

  renderer.render(scene, camera);
}
```

and assuming you have a VR device with a controller you should
be able to use the controllers to pick things.

{{{example url="../threejs-webvr-point-to-select.html" }}}

And what if we wanted to be able to move the objects?

That's relatively easy. Let's move our controller 'select' listener
code out into a function so we can use it for more than one thing.

```js
class ControllerPickHelper extends THREE.EventDispatcher {
  constructor(scene) {
    super();

    ...

    this.controllers = [];

+    const selectListener = (event) => {
+      const controller = event.target;
+      const selectedObject = this.controllerToObjectMap.get(event.target);
+      if (selectedObject) {
+        this.dispatchEvent({type: 'select', controller, selectedObject});
+      }
+    };

    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
-      controller.addEventListener('select', (event) => {
-        const controller = event.target;
-        const selectedObject = this.controllerToObjectMap.get(event.target);
-        if (selectedObject) {
-          this.dispatchEvent({type: 'select', controller, selectedObject});
-        }
-      });
+      controller.addEventListener('select', selectListener);

       ...
```

Then let's use it for both `selectstart` and `select`

```js
class ControllerPickHelper extends THREE.EventDispatcher {
  constructor(scene) {
    super();

    ...

    this.controllers = [];

    const selectListener = (event) => {
      const controller = event.target;
      const selectedObject = this.controllerToObjectMap.get(event.target);
      if (selectedObject) {
-        this.dispatchEvent({type: 'select', controller, selectedObject});
+        this.dispatchEvent({type: event.type, controller, selectedObject});
      }
    };

    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
      controller.addEventListener('select', selectListener);
      controller.addEventListener('selectstart', selectListener);

       ...
```

and let's also pass on the `selectend` event which three.js sends out
when you user lets of the button on the controller.

```js
class ControllerPickHelper extends THREE.EventDispatcher {
  constructor(scene) {
    super();

    ...

    this.controllers = [];

    const selectListener = (event) => {
      const controller = event.target;
      const selectedObject = this.controllerToObjectMap.get(event.target);
      if (selectedObject) {
        this.dispatchEvent({type: event.type, controller, selectedObject});
      }
    };

+    const endListener = (event) => {
+      const controller = event.target;
+      this.dispatchEvent({type: event.type, controller});
+    };
    
    for (let i = 0; i < 2; ++i) {
      const controller = renderer.xr.getController(i);
      controller.addEventListener('select', selectListener);
      controller.addEventListener('selectstart', selectListener);
+      controller.addEventListener('selectend', endListener);

       ...
```

Now let's change the code so when we get a `selectstart` event we'll
remove the selected object from the scene and make it a child of the controller.
This means it will move with the controller. When we get a `selectend`
event we'll put it back in the scene.

```js
const pickHelper = new ControllerPickHelper(scene);
-pickHelper.addEventListener('select', (event) => {
-  event.selectedObject.visible = false;
-  const partnerObject = meshToMeshMap.get(event.selectedObject);
-  partnerObject.visible = true;
-});

+const controllerToSelection = new Map();
+pickHelper.addEventListener('selectstart', (event) => {
+  const {controller, selectedObject} = event;
+  const existingSelection = controllerToSelection.get(controller);
+  if (!existingSelection) {
+    controllerToSelection.set(controller, {
+      object: selectedObject,
+      parent: selectedObject.parent,
+    });
+    controller.attach(selectedObject);
+  }
+});
+
+pickHelper.addEventListener('selectend', (event) => {
+  const {controller} = event;
+  const selection = controllerToSelection.get(controller);
+  if (selection) {
+    controllerToSelection.delete(controller);
+    selection.parent.attach(selection.object);
+  }
+});
```

When an object is selected we save off that object and its
original parent. When the user is done we can put the object back.

We use the `Object3D.attach` to re-parent
the selected objects. These functions let us change the parent
of an object without changing its orientation and position in the
scene. 

And with that we should be able to move the objects around with a 6DOF
controller or at least change their orientation with a 3DOF controller

{{{example url="../threejs-webvr-point-to-select-w-move.html" }}}

To be honest I'm not 100% sure this `ControllerPickHelper` is
the best way to organize the code but it's useful to demonstrating
the various parts of getting something simple working in VR
in three.js
