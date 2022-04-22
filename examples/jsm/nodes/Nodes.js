// core
import ArrayUniformNode from './core/ArrayUniformNode.js';
import AttributeNode from './core/AttributeNode.js';
import BypassNode from './core/BypassNode.js';
import CodeNode from './core/CodeNode.js';
import ConstNode from './core/ConstNode.js';
import ContextNode from './core/ContextNode.js';
import ExpressionNode from './core/ExpressionNode.js';
import FunctionCallNode from './core/FunctionCallNode.js';
import FunctionNode from './core/FunctionNode.js';
import InstanceIndexNode from './core/InstanceIndexNode.js';
import Node from './core/Node.js';
import NodeAttribute from './core/NodeAttribute.js';
import NodeBuilder from './core/NodeBuilder.js';
import NodeCode from './core/NodeCode.js';
import NodeFrame from './core/NodeFrame.js';
import NodeFunctionInput from './core/NodeFunctionInput.js';
import NodeKeywords from './core/NodeKeywords.js';
import NodeUniform from './core/NodeUniform.js';
import NodeVar from './core/NodeVar.js';
import NodeVary from './core/NodeVary.js';
import PropertyNode from './core/PropertyNode.js';
import TempNode from './core/TempNode.js';
import UniformNode from './core/UniformNode.js';
import VarNode from './core/VarNode.js';
import VaryNode from './core/VaryNode.js';

// accessors
import BufferNode from './accessors/BufferNode.js';
import CameraNode from './accessors/CameraNode.js';
import CubeTextureNode from './accessors/CubeTextureNode.js';
import InstanceNode from './accessors/InstanceNode.js';
import MaterialNode from './accessors/MaterialNode.js';
import MaterialReferenceNode from './accessors/MaterialReferenceNode.js';
import ModelNode from './accessors/ModelNode.js';
import ModelViewProjectionNode from './accessors/ModelViewProjectionNode.js';
import NormalNode from './accessors/NormalNode.js';
import Object3DNode from './accessors/Object3DNode.js';
import PointUVNode from './accessors/PointUVNode.js';
import PositionNode from './accessors/PositionNode.js';
import ReferenceNode from './accessors/ReferenceNode.js';
import ReflectNode from './accessors/ReflectNode.js';
import SkinningNode from './accessors/SkinningNode.js';
import TextureNode from './accessors/TextureNode.js';
import UVNode from './accessors/UVNode.js';

// gpgpu
import ComputeNode from './gpgpu/ComputeNode.js';

// display
import ColorSpaceNode from './display/ColorSpaceNode.js';
import NormalMapNode from './display/NormalMapNode.js';
import ToneMappingNode from './display/ToneMappingNode.js';

// math
import MathNode from './math/MathNode.js';
import OperatorNode from './math/OperatorNode.js';
import CondNode from './math/CondNode.js';

// lights
import LightContextNode from './lights/LightContextNode.js';
import LightNode from './lights/LightNode.js';
import LightsNode from './lights/LightsNode.js';

// utils
import ArrayElementNode from './utils/ArrayElementNode.js';
import ConvertNode from './utils/ConvertNode.js';
import JoinNode from './utils/JoinNode.js';
import SplitNode from './utils/SplitNode.js';
import SpriteSheetUVNode from './utils/SpriteSheetUVNode.js';
import MatcapUVNode from './utils/MatcapUVNode.js';
import OscNode from './utils/OscNode.js';
import TimerNode from './utils/TimerNode.js';

// loaders
import NodeLoader from './loaders/NodeLoader.js';
import NodeObjectLoader from './loaders/NodeObjectLoader.js';
import NodeMaterialLoader from './loaders/NodeMaterialLoader.js';

// procedural
import CheckerNode from './procedural/CheckerNode.js';

// fog
import FogNode from './fog/FogNode.js';
import FogRangeNode from './fog/FogRangeNode.js';

// core
export * from './core/constants.js';

// materials
export * from './materials/Materials.js';

// shader node
export * from './shadernode/ShaderNodeElements.js';

const nodeLib = {
	// core
	ArrayUniformNode,
	AttributeNode,
	BypassNode,
	CodeNode,
	ContextNode,
	ConstNode,
	ExpressionNode,
	FunctionCallNode,
	FunctionNode,
	InstanceIndexNode,
	Node,
	NodeAttribute,
	NodeBuilder,
	NodeCode,
	NodeFrame,
	NodeFunctionInput,
	NodeKeywords,
	NodeUniform,
	NodeVar,
	NodeVary,
	PropertyNode,
	TempNode,
	UniformNode,
	VarNode,
	VaryNode,

	// compute
	ComputeNode,

	// accessors
	BufferNode,
	CameraNode,
	CubeTextureNode,
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
	ReflectNode,
	SkinningNode,
	TextureNode,
	UVNode,

	// display
	ColorSpaceNode,
	NormalMapNode,
	ToneMappingNode,

	// math
	MathNode,
	OperatorNode,
	CondNode,

	// lights
	LightContextNode,
	LightNode,
	LightsNode,

	// utils
	ArrayElementNode,
	ConvertNode,
	JoinNode,
	SplitNode,
	SpriteSheetUVNode,
	MatcapUVNode,
	OscNode,
	TimerNode,

	// procedural
	CheckerNode,

	// fog
	FogNode,
	FogRangeNode,

	// loaders
	NodeLoader,
	NodeObjectLoader,
	NodeMaterialLoader

};

export const fromType = ( type ) => {

	return new nodeLib[ type ]();

};

export {
	// core
	ArrayUniformNode,
	AttributeNode,
	BypassNode,
	CodeNode,
	ContextNode,
	ConstNode,
	ExpressionNode,
	FunctionCallNode,
	FunctionNode,
	InstanceIndexNode,
	Node,
	NodeAttribute,
	NodeBuilder,
	NodeCode,
	NodeFrame,
	NodeFunctionInput,
	NodeKeywords,
	NodeUniform,
	NodeVar,
	NodeVary,
	PropertyNode,
	TempNode,
	UniformNode,
	VarNode,
	VaryNode,

	// compute
	ComputeNode,

	// accessors
	BufferNode,
	CameraNode,
	CubeTextureNode,
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
	ReflectNode,
	SkinningNode,
	TextureNode,
	UVNode,

	// display
	ColorSpaceNode,
	NormalMapNode,
	ToneMappingNode,

	// math
	MathNode,
	OperatorNode,
	CondNode,

	// lights
	LightContextNode,
	LightNode,
	LightsNode,

	// utils
	ArrayElementNode,
	ConvertNode,
	JoinNode,
	SplitNode,
	SpriteSheetUVNode,
	MatcapUVNode,
	OscNode,
	TimerNode,

	// procedural
	CheckerNode,

	// fog
	FogNode,
	FogRangeNode,

	// loaders
	NodeLoader,
	NodeObjectLoader,
	NodeMaterialLoader
};
