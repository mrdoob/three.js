/**
 * @author alteredq / http://alteredqualia.com/
 *
 */


THREE.ShaderSkin = {

	/* ------------------------------------------------------------------------------------------
	//	Simple skin shader
	//		- per-pixel Blinn-Phong diffuse term mixed with half-Lambert wrap-around term (per color component)
	//		- physically based specular term (Kelemen/Szirmay-Kalos specular reflectance)
	//
	//		- diffuse map
	//		- bump map
	//		- specular map
	//		- point, directional and hemisphere lights (use with "lights: true" material option)
	//		- fog (use with "fog: true" material option)
	//		- shadow maps
	//
	// ------------------------------------------------------------------------------------------ */

	'skinSimple' : {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{

				"enableBump": { value: 0 },
				"enableSpecular": { value: 0 },

				"tDiffuse": { value: null },
				"tBeckmann": { value: null },

				"diffuse": { value: new THREE.Color( 0xeeeeee ) },
				"specular": { value: new THREE.Color( 0x111111 ) },
				"opacity": { value: 1 },

				"uRoughness": { value: 0.15 },
				"uSpecularBrightness": { value: 0.75 },

				"bumpMap": { value: null },
				"bumpScale": { value: 1 },

				"specularMap": { value: null },

				"offsetRepeat": { value: new THREE.Vector4( 0, 0, 1, 1 ) },

				"uWrapRGB": { value: new THREE.Vector3( 0.75, 0.375, 0.1875 ) }

			}

		] ),

		fragmentShader: [

			"#define USE_BUMPMAP",

			"uniform bool enableBump;",
			"uniform bool enableSpecular;",

			"uniform vec3 diffuse;",
			"uniform vec3 specular;",
			"uniform float opacity;",

			"uniform float uRoughness;",
			"uniform float uSpecularBrightness;",

			"uniform vec3 uWrapRGB;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tBeckmann;",

			"uniform sampler2D specularMap;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "bsdfs" ],
			THREE.ShaderChunk[ "packing" ],
			THREE.ShaderChunk[ "lights_pars" ],
			THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],
			THREE.ShaderChunk[ "bumpmap_pars_fragment" ],

			// Fresnel term

			"float fresnelReflectance( vec3 H, vec3 V, float F0 ) {",

				"float base = 1.0 - dot( V, H );",
				"float exponential = pow( base, 5.0 );",

				"return exponential + F0 * ( 1.0 - exponential );",

			"}",

			// Kelemen/Szirmay-Kalos specular BRDF

			"float KS_Skin_Specular( vec3 N,", 		// Bumped surface normal
									"vec3 L,", 		// Points to light
									"vec3 V,", 		// Points to eye
									"float m,",  	// Roughness
									"float rho_s", 	// Specular brightness
									") {",

				"float result = 0.0;",
				"float ndotl = dot( N, L );",

				"if( ndotl > 0.0 ) {",

					"vec3 h = L + V;", // Unnormalized half-way vector
					"vec3 H = normalize( h );",

					"float ndoth = dot( N, H );",

					"float PH = pow( 2.0 * texture2D( tBeckmann, vec2( ndoth, m ) ).x, 10.0 );",

					"float F = fresnelReflectance( H, V, 0.028 );",
					"float frSpec = max( PH * F / dot( h, h ), 0.0 );",

					"result = ndotl * rho_s * frSpec;", // BRDF * dot(N,L) * rho_s

				"}",

				"return result;",

			"}",

			"void main() {",

				"vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
				"vec4 diffuseColor = vec4( diffuse, opacity );",

				"vec4 colDiffuse = texture2D( tDiffuse, vUv );",
				"colDiffuse.rgb *= colDiffuse.rgb;",

				"diffuseColor = diffuseColor * colDiffuse;",

				"vec3 normal = normalize( vNormal );",
				"vec3 viewerDirection = normalize( vViewPosition );",

				"float specularStrength;",

				"if ( enableSpecular ) {",

					"vec4 texelSpecular = texture2D( specularMap, vUv );",
					"specularStrength = texelSpecular.r;",

				"} else {",

					"specularStrength = 1.0;",

				"}",

				"#ifdef USE_BUMPMAP",

					"if ( enableBump ) normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );",

				"#endif",

				// point lights

				"vec3 totalSpecularLight = vec3( 0.0 );",
				"vec3 totalDiffuseLight = vec3( 0.0 );",

				"#if NUM_POINT_LIGHTS > 0",

					"for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",

						"vec3 lVector = pointLights[ i ].position + vViewPosition.xyz;",

						"float attenuation = calcLightAttenuation( length( lVector ), pointLights[ i ].distance, pointLights[ i ].decay );",

						"lVector = normalize( lVector );",

						"float pointDiffuseWeightFull = max( dot( normal, lVector ), 0.0 );",
						"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, lVector ) + 0.5, 0.0 );",
						"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), uWrapRGB );",

						"float pointSpecularWeight = KS_Skin_Specular( normal, lVector, viewerDirection, uRoughness, uSpecularBrightness );",

						"totalDiffuseLight += pointLight[ i ].color * ( pointDiffuseWeight * attenuation );",
						"totalSpecularLight += pointLight[ i ].color * specular * ( pointSpecularWeight * specularStrength * attenuation );",

					"}",

				"#endif",

				// directional lights

				"#if NUM_DIR_LIGHTS > 0",

					"for( int i = 0; i < NUM_DIR_LIGHTS; i++ ) {",

						"vec3 dirVector = directionalLights[ i ].direction;",

						"float dirDiffuseWeightFull = max( dot( normal, dirVector ), 0.0 );",
						"float dirDiffuseWeightHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",
						"vec3 dirDiffuseWeight = mix( vec3 ( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), uWrapRGB );",

						"float dirSpecularWeight = KS_Skin_Specular( normal, dirVector, viewerDirection, uRoughness, uSpecularBrightness );",

						"totalDiffuseLight += directionalLights[ i ].color * dirDiffuseWeight;",
						"totalSpecularLight += directionalLights[ i ].color * ( dirSpecularWeight * specularStrength );",

					"}",

				"#endif",

				// hemisphere lights

				"#if NUM_HEMI_LIGHTS > 0",

					"for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {",

						"vec3 lVector = hemisphereLightDirection[ i ];",

						"float dotProduct = dot( normal, lVector );",
						"float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

						"totalDiffuseLight += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

						// specular (sky light)

						"float hemiSpecularWeight = 0.0;",
						"hemiSpecularWeight += KS_Skin_Specular( normal, lVector, viewerDirection, uRoughness, uSpecularBrightness );",

						// specular (ground light)

						"vec3 lVectorGround = -lVector;",
						"hemiSpecularWeight += KS_Skin_Specular( normal, lVectorGround, viewerDirection, uRoughness, uSpecularBrightness );",

						"vec3 hemiSpecularColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

						"totalSpecularLight += hemiSpecularColor * specular * ( hemiSpecularWeight * specularStrength );",

					"}",

				"#endif",

				"outgoingLight += diffuseColor.xyz * ( totalDiffuseLight + ambientLightColor * diffuse ) + totalSpecularLight;",

				"gl_FragColor = linearToOutputTexel( vec4( outgoingLight, diffuseColor.a ) );",	// TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join( "\n" ),

		vertexShader: [

			"uniform vec4 offsetRepeat;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "lights_pars" ],
			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

			"void main() {",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				"vNormal = normalize( normalMatrix * normal );",

				"vUv = uv * offsetRepeat.zw + offsetRepeat.xy;",

				"gl_Position = projectionMatrix * mvPosition;",

				THREE.ShaderChunk[ "shadowmap_vertex" ],

			"}"

		].join( "\n" )

	},

	/* ------------------------------------------------------------------------------------------
	//	Skin shader
	//		- Blinn-Phong diffuse term (using normal + diffuse maps)
	//		- subsurface scattering approximation by four blur layers
	//		- physically based specular term (Kelemen/Szirmay-Kalos specular reflectance)
	//
	//		- point and directional lights (use with "lights: true" material option)
	//
	//		- based on Nvidia Advanced Skin Rendering GDC 2007 presentation
	//		  and GPU Gems 3 Chapter 14. Advanced Techniques for Realistic Real-Time Skin Rendering
	//
	//			http://developer.download.nvidia.com/presentations/2007/gdc/Advanced_Skin.pdf
	//			http://http.developer.nvidia.com/GPUGems3/gpugems3_ch14.html
	// ------------------------------------------------------------------------------------------ */

	'skin' : {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{

				"passID": { value: 0 },

				"tDiffuse"	: { value: null },
				"tNormal"	: { value: null },

				"tBlur1"	: { value: null },
				"tBlur2"	: { value: null },
				"tBlur3"	: { value: null },
				"tBlur4"	: { value: null },

				"tBeckmann"	: { value: null },

				"uNormalScale": { value: 1.0 },

				"diffuse":  { value: new THREE.Color( 0xeeeeee ) },
				"specular": { value: new THREE.Color( 0x111111 ) },
				"opacity": 	  { value: 1 },

				"uRoughness": 	  		{ value: 0.15 },
				"uSpecularBrightness": 	{ value: 0.75 }

			}

		] ),

		fragmentShader: [

			"uniform vec3 diffuse;",
			"uniform vec3 specular;",
			"uniform float opacity;",

			"uniform float uRoughness;",
			"uniform float uSpecularBrightness;",

			"uniform int passID;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",

			"uniform sampler2D tBlur1;",
			"uniform sampler2D tBlur2;",
			"uniform sampler2D tBlur3;",
			"uniform sampler2D tBlur4;",

			"uniform sampler2D tBeckmann;",

			"uniform float uNormalScale;",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "lights_pars" ],
			THREE.ShaderChunk[ "fog_pars_fragment" ],

			"float fresnelReflectance( vec3 H, vec3 V, float F0 ) {",

				"float base = 1.0 - dot( V, H );",
				"float exponential = pow( base, 5.0 );",

				"return exponential + F0 * ( 1.0 - exponential );",

			"}",

			// Kelemen/Szirmay-Kalos specular BRDF

			"float KS_Skin_Specular( vec3 N,", 		// Bumped surface normal
									"vec3 L,", 		// Points to light
									"vec3 V,", 		// Points to eye
									"float m,",  	// Roughness
									"float rho_s", 	// Specular brightness
									") {",

				"float result = 0.0;",
				"float ndotl = dot( N, L );",

				"if( ndotl > 0.0 ) {",

					"vec3 h = L + V;", // Unnormalized half-way vector
					"vec3 H = normalize( h );",

					"float ndoth = dot( N, H );",

					"float PH = pow( 2.0 * texture2D( tBeckmann, vec2( ndoth, m ) ).x, 10.0 );",
					"float F = fresnelReflectance( H, V, 0.028 );",
					"float frSpec = max( PH * F / dot( h, h ), 0.0 );",

					"result = ndotl * rho_s * frSpec;", // BRDF * dot(N,L) * rho_s

				"}",

				"return result;",

			"}",

			"void main() {",

				"vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
				"vec4 diffuseColor = vec4( diffuse, opacity );",

				"vec4 mSpecular = vec4( specular, opacity );",

				"vec4 colDiffuse = texture2D( tDiffuse, vUv );",
				"colDiffuse *= colDiffuse;",

				"diffuseColor *= colDiffuse;",

				// normal mapping

				"vec4 posAndU = vec4( -vViewPosition, vUv.x );",
				"vec4 posAndU_dx = dFdx( posAndU ),  posAndU_dy = dFdy( posAndU );",
				"vec3 tangent = posAndU_dx.w * posAndU_dx.xyz + posAndU_dy.w * posAndU_dy.xyz;",
				"vec3 normal = normalize( vNormal );",
				"vec3 binormal = normalize( cross( tangent, normal ) );",
				"tangent = cross( normal, binormal );",	// no normalization required
				"mat3 tsb = mat3( tangent, binormal, normal );",

				"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
				"normalTex.xy *= uNormalScale;",
				"normalTex = normalize( normalTex );",

				"vec3 finalNormal = tsb * normalTex;",
				"normal = normalize( finalNormal );",

				"vec3 viewerDirection = normalize( vViewPosition );",

				// point lights

				"vec3 totalDiffuseLight = vec3( 0.0 );",
				"vec3 totalSpecularLight = vec3( 0.0 );",

				"#if NUM_POINT_LIGHTS > 0",

					"for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {",

						"vec3 pointVector = normalize( pointLights[ i ].direction );",
						"float attenuation = calcLightAttenuation( length( lVector ), pointLights[ i ].distance, pointLights[ i ].decay );",

						"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

						"totalDiffuseLight += pointLightColor[ i ] * ( pointDiffuseWeight * attenuation );",

						"if ( passID == 1 ) {",

							"float pointSpecularWeight = KS_Skin_Specular( normal, pointVector, viewerDirection, uRoughness, uSpecularBrightness );",

							"totalSpecularLight += pointLightColor[ i ] * mSpecular.xyz * ( pointSpecularWeight * attenuation );",

						"}",

					"}",

				"#endif",

				// directional lights

				"#if NUM_DIR_LIGHTS > 0",

					"for( int i = 0; i < NUM_DIR_LIGHTS; i++ ) {",

						"vec3 dirVector = directionalLights[ i ].direction;",

						"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",


						"totalDiffuseLight += directionalLights[ i ].color * dirDiffuseWeight;",

						"if ( passID == 1 ) {",

							"float dirSpecularWeight = KS_Skin_Specular( normal, dirVector, viewerDirection, uRoughness, uSpecularBrightness );",

							"totalSpecularLight += directionalLights[ i ].color * mSpecular.xyz * dirSpecularWeight;",

						"}",

					"}",

				"#endif",


				"outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalSpecularLight );",

				"if ( passID == 0 ) {",

					"outgoingLight = sqrt( outgoingLight );",

				"} else if ( passID == 1 ) {",

					//"#define VERSION1",

					"#ifdef VERSION1",

						"vec3 nonblurColor = sqrt(outgoingLight );",

					"#else",

						"vec3 nonblurColor = outgoingLight;",

					"#endif",

					"vec3 blur1Color = texture2D( tBlur1, vUv ).xyz;",
					"vec3 blur2Color = texture2D( tBlur2, vUv ).xyz;",
					"vec3 blur3Color = texture2D( tBlur3, vUv ).xyz;",
					"vec3 blur4Color = texture2D( tBlur4, vUv ).xyz;",


					//"gl_FragColor = vec4( blur1Color, gl_FragColor.w );",

					//"gl_FragColor = vec4( vec3( 0.22, 0.5, 0.7 ) * nonblurColor + vec3( 0.2, 0.5, 0.3 ) * blur1Color + vec3( 0.58, 0.0, 0.0 ) * blur2Color, gl_FragColor.w );",

					//"gl_FragColor = vec4( vec3( 0.25, 0.6, 0.8 ) * nonblurColor + vec3( 0.15, 0.25, 0.2 ) * blur1Color + vec3( 0.15, 0.15, 0.0 ) * blur2Color + vec3( 0.45, 0.0, 0.0 ) * blur3Color, gl_FragColor.w );",


					"outgoingLight = vec3( vec3( 0.22,  0.437, 0.635 ) * nonblurColor + ",
										 "vec3( 0.101, 0.355, 0.365 ) * blur1Color + ",
										 "vec3( 0.119, 0.208, 0.0 )   * blur2Color + ",
										 "vec3( 0.114, 0.0,   0.0 )   * blur3Color + ",
										 "vec3( 0.444, 0.0,   0.0 )   * blur4Color );",

					"outgoingLight *= sqrt( colDiffuse.xyz );",

					"outgoingLight += ambientLightColor * diffuse * colDiffuse.xyz + totalSpecularLight;",

					"#ifndef VERSION1",

						"outgoingLight = sqrt( outgoingLight );",

					"#endif",

				"}",

				"gl_FragColor = vec4( outgoingLight, diffuseColor.a );",	// TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

				THREE.ShaderChunk[ "fog_fragment" ],

			"}"

		].join( "\n" ),

		vertexShader: [

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "common" ],

			"void main() {",

				"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				"vNormal = normalize( normalMatrix * normal );",

				"vUv = uv;",

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

		].join( "\n" ),

		vertexShaderUV: [

			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vViewPosition;",

			THREE.ShaderChunk[ "common" ],

			"void main() {",

				"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

				"vViewPosition = -mvPosition.xyz;",

				"vNormal = normalize( normalMatrix * normal );",

				"vUv = uv;",

				"gl_Position = vec4( uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0, 0.0, 1.0 );",

			"}"

		].join( "\n" )

	},

	/* ------------------------------------------------------------------------------------------
	// Beckmann distribution function
	//	- to be used in specular term of skin shader
	//	- render a screen-aligned quad to precompute a 512 x 512 texture
	//
	//		- from http://developer.nvidia.com/node/171
	 ------------------------------------------------------------------------------------------ */

	"beckmann" : {

		uniforms: {},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec2 vUv;",

			"float PHBeckmann( float ndoth, float m ) {",

				"float alpha = acos( ndoth );",
				"float ta = tan( alpha );",

				"float val = 1.0 / ( m * m * pow( ndoth, 4.0 ) ) * exp( -( ta * ta ) / ( m * m ) );",
				"return val;",

			"}",

			"float KSTextureCompute( vec2 tex ) {",

				// Scale the value to fit within [0,1]  invert upon lookup.

				"return 0.5 * pow( PHBeckmann( tex.x, tex.y ), 0.1 );",

			"}",

			"void main() {",

				"float x = KSTextureCompute( vUv );",

				"gl_FragColor = vec4( x, x, x, 1.0 );",

			"}"

		].join( "\n" )

	}

};
