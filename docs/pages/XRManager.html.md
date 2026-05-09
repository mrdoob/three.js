*Inheritance: EventDispatcher →*

# XRManager

The XR manager is built on top of the WebXR Device API to manage XR sessions with `WebGPURenderer`.

XR is currently only supported with a WebGL 2 backend.

## Constructor

### new XRManager( renderer : Renderer, multiview : boolean )

Constructs a new XR manager.

**renderer**

The renderer.

**multiview**

Enables multiview if the device supports it.

Default is `false`.

## Properties

### .cameraAutoUpdate : boolean

Whether the XR camera should automatically be updated or not.

Default is `true`.

### .enabled : boolean

This flag globally enables XR rendering.

Default is `false`.

### .isPresenting : boolean (readonly)

Whether the XR device is currently presenting or not.

Default is `false`.

## Methods

### .createCylinderLayer( radius : number, centralAngle : number, aspectratio : number, translation : Vector3, quaternion : Quaternion, pixelwidth : number, pixelheight : number, rendercall : function, attributes : Object ) : Mesh

This method can be used in XR applications to create a cylindrical layer that presents a separate rendered scene.

**radius**

The radius of the cylinder in world units.

**centralAngle**

The central angle of the cylinder in radians.

**aspectratio**

The aspect ratio.

**translation**

The position/translation of the layer plane in world units.

**quaternion**

The orientation of the layer plane expressed as a quaternion.

**pixelwidth**

The width of the layer's render target in pixels.

**pixelheight**

The height of the layer's render target in pixels.

**rendercall**

A callback function that renders the layer. Similar to code in the default animation loop, this method can be used to update/transform 3D object in the layer's scene.

**attributes**

Allows to configure the layer's render target.

Default is `{}`.

**Returns:** A mesh representing the cylindrical XR layer. This mesh should be added to the XR scene.

### .createQuadLayer( width : number, height : number, translation : Vector3, quaternion : Quaternion, pixelwidth : number, pixelheight : number, rendercall : function, attributes : Object ) : Mesh

This method can be used in XR applications to create a quadratic layer that presents a separate rendered scene.

**width**

The width of the layer plane in world units.

**height**

The height of the layer plane in world units.

**translation**

The position/translation of the layer plane in world units.

**quaternion**

The orientation of the layer plane expressed as a quaternion.

**pixelwidth**

The width of the layer's render target in pixels.

**pixelheight**

The height of the layer's render target in pixels.

**rendercall**

A callback function that renders the layer. Similar to code in the default animation loop, this method can be used to update/transform 3D object in the layer's scene.

**attributes**

Allows to configure the layer's render target.

Default is `{}`.

**Returns:** A mesh representing the quadratic XR layer. This mesh should be added to the XR scene.

### .getBinding() : XRWebGLBinding

Returns the current XR binding.

Creates a new binding if needed and the browser is capable of doing so.

**Returns:** The XR binding. Returns `null` if one cannot be created.

### .getCamera() : ArrayCamera

Returns the XR camera.

**Returns:** The XR camera.

### .getController( index : number ) : Group

Returns an instance of `THREE.Group` that represents the transformation of a XR controller in target ray space. The requested controller is defined by the given index.

**index**

The index of the XR controller.

**Returns:** A group that represents the controller's transformation.

### .getControllerGrip( index : number ) : Group

Returns an instance of `THREE.Group` that represents the transformation of a XR controller in grip space. The requested controller is defined by the given index.

**index**

The index of the XR controller.

**Returns:** A group that represents the controller's transformation.

### .getEnvironmentBlendMode() : 'opaque' | 'additive' | 'alpha-blend' | undefined

Returns the environment blend mode from the current XR session.

**Returns:** The environment blend mode. Returns `undefined` when used outside of a XR session.

### .getFoveation() : number | undefined

Returns the foveation value.

**Returns:** The foveation value. Returns `undefined` if no base or projection layer is defined.

### .getFrame() : XRFrame

Returns the current XR frame.

**Returns:** The XR frame. Returns `null` when used outside a XR session.

### .getFramebufferScaleFactor() : number

Returns the framebuffer scale factor.

**Returns:** The framebuffer scale factor.

### .getHand( index : number ) : Group

Returns an instance of `THREE.Group` that represents the transformation of a XR controller in hand space. The requested controller is defined by the given index.

**index**

The index of the XR controller.

**Returns:** A group that represents the controller's transformation.

### .getReferenceSpace() : XRReferenceSpace

Returns the XR reference space.

**Returns:** The XR reference space.

### .getReferenceSpaceType() : XRReferenceSpaceType

Returns the reference space type.

**Returns:** The reference space type.

### .getSession() : XRSession

Returns the current XR session.

**Returns:** The XR session. Returns `null` when used outside a XR session.

### .renderLayers()

Renders the XR layers that have been previously added to the scene.

This method is usually called in your animation loop before rendering the actual scene via `renderer.render( scene, camera );`.

### .setFoveation( foveation : number )

Sets the foveation value.

**foveation**

A number in the range `[0,1]` where `0` means no foveation (full resolution) and `1` means maximum foveation (the edges render at lower resolution).

### .setFramebufferScaleFactor( factor : number )

Sets the framebuffer scale factor.

This method can not be used during a XR session.

**factor**

The framebuffer scale factor.

### .setReferenceSpace( space : XRReferenceSpace )

Sets a custom XR reference space.

**space**

The XR reference space.

### .setReferenceSpaceType( type : XRReferenceSpaceType )

Sets the reference space type.

This method can not be used during a XR session.

**type**

The reference space type.

### .setSession( session : XRSession ) : Promise (async)

After a XR session has been requested usually with one of the `*Button` modules, it is injected into the renderer with this method. This method triggers the start of the actual XR rendering.

**session**

The XR session to set.

**Returns:** A Promise that resolves when the session has been set.

### .updateCamera( camera : PerspectiveCamera )

This method is called by the renderer per frame and updates the XR camera and it sub cameras based on the given camera. The given camera is the "user" camera created on application level and used for non-XR rendering.

**camera**

The camera.

### .useMultiview() : boolean

Returns `true` if the engine renders to a multiview target.

**Returns:** Whether the engine renders to a multiview render target or not.

## Source

[src/renderers/common/XRManager.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/XRManager.js)