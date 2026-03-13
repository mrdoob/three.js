/**
 * This modules allows to dispatch event objects on custom JavaScript objects.
 *
 * Main repository: [eventdispatcher.js](https://github.com/mrdoob/eventdispatcher.js/)
 *
 * Code Example:
 * ```js
 * class Car extends EventDispatcher {
 * 	start() {
 *		this.dispatchEvent( { type: 'start', message: 'vroom vroom!' } );
 *	}
 *};
 *
 * // Using events with the custom object
 * const car = new Car();
 * car.addEventListener( 'start', function ( event ) {
 * 	alert( event.message );
 * } );
 *
 * car.start();
 * ```
 */
class EventDispatcher {

	constructor() {

		/**
		 * A collection of event listener functions, organized by event type.
		 *
		 * @type {Map<string, Function>}
		 */
		this._listenerFunctions = new Map();

		/**
		 * A collection of event listener objects, organized by event type.
		 *
		 * @type {Map<string, object>}
		 */
		this._listenerObjects = new Map();

	}

	/**
	 * Adds the given event listener to the given event type.
	 *
	 * @param {string} type - The type of event to listen to.
	 * @param {Function|object} listener - The function that gets called when the event is fired.
	 */
	addEventListener( type, listener ) {

		const m = ( typeof listener === 'function' ) ? this._listenerFunctions : this._listenerObjects;

		if ( m.has( type ) ) {

			m.get( type ).add( listener );

		} else {

			m.set( type, new Set( [ listener ] ) );

		}

	}

	/**
	 * Returns `true` if the given event listener has been added to the given event type.
	 *
	 * @param {string} type - The type of event.
	 * @param {Function|object} listener - The listener to check.
	 * @return {boolean} Whether the given event listener has been added to the given event type.
	 */
	hasEventListener( type, listener ) {

		const m = ( typeof listener === 'function' ) ? this._listenerFunctions : this._listenerObjects;

		if ( ! m.has( type ) ) {

			return false;

		}

		return m.get( type ).has( listener );

	}

	/**
	 * Removes the given event listener from the given event type.
	 *
	 * @param {string} type - The type of event.
	 * @param {Function} listener - The listener to remove.
	 */
	removeEventListener( type, listener ) {

		const m = ( typeof listener === 'function' ) ? this._listenerFunctions : this._listenerObjects;

		if ( ! m.has( type ) ) {

			return;

		}

		const listeners = m.get( type );

		if ( listeners.delete( listener ) && listeners.size === 0 ) {

			m.delete( type );

		}

	}

	/**
	 * Dispatches an event object.
	 *
	 * @param {Object} event - The event that gets fired.
	 */
	dispatchEvent( event ) {

		const listenerFunctions = this._listenerFunctions;
		const listenerObjects = this._listenerObjects;

		event.target = this;

		if ( listenerFunctions.has( event.type ) ) {

			const listeners = listenerFunctions.get( event.type );

			for ( const listener of listeners ) {

				listener.call( this, event );

			}

		}

		if ( listenerObjects.has( event.type ) ) {

			const listeners = listenerObjects.get( event.type );

			for ( const listener of listeners ) {

				listener.handleEvent( event );

			}

		}

	}

}

export { EventDispatcher };
