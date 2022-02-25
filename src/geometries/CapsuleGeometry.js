import { Path } from '../extras/core/Path';
import { LatheGeometry } from './LatheGeometry';

class CapsuleGeometry extends LatheGeometry {

	constructor( radius = 1, length = 1, capSegments = 4, radialSegments = 8 ) {

		const R1 = 0;
		// max here prevents failing when height is 0
		const a = Math.asin( R1 / Math.max( Number.EPSILON, length ) );

		const path = new Path();
		path.absarc( 0, 0, radius, Math.PI * 1.5, a );
		path.absarc( 0, length, radius, a, Math.PI * 0.5 );

		super( path.getPoints( capSegments ), radialSegments );

		this.translate( 0, - length / 2, 0 );

		this.type = 'CapsuleGeometry';

		this.parameters = {
			radius: radius,
			height: length,
			capSegments: capSegments,
			radialSegments: radialSegments,
		};

	}

	static fromJSON( data ) {

		return new CapsuleGeometry( data.radius, data.length, data.capSegments, data.radialSegments );

	}

}

export { CapsuleGeometry, CapsuleGeometry as CapsuleBufferGeometry };
