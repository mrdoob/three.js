# TerrainGenerator

Bakes a procedural mountain range into a single mesh, returned in a `THREE.Group`. Domain-warped, derivative-damped noise shapes the ridges; thermal erosion relaxes steep slopes. A TSL material shades grass, rock and snow from altitude and slope.

The baked grid is available through TerrainGenerator#sampleHeight for placing a forest or other objects on the terrain.

## Code Example

```js
const terrain = new TerrainGenerator( { seed: 1 } );
scene.add( terrain.build() );
```

## Constructor

### new TerrainGenerator()

## Source

[examples/jsm/generators/TerrainGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/TerrainGenerator.js)