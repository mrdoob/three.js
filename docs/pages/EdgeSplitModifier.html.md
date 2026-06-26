# EdgeSplitModifier

The modifier can be used to split faces at sharp edges. This allows to compute normals without smoothing the edges which can lead to an improved visual result.

## Code Example

```js
const modifier = new EdgeSplitModifier();
geometry = modifier.modify( geometry, Math.PI * 0.4 );
```

## Import

EdgeSplitModifier is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { EdgeSplitModifier } from 'three/addons/modifiers/EdgeSplitModifier.js';
```

## Constructor

### new EdgeSplitModifier()

## Methods

### .modify( geometry : BufferGeometry, cutOffAngle : number, tryKeepNormals : boolean ) : BufferGeometry

Returns a new, modified version of the given geometry by applying an edge-split operation. Please note that the resulting geometry is always indexed.

**geometry**

The geometry to modify.

**cutOffAngle**

The cut off angle in radians.

**tryKeepNormals**

Whether to try to keep normals or not.

Default is `true`.

**Returns:** A new, modified geometry.

## Source

[examples/jsm/modifiers/EdgeSplitModifier.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/modifiers/EdgeSplitModifier.js)