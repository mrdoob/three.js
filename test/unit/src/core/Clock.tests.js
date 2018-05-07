/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Clock } from '../../../../src/core/Clock';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Clock', () => {

		function mockPerformance() {

			self.performance = {
				deltaTime: 0,

				next: function ( delta ) {

					this.deltaTime += delta;

				},

				now: function () {

					return this.deltaTime;

				}

			};

		}

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "start", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "stop", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getElapsedTime", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getDelta", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( "clock with performance", ( assert ) => {

			if ( typeof performance === 'undefined' ) {

				assert.expect( 0 );
				return;

			}

			mockPerformance();

			var clock = new Clock( false );

			clock.start();

			self.performance.next( 123 );
			assert.numEqual( clock.getElapsedTime(), 0.123, "okay" );

			self.performance.next( 100 );
			assert.numEqual( clock.getElapsedTime(), 0.223, "okay" );

			clock.stop();

			self.performance.next( 1000 );
			assert.numEqual( clock.getElapsedTime(), 0.223, "don't update time if the clock was stopped" );

		} );

	} );

} );
