// @TODO: We can simplify "export { default as SomeNode, other, exports } from '...'" to just "export * from '...'" if we will use only named exports
// this will also solve issues like "import TempNode from '../core/Node.js'"

// constants
export * from './core/constants.js';

// core
export { default as ArrayUniformNode /* @TODO: arrayUniform */ } from './core/ArrayUniformNode.js';
export { default as AttributeNode, attribute } from './core/AttributeNode.js';
export { default as BypassNode, bypass } from './core/BypassNode.js';
export { default as CacheNode, cache } from './core/CacheNode.js';
export { default as ConstNode } from './core/ConstNode.js';
export { default as ContextNode, context } from './core/ContextNode.js';
export { default as InstanceIndexNode, instanceIndex } from './core/InstanceIndexNode.js';
export { default as LightingModel, lightingModel } from './core/LightingModel.js';
export { default as Node, addNodeClass, createNodeFromType } from './core/Node.js';
export { default as NodeAttribute } from './core/NodeAttribute.js';
export { default as NodeBuilder } from './core/NodeBuilder.js';
export { default as NodeCache } from './core/NodeCache.js';
export { default as NodeCode } from './core/NodeCode.js';
export { default as NodeFrame } from './core/NodeFrame.js';
export { default as NodeFunctionInput } from './core/NodeFunctionInput.js';
export { default as NodeKeywords } from './core/NodeKeywords.js';
export { default as NodeUniform } from './core/NodeUniform.js';
export { default as NodeVar } from './core/NodeVar.js';
export { default as NodeVarying } from './core/NodeVarying.js';
export { default as PropertyNode, property, diffuseColor, roughness, metalness, specularColor, shininess } from './core/PropertyNode.js';
export { default as StackNode, stack } from './core/StackNode.js';
export { default as TempNode } from './core/TempNode.js';
export { default as UniformNode, uniform } from './core/UniformNode.js';
export { default as VarNode, label, temp } from './core/VarNode.js';
export { default as VaryingNode, varying } from './core/VaryingNode.js';

import * as NodeUtils from './core/NodeUtils.js';
export { NodeUtils };

// math
export { default as MathNode, EPSILON, INFINITY, radians, degrees, exp, exp2, log, log2, sqrt, inverseSqrt, floor, ceil, normalize, fract, sin, cos, tan, asin, acos, atan, abs, sign, length, negate, oneMinus, dFdx, dFdy, round, reciprocal, atan2, min, max, mod, step, reflect, distance, difference, dot, cross, pow, pow2, pow3, pow4, transformDirection, mix, clamp, saturate, refract, smoothstep, faceForward } from './math/MathNode.js';
export { default as OperatorNode, add, sub, mul, div, remainder, equal, assign, lessThan, greaterThan, lessThanEqual, greaterThanEqual, and, or, xor, bitAnd, bitOr, bitXor, shiftLeft, shiftRight } from './math/OperatorNode.js';
export { default as CondNode, cond } from './math/CondNode.js';

// utils
export { default as ArrayElementNode } from './utils/ArrayElementNode.js';
export { default as ConvertNode } from './utils/ConvertNode.js';
export { default as DiscardNode, discard } from './utils/DiscardNode.js';
export { default as EquirectUVNode, equirectUV } from './utils/EquirectUVNode.js';
export { default as JoinNode } from './utils/JoinNode.js';
export { default as LoopNode, loop } from './utils/LoopNode.js';
export { default as MatcapUVNode, matcapUV } from './utils/MatcapUVNode.js';
export { default as MaxMipLevelNode, maxMipLevel } from './utils/MaxMipLevelNode.js';
export { default as OscNode, oscSine, oscSquare, oscTriangle, oscSawtooth } from './utils/OscNode.js';
export { default as PackingNode, directionToColor, colorToDirection } from './utils/PackingNode.js';
export { default as RemapNode, remap, remapClamp } from './utils/RemapNode.js';
export { default as RotateUVNode, rotateUV } from './utils/RotateUVNode.js';
export { default as SpecularMIPLevelNode, specularMIPLevel } from './utils/SpecularMIPLevelNode.js';
export { default as SplitNode } from './utils/SplitNode.js';
export { default as SpriteSheetUVNode, spritesheetUV } from './utils/SpriteSheetUVNode.js';
export { default as TimerNode, timerLocal, timerGlobal, timerDelta, frameId } from './utils/TimerNode.js';
export { default as TriplanarTexturesNode, triplanarTextures, triplanarTexture } from './utils/TriplanarTexturesNode.js';

