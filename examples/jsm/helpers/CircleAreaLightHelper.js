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
 * Creates a visual aid for circle area lights.
 *
 * `CircleAreaLightHelper` must be added as a child of the light.
 *
 * ```js
 * const light = new THREE.CircleAreaLight( 0xffffbb, 1.0, 5 );
 * const helper = new CircleAreaLightHelper( light );
 * light.add( helper );
 * ```
 *
 * @augments Line
 * @three_import import { CircleAreaLightHelper } from 'three/addons/helpers/CircleAreaLightHelper.js';
 */
class CircleAreaLightHelper extends Line {

	/**
	 * Constructs a new circle area light helper.
	 *
	 * @param {CircleAreaLight} light - The light to visualize.
	 * @param {number|Color|string} [color] - The helper's color.
	 * If this is not the set, the helper will take the color of the light.
	 */
	constructor( light, color ) {

		// Create circle outline (32 segments for smooth appearance)
		const segments = 32;
		const positions = [];

		for ( let i = 0; i <= segments; i ++ ) {

			const angle = ( i / segments ) * Math.PI * 2;
			positions.push( Math.cos( angle ), Math.sin( angle ), 0 );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.computeBoundingSphere();

		const material = new LineBasicMaterial( { fog: false } );

		super( geometry, material );

		/**
		 * The light to visualize.
		 *
		 * @type {CircleAreaLight}
		 */
		this.light = light;

		/**
		 * The helper's color. If `undefined`, the helper will take the color of the light.
		 *
		 * @type {number|Color|string|undefined}
		 */
		this.color = color;

		this.type = 'CircleAreaLightHelper';

		//

		// Create filled circle mesh (triangulated circle)
		const positions2 = [];

		// Center vertex
		positions2.push( 0, 0, 0 );

		// Circle vertices
		for ( let i = 0; i <= segments; i ++ ) {

			const angle = ( i / segments ) * Math.PI * 2;
			positions2.push( Math.cos( angle ), Math.sin( angle ), 0 );

		}

		// Create triangle fan indices
		const indices = [];
		for ( let i = 0; i < segments; i ++ ) {

			indices.push( 0, i + 1, i + 2 );

		}

		const geometry2 = new BufferGeometry();
		geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
		geometry2.setIndex( indices );
		geometry2.computeBoundingSphere();

		this.add( new Mesh( geometry2, new MeshBasicMaterial( { side: BackSide, fog: false } ) ) );

	}

	updateMatrixWorld() {

		this.scale.set( this.light.radius, this.light.radius, 1 );

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

export { CircleAreaLightHelper };
