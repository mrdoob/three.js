*Inheritance: LightShadow →*

# SpotLightShadow

Represents the shadow configuration of directional lights.

## Constructor

### new SpotLightShadow()

Constructs a new spot light shadow.

## Properties

### .aspect : number

Texture aspect ratio.

Default is `1`.

### .focus : number

Used to focus the shadow camera. The camera's field of view is set as a percentage of the spotlight's field-of-view. Range is `[0, 1]`.

Default is `1`.

### .isSpotLightShadow : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/lights/SpotLightShadow.js](https://github.com/mrdoob/three.js/blob/master/src/lights/SpotLightShadow.js)