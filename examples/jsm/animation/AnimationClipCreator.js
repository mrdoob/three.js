import {
	AnimationClip,
	BooleanKeyframeTrack,
	ColorKeyframeTrack,
	NumberKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from 'three';

/**
 * A utility class with factory methods for creating basic animation clips.
 *
 * @hideconstructor
 */
class AnimationClipCreator {

	/**
	 * Creates an animation clip that rotates a 3D object 360 degrees
	 * in the given period of time around the given axis.
	 *
	 * @param {number} period - The duration of the animation.
	 * @param {('x'|'y'|'z')} [axis='x'] - The axis of rotation.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreateRotationAnimation( period, axis = 'x' ) {

		const times = [ 0, period ], values = [ 0, 360 ];

		const trackName = '.rotation[' + axis + ']';

		const track = new NumberKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', period, [ track ] );

	}

	/**
	 * Creates an animation clip that scales a 3D object from `0` to `1`
	 * in the given period of time along the given axis.
	 *
	 * @param {number} period - The duration of the animation.
	 * @param {('x'|'y'|'z')} [axis='x'] - The axis to scale the 3D object along.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreateScaleAxisAnimation( period, axis = 'x' ) {

		const times = [ 0, period ], values = [ 0, 1 ];

		const trackName = '.scale[' + axis + ']';

		const track = new NumberKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', period, [ track ] );

	}

	/**
	 * Creates an animation clip that translates a 3D object in a shake pattern
	 * in the given period.
	 *
	 * @param {number} duration - The duration of the animation.
	 * @param {Vector3} shakeScale - The scale of the shake.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreateShakeAnimation( duration, shakeScale ) {

		const times = [], values = [], tmp = new Vector3();

		for ( let i = 0; i < duration * 10; i ++ ) {

			times.push( i / 10 );

			tmp.set( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).
				multiply( shakeScale ).
				toArray( values, values.length );

		}

		const trackName = '.position';

		const track = new VectorKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', duration, [ track ] );

	}

	/**
	 * Creates an animation clip that scales a 3D object in a pulse pattern
	 * in the given period.
	 *
	 * @param {number} duration - The duration of the animation.
	 * @param {number} pulseScale - The scale of the pulse.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreatePulsationAnimation( duration, pulseScale ) {

		const times = [], values = [], tmp = new Vector3();

		for ( let i = 0; i < duration * 10; i ++ ) {

			times.push( i / 10 );

			const scaleFactor = Math.random() * pulseScale;
			tmp.set( scaleFactor, scaleFactor, scaleFactor ).
				toArray( values, values.length );

		}

		const trackName = '.scale';

		const track = new VectorKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', duration, [ track ] );

	}

	/**
	 * Creates an animation clip that toggles the visibility of a 3D object.
	 *
	 * @param {number} duration - The duration of the animation.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreateVisibilityAnimation( duration ) {

		const times = [ 0, duration / 2, duration ], values = [ true, false, true ];

		const trackName = '.visible';

		const track = new BooleanKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', duration, [ track ] );

	}

	/**
	 * Creates an animation clip that animates the `color` property of a 3D object's
	 * material.
	 *
	 * @param {number} duration - The duration of the animation.
	 * @param {Array<Color>} colors - An array of colors that should be sequentially animated.
	 * @return {AnimationClip} The created animation clip.
	 */
	static CreateMaterialColorAnimation( duration, colors ) {

		const times = [], values = [],
			timeStep = ( colors.length > 1 ) ? duration / ( colors.length - 1 ) : 0;

		for ( let i = 0; i < colors.length; i ++ ) {

			times.push( i * timeStep );

			const color = colors[ i ];
			values.push( color.r, color.g, color.b );

		}

		const trackName = '.material.color';

		const track = new ColorKeyframeTrack( trackName, times, values );

		return new AnimationClip( '', duration, [ track ] );

	}

}

export { AnimationClipCreator };
