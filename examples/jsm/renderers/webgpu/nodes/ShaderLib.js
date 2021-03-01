const ShaderLib = {
	common: {
		vertexShader: 
`#version 450

NODE_HEADER_ATTRIBUTES
NODE_HEADER_UNIFORMS
NODE_HEADER_VARYS

void main(){
	
	NODE_BODY_VARYS
	NODE_BODY_VARS
	
	gl_Position = NODE_MVP;
	
}`,
		fragmentShader: 
`#version 450

NODE_HEADER_ATTRIBUTES
NODE_HEADER_UNIFORMS
NODE_HEADER_VARYS

layout(location = 0) out vec4 outColor;

void main() {

	NODE_BODY_VARS

	outColor = vec4( 1.0 );

	#ifdef NODE_COLOR

		outColor = NODE_COLOR;

	#endif

	#ifdef NODE_OPACITY

		outColor.a *= NODE_OPACITY;

	#endif

	#ifdef NODE_LIGHT

		outColor.rgb *= NODE_LIGHT;

	#endif

}`
	}
};

export default ShaderLib;
