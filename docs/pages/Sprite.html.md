*Inheritance: EventDispatcher → Object3D →*

# Sprite

A sprite is a plane that always faces towards the camera, generally with a partially transparent texture applied.

Sprites do not cast shadows, setting [Object3D#castShadow](Object3D.html#castShadow) to `true` will have no effect.

## Code Example

```js
const map = new THREE.TextureLoader().load( 'sprite.png' );
const material = new THREE.SpriteMaterial( { map: map } );
const sprite = new THREE.Sprite( material );
scene.add( sprite );
```

## Constructor

### new Sprite( material : SpriteMaterial | SpriteNodeMaterial )

Constructs a new sprite.

**material**

The sprite material.

## Properties

### .center : Vector2

The sprite's anchor point, and the point around which the sprite rotates. A value of `(0.5, 0.5)` corresponds to the midpoint of the sprite. A value of `(0, 0)` corresponds to the lower left corner of the sprite.

Default is `(0.5,0.5)`.

### .count : number

The number of instances of this sprite. Can only be used with [WebGPURenderer](WebGPURenderer.html).

Default is `1`.

### .geometry : BufferGeometry

The sprite geometry.

### .isSprite : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .material : SpriteMaterial | SpriteNodeMaterial

The sprite material.

## Methods

### .raycast( raycaster : Raycaster, intersects : Array.<Object> )

Computes intersection points between a casted ray and this sprite.

**raycaster**

The raycaster.

**intersects**

The target array that holds the intersection points.

**Overrides:** [Object3D#raycast](Object3D.html#raycast)

## Source

[src/objects/Sprite.js](https://github.com/mrdoob/three.js/blob/master/src/objects/Sprite.js)