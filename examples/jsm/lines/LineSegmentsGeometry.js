import {
	Box3,
	Float32BufferAttribute,
	InstancedBufferGeometry,
	InstancedInterleavedBuffer,
	InterleavedBufferAttribute,
	Sphere,
	Vector3,
	WireframeGeometry
} from 'three';

const _box = new Box3();
const _vector = new Vector3();

/**
 * A series of vertex pairs, forming line segments.
 *
 * This is used in {@link LineSegments2} to describe the shape.
 *
 * @augments InstancedBufferGeometry
 */
class LineSegmentsGeometry extends InstancedBufferGeometry {

	/**
	 * Constructs a new line segments geometry.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLineSegmentsGeometry = true;

		this.type = 'LineSegmentsGeometry';

		const positions = [ - 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0 ];
		const uvs = [ - 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2 ];
		const index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ];

		this.setIndex( index );
		this.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	/**
	 * Applies the given 4x4 transformation matrix to the geometry.
	 *
	 * @param {Matrix4} matrix - The matrix to apply.
	 * @return {LineSegmentsGeometry} A reference to this instance.
	 */
	applyMatrix4( matrix ) {

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined ) {

			start.applyMatrix4( matrix );

			end.applyMatrix4( matrix );

			start.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	/**
	 * Sets the given line positions for this geometry. The length must be a multiple of six since
	 * each line segment is defined by a start end vertex in the pattern `(xyz xyz)`.
	 *
	 * @param {Float32Array|Array<number>} array - The position data to set.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	setPositions( array ) {

		let lineSegments;

		if ( array instanceof Float32Array ) {

			lineSegments = array;

		} else if ( Array.isArray( array ) ) {

			lineSegments = new Float32Array( array );

		}

		const instanceBuffer = new InstancedInterleavedBuffer( lineSegments, 6, 1 ); // xyz, xyz

		this.setAttribute( 'instanceStart', new InterleavedBufferAttribute( instanceBuffer, 3, 0 ) ); // xyz
		this.setAttribute( 'instanceEnd', new InterleavedBufferAttribute( instanceBuffer, 3, 3 ) ); // xyz

		this.instanceCount = this.attributes.instanceStart.count;

		//

		this.computeBoundingBox();
		this.computeBoundingSphere();

		return this;

	}

	/**
	 * Sets the given line colors for this geometry. The length must be a multiple of six since
	 * each line segment is defined by a start end color in the pattern `(rgb rgb)`.
	 *
	 * @param {Float32Array|Array<number>} array - The position data to set.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	setColors( array ) {

		let colors;

		if ( array instanceof Float32Array ) {

			colors = array;

		} else if ( Array.isArray( array ) ) {

			colors = new Float32Array( array );

		}

		const instanceColorBuffer = new InstancedInterleavedBuffer( colors, 6, 1 ); // rgb, rgb

		this.setAttribute( 'instanceColorStart', new InterleavedBufferAttribute( instanceColorBuffer, 3, 0 ) ); // rgb
		this.setAttribute( 'instanceColorEnd', new InterleavedBufferAttribute( instanceColorBuffer, 3, 3 ) ); // rgb

		return this;

	}

	/**
	 * Setups this line segments geometry from the given wireframe geometry.
	 *
	 * @param {WireframeGeometry} geometry - The geometry that should be used as a data source for this geometry.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	fromWireframeGeometry( geometry ) {

		this.setPositions( geometry.attributes.position.array );

		return this;

	}

	/**
	 * Setups this line segments geometry from the given edges geometry.
	 *
	 * @param {EdgesGeometry} geometry - The geometry that should be used as a data source for this geometry.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	fromEdgesGeometry( geometry ) {

		this.setPositions( geometry.attributes.position.array );

		return this;

	}

	/**
	 * Setups this line segments geometry from the given mesh.
	 *
	 * @param {Mesh} mesh - The mesh geometry that should be used as a data source for this geometry.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	fromMesh( mesh ) {

		this.fromWireframeGeometry( new WireframeGeometry( mesh.geometry ) );

		// set colors, maybe

		return this;

	}

	/**
	 * Setups this line segments geometry from the given line segments.
	 *
	 * @param {LineSegments} lineSegments - The line segments that should be used as a data source for this geometry.
	 * Assumes the source geometry is not using indices.
	 * @return {LineSegmentsGeometry} A reference to this geometry.
	 */
	fromLineSegments( lineSegments ) {

		const geometry = lineSegments.geometry;

		this.setPositions( geometry.attributes.position.array ); // assumes non-indexed

		// set colors, maybe

		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined && end !== undefined ) {

			this.boundingBox.setFromBufferAttribute( start );

			_box.setFromBufferAttribute( end );

			this.boundingBox.union( _box );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		if ( this.boundingBox === null ) {

			this.computeBoundingBox();

		}

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined && end !== undefined ) {

			const center = this.boundingSphere.center;

			this.boundingBox.getCenter( center );

			let maxRadiusSq = 0;

			for ( let i = 0, il = start.count; i < il; i ++ ) {

				_vector.fromBufferAttribute( start, i );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

				_vector.fromBufferAttribute( end, i );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this );

			}

		}

	}

	toJSON() {

		// todo

	}

}

export { LineSegmentsGeometry };
