import {
	MathUtils,
	Mesh
} from 'three';

/**
 * A special type of an animated mesh with a more advanced interface
 * for animation playback. Unlike {@link MorphAnimMesh}. It allows to
 * playback more than one morph animation at the same time but without
 * fading options.
 *
 * @augments Mesh
 * @three_import import { MorphBlendMesh } from 'three/addons/misc/MorphBlendMesh.js';
 */
class MorphBlendMesh extends Mesh {

	/**
	 * Constructs a new morph blend mesh.
	 *
	 * @param {BufferGeometry} [geometry] - The mesh geometry.
	 * @param {Material|Array<Material>} [material] - The mesh material.
	 */
	constructor( geometry, material ) {

		super( geometry, material );

		/**
		 * A dictionary of animations.
		 *
		 * @type {Object<string,Object>}
		 */
		this.animationsMap = {};

		/**
		 * A list of animations.
		 *
		 * @type {Array<Object>}
		 */
		this.animationsList = [];

		// prepare default animation
		// (all frames played together in 1 second)

		const numFrames = Object.keys( this.morphTargetDictionary ).length;

		const name = '__default';

		const startFrame = 0;
		const endFrame = numFrames - 1;

		const fps = numFrames / 1;

		this.createAnimation( name, startFrame, endFrame, fps );
		this.setAnimationWeight( name, 1 );

	}

	/**
	 * Creates a new animation.
	 *
	 * @param {string} name - The animation name.
	 * @param {number} start - The start time.
	 * @param {number} end - The end time.
	 * @param {number} fps - The FPS.
	 */
	createAnimation( name, start, end, fps ) {

		const animation = {

			start: start,
			end: end,

			length: end - start + 1,

			fps: fps,
			duration: ( end - start ) / fps,

			lastFrame: 0,
			currentFrame: 0,

			active: false,

			time: 0,
			direction: 1,
			weight: 1,

			directionBackwards: false,
			mirroredLoop: false

		};

		this.animationsMap[ name ] = animation;
		this.animationsList.push( animation );

	}

	/**
	 * Automatically creates animations based on the values in
	 * {@link Mesh#morphTargetDictionary}.
	 *
	 * @param {number} fps - The FPS of all animations.
	 */
	autoCreateAnimations( fps ) {

		const pattern = /([a-z]+)_?(\d+)/i;

		let firstAnimation;

		const frameRanges = {};

		let i = 0;

		for ( const key in this.morphTargetDictionary ) {

			const chunks = key.match( pattern );

			if ( chunks && chunks.length > 1 ) {

				const name = chunks[ 1 ];

				if ( ! frameRanges[ name ] ) frameRanges[ name ] = { start: Infinity, end: - Infinity };

				const range = frameRanges[ name ];

				if ( i < range.start ) range.start = i;
				if ( i > range.end ) range.end = i;

				if ( ! firstAnimation ) firstAnimation = name;

			}

			i ++;

		}

		for ( const name in frameRanges ) {

			const range = frameRanges[ name ];
			this.createAnimation( name, range.start, range.end, fps );

		}

		this.firstAnimation = firstAnimation;

	}

	/**
	 * Sets the animation playback direction to "forward" for the
	 * defined animation.
	 *
	 * @param {string} name - The animation name.
	 */
	setAnimationDirectionForward( name ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.direction = 1;
			animation.directionBackwards = false;

		}

	}

	/**
	 * Sets the animation playback direction to "backward" for the
	 * defined animation.
	 *
	 * @param {string} name - The animation name.
	 */
	setAnimationDirectionBackward( name ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.direction = - 1;
			animation.directionBackwards = true;

		}

	}

	/**
	 * Sets the FPS to the given value for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @param {number} fps - The FPS to set.
	 */
	setAnimationFPS( name, fps ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.fps = fps;
			animation.duration = ( animation.end - animation.start ) / animation.fps;

		}

	}

	/**
	 * Sets the duration to the given value for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @param {number} duration - The duration to set.
	 */
	setAnimationDuration( name, duration ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.duration = duration;
			animation.fps = ( animation.end - animation.start ) / animation.duration;

		}

	}

	/**
	 * Sets the weight to the given value for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @param {number} weight - The weight to set.
	 */
	setAnimationWeight( name, weight ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.weight = weight;

		}

	}

	/**
	 * Sets the time to the given value for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @param {number} time - The time to set.
	 */
	setAnimationTime( name, time ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.time = time;

		}

	}

	/**
	 * Returns the time for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @return {number} The time.
	 */
	getAnimationTime( name ) {

		let time = 0;

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			time = animation.time;

		}

		return time;

	}

	/**
	 * Returns the duration for the defined animation.
	 *
	 * @param {string} name - The animation name.
	 * @return {number} The duration.
	 */
	getAnimationDuration( name ) {

		let duration = - 1;

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			duration = animation.duration;

		}

		return duration;

	}

	/**
	 * Plays the defined animation.
	 *
	 * @param {string} name - The animation name.
	 */
	playAnimation( name ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.time = 0;
			animation.active = true;

		} else {

			console.warn( 'THREE.MorphBlendMesh: animation[' + name + '] undefined in .playAnimation()' );

		}

	}

	/**
	 * Stops the defined animation.
	 *
	 * @param {string} name - The animation name.
	 */
	stopAnimation( name ) {

		const animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.active = false;

		}

	}

	/**
	 * Updates the animations of the mesh.
	 *
	 * @param {number} delta - The delta time in seconds.
	 */
	update( delta ) {

		for ( let i = 0, il = this.animationsList.length; i < il; i ++ ) {

			const animation = this.animationsList[ i ];

			if ( ! animation.active ) continue;

			const frameTime = animation.duration / animation.length;

			animation.time += animation.direction * delta;

			if ( animation.mirroredLoop ) {

				if ( animation.time > animation.duration || animation.time < 0 ) {

					animation.direction *= - 1;

					if ( animation.time > animation.duration ) {

						animation.time = animation.duration;
						animation.directionBackwards = true;

					}

					if ( animation.time < 0 ) {

						animation.time = 0;
						animation.directionBackwards = false;

					}

				}

			} else {

				animation.time = animation.time % animation.duration;

				if ( animation.time < 0 ) animation.time += animation.duration;

			}

			const keyframe = animation.start + MathUtils.clamp( Math.floor( animation.time / frameTime ), 0, animation.length - 1 );
			const weight = animation.weight;

			if ( keyframe !== animation.currentFrame ) {

				this.morphTargetInfluences[ animation.lastFrame ] = 0;
				this.morphTargetInfluences[ animation.currentFrame ] = 1 * weight;

				this.morphTargetInfluences[ keyframe ] = 0;

				animation.lastFrame = animation.currentFrame;
				animation.currentFrame = keyframe;

			}

			let mix = ( animation.time % frameTime ) / frameTime;

			if ( animation.directionBackwards ) mix = 1 - mix;

			if ( animation.currentFrame !== animation.lastFrame ) {

				this.morphTargetInfluences[ animation.currentFrame ] = mix * weight;
				this.morphTargetInfluences[ animation.lastFrame ] = ( 1 - mix ) * weight;

			} else {

				this.morphTargetInfluences[ animation.currentFrame ] = weight;

			}

		}

	}

}

export { MorphBlendMesh };
