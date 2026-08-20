# TreeGenerator

Grows a procedural tree skeleton — trunk, branches and twigs, each swept as a tapered tube — and bakes it into one non-indexed [BufferGeometry](BufferGeometry.html) (position and normal only), ready to instance into a forest. It produces _branches only_; add foliage as a separate layer.

The branching is deterministic for a given `seed`: a recursive sweep lays down gently curved tubes with a parallel-transport frame (so they never twist), forking by the pipe model (each child much thinner than its parent), spreading children along the upper part of each branch with a golden-angle roll, and pulling them back up toward the light. A flared root, non-linear taper and gravity droop fill in the character.

Parameters are set with a fluent builder: a `set<Param>()` exists for every default ( `setSeed`, `setLevels`, `setChildren`, … ), each returning `this` for chaining.

Each `build()` returns a fresh, independent mesh that the caller owns, so one generator can be re-parametrized and built repeatedly to grow a varied stand:

## Code Example

```js
const generator = new TreeGenerator( material );
const oak = generator.setSeed( 1 ).setLevels( 4 ).build();
const pine = generator.setSeed( 2 ).setLevels( 5 ).build();
```

## Constructor

### new TreeGenerator()

## Source

[examples/jsm/generators/TreeGenerator.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/generators/TreeGenerator.js)