import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'EventDispatcher', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new EventDispatcher();
			assert.ok( object, 'Can instantiate an EventDispatcher.' );

		} );

		// PUBLIC
		QUnit.test( 'addEventListener', ( assert ) => {

			const eventDispatcher = new EventDispatcher();
			const listener = () => {};

			assert.ok( ! eventDispatcher.hasEventListener( 'test', listener ), 'no listeners have been registered yet' );

			eventDispatcher.addEventListener( 'test', listener );
			assert.ok( eventDispatcher.hasEventListener( 'test', listener ), 'listener was added' );

			eventDispatcher.addEventListener( 'test', listener );
			assert.ok( eventDispatcher.hasEventListener( 'test', listener ), 'listener is still there' );

		} );

		QUnit.test( 'hasEventListener', ( assert ) => {

			const eventDispatcher = new EventDispatcher();
			const listener = () => {};

			eventDispatcher.addEventListener( 'test', listener );

			assert.ok( eventDispatcher.hasEventListener( 'test', listener ), 'listener was found' );
			assert.ok( ! eventDispatcher.hasEventListener( 'other', listener ), 'no listeners exists for this type' );

		} );

		QUnit.test( 'removeEventListener', ( assert ) => {

			const eventDispatcher = new EventDispatcher();
			const listener = () => {};

			eventDispatcher.addEventListener( 'test', listener );
			assert.ok( eventDispatcher.hasEventListener( 'test', listener ), 'listener exists' );

			eventDispatcher.removeEventListener( 'test', listener );
			assert.ok( ! eventDispatcher.hasEventListener( 'test', listener ), 'listener is gone' );

			eventDispatcher.removeEventListener( 'unknown', listener );
			assert.ok( ! eventDispatcher.hasEventListener( 'unknown', listener ), 'no listeners exists for this type' );

			eventDispatcher.addEventListener( 'test', listener );
			eventDispatcher.removeEventListener( 'test', undefined );
			assert.ok( eventDispatcher.hasEventListener( 'test', listener ), 'undefined listeners are ignored' );

		} );

		QUnit.test( 'dispatchEvent', ( assert ) => {

			const eventDispatcher = new EventDispatcher();

			eventDispatcher.addEventListener( 'test', function ( event ) {

				assert.equal( event.type, 'test', 'does not get called for other event types' );
				assert.equal( event.target, eventDispatcher, 'listener gets called' );

			} );

			eventDispatcher.addEventListener( 'test', {

				handleEvent( event ) {

					assert.equal( event.type, 'test', 'does not get called for other event types' );
					assert.equal( event.target, eventDispatcher, 'handleEvent gets called' );

				}

			} );

			eventDispatcher.dispatchEvent( { type: 'test' } );
			eventDispatcher.dispatchEvent( { type: 'ignore' } );

		} );

		QUnit.test( 'dispatchEvent call count', ( assert ) => {

			const eventDispatcher = new EventDispatcher();

			let callCount = 0;
			const listener = function () {

				callCount ++;

			};

			eventDispatcher.addEventListener( 'test', listener );
			assert.equal( callCount, 0, 'no event, no call' );

			eventDispatcher.dispatchEvent( { type: 'test' } );
			assert.equal( callCount, 1, 'one event, one call' );

			eventDispatcher.dispatchEvent( { type: 'test' } );
			assert.equal( callCount, 2, 'two events, two calls' );

		} );

		QUnit.test( 'removeEventListener during dispatchEvent', ( assert ) => {

			const eventDispatcher = new EventDispatcher();

			const listener1 = () => {

				eventDispatcher.removeEventListener( 'test', listener1 );
				eventDispatcher.removeEventListener( 'test', listener2 );

			};

			const listener2 = () => {};

			const listener3 = event => assert.equal( event.target, eventDispatcher, 'can remove listeners during dispatch' );

			eventDispatcher.addEventListener( 'test', listener1 );
			eventDispatcher.addEventListener( 'test', listener2 );
			eventDispatcher.addEventListener( 'test', listener3 );
			eventDispatcher.dispatchEvent( { type: 'test' } );

		} );

		QUnit.test( 'addEventListener during dispatchEvent', ( assert ) => {

			const eventDispatcher = new EventDispatcher();

			const listener1 = event => assert.equal( event.target, eventDispatcher, 'can add listener during dispatch' );
			const listener2 = () => eventDispatcher.addEventListener( 'test', listener1 );

			eventDispatcher.addEventListener( 'test', listener2 );
			eventDispatcher.dispatchEvent( { type: 'test' } );

		} );

	} );

} );
