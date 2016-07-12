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

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'aomap' ],
			THREE.UniformsLib[ 'fog' ]

		] ),

		vertexShader: THREE.ShaderChunk[ 'meshbasic_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'meshbasic_frag' ]

	},

	'lambert': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'aomap' ],
			THREE.UniformsLib[ 'lightmap' ],
			THREE.UniformsLib[ 'emissivemap' ],
			THREE.UniformsLib[ 'fog' ],
			THREE.UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new THREE.Color( 0x000000 ) }
			}

		] ),

		vertexShader: THREE.ShaderChunk[ 'meshlambert_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'meshlambert_frag' ]

	},

	'phong': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'aomap' ],
			THREE.UniformsLib[ 'lightmap' ],
			THREE.UniformsLib[ 'emissivemap' ],
			THREE.UniformsLib[ 'bumpmap' ],
			THREE.UniformsLib[ 'normalmap' ],
			THREE.UniformsLib[ 'displacementmap' ],
			THREE.UniformsLib[ 'fog' ],
			THREE.UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new THREE.Color( 0x000000 ) },
				"specular" : { value: new THREE.Color( 0x111111 ) },
				"shininess": { value: 30 }
			}

		] ),

		vertexShader: THREE.ShaderChunk[ 'meshphong_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'meshphong_frag' ]

	},

	'standard': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'aomap' ],
			THREE.UniformsLib[ 'lightmap' ],
			THREE.UniformsLib[ 'emissivemap' ],
			THREE.UniformsLib[ 'bumpmap' ],
			THREE.UniformsLib[ 'normalmap' ],
			THREE.UniformsLib[ 'displacementmap' ],
			THREE.UniformsLib[ 'roughnessmap' ],
			THREE.UniformsLib[ 'metalnessmap' ],
			THREE.UniformsLib[ 'fog' ],
			THREE.UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new THREE.Color( 0x000000 ) },
				"roughness": { value: 0.5 },
				"metalness": { value: 0 },
				"envMapIntensity" : { value: 1 }, // temporary
			}

		] ),

		vertexShader: THREE.ShaderChunk[ 'meshphysical_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'meshphysical_frag' ]

	},

	'points': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'points' ],
			THREE.UniformsLib[ 'fog' ]

		] ),

		vertexShader: THREE.ShaderChunk[ 'points_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'points_frag' ]

	},

	'dashed': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'fog' ],

			{
				"scale"    : { value: 1 },
				"dashSize" : { value: 1 },
				"totalSize": { value: 2 }
			}

		] ),

		vertexShader: THREE.ShaderChunk[ 'linedashed_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'linedashed_frag' ]

	},

	'depth': {

		uniforms: THREE.UniformsUtils.merge( [

			THREE.UniformsLib[ 'common' ],
			THREE.UniformsLib[ 'displacementmap' ]

		] ),

		vertexShader: THREE.ShaderChunk[ 'depth_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'depth_frag' ]

	},

	'normal': {

		uniforms: {

			"opacity" : { value: 1.0 }

		},

		vertexShader: THREE.ShaderChunk[ 'normal_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'normal_frag' ]

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'cube': {

		uniforms: {
			"tCube": { value: null },
			"tFlip": { value: - 1 }
		},

		vertexShader: THREE.ShaderChunk[ 'cube_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'cube_frag' ]

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'equirect': {

		uniforms: {
			"tEquirect": { value: null },
			"tFlip": { value: - 1 }
		},

		vertexShader: THREE.ShaderChunk[ 'equirect_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'equirect_frag' ]

	},

	'distanceRGBA': {

		uniforms: {

			"lightPos": { value: new THREE.Vector3() }

		},

		vertexShader: THREE.ShaderChunk[ 'distanceRGBA_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'distanceRGBA_frag' ]

	}

};

THREE.ShaderLib[ 'physical' ] = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.ShaderLib[ 'standard' ].uniforms,

		{
			"clearCoat": { value: 0 },
			"clearCoatRoughness": { value: 0 }
		}

	] ),

	vertexShader: THREE.ShaderChunk[ 'meshphysical_vert' ],
	fragmentShader: THREE.ShaderChunk[ 'meshphysical_frag' ]

};
