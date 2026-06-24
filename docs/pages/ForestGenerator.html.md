# ForestGenerator

Carpets a [TerrainGenerator](TerrainGenerator.html) ( or anything exposing `sampleHeight`, `sampleSlope`, `minY`, `maxY` and `parameters.size` ) with a forest of hundreds of thousands of trees in a single draw call.

Each tree is the cheapest thing that still reads as a tree: a ~20-face icosphere squashed into a tapered teardrop and lumped with a little noise, carrying a baked dark-base / bright-top gradient. Tens of triangles each, so a single THREE.InstancedMesh of half a million of them costs one draw call. Trees are placed by rejection sampling against ecological rules — a min/max altitude band ( above the mist floor, below the snowline ), a slope limit ( none on cliffs ) and a low-frequency density mask that opens clearings — then jittered in yaw, lean and ( squared-biased ) scale so the stand never reads as copies.

## Code Example

```js
const forest = new ForestGenerator( { count: 500000 } );
scene.add( forest.build( terrain ) );
```

## Constructor

### new ForestGenerator()

## Source

[examples/jsm/generators/ForestGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/ForestGenerator.js)