/**
 * @author alteredq / http://alteredqualia.com/
 * @author MPanknin / http://www.redplant.de/
 * @author benaadams / http://blog.illyriad.co.uk/
 *
 */


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
				"additiveSpecular": { type: "f", value: 1 }
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
			THREE.ShaderChunk[ "envmap_pars_fragment" ],
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
				THREE.ShaderChunk[ "envmap_fragment" ],
				THREE.ShaderChunk[ "shadowmap_fragment" ],

				THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

				THREE.ShaderChunk[ "fog_fragment" ],

				//

				"const float compressionScale = 0.999;",

				// diffuse color

				"gl_FragColor.x = vec3_to_float( compressionScale * gl_FragColor.xyz );",

				// specular color

				"gl_FragColor.y = additiveSpecular * vec3_to_float( compressionScale * specular );",

				// shininess

				"gl_FragColor.z = wrapAround * shininess;",

				// emissive color

				"#ifdef USE_MAP",

					"gl_FragColor.w = vec3_to_float( compressionScale * emissive * texelColor.xyz );",

				"#else",

					"gl_FragColor.w = vec3_to_float( compressionScale * emissive );",

				"#endif",

			"}"

		].join("\n"),

		vertexShader : [

			THREE.ShaderChunk[ "map_pars_vertex" ],
			THREE.ShaderChunk[ "lightmap_pars_vertex" ],
			THREE.ShaderChunk[ "envmap_pars_vertex" ],
			THREE.ShaderChunk[ "color_pars_vertex" ],
			THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
			THREE.ShaderChunk[ "skinning_pars_vertex" ],
			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

			"void main() {",

				THREE.ShaderChunk[ "map_vertex" ],
				THREE.ShaderChunk[ "lightmap_vertex" ],
				THREE.ShaderChunk[ "color_vertex" ],

				"#ifdef USE_ENVMAP",

				THREE.ShaderChunk[ "morphnormal_vertex" ],
				THREE.ShaderChunk[ "skinbase_vertex" ],
				THREE.ShaderChunk[ "skinnormal_vertex" ],
				THREE.ShaderChunk[ "defaultnormal_vertex" ],

				"#endif",

				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "skinning_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

				THREE.ShaderChunk[ "worldpos_vertex" ],
				THREE.ShaderChunk[ "envmap_vertex" ],
				THREE.ShaderChunk[ "shadowmap_vertex" ],

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

			"void main() {",

				THREE.ShaderChunk[ "morphnormal_vertex" ],
				THREE.ShaderChunk[ "morphtarget_vertex" ],
				THREE.ShaderChunk[ "default_vertex" ],

				"vec3 objectNormal;",

				"#if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )",

					"objectNormal = morphedNormal;",

				"#endif",

				"#if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )",

					"objectNormal = normal;",

				"#endif",

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
			matView: 		{ type: "m4", value: new THREE.Matrix4() },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },
			lightPos: 		{ type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 },
			lightRadius: 	{ type: "f", value: 1.0 }

		},

		fragmentShader : [

			"varying vec3 lightView;",
			"varying vec4 clipPos;",

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightRadius;",
			"uniform float lightIntensity;",
			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",

			"uniform mat4 matProjInverse;",

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

				"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",

				"float z = normalDepth.w;",
				"float lightZ = clipPos.z / clipPos.w;",

				"if ( z == 0.0 || lightZ > z ) discard;",

				"float x = texCoord.x * 2.0 - 1.0;",
				"float y = texCoord.y * 2.0 - 1.0;",

				"vec4 projectedPos = vec4( x, y, z, 1.0 );",

				"vec4 viewPos = matProjInverse * projectedPos;",
				"viewPos.xyz /= viewPos.w;",
				"viewPos.w = 1.0;",

				"vec3 lightDir = lightView - viewPos.xyz;",
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

				"vec4 colorMap = texture2D( samplerColor, texCoord );",

				"vec3 albedo = float_to_vec3( abs( colorMap.x ) );",
				"vec3 specularColor = float_to_vec3( abs( colorMap.y ) );",
				"float shininess = abs( colorMap.z );",
				"float wrapAround = sign( colorMap.z );",

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

				//"vec3 specular = specularIntensity * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse;",

				// physically based specular

				"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightDir, halfVector ), 5.0 );",
				"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse * specularNormalization;",

				// combine

				"vec3 light = lightIntensity * lightColor;",

				"float additiveSpecular = sign( colorMap.y );",

				"if ( additiveSpecular < 0.0 ) {",

					"gl_FragColor = vec4( albedo * light * diffuse, attenuation ) + vec4( light * specular, attenuation );",

				"} else {",

					"gl_FragColor = vec4( albedo * light * ( diffuse + specular ), attenuation );",

				"}",

			"}"

		].join("\n"),

		vertexShader : [

			"varying vec3 lightView;",
			"varying vec4 clipPos;",
			"uniform vec3 lightPos;",
			"uniform mat4 matView;",

			"void main() { ",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"gl_Position = projectionMatrix * mvPosition;",
				"lightView = vec3( matView * vec4( lightPos, 1.0 ) );",
				"clipPos = gl_Position;",

			"}"

		].join("\n")

	},

	"directionalLight" : {

		uniforms: {

			samplerNormalDepth: { type: "t", value: null },
			samplerColor: 		{ type: "t", value: null },
			matView: 		{ type: "m4", value: new THREE.Matrix4() },
			matProjInverse: { type: "m4", value: new THREE.Matrix4() },
			viewWidth: 		{ type: "f", value: 800 },
			viewHeight: 	{ type: "f", value: 600 },
			lightDir: 		{ type: "v3", value: new THREE.Vector3( 0, 1, 0 ) },
			lightColor: 	{ type: "c", value: new THREE.Color( 0x000000 ) },
			lightIntensity: { type: "f", value: 1.0 }

		},

		fragmentShader : [

			"varying vec3 lightView;",
			"varying vec4 clipPos;",

			"uniform sampler2D samplerColor;",
			"uniform sampler2D samplerNormalDepth;",

			"uniform float lightRadius;",
			"uniform float lightIntensity;",
			"uniform float viewHeight;",
			"uniform float viewWidth;",

			"uniform vec3 lightColor;",

			"uniform mat4 matProjInverse;",

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

				"vec4 normalDepth = texture2D( samplerNormalDepth, texCoord );",
				"float z = normalDepth.w;",

				"if ( z == 0.0 ) discard;",

				"float x = texCoord.x * 2.0 - 1.0;",
				"float y = texCoord.y * 2.0 - 1.0;",

				"vec4 projectedPos = vec4( x, y, z, 1.0 );",

				"vec4 viewPos = matProjInverse * projectedPos;",
				"viewPos.xyz /= viewPos.w;",
				"viewPos.w = 1.0;",

				"vec3 lightDir = normalize( lightView );",

				// normal

				"vec3 normal = normalDepth.xyz * 2.0 - 1.0;",

				// color

				"vec4 colorMap = texture2D( samplerColor, texCoord );",
				"vec3 albedo = float_to_vec3( abs( colorMap.x ) );",
				"vec3 specularColor = float_to_vec3( abs( colorMap.y ) );",
				"float shininess = colorMap.z;",

				// wrap around lighting

				"float diffuseFull = max( dot( normal, lightDir ), 0.0 );",
				"float diffuseHalf = max( 0.5 + 0.5 * dot( normal, lightDir ), 0.0 );",

				"const vec3 wrapRGB = vec3( 0.2, 0.2, 0.2 );",
				"vec3 diffuse = mix( vec3 ( diffuseFull ), vec3( diffuseHalf ), wrapRGB );",

				// simple lighting

				//"float diffuseFull = max( dot( normal, lightDir ), 0.0 );",
				//"vec3 diffuse = vec3 ( diffuseFull );",

				// specular

				"vec3 halfVector = normalize( lightDir + normalize( viewPos.xyz ) );",
				"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",

				// simple specular

				//"vec3 specular = specularIntensity * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse;",

				// physically based specular

				"float specularNormalization = ( shininess + 2.0001 ) / 8.0;",

				"vec3 schlick = specularColor + vec3( 1.0 - specularColor ) * pow( 1.0 - dot( lightDir, halfVector ), 5.0 );",
				"vec3 specular = schlick * max( pow( dotNormalHalf, shininess ), 0.0 ) * diffuse * specularNormalization;",

				// combine

				"vec3 light = lightIntensity * lightColor;",

				"#ifdef ADDITIVE_SPECULAR",

					"gl_FragColor = vec4( albedo * light * diffuse, 1.0 ) + vec4( light * specular, 1.0 );",

				"#else",

					"gl_FragColor = vec4( albedo * light * ( diffuse + specular ), 1.0 );",

				"#endif",

			"}"

		].join("\n"),

		vertexShader : [

			"varying vec3 lightView;",
			"varying vec4 clipPos;",
			"uniform vec3 lightDir;",
			"uniform mat4 matView;",

			"void main() { ",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"gl_Position = projectionMatrix * mvPosition;",
				"lightView = vec3( matView * vec4( lightDir, 0.0 ) );",
				"clipPos = gl_Position;",

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

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"gl_Position = projectionMatrix * mvPosition;",

			"}"

		].join("\n")

	}

};
