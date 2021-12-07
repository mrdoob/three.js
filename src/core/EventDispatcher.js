/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

class EventDispatcher {

	addEventListener( type, listener ) {

		const listeners = this.getEventListeners( type );

		listeners.add( listener );
		
	}

	hasEventListener( type, listener ) {

		return this.getEventListeners( type ).has( listener );

	}

	removeEventListener( type, listener ) {

		this.getEventListeners( type ).remove( listener );

	}

	dispatchEvent( event ) {

		event.target = this;

		const invokeListener = listener => listener.call( this, event ); 

		this.getEventListeners( event.type ).forEach( invokeListener );

		event.target = null;

	}

	getEventListeners( type ) {

		if ( undefined === this._listeners ) {

			this._listeners = new Map();

		}
		
		if ( !this._listeners.has( type ) ) {

			this._listeners.set( type, new Set() );

		}

		return this._listeners.get( type );

	}

}


export { EventDispatcher };
