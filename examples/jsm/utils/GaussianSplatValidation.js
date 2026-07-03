/**
 * Computes stable ellipse axes and eigenvalues for a symmetric 2D covariance matrix.
 *
 * The input matrix is:
 *
 * ```text
 * | a b |
 * | b c |
 * ```
 *
 * @param {number} a - The xx covariance term.
 * @param {number} b - The xy covariance term.
 * @param {number} c - The yy covariance term.
 * @param {number} [epsilon=1e-12] - Threshold for treating the covariance as circular.
 * @return {Object} The ellipse axes and eigenvalues.
 */
function computeGaussianSplatEllipse( a, b, c, epsilon = 1e-12 ) {

	const halfTrace = ( a + c ) * 0.5;
	const radius = Math.sqrt( Math.max( ( ( a - c ) * 0.5 ) ** 2 + b * b, 0 ) );
	const lambda1 = Math.max( halfTrace + radius, epsilon );
	const lambda2 = Math.max( halfTrace - radius, epsilon );

	if ( radius <= epsilon ) {

		return {
			lambda1,
			lambda2,
			axis1: [ 1, 0 ],
			axis2: [ 0, 1 ]
		};

	}

	const angle = 0.5 * Math.atan2( 2 * b, a - c );
	const cos = Math.cos( angle );
	const sin = Math.sin( angle );

	return {
		lambda1,
		lambda2,
		axis1: [ cos, sin ],
		axis2: [ - sin, cos ]
	};

}

/**
 * Projects a view-space 3D Gaussian covariance to screen-space ellipse data.
 *
 * This mirrors the projection math used by `GaussianSplatMesh` after the
 * covariance has been transformed into view space.
 *
 * @param {Array<number>} viewCenter - The Gaussian center in view space.
 * @param {Array<number>} covariance - Symmetric 3D covariance: xx, xy, xz, yy, yz, zz.
 * @param {Array<number>} [focal=[1,1]] - Pixel-space projection scale for x and y.
 * @param {number} [kernelSize=0.3] - Pixel-space variance added to the diagonal.
 * @return {Object} The projected covariance and ellipse axes.
 */
function projectGaussianSplatCovarianceToEllipse( viewCenter, covariance, focal = [ 1, 1 ], kernelSize = 0.3 ) {

	const x = viewCenter[ 0 ];
	const y = viewCenter[ 1 ];
	const z = Math.min( viewCenter[ 2 ], - 0.01 );
	const invZ = 1 / z;
	const invZ2 = invZ * invZ;

	const j00 = - focal[ 0 ] * invZ;
	const j11 = - focal[ 1 ] * invZ;
	const j02 = focal[ 0 ] * x * invZ2;
	const j12 = focal[ 1 ] * y * invZ2;

	const c00 = covariance[ 0 ];
	const c01 = covariance[ 1 ];
	const c02 = covariance[ 2 ];
	const c11 = covariance[ 3 ];
	const c12 = covariance[ 4 ];
	const c22 = covariance[ 5 ];

	const a = j00 * j00 * c00 + 2 * j00 * j02 * c02 + j02 * j02 * c22 + kernelSize;
	const b = j00 * j11 * c01 + j00 * j12 * c02 + j02 * j11 * c12 + j02 * j12 * c22;
	const c = j11 * j11 * c11 + 2 * j11 * j12 * c12 + j12 * j12 * c22 + kernelSize;

	return {
		a,
		b,
		c,
		...computeGaussianSplatEllipse( a, b, c )
	};

}

export { computeGaussianSplatEllipse, projectGaussianSplatCovarianceToEllipse };
