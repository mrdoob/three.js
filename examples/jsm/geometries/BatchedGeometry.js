import {
	BufferAttribute,
	BufferGeometry,
	DynamicDrawUsage,
	Matrix3,
	Matrix4,
	Vector3
} from 'three';

// Arbitary numbers
const DEFAULT_MAX_VERTEX_COUNT = 1024 * 256;
const DEFAULT_MAX_INDEX_COUNT = 1024 * 256;

const _v3 = new Vector3();
const _m3 = new Matrix3();

const updatePositions = ( start, count, attribute, array, matrix ) => {

	for ( let i = 0; i < count; i ++ ) {

		_v3.fromArray( array, ( start + i ) * 3 ).applyMatrix4( matrix );
		attribute.setXYZ( start + i, _v3.x, _v3.y, _v3.z );

	}

	attribute.needsUpdate = true;

};

const updateNormals = ( start, count, attribute, array, matrix ) => {

	_m3.getNormalMatrix( matrix );

	for ( let i = 0; i < count; i ++ ) {

		_v3.fromArray( array, ( start + i ) * 3 ).applyMatrix3( _m3 );
		attribute.setXYZ( start + i, _v3.x, _v3.y, _v3.z );

	}

	attribute.needsUpdate = true;

};

const makeInvisibleWithPositionAttribute = ( start, count, attribute ) => {

	for ( let i = 0; i < count; i ++ ) {

		attribute.setXYZ( start + i, 0, 0, 0 );

	}

	attribute.needsUpdate = true;

};

const makeInvisibleWithIndex = ( start, count, index ) => {

	for ( let i = 0; i < count; i ++ ) {

		index.setX( start + i, 0 );

	}

	index.needsUpdate = true;

};

class BatchedGeometry extends BufferGeometry {

	constructor( maxVertexCount = DEFAULT_MAX_VERTEX_COUNT, maxIndexCount = DEFAULT_MAX_INDEX_COUNT ) {

		super();

		this._vertexStarts = [];
		this._vertexCounts = [];
		this._indexStarts = [];
		this._indexCounts = [];
		this._matrices = [];
		this._visibilities = [];
		this._alives = [];

		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		// originalArray might be a better name?
		this._copiedArrays = {
			position: null,
			normal: null,
			index: null
		};

		this._initialized = false;
		this._currentGeometryCount = 0;
		this._currentVertexCount = 0;
		this._currentIndexCount = 0;

	}

	apply( geometry ) {

		// @TODO: geometry.groups support?
		// @TODO: geometry.drawRange support?
		// @TODO: geometry.mortphAttributes support

		if ( this._initialized === false ) {

			for ( const attributeName in geometry.attributes ) {

				const srcAttribute = geometry.getAttribute( attributeName );
				const { array, itemSize, normalized } = srcAttribute;

				const dstArray = new array.constructor( this._maxVertexCount * itemSize );
				const dstAttribute = new srcAttribute.constructor( dstArray, itemSize, normalized );

				// Updating the BufferAttribute.count property is invalid?
				dstAttribute.count = 0;

				// @TODO: Dynamic usage for position and normal?

				if ( attributeName === 'position' || attributeName === 'normal' ) {

					this._copiedArrays[ attributeName ] = dstArray.slice();
					dstAttribute.setUsage( DynamicDrawUsage );

				} else {

					dstAttribute.setUsage( srcAttribute.usage );

				}

				this.setAttribute( attributeName, dstAttribute );

			}

			if ( geometry.getIndex() !== null ) {

				const indexArray = this._maxIndexCount > 65534
					? new Uint32Array( this._maxIndexCount )
					: new Uint16Array( this._maxIndexCount );

				const index = new BufferAttribute( indexArray, 1 );
				index.count = 0;
				index.setUsage( DynamicDrawUsage );
				this.setIndex( index );
				this._copiedArrays.index = indexArray.slice();

			}

			this._initialized = true;

		} else {

			// @TODO: Return with warning if geometry doesn't have the same attribute set

		}

		const hasIndex = this.getIndex() !== null;
		const dstIndex = this.getIndex();
		const srcIndex = geometry.getIndex();

		// Assuming geometry has position attribute
		const srcPositionAttribute = geometry.getAttribute( 'position' );

		this._vertexStarts.push( this._currentVertexCount );
		this._vertexCounts.push( srcPositionAttribute.count );

		if ( hasIndex ) {

			this._indexStarts.push( this._currentIndexCount );
			this._indexCounts.push( srcIndex.count );

		}

		this._matrices.push( new Matrix4() );
		this._visibilities.push( true );
		this._alives.push( true );

		// @TODO: Error handling if exceeding maxVertexCount or maxIndexCount

		for ( const attributeName in geometry.attributes ) {

			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = this.getAttribute( attributeName );

			dstAttribute.set( srcAttribute.array, this._currentVertexCount * dstAttribute.itemSize );
			dstAttribute.count += srcPositionAttribute.count;
			dstAttribute.needsUpdate = true;

			if ( attributeName === 'position' || attributeName === 'normal' ) {

				this._copiedArrays[ attributeName ].set( srcAttribute.array, this._currentVertexCount * dstAttribute.itemSize );

			}

		}

		if ( hasIndex ) {

			for ( let i = 0; i < srcIndex.count; i ++ ) {

				const value = srcIndex.getX( i );
				dstIndex.setX( this._currentIndexCount + i, this._currentVertexCount + value );
				this._copiedArrays.index[ this._currentIndexCount + i ] = value;

			}

			this._currentIndexCount += srcIndex.count;
			dstIndex.count = this._currentIndexCount;
			dstIndex.needsUpdate = true;

		}

		this._currentVertexCount += srcPositionAttribute.count;
		

		const geometryId = this._currentGeometryCount;
		this._currentGeometryCount ++;
		return geometryId;

	}

