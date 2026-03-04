*Inheritance: EventDispatcher → Material → NodeMaterial → MeshStandardNodeMaterial → MeshPhysicalNodeMaterial →*

# MeshSSSNodeMaterial

This node material is an experimental extension of [MeshPhysicalNodeMaterial](MeshPhysicalNodeMaterial.html) that implements a Subsurface scattering (SSS) term.

## Constructor

### new MeshSSSNodeMaterial( parameters : Object )

Constructs a new mesh SSS node material.

**parameters**

The configuration parameter.

## Properties

### .thicknessAmbientNode : Node.<float>

Represents the thickness ambient factor.

### .thicknessAttenuationNode : Node.<float>

Represents the thickness attenuation.

### .thicknessColorNode : Node.<vec3>

Represents the thickness color.

Default is `null`.

### .thicknessDistortionNode : Node.<float>

Represents the distortion factor.

### .thicknessPowerNode : Node.<float>

Represents the thickness power.

### .thicknessScaleNode : Node.<float>

Represents the thickness scale.

### .useSSS : boolean

Whether the lighting model should use SSS or not.

Default is `true`.

## Methods

### .setupLightingModel() : SSSLightingModel

Setups the lighting model.

**Overrides:** [MeshPhysicalNodeMaterial#setupLightingModel](MeshPhysicalNodeMaterial.html#setupLightingModel)

**Returns:** The lighting model.

## Source

[src/materials/nodes/MeshSSSNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshSSSNodeMaterial.js)