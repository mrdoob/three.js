/**
 *
 * Reusable set of Tracks that represent an animation.
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationClip = function ( name, duration, tracks ) {

	this.name = name;
	this.tracks = tracks;
	this.duration = duration || 1;

	// TODO: maybe only do these on demand, as doing them here could potentially slow down loading
	// but leaving these here during development as this ensures a lot of testing of these functions
	this.trim();
	this.optimize();
	
};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		clipTime = Math.max( 0, Math.min( clipTime, this.duration ) );

		var results = {};

		for( var trackIndex in this.tracks ) {

			var track = this.tracks[ trackIndex ];
			//console.log( 'track', track );

			results[ track.name ] = track.getAt( clipTime );

		}

		return results;
	},

	trim: function() {

		for( var trackIndex in this.tracks ) {

			this.tracks[ trackIndex ].trim( this.duration );

		}

	},

	optimize: function() {

		for( var trackIndex in this.tracks ) {	

			this.tracks[ trackIndex ].optimize();

		}

	}

};


/*
	"animation" : {
	    "name"      : "Action",
        "fps"       : 25,
        "length"    : 2.0,
        "hierarchy" : [
            {
                "parent" : -1,
                "keys"   : [
                    {
                        "time":0,
                        "pos" :[0.532239,5.88733,-0.119685],
                        "rot" :[-0.451519,0.544179,0.544179,0.451519],
                        "scl" :[1,1,1]
                    },
*/

THREE.AnimationClip.FromJSONLoaderAnimation = function( jsonLoader ) {

	var animation = jsonLoader['animation'];
	if( ! animation ) {
		console.error( "  no animation in JSONLoader data" );
		return null;
	}

	var convertTrack = function( trackName, animationKeys, animationKeyToValueFunc ) {

		var keys = [];

		for( var k = 0; k < animationKeys.length; k ++ ) {

			var animationKey = animationKeys[k];
			keys.push( { time: animationKey.time, value: animationKeyToValueFunc( animationKey ) } );
	
		}

		return new THREE.KeyframeTrack( trackName, keys );

	};

	var clipName = animation.name;
	var duration = animation.length;
	var fps = animation.fps;

	var tracks = [];

	var animationTracks = animation.hierarchy;

	for ( var h = 0; h < animationTracks.length; h ++ ) {

		var boneName = '.bone[' + h + ']';
		var animationKeys = animationTracks[ h ].keys;

		// skip empty tracks
		if( ! animationKeys || animationKeys.length == 0 ) {
			continue;
		}

		// process morph targets in a way exactly compatible with AnimationHandler.init( animation )
		if( animationKeys[0].morphTargets ) {

			// figure out all morph targets used in this track
			var morphTargetNames = {};
			for( var k = 0; k < animationKeys.length; k ++ ) {

				if( animationKeys[k].morphTargets ) {
					for( var m = 0; m < animationKeys[k].morphTargets.length; m ++ ) {

						morphTagetNames[ animationKeys[k].morphTargets[m] ] = -1;
					}
				}

			}

			// create a track for each morph target with all zero morphTargetInfluences except for the keys in which the morphTarget is named.
			for( var morphTargetName in morphTargetNames ) {

				var keys = [];

				for( var m = 0; m < animationKeys[k].morphTargets.length; m ++ ) {

					var animationKey = animationKeys[k];

					keys.push( {
							time: animationKey.time,
							value: (( animationKey.morphTarget === morphTargetName ) ? 1 : 0 )
						});
				
				}

				tracks.push( new THREE.KeyframeTrack( '.morphTargetInfluence[' + morphTargetName + ']', keys ) );

			}

		}
		
		// track contains positions...
		if( animationKeys[0].pos ) {

			tracks.push( convertTracks( boneName + '.position', animationKeys, function( dataValue ) {
					return new THREE.Vector3().fromArray( animationKey.pos )
				} );

		}
		
		// track contains quaternions...
		if( animationKeys[0].rot ) {

			tracks.push( convertTracks( boneName + '.quaternion', animationKeys, function( dataValue ) {
					return new THREE.Quaternion().fromArray( animationKey.rot )
				} );

		}

		// track contains quaternions...
		if( animationKeys[0].scl ) {

			tracks.push( convertTracks( boneName + '.quaternion', animationKeys, function( dataValue ) {
					return new THREE.Vector3().fromArray( animationKey.scl )
				} );

		}
	}

	var clip = new THREE.AnimationClip( clipName, duration, tracks );
	console.log( 'clipFromJSONLoaderAnimation', clip );

	return clip;

};
