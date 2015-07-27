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

	this.results = {};
	
};

THREE.AnimationClip.prototype = {

	constructor: THREE.AnimationClip,

	getAt: function( clipTime ) {

		clipTime = Math.max( 0, Math.min( clipTime, this.duration ) );

		for( var i = 0; i < this.tracks.length; i ++ ) {

			var track = this.tracks[ i ];
			//console.log( 'track', track );

			this.results[ track.name ] = track.getAt( clipTime );

		}

		return this.results;
	},

	trim: function() {

		for( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].trim( this.duration );

		}

	},

	optimize: function() {

		for( var i = 0; i < this.tracks.length; i ++ ) {

			this.tracks[ i ].optimize();

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

THREE.AnimationClip.CreateMorphAnimationFromNames = function( morphTargetNames, duration ) {
	//console.log( morphTargetNames, duration );

	var tracks = [];
	var frameStep = duration / morphTargetNames.length;
	//console.log( 'frameStep', frameStep );

	for( var i = 0; i < morphTargetNames.length; i ++ ) {

		var keys = [];

		if( ( i - 1 ) >= 0 ) {

			keys.push( { time: ( i - 1 ) * frameStep, value: 0 } );

		}

		keys.push( { time: i * frameStep, value: 1 } );

		if( ( i + 1 ) <= morphTargetNames.length ) {

			keys.push( { time: ( i + 1 ) * frameStep, value: 0 } );

		}

		if( ( i - 1 ) < 0 ) {
			
			keys.push( { time: ( morphTargetNames.length - 1 ) * frameStep, value: 0 } );
			keys.push( { time: morphTargetNames.length * frameStep, value: 1 } );

		}

		//console.log( 'keys', keys );

		var morphName = morphTargetNames[i];
		var trackName = '.morphTargetInfluences[' + morphName + ']';
		var track = new THREE.KeyframeTrack( trackName, keys );

		tracks.push( track );
	}

	var clip = new THREE.AnimationClip( 'morphAnimation', duration, tracks );
	//console.log( 'morphAnimationClip', clip );

	return clip;
};

THREE.AnimationClip.CreateMorphAnimation = function( morphTargets, duration ) {

	var morphTargetNames = [];

	for( var i = 0; i < morphTargets.length; i ++ ) {

		morphTargetNames.push( morphTargets[i].name );

	}

	return THREE.AnimationClip.CreateMorphAnimationFromNames( morphTargetNames, duration );

};


THREE.AnimationClip.FromImplicitMorphTargetAnimations = function( morphTargets, fps ) {
	
	var animations = {};
	var animationsArray = [];

	var pattern = /([a-z]+)_?(\d+)/;

	for ( var i = 0, il = morphTargets.length; i < il; i ++ ) {

		var morphTarget = morphTargets[ i ];
		var parts = morphTarget.name.match( pattern );

		if ( parts && parts.length > 1 ) {

			var animationName = parts[ 1 ];

			var animation = animations[ animationName ];
			if ( ! animation ) {
				animations[ animationName ] = animation = { name: animationName, morphTargetNames: [] };
				animationsArray.push( animation );
			}

			animation.morphTargetNames.push( morphTarget.name );
		}

	}

	//console.log( animations );

	var clips = [];

	for( var i = 0; i < animationsArray.length; i ++ ) {

		var animation = animationsArray[i];

		var clip = new THREE.AnimationClip.CreateMorphAnimationFromNames( animation.morphTargetNames, animation.morphTargetNames.length * fps );
		clip.name = animation.name;

		clips.push( clip );
	}

	return clips;

};

THREE.AnimationClip.FromJSONLoaderAnimation = function( jsonLoader, nodeName ) {

	var animation = jsonLoader.animation;
	if( ! animation ) {
		console.error( "  no animation in JSONLoader data" );
		return null;
	}

	var convertTrack = function( trackName, animationKeys, propertyName, animationKeyToValueFunc ) {

		var keys = [];

		for( var k = 0; k < animationKeys.length; k ++ ) {

			var animationKey = animationKeys[k];

			if( animationKey[propertyName] !== undefined ) {

				keys.push( { time: animationKey.time, value: animationKeyToValueFunc( animationKey ) } );
			}
	
		}

		// only return track if there are actually keys.
		if( keys.length > 0 ) {

			return new THREE.KeyframeTrack( trackName, keys );

		}

		return null;

	};

	var clipName = animation.name;
	var duration = animation.length;
	var fps = animation.fps;

	var tracks = [];

	var boneList = jsonLoader.bones;
	var animationTracks = animation.hierarchy;

	for ( var h = 0; h < animationTracks.length; h ++ ) {

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

						morphTargetNames[ animationKeys[k].morphTargets[m] ] = -1;
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

				tracks.push( new THREE.KeyframeTrack( nodeName + '.morphTargetInfluence[' + morphTargetName + ']', keys ) );

			}

		}
		else {

			var boneName = nodeName + '.bones[' + boneList[ h ].name + ']';
			//console.log( 'boneName', boneName );
		
			// track contains positions...
			var positionTrack = convertTrack( boneName + '.position', animationKeys, 'pos', function( animationKey ) {
					return new THREE.Vector3().fromArray( animationKey.pos )
				} );

			if( positionTrack ) tracks.push( positionTrack );
			
			// track contains quaternions...
			var quaternionTrack = convertTrack( boneName + '.quaternion', animationKeys, 'rot', function( animationKey ) {
					if( animationKey.rot.slerp ) {
						return animationKey.rot.clone();
					}
					else {
						return new THREE.Quaternion().fromArray( animationKey.rot );
					}
				} );

			if( quaternionTrack ) tracks.push( quaternionTrack );

			// track contains quaternions...
			var scaleTrack = convertTrack( boneName + '.scale', animationKeys, 'scl', function( animationKey ) {
					return new THREE.Vector3().fromArray( animationKey.scl )
				} );

			if( scaleTrack ) tracks.push( scaleTrack );

		}
	}

	var clip = new THREE.AnimationClip( clipName, duration, tracks );
	//console.log( 'clipFromJSONLoaderAnimation', clip );

	return clip;

};
