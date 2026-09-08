# BenchGenerator

A public street bench: timber slats carried on two cast-iron end frames that curl into armrests, with a reclined slatted backrest. Built once and instanced across a list of placements, dressed with one cheap material that branches on a baked `partId` ( warm stained wood, dark iron ).

The canonical model stands on `y = 0`, centred in X / Z, runs along X and seats toward `+Z`, so a placement whose local `+Z` faces the road sits a passer-by looking out over it.

## Code Example

```js
const benches = new BenchGenerator();
scene.add( benches.build( placements ) ); // placements: Matrix4[]
```

## Constructor

### new BenchGenerator()

## Source

[examples/jsm/generators/city/BenchGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/BenchGenerator.js)