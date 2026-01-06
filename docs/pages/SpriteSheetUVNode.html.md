*Inheritance: EventDispatcher → Node →*

# SpriteSheetUVNode

Can be used to compute texture coordinates for animated sprite sheets.

## Code Example

```js
const uvNode = spritesheetUV( vec2( 6, 6 ), uv(), time.mul( animationSpeed ) );
material.colorNode = texture( spriteSheet, uvNode );
```

## Constructor

### new SpriteSheetUVNode( countNode : Node.<vec2>, uvNode : Node.<vec2>, frameNode : Node.<float> )

Constructs a new sprite sheet uv node.

**countNode**

The node that defines the number of sprites in the x and y direction (e.g 6x6).

**uvNode**

The uv node.

Default is `uv()`.

**frameNode**

The node that defines the current frame/sprite.

Default is `float()`.

## Properties

### .countNode : Node.<vec2>

The node that defines the number of sprites in the x and y direction (e.g 6x6).

### .frameNode : Node.<float>

The node that defines the current frame/sprite.

### .uvNode : Node.<vec2>

The uv node.

## Source

[src/nodes/utils/SpriteSheetUVNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/SpriteSheetUVNode.js)