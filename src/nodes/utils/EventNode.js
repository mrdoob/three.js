import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';

/**
 * EventNode is a node that executes a callback during specific update phases.
 *
 * @augments Node
 */
class EventNode extends Node {

	static get type() {

		return 'EventNode';

	}

	/**
	 * Creates an EventNode.
	 *
	 * @param {string} eventType - The type of event
	 * @param {Function} callback - The callback to execute on update.
	 */
	constructor( eventType, callback ) {

		super( 'void' );

		this.eventType = eventType;
		this.callback = callback;

		if ( eventType === EventNode.OBJECT ) {

			this.updateType = NodeUpdateType.OBJECT;

		} else if ( eventType === EventNode.MATERIAL ) {

			this.updateType = NodeUpdateType.RENDER;

		} else if ( eventType === EventNode.BEFORE_OBJECT ) {

			this.updateBeforeType = NodeUpdateType.OBJECT;

		} else if ( eventType === EventNode.BEFORE_MATERIAL ) {

			this.updateBeforeType = NodeUpdateType.RENDER;

		}

	}

	update( frame ) {

		this.callback( frame );

	}

	updateBefore( frame ) {

		this.callback( frame );

	}

}

EventNode.OBJECT = 'object';
EventNode.MATERIAL = 'material';
EventNode.BEFORE_OBJECT = 'beforeObject';
EventNode.BEFORE_MATERIAL = 'beforeMaterial';

export default EventNode;

/**
 * Helper to create an EventNode and add it to the stack.
 *
 * @param {string} type - The event type.
 * @param {Function} callback - The callback function.
 * @returns {EventNode}
 */
const createEvent = ( type, callback ) => new EventNode( type, callback ).toStack();

/**
 * Creates an event that triggers a function every time an object (Mesh|Sprite) is rendered.
 *
 * The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.
 *
 * @param {Function} callback - The callback function.
 * @returns {EventNode}
 */
export const OnObjectUpdate = ( callback ) => createEvent( EventNode.OBJECT, callback );

/**
 * Creates an event that triggers a function when the first object that uses the material is rendered.
 *
 * The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.
 *
 * @param {Function} callback - The callback function.
 * @returns {EventNode}
 */
export const OnMaterialUpdate = ( callback ) => createEvent( EventNode.MATERIAL, callback );

/**
 * Creates an event that triggers a function before an object (Mesh|Sprite) is updated.
 *
 * The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.
 *
 * @param {Function} callback - The callback function.
 * @returns {EventNode}
 */
export const OnBeforeObjectUpdate = ( callback ) => createEvent( EventNode.BEFORE_OBJECT, callback );

/**
 * Creates an event that triggers a function before the material is updated.
 *
 * The event will be bound to the declared TSL function `Fn()`; it must be declared within a `Fn()` or the JS function call must be inherited from one.
 *
 * @param {Function} callback - The callback function.
 * @returns {EventNode}
 */
export const OnBeforeMaterialUpdate = ( callback ) => createEvent( EventNode.BEFORE_MATERIAL, callback );
