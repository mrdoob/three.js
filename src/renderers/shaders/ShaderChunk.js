/**
 * Shader chunks for WebLG Shader library
 * 
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.ShaderChunk = {

	// FOG

	fog_pars_fragment: [

		"#ifdef USE_FOG",

		"	uniform vec3 fogColor;",

		"	#ifdef FOG_EXP2",

		"		uniform float fogDensity;",

		"	#else",

		"		uniform float fogNear;",
		"		uniform float fogFar;",

		"	#endif",

		"#endif"

	].join("\n"),

	fog_fragment: [

		"#ifdef USE_FOG",

		"	#ifdef USE_LOGDEPTHBUF_EXT",

		"		float depth = gl_FragDepthEXT / gl_FragCoord.w;",

		"	#else",

		"		float depth = gl_FragCoord.z / gl_FragCoord.w;",

		"	#endif",

		"	#ifdef FOG_EXP2",

		"		const float LOG2 = 1.442695;",
		"		float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );",
		"		fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );",

		"	#else",

		"		float fogFactor = smoothstep( fogNear, fogFar, depth );",

		"	#endif",

		"	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",

		"#endif"

	].join("\n"),

	// ENVIRONMENT MAP

	envmap_pars_fragment: [

		"#ifdef USE_ENVMAP",

		"	uniform float reflectivity;",
		"	uniform samplerCube envMap;",
		"	uniform float flipEnvMap;",
		"	uniform int combine;",

		"	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )",

		"		uniform bool useRefract;",
		"		uniform float refractionRatio;",

		"	#else",

		"		varying vec3 vReflect;",

		"	#endif",

		"#endif"

	].join("\n"),

	envmap_fragment: [

		"#ifdef USE_ENVMAP",

		"	vec3 reflectVec;",

		"	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )",

		"		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );",

				// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
				// "Transforming Normal Vectors with the Inverse Transformation"

		"		vec3 worldNormal = normalize( vec3( vec4( normal, 0.0 ) * viewMatrix ) );",

		"		if ( useRefract ) {",

		"			reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );",

		"		} else { ",

		"			reflectVec = reflect( cameraToVertex, worldNormal );",

		"		}",

		"	#else",

		"		reflectVec = vReflect;",

		"	#endif",

		"	#ifdef DOUBLE_SIDED",

		"		float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );",
		"		vec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );",

		"	#else",

		"		vec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );",

		"	#endif",

		"	#ifdef GAMMA_INPUT",

		"		cubeColor.xyz *= cubeColor.xyz;",

		"	#endif",

		"	if ( combine == 1 ) {",

		"		gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularStrength * reflectivity );",

		"	} else if ( combine == 2 ) {",

		"		gl_FragColor.xyz += cubeColor.xyz * specularStrength * reflectivity;",

		"	} else {",

		"		gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * cubeColor.xyz, specularStrength * reflectivity );",

		"	}",

		"#endif"

	].join("\n"),

	envmap_pars_vertex: [

		"#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )",

		"	varying vec3 vReflect;",

		"	uniform float refractionRatio;",
		"	uniform bool useRefract;",

		"#endif"

	].join("\n"),

	worldpos_vertex : [

		"#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )",

		"	#ifdef USE_SKINNING",

		"		vec4 worldPosition = modelMatrix * skinned;",

		"	#endif",

		"	#if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )",

		"		vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );",

		"	#endif",

		"	#if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )",

		"		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

		"	#endif",

		"#endif"

	].join("\n"),

	envmap_vertex : [

		"#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )",

		"	vec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;",
		"	worldNormal = normalize( worldNormal );",

		"	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );",

		"	if ( useRefract ) {",

		"		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );",

		"	} else {",

		"		vReflect = reflect( cameraToVertex, worldNormal );",

		"	}",

		"#endif"

	].join("\n"),

	// COLOR MAP (particles)

	map_particle_pars_fragment: [

		"#ifdef USE_MAP",

		"	uniform sampler2D map;",

		"#endif"

	].join("\n"),


	map_particle_fragment: [

		"#ifdef USE_MAP",

		"	gl_FragColor = gl_FragColor * texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );",

		"#endif"

	].join("\n"),

	// COLOR MAP (triangles)

	map_pars_vertex: [

		"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )",

		"	varying vec2 vUv;",
		"	uniform vec4 offsetRepeat;",

		"#endif"

	].join("\n"),

	map_pars_fragment: [

		"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )",

		"	varying vec2 vUv;",

		"#endif",

		"#ifdef USE_MAP",

		"	uniform sampler2D map;",

		"#endif"

	].join("\n"),

	map_vertex: [

		"#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )",

		"	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;",

		"#endif"

	].join("\n"),

	map_fragment: [

		"#ifdef USE_MAP",

		"	vec4 texelColor = texture2D( map, vUv );",

		"	#ifdef GAMMA_INPUT",

		"		texelColor.xyz *= texelColor.xyz;",

		"	#endif",

		"	gl_FragColor = gl_FragColor * texelColor;",

		"#endif"

	].join("\n"),

	// LIGHT MAP

	lightmap_pars_fragment: [

		"#ifdef USE_LIGHTMAP",

		"	varying vec2 vUv2;",
		"	uniform sampler2D lightMap;",

		"#endif"

	].join("\n"),

	lightmap_pars_vertex: [

		"#ifdef USE_LIGHTMAP",

		"	varying vec2 vUv2;",

		"#endif"

	].join("\n"),

	lightmap_fragment: [

		"#ifdef USE_LIGHTMAP",

		"	gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );",

		"#endif"

	].join("\n"),

	lightmap_vertex: [

		"#ifdef USE_LIGHTMAP",

		"	vUv2 = uv2;",

		"#endif"

	].join("\n"),

	// BUMP MAP

	bumpmap_pars_fragment: [

		"#ifdef USE_BUMPMAP",

		"	uniform sampler2D bumpMap;",
		"	uniform float bumpScale;",

			// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen
			//	http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html

			// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

		"	vec2 dHdxy_fwd() {",

		"		vec2 dSTdx = dFdx( vUv );",
		"		vec2 dSTdy = dFdy( vUv );",

		"		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;",
		"		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;",
		"		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;",

		"		return vec2( dBx, dBy );",

		"	}",

		"	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {",

		"		vec3 vSigmaX = dFdx( surf_pos );",
		"		vec3 vSigmaY = dFdy( surf_pos );",
		"		vec3 vN = surf_norm;",		// normalized

		"		vec3 R1 = cross( vSigmaY, vN );",
		"		vec3 R2 = cross( vN, vSigmaX );",

		"		float fDet = dot( vSigmaX, R1 );",

		"		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );",
		"		return normalize( abs( fDet ) * surf_norm - vGrad );",

		"	}",

		"#endif"

	].join("\n"),

	// NORMAL MAP

	normalmap_pars_fragment: [

		"#ifdef USE_NORMALMAP",

		"	uniform sampler2D normalMap;",
		"	uniform vec2 normalScale;",

			// Per-Pixel Tangent Space Normal Mapping
			// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html

		"	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {",

		"		vec3 q0 = dFdx( eye_pos.xyz );",
		"		vec3 q1 = dFdy( eye_pos.xyz );",
		"		vec2 st0 = dFdx( vUv.st );",
		"		vec2 st1 = dFdy( vUv.st );",

		"		vec3 S = normalize(  q0 * st1.t - q1 * st0.t );",
		"		vec3 T = normalize( -q0 * st1.s + q1 * st0.s );",
		"		vec3 N = normalize( surf_norm );",

		"		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;",
		"		mapN.xy = normalScale * mapN.xy;",
		"		mat3 tsn = mat3( S, T, N );",
		"		return normalize( tsn * mapN );",

		"	}",

		"#endif"

	].join("\n"),

	// SPECULAR MAP

	specularmap_pars_fragment: [

		"#ifdef USE_SPECULARMAP",

		"	uniform sampler2D specularMap;",

		"#endif"

	].join("\n"),

	specularmap_fragment: [

		"float specularStrength;",

		"#ifdef USE_SPECULARMAP",

		"	vec4 texelSpecular = texture2D( specularMap, vUv );",
		"	specularStrength = texelSpecular.r;",

		"#else",

		"	specularStrength = 1.0;",

		"#endif"

	].join("\n"),

	// LIGHTS LAMBERT

	lights_lambert_pars_vertex: [

		"uniform vec3 ambient;",
		"uniform vec3 diffuse;",
		"uniform vec3 emissive;",

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
		"	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];",
		"	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];",
		"	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];",

		"#endif",

		"#ifdef WRAP_AROUND",

		"	uniform vec3 wrapRGB;",

		"#endif"

	].join("\n"),

	lights_lambert_vertex: [

		"vLightFront = vec3( 0.0 );",

		"#ifdef DOUBLE_SIDED",

		"	vLightBack = vec3( 0.0 );",

		"#endif",

		"transformedNormal = normalize( transformedNormal );",

		"#if MAX_DIR_LIGHTS > 0",

		"for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",

		"	vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
		"	vec3 dirVector = normalize( lDirection.xyz );",

		"	float dotProduct = dot( transformedNormal, dirVector );",
		"	vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );",

		"	#ifdef DOUBLE_SIDED",

		"		vec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );",

		"		#ifdef WRAP_AROUND",

		"			vec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );",

		"		#endif",

		"	#endif",

		"	#ifdef WRAP_AROUND",

		"		vec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );",
		"		directionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );",

		"		#ifdef DOUBLE_SIDED",

		"			directionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );",

		"		#endif",

		"	#endif",

		"	vLightFront += directionalLightColor[ i ] * directionalLightWeighting;",

		"	#ifdef DOUBLE_SIDED",

		"		vLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;",

		"	#endif",

		"}",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

		"	for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

		"		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
		"		vec3 lVector = lPosition.xyz - mvPosition.xyz;",

		"		float lDistance = 1.0;",
		"		if ( pointLightDistance[ i ] > 0.0 )",
		"			lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

		"		lVector = normalize( lVector );",
		"		float dotProduct = dot( transformedNormal, lVector );",

		"		vec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );",

		"		#ifdef DOUBLE_SIDED",

		"			vec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );",

		"			#ifdef WRAP_AROUND",

		"				vec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );",

		"			#endif",

		"		#endif",

		"		#ifdef WRAP_AROUND",

		"			vec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );",
		"			pointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );",

		"			#ifdef DOUBLE_SIDED",

		"				pointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );",

		"			#endif",

		"		#endif",

		"		vLightFront += pointLightColor[ i ] * pointLightWeighting * lDistance;",

		"		#ifdef DOUBLE_SIDED",

		"			vLightBack += pointLightColor[ i ] * pointLightWeightingBack * lDistance;",

		"		#endif",

		"	}",

		"#endif",

		"#if MAX_SPOT_LIGHTS > 0",

		"	for( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {",

		"		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );",
		"		vec3 lVector = lPosition.xyz - mvPosition.xyz;",

		"		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );",

		"		if ( spotEffect > spotLightAngleCos[ i ] ) {",

		"			spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );",

		"			float lDistance = 1.0;",
		"			if ( spotLightDistance[ i ] > 0.0 )",
		"				lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );",

		"			lVector = normalize( lVector );",

		"			float dotProduct = dot( transformedNormal, lVector );",
		"			vec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );",

		"			#ifdef DOUBLE_SIDED",

		"				vec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );",

		"				#ifdef WRAP_AROUND",

		"					vec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );",

		"				#endif",

		"			#endif",

		"			#ifdef WRAP_AROUND",

		"				vec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );",
		"				spotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );",

		"				#ifdef DOUBLE_SIDED",

		"					spotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );",

		"				#endif",

		"			#endif",

		"			vLightFront += spotLightColor[ i ] * spotLightWeighting * lDistance * spotEffect;",

		"			#ifdef DOUBLE_SIDED",

		"				vLightBack += spotLightColor[ i ] * spotLightWeightingBack * lDistance * spotEffect;",

		"			#endif",

		"		}",

		"	}",

		"#endif",

		"#if MAX_HEMI_LIGHTS > 0",

		"	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",

		"		vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
		"		vec3 lVector = normalize( lDirection.xyz );",

		"		float dotProduct = dot( transformedNormal, lVector );",

		"		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",
		"		float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;",

		"		vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

		"		#ifdef DOUBLE_SIDED",

		"			vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );",

		"		#endif",

		"	}",

		"#endif",

		"vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;",

		"#ifdef DOUBLE_SIDED",

		"	vLightBack = vLightBack * diffuse + ambient * ambientLightColor + emissive;",

		"#endif"

	].join("\n"),

	// LIGHTS PHONG

	lights_phong_pars_vertex: [

		"#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )",

		"	varying vec3 vWorldPosition;",

		"#endif"

	].join("\n"),


	lights_phong_vertex: [

		"#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )",

		"	vWorldPosition = worldPosition.xyz;",

		"#endif"

	].join("\n"),

	lights_phong_pars_fragment: [

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

		"#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )",

		"	varying vec3 vWorldPosition;",

		"#endif",

		"#ifdef WRAP_AROUND",

		"	uniform vec3 wrapRGB;",

		"#endif",

		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;"

	].join("\n"),

	lights_phong_fragment: [

		"vec3 normal = normalize( vNormal );",
		"vec3 viewPosition = normalize( vViewPosition );",

		"#ifdef DOUBLE_SIDED",

		"	normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );",

		"#endif",

		"#ifdef USE_NORMALMAP",

		"	normal = perturbNormal2Arb( -vViewPosition, normal );",

		"#elif defined( USE_BUMPMAP )",

		"	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

		"	vec3 pointDiffuse  = vec3( 0.0 );",
		"	vec3 pointSpecular = vec3( 0.0 );",

		"	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {",

		"		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
		"		vec3 lVector = lPosition.xyz + vViewPosition.xyz;",

		"		float lDistance = 1.0;",
		"		if ( pointLightDistance[ i ] > 0.0 )",
		"			lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );",

		"		lVector = normalize( lVector );",

				// diffuse

		"		float dotProduct = dot( normal, lVector );",

		"		#ifdef WRAP_AROUND",

		"			float pointDiffuseWeightFull = max( dotProduct, 0.0 );",
		"			float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );",

		"			vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );",

		"		#else",

		"			float pointDiffuseWeight = max( dotProduct, 0.0 );",

		"		#endif",

		"		pointDiffuse  += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;",

				// specular

		"		vec3 pointHalfVector = normalize( lVector + viewPosition );",
		"		float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
		"		float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );",

				// 2.0 => 2.0001 is hack to work around ANGLE bug

		"		float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

		"		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );",
		"		pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;",

		"	}",

		"#endif",

		"#if MAX_SPOT_LIGHTS > 0",

		"	vec3 spotDiffuse  = vec3( 0.0 );",
		"	vec3 spotSpecular = vec3( 0.0 );",

		"	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {",

		"		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );",
		"		vec3 lVector = lPosition.xyz + vViewPosition.xyz;",

		"		float lDistance = 1.0;",
		"		if ( spotLightDistance[ i ] > 0.0 )",
		"			lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );",

		"		lVector = normalize( lVector );",

		"		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );",

		"		if ( spotEffect > spotLightAngleCos[ i ] ) {",

		"			spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );",

					// diffuse

		"			float dotProduct = dot( normal, lVector );",

		"			#ifdef WRAP_AROUND",

		"				float spotDiffuseWeightFull = max( dotProduct, 0.0 );",
		"				float spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );",

		"				vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );",

		"			#else",

		"				float spotDiffuseWeight = max( dotProduct, 0.0 );",

		"			#endif",

		"			spotDiffuse += diffuse * spotLightColor[ i ] * spotDiffuseWeight * lDistance * spotEffect;",

					// specular

		"			vec3 spotHalfVector = normalize( lVector + viewPosition );",
		"			float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );",
		"			float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );",

					// 2.0 => 2.0001 is hack to work around ANGLE bug

		"			float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

		"			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );",
		"			spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;",

		"		}",

		"	}",

		"#endif",

		"#if MAX_DIR_LIGHTS > 0",

		"	vec3 dirDiffuse  = vec3( 0.0 );",
		"	vec3 dirSpecular = vec3( 0.0 );" ,

		"	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",

		"		vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
		"		vec3 dirVector = normalize( lDirection.xyz );",

				// diffuse

		"		float dotProduct = dot( normal, dirVector );",

		"		#ifdef WRAP_AROUND",

		"			float dirDiffuseWeightFull = max( dotProduct, 0.0 );",
		"			float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );",

		"			vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );",

		"		#else",

		"			float dirDiffuseWeight = max( dotProduct, 0.0 );",

		"		#endif",

		"		dirDiffuse  += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;",

				// specular

		"		vec3 dirHalfVector = normalize( dirVector + viewPosition );",
		"		float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );",
		"		float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );",

					/*
				// fresnel term from skin shader
		"		const float F0 = 0.128;",

		"		float base = 1.0 - dot( viewPosition, dirHalfVector );",
		"		float exponential = pow( base, 5.0 );",

		"		float fresnel = exponential + F0 * ( 1.0 - exponential );",
				*/

				/*
				// fresnel term from fresnel shader
		"		const float mFresnelBias = 0.08;",
		"		const float mFresnelScale = 0.3;",
		"		const float mFresnelPower = 5.0;",

		"		float fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );",
				*/

				// 2.0 => 2.0001 is hack to work around ANGLE bug

		"		float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				//"dirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;",

		"		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );",
		"		dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;",


		"	}",

		"#endif",

		"#if MAX_HEMI_LIGHTS > 0",

		"	vec3 hemiDiffuse  = vec3( 0.0 );",
		"	vec3 hemiSpecular = vec3( 0.0 );" ,

		"	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {",

		"		vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );",
		"		vec3 lVector = normalize( lDirection.xyz );",

				// diffuse

		"		float dotProduct = dot( normal, lVector );",
		"		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

		"		vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );",

		"		hemiDiffuse += diffuse * hemiColor;",

				// specular (sky light)

		"		vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );",
		"		float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
		"		float hemiSpecularWeightSky = specularStrength * max( pow( hemiDotNormalHalfSky, shininess ), 0.0 );",

				// specular (ground light)

		"		vec3 lVectorGround = -lVector;",

		"		vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );",
		"		float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
		"		float hemiSpecularWeightGround = specularStrength * max( pow( hemiDotNormalHalfGround, shininess ), 0.0 );",

		"		float dotProductGround = dot( normal, lVectorGround );",

				// 2.0 => 2.0001 is hack to work around ANGLE bug

		"		float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

		"		vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );",
		"		vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );",
		"		hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",

		"	}",

		"#endif",

		"vec3 totalDiffuse = vec3( 0.0 );",
		"vec3 totalSpecular = vec3( 0.0 );",

		"#if MAX_DIR_LIGHTS > 0",

		"	totalDiffuse += dirDiffuse;",
		"	totalSpecular += dirSpecular;",

		"#endif",

		"#if MAX_HEMI_LIGHTS > 0",

		"	totalDiffuse += hemiDiffuse;",
		"	totalSpecular += hemiSpecular;",

		"#endif",

		"#if MAX_POINT_LIGHTS > 0",

		"	totalDiffuse += pointDiffuse;",
		"	totalSpecular += pointSpecular;",

		"#endif",

		"#if MAX_SPOT_LIGHTS > 0",

		"	totalDiffuse += spotDiffuse;",
		"	totalSpecular += spotSpecular;",

		"#endif",

		"#ifdef METAL",

		"	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );",

		"#else",

		"	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;",

		"#endif"

	].join("\n"),

	// VERTEX COLORS

	color_pars_fragment: [

		"#ifdef USE_COLOR",

		"	varying vec3 vColor;",

		"#endif"

	].join("\n"),


	color_fragment: [

		"#ifdef USE_COLOR",

		"	gl_FragColor = gl_FragColor * vec4( vColor, 1.0 );",

		"#endif"

	].join("\n"),

	color_pars_vertex: [

		"#ifdef USE_COLOR",

		"	varying vec3 vColor;",

		"#endif"

	].join("\n"),


	color_vertex: [

		"#ifdef USE_COLOR",

		"	#ifdef GAMMA_INPUT",

		"		vColor = color * color;",

		"	#else",

		"		vColor = color;",

		"	#endif",

		"#endif"

	].join("\n"),

	// SKINNING

	skinning_pars_vertex: [

		"#ifdef USE_SKINNING",

		"	#ifdef BONE_TEXTURE",

		"		uniform sampler2D boneTexture;",
		"		uniform int boneTextureWidth;",
		"		uniform int boneTextureHeight;",

		"		mat4 getBoneMatrix( const in float i ) {",

		"			float j = i * 4.0;",
		"			float x = mod( j, float( boneTextureWidth ) );",
		"			float y = floor( j / float( boneTextureWidth ) );",

		"			float dx = 1.0 / float( boneTextureWidth );",
		"			float dy = 1.0 / float( boneTextureHeight );",

		"			y = dy * ( y + 0.5 );",

		"			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );",
		"			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );",
		"			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );",
		"			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );",

		"			mat4 bone = mat4( v1, v2, v3, v4 );",

		"			return bone;",

		"		}",

		"	#else",

		"		uniform mat4 boneGlobalMatrices[ MAX_BONES ];",

		"		mat4 getBoneMatrix( const in float i ) {",

		"			mat4 bone = boneGlobalMatrices[ int(i) ];",
		"			return bone;",

		"		}",

		"	#endif",

		"#endif"

	].join("\n"),

	skinbase_vertex: [

		"#ifdef USE_SKINNING",

		"	mat4 boneMatX = getBoneMatrix( skinIndex.x );",
		"	mat4 boneMatY = getBoneMatrix( skinIndex.y );",
		"	mat4 boneMatZ = getBoneMatrix( skinIndex.z );",
		"	mat4 boneMatW = getBoneMatrix( skinIndex.w );",

		"#endif"

	].join("\n"),

	skinning_vertex: [

		"#ifdef USE_SKINNING",

		"	#ifdef USE_MORPHTARGETS",

		"	vec4 skinVertex = vec4( morphed, 1.0 );",

		"	#else",

		"	vec4 skinVertex = vec4( position, 1.0 );",

		"	#endif",

		"	vec4 skinned  = boneMatX * skinVertex * skinWeight.x;",
		"	skinned      += boneMatY * skinVertex * skinWeight.y;",
		"	skinned      += boneMatZ * skinVertex * skinWeight.z;",
		"	skinned      += boneMatW * skinVertex * skinWeight.w;",

		"#endif"

	].join("\n"),

	// MORPHING

	morphtarget_pars_vertex: [

		"#ifdef USE_MORPHTARGETS",

		"	#ifndef USE_MORPHNORMALS",

		"	uniform float morphTargetInfluences[ 8 ];",

		"	#else",

		"	uniform float morphTargetInfluences[ 4 ];",

		"	#endif",

		"#endif"

	].join("\n"),

	morphtarget_vertex: [

		"#ifdef USE_MORPHTARGETS",

		"	vec3 morphed = vec3( 0.0 );",
		"	morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];",
		"	morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];",
		"	morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];",
		"	morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];",

		"	#ifndef USE_MORPHNORMALS",

		"	morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];",
		"	morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];",
		"	morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];",
		"	morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];",

		"	#endif",

		"	morphed += position;",

		"#endif"

	].join("\n"),

	default_vertex : [

		"vec4 mvPosition;",

		"#ifdef USE_SKINNING",

		"	mvPosition = modelViewMatrix * skinned;",

		"#endif",

		"#if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )",

		"	mvPosition = modelViewMatrix * vec4( morphed, 1.0 );",

		"#endif",

		"#if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )",

		"	mvPosition = modelViewMatrix * vec4( position, 1.0 );",

		"#endif",

		"gl_Position = projectionMatrix * mvPosition;"

	].join("\n"),

	morphnormal_vertex: [

		"#ifdef USE_MORPHNORMALS",

		"	vec3 morphedNormal = vec3( 0.0 );",

		"	morphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];",
		"	morphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];",
		"	morphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];",
		"	morphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];",

		"	morphedNormal += normal;",

		"#endif"

	].join("\n"),

	skinnormal_vertex: [

		"#ifdef USE_SKINNING",

		"	mat4 skinMatrix = skinWeight.x * boneMatX;",
		"	skinMatrix 	+= skinWeight.y * boneMatY;",
		"	skinMatrix 	+= skinWeight.z * boneMatZ;",
		"	skinMatrix 	+= skinWeight.w * boneMatW;",

		"	#ifdef USE_MORPHNORMALS",

		"	vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );",

		"	#else",

		"	vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );",

		"	#endif",

		"#endif"

	].join("\n"),

	defaultnormal_vertex: [

		"vec3 objectNormal;",

		"#ifdef USE_SKINNING",

		"	objectNormal = skinnedNormal.xyz;",

		"#endif",

		"#if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )",

		"	objectNormal = morphedNormal;",

		"#endif",

		"#if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )",

		"	objectNormal = normal;",

		"#endif",

		"#ifdef FLIP_SIDED",

		"	objectNormal = -objectNormal;",

		"#endif",

		"vec3 transformedNormal = normalMatrix * objectNormal;"

	].join("\n"),

	// SHADOW MAP

	// based on SpiderGL shadow map and Fabien Sanglard's GLSL shadow mapping examples
	//  http://spidergl.org/example.php?id=6
	// 	http://fabiensanglard.net/shadowmapping

	shadowmap_pars_fragment: [

		"#ifdef USE_SHADOWMAP",

		"	uniform sampler2D shadowMap[ MAX_SHADOWS ];",
		"	uniform vec2 shadowMapSize[ MAX_SHADOWS ];",

		"	uniform float shadowDarkness[ MAX_SHADOWS ];",
		"	uniform float shadowBias[ MAX_SHADOWS ];",

		"	varying vec4 vShadowCoord[ MAX_SHADOWS ];",

		"	float unpackDepth( const in vec4 rgba_depth ) {",

		"		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
		"		float depth = dot( rgba_depth, bit_shift );",
		"		return depth;",

		"	}",

		"#endif"

	].join("\n"),

	shadowmap_fragment: [

		"#ifdef USE_SHADOWMAP",

		"	#ifdef SHADOWMAP_DEBUG",

		"		vec3 frustumColors[3];",
		"		frustumColors[0] = vec3( 1.0, 0.5, 0.0 );",
		"		frustumColors[1] = vec3( 0.0, 1.0, 0.8 );",
		"		frustumColors[2] = vec3( 0.0, 0.5, 1.0 );",

		"	#endif",

		"	#ifdef SHADOWMAP_CASCADE",

		"		int inFrustumCount = 0;",

		"	#endif",

		"	float fDepth;",
		"	vec3 shadowColor = vec3( 1.0 );",

		"	for( int i = 0; i < MAX_SHADOWS; i ++ ) {",

		"		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;",

				// "if ( something && something )" 		 breaks ATI OpenGL shader compiler
				// "if ( all( something, something ) )"  using this instead

		"		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );",
		"		bool inFrustum = all( inFrustumVec );",

				// don't shadow pixels outside of light frustum
				// use just first frustum (for cascades)
				// don't shadow pixels behind far plane of light frustum

		"		#ifdef SHADOWMAP_CASCADE",

		"			inFrustumCount += int( inFrustum );",
		"			bvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );",

		"		#else",

		"			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );",

		"		#endif",

		"		bool frustumTest = all( frustumTestVec );",

		"		if ( frustumTest ) {",

		"			shadowCoord.z += shadowBias[ i ];",

		"			#if defined( SHADOWMAP_TYPE_PCF )",

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

		"				float shadow = 0.0;",

						/*
						// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL
						// must enroll loop manually

		"				for ( float y = -1.25; y <= 1.25; y += 1.25 )",
		"					for ( float x = -1.25; x <= 1.25; x += 1.25 ) {",

		"						vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );",

								// doesn't seem to produce any noticeable visual difference compared to simple "texture2D" lookup
								//"vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );",

		"						float fDepth = unpackDepth( rgbaDepth );",

		"						if ( fDepth < shadowCoord.z )",
		"							shadow += 1.0;",

		"				}",

		"				shadow /= 9.0;",

						*/

		"				const float shadowDelta = 1.0 / 9.0;",

		"				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;",
		"				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;",

		"				float dx0 = -1.25 * xPixelOffset;",
		"				float dy0 = -1.25 * yPixelOffset;",
		"				float dx1 = 1.25 * xPixelOffset;",
		"				float dy1 = 1.25 * yPixelOffset;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );",
		"				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;",

		"				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );",

		"			#elif defined( SHADOWMAP_TYPE_PCF_SOFT )",

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

		"				float shadow = 0.0;",

		"				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;",
		"				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;",

		"				float dx0 = -1.0 * xPixelOffset;",
		"				float dy0 = -1.0 * yPixelOffset;",
		"				float dx1 = 1.0 * xPixelOffset;",
		"				float dy1 = 1.0 * yPixelOffset;",

		"				mat3 shadowKernel;",
		"				mat3 depthKernel;",

		"				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );",
		"				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );",
		"				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );",
		"				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );",
		"				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );",
		"				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );",
		"				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );",
		"				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );",
		"				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );",

		"				vec3 shadowZ = vec3( shadowCoord.z );",
		"				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));",
		"				shadowKernel[0] *= vec3(0.25);",
													
		"				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));",
		"				shadowKernel[1] *= vec3(0.25);",

		"				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));",
		"				shadowKernel[2] *= vec3(0.25);",

		"				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );",

		"				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );",
		"				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );",

		"				vec4 shadowValues;",
		"				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );",
		"				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );",
		"				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );",
		"				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );",

		"				shadow = dot( shadowValues, vec4( 1.0 ) );",

		"				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );",

		"			#else",

		"				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );",
		"				float fDepth = unpackDepth( rgbaDepth );",

		"				if ( fDepth < shadowCoord.z )",

							// spot with multiple shadows is darker

		"					shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );",

							// spot with multiple shadows has the same color as single shadow spot

							//"shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );",

		"			#endif",

		"		}",


		"		#ifdef SHADOWMAP_DEBUG",

		"			#ifdef SHADOWMAP_CASCADE",

		"				if ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];",

		"			#else",

		"				if ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];",

		"			#endif",

		"		#endif",

		"	}",

		"	#ifdef GAMMA_OUTPUT",

		"		shadowColor *= shadowColor;",

		"	#endif",

		"	gl_FragColor.xyz = gl_FragColor.xyz * shadowColor;",

		"#endif"

	].join("\n"),

	shadowmap_pars_vertex: [

		"#ifdef USE_SHADOWMAP",

		"	varying vec4 vShadowCoord[ MAX_SHADOWS ];",
		"	uniform mat4 shadowMatrix[ MAX_SHADOWS ];",

		"#endif"

	].join("\n"),

	shadowmap_vertex: [

		"#ifdef USE_SHADOWMAP",

		"	for( int i = 0; i < MAX_SHADOWS; i ++ ) {",

		"		vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;",

		"	}",

		"#endif"

	].join("\n"),

	// ALPHATEST

	alphatest_fragment: [

		"#ifdef ALPHATEST",

		"	if ( gl_FragColor.a < ALPHATEST ) discard;",

		"#endif"

	].join("\n"),

	// LINEAR SPACE

	linear_to_gamma_fragment: [

		"#ifdef GAMMA_OUTPUT",

		"	gl_FragColor.xyz = sqrt( gl_FragColor.xyz );",

		"#endif"

	].join("\n"),

	// LOGARITHMIC DEPTH BUFFER
	// http://outerra.blogspot.com/2012/11/maximizing-depth-buffer-range-and.html

	// WebGL doesn't support gl_FragDepth out of the box, unless the EXT_frag_depth extension is available.  On platforms
	// without EXT_frag_depth, we have to fall back on linear z-buffer in the fragment shader, which means that some long 
	// faces close to the camera may have issues.	This can be worked around by tesselating the model more finely when
	// the camera is near the surface.

	logdepthbuf_pars_vertex: [

		"#ifdef USE_LOGDEPTHBUF",

		"	#ifdef USE_LOGDEPTHBUF_EXT",

		"		varying float vFragDepth;",

		"	#endif",

		"	uniform float logDepthBufFC;",

		"#endif",

	].join('\n'),

	logdepthbuf_vertex: [

		"#ifdef USE_LOGDEPTHBUF",

		"	gl_Position.z = log2(max(1e-6, gl_Position.w + 1.0)) * logDepthBufFC;",

		"	#ifdef USE_LOGDEPTHBUF_EXT",

		"		vFragDepth = 1.0 + gl_Position.w;",

		"#else",

		"		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;",

		"	#endif",

		"#endif"

	].join("\n"),

	logdepthbuf_pars_fragment: [

		"#ifdef USE_LOGDEPTHBUF",

		"	uniform float logDepthBufFC;",

		"	#ifdef USE_LOGDEPTHBUF_EXT",

		"		#extension GL_EXT_frag_depth : enable",
		"		varying float vFragDepth;",

		"	#endif",

		"#endif"

	].join('\n'),

	logdepthbuf_fragment: [
		"#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)",

		"	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;",

		"#endif"

	].join("\n")

};
