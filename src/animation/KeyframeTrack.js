/**
 *
 * A Track that returns a keyframe interpolated value.
 *
 * TODO: Add cubic in addition to linear interpolation.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.KeyframeTrack = function ( name, keys ) {

	this.name = name;
	this.keys = keys || [];	// time in seconds, value as value

	// TODO: sort keys via their times
	//this.keys.sort( function( a, b ) { return a.time < b.time; } );

};

THREE.KeyframeTrack.prototype = {

	constructor: THREE.KeyframeTrack,

	getAt: function( time ) {
		console.log( 'KeyframeTrack[' + this.name + '].getAt( ' + time + ' )' );

		if( this.keys.length == 0 ) throw new Error( "no keys in track named " + this.name );
		
		console.log( "keys", this.keys );
		// before the start of the track, return the first key value
		if( this.keys[0].time >= time ) {

			console.log( '   before: ' + this.keys[0].value );
			return this.keys[0].value;

		}

		// past the end of the track, return the last key value
		if( this.keys[ this.keys.length - 1 ].time <= time ) {

			console.log( '   after: ' + this.keys[ this.keys.length - 1 ].value );
			return this.keys[ this.keys.length - 1 ].value;

		}

		// interpolate to the required time
		for( var i = 1; i < this.keys.length; i ++ ) {

			if( time <= this.keys[ i ].time ) {

				// linear interpolation to start with
				var alpha = ( time - this.keys[ i - 1 ].time ) / ( this.keys[ i ].time - this.keys[ i - 1 ].time );


				var interpolatedValue = THREE.AnimationUtils.lerp( this.keys[ i - 1 ].value, this.keys[ i ].value, alpha );

				console.log( '   interpolated: ', {
					value: interpolatedValue, 
					alpha: alpha,
					time0: this.keys[ i - 1 ].time,
					time1: this.keys[ i ].time,
					value0: this.keys[ i - 1 ].value,
					value1: this.keys[ i ].value
				} );

				return interpolatedValue;

			}
		}

		throw new Error( "should never get here." );

	}

};
