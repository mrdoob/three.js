/**
 * @author sunag / http://www.sunag.com.br/
 */

( function () {
	
	function loadScript( path ) {

		var js = document.createElement("script");
		js.type = 'text/javascript';
		js.src = path;

		document.body.appendChild( js );

	}
	
	function loadScripts( path, scripts ) {

		for(var i = 0; i < scripts.length; i++) {
			
			loadScript( path + scripts[i] );
			
		}

	}
	
	loadScripts( "js/nodes/", [
		// NodeLibrary
		"core/GLNode.js",
		"core/RawNode.js",
		"core/BypassNode.js",
		"core/TempNode.js",
		"core/InputNode.js",
		"core/ConstNode.js",
		"core/VarNode.js",
		"core/StructNode.js",
		"core/FunctionNode.js",
		"core/FunctionCallNode.js",
		"core/AttributeNode.js",
		"core/NodeUniform.js",
		"core/NodeBuilder.js",
		"core/NodeLib.js",
		"core/NodeFrame.js",
		"core/NodeMaterial.js",
		// Library
		"libs/common.js",
		"libs/keywords.js",
		// Accessors
		"accessors/PositionNode.js",
		"accessors/NormalNode.js",
		"accessors/UVNode.js",
		"accessors/ScreenUVNode.js",
		"accessors/ColorsNode.js",
		"accessors/CameraNode.js",
		"accessors/ReflectNode.js",
		"accessors/LightNode.js",
		// Inputs
		"inputs/IntNode.js",
		"inputs/FloatNode.js",
		"inputs/ColorNode.js",
		"inputs/Vector2Node.js",
		"inputs/Vector3Node.js",
		"inputs/Vector4Node.js",
		"inputs/TextureNode.js",
		"inputs/Matrix3Node.js",
		"inputs/Matrix4Node.js",
		"inputs/CubeTextureNode.js",
		// Math
		"math/Math1Node.js",
		"math/Math2Node.js",
		"math/Math3Node.js",
		"math/OperatorNode.js",
		// Utils
		"utils/SwitchNode.js",
		"utils/JoinNode.js",
		"utils/TimerNode.js",
		"utils/RoughnessToBlinnExponentNode.js",
		"utils/BlinnShininessExponentNode.js",
		"utils/VelocityNode.js",
		"utils/LuminanceNode.js",
		"utils/ColorAdjustmentNode.js",
		"utils/NoiseNode.js",
		"utils/ResolutionNode.js",
		"utils/BumpMapNode.js",
		"utils/BlurNode.js",
		"utils/UVTransformNode.js",
		"utils/MaxMIPLevelNode.js",
		"utils/NormalMapNode.js",
		// Phong Material
		"materials/PhongNode.js",
		"materials/PhongNodeMaterial.js",
		// Standard Material
		"materials/StandardNode.js",
		"materials/StandardNodeMaterial.js"
	]);
	
}() );
