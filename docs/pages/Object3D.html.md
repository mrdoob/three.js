*Inheritance: EventDispatcher →*

# Object3D

This is the base class for most objects in three.js and provides a set of properties and methods for manipulating objects in 3D space.

## Constructor

### new Object3D()

Constructs a new 3D object.

## Properties

### .animations : Array.<AnimationClip>

An array holding the animation clips of the 3D object.

### .castShadow : boolean

When set to `true`, the 3D object gets rendered into shadow maps.

Default is `false`.

### .children : Array.<Object3D>

An array holding the child 3D objects of this instance.

### .customDepthMaterial : Material | undefined

Custom depth material to be used when rendering to the depth map. Can only be used in context of meshes. When shadow-casting with a [DirectionalLight](DirectionalLight.html) or [SpotLight](SpotLight.html), if you are modifying vertex positions in the vertex shader you must specify a custom depth material for proper shadows.

Only relevant in context of [WebGLRenderer](WebGLRenderer.html).

Default is `undefined`.

### .customDistanceMaterial : Material | undefined

Same as [Object3D#customDepthMaterial](Object3D.html#customDepthMaterial), but used with [PointLight](PointLight.html).

Only relevant in context of [WebGLRenderer](WebGLRenderer.html).

Default is `undefined`.

### .frustumCulled : boolean

When set to `true`, the 3D object is honored by view frustum culling.

Default is `true`.

### .id : number (readonly)

The ID of the 3D object.

### .isObject3D : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .layers : Layers

The layer membership of the 3D object. The 3D object is only visible if it has at least one layer in common with the camera in use. This property can also be used to filter out unwanted objects in ray-intersection tests when using [Raycaster](Raycaster.html).

### .matrix : Matrix4

Represents the object's transformation matrix in local space.

### .matrixAutoUpdate : boolean

When set to `true`, the engine automatically computes the local matrix from position, rotation and scale every frame.

The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_AUTO_UPDATE`.

Default is `true`.

### .matrixWorld : Matrix4

Represents the object's transformation matrix in world space. If the 3D object has no parent, then it's identical to the local transformation matrix

### .matrixWorldAutoUpdate : boolean

When set to `true`, the engine automatically computes the world matrix from the current local matrix and the object's transformation hierarchy.

The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE`.

Default is `true`.

### .matrixWorldNeedsUpdate : boolean

When set to `true`, it calculates the world matrix in that frame and resets this property to `false`.

Default is `false`.

### .modelViewMatrix : Matrix4

Represents the object's model-view matrix.

### .name : string

The name of the 3D object.

### .normalMatrix : Matrix3

Represents the object's normal matrix.

### .parent : Object3D

A reference to the parent object.

Default is `null`.

### .position : Vector3

Represents the object's local position.

Default is `(0,0,0)`.

### .quaternion : Quaternion

Represents the object's local rotation as Quaternions.

### .receiveShadow : boolean

When set to `true`, the 3D object is affected by shadows in the scene.

Default is `false`.

### .renderOrder : number

This value allows the default rendering order of scene graph objects to be overridden although opaque and transparent objects remain sorted independently. When this property is set for an instance of [Group](Group.html),all descendants objects will be sorted and rendered together. Sorting is from lowest to highest render order.

Default is `0`.

### .rotation : Euler

Represents the object's local rotation as Euler angles, in radians.

Default is `(0,0,0)`.

### .scale : Vector3

Represents the object's local scale.

Default is `(1,1,1)`.

### .type : string (readonly)

The type property is used for detecting the object type in context of serialization/deserialization.

### .up : Vector3

Defines the `up` direction of the 3D object which influences the orientation via methods like [Object3D#lookAt](Object3D.html#lookAt).

The default values for all 3D objects is defined by `Object3D.DEFAULT_UP`.

### .userData : Object

An object that can be used to store custom data about the 3D object. It should not hold references to functions as these will not be cloned.

### .uuid : string (readonly)

The UUID of the 3D object.

### .visible : boolean

When set to `true`, the 3D object gets rendered.

Default is `true`.

### .DEFAULT_MATRIX_AUTO_UPDATE : boolean

The default setting for [Object3D#matrixAutoUpdate](Object3D.html#matrixAutoUpdate) for newly created 3D objects.

Default is `true`.

### .DEFAULT_MATRIX_WORLD_AUTO_UPDATE : boolean

The default setting for [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) for newly created 3D objects.

Default is `true`.

### .DEFAULT_UP : Vector3

The default up direction for objects, also used as the default position for [DirectionalLight](DirectionalLight.html) and [HemisphereLight](HemisphereLight.html).

Default is `(0,1,0)`.

## Methods

### .add( object : Object3D ) : Object3D

Adds the given 3D object as a child to this 3D object. An arbitrary number of objects may be added. Any current parent on an object passed in here will be removed, since an object can have at most one parent.

**object**

The 3D object to add.

##### Fires:

*   [Object3D#event:added](Object3D.html#event:added)
*   [Object3D#event:childadded](Object3D.html#event:childadded)

**Returns:** A reference to this instance.

### .applyMatrix4( matrix : Matrix4 )

Applies the given transformation matrix to the object and updates the object's position, rotation and scale.

**matrix**

The transformation matrix.

### .applyQuaternion( q : Quaternion ) : Object3D

Applies a rotation represented by given the quaternion to the 3D object.

**q**

The quaternion.

**Returns:** A reference to this instance.

### .attach( object : Object3D ) : Object3D

Adds the given 3D object as a child of this 3D object, while maintaining the object's world transform. This method does not support scene graphs having non-uniformly-scaled nodes(s).

**object**

The 3D object to attach.

##### Fires:

*   [Object3D#event:added](Object3D.html#event:added)
*   [Object3D#event:childadded](Object3D.html#event:childadded)

**Returns:** A reference to this instance.

### .clear() : Object3D

Removes all child objects.

##### Fires:

*   [Object3D#event:removed](Object3D.html#event:removed)
*   [Object3D#event:childremoved](Object3D.html#event:childremoved)

**Returns:** A reference to this instance.

### .clone( recursive : boolean ) : Object3D

Returns a new 3D object with copied values from this instance.

**recursive**

When set to `true`, descendants of the 3D object are also cloned.

Default is `true`.

**Returns:** A clone of this instance.

### .copy( source : Object3D, recursive : boolean ) : Object3D

Copies the values of the given 3D object to this instance.

**source**

The 3D object to copy.

**recursive**

When set to `true`, descendants of the 3D object are cloned.

Default is `true`.

**Returns:** A reference to this instance.

### .getObjectById( id : number ) : Object3D | undefined

Searches through the 3D object and its children, starting with the 3D object itself, and returns the first with a matching ID.

**id**

The id.

**Returns:** The found 3D object. Returns `undefined` if no 3D object has been found.

### .getObjectByName( name : string ) : Object3D | undefined

Searches through the 3D object and its children, starting with the 3D object itself, and returns the first with a matching name.

**name**

The name.

**Returns:** The found 3D object. Returns `undefined` if no 3D object has been found.

### .getObjectByProperty( name : string, value : any ) : Object3D | undefined

Searches through the 3D object and its children, starting with the 3D object itself, and returns the first with a matching property value.

**name**

The name of the property.

**value**

The value.

**Returns:** The found 3D object. Returns `undefined` if no 3D object has been found.

### .getObjectsByProperty( name : string, value : any, result : Array.<Object3D> ) : Array.<Object3D>

Searches through the 3D object and its children, starting with the 3D object itself, and returns all 3D objects with a matching property value.

**name**

The name of the property.

**value**

The value.

**result**

The method stores the result in this array.

**Returns:** The found 3D objects.

### .getWorldDirection( target : Vector3 ) : Vector3

Returns a vector representing the ("look") direction of the 3D object in world space.

**target**

The target vector the result is stored to.

**Returns:** The 3D object's direction in world space.

### .getWorldPosition( target : Vector3 ) : Vector3

Returns a vector representing the position of the 3D object in world space.

**target**

The target vector the result is stored to.

**Returns:** The 3D object's position in world space.

### .getWorldQuaternion( target : Quaternion ) : Quaternion

Returns a Quaternion representing the position of the 3D object in world space.

**target**

The target Quaternion the result is stored to.

**Returns:** The 3D object's rotation in world space.

### .getWorldScale( target : Vector3 ) : Vector3

Returns a vector representing the scale of the 3D object in world space.

**target**

The target vector the result is stored to.

**Returns:** The 3D object's scale in world space.

### .localToWorld( vector : Vector3 ) : Vector3

Converts the given vector from this 3D object's local space to world space.

**vector**

The vector to convert.

**Returns:** The converted vector.

### .lookAt( x : number | Vector3, y : number, z : number )

Rotates the object to face a point in world space.

This method does not support objects having non-uniformly-scaled parent(s).

**x**

The x coordinate in world space. Alternatively, a vector representing a position in world space

**y**

The y coordinate in world space.

**z**

The z coordinate in world space.

### .onAfterRender( renderer : Renderer | WebGLRenderer, object : Object3D, camera : Camera, geometry : BufferGeometry, material : Material, group : Object )

A callback that is executed immediately after a 3D object is rendered.

**renderer**

The renderer.

**object**

The 3D object.

**camera**

The camera that is used to render the scene.

**geometry**

The 3D object's geometry.

**material**

The 3D object's material.

**group**

The geometry group data.

### .onAfterShadow( renderer : Renderer | WebGLRenderer, object : Object3D, camera : Camera, shadowCamera : Camera, geometry : BufferGeometry, depthMaterial : Material, group : Object )

A callback that is executed immediately after a 3D object is rendered to a shadow map.

**renderer**

The renderer.

**object**

The 3D object.

**camera**

The camera that is used to render the scene.

**shadowCamera**

The shadow camera.

**geometry**

The 3D object's geometry.

**depthMaterial**

The depth material.

**group**

The geometry group data.

### .onBeforeRender( renderer : Renderer | WebGLRenderer, object : Object3D, camera : Camera, geometry : BufferGeometry, material : Material, group : Object )

A callback that is executed immediately before a 3D object is rendered.

**renderer**

The renderer.

**object**

The 3D object.

**camera**

The camera that is used to render the scene.

**geometry**

The 3D object's geometry.

**material**

The 3D object's material.

**group**

The geometry group data.

### .onBeforeShadow( renderer : Renderer | WebGLRenderer, object : Object3D, camera : Camera, shadowCamera : Camera, geometry : BufferGeometry, depthMaterial : Material, group : Object )

A callback that is executed immediately before a 3D object is rendered to a shadow map.

**renderer**

The renderer.

**object**

The 3D object.

**camera**

The camera that is used to render the scene.

**shadowCamera**

The shadow camera.

**geometry**

The 3D object's geometry.

**depthMaterial**

The depth material.

**group**

The geometry group data.

### .raycast( raycaster : Raycaster, intersects : Array.<Object> ) (abstract)

Abstract method to get intersections between a casted ray and this 3D object. Renderable 3D objects such as [Mesh](Mesh.html), [Line](Line.html) or [Points](Points.html) implement this method in order to use raycasting.

**raycaster**

The raycaster.

**intersects**

An array holding the result of the method.

### .remove( object : Object3D ) : Object3D

Removes the given 3D object as child from this 3D object. An arbitrary number of objects may be removed.

**object**

The 3D object to remove.

##### Fires:

*   [Object3D#event:removed](Object3D.html#event:removed)
*   [Object3D#event:childremoved](Object3D.html#event:childremoved)

**Returns:** A reference to this instance.

### .removeFromParent() : Object3D

Removes this 3D object from its current parent.

##### Fires:

*   [Object3D#event:removed](Object3D.html#event:removed)
*   [Object3D#event:childremoved](Object3D.html#event:childremoved)

**Returns:** A reference to this instance.

### .rotateOnAxis( axis : Vector3, angle : number ) : Object3D

Rotates the 3D object along an axis in local space.

**axis**

The (normalized) axis vector.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateOnWorldAxis( axis : Vector3, angle : number ) : Object3D

Rotates the 3D object along an axis in world space.

**axis**

The (normalized) axis vector.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateX( angle : number ) : Object3D

Rotates the 3D object around its X axis in local space.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateY( angle : number ) : Object3D

Rotates the 3D object around its Y axis in local space.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .rotateZ( angle : number ) : Object3D

Rotates the 3D object around its Z axis in local space.

**angle**

The angle in radians.

**Returns:** A reference to this instance.

### .setRotationFromAxisAngle( axis : Vector3, angle : number )

Sets the given rotation represented as an axis/angle couple to the 3D object.

**axis**

The (normalized) axis vector.

**angle**

The angle in radians.

### .setRotationFromEuler( euler : Euler )

Sets the given rotation represented as Euler angles to the 3D object.

**euler**

The Euler angles.

### .setRotationFromMatrix( m : Matrix4 )

Sets the given rotation represented as rotation matrix to the 3D object.

**m**

Although a 4x4 matrix is expected, the upper 3x3 portion must be a pure rotation matrix (i.e, unscaled).

### .setRotationFromQuaternion( q : Quaternion )

Sets the given rotation represented as a Quaternion to the 3D object.

**q**

The Quaternion

### .toJSON( meta : Object | string ) : Object

Serializes the 3D object into JSON.

**meta**

An optional value holding meta information about the serialization.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized 3D object.

### .translateOnAxis( axis : Vector3, distance : number ) : Object3D

Translate the 3D object by a distance along the given axis in local space.

**axis**

The (normalized) axis vector.

**distance**

The distance in world units.

**Returns:** A reference to this instance.

### .translateX( distance : number ) : Object3D

Translate the 3D object by a distance along its X-axis in local space.

**distance**

The distance in world units.

**Returns:** A reference to this instance.

### .translateY( distance : number ) : Object3D

Translate the 3D object by a distance along its Y-axis in local space.

**distance**

The distance in world units.

**Returns:** A reference to this instance.

### .translateZ( distance : number ) : Object3D

Translate the 3D object by a distance along its Z-axis in local space.

**distance**

The distance in world units.

**Returns:** A reference to this instance.

### .traverse( callback : function )

Executes the callback on this 3D object and all descendants.

Note: Modifying the scene graph inside the callback is discouraged.

**callback**

A callback function that allows to process the current 3D object.

### .traverseAncestors( callback : function )

Like [Object3D#traverse](Object3D.html#traverse), but the callback will only be executed for all ancestors.

Note: Modifying the scene graph inside the callback is discouraged.

**callback**

A callback function that allows to process the current 3D object.

### .traverseVisible( callback : function )

Like [Object3D#traverse](Object3D.html#traverse), but the callback will only be executed for visible 3D objects. Descendants of invisible 3D objects are not traversed.

Note: Modifying the scene graph inside the callback is discouraged.

**callback**

A callback function that allows to process the current 3D object.

### .updateMatrix()

Updates the transformation matrix in local space by computing it from the current position, rotation and scale values.

### .updateMatrixWorld( force : boolean )

Updates the transformation matrix in world space of this 3D objects and its descendants.

To ensure correct results, this method also recomputes the 3D object's transformation matrix in local space. The computation of the local and world matrix can be controlled with the [Object3D#matrixAutoUpdate](Object3D.html#matrixAutoUpdate) and [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) flags which are both `true` by default. Set these flags to `false` if you need more control over the update matrix process.

**force**

When set to `true`, a recomputation of world matrices is forced even when [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) is set to `false`.

Default is `false`.

### .updateWorldMatrix( updateParents : boolean, updateChildren : boolean )

An alternative version of [Object3D#updateMatrixWorld](Object3D.html#updateMatrixWorld) with more control over the update of ancestor and descendant nodes.

**updateParents**

Whether ancestor nodes should be updated or not.

Default is `false`.

**updateChildren**

Whether descendant nodes should be updated or not.

Default is `false`.

### .worldToLocal( vector : Vector3 ) : Vector3

Converts the given vector from this 3D object's word space to local space.

**vector**

The vector to convert.

**Returns:** The converted vector.

## Events

### .added

Fires when the object has been added to its parent object.

##### Type:

*   Object

### .childadded

Fires when a new child object has been added.

##### Type:

*   Object

### .childremoved

Fires when a child object has been removed.

##### Type:

*   Object

### .removed

Fires when the object has been removed from its parent object.

##### Type:

*   Object

## Source

[src/core/Object3D.js](https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js)