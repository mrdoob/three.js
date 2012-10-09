/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 *
 * ShaderUtils currently contains:
 *
 *	fresnel
 *	normal
 * 	cube
 *
 */

if ( THREE.WebGLRenderer ) {

THREE.ShaderUtils = {

	lib: {

		/* -------------------------------------------------------------------------
		//	Fresnel shader
		//	- based on Nvidia Cg tutorial
		 ------------------------------------------------------------------------- */

		'fresnel': {

			uniforms: {

				"mRefractionRatio": { type: "f", value: 1.02 },
				"mFresnelBias": { type: "f", value: 0.1 },
				"mFresnelPower": { type: "f", value: 2.0 },
				"mFresnelScale": { type: "f", value: 1.0 },
				"tCube": { type: "t", value: null }

			},

			fragmentShader: [

				"uniform samplerCube tCube;",

				"varying vec3 vReflect;",
				"varying vec3 vRefract[3];",
				"varying float vReflectionFactor;",

				"void main() {",

					"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
					"vec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );",

					"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
					"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
					"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",
					"refractedColor.a = 1.0;",

					"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

				"}"

			].join("\n"),

			vertexShader: [

				"uniform float mRefractionRatio;",
				"uniform float mFresnelBias;",
				"uniform float mFresnelScale;",
				"uniform float mFresnelPower;",

				"varying vec3 vReflect;",
				"varying vec3 vRefract[3];",
				"varying float vReflectionFactor;",

				"void main() {",

					"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
					"vec4 mPosition = modelMatrix * vec4( position, 1.0 );",

					"vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

					"vec3 I = mPosition.xyz - cameraPosition;",

					"vReflect = reflect( I, nWorld );",
					"vRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );",
					"vRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );",
					"vRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );",
					"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );",

					"gl_Position = projectionMatrix * mvPosition;",

				"}"

			].join("\n")

		},

		/* -------------------------------------------------------------------------
		//	Normal map shader
		//		- Blinn-Phong
		//		- normal + diffuse + specular + AO + displacement + reflection + shadow maps
		//		- point and directional lights (use with "lights: true" material option)
		 ------------------------------------------------------------------------- */

		'normal' : {

			uniforms: THREE.UniformsUtils.merge( [

				THREE.UniformsLib[ "fog" ],
				THREE.UniformsLib[ "lights" ],
				THREE.UniformsLib[ "shadowmap" ],

				{

				"enableAO"		  : { type: "i", value: 0 },
				"enableDiffuse"	  : { type: "i", value: 0 },
				"enableSpecular"  : { type: "i", value: 0 },
				"enableReflection": { type: "i", value: 0 },
				"enableDisplacement": { type: "i", value: 0 },

				"tDisplacement": { type: "t", value: null }, // must go first as this is vertex texture
				"tDiffuse"	   : { type: "t", value: null },
				"tCube"		   : { type: "t", value: null },
				"tNormal"	   : { type: "t", value: null },
				"tSpecular"	   : { type: "t", value: null },
				"tAO"		   : { type: "t", value: null },

				"uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

				"uDisplacementBias": { type: "f", value: 0.0 },
				"uDisplacementScale": { type: "f", value: 1.0 },

				"uDiffuseColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
				"uAmbientColor": { type: "c", value: new THREE.Color( 0xffffff ) },
				"uShininess": { type: "f", value: 30 },
				"uOpacity": { type: "f", value: 1 },

				"useRefract": { type: "i", value: 0 },
				"uRefractionRatio": { type: "f", value: 0.98 },
				"uReflectivity": { type: "f", value: 0.5 },

				"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
				"uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

				"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

				}

			] ),

			fragmentShader: [

				"uniform vec3 uAmbientColor;",
				"uniform vec3 uDiffuseColor;",
				"uniform vec3 uSpecularColor;",
				"uniform float uShininess;",
				"uniform float uOpacity;",

				"uniform bool enableDiffuse;",
				"uniform bool enableSpecular;",
				"uniform bool enableAO;",
				"uniform bool enableReflection;",

				"uniform sampler2D tDiffuse;",
				"uniform sampler2D tNormal;",
				"uniform sampler2D tSpecular;",
				"uniform sampler2D tAO;",

				"uniform samplerCube tCube;",

				"uniform vec2 uNormalScale;",

				"uniform bool useRefract;",
				"uniform float uRefractionRatio;",
				"uniform float uReflectivity;",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"uniform vec3 ambientLightColor;",

				"#if MAX_DIR_LIGHTS > 0",

					"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
					"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

				"#endif",

				"#if MAX_HEMI_LIGHTS > 0",

					"uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];",
					"uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];",
					"uniform vec3 hemisphereLightPosition[ MAX_HEMI_LIGHTS ];",

				"#endif",

				"#if MAX_POINT_LIGHTS > 0",

					"uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
					"uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
					"uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

				"#endif",

				"#if MAX_SPOT_LIGHTS > 0",

					"uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];",
					"uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];",
					"uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];",
					"uniform float spotLightAngle[ MAX_SPOT_LIGHTS ];",
					"uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];",
					"uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];",

				"#endif",

				"#ifdef WRAP_AROUND",

					"uniform vec3 wrapRGB;",

				"#endif",

				"varying vec3 vWorldPosition;",
				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
				THREE.ShaderChunk[ "fog_pars_fragment" ],

				"void main() {",

					"gl_FragColor = vec4( vec3( 1.0 ), uOpacity );",

					"vec3 specularTex = vec3( 1.0 );",

					"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
					"normalTex.xy *= uNormalScale;",
					"normalTex = normalize( normalTex );",

					"if( enableDiffuse ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 texelColor = texture2D( tDiffuse, vUv );",
							"texelColor.xyz *= texelColor.xyz;",

							"gl_FragColor = gl_FragColor * texelColor;",

						"#else",

							"gl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );",

						"#endif",

					"}",

					"if( enableAO ) {",

						"#ifdef GAMMA_INPUT",

							"vec4 aoColor = texture2D( tAO, vUv );",
							"aoColor.xyz *= aoColor.xyz;",

							"gl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;",

						"#else",

							"gl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;",

						"#endif",

					"}",

					"if( enableSpecular )",
						"specularTex = texture2D( tSpecular, vUv ).xyz;",

					"mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
					"vec3 finalNormal = tsb * normalTex;",

					"#ifdef FLIP_SIDED",

						"finalNormal = -finalNormal;",

					"#endif",

					"vec3 normal = normalize( finalNormal );",
					"vec3 viewPosition = normalize( vViewPosition );",

					// point lights

					"#if MAX_POINT_LIGHTS > 0",

						"vec3 pointDiffuse = vec3( 0.0 );",
						"vec3 pointSpecular = vec3( 0.0 );",

						"for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

							"vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
							"vec3 pointVector = lPosition.xyz + vViewPosition.xyz;",

							"float pointDistance = 1.0;",
							"if ( pointLightDistance[ i ] > 0.0 )",
								"pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );",

							"pointVector = normalize( pointVector );",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
								"float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

								"vec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

							"#else",

								"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

							"#endif",

							"pointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;",

							// specular

							"vec3 pointHalfVector = normalize( pointVector + viewPosition );",
							"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
							"float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( pointVector, pointHalfVector ), 5.0 );",
								"pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

							"#else",

								"pointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// spot lights

					"#if MAX_SPOT_LIGHTS > 0",

						"vec3 spotDiffuse = vec3( 0.0 );",
						"vec3 spotSpecular = vec3( 0.0 );",

						"for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {",

							"vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );",
							"vec3 spotVector = lPosition.xyz + vViewPosition.xyz;",

							"float spotDistance = 1.0;",
							"if ( spotLightDistance[ i ] > 0.0 )",
								"spotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );",

							"spotVector = normalize( spotVector );",

							"float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",

							"if ( spotEffect > spotLightAngle[ i ] ) {",

								"spotEffect = pow( spotEffect, spotLightExponent[ i ] );",

								// diffuse

								"#ifdef WRAP_AROUND",

									"float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );",
									"float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );",

									"vec3 spotDiffuseWeight = mix( vec3 ( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );",

								"#else",

									"float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );",

								"#endif",

								"spotDiffuse += spotDistance * spotLightColor[ i ] * uDiffuseColor * spotDiffuseWeight * spotEffect;",

								// specular

								"vec3 spotHalfVector = normalize( spotVector + viewPosition );",
								"float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );",
								"float spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, uShininess ), 0.0 );",

								"#ifdef PHYSICALLY_BASED_SHADING",

									// 2.0 => 2.0001 is hack to work around ANGLE bug

									"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

									"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( spotVector, spotHalfVector ), 5.0 );",
									"spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;",

								"#else",

									"spotSpecular += spotDistance * spotLightColor[ i ] * uSpecularColor * spotSpecularWeight * spotDiffuseWeight * spotEffect;",

								"#endif",

							"}",

						"}",

					"#endif",

					// directional lights

					"#if MAX_DIR_LIGHTS > 0",

						"vec3 dirDiffuse = vec3( 0.0 );",
						"vec3 dirSpecular = vec3( 0.0 );",

						"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

							"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
							"vec3 dirVector = normalize( lDirection.xyz );",

							// diffuse

							"#ifdef WRAP_AROUND",

								"float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
								"float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

								"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

							"#else",

								"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

							"#endif",

							"dirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;",

							// specular

							"vec3 dirHalfVector = normalize( dirVector + viewPosition );",
							"float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
							"float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlick = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( dirVector, dirHalfVector ), 5.0 );",
								"dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

							"#else",

								"dirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// hemisphere lights

					"#if MAX_HEMI_LIGHTS > 0",

						"vec3 hemiDiffuse  = vec3( 0.0 );",
						"vec3 hemiSpecular = vec3( 0.0 );" ,

						"for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",

							"vec4 lPosition = viewMatrix * vec4( hemisphereLightPosition[ i ], 1.0 );",
							"vec3 lVector = normalize( lPosition.xyz + vViewPosition.xyz );",

							// diffuse

							"float dotProduct = dot( normal, lVector );",
							"float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

							"vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

							"hemiDiffuse += uDiffuseColor * hemiColor;",

							// specular (sky light)


							"vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
							"float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
							"float hemiSpecularWeightSky = specularTex.r * max( pow( hemiDotNormalHalfSky, uShininess ), 0.0 );",

							// specular (ground light)

							"vec3 lVectorGround = normalize( -lPosition.xyz + vViewPosition.xyz );",

							"vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
							"float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
							"float hemiSpecularWeightGround = specularTex.r * max( pow( hemiDotNormalHalfGround, uShininess ), 0.0 );",

							"#ifdef PHYSICALLY_BASED_SHADING",

								"float dotProductGround = dot( normal, lVectorGround );",

								// 2.0 => 2.0001 is hack to work around ANGLE bug

								"float specularNormalization = ( uShininess + 2.0001 ) / 8.0;",

								"vec3 schlickSky = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVector, hemiHalfVectorSky ), 5.0 );",
								"vec3 schlickGround = uSpecularColor + vec3( 1.0 - uSpecularColor ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );",
								"hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",

							"#else",

								"hemiSpecular += uSpecularColor * hemiColor * ( hemiSpecularWeightSky + hemiSpecularWeightGround ) * hemiDiffuseWeight;",

							"#endif",

						"}",

					"#endif",

					// all lights contribution summation

					"vec3 totalDiffuse = vec3( 0.0 );",
					"vec3 totalSpecular = vec3( 0.0 );",

					"#if MAX_DIR_LIGHTS > 0",

						"totalDiffuse += dirDiffuse;",
						"totalSpecular += dirSpecular;",

					"#endif",

					"#if MAX_HEMI_LIGHTS > 0",

						"totalDiffuse += hemiDiffuse;",
						"totalSpecular += hemiSpecular;",

					"#endif",

					"#if MAX_POINT_LIGHTS > 0",

						"totalDiffuse += pointDiffuse;",
						"totalSpecular += pointSpecular;",

					"#endif",

					"#if MAX_SPOT_LIGHTS > 0",

						"totalDiffuse += spotDiffuse;",
						"totalSpecular += spotSpecular;",

					"#endif",

					"#ifdef METAL",

						"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor + totalSpecular );",

					"#else",

						"gl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor ) + totalSpecular;",

					"#endif",

					"if ( enableReflection ) {",

						"vec3 vReflect;",
						"vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );",

						"if ( useRefract ) {",

							"vReflect = refract( cameraToVertex, normal, uRefractionRatio );",

						"} else {",

							"vReflect = reflect( cameraToVertex, normal );",

						"}",

						"vec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",

						"#ifdef GAMMA_INPUT",

							"cubeColor.xyz *= cubeColor.xyz;",

						"#endif",

						"gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );",

					"}",

					THREE.ShaderChunk[ "shadowmap_fragment" ],
					THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
					THREE.ShaderChunk[ "fog_fragment" ],

				"}"

			].join("\n"),

			vertexShader: [

				"attribute vec4 tangent;",

				"uniform vec2 uOffset;",
				"uniform vec2 uRepeat;",

				"uniform bool enableDisplacement;",

				"#ifdef VERTEX_TEXTURES",

					"uniform sampler2D tDisplacement;",
					"uniform float uDisplacementScale;",
					"uniform float uDisplacementBias;",

				"#endif",

				"varying vec3 vTangent;",
				"varying vec3 vBinormal;",
				"varying vec3 vNormal;",
				"varying vec2 vUv;",

				"varying vec3 vWorldPosition;",
				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "skinning_pars_vertex" ],
				THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

				"void main() {",

					THREE.ShaderChunk[ "skinbase_vertex" ],
					THREE.ShaderChunk[ "skinnormal_vertex" ],

					// normal, tangent and binormal vectors

					"#ifdef USE_SKINNING",

						"vNormal = normalMatrix * skinnedNormal.xyz;",

						"vec4 skinnedTangent = skinMatrix * vec4( tangent.xyz, 0.0 );",
						"vTangent = normalMatrix * skinnedTangent.xyz;",

					"#else",

						"vNormal = normalMatrix * normal;",
						"vTangent = normalMatrix * tangent.xyz;",

					"#endif",

					"vBinormal = cross( vNormal, vTangent ) * tangent.w;",

					"vUv = uv * uRepeat + uOffset;",

					// displacement mapping

					"vec3 displacedPosition;",

					"#ifdef VERTEX_TEXTURES",

						"if ( enableDisplacement ) {",

							"vec3 dv = texture2D( tDisplacement, uv ).xyz;",
							"float df = uDisplacementScale * dv.x + uDisplacementBias;",
							"displacedPosition = position + normalize( normal ) * df;",

						"} else {",

							"#ifdef USE_SKINNING",

								"vec4 skinVertex = vec4( position, 1.0 );",

								"vec4 skinned  = boneMatX * skinVertex * skinWeight.x;",
								"skinned 	  += boneMatY * skinVertex * skinWeight.y;",

								"displacedPosition  = skinned.xyz;",

							"#else",

								"displacedPosition = position;",

							"#endif",

						"}",

					"#else",

						"#ifdef USE_SKINNING",

							"vec4 skinVertex = vec4( position, 1.0 );",

							"vec4 skinned  = boneMatX * skinVertex * skinWeight.x;",
							"skinned 	  += boneMatY * skinVertex * skinWeight.y;",

							"displacedPosition  = skinned.xyz;",

						"#else",

							"displacedPosition = position;",

						"#endif",

					"#endif",

					//

					"vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );",
					"vec4 mPosition = modelMatrix * vec4( displacedPosition, 1.0 );",

					"gl_Position = projectionMatrix * mvPosition;",

					//

					"vWorldPosition = mPosition.xyz;",
					"vViewPosition = -mvPosition.xyz;",

					// shadows

					"#ifdef USE_SHADOWMAP",

						"for( int i = 0; i < MAX_SHADOWS; i ++ ) {",

							"vShadowCoord[ i ] = shadowMatrix[ i ] * mPosition;",

						"}",

					"#endif",

				"}"

			].join("\n")

		},

		/* -------------------------------------------------------------------------
		//	Cube map shader
		 ------------------------------------------------------------------------- */

		'cube': {

			uniforms: { "tCube": { type: "t", value: null },
						"tFlip": { type: "f", value: -1 } },

			vertexShader: [

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec4 mPosition = modelMatrix * vec4( position, 1.0 );",
					"vViewPosition = cameraPosition - mPosition.xyz;",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragmentShader: [

				"uniform samplerCube tCube;",
				"uniform float tFlip;",

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"gl_FragColor = textureCube( tCube, vec3( tFlip * wPos.x, wPos.yz ) );",

				"}"

			].join("\n")

		}

	}

};

};
