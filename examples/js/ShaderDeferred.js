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

	unpackColorMap: [

		"vec4 colorMap = texture2D( samplerColor, texCoord );",

		"vec3 albedo = float_to_vec3( abs( colorMap.x ) );",
		"vec3 specularColor = float_to_vec3( abs( colorMap.y ) );",
		"float shininess = abs( colorMap.z );",
		"float wrapAround = sign( colorMap.z );",
		"float additiveSpecular = sign( colorMap.y );"

	].join("\n"),

	combine: [

		"vec3 light = lightIntensity * lightColor;",
		"gl_FragColor = vec4( light * ( albedo * diffuse + specular ), attenuation );",

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

				"gl_FragColor = vec4( diffuse, opacity );",

				THREE.ShaderChunk[ "map_fragment" ],
				THREE.ShaderChunk[ "alphatest_fragment" ],
				THREE.ShaderChunk[ "specularmap_fragment" ],
				THREE.ShaderChunk[ "lightmap_fragment" ],
				THREE.ShaderChunk[ "color_fragment" ],

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

					"#ifdef GAMMA_INPUT",

						"cubeColor.xyz *= cubeColor.xyz;",

					"#endif",

					"if ( combine == 1 ) {",

						"gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularStrength * reflectivity );",

					"} else if ( combine == 2 ) {",

						"gl_FragColor.xyz += cubeColor.xyz * specularStrength * reflectivity;",

					"} else {",

						"gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * cubeColor.xyz, specularStrength * reflectivity );",

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

				"gl_FragColor.x = vec3_to_float( compressionScale * gl_FragColor.xyz );",

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

				"gl_FragColor.w = vec3_to_float( compressionScale * emissive * diffuseMapColor );",

			"}"

		].join("\n"),

		vertexShader : [

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

			"void main() {",

				"vec3 color = texture2D( samplerLight, texCoord ).xyz;",
				"gl_FragColor = vec4( brightness * sqrt( color ), 1.0 );",

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

			"varying vec4 clipPos;",

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

				"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",

				"float z = normalDepth.w;",
				"float lightZ = clipPos.z / clipPos.w;",

				//"if ( z == 0.0 || lightZ > z ) discard;",

				"float x = texCoord.x * 2.0 - 1.0;",
				"float y = texCoord.y * 2.0 - 1.0;",

				"vec4 projectedPos = vec4( x, y, z, 1.0 );",

				"vec4 viewPos = matProjInverse * projectedPos;",
				"viewPos.xyz /= viewPos.w;",
				"viewPos.w = 1.0;",

				"vec3 lightDir = lightPositionVS - viewPos.xyz;",
				"float dist = length( lightDir );",

				"if ( dist > lightRadius ) discard;",

				"lightDir = normalize( lightDir );",

				"float cutoff = 0.3;",
				"float denom = dist/lightRadius + 1.0;",
				"float attenuation = 1.0 / ( denom * denom );",
				"attenuation = ( attenuation - cutoff ) / ( 1.0 - cutoff );",
				"attenuation = max( attenuation, 0.0 );",
				"attenuation *= attenuation;",

				// normal

				"vec3 normal = normalDepth.xyz * 2.0 - 1.0;",

				// color

				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				// light

				"vec3 diffuse;",

				"float diffuseFull = max( dot( normal, lightDir ), 0.0 );",

				"if ( wrapAround < 0.0 ) {",

					// wrap around lighting

					"float diffuseHalf = max( 0.5 + 0.5 * dot( normal, lightDir ), 0.0 );",

					"const vec3 wrapRGB = vec3( 0.6, 0.2, 0.2 );",
					"diffuse = mix( vec3( diffuseFull ), vec3( diffuseHalf ), wrapRGB );",

				"} else {",

					// simple lighting

					"diffuse = vec3( diffuseFull );",

				"}",

				// specular

				"vec3 halfVector = normalize( lightDir - normalize( viewPos.xyz ) );",
				"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

				// simple specular

				//"vec3 specular = max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse;",

				// physically based specular

				"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightDir, halfVector ), 5.0 );",
				"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse * specularNormalization;",

				// combine

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join("\n"),

		vertexShader : [

			"varying vec4 clipPos;",

			"void main() { ",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"gl_Position = projectionMatrix * mvPosition;",
				"clipPos = gl_Position;",

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

		    "uniform float lightAngle;"+
			"uniform float lightIntensity;"+
			"uniform vec3 lightColor;",

			"uniform mat4 matProjInverse;",

			THREE.DeferredShaderChunk[ "unpackFloat" ],

			"void main() {",

				"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",
				"float z = normalDepth.w;",

				"if ( z == 0.0 ) discard;",

				"float x = texCoord.x * 2.0 - 1.0;",
				"float y = texCoord.y * 2.0 - 1.0;",

				"vec4 projectedPos = vec4( x, y, z, 1.0 );",
				"vec4 positionVS = matProjInverse * projectedPos;",
				"positionVS.xyz /= positionVS.w;",
				"positionVS.w = 1.0;",

				// normal

				"vec3 normal = normalDepth.xyz * 2.0 - 1.0;",

				// color

				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				//

				"vec3 surfToLight = normalize( lightPositionVS.xyz - positionVS.xyz );",
				"float dotProduct = max( dot( normal, surfToLight ), 0.0 );",

				"float rho = dot( lightDirectionVS, surfToLight );",
				"float rhoMax = cos( lightAngle * 0.5 );",

				"if ( rho > rhoMax ) {",

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

					"float diffuse = spot * dotProduct;",

					"vec3 halfVector = normalize( surfToLight - normalize( positionVS.xyz ) );",
					"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

					// simple specular

					"vec3 specular = max( pow( dotNormalHalf, shininess ), 0.0 ) * spot * diffuse * specularColor;",

					// combine

					"const float attenuation = 1.0;",

					THREE.DeferredShaderChunk[ "combine" ],

					"return;",

				"}",

				"gl_FragColor = vec4( 0.0 );",

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

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

				"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",
				"float z = normalDepth.w;",

				"if ( z == 0.0 ) discard;",

				"float x = texCoord.x * 2.0 - 1.0;",
				"float y = texCoord.y * 2.0 - 1.0;",

				"vec4 projectedPos = vec4( x, y, z, 1.0 );",

				"vec4 viewPos = matProjInverse * projectedPos;",
				"viewPos.xyz /= viewPos.w;",
				"viewPos.w = 1.0;",

				// normal

				"vec3 normal = normalDepth.xyz * 2.0 - 1.0;",

				// color

				THREE.DeferredShaderChunk[ "unpackColorMap" ],

				"vec3 diffuse;",

				"float dotProduct = dot( normal, lightDirectionVS );",

				"float diffuseFull = max( dotProduct, 0.0 );",

				// wrap around lighting

				"if ( wrapAround < 0.0 ) {",

					"float diffuseHalf = max( 0.5 + 0.5 * dotProduct, 0.0 );",

					"const vec3 wrapRGB = vec3( 0.2, 0.2, 0.2 );",
					"diffuse = mix( vec3 ( diffuseFull ), vec3( diffuseHalf ), wrapRGB );",

				// simple lighting

				"} else {",

					"diffuse = vec3 ( diffuseFull );",

				"}",

				// specular

				"vec3 halfVector = normalize( lightDirectionVS - normalize( viewPos.xyz ) );",
				"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

				// simple specular

				//"vec3 specular = specularColor * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse;",

				// physically based specular

				"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightDirectionVS, halfVector ), 5.0 );",
				"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse * specularNormalization;",

				// combine

				"const float attenuation = 1.0;",

				THREE.DeferredShaderChunk[ "combine" ],

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

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

			"vec3 float_to_vec3( float data ) {",

				"vec3 uncompressed;",
				"uncompressed.x = fract( data );",
				"float zInt = floor( data / 255.0 );",
				"uncompressed.z = fract( zInt / 255.0 );",
				"uncompressed.y = fract( floor( data - ( zInt * 255.0 ) ) / 255.0 );",
				"return uncompressed;",

			"}",

			"void main() {",

				"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"vec4 colorMap = texture2D( samplerColor, texCoord );",
				"vec3 emissiveColor = float_to_vec3( abs( colorMap.w ) );",

				"gl_FragColor = vec4( emissiveColor, 1.0 );",

			"}"

		].join("\n"),

		vertexShader : [

			"void main() { ",

				"gl_Position = vec4( sign( position.xy ), 0.0, 1.0 );",

			"}"

		].join("\n")

	}

};
