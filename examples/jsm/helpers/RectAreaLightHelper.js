import {
	BackSide,
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	LineBasicMaterial,
	Mesh,
	MeshBasicMaterial,
	colorCopy,
	colorMultiplyScalar,
	colorSet,
	mat4Copy,
	mat4CopyPosition,
	mat4ExtractRotation,
	mat4Scale,
	vec3Set
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
 * @three_import import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
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

		vec3Set( this.scale, 0.5 * this.light.width, 0.5 * this.light.height, 1 );

		if ( this.color !== undefined ) {

			colorSet( this.color, undefined, undefined, this.material.color );
			colorSet( this.color, undefined, undefined, this.children[ 0 ].material.color );

		} else {

			colorCopy( this.light.color, this.material.color );
			colorMultiplyScalar( this.material.color, this.light.intensity, this.material.color );

			// prevent hue shift
			const c = this.material.color;
			const max = Math.max( c.r, c.g, c.b );
			if ( max > 1 ) colorMultiplyScalar( c, 1 / max, c );

			colorCopy( this.material.color, this.children[ 0 ].material.color );

		}

		// ignore world scale on light
		mat4ExtractRotation( this.light.matrixWorld, this.matrixWorld );
		mat4Scale( this.matrixWorld, this.scale, this.matrixWorld );
		mat4CopyPosition( this.light.matrixWorld, this.matrixWorld );

		mat4Copy( this.matrixWorld, this.children[ 0 ].matrixWorld );

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
