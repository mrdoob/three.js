# LightingModel

Abstract class for implementing lighting models. The module defines multiple methods that concrete lighting models can implement. These methods are executed at different points during the light evaluation process.

## Constructor

### new LightingModel()

## Methods

### .ambientOcclusion( builder : NodeBuilder ) (abstract)

This method is intended for implementing the ambient occlusion term. Unlike other methods, this method must be called manually by the lighting model in its indirect term.

**builder**

The current node builder.

### .direct( lightData : Object, builder : NodeBuilder ) (abstract)

This method is intended for implementing the direct light term and executed during the build process of directional, point and spot light nodes.

**lightData**

The light data.

**builder**

The current node builder.

### .directRectArea( lightData : Object, builder : NodeBuilder ) (abstract)

This method is intended for implementing the direct light term for rect area light nodes.

**lightData**

The light data.

**builder**

The current node builder.

### .finish( builder : NodeBuilder ) (abstract)

This method is intended for executing final tasks like final updates to the outgoing light.

**builder**

The current node builder.

### .indirect( builder : NodeBuilder ) (abstract)

This method is intended for implementing the indirect light term.

**builder**

The current node builder.

### .start( builder : NodeBuilder ) (abstract)

This method is intended for setting up lighting model and context data which are later used in the evaluation process.

**builder**

The current node builder.

## Source

[src/nodes/core/LightingModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/LightingModel.js)