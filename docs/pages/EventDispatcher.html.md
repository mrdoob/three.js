# EventDispatcher

This modules allows to dispatch event objects on custom JavaScript objects.

Main repository: [eventdispatcher.js](https://github.com/mrdoob/eventdispatcher.js/)

Code Example:

## Code Example

```js
class Car extends EventDispatcher {
	start() {
		this.dispatchEvent( { type: 'start', message: 'vroom vroom!' } );
	}
};
// Using events with the custom object
const car = new Car();
car.addEventListener( 'start', function ( event ) {
	alert( event.message );
} );
car.start();
```

## Constructor

### new EventDispatcher()

## Methods

### .addEventListener( type : string, listener : function )

Adds the given event listener to the given event type.

**type**

The type of event to listen to.

**listener**

The function that gets called when the event is fired.

### .dispatchEvent( event : Object )

Dispatches an event object.

**event**

The event that gets fired.

### .hasEventListener( type : string, listener : function ) : boolean

Returns `true` if the given event listener has been added to the given event type.

**type**

The type of event.

**listener**

The listener to check.

**Returns:** Whether the given event listener has been added to the given event type.

### .removeEventListener( type : string, listener : function )

Removes the given event listener from the given event type.

**type**

The type of event.

**listener**

The listener to remove.

## Source

[src/core/EventDispatcher.js](https://github.com/mrdoob/three.js/blob/master/src/core/EventDispatcher.js)