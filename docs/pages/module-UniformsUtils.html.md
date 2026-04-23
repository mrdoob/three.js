# UniformsUtils

Provides utility functions for managing uniforms.

## Static Methods

### .cloneUniforms( src : Object ) : Object

Clones the given uniform definitions by performing a deep-copy. That means if the value of a uniform refers to an object like a Vector3 or Texture, the cloned uniform will refer to a new object reference.

**src**

An object representing uniform definitions.

**Returns:** The cloned uniforms.

### .mergeUniforms( uniforms : Array ) : Object

Merges the given uniform definitions into a single object. Since the method internally uses cloneUniforms(), it performs a deep-copy when producing the merged uniform definitions.

**uniforms**

An array of objects containing uniform definitions.

**Returns:** The merged uniforms.

## Source

[src/renderers/shaders/UniformsUtils.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/UniformsUtils.js)