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

## Properties

### .seedNode : UniformNode.<uint>

The city seed shared by building and proxy materials. Pass this to [createBuildingMaterial](global.html#createBuildingMaterial) to update the palette when rebuilding.

## Methods

### .buildProxy() : InstancedMesh

Builds a lightweight stand-in for the city: one instanced box per tower, sized to match, in a single draw call. Intended for cheap global-illumination bakes, where the detailed facades and street furniture are unnecessary and the boxes still cast the same street shadows and bounce the same warm fill.

Call after CityGenerator#build, which records the tower boxes.

**Returns:** The proxy mesh.

## Source

[examples/jsm/generators/CityGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/CityGenerator.js)