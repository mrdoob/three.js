import {
	BufferGeometry,
	BufferAttribute,
	LineBasicMaterial,
	Line,
	MathUtils
} from 'three';

/**
 * This helper displays the directional cone of a positional audio.
 *
 * `PositionalAudioHelper` must be added as a child of the positional audio.
 *
 * ```js
 * const positionalAudio = new THREE.PositionalAudio( listener );
 * positionalAudio.setDirectionalCone( 180, 230, 0.1 );
 * scene.add( positionalAudio );
 *
 * const helper = new PositionalAudioHelper( positionalAudio );
 * positionalAudio.add( helper );
 * ```
 *
 * @augments Line
 * @three_import import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
 */
class PositionalAudioHelper extends Line {

	/**
	 * Constructs a new positional audio helper.
	 *
	 * @param {PositionalAudio} audio - The audio to visualize.
	 * @param {number} [range=1] - The range of the directional cone.
	 * @param {number} [divisionsInnerAngle=16] - The number of divisions of the inner part of the directional cone.
	 * @param {number} [divisionsOuterAngle=2] The number of divisions of the outer part of the directional cone.
	 */
	constructor( audio, range = 1, divisionsInnerAngle = 16, divisionsOuterAngle = 2 ) {

		const geometry = new BufferGeometry();
		const divisions = divisionsInnerAngle + divisionsOuterAngle * 2;
		const positions = new Float32Array( ( divisions * 3 + 3 ) * 3 );
		geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );

		const materialInnerAngle = new LineBasicMaterial( { color: 0x00ff00 } );
		const materialOuterAngle = new LineBasicMaterial( { color: 0xffff00 } );

		super( geometry, [ materialOuterAngle, materialInnerAngle ] );

		/**
		 * The audio to visualize.
		 *
		 * @type {PositionalAudio}
		 */
		this.audio = audio;

		/**
		 * The range of the directional cone.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.range = range;

		/**
		 * The number of divisions of the inner part of the directional cone.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.divisionsInnerAngle = divisionsInnerAngle;

		/**
		 * The number of divisions of the outer part of the directional cone.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.divisionsOuterAngle = divisionsOuterAngle;

		this.type = 'PositionalAudioHelper';

		this.update();

	}

	/**
	 * Updates the helper. This method must be called whenever the directional cone
	 * of the positional audio is changed.
	 */
	update() {

		const audio = this.audio;
		const range = this.range;
		const divisionsInnerAngle = this.divisionsInnerAngle;
		const divisionsOuterAngle = this.divisionsOuterAngle;

		const coneInnerAngle = MathUtils.degToRad( audio.panner.coneInnerAngle );
		const coneOuterAngle = MathUtils.degToRad( audio.panner.coneOuterAngle );

		const halfConeInnerAngle = coneInnerAngle / 2;
		const halfConeOuterAngle = coneOuterAngle / 2;

		let start = 0;
		let count = 0;
		let i;
		let stride;

		const geometry = this.geometry;
		const positionAttribute = geometry.attributes.position;

		geometry.clearGroups();

		//

		function generateSegment( from, to, divisions, materialIndex ) {

			const step = ( to - from ) / divisions;

			positionAttribute.setXYZ( start, 0, 0, 0 );
			count ++;

			for ( i = from; i < to; i += step ) {

				stride = start + count;

				positionAttribute.setXYZ( stride, Math.sin( i ) * range, 0, Math.cos( i ) * range );
				positionAttribute.setXYZ( stride + 1, Math.sin( Math.min( i + step, to ) ) * range, 0, Math.cos( Math.min( i + step, to ) ) * range );
				positionAttribute.setXYZ( stride + 2, 0, 0, 0 );

				count += 3;

			}

			geometry.addGroup( start, count, materialIndex );

			start += count;
			count = 0;

		}

		//

		generateSegment( - halfConeOuterAngle, - halfConeInnerAngle, divisionsOuterAngle, 0 );
		generateSegment( - halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1 );
		generateSegment( halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0 );

		//

		positionAttribute.needsUpdate = true;

		if ( coneInnerAngle === coneOuterAngle ) this.material[ 0 ].visible = false;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material[ 0 ].dispose();
		this.material[ 1 ].dispose();

	}

}


export { PositionalAudioHelper };
