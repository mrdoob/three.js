import { Path } from '../extras/core/Path';
import { LatheGeometry } from './LatheGeometry';

class CapsuleGeometry extends LatheGeometry {

	/**
	 * Creates a CapsuleGeometry.
	 *
	 * @param {number} radiusTop — Radius of the emisphere at the top. Optional; defaults to 1.
	 * @param {number} radiusBottom — Radius of the emisphere at the bottom. Optional; defaults to 1.
	 * @param {number} height — Height of the middle section. Optional; defaults to 1.
	 * @param {number} capSegments — Number of curve segments used to build the caps. Optional; defaults to 4.
	 * @param {number} radialSegments — Number of segmented faces around the circumference of the capsule. Optional; defaults to 8.
	 */
	constructor( radiusTop = 1, radiusBottom = 1, height = 1, capSegments = 4, radialSegments = 8 ) {

		const R1 = radiusTop - radiusBottom;
		// max here prevents failing when height is 0
		const a = Math.asin( R1 / Math.max( Number.EPSILON, height ) );

		const path = new Path();
		path.absarc( 0, 0, radiusTop, Math.PI * 1.5, a );
		path.absarc( 0, height, radiusBottom, a, Math.PI * 0.5 );

		super( path.getPoints( capSegments ), radialSegments );

		this.translate( 0, - height / 2, 0 );

		this.type = 'CapsuleGeometry';

		this.parameters = {
			radiusTop: radiusTop,
			radiusBottom: radiusBottom,
			height: height,
			capSegments: capSegments,
			radialSegments: radialSegments,
		};

	}

	static fromJSON( data ) {

		return new CapsuleGeometry( data.radiusTop, data.radiusBottom, data.height, data.capSegments, data.radialSegments );

	}

}

export { CapsuleGeometry, CapsuleGeometry as CapsuleBufferGeometry };
