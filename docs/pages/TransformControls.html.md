*Inheritance: EventDispatcher → Controls →*

# TransformControls

This class can be used to transform objects in 3D space by adapting a similar interaction model of DCC tools like Blender. Unlike other controls, it is not intended to transform the scene's camera.

`TransformControls` expects that its attached 3D object is part of the scene graph.

## Import

TransformControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TransformControls } from 'three/addons/controls/TransformControls.js';
```

## Constructor

### new TransformControls( camera : Camera, domElement : HTMLElement )

Constructs a new controls instance.

**camera**

The camera of the rendered scene.

**domElement**

The HTML element used for event listeners.

Default is `null`.

## Properties

### .axis : string

The current transformation axis.

### .camera : Camera

The camera of the rendered scene.

### .dragging : boolean (readonly)

Whether dragging is currently performed or not.

Default is `false`.

### .maxX : number

The maximum allowed X position during translation.

Default is `Infinity`.

### .maxY : number

The maximum allowed Y position during translation.

Default is `Infinity`.

### .maxZ : number

The maximum allowed Z position during translation.

Default is `Infinity`.

### .minX : number

The minimum allowed X position during translation.

Default is `-Infinity`.

### .minY : number

The minimum allowed y position during translation.

Default is `-Infinity`.

### .minZ : number

The minimum allowed z position during translation.

Default is `-Infinity`.

### .mode : 'translate' | 'rotate' | 'scale'

The current transformation axis.

Default is `'translate'`.

### .rotationSnap : number

By default, 3D objects are continuously rotated. If you set this property to a numeric value (radians), you can define in which steps the 3D object should be rotated.

Default is `null`.

### .scaleSnap : number

By default, 3D objects are continuously scaled. If you set this property to a numeric value, you can define in which steps the 3D object should be scaled.

Default is `null`.

### .showX : boolean

Whether the x-axis helper should be visible or not.

Default is `true`.

### .showY : boolean

Whether the y-axis helper should be visible or not.

Default is `true`.

### .showZ : boolean

Whether the z-axis helper should be visible or not.

Default is `true`.

### .size : number

The size of the helper UI (axes/planes).

Default is `1`.

### .space : 'world' | 'local'

Defines in which coordinate space transformations should be performed.

Default is `'world'`.

### .translationSnap : number

By default, 3D objects are continuously translated. If you set this property to a numeric value (world units), you can define in which steps the 3D object should be translated.

Default is `null`.

## Methods

### .attach( object : Object3D ) : TransformControls

Sets the 3D object that should be transformed and ensures the controls UI is visible.

**object**

The 3D object that should be transformed.

**Returns:** A reference to this controls.

### .detach() : TransformControls

Removes the current 3D object from the controls and makes the helper UI invisible.

**Returns:** A reference to this controls.

### .getHelper() : TransformControlsRoot

Returns the visual representation of the controls. Add the helper to your scene to visually transform the attached 3D object.

**Returns:** The helper.

### .getMode() : 'translate' | 'rotate' | 'scale'

Returns the transformation mode.

**Returns:** The transformation mode.

### .getRaycaster() : Raycaster

Returns the raycaster that is used for user interaction. This object is shared between all instances of `TransformControls`.

**Returns:** The internal raycaster.

### .reset()

Resets the object's position, rotation and scale to when the current transform began.

### .setColors( xAxis : number | Color | string, yAxis : number | Color | string, zAxis : number | Color | string, active : number | Color | string )

Sets the colors of the control's gizmo.

**xAxis**

The x-axis color.

**yAxis**

The y-axis color.

**zAxis**

The z-axis color.

**active**

The color for active elements.

### .setMode( mode : 'translate' | 'rotate' | 'scale' )

Sets the given transformation mode.

**mode**

The transformation mode to set.

### .setRotationSnap( rotationSnap : number )

Sets the rotation snap.

**rotationSnap**

The rotation snap to set.

### .setScaleSnap( scaleSnap : number )

Sets the scale snap.

**scaleSnap**

The scale snap to set.

### .setSize( size : number )

Sets the size of the helper UI.

**size**

The size to set.

### .setSpace( space : 'world' | 'local' )

Sets the coordinate space in which transformations are applied.

**space**

The space to set.

### .setTranslationSnap( translationSnap : number )

Sets the translation snap.

**translationSnap**

The translation snap to set.

## Events

### .change

Fires if any type of change (object or property change) is performed. Property changes are separate events you can add event listeners to. The event type is "propertyname-changed".

##### Type:

*   Object

### .mouseDown

Fires if a pointer (mouse/touch) becomes active.

##### Type:

*   Object

### .mouseUp

Fires if a pointer (mouse/touch) is no longer active.

##### Type:

*   Object

### .objectChange

Fires if the controlled 3D object is changed.

##### Type:

*   Object

## Source

[examples/jsm/controls/TransformControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/TransformControls.js)