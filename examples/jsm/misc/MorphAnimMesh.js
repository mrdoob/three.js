import {
	AnimationClip,
	AnimationMixer,
	Mesh
} from 'three';

/**
 * A special type of an animated mesh with a simple interface
 * for animation playback. It allows to playback just one animation
 * without any transitions or fading between animation changes.
 *
 * @augments Mesh
 */
class MorphAnimMesh extends Mesh {

	/**
	 * Constructs a new morph anim mesh.
	 *
	 * @param {BufferGeometry} [geometry] - The mesh geometry.
	 * @param {Material|Array<Material>} [material] - The mesh material.
	 */
	constructor( geometry, material ) {

		super( geometry, material );

		this.type = 'MorphAnimMesh';

		/**
		 * The internal animation mixer.
		 *
		 * @type {AnimationMixer}
		 */
		this.mixer = new AnimationMixer( this );

		/**
		 * The current active animation action.
		 *
		 * @type {?AnimationAction}
		 * @default null
		 */
		this.activeAction = null;

	}

	/**
	 * Sets the animation playback direction to "forward".
	 */
	setDirectionForward() {

		this.mixer.timeScale = 1.0;

	}

	/**
	 * Sets the animation playback direction to "backward".
	 */
	setDirectionBackward() {

		this.mixer.timeScale = - 1.0;

	}

	/**
	 * Plays the defined animation clip. The implementation assumes the animation
	 * clips are stored in {@link Object3D#animations} or the geometry.
	 *
	 * @param {string} label - The name of the animation clip.
	 * @param {number} fps - The FPS of the animation clip.
	 */
	playAnimation( label, fps ) {

		if ( this.activeAction ) {

			this.activeAction.stop();
			this.activeAction = null;

		}

		const clip = AnimationClip.findByName( this, label );

		if ( clip ) {

			const action = this.mixer.clipAction( clip );
			action.timeScale = ( clip.tracks.length * fps ) / clip.duration;
			this.activeAction = action.play();

		} else {

			throw new Error( 'THREE.MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()' );

		}

	}

	/**
	 * Updates the animations of the mesh. Must be called inside the animation loop.
	 *
	 * @param {number} delta - The delta time in seconds.
	 */
	updateAnimation( delta ) {

		this.mixer.update( delta );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.mixer = new AnimationMixer( this );

		return this;

	}

}

export { MorphAnimMesh };
