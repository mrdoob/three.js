/**
 * https://github.com/mrdoob/eventtarget.js/
 */

THREE.EventTarget = function () {

	var listeners = {};

	this.addEventListener = function ( type, listener ) {

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	};


	this.dispatchEvent = function ( event ) {

		var listener, i, length, ref;

		ref = listeners[ event.type ];
		
		for (i = 0, length = ref.length; i < length; i++) {
		
			listener = ref[ i ];
		
			listener( event );

		}

	};


	this.removeEventListener = function ( type, listener ) {

		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	};

};
