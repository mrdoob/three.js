*Inheritance: EventDispatcher → Node → TempNode → PassNode → StereoCompositePassNode →*

# AnaglyphPassNode

A render pass node that creates an anaglyph effect using physically-correct off-axis stereo projection.

This implementation uses CameraUtils.frameCorners() to align stereo camera frustums to a virtual screen plane, providing accurate depth perception with zero parallax at the plane distance.

## Import

AnaglyphPassNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { anaglyphPass, AnaglyphAlgorithm, AnaglyphColorMode } from 'three/addons/tsl/display/AnaglyphPassNode.js';
```

## Constructor

### new AnaglyphPassNode( scene : Scene, camera : Camera )

Constructs a new anaglyph pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

## Properties

### .algorithm : string

Gets the current anaglyph algorithm.

### .algorithm : string

Sets the anaglyph algorithm.

### .colorMode : string

Gets the current color mode.

### .colorMode : string

Sets the color mode.

### .eyeSep : number

The interpupillary distance (eye separation) in world units. Typical human IPD is 0.064 meters (64mm).

Default is `0.064`.

### .isAnaglyphPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .planeDistance : number

The distance in world units from the viewer to the virtual screen plane where zero parallax (screen depth) occurs. Objects at this distance appear at the screen surface. Objects closer appear in front of the screen (negative parallax). Objects further appear behind the screen (positive parallax).

The screen dimensions are derived from the camera's FOV and aspect ratio at this distance, ensuring the stereo view matches the camera's field of view.

Default is `0.5`.

## Methods

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [StereoCompositePassNode#setup](StereoCompositePassNode.html#setup)

### .updateStereoCamera( coordinateSystem : number )

Updates the internal stereo camera using frameCorners for physically-correct off-axis projection.

**coordinateSystem**

The current coordinate system.

**Overrides:** [StereoCompositePassNode#updateStereoCamera](StereoCompositePassNode.html#updateStereoCamera)

## Source

[examples/jsm/tsl/display/AnaglyphPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/AnaglyphPassNode.js)