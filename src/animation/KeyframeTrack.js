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
	this.keys = keys;	// time in seconds, value as value

	// local cache of value type to avoid allocations during runtime.
	this.result = THREE.AnimationUtils.clone( this.keys[0].value );
	//console.log( 'constructor result', this.result )

	this.lastIndex = -1;

	this.sort();
	this.validate();
	this.optimize();
};

THREE.KeyframeTrack.prototype = {

	constructor: THREE.KeyframeTrack,

	// TODO: this is a straight forward linear search for the key that corresponds to this time, this
	//    should be optimized.
	getAt: function( time ) {
		//console.log( 'KeyframeTrack[' + this.name + '].getAt( ' + time + ' )' );

		if( this.keys.length == 0 ) throw new Error( "no keys in track named " + this.name );

		// fast early exit	
		if( this.lastIndex >= 0 ) {
			if( ( time <= this.keys[this.lastIndex].time ) && ( this.keys[this.lastIndex-1].time < time ) ) {

				var i = this.lastIndex;

				var alpha = ( time - this.keys[ i - 1 ].time ) / ( this.keys[ i ].time - this.keys[ i - 1 ].time );

				this.setResult( this.keys[ i - 1 ].value );

				this.result = this.lerp( this.result, this.keys[ i ].value, alpha );

				return this.result;

			}

			this.lastIndex = -1;
		}

		//console.log( "keys", this.keys );
		// before the start of the track, return the first key value
		if( this.keys[0].time >= time ) {

			//console.log( '   before: ' + this.keys[0].value );
			this.setResult( this.keys[0].value );

			//console.log( 'first result', this.result )

			return this.result;

		}

		// past the end of the track, return the last key value
		if( this.keys[ this.keys.length - 1 ].time <= time ) {

			//console.log( '   after: ' + this.keys[ this.keys.length - 1 ].value );
			this.setResult( this.keys[ this.keys.length - 1 ].value );

			//console.log( 'last result', this.result )

			return this.result;

		}

		// interpolate to the required time
		// TODO: Optimize this better than a linear search for each key.
		for( var i = 1; i < this.keys.length; i ++ ) {

			if( time <= this.keys[ i ].time ) {

				// linear interpolation to start with
				var alpha = ( time - this.keys[ i - 1 ].time ) / ( this.keys[ i ].time - this.keys[ i - 1 ].time );

				this.setResult( this.keys[ i - 1 ].value );

				this.result = this.lerp( this.result, this.keys[ i ].value, alpha );
				//console.log( 'lerp result', this.result )
				/*console.log( '   interpolated: ', {
					value: interpolatedValue, 
					alpha: alpha,
					time0: this.keys[ i - 1 ].time,
					time1: this.keys[ i ].time,
					value0: this.keys[ i - 1 ].value,
					value1: this.keys[ i ].value
				} );*/

				this.lastIndex = i;

				return this.result;

			}
		}

		throw new Error( "should never get here." );

	},
	setResult: function( value ) {
		if( this.result.copy ) {
			this.result.copy( value );
		}
		else {
			this.result = value;
		}
	},

	// memoization of the lerp function for speed.
	// NOTE: Do not optimize as a prototype initialization closure, as value0 will be different on a per class basis.
	lerp: function( value0, value1, alpha ) {

		this.lerp = THREE.AnimationUtils.getLerpFunc( value0, false );

		return this.lerp( value0, value1, alpha );

	},

	// sort in ascending order
	sort: function() {

		var keyComparator = function(key0, key1) {
			return key0.time - key1.time;
		};

		return function() {

			this.keys.sort( keyComparator );
		}

	}(),

	// ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
	// TODO: ensure that all key.values in a track are all of the same type (otherwise interpolation makes no sense.)
	validate: function() {

		var prevKey = null;

		if( this.keys.length === 0 ) {
			console.error( "  track is empty, no keys", this );
			return;
		}

		for( var i = 0; i < this.keys.length; i ++ ) {

			var currKey = this.keys[i];

			if( ! currKey ) {
				console.error( "  key is null in track", this, i );
				return;
			}

			if( ( typeof currKey.time ) !== 'number' || Number.isNaN( currKey.time ) ) {
				console.error( "  key.time is not a valid number", this, i, currKey );
				return;
			}

			if( currKey.value === undefined || currKey.value === null) {
				console.error( "  key.value is null in track", this, i, currKey );
				return;
			}

			if( prevKey && prevKey.time > currKey.time ) {
				console.error( "  key.time is less than previous key time, out of order keys", this, i, currKey, prevKey );
				return;
			}

			prevKey = currKey;

		}

	},

	// currently only removes equivalent sequential keys (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0), which are common in morph target animations
	// TODO: linear based interpolation optimization with an error threshold.
	optimize: function() {

		var newKeys = [];
		var prevKey = this.keys[0];
		newKeys.push( prevKey );

		var equalsFunc = THREE.AnimationUtils.getEqualsFunc( prevKey.value );

		for( var i = 1; i < this.keys.length - 1; i ++ ) {
			var currKey = this.keys[i];
			var nextKey = this.keys[i+1];
			//console.log( prevKey, currKey, nextKey );

			// if prevKey & currKey are the same time, remove currKey.  If you want immediate adjacent keys, use an epsilon offset
			// it is not possible to have two keys at the same time as we sort them.  The sort is not stable on keys with the same time.
			if( ( prevKey.time === currKey.time ) ) {
				//console.log(  'removing key at the same time', currKey );
				continue;
			}

			// remove completely unnecessary keyframes that are the same as their prev and next keys
			if( equalsFunc( prevKey.value, currKey.value ) && equalsFunc( currKey.value, nextKey.value ) ) {
				//console.log(  'removing key identical to prev and next', currKey );
				continue;
			}

			// TODO:add here a check for linear interpolation optimization.

			newKeys.push( currKey );
			prevKey = currKey;
		}
		newKeys.push( this.keys[ this.keys.length - 1 ] );

		if( ( this.keys.length - newKeys.length ) > 0 ) {
			console.log( '  optimizing removed keys:', ( this.keys.length - newKeys.length ), this.name );
		}
		this.keys = newKeys;

	},

	// removes keyframes before and after animation without changing any values within the range [0,duration].
	// IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
 	trim: function( duration ) {
		
		var firstKeysToRemove = 0;
		for( var i = 1; i < this.keys.length; i ++ ) {
			if( this.keys[i] <= 0 ) {
				firstKeysToRemove ++;
			}
		}

		var lastKeysToRemove = 0;
		for( var i = this.keys.length - 2; i > 0; i ++ ) {
			if( this.keys[i] >= duration ) {
				lastKeysToRemove ++;
			}
			else {
				break;
			}
		}

		// remove last keys first because it doesn't affect the position of the first keys (the otherway around doesn't work as easily)
		// TODO: Figure out if there is an array subarray function... might be faster
		if( ( firstKeysToRemove + lastKeysToRemove ) > 0 ) {
			console.log(  '  triming removed keys: first and last', firstKeysToRemove, lastKeysToRemove, this.keys );
			this.keys = this.keys.splice( firstKeysToRemove, this.keys.length - lastKeysToRemove - firstKeysToRemove );;
			//console.log(  '  result', this.keys );
		}

	}

};