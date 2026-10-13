# SimplifyModifier

This class can be used to modify a geometry by simplifying it. A typical use case for such a modifier is automatic LOD generation.

The implementation is based on [meshoptimizer](https://github.com/zeux/meshoptimizer). If you only need a simplified index buffer, use MeshoptSimplifier directly.

## Code Example

```js
const modifier = new SimplifyModifier();
geometry = await modifier.modify( geometry, count );
```

## Import

SimplifyModifier is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
```

## Constructor

### new SimplifyModifier()

## Methods

### .modify( geometry : BufferGeometry, count : number ) : Promise.<BufferGeometry> (async)

Returns a new, simplified version of the given geometry. The vertex buffers of the result only contain vertices referenced by the simplified index.

**geometry**

The geometry to modify.

**count**

The approximate number of vertices to remove.

**Returns:** A promise that resolves with the new, modified geometry.

## Source

[examples/jsm/modifiers/SimplifyModifier.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/modifiers/SimplifyModifier.js)