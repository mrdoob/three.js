import {
	Vector4
} from 'three';
import * as NURBSUtils from '../curves/NURBSUtils.js';

/**
 * NURBS volume object
 *
 * Implementation is based on (x, y, z [, w=1]]) control points with w=weight.
 **/

class NURBSVolume {

	constructor( degree1, degree2, degree3, knots1, knots2, knots3 /* arrays of reals */, controlPoints /* array^3 of Vector(2|3|4) */ ) {

		this.degree1 = degree1;
		this.degree2 = degree2;
		this.degree3 = degree3;
		this.knots1 = knots1;
		this.knots2 = knots2;
		this.knots3 = knots3;
		this.controlPoints = [];

		const len1 = knots1.length - degree1 - 1;
		const len2 = knots2.length - degree2 - 1;
		const len3 = knots3.length - degree3 - 1;

		// ensure Vector4 for control points
		for ( let i = 0; i < len1; ++ i ) {

			this.controlPoints[ i ] = [];

			for ( let j = 0; j < len2; ++ j ) {

				this.controlPoints[ i ][ j ] = [];

				for ( let k = 0; k < len3; ++ k ) {

					const point = controlPoints[ i ][ j ][ k ];
					this.controlPoints[ i ][ j ][ k ] = new Vector4( point.x, point.y, point.z, point.w );

				}

			}

		}

	}

	getPoint( t1, t2, t3, target ) {

		const u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
		const v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->v
		const w = this.knots3[ 0 ] + t3 * ( this.knots3[ this.knots3.length - 1 ] - this.knots3[ 0 ] ); // linear mapping t3->w

		NURBSUtils.calcVolumePoint( this.degree1, this.degree2, this.degree3, this.knots1, this.knots2, this.knots3, this.controlPoints, u, v, w, target );

	}

}

export { NURBSVolume };
