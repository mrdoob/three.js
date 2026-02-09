# TSL

## Properties

### .EPSILON : Node.<float> (constant)

A small value used to handle floating-point precision errors.

### .HALF_PI : Node.<float> (constant)

Represents PI / 2.

### .INFINITY : Node.<float> (constant)

Represents infinity.

### .PI : Node.<float> (constant)

Represents PI.

### .PI2 : Node.<float> (constant)

Represents PI \* 2. Please use the non-deprecated version `TWO_PI`.

**Deprecated:** Yes

### .TBNViewMatrix : Node.<mat3> (constant)

TSL object that represents the TBN matrix in view space.

### .TWO_PI : Node.<float> (constant)

Represents PI \* 2.

### .alphaT : PropertyNode.<float> (constant)

TSL object that represents the shader variable `AlphaT`.

### .anisotropy : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Anisotropy`.

### .anisotropyB : PropertyNode.<vec3> (constant)

TSL object that represents the shader variable `AnisotropyB`.

### .anisotropyT : PropertyNode.<vec3> (constant)

TSL object that represents the shader variable `AnisotropyT`.

### .attenuationColor : PropertyNode.<color> (constant)

TSL object that represents the shader variable `AttenuationColor`.

### .attenuationDistance : PropertyNode.<float> (constant)

TSL object that represents the shader variable `AttenuationDistance`.

### .backgroundBlurriness : Node.<float> (constant)

TSL object that represents the scene's background blurriness.

### .backgroundIntensity : Node.<float> (constant)

TSL object that represents the scene's background intensity.

### .backgroundRotation : Node.<mat4> (constant)

TSL object that represents the scene's background rotation.

### .bitangentGeometry : Node.<vec3> (constant)

TSL object that represents the bitangent attribute of the current rendered object.

### .bitangentLocal : Node.<vec3> (constant)

TSL object that represents the vertex bitangent in local space of the current rendered object.

### .bitangentView : Node.<vec3> (constant)

TSL object that represents the vertex bitangent in view space of the current rendered object.

### .bitangentViewFrame : Node.<vec3> (constant)

Bitangent vector in view space, computed dynamically from geometry and UV derivatives. Complements the tangentViewFrame for constructing the tangent space basis.

Reference: http://www.thetenthplanet.de/archives/1180

### .bitangentWorld : Node.<vec3> (constant)

TSL object that represents the vertex bitangent in world space of the current rendered object.

### .cameraFar : UniformNode.<float> (constant)

TSL object that represents the `far` value of the camera used for the current render.

### .cameraIndex : UniformNode.<uint> (constant)

TSL object that represents the current `index` value of the camera if used ArrayCamera.

### .cameraNear : UniformNode.<float> (constant)

TSL object that represents the `near` value of the camera used for the current render.

### .cameraNormalMatrix : UniformNode.<mat3> (constant)

TSL object that represents the normal matrix of the camera used for the current render.

### .cameraPosition : UniformNode.<vec3> (constant)

TSL object that represents the position in world space of the camera used for the current render.

### .cameraProjectionMatrix : UniformNode.<mat4> (constant)

TSL object that represents the projection matrix of the camera used for the current render.

### .cameraProjectionMatrixInverse : UniformNode.<mat4> (constant)

TSL object that represents the inverse projection matrix of the camera used for the current render.

### .cameraViewMatrix : UniformNode.<mat4> (constant)

TSL object that represents the view matrix of the camera used for the current render.

### .cameraViewport : UniformNode.<vec4> (constant)

TSL object that represents the viewport of the camera used for the current render.

### .cameraWorldMatrix : UniformNode.<mat4> (constant)

TSL object that represents the world matrix of the camera used for the current render.

### .clearcoat : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Clearcoat`.

### .clearcoatNormalView : Node.<vec3> (constant)

TSL object that represents the clearcoat vertex normal of the current rendered object in view space.

### .clearcoatRoughness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `ClearcoatRoughness`.

### .clipSpace : VaryingNode.<vec4> (constant)

TSL object that represents the clip space position of the current rendered object.

### .dashSize : PropertyNode.<float> (constant)

TSL object that represents the shader variable `dashSize`.

### .deltaTime : UniformNode.<float> (constant)

Represents the delta time in seconds.

### .depth : ViewportDepthNode (constant)

TSL object that represents the depth value for the current fragment.

### .diffuseColor : PropertyNode.<vec4> (constant)

TSL object that represents the shader variable `DiffuseColor`.

### .diffuseContribution : PropertyNode.<vec3> (constant)

TSL object that represents the shader variable `DiffuseContribution`.

### .directionToFaceDirection (constant)

Converts a direction vector to a face direction vector based on the material's side.

If the material is set to `BackSide`, the direction is inverted. If the material is set to `DoubleSide`, the direction is multiplied by `faceDirection`.

### .dispersion : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Dispersion`.

### .drawIndex : IndexNode (constant)

TSL object that represents the index of a draw call.

### .emissive : PropertyNode.<vec3> (constant)

TSL object that represents the shader variable `EmissiveColor`.

### .faceDirection : Node.<float> (constant)

TSL object that represents the front facing status as a number instead of a bool. `1` means front facing, `-1` means back facing.

### .frameGroup : UniformGroupNode (constant)

TSL object that represents a shared uniform group node which is updated once per frame.

### .frameId : UniformNode.<uint> (constant)

Represents the current frame ID.

### .frontFacing : FrontFacingNode.<bool> (constant)

TSL object that represents whether a primitive is front or back facing

### .gapSize : PropertyNode.<float> (constant)

TSL object that represents the shader variable `gapSize`.

### .globalId : ComputeBuiltinNode.<uvec3> (constant)

A non-linearized 3-dimensional representation of the current invocation's position within a 3D global grid.

### .highpModelNormalViewMatrix : Node.<mat3> (constant)

TSL object that represents the object's model normal view in `highp` precision which is achieved by computing the matrix in JS and not in the shader.

### .highpModelViewMatrix : Node.<mat4> (constant)

TSL object that represents the object's model view in `highp` precision which is achieved by computing the matrix in JS and not in the shader.

### .instanceIndex : IndexNode (constant)

TSL object that represents the index of either a mesh instance or an invocation of a compute shader.

### .invocationLocalIndex : IndexNode (constant)

TSL object that represents the index of a compute invocation within the scope of a workgroup load.

### .invocationSubgroupIndex : IndexNode (constant)

TSL object that represents the index of a compute invocation within the scope of a subgroup.

### .ior : PropertyNode.<float> (constant)

TSL object that represents the shader variable `IOR`.

### .iridescence : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Iridescence`.

### .iridescenceIOR : PropertyNode.<float> (constant)

TSL object that represents the shader variable `IridescenceIOR`.

### .iridescenceThickness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `IridescenceThickness`.

### .localId : ComputeBuiltinNode.<uvec3> (constant)

A non-linearized 3-dimensional representation of the current invocation's position within a 3D workgroup grid.

### .materialAO : Node.<float> (constant)

TSL object that represents the ambient occlusion map of the current material. The value is composed via `aoMap.r` - 1 \* `aoMapIntensity` + 1.

### .materialAlphaTest : Node.<float> (constant)

TSL object that represents alpha test of the current material.

### .materialAnisotropy : Node.<vec2> (constant)

TSL object that represents the anisotropy of the current material.

### .materialAnisotropyVector : Node.<vec2> (constant)

TSL object that represents the anisotropy vector of the current material.

### .materialAttenuationColor : Node.<vec3> (constant)

TSL object that represents the attenuation color of the current material.

### .materialAttenuationDistance : Node.<float> (constant)

TSL object that represents the attenuation distance of the current material.

### .materialClearcoat : Node.<float> (constant)

TSL object that represents the clearcoat of the current material. The value is composed via `clearcoat` \* `clearcoatMap.r`

### .materialClearcoatNormal : Node.<vec3> (constant)

TSL object that represents the clearcoat normal of the current material. The value will be either `clearcoatNormalMap` or `normalView`.

### .materialClearcoatRoughness : Node.<float> (constant)

TSL object that represents the clearcoat roughness of the current material. The value is composed via `clearcoatRoughness` \* `clearcoatRoughnessMap.r`.

### .materialColor : Node.<vec3> (constant)

TSL object that represents the diffuse color of the current material. The value is composed via `color` \* `map`.

### .materialDispersion : Node.<float> (constant)

TSL object that represents the dispersion of the current material.

### .materialEmissive : Node.<vec3> (constant)

TSL object that represents the emissive color of the current material. The value is composed via `emissive` \* `emissiveIntensity` \* `emissiveMap`.

### .materialEnvIntensity : Node.<float> (constant)

TSL object that represents the intensity of environment maps of PBR materials. When `material.envMap` is set, the value is `material.envMapIntensity` otherwise `scene.environmentIntensity`.

### .materialEnvRotation : Node.<mat4> (constant)

TSL object that represents the rotation of environment maps. When `material.envMap` is set, the value is `material.envMapRotation`. `scene.environmentRotation` controls the rotation of `scene.environment` instead.

### .materialIOR : Node.<float> (constant)

TSL object that represents the IOR of the current material.

### .materialIridescence : Node.<float> (constant)

TSL object that represents the iridescence of the current material.

### .materialIridescenceIOR : Node.<float> (constant)

TSL object that represents the iridescence IOR of the current material.

### .materialIridescenceThickness : Node.<float> (constant)

TSL object that represents the iridescence thickness of the current material.

### .materialLightMap : Node.<vec3> (constant)

TSL object that represents the light map of the current material. The value is composed via `lightMapIntensity` \* `lightMap.rgb`.

### .materialLineDashOffset : Node.<float> (constant)

TSL object that represents the dash offset of the current line material.

### .materialLineDashSize : Node.<float> (constant)

TSL object that represents the dash size of the current dashed line material.

### .materialLineGapSize : Node.<float> (constant)

TSL object that represents the gap size of the current dashed line material.

### .materialLineScale : Node.<float> (constant)

TSL object that represents the scale of the current dashed line material.

### .materialLineWidth : Node.<float> (constant)

TSL object that represents the line width of the current line material.

### .materialMetalness : Node.<float> (constant)

TSL object that represents the metalness of the current material. The value is composed via `metalness` \* `metalnessMap.b`.

### .materialNormal : Node.<vec3> (constant)

TSL object that represents the normal of the current material. The value will be either `normalMap` \* `normalScale`, `bumpMap` \* `bumpScale` or `normalView`.

### .materialOpacity : Node.<float> (constant)

TSL object that represents the opacity of the current material. The value is composed via `opacity` \* `alphaMap`.

### .materialPointSize : Node.<float> (constant)

TSL object that represents the point size of the current points material.

### .materialReflectivity : Node.<float> (constant)

TSL object that represents the reflectivity of the current material.

### .materialRefractionRatio : UniformNode.<float> (constant)

TSL object that represents the refraction ratio of the material used for rendering the current object.

### .materialRotation : Node.<float> (constant)

TSL object that represents the rotation of the current sprite material.

### .materialRoughness : Node.<float> (constant)

TSL object that represents the roughness of the current material. The value is composed via `roughness` \* `roughnessMap.g`.

### .materialSheen : Node.<vec3> (constant)

TSL object that represents the sheen color of the current material. The value is composed via `sheen` \* `sheenColor` \* `sheenColorMap`.

### .materialSheenRoughness : Node.<float> (constant)

TSL object that represents the sheen roughness of the current material. The value is composed via `sheenRoughness` \* `sheenRoughnessMap.a`.

### .materialShininess : Node.<float> (constant)

TSL object that represents the shininess of the current material.

### .materialSpecular : Node.<vec3> (constant)

TSL object that represents the specular of the current material.

### .materialSpecularColor : Node.<vec3> (constant)

TSL object that represents the specular color of the current material. The value is composed via `specularColor` \* `specularMap.rgb`.

### .materialSpecularIntensity : Node.<float> (constant)

TSL object that represents the specular intensity of the current material. The value is composed via `specularIntensity` \* `specularMap.a`.

### .materialSpecularStrength : Node.<float> (constant)

TSL object that represents the specular strength of the current material. The value is composed via `specularMap.r`.

### .materialThickness : Node.<float> (constant)

TSL object that represents the thickness of the current material. The value is composed via `thickness` \* `thicknessMap.g`.

### .materialTransmission : Node.<float> (constant)

TSL object that represents the transmission of the current material. The value is composed via `transmission` \* `transmissionMap.r`.

### .mediumpModelViewMatrix : Node.<mat4> (constant)

TSL object that represents the object's model view in `mediump` precision.

### .metalness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Metalness`.

### .modelDirection : ModelNode.<vec3> (constant)

TSL object that represents the object's direction in world space.

### .modelNormalMatrix : UniformNode.<mat3> (constant)

TSL object that represents the object's normal matrix.

### .modelPosition : ModelNode.<vec3> (constant)

TSL object that represents the object's position in world space.

### .modelRadius : ModelNode.<float> (constant)

TSL object that represents the object's radius.

### .modelScale : ModelNode.<vec3> (constant)

TSL object that represents the object's scale in world space.

### .modelViewMatrix : Node.<mat4> (constant)

TSL object that represents the object's model view matrix.

### .modelViewPosition : ModelNode.<vec3> (constant)

TSL object that represents the object's position in view/camera space.

### .modelViewProjection : VaryingNode.<vec4> (constant)

TSL object that represents the position in clip space after the model-view-projection transform of the current rendered object.

### .modelWorldMatrix : ModelNode.<mat4> (constant)

TSL object that represents the object's world matrix.

### .modelWorldMatrixInverse : UniformNode.<mat4> (constant)

TSL object that represents the object's inverse world matrix.

### .normalFlat : Node.<vec3> (constant)

TSL object that represents the flat vertex normal of the current rendered object in view space.

### .normalGeometry : Node.<vec3> (constant)

TSL object that represents the normal attribute of the current rendered object in local space.

### .normalLocal : Node.<vec3> (constant)

TSL object that represents the vertex normal of the current rendered object in local space.

### .normalView : Node.<vec3> (constant)

TSL object that represents the vertex normal of the current rendered object in view space.

### .normalViewGeometry : Node.<vec3> (constant)

TSL object that represents the vertex normal of the current rendered object in view space.

### .normalWorld : Node.<vec3> (constant)

TSL object that represents the vertex normal of the current rendered object in world space.

### .normalWorldGeometry : Node.<vec3> (constant)

TSL object that represents the vertex normal of the current rendered object in world space.

### .numWorkgroups : ComputeBuiltinNode.<uvec3> (constant)

Represents the number of workgroups dispatched by the compute shader.

```js
// Run 512 invocations/threads with a workgroup size of 128.
const computeFn = Fn(() => {
    // numWorkgroups.x = 4
    storageBuffer.element(0).assign(numWorkgroups.x)
})().compute(512, [128]);
// Run 512 invocations/threads with the default workgroup size of 64.
const computeFn = Fn(() => {
    // numWorkgroups.x = 8
    storageBuffer.element(0).assign(numWorkgroups.x)
})().compute(512);
```

### .objectGroup : UniformGroupNode (constant)

TSL object that represents a uniform group node which is updated once per object.

### .output : PropertyNode.<vec4> (constant)

TSL object that represents the shader variable `Output`.

### .parallaxDirection : Node.<mat3> (constant)

TSL object that represents the parallax direction.

### .pointUV : PointUVNode (constant)

TSL object that represents the uv coordinates of points.

