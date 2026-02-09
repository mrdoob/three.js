*Inheritance: EventDispatcher → Object3D →*

# HemisphereLightHelper

Creates a visual aid consisting of a spherical mesh for a given [HemisphereLight](HemisphereLight.html).

When the hemisphere light is transformed or its light properties are changed, it's necessary to call the `update()` method of the respective helper.

## Code Example

```js
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
const helper = new THREE.HemisphereLightHelper( light, 5 );
scene.add( helper );
```

## Constructor

### new HemisphereLightHelper( light : HemisphereLight, size : number, color : number | Color | string )

Constructs a new hemisphere light helper.

**light**

The light to be visualized.

**size**

The size of the mesh used to visualize the light.

Default is `1`.

**color**

The helper's color. If not set, the helper will take the color of the light.

## Properties

### .color : number | Color | string

The color parameter passed in the constructor. If not set, the helper will take the color of the light.

### .light : HemisphereLight

The light being visualized.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper to match the position and direction of the light being visualized.

## Source

[src/helpers/HemisphereLightHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/HemisphereLightHelper.js)