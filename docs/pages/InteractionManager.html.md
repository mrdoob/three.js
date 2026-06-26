# InteractionManager

Manages interaction for 3D objects independently of the scene graph.

For objects with an [HTMLTexture](HTMLTexture.html), the manager computes CSS `matrix3d` transforms each frame so the underlying HTML elements stay aligned with their meshes. Because the elements are children of the canvas, the browser dispatches pointer events to them natively.

## Code Example

```js
const interactions = new InteractionManager();
interactions.connect( renderer, camera );
// Objects live anywhere in the scene graph
scene.add( mesh );
// Register for interaction separately
interactions.add( mesh );
// In the animation loop
interactions.update();
```

## Import

InteractionManager is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { InteractionManager } from 'three/addons/interaction/InteractionManager.js';
```

## Constructor

### new InteractionManager()

## Properties

### .camera : Camera

The camera used for computing the element transforms.

Default is `null`.

### .element : HTMLCanvasElement

The canvas element.

Default is `null`.

### .objects : Array.<Object3D>

The registered interactive objects.

## Methods

### .add( …objects : Object3D ) : this

Adds one or more objects to the manager.

**objects**

The objects to add.

### .connect( renderer : WebGPURenderer | WebGLRenderer, camera : Camera )

Stores the renderer and camera needed for computing element transforms.

**renderer**

The renderer.

**camera**

The camera.

### .disconnect()

Disconnects this manager, clearing the renderer and camera references.

### .remove( …objects : Object3D ) : this

Removes one or more objects from the manager.

**objects**

The objects to remove.

### .update()

Updates the element transforms for all registered objects. Call this once per frame in the animation loop.

## Source

[examples/jsm/interaction/InteractionManager.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/interaction/InteractionManager.js)