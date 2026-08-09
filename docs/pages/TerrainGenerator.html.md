# TerrainGenerator

Bakes a procedural mountain range into a single THREE.BufferGeometry and returns a `THREE.Group` ready to add to a scene.

The heightfield is a derivative-damped fractal sum ( Quilez's fake erosion ): each octave is suppressed where the running slope is already steep, concentrating detail into weathered ridgelines, and a low-frequency domain warp makes those ridges meander. A few passes of thermal ( talus ) erosion then relax any slope past the angle of repose, settling the fractal's needle-spikes into real crests.

The grid is triangulated with alternating quad diagonals ( a diamond pattern ), so a coarse mesh holds its silhouette without a one-way grain. The surface shades itself from altitude and slope in TSL — grass, forest, rock, scree and snow, with detail normals and aerial perspective — so no material or textures are needed.

The baked height grid is exposed through TerrainGenerator#sampleHeight so a scattered forest ( or anything else ) can sit exactly on the surface.

## Code Example

```js
const terrain = new TerrainGenerator( { seed: 1 } );
scene.add( terrain.build() );
```

## Constructor

### new TerrainGenerator()

## Source

[examples/jsm/generators/TerrainGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/TerrainGenerator.js)