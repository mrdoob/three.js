// @TODO: We can simplify "export { default as SomeNode, other, exports } from '...'" to just "export * from '...'" if we will use only named exports
// this will also solve issues like "import TempNode from '../core/Node.js'"

// constants
export * from './core/constants.js';

// core
export { default as AssignNode, assign } from './core/AssignNode.js';
export { default as AttributeNode, attribute } from './core/AttributeNode.js';
export { default as BypassNode, bypass } from './core/BypassNode.js';
export { default as CacheNode, cache } from './core/CacheNode.js';
export { default as ConstNode } from './core/ConstNode.js';
export { default as ContextNode, context, label } from './core/ContextNode.js';
export { default as IndexNode, vertexIndex, instanceIndex, drawIndex } from './core/IndexNode.js';
export { default as LightingModel } from './core/LightingModel.js';
export { default as Node, addNodeClass, createNodeFromType } from './core/Node.js';
export { default as VarNode, temp } from './core/VarNode.js';
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
export { default as ParameterNode, parameter } from './core/ParameterNode.js';
export { default as PropertyNode, property, varyingProperty, output, diffuseColor, emissive, roughness, metalness, clearcoat, clearcoatRoughness, sheen, sheenRoughness, iridescence, iridescenceIOR, iridescenceThickness, specularColor, shininess, dashSize, gapSize, pointWidth, alphaT, anisotropy, anisotropyB, anisotropyT } from './core/PropertyNode.js';
export { default as StackNode, stack } from './core/StackNode.js';
export { default as TempNode } from './core/TempNode.js';
export { default as UniformGroupNode, uniformGroup, objectGroup, renderGroup, frameGroup } from './core/UniformGroupNode.js';
export { default as UniformNode, uniform } from './core/UniformNode.js';
export { default as VaryingNode, varying } from './core/VaryingNode.js';
export { default as OutputStructNode, outputStruct } from './core/OutputStructNode.js';
export { default as MRTNode, mrt } from './core/MRTNode.js';

import * as NodeUtils from './core/NodeUtils.js';
export { NodeUtils };

// math
export { default as MathNode, PI, PI2, EPSILON, INFINITY, radians, degrees, exp, exp2, log, log2, sqrt, inverseSqrt, floor, ceil, normalize, fract, sin, cos, tan, asin, acos, atan, abs, sign, length, lengthSq, negate, oneMinus, dFdx, dFdy, round, reciprocal, trunc, fwidth, bitcast, atan2, min, max, mod, step, reflect, distance, difference, dot, cross, pow, pow2, pow3, pow4, transformDirection, mix, clamp, saturate, refract, smoothstep, faceForward, cbrt, transpose, all, any, equals, rand } from './math/MathNode.js';

export { default as OperatorNode, add, sub, mul, div, remainder, equal, lessThan, greaterThan, lessThanEqual, greaterThanEqual, and, or, not, xor, bitAnd, bitNot, bitOr, bitXor, shiftLeft, shiftRight } from './math/OperatorNode.js';
export { default as CondNode, cond } from './math/CondNode.js';
export { default as HashNode, hash } from './math/HashNode.js';

// math utils
export { parabola, gain, pcurve, sinc } from './math/MathUtils.js';
export { triNoise3D } from './math/TriNoise3D.js';

// utils
export { default as ArrayElementNode } from './utils/ArrayElementNode.js';
export { default as ConvertNode } from './utils/ConvertNode.js';
export { default as DiscardNode, discard, Return } from './utils/DiscardNode.js';
export { default as EquirectUVNode, equirectUV } from './utils/EquirectUVNode.js';
export { default as FunctionOverloadingNode, overloadingFn } from './utils/FunctionOverloadingNode.js';
export { default as JoinNode } from './utils/JoinNode.js';
export { default as LoopNode, loop, Continue, Break } from './utils/LoopNode.js';
export { default as MatcapUVNode, matcapUV } from './utils/MatcapUVNode.js';
export { default as MaxMipLevelNode, maxMipLevel } from './utils/MaxMipLevelNode.js';
export { default as OscNode, oscSine, oscSquare, oscTriangle, oscSawtooth } from './utils/OscNode.js';
export { default as PackingNode, directionToColor, colorToDirection } from './utils/PackingNode.js';
export { default as RemapNode, remap, remapClamp } from './utils/RemapNode.js';
export { default as RotateUVNode, rotateUV } from './utils/RotateUVNode.js';
export { default as RotateNode, rotate } from './utils/RotateNode.js';
export { default as SetNode } from './utils/SetNode.js';
export { default as SplitNode } from './utils/SplitNode.js';
export { default as SpriteSheetUVNode, spritesheetUV } from './utils/SpriteSheetUVNode.js';
export { default as StorageArrayElementNode } from './utils/StorageArrayElementNode.js';
export { default as TimerNode, timerLocal, timerGlobal, timerDelta, frameId } from './utils/TimerNode.js';
export { default as TriplanarTexturesNode, triplanarTextures, triplanarTexture } from './utils/TriplanarTexturesNode.js';
export { default as ReflectorNode, reflector } from './utils/ReflectorNode.js';
export { default as RTTNode, rtt } from './utils/RTTNode.js';

