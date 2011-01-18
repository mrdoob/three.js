var ShaderUtils = {

	lib: { 'fresnel': {

			uniforms: {

			"mRefractionRatio": { type: "f", value: 1.02 },
			"mFresnelBias": { type: "f", value: 0.1 },
			"mFresnelPower": { type: "f", value: 2.0 },
			"mFresnelScale": { type: "f", value: 1.0 },
			"tCube": { type: "t", value: 1, texture: null }

			},

			fragment_shader: [

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

			vertex_shader: [

			"uniform float mRefractionRatio;",
			"uniform float mFresnelBias;",
			"uniform float mFresnelScale;",
			"uniform float mFresnelPower;",

			"varying vec3 vReflect;",
			"varying vec3 vRefract[3];",
			"varying float vReflectionFactor;",

			"void main(void) {",
				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",

				"vec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );",

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

		'normal' : {

			uniforms: {

			"enableAO": { type: "i", value: 0 },
			"enableDiffuse": { type: "i", value: 0 },

			"tDiffuse": { type: "t", value: 0, texture: null },
			"tNormal": { type: "t", value: 2, texture: null },
			"tAO": { type: "t", value: 3, texture: null },

			"uNormalScale": { type: "f", value: 1.0 },

			"tDisplacement": { type: "t", value: 4, texture: null },
			"uDisplacementBias": { type: "f", value: -0.5 },
			"uDisplacementScale": { type: "f", value: 2.5 },

			"uPointLightPos": { type: "v3", value: new THREE.Vector3() },
			"uPointLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

			"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
			"uDirLightColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },

			"uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

			"uDiffuseColor": { type: "c", value: new THREE.Color( 0xeeeeee ) },
			"uSpecularColor": { type: "c", value: new THREE.Color( 0x111111 ) },
			"uAmbientColor": { type: "c", value: new THREE.Color( 0x050505 ) },
			"uShininess": { type: "f", value: 30 }

			},

			fragment_shader: [

			"uniform vec3 uDirLightPos;",

			"uniform vec3 uAmbientLightColor;",
			"uniform vec3 uDirLightColor;",
			"uniform vec3 uPointLightColor;",

			"uniform vec3 uAmbientColor;",
			"uniform vec3 uDiffuseColor;",
			"uniform vec3 uSpecularColor;",
			"uniform float uShininess;",

			"uniform bool enableDiffuse;",
			"uniform bool enableAO;",

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tNormal;",
			"uniform sampler2D tAO;",

			"uniform float uNormalScale;",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vViewPosition;",

			"void main() {",

				"vec3 diffuseTex = vec3( 1.0, 1.0, 1.0 );",
				"vec3 aoTex = vec3( 1.0, 1.0, 1.0 );",

				"vec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;",
				"normalTex.xy *= uNormalScale;",
				"normalTex = normalize( normalTex );",

				"if( enableDiffuse )",
					"diffuseTex = texture2D( tDiffuse, vUv ).xyz;",

				"if( enableAO )",
					"aoTex = texture2D( tAO, vUv ).xyz;",

				"mat3 tsb = mat3( vTangent, vBinormal, vNormal );",
				"vec3 finalNormal = tsb * normalTex;",

				"vec3 normal = normalize( finalNormal );",
				"vec3 viewPosition = normalize( vViewPosition );",

				// point light

				"vec4 pointDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );",
				"vec4 pointSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );",

				"vec3 pointVector = normalize( vPointLightVector );",
				"vec3 pointHalfVector = normalize( vPointLightVector + vViewPosition );",

				"float pointDotNormalHalf = dot( normal, pointHalfVector );",
				"float pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );",

				"float pointSpecularWeight = 0.0;",
				"if ( pointDotNormalHalf >= 0.0 )",
					"pointSpecularWeight = pow( pointDotNormalHalf, uShininess );",

				"pointDiffuse  += vec4( uDiffuseColor, 1.0 ) * pointDiffuseWeight;",
				"pointSpecular += vec4( uSpecularColor, 1.0 ) * pointSpecularWeight;",

				// directional light

				"vec4 dirDiffuse  = vec4( 0.0, 0.0, 0.0, 0.0 );",
				"vec4 dirSpecular = vec4( 0.0, 0.0, 0.0, 0.0 );",

				"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",

				"vec3 dirVector = normalize( lDirection.xyz );",
				"vec3 dirHalfVector = normalize( lDirection.xyz + vViewPosition );",

				"float dirDotNormalHalf = dot( normal, dirHalfVector );",
				"float dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );",

				"float dirSpecularWeight = 0.0;",
				"if ( dirDotNormalHalf >= 0.0 )",
					"dirSpecularWeight = pow( dirDotNormalHalf, uShininess );",

				"dirDiffuse  += vec4( uDiffuseColor, 1.0 ) * dirDiffuseWeight;",
				"dirSpecular += vec4( uSpecularColor, 1.0 ) * dirSpecularWeight;",

				// all lights contribution summation

				"vec4 totalLight = vec4( uAmbientLightColor * uAmbientColor, 1.0 );",
				"totalLight += vec4( uDirLightColor, 1.0 ) * ( dirDiffuse + dirSpecular );",
				"totalLight += vec4( uPointLightColor, 1.0 ) * ( pointDiffuse + pointSpecular );",

				"gl_FragColor = vec4( totalLight.xyz * aoTex * diffuseTex, 1.0 );",

			"}"
			].join("\n"),

			vertex_shader: [

			"attribute vec4 tangent;",

			"uniform vec3 uPointLightPos;",

			"#ifdef VERTEX_TEXTURES",

				"uniform sampler2D tDisplacement;",
				"uniform float uDisplacementScale;",
				"uniform float uDisplacementBias;",

			"#endif",

			"varying vec3 vTangent;",
			"varying vec3 vBinormal;",
			"varying vec3 vNormal;",
			"varying vec2 vUv;",

			"varying vec3 vPointLightVector;",
			"varying vec3 vViewPosition;",

			"void main() {",

				"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
				"vViewPosition = cameraPosition - mPosition.xyz;",

				"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
				"vNormal = normalize( normalMatrix * normal );",

				// tangent and binormal vectors

				"vTangent = normalize( normalMatrix * tangent.xyz );",

				"vBinormal = cross( vNormal, vTangent ) * tangent.w;",
				"vBinormal = normalize( vBinormal );",

				"vUv = uv;",

				// point light

				"vec4 lPosition = viewMatrix * vec4( uPointLightPos, 1.0 );",
				"vPointLightVector = normalize( lPosition.xyz - mvPosition.xyz );",

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

			].join("\n")

		},

		'cube': {

			uniforms: { "tCube": { type: "t", value: 1, texture: null } },

			vertex_shader: [

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec4 mPosition = objectMatrix * vec4( position, 1.0 );",
					"vViewPosition = cameraPosition - mPosition.xyz;",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragment_shader: [

				"uniform samplerCube tCube;",

				"varying vec3 vViewPosition;",

				"void main() {",

					"vec3 wPos = cameraPosition - vViewPosition;",
					"gl_FragColor = textureCube( tCube, vec3( - wPos.x, wPos.yz ) );",

				"}"

			].join("\n")

		},

		'basic': {

			uniforms: {},

			vertex_shader: [

				"void main() {",

					"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

				"}"

			].join("\n"),

			fragment_shader: [

				"void main() {",

					"gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);",

				"}"

			].join("\n")

		}

	}

};
