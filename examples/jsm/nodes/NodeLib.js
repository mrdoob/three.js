// core -- math -- utils
// accessors -- display -- fog -- geometry -- gpgpu -- lighting -- procedural

// core
import ArrayUniformNode from './core/ArrayUniformNode.js';
import AttributeNode, { attribute } from './core/AttributeNode.js';
import BypassNode, { bypass } from './core/BypassNode.js';
import CacheNode, { cache } from './core/CacheNode.js';
import CodeNode, { code } from './core/CodeNode.js';
import ConstNode from './core/ConstNode.js';
import ContextNode, { context } from './core/ContextNode.js';
import ExpressionNode, { expression } from './core/ExpressionNode.js';
import FunctionCallNode, { call } from './core/FunctionCallNode.js';
import FunctionNode, { func, fn } from './core/FunctionNode.js';
import InstanceIndexNode, { instanceIndex } from './core/InstanceIndexNode.js';
import LightingModel, { lightingModel } from './core/LightingModel.js';
import Node from './core/Node.js';
import NodeAttribute from './core/NodeAttribute.js';
import NodeBuilder from './core/NodeBuilder.js';
import NodeCache from './core/NodeCache.js';
import NodeCode from './core/NodeCode.js';
import NodeFrame from './core/NodeFrame.js';
import NodeFunctionInput from './core/NodeFunctionInput.js';
import NodeKeywords from './core/NodeKeywords.js';
import NodeUniform from './core/NodeUniform.js';
import NodeVar from './core/NodeVar.js';
import NodeVarying from './core/NodeVarying.js';
import PropertyNode, { property, diffuseColor, roughness, metalness, specularColor, shininess } from './core/PropertyNode.js';
import StackNode, { stack } from './core/StackNode.js';
import TempNode from './core/TempNode.js';
import UniformNode, { uniform } from './core/UniformNode.js';
import VarNode, { label, temp } from './core/VarNode.js';
import VaryingNode, { varying } from './core/VaryingNode.js';

// math
import MathNode, { EPSILON, INFINITY, radians, degrees, exp, exp2, log, log2, sqrt, inversesqrt, floor, ceil, normalize, fract, sin, cos, tan, asin, acos, atan, abs, sign, length, negate, invert, dFdx, dFdy, round, reciprocal, atan2, min, max, mod, step, reflect, distance, difference, dot, cross, pow, pow2, pow3, pow4, transformDirection, mix, clamp, refract, smoothstep, faceforward } from './math/MathNode.js';
import OperatorNode, { add, sub, mul, div, remainder, equal, assign, lessThan, greaterThan, lessThanEqual, greaterThanEqual, and, or, xor, bitAnd, bitOr, bitXor, shiftLeft, shiftRight } from './math/OperatorNode.js';
import CondNode, { cond } from './math/CondNode.js';

// utils
import { element, convert } from './shadernode/ShaderNode.js';
import ArrayElementNode from './utils/ArrayElementNode.js';
import ConvertNode from './utils/ConvertNode.js';
import DiscardNode, { discard } from './utils/DiscardNode.js';
import EquirectUVNode, { equirectUV } from './utils/EquirectUVNode.js';
import JoinNode from './utils/JoinNode.js';
import MatcapUVNode, { matcapUV } from './utils/MatcapUVNode.js';
import MaxMipLevelNode, { maxMipLevel } from './utils/MaxMipLevelNode.js';
import OscNode, { oscSine, oscSquare, oscTriangle, oscSawtooth } from './utils/OscNode.js';
import PackingNode, { directionToColor, colorToDirection } from './utils/PackingNode.js';
import RemapNode, { remap, remapClamp } from './utils/RemapNode.js';
import RotateUVNode, { rotateUV } from './utils/RotateUVNode.js';
import SpecularMIPLevelNode, { specularMIPLevel } from './utils/SpecularMIPLevelNode.js';
import SplitNode from './utils/SplitNode.js';
import SpriteSheetUVNode, { spritesheetUV } from './utils/SpriteSheetUVNode.js';
import TimerNode, { timerLocal, timerGlobal, timerDelta, frameId } from './utils/TimerNode.js';
import TriplanarTexturesNode, { triplanarTextures, triplanarTexture } from './utils/TriplanarTexturesNode.js';

