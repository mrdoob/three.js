# OutlineEffect

An outline effect for toon shaders.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [ToonOutlinePassNode](ToonOutlinePassNode.html).

## Code Example

```js
const effect = new OutlineEffect( renderer );
function render() {
	effect.render( scene, camera );
}
```

## Import

OutlineEffect is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
```

## Constructor

### new OutlineEffect( renderer : WebGLRenderer, parameters : OutlineEffect~Options )

Constructs a new outline effect.

**renderer**

The renderer.

**parameters**

The configuration parameter.

## Methods

### .render( scene : Object3D, camera : Camera )

When using this effect, this method should be called instead of the default [WebGLRenderer#render](WebGLRenderer.html#render).

**scene**

The scene to render.

**camera**

The camera.

### .renderOutline( scene : Object3D, camera : Camera )

This method can be used to render outlines in VR.

```js
const effect = new OutlineEffect( renderer );
let renderingOutline = false;
scene.onAfterRender = function () {
	if ( renderingOutline ) return;
	renderingOutline = true;
	effect.renderOutline( scene, camera );
	renderingOutline = false;
};
function render() {
	renderer.render( scene, camera );
}
```

**scene**

The scene to render.

**camera**

The camera.

### .setSize( width : number, height : number )

Resizes the effect.

**width**

The width of the effect in logical pixels.

**height**

The height of the effect in logical pixels.

## Type Definitions

### .Options

This type represents configuration settings of `OutlineEffect`.

**defaultThickness**  
number

The outline thickness.

Default is `0.003`.

**defaultColor**  
Array.<number>

The outline color.

Default is `[0,0,0]`.

**defaultAlpha**  
number

The outline alpha value.

Default is `1`.

**defaultKeepAlive**  
boolean

Whether to keep alive cached internal materials or not.

Default is `false`.

## Source

[examples/jsm/effects/OutlineEffect.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/effects/OutlineEffect.js)