*Inheritance: EventDispatcher →*

# UniformsGroup

A class for managing multiple uniforms in a single group. The renderer will process such a definition as a single UBO.

Since this class can only be used in context of [ShaderMaterial](ShaderMaterial.html), it is only supported in [WebGLRenderer](WebGLRenderer.html).

## Constructor

### new UniformsGroup()

Constructs a new uniforms group.

## Properties

### .buffer : Float32Array

A Float32 array buffer with the uniform values.

**Overrides:** [UniformBuffer#buffer](UniformBuffer.html#buffer)

### .byteLength : number

The byte length of the buffer with correct buffer alignment.

**Overrides:** [UniformBuffer#byteLength](UniformBuffer.html#byteLength)

### .id : number (readonly)

The ID of the 3D object.

### .isUniformsGroup : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .isUniformsGroup : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the uniforms group.

**Overrides:** [UniformBuffer#name](UniformBuffer.html#name)

### .uniforms : Array.<Uniform>

An array holding the uniforms.

### .uniforms : Array.<Uniform>

An array of uniform objects.

The order of uniforms in this array must match the order of uniforms in the shader.

### .usage : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage

The buffer usage.

Default is `StaticDrawUsage`.

### .values : Array.<number>

An array with the raw uniform values.

## Methods

### .add( uniform : Uniform ) : UniformsGroup

Adds the given uniform to this uniforms group.

**uniform**

The uniform to add.

**Returns:** A reference to this uniforms group.

### .addUniform( uniform : Uniform ) : UniformsGroup

Adds a uniform to this group.

**uniform**

The uniform to add.

**Returns:** A reference to this group.

### .addUniformUpdateRange( uniform : Uniform )

Adds a uniform's update range to this buffer.

**uniform**

The uniform.

### .clearUpdateRanges()

Clears all update ranges of this buffer.

**Overrides:** [UniformBuffer#clearUpdateRanges](UniformBuffer.html#clearUpdateRanges)

### .clone() : UniformsGroup

Returns a new uniforms group with copied values from this instance.

**Overrides:** [UniformBuffer#clone](UniformBuffer.html#clone)

**Returns:** A clone of this instance.

### .copy( source : UniformsGroup ) : UniformsGroup

Copies the values of the given uniforms group to this instance.

**source**

The uniforms group to copy.

**Returns:** A reference to this uniforms group.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

##### Fires:

*   [Texture#event:dispose](Texture.html#event:dispose)

### .remove( uniform : Uniform ) : UniformsGroup

Removes the given uniform from this uniforms group.

**uniform**

The uniform to remove.

**Returns:** A reference to this uniforms group.

### .removeUniform( uniform : Uniform ) : UniformsGroup

Removes a uniform from this group.

**uniform**

The uniform to remove.

**Returns:** A reference to this group.

### .setName( name : string ) : UniformsGroup

Sets the name of this uniforms group.

**name**

The name to set.

**Returns:** A reference to this uniforms group.

### .setUsage( value : StaticDrawUsage | DynamicDrawUsage | StreamDrawUsage | StaticReadUsage | DynamicReadUsage | StreamReadUsage | StaticCopyUsage | DynamicCopyUsage | StreamCopyUsage ) : UniformsGroup

Sets the usage of this uniforms group.

**value**

The usage to set.

**Returns:** A reference to this uniforms group.

### .update() : boolean

Updates this group by updating each uniform object of the internal uniform list. The uniform objects check if their values has actually changed so this method only returns `true` if there is a real value change.

**Overrides:** [UniformBuffer#update](UniformBuffer.html#update)

**Returns:** Whether the uniforms have been updated and must be uploaded to the GPU.

### .updateByType( uniform : Uniform ) : boolean

Updates a given uniform by calling an update method matching the uniforms type.

**uniform**

The uniform to update.

**Returns:** Whether the uniform has been updated or not.

### .updateColor( uniform : ColorUniform ) : boolean

Updates a given Color uniform.

**uniform**

The Color uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateMatrix3( uniform : Matrix3Uniform ) : boolean

Updates a given Matrix3 uniform.

**uniform**

The Matrix3 uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateMatrix4( uniform : Matrix4Uniform ) : boolean

Updates a given Matrix4 uniform.

**uniform**

The Matrix4 uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateNumber( uniform : NumberUniform ) : boolean

Updates a given Number uniform.

**uniform**

The Number uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateVector2( uniform : Vector2Uniform ) : boolean

Updates a given Vector2 uniform.

**uniform**

The Vector2 uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateVector3( uniform : Vector3Uniform ) : boolean

Updates a given Vector3 uniform.

**uniform**

The Vector3 uniform.

**Returns:** Whether the uniform has been updated or not.

### .updateVector4( uniform : Vector4Uniform ) : boolean

Updates a given Vector4 uniform.

**uniform**

The Vector4 uniform.

**Returns:** Whether the uniform has been updated or not.

## Source

[src/core/UniformsGroup.js](https://github.com/mrdoob/three.js/blob/master/src/core/UniformsGroup.js)