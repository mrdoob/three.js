*Inheritance: EventDispatcher → Node → TempNode → PassNode →*

# RetroPassNode

A post-processing pass that applies a retro PS1-style effect to the scene.

This node renders the scene with classic PlayStation 1 visual characteristics:

*   **Vertex snapping**: Vertices are snapped to screen pixels, creating the iconic "wobbly" geometry
*   **Affine texture mapping**: Textures are sampled without perspective correction, resulting in distortion effects
*   **Low resolution**: Default 0.25 scale (typical 320x240 equivalent)
*   **Nearest-neighbor filtering**: Sharp pixelated textures without smoothing

## Constructor

### new RetroPassNode( scene : Scene, camera : Camera, options : Object )

Creates a new RetroPassNode instance.

**scene**

The scene to render.

**camera**

The camera to render from.

**options**

Additional options for the retro pass.

Default is `{}`.

**affineDistortion**

An optional node to apply affine distortion to UVs.

Default is `null`.

## Source

[examples/jsm/tsl/display/RetroPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/RetroPassNode.js)