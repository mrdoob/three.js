# WebXRDepthSensing

A XR module that manages the access to the Depth Sensing API.

## Constructor

### new WebXRDepthSensing()

Constructs a new depth sensing module.

## Properties

### .depthFar : number

The depth near far.

### .depthNear : number

The depth near value.

### .mesh : Mesh

A plane mesh for visualizing the depth texture.

### .texture : ExternalTexture

An opaque texture representing the depth of the user's environment.

## Methods

### .getDepthTexture() : ExternalTexture

Returns a texture representing the depth of the user's environment.

**Returns:** The depth texture.

### .getMesh( cameraXR : ArrayCamera ) : Mesh

Returns a plane mesh that visualizes the depth texture.

**cameraXR**

The XR camera.

**Returns:** The plane mesh.

### .init( depthData : XRWebGLDepthInformation, renderState : XRRenderState )

Inits the depth sensing module

**depthData**

The XR depth data.

**renderState**

The XR render state.

### .reset()

Resets the module

## Source

[src/renderers/webxr/WebXRDepthSensing.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webxr/WebXRDepthSensing.js)