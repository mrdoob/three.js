*Inheritance: EventDispatcher → Object3D →*

# Light

Abstract base class for lights - all other light types inherit the properties and methods described here.

## Constructor

### new Light( color : number | Color | string, intensity : number ) (abstract)

Constructs a new light.

**color**

The light's color.

Default is `0xffffff`.

**intensity**

The light's strength/intensity.

Default is `1`.

## Properties

### .color : Color

The light's color.

### .intensity : number

The light's intensity.

Default is `1`.

### .isLight : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[src/lights/Light.js](https://github.com/mrdoob/three.js/blob/master/src/lights/Light.js)