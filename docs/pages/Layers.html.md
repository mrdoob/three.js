# Layers

A layers object assigns an 3D object to 1 or more of 32 layers numbered `0` to `31` - internally the layers are stored as a bit mask\], and by default all 3D objects are a member of layer `0`.

This can be used to control visibility - an object must share a layer with a camera to be visible when that camera's view is rendered.

All classes that inherit from [Object3D](Object3D.html) have an `layers` property which is an instance of this class.

## Constructor

### new Layers()

Constructs a new layers instance, with membership initially set to layer `0`.

## Properties

### .mask : number

A bit mask storing which of the 32 layers this layers object is currently a member of.

## Methods

### .disable( layer : number )

Removes membership of the given layer.

**layer**

The layer to enable.

### .disableAll()

Removes the membership from all layers.

### .enable( layer : number )

Adds membership of the given layer.

**layer**

The layer to enable.

### .enableAll()

Adds membership to all layers.

### .isEnabled( layer : number ) : boolean

Returns `true` if the given layer is enabled.

**layer**

The layer to test.

**Returns:** Whether the given layer is enabled or not.

### .set( layer : number )

Sets membership to the given layer, and remove membership all other layers.

**layer**

The layer to set.

### .test( layers : Layers ) : boolean

Returns `true` if this and the given layers object have at least one layer in common.

**layers**

The layers to test.

**Returns:** Whether this and the given layers object have at least one layer in common or not.

### .toggle( layer : number )

Toggles the membership of the given layer.

**layer**

The layer to toggle.

## Source

[src/core/Layers.js](https://github.com/mrdoob/three.js/blob/master/src/core/Layers.js)