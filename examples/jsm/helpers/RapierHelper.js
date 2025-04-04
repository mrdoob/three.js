import { LineSegments, LineBasicMaterial, BufferAttribute } from 'three';
/**
 * This class displays all Rapier Colliders in outline.
 *
 * @augments LineSegments
 * @three_import import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
 */
class RapierHelper extends LineSegments {

	/**
	 * Constructs a new Rapier debug helper.
	 *
	 * @param {RAPIER.world} world - The Rapier world to visualize.
	 */
	constructor( world ) {

		super();

		/**
		 * The Rapier world to visualize.
		 *
		 * @type {RAPIER.world}
		 */
		this.world = world;

		this.material = new LineBasicMaterial( { vertexColors: true } );
		this.frustumCulled = false;

	}

	/**
	 * Call this in the render loop to update the outlines.
	 */
	update() {

		const { vertices, colors } = this.world.debugRender();

		this.geometry.deleteAttribute( 'position' );
		this.geometry.deleteAttribute( 'color' );

		this.geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
		this.geometry.setAttribute( 'color', new BufferAttribute( colors, 4 ) );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { RapierHelper };