	remove( geometryId ) {

		if ( geometryId >= this._alives.length || this._alives[ geometryId ] === false ) {

			// @TODO: Warning?
			return this;

		}

		this._alives[ geometryId ] = false;

		const index = this.getIndex();

		if ( index !== null ) {

			const start = this._indexStarts[ geometryId ];
			const count = this._indexCounts[ geometryId ];
			makeInvisibleWithIndex( start, count, index );

		} else {

			const start = this._vertexStarts[ geometryId ];
			const count = this._vertexCounts[ geometryId ];
			makeInvisibleWithPositionAttribute( start, count, this.getAttribute( 'position' ) );

		}

		// User needs to call optimize() to pack the data.

		return this;

	}

	setMatrixAt( geometryId, matrix ) {
		
		if ( geometryId >= this._matrices.length || this._alives[ geometryId ] === false ) {

			// @TODO: Warning?
			return this;

		}

		this._matrices[ geometryId ].copy( matrix );

		if ( this._visibilities[ geometryId ] === false ) {

			return this;

		}

		const start = this._vertexStarts[ geometryId ];
		const count = this._vertexCounts[ geometryId ];
		updatePositions( start, count, this.getAttribute( 'position' ),
			this._copiedArrays.position, matrix );
		updateNormals( start, count, this.getAttribute( 'normal' ),
			this._copiedArrays.normal, matrix );

		return this;

	}

	getMatrixAt( geometryId, matrix ) {

		if ( geometryId >= this._matrices.length || this._alives[ geometryId ] === false ) {

			// @TODO: Warning?
			return matrix;

		}

		return matrix.copy( this._matrices[ geometryId ] );

	}

	setVisibilityAt( geometryId, visibility ) {

		if ( geometryId >= this._visibilities.length || this._alives[ geometryId ] === false ) {

			// @TODO: Warning?
			return this;

		}

		if ( this._visibilities[ geometryId ] === visibility ) {

			return this;

		}

		const index = this.getIndex();

		if ( index !== null ) {

			const start = this._indexStarts[ geometryId ];
			const count = this._indexCounts[ geometryId ];

			if ( visibility === true ) {

				const copiedArray = this._copiedArrays.index;
				const vertexStart = this._vertexStarts[ geometryId ];

				for ( let i = 0; i < count; i ++ ) {

					index.setX( start + i, vertexStart + copiedArray[ start + i ] );

				}

				index.needsUpdate = true;

			} else {

				makeInvisibleWithIndex( start, count, index );

			}

		} else {

			const attribute = this.getAttribute( 'position' );
			const start = this._vertexStarts[ geometryId ];
			const count = this._vertexCounts[ geometryId ];

			if ( visibility === true ) {

				const copiedArray = this._copiedArrays.position;
				const matrix = this._matrices[ geometryId ];
				updatePositions( start, count, attribute, copiedArray, matrix );

			} else {

				makeInvisibleWithPositionAttribute( start, count, attribute );

			}

		}

		this._visibilities[ geometryId ] = visibility;
		return this;

	}

	getVisibilityAt( geometryId ) {

		if ( geometryId >= this._visibilities.length || this._alives[ geometryId ] === false ) {

			// @TODO: Warning?
			return false;

		}

		return this._visibilities[ geometryId ];

	}

	// @TODO: Rename to better name, like deflag or pack?
	optimize() {

		// @TODO: Implement

		return this;

	}

	// @TODO: Support frustum culling

}

export { BatchedGeometry };
