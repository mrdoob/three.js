import {
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Object3D,
	Points,
	PointsMaterial
} from 'three';

/**
 * Visualizes the motion path of an animated object based on position keyframes
 * from an AnimationClip.
 *
 * ```js
 * const clip = model.animations[ 0 ];
 * const helper = new AnimationPathHelper( model, clip, object );
 * scene.add( helper );
 * ```
 *
 * @augments Object3D
 * @three_import import { AnimationPathHelper } from 'three/addons/helpers/AnimationPathHelper.js';
 */
class AnimationPathHelper extends Object3D {

	/**
	 * Constructs a new animation path helper.
	 *
	 * @param {Object3D} root - The root object containing the animation clips.
	 * @param {AnimationClip} clip - The animation clip containing position keyframes.
	 * @param {Object3D} object - The specific object to show the path for.
	 * @param {Object} [options={}] - Configuration options.
	 * @param {number|Color|string} [options.color=0x00ff00] - The path line color.
	 * @param {number|Color|string} [options.markerColor=0xff0000] - The keyframe marker color.
	 * @param {number} [options.divisions=100] - Number of samples for smooth path interpolation.
	 * @param {boolean} [options.showMarkers=true] - Whether to show markers at keyframe positions.
	 * @param {number} [options.markerSize=5] - Size of keyframe markers in pixels.
	 */
	constructor( root, clip, object, options = {} ) {

		super();

		const {
			color = 0x00ff00,
			markerColor = 0xff0000,
			divisions = 100,
			showMarkers = true,
			markerSize = 5
		} = options;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isAnimationPathHelper = true;

		this.type = 'AnimationPathHelper';

		/**
		 * The root object containing the animation clips.
		 *
		 * @type {Object3D}
		 */
		this.root = root;

		/**
		 * The animation clip containing position keyframes.
		 *
		 * @type {AnimationClip}
		 */
		this.clip = clip;

		/**
		 * The object whose path is being visualized.
		 *
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * Number of samples for smooth path interpolation.
		 *
		 * @type {number}
		 * @default 100
		 */
		this.divisions = divisions;

		/**
		 * The position track for the object.
		 *
		 * @type {KeyframeTrack|null}
		 * @private
		 */
		this._track = this._findTrackForObject( object );

		if ( this._track === null ) {

			console.warn( 'AnimationPathHelper: No position track found for object', object.name );
			return;

		}

		// Create line for path
		const lineGeometry = new BufferGeometry();
		const lineMaterial = new LineBasicMaterial( {
			color: color,
			toneMapped: false
		} );

		/**
		 * The line representing the animation path.
		 *
		 * @type {Line}
		 */
		this.line = new Line( lineGeometry, lineMaterial );
		this.add( this.line );

		// Create points for keyframe markers
		if ( showMarkers ) {

			const pointsGeometry = new BufferGeometry();
			const pointsMaterial = new PointsMaterial( {
				color: markerColor,
				size: markerSize,
				sizeAttenuation: false,
				toneMapped: false
			} );

			/**
			 * Points marking keyframe positions.
			 *
			 * @type {Points|null}
			 */
			this.points = new Points( pointsGeometry, pointsMaterial );
			this.add( this.points );

		} else {

			this.points = null;

		}

		// Sync matrix with object's parent
		this.matrixAutoUpdate = false;

		this._updateGeometry();

	}

	/**
	 * Finds the position track for the given object.
	 *
	 * @private
	 * @param {Object3D} object - The object to find the track for.
	 * @returns {KeyframeTrack|null} The position track, or null if not found.
	 */
	_findTrackForObject( object ) {

		const targetName = object.uuid + '.position';

		for ( const track of this.clip.tracks ) {

			if ( track.name === targetName && track.getValueSize() === 3 ) {

				return track;

			}

		}

		return null;

	}

	/**
	 * Samples the track at regular intervals.
	 *
	 * @private
	 * @returns {Float32Array} Array of sampled positions.
	 */
	_sampleTrack() {

		const track = this._track;
		const interpolant = track.createInterpolant();
		const duration = this.clip.duration;
		const positions = [];

		for ( let i = 0; i <= this.divisions; i ++ ) {

			const t = ( i / this.divisions ) * duration;
			const result = interpolant.evaluate( t );
			positions.push( result[ 0 ], result[ 1 ], result[ 2 ] );

		}

		return new Float32Array( positions );

	}

	/**
	 * Updates the geometry with sampled path data.
	 *
	 * @private
	 */
	_updateGeometry() {

		if ( this._track === null ) return;

		// Update line geometry
		const sampledPositions = this._sampleTrack();
		this.line.geometry.setAttribute( 'position', new Float32BufferAttribute( sampledPositions, 3 ) );
		this.line.geometry.computeBoundingSphere();

		// Update keyframe markers
		if ( this.points !== null ) {

			this.points.geometry.setAttribute( 'position', new Float32BufferAttribute( new Float32Array( this._track.values ), 3 ) );
			this.points.geometry.computeBoundingSphere();

		}

	}

	/**
	 * Updates the helper's transform to match the object's parent.
	 *
	 * @param {boolean} force - Force matrix update.
	 */
	updateMatrixWorld( force ) {

		// Position the helper at the object's parent so the path appears in correct local space
		if ( this.object && this.object.parent ) {

			this.object.parent.updateWorldMatrix( true, false );
			this.matrix.copy( this.object.parent.matrixWorld );

		} else {

			this.matrix.identity();

		}

		this.matrixWorld.copy( this.matrix );

		// Update children
		for ( let i = 0; i < this.children.length; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	}

	/**
	 * Sets the path line color.
	 *
	 * @param {number|Color|string} color - The new color.
	 */
	setColor( color ) {

		if ( this.line ) this.line.material.color.set( color );

	}

	/**
	 * Sets the keyframe marker color.
	 *
	 * @param {number|Color|string} color - The new color.
	 */
	setMarkerColor( color ) {

		if ( this.points ) this.points.material.color.set( color );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance.
	 */
	dispose() {

		if ( this.line ) {

			this.line.geometry.dispose();
			this.line.material.dispose();

		}

		if ( this.points ) {

			this.points.geometry.dispose();
			this.points.material.dispose();

		}

	}

}

export { AnimationPathHelper };
