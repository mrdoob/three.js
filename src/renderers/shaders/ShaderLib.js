import { ShaderChunk } from './ShaderChunk';
import { UniformsUtils } from './UniformsUtils';
import { Vector3 } from '../../math/Vector3';
import { UniformsLib } from './UniformsLib';
import { Color } from '../../math/Color';

var ShaderLib;

/**
 * Webgl Shader Library for three.js
 *
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */


ShaderLib = {

	'basic': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'aomap' ],
			UniformsLib[ 'fog' ]

		] ),

		vertexShader: ShaderChunk[ 'meshbasic_vert' ],
		fragmentShader: ShaderChunk[ 'meshbasic_frag' ]

	},

	'lambert': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'aomap' ],
			UniformsLib[ 'lightmap' ],
			UniformsLib[ 'emissivemap' ],
			UniformsLib[ 'fog' ],
			UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new Color( 0x000000 ) }
			}

		] ),

		vertexShader: ShaderChunk[ 'meshlambert_vert' ],
		fragmentShader: ShaderChunk[ 'meshlambert_frag' ]

	},

	'phong': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'aomap' ],
			UniformsLib[ 'lightmap' ],
			UniformsLib[ 'emissivemap' ],
			UniformsLib[ 'bumpmap' ],
			UniformsLib[ 'normalmap' ],
			UniformsLib[ 'displacementmap' ],
			UniformsLib[ 'fog' ],
			UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new Color( 0x000000 ) },
				"specular" : { value: new Color( 0x111111 ) },
				"shininess": { value: 30 }
			}

		] ),

		vertexShader: ShaderChunk[ 'meshphong_vert' ],
		fragmentShader: ShaderChunk[ 'meshphong_frag' ]

	},

	'standard': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'aomap' ],
			UniformsLib[ 'lightmap' ],
			UniformsLib[ 'emissivemap' ],
			UniformsLib[ 'bumpmap' ],
			UniformsLib[ 'normalmap' ],
			UniformsLib[ 'displacementmap' ],
			UniformsLib[ 'roughnessmap' ],
			UniformsLib[ 'metalnessmap' ],
			UniformsLib[ 'fog' ],
			UniformsLib[ 'lights' ],

			{
				"emissive" : { value: new Color( 0x000000 ) },
				"roughness": { value: 0.5 },
				"metalness": { value: 0 },
				"envMapIntensity" : { value: 1 }, // temporary
			}

		] ),

		vertexShader: ShaderChunk[ 'meshphysical_vert' ],
		fragmentShader: ShaderChunk[ 'meshphysical_frag' ]

	},

	'points': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'points' ],
			UniformsLib[ 'fog' ]

		] ),

		vertexShader: ShaderChunk[ 'points_vert' ],
		fragmentShader: ShaderChunk[ 'points_frag' ]

	},

	'dashed': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'fog' ],

			{
				"scale"    : { value: 1 },
				"dashSize" : { value: 1 },
				"totalSize": { value: 2 }
			}

		] ),

		vertexShader: ShaderChunk[ 'linedashed_vert' ],
		fragmentShader: ShaderChunk[ 'linedashed_frag' ]

	},

	'depth': {

		uniforms: UniformsUtils.merge( [

			UniformsLib[ 'common' ],
			UniformsLib[ 'displacementmap' ]

		] ),

		vertexShader: ShaderChunk[ 'depth_vert' ],
		fragmentShader: ShaderChunk[ 'depth_frag' ]

	},

	'normal': {

		uniforms: {

			"opacity" : { value: 1.0 }

		},

		vertexShader: ShaderChunk[ 'normal_vert' ],
		fragmentShader: ShaderChunk[ 'normal_frag' ]

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'cube': {

		uniforms: {
			"tCube": { value: null },
			"tFlip": { value: - 1 },
			"opacity": { value: 1.0 }
		},

		vertexShader: ShaderChunk[ 'cube_vert' ],
		fragmentShader: ShaderChunk[ 'cube_frag' ]

	},

	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	'equirect': {

		uniforms: {
			"tEquirect": { value: null },
			"tFlip": { value: - 1 }
		},

		vertexShader: ShaderChunk[ 'equirect_vert' ],
		fragmentShader: ShaderChunk[ 'equirect_frag' ]

	},

	'distanceRGBA': {

		uniforms: {

			"lightPos": { value: new Vector3() }

		},

		vertexShader: ShaderChunk[ 'distanceRGBA_vert' ],
		fragmentShader: ShaderChunk[ 'distanceRGBA_frag' ]

	}

};

ShaderLib[ 'physical' ] = {

	uniforms: UniformsUtils.merge( [

		ShaderLib[ 'standard' ].uniforms,

		{
			"clearCoat": { value: 0 },
			"clearCoatRoughness": { value: 0 }
		}

	] ),

	vertexShader: ShaderChunk[ 'meshphysical_vert' ],
	fragmentShader: ShaderChunk[ 'meshphysical_frag' ]

};


export { ShaderLib };