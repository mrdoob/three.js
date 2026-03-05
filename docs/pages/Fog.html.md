# Fog

This class can be used to define a linear fog that grows linearly denser with the distance.

## Code Example

```js
const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xcccccc, 10, 15 );
```

## Constructor

### new Fog( color : number | Color, near : number, far : number )

Constructs a new fog.

**color**

The fog's color.

**near**

The minimum distance to start applying fog.

Default is `1`.

**far**

The maximum distance at which fog stops being calculated and applied.

Default is `1000`.

## Properties

### .color : Color

The fog's color.

### .far : number

The maximum distance at which fog stops being calculated and applied. Objects that are more than `far` units away from the active camera won't be affected by fog.

Default is `1000`.

### .isFog : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the fog.

### .near : number

The minimum distance to start applying fog. Objects that are less than `near` units from the active camera won't be affected by fog.

Default is `1`.

## Methods

### .clone() : Fog

Returns a new fog with copied values from this instance.

**Returns:** A clone of this instance.

### .toJSON( meta : Object | string ) : Object

Serializes the fog into JSON.

**meta**

An optional value holding meta information about the serialization.

**Returns:** A JSON object representing the serialized fog

## Source

[src/scenes/Fog.js](https://github.com/mrdoob/three.js/blob/master/src/scenes/Fog.js)