### .pointWidth : PropertyNode.<float> (constant)

TSL object that represents the shader variable `pointWidth`.

### .positionGeometry : AttributeNode.<vec3> (constant)

TSL object that represents the position attribute of the current rendered object.

### .positionLocal : AttributeNode.<vec3> (constant)

TSL object that represents the vertex position in local space of the current rendered object.

### .positionPrevious : AttributeNode.<vec3> (constant)

TSL object that represents the previous vertex position in local space of the current rendered object. Used in context of [VelocityNode](VelocityNode.html) for rendering motion vectors.

### .positionView : VaryingNode.<vec3> (constant)

TSL object that represents the vertex position in view space of the current rendered object.

### .positionViewDirection : VaryingNode.<vec3> (constant)

TSL object that represents the position view direction of the current rendered object.

### .positionWorld : VaryingNode.<vec3> (constant)

TSL object that represents the vertex position in world space of the current rendered object.

### .positionWorldDirection : Node.<vec3> (constant)

TSL object that represents the position world direction of the current rendered object.

### .reflectVector : Node.<vec3> (constant)

Used for sampling cube maps when using cube reflection mapping.

### .reflectView : Node.<vec3> (constant)

The reflect vector in view space.

### .refractVector : Node.<vec3> (constant)

Used for sampling cube maps when using cube refraction mapping.

### .refractView : Node.<vec3> (constant)

The refract vector in view space.

### .renderGroup : UniformGroupNode (constant)

TSL object that represents a shared uniform group node which is updated once per render.

### .roughness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Roughness`.

### .screenCoordinate : ScreenNode.<vec2> (constant)

TSL object that represents the current `x`/`y` pixel position on the screen in physical pixel units.

### .screenDPR : ScreenNode.<float> (constant)

TSL object that represents the current DPR.

### .screenSize : ScreenNode.<vec2> (constant)

TSL object that represents the screen resolution in physical pixel units.

### .screenUV : ScreenNode.<vec2> (constant)

TSL object that represents normalized screen coordinates, unitless in `[0, 1]`.

### .shadowPositionWorld : Node.<vec3> (constant)

TSL object that represents the vertex position in world space during the shadow pass.

### .sheen : PropertyNode.<vec3> (constant)

TSL object that represents the shader variable `Sheen`.

### .sheenRoughness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `SheenRoughness`.

### .shininess : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Shininess`.

### .specularColor : PropertyNode.<color> (constant)

TSL object that represents the shader variable `SpecularColor`.

### .specularColorBlended : PropertyNode.<color> (constant)

TSL object that represents the shader variable `SpecularColorBlended`.

### .specularF90 : PropertyNode.<float> (constant)

TSL object that represents the shader variable `SpecularF90`.

### .subgroupIndex : IndexNode (constant)

TSL object that represents the index of the subgroup the current compute invocation belongs to.

### .subgroupSize : ComputeBuiltinNode.<uint> (constant)

A device dependent variable that exposes the size of the current invocation's subgroup.

### .tangentGeometry : Node.<vec4> (constant)

TSL object that represents the tangent attribute of the current rendered object.

### .tangentLocal : Node.<vec3> (constant)

TSL object that represents the vertex tangent in local space of the current rendered object.

### .tangentView : Node.<vec3> (constant)

TSL object that represents the vertex tangent in view space of the current rendered object.

### .tangentViewFrame : Node.<vec3> (constant)

Tangent vector in view space, computed dynamically from geometry and UV derivatives. Useful for normal mapping without precomputed tangents.

Reference: http://www.thetenthplanet.de/archives/1180

### .tangentWorld : Node.<vec3> (constant)

TSL object that represents the vertex tangent in world space of the current rendered object.

### .thickness : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Thickness`.

### .time : UniformNode.<float> (constant)

Represents the elapsed time in seconds.

### .toneMappingExposure : RendererReferenceNode.<vec3> (constant)

TSL object that represents the global tone mapping exposure of the renderer.

### .transformedClearcoatNormalView : Node.<vec3> (constant)

TSL object that represents the transformed clearcoat vertex normal of the current rendered object in view space.

**Deprecated:** since r178. Use \`clearcoatNormalView\` instead.

### .transformedNormalView : Node.<vec3> (constant)

TSL object that represents the transformed vertex normal of the current rendered object in view space.

**Deprecated:** since r178. Use \`normalView\` instead.

### .transformedNormalWorld : Node.<vec3> (constant)

TSL object that represents the transformed vertex normal of the current rendered object in world space.

**Deprecated:** since r178. Use \`normalWorld\` instead.

### .transmission : PropertyNode.<float> (constant)

TSL object that represents the shader variable `Transmission`.

### .velocity : VelocityNode (constant)

TSL object that represents the velocity of a render pass.

### .vertexIndex : IndexNode (constant)

TSL object that represents the index of a vertex within a mesh.

### .viewport : ScreenNode.<vec4> (constant)

TSL object that represents the viewport rectangle as `x`, `y`, `width` and `height` in physical pixel units.

### .viewportCoordinate : ScreenNode.<vec2> (constant)

TSL object that represents the current `x`/`y` pixel position on the viewport in physical pixel units.

### .viewportLinearDepth : ViewportDepthNode (constant)

TSL object that represents the linear (orthographic) depth value of the current fragment

### .viewportSize : ScreenNode.<vec2> (constant)

TSL object that represents the viewport resolution in physical pixel units.

### .viewportUV : ScreenNode.<vec2> (constant)

TSL object that represents normalized viewport coordinates, unitless in `[0, 1]`.

### .workgroupId : ComputeBuiltinNode.<uvec3> (constant)

Represents the 3-dimensional index of the workgroup the current compute invocation belongs to.

```js
// Execute 12 compute threads with a workgroup size of 3.
const computeFn = Fn( () => {
	If( workgroupId.x.mod( 2 ).equal( 0 ), () => {
		storageBuffer.element( instanceIndex ).assign( instanceIndex );
	} ).Else( () => {
		storageBuffer.element( instanceIndex ).assign( 0 );
	} );
} )().compute( 12, [ 3 ] );
// workgroupId.x =  [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
// Buffer Output =  [0, 1, 2, 0, 0, 0, 6, 7, 8, 0, 0, 0];
```

## Methods

### .Break() : ExpressionNode

TSL function for creating a `Break()` expression.

### .Const( node : Node, name : string ) : VarNode

TSL function for creating a const node.

**node**

The node for which a constant should be created.

**name**

The name of the constant in the shader.

### .Continue() : ExpressionNode

TSL function for creating a `Continue()` expression.

### .Discard( conditional : ConditionalNode ) : Node

Represents a `discard` shader operation in TSL.

**conditional**

An optional conditional node. It allows to decide whether the discard should be executed or not.

**Returns:** The `discard` expression.

### .If( …params : any ) : StackNode

Represent a conditional node using if/else statements.

```js
If( condition, function )
	.ElseIf( condition, function )
	.Else( function )
```

**params**

The parameters for the conditional node.

**Returns:** The conditional node.

### .Loop( …params : any ) : LoopNode

TSL function for creating a loop node.

**params**

A list of parameters.

### .Return() : ExpressionNode

Represents a `return` shader operation in TSL.

**Returns:** The `return` expression.

### .Switch( …params : any ) : StackNode

Represent a conditional node using switch/case statements.

```js
Switch( value )
	.Case( 1, function )
	.Case( 2, 3, 4, function )
	.Default( function )
