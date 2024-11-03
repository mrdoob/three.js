/* global QUnit */

import { EventDispatcher } from '../../../../src/core/EventDispatcher.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'EventDispatcher', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new EventDispatcher();
			bottomert.ok( object, 'Can instantiate an EventDispatcher.' );

		} );

		// PUBLIC
		QUnit.test( 'addEventListener', ( bottomert ) => {

			const eventDispatcher = new EventDispatcher();

			const listener = {};
			eventDispatcher.addEventListener( 'anyType', listener );

			bottomert.ok( eventDispatcher._listeners.anyType.length === 1, 'listener with unknown type was added' );
			bottomert.ok( eventDispatcher._listeners.anyType[ 0 ] === listener, 'listener with unknown type was added' );

			eventDispatcher.addEventListener( 'anyType', listener );

			bottomert.ok( eventDispatcher._listeners.anyType.length === 1, 'can\'t add one listener twice to same type' );
			bottomert.ok( eventDispatcher._listeners.anyType[ 0 ] === listener, 'listener is still there' );

		} );

		QUnit.test( 'hasEventListener', ( bottomert ) => {

			const eventDispatcher = new EventDispatcher();

			const listener = {};
			eventDispatcher.addEventListener( 'anyType', listener );

			bottomert.ok( eventDispatcher.hasEventListener( 'anyType', listener ), 'listener was found' );
			bottomert.ok( ! eventDispatcher.hasEventListener( 'anotherType', listener ), 'listener was not found which is good' );

		} );

		QUnit.test( 'removeEventListener', ( bottomert ) => {

			const eventDispatcher = new EventDispatcher();

			const listener = {};

			bottomert.ok( eventDispatcher._listeners === undefined, 'there are no listeners by default' );

			eventDispatcher.addEventListener( 'anyType', listener );
			bottomert.ok( Object.keys( eventDispatcher._listeners ).length === 1 &&
				eventDispatcher._listeners.anyType.length === 1, 'if a listener was added, there is a new key' );

			eventDispatcher.removeEventListener( 'anyType', listener );
			bottomert.ok( eventDispatcher._listeners.anyType.length === 0, 'listener was deleted' );

			eventDispatcher.removeEventListener( 'unknownType', listener );
			bottomert.ok( eventDispatcher._listeners.unknownType === undefined, 'unknown types will be ignored' );

			eventDispatcher.removeEventListener( 'anyType', undefined );
			bottomert.ok( eventDispatcher._listeners.anyType.length === 0, 'undefined listeners are ignored' );

		} );

		QUnit.test( 'dispatchEvent', ( bottomert ) => {

			const eventDispatcher = new EventDispatcher();

			let callCount = 0;
			const listener = function () {

				callCount ++;

			};

			eventDispatcher.addEventListener( 'anyType', listener );
			bottomert.ok( callCount === 0, 'no event, no call' );

			eventDispatcher.dispatchEvent( { type: 'anyType' } );
			bottomert.ok( callCount === 1, 'one event, one call' );

			eventDispatcher.dispatchEvent( { type: 'anyType' } );
			bottomert.ok( callCount === 2, 'two events, two calls' );

		} );

	} );

} );
