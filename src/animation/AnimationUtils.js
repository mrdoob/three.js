import { PropertyBinding } from './PropertyBinding.js';
import { InterpolateLinear } from '../constants.js';

/**
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

var AnimationUtils = {

	// same as Array.prototype.slice, but also works on typed arrays
	arraySlice: function ( array, from, to ) {

		if ( AnimationUtils.isTypedArray( array ) ) {

			// in ios9 array.subarray(from, undefined) will return empty array
			// but array.subarray(from) or array.subarray(from, len) is correct
			return new array.constructor( array.subarray( from, to !== undefined ? to : array.length ) );

		}

		return array.slice( from, to );

	},

	// converts an array to a specific type
	convertArray: function ( array, type, forceClone ) {

		if ( ! array || // let 'undefined' and 'null' pass
			! forceClone && array.constructor === type ) return array;

		if ( typeof type.BYTES_PER_ELEMENT === 'number' ) {

			return new type( array ); // create typed array

		}

		return Array.prototype.slice.call( array ); // create Array

	},

	isTypedArray: function ( object ) {

		return ArrayBuffer.isView( object ) &&
			! ( object instanceof DataView );

	},

	// returns an array by which times and values can be sorted
	getKeyframeOrder: function ( times ) {

		function compareTime( i, j ) {

			return times[ i ] - times[ j ];

		}

		var n = times.length;
		var result = new Array( n );
		for ( var i = 0; i !== n; ++ i ) result[ i ] = i;

		result.sort( compareTime );

		return result;

	},

	// uses the array previously returned by 'getKeyframeOrder' to sort data
	sortedArray: function ( values, stride, order ) {

		var nValues = values.length;
		var result = new values.constructor( nValues );

		for ( var i = 0, dstOffset = 0; dstOffset !== nValues; ++ i ) {

			var srcOffset = order[ i ] * stride;

			for ( var j = 0; j !== stride; ++ j ) {

				result[ dstOffset ++ ] = values[ srcOffset + j ];

			}

		}

		return result;

	},

	// function for parsing AOS keyframe formats
	flattenJSON: function ( jsonKeys, times, values, valuePropertyName ) {

		var i = 1, key = jsonKeys[ 0 ];

		while ( key !== undefined && key[ valuePropertyName ] === undefined ) {

			key = jsonKeys[ i ++ ];

		}

		if ( key === undefined ) return; // no data

		var value = key[ valuePropertyName ];
		if ( value === undefined ) return; // no data

		if ( Array.isArray( value ) ) {

			do {

				value = key[ valuePropertyName ];

				if ( value !== undefined ) {

					times.push( key.time );
					values.push.apply( values, value ); // push all elements

				}

				key = jsonKeys[ i ++ ];

			} while ( key !== undefined );

		} else if ( value.toArray !== undefined ) {

			// ...assume THREE.Math-ish

			do {

				value = key[ valuePropertyName ];

				if ( value !== undefined ) {

					times.push( key.time );
					value.toArray( values, values.length );

				}

				key = jsonKeys[ i ++ ];

			} while ( key !== undefined );

		} else {

			// otherwise push as-is

			do {

				value = key[ valuePropertyName ];

				if ( value !== undefined ) {

					times.push( key.time );
					values.push( value );

				}

				key = jsonKeys[ i ++ ];

			} while ( key !== undefined );

		}

	},

	insertKeyframe: function ( track, time ) {

		var tolerance = 0.001; // 1ms
		var valueSize = track.getValueSize();

		var times = new track.TimeBufferType( track.times.length + 1 );
		var values = new track.ValueBufferType( track.values.length + valueSize );
		var interpolant = track.createInterpolant( new track.ValueBufferType( valueSize ) );

		var index;

		if ( track.times.length === 0 ) {

			times[ 0 ] = time;

			for ( var i = 0; i < valueSize; i ++ ) {

				values[ i ] = 0;

			}

			index = 0;

		} else if ( time < track.times[ 0 ] ) {

			if ( Math.abs( track.times[ 0 ] - time ) < tolerance ) return 0;

			times[ 0 ] = time;
			times.set( track.times, 1 );

			values.set( interpolant.evaluate( time ), 0 );
			values.set( track.values, valueSize );

			index = 0;

		} else if ( time > track.times[ track.times.length - 1 ] ) {

			if ( Math.abs( track.times[ track.times.length - 1 ] - time ) < tolerance ) {

				return track.times.length - 1;

			}

			times[ times.length - 1 ] = time;
			times.set( track.times, 0 );

			values.set( track.values, 0 );
			values.set( interpolant.evaluate( time ), track.values.length );

			index = times.length - 1;

		} else {

			for ( var i = 0; i < track.times.length; i ++ ) {

				if ( Math.abs( track.times[ i ] - time ) < tolerance ) return i;

				if ( track.times[ i ] < time && track.times[ i + 1 ] > time ) {

					times.set( track.times.slice( 0, i + 1 ), 0 );
					times[ i + 1 ] = time;
					times.set( track.times.slice( i + 1 ), i + 2 );

					values.set( track.values.slice( 0, ( i + 1 ) * valueSize ), 0 );
					values.set( interpolant.evaluate( time ), ( i + 1 ) * valueSize );
					values.set( track.values.slice( ( i + 1 ) * valueSize ), ( i + 2 ) * valueSize );

					index = i + 1;

					break;

				}

			}

		}

		track.times = times;
		track.values = values;

		return index;

	},

	mergeMorphTargetTracks: function ( clip, root ) {

		var tracks = [];
		var mergedTracks = {};
		var sourceTracks = clip.tracks;

		for ( var i = 0; i < sourceTracks.length; ++ i ) {

			var sourceTrack = sourceTracks[ i ];
			var sourceTrackBinding = PropertyBinding.parseTrackName( sourceTrack.name );
			var sourceTrackNode = PropertyBinding.findNode( root, sourceTrackBinding.nodeName );

			if ( sourceTrackBinding.propertyName !== 'morphTargetInfluences' ) {

				// Tracks that don't affect morph targets can be kept as-is.
				tracks.push( sourceTrack );
				continue;

			}

			if ( sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodDiscrete
				&& sourceTrack.createInterpolant !== sourceTrack.InterpolantFactoryMethodLinear ) {

				if ( sourceTrack.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline ) {

					// This should never happen, because glTF morph target animations
					// affect all targets already.
					throw new Error( 'THREE.AnimationUtils: Cannot merge tracks with glTF CUBICSPLINE interpolation.' );

				}

				console.warn( 'THREE.AnimationUtils: Morph target interpolation mode not yet supported. Using LINEAR instead.' );

				sourceTrack = sourceTrack.clone();
				sourceTrack.setInterpolation( InterpolateLinear );

			}

			var targetCount = sourceTrackNode.morphTargetInfluences.length;
			var targetIndex = sourceTrackNode.morphTargetDictionary[ sourceTrackBinding.propertyIndex ];

			if ( targetIndex === undefined ) {

				throw new Error( 'THREE.AnimationUtils: Morph target name not found: ' + sourceTrackBinding.propertyIndex );

			}

			var mergedTrack;

			// If this is the first time we've seen this object, create a new
			// track to store merged keyframe data for each morph target.
			if ( mergedTracks[ sourceTrackNode.uuid ] === undefined ) {

				mergedTrack = sourceTrack.clone();

				var values = new mergedTrack.ValueBufferType( targetCount * mergedTrack.times.length );

				for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

					values[ j * targetCount + targetIndex ] = mergedTrack.values[ j ];

				}

				mergedTrack.name = '.morphTargetInfluences';
				mergedTrack.values = values;

				mergedTracks[ sourceTrackNode.uuid ] = mergedTrack;
				tracks.push( mergedTrack );

				continue;

			}

			var mergedKeyframeIndex = 0;
			var sourceKeyframeIndex = 0;
			var sourceInterpolant = sourceTrack.createInterpolant( new sourceTrack.ValueBufferType( 1 ) );

			mergedTrack = mergedTracks[ sourceTrackNode.uuid ];

			// For every existing keyframe of the merged track, write a (possibly
			// interpolated) value from the source track.
			for ( var j = 0; j < mergedTrack.times.length; j ++ ) {

				mergedTrack.values[ j * targetCount + targetIndex ] = sourceInterpolant.evaluate( mergedTrack.times[ j ] );

			}

			// For every existing keyframe of the source track, write a (possibly
			// new) keyframe to the merged track. Values from the previous loop may
			// be written again, but keyframes are de-duplicated.
			for ( var j = 0; j < sourceTrack.times.length; j ++ ) {

				var keyframeIndex = AnimationUtils.insertKeyframe( mergedTrack, sourceTrack.times[ j ] );
				mergedTrack.values[ keyframeIndex * targetCount + targetIndex ] = sourceTrack.values[ j ];

			}

		}

		clip.tracks = tracks;

		return clip;

	}

};


export { AnimationUtils };
