*Inheritance: EventDispatcher → Node →*

# BumpMapNode

This class can be used for applying bump maps to materials.

## Code Example

```js
material.normalNode = bumpMap( texture( bumpTex ) );
```

## Constructor

### new BumpMapNode( textureNode : Node.<float>, scaleNode : Node.<float>, normalNode : Node.<vec3> )

Constructs a new bump map node.

**textureNode**

Represents the bump map data.

**scaleNode**

Controls the intensity of the bump effect.

Default is `null`.

**normalNode**

The view-space normal to perturb.

Default is `normalView`.

## Properties

### .normalNode : Node.<vec3>

The view-space normal to perturb.

Default is `normalView`.

### .scaleNode : Node.<float>

Controls the intensity of the bump effect.

Default is `null`.

### .textureNode : Node.<float>

Represents the bump map data.

## Source

[src/nodes/display/BumpMapNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/BumpMapNode.js)