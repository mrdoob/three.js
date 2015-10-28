/**
 * Controller class for the Timeliner GUI.
 *
 * Timeliner GUI library (required to use this class):
 *
 * 		./libs/timeliner_gui.min.js
 *
 * Source code:
 *
 * 		https://github.com/tschw/timeliner
 * 		https://github.com/zz85/timeliner (fork's origin)
 *
 * @author tschw
 *
 */

THREE.TimelinerController = function TimelinerController( scene, trackInfo, onUpdate ) {

	this._scene = scene;
	this._trackInfo = trackInfo;

	this._onUpdate = onUpdate;

	this._mixer = new THREE.AnimationMixer( scene );
	this._clip = null;
	this._action = null;

	this._tracks = {};
	this._propRefs = {};
	this._channelNames = [];

};

THREE.TimelinerController.prototype = {

	constructor: THREE.TimelinerController,

	init: function( timeliner ) {

		var tracks = [],
			trackInfo = this._trackInfo;

		for ( var i = 0, n = trackInfo.length; i !== n; ++ i ) {

			var spec = trackInfo[ i ];

			tracks.push( this._addTrack(
					spec.type, spec.propertyPath,
					spec.initialValue, spec.interpolation ) );
		}

		this._clip = new THREE.AnimationClip( 'editclip', 0, tracks );
		this._action = this._mixer.clipAction( this._clip ).play();

	},

	setDisplayTime: function( time ) {

		this._action.time = time;
		this._mixer.update( 0 );

		this._onUpdate();

	},

	getChannelNames: function() {

		return this._channelNames;

	},

	getChannelKeyTimes: function( channelName ) {

		return this._tracks[ channelName ].times;

	},

	setKeyframe: function( channelName, time ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = times.indexOf( time );

		if ( index === -1 ) index = times.length;

		var values = track.values,
			offset = index * track.getValueSize();

		// note: not calling track.getValueSize with
		// inconsistent array sizes

		times[ index ] = time;
		this._propRefs[ channelName ].getValue( values, offset );

		this._sort( track );
		this._clip.resetDuration();

	},

	delKeyframe: function( channelName, time ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = times.indexOf( time );

		if ( index === 0 ) {

			// we disallow to remove the first keyframe
			// since the animation system is designed to
			// always produce a defined state - we allow
			// the initial state to be changed however

			this.setKeyframe( channelName, time );

		} else if ( index !== -1 ) {

			var values = track.values,
				stride = track.getValueSize(),
				offset = index * stride,

				nValues = values.length;

			// note: not calling track.getValueSize with
			// inconsistent array sizes

			times[ index ] = times[ times.length - 1 ];
			times.pop();

			for ( var i = nValues - stride; i !== nValues; ++ i ) {

				values[ offset ++ ] = values[ i ];

			}

			values.length = nValues - stride;

			this._sort( track );
			this._clip.resetDuration();

		}

	},

	hasKeyframe: function( channelName, time ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = times.indexOf( time );

		return index !== -1;

	},

	serialize: function() {

		var result = {},

			names = this._channelNames,
			tracks = this._tracks;

		for ( var i = 0, n = names.length; i !== n; ++ i ) {

			var name = names[ i ],
				track = tracks[ name ];

			result[ name ] = {

				times: track.times,
				values: track.values

			};

		}

		return result;

	},

	deserialize: function( structs ) {

		var names = this._channelNames,
			tracks = this._tracks;

		for ( var i = 0, n = names.length; i !== n; ++ i ) {

			var name = names[ i ],
				track = tracks[ name ];
				data = structs[ name ];

			this._setArray( track.times, data.times );
			this._setArray( track.values, data.values );

		}

		// update display
		this.setDisplayTime( this._mixer.time );

	},

	_sort: function( track ) {

		var times = track.times,
			order = THREE.AnimationUtils.getKeyframeOrder( times );

		this._setArray( times,
				THREE.AnimationUtils.sortedArray( times, 1, order ) );

		var values = track.values,
			stride = track.getValueSize();

		this._setArray( values,
				THREE.AnimationUtils.sortedArray( values, stride, order ) );

	},

	_setArray: function( dst, src ) {

		dst.length = 0;
		dst.push.apply( dst, src );

	},

	_addTrack: function( type, prop, initialValue, interpolation ) {

		var track = new type(
				prop, [ 0 ], initialValue, interpolation );

		// data must be in JS arrays so it can be resized
		track.times = Array.prototype.slice.call( track.times );
		track.values = Array.prototype.slice.call( track.values );

		this._channelNames.push( prop );
		this._tracks[ prop ] = track;

		// for recording the state:
		this._propRefs[ prop ] =
				new THREE.PropertyBinding( this._scene, prop );

		return track;

	}

};
