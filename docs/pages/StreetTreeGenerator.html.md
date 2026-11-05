# StreetTreeGenerator

A young street tree set in a curbside pit: a flared bark trunk rising through a cast-iron pit grate, branching into a canopy of vertex-jittered leaf clumps. The clump normals are blended toward a shared crown sphere so the clumps shade as one irregular crown rather than separate balls, and the material adds interior self-shadowing and patchy colour so the foliage reads as leaf mass. Built once and instanced across a list of placements, dressed with one cheap material that branches on a baked `partId`.

The canopy is near rotationally symmetric, so the canonical model stands on `y = 0`, centred in X / Z, with its slight lean toward `+Z` matching the other pieces of street furniture.

## Code Example

```js
const trees = new StreetTreeGenerator();
scene.add( trees.build( placements ) ); // placements: Matrix4[]
```

## Constructor

### new StreetTreeGenerator()

## Source

[examples/jsm/generators/city/StreetTreeGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/city/StreetTreeGenerator.js)