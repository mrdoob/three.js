/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

THREE.EventDispatcher = function () {

	var listeners = {};

	this.addEventListener = function ( type, listener ) {

		var listenersForType = listeners[ type ];
		if ( listenersForType === undefined ) {

			listenersForType = [];
			listeners[ type ] = listenersForType;

		}

		if ( listenersForType.indexOf( listener ) === - 1 ) {

			listenersForType.push( listener );

		}

	};

	this.hasEventListener = function ( type, listener ) {

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	};

	this.removeEventListener = function ( type, listener ) {

		var listenersForType = listeners[ type ];

		if ( listenersForType !== undefined ) {

			var index = listenersForType.indexOf( listener );

			if ( index !== - 1 ) {

				listenersForType.splice( index, 1 );

			}

		}

	};

	this.dispatchEvent = function ( event ) {

		var listenersForType = listeners[ event.type ];

		if ( listenersForType !== undefined ) {

			var array = [];
			var length = listenersForType.length;

			for ( var i = 0; i < length; i ++ ) {

				array[ i ] = listenersForType[ i ];

			}

			for ( var i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	};


	this.exposePublicAPIOnObject = function ( object ) {

		object.addEventListener = this.addEventListener;
		object.hasEventListener = this.hasEventListener;
		object.removeEventListener = this.removeEventListener;

	};
}

};
