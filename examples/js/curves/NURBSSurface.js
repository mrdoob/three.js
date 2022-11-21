( function () {

	/**
 * NURBS surface object
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 **/

	class NURBSSurface {

		constructor( degree1, degree2, knots1, knots2 /* arrays of reals */, controlPoints /* array^2 of Vector(2|3|4) */ ) {

			this.degree1 = degree1;
			this.degree2 = degree2;
			this.knots1 = knots1;
			this.knots2 = knots2;
			this.controlPoints = [];
			const len1 = knots1.length - degree1 - 1;
			const len2 = knots2.length - degree2 - 1;

			// ensure THREE.Vector4 for control points
			for ( let i = 0; i < len1; ++ i ) {

				this.controlPoints[ i ] = [];
				for ( let j = 0; j < len2; ++ j ) {

					const point = controlPoints[ i ][ j ];
					this.controlPoints[ i ][ j ] = new THREE.Vector4( point.x, point.y, point.z, point.w );

				}

			}

		}
		getPoint( t1, t2, target ) {

			const u = this.knots1[ 0 ] + t1 * ( this.knots1[ this.knots1.length - 1 ] - this.knots1[ 0 ] ); // linear mapping t1->u
			const v = this.knots2[ 0 ] + t2 * ( this.knots2[ this.knots2.length - 1 ] - this.knots2[ 0 ] ); // linear mapping t2->u

			THREE.NURBSUtils.calcSurfacePoint( this.degree1, this.degree2, this.knots1, this.knots2, this.controlPoints, u, v, target );

		}

	}

	THREE.NURBSSurface = NURBSSurface;

} )();
