# Capsule

A capsule is essentially a cylinder with hemispherical caps at both ends. It can be thought of as a swept sphere, where a sphere is moved along a line segment.

Capsules are often used as bounding volumes (next to AABBs and bounding spheres).

## Import

Capsule is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Capsule } from 'three/addons/math/Capsule.js';
```

## Constructor

### new Capsule( start : Vector3, end : Vector3, radius : number )

Constructs a new capsule.

**start**

The start vector.

**end**

The end vector.

**radius**

The capsule's radius.

Default is `1`.

## Properties

### .end : Vector3

The end vector.

### .radius : number

The capsule's radius.

Default is `1`.

### .start : Vector3

The start vector.

## Methods

### .clone() : Capsule

Returns a new capsule with copied values from this instance.

**Returns:** A clone of this instance.

### .copy( capsule : Capsule ) : Capsule

Copies the values of the given capsule to this instance.

**capsule**

The capsule to copy.

**Returns:** A reference to this capsule.

### .getCenter( target : Vector3 ) : Vector3

Returns the center point of this capsule.

**target**

The target vector that is used to store the method's result.

**Returns:** The center point.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if the given bounding box intersects with this capsule.

**box**

The bounding box to test.

**Returns:** Whether the given bounding box intersects with this capsule.

### .set( start : Vector3, end : Vector3, radius : number ) : Capsule

Sets the capsule components to the given values. Please note that this method only copies the values from the given objects.

**start**

The start vector.

**end**

The end vector

**radius**

The capsule's radius.

**Returns:** A reference to this capsule.

### .translate( v : Vector3 ) : Capsule

Adds the given offset to this capsule, effectively moving it in 3D space.

**v**

The offset that should be used to translate the capsule.

**Returns:** A reference to this capsule.

## Source

[examples/jsm/math/Capsule.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/Capsule.js)