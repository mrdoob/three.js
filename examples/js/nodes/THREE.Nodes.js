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

	MathNode,
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

THREE.Node = Node;
THREE.TempNode = TempNode;
THREE.InputNode = InputNode;
THREE.ConstNode = ConstNode;
THREE.VarNode = VarNode;
THREE.StructNode = StructNode;
THREE.AttributeNode = AttributeNode;
THREE.FunctionNode = FunctionNode;
THREE.ExpressionNode = ExpressionNode;
THREE.FunctionCallNode = FunctionCallNode;
THREE.NodeLib = NodeLib;
THREE.NodeUtils = NodeUtils;
THREE.NodeFrame = NodeFrame;
THREE.NodeUniform = NodeUniform;
THREE.NodeBuilder = NodeBuilder;

// inputs

THREE.BoolNode = BoolNode;
THREE.IntNode = IntNode;
THREE.FloatNode = FloatNode;
THREE.Vector2Node = Vector2Node;
THREE.Vector3Node = Vector3Node;
THREE.Vector4Node = Vector4Node;
THREE.ColorNode = ColorNode;
THREE.Matrix3Node = Matrix3Node;
THREE.Matrix4Node = Matrix4Node;
THREE.TextureNode = TextureNode;
THREE.CubeTextureNode = CubeTextureNode;
THREE.ScreenNode = ScreenNode;
THREE.ReflectorNode = ReflectorNode;
THREE.PropertyNode = PropertyNode;
THREE.RTTNode = RTTNode;

// accessors

THREE.UVNode = UVNode;
THREE.ColorsNode = ColorsNode;
THREE.PositionNode = PositionNode;
THREE.NormalNode = NormalNode;
THREE.CameraNode = CameraNode;
THREE.LightNode = LightNode;
THREE.ReflectNode = ReflectNode;
THREE.ScreenUVNode = ScreenUVNode;
THREE.ResolutionNode = ResolutionNode;

// math

THREE.MathNode = MathNode;
THREE.OperatorNode = OperatorNode;
THREE.CondNode = CondNode;

// procedural

THREE.NoiseNode = NoiseNode;
THREE.CheckerNode = CheckerNode;

// bsdfs

THREE.BlinnShininessExponentNode = BlinnShininessExponentNode;
THREE.BlinnExponentToRoughnessNode = BlinnExponentToRoughnessNode;
THREE.RoughnessToBlinnExponentNode = RoughnessToBlinnExponentNode;

// misc

THREE.TextureCubeUVNode = TextureCubeUVNode;
THREE.TextureCubeNode = TextureCubeNode;
THREE.NormalMapNode = NormalMapNode;
THREE.BumpMapNode = BumpMapNode;

// utils

THREE.BypassNode = BypassNode;
THREE.JoinNode = JoinNode;
THREE.SwitchNode = SwitchNode;
THREE.TimerNode = TimerNode;
THREE.VelocityNode = VelocityNode;
THREE.UVTransformNode = UVTransformNode;
THREE.MaxMIPLevelNode = MaxMIPLevelNode;
THREE.ColorSpaceNode = ColorSpaceNode;

// effects

THREE.BlurNode = BlurNode;
THREE.ColorAdjustmentNode = ColorAdjustmentNode;
THREE.LuminanceNode = LuminanceNode;

// material nodes

THREE.RawNode = RawNode;
THREE.SpriteNode = SpriteNode;
THREE.PhongNode = PhongNode;
THREE.StandardNode = StandardNode;
THREE.MeshStandardNode = MeshStandardNode;

// materials

THREE.NodeMaterial = NodeMaterial;
THREE.SpriteNodeMaterial = SpriteNodeMaterial;
THREE.PhongNodeMaterial = PhongNodeMaterial;
THREE.StandardNodeMaterial = StandardNodeMaterial;
THREE.MeshStandardNodeMaterial = MeshStandardNodeMaterial;

// post-processing

THREE.NodePostProcessing = NodePostProcessing;