// accessors
import BitangentNode, { bitangentGeometry, bitangentLocal, bitangentView, bitangentWorld, transformedBitangentView, transformedBitangentWorld } from './accessors/BitangentNode.js';
import BufferNode, { buffer } from './accessors/BufferNode.js';
import CameraNode, { cameraProjectionMatrix, cameraViewMatrix, cameraNormalMatrix, cameraWorldMatrix, cameraPosition } from './accessors/CameraNode.js';
import CubeTextureNode, { cubeTexture } from './accessors/CubeTextureNode.js';
import ExtendedMaterialNode, { materialNormal } from './accessors/ExtendedMaterialNode.js';
import InstanceNode, { instance } from './accessors/InstanceNode.js';
import MaterialNode, { materialUV, materialAlphaTest, materialColor, materialShininess, materialEmissive, materialOpacity, materialSpecularColor, materialReflectivity, materialRoughness, materialMetalness, materialRotation } from './accessors/MaterialNode.js';
import MaterialReferenceNode, { materialReference } from './accessors/MaterialReferenceNode.js';
import ModelNode, { modelDirection, modelViewMatrix, modelNormalMatrix, modelWorldMatrix, modelPosition, modelViewPosition } from './accessors/ModelNode.js';
import ModelViewProjectionNode, { modelViewProjection } from './accessors/ModelViewProjectionNode.js';
import NormalNode, { normalGeometry, normalLocal, normalView, normalWorld, transformedNormalView, transformedNormalWorld } from './accessors/NormalNode.js';
import Object3DNode, { objectDirection, objectViewMatrix, objectNormalMatrix, objectWorldMatrix, objectPosition, objectViewPosition } from './accessors/Object3DNode.js';
import PointUVNode, { pointUV } from './accessors/PointUVNode.js';
import PositionNode, { positionGeometry, positionLocal, positionWorld, positionWorldDirection, positionView, positionViewDirection } from './accessors/PositionNode.js';
import ReferenceNode, { reference } from './accessors/ReferenceNode.js';
import ReflectVectorNode, { reflectVector } from './accessors/ReflectVectorNode.js';
import SkinningNode, { skinning } from './accessors/SkinningNode.js';
import StorageBufferNode, { storage } from './accessors/StorageBufferNode.js';
import TangentNode, { tangentGeometry, tangentLocal, tangentView, tangentWorld, transformedTangentView, transformedTangentWorld } from './accessors/TangentNode.js';
import TextureNode, { texture, sampler } from './accessors/TextureNode.js';
import UVNode, { uv } from './accessors/UVNode.js';
import UserDataNode, { userData } from './accessors/UserDataNode.js';

// display
import BlendModeNode, { burn, dodge, overlay, screen } from './display/BlendModeNode.js';
import ColorAdjustmentNode, { saturation, vibrance, hue, lumaCoeffs, luminance } from './display/ColorAdjustmentNode.js';
import ColorSpaceNode, { colorSpace } from './display/ColorSpaceNode.js';
import FrontFacingNode, { frontFacing, faceDirection } from './display/FrontFacingNode.js';
import NormalMapNode, { normalMap, TBNViewMatrix } from './display/NormalMapNode.js';
import PosterizeNode, { posterize } from './display/PosterizeNode.js';
import ToneMappingNode, { toneMapping } from './display/ToneMappingNode.js';
import ViewportNode, { viewportCoordinate, viewportResolution, viewportTopLeft, viewportBottomLeft, viewportTopRight, viewportBottomRight } from './display/ViewportNode.js';

// fog
import FogNode, { fog } from './fog/FogNode.js';
import FogRangeNode, { rangeFog } from './fog/FogRangeNode.js';
import FogExp2Node, { densityFog } from './fog/FogExp2Node.js';

// geometry
import RangeNode, { range } from './geometry/RangeNode.js';

// gpgpu
import ComputeNode, { compute } from './gpgpu/ComputeNode.js';

// lighting
import PointLightNode from './lighting/PointLightNode.js';
import DirectionalLightNode from './lighting/DirectionalLightNode.js';
import SpotLightNode from './lighting/SpotLightNode.js';
import IESSpotLightNode from './lighting/IESSpotLightNode.js';
import AmbientLightNode from './lighting/AmbientLightNode.js';
import LightsNode, { lights, lightsWithoutWrap } from './lighting/LightsNode.js';
import LightingNode from './lighting/LightingNode.js';
import LightingContextNode, { lightingContext } from './lighting/LightingContextNode.js';
import HemisphereLightNode from './lighting/HemisphereLightNode.js';
import EnvironmentNode from './lighting/EnvironmentNode.js';
import AONode from './lighting/AONode.js';
import AnalyticLightNode from './lighting/AnalyticLightNode.js';

// procedural
import CheckerNode, { checker } from './procedural/CheckerNode.js';

// shadernode
import { nodeObject } from './shadernode/ShaderNode.js';

