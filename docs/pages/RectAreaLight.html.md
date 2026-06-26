*Inheritance: EventDispatcher → Object3D → Light →*

# RectAreaLight

This class emits light uniformly across the face a rectangular plane. This light type can be used to simulate light sources such as bright windows or strip lighting.

Important Notes:

*   There is no shadow support.
*   Only PBR materials are supported.
*   You have to include `RectAreaLightUniformsLib` (`WebGLRenderer`) or `RectAreaLightTexturesLib` (`WebGPURenderer`) into your app and init the uniforms/textures.

## Code Example

```js
RectAreaLightUniformsLib.init(); // only relevant for WebGLRenderer
THREE.RectAreaLightNode.setLTC( RectAreaLightTexturesLib.init() ); //  only relevant for WebGPURenderer
const intensity = 1; const width = 10; const height = 10;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity, width, height );
rectLight.position.set( 5, 5, 0 );
rectLight.lookAt( 0, 0, 0 );
scene.add( rectLight )
```

## Constructor

### new RectAreaLight( color : number | Color | string, intensity : number, width : number, height : number )

Constructs a new area light.

**color**

The light's color.

Default is `0xffffff`.

**intensity**

The light's strength/intensity.

Default is `1`.

**width**

The width of the light.

Default is `10`.

**height**

The height of the light.

Default is `10`.

## Properties

### .height : number

The height of the light.

Default is `10`.

### .isRectAreaLight : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .power : number

The light's power. Power is the luminous power of the light measured in lumens (lm). Changing the power will also change the light's intensity.

### .width : number

The width of the light.

Default is `10`.

## Source

[src/lights/RectAreaLight.js](https://github.com/mrdoob/three.js/blob/master/src/lights/RectAreaLight.js)