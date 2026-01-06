*Inheritance: EventDispatcher → Object3D →*

# CubeCamera

A special type of camera that is positioned in 3D space to render its surroundings into a cube render target. The render target can then be used as an environment map for rendering realtime reflections in your scene.

## Code Example

```js
// Create cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
// Create cube camera
const cubeCamera = new THREE.CubeCamera( 1, 100000, cubeRenderTarget );
scene.add( cubeCamera );
// Create car
const chromeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: cubeRenderTarget.texture } );
const car = new THREE.Mesh( carGeometry, chromeMaterial );
scene.add( car );
// Update the render target cube
car.visible = false;
cubeCamera.position.copy( car.position );
cubeCamera.update( renderer, scene );
// Render the scene
car.visible = true;
renderer.render( scene, camera );
```

## Constructor

### new CubeCamera( near : number, far : number, renderTarget : WebGLCubeRenderTarget )

Constructs a new cube camera.

**near**

The camera's near plane.

**far**

The camera's far plane.

**renderTarget**

The cube render target.

## Properties

### .activeMipmapLevel : number

The current active mipmap level

Default is `0`.

### .coordinateSystem : WebGLCoordinateSystem | WebGPUCoordinateSystem

The current active coordinate system.

Default is `null`.

### .renderTarget : WebGLCubeRenderTarget

A reference to the cube render target.

## Methods

### .update( renderer : Renderer | WebGLRenderer, scene : Scene )

Calling this method will render the given scene with the given renderer into the cube render target of the camera.

**renderer**

The renderer.

**scene**

The scene to render.

### .updateCoordinateSystem()

Must be called when the coordinate system of the cube camera is changed.

## Source

[src/cameras/CubeCamera.js](https://github.com/mrdoob/three.js/blob/master/src/cameras/CubeCamera.js)