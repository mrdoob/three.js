import {
	BufferGeometry,
	Float32BufferAttribute,
	LineSegments,
	LineBasicMaterial,
	Vector3
} from 'three';

const _v1 = new Vector3();
const _v2 = new Vector3();

/**
 * Visualizes an object's vertex tangents.
 *
 * Requires that tangents have been specified in the geometry as a buffer attribute or
 * have been calculated using {@link BufferGeometry#computeTangents}.
 * ```js
 * const helper = new VertexTangentsHelper( mesh, 1, 0xff0000 );
 * scene.add( helper );
 * ```
 *
 * @augments LineSegments
 */
class VertexTangentsHelper extends LineSegments {

	/**
	 * Constructs a new vertex tangents helper.
	 *
	 * @param {Object3D} object - The object for which to visualize vertex tangents.
	 * @param {number} [size=1] - The helper's size.
	 * @param {number|Color|string} [color=0xff0000] - The helper's color.
	 */
	constructor( object, size = 1, color = 0x00ffff ) {

		const geometry = new BufferGeometry();

		const nTangents = object.geometry.attributes.tangent.count;
		const positions = new Float32BufferAttribute( nTangents * 2 * 3, 3 );

		geometry.setAttribute( 'position', positions );

		super( geometry, new LineBasicMaterial( { color, toneMapped: false } ) );

		/**
		 * The object for which to visualize vertex tangents.
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

		this.type = 'VertexTangentsHelper';

		/**
		 * Overwritten and set to `false` since the object's world transformation
		 * is encoded in the helper's geometry data.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.matrixAutoUpdate = false;

		this.update();

	}

	/**
	 * Updates the vertex normals preview based on the object's world transform.
	 */
	update() {

		this.object.updateMatrixWorld( true );

		const matrixWorld = this.object.matrixWorld;

		const position = this.geometry.attributes.position;

		//

		const objGeometry = this.object.geometry;

		const objPos = objGeometry.attributes.position;

		const objTan = objGeometry.attributes.tangent;

		let idx = 0;

		// for simplicity, ignore index and drawcalls, and render every tangent

		for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

			_v1.fromBufferAttribute( objPos, j ).applyMatrix4( matrixWorld );

			_v2.fromBufferAttribute( objTan, j );

			_v2.transformDirection( matrixWorld ).multiplyScalar( this.size ).add( _v1 );

			position.setXYZ( idx, _v1.x, _v1.y, _v1.z );

			idx = idx + 1;

			position.setXYZ( idx, _v2.x, _v2.y, _v2.z );

			idx = idx + 1;

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

export { VertexTangentsHelper };
