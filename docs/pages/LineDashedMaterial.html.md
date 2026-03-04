*Inheritance: EventDispatcher → Material → LineBasicMaterial →*

# LineDashedMaterial

A material for rendering line primitives.

Materials define the appearance of renderable 3D objects.

## Code Example

```js
const material = new THREE.LineDashedMaterial( {
	color: 0xffffff,
	scale: 1,
	dashSize: 3,
	gapSize: 1,
} );
```

## Constructor

### new LineDashedMaterial( parameters : Object )

Constructs a new line dashed material.

**parameters**

An object with one or more properties defining the material's appearance. Any property of the material (including any property from inherited materials) can be passed in here. Color values can be passed any type of value accepted by [Color#set](Color.html#set).

## Properties

### .dashSize : number

The size of the dash. This is both the gap with the stroke.

Default is `3`.

### .gapSize : number

The size of the gap.

Default is `1`.

### .isLineDashedMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .scale : number

The scale of the dashed part of a line.

Default is `1`.

## Source

[src/materials/LineDashedMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/LineDashedMaterial.js)