# SidewalkGenerator

Generates the raised sidewalk for a city's blocks: per block, a rounded-corner concrete slab rimmed by a distinct granite kerbstone that stands proud of the walking surface and drops to the road. Instanced across a list of placements and dressed with its own procedural material ( poured concrete flags, scored expansion joints, granite curb ). Returns a `THREE.Group` of two instanced meshes — the walking slab and the curb.

Unlike the building generator, this one owns its materials: the slab and curb geometry and the TSL that shades them live together here.

## Code Example

```js
const sidewalk = new SidewalkGenerator( { width: 90, depth: 60, height: 0.5 } );
scene.add( sidewalk.build( placements ) ); // placements: Matrix4[]
```

## Constructor

### new SidewalkGenerator()

## Source

[examples/jsm/generators/city/SidewalkGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/SidewalkGenerator.js)