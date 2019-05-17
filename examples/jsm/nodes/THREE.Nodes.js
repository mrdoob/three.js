import {

	// core

	Node,
	TempNode,
	InputNode,
	ConstNode,
	VarNode,
	StructNode,
	AttributeNode,
	FunctionNode,
	ExpressionNode,
	FunctionCallNode,
	NodeLib,
	NodeUtils,
	NodeFrame,
	NodeUniform,
	NodeBuilder,

	// inputs

	BoolNode,
	IntNode,
	FloatNode,
	Vector2Node,
	Vector3Node,
	Vector4Node,
	ColorNode,
	Matrix3Node,
	Matrix4Node,
	TextureNode,
	CubeTextureNode,
	ScreenNode,
	ReflectorNode,
	PropertyNode,
	RTTNode,

	// accessors

	UVNode,
	ColorsNode,
	PositionNode,
	NormalNode,
	CameraNode,
	LightNode,
	ReflectNode,
	ScreenUVNode,
	ResolutionNode,

	// math

	Math1Node,
	Math2Node,
	Math3Node,
	OperatorNode,
	CondNode,

	// procedural

	NoiseNode,
	CheckerNode,

	// bsdfs

	BlinnShininessExponentNode,
	BlinnExponentToRoughnessNode,
	RoughnessToBlinnExponentNode,

	// misc

	TextureCubeUVNode,
	TextureCubeNode,
	NormalMapNode,
	BumpMapNode,

	// utils

	BypassNode,
	JoinNode,
	SwitchNode,
	TimerNode,
	VelocityNode,
	UVTransformNode,
	MaxMIPLevelNode,
	ColorSpaceNode,

	// effects

	BlurNode,
	ColorAdjustmentNode,
	LuminanceNode,

	// material nodes

	RawNode,
	SpriteNode,
	PhongNode,
	StandardNode,
	MeshStandardNode,

	// materials

	NodeMaterial,
	SpriteNodeMaterial,
	PhongNodeMaterial,
	StandardNodeMaterial,
	MeshStandardNodeMaterial,

	// post-processing

	NodePostProcessing

} from './Nodes.js';

// core

var Node = Node;
var TempNode = TempNode;
var InputNode = InputNode;
var ConstNode = ConstNode;
var VarNode = VarNode;
var StructNode = StructNode;
var AttributeNode = AttributeNode;
var FunctionNode = FunctionNode;
var ExpressionNode = ExpressionNode;
var FunctionCallNode = FunctionCallNode;
var NodeLib = NodeLib;
var NodeUtils = NodeUtils;
var NodeFrame = NodeFrame;
var NodeUniform = NodeUniform;
var NodeBuilder = NodeBuilder;

// inputs

var BoolNode = BoolNode;
var IntNode = IntNode;
var FloatNode = FloatNode;
var Vector2Node = Vector2Node;
var Vector3Node = Vector3Node;
var Vector4Node = Vector4Node;
var ColorNode = ColorNode;
var Matrix3Node = Matrix3Node;
var Matrix4Node = Matrix4Node;
var TextureNode = TextureNode;
var CubeTextureNode = CubeTextureNode;
var ScreenNode = ScreenNode;
var ReflectorNode = ReflectorNode;
var PropertyNode = PropertyNode;
var RTTNode = RTTNode;

// accessors

var UVNode = UVNode;
var ColorsNode = ColorsNode;
var PositionNode = PositionNode;
var NormalNode = NormalNode;
var CameraNode = CameraNode;
var LightNode = LightNode;
var ReflectNode = ReflectNode;
var ScreenUVNode = ScreenUVNode;
var ResolutionNode = ResolutionNode;

// math

var Math1Node = Math1Node;
var Math2Node = Math2Node;
var Math3Node = Math3Node;
var OperatorNode = OperatorNode;
var CondNode = CondNode;

// procedural

var NoiseNode = NoiseNode;
var CheckerNode = CheckerNode;

// bsdfs

var BlinnShininessExponentNode = BlinnShininessExponentNode;
var BlinnExponentToRoughnessNode = BlinnExponentToRoughnessNode;
var RoughnessToBlinnExponentNode = RoughnessToBlinnExponentNode;

// misc

var TextureCubeUVNode = TextureCubeUVNode;
var TextureCubeNode = TextureCubeNode;
var NormalMapNode = NormalMapNode;
var BumpMapNode = BumpMapNode;

// utils

var BypassNode = BypassNode;
var JoinNode = JoinNode;
var SwitchNode = SwitchNode;
var TimerNode = TimerNode;
var VelocityNode = VelocityNode;
var UVTransformNode = UVTransformNode;
var MaxMIPLevelNode = MaxMIPLevelNode;
var ColorSpaceNode = ColorSpaceNode;

// effects

var BlurNode = BlurNode;
var ColorAdjustmentNode = ColorAdjustmentNode;
var LuminanceNode = LuminanceNode;

// material nodes

var RawNode = RawNode;
var SpriteNode = SpriteNode;
var PhongNode = PhongNode;
var StandardNode = StandardNode;
var MeshStandardNode = MeshStandardNode;

// materials

var NodeMaterial = NodeMaterial;
var SpriteNodeMaterial = SpriteNodeMaterial;
var PhongNodeMaterial = PhongNodeMaterial;
var StandardNodeMaterial = StandardNodeMaterial;
var MeshStandardNodeMaterial = MeshStandardNodeMaterial;

// post-processing

var NodePostProcessing = NodePostProcessing;

export { Node, TempNode, InputNode, ConstNode, VarNode, StructNode, AttributeNode, FunctionNode, ExpressionNode, FunctionCallNode, NodeLib, NodeUtils, NodeFrame, NodeUniform, NodeBuilder, BoolNode, IntNode, FloatNode, Vector2Node, Vector3Node, Vector4Node, ColorNode, Matrix3Node, Matrix4Node, TextureNode, CubeTextureNode, ScreenNode, ReflectorNode, PropertyNode, RTTNode, UVNode, ColorsNode, PositionNode, NormalNode, CameraNode, LightNode, ReflectNode, ScreenUVNode, ResolutionNode, Math1Node, Math2Node, Math3Node, OperatorNode, CondNode, NoiseNode, CheckerNode, BlinnShininessExponentNode, BlinnExponentToRoughnessNode, RoughnessToBlinnExponentNode, TextureCubeUVNode, TextureCubeNode, NormalMapNode, BumpMapNode, BypassNode, JoinNode, SwitchNode, TimerNode, VelocityNode, UVTransformNode, MaxMIPLevelNode, ColorSpaceNode, BlurNode, ColorAdjustmentNode, LuminanceNode, RawNode, SpriteNode, PhongNode, StandardNode, MeshStandardNode, NodeMaterial, SpriteNodeMaterial, PhongNodeMaterial, StandardNodeMaterial, MeshStandardNodeMaterial, NodePostProcessing };
