/**
 * @author alteredq / http://alteredqualia.com/
 *
 */


THREE.ShaderSkin = {

	/* ------------------------------------------------------------------------------------------
	//	Skin shader
	//		- Blinn-Phong
	//		- normal + diffuse maps
	//		- four blur layers
	//		- point and directional lights (use with "lights: true" material option)
	//
	//		- based on Nvidia Advanced Skin Rendering GDC 2007 presentation
	//			http://developer.download.nvidia.com/presentations/2007/gdc/Advanced_Skin.pdf
	// ------------------------------------------------------------------------------------------ */

	'skin' : {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{

			"passID": { type: "i", value: 0 },

			"tDiffuse"	: { type: "t", value: 0, texture: null },
			"tNormal"	: { type: "t", value: 1, texture: null },

			"tBlur1"	: { type: "t", value: 2, texture: null },
			"tBlur2"	: { type: "t", value: 3, texture: null },
			"tBlur3"	: { type: "t", value: 4, texture: null },
			"tBlur4"	: { type: "t", value: 5, texture: null },

			"uNormalScale": { type: "f", value: 1.0 },

			"uDiffuseColor":  { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
			"uAmbientColor":  { type: "c", value: new THREE.Color( 0x050505 ) },
			"uShininess": 	  { type: "f", value: 30 },
			"uOpacity": 	  { type: "f", value: 1 }

			}

		] ),

		fragmentShader: [

			"uniform vec3 uAmbientColor;",
			"uniform vec3 uDiffuseColor;",
			"uniform vec3 uSpecularColor;",
			"uniform float uShininess;",
			"uniform float uOpacity;",

			"uniform int passID;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",

			"uniform sampler2D tBlur1;",
			"uniform sampler2D tBlur2;",
			"uniform sampler2D tBlur3;",
			"uniform sampler2D tBlur4;",

			"uniform float uNormalScale;",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"uniform vec3 ambientLightColor;",

			"#if MAX_DIR_LIGHTS > 0",
				"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
				"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
			"#endif",

			"#if MAX_POINT_LIGHTS > 0",
				"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
				"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",
			"#endif",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "fog_pars_fragment" ],

			"void main() {",

				"gl_FragColor = vec4( 1.0 );",

				"vec4 mColor = vec4( uDiffuseColor, uOpacity );",
				"vec4 mSpecular = vec4( uSpecularColor, uOpacity );",

				"vec3 specularTex = vec3( 1.0 );",

				"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
				"normalTex.xy *= uNormalScale;",
				"normalTex = normalize( normalTex );",

				"vec4 colDiffuse = texture2D( tDiffuse, vUv );",
				"colDiffuse *= colDiffuse;",

				"gl_FragColor = gl_FragColor * pow( colDiffuse, vec4( 0.5 ) );",


				"mat3 tsb = mat3( vTangent, vBinormal, vNormal );",
				"vec3 finalNormal = tsb * normalTex;",

				"vec3 normal = normalize( finalNormal );",
				"vec3 viewPosition = normalize( vViewPosition );",

				// point lights

				"vec4 specularTotal = vec4( vec3( 0.0 ), 1.0 );",

				"#if MAX_POINT_LIGHTS > 0",

					"vec4 pointTotal = vec4( vec3( 0.0 ), 1.0 );",

					"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

						"vec3 pointVector = normalize( vPointLight[ i ].xyz );",
						"vec3 pointHalfVector = normalize( vPointLight[ i ].xyz + viewPosition );",
						"float pointDistance = vPointLight[ i ].w;",

						"float pointDotNormalHalf = dot( normal, pointHalfVector );",
						"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

						"float pointSpecularWeight = 0.0;",

						"if ( passID == 1 && pointDotNormalHalf >= 0.0 )",
							"pointSpecularWeight = specularTex.r * pow( pointDotNormalHalf, uShininess );",

						"pointTotal  += pointDistance * vec4( pointLightColor[ i ], 1.0 ) * ( mColor * pointDiffuseWeight );",
						"specularTotal  += pointDistance * vec4( pointLightColor[ i ], 1.0 ) * ( mSpecular * pointSpecularWeight * pointDiffuseWeight );",

					"}",

				"#endif",

				// directional lights

				"#if MAX_DIR_LIGHTS > 0",

					"vec4 dirTotal = vec4( vec3( 0.0 ), 1.0 );",

					"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

						"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",

						"vec3 dirVector = normalize( lDirection.xyz );",
						"vec3 dirHalfVector = normalize( lDirection.xyz + viewPosition );",

						"float dirDotNormalHalf = dot( normal, dirHalfVector );",
						"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

						"float dirSpecularWeight = 0.0;",
						"if ( passID == 1 && dirDotNormalHalf >= 0.0 )",
							"dirSpecularWeight = specularTex.r * pow( dirDotNormalHalf, uShininess );",

						"dirTotal  += vec4( directionalLightColor[ i ], 1.0 ) * ( mColor * dirDiffuseWeight );",
						"specularTotal += vec4( directionalLightColor[ i ], 1.0 ) * ( mSpecular * dirSpecularWeight * dirDiffuseWeight );",

					"}",

				"#endif",

				// all lights contribution summation

				"vec4 totalLight = vec4( vec3( 0.0 ), uOpacity );",

				"#if MAX_DIR_LIGHTS > 0",
					"totalLight += dirTotal;",
				"#endif",

				"#if MAX_POINT_LIGHTS > 0",
					"totalLight += pointTotal;",
				"#endif",

				"gl_FragColor = gl_FragColor * totalLight;",

				"if ( passID == 0 ) {",

					"gl_FragColor = vec4( sqrt( gl_FragColor.xyz ), gl_FragColor.w );",

				"} else if ( passID == 1 ) {",

					//"#define VERSION1",

					"#ifdef VERSION1",

						"vec3 nonblurColor = sqrt( gl_FragColor.xyz );",

					"#else",

						"vec3 nonblurColor = gl_FragColor.xyz;",

					"#endif",

					"vec3 blur1Color = texture2D( tBlur1, vUv ).xyz;",
					"vec3 blur2Color = texture2D( tBlur2, vUv ).xyz;",
					"vec3 blur3Color = texture2D( tBlur3, vUv ).xyz;",
					"vec3 blur4Color = texture2D( tBlur4, vUv ).xyz;",


					//"gl_FragColor = vec4( blur1Color, gl_FragColor.w );",

					//"gl_FragColor = vec4( vec3( 0.22, 0.5, 0.7 ) * nonblurColor + vec3( 0.2, 0.5, 0.3 ) * blur1Color + vec3( 0.58, 0.0, 0.0 ) * blur2Color, gl_FragColor.w );",

					//"gl_FragColor = vec4( vec3( 0.25, 0.6, 0.8 ) * nonblurColor + vec3( 0.15, 0.25, 0.2 ) * blur1Color + vec3( 0.15, 0.15, 0.0 ) * blur2Color + vec3( 0.45, 0.0, 0.0 ) * blur3Color, gl_FragColor.w );",


					"gl_FragColor = vec4( vec3( 0.22,  0.437, 0.635 ) * nonblurColor + ",
										 "vec3( 0.101, 0.355, 0.365 ) * blur1Color + ",
										 "vec3( 0.119, 0.208, 0.0 )   * blur2Color + ",
										 "vec3( 0.114, 0.0,   0.0 )   * blur3Color + ",
										 "vec3( 0.444, 0.0,   0.0 )   * blur4Color",
										 ", gl_FragColor.w );",

					"gl_FragColor.xyz *= pow( colDiffuse.xyz, vec3( 0.5 ) );",

					"gl_FragColor += specularTotal;",
					"gl_FragColor.xyz += ambientLightColor * uAmbientColor * colDiffuse.xyz;",

					"#ifndef VERSION1",

						"gl_FragColor.xyz = sqrt( gl_FragColor.xyz );",

					"#endif",

				"}",

				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join("\n"),

		vertexShader: [

			"attribute vec4 tangent;",

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"#if MAX_POINT_LIGHTS > 0",

				"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
				"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

				"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",

			"#endif",

			"varying vec3 vViewPosition;",

			"void main() {",

				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				"vNormal = normalize( normalMatrix * normal );",

				// tangent and binormal vectors

				"vTangent = normalize( normalMatrix * tangent.xyz );",

				"vBinormal = cross( vNormal, vTangent ) * tangent.w;",
				"vBinormal = normalize( vBinormal );",

				"vUv = uv;",

				// point lights

				"#if MAX_POINT_LIGHTS > 0",

					"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

						"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",

						"vec3 lVector = lPosition.xyz - mvPosition.xyz;",

						"float lDistance = 1.0;",

						"if ( pointLightDistance[ i ] > 0.0 )",
							"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

						"lVector = normalize( lVector );",

						"vPointLight[ i ] = vec4( lVector, lDistance );",

					"}",

				"#endif",

				// displacement mapping

				"#ifdef VERTEX_TEXTURES",

					"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
					"float df = uDisplacementScale * dv.x + uDisplacementBias;",
					"vec4 displacedPosition = vec4( vNormal.xyz * df, 0.0 ) + mvPosition;",
					"gl_Position = projectionMatrix * displacedPosition;",

				"#else",

					"gl_Position = projectionMatrix * mvPosition;",

				"#endif",

			"}"

		].join("\n"),

		vertexShaderUV: [

			"attribute vec4 tangent;",

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"#if MAX_POINT_LIGHTS > 0",

				"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
				"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

				"varying vec4 vPointLight[ MAX_POINT_LIGHTS ];",

			"#endif",

			"varying vec3 vViewPosition;",

			"void main() {",

				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				"vNormal = normalize( normalMatrix * normal );",

				// tangent and binormal vectors

				"vTangent = normalize( normalMatrix * tangent.xyz );",

				"vBinormal = cross( vNormal, vTangent ) * tangent.w;",
				"vBinormal = normalize( vBinormal );",

				"vUv = uv;",

				// point lights

				"#if MAX_POINT_LIGHTS > 0",

					"for( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {",

						"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",

						"vec3 lVector = lPosition.xyz - mvPosition.xyz;",

						"float lDistance = 1.0;",

						"if ( pointLightDistance[ i ] > 0.0 )",
							"lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

						"lVector = normalize( lVector );",

						"vPointLight[ i ] = vec4( lVector, lDistance );",

					"}",

				"#endif",

				"gl_Position = vec4( uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0, 0.0, 1.0 );",

			"}"

		].join("\n")

	}


};