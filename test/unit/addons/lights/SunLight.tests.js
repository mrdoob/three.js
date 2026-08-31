import { getSunPosition } from '../../../../examples/jsm/lights/SunLight.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lights', () => {

		QUnit.module( 'SunLight', () => {

			QUnit.test( 'getSunPosition', ( assert ) => {

				// NREL SPA reference case, adapted to geometric elevation without atmospheric refraction.
				const position = getSunPosition(
					new Date( '2003-10-17T19:30:30Z' ),
					39.742476,
					- 105.1786
				);

				assert.ok(
					Math.abs( position.elevation - 39.8721 ) < 0.01,
					'Calculates the reference elevation'
				);
				assert.ok(
					Math.abs( position.azimuth - 194.3402 ) < 0.01,
					'Calculates the reference azimuth'
				);

			} );

			QUnit.test( 'getSunPosition cardinal directions', ( assert ) => {

				const morning = getSunPosition( new Date( '2025-03-20T06:00:00Z' ), 0, 0 );
				const evening = getSunPosition( new Date( '2025-03-20T18:00:00Z' ), 0, 0 );

				assert.ok( Math.abs( morning.azimuth - 90 ) < 2, 'The morning sun is in the east' );
				assert.ok( Math.abs( evening.azimuth - 270 ) < 2, 'The evening sun is in the west' );

			} );

			QUnit.test( 'getSunPosition polar coordinates', ( assert ) => {

				const northPole = getSunPosition( new Date( '2025-06-21T12:00:00Z' ), 90, 0 );
				const southPole = getSunPosition( new Date( '2025-12-21T12:00:00Z' ), - 90, 0 );

				assert.ok( Number.isFinite( northPole.elevation ), 'North-pole elevation is finite' );
				assert.ok( Number.isFinite( northPole.azimuth ), 'North-pole azimuth is finite' );
				assert.ok( Number.isFinite( southPole.elevation ), 'South-pole elevation is finite' );
				assert.ok( Number.isFinite( southPole.azimuth ), 'South-pole azimuth is finite' );

			} );

		} );

	} );

} );
