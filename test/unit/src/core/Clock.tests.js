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
		QUnit.test( 'Instancing', ( assert ) => {

			// no params
			const object = new Clock();
			assert.ok( object, 'Can instantiate a Clock.' );

			// autostart
			const object_all = new Clock( false );
			assert.ok( object_all, 'Can instantiate a Clock with autostart.' );

		} );

		// PROPERTIES
		QUnit.todo( 'autoStart', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'startTime', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'oldTime', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'elapsedTime', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'running', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'start', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stop', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getElapsedTime', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getDelta', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'clock with performance', ( assert ) => {

			if ( typeof performance === 'undefined' ) {

				assert.expect( 0 );
				return;

			}

			mockPerformance();

			const clock = new Clock( false );

			clock.start();

			performance.next( 123 );
			assert.numEqual( clock.getElapsedTime(), 0.123, 'okay' );

			performance.next( 100 );
			assert.numEqual( clock.getElapsedTime(), 0.223, 'okay' );

			clock.stop();

			performance.next( 1000 );
			assert.numEqual( clock.getElapsedTime(), 0.223, 'don\'t update time if the clock was stopped' );

		} );

	} );

} );
