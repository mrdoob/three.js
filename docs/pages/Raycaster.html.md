# Raycaster

This class is designed to assist with raycasting. Raycasting is used for mouse picking (working out what objects in the 3d space the mouse is over) amongst other things.

## Constructor

### new Raycaster( origin : Vector3, direction : Vector3, near : number, far : number )

Constructs a new raycaster.

**origin**

The origin vector where the ray casts from.

**direction**

The (normalized) direction vector that gives direction to the ray.

**near**

All results returned are further away than near. Near can't be negative.

Default is `0`.

**far**

All results returned are closer than far. Far can't be lower than near.

Default is `Infinity`.

## Properties

### .camera : Camera

The camera to use when raycasting against view-dependent objects such as billboarded objects like sprites. This field can be set manually or is set when calling `setFromCamera()`.

Default is `null`.

### .far : number

All results returned are closer than far. Far can't be lower than near.

Default is `Infinity`.

### .layers : Layers

Allows to selectively ignore 3D objects when performing intersection tests. The following code example ensures that only 3D objects on layer `1` will be honored by raycaster.

```js
raycaster.layers.set( 1 );
object.layers.enable( 1 );
```

### .near : number

All results returned are further away than near. Near can't be negative.

Default is `0`.

### .params : Object

A parameter object that configures the raycasting. It has the structure:

```js
{
	Mesh: {},
	Line: { threshold: 1 },
	LOD: {},
	Points: { threshold: 1 },
	Sprite: {}
}
```

Where `threshold` is the precision of the raycaster when intersecting objects, in world units.

### .ray : Ray

The ray used for raycasting.

## Methods

### .intersectObject( object : Object3D, recursive : boolean, intersects : Array.<Raycaster~Intersection> ) : Array.<Raycaster~Intersection>

Checks all intersection between the ray and the object with or without the descendants. Intersections are returned sorted by distance, closest first.

`Raycaster` delegates to the `raycast()` method of the passed 3D object, when evaluating whether the ray intersects the object or not. This allows meshes to respond differently to ray casting than lines or points.

Note that for meshes, faces must be pointed towards the origin of the ray in order to be detected; intersections of the ray passing through the back of a face will not be detected. To raycast against both faces of an object, you'll want to set [Material#side](Material.html#side) to `THREE.DoubleSide`.

**object**

The 3D object to check for intersection with the ray.

**recursive**

If set to `true`, it also checks all descendants. Otherwise it only checks intersection with the object.

Default is `true`.

**intersects**

The target array that holds the result of the method.

Default is `[]`.

**Returns:** An array holding the intersection points.

### .intersectObjects( objects : Array.<Object3D>, recursive : boolean, intersects : Array.<Raycaster~Intersection> ) : Array.<Raycaster~Intersection>

Checks all intersection between the ray and the objects with or without the descendants. Intersections are returned sorted by distance, closest first.

**objects**

The 3D objects to check for intersection with the ray.

**recursive**

If set to `true`, it also checks all descendants. Otherwise it only checks intersection with the object.

Default is `true`.

**intersects**

The target array that holds the result of the method.

Default is `[]`.

**Returns:** An array holding the intersection points.

### .set( origin : Vector3, direction : Vector3 )

Updates the ray with a new origin and direction by copying the values from the arguments.

**origin**

The origin vector where the ray casts from.

**direction**

The (normalized) direction vector that gives direction to the ray.

### .setFromCamera( coords : Vector2, camera : Camera )

Uses the given coordinates and camera to compute a new origin and direction for the internal ray.

**coords**

2D coordinates of the mouse, in normalized device coordinates (NDC). X and Y components should be between `-1` and `1`.

**camera**

The camera from which the ray should originate.

### .setFromXRController( controller : WebXRController ) : Raycaster

Uses the given WebXR controller to compute a new origin and direction for the internal ray.

**controller**

The controller to copy the position and direction from.

**Returns:** A reference to this raycaster.

## Type Definitions

### .Intersection

The intersection point of a raycaster intersection test.

**distance**  
number

The distance from the ray's origin to the intersection point.

**distanceToRay**  
number

Some 3D objects e.g. [Points](Points.html) provide the distance of the intersection to the nearest point on the ray. For other objects it will be `undefined`.

**point**  
[Vector3](Vector3.html)

The intersection point, in world coordinates.

**face**  
Object

The face that has been intersected.

**faceIndex**  
number

The face index.

**object**  
[Object3D](Object3D.html)

The 3D object that has been intersected.

**uv**  
[Vector2](Vector2.html)

U,V coordinates at point of intersection.

**uv1**  
[Vector2](Vector2.html)

Second set of U,V coordinates at point of intersection.

**normal**  
[Vector3](Vector3.html)

Interpolated normal vector at point of intersection.

**instanceId**  
number

The index number of the instance where the ray intersects the [InstancedMesh](InstancedMesh.html).

## Source

[src/core/Raycaster.js](https://github.com/mrdoob/three.js/blob/master/src/core/Raycaster.js)