const nodeLib = {
	// core
	ArrayUniformNode,
	AttributeNode,
	BypassNode,
	CacheNode,
	CodeNode,
	ContextNode,
	ConstNode,
	ExpressionNode,
	FunctionCallNode,
	FunctionNode,
	InstanceIndexNode,
	LightingModel,
	Node,
	NodeAttribute,
	NodeBuilder,
	NodeCache,
	NodeCode,
	NodeFrame,
	NodeFunctionInput,
	NodeKeywords,
	NodeUniform,
	NodeVar,
	NodeVarying,
	PropertyNode,
	StackNode,
	TempNode,
	UniformNode,
	VarNode,
	VaryingNode,

	// math
	MathNode,
	OperatorNode,
	CondNode,

	// utils
	ArrayElementNode,
	ConvertNode,
	DiscardNode,
	EquirectUVNode,
	JoinNode,
	MatcapUVNode,
	MaxMipLevelNode,
	OscNode,
	PackingNode,
	RemapNode,
	RotateUVNode,
	SpecularMIPLevelNode,
	SplitNode,
	SpriteSheetUVNode,
	TimerNode,
	TriplanarTexturesNode,

	// accessors
	BitangentNode,
	BufferNode,
	CameraNode,
	CubeTextureNode,
	ExtendedMaterialNode,
	InstanceNode,
	MaterialNode,
	MaterialReferenceNode,
	ModelNode,
	ModelViewProjectionNode,
	NormalNode,
	Object3DNode,
	PointUVNode,
	PositionNode,
	ReferenceNode,
	ReflectVectorNode,
	SkinningNode,
	StorageBufferNode,
	TangentNode,
	TextureNode,
	UVNode,
	UserDataNode,

	// fog
	FogNode,
	FogRangeNode,
	FogExp2Node,

	// display
	BlendModeNode,
	ColorAdjustmentNode,
	ColorSpaceNode,
	FrontFacingNode,
	NormalMapNode,
	PosterizeNode,
	ToneMappingNode,
	ViewportNode,

	// geometry
	RangeNode,

	// gpgpu
	ComputeNode,

	// lighting
	PointLightNode,
	DirectionalLightNode,
	SpotLightNode,
	IESSpotLightNode,
	AmbientLightNode,
	LightsNode,
	LightingNode,
	LightingContextNode,
	HemisphereLightNode,
	EnvironmentNode,
	AONode,
	AnalyticLightNode,

	// procedural
	CheckerNode
};

export const fromType = ( type ) => {

	return nodeObject( new nodeLib[ type ]() );

};

// nodes
export {
	// core
	ArrayUniformNode,
	AttributeNode,
	BypassNode,
	CacheNode,
	CodeNode,
	ContextNode,
	ConstNode,
	ExpressionNode,
	FunctionCallNode,
	FunctionNode,
	InstanceIndexNode,
	LightingModel,
	Node,
	NodeAttribute,
	NodeBuilder,
	NodeCache,
	NodeCode,
	NodeFrame,
	NodeFunctionInput,
	NodeKeywords,
	NodeUniform,
	NodeVar,
	NodeVarying,
	PropertyNode,
	StackNode,
	TempNode,
	UniformNode,
	VarNode,
	VaryingNode,

	// math
	MathNode,
	OperatorNode,
	CondNode,

	// utils
	ArrayElementNode,
	ConvertNode,
	DiscardNode,
	EquirectUVNode,
	JoinNode,
	MatcapUVNode,
	MaxMipLevelNode,
	OscNode,
	PackingNode,
	RemapNode,
	RotateUVNode,
	SpecularMIPLevelNode,
	SplitNode,
	SpriteSheetUVNode,
	TimerNode,
	TriplanarTexturesNode,

	// accessors
	BitangentNode,
	BufferNode,
	CameraNode,
	CubeTextureNode,
	ExtendedMaterialNode,
	InstanceNode,
	MaterialNode,
	MaterialReferenceNode,
	ModelNode,
	ModelViewProjectionNode,
	NormalNode,
	Object3DNode,
	PointUVNode,
	PositionNode,
	ReferenceNode,
	ReflectVectorNode,
	SkinningNode,
	StorageBufferNode,
	TangentNode,
	TextureNode,
	UVNode,
	UserDataNode,

	// display
	BlendModeNode,
	ColorAdjustmentNode,
	ColorSpaceNode,
	FrontFacingNode,
	NormalMapNode,
	PosterizeNode,
	ToneMappingNode,
	ViewportNode,

	// fog
	FogNode,
	FogRangeNode,
	FogExp2Node,

	// geometry
	RangeNode,

	// gpgpu
	ComputeNode,

	// lighting
	PointLightNode,
	DirectionalLightNode,
	SpotLightNode,
	IESSpotLightNode,
	AmbientLightNode,
	LightsNode,
	LightingNode,
	LightingContextNode,
	HemisphereLightNode,
	EnvironmentNode,
	AONode,
	AnalyticLightNode,

	// procedural
	CheckerNode
};