// shadernode
export * from './shadernode/ShaderNode.js';

// accessors
export { default as BitangentNode, bitangentGeometry, bitangentLocal, bitangentView, bitangentWorld, transformedBitangentView, transformedBitangentWorld } from './accessors/BitangentNode.js';
export { default as BufferAttributeNode, bufferAttribute, dynamicBufferAttribute } from './accessors/BufferAttributeNode.js';
export { default as BufferNode, buffer } from './accessors/BufferNode.js';
export { default as CameraNode, cameraProjectionMatrix, cameraViewMatrix, cameraNormalMatrix, cameraWorldMatrix, cameraPosition } from './accessors/CameraNode.js';
export { default as CubeTextureNode, cubeTexture } from './accessors/CubeTextureNode.js';
export { default as ExtendedMaterialNode, materialNormal } from './accessors/ExtendedMaterialNode.js';
export { default as InstanceNode, instance } from './accessors/InstanceNode.js';
export { default as MaterialNode, materialUV, materialAlphaTest, materialColor, materialShininess, materialEmissive, materialOpacity, materialSpecularColor, materialReflectivity, materialRoughness, materialMetalness, materialRotation } from './accessors/MaterialNode.js';
export { default as MaterialReferenceNode, materialReference } from './accessors/MaterialReferenceNode.js';
export { default as ModelNode, modelDirection, modelViewMatrix, modelNormalMatrix, modelWorldMatrix, modelPosition, modelViewPosition } from './accessors/ModelNode.js';
export { default as ModelViewProjectionNode, modelViewProjection } from './accessors/ModelViewProjectionNode.js';
export { default as NormalNode, normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView, transformedNormalWorld } from './accessors/NormalNode.js';
export { default as Object3DNode, objectDirection, objectViewMatrix, objectNormalMatrix, objectWorldMatrix, objectPosition, objectViewPosition } from './accessors/Object3DNode.js';
export { default as PointUVNode, pointUV } from './accessors/PointUVNode.js';
export { default as PositionNode, positionGeometry, positionLocal, positionWorld, positionWorldDirection, positionView, positionViewDirection } from './accessors/PositionNode.js';
export { default as ReferenceNode, reference } from './accessors/ReferenceNode.js';
export { default as ReflectVectorNode, reflectVector } from './accessors/ReflectVectorNode.js';
export { default as SkinningNode, skinning } from './accessors/SkinningNode.js';
export { default as StorageBufferNode, storage } from './accessors/StorageBufferNode.js';
export { default as TangentNode, tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView, transformedTangentWorld } from './accessors/TangentNode.js';
export { default as TextureNode, texture, sampler } from './accessors/TextureNode.js';
export { default as UVNode, uv } from './accessors/UVNode.js';
export { default as UserDataNode, userData } from './accessors/UserDataNode.js';

// display
export { default as BlendModeNode, burn, dodge, overlay, screen } from './display/BlendModeNode.js';
export { default as ColorAdjustmentNode, saturation, vibrance, hue, lumaCoeffs, luminance } from './display/ColorAdjustmentNode.js';
export { default as ColorSpaceNode, colorSpace } from './display/ColorSpaceNode.js';
export { default as FrontFacingNode, frontFacing, faceDirection } from './display/FrontFacingNode.js';
export { default as NormalMapNode, normalMap, TBNViewMatrix } from './display/NormalMapNode.js';
export { default as PosterizeNode, posterize } from './display/PosterizeNode.js';
export { default as ToneMappingNode, toneMapping } from './display/ToneMappingNode.js';
export { default as ViewportNode, viewportCoordinate, viewportResolution, viewportTopLeft, viewportBottomLeft, viewportTopRight, viewportBottomRight } from './display/ViewportNode.js';
export { default as ViewportTextureNode, viewportTexture } from './display/ViewportTextureNode.js';
export { default as ViewportSharedTextureNode, viewportSharedTexture } from './display/ViewportSharedTextureNode.js';

