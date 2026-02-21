*Inheritance: EventDispatcher →*

# WebXRManager

This class represents an abstraction of the WebXR Device API and is internally used by [WebGLRenderer](WebGLRenderer.html). `WebXRManager` also provides a public interface that allows users to enable/disable XR and perform XR related tasks like for instance retrieving controllers.

## Properties

### .cameraAutoUpdate : boolean

Whether the manager's XR camera should be automatically updated or not.

Default is `true`.

### .enabled : boolean

This flag notifies the renderer to be ready for XR rendering. Set it to `true` if you are going to use XR in your app.

Default is `false`.

### .isPresenting : boolean (readonly)

Whether XR presentation is active or not.

Default is `false`.

## Methods

### .getBaseLayer() : XRWebGLLayer | XRProjectionLayer

Returns the current base layer.

This is an `XRProjectionLayer` when the targeted XR device supports the WebXR Layers API, or an `XRWebGLLayer` otherwise.

**Returns:** The XR base layer.

### .getBinding() : XRWebGLBinding

Returns the current XR binding.

Creates a new binding if needed and the browser is capable of doing so.

**Returns:** The XR binding. Returns `null` if one cannot be created.

### .getCamera() : ArrayCamera

Returns an instance of [ArrayCamera](ArrayCamera.html) which represents the XR camera of the active XR session. For each view it holds a separate camera object.

The camera's `fov` is currently not used and does not reflect the fov of the XR camera. If you need the fov on app level, you have to compute in manually from the XR camera's projection matrices.

**Returns:** The XR camera.

### .getCameraTexture( xrCamera : XRCamera ) : Texture

Retrieves an opaque texture from the view-aligned XRCamera. Only available during the current animation loop.

**xrCamera**

The camera to query.

**Returns:** An opaque texture representing the current raw camera frame.

### .getController( index : number ) : Group

Returns a group representing the `target ray` space of the XR controller. Use this space for visualizing 3D objects that support the user in pointing tasks like UI interaction.

**index**

The index of the controller.

**Returns:** A group representing the `target ray` space.

### .getControllerGrip( index : number ) : Group

Returns a group representing the `grip` space of the XR controller. Use this space for visualizing 3D objects that support the user in pointing tasks like UI interaction.

Note: If you want to show something in the user's hand AND offer a pointing ray at the same time, you'll want to attached the handheld object to the group returned by `getControllerGrip()` and the ray to the group returned by `getController()`. The idea is to have two different groups in two different coordinate spaces for the same WebXR controller.

**index**

The index of the controller.

**Returns:** A group representing the `grip` space.

### .getDepthSensingMesh() : Mesh

Returns the depth sensing mesh.

See [WebXRDepthSensing#getMesh](WebXRDepthSensing.html#getMesh).

**Returns:** The depth sensing mesh.

### .getDepthTexture() : Texture

Returns the current depth texture computed via depth sensing.

See [WebXRDepthSensing#getDepthTexture](WebXRDepthSensing.html#getDepthTexture).

**Returns:** The depth texture.

### .getEnvironmentBlendMode() : 'opaque' | 'additive' | 'alpha-blend' | undefined

Returns the environment blend mode from the current XR session.

**Returns:** The environment blend mode. Returns `undefined` when used outside of a XR session.

### .getFoveation() : number | undefined

Returns the amount of foveation used by the XR compositor for the projection layer.

**Returns:** The amount of foveation.

### .getFrame() : XRFrame

Returns the current XR frame.

**Returns:** The XR frame. Returns `null` when used outside a XR session.

### .getHand( index : number ) : Group

Returns a group representing the `hand` space of the XR controller. Use this space for visualizing 3D objects that support the user in pointing tasks like UI interaction.

**index**

The index of the controller.

**Returns:** A group representing the `hand` space.

### .getReferenceSpace() : XRReferenceSpace

Returns the XR reference space.

**Returns:** The XR reference space.

### .getSession() : XRSession

Returns the current XR session.

**Returns:** The XR session. Returns `null` when used outside a XR session.

### .hasDepthSensing() : boolean

Returns `true` if depth sensing is supported.

**Returns:** Whether depth sensing is supported or not.

### .setFoveation( value : number )

Sets the foveation value.

**value**

A number in the range `[0,1]` where `0` means no foveation (full resolution) and `1` means maximum foveation (the edges render at lower resolution).

### .setFramebufferScaleFactor( value : number )

Sets the framebuffer scale factor.

This method can not be used during a XR session.

**value**

The framebuffer scale factor.

### .setReferenceSpace( space : XRReferenceSpace )

Sets a custom XR reference space.

**space**

The XR reference space.

### .setReferenceSpaceType( value : string )

Sets the reference space type. Can be used to configure a spatial relationship with the user's physical environment. Depending on how the user moves in 3D space, setting an appropriate reference space can improve tracking. Default is `local-floor`. Valid values can be found here https://developer.mozilla.org/en-US/docs/Web/API/XRReferenceSpace#reference\_space\_types.

This method can not be used during a XR session.

**value**

The reference space type.

### .setSession( value : XRSession ) : Promise (async)

After a XR session has been requested usually with one of the `*Button` modules, it is injected into the renderer with this method. This method triggers the start of the actual XR rendering.

**value**

The XR session to set.

**Returns:** A Promise that resolves when the session has been set.

### .updateCamera( camera : Camera )

Updates the state of the XR camera. Use this method on app level if you set `cameraAutoUpdate` to `false`. The method requires the non-XR camera of the scene as a parameter. The passed in camera's transformation is automatically adjusted to the position of the XR camera when calling this method.

**camera**

The camera.

## Source

[src/renderers/webxr/WebXRManager.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webxr/WebXRManager.js)