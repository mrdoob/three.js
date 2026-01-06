*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# Box3Helper

A helper object to visualize an instance of [Box3](Box3.html).

## Code Example

```js
const box = new THREE.Box3();
box.setFromCenterAndSize( new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 2, 1, 3 ) );
const helper = new THREE.Box3Helper( box, 0xffff00 );
scene.add( helper )
```

## Constructor

### new Box3Helper( box : Box3, color : number | Color | string )

Constructs a new box3 helper.

**box**

The box to visualize.

**color**

The box's color.

Default is `0xffff00`.

## Properties

### .box : Box3

The box being visualized.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[src/helpers/Box3Helper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/Box3Helper.js)