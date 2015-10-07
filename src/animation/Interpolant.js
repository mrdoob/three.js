/**
 *
 * Abstract base class for interpolants over timed keyframe values.
 * It handles seeking of the interval and boundary cases. Concrete
 * subclasses then implement the actual intepolation by filling in
 * the Template Methods.
 *
 *
 * @author tschw
 */

THREE.Interpolant = function( times, values, stride, result ) {

	this.times = times;
	this.values = values;
	this.stride = stride;

	this.result = result;

	this.cachedIndex = 0;

};

THREE.Interpolant.prototype = {

	constructor: THREE.Intepolant,

	getAt: function( time ) {

		var times = this.times;
		var index = this.cachedIndex;

		var keyTime = times[ index ];
		var prevKeyTime = times[ index - 1 ];

		change_interval: for (;;) {

			seek: for (;;) {

				var right;

				if ( ! ( time < keyTime ) ) {

					// linear scan forward

					for ( var giveUpAt = index + 2; ;) {

						if ( keyTime === undefined ) {

							// after end

							index = times.length - 1;
							this.cachedIndex = index;
							return this._afterEnd( index, time, prevKeyTime );

						}

						if ( index === giveUpAt ) break;

						prevKeyTime = keyTime;
						keyTime = times[ ++ index ];

						if ( time < keyTime ) {

							// we have arrived at the sought interval
							break seek;

						}

					}

					// prepare binary search on the right side of the index
					right = times.length;

				} else if ( ! ( time >= prevKeyTime ) ) {

					// looping?

					var secondKeyTime = times[ 1 ];

					if ( time < secondKeyTime ) {

						index = 2; // + 1, using the scan for the details
						prevKeyTime = secondKeyTime;

					}

					// linear reverse scan

					for ( var giveUpAt = index - 2; ;) {

						if ( prevKeyTime === undefined ) {

							// before start

							this.cachedIndex = 0;
							return this._beforeStart( 0, time, keyTime );

						}

						if ( index === giveUpAt ) break;

						keyTime = prevKeyTime;
						prevKeyTime = times[ -- index - 1 ];

						if ( time >= prevKeyTime ) {

							// we have arrived at the sought interval
							break seek;

						}

					}

					// prepare binary search on the left side of the index
					right = index;
					index = 0;

				} else {

					// the current interval is still valid

					break change_interval;

				}

				// binary search

				while ( index < right ) {

					var mid = ( index + right ) >>> 1;

					if ( time >= times[ mid ] ) {

						index = mid + 1;

					} else {

						right = mid;

					}

				}

				keyTime = times[ index ];
				prevKeyTime = times[ index - 1 ];

				continue; // check boundary cases, again

			} // seek

			this.cachedIndex = index;

			this._intervalChanged( index, prevKeyTime, keyTime );
			break;

		}

		return this._interpolate( index, prevKeyTime, time, keyTime );

	},

	parameters: null, // optional, subclass-specific parameter structure
	// Note: The indirection allows central control of many interpolants.

	DefaultParameters: {},

	// --- Protected interface

	_getParameters: function() {

		return this.parameters || this.DefaultParameters;

	},

	_copyKeyframe: function( index ) {

		// copies the state at a keyframe to the result buffer

		var result = this.result,

			values = this.values,
			stride = this.stride,
			offset = index * stride;

		for ( var i = 0; i !== stride; ++ i ) {

			result[ i ] = values[ offset + i ];

		}

		return result;

	},

	// Template methods for derived classes:

	_interpolate: function( i1, t0, t, t1 ) {

		throw new Error( "call to abstract method" );

	},

	_intervalChanged: function( i1, t0, t1 ) {

		// empty

	}

};

Object.assign( THREE.Interpolant.prototype, {

	_beforeStart: //( 0, t, t0 )
		THREE.Interpolant.prototype._copyKeyframe,

	_afterEnd: //( N-1, tN, t )
		THREE.Interpolant.prototype._copyKeyframe

} );