// code
export { default as ExpressionNode, expression } from './code/ExpressionNode.js';
export { default as CodeNode, code, js } from './code/CodeNode.js';
export { default as FunctionCallNode, call } from './code/FunctionCallNode.js';
export { default as FunctionNode, func, fn } from './code/FunctionNode.js';
export { default as ScriptableNode, scriptable, global } from './code/ScriptableNode.js';
export { default as ScriptableValueNode, scriptableValue } from './code/ScriptableValueNode.js';

// fog
export { default as FogNode, fog } from './fog/FogNode.js';
export { default as FogRangeNode, rangeFog } from './fog/FogRangeNode.js';
export { default as FogExp2Node, densityFog } from './fog/FogExp2Node.js';

// geometry
export { default as RangeNode, range } from './geometry/RangeNode.js';

// gpgpu
export { default as ComputeNode, compute } from './gpgpu/ComputeNode.js';

// lighting
export { default as LightNode, lightTargetDirection } from './lighting/LightNode.js';
export { default as PointLightNode } from './lighting/PointLightNode.js';
export { default as DirectionalLightNode } from './lighting/DirectionalLightNode.js';
export { default as SpotLightNode } from './lighting/SpotLightNode.js';
export { default as IESSpotLightNode } from './lighting/IESSpotLightNode.js';
export { default as AmbientLightNode } from './lighting/AmbientLightNode.js';
export { default as LightsNode, lights, lightsWithoutWrap, addLightNode } from './lighting/LightsNode.js';
export { default as LightingNode /* @TODO: lighting (abstract), light */ } from './lighting/LightingNode.js';
export { default as LightingContextNode, lightingContext } from './lighting/LightingContextNode.js';
export { default as HemisphereLightNode } from './lighting/HemisphereLightNode.js';
export { default as EnvironmentNode } from './lighting/EnvironmentNode.js';
export { default as AONode } from './lighting/AONode.js';
export { default as AnalyticLightNode } from './lighting/AnalyticLightNode.js';

// procedural
export { default as CheckerNode, checker } from './procedural/CheckerNode.js';

// loaders
export { default as NodeLoader } from './loaders/NodeLoader.js';
export { default as NodeObjectLoader } from './loaders/NodeObjectLoader.js';
export { default as NodeMaterialLoader } from './loaders/NodeMaterialLoader.js';

// parsers
export { default as GLSLNodeParser } from './parsers/GLSLNodeParser.js'; // @TODO: Move to jsm/renderers/webgl.

// materials
export * from './materials/Materials.js';

// materialX
export * from './materialx/MaterialXNodes.js';

// functions
export { default as BRDF_BlinnPhong } from './functions/BSDF/BRDF_BlinnPhong.js';
export { default as BRDF_GGX } from './functions/BSDF/BRDF_GGX.js';
export { default as BRDF_Lambert } from './functions/BSDF/BRDF_Lambert.js';
export { default as D_GGX } from './functions/BSDF/D_GGX.js';
export { default as DFGApprox } from './functions/BSDF/DFGApprox.js';
export { default as F_Schlick } from './functions/BSDF/F_Schlick.js';
export { default as V_GGX_SmithCorrelated } from './functions/BSDF/V_GGX_SmithCorrelated.js';

export { getDistanceAttenuation } from './lighting/LightUtils.js';

export { default as getGeometryRoughness } from './functions/material/getGeometryRoughness.js';
export { default as getRoughness } from './functions/material/getRoughness.js';

export { default as phongLightingModel } from './functions/PhongLightingModel.js';
export { default as physicalLightingModel } from './functions/PhysicalLightingModel.js';
