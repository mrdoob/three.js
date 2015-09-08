/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = function () {

	if ( self.requestAnimationFrame === undefined || self.cancelAnimationFrame === undefined ) {

		// Missing in Android stock browser.

		( function () {

			var x, lastTime = 0;
			var vendors = [ "ms", "moz", "webkit", "o" ];

			if ( self.requestAnimationFrame === undefined ) {

				for ( x = 0; x < vendors.length; ++ x ) {

					self.requestAnimationFrame = self[ vendors[ x ] + "RequestAnimationFrame" ];
					self.cancelAnimationFrame = self[ vendors[ x ] + "CancelAnimationFrame" ] || self[ vendors[ x ] + "CancelRequestAnimationFrame" ];

				}

			}

			if ( self.requestAnimationFrame === undefined && self.setTimeout !== undefined ) {

				self.requestAnimationFrame = function ( callback ) {

					var id, currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );

					lastTime = currTime + timeToCall;

					id = self.setTimeout( function () {

						callback( lastTime );

					}, timeToCall );

					return id;

				};

			}

			if ( self.cancelAnimationFrame === undefined && self.clearTimeout !== undefined ) {

				self.cancelAnimationFrame = function ( id ) {

					self.clearTimeout( id );

				};

			}

		}() );

	}

	if ( Math.sign === undefined ) {

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

		Math.sign = function ( x ) {

			return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

		};

	}

	if ( Function.prototype.name === undefined && Object.defineProperty !== undefined ) {

		// Missing in IE9-11.
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

		Object.defineProperty( Function.prototype, "name", {

			get: function () {

				return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];

			}

		} );

	}

};
