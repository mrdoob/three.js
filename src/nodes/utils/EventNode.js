import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { nodeObject } from '../tsl/TSLCore.js';

class EventNode extends Node {

	static get type() {

		return 'EventNode';

	}

	constructor( eventType, callback ) {

		super( 'void' );

		this.eventType = eventType;
		this.callback = callback;

		if ( eventType === EventNode.OBJECT ) {

			this.updateType = NodeUpdateType.OBJECT;

		} else if ( eventType === EventNode.MATERIAL ) {

			this.updateType = NodeUpdateType.RENDER;

		}

	}

	update( frame ) {

		this.callback( frame );

	}

}

EventNode.OBJECT = 'object';
EventNode.MATERIAL = 'material';

export default EventNode;

const createEvent = ( type, callback ) => nodeObject( new EventNode( type, callback ) ).toStack();

export const OnObjectUpdate = ( callback ) => createEvent( EventNode.OBJECT, callback );
export const OnMaterialUpdate = ( callback ) => createEvent( EventNode.MATERIAL, callback );
