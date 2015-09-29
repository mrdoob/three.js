/**
 *
 * Creator of typical test AnimationClips / KeyframeTracks
 * 
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */

THREE.AnimationClipCreator = function() {
};

THREE.AnimationClipCreator.CreateRotationAnimation = function( period, axis ) {

	var keys = [];
	keys.push( { time: 0, value: 0 } );
	keys.push( { time: period, value: 360 } );

	axis = axis || 'x';
	var trackName = '.rotation[' + axis + ']';

	var track = new THREE.NumberKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'rotate.x', 10, [ track ] );
	//console.log( 'rotateClip', clip );

	return clip;
};

THREE.AnimationClipCreator.CreateScaleAxisAnimation = function( period, axis ) {

	var keys = [];
	keys.push( { time: 0, value: 0 } );
	keys.push( { time: period, value: 360 } );

	axis = axis || 'x';
	var trackName = '.scale[' + axis + ']';

	var track = new THREE.NumberKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'scale.x', 10, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};

THREE.AnimationClipCreator.CreateShakeAnimation = function( duration, shakeScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		keys.push( { 
			time: ( i / 10.0 ),
			value: new THREE.Vector3( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).multiply( shakeScale )
		} );

	}

	var trackName = '.position';

	var track = new THREE.VectorKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'shake' + duration, duration, [ track ] );
	//console.log( 'shakeClip', clip );

	return clip;
};


THREE.AnimationClipCreator.CreatePulsationAnimation = function( duration, pulseScale ) {

	var keys = [];

	for( var i = 0; i < duration * 10; i ++ ) {

		var scaleFactor = Math.random() * pulseScale;
		keys.push( {
			time: ( i / 10.0 ),
			value: new THREE.Vector3( scaleFactor, scaleFactor, scaleFactor )
		} );

	}

	var trackName = '.scale';

	var track = new THREE.VectorKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'scale' + duration, duration, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};


THREE.AnimationClipCreator.CreateVisibilityAnimation = function( duration ) {

	var keys = [];
	keys.push( {
		time: 0,
		value: true
	} );
	keys.push( {
		time: duration - 1,
		value: false
	} );
	keys.push( {
		time: duration,
		value: true
	} );

	var trackName = '.visible';

	var track = new THREE.BooleanKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'visible' + duration, duration, [ track ] );
	//console.log( 'scaleClip', clip );

	return clip;
};


THREE.AnimationClipCreator.CreateMaterialColorAnimation = function( duration, colors, loop ) {

	var timeStep = duration / colors.length;
	var keys = [];
	for( var i = 0; i <= colors.length; i ++ ) {
		keys.push( { time: i * timeStep, value: colors[ i % colors.length ] } );
	}

	var trackName = '.material[0].color';

	var track = new THREE.ColorKeyframeTrack( trackName, keys );

	var clip = new THREE.AnimationClip( 'colorDiffuse', 10, [ track ] );
	//console.log( 'diffuseClip', clip );

	return clip;
};