// shadernode
export {
	// core

	// @TODO: arrayUniform
	func,
	fn,

	uniform,
	attribute,
	property,

	maxMipLevel,

	bypass,
	cache,
	call,
	code,
	context,
	convert,
	expression,
	instanceIndex,
	label,
	stack,
	temp,
	varying,

	// math

	EPSILON,
	INFINITY,

	cond,

	add,
	sub,
	mul,
	div,
	remainder,
	equal,
	assign,
	lessThan,
	greaterThan,
	lessThanEqual,
	greaterThanEqual,
	and,
	or,
	xor,
	bitAnd,
	bitOr,
	bitXor,
	shiftLeft,
	shiftRight,

	radians,
	degrees,
	exp,
	exp2,
	log,
	log2,
	sqrt,
	inversesqrt,
	floor,
	ceil,
	normalize,
	fract,
	sin,
	cos,
	tan,
	asin,
	acos,
	atan,
	abs,
	sign,
	length,
	negate,
	invert,
	dFdx,
	dFdy,
	round,
	reciprocal,

	atan2,
	min,
	max,
	mod,
	step,
	reflect,
	distance,
	difference,
	dot,
	cross,
	pow,
	pow2,
	pow3,
	pow4,
	transformDirection,

	mix,
	clamp,
	refract,
	smoothstep,
	faceforward,

	// utils

	element,
	discard,

	matcapUV,
	equirectUV,

	specularMIPLevel,

	oscSine,
	oscSquare,
	oscTriangle,
	oscSawtooth,

	directionToColor,
	colorToDirection,

	remap,
	remapClamp,

	rotateUV,

	spritesheetUV,

	timerLocal,
	timerGlobal,
	timerDelta,
	frameId,

	triplanarTextures,
	triplanarTexture,

	// accessors

	buffer,
	storage,

	cameraProjectionMatrix,
	cameraViewMatrix,
	cameraNormalMatrix,
	cameraWorldMatrix,
	cameraPosition,

	materialUV,
	materialAlphaTest,
	materialColor,
	materialShininess,
	materialEmissive,
	materialOpacity,
	materialSpecularColor,
	materialReflectivity,
	materialRoughness,
	materialMetalness,
	materialRotation,

	materialNormal,

	diffuseColor,
	roughness,
	metalness,
	specularColor,
	shininess,

	reference,
	materialReference,
	userData,

	modelViewProjection,

	normalGeometry,
	normalLocal,
	normalView,
	normalWorld,
	transformedNormalView,
	transformedNormalWorld,

	tangentGeometry,
	tangentLocal,
	tangentView,
	tangentWorld,
	transformedTangentView,
	transformedTangentWorld,

	bitangentGeometry,
	bitangentLocal,
	bitangentView,
	bitangentWorld,
	transformedBitangentView,
	transformedBitangentWorld,

	modelDirection,
	modelViewMatrix,
	modelNormalMatrix,
	modelWorldMatrix,
	modelPosition,
	modelViewPosition,

	objectDirection,
	objectViewMatrix,
	objectNormalMatrix,
	objectWorldMatrix,
	objectPosition,
	objectViewPosition,

	positionGeometry,
	positionLocal,
	positionWorld,
	positionWorldDirection,
	positionView,
	positionViewDirection,

	reflectVector,

	TBNViewMatrix,

	texture,
	cubeTexture,
	sampler,
	uv,
	pointUV,

	instance,
	skinning,

	// display

	frontFacing,
	faceDirection,

	burn,
	dodge,
	overlay,
	screen,

	saturation,
	vibrance,
	hue,

	colorSpace,
	normalMap,
	toneMapping,

	posterize,

	viewportCoordinate,
	viewportResolution,
	viewportTopLeft,
	viewportBottomLeft,
	viewportTopRight,
	viewportBottomRight,

	// fog

	fog,
	rangeFog,
	densityFog,

	// geometry

	range,

	// gpgpu

	compute,

	// lighting

	lightingModel,

	lumaCoeffs,
	luminance,

	// lighting, // abstract
	// light, // still needs to be added
	lights,
	lightsWithoutWrap,
	lightingContext,

	// procedural

	checker
};