import {
	decomposeCovariance,
	linearToSH0,
	sh0ToLinear,
	sigmoid,
	writeCovariance
} from '../../../../examples/jsm/utils/GaussianSplatUtils.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'GaussianSplatUtils', () => {

			QUnit.test( 'converts degree-0 spherical harmonics and linear color', ( assert ) => {

				closeTo( assert, sh0ToLinear( 0 ), 0.5, 'zero coefficient maps to biased half' );
				closeTo( assert, linearToSH0( 0.5 ), 0, 'biased half maps to zero coefficient' );
				closeTo( assert, sh0ToLinear( linearToSH0( 0.25 ) ), 0.25, 'color round-trips through SH0' );

			} );

			QUnit.test( 'applies sigmoid activation', ( assert ) => {

				closeTo( assert, sigmoid( 0 ), 0.5, 'zero maps to half' );
				closeTo( assert, sigmoid( Math.log( 3 ) ), 0.75, 'logit maps to expected value' );

			} );

			QUnit.test( 'decomposes covariance into scale and rotation', ( assert ) => {

				const covariance = new Float32Array( 6 );
				const scales = new Float32Array( 3 );
				const rotations = new Float32Array( 4 );
				const roundTrip = new Float32Array( 6 );

				writeCovariance( covariance, 0, 2, 3, 4, 0, 0, 0, 1 );
				decomposeCovariance( covariance, 0, scales, rotations, 0 );
				writeCovariance( roundTrip, 0, scales[ 0 ], scales[ 1 ], scales[ 2 ], rotations[ 0 ], rotations[ 1 ], rotations[ 2 ], rotations[ 3 ] );

				closeTo( assert, roundTrip[ 0 ], covariance[ 0 ], 'xx covariance' );
				closeTo( assert, roundTrip[ 1 ], covariance[ 1 ], 'xy covariance' );
				closeTo( assert, roundTrip[ 2 ], covariance[ 2 ], 'xz covariance' );
				closeTo( assert, roundTrip[ 3 ], covariance[ 3 ], 'yy covariance' );
				closeTo( assert, roundTrip[ 4 ], covariance[ 4 ], 'yz covariance' );
				closeTo( assert, roundTrip[ 5 ], covariance[ 5 ], 'zz covariance' );

			} );

		} );

	} );

} );
