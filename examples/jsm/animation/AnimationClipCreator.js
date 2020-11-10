import {
	AnimationClip,
	BooleanKeyframeTrack,
	ColorKeyframeTrack,
	NumberKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from "../../../build/three.module.js";

var AnimationClipCreator = function () {};

AnimationClipCreator.CreateRotationAnimation = function ( period, axis ) {

	var times = [ 0, period ], values = [ 0, 360 ];

	axis = axis || 'x';
	var trackName = '.rotation[' + axis + ']';

	var track = new NumberKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, period, [ track ] );

};

AnimationClipCreator.CreateScaleAxisAnimation = function ( period, axis ) {

	var times = [ 0, period ], values = [ 0, 1 ];

	axis = axis || 'x';
	var trackName = '.scale[' + axis + ']';

	var track = new NumberKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, period, [ track ] );

};

AnimationClipCreator.CreateShakeAnimation = function ( duration, shakeScale ) {

	var times = [], values = [], tmp = new Vector3();

	for ( var i = 0; i < duration * 10; i ++ ) {

		times.push( i / 10 );

		tmp.set( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).
			multiply( shakeScale ).
			toArray( values, values.length );

	}

	var trackName = '.position';

	var track = new VectorKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, duration, [ track ] );

};


AnimationClipCreator.CreatePulsationAnimation = function ( duration, pulseScale ) {

	var times = [], values = [], tmp = new Vector3();

	for ( var i = 0; i < duration * 10; i ++ ) {

		times.push( i / 10 );

		var scaleFactor = Math.random() * pulseScale;
		tmp.set( scaleFactor, scaleFactor, scaleFactor ).
			toArray( values, values.length );

	}

	var trackName = '.scale';

	var track = new VectorKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, duration, [ track ] );

};


AnimationClipCreator.CreateVisibilityAnimation = function ( duration ) {

	var times = [ 0, duration / 2, duration ], values = [ true, false, true ];

	var trackName = '.visible';

	var track = new BooleanKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, duration, [ track ] );

};


AnimationClipCreator.CreateMaterialColorAnimation = function ( duration, colors ) {

	var times = [], values = [],
		timeStep = duration / colors.length;

	for ( var i = 0; i <= colors.length; i ++ ) {

		times.push( i * timeStep );
		values.push( colors[ i % colors.length ] );

	}

	var trackName = '.material[0].color';

	var track = new ColorKeyframeTrack( trackName, times, values );

	return new AnimationClip( null, duration, [ track ] );

};

export { AnimationClipCreator };
