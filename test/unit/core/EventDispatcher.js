/**
 * @author simonThiele / https://github.com/simonThiele
 */

module( "EventDispatcher" );

test( "apply", function() {
	var innocentObject = {};
	var eventDispatcher = new THREE.EventDispatcher();

	eventDispatcher.apply( innocentObject );

	ok( innocentObject.addEventListener !== undefined &&
			innocentObject.hasEventListener !== undefined &&
		innocentObject.removeEventListener !== undefined &&
		innocentObject.dispatchEvent !== undefined, "events where added to object" );
});

test( "addEventListener", function() {
	var eventDispatcher = new THREE.EventDispatcher();

	var listener = {};
	eventDispatcher.addEventListener( 'anyType', listener );

	ok( eventDispatcher._listeners.anyType.length === 1, "listener with unknown type was added" );
	ok( eventDispatcher._listeners.anyType[0] === listener, "listener with unknown type was added" );

	eventDispatcher.addEventListener( 'anyType', listener );

	ok( eventDispatcher._listeners.anyType.length === 1, "can't add one listener twice to same type" );
	ok( eventDispatcher._listeners.anyType[0] === listener, "listener is still there" );
});

test( "hasEventListener", function() {
	var eventDispatcher = new THREE.EventDispatcher();

	var listener = {};
	eventDispatcher.addEventListener( 'anyType', listener );

	ok( eventDispatcher.hasEventListener( 'anyType', listener ), "listener was found" );
	ok( !eventDispatcher.hasEventListener( 'anotherType', listener ), "listener was not found which is good" );
});

test( "removeEventListener", function() {
	var eventDispatcher = new THREE.EventDispatcher();

	var listener = {};

	ok ( eventDispatcher._listeners === undefined, "there are no listeners by default" );

	eventDispatcher.addEventListener( 'anyType', listener );
	ok ( Object.keys( eventDispatcher._listeners ).length === 1 &&
		eventDispatcher._listeners.anyType.length === 1, "if a listener was added, there is a new key" );

	eventDispatcher.removeEventListener( 'anyType', listener );
	ok ( eventDispatcher._listeners.anyType.length === 0, "listener was deleted" );

	eventDispatcher.removeEventListener( 'unknownType', listener );
	ok ( eventDispatcher._listeners.unknownType === undefined, "unknown types will be ignored" );

	eventDispatcher.removeEventListener( 'anyType', undefined );
	ok ( eventDispatcher._listeners.anyType.length === 0, "undefined listeners are ignored" );
});

test( "dispatchEvent", function() {
	var eventDispatcher = new THREE.EventDispatcher();

	var callCount = 0;
	var listener = function() { callCount++; };

	eventDispatcher.addEventListener( 'anyType', listener );
	ok( callCount === 0, "no event, no call" );

	eventDispatcher.dispatchEvent( { type: 'anyType' } );
	ok( callCount === 1, "one event, one call" );

	eventDispatcher.dispatchEvent( { type: 'anyType' } );
	ok( callCount === 2, "two events, two calls" );
});








//
