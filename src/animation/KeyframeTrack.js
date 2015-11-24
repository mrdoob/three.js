/**
 *
 * A Track that returns a keyframe interpolated value, currently linearly interpolated
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.KeyframeTrack = function ( name, keys ) {

	if ( name === undefined ) throw new Error( "track name is undefined" );
	if ( keys === undefined || keys.length === 0 ) throw new Error( "no keys in track named " + name );

	this.name = name;
	this.keys = keys;	// time in seconds, value as value

	// the index of the last result, used as a starting point for local search.
	this.lastIndex = 0;

	this.validate();
	this.optimize();

};

THREE.KeyframeTrack.prototype = {

	constructor: THREE.KeyframeTrack,

	getAt: function( time ) {


		// this can not go higher than this.keys.length.
		while( ( this.lastIndex < this.keys.length ) && ( time >= this.keys[this.lastIndex].time ) ) {
			this.lastIndex ++;
		};

		// this can not go lower than 0.
		while( ( this.lastIndex > 0 ) && ( time < this.keys[this.lastIndex - 1].time ) ) {
			this.lastIndex --;
		}

		if ( this.lastIndex >= this.keys.length ) {

			this.setResult( this.keys[ this.keys.length - 1 ].value );

			return this.result;

		}

		if ( this.lastIndex === 0 ) {

			this.setResult( this.keys[ 0 ].value );

			return this.result;

		}

		var prevKey = this.keys[ this.lastIndex - 1 ];
		this.setResult( prevKey.value );

		// if true, means that prev/current keys are identical, thus no interpolation required.
		if ( prevKey.constantToNext ) {

			return this.result;

		}

		// linear interpolation to start with
		var currentKey = this.keys[ this.lastIndex ];
		var alpha = ( time - prevKey.time ) / ( currentKey.time - prevKey.time );
		this.result = this.lerpValues( this.result, currentKey.value, alpha );

		return this.result;

	},

	// move all keyframes either forwards or backwards in time
	shift: function( timeOffset ) {

		if ( timeOffset !== 0.0 ) {

			for ( var i = 0; i < this.keys.length; i ++ ) {
				this.keys[i].time += timeOffset;
			}

		}

		return this;

	},

	// scale all keyframe times by a factor (useful for frame <-> seconds conversions)
	scale: function( timeScale ) {

		if ( timeScale !== 1.0 ) {

			for ( var i = 0; i < this.keys.length; i ++ ) {
				this.keys[i].time *= timeScale;
			}

		}

		return this;

	},

	// removes keyframes before and after animation without changing any values within the range [startTime, endTime].
	// IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
 	trim: function( startTime, endTime ) {

		var firstKeysToRemove = 0;
		for ( var i = 1; i < this.keys.length; i ++ ) {
			if ( this.keys[i] <= startTime ) {
				firstKeysToRemove ++;
			}
		}

		var lastKeysToRemove = 0;
		for ( var i = this.keys.length - 2; i > 0; i ++ ) {
			if ( this.keys[i] >= endTime ) {
				lastKeysToRemove ++;
			} else {
				break;
			}
		}

		// remove last keys first because it doesn't affect the position of the first keys (the otherway around doesn't work as easily)
		if ( ( firstKeysToRemove + lastKeysToRemove ) > 0 ) {
			this.keys = this.keys.splice( firstKeysToRemove, this.keys.length - lastKeysToRemove - firstKeysToRemove );;
		}

		return this;

	},

	/* NOTE: This is commented out because we really shouldn't have to handle unsorted key lists
	         Tracks with out of order keys should be considered to be invalid.  - bhouston
	sort: function() {

		this.keys.sort( THREE.KeyframeTrack.keyComparer );

		return this;

	},*/

	// ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
	// One could eventually ensure that all key.values in a track are all of the same type (otherwise interpolation makes no sense.)
	validate: function() {

		var prevKey = null;

		if ( this.keys.length === 0 ) {
			console.error( "  track is empty, no keys", this );
			return;
		}

		for ( var i = 0; i < this.keys.length; i ++ ) {

			var currKey = this.keys[i];

			if ( ! currKey ) {
				console.error( "  key is null in track", this, i );
				return;
			}

			if ( ( typeof currKey.time ) !== 'number' || isNaN( currKey.time ) ) {
				console.error( "  key.time is not a valid number", this, i, currKey );
				return;
			}

			if ( currKey.value === undefined || currKey.value === null) {
				console.error( "  key.value is null in track", this, i, currKey );
				return;
			}

			if ( prevKey && prevKey.time > currKey.time ) {
				console.error( "  key.time is less than previous key time, out of order keys", this, i, currKey, prevKey );
				return;
			}

			prevKey = currKey;

		}

		return this;

	},

	// currently only removes equivalent sequential keys (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0), which are common in morph target animations
	optimize: function() {

		var newKeys = [];
		var prevKey = this.keys[0];
		newKeys.push( prevKey );

		var equalsFunc = THREE.AnimationUtils.getEqualsFunc( prevKey.value );

		for ( var i = 1; i < this.keys.length - 1; i ++ ) {
			var currKey = this.keys[i];
			var nextKey = this.keys[i+1];

			// if prevKey & currKey are the same time, remove currKey.  If you want immediate adjacent keys, use an epsilon offset
			// it is not possible to have two keys at the same time as we sort them.  The sort is not stable on keys with the same time.
			if ( ( prevKey.time === currKey.time ) ) {

				continue;

			}

			// remove completely unnecessary keyframes that are the same as their prev and next keys
			if ( this.compareValues( prevKey.value, currKey.value ) && this.compareValues( currKey.value, nextKey.value ) ) {

				continue;

			}

			// determine if interpolation is required
			prevKey.constantToNext = this.compareValues( prevKey.value, currKey.value );

			newKeys.push( currKey );
			prevKey = currKey;
		}
		newKeys.push( this.keys[ this.keys.length - 1 ] );

		this.keys = newKeys;

		return this;

	}

};

THREE.KeyframeTrack.keyComparer = function keyComparator(key0, key1) {
	return key0.time - key1.time;
};

THREE.KeyframeTrack.parse = function( json ) {

	if ( json.type === undefined ) throw new Error( "track type undefined, can not parse" );

	var trackType = THREE.KeyframeTrack.GetTrackTypeForTypeName( json.type );

	return trackType.parse( json );

};

THREE.KeyframeTrack.GetTrackTypeForTypeName = function( typeName ) {
	switch( typeName.toLowerCase() ) {
	 	case "vector":
	 	case "vector2":
	 	case "vector3":
	 	case "vector4":
			return THREE.VectorKeyframeTrack;

	 	case "quaternion":
			return THREE.QuaternionKeyframeTrack;

	 	case "integer":
	 	case "scalar":
	 	case "double":
	 	case "float":
	 	case "number":
			return THREE.NumberKeyframeTrack;

	 	case "bool":
	 	case "boolean":
			return THREE.BooleanKeyframeTrack;

	 	case "string":
	 		return THREE.StringKeyframeTrack;
	};

	throw new Error( "Unsupported typeName: " + typeName );
};
