import { Vector3 } from '../math/Vector3.js';
import { Object3D } from '../core/Object3D.js';
import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

const _vector = /*@__PURE__*/ new Vector3();

/**
 * This displays a cone shaped helper object for a {@link SpotLight}.
 *
 * ```js
 * const spotLight = new THREE.SpotLight( 0xffffff );
 * spotLight.position.set( 10, 10, 10 );
 * scene.add( spotLight );
 *
 * const spotLightHelper = new THREE.SpotLightHelper( spotLight );
 * scene.add( spotLightHelper );
 * ```
 *
 * @augments Object3D
 */
class SpotLightHelper extends Object3D {

	/**
	 * Constructs a new spot light helper.
	 *
	 * @param {HemisphereLight} light - The light to be visualized.
	 * @param {number|Color|string} [color] - The helper's color. If not set, the helper will take
	 * the color of the light.
	 */
	constructor( light, color ) {

		super();

		/**
		 * The light being visualized.
		 *
		 * @type {SpotLight}
		 */
		this.light = light;

		this.matrixAutoUpdate = false;

		/**
		 * The color parameter passed in the constructor.
		 * If not set, the helper will take the color of the light.
		 *
		 * @type {number|Color|string}
		 */
		this.color = color;

		this.type = 'SpotLightHelper';

		const geometry = new BufferGeometry();

		const positions = [
			0, 0, 0, 	0, 0, 1,
			0, 0, 0, 	1, 0, 1,
			0, 0, 0,	- 1, 0, 1,
			0, 0, 0, 	0, 1, 1,
			0, 0, 0, 	0, - 1, 1
		];

		for ( let i = 0, j = 1, l = 32; i < l; i ++, j ++ ) {

			const p1 = ( i / l ) * Math.PI * 2;
			const p2 = ( j / l ) * Math.PI * 2;

			positions.push(
				Math.cos( p1 ), Math.sin( p1 ), 1,
				Math.cos( p2 ), Math.sin( p2 ), 1
			);

		}

		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		const material = new LineBasicMaterial( { fog: false, toneMapped: false } );

		this.cone = new LineSegments( geometry, material );
		this.add( this.cone );

		this.update();

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.cone.geometry.dispose();
		this.cone.material.dispose();

	}

	/**
	 * Updates the helper to match the position and direction of the
	 * light being visualized.
	 */
	update() {

		this.light.updateWorldMatrix( true, false );
		this.light.target.updateWorldMatrix( true, false );

		// update the local matrix based on the parent and light target transforms
		if ( this.parent ) {

			this.parent.updateWorldMatrix( true );

			this.matrix
				.copy( this.parent.matrixWorld )
				.invert()
				.multiply( this.light.matrixWorld );

		} else {

			this.matrix.copy( this.light.matrixWorld );

		}

		this.matrixWorld.copy( this.light.matrixWorld );

		const coneLength = this.light.distance ? this.light.distance : 1000;
		const coneWidth = coneLength * Math.tan( this.light.angle );

		this.cone.scale.set( coneWidth, coneWidth, coneLength );

		_vector.setFromMatrixPosition( this.light.target.matrixWorld );

		this.cone.lookAt( _vector );

		if ( this.color !== undefined ) {

			this.cone.material.color.set( this.color );

		} else {

			this.cone.material.color.copy( this.light.color );

		}

	}

}


export { SpotLightHelper };
