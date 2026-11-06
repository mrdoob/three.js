import { afterEach, describe, test, vi } from 'vitest';
import { assert } from '../../utils/test-utils.js';

import { Clock } from '../../../../src/core/Clock.js';

describe( 'Core', () => {

	describe( 'Clock', () => {

		afterEach( () => vi.unstubAllGlobals() );

		function mockPerformance() {

			vi.stubGlobal( 'performance', {
				deltaTime: 0,

				next: function ( delta ) {

					this.deltaTime += delta;

				},

				now: function () {

					return this.deltaTime;

				}

			} );

		}

		// INSTANCING
		test( 'Instancing', () => {

			// no params
			const object = new Clock();
			assert.ok( object, 'Can instantiate a Clock.' );

			// autostart
			const object_all = new Clock( false );
			assert.ok( object_all, 'Can instantiate a Clock with autostart.' );

		} );

		// OTHERS
		test( 'clock with performance', () => {

			if ( typeof performance === 'undefined' ) {

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
