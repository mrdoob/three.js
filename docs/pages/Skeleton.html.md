# Skeleton

Class for representing the armatures in `three.js`. The skeleton is defined by a hierarchy of bones.

## Code Example

```js
const bones = [];
const shoulder = new THREE.Bone();
const elbow = new THREE.Bone();
const hand = new THREE.Bone();
shoulder.add( elbow );
elbow.add( hand );
bones.push( shoulder , elbow, hand);
shoulder.position.y = -5;
elbow.position.y = 0;
hand.position.y = 5;
const armSkeleton = new THREE.Skeleton( bones );
```

## Constructor

### new Skeleton( bones : Array.<Bone>, boneInverses : Array.<Matrix4> )

Constructs a new skeleton.

**bones**

An array of bones.

**boneInverses**

An array of bone inverse matrices. If not provided, these matrices will be computed automatically via [Skeleton#calculateInverses](Skeleton.html#calculateInverses).

## Properties

### .boneInverses : Array.<Matrix4>

An array of bone inverse matrices.

### .boneMatrices : Float32Array

An array buffer holding the bone data. Input data for [Skeleton#boneTexture](Skeleton.html#boneTexture).

Default is `null`.

### .boneTexture : DataTexture

A texture holding the bone data for use in the vertex shader.

Default is `null`.

### .bones : Array.<Bone>

An array of bones defining the skeleton.

### .previousBoneMatrices : Float32Array

An array buffer holding the bone data of the previous frame. Required for computing velocity. Maintained in [SkinningNode](SkinningNode.html).

Default is `null`.

## Methods

### .calculateInverses()

Computes the bone inverse matrices. This method resets [Skeleton#boneInverses](Skeleton.html#boneInverses) and fills it with new matrices.

### .clone() : Skeleton

Returns a new skeleton with copied values from this instance.

**Returns:** A clone of this instance.

### .computeBoneTexture() : Skeleton

Computes a data texture for passing bone data to the vertex shader.

**Returns:** A reference of this instance.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .fromJSON( json : Object, bones : Object.<string, Bone> ) : Skeleton

Setups the skeleton by the given JSON and bones.

**json**

The skeleton as serialized JSON.

**bones**

An array of bones.

**Returns:** A reference of this instance.

### .getBoneByName( name : string ) : Bone | undefined

Searches through the skeleton's bone array and returns the first with a matching name.

**name**

The name of the bone.

**Returns:** The found bone. `undefined` if no bone has been found.

### .init()

Initializes the skeleton. This method gets automatically called by the constructor but depending on how the skeleton is created it might be necessary to call this method manually.

### .pose()

Resets the skeleton to the base pose.

### .toJSON() : Object

Serializes the skeleton into JSON.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized skeleton.

### .update()

Resets the skeleton to the base pose.

## Source

[src/objects/Skeleton.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Skeleton.js)