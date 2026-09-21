# ForestGenerator

Carpets a [TerrainGenerator](TerrainGenerator.html) with trees in a single instanced draw call. Each tree is a distorted icosphere with a baked crown gradient. Altitude, slope and a density mask control placement; rotation and scale vary between trees.

Compatible terrain objects expose `sampleHeight`, `sampleSlope`, `minY`, `maxY` and `parameters.size`.

## Code Example

```js
const forest = new ForestGenerator( { count: 500000 } );
scene.add( forest.build( terrain ) );
```

## Constructor

### new ForestGenerator()

## Source

[examples/jsm/generators/ForestGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/ForestGenerator.js)