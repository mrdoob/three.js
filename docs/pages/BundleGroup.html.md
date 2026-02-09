*Inheritance: EventDispatcher → Object3D → Group →*

# BundleGroup

A specialized group which enables applications access to the Render Bundle API of WebGPU. The group with all its descendant nodes are considered as one render bundle and processed as such by the renderer.

This module is only fully supported by `WebGPURenderer` with a WebGPU backend. With a WebGL backend, the group can technically be rendered but without any performance improvements.

## Constructor

### new BundleGroup()

Constructs a new bundle group.

## Properties

### .isBundleGroup : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .needsUpdate : boolean

Set this property to `true` when the bundle group has changed.

Default is `false`.

### .static : boolean

Whether the bundle is static or not. When set to `true`, the structure is assumed to be static and does not change. E.g. no new objects are added to the group

If a change is required, an update can still be forced by setting the `needsUpdate` flag to `true`.

Default is `true`.

### .type : string (readonly)

This property is only relevant for detecting types during serialization/deserialization. It should always match the class name.

Default is `'BundleGroup'`.

**Overrides:** [Group#type](Group.html#type)

### .version : number (readonly)

The bundle group's version.

Default is `0`.

## Source

[src/renderers/common/BundleGroup.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/common/BundleGroup.js)