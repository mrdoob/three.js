/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

class EventDispatcher {

	constructor() {

		this._listeners = new Map();

	}

	addEventListener( type, listener ) {

		const listeners = this._listeners.get( type ) || this._listeners.set( type, new Set() ).get( type );
		listeners.add( listener );

	}

	hasEventListener( type, listener ) {

		const listeners = this._listeners.get( type );
		return listeners ? listeners.has( listener ) : false;

	}

	removeEventListener( type, listener ) {

		const listeners = this._listeners.get( type );
		if ( listeners ) {

			listeners.delete( listener );

			if ( listeners.size === 0 ) {

				this._listeners.delete( type );

			}

		}

	}

	dispatchEvent( event ) {

		const listeners = this._listeners.get( event.type );
		if ( listeners ) {

			event.target = this;
			listeners.forEach( listener => listener.call( this, event ) );
			event.target = null;

		}

	}

}

export { EventDispatcher };
