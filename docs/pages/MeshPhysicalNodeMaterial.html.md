*Inheritance: EventDispatcher → Material → NodeMaterial → MeshStandardNodeMaterial →*

# MeshPhysicalNodeMaterial

Node material version of [MeshPhysicalMaterial](MeshPhysicalMaterial.html).

## Constructor

### new MeshPhysicalNodeMaterial( parameters : Object )

Constructs a new mesh physical node material.

**parameters**

The configuration parameter.

## Properties

### .anisotropyNode : Node.<float>

The anisotropy of physical materials is by default inferred from the `anisotropy` property. This node property allows to overwrite the default and define the anisotropy with a node instead.

If you don't want to overwrite the anisotropy but modify the existing value instead, use [materialAnisotropy](TSL.html#materialAnisotropy).

Default is `null`.

### .attenuationColorNode : Node.<vec3>

The attenuation color of physical materials is by default inferred from the `attenuationColor` property. This node property allows to overwrite the default and define the attenuation color with a node instead.

If you don't want to overwrite the attenuation color but modify the existing value instead, use [materialAttenuationColor](TSL.html#materialAttenuationColor).

Default is `null`.

### .attenuationDistanceNode : Node.<float>

The attenuation distance of physical materials is by default inferred from the `attenuationDistance` property. This node property allows to overwrite the default and define the attenuation distance with a node instead.

If you don't want to overwrite the attenuation distance but modify the existing value instead, use [materialAttenuationDistance](TSL.html#materialAttenuationDistance).

Default is `null`.

### .clearcoatNode : Node.<float>

The clearcoat of physical materials is by default inferred from the `clearcoat` and `clearcoatMap` properties. This node property allows to overwrite the default and define the clearcoat with a node instead.

If you don't want to overwrite the clearcoat but modify the existing value instead, use [materialClearcoat](TSL.html#materialClearcoat).

Default is `null`.

### .clearcoatNormalNode : Node.<vec3>

The clearcoat normal of physical materials is by default inferred from the `clearcoatNormalMap` property. This node property allows to overwrite the default and define the clearcoat normal with a node instead.

If you don't want to overwrite the clearcoat normal but modify the existing value instead, use [materialClearcoatNormal](TSL.html#materialClearcoatNormal).

Default is `null`.

### .clearcoatRoughnessNode : Node.<float>

The clearcoat roughness of physical materials is by default inferred from the `clearcoatRoughness` and `clearcoatRoughnessMap` properties. This node property allows to overwrite the default and define the clearcoat roughness with a node instead.

If you don't want to overwrite the clearcoat roughness but modify the existing value instead, use [materialClearcoatRoughness](TSL.html#materialClearcoatRoughness).

Default is `null`.

### .dispersionNode : Node.<float>

The dispersion of physical materials is by default inferred from the `dispersion` property. This node property allows to overwrite the default and define the dispersion with a node instead.

If you don't want to overwrite the dispersion but modify the existing value instead, use [materialDispersion](TSL.html#materialDispersion).

Default is `null`.

### .iorNode : Node.<float>

The ior of physical materials is by default inferred from the `ior` property. This node property allows to overwrite the default and define the ior with a node instead.

If you don't want to overwrite the ior but modify the existing value instead, use [materialIOR](TSL.html#materialIOR).

Default is `null`.

### .iridescenceIORNode : Node.<float>

The iridescence IOR of physical materials is by default inferred from the `iridescenceIOR` property. This node property allows to overwrite the default and define the iridescence IOR with a node instead.

If you don't want to overwrite the iridescence IOR but modify the existing value instead, use [materialIridescenceIOR](TSL.html#materialIridescenceIOR).

Default is `null`.

### .iridescenceNode : Node.<float>

The iridescence of physical materials is by default inferred from the `iridescence` property. This node property allows to overwrite the default and define the iridescence with a node instead.

If you don't want to overwrite the iridescence but modify the existing value instead, use [materialIridescence](TSL.html#materialIridescence).

Default is `null`.

### .iridescenceThicknessNode : Node.<float>

