# StereoCamera

A special type of camera that uses two perspective cameras with stereoscopic projection. Can be used for rendering stereo effects like [3D Anaglyph](https://en.wikipedia.org/wiki/Anaglyph_3D) or [Parallax Barrier](https://en.wikipedia.org/wiki/parallax_barrier).

## Constructor

### new StereoCamera()

Constructs a new stereo camera.

## Properties

### .aspect : number

The aspect.

Default is `1`.

### .cameraL : PerspectiveCamera

The camera representing the left eye. This is added to layer `1` so objects to be rendered by the left camera must also be added to this layer.

### .cameraR : PerspectiveCamera

The camera representing the right eye. This is added to layer `2` so objects to be rendered by the right camera must also be added to this layer.

### .eyeSep : number

The eye separation which represents the distance between the left and right camera.

Default is `0.064`.

### .type : string (readonly)

The type property is used for detecting the object type in context of serialization/deserialization.

## Methods

### .update( camera : PerspectiveCamera )

Updates the stereo camera based on the given perspective camera.

**camera**

The perspective camera.

## Source

[src/cameras/StereoCamera.js](https://github.com/mrdoob/three.js/blob/master/src/cameras/StereoCamera.js)