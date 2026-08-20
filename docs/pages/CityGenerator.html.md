# CityGenerator

Lays out a grid of city blocks and fills each lot with a [SkyscraperGenerator](SkyscraperGenerator.html) tower of its own seed, height and footprint, optionally on raised sidewalk slabs (curbs). Returns a `THREE.Group` ready to add to a scene.

Pass a building material to dress the towers; the sidewalks dress themselves via [SidewalkGenerator](SidewalkGenerator.html). The layout is exposed as CityGenerator#layout so the surrounding scene (road markings, etc.) can align to the same grid.

## Code Example

```js
const city = new CityGenerator( { seed: 1 } );
scene.add( city.build( materials ) );
```

## Constructor

### new CityGenerator()

## Source

[examples/jsm/generators/CityGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/CityGenerator.js)