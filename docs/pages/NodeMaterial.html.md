*Inheritance: EventDispatcher → Material →*

# NodeMaterial

Base class for all node materials.

## Constructor

### new NodeMaterial()

Constructs a new node material.

## Properties

### .alphaTestNode : Node.<float>

The alpha test of node materials is by default inferred from the `alphaTest` property. This node property allows to overwrite the default and define the alpha test with a node instead.

If you don't want to overwrite the alpha test but modify the existing value instead, use [materialAlphaTest](TSL.html#materialAlphaTest).

Default is `null`.

### .aoNode : Node.<float>

The lighting of node materials might be influenced by ambient occlusion. The default AO is inferred from an ambient occlusion map assigned to `aoMap` and the respective `aoMapIntensity`. This node property allows to overwrite the default and define the ambient occlusion with a custom node instead.

If you don't want to overwrite the diffuse color but modify the existing values instead, use [materialAO](TSL.html#materialAO).

Default is `null`.

### .backdropAlphaNode : Node.<float>

This node allows to modulate the influence of `backdropNode` to the outgoing light.

Default is `null`.

### .backdropNode : Node.<vec3>

This node can be used to implement a variety of filter-like effects. The idea is to store the current rendering into a texture e.g. via `viewportSharedTexture()`, use it to create an arbitrary effect and then assign the node composition to this property. Everything behind the object using this material will now be affected by a filter.

```js
const material = new NodeMaterial()
material.transparent = true;
// everything behind the object will be monochromatic
material.backdropNode = saturation( viewportSharedTexture().rgb, 0 );
```

Backdrop computations are part of the lighting so only lit materials can use this property.

Default is `null`.

### .castShadowNode : Node.<vec4>

This node can be used to influence how an object using this node material casts shadows. To apply a color to shadows, you can simply do:

```js
material.castShadowNode = vec4( 1, 0, 0, 1 );
```

Which can be nice to fake colored shadows of semi-transparent objects. It is also common to use the property with `Fn` function so checks are performed per fragment.

```js
materialCustomShadow.castShadowNode = Fn( () => {
	hash( vertexIndex ).greaterThan( 0.5 ).discard();
	return materialColor;
} )();
```

Default is `null`.

### .castShadowPositionNode : Node.<float>

Allows to overwrite the geometry position used for shadow map projection which is by default [positionLocal](TSL.html#positionLocal), the vertex position in local space.

Default is `null`.

### .colorNode : Node.<vec3>

The diffuse color of node materials is by default inferred from the `color` and `map` properties. This node property allows to overwrite the default and define the diffuse color with a node instead.

```js
material.colorNode = color( 0xff0000 ); // define red color
```

If you don't want to overwrite the diffuse color but modify the existing values instead, use [materialColor](TSL.html#materialColor).

```js
material.colorNode = materialColor.mul( color( 0xff0000 ) ); // give diffuse colors a red tint
```

Default is `null`.

### .contextNode : ContextNode

This node can be used as a global context management component for this material.

Default is `null`.

### .depthNode : Node.<float>

Allows to overwrite depth values in the fragment shader.

Default is `null`.

### .envNode : Node.<vec3>

The environment of node materials can be defined by an environment map assigned to the `envMap` property or by `Scene.environment` if the node material is a PBR material. This node property allows to overwrite the default behavior and define the environment with a custom node.

```js
material.envNode = pmremTexture( renderTarget.texture );
```

Default is `null`.

### .fog : boolean

Whether this material is affected by fog or not.

Default is `true`.

### .fragmentNode : Node.<vec4>

This node property can be used if you need complete freedom in implementing the fragment shader. Assigning a node will replace the built-in material logic used in the fragment stage.

Default is `null`.

### .geometryNode : function

This node property is intended for logic which modifies geometry data once or per animation step. Apps usually place such logic randomly in initialization routines or in the animation loop. `geometryNode` is intended as a dedicated API so there is an intended spot where geometry modifications can be implemented.

The idea is to assign a `Fn` definition that holds the geometry modification logic. A typical example would be a GPU based particle system that provides a node material for usage on app level. The particle simulation would be implemented as compute shaders and managed inside a `Fn` function. This function is eventually assigned to `geometryNode`.

Default is `null`.

### .hardwareClipping : boolean

Whether this material uses hardware clipping or not. This property is managed by the engine and should not be modified by apps.

Default is `false`.

### .isNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lights : boolean

Whether this material is affected by lights or not.

Default is `false`.

### .lightsNode : LightsNode

Node materials which set their `lights` property to `true` are affected by all lights of the scene. Sometimes selective lighting is wanted which means only _some_ lights in the scene affect a material. This can be achieved by creating an instance of [LightsNode](LightsNode.html) with a list of selective lights and assign the node to this property.

```js
const customLightsNode = lights( [ light1, light2 ] );
material.lightsNode = customLightsNode;
```

Default is `null`.

### .maskNode : Node.<bool>

Discards the fragment if the mask value is `false`.

Default is `null`.

### .maskShadowNode : Node.<bool>

This node can be used to implement a shadow mask for the material.

Default is `null`.

### .mrtNode : MRTNode

MRT configuration is done on renderer or pass level. This node allows to overwrite what values are written into MRT targets on material level. This can be useful for implementing selective FX features that should only affect specific objects.

Default is `null`.

### .normalNode : Node.<vec3>

The normals of node materials are by default inferred from the `normalMap`/`normalScale` or `bumpMap`/`bumpScale` properties. This node property allows to overwrite the default and define the normals with a node instead.

If you don't want to overwrite the normals but modify the existing values instead, use [materialNormal](TSL.html#materialNormal).

Default is `null`.

### .opacityNode : Node.<float>

The opacity of node materials is by default inferred from the `opacity` and `alphaMap` properties. This node property allows to overwrite the default and define the opacity with a node instead.

If you don't want to overwrite the opacity but modify the existing value instead, use [materialOpacity](TSL.html#materialOpacity).

Default is `null`.

### .outputNode : Node.<vec4>

This node can be used to define the final output of the material.

TODO: Explain the differences to `fragmentNode`.

Default is `null`.

### .positionNode : Node.<vec3>

The local vertex positions are computed based on multiple factors like the attribute data, morphing or skinning. This node property allows to overwrite the default and define local vertex positions with nodes instead.

If you don't want to overwrite the vertex positions but modify the existing values instead, use [positionLocal](TSL.html#positionLocal).

```js
material.positionNode = positionLocal.add( displace );
```

Default is `null`.

### .receivedShadowNode : function | FunctionNode.<vec4>

This node can be used to influence how an object using this node material receive shadows.

```js
const totalShadows = float( 1 ).toVar();
material.receivedShadowNode = Fn( ( [ shadow ] ) => {
	totalShadows.mulAssign( shadow );
	//return float( 1 ); // bypass received shadows
	return shadow.mix( color( 0xff0000 ), 1 ); // modify shadow color
} );
```

Default is `null`.

### .receivedShadowPositionNode : Node.<float>

Allows to overwrite the position used for shadow map rendering which is by default [positionWorld](TSL.html#positionWorld), the vertex position in world space.

Default is `null`.

### .type : string

Represents the type of the node material.

**Overrides:** [Material#type](Material.html#type)

### .vertexNode : Node.<vec4>

This node property can be used if you need complete freedom in implementing the vertex shader. Assigning a node will replace the built-in material logic used in the vertex stage.

Default is `null`.

## Methods

### .build( builder : NodeBuilder )

Builds this material with the given node builder.

**builder**

The current node builder.

### .copy( source : NodeMaterial ) : NodeMaterial

Copies the properties of the given node material to this instance.

**source**

The material to copy.

**Overrides:** [Material#copy](Material.html#copy)

**Returns:** A reference to this node material.

### .customProgramCacheKey() : string

Allows to define a custom cache key that influence the material key computation for render objects.

**Overrides:** [Material#customProgramCacheKey](Material.html#customProgramCacheKey)

**Returns:** The custom cache key.

### .setDefaultValues( material : Material )

Most classic material types have a node pendant e.g. for `MeshBasicMaterial` there is `MeshBasicNodeMaterial`. This utility method is intended for defining all material properties of the classic type in the node type.

**material**

The material to copy properties with their values to this node material.

### .setup( builder : NodeBuilder )

Setups the vertex and fragment stage of this node material.

**builder**

The current node builder.

### .setupClipping( builder : NodeBuilder ) : ClippingNode

Setups the clipping node.

**builder**

The current node builder.

**Returns:** The clipping node.

### .setupDepth( builder : NodeBuilder )

Setups the depth of this material.

**builder**

The current node builder.

### .setupDiffuseColor( builder : NodeBuilder, geometry : BufferGeometry )

Setups the computation of the material's diffuse color.

**builder**

The current node builder.

**geometry**

The geometry.

### .setupEnvironment( builder : NodeBuilder ) : Node.<vec4>

Setups the environment node from the material.

**builder**

The current node builder.

**Returns:** The environment node.

### .setupFog( builder : NodeBuilder, outputNode : Node.<vec4> ) : Node.<vec4>

Setup the fog.

**builder**

The current node builder.

**outputNode**

The existing output node.

**Returns:** The output node.

### .setupHardwareClipping( builder : NodeBuilder )

Setups the hardware clipping if available on the current device.

**builder**

The current node builder.

### .setupLightMap( builder : NodeBuilder ) : Node.<vec3>

Setups the light map node from the material.

**builder**

The current node builder.

**Returns:** The light map node.

### .setupLighting( builder : NodeBuilder ) : Node.<vec3>

Setups the outgoing light node.

**builder**

The current node builder.

**Returns:** The outgoing light node.

### .setupLightingModel( builder : NodeBuilder ) : LightingModel (abstract)

This method should be implemented by most derived materials since it defines the material's lighting model.

**builder**

The current node builder.

**Returns:** The lighting model.

### .setupLights( builder : NodeBuilder ) : LightsNode

Setups the lights node based on the scene, environment and material.

**builder**

The current node builder.

**Returns:** The lights node.

### .setupModelViewProjection( builder : NodeBuilder ) : Node.<vec4>

Setups the position in clip space.

**builder**

The current node builder.

**Returns:** The position in view space.

### .setupNormal() : Node.<vec3>

Setups the normal node from the material.

**Returns:** The normal node.

### .setupObserver( builder : NodeBuilder ) : NodeMaterialObserver

Setups a node material observer with the given builder.

**builder**

The current node builder.

**Returns:** The node material observer.

### .setupOutgoingLight() : Node.<vec3>

Setups the outgoing light node variable

**Returns:** The outgoing light node.

### .setupOutput( builder : NodeBuilder, outputNode : Node.<vec4> ) : Node.<vec4>

Setups the output node.

**builder**

The current node builder.

**outputNode**

The existing output node.

**Returns:** The output node.

### .setupPosition( builder : NodeBuilder ) : Node.<vec3>

Setups the computation of the position in local space.

**builder**

The current node builder.

**Returns:** The position in local space.

### .setupPositionView( builder : NodeBuilder ) : Node.<vec3>

Setups the position node in view space. This method exists so derived node materials can modify the implementation e.g. sprite materials.

**builder**

The current node builder.

**Returns:** The position in view space.

### .setupPremultipliedAlpha( builder : NodeBuilder, outputNode : Node.<vec4> ) : Node.<vec4>

Setups premultiplied alpha.

**builder**

The current node builder.

**outputNode**

The existing output node.

**Returns:** The output node.

### .setupVariants( builder : NodeBuilder ) (abstract)

Abstract interface method that can be implemented by derived materials to setup material-specific node variables.

**builder**

The current node builder.

### .setupVertex( builder : NodeBuilder ) : Node.<vec4>

Setups the logic for the vertex stage.

**builder**

The current node builder.

**Returns:** The position in clip space.

### .toJSON( meta : Object | string ) : Object

Serializes this material to JSON.

**meta**

The meta information for serialization.

**Overrides:** [Material#toJSON](Material.html#toJSON)

**Returns:** The serialized node.

## Source

[src/materials/nodes/NodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/NodeMaterial.js)