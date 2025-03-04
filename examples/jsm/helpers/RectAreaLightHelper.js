import {
	BackSide,
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial
} from 'three';

/**
 * Creates a visual aid for rect area lights.
 *
 * `RectAreaLightHelper` must be added as a child of the light.
 *
 * ```js
 * const light = new THREE.RectAreaLight( 0xffffbb, 1.0, 5, 5 );
 * const helper = new RectAreaLightHelper( light );
 * light.add( helper );
 * ```
 *
 * @augments Line
 */
class RectAreaLightHelper extends Line {

	/**
	 * Constructs a new rect area light helper.
	 *
	 * @param {RectAreaLight} light - The light to visualize.
	 * @param {number|Color|string} [color] - The helper's color.
	 * If this is not the set, the helper will take the color of the light.
	 */
	constructor( light, color ) {

		const positions = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, - 1, 0, 1, 1, 0 ];

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.computeBoundingSphere();

		const material = new LineBasicMaterial( { fog: false } );

		super( geometry, material );

		/**
		 * The light to visualize.
		 *
		 * @type {RectAreaLight}
		 */
		this.light = light;

		/**
		 * The helper's color. If `undefined`, the helper will take the color of the light.
		 *
		 * @type {number|Color|string|undefined}
		 */
		this.color = color;

		this.type = 'RectAreaLightHelper';

		//

		const positions2 = [ 1, 1, 0, - 1, 1, 0, - 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];

		const geometry2 = new BufferGeometry();
		geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
		geometry2.computeBoundingSphere();

		this.add( new Mesh( geometry2, new MeshBasicMaterial( { side: BackSide, fog: false } ) ) );

	}

	updateMatrixWorld() {

		this.scale.set( 0.5 * this.light.width, 0.5 * this.light.height, 1 );

		if ( this.color !== undefined ) {

			this.material.color.set( this.color );
			this.children[ 0 ].material.color.set( this.color );

		} else {

			this.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

			// prevent hue shift
			const c = this.material.color;
			const max = Math.max( c.r, c.g, c.b );
			if ( max > 1 ) c.multiplyScalar( 1 / max );

			this.children[ 0 ].material.color.copy( this.material.color );

		}

		// ignore world scale on light
		this.matrixWorld.extractRotation( this.light.matrixWorld ).scale( this.scale ).copyPosition( this.light.matrixWorld );

		this.children[ 0 ].matrixWorld.copy( this.matrixWorld );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();
		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();

	}

}

export { RectAreaLightHelper };
