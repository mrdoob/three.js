*Inheritance: EventDispatcher → Object3D → Light →*

# LightProbe

Light probes are an alternative way of adding light to a 3D scene. Unlike classical light sources (e.g. directional, point or spot lights), light probes do not emit light. Instead they store information about light passing through 3D space. During rendering, the light that hits a 3D object is approximated by using the data from the light probe.

Light probes are usually created from (radiance) environment maps. The class [LightProbeGenerator](LightProbeGenerator.html) can be used to create light probes from cube textures or render targets. However, light estimation data could also be provided in other forms e.g. by WebXR. This enables the rendering of augmented reality content that reacts to real world lighting.

The current probe implementation in three.js supports so-called diffuse light probes. This type of light probe is functionally equivalent to an irradiance environment map.

## Constructor

### new LightProbe( sh : SphericalHarmonics3, intensity : number )

Constructs a new light probe.

**sh**

The spherical harmonics which represents encoded lighting information.

**intensity**

The light's strength/intensity.

Default is `1`.

## Properties

### .isLightProbe : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sh : SphericalHarmonics3

A light probe uses spherical harmonics to encode lighting information.

## Source

[src/lights/LightProbe.js](https://github.com/mrdoob/three.js/blob/master/src/lights/LightProbe.js)