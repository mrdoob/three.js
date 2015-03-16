/*
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 *  - Blinn-Phong
 *  - normal + diffuse + specular + AO + displacement + reflection + shadow maps
 *  - point and directional lights (use with "lights: true" material option)
 */

THREE.NormalDisplacementShader = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "fog" ],
		THREE.UniformsLib[ "lights" ],
		THREE.UniformsLib[ "shadowmap" ],

		{

		"enableAO"          : { type: "i", value: 0 },
		"enableDiffuse"     : { type: "i", value: 0 },
		"enableSpecular"    : { type: "i", value: 0 },
		"enableReflection"  : { type: "i", value: 0 },
		"enableDisplacement": { type: "i", value: 0 },

		"tDisplacement": { type: "t", value: null }, // must go first as this is vertex texture
		"tDiffuse"     : { type: "t", value: null },
		"tCube"        : { type: "t", value: null },
		"tNormal"      : { type: "t", value: null },
		"tSpecular"    : { type: "t", value: null },
		"tAO"          : { type: "t", value: null },

		"uNormalScale": { type: "v2", value: new THREE.Vector2( 1, 1 ) },

		"uDisplacementBias": { type: "f", value: 0.0 },
		"uDisplacementScale": { type: "f", value: 1.0 },

		"diffuse": { type: "c", value: new THREE.Color( 0xffffff ) },
		"specular": { type: "c", value: new THREE.Color( 0x111111 ) },
		"shininess": { type: "f", value: 30 },
		"opacity": { type: "f", value: 1 },

		"refractionRatio": { type: "f", value: 0.98 },
		"reflectivity": { type: "f", value: 0.5 },

		"uOffset" : { type: "v2", value: new THREE.Vector2( 0, 0 ) },
		"uRepeat" : { type: "v2", value: new THREE.Vector2( 1, 1 ) },

		"wrapRGB" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

		}

	] ),

	fragmentShader: [

		"uniform vec3 diffuse;",
		"uniform vec3 specular;",
		"uniform float shininess;",
		"uniform float opacity;",

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

		"uniform float refractionRatio;",
		"uniform float reflectivity;",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"uniform vec3 ambientLightColor;",

		"#if MAX_DIR_LIGHTS > 0",

		"	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
		"	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

		"#endif",

		"#if MAX_HEMI_LIGHTS > 0",

		"	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];",
		"	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];",
		"	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

		"	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];",
		"	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];",
		"	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];",

		"#endif",

		"#if MAX_SPOT_LIGHTS > 0",

		"	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];",
		"	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];",
		"	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];",
		"	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];",
		"	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];",
		"	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];",

		"#endif",

		"#ifdef WRAP_AROUND",

		"	uniform vec3 wrapRGB;",

		"#endif",

		"varying vec3 vWorldPosition;",
		"varying vec3 vViewPosition;",

		THREE.ShaderChunk[ "common" ],
		THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		"void main() {",
			THREE.ShaderChunk[ "logdepthbuf_fragment" ],

		"	vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
		"	vec4 diffuseColor = vec4( diffuse, opacity );",

		"	vec3 specularTex = vec3( 1.0 );",

		"	vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
		"	normalTex.xy *= uNormalScale;",
		"	normalTex = normalize( normalTex );",

		"	if( enableDiffuse ) {",

		"		#ifdef GAMMA_INPUT",

		"			vec4 texelColor = texture2D( tDiffuse, vUv );",
		"			texelColor.xyz *= texelColor.xyz;",

		"			diffuseColor *= texelColor;",

		"		#else",

		"			diffuseColor *= texture2D( tDiffuse, vUv );",

		"		#endif",

		"	}",

		"	if( enableAO ) {",

		"		#ifdef GAMMA_INPUT",

		"			vec4 aoColor = texture2D( tAO, vUv );",
		"			aoColor.xyz *= aoColor.xyz;",

		"			diffuseColor.rgb *= aoColor.xyz;",

		"		#else",

		"			diffuseColor.rgb *= texture2D( tAO, vUv ).xyz;",

		"		#endif",

		"	}",

		THREE.ShaderChunk[ "alphatest_fragment" ],

		"	if( enableSpecular )",
		"		specularTex = texture2D( tSpecular, vUv ).xyz;",

		"	mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );",
		"	vec3 finalNormal = tsb * normalTex;",

		"	#ifdef FLIP_SIDED",

		"		finalNormal = -finalNormal;",

		"	#endif",

		"	vec3 normal = normalize( finalNormal );",
		"	vec3 viewPosition = normalize( vViewPosition );",

		"	vec3 totalDiffuseLight = vec3( 0.0 );",
		"	vec3 totalSpecularLight = vec3( 0.0 );",

			// point lights

		"	#if MAX_POINT_LIGHTS > 0",

		"		for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

		"			vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
		"			vec3 pointVector = lPosition.xyz + vViewPosition.xyz;",

		"			float pointDistance = 1.0;",
		"			if ( pointLightDistance[ i ] > 0.0 )",
		"				pointDistance = 1.0 - min( ( length( pointVector ) / pointLightDistance[ i ] ), 1.0 );",

		"			pointVector = normalize( pointVector );",

					// diffuse

		"			#ifdef WRAP_AROUND",

		"				float pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );",
		"				float pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );",

		"				vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

		"			#else",

		"				float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

		"			#endif",

		"			totalDiffuseLight += pointDistance * pointLightColor[ i ] * pointDiffuseWeight;",

					// specular

		"			vec3 pointHalfVector = normalize( pointVector + viewPosition );",
		"			float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
		"			float pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, shininess ), 0.0 );",

		"			float specularNormalization = ( shininess + 2.0 ) / 8.0;",

		"			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( pointVector, pointHalfVector ), 0.0 ), 5.0 );",
		"			totalSpecularLight += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * pointDistance * specularNormalization;",

		"		}",

		"	#endif",

			// spot lights

		"	#if MAX_SPOT_LIGHTS > 0",

		"		for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {",

		"			vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );",
		"			vec3 spotVector = lPosition.xyz + vViewPosition.xyz;",

		"			float spotDistance = 1.0;",
		"			if ( spotLightDistance[ i ] > 0.0 )",
		"				spotDistance = 1.0 - min( ( length( spotVector ) / spotLightDistance[ i ] ), 1.0 );",

		"			spotVector = normalize( spotVector );",

		"			float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",

		"			if ( spotEffect > spotLightAngleCos[ i ] ) {",

		"				spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );",

						// diffuse

		"				#ifdef WRAP_AROUND",

		"					float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );",
		"					float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );",

		"					vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );",

		"				#else",

		"					float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );",

		"				#endif",

		"				totalDiffuseLight += spotDistance * spotLightColor[ i ] * spotDiffuseWeight * spotEffect;",

						// specular

		"				vec3 spotHalfVector = normalize( spotVector + viewPosition );",
		"				float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );",
		"				float spotSpecularWeight = specularTex.r * max( pow( spotDotNormalHalf, shininess ), 0.0 );",

		"				float specularNormalization = ( shininess + 2.0 ) / 8.0;",

		"				vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( spotVector, spotHalfVector ), 0.0 ), 5.0 );",
		"				totalSpecularLight += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * spotDistance * specularNormalization * spotEffect;",

		"			}",

		"		}",

		"	#endif",

			// directional lights

		"	#if MAX_DIR_LIGHTS > 0",

		"		for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

		"			vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
		"			vec3 dirVector = normalize( lDirection.xyz );",

					// diffuse

		"			#ifdef WRAP_AROUND",

		"				float directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );",
		"				float directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );",

		"				vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );",

		"			#else",

		"				float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

		"			#endif",

		"			totalDiffuseLight += directionalLightColor[ i ] * dirDiffuseWeight;",

					// specular

		"			vec3 dirHalfVector = normalize( dirVector + viewPosition );",
		"			float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
		"			float dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, shininess ), 0.0 );",

		"			float specularNormalization = ( shininess + 2.0 ) / 8.0;",

		"			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );",
		"			totalSpecularLight += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",

		"		}",

		"	#endif",

			// hemisphere lights

		"	#if MAX_HEMI_LIGHTS > 0",

		"		for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",

		"			vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
		"			vec3 lVector = normalize( lDirection.xyz );",

					// diffuse

		"			float dotProduct = dot( normal, lVector );",
		"			float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

		"			vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

		"			totalDiffuseLight += hemiColor;",

					// specular (sky light)


		"			vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
		"			float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
		"			float hemiSpecularWeightSky = specularTex.r * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );",

					// specular (ground light)

		"			vec3 lVectorGround = -lVector;",

		"			vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
		"			float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
		"			float hemiSpecularWeightGround = specularTex.r * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );",

		"			float dotProductGround = dot( normal, lVectorGround );",

		"			float specularNormalization = ( shininess + 2.0 ) / 8.0;",

		"			vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );",
		"			vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );",
		"			totalSpecularLight += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",

		"		}",

		"	#endif",

		"	#ifdef METAL",

		"		outgoingLight += diffuseColor.xyz * ( totalDiffuseLight + ambientLightColor + totalSpecularLight );",

		"	#else",

		"		outgoingLight += diffuseColor.xyz * ( totalDiffuseLight + ambientLightColor ) + totalSpecularLight;",

		"	#endif",

		"	if ( enableReflection ) {",

		"		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );",

		"		#ifdef ENVMAP_MODE_REFLECTION",

		"			vec3 vReflect = reflect( cameraToVertex, normal );",

		"		#else",

		"			vec3 vReflect = refract( cameraToVertex, normal, refractionRatio );",

		"		#endif",

		"		vec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",

		"		#ifdef GAMMA_INPUT",

		"			cubeColor.xyz *= cubeColor.xyz;",

		"		#endif",

		"		outgoingLight = mix( outgoingLight, cubeColor.xyz, specularTex.r * reflectivity );",

		"	}",

			THREE.ShaderChunk[ "shadowmap_fragment" ],
			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
			THREE.ShaderChunk[ "fog_fragment" ],

		"	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",	// TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

		"}"

	].join("\n"),

	vertexShader: [

		"attribute vec4 tangent;",

		"uniform vec2 uOffset;",
		"uniform vec2 uRepeat;",

		"uniform bool enableDisplacement;",

		"#ifdef VERTEX_TEXTURES",

		"	uniform sampler2D tDisplacement;",
		"	uniform float uDisplacementScale;",
		"	uniform float uDisplacementBias;",

		"#endif",

		"varying vec3 vTangent;",
		"varying vec3 vBinormal;",
		"varying vec3 vNormal;",
		"varying vec2 vUv;",

		"varying vec3 vWorldPosition;",
		"varying vec3 vViewPosition;",

		THREE.ShaderChunk[ "skinning_pars_vertex" ],
		THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

		"void main() {",

			THREE.ShaderChunk[ "skinbase_vertex" ],
			THREE.ShaderChunk[ "skinnormal_vertex" ],

			// normal, tangent and binormal vectors

		"	#ifdef USE_SKINNING",

		"		vNormal = normalize( normalMatrix * skinnedNormal.xyz );",

		"		vec4 skinnedTangent = skinMatrix * vec4( tangent.xyz, 0.0 );",
		"		vTangent = normalize( normalMatrix * skinnedTangent.xyz );",

		"	#else",

		"		vNormal = normalize( normalMatrix * normal );",
		"		vTangent = normalize( normalMatrix * tangent.xyz );",

		"	#endif",

		"	vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );",

		"	vUv = uv * uRepeat + uOffset;",

			// displacement mapping

		"	vec3 displacedPosition;",

		"	#ifdef VERTEX_TEXTURES",

		"		if ( enableDisplacement ) {",

		"			vec3 dv = texture2D( tDisplacement, uv ).xyz;",
		"			float df = uDisplacementScale * dv.x + uDisplacementBias;",
		"			displacedPosition = position + normalize( normal ) * df;",

		"		} else {",

		"			#ifdef USE_SKINNING",

		"				vec4 skinVertex = bindMatrix * vec4( position, 1.0 );",

		"				vec4 skinned = vec4( 0.0 );",
		"				skinned += boneMatX * skinVertex * skinWeight.x;",
		"				skinned += boneMatY * skinVertex * skinWeight.y;",
		"				skinned += boneMatZ * skinVertex * skinWeight.z;",
		"				skinned += boneMatW * skinVertex * skinWeight.w;",
		"				skinned  = bindMatrixInverse * skinned;",

		"				displacedPosition = skinned.xyz;",

		"			#else",

		"				displacedPosition = position;",

		"			#endif",

		"		}",

		"	#else",

		"		#ifdef USE_SKINNING",

		"			vec4 skinVertex = bindMatrix * vec4( position, 1.0 );",

		"			vec4 skinned = vec4( 0.0 );",
		"			skinned += boneMatX * skinVertex * skinWeight.x;",
		"			skinned += boneMatY * skinVertex * skinWeight.y;",
		"			skinned += boneMatZ * skinVertex * skinWeight.z;",
		"			skinned += boneMatW * skinVertex * skinWeight.w;",
		"			skinned  = bindMatrixInverse * skinned;",

		"			displacedPosition = skinned.xyz;",

		"		#else",

		"			displacedPosition = position;",

		"		#endif",

		"	#endif",

			//

		"	vec4 mvPosition = modelViewMatrix * vec4( displacedPosition, 1.0 );",
		"	vec4 worldPosition = modelMatrix * vec4( displacedPosition, 1.0 );",

		"	gl_Position = projectionMatrix * mvPosition;",

			THREE.ShaderChunk[ "logdepthbuf_vertex" ],

			//

		"	vWorldPosition = worldPosition.xyz;",
		"	vViewPosition = -mvPosition.xyz;",

			// shadows

		"	#ifdef USE_SHADOWMAP",

		"		for( int i = 0; i < MAX_SHADOWS; i ++ ) {",

		"			vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;",

		"		}",

		"	#endif",

		"}"

	].join("\n")

};
