const ShaderLib = {

	common: {

		vertexShader:
			`#version 450

			void main(){

				NODE_CODE

				NODE_CODE_MVP
				gl_Position = NODE_MVP;

			}`,

		fragmentShader:
			`#version 450

			layout(location = 0) out vec4 outColor;

			void main() {

				NODE_CODE

				MaterialDiffuseColor = vec4( 1.0 );

				#ifdef NODE_COLOR

					NODE_CODE_COLOR

					MaterialDiffuseColor = NODE_COLOR;

				#endif

				#ifdef NODE_OPACITY

					NODE_CODE_OPACITY

					MaterialDiffuseColor.a *= NODE_OPACITY;

				#endif

				#ifdef NODE_ALPHA_TEST

					NODE_CODE_ALPHA_TEST
					if ( MaterialDiffuseColor.a < NODE_ALPHA_TEST ) discard;

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

	standard: {

		vertexShader:
			`#version 450

			void main(){

				NODE_CODE

				NODE_CODE_MVP
				gl_Position = NODE_MVP;

			}`,

		fragmentShader:
			`#version 450

			layout(location = 0) out vec4 outColor;

			void main() {

				NODE_CODE

				MaterialDiffuseColor = vec4( 1.0 );
				MaterialMetalness = 1.0;
				MaterialRoughness = 1.0;

				#ifdef NODE_COLOR

					NODE_CODE_COLOR

					MaterialDiffuseColor = NODE_COLOR;

				#endif

				#ifdef NODE_OPACITY

					NODE_CODE_OPACITY

					MaterialDiffuseColor.a *= NODE_OPACITY;

				#endif

				#ifdef NODE_ALPHA_TEST

					NODE_CODE_ALPHA_TEST
					if ( MaterialDiffuseColor.a < NODE_ALPHA_TEST ) discard;

				#endif

				NODE_CODE_METALNESS
				MaterialMetalness = NODE_METALNESS;

				NODE_CODE_ROUGHNESS
				MaterialRoughness = NODE_ROUGHNESS;

				#ifdef NODE_NORMAL

					NODE_CODE_NORMAL
					TransformedNormalView = NODE_NORMAL;

				#endif

				MaterialDiffuseColor.rgb = MaterialDiffuseColor.rgb * ( 1.0 - MaterialMetalness );

				#ifdef NODE_LIGHT

					NODE_CODE_LIGHT

					outColor.rgb = NODE_LIGHT;
					outColor.a = MaterialDiffuseColor.a;

				#else

					outColor = MaterialDiffuseColor;

				#endif

			}`

	},

};

export default ShaderLib;
