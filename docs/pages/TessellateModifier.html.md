# TessellateModifier

This class can be used to modify a geometry by breaking its edges if they are longer than maximum length.

## Code Example

```js
const modifier = new TessellateModifier( 8, 6 );
geometry = modifier.modify( geometry );
```

## Import

TessellateModifier is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
```

## Constructor

### new TessellateModifier( maxEdgeLength : number, maxIterations : number )

Constructs a new Tessellate modifier.

**maxEdgeLength**

The maximum edge length.

Default is `0.1`.

**maxIterations**

The number of iterations.

Default is `6`.

## Properties

### .maxEdgeLength : number

The maximum edge length.

Default is `0.1`.

### .maxIterations : number

The maximum edge length.

Default is `0.1`.

## Methods

### .modify( geometry : BufferGeometry ) : BufferGeometry

Returns a new, modified version of the given geometry by applying a tesselation. Please note that the resulting geometry is always non-indexed.

**geometry**

The geometry to modify.

**Returns:** A new, modified geometry.

## Source

[examples/jsm/modifiers/TessellateModifier.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/modifiers/TessellateModifier.js)