// shadernode
export * from './shadernode/ShaderNode.js';

// accessors
export { TBNViewMatrix, parallaxDirection, parallaxUV, transformedBentNormalView } from './accessors/AccessorsUtils.js';
export { default as UniformsNode, uniforms } from './accessors/UniformsNode.js';
export * from './accessors/BitangentNode.js';
export { default as BufferAttributeNode, bufferAttribute, dynamicBufferAttribute, instancedBufferAttribute, instancedDynamicBufferAttribute } from './accessors/BufferAttributeNode.js';
export { default as BufferNode, buffer } from './accessors/BufferNode.js';
export * from './accessors/CameraNode.js';
export { default as VertexColorNode, vertexColor } from './accessors/VertexColorNode.js';
export { default as CubeTextureNode, cubeTexture } from './accessors/CubeTextureNode.js';
export { default as InstanceNode, instance } from './accessors/InstanceNode.js';
export { default as BatchNode, batch } from './accessors/BatchNode.js';
export { default as MaterialNode, materialAlphaTest, materialColor, materialShininess, materialEmissive, materialOpacity, materialSpecular, materialSpecularStrength, materialReflectivity, materialRoughness, materialMetalness, materialNormal, materialClearcoat, materialClearcoatRoughness, materialClearcoatNormal, materialRotation, materialSheen, materialSheenRoughness, materialIridescence, materialIridescenceIOR, materialIridescenceThickness, materialLineScale, materialLineDashSize, materialLineGapSize, materialLineWidth, materialLineDashOffset, materialPointWidth, materialAnisotropy, materialAnisotropyVector, materialDispersion, materialLightMap, materialAOMap } from './accessors/MaterialNode.js';
export { default as MaterialReferenceNode, materialReference } from './accessors/MaterialReferenceNode.js';
export { default as RendererReferenceNode, rendererReference } from './accessors/RendererReferenceNode.js';
export { default as MorphNode, morphReference } from './accessors/MorphNode.js';
export { default as TextureBicubicNode, textureBicubic } from './accessors/TextureBicubicNode.js';
export { default as ModelNode, modelDirection, modelViewMatrix, modelNormalMatrix, modelWorldMatrix, modelPosition, modelViewPosition, modelScale, modelWorldMatrixInverse } from './accessors/ModelNode.js';
export { default as ModelViewProjectionNode, modelViewProjection } from './accessors/ModelViewProjectionNode.js';
export * from './accessors/NormalNode.js';
export { default as Object3DNode, objectDirection, objectViewMatrix, objectNormalMatrix, objectWorldMatrix, objectPosition, objectScale, objectViewPosition } from './accessors/Object3DNode.js';
export { default as PointUVNode, pointUV } from './accessors/PointUVNode.js';
export * from './accessors/PositionNode.js';
export { default as ReferenceNode, reference, referenceBuffer } from './accessors/ReferenceNode.js';
export * from './accessors/ReflectVectorNode.js';
export { default as SkinningNode, skinning, skinningReference } from './accessors/SkinningNode.js';
export { default as SceneNode, backgroundBlurriness, backgroundIntensity } from './accessors/SceneNode.js';
export { default as StorageBufferNode, storage, storageObject } from './accessors/StorageBufferNode.js';
export * from './accessors/TangentNode.js';
export { default as TextureNode, texture, textureLoad, /*textureLevel,*/ sampler } from './accessors/TextureNode.js';
export { default as TextureSizeNode, textureSize } from './accessors/TextureSizeNode.js';
export { default as StorageTextureNode, storageTexture, textureStore } from './accessors/StorageTextureNode.js';
export { default as Texture3DNode, texture3D } from './accessors/Texture3DNode.js';
export * from './accessors/UVNode.js';
export { default as UserDataNode, userData } from './accessors/UserDataNode.js';

