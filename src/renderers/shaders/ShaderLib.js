/**
 * Webgl Shader Library for three.js
 *
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */


THREE.ShaderLib = {

	'basic': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "fog" ]

		] ),

		vertexShader: THREE.ShaderChunk['meshbasic_vert'],
		fragmentShader: THREE.ShaderChunk['meshbasic_frag']

	},

	'lambert': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) }
			}

		] ),

		vertexShader: THREE.ShaderChunk['meshlambert_vert'],
		fragmentShader: THREE.ShaderChunk['meshlambert_frag']

	},

	'phong': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "bumpmap" ],
			THREE.UniformsLib[ "normalmap" ],
			THREE.UniformsLib[ "displacementmap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
				"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
				"shininess": { type: "f", value: 30 }
			}

		] ),

		vertexShader: THREE.ShaderChunk['meshphong_vert'],
		fragmentShader: THREE.ShaderChunk['meshphong_frag']

	},

	'standard': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "aomap" ],
			THREE.UniformsLib[ "lightmap" ],
			THREE.UniformsLib[ "emissivemap" ],
			THREE.UniformsLib[ "bumpmap" ],
			THREE.UniformsLib[ "normalmap" ],
			THREE.UniformsLib[ "displacementmap" ],
			THREE.UniformsLib[ "roughnessmap" ],
			THREE.UniformsLib[ "metalnessmap" ],
			THREE.UniformsLib[ "fog" ],
			THREE.UniformsLib[ "lights" ],

			{
				"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
				"roughness": { type: "f", value: 0.5 },
				"metalness": { type: "f", value: 0 },
				"envMapIntensity" : { type: "f", value: 1 } // temporary
			}

		] ),

		vertexShader: THREE.ShaderChunk['meshstandard_vert'],
		fragmentShader: THREE.ShaderChunk['meshstandard_frag']

	},

	'points': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "points" ],
			THREE.UniformsLib[ "fog" ]

		] ),

		vertexShader: THREE.ShaderChunk['points_vert'],
		fragmentShader: THREE.ShaderChunk['points_frag']

	},

	'dashed': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ "common" ],
			THREE.UniformsLib[ "fog" ],

			{
				"scale"    : { type: "f", value: 1 },
				"dashSize" : { type: "f", value: 1 },
				"totalSize": { type: "f", value: 2 }
			}

		] ),

		vertexShader: THREE.ShaderChunk['linedashed_vert'],
		fragmentShader: THREE.ShaderChunk['linedashed_frag']

	},

	'depth': {

		uniforms: {

			"mNear": { type: "f", value: 1.0 },
			"mFar" : { type: "f", value: 2000.0 },
			"opacity" : { type: "f", value: 1.0 }

		},

		vertexShader: THREE.ShaderChunk['depth_vert'],
		fragmentShader: THREE.ShaderChunk['depth_frag']

	},

	'normal': {

		uniforms: {

			"opacity" : { type: "f", value: 1.0 }

		},

		vertexShader: THREE.ShaderChunk['normal_vert'],
		fragmentShader: THREE.ShaderChunk['normal_frag']

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'cube': {

		uniforms: {
			"tCube": { type: "t", value: null },
			"tFlip": { type: "f", value: - 1 }
		},

		vertexShader: THREE.ShaderChunk['cube_vert'],
		fragmentShader: THREE.ShaderChunk['cube_frag']

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'equirect': {

		uniforms: {
			"tEquirect": { type: "t", value: null },
			"tFlip": { type: "f", value: - 1 }
		},

		vertexShader: THREE.ShaderChunk['equirect_vert'],
		fragmentShader: THREE.ShaderChunk['equirect_frag']

	},

	/* Depth encoding into RGBA texture
	 *
	 * based on SpiderGL shadow map example
	 * http://spidergl.org/example.php?id=6
	 *
	 * originally from
	 * http://www.gamedev.net/topic/442138-packing-a-float-into-a-a8r8g8b8-texture-shader/page__whichpage__1%25EF%25BF%25BD
	 *
	 * see also
	 * http://aras-p.info/blog/2009/07/30/encoding-floats-to-rgba-the-final/
	 */

	'depthRGBA': {

		uniforms: {},

		vertexShader: THREE.ShaderChunk['depthRGBA_vert'],
		fragmentShader: THREE.ShaderChunk['depthRGBA_frag']

	},


	'distanceRGBA': {

		uniforms: {

			"lightPos": { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) }

		},

		vertexShader: THREE.ShaderChunk['distanceRGBA_vert'],
		fragmentShader: THREE.ShaderChunk['distanceRGBA_frag']

	}

};
