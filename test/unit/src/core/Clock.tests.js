/**
 * @author simonThiele / https://github.com/simonThiele
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

		QUnit.test( "clock with performance", ( assert ) => {

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