// display
export { default as BlendModeNode, burn, dodge, overlay, screen } from './display/BlendModeNode.js';
export { default as BumpMapNode, bumpMap } from './display/BumpMapNode.js';
export { default as ColorAdjustmentNode, saturation, vibrance, hue, luminance, threshold } from './display/ColorAdjustmentNode.js';
export { default as ColorSpaceNode, linearToColorSpace, colorSpaceToLinear, linearTosRGB, sRGBToLinear } from './display/ColorSpaceNode.js';
export { default as FrontFacingNode, frontFacing, faceDirection } from './display/FrontFacingNode.js';
export { default as NormalMapNode, normalMap } from './display/NormalMapNode.js';
export { default as PosterizeNode, posterize } from './display/PosterizeNode.js';
export { default as ToneMappingNode, toneMapping } from './display/ToneMappingNode.js';
export { default as ViewportNode, viewport, viewportCoordinate, viewportResolution, viewportTopLeft, viewportBottomLeft, viewportTopRight, viewportBottomRight } from './display/ViewportNode.js';
export { default as ViewportTextureNode, viewportTexture, viewportMipTexture } from './display/ViewportTextureNode.js';
export { default as ViewportSharedTextureNode, viewportSharedTexture } from './display/ViewportSharedTextureNode.js';
export { default as ViewportDepthTextureNode, viewportDepthTexture } from './display/ViewportDepthTextureNode.js';
export { default as ViewportDepthNode, viewZToOrthographicDepth, orthographicDepthToViewZ, viewZToPerspectiveDepth, perspectiveDepthToViewZ, depth, linearDepth, viewportLinearDepth } from './display/ViewportDepthNode.js';
export { default as GaussianBlurNode, gaussianBlur } from './display/GaussianBlurNode.js';
export { default as AfterImageNode, afterImage } from './display/AfterImageNode.js';
export { default as AnamorphicNode, anamorphic } from './display/AnamorphicNode.js';
export { default as SobelOperatorNode, sobel } from './display/SobelOperatorNode.js';
export { default as DepthOfFieldNode, dof } from './display/DepthOfFieldNode.js';
export { default as DotScreenNode, dotScreen } from './display/DotScreenNode.js';
export { default as RGBShiftNode, rgbShift } from './display/RGBShiftNode.js';
export { default as FilmNode, film } from './display/FilmNode.js';
export { default as Lut3DNode, lut3D } from './display/Lut3DNode.js';
export { default as GTAONode, ao } from './display/GTAONode.js';
export { default as DenoiseNode, denoise } from './display/DenoiseNode.js';
export { default as FXAANode, fxaa } from './display/FXAANode.js';
export { default as BloomNode, bloom } from './display/BloomNode.js';
export { default as TransitionNode, transition } from './display/TransitionNode.js';
export { default as RenderOutputNode, renderOutput } from './display/RenderOutputNode.js';
export { default as PixelationPassNode, pixelationPass } from './display/PixelationPassNode.js';

export { default as PassNode, pass, passTexture, depthPass } from './display/PassNode.js';

// code
export { default as ExpressionNode, expression } from './code/ExpressionNode.js';
export { default as CodeNode, code, js, wgsl, glsl } from './code/CodeNode.js';
export { default as FunctionCallNode, call } from './code/FunctionCallNode.js';
export { default as FunctionNode, wgslFn, glslFn } from './code/FunctionNode.js';
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
export { default as RectAreaLightNode } from './lighting/RectAreaLightNode.js';
export { default as SpotLightNode } from './lighting/SpotLightNode.js';
export { default as IESSpotLightNode } from './lighting/IESSpotLightNode.js';
export { default as AmbientLightNode } from './lighting/AmbientLightNode.js';
export { default as LightsNode, lights, lightsNode, addLightNode } from './lighting/LightsNode.js';
export { default as LightingNode /* @TODO: lighting (abstract), light */ } from './lighting/LightingNode.js';
export { default as LightingContextNode, lightingContext } from './lighting/LightingContextNode.js';
export { default as HemisphereLightNode } from './lighting/HemisphereLightNode.js';
export { default as EnvironmentNode } from './lighting/EnvironmentNode.js';
export { default as BasicEnvironmentNode } from './lighting/BasicEnvironmentNode.js';
export { default as IrradianceNode } from './lighting/IrradianceNode.js';
export { default as AONode } from './lighting/AONode.js';
export { default as AnalyticLightNode } from './lighting/AnalyticLightNode.js';

// pmrem
export { default as PMREMNode, pmremTexture } from './pmrem/PMREMNode.js';
export * from './pmrem/PMREMUtils.js';

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
export { default as BRDF_GGX } from './functions/BSDF/BRDF_GGX.js';
export { default as BRDF_Lambert } from './functions/BSDF/BRDF_Lambert.js';
export { default as D_GGX } from './functions/BSDF/D_GGX.js';
export { default as DFGApprox } from './functions/BSDF/DFGApprox.js';
export { default as F_Schlick } from './functions/BSDF/F_Schlick.js';
export { default as Schlick_to_F0 } from './functions/BSDF/Schlick_to_F0.js';
export { default as V_GGX_SmithCorrelated } from './functions/BSDF/V_GGX_SmithCorrelated.js';

export { getDistanceAttenuation } from './lighting/LightUtils.js';

export { default as getGeometryRoughness } from './functions/material/getGeometryRoughness.js';
export { default as getRoughness } from './functions/material/getRoughness.js';

export { default as PhongLightingModel } from './functions/PhongLightingModel.js';
export { default as PhysicalLightingModel } from './functions/PhysicalLightingModel.js';
