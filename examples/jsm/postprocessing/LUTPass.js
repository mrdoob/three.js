import { ShaderPass } from './ShaderPass.js';

const LUTShader = {

	name: 'LUTShader',

	uniforms: {

		lut: { value: null },
		lutSize: { value: 0 },

		tDiffuse: { value: null },
		intensity: { value: 1.0 },
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}

	`,

	fragmentShader: /* glsl */`

		uniform float lutSize;
		uniform sampler3D lut;

		varying vec2 vUv;
		uniform float intensity;
		uniform sampler2D tDiffuse;
		void main() {

			vec4 val = texture2D( tDiffuse, vUv );
			vec4 lutVal;

			// pull the sample in by half a pixel so the sample begins
			// at the center of the edge pixels.
			float pixelWidth = 1.0 / lutSize;
			float halfPixelWidth = 0.5 / lutSize;
			vec3 uvw = vec3( halfPixelWidth ) + val.rgb * ( 1.0 - pixelWidth );


			lutVal = vec4( texture( lut, uvw ).rgb, val.a );

			gl_FragColor = vec4( mix( val, lutVal, intensity ) );

		}

	`,

};

/**
 * Pass for color grading via lookup tables.
 *
 * ```js
 * const lutPass = new LUTPass( { lut: lut.texture3D } );
 * composer.addPass( lutPass );
 * ```
 *
 * @augments ShaderPass
 */
class LUTPass extends ShaderPass {

	/**
	 * Constructs a LUT pass.
	 *
	 * @param {{lut:Data3DTexture,intensity:number}} [options={}] - The pass options.
	 */
	constructor( options = {} ) {

		super( LUTShader );

		/**
		 * The LUT as a 3D texture.
		 *
		 * @type {?Data3DTexture}
		 * @default null
		 */
		this.lut = options.lut || null;

		/**
		 * The intensity.
		 *
		 * @type {?number}
		 * @default 1
		 */
		this.intensity = 'intensity' in options ? options.intensity : 1;

	}

	set lut( v ) {

		const material = this.material;

		if ( v !== this.lut ) {

			material.uniforms.lut.value = null;

			if ( v ) {

				material.uniforms.lutSize.value = v.image.width;
				material.uniforms.lut.value = v;

			}

		}

	}

	get lut() {

		return this.material.uniforms.lut.value;

	}

	set intensity( v ) {

		this.material.uniforms.intensity.value = v;

	}

	get intensity() {

		return this.material.uniforms.intensity.value;

	}

}

export { LUTPass };
