*Inheritance: EventDispatcher → Object3D → Light →*

# SpotLight

This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets.

This light can cast shadows - see the [SpotLightShadow](SpotLightShadow.html) for details.

## Code Example

```js
// white spotlight shining from the side, modulated by a texture
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );
spotLight.map = new THREE.TextureLoader().load( url );
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;s
```

## Constructor

### new SpotLight( color : number | Color | string, intensity : number, distance : number, angle : number, penumbra : number, decay : number )

Constructs a new spot light.

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

### .angle : number

Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.

Default is `Math.PI/3`.

### .decay : number

The amount the light dims along the distance of the light. In context of physically-correct rendering the default value should not be changed.

Default is `2`.

### .distance : number

Maximum range of the light. `0` means no limit.

Default is `0`.

### .isSpotLight : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .map : Texture

A texture used to modulate the color of the light. The spot light color is mixed with the RGB value of this texture, with a ratio corresponding to its alpha value. The cookie-like masking effect is reproduced using pixel values (0, 0, 0, 1-cookie\_value).

_Warning_: This property is disabled if [Object3D#castShadow](Object3D.html#castShadow) is set to `false`.

Default is `null`.

### .penumbra : number

Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.

Default is `0`.

### .power : number

The light's power. Power is the luminous power of the light measured in lumens (lm). Changing the power will also change the light's intensity.

### .shadow : SpotLightShadow

This property holds the light's shadow configuration.

### .target : Object3D

The spot light points from its position to the target's position.

For the target's position to be changed to anything other than the default, it must be added to the scene.

It is also possible to set the target to be another 3D object in the scene. The light will now track the target object.

## Source

[src/lights/SpotLight.js](https://github.com/mrdoob/three.js/blob/master/src/lights/SpotLight.js)