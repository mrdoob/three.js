/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 * @author benaadams / http://blog.illyriad.co.uk/
 *
 */


THREE.DeferredShaderChunk = {

	// decode float to vec3

	unpackFloat: [

		"vec3 float_to_vec3( float data ) {",

			"vec3 uncompressed;",
			"uncompressed.x = fract( data );",
			"float zInt = floor( data / 255.0 );",
			"uncompressed.z = fract( zInt / 255.0 );",
			"uncompressed.y = fract( floor( data - ( zInt * 255.0 ) ) / 255.0 );",
			"return uncompressed;",

		"}"

	].join("\n"),

	computeVertexPositionVS: [

		"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

		"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",
		"float z = normalDepth.w;",

		"if ( z == 0.0 ) discard;",

		"vec2 xy = texCoord * 2.0 - 1.0;",

		"vec4 vertexPositionProjected = vec4( xy, z, 1.0 );",
		"vec4 vertexPositionVS = matProjInverse * vertexPositionProjected;",
		"vertexPositionVS.xyz /= vertexPositionVS.w;",
		"vertexPositionVS.w = 1.0;"

	].join("\n"),

	computeNormal: [

		"vec3 normal = normalDepth.xyz * 2.0 - 1.0;"

	].join("\n"),

	unpackColorMap: [

		"vec4 colorMap = texture2D( samplerColor, texCoord );",

		"vec3 albedo = float_to_vec3( abs( colorMap.x ) );",
		"vec3 specularColor = float_to_vec3( abs( colorMap.y ) );",
		"float shininess = abs( colorMap.z );",
		"float wrapAround = sign( colorMap.z );",
		"float additiveSpecular = sign( colorMap.y );"

	].join("\n"),

	computeDiffuse: [

		"float dotProduct = dot( normal, lightVector );",
		"float diffuseFull = max( dotProduct, 0.0 );",

		"vec3 diffuse;",

		"if ( wrapAround < 0.0 ) {",

			// wrap around lighting

			"float diffuseHalf = max( 0.5 * dotProduct + 0.5, 0.0 );",

			"const vec3 wrapRGB = vec3( 1.0, 1.0, 1.0 );",
			"diffuse = mix( vec3( diffuseFull ), vec3( diffuseHalf ), wrapRGB );",

		"} else {",

			// simple lighting

			"diffuse = vec3( diffuseFull );",

		"}"

	].join("\n"),

	computeSpecular: [

		"vec3 halfVector = normalize( lightVector - normalize( vertexPositionVS.xyz ) );",
		"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

		// simple specular

		//"vec3 specular = specularColor * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse;",

		// physically based specular

		"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

		"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightVector, halfVector ), 5.0 );",
		"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse * specularNormalization;"

	].join("\n"),

	combine: [

		"vec3 light = lightIntensity * lightColor;",
		"gl_FragColor = vec4( light * ( albedo * diffuse + specular ), attenuation );"

	].join("\n")

};

