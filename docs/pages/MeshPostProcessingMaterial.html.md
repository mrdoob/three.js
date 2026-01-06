*Inheritance: EventDispatcher → Material → MeshStandardMaterial → MeshPhysicalMaterial →*

# MeshPostProcessingMaterial

The aim of this mesh material is to use information from a post processing pass in the diffuse color pass. This material is based on the MeshPhysicalMaterial.

In the current state, only the information of a screen space AO pass can be used in the material. Actually, the output of any screen space AO (SSAO, GTAO) can be used, as it is only necessary to provide the AO in one color channel of a texture, however the AO pass must be rendered prior to the color pass, which makes the post-processing pass somewhat of a pre-processing pass. Fot this purpose a new map (`aoPassMap`) is added to the material. The value of the map is used the same way as the `aoMap` value.

Motivation to use the outputs AO pass directly in the material: The incident light of a fragment is composed of ambient light, direct light and indirect light Ambient Occlusion only occludes ambient light and environment light, but not direct light. Direct light is only occluded by geometry that casts shadows. And of course the emitted light should not be darkened by ambient occlusion either. This cannot be achieved if the AO post processing pass is simply blended with the diffuse render pass.

Further extension work might be to use the output of an SSR pass or an HBIL pass from a previous frame. This would then create the possibility of SSR and IR depending on material properties such as `roughness`, `metalness` and `reflectivity`.

## Import

MeshPostProcessingMaterial is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MeshPostProcessingMaterial } from 'three/addons/materials/MeshPostProcessingMaterial.js';
```

## Constructor

### new MeshPostProcessingMaterial( parameters : Object )

Constructs a new conditional line material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .aoPassMap : Texture

A texture representing the AO pass.

### .aoPassMapScale : number

The scale of the AO pass.

Default is `1`.

## Source

[examples/jsm/materials/MeshPostProcessingMaterial.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/materials/MeshPostProcessingMaterial.js)