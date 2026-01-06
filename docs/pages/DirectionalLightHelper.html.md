*Inheritance: EventDispatcher → Object3D →*

# DirectionalLightHelper

Helper object to assist with visualizing a [DirectionalLight](DirectionalLight.html)'s effect on the scene. This consists of plane and a line representing the light's position and direction.

## Code Example

```js
const light = new THREE.DirectionalLight( 0xFFFFFF );
scene.add( light );
const helper = new THREE.DirectionalLightHelper( light, 5 );
scene.add( helper );
```

## Constructor

### new DirectionalLightHelper( light : DirectionalLight, size : number, color : number | Color | string )

Constructs a new directional light helper.

**light**

The light to be visualized.

**size**

The dimensions of the plane.

Default is `1`.

**color**

The helper's color. If not set, the helper will take the color of the light.

## Properties

### .color : number | Color | string

The color parameter passed in the constructor. If not set, the helper will take the color of the light.

### .light : DirectionalLight

The light being visualized.

### .lightPlane : Line

Contains the line showing the location of the directional light.

### .targetLine : Line

Represents the target line of the directional light.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper to match the position and direction of the light being visualized.

## Source

[src/helpers/DirectionalLightHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/DirectionalLightHelper.js)