THREE.ShaderDeferred = {

	"color" : {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "shadowmap" ],

			{
				"emissive" :  { type: "c", value: new THREE.Color( 0x000000 ) },
				"specular" :  { type: "c", value: new THREE.Color( 0x111111 ) },
				"shininess":  { type: "f", value: 30 },
				"wrapAround": 		{ type: "f", value: 1 },
				"additiveSpecular": { type: "f", value: 1 },

				"samplerNormalDepth": { type: "t", value: null },
				"viewWidth": 		{ type: "f", value: 800 },
				"viewHeight": 		{ type: "f", value: 600 }
			}

		] ),

		fragmentShader : [

			"uniform vec3 diffuse;",
			"uniform vec3 specular;",
			"uniform vec3 emissive;",
			"uniform float shininess;",
			"uniform float wrapAround;",
			"uniform float additiveSpecular;",

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "color_pars_fragment" ],
			THREE.ShaderChunk[ "map_pars_fragment" ],
			THREE.ShaderChunk[ "lightmap_pars_fragment" ],

			"#ifdef USE_ENVMAP",

				"varying vec3 vWorldPosition;",

				"uniform float reflectivity;",
				"uniform samplerCube envMap;",
				"uniform float flipEnvMap;",
				"uniform int combine;",

				"uniform bool useRefract;",
				"uniform float refractionRatio;",

				"uniform sampler2D samplerNormalDepth;",
				"uniform float viewHeight;",
				"uniform float viewWidth;",

			"#endif",

			THREE.ShaderChunk[ "fog_pars_fragment" ],
			THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
			THREE.ShaderChunk[ "specularmap_pars_fragment" ],

			"const float unit = 255.0/256.0;",

			"float vec3_to_float( vec3 data ) {",

				"highp float compressed = fract( data.x * unit ) + floor( data.y * unit * 255.0 ) + floor( data.z * unit * 255.0 ) * 255.0;",
				"return compressed;",

			"}",

			"void main() {",

				"const float opacity = 1.0;",

				"vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
				"vec4 diffuseColor = vec4( diffuse, opacity );",

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "alphatest_fragment" ],
				THREE.ShaderChunk[ "specularmap_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],

				"outgoingLight = diffuseColor.rgb;",

				"#ifdef USE_ENVMAP",

					"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",
					"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",
					"vec3 normal = normalDepth.xyz * 2.0 - 1.0;",

					"vec3 reflectVec;",

					"vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );",

					"if ( useRefract ) {",

						"reflectVec = refract( cameraToVertex, normal, refractionRatio );",

					"} else { ",

						"reflectVec = reflect( cameraToVertex, normal );",

					"}",

					"#ifdef DOUBLE_SIDED",

						"float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );",
						"vec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );",

					"#else",

						"vec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );",

					"#endif",

					"cubeColor.xyz = inputToLinear( cubeColor.xyz );",

					"if ( combine == 1 ) {",

						"outgoingLight = mix( outgoingLight, cubeColor.xyz, specularStrength * reflectivity );",

					"} else if ( combine == 2 ) {",

						"outgoingLight += cubeColor.xyz * specularStrength * reflectivity;",

					"} else {",

						"outgoingLight = mix( outgoingLight, diffuseColor.xyz * cubeColor.xyz, specularStrength * reflectivity );",

					"}",

				"#endif",

				THREE.ShaderChunk[ "shadowmap_fragment" ],
				THREE.ShaderChunk[ "fog_fragment" ],

				//

				"const float compressionScale = 0.999;",

				//

				"vec3 diffuseMapColor;",

				"#ifdef USE_MAP",

					"diffuseMapColor = texelColor.xyz;",

				"#else",

					"diffuseMapColor = vec3( 1.0 );",

				"#endif",

				// diffuse color

				"gl_FragColor.x = vec3_to_float( compressionScale * outgoingLight );",

				// specular color

				"if ( additiveSpecular < 0.0 ) {",

					"gl_FragColor.y = vec3_to_float( compressionScale * specular );",

				"} else {",

					"gl_FragColor.y = vec3_to_float( compressionScale * specular * diffuseMapColor );",

				"}",

				"gl_FragColor.y *= additiveSpecular;",

				// shininess

				"gl_FragColor.z = wrapAround * shininess;",

				// emissive color

				"#ifdef USE_COLOR",

					"gl_FragColor.w = vec3_to_float( compressionScale * emissive * diffuseMapColor * vColor );",

				"#else",

					"gl_FragColor.w = vec3_to_float( compressionScale * emissive * diffuseMapColor );",

				"#endif",

			"}"

		].join("\n"),

		vertexShader : [

			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "map_pars_vertex" ],
			THREE.ShaderChunk[ "lightmap_pars_vertex" ],
			THREE.ShaderChunk[ "color_pars_vertex" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],
			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

			"#ifdef USE_ENVMAP",

				"varying vec3 vWorldPosition;",

			"#endif",

			"void main() {",

				THREE.ShaderChunk[ "map_vertex" ],
				THREE.ShaderChunk[ "lightmap_vertex" ],
				THREE.ShaderChunk[ "color_vertex" ],

				THREE.ShaderChunk[ "skinbase_vertex" ],

				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

				THREE.ShaderChunk[ "worldpos_vertex" ],
				THREE.ShaderChunk[ "shadowmap_vertex" ],

				"#ifdef USE_ENVMAP",

					"vWorldPosition = worldPosition.xyz;",

				"#endif",

			"}"

		].join("\n")

	},

	"normalDepth" : {

		uniforms: {

			bumpMap: 	  { type: "t", value: null },
			bumpScale:	  { type: "f", value: 1 },
			offsetRepeat: { type: "v4", value: new THREE.Vector4( 0, 0, 1, 1 ) }

		},

		fragmentShader : [

			"#ifdef USE_BUMPMAP",

				"#extension GL_OES_standard_derivatives : enable\n",

				"varying vec2 vUv;",
				"varying vec3 vViewPosition;",

				THREE.ShaderChunk[ "bumpmap_pars_fragment" ],

			"#endif",

			"varying vec3 normalView;",
			"varying vec4 clipPos;",

			"void main() {",

				"vec3 normal = normalize( normalView );",

				"#ifdef USE_BUMPMAP",

					"normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );",

				"#endif",

				"gl_FragColor.xyz = normal * 0.5 + 0.5;",
				"gl_FragColor.w = clipPos.z / clipPos.w;",

			"}"

		].join("\n"),

		vertexShader : [

			"varying vec3 normalView;",
			"varying vec4 clipPos;",

			"#ifdef USE_BUMPMAP",

				"varying vec2 vUv;",
				"varying vec3 vViewPosition;",

				"uniform vec4 offsetRepeat;",

			"#endif",

			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],

			"void main() {",

				THREE.ShaderChunk[ "morphnormal_vertex" ],
				THREE.ShaderChunk[ "skinbase_vertex" ],
				THREE.ShaderChunk[ "skinnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],

				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

				"normalView = normalize( normalMatrix * objectNormal );",

				"#ifdef USE_BUMPMAP",

					"vUv = uv * offsetRepeat.zw + offsetRepeat.xy;",
					"vViewPosition = -mvPosition.xyz;",

				"#endif",

				"clipPos = gl_Position;",

			"}"

		].join("\n")

	},

	"composite" : {

		uniforms: {

			samplerLight: 	{ type: "t", value: null },
			brightness:		{ type: "f", value: 1 }

		},

		fragmentShader : [

			"varying vec2 texCoord;",
			"uniform sampler2D samplerLight;",
			"uniform float brightness;",

			// tonemapping operators
			// based on John Hable's HLSL snippets
			// from http://filmicgames.com/archives/75

			"#ifdef TONEMAP_UNCHARTED",

				"const float A = 0.15;",
				"const float B = 0.50;",
				"const float C = 0.10;",
				"const float D = 0.20;",
				"const float E = 0.02;",
				"const float F = 0.30;",
				"const float W = 11.2;",

				"vec3 Uncharted2Tonemap( vec3 x ) {",

				   "return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;",

				"}",

			"#endif",

			"void main() {",

				"vec3 inColor = texture2D( samplerLight, texCoord ).xyz;",
				"inColor *= brightness;",

				"vec3 outColor;",

				"#if defined( TONEMAP_SIMPLE )",

					"outColor = sqrt( inColor );",

				"#elif defined( TONEMAP_LINEAR )",

					// simple linear to gamma conversion

					"outColor = pow( inColor, vec3( 1.0 / 2.2 ) );",

				"#elif defined( TONEMAP_REINHARD )",

					// Reinhard operator

					"inColor = inColor / ( 1.0 + inColor );",
					"outColor = pow( inColor, vec3( 1.0 / 2.2 ) );",

				"#elif defined( TONEMAP_FILMIC )",

					// filmic operator by Jim Hejl and Richard Burgess-Dawson

					"vec3 x = max( vec3( 0.0 ), inColor - 0.004 );",
					"outColor = ( x * ( 6.2 * x + 0.5 ) ) / ( x * ( 6.2 * x + 1.7 ) + 0.06 );",

				"#elif defined( TONEMAP_UNCHARTED )",

					// tonemapping operator from Uncharted 2 by John Hable

					"float ExposureBias = 2.0;",
					"vec3 curr = Uncharted2Tonemap( ExposureBias * inColor );",

					"vec3 whiteScale = vec3( 1.0 ) / Uncharted2Tonemap( vec3( W ) );",
					"vec3 color = curr * whiteScale;",

					"outColor = pow( color, vec3( 1.0 / 2.2 ) );",

				"#else",

					"outColor = inColor;",

				"#endif",

				"gl_FragColor = vec4( outColor, 1.0 );",

			"}"

		].join("\n"),

		vertexShader : [

			"varying vec2 texCoord;",

			"void main() {",

				"vec4 pos = vec4( sign( position.xy ), 0.0, 1.0 );",
				"texCoord = pos.xy * vec2( 0.5 ) + 0.5;",
				"gl_Position = pos;",

			"}"

		].join("\n")

	},

	"pointLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

			lightPositionVS:{ type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 },
			lightRadius: 	{ type: "f", value: 1.0 }

		},

		fragmentShader : [

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightRadius;",
			"uniform float lightIntensity;",
			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightPositionVS;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],

				// bail out early when pixel outside of light sphere

				"vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"if ( distance > lightRadius ) discard;",

				THREE.DeferredShaderChunk[ "computeNormal" ],
				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				// compute light

				"lightVector = normalize( lightVector );",

				THREE.DeferredShaderChunk[ "computeDiffuse" ],
				THREE.DeferredShaderChunk[ "computeSpecular" ],

				// combine

				"float cutoff = 0.3;",
				"float denom = distance / lightRadius + 1.0;",
				"float attenuation = 1.0 / ( denom * denom );",
				"attenuation = ( attenuation - cutoff ) / ( 1.0 - cutoff );",
				"attenuation = max( attenuation, 0.0 );",
				"attenuation *= attenuation;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				// sphere proxy needs real position

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	},

	"spotLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

			lightPositionVS :{ type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightDirectionVS:{ type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 },
			lightDistance: 	{ type: "f", value: 1.0 },
			lightAngle: 	{ type: "f", value: 1.0 }

		},

		fragmentShader : [

			"uniform vec3 lightPositionVS;",
			"uniform vec3 lightDirectionVS;",

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform float lightAngle;",
			"uniform float lightIntensity;",
			"uniform vec3 lightColor;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "computeNormal" ],
				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				// compute light

				"vec3 lightVector = normalize( lightPositionVS.xyz - vertexPositionVS.xyz );",

				"float rho = dot( lightDirectionVS, lightVector );",
				"float rhoMax = cos( lightAngle * 0.5 );",

				"if ( rho <= rhoMax ) discard;",

				"float theta = rhoMax + 0.0001;",
				"float phi = rhoMax + 0.05;",
				"float falloff = 4.0;",

				"float spot = 0.0;",

				"if ( rho >= phi ) {",

					"spot = 1.0;",

				"} else if ( rho <= theta ) {",

					"spot = 0.0;",

				"} else { ",

					"spot = pow( ( rho - theta ) / ( phi - theta ), falloff );",

				"}",

				THREE.DeferredShaderChunk[ "computeDiffuse" ],

				"diffuse *= spot;",

				THREE.DeferredShaderChunk[ "computeSpecular" ],

				// combine

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				// full screen quad proxy

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	},

	"directionalLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

			lightDirectionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 }

		},

		fragmentShader : [

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightRadius;",
			"uniform float lightIntensity;",
			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",
			"uniform vec3 lightDirectionVS;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "computeNormal" ],
				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				// compute light

				"vec3 lightVector = lightDirectionVS;",

				THREE.DeferredShaderChunk[ "computeDiffuse" ],
				THREE.DeferredShaderChunk[ "computeSpecular" ],

				// combine

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				// full screen quad proxy

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	},

	"hemisphereLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

			lightDirectionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightColorSky: 	  { type: "c", value: new THREE.Color( 0x000000 ) },
			lightColorGround: { type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity:   { type: "f", value: 1.0 }

		},

		fragmentShader : [

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightRadius;",
			"uniform float lightIntensity;",
			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColorSky;",
			"uniform vec3 lightColorGround;",
			"uniform vec3 lightDirectionVS;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "computeNormal" ],
				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				// compute light

				"vec3 lightVector = lightDirectionVS;",

				// diffuse

				"float dotProduct = dot( normal, lightVector );",
				"float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;",

				"vec3 hemiColor = mix( lightColorGround, lightColorSky, hemiDiffuseWeight );",

				"vec3 diffuse = hemiColor;",

				// specular (sky light)

				"vec3 hemiHalfVectorSky = normalize( lightVector - vertexPositionVS.xyz );",
				"float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;",
				"float hemiSpecularWeightSky = max( pow( hemiDotNormalHalfSky, shininess ), 0.0 );",

				// specular (ground light)

				"vec3 lVectorGround = -lightVector;",

				"vec3 hemiHalfVectorGround = normalize( lVectorGround - vertexPositionVS.xyz );",
				"float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;",
				"float hemiSpecularWeightGround = max( pow( hemiDotNormalHalfGround, shininess ), 0.0 );",

				"float dotProductGround = dot( normal, lVectorGround );",

				"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				"vec3 schlickSky = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightVector, hemiHalfVectorSky ), 5.0 );",
				"vec3 schlickGround = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 5.0 );",
				"vec3 specular = hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );",

				// combine

				"gl_FragColor = vec4( lightIntensity * ( albedo * diffuse + specular ), 1.0 );",

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				// full screen quad proxy

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	},

	"areaLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

			lightPositionVS: { type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightNormalVS: 	 { type: "v3", value: new THREE.Vector3( 0, -1, 0 ) },
			lightRightVS:  	 { type: "v3", value: new THREE.Vector3( 1, 0, 0 ) },
			lightUpVS:  	 { type: "v3", value: new THREE.Vector3( 1, 0, 0 ) },

			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 },

			lightWidth:  { type: "f", value: 1.0 },
			lightHeight: { type: "f", value: 1.0 },

			constantAttenuation:  { type: "f", value: 1.5 },
			linearAttenuation:    { type: "f", value: 0.5 },
			quadraticAttenuation: { type: "f", value: 0.1 }

		},

		fragmentShader : [

			"uniform vec3 lightPositionVS;",
			"uniform vec3 lightNormalVS;",
			"uniform vec3 lightRightVS;",
			"uniform vec3 lightUpVS;",

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightWidth;",
			"uniform float lightHeight;",

			"uniform float constantAttenuation;",
			"uniform float linearAttenuation;",
			"uniform float quadraticAttenuation;",

			"uniform float lightIntensity;",
			"uniform vec3 lightColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"vec3 projectOnPlane( vec3 point, vec3 planeCenter, vec3 planeNorm ) {",

				"return point - dot( point - planeCenter, planeNorm ) * planeNorm;",

			"}",

			"bool sideOfPlane( vec3 point, vec3 planeCenter, vec3 planeNorm ) {",

				"return ( dot( point - planeCenter, planeNorm ) >= 0.0 );",

			"}",

			"vec3 linePlaneIntersect( vec3 lp, vec3 lv, vec3 pc, vec3 pn ) {",

				"return lp + lv * ( dot( pn, pc - lp ) / dot( pn, lv ) );",

			"}",

			"float calculateAttenuation( float dist ) {",

				"return ( 1.0 / ( constantAttenuation + linearAttenuation * dist + quadraticAttenuation * dist * dist ) );",

			"}",

			"void main() {",

				THREE.DeferredShaderChunk[ "computeVertexPositionVS" ],
				THREE.DeferredShaderChunk[ "computeNormal" ],
				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				"float w = lightWidth;",
				"float h = lightHeight;",

				"vec3 proj = projectOnPlane( vertexPositionVS.xyz, lightPositionVS, lightNormalVS );",
				"vec3 dir = proj - lightPositionVS;",

				"vec2 diagonal = vec2( dot( dir, lightRightVS ), dot( dir, lightUpVS ) );",
				"vec2 nearest2D = vec2( clamp( diagonal.x, -w, w ), clamp( diagonal.y, -h, h ) );",
				"vec3 nearestPointInside = vec3( lightPositionVS ) + ( lightRightVS * nearest2D.x + lightUpVS * nearest2D.y );",

				"vec3 lightDir = normalize( nearestPointInside - vertexPositionVS.xyz );",
				"float NdotL = max( dot( lightNormalVS, -lightDir ), 0.0 );",
				"float NdotL2 = max( dot( normal, lightDir ), 0.0 );",

				//"if ( NdotL2 * NdotL > 0.0 && sideOfPlane( vertexPositionVS.xyz, lightPositionVS, lightNormalVS ) ) {",
				"if ( NdotL2 * NdotL > 0.0 ) {",

					// diffuse

					"vec3 diffuse = vec3( sqrt( NdotL * NdotL2 ) );",

					// specular

					"vec3 specular = vec3( 0.0 );",

					"vec3 R = reflect( normalize( -vertexPositionVS.xyz ), normal );",
					"vec3 E = linePlaneIntersect( vertexPositionVS.xyz, R, vec3( lightPositionVS ), lightNormalVS );",

					"float specAngle = dot( R, lightNormalVS );",

					"if ( specAngle > 0.0 ) {",

						"vec3 dirSpec = E - vec3( lightPositionVS );",
						"vec2 dirSpec2D = vec2( dot( dirSpec, lightRightVS ), dot( dirSpec, lightUpVS ) );",
						"vec2 nearestSpec2D = vec2( clamp( dirSpec2D.x, -w, w ), clamp( dirSpec2D.y, -h, h ) );",
						"float specFactor = 1.0 - clamp( length( nearestSpec2D - dirSpec2D ) * 0.05 * shininess, 0.0, 1.0 );",
						"specular = specularColor * specFactor * specAngle * diffuse;",

					"}",

					// combine

					"float dist = distance( vertexPositionVS.xyz, nearestPointInside );",
					"float attenuation = calculateAttenuation( dist );",

					THREE.DeferredShaderChunk[ "combine" ],

				"} else {",

					"discard;",

				"}",

			"}"

		].join("\n"),

		vertexShader : [

			"void main() {",

				// full screen quad proxy

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	},

	"emissiveLight" : {

		uniforms: {

			samplerColor: 	{ type: "t", value: null },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },

		},

		fragmentShader : [

			"uniform sampler2D samplerColor;",

			"uniform float viewHeight;",
			"uniform float viewWidth;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"vec4 colorMap = texture2D( samplerColor, texCoord );",
				"vec3 emissiveColor = float_to_vec3( abs( colorMap.w ) );",

				"gl_FragColor = vec4( emissiveColor, 1.0 );",

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				// full screen quad proxy

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	}

};
