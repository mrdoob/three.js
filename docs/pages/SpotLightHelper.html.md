*Inheritance: EventDispatcher → Object3D →*

# SpotLightHelper

This displays a cone shaped helper object for a [SpotLight](SpotLight.html).

## Code Example

```js
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 10, 10, 10 );
scene.add( spotLight );
const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );
```

## Constructor

### new SpotLightHelper( light : HemisphereLight, color : number | Color | string )

Constructs a new spot light helper.

**light**

The light to be visualized.

**color**

The helper's color. If not set, the helper will take the color of the light.

## Properties

### .color : number | Color | string

The color parameter passed in the constructor. If not set, the helper will take the color of the light.

### .light : SpotLight

The light being visualized.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper to match the position and direction of the light being visualized.

## Source

[src/helpers/SpotLightHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/SpotLightHelper.js)