/**
 * Event object.
 */
export interface Event {
	type: string;
	target?: any;
	[attachment: string]: any;
}

/**
 * JavaScript events for custom objects
 *
 * @source src/core/EventDispatcher.js
 */
export class EventDispatcher {

	/**
	 * Creates eventDispatcher object. It needs to be call with '.call' to add the functionality to an object.
	 */
	constructor();

	/**
	 * Adds a listener to an event type.
	 * @param type The type of event to listen to.
	 * @param listener The function that gets called when the event is fired.
	 */
	addEventListener( type: string, listener: ( event: Event ) => void ): void;

	/**
	 * Checks if listener is added to an event type.
	 * @param type The type of event to listen to.
	 * @param listener The function that gets called when the event is fired.
	 */
	hasEventListener( type: string, listener: ( event: Event ) => void ): boolean;

	/**
	 * Removes a listener from an event type.
	 * @param type The type of the listener that gets removed.
	 * @param listener The listener function that gets removed.
	 */
	removeEventListener( type: string, listener: ( event: Event ) => void ): void;

	/**
	 * Fire an event type.
	 * @param type The type of event that gets fired.
	 */
	dispatchEvent( event: { type: string; [attachment: string]: any } ): void;

}
