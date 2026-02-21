*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# BoxHelper

Helper object to graphically show the world-axis-aligned bounding box around an object. The actual bounding box is handled with [Box3](Box3.html), this is just a visual helper for debugging. It can be automatically resized with [BoxHelper#update](BoxHelper.html#update) when the object it's created from is transformed. Note that the object must have a geometry for this to work, so it won't work with sprites.

## Code Example

```js
const sphere = new THREE.SphereGeometry();
const object = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( 0xff0000 ) );
const box = new THREE.BoxHelper( object, 0xffff00 );
scene.add( box );
```

## Constructor

### new BoxHelper( object : Object3D, color : number | Color | string )

Constructs a new box helper.

**object**

The 3D object to show the world-axis-aligned bounding box.

**color**

The box's color.

Default is `0xffff00`.

## Properties

### .object : Object3D

The 3D object being visualized.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .setFromObject( object : Object3D ) : BoxHelper

Updates the wireframe box for the passed object.

**object**

The 3D object to create the helper for.

**Returns:** A reference to this instance.

### .update()

Updates the helper's geometry to match the dimensions of the object, including any children.

## Source

[src/helpers/BoxHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/BoxHelper.js)