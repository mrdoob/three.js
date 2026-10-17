import { Box3, Box3Helper, Mesh, MeshStandardMaterial, Object3D, SphereGeometry, Vector3 } from 'three/webgpu';

const _position = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector3();

/**
 * Visualizes a {@link ReflectionProbes} set: a mirror sphere at each capture
 * position and the outline of each influence volume.
 *
 * ```js
 * const helper = new ReflectionProbesHelper( probes );
 * scene.add( helper );
 * ```
 *
 * @augments Object3D
 * @three_import import { ReflectionProbesHelper } from 'three/addons/helpers/ReflectionProbesHelper.js';
 */
class ReflectionProbesHelper extends Object3D {

	/**
	 * Constructs a new reflection probes helper.
	 *
	 * @param {ReflectionProbes} probes - The probe set to visualize.
	 * @param {number} [sphereSize=0.25] - The radius of each probe sphere.
	 * @param {number|Color|string} [color=0xffff00] - The color of the influence volumes.
	 */
	constructor( probes, sphereSize = 0.25, color = 0xffff00 ) {

		super();

		/**
		 * The probe set to visualize.
		 *
		 * @type {ReflectionProbes}
		 */
		this.probes = probes;

		/**
		 * The mirror material of the probe spheres.
		 *
		 * @type {MeshStandardMaterial}
		 */
		this.material = new MeshStandardMaterial( { metalness: 1, roughness: 0 } );

		this.type = 'ReflectionProbesHelper';

		this.color = color;

		this._geometry = new SphereGeometry( sphereSize, 32, 16 );

		this.update();

	}

	/**
	 * Rebuilds the spheres and volumes. Call this after adding, removing or
	 * moving probes.
	 */
	update() {

		this._clear();

		this.probes.updateWorldMatrix( true, true );

		for ( const probe of this.probes.children ) {

			if ( probe.isReflectionProbe !== true ) continue;

			probe.getWorldPosition( _position );
			probe.getWorldScale( _size ).multiply( probe.influenceSize );

			const sphere = new Mesh( this._geometry, this.material );
			sphere.position.copy( _position );

			const box = new Box3Helper( new Box3().setFromCenterAndSize( _position, _size ), this.color );

			this.add( sphere, box );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._clear();
		this._geometry.dispose();
		this.material.dispose();

	}

	_clear() {

		for ( const child of [ ...this.children ] ) {

			if ( child.isLineSegments ) child.dispose();

			this.remove( child );

		}

	}

}

export { ReflectionProbesHelper };
