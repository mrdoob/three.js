*Inheritance: EventDispatcher → Material → ShaderMaterial →*

# RawShaderMaterial

This class works just like [ShaderMaterial](ShaderMaterial.html), except that definitions of built-in uniforms and attributes are not automatically prepended to the GLSL shader code.

`RawShaderMaterial` can only be used with [WebGLRenderer](WebGLRenderer.html).

## Constructor

### new RawShaderMaterial( parameters : Object )

Constructs a new raw shader material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .isRawShaderMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/materials/RawShaderMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/RawShaderMaterial.js)