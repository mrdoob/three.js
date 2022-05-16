export interface BaseEvent {
    type: string;
}

/**
 * Event object.
 */
export interface Event extends BaseEvent {
    target?: any;
    [attachment: string]: any;
}
export type EventListener<E, T, U> = (event: E & { type: T } & { target: U }) => void;

/**
 * JavaScript events for custom objects
 *
 * @source src/core/EventDispatcher.js
 */
export class EventDispatcher<E extends BaseEvent = Event> {
    /**
     * Creates eventDispatcher object. It needs to be call with '.call' to add the functionality to an object.
     */
    constructor();

    /**
     * Adds a listener to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    addEventListener<T extends E['type']>(type: T, listener: EventListener<E, T, this>): void;

    /**
     * Checks if listener is added to an event type.
     * @param type The type of event to listen to.
     * @param listener The function that gets called when the event is fired.
     */
    hasEventListener<T extends E['type']>(type: T, listener: EventListener<E, T, this>): boolean;

    /**
     * Removes a listener from an event type.
     * @param type The type of the listener that gets removed.
     * @param listener The listener function that gets removed.
     */
    removeEventListener<T extends E['type']>(type: T, listener: EventListener<E, T, this>): void;

    /**
     * Fire an event type.
     * @param type The type of event that gets fired.
     */
    dispatchEvent(event: E): void;
}
