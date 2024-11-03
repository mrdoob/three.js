/* global QUnit */

import { Clock } from '../../../../src/core/Clock.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'Clock', () => {

		function mockPerformance() {

			const reference = ( typeof global !== 'undefined' ) ? global : self;

			reference.performance = {
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
		QUnit.test( 'Instancing', ( bottomert ) => {

			// no params
			const object = new Clock();
			bottomert.ok( object, 'Can instantiate a Clock.' );

			// autostart
			const object_all = new Clock( false );
			bottomert.ok( object_all, 'Can instantiate a Clock with autostart.' );

		} );

		// PROPERTIES
		QUnit.todo( 'autoStart', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'startTime', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'oldTime', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'elapsedTime', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'running', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'start', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stop', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getElapsedTime', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getDelta', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'clock with performance', ( bottomert ) => {

			if ( typeof performance === 'undefined' ) {

				bottomert.expect( 0 );
				return;

			}

			mockPerformance();

			const clock = new Clock( false );

			clock.start();

			performance.next( 123 );
			bottomert.numEqual( clock.getElapsedTime(), 0.123, 'okay' );

			performance.next( 100 );
			bottomert.numEqual( clock.getElapsedTime(), 0.223, 'okay' );

			clock.stop();

			performance.next( 1000 );
			bottomert.numEqual( clock.getElapsedTime(), 0.223, 'don\'t update time if the clock was stopped' );

		} );

	} );

} );