The iridescence thickness of physical materials is by default inferred from the `iridescenceThicknessRange` and `iridescenceThicknessMap` properties. This node property allows to overwrite the default and define the iridescence thickness with a node instead.

If you don't want to overwrite the iridescence thickness but modify the existing value instead, use [materialIridescenceThickness](TSL.html#materialIridescenceThickness).

Default is `null`.

### .isMeshPhysicalNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .sheenNode : Node.<vec3>

The sheen of physical materials is by default inferred from the `sheen`, `sheenColor` and `sheenColorMap` properties. This node property allows to overwrite the default and define the sheen with a node instead.

If you don't want to overwrite the sheen but modify the existing value instead, use [materialSheen](TSL.html#materialSheen).

Default is `null`.

### .sheenRoughnessNode : Node.<float>

The sheen roughness of physical materials is by default inferred from the `sheenRoughness` and `sheenRoughnessMap` properties. This node property allows to overwrite the default and define the sheen roughness with a node instead.

If you don't want to overwrite the sheen roughness but modify the existing value instead, use [materialSheenRoughness](TSL.html#materialSheenRoughness).

Default is `null`.

### .specularColorNode : Node.<vec3>

The specular color of physical materials is by default inferred from the `specularColor` and `specularColorMap` properties. This node property allows to overwrite the default and define the specular color with a node instead.

If you don't want to overwrite the specular color but modify the existing value instead, use [materialSpecularColor](TSL.html#materialSpecularColor).

Default is `null`.

### .specularIntensityNode : Node.<float>

The specular intensity of physical materials is by default inferred from the `specularIntensity` and `specularIntensityMap` properties. This node property allows to overwrite the default and define the specular intensity with a node instead.

If you don't want to overwrite the specular intensity but modify the existing value instead, use [materialSpecularIntensity](TSL.html#materialSpecularIntensity).

Default is `null`.

### .thicknessNode : Node.<float>

The thickness of physical materials is by default inferred from the `thickness` and `thicknessMap` properties. This node property allows to overwrite the default and define the thickness with a node instead.

If you don't want to overwrite the thickness but modify the existing value instead, use [materialThickness](TSL.html#materialThickness).

Default is `null`.

### .transmissionNode : Node.<float>

The transmission of physical materials is by default inferred from the `transmission` and `transmissionMap` properties. This node property allows to overwrite the default and define the transmission with a node instead.

If you don't want to overwrite the transmission but modify the existing value instead, use [materialTransmission](TSL.html#materialTransmission).

Default is `null`.

### .useAnisotropy : boolean

Whether the lighting model should use anisotropy or not.

Default is `true`.

### .useClearcoat : boolean

Whether the lighting model should use clearcoat or not.

Default is `true`.

### .useDispersion : boolean

Whether the lighting model should use dispersion or not.

Default is `true`.

### .useIridescence : boolean

Whether the lighting model should use iridescence or not.

Default is `true`.

### .useSheen : boolean

Whether the lighting model should use sheen or not.

Default is `true`.

### .useTransmission : boolean

Whether the lighting model should use transmission or not.

Default is `true`.

## Methods

### .setupClearcoatNormal() : Node.<vec3>

Setups the clearcoat normal node.

**Returns:** The clearcoat normal.

### .setupLightingModel() : PhysicalLightingModel

Setups the lighting model.

**Overrides:** [MeshStandardNodeMaterial#setupLightingModel](MeshStandardNodeMaterial.html#setupLightingModel)

**Returns:** The lighting model.

### .setupSpecular()

Setups the specular related node variables.

**Overrides:** [MeshStandardNodeMaterial#setupSpecular](MeshStandardNodeMaterial.html#setupSpecular)

### .setupVariants( builder : NodeBuilder )

Setups the physical specific node variables.

**builder**

The current node builder.

**Overrides:** [MeshStandardNodeMaterial#setupVariants](MeshStandardNodeMaterial.html#setupVariants)

## Source

[src/materials/nodes/MeshPhysicalNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshPhysicalNodeMaterial.js)