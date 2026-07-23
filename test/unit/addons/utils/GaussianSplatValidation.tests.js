import {
	computeGaussianSplatEllipse,
	projectGaussianSplatCovarianceToEllipse
} from '../../../../examples/jsm/utils/GaussianSplatValidation.js';

const EPS = 1e-6;

function closeTo( assert, actual, expected, message ) {

	assert.ok( Math.abs( actual - expected ) < EPS, `${ message }: ${ actual } ~= ${ expected }` );

}

function axisCloseTo( assert, actual, expected, message ) {

	closeTo( assert, actual[ 0 ], expected[ 0 ], `${ message } x` );
	closeTo( assert, actual[ 1 ], expected[ 1 ], `${ message } y` );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'GaussianSplatValidation', () => {

			QUnit.test( 'computeGaussianSplatEllipse circular covariance', ( assert ) => {

				const ellipse = computeGaussianSplatEllipse( 4, 0, 4 );

				closeTo( assert, ellipse.lambda1, 4, 'lambda1' );
				closeTo( assert, ellipse.lambda2, 4, 'lambda2' );
				axisCloseTo( assert, ellipse.axis1, [ 1, 0 ], 'axis1' );
				axisCloseTo( assert, ellipse.axis2, [ 0, 1 ], 'axis2' );

			} );

			QUnit.test( 'computeGaussianSplatEllipse axis-aligned covariance', ( assert ) => {

				const horizontal = computeGaussianSplatEllipse( 9, 0, 1 );
				const vertical = computeGaussianSplatEllipse( 1, 0, 9 );

				closeTo( assert, horizontal.lambda1, 9, 'horizontal lambda1' );
				closeTo( assert, horizontal.lambda2, 1, 'horizontal lambda2' );
				axisCloseTo( assert, horizontal.axis1, [ 1, 0 ], 'horizontal axis1' );

				closeTo( assert, vertical.lambda1, 9, 'vertical lambda1' );
				closeTo( assert, vertical.lambda2, 1, 'vertical lambda2' );
				axisCloseTo( assert, vertical.axis1, [ 0, 1 ], 'vertical axis1' );

			} );

			QUnit.test( 'computeGaussianSplatEllipse rotated covariance', ( assert ) => {

				const ellipse = computeGaussianSplatEllipse( 5, 4, 5 );
				const axis = Math.SQRT1_2;

				closeTo( assert, ellipse.lambda1, 9, 'lambda1' );
				closeTo( assert, ellipse.lambda2, 1, 'lambda2' );
				axisCloseTo( assert, ellipse.axis1, [ axis, axis ], '45 degree axis1' );
				axisCloseTo( assert, ellipse.axis2, [ - axis, axis ], '45 degree axis2' );

			} );

			QUnit.test( 'computeGaussianSplatEllipse near-circular continuity', ( assert ) => {

				const a = 1.00002;
				const c = 1;
				const left = computeGaussianSplatEllipse( a, - 0.000001, c );
				const center = computeGaussianSplatEllipse( a, 0, c );
				const right = computeGaussianSplatEllipse( a, 0.000001, c );

				const dotLeft = Math.abs( left.axis1[ 0 ] * center.axis1[ 0 ] + left.axis1[ 1 ] * center.axis1[ 1 ] );
				const dotRight = Math.abs( right.axis1[ 0 ] * center.axis1[ 0 ] + right.axis1[ 1 ] * center.axis1[ 1 ] );

				assert.ok( dotLeft > 0.995, 'axis remains continuous for small negative xy covariance' );
				assert.ok( dotRight > 0.995, 'axis remains continuous for small positive xy covariance' );
				assert.ok( Math.abs( left.lambda1 - right.lambda1 ) < EPS, 'lambda1 is symmetric around zero xy covariance' );
				assert.ok( Math.abs( left.lambda2 - right.lambda2 ) < EPS, 'lambda2 is symmetric around zero xy covariance' );

			} );

			QUnit.test( 'projectGaussianSplatCovarianceToEllipse edge-on depth covariance', ( assert ) => {

				const covariance = [ 0.01, 0, 0, 0.01, 0, 1 ];
				const near = projectGaussianSplatCovarianceToEllipse( [ 0, 0, - 2 ], covariance, [ 1, 1 ], 0 );
				const far = projectGaussianSplatCovarianceToEllipse( [ 0, 0, - 4 ], covariance, [ 1, 1 ], 0 );

				closeTo( assert, near.lambda1, near.lambda2, 'centered depth-axis covariance projects to a circle' );
				closeTo( assert, far.lambda1, far.lambda2, 'far centered depth-axis covariance projects to a circle' );
				closeTo( assert, near.lambda1 / far.lambda1, 4, 'projected variance scales with inverse squared depth' );

			} );

			QUnit.test( 'projectGaussianSplatCovarianceToEllipse mirrored off-axis covariance', ( assert ) => {

				const left = projectGaussianSplatCovarianceToEllipse(
					[ - 0.35, 0.2, - 3 ],
					[ 0.08, 0.01, - 0.12, 0.03, 0.02, 0.4 ],
					[ 1, 1 ],
					0
				);
				const right = projectGaussianSplatCovarianceToEllipse(
					[ 0.35, 0.2, - 3 ],
					[ 0.08, - 0.01, 0.12, 0.03, 0.02, 0.4 ],
					[ 1, 1 ],
					0
				);

				closeTo( assert, left.lambda1, right.lambda1, 'mirrored major variance is stable' );
				closeTo( assert, left.lambda2, right.lambda2, 'mirrored minor variance is stable' );
				closeTo( assert, Math.abs( left.axis1[ 0 ] ), Math.abs( right.axis1[ 0 ] ), 'mirrored axis x magnitude is stable' );
				closeTo( assert, Math.abs( left.axis1[ 1 ] ), Math.abs( right.axis1[ 1 ] ), 'mirrored axis y magnitude is stable' );

			} );

			QUnit.test( 'projectGaussianSplatCovarianceToEllipse front and back edge-on splats', ( assert ) => {

				const near = projectGaussianSplatCovarianceToEllipse(
					[ 0, 0, - 2 ],
					[ 0.01, 0, 0, 0.01, 0, 0.16 ],
					[ 1, 1 ],
					0
				);
				const far = projectGaussianSplatCovarianceToEllipse(
					[ 0, 0, - 4 ],
					[ 0.01, 0, 0, 0.01, 0, 0.16 ],
					[ 1, 1 ],
					0
				);

				closeTo( assert, near.lambda1, near.lambda2, 'near edge-on splat is circular' );
				closeTo( assert, far.lambda1, far.lambda2, 'far edge-on splat is circular' );
				axisCloseTo( assert, near.axis1, far.axis1, 'near and far edge-on axes match' );

			} );

		} );

	} );

} );
