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

				MaterialDiffuseColor = vec4( 1.0 );

				#ifdef NODE_COLOR

					NODE_CODE_COLOR

					MaterialDiffuseColor = NODE_COLOR;

				#endif

				#ifdef NODE_OPACITY

					NODE_CODE_OPACITY

					MaterialDiffuseColor.a *= NODE_OPACITY;

				#endif

				#ifdef NODE_LIGHT

					NODE_CODE_LIGHT

					outColor.rgb = NODE_LIGHT;
					outColor.a = MaterialDiffuseColor.a;

				#else

					outColor = MaterialDiffuseColor;

				#endif

			}`

	},

	phong: {

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

				MaterialDiffuseColor = vec4( 1.0 );
				MaterialSpecularColor = vec3( 1.0 );
				MaterialSpecularShininess = 30.0;

				NODE_CODE_COLOR
				MaterialDiffuseColor = NODE_COLOR;

				NODE_CODE_OPACITY
				MaterialDiffuseColor.a *= NODE_OPACITY;

				NODE_CODE_SPECULAR
				MaterialSpecularColor = NODE_SPECULAR;

				NODE_CODE_SHININESS
				MaterialSpecularShininess = NODE_SHININESS;

				#ifdef NODE_LIGHT

					NODE_CODE_LIGHT

					outColor.rgb = NODE_LIGHT;
					outColor.a = MaterialDiffuseColor.a;

				#else

					outColor = MaterialDiffuseColor;

				#endif

			}`

	}

};

export default ShaderLib;
