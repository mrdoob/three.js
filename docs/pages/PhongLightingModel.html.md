*Inheritance: LightingModel → BasicLightingModel →*

# PhongLightingModel

Represents the lighting model for a phong material. Used in [MeshPhongNodeMaterial](MeshPhongNodeMaterial.html).

## Constructor

### new PhongLightingModel( specular : boolean )

Constructs a new phong lighting model.

**specular**

Whether specular is supported or not.

Default is `true`.

## Properties

### .specular : boolean

Whether specular is supported or not. Set this to `false` if you are looking for a Lambert-like material meaning a material for non-shiny surfaces, without specular highlights.

Default is `true`.

## Methods

### .direct( lightData : Object )

Implements the direct lighting. The specular portion is optional an can be controlled with the [PhongLightingModel#specular](PhongLightingModel.html#specular) flag.

**lightData**

The light data.

**Overrides:** [BasicLightingModel#direct](BasicLightingModel.html#direct)

### .indirect( builder : NodeBuilder )

Implements the indirect lighting.

**builder**

The current node builder.

**Overrides:** [BasicLightingModel#indirect](BasicLightingModel.html#indirect)

## Source

[src/nodes/functions/PhongLightingModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/functions/PhongLightingModel.js)