```

**params**

The parameters for the conditional node.

**Returns:** The conditional node.

### .Var( node : Node, name : string ) : VarNode

TSL function for creating a var node.

**node**

The node for which a variable should be created.

**name**

The name of the variable in the shader.

### .VarIntent( node : Node, name : string ) : VarNode

TSL function for creating a var intent node.

**node**

The node for which a variable should be created.

**name**

The name of the variable in the shader.

### .abs( x : Node | number ) : Node

Returns the absolute value of the parameter.

**x**

The parameter.

### .acesFilmicToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

ACESFilmic tone mapping.

Reference: [https://github.com/selfshadow/ltc\_code/blob/master/webgl/shaders/ltc/ltc\_blit.fs](https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs)

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .acos( x : Node | number ) : Node

Returns the arccosine of the parameter.

**x**

The parameter.

### .add( a : Node, b : Node, …params : Node ) : OperatorNode

Returns the addition of two or more value.

**a**

The first input.

**b**

The second input.

**params**

Additional input parameters.

### .afterImage( node : Node.<vec4>, damp : Node.<float> | number ) : AfterImageNode

TSL function for creating an after image node for post processing.

**node**

The node that represents the input of the effect.

**damp**

The damping intensity. A higher value means a stronger after image effect.

Default is `0.96`.

### .agxToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

AgX tone mapping.

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .all( x : Node | number ) : Node.<bool>

Returns `true` if all components of `x` are `true`.

**x**

The parameter.

### .anaglyphPass( scene : Scene, camera : Camera ) : AnaglyphPassNode

TSL function for creating an anaglyph pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

### .anamorphic( node : TextureNode, threshold : Node.<float> | number, scale : Node.<float> | number, samples : number ) : AnamorphicNode

TSL function for creating an anamorphic flare effect.

**node**

The node that represents the input of the effect.

**threshold**

The threshold is one option to control the intensity and size of the effect.

Default is `0.9`.

**scale**

Defines the vertical scale of the flares.

Default is `3`.

**samples**

More samples result in larger flares and a more expensive runtime behavior.

Default is `32`.

### .and( …nodes : Node ) : OperatorNode

Performs a logical AND operation on multiple nodes.

**nodes**

The input nodes to be combined using AND.

### .any( x : Node | number ) : Node.<bool>

Returns `true` if any components of `x` are `true`.

**x**

The parameter.

### .ao( depthNode : Node.<float>, normalNode : Node.<vec3>, camera : Camera ) : GTAONode

TSL function for creating a Ground Truth Ambient Occlusion (GTAO) effect.

**depthNode**

A node that represents the scene's depth.

**normalNode**

A node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

### .append( node : Node ) : function

**node**

The node to add.

**Deprecated:** since r176. Use [Stack](global.html#Stack) instead.

### .array( nodeTypeOrValues : string | Array.<Node>, count : number ) : ArrayNode

TSL function for creating an array node.

**nodeTypeOrValues**

A string representing the element type (e.g., 'vec3') or an array containing the default values (e.g., \[ vec3() \]).

**count**

Size of the array.

### .asin( x : Node | number ) : Node

Returns the arcsine of the parameter.

**x**

The parameter.

### .assign( targetNode : Node, sourceNode : Node ) : AssignNode

TSL function for creating an assign node.

**targetNode**

The target node.

**sourceNode**

The source type.

### .atan( y : Node | number, x : Node | number ) : Node

Returns the arc-tangent of the parameter. If two parameters are provided, the result is `atan2(y/x)`.

**y**

The y parameter.

**x**

The x parameter.

### .atomicAdd( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Increments the value stored in the atomic variable.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicAnd( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores in an atomic variable the bitwise AND of its value with a parameter.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicFunc( method : string, pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

TSL function for appending an atomic function call into the programmatic flow of a compute shader.

**method**

The signature of the atomic function to construct.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicLoad( pointerNode : Node ) : AtomicFunctionNode

Loads the value stored in the atomic variable.

**pointerNode**

An atomic variable or element of an atomic buffer.

### .atomicMax( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores in an atomic variable the maximum between its current value and a parameter.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicMin( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores in an atomic variable the minimum between its current value and a parameter.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicNode( method : string, pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

TSL function for creating an atomic function node.

**method**

The signature of the atomic function to construct.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicOr( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores in an atomic variable the bitwise OR of its value with a parameter.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicStore( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores a value in the atomic variable.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicSub( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Decrements the value stored in the atomic variable.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .atomicXor( pointerNode : Node, valueNode : Node ) : AtomicFunctionNode

Stores in an atomic variable the bitwise XOR of its value with a parameter.

**pointerNode**

An atomic variable or element of an atomic buffer.

**valueNode**

The value that mutates the atomic variable.

### .attribute( name : string, nodeType : string ) : AttributeNode

TSL function for creating an attribute node.

**name**

The name of the attribute.

**nodeType**

The node type.

Default is `null`.

### .attributeArray( count : number | TypedArray, type : string | Struct ) : StorageBufferNode

TSL function for creating a storage buffer node with a configured `StorageBufferAttribute`.

**count**

The data count. It is also valid to pass a typed array as an argument.

**type**

The data type.

Default is `'float'`.

### .barrelMask( coord : Node.<vec2> ) : Node.<float>

Checks if UV coordinates are inside the valid 0-1 range. Useful for masking areas inside the distorted screen.

**coord**

The UV coordinates to check.

**Returns:** 1.0 if inside bounds, 0.0 if outside.

### .barrelUV( curvature : Node.<float>, coord : Node.<vec2> ) : Node.<vec2>

Creates barrel-distorted UV coordinates. The center of the screen appears to bulge outward (convex distortion).

**curvature**

The amount of curvature (0 = flat, 0.5 = very curved).

Default is `0.1`.

**coord**

The input UV coordinates.

Default is `uv()`.

**Returns:** The distorted UV coordinates.

### .barrier( scope : string ) : BarrierNode

TSL function for creating a barrier node.

**scope**

The scope defines the behavior of the node..

### .batch( batchMesh : BatchedMesh ) : BatchNode

TSL function for creating a batch node.

**batchMesh**

A reference to batched mesh.

### .bentNormalView() : Node.<vec3>

TSL function for computing bent normals.

**Returns:** Bent normals.

### .bilateralBlur( node : Node.<vec4>, directionNode : Node.<(vec2|float)>, sigma : number, sigmaColor : number ) : BilateralBlurNode

TSL function for creating a bilateral blur node for post processing.

Bilateral blur smooths an image while preserving sharp edges by considering both spatial distance and color/intensity differences between pixels.

**node**

The node that represents the input of the effect.

**directionNode**

Defines the direction and radius of the blur.

**sigma**

Controls the spatial kernel of the blur filter. Higher values mean a wider blur radius.

**sigmaColor**

Controls the intensity kernel. Higher values allow more color difference to be blurred together.

### .billboarding( config : Object ) : Node.<vec3>

This can be used to achieve a billboarding behavior for flat meshes. That means they are oriented always towards the camera.

```js
material.vertexNode = billboarding();
```

**config**

The configuration object.

**position**

Can be used to define the vertex positions in world space.

Default is `null`.

**horizontal**

Whether to follow the camera rotation horizontally or not.

Default is `true`.

**vertical**

Whether to follow the camera rotation vertically or not.

Default is `false`.

**Returns:** The updated vertex position in clip space.

### .bitAnd( a : Node, b : Node ) : OperatorNode

Performs bitwise AND on two nodes.

**a**

The first input.

**b**

The second input.

### .bitNot( a : Node, b : Node ) : OperatorNode

Performs bitwise NOT on a node.

**a**

The first input.

**b**

The second input.

### .bitOr( a : Node, b : Node ) : OperatorNode

Performs bitwise OR on two nodes.

**a**

The first input.

**b**

The second input.

### .bitXor( a : Node, b : Node ) : OperatorNode

Performs bitwise XOR on two nodes.

**a**

The first input.

**b**

The second input.

### .bitcast( x : Node | number, y : string ) : Node

Reinterpret the bit representation of a value in one type as a value in another type.

**x**

The parameter.

**y**

The new type.

### .bleach( color : Node.<vec4>, opacity : Node.<float> ) : Node.<vec4>

Applies a bleach bypass effect to the given color node.

**color**

The color node to apply the sepia for.

**opacity**

Influences how strong the effect is blended with the original color.

Default is `1`.

**Returns:** The updated color node.

### .blendBurn( base : Node.<vec3>, blend : Node.<vec3> ) : Node.<vec3>

Represents a "Color Burn" blend mode.

It's designed to darken the base layer's colors based on the color of the blend layer. It significantly increases the contrast of the base layer, making the colors more vibrant and saturated. The darker the color in the blend layer, the stronger the darkening and contrast effect on the base layer.

**base**

The base color.

**blend**

The blend color. A white (#ffffff) blend color does not alter the base color.

**Returns:** The result.

### .blendColor( base : Node.<vec4>, blend : Node.<vec4> ) : Node.<vec4>

This function blends two color based on their alpha values by replicating the behavior of `THREE.NormalBlending`. It assumes both input colors have non-premultiplied alpha.

**base**

The base color.

**blend**

The blend color

**Returns:** The result.

### .blendDodge( base : Node.<vec3>, blend : Node.<vec3> ) : Node.<vec3>

Represents a "Color Dodge" blend mode.

It's designed to lighten the base layer's colors based on the color of the blend layer. It significantly increases the brightness of the base layer, making the colors lighter and more vibrant. The brighter the color in the blend layer, the stronger the lightening and contrast effect on the base layer.

**base**

The base color.

**blend**

The blend color. A black (#000000) blend color does not alter the base color.

**Returns:** The result.

### .blendOverlay( base : Node.<vec3>, blend : Node.<vec3> ) : Node.<vec3>

Represents a "Overlay" blend mode.

It's designed to increase the contrast of the base layer based on the color of the blend layer. It amplifies the existing colors and contrast in the base layer, making lighter areas lighter and darker areas darker. The color of the blend layer significantly influences the resulting contrast and color shift in the base layer.

**base**

The base color.

**blend**

The blend color

**Returns:** The result.

### .blendScreen( base : Node.<vec3>, blend : Node.<vec3> ) : Node.<vec3>

Represents a "Screen" blend mode.

Similar to `blendDodge()`, this mode also lightens the base layer's colors based on the color of the blend layer. The "Screen" blend mode is better for general brightening whereas the "Dodge" results in more subtle and nuanced effects.

**base**

The base color.

**blend**

The blend color. A black (#000000) blend color does not alter the base color.

**Returns:** The result.

### .bloom( node : Node.<vec4>, strength : number, radius : number, threshold : number ) : BloomNode

TSL function for creating a bloom effect.

**node**

The node that represents the input of the effect.

**strength**

The strength of the bloom.

Default is `1`.

**radius**

The radius of the bloom.

Default is `0`.

**threshold**

The luminance threshold limits which bright areas contribute to the bloom effect.

Default is `0`.

### .boxBlur( textureNode : Node.<vec4>, options : Object ) : Node.<vec4>

Applies a box blur effect to the given texture node.

Compared to Gaussian blur, box blur produces a more blocky result but with better performance when correctly configured. It is intended for mobile devices or performance restricted use cases where Gaussian is too heavy.

The (kernel) `size` parameter should be small (1, 2 or 3) since it determines the number of samples based on (size \* 2 + 1)^2. This implementation uses a single pass approach so the kernel is not applied as a separable filter. That means larger kernels won't perform well. Use Gaussian instead if you need a more high-quality blur.

To produce wider blurs, increase the `separation` parameter instead which has no influence on the performance.

Reference: [https://github.com/lettier/3d-game-shaders-for-beginners/blob/master/demonstration/shaders/fragment/box-blur.frag](https://github.com/lettier/3d-game-shaders-for-beginners/blob/master/demonstration/shaders/fragment/box-blur.frag).

**textureNode**

The texture node that should be blurred.

**options**

Additional options for the hash blur effect.

Default is `{}`.

**size**

Controls the blur's kernel. For performant results, the range should within \[1, 3\].

Default is `int(1)`.

**separation**

Spreads out the blur without having to sample additional fragments. Ranges from \[1, Infinity\].

Default is `int(1)`.

**premultipliedAlpha**

Whether to use premultiplied alpha for the blur effect.

Default is `false`.

**Returns:** The blurred texture node.

### .buffer( value : Array.<number>, type : string, count : number ) : BufferNode

TSL function for creating a buffer node.

**value**

Array-like buffer data.

**type**

The data type of a buffer element.

**count**

The count of buffer elements.

### .bufferAttribute( array : BufferAttribute | InterleavedBuffer | TypedArray, type : string, stride : number, offset : number ) : BufferAttributeNode | Node

TSL function for creating a buffer attribute node.

**array**

The attribute data.

**type**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**stride**

The buffer stride.

Default is `0`.

**offset**

The buffer offset.

Default is `0`.

### .builtin( name : string ) : BuiltinNode

TSL function for creating a builtin node.

**name**

The name of the built-in shader variable.

### .builtinAOContext( aoNode : Node, node : Node ) : ContextNode

TSL function for defining a built-in ambient occlusion context for a given node.

**aoNode**

The ambient occlusion value node to apply.

**node**

The node whose context should be modified.

Default is `null`.

### .builtinShadowContext( shadowNode : ShadowNode, light : Light, node : Node ) : ContextNode

TSL function for defining a built-in shadow context for a given node.

**shadowNode**

The shadow node representing the light's shadow.

**light**

The light associated with the shadow.

**node**

The node whose context should be modified.

Default is `null`.

### .bumpMap( textureNode : Node.<float>, scaleNode : Node.<float> ) : BumpMapNode

TSL function for creating a bump map node.

**textureNode**

Represents the bump map data.

**scaleNode**

Controls the intensity of the bump effect.

Default is `null`.

### .bypass( outputNode : Node, callNode : Node ) : BypassNode

TSL function for creating a bypass node.

**outputNode**

The output node.

**callNode**

The call node.

### .cache( node : Node, parent : boolean ) : IsolateNode

TSL function for creating a cache node.

**node**

The node that should be cached.

**parent**

Whether this node refers to a shared parent cache or not.

Default is `true`.

**Deprecated:** Yes

### .cbrt( a : Node | number ) : Node

Returns the cube root of a number.

**a**

The first parameter.

### .cdl( color : Node.<vec4>, slope : Node.<vec3>, offset : Node.<vec3>, power : Node.<vec3>, saturation : Node.<float>, luminanceCoefficients : Node.<vec3> ) : Node.<vec4>

Color Decision List (CDL) v1.2

Compact representation of color grading information, defined by slope, offset, power, and saturation. The CDL should be typically be given input in a log space (such as LogC, ACEScc, or AgX Log), and will return output in the same space. Output may require clamping >=0.

**color**

Input (-Infinity < input < +Infinity)

**slope**

Slope (0 ≤ slope < +Infinity)

**offset**

Offset (-Infinity < offset < +Infinity; typically -1 < offset < 1)

**power**

Power (0 < power < +Infinity)

**saturation**

Saturation (0 ≤ saturation < +Infinity; typically 0 ≤ saturation < 4)

**luminanceCoefficients**

Luminance coefficients for saturation term, typically Rec. 709

**Returns:**

Output, -Infinity < output < +Infinity

References:

*   ASC CDL v1.2
*   [https://blender.stackexchange.com/a/55239/43930](https://blender.stackexchange.com/a/55239/43930)
*   [https://docs.acescentral.com/specifications/acescc/](https://docs.acescentral.com/specifications/acescc/)

### .ceil( x : Node | number ) : Node

Finds the nearest integer that is greater than or equal to the parameter.

**x**

The parameter.

### .checker( coord : Node.<vec2> ) : Node.<float>

Creates a 2x2 checkerboard pattern that can be used as procedural texture data.

**coord**

The uv coordinates.

**Returns:** The result data.

### .chromaticAberration( node : Node.<vec4>, strength : Node | number, center : Node | Vector2, scale : Node | number ) : ChromaticAberrationNode

TSL function for creating a chromatic aberration node for post processing.

**node**

The node that represents the input of the effect.

**strength**

The strength of the chromatic aberration effect as a node or value.

Default is `1.0`.

**center**

The center point of the effect as a node or value. If null, uses screen center (0.5, 0.5).

Default is `null`.

**scale**

The scale factor for stepped scaling from center as a node or value.

Default is `1.1`.

### .cineonToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

Cineon tone mapping.

Reference: [http://filmicworlds.com/blog/filmic-tonemapping-operators/](http://filmicworlds.com/blog/filmic-tonemapping-operators/)

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .circle( scale : Node.<float>, softness : Node.<float>, coord : Node.<vec2> ) : Node.<float>

Returns a radial gradient from center (white) to edges (black). Useful for masking effects based on distance from center.

**scale**

Controls the size of the gradient (0 = all black, 1 = full circle).

Default is `1.0`.

**softness**

Controls the edge softness (0 = hard edge, 1 = soft gradient).

Default is `0.5`.

**coord**

The input UV coordinates.

Default is `uv()`.

**Returns:** 1.0 at center, 0.0 at edges.

### .circleIntersectsAABB( circleCenter : Node.<vec2>, radius : Node.<float>, minBounds : Node.<vec2>, maxBounds : Node.<vec2> ) : Node.<bool>

TSL function that checks if a circle intersects with an axis-aligned bounding box (AABB).

**circleCenter**

The center of the circle.

**radius**

The radius of the circle.

**minBounds**

The minimum bounds of the AABB.

**maxBounds**

The maximum bounds of the AABB.

**Returns:** True if the circle intersects the AABB.

### .clamp( value : Node | number, low : Node | number, high : Node | number ) : Node

Constrains a value to lie between two further values.

**value**

The value to constrain.

**low**

The lower bound.

Default is `0`.

**high**

The upper bound.

Default is `1`.

### .clipping() : ClippingNode

TSL function for setting up the default clipping logic.

### .clippingAlpha() : ClippingNode

TSL function for setting up alpha to coverage.

### .code( code : string, includes : Array.<Node>, language : 'js' | 'wgsl' | 'glsl' ) : CodeNode

TSL function for creating a code node.

**code**

The native code.

**includes**

An array of includes.

Default is `[]`.

**language**

The used language.

Default is `''`.

### .colorBleeding( color : Node, amount : Node.<float> ) : Node.<vec3>

Applies color bleeding effect to simulate horizontal color smearing. Simulates the analog signal bleeding in CRT displays where colors "leak" into adjacent pixels horizontally.

**color**

The input texture node.

**amount**

The amount of color bleeding (0-0.01).

Default is `0.002`.

**Returns:** The color with bleeding effect applied.

### .colorSpaceToWorking( node : Node, sourceColorSpace : string ) : ColorSpaceNode

TSL function for converting a given color node from the given color space to the current working color space.

**node**

Represents the node to convert.

**sourceColorSpace**

The source color space.

### .colorToDirection( node : Node.<vec3> ) : Node.<vec3>

Unpacks a color value into a direction vector.

**node**

The color to unpack.

**Returns:** The direction.

### .compute( node : Node, count : number | Array.<number>, workgroupSize : Array.<number> ) : AtomicFunctionNode

TSL function for creating a compute node.

**node**

TODO

**count**

TODO.

**workgroupSize**

TODO.

Default is `[64]`.

### .computeBuiltin( name : string, nodeType : string ) : ComputeBuiltinNode

TSL function for creating a compute builtin node.

**name**

The built-in name.

**nodeType**

The node type.

### .computeKernel( node : Node, workgroupSize : Array.<number> ) : AtomicFunctionNode

TSL function for creating a compute kernel node.

**node**

TODO

**workgroupSize**

TODO.

Default is `[64]`.

### .computeSkinning( skinnedMesh : SkinnedMesh, toPosition : Node.<vec3> ) : SkinningNode

TSL function for computing skinning.

**skinnedMesh**

The skinned mesh.

**toPosition**

The target position.

Default is `null`.

### .context( nodeOrValue : Node | Object, value : Object ) : ContextNode

TSL function for creating a context node.

**nodeOrValue**

The node whose context should be modified or the modified context data.

Default is `{}`.

**value**

The modified context data.

Default is `{}`.

### .convertColorSpace( node : Node, sourceColorSpace : string, targetColorSpace : string ) : ColorSpaceNode

TSL function for converting a given color node from one color space to another one.

**node**

Represents the node to convert.

**sourceColorSpace**

The source color space.

**targetColorSpace**

The target color space.

### .convertToTexture( node : Node, width : number, height : number, options : Object ) : RTTNode

TSL function for converting nodes to textures nodes.

**node**

The node to render a texture with.

**width**

The width of the internal render target. If not width is applied, the render target is automatically resized.

Default is `null`.

**height**

The height of the internal render target.

Default is `null`.

**options**

The options for the internal render target.

Default is `{type:HalfFloatType}`.

### .cos( x : Node | number ) : Node

Returns the cosine of the parameter.

**x**

The parameter.

### .countLeadingZeros( x : Node | number ) : Node

Finds the number of consecutive 0 bits starting from the most significant bit of the input value.

Can only be used with [WebGPURenderer](WebGPURenderer.html) and a WebGPU backend.

**x**

The input value.

### .countOneBits() : Node

Finds the number of '1' bits set in the input value

Can only be used with [WebGPURenderer](WebGPURenderer.html) and a WebGPU backend.

### .countTrailingZeros( x : Node | number ) : Node

Finds the number of consecutive 0 bits from the least significant bit of the input value, which is also the index of the least significant bit of the input value.

Can only be used with [WebGPURenderer](WebGPURenderer.html) and a WebGPU backend.

**x**

The input value.

### .createVar( node : Node, name : string ) : VarNode

TSL function for creating a var node.

**node**

The node for which a variable should be created.

**name**

The name of the variable in the shader.

### .cross( x : Node.<(vec2|vec3)>, y : Node.<(vec2|vec3)> ) : Node.<(float|vec3)>

Calculates the cross product of two vectors.

**x**

The first vector.

**y**

The second vector.

### .cubeMapNode( envNode : Node ) : CubeMapNode

TSL function for creating a cube map node.

**envNode**

The node representing the environment map.

### .cubeTexture( value : CubeTexture | CubeTextureNode, uvNode : Node.<vec3>, levelNode : Node.<int>, biasNode : Node.<float> ) : CubeTextureNode

TSL function for creating a cube texture uniform node.

**value**

The cube texture.

Default is `EmptyTexture`.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .cubeTextureBase( value : CubeTexture, uvNode : Node.<vec3>, levelNode : Node.<int>, biasNode : Node.<float> ) : CubeTextureNode

TSL function for creating a cube texture node.

**value**

The cube texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .dFdx( x : Node | number ) : Node

Returns the partial derivative of the parameter with respect to x.

**x**

The parameter.

### .dFdy( x : Node | number ) : Node

Returns the partial derivative of the parameter with respect to y.

**x**

The parameter.

### .debug( node : Node, callback : function ) : DebugNode

TSL function for creating a debug node.

**node**

The node to debug.

**callback**

Optional callback function to handle the debug output.

Default is `null`.

### .decrement( a : Node ) : OperatorNode

Decrements a node by 1 and returns the previous value.

**a**

The node to decrement.

### .decrementBefore( a : Node ) : OperatorNode

Decrements a node by 1.

**a**

The node to decrement.

### .degrees( x : Node | number ) : Node

Convert a quantity in radians to degrees.

**x**

The input in radians.

### .denoise( node : Node, depthNode : Node.<float>, normalNode : Node.<vec3>, camera : Camera ) : DenoiseNode

TSL function for creating a denoise effect.

**node**

The node that represents the input of the effect (e.g. AO).

**depthNode**

A node that represents the scene's depth.

**normalNode**

A node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

### .densityFogFactor( density : Node )

Represents an exponential squared fog. This type of fog gives a clear view near the camera and a faster than exponentially densening fog farther from the camera.

**density**

Defines the fog density.

### .depthBase( value : Node.<float> ) : ViewportDepthNode.<float>

TSL function for defining a value for the current fragment's depth.

**value**

The depth value to set.

### .depthPass( scene : Scene, camera : Camera, options : Object ) : PassNode

TSL function for creating a depth pass node.

**scene**

A reference to the scene.

**camera**

A reference to the camera.

**options**

Options for the internal render target.

### .determinant( x : Node.<(mat2|mat3|mat4)> ) : Node.<float>

Returns the determinant of a matrix.

**x**

The parameter.

### .difference( x : Node | number, y : Node | number ) : Node

Calculates the absolute difference between two values.

**x**

The first parameter.

**y**

The second parameter.

### .directionToColor( node : Node.<vec3> ) : Node.<vec3>

Packs a direction vector into a color value.

**node**

The direction to pack.

**Returns:** The color.

### .distance( x : Node.<(vec2|vec3|vec4)>, y : Node.<(vec2|vec3|vec4)> ) : Node.<float>

Calculates the distance between two points.

**x**

The first point.

**y**

The second point.

### .div( a : Node, b : Node, …params : Node ) : OperatorNode

Returns the division of two or more value.

**a**

The first input.

**b**

The second input.

**params**

Additional input parameters.

### .dof( node : Node.<vec4>, viewZNode : Node.<float>, focusDistance : Node.<float> | number, focalLength : Node.<float> | number, bokehScale : Node.<float> | number ) : DepthOfFieldNode

TSL function for creating a depth-of-field effect (DOF) for post processing.

**node**

The node that represents the input of the effect.

**viewZNode**

Represents the viewZ depth values of the scene.

**focusDistance**

Defines the effect's focus which is the distance along the camera's look direction in world units.

**focalLength**

How far an object can be from the focal plane before it goes completely out-of-focus in world units.

**bokehScale**

A unitless value for artistic purposes to adjust the size of the bokeh.

### .dot( x : Node.<(vec2|vec3|vec4)>, y : Node.<(vec2|vec3|vec4)> ) : Node.<float>

Calculates the dot product of two vectors.

**x**

The first vector.

**y**

The second vector.

### .dotScreen( node : Node.<vec4>, angle : number, scale : number ) : DotScreenNode

TSL function for creating a dot-screen node for post processing.

**node**

The node that represents the input of the effect.

**angle**

The rotation of the effect in radians.

Default is `1.57`.

**scale**

The scale of the effect. A higher value means smaller dots.

Default is `1`.

### .dynamicBufferAttribute( array : BufferAttribute | InterleavedBuffer | TypedArray, type : string, stride : number, offset : number ) : BufferAttributeNode | Node

TSL function for creating a buffer attribute node but with dynamic draw usage. Use this function if attribute data are updated per frame.

**array**

The attribute data.

**type**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**stride**

The buffer stride.

Default is `0`.

**offset**

The buffer offset.

Default is `0`.

### .equal( a : Node, b : Node ) : OperatorNode

Checks if two nodes are equal.

**a**

The first input.

**b**

The second input.

### .equirectUV( dirNode : Node.<vec3> ) : Node.<vec2>

TSL function for creating an equirect uv node.

Can be used to compute texture coordinates for projecting an equirectangular texture onto a mesh for using it as the scene's background.

```js
scene.backgroundNode = texture( equirectTexture, equirectUV() );
```

**dirNode**

A direction vector for sampling which is by default `positionWorldDirection`.

Default is `positionWorldDirection`.

### .exp( x : Node | number ) : Node

Returns the natural exponentiation of the parameter.

**x**

The parameter.

### .exp2( x : Node | number ) : Node

Returns 2 raised to the power of the parameter.

**x**

The parameter.

### .exponentialHeightFogFactor( density : Node, height : Node )

Constructs a new height fog factor node. This fog factor requires a Y-up coordinate system.

**density**

Defines the fog density.

**height**

The height threshold in world space. Everything below this y-coordinate is affected by fog.

### .expression( snippet : string, nodeType : string ) : ExpressionNode

TSL function for creating an expression node.

**snippet**

The native code snippet.

**nodeType**

The node type.

Default is `'void'`.

### .faceForward( N : Node.<(vec2|vec3|vec4)>, I : Node.<(vec2|vec3|vec4)>, Nref : Node.<(vec2|vec3|vec4)> ) : Node.<(vec2|vec3|vec4)>

Returns a vector pointing in the same direction as another.

**N**

The vector to orient.

**I**

The incident vector.

**Nref**

The reference vector.

### .film( inputNode : Node.<vec4>, intensityNode : Node.<float>, uvNode : Node.<vec2> ) : FilmNode

TSL function for creating a film node for post processing.

**inputNode**

The node that represents the input of the effect.

**intensityNode**

A node that represents the effect's intensity.

Default is `null`.

**uvNode**

A node that allows to pass custom (e.g. animated) uv data.

Default is `null`.

### .floatBitsToInt( value : Node.<float> ) : BitcastNode

Bitcasts a float or a vector of floats to a corresponding integer type with the same element size.

**value**

The float or vector of floats to bitcast.

### .floatBitsToUint( value : Node.<float> ) : BitcastNode

Bitcasts a float or a vector of floats to a corresponding unsigned integer type with the same element size.

**value**

The float or vector of floats to bitcast.

### .floor( x : Node | number ) : Node

Finds the nearest integer less than or equal to the parameter.

**x**

The parameter.

### .fog( color : Node, factor : Node )

This class can be used to configure a fog for the scene. Nodes of this type are assigned to `Scene.fogNode`.

**color**

Defines the color of the fog.

**factor**

Defines how the fog is factored in the scene.

### .fract( x : Node | number ) : Node

Computes the fractional part of the parameter.

**x**

The parameter.

### .fwidth( x : Node | number ) : Node

Returns the sum of the absolute derivatives in x and y.

**x**

The parameter.

### .fxaa( node : Node.<vec4> ) : FXAANode

TSL function for creating a FXAA node for anti-aliasing via post processing.

**node**

The node that represents the input of the effect.

### .gain( x : Node.<float>, k : Node.<float> ) : Node.<float>

A function that remaps the `[0,1]` interval into the `[0,1]` interval. Expands the sides and compresses the center, and keeps `0.5` mapped to `0.5`. Reference: [https://iquilezles.org/articles/functions/](https://iquilezles.org/articles/functions/).

**x**

The value to remap.

**k**

`k=1` is the identity curve,`k<1` produces the classic `gain()` shape, and `k>1` produces "s" shaped curves.

**Returns:** The remapped value.

### .gaussianBlur( node : Node.<vec4>, directionNode : Node.<(vec2|float)>, sigma : number, options : Object ) : GaussianBlurNode

TSL function for creating a gaussian blur node for post processing.

**node**

The node that represents the input of the effect.

**directionNode**

Defines the direction and radius of the blur.

**sigma**

Controls the kernel of the blur filter. Higher values mean a wider blur radius.

**options**

Additional options for the gaussian blur effect.

Default is `{}`.

**premultipliedAlpha**

Whether to use premultiplied alpha for the blur effect.

Default is `false`.

**resolutionScale**

The resolution of the effect. 0.5 means half the resolution of the texture node.

Default is `1`.

### .getNormalFromDepth( uv : Node.<vec2>, depthTexture : DepthTexture, projectionMatrixInverse : Node.<mat4> ) : Node.<vec3>

Computes a normal vector based on depth data. Can be used as a fallback when no normal render target is available or if flat surface normals are required.

**uv**

The texture coordinate.

**depthTexture**

The depth texture.

**projectionMatrixInverse**

The camera's inverse projection matrix.

**Returns:** The computed normal vector.

### .getParallaxCorrectNormal( normal : Node.<vec3>, cubeSize : Node.<vec3>, cubePos : Node.<vec3> ) : Node.<vec3>

This computes a parallax corrected normal which is used for box-projected cube mapping (BPCEM).

Reference: [https://devlog-martinsh.blogspot.com/2011/09/box-projected-cube-environment-mapping.html](https://devlog-martinsh.blogspot.com/2011/09/box-projected-cube-environment-mapping.html)

```js
const uvNode = getParallaxCorrectNormal( reflectVector, vec3( 200, 100, 100 ), vec3( 0, - 50, 0 ) );
material.envNode = pmremTexture( renderTarget.texture, uvNode );
```

**normal**

The normal to correct.

**cubeSize**

The cube size should reflect the size of the environment (BPCEM is usually applied in closed environments like rooms).

**cubePos**

The cube position.

**Returns:** The parallax corrected normal.

### .getScreenPosition( viewPosition : Node.<vec3>, projectionMatrix : Node.<mat4> ) : Node.<vec2>

Computes a screen position expressed as uv coordinates based on a fragment's position in view space and the camera's projection matrix

**viewPosition**

The fragments position in view space.

**projectionMatrix**

The camera's projection matrix.

**Returns:** The fragment's screen position expressed as uv coordinates.

### .getShadowMaterial( light : Light ) : NodeMaterial

Retrieves or creates a shadow material for the given light source.

This function checks if a shadow material already exists for the provided light. If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it in the `shadowMaterialLib` for future use.

**light**

The light source for which the shadow material is needed. If the light is a point light, a depth node is calculated using the linear shadow distance.

**Returns:** The shadow material associated with the given light.

### .getShadowRenderObjectFunction( renderer : Renderer, shadow : LightShadow, shadowType : number, useVelocity : boolean ) : shadowRenderObjectFunction

Creates a function to render shadow objects in a scene.

**renderer**

The renderer.

**shadow**

The light shadow object containing shadow properties.

**shadowType**

The type of shadow map (e.g., BasicShadowMap).

**useVelocity**

Whether to use velocity data for rendering.

**Returns:** A function that renders shadow objects.

### .getViewPosition( screenPosition : Node.<vec2>, depth : Node.<float>, projectionMatrixInverse : Node.<mat4> ) : Node.<vec3>

Computes a position in view space based on a fragment's screen position expressed as uv coordinates, the fragments depth value and the camera's inverse projection matrix.

**screenPosition**

The fragment's screen position expressed as uv coordinates.

**depth**

The fragment's depth value.

**projectionMatrixInverse**

The camera's inverse projection matrix.

**Returns:** The fragments position in view space.

### .glsl( src : string, includes : Array.<Node> ) : CodeNode

TSL function for creating a GLSL code node.

**src**

The native code.

**includes**

An array of includes.

### .godrays( depthNode : TextureNode, camera : Camera, light : DirectionalLight | PointLight ) : GodraysNode

TSL function for creating a Godrays effect.

**depthNode**

A texture node that represents the scene's depth.

**camera**

The camera the scene is rendered with.

**light**

The light the godrays are rendered for.

### .grayscale( color : Node.<vec3> ) : Node.<vec3>

Computes a grayscale value for the given RGB color value.

**color**

The color value to compute the grayscale for.

**Returns:** The grayscale color.

### .greaterThan( a : Node, b : Node ) : OperatorNode

Checks if the first node is greater than the second.

**a**

The first input.

**b**

The second input.

### .greaterThanEqual( a : Node, b : Node ) : OperatorNode

Checks if the first node is greater than or equal to the second.

**a**

The first input.

**b**

The second input.

### .hardwareClipping() : ClippingNode

TSL function for setting up hardware-based clipping.

### .hash( seed : Node.<float> ) : Node.<float>

Generates a hash value in the range `[0, 1]` from the given seed.

**seed**

The seed.

**Returns:** The hash value.

### .hashBlur( textureNode : Node.<vec4>, bluramount : Node.<float>, options : Object ) : Node.<vec4>

Applies a hash blur effect to the given texture node.

The approach of this blur is different compared to Gaussian and box blur since it does not rely on a kernel to apply a convolution. Instead, it reads the base texture multiple times in a random pattern and then averages the samples. A typical artifact of this technique is a slightly noisy appearance of the blur which can be mitigated by increasing the number of iterations (see `repeats` parameter). Compared to Gaussian blur, hash blur requires just a single pass.

Reference: [https://www.shadertoy.com/view/4lXXWn](https://www.shadertoy.com/view/4lXXWn).

**textureNode**

The texture node that should be blurred.

**bluramount**

This node determines the amount of blur.

Default is `float(0.1)`.

**options**

Additional options for the hash blur effect.

Default is `{}`.

**repeats**

The number of iterations for the blur effect.

Default is `float(45)`.

**premultipliedAlpha**

Whether to use premultiplied alpha for the blur effect.

Default is `false`.

**Returns:** The blurred texture node.

### .hue( color : Node.<vec3>, adjustment : Node.<float> ) : Node.<vec3>

Updates the hue component of the given RGB color while preserving its luminance and saturation.

**color**

The input color.

**adjustment**

Defines the degree of hue rotation in radians. A positive value rotates the hue clockwise, while a negative value rotates it counterclockwise.

Default is `1`.

**Returns:** The updated color.

### .increment( a : Node ) : OperatorNode

Increments a node by 1 and returns the previous value.

**a**

The node to increment.

### .incrementBefore( a : Node ) : OperatorNode

Increments a node by 1.

**a**

The node to increment.

### .inspector( node : Node, name : string, callback : function | null ) : Node

Creates an inspector node to wrap around a given node for inspection purposes.

**node**

The node to inspect.

**name**

Optional name for the inspector node.

Default is `''`.

**callback**

Optional callback to modify the node during setup.

Default is `null`.

**Returns:** The inspector node.

### .instance( count : number, instanceMatrix : InstancedBufferAttribute | StorageInstancedBufferAttribute, instanceColor : InstancedBufferAttribute | StorageInstancedBufferAttribute ) : InstanceNode

TSL function for creating an instance node.

**count**

The number of instances.

**instanceMatrix**

Instanced buffer attribute representing the instance transformations.

**instanceColor**

Instanced buffer attribute representing the instance colors.

### .instancedArray( count : number | TypedArray, type : string | Struct ) : StorageBufferNode

TSL function for creating a storage buffer node with a configured `StorageInstancedBufferAttribute`.

**count**

The data count. It is also valid to pass a typed array as an argument.

**type**

The data type.

Default is `'float'`.

### .instancedBufferAttribute( array : BufferAttribute | InterleavedBuffer | TypedArray, type : string, stride : number, offset : number ) : BufferAttributeNode | Node

TSL function for creating a buffer attribute node but with enabled instancing

**array**

The attribute data.

**type**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**stride**

The buffer stride.

Default is `0`.

**offset**

The buffer offset.

Default is `0`.

### .instancedDynamicBufferAttribute( array : BufferAttribute | InterleavedBuffer | TypedArray, type : string, stride : number, offset : number ) : BufferAttributeNode | Node

TSL function for creating a buffer attribute node but with dynamic draw usage and enabled instancing

**array**

The attribute data.

**type**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**stride**

The buffer stride.

Default is `0`.

**offset**

The buffer offset.

Default is `0`.

### .instancedMesh( instancedMesh : InstancedMesh ) : InstancedMeshNode

TSL function for creating an instanced mesh node.

**instancedMesh**

The instancedMesh.

### .intBitsToFloat( value : Node.<int> ) : BitcastNode

Bitcasts an integer or a vector of integers to a corresponding float type with the same element size.

**value**

The integer or vector of integers to bitcast.

### .interleavedGradientNoise( position : Node.<vec2> ) : Node.<float>

Interleaved Gradient Noise (IGN) from Jimenez 2014.

IGN has "low discrepancy" resulting in evenly distributed samples. It's superior compared to default white noise, blue noise or Bayer.

References:

*   [https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/](https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/)
*   [https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/](https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/)

**position**

The input position, usually screen coordinates.

**Returns:** The noise value.

### .inverse( x : Node.<(mat2|mat3|mat4)> ) : Node.<(mat2|mat3|mat4)>

Returns the inverse of a matrix.

**x**

The parameter.

### .inverseSqrt( x : Node | number ) : Node

Returns the inverse of the square root of the parameter.

**x**

The parameter.

### .isolate( node : Node ) : IsolateNode

TSL function for creating a cache node.

**node**

The node that should be cached.

### .js( src : string, includes : Array.<Node> ) : CodeNode

TSL function for creating a JS code node.

**src**

The native code.

**includes**

An array of includes.

### .label( node : Node, name : string ) : ContextNode

TSL function for defining a label context value for a given node.

**node**

The node whose context should be modified.

**name**

The name/label to set.

**Deprecated:** Yes

### .length( x : Node ) : Node.<float>

Calculates the length of a vector.

**x**

The parameter.

### .lengthSq( a : Node.<(vec2|vec3|vec4)> ) : Node.<float>

Calculate the squared length of a vector.

**a**

The vector.

### .lensflare( node : TextureNode, params : Object ) : LensflareNode

TSL function for creating a bloom-based lens flare effect.

**node**

The node that represents the scene's bloom.

**params**

The parameter object for configuring the effect.

**ghostTint**

Defines the tint of the flare/ghosts.

Default is `vec3(1, 1, 1)`.

**threshold**

Controls the size and strength of the effect. A higher threshold results in smaller flares.

Default is `float(0.5)`.

**ghostSamples**

Represents the number of flares/ghosts per bright spot which pivot around the center.

Default is `float(4)`.

**ghostSpacing**

Defines the spacing of the flares/ghosts.

Default is `float(0.25)`.

**ghostAttenuationFactor**

Defines the attenuation factor of flares/ghosts.

Default is `float(25)`.

**downSampleRatio**

Defines how downsampling since the effect is usually not rendered at full resolution.

Default is `4`.

### .lessThan( a : Node, b : Node ) : OperatorNode

Checks if the first node is less than the second.

**a**

The first input.

**b**

The second input.

### .lessThanEqual( a : Node, b : Node ) : OperatorNode

Checks if the first node is less than or equal to the second.

**a**

The first input.

**b**

The second input.

### .lightPosition( light : Light ) : UniformNode.<vec3>

TSL function for getting the position in world space for the given light.

**light**

The light source.

**Returns:** The light's position in world space.

### .lightProjectionUV( light : Light, position : Node.<vec3> ) : Node.<vec3>

TSL function for getting projected uv coordinates for the given light. Relevant when using maps with spot lights.

**light**

The light source.

**position**

The position to project.

Default is `positionWorld`.

**Returns:** The projected uvs.

### .lightShadowMatrix( light : Light ) : UniformNode.<mat4>

TSL function for getting a shadow matrix uniform node for the given light.

**light**

The light source.

**Returns:** The shadow matrix uniform node.

### .lightTargetDirection( light : Light ) : Node.<vec3>

TSL function for getting the light target direction for the given light.

**light**

The light source.

**Returns:** The light's target direction.

### .lightTargetPosition( light : Light ) : UniformNode.<vec3>

TSL function for getting the light target position in world space for the given light.

**light**

The light source.

**Returns:** The light target position in world space.

### .lightViewPosition( light : Light ) : UniformNode.<vec3>

TSL function for getting the position in view space for the given light.

**light**

The light source.

**Returns:** The light's position in view space.

### .lights( lights : Array.<Light> ) : LightsNode

TSL function for creating an instance of `LightsNode` and configuring it with the given array of lights.

**lights**

An array of lights.

**Returns:** The created lights node.

### .linearDepth( value : Node.<float> ) : ViewportDepthNode.<float>

TSL function for converting a perspective depth value to linear depth.

**value**

The perspective depth. If `null` is provided, the current fragment's depth is used.

Default is `null`.

### .linearToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

Linear tone mapping, exposure only.

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .log( x : Node | number ) : Node

Returns the natural logarithm of the parameter.

**x**

The parameter.

### .log2( x : Node | number ) : Node

Returns the base 2 logarithm of the parameter.

**x**

The parameter.

### .logarithmicDepthToViewZ( depth : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting a logarithmic depth value to a viewZ value.

**depth**

The logarithmic depth.

**near**

The camera's near value.

**far**

The camera's far value.

### .luminance( color : Node.<vec3>, luminanceCoefficients : Node.<vec3> ) : Node.<float>

Computes the luminance for the given RGB color value.

**color**

The color value to compute the luminance for.

**luminanceCoefficients**

The luminance coefficients. By default predefined values of the current working color space are used.

**Returns:** The luminance.

### .lut3D( node : Node, lut : TextureNode, size : number, intensity : Node.<float> | number ) : Lut3DNode

TSL function for creating a LUT node for color grading via post processing.

**node**

The node that represents the input of the effect.

**lut**

A texture node that represents the lookup table.

**size**

The size of the lookup table.

**intensity**

Controls the intensity of the effect.

### .matcapUV() : Node.<vec2>

TSL function for creating a matcap uv node.

Can be used to compute texture coordinates for projecting a matcap onto a mesh. Used by [MeshMatcapNodeMaterial](MeshMatcapNodeMaterial.html).

**Returns:** The matcap UV coordinates.

### .materialReference( name : string, type : string, material : Material ) : MaterialReferenceNode

TSL function for creating a material reference node.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**material**

The material the property belongs to. When no material is set, the node refers to the material of the current rendered object.

Default is `null`.

### .max( …values : Node | number ) : Node

Returns the greatest of the given values.

**values**

The values to compare.

### .maxMipLevel( textureNode : TextureNode ) : MaxMipLevelNode

TSL function for creating a max mip level node.

**textureNode**

The texture node to compute the max mip level for.

### .min( …values : Node | number ) : Node

Returns the least of the given values.

**values**

The values to compare.

### .mix( a : Node | number, b : Node | number, t : Node | number ) : Node

Linearly interpolates between two values.

**a**

The first parameter.

**b**

The second parameter.

**t**

The interpolation value.

### .mixElement( t : Node | number, e1 : Node | number, e2 : Node | number ) : Node

Alias for `mix()` with a different parameter order.

**t**

The interpolation value.

**e1**

The first parameter.

**e2**

The second parameter.

### .mod( a : Node, b : Node ) : OperatorNode

Computes the remainder of dividing the first node by the second one.

**a**

The first input.

**b**

The second input.

### .modInt( a : Node, b : Node ) : OperatorNode

**a**

The first input.

**b**

The second input.

**Deprecated:** since r175. Use [mod](TSL.html#mod) instead.

### .morphReference( mesh : Mesh ) : MorphNode

TSL function for creating a morph node.

**mesh**

The mesh holding the morph targets.

### .motionBlur( inputNode : Node.<vec4>, velocity : Node.<vec2>, numSamples : Node.<int> ) : Node.<vec4>

Applies a motion blur effect to the given input node.

**inputNode**

The input node to apply the motion blur for.

**velocity**

The motion vectors of the beauty pass.

**numSamples**

How many samples the effect should use. A higher value results in better quality but is also more expensive.

Default is `int(16)`.

**Returns:** The input node with the motion blur effect applied.

### .mrt( outputNodes : Object.<string, Node> ) : MRTNode

TSL function for creating a MRT node.

**outputNodes**

The MRT outputs.

### .mul( a : Node, b : Node, …params : Node ) : OperatorNode

Returns the multiplication of two or more value.

**a**

The first input.

**b**

The second input.

**params**

Additional input parameters.

### .negate( x : Node | number ) : Node

Negates the value of the parameter (-x).

**x**

The parameter.

### .neutralToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

Neutral tone mapping.

Reference: [https://modelviewer.dev/examples/tone-mapping](https://modelviewer.dev/examples/tone-mapping)

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .normalMap( node : Node.<vec3>, scaleNode : Node.<vec2> ) : NormalMapNode

TSL function for creating a normal map node.

**node**

Represents the normal map data.

**scaleNode**

Controls the intensity of the effect.

Default is `null`.

### .normalize( x : Node ) : Node

Calculates the unit vector in the same direction as the original vector.

**x**

The input vector.

### .not( value : Node ) : OperatorNode

Performs logical NOT on a node.

**value**

The value.

### .notEqual( a : Node, b : Node ) : OperatorNode

Checks if two nodes are not equal.

**a**

The first input.

**b**

The second input.

### .objectDirection( object3d : Object3D ) : Object3DNode.<vec3>

TSL function for creating an object 3D node that represents the object's direction in world space.

**object3d**

The 3D object.

### .objectPosition( object3d : Object3D ) : Object3DNode.<vec3>

TSL function for creating an object 3D node that represents the object's position in world space.

**object3d**

The 3D object.

### .objectRadius( object3d : Object3D ) : Object3DNode.<float>

TSL function for creating an object 3D node that represents the object's radius.

**object3d**

The 3D object.

### .objectScale( object3d : Object3D ) : Object3DNode.<vec3>

TSL function for creating an object 3D node that represents the object's scale in world space.

**object3d**

The 3D object.

### .objectViewPosition( object3d : Object3D ) : Object3DNode.<vec3>

TSL function for creating an object 3D node that represents the object's position in view/camera space.

**object3d**

The 3D object.

### .objectWorldMatrix( object3d : Object3D ) : Object3DNode.<mat4>

TSL function for creating an object 3D node that represents the object's world matrix.

**object3d**

The 3D object.

### .oneMinus( x : Node | number ) : Node

Return `1` minus the parameter.

**x**

The parameter.

### .or( …nodes : Node ) : OperatorNode

Performs a logical OR operation on multiple nodes.

**nodes**

The input nodes to be combined using OR.

### .orthographicDepthToViewZ( depth : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting an orthographic depth value to a viewZ value.

**depth**

The orthographic depth.

**near**

The camera's near value.

**far**

The camera's far value.

### .oscSawtooth( t : Node.<float> ) : Node.<float>

Generates a sawtooth wave oscillation based on a timer.

**t**

The timer to generate the oscillation with.

**Returns:** The oscillation node.

### .oscSine( t : Node.<float> ) : Node.<float>

Generates a sine wave oscillation based on a timer.

**t**

The timer to generate the oscillation with.

**Returns:** The oscillation node.

### .oscSquare( t : Node.<float> ) : Node.<float>

Generates a square wave oscillation based on a timer.

**t**

The timer to generate the oscillation with.

**Returns:** The oscillation node.

### .oscTriangle( t : Node.<float> ) : Node.<float>

Generates a triangle wave oscillation based on a timer.

**t**

The timer to generate the oscillation with.

**Returns:** The oscillation node.

### .outline( scene : Scene, camera : Camera, params : Object ) : OutlineNode

TSL function for creating an outline effect around selected objects.

**scene**

A reference to the scene.

**camera**

The camera the scene is rendered with.

**params**

The configuration parameters.

**selectedObjects**

An array of selected objects.

**edgeThickness**

The thickness of the edges.

Default is `float(1)`.

**edgeGlow**

Can be used for animated glow/pulse effects.

Default is `float(0)`.

**downSampleRatio**

The downsample ratio.

Default is `2`.

### .outputStruct( …members : Node ) : OutputStructNode

TSL function for creating an output struct node.

**members**

A parameter list of nodes.

### .overloadingFn( functionNodes : Array.<function()> ) : FunctionOverloadingNode

TSL function for creating a function overloading node.

**functionNodes**

Array of `Fn` function definitions.

### .packHalf2x16( value : Node.<vec2> ) : Node

Converts each component of the vec2 to 16-bit floating-point values. The results are packed into a single unsigned integer.

**value**

The 2-component vector to be packed

### .packSnorm2x16( value : Node.<vec2> ) : Node

Converts each component of the normalized float to 16-bit integer values. The results are packed into a single unsigned integer. round(clamp(c, -1, +1) \* 32767.0)

**value**

The 2-component vector to be packed

### .packUnorm2x16( value : Node.<vec2> ) : Node

Converts each component of the normalized float to 16-bit integer values. The results are packed into a single unsigned integer. round(clamp(c, 0, +1) \* 65535.0)

**value**

The 2-component vector to be packed

### .parabola( x : Node.<float>, k : Node.<float> ) : Node.<float>

A function that remaps the `[0,1]` interval into the `[0,1]` interval. The corners are mapped to `0` and the center to `1`. Reference: [https://iquilezles.org/articles/functions/](https://iquilezles.org/articles/functions/).

**x**

The value to remap.

**k**

Allows to control the remapping functions shape by rising the parabola to a power `k`.

**Returns:** The remapped value.

### .parallaxBarrierPass( scene : Scene, camera : Camera ) : ParallaxBarrierPassNode

TSL function for creating an parallax barrier pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

### .parallaxUV( uv : Node.<vec2>, scale : Node.<vec2> ) : Node.<vec2>

TSL function for computing parallax uv coordinates.

**uv**

A uv node.

**scale**

A scale node.

**Returns:** Parallax uv coordinates.

### .parameter( type : string, name : string ) : ParameterNode

TSL function for creating a parameter node.

**type**

The type of the node.

**name**

The name of the parameter in the shader.

### .pass( scene : Scene, camera : Camera, options : Object ) : PassNode

TSL function for creating a pass node.

**scene**

A reference to the scene.

**camera**

A reference to the camera.

**options**

Options for the internal render target.

### .passTexture( pass : PassNode, texture : Texture ) : PassTextureNode

TSL function for creating a pass texture node.

**pass**

The pass node.

**texture**

The output texture.

### .pcurve( x : Node.<float>, a : Node.<float>, b : Node.<float> ) : Node.<float>

A function that remaps the `[0,1]` interval into the `[0,1]` interval. A generalization of the `parabola()`. Keeps the corners mapped to 0 but allows the control of the shape one either side of the curve. Reference: [https://iquilezles.org/articles/functions/](https://iquilezles.org/articles/functions/).

**x**

The value to remap.

**a**

First control parameter.

**b**

Second control parameter.

**Returns:** The remapped value.

### .perspectiveDepthToViewZ( depth : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting a perspective depth value to a viewZ value.

**depth**

The perspective depth.

**near**

The camera's near value.

**far**

The camera's far value.

### .pixelationPass( scene : Scene, camera : Camera, pixelSize : Node.<float> | number, normalEdgeStrength : Node.<float> | number, depthEdgeStrength : Node.<float> | number ) : PixelationPassNode

TSL function for creating a pixelation render pass node for post processing.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

**pixelSize**

The pixel size.

Default is `6`.

**normalEdgeStrength**

The normal edge strength.

Default is `0.3`.

**depthEdgeStrength**

The depth edge strength.

Default is `0.4`.

### .pmremTexture( value : Texture, uvNode : Node.<vec2>, levelNode : Node.<float> ) : PMREMNode

TSL function for creating a PMREM node.

**value**

The input texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

### .pointShadow( light : PointLight, shadow : PointLightShadow ) : PointShadowNode

TSL function for creating an instance of `PointShadowNode`.

**light**

The shadow casting point light.

**shadow**

An optional point light shadow.

Default is `null`.

**Returns:** The created point shadow node.

### .posterize( sourceNode : Node, stepsNode : Node ) : Node

TSL function for creating a posterize effect which reduces the number of colors in an image, resulting in a more blocky and stylized appearance.

**sourceNode**

The input color.

**stepsNode**

Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.

**Returns:** The posterized color.

### .pow( x : Node | number, y : Node | number ) : Node

Return the value of the first parameter raised to the power of the second one.

**x**

The first parameter.

**y**

The second parameter.

### .pow2( x : Node | number ) : Node

Returns the square of the parameter.

**x**

The first parameter.

### .pow3( x : Node | number ) : Node

Returns the cube of the parameter.

**x**

The first parameter.

### .pow4( x : Node | number ) : Node

Returns the fourth power of the parameter.

**x**

The first parameter.

### .premultipliedGaussianBlur( node : Node.<vec4>, directionNode : Node.<(vec2|float)>, sigma : number ) : GaussianBlurNode

TSL function for creating a gaussian blur node for post processing with enabled premultiplied alpha.

**node**

The node that represents the input of the effect.

**directionNode**

Defines the direction and radius of the blur.

**sigma**

Controls the kernel of the blur filter. Higher values mean a wider blur radius.

**Deprecated:** since r180. Use \`gaussianBlur()\` with \`premultipliedAlpha: true\` option instead.

### .premultiplyAlpha( color : Node.<vec4> ) : Node.<vec4>

Premultiplies the RGB channels of a color by its alpha channel.

This function is useful for converting a non-premultiplied alpha color into a premultiplied alpha format, where the RGB values are scaled by the alpha value. Premultiplied alpha is often used in graphics rendering for certain operations, such as compositing and image processing.

**color**

The input color with non-premultiplied alpha.

**Returns:** The color with premultiplied alpha.

### .property( type : string, name : string ) : PropertyNode

TSL function for creating a property node.

**type**

The type of the node.

**name**

The name of the property in the shader.

Default is `null`.

### .quadBroadcast( e : number ) : number

Broadcasts e from the quad invocation with id equal to id.

**e**

The value to broadcast.

**Returns:** The broadcast value.

### .quadSwapDiagonal( e : number ) : number

Swaps e between invocations in the quad diagonally.

**e**

The value to swap from the current invocation.

**Returns:** The value received from the swap operation.

### .quadSwapX( e : number ) : number

Swaps e between invocations in the quad in the X direction.

**e**

The value to swap from the current invocation.

**Returns:** The value received from the swap operation.

### .quadSwapY( e : number ) : number

Swaps e between invocations in the quad in the Y direction.

**e**

The value to swap from the current invocation.

**Returns:** The value received from the swap operation.

### .radialBlur( textureNode : Node.<vec4>, options : Object ) : Node.<vec4>

This TSL function blurs an image in a circular pattern, radiating from a configurable center point in screen space.

Radial blurs can be used for different kind of effects like producing simple faked lighting effects also known as "light shafts". The major limitation of this specific usage is the center point can only be defined in 2D so the effect does not honor the depth of 3D objects. Consequently, it is not intended for physically correct lit scenes.

**textureNode**

The texture node that should be blurred.

**options**

Additional options for the radial blur effect.

Default is `{}`.

**center**

The center of the light in screen uvs.

Default is `vec2(0.5, 0.5)`.

**weight**

Base weight factor for each sample in the range `[0,1]`.

Default is `float(0.9)`.

**decay**

Decreases the weight factor so each iteration adds less to the sum. Must be in the range `[0,1]`. If you increase the sample count, you have to increase this option as well to avoid a darking effect.

Default is `float(0.95)`.

**count**

The number if iterations. Should be in the range `[16,64]`.

Default is `int(32)`.

**exposure**

Exposure control of the blur.

Default is `float(5)`.

**Returns:** The blurred texture node.

### .radians( x : Node | number ) : Node

Converts a quantity in degrees to radians.

**x**

The input in degrees.

### .rand( uv : Node.<vec2> ) : Node.<float>

Returns a random value for the given uv.

**uv**

The uv node.

### .range( minNode : Node.<any>, maxNode : Node.<any> ) : RangeNode

TSL function for creating a range node.

**minNode**

A node defining the lower bound of the range.

Default is `float()`.

**maxNode**

A node defining the upper bound of the range.

Default is `float()`.

### .rangeFogFactor( near : Node, far : Node )

Constructs a new range factor node.

**near**

Defines the near value.

**far**

Defines the far value.

### .reciprocal( x : Node | number ) : Node

Returns the reciprocal of the parameter `(1/x)`.

**x**

The parameter.

### .reference( name : string, type : string, object : Object ) : ReferenceBaseNode

TSL function for creating a reference base node.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**object**

The object the property belongs to.

### .reference( name : string, type : string, object : Object ) : ReferenceNode

TSL function for creating a reference node.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**object**

The object the property belongs to.

### .referenceBuffer( name : string, type : string, count : number, object : Object ) : ReferenceBaseNode

TSL function for creating a reference base node. Use this function if you want need a reference to an array-like property that should be represented as a uniform buffer.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**count**

The number of value inside the array-like object.

**object**

An array-like object the property belongs to.

### .referenceBuffer( name : string, type : string, count : number, object : Object ) : ReferenceNode

TSL function for creating a reference node. Use this function if you want need a reference to an array-like property that should be represented as a uniform buffer.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**count**

The number of value inside the array-like object.

**object**

An array-like object the property belongs to.

### .reflect( I : Node.<(vec2|vec3|vec4)>, N : Node.<(vec2|vec3|vec4)> ) : Node.<(vec2|vec3|vec4)>

Calculates the reflection direction for an incident vector.

**I**

The incident vector.

**N**

The normal vector.

### .reflector( parameters : Object ) : ReflectorNode

TSL function for creating a reflector node.

**parameters**

An object holding configuration parameters.

Default is `{}`.

**target**

The 3D object the reflector is linked to.

Default is `new Object3D()`.

**resolution**

The resolution scale.

Default is `1`.

**generateMipmaps**

Whether mipmaps should be generated or not.

Default is `false`.

**bounces**

Whether reflectors can render other reflector nodes or not.

Default is `true`.

**depth**

Whether depth data should be generated or not.

Default is `false`.

**samples**

Anti-Aliasing samples of the internal render-target.

**defaultTexture**

The default texture node.

**reflector**

The reflector base node.

### .refract( I : Node.<(vec2|vec3|vec4)>, N : Node.<(vec2|vec3|vec4)>, eta : Node.<float> ) : Node.<(vec2|vec3|vec4)>

Calculates the refraction direction for an incident vector.

**I**

The incident vector.

**N**

The normal vector.

**eta**

The ratio of indices of refraction.

### .reinhardToneMapping( color : Node.<vec3>, exposure : Node.<float> ) : Node.<vec3>

Reinhard tone mapping.

Reference: [https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf](https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf)

**color**

The color that should be tone mapped.

**exposure**

The exposure.

**Returns:** The tone mapped color.

### .remap( node : Node, inLowNode : Node, inHighNode : Node, outLowNode : Node, outHighNode : Node ) : RemapNode

TSL function for creating a remap node.

**node**

The node that should be remapped.

**inLowNode**

The source or current lower bound of the range.

**inHighNode**

The source or current upper bound of the range.

**outLowNode**

The target lower bound of the range.

Default is `float(0)`.

**outHighNode**

The target upper bound of the range.

Default is `float(1)`.

### .remapClamp( node : Node, inLowNode : Node, inHighNode : Node, outLowNode : Node, outHighNode : Node ) : RemapNode

TSL function for creating a remap node, but with enabled clamping.

**node**

The node that should be remapped.

**inLowNode**

The source or current lower bound of the range.

**inHighNode**

The source or current upper bound of the range.

**outLowNode**

The target lower bound of the range.

Default is `float(0)`.

**outHighNode**

The target upper bound of the range.

Default is `float(1)`.

### .renderOutput( color : Node, toneMapping : number, outputColorSpace : string ) : RenderOutputNode

TSL function for creating a posterize node.

**color**

The color node to process.

**toneMapping**

The tone mapping type.

Default is `null`.

**outputColorSpace**

The output color space.

Default is `null`.

### .rendererReference( name : string, type : string, renderer : Renderer ) : RendererReferenceNode

TSL function for creating a renderer reference node.

**name**

The name of the property the node refers to.

**type**

The uniform type that should be used to represent the property value.

**renderer**

The renderer the property belongs to. When no renderer is set, the node refers to the renderer of the current state.

Default is `null`.

### .replaceDefaultUV( callback : function, node : Node ) : ContextNode

Replaces the default UV coordinates used in texture lookups.

```js
material.contextNode = replaceDefaultUV( ( textureNode ) => {
	// ...
	return customUVCoordinates;
} );
```

**callback**

A callback that receives the texture node and must return the new uv coordinates.

**node**

An optional node to which the context will be applied.

Default is `null`.

**Returns:** A context node that replaces the default UV coordinates.

### .retroPass( scene : Scene, camera : Camera, options : Object ) : RetroPassNode

Creates a new RetroPassNode instance for PS1-style rendering.

The retro pass applies vertex snapping, affine texture mapping, and low-resolution rendering to achieve an authentic PlayStation 1 aesthetic. Combine with other post-processing effects like dithering, posterization, and scanlines for full retro look.

```js
// Combined with other effects
let pipeline = retroPass( scene, camera );
pipeline = bayerDither( pipeline, 32 );
pipeline = posterize( pipeline, 32 );
renderPipeline.outputNode = pipeline;
```

**scene**

The scene to render.

**camera**

The camera to render from.

**options**

Additional options for the retro pass.

Default is `{}`.

**affineDistortion**

An optional node to apply affine distortion to UVs.

Default is `null`.

**Returns:** A new RetroPassNode instance.

### .rgbShift( node : Node.<vec4>, amount : number, angle : number ) : RGBShiftNode

TSL function for creating a RGB shift or split effect for post processing.

**node**

The node that represents the input of the effect.

**amount**

The amount of the RGB shift.

Default is `0.005`.

**angle**

Defines in which direction colors are shifted.

Default is `0`.

### .rotate( positionNode : Node, rotationNode : Node ) : RotateNode

TSL function for creating a rotate node.

**positionNode**

The position node.

**rotationNode**

Represents the rotation that is applied to the position node. Depending on whether the position data are 2D or 3D, the rotation is expressed a single float value or an Euler value.

### .rotateUV( uv : Node.<vec2>, rotation : Node.<float>, center : Node.<vec2> ) : Node.<vec2>

Rotates the given uv coordinates around a center point

**uv**

The uv coordinates.

**rotation**

The rotation defined in radians.

**center**

The center of rotation

**Returns:** The rotated uv coordinates.

### .round( x : Node | number ) : Node

Rounds the parameter to the nearest integer.

**x**

The parameter.

### .rtt( node : Node, width : number, height : number, options : Object ) : RTTNode

TSL function for creating a RTT node.

**node**

The node to render a texture with.

**width**

The width of the internal render target. If not width is applied, the render target is automatically resized.

Default is `null`.

**height**

The height of the internal render target.

Default is `null`.

**options**

The options for the internal render target.

Default is `{type:HalfFloatType}`.

### .sRGBTransferEOTF( color : Node.<vec3> ) : Node.<vec3>

Converts the given color value from sRGB to linear-sRGB color space.

**color**

The sRGB color.

**Returns:** The linear-sRGB color.

### .sRGBTransferOETF( color : Node.<vec3> ) : Node.<vec3>

Converts the given color value from linear-sRGB to sRGB color space.

**color**

The linear-sRGB color.

**Returns:** The sRGB color.

### .sampler( value : TextureNode | Texture ) : Node

Converts a texture or texture node to a sampler.

**value**

The texture or texture node to convert.

### .samplerComparison( value : TextureNode | Texture ) : Node

Converts a texture or texture node to a sampler comparison.

**value**

The texture or texture node to convert.

### .saturate( value : Node | number ) : Node

Constrains a value between `0` and `1`.

**value**

The value to constrain.

### .saturation( color : Node.<vec3>, adjustment : Node.<float> ) : Node.<vec3>

Super-saturates or desaturates the given RGB color.

**color**

The input color.

**adjustment**

Specifies the amount of the conversion. A value under `1` desaturates the color, a value over `1` super-saturates it.

Default is `1`.

**Returns:** The saturated color.

### .scanlines( color : Node.<vec3>, intensity : Node.<float>, count : Node.<float>, speed : Node.<float>, coord : Node.<vec2> ) : Node.<vec3>

Applies scanline effect to simulate CRT monitor horizontal lines with animation.

**color**

The input color.

**intensity**

The intensity of the scanlines (0-1).

Default is `0.3`.

**count**

The number of scanlines (typically matches vertical resolution).

Default is `240`.

**speed**

The scroll speed of scanlines (0 = static, 1 = normal CRT roll).

Default is `0.0`.

**coord**

The UV coordinates to use for scanlines.

Default is `uv()`.

**Returns:** The color with scanlines applied.

### .select( condNode : Node, ifNode : Node, elseNode : Node ) : ConditionalNode

TSL function for creating a conditional node.

**condNode**

The node that defines the condition.

**ifNode**

The node that is evaluate when the condition ends up `true`.

**elseNode**

The node that is evaluate when the condition ends up `false`.

Default is `null`.

### .sepia( color : Node.<vec4> ) : Node.<vec4>

Applies a sepia effect to the given color node.

**color**

The color node to apply the sepia for.

**Returns:** The updated color node.

### .setName( node : Node, name : string ) : ContextNode

TSL function for defining a name for the context value for a given node.

**node**

The node whose context should be modified.

**name**

The name to set.

### .shadow( light : Light, shadow : LightShadow ) : ShadowNode

TSL function for creating an instance of `ShadowNode`.

**light**

The shadow casting light.

**shadow**

The light shadow.

**Returns:** The created shadow node.

### .shapeCircle( coord : Node.<vec2> ) : Node.<float>

Generates a circle based on the uv coordinates.

**coord**

The uv to generate the circle.

**Returns:** The circle shape.

### .sharedUniformGroup( name : string, order : number ) : UniformGroupNode

TSL function for creating a shared uniform group node with the given name and order.

**name**

The name of the uniform group node.

**order**

Influences the internal sorting.

Default is `0`.

### .shiftLeft( a : Node, b : Node ) : OperatorNode

Shifts a node to the left.

**a**

The node to shift.

**b**

The value to shift.

### .shiftRight( a : Node, b : Node ) : OperatorNode

Shifts a node to the right.

**a**

The node to shift.

**b**

The value to shift.

### .sign( x : Node | number ) : Node

Extracts the sign of the parameter.

**x**

The parameter.

### .sin( x : Node | number ) : Node

Returns the sine of the parameter.

**x**

The parameter.

### .sinc( x : Node.<float>, k : Node.<float> ) : Node.<float>

A phase shifted sinus curve that starts at zero and ends at zero, with bouncing behavior. Reference: [https://iquilezles.org/articles/functions/](https://iquilezles.org/articles/functions/).

**x**

The value to compute the sin for.

**k**

Controls the amount of bounces.

**Returns:** The result value.

### .skinning( skinnedMesh : SkinnedMesh ) : SkinningNode

TSL function for creating a skinning node.

**skinnedMesh**

The skinned mesh.

### .smaa( node : Node.<vec4> ) : SMAANode

TSL function for creating a SMAA node for anti-aliasing via post processing.

**node**

The node that represents the input of the effect.

### .smoothstep( low : Node | number, high : Node | number, x : Node | number ) : Node

Performs a Hermite interpolation between two values.

**low**

The value of the lower edge of the Hermite function.

**high**

The value of the upper edge of the Hermite function.

**x**

The source value for interpolation.

### .smoothstepElement( x : Node | number, low : Node | number, high : Node | number ) : Node

Alias for `smoothstep()` with a different parameter order.

**x**

The source value for interpolation.

**low**

The value of the lower edge of the Hermite function.

**high**

The value of the upper edge of the Hermite function.

### .sobel( node : Node.<vec4> ) : SobelOperatorNode

TSL function for creating a sobel operator node which performs edge detection with a sobel filter.

**node**

The node that represents the input of the effect.

### .spherizeUV( uv : Node.<vec2>, strength : Node.<float>, center : Node.<vec2> ) : Node.<vec2>

Applies a spherical warping effect to the given uv coordinates.

**uv**

The uv coordinates.

**strength**

The strength of the effect.

**center**

The center point

**Returns:** The updated uv coordinates.

### .spritesheetUV( countNode : Node.<vec2>, uvNode : Node.<vec2>, frameNode : Node.<float> ) : Node.<vec2>

TSL function for computing texture coordinates for animated sprite sheets.

```js
const uvNode = spritesheetUV( vec2( 6, 6 ), uv(), time.mul( animationSpeed ) );
material.colorNode = texture( spriteSheet, uvNode );
```

**countNode**

The node that defines the number of sprites in the x and y direction (e.g 6x6).

**uvNode**

The uv node.

Default is `uv()`.

**frameNode**

The node that defines the current frame/sprite.

Default is `float(0)`.

### .sqrt( x : Node | number ) : Node

Returns the square root of the parameter.

**x**

The parameter.

### .ssaaPass( scene : Scene, camera : Camera ) : SSAAPassNode

TSL function for creating a SSAA pass node for Supersampling Anti-Aliasing.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

### .ssgi( beautyNode : TextureNode, depthNode : TextureNode, normalNode : TextureNode, camera : Camera ) : SSGINode

TSL function for creating a SSGI effect.

**beautyNode**

The texture node that represents the input of the effect.

**depthNode**

A texture node that represents the scene's depth.

**normalNode**

A texture node that represents the scene's normals.

**camera**

The camera the scene is rendered with.

### .ssr( colorNode : Node.<vec4>, depthNode : Node.<float>, normalNode : Node.<vec3>, metalnessNode : Node.<float>, roughnessNode : Node.<float>, camera : Camera ) : SSRNode

TSL function for creating screen space reflections (SSR).

**colorNode**

The node that represents the beauty pass.

**depthNode**

A node that represents the beauty pass's depth.

**normalNode**

A node that represents the beauty pass's normals.

**metalnessNode**

A node that represents the beauty pass's metalness.

**roughnessNode**

A node that represents the beauty pass's roughness.

Default is `null`.

**camera**

The camera the scene is rendered with.

Default is `null`.

### .sss( depthNode : TextureNode, camera : Camera, mainLight : DirectionalLight ) : SSSNode

TSL function for creating a SSS effect.

**depthNode**

A texture node that represents the scene's depth.

**camera**

The camera the scene is rendered with.

**mainLight**

The main directional light of the scene.

### .stack( parent : StackNode ) : StackNode

TSL function for creating a stack node.

**parent**

The parent stack node.

Default is `null`.

### .step( x : Node | number, y : Node | number ) : Node

Generate a step function by comparing two values.

**x**

The y parameter.

**y**

The x parameter.

### .stepElement( x : Node | number, edge : Node | number ) : Node

Alias for `step()` with a different parameter order.

**x**

The source value for interpolation.

**edge**

The edge value.

### .stereoPass( scene : Scene, camera : Camera ) : StereoPassNode

TSL function for creating a stereo pass node for stereoscopic rendering.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

### .storage( value : StorageBufferAttribute | StorageInstancedBufferAttribute | BufferAttribute, type : string | Struct, count : number ) : StorageBufferNode

TSL function for creating a storage buffer node.

**value**

The buffer data.

**type**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**count**

The buffer count.

Default is `0`.

### .storageBarrier() : BarrierNode

TSL function for creating a storage barrier. All invocations must wait for each access to variables within the 'storage' address space to complete before the barrier can be passed.

### .storageElement( storageBufferNode : StorageBufferNode, indexNode : Node ) : StorageArrayElementNode

TSL function for creating a storage element node.

**storageBufferNode**

The storage buffer node.

**indexNode**

The index node that defines the element access.

### .storageTexture( value : StorageTexture, uvNode : Node.<(vec2|vec3)>, storeNode : Node ) : StorageTextureNode

TSL function for creating a storage texture node.

**value**

The storage texture.

**uvNode**

The uv node.

**storeNode**

The value node that should be stored in the texture.

Default is `null`.

### .struct( membersLayout : Object, name : string ) : function

TSL function for creating a struct node.

**membersLayout**

The layout of the struct members.

**name**

The name of the struct.

Default is `null`.

**Returns:** The struct function.

### .sub( a : Node, b : Node, …params : Node ) : OperatorNode

Returns the subtraction of two or more value.

**a**

The first input.

**b**

The second input.

**params**

Additional input parameters.

### .subBuild( node : Node, name : string, type : string ) : Node

Creates a new sub-build node.

**node**

The node to be built in the sub-build.

**name**

The name of the sub-build.

**type**

The type of the node, if known.

Default is `null`.

**Returns:** A node object wrapping the SubBuildNode instance.

### .subgroupAdd( e : number ) : number

A reduction that adds e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The accumulated result of the reduction operation.

### .subgroupAll() : bool

Returns true if e is true for all active invocations in the subgroup.

**Returns:** The result of the computation.

### .subgroupAnd( e : number ) : number

A reduction that performs a bitwise and of e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The result of the reduction operation.

### .subgroupAny() : bool

Returns true if e is true for any active invocation in the subgroup

**Returns:** The result of the computation.

### .subgroupBallot( pred : bool ) : vec4..<u32>

Returns a set of bitfields where the bit corresponding to subgroup\_invocation\_id is 1 if pred is true for that active invocation and 0 otherwise.

**pred**

A boolean that sets the bit corresponding to the invocations subgroup invocation id.

**Returns:**

*   A bitfield corresponding to the pred value of each subgroup invocation.

### .subgroupBroadcast( e : number, id : number ) : number

Broadcasts e from the invocation whose subgroup\_invocation\_id matches id, to all active invocations.

**e**

The value to broadcast from subgroup invocation 'id'.

**id**

The subgroup invocation to broadcast from.

**Returns:** The broadcast value.

### .subgroupBroadcastFirst( e : number, id : number ) : number

Broadcasts e from the active invocation with the lowest subgroup\_invocation\_id in the subgroup to all other active invocations.

**e**

The value to broadcast from the lowest subgroup invocation.

**id**

The subgroup invocation to broadcast from.

**Returns:** The broadcast value.

### .subgroupElect() : bool

Returns true if this invocation has the lowest subgroup\_invocation\_id among active invocations in the subgroup.

**Returns:** The result of the computation.

### .subgroupExclusiveAdd( e : number ) : number

An exclusive scan that returns the sum of e for all active invocations with subgroup\_invocation\_id less than this invocation.

**e**

The value provided to the exclusive scan by the current invocation.

**Returns:** The accumulated result of the exclusive scan operation.

### .subgroupExclusiveMul( e : number ) : number

An exclusive scan that returns the product of e for all active invocations with subgroup\_invocation\_id less than this invocation.

**e**

The value provided to the exclusive scan by the current invocation.

**Returns:** The accumulated result of the exclusive scan operation.

### .subgroupInclusiveAdd( e : number ) : number

An inclusive scan returning the sum of e for all active invocations with subgroup\_invocation\_id less than or equal to this invocation.

**e**

The value provided to the inclusive scan by the current invocation.

**Returns:** The accumulated result of the inclusive scan operation.

### .subgroupInclusiveMul( e : number ) : number

An inclusive scan returning the product of e for all active invocations with subgroup\_invocation\_id less than or equal to this invocation.

**e**

The value provided to the inclusive scan by the current invocation.

**Returns:** The accumulated result of the inclusive scan operation.

### .subgroupMax( e : number ) : number

A reduction that performs a max of e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The result of the reduction operation.

### .subgroupMin( e : number ) : number

A reduction that performs a min of e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The result of the reduction operation.

### .subgroupMul( e : number ) : number

A reduction that multiplies e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The accumulated result of the reduction operation.

### .subgroupOr( e : number ) : number

A reduction that performs a bitwise or of e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The result of the reduction operation.

### .subgroupShuffle( v : number, id : number ) : number

Returns v from the active invocation whose subgroup\_invocation\_id matches id

**v**

The value to return from subgroup invocation id^mask.

**id**

The subgroup invocation which returns the value v.

**Returns:** The broadcast value.

### .subgroupShuffleDown( v : number, delta : number ) : number

Returns v from the active invocation whose subgroup\_invocation\_id matches subgroup\_invocation\_id + delta

**v**

The value to return from subgroup invocation id^mask.

**delta**

A value that offsets the current subgroup invocation.

**Returns:** The broadcast value.

### .subgroupShuffleUp( v : number, delta : number ) : number

Returns v from the active invocation whose subgroup\_invocation\_id matches subgroup\_invocation\_id - delta

**v**

The value to return from subgroup invocation id^mask.

**delta**

A value that offsets the current in.

**Returns:** The broadcast value.

### .subgroupShuffleXor( v : number, mask : number ) : number

Returns v from the active invocation whose subgroup\_invocation\_id matches subgroup\_invocation\_id ^ mask.

**v**

The value to return from subgroup invocation id^mask.

**mask**

A bitmask that determines the target invocation via a XOR operation.

**Returns:** The broadcast value.

### .subgroupXor( e : number ) : number

A reduction that performs a bitwise xor of e among all active invocations and returns that result.

**e**

The value provided to the reduction by the current invocation.

**Returns:** The result of the reduction operation.

### .tan( x : Node | number ) : Node

Returns the tangent of the parameter.

**x**

The parameter.

### .texture( value : Texture | TextureNode, uvNode : Node.<(vec2|vec3)>, levelNode : Node.<int>, biasNode : Node.<float> ) : TextureNode

TSL function for creating a texture node or sample a texture node already existing.

**value**

The texture.

Default is `EmptyTexture`.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .texture3D( value : Data3DTexture, uvNode : Node.<vec3>, levelNode : Node.<int> ) : Texture3DNode

TSL function for creating a 3D texture node.

**value**

The 3D texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

### .texture3DLevel( value : Texture | TextureNode, uvNode : Node.<vec3>, levelNode : Node.<int> ) : TextureNode

TSL function for creating a texture node that fetches/loads texels without interpolation.

**value**

The texture.

Default is `EmptyTexture`.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

### .texture3DLoad( value : Texture | TextureNode, uvNode : Node.<vec3>, levelNode : Node.<int>, biasNode : Node.<float> ) : TextureNode

TSL function for creating a texture node that fetches/loads texels without interpolation.

**value**

The texture.

Default is `EmptyTexture`.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .textureBarrier() : BarrierNode

TSL function for creating a texture barrier. All invocations must wait for each access to variables within the 'texture' address space to complete before the barrier can be passed.

### .textureBase( value : Texture, uvNode : Node.<(vec2|vec3)>, levelNode : Node.<int>, biasNode : Node.<float> ) : TextureNode

TSL function for creating a texture node.

**value**

The texture.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .textureBicubic( textureNode : TextureNode, strength : Node.<float> ) : Node

Applies mipped bicubic texture filtering to the given texture node.

**textureNode**

The texture node that should be filtered.

**strength**

Defines the strength of the bicubic filtering.

**Returns:** The filtered texture sample.

### .textureBicubicLevel( textureNode : TextureNode, lodNode : Node.<float> ) : Node

Applies mipped bicubic texture filtering to the given texture node.

**textureNode**

The texture node that should be filtered.

**lodNode**

Defines the LOD to sample from.

**Returns:** The filtered texture sample.

### .textureLoad( value : Texture | TextureNode, uvNode : Node.<(vec2|vec3)>, levelNode : Node.<int>, biasNode : Node.<float> ) : TextureNode

TSL function for creating a texture node that fetches/loads texels without interpolation.

**value**

The texture.

Default is `EmptyTexture`.

**uvNode**

The uv node.

Default is `null`.

**levelNode**

The level node.

Default is `null`.

**biasNode**

The bias node.

Default is `null`.

### .textureSize( textureNode : TextureNode, levelNode : Node.<int> ) : TextureSizeNode

TSL function for creating a texture size node.

**textureNode**

A texture node which size should be retrieved.

**levelNode**

A level node which defines the requested mip.

Default is `null`.

### .textureStore( value : StorageTexture, uvNode : Node.<(vec2|vec3)>, storeNode : Node ) : StorageTextureNode

TODO: Explain difference to `storageTexture()`.

**value**

The storage texture.

**uvNode**

The uv node.

**storeNode**

The value node that should be stored in the texture.

Default is `null`.

### .tiledLights( maxLights : number, tileSize : number ) : TiledLightsNode

TSL function that creates a tiled lights node.

**maxLights**

The maximum number of lights.

Default is `1024`.

**tileSize**

The tile size.

Default is `32`.

**Returns:** The tiled lights node.

### .toneMapping( mapping : number, exposure : Node.<float> | number, color : Node.<vec3> | Color ) : ToneMappingNode.<vec3>

TSL function for creating a tone mapping node.

**mapping**

The tone mapping type.

**exposure**

The tone mapping exposure.

**color**

The color node to process.

### .toonOutlinePass( scene : Scene, camera : Camera, color : Color, thickness : number, alpha : number ) : ToonOutlinePassNode

TSL function for creating a toon outline pass node.

**scene**

A reference to the scene.

**camera**

A reference to the camera.

**color**

Defines the outline's color.

**thickness**

Defines the outline's thickness.

Default is `0.003`.

**alpha**

Defines the outline's alpha.

Default is `1`.

### .traa( beautyNode : TextureNode, depthNode : TextureNode, velocityNode : TextureNode, camera : Camera ) : TRAANode

TSL function for creating a TRAA node for Temporal Reprojection Anti-Aliasing.

**beautyNode**

The texture node that represents the input of the effect.

**depthNode**

A node that represents the scene's depth.

**velocityNode**

A node that represents the scene's velocity.

**camera**

The camera the scene is rendered with.

### .transformDirection( direction : Node.<(vec2|vec3|vec4)>, matrix : Node.<(mat2|mat3|mat4)> ) : Node

Transforms the direction of a vector by a matrix and then normalizes the result.

**direction**

The direction vector.

**matrix**

The transformation matrix.

### .transformNormal( normal : Node.<vec3>, matrix : Node.<mat3> ) : Node.<vec3>

Transforms the normal with the given matrix.

**normal**

The normal.

**matrix**

The matrix.

Default is `modelWorldMatrix`.

**Returns:** The transformed normal.

### .transformNormalToView( normal : Node.<vec3>, builder : NodeBuilder ) : Node.<vec3>

Transforms the given normal from local to view space.

**normal**

The normal.

**builder**

The current node builder.

**Returns:** The transformed normal.

### .transition( nodeA : Node.<vec4>, nodeB : Node.<vec4>, mixTextureNode : Node.<vec4>, mixRatio : Node.<float> | number, threshold : Node.<float> | number, useTexture : Node.<float> | number ) : TransitionNode

TSL function for creating a transition node for post processing.

**nodeA**

A texture node that represents the beauty pass of the first scene.

**nodeB**

A texture node that represents the beauty pass of the second scene.

**mixTextureNode**

A texture that defines how the transition effect should look like.

**mixRatio**

The interpolation factor that controls the mix.

**threshold**

Can be used to tweak the linear interpolation.

**useTexture**

Whether `mixTextureNode` should influence the transition or not.

### .transpose( x : Node.<(mat2|mat3|mat4)> ) : Node

Returns the transpose of a matrix.

**x**

The parameter.

### .triNoise3D( position : Node.<vec3>, speed : Node.<float>, time : Node.<float> ) : Node.<float>

Generates a noise value from the given position, speed and time parameters.

**position**

The position.

**speed**

The speed.

**time**

The time.

**Returns:** The generated noise.

### .triplanarTexture( textureXNode : Node, textureYNode : Node, textureZNode : Node, scaleNode : Node.<float>, positionNode : Node.<vec3>, normalNode : Node.<vec3> ) : Node.<vec4>

TSL function for creating a triplanar textures node.

**textureXNode**

First texture node.

**textureYNode**

Second texture node. When not set, the shader will sample from `textureXNode` instead.

Default is `null`.

**textureZNode**

Third texture node. When not set, the shader will sample from `textureXNode` instead.

Default is `null`.

**scaleNode**

The scale node.

Default is `float(1)`.

**positionNode**

Vertex positions in local space.

Default is `positionLocal`.

**normalNode**

Normals in local space.

Default is `normalLocal`.

### .triplanarTextures( textureXNode : Node, textureYNode : Node, textureZNode : Node, scaleNode : Node.<float>, positionNode : Node.<vec3>, normalNode : Node.<vec3> ) : Node.<vec4>

TSL function for creating a triplanar textures node.

Can be used for triplanar texture mapping.

```js
material.colorNode = triplanarTexture( texture( diffuseMap ) );
```

**textureXNode**

First texture node.

**textureYNode**

Second texture node. When not set, the shader will sample from `textureXNode` instead.

Default is `null`.

**textureZNode**

Third texture node. When not set, the shader will sample from `textureXNode` instead.

Default is `null`.

**scaleNode**

The scale node.

Default is `float(1)`.

**positionNode**

Vertex positions in local space.

Default is `positionLocal`.

**normalNode**

Normals in local space.

Default is `normalLocal`.

### .trunc( x : Node | number ) : Node

Truncates the parameter, removing the fractional part.

**x**

The parameter.

### .uintBitsToFloat( value : Node.<uint> ) : BitcastNode

Bitcast an unsigned integer or a vector of unsigned integers to a corresponding float type with the same element size.

**value**

The unsigned integer or vector of unsigned integers to bitcast.

### .uniform( value : any | string, type : string ) : UniformNode

TSL function for creating a uniform node.

**value**

The value of this uniform or your type. Usually a JS primitive or three.js object (vector, matrix, color, texture).

**type**

The node type. If no explicit type is defined, the node tries to derive the type from its value.

### .uniformArray( values : Array.<any>, nodeType : string ) : UniformArrayNode

TSL function for creating an uniform array node.

**values**

Array-like data.

**nodeType**

The data type of the array elements.

### .uniformCubeTexture( value : CubeTexture ) : CubeTextureNode

TSL function for creating a uniform cube texture node.

**value**

The cube texture.

Default is `EmptyTexture`.

### .uniformFlow( node : Node ) : ContextNode

TSL function for defining a uniformFlow context value for a given node.

**node**

The node whose dependencies should all execute within a uniform control-flow path.

### .uniformGroup( name : string ) : UniformGroupNode

TSL function for creating a uniform group node with the given name.

**name**

The name of the uniform group node.

### .uniformTexture( value : Texture ) : TextureNode

TSL function for creating a uniform texture node.

**value**

The texture.

### .unpackHalf2x16( value : Node.<uint> ) : Node

Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as 16-bit floating-point numbers. Returns a vec2 with both values.

**value**

The unsigned integer to be unpacked

### .unpackNormal( xy : Node.<vec2> ) : Node.<vec3>

Unpacks a tangent space normal, reconstructing the Z component by projecting the X,Y coordinates onto the hemisphere. The X,Y coordinates are expected to be in the \[-1, 1\] range.

**xy**

The X,Y coordinates of the normal.

**Returns:** The resulting normal.

### .unpackSnorm2x16( value : Node.<uint> ) : Node

Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as normalized signed integers. Returns a vec2 with both values.

**value**

The unsigned integer to be unpacked

### .unpackUnorm2x16( value : Node.<uint> ) : Node

Unpacks a 32-bit unsigned integer into two 16-bit values, interpreted as normalized unsigned integers. Returns a vec2 with both values.

**value**

The unsigned integer to be unpacked

### .unpremultiplyAlpha( color : Node.<vec4> ) : Node.<vec4>

Unpremultiplies the RGB channels of a color by its alpha channel.

This function is useful for converting a premultiplied alpha color back into a non-premultiplied alpha format, where the RGB values are divided by the alpha value. Unpremultiplied alpha is often used in graphics rendering for certain operations, such as compositing and image processing.

**color**

The input color with premultiplied alpha.

**Returns:** The color with non-premultiplied alpha.

### .userData( name : string, inputType : string, userData : Object ) : UserDataNode

TSL function for creating a user data node.

**name**

The property name that should be referenced by the node.

**inputType**

The node data type of the reference.

**userData**

A reference to the `userData` object. If not provided, the `userData` property of the 3D object that uses the node material is evaluated.

### .uv( index : number ) : AttributeNode.<vec2>

TSL function for creating an uv attribute node with the given index.

**index**

The uv index.

Default is `0`.

**Returns:** The uv attribute node.

### .varying( node : Node, name : string ) : VaryingNode

TSL function for creating a varying node.

**node**

The node for which a varying should be created.

**name**

The name of the varying in the shader.

### .varyingProperty( type : string, name : string ) : PropertyNode

TSL function for creating a varying property node.

**type**

The type of the node.

**name**

The name of the varying in the shader.

Default is `null`.

### .vertexColor( index : number ) : VertexColorNode

TSL function for creating a reference node.

**index**

The attribute index.

Default is `0`.

### .vertexStage( node : Node ) : VaryingNode

Computes a node in the vertex stage.

**node**

The node which should be executed in the vertex stage.

### .vibrance( color : Node.<vec3>, adjustment : Node.<float> ) : Node.<vec3>

Selectively enhance the intensity of less saturated RGB colors. Can result in a more natural and visually appealing image with enhanced color depth compared to ColorAdjustment#saturation.

**color**

The input color.

**adjustment**

Controls the intensity of the vibrance effect.

Default is `1`.

**Returns:** The updated color.

### .viewZToLogarithmicDepth( viewZ : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting a viewZ value to a logarithmic depth value.

**viewZ**

The viewZ node.

**near**

The camera's near value.

**far**

The camera's far value.

### .viewZToOrthographicDepth( viewZ : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting a viewZ value to an orthographic depth value.

**viewZ**

The viewZ node.

**near**

The camera's near value.

**far**

The camera's far value.

### .viewZToPerspectiveDepth( viewZ : Node.<float>, near : Node.<float>, far : Node.<float> ) : Node.<float>

TSL function for converting a viewZ value to a perspective depth value.

Note: {link https://twitter.com/gonnavis/status/1377183786949959682}.

**viewZ**

The viewZ node.

**near**

The camera's near value.

**far**

The camera's far value.

### .viewportDepthTexture( uvNode : Node, levelNode : Node ) : ViewportDepthTextureNode

TSL function for a viewport depth texture node.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

### .viewportMipTexture( uvNode : Node, levelNode : Node, framebufferTexture : Texture ) : ViewportTextureNode

TSL function for creating a viewport texture node with enabled mipmap generation.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

**framebufferTexture**

A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.

Default is `null`.

### .viewportOpaqueMipTexture( uv : Node, level : Node ) : ViewportTextureNode

TSL function for creating a viewport texture node with enabled mipmap generation. The texture should only contain the opaque rendering objects.

This should be used just in transparent or transmissive materials.

**uv**

The uv node.

Default is `screenUV`.

**level**

The level node.

Default is `null`.

### .viewportSafeUV( uv : Node.<vec2> ) : Node.<vec2>

A special version of a screen uv function that involves a depth comparison when computing the final uvs. The function mitigates visual errors when using viewport texture nodes for refraction purposes. Without this function objects in front of a refractive surface might appear on the refractive surface which is incorrect.

**uv**

Optional uv coordinates. By default `screenUV` is used.

**Returns:** The update uv coordinates.

### .viewportSharedTexture( uvNode : Node, levelNode : Node ) : ViewportSharedTextureNode

TSL function for creating a shared viewport texture node.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

### .viewportTexture( uvNode : Node, levelNode : Node, framebufferTexture : Texture ) : ViewportTextureNode

TSL function for creating a viewport texture node.

**uvNode**

The uv node.

Default is `screenUV`.

**levelNode**

The level node.

Default is `null`.

**framebufferTexture**

A framebuffer texture holding the viewport data. If not provided, a framebuffer texture is created automatically.

Default is `null`.

### .vignette( color : Node.<vec3>, intensity : Node.<float>, smoothness : Node.<float>, coord : Node.<vec2> ) : Node.<vec3>

Applies vignette effect to darken the edges of the screen.

**color**

The input color.

**intensity**

The intensity of the vignette (0-1).

Default is `0.4`.

**smoothness**

The smoothness of the vignette falloff.

Default is `0.5`.

**coord**

The UV coordinates to use for vignette calculation.

Default is `uv()`.

**Returns:** The color with vignette applied.

### .vogelDiskSample( sampleIndex : Node.<int>, samplesCount : Node.<int>, phi : Node.<float> ) : Node.<vec2>

Vogel disk sampling for uniform circular distribution.

This function generates sample points distributed uniformly on a disk using the golden angle, resulting in an efficient low-discrepancy sequence for sampling. The rotation parameter (phi) allows randomizing the pattern per-pixel when combined with IGN.

**sampleIndex**

The index of the current sample (0-based).

**samplesCount**

The total number of samples.

**phi**

Rotation angle in radians (typically from IGN \* 2π).

**Returns:** A 2D point on the unit disk.

### .wgsl( src : string, includes : Array.<Node> ) : CodeNode

TSL function for creating a WGSL code node.

**src**

The native code.

**includes**

An array of includes.

### .workgroupArray( type : string, count : number ) : WorkgroupInfoNode

TSL function for creating a workgroup info node. Creates a new 'workgroup' scoped array buffer.

**type**

The data type of a 'workgroup' scoped buffer element.

**count**

The number of elements in the buffer.

Default is `0`.

### .workgroupBarrier() : BarrierNode

TSL function for creating a workgroup barrier. All compute shader invocations must wait for each invocation within a workgroup to complete before the barrier can be surpassed.

### .workingToColorSpace( node : Node, targetColorSpace : string ) : ColorSpaceNode

TSL function for converting a given color node from the current working color space to the given color space.

**node**

Represents the node to convert.

**targetColorSpace**

The target color space.

### .xor( a : Node, b : Node ) : OperatorNode

Performs logical XOR on two nodes.

**a**

The first input.

**b**

The second input.

## Type Definitions

### .ConstantsInterpolationSamplingMode

Represents the different interpolation sampling modes.

**NORMAL**  
string

Normal sampling mode.

**CENTROID**  
string

Centroid sampling mode.

**SAMPLE**  
string

Sample-specific sampling mode.

**FIRST**  
string

Flat interpolation using the first vertex.

**EITHER**  
string

Flat interpolation using either vertex.

### .ConstantsInterpolationSamplingType

Represents the different interpolation sampling types.

**PERSPECTIVE**  
string

Perspective-correct interpolation.

**LINEAR**  
string

Linear interpolation.

**FLAT**  
string

Flat interpolation.

### .ConstantsMouse

This type represents mouse buttons and interaction types in context of controls.

**MIDDLE**  
number

The left mouse button.

**LEFT**  
number

The middle mouse button.

**RIGHT**  
number

The right mouse button.

**ROTATE**  
number

A rotate interaction.

**DOLLY**  
number

A dolly interaction.

**PAN**  
number

A pan interaction.

### .ConstantsTimestampQuery

This type represents the different timestamp query types.

**COMPUTE**  
string

A `compute` timestamp query.

**RENDER**  
string

A `render` timestamp query.

### .ConstantsTouch

This type represents touch interaction types in context of controls.

**ROTATE**  
number

A rotate interaction.

**PAN**  
number

A pan interaction.

**DOLLY\_PAN**  
number

The dolly-pan interaction.

**DOLLY\_ROTATE**  
number

A dolly-rotate interaction.

### .DebugConfig

Debug configuration.

**checkShaderErrors**  
boolean

Whether shader errors should be checked or not.

**onShaderError**  
function

A callback function that is executed when a shader error happens. Only supported with WebGL 2 right now.

**getShaderAsync**  
function

Allows the get the raw shader code for the given scene, camera and 3D object.

### .ShadowMapConfig

Shadow map configuration

**enabled**  
boolean

Whether to globally enable shadows or not.

**transmitted**  
boolean

Whether to enable light transmission through non-opaque materials.

**type**  
number

The shadow map type.

### .XRConfig

XR configuration.

**enabled**  
boolean

Whether to globally enable XR or not.

### .onAnimationCallback( time : DOMHighResTimeStamp, frame : XRFrame )

Animation loop parameter of `renderer.setAnimationLoop()`.

**time**

A timestamp indicating the end time of the previous frame's rendering.

**frame**

A reference to the current XR frame. Only relevant when using XR rendering.

### .onErrorCallback( error : Error )

Callback for onError in loaders.

**error**

The error which occurred during the loading process.

### .onProgressCallback( event : ProgressEvent )

Callback for onProgress in loaders.

**event**

An instance of `ProgressEvent` that represents the current loading status.

### .renderObjectFunction( object : Object3D, scene : Scene, camera : Camera, geometry : BufferGeometry, material : Material, group : Object, lightsNode : LightsNode, clippingContext : ClippingContext, passId : string )

Callback for [Renderer#setRenderObjectFunction](Renderer.html#setRenderObjectFunction).

**object**

The 3D object.

**scene**

The scene the 3D object belongs to.

**camera**

The camera the object should be rendered with.

**geometry**

The object's geometry.

**material**

The object's material.

**group**

Only relevant for objects using multiple materials. This represents a group entry from the respective `BufferGeometry`.

**lightsNode**

The current lights node.

**clippingContext**

The clipping context.

**passId**

An optional ID for identifying the pass.

Default is `null`.

### .traverseCallback( node : Node )

Callback for [Node#traverse](Node.html#traverse).

**node**

The current node.