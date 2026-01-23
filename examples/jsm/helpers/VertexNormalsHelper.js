import {
	BufferGeometry,
	Float32BufferAttribute,
	LineSegments,
	LineBasicMaterial,
	Matrix3,
	Vector3
} from 'three';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _normalMatrix = new Matrix3();

/**
 * Visualizes an object's vertex normals.
 *
 * Requires that normals have been specified in the geometry as a buffer attribute or
 * have been calculated using {@link BufferGeometry#computeVertexNormals}.
 * ```js
 * const geometry = new THREE.BoxGeometry( 10, 10, 10, 2, 2, 2 );
 * const material = new THREE.MeshStandardMaterial();
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 *
 * const helper = new VertexNormalsHelper( mesh, 1, 0xff0000 );
 * scene.add( helper );
 * ```
 *
 * @augments LineSegments
 * @three_import import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
 */
class VertexNormalsHelper extends LineSegments {

	/**
	 * Constructs a new vertex normals helper.
	 *
	 * @param {Object3D} object - The object for which to visualize vertex normals.
	 * @param {number} [size=1] - The helper's size.
	 * @param {number|Color|string} [color=0xff0000] - The helper's color.
	 */
	constructor( object, size = 1, color = 0xff0000 ) {

		const geometry = new BufferGeometry();

		const nNormals = object.geometry.attributes.normal.count;
		const positions = new Float32BufferAttribute( nNormals * 2 * 3, 3 );

		geometry.setAttribute( 'position', positions );

		super( geometry, new LineBasicMaterial( { color, toneMapped: false } ) );

		/**
		 * The object for which to visualize vertex normals.
		 *
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * The helper's size.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.size = size;

		this.type = 'VertexNormalsHelper';

		/**
		 * Overwritten and set to `false` since the object's world transformation
		 * is encoded in the helper's geometry data.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.matrixAutoUpdate = false;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isVertexNormalsHelper = true;

		this.update();

	}

	/**
	 * Updates the vertex normals preview based on the object's world transform.
	 */
	update() {

		this.object.updateMatrixWorld( true );

		_normalMatrix.getNormalMatrix( this.object.matrixWorld );

		const matrixWorld = this.object.matrixWorld;

		const position = this.geometry.attributes.position;

		//

		const objGeometry = this.object.geometry;

		if ( objGeometry ) {

			const objPos = objGeometry.attributes.position;

			const objNorm = objGeometry.attributes.normal;

			let idx = 0;

			// for simplicity, ignore index and drawcalls, and render every normal

			for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

				_v1.fromBufferAttribute( objPos, j ).applyMatrix4( matrixWorld );

				_v2.fromBufferAttribute( objNorm, j );

				_v2.applyMatrix3( _normalMatrix ).normalize().multiplyScalar( this.size ).add( _v1 );

				position.setXYZ( idx, _v1.x, _v1.y, _v1.z );

				idx = idx + 1;

				position.setXYZ( idx, _v2.x, _v2.y, _v2.z );

				idx = idx + 1;

			}

		}

		position.needsUpdate = true;

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

export { VertexNormalsHelper };
