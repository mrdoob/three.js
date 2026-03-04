*Inheritance: EventDispatcher → Material → NodeMaterial →*

# VolumeNodeMaterial

Volume node material.

## Constructor

### new VolumeNodeMaterial( parameters : Object )

Constructs a new volume node material.

**parameters**

The configuration parameter.

## Properties

### .isVolumeNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .offsetNode : Node.<float>

Offsets the distance a ray has been traveled through a volume. Can be used to implement dithering to reduce banding.

Default is `null`.

### .scatteringNode : function | FunctionNode.<vec4>

Node used for scattering calculations.

Default is `null`.

### .steps : number

Number of steps used for raymarching.

Default is `25`.

## Source

[src/materials/nodes/VolumeNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/VolumeNodeMaterial.js)