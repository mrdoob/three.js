*Inheritance: EventDispatcher → Object3D → Light → SpotLight →*

# IESSpotLight

A IES version of [SpotLight](SpotLight.html). Can only be used with [WebGPURenderer](WebGPURenderer.html).

## Constructor

### new IESSpotLight( color : number | Color | string, intensity : number, distance : number, angle : number, penumbra : number, decay : number )

Constructs a new IES spot light.

**color**

The light's color.

Default is `0xffffff`.

**intensity**

The light's strength/intensity measured in candela (cd).

Default is `1`.

**distance**

Maximum range of the light. `0` means no limit.

Default is `0`.

**angle**

Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.

Default is `Math.PI/3`.

**penumbra**

Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.

Default is `0`.

**decay**

The amount the light dims along the distance of the light.

Default is `2`.

## Properties

### .iesMap : Texture

TODO

Default is `null`.

## Source

[src/lights/webgpu/IESSpotLight.js](https://github.com/mrdoob/three.js/blob/master/src/lights/webgpu/IESSpotLight.js)