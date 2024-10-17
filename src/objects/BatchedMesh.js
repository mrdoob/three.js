import { BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { DataTexture } from '../textures/DataTexture.js';
import { FloatType, RedIntegerFormat, UnsignedIntType } from '../constants.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Mesh } from './Mesh.js';
import { RGBAFormat } from '../constants.js';
import { ColorManagement } from '../math/ColorManagement.js';
import { Box3 } from '../math/Box3.js';
import { Sphere } from '../math/Sphere.js';
import { Frustum } from '../math/Frustum.js';
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';

function ascIdSort( a, b ) {

	return a - b;

}

function sortOpaque( a, b ) {

	return a.z - b.z;

}

function sortTransparent( a, b ) {

	return b.z - a.z;

}

class MultiDrawRenderList {

	constructor() {

		this.index = 0;
		this.pool = [];
		this.list = [];

	}

	push( drawRange, z, index ) {

		const pool = this.pool;
		const list = this.list;
		if ( this.index >= pool.length ) {

			pool.push( {

				start: - 1,
				count: - 1,
				z: - 1,
				index: - 1,

			} );

		}

		const item = pool[ this.index ];
		list.push( item );
		this.index ++;

		item.start = drawRange.start;
		item.count = drawRange.count;
		item.z = z;
		item.index = index;

	}

	reset() {

		this.list.length = 0;
		this.index = 0;

	}

}

const _matrix = /*@__PURE__*/ new Matrix4();
const _invMatrixWorld = /*@__PURE__*/ new Matrix4();
const _identityMatrix = /*@__PURE__*/ new Matrix4();
const _whiteColor = /*@__PURE__*/ new Color( 1, 1, 1 );
const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _frustum = /*@__PURE__*/ new Frustum();
const _box = /*@__PURE__*/ new Box3();
const _sphere = /*@__PURE__*/ new Sphere();
const _vector = /*@__PURE__*/ new Vector3();
const _forward = /*@__PURE__*/ new Vector3();
const _temp = /*@__PURE__*/ new Vector3();
const _renderList = /*@__PURE__*/ new MultiDrawRenderList();
const _mesh = /*@__PURE__*/ new Mesh();
const _batchIntersects = [];

// @TODO: SkinnedMesh support?
// @TODO: geometry.groups support?
// @TODO: geometry.drawRange support?
// @TODO: geometry.morphAttributes support?
// @TODO: Support uniform parameter per geometry

// copies data from attribute "src" into "target" starting at "targetOffset"
function copyAttributeData( src, target, targetOffset = 0 ) {

	const itemSize = target.itemSize;
	if ( src.isInterleavedBufferAttribute || src.array.constructor !== target.array.constructor ) {

		// use the component getters and setters if the array data cannot
		// be copied directly
		const vertexCount = src.count;
		for ( let i = 0; i < vertexCount; i ++ ) {

			for ( let c = 0; c < itemSize; c ++ ) {

				target.setComponent( i + targetOffset, c, src.getComponent( i, c ) );

			}

		}

	} else {

		// faster copy approach using typed array set function
		target.array.set( src.array, targetOffset * itemSize );

	}

	target.needsUpdate = true;

}

// safely copies array contents to a potentially smaller array
function copyArrayContents( src, target ) {

	if ( src.constructor !== target.constructor ) {

		// if arrays are of a different type (eg due to index size increasing) then data must be per-element copied
		const len = Math.min( src.length, target.length );
		for ( let i = 0; i < len; i ++ ) {

			target[ i ] = src[ i ];

		}

	} else {

		// if the arrays use the same data layout we can use a fast block copy
		const len = Math.min( src.length, target.length );
		target.set( new src.constructor( src.buffer, 0, len ) );

	}

}

class BatchedMesh extends Mesh {

	get maxInstanceCount() {

		return this._maxInstanceCount;

	}

	constructor( maxInstanceCount, maxVertexCount, maxIndexCount = maxVertexCount * 2, material ) {

		super( new BufferGeometry(), material );

		this.isBatchedMesh = true;
		this.perObjectFrustumCulled = true;
		this.sortObjects = true;
		this.boundingBox = null;
		this.boundingSphere = null;
		this.customSort = null;

		// stores visible, active, and geometry id per object
		this._drawInfo = [];

		// instance, geometry ids that have been set as inactive, and are available to be overwritten
		this._availableInstanceIds = [];
		this._availableGeometryIds = [];

		// geometry information
		this._drawRanges = [];
		this._reservedRanges = [];
		this._bounds = [];

		this._maxInstanceCount = maxInstanceCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		this._geometryInitialized = false;
		this._geometryCount = 0;
		this._multiDrawCounts = new Int32Array( maxInstanceCount );
		this._multiDrawStarts = new Int32Array( maxInstanceCount );
		this._multiDrawCount = 0;
		this._multiDrawInstances = null;
		this._visibilityChanged = true;

		// used to track where the next point is that geometry should be inserted
		this._nextIndexStart = 0;
		this._nextVertexStart = 0;

		// Local matrix per geometry by using data texture
		this._matricesTexture = null;
		this._indirectTexture = null;
		this._colorsTexture = null;

		this._initMatricesTexture();
		this._initIndirectTexture();

	}

	_initMatricesTexture() {

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

		let size = Math.sqrt( this._maxInstanceCount * 4 ); // 4 pixels needed for 1 matrix
		size = Math.ceil( size / 4 ) * 4;
		size = Math.max( size, 4 );

		const matricesArray = new Float32Array( size * size * 4 ); // 4 floats per RGBA pixel
		const matricesTexture = new DataTexture( matricesArray, size, size, RGBAFormat, FloatType );

		this._matricesTexture = matricesTexture;

	}

	_initIndirectTexture() {

		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );

		const indirectArray = new Uint32Array( size * size );
		const indirectTexture = new DataTexture( indirectArray, size, size, RedIntegerFormat, UnsignedIntType );

		this._indirectTexture = indirectTexture;

	}

	_initColorsTexture() {

		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );

		// 4 floats per RGBA pixel initialized to white
		const colorsArray = new Float32Array( size * size * 4 ).fill( 1 );
		const colorsTexture = new DataTexture( colorsArray, size, size, RGBAFormat, FloatType );
		colorsTexture.colorSpace = ColorManagement.workingColorSpace;

		this._colorsTexture = colorsTexture;

	}

	_initializeGeometry( reference ) {

		const geometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxIndexCount = this._maxIndexCount;
		if ( this._geometryInitialized === false ) {

			for ( const attributeName in reference.attributes ) {

				const srcAttribute = reference.getAttribute( attributeName );
				const { array, itemSize, normalized } = srcAttribute;

				const dstArray = new array.constructor( maxVertexCount * itemSize );
				const dstAttribute = new BufferAttribute( dstArray, itemSize, normalized );

				geometry.setAttribute( attributeName, dstAttribute );

			}

			if ( reference.getIndex() !== null ) {

				// Reserve last u16 index for primitive restart.
				const indexArray = maxVertexCount > 65535
					? new Uint32Array( maxIndexCount )
					: new Uint16Array( maxIndexCount );

				geometry.setIndex( new BufferAttribute( indexArray, 1 ) );

			}

			this._geometryInitialized = true;

		}

	}

	// Make sure the geometry is compatible with the existing combined geometry attributes
	_validateGeometry( geometry ) {

		// check to ensure the geometries are using consistent attributes and indices
		const batchGeometry = this.geometry;
		if ( Boolean( geometry.getIndex() ) !== Boolean( batchGeometry.getIndex() ) ) {

			throw new Error( 'BatchedMesh: All geometries must consistently have "index".' );

		}

		for ( const attributeName in batchGeometry.attributes ) {

			if ( ! geometry.hasAttribute( attributeName ) ) {

				throw new Error( `BatchedMesh: Added geometry missing "${ attributeName }". All geometries must have consistent attributes.` );

			}

			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = batchGeometry.getAttribute( attributeName );
			if ( srcAttribute.itemSize !== dstAttribute.itemSize || srcAttribute.normalized !== dstAttribute.normalized ) {

				throw new Error( 'BatchedMesh: All attributes must have a consistent itemSize and normalized value.' );

			}

		}

	}

	setCustomSort( func ) {

		this.customSort = func;
		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const boundingBox = this.boundingBox;
		const drawInfo = this._drawInfo;

		boundingBox.makeEmpty();
		for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

			if ( drawInfo[ i ].active === false ) continue;

			const geometryId = drawInfo[ i ].geometryIndex;
			this.getMatrixAt( i, _matrix );
			this.getBoundingBoxAt( geometryId, _box ).applyMatrix4( _matrix );
			boundingBox.union( _box );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const boundingSphere = this.boundingSphere;
		const drawInfo = this._drawInfo;

		boundingSphere.makeEmpty();
		for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

			if ( drawInfo[ i ].active === false ) continue;

			const geometryId = drawInfo[ i ].geometryIndex;
			this.getMatrixAt( i, _matrix );
			this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );
			boundingSphere.union( _sphere );

		}

	}

	addInstance( geometryId ) {

		const atCapacity = this._drawInfo.length >= this.maxInstanceCount;

		// ensure we're not over geometry
		if ( atCapacity && this._availableInstanceIds.length === 0 ) {

			throw new Error( 'BatchedMesh: Maximum item count reached.' );

		}

		const instanceDrawInfo = {
			visible: true,
			active: true,
			geometryIndex: geometryId,
		};

		let drawId = null;

		// Prioritize using previously freed instance ids
		if ( this._availableInstanceIds.length > 0 ) {

			this._availableInstanceIds.sort( ascIdSort );

			drawId = this._availableInstanceIds.shift();
			this._drawInfo[ drawId ] = instanceDrawInfo;

		} else {

			drawId = this._drawInfo.length;
			this._drawInfo.push( instanceDrawInfo );

		}

		const matricesTexture = this._matricesTexture;
		const matricesArray = matricesTexture.image.data;
		_identityMatrix.toArray( matricesArray, drawId * 16 );
		matricesTexture.needsUpdate = true;

		const colorsTexture = this._colorsTexture;
		if ( colorsTexture ) {

			_whiteColor.toArray( colorsTexture.image.data, drawId * 4 );
			colorsTexture.needsUpdate = true;

		}

		return drawId;

	}

	addGeometry( geometry, vertexCount = - 1, indexCount = - 1 ) {

		this._initializeGeometry( geometry );

		this._validateGeometry( geometry );

		// get the necessary range fo the geometry
		const reservedRange = {
			vertexStart: - 1,
			vertexCount: - 1,
			indexStart: - 1,
			indexCount: - 1,
		};

		const reservedRanges = this._reservedRanges;
		const drawRanges = this._drawRanges;
		const bounds = this._bounds;

		reservedRange.vertexStart = this._nextVertexStart;
		if ( vertexCount === - 1 ) {

			reservedRange.vertexCount = geometry.getAttribute( 'position' ).count;

		} else {

			reservedRange.vertexCount = vertexCount;

		}

		const index = geometry.getIndex();
		const hasIndex = index !== null;
		if ( hasIndex ) {

			reservedRange.indexStart = this._nextIndexStart;
			if ( indexCount	=== - 1 ) {

				reservedRange.indexCount = index.count;

			} else {

				reservedRange.indexCount = indexCount;

			}

		}

		if (
			reservedRange.indexStart !== - 1 &&
			reservedRange.indexStart + reservedRange.indexCount > this._maxIndexCount ||
			reservedRange.vertexStart + reservedRange.vertexCount > this._maxVertexCount
		) {

			throw new Error( 'BatchedMesh: Reserved space request exceeds the maximum buffer size.' );

		}

		// add the reserved range and draw range objects
		const drawRange = {
			start: hasIndex ? reservedRange.indexStart : reservedRange.vertexStart,
			count: - 1,
			active: true,
		};

		const boundsInfo = {
			boxInitialized: false,
			box: new Box3(),

			sphereInitialized: false,
			sphere: new Sphere()
		};

		// update id
		let geometryId;
		if ( this._availableGeometryIds.length > 0 ) {

			this._availableGeometryIds.sort( ascIdSort );

			geometryId = this._availableGeometryIds.shift();
			reservedRanges[ geometryId ] = reservedRange;
			drawRanges[ geometryId ] = drawRange;
			bounds[ geometryId ] = boundsInfo;


		} else {

			geometryId = this._geometryCount;
			this._geometryCount ++;
			reservedRanges.push( reservedRange );
			drawRanges.push( drawRange );
			bounds.push( boundsInfo );

		}

		// update the geometry
		this.setGeometryAt( geometryId, geometry );

		// increment the next geometry position
		this._nextIndexStart = reservedRange.indexStart + reservedRange.indexCount;
		this._nextVertexStart = reservedRange.vertexStart + reservedRange.vertexCount;

		return geometryId;

	}

	setGeometryAt( geometryId, geometry ) {

		if ( geometryId >= this._geometryCount ) {

			throw new Error( 'BatchedMesh: Maximum geometry count reached.' );

		}

		this._validateGeometry( geometry );

		const batchGeometry = this.geometry;
		const hasIndex = batchGeometry.getIndex() !== null;
		const dstIndex = batchGeometry.getIndex();
		const srcIndex = geometry.getIndex();
		const reservedRange = this._reservedRanges[ geometryId ];
		if (
			hasIndex &&
			srcIndex.count > reservedRange.indexCount ||
			geometry.attributes.position.count > reservedRange.vertexCount
		) {

			throw new Error( 'BatchedMesh: Reserved space not large enough for provided geometry.' );

		}

		// copy geometry over
		const vertexStart = reservedRange.vertexStart;
		const vertexCount = reservedRange.vertexCount;
		for ( const attributeName in batchGeometry.attributes ) {

			// copy attribute data
			const srcAttribute = geometry.getAttribute( attributeName );
			const dstAttribute = batchGeometry.getAttribute( attributeName );
			copyAttributeData( srcAttribute, dstAttribute, vertexStart );

			// fill the rest in with zeroes
			const itemSize = srcAttribute.itemSize;
			for ( let i = srcAttribute.count, l = vertexCount; i < l; i ++ ) {

				const index = vertexStart + i;
				for ( let c = 0; c < itemSize; c ++ ) {

					dstAttribute.setComponent( index, c, 0 );

				}

			}

			dstAttribute.needsUpdate = true;
			dstAttribute.addUpdateRange( vertexStart * itemSize, vertexCount * itemSize );

		}

		// copy index
		if ( hasIndex ) {

			const indexStart = reservedRange.indexStart;

			// copy index data over
			for ( let i = 0; i < srcIndex.count; i ++ ) {

				dstIndex.setX( indexStart + i, vertexStart + srcIndex.getX( i ) );

			}

			// fill the rest in with zeroes
			for ( let i = srcIndex.count, l = reservedRange.indexCount; i < l; i ++ ) {

				dstIndex.setX( indexStart + i, vertexStart );

			}

			dstIndex.needsUpdate = true;
			dstIndex.addUpdateRange( indexStart, reservedRange.indexCount );

		}

		// store the bounding boxes
		const bound = this._bounds[ geometryId ];
		if ( geometry.boundingBox !== null ) {

			bound.box.copy( geometry.boundingBox );
			bound.boxInitialized = true;

		} else {

			bound.boxInitialized = false;

		}

		if ( geometry.boundingSphere !== null ) {

			bound.sphere.copy( geometry.boundingSphere );
			bound.sphereInitialized = true;

		} else {

			bound.sphereInitialized = false;

		}

		// set drawRange count
		const drawRange = this._drawRanges[ geometryId ];
		const posAttr = geometry.getAttribute( 'position' );
		drawRange.count = hasIndex ? srcIndex.count : posAttr.count;
		this._visibilityChanged = true;

		return geometryId;

	}

	deleteGeometry( geometryId ) {

		const drawRanges = this._drawRanges;
		if ( geometryId >= drawRanges.length || drawRanges[ geometryId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.` );

		}

		// delete any instances associated with this geometry
		const drawInfo = this._drawInfo;
		for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

			if ( drawInfo[ i ].geometryIndex === geometryId ) {

				this.deleteInstance( i );

			}

		}

		drawRanges[ geometryId ].active = false;
		this._availableGeometryIds.push( geometryId );
		this._visibilityChanged = true;

		return this;

	}

	deleteInstance( instanceId ) {

		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		drawInfo[ instanceId ].active = false;
		this._availableInstanceIds.push( instanceId );
		this._visibilityChanged = true;

		return this;

	}

	optimize() {

		// track the next indices to copy data to
		let nextVertexStart = 0;
		let nextIndexStart = 0;

		// Iterate over all geometry ranges in order sorted from earliest in the geometry buffer to latest
		// in the geometry buffer. Because draw range objects can be reused there is no guarantee of their order.
		const drawRanges = this._drawRanges;
		const reservedRanges = this._reservedRanges;
		const indices = drawRanges
			.map( ( e, i ) => i )
			.sort( ( a, b ) => {

				return reservedRanges[ a ].vertexStart - reservedRanges[ b ].vertexStart;

			} );

		const geometry = this.geometry;
		for ( let i = 0, l = drawRanges.length; i < l; i ++ ) {

			// if a geometry range is inactive then don't copy anything
			const index = indices[ i ];
			const drawRange = drawRanges[ index ];
			const reservedRange = reservedRanges[ index ];
			if ( drawRange.active === false ) {

				continue;

			}

			// if a geometry contains an index buffer then shift it, as well
			if ( geometry.index !== null ) {

				if ( reservedRange.indexStart !== nextIndexStart ) {

					const { indexStart, indexCount } = reservedRange;
					const index = geometry.index;
					const array = index.array;

					// shift the index pointers based on how the vertex data will shift
					// adjusting the index must happen first so the original vertex start value is available
					const elementDelta = nextVertexStart - reservedRange.vertexStart;
					for ( let j = indexStart; j < indexStart + indexCount; j ++ ) {

						array[ j ] = array[ j ] + elementDelta;

					}

					index.array.copyWithin( nextIndexStart, indexStart, indexStart + indexCount );
					index.addUpdateRange( nextIndexStart, indexCount );

					reservedRange.indexStart = nextIndexStart;

				}

				nextIndexStart += reservedRange.indexCount;

			}

			// if a geometry needs to be moved then copy attribute data to overwrite unused space
			if ( reservedRange.vertexStart !== nextVertexStart ) {

				const { vertexStart, vertexCount } = reservedRange;
				const attributes = geometry.attributes;
				for ( const key in attributes ) {

					const attribute = attributes[ key ];
					const { array, itemSize } = attribute;
					array.copyWithin( nextVertexStart * itemSize, vertexStart * itemSize, ( vertexStart + vertexCount ) * itemSize );
					attribute.addUpdateRange( nextVertexStart * itemSize, vertexCount * itemSize );

				}

				reservedRange.vertexStart = nextVertexStart;

			}

			nextVertexStart += reservedRange.vertexCount;
			drawRange.start = geometry.index ? reservedRange.indexStart : reservedRange.vertexStart;

			// step the next geometry points to the shifted position
			this._nextIndexStart = geometry.index ? reservedRange.indexStart + reservedRange.indexCount : 0;
			this._nextVertexStart = reservedRange.vertexStart + reservedRange.vertexCount;

		}

		return this;

	}

	// get bounding box and compute it if it doesn't exist
	getBoundingBoxAt( geometryId, target ) {

		if ( geometryId >= this._geometryCount ) {

			return null;

		}

		// compute bounding box
		const bound = this._bounds[ geometryId ];
		const box = bound.box;
		const geometry = this.geometry;
		if ( bound.boxInitialized === false ) {

			box.makeEmpty();

			const index = geometry.index;
			const position = geometry.attributes.position;
			const drawRange = this._drawRanges[ geometryId ];
			for ( let i = drawRange.start, l = drawRange.start + drawRange.count; i < l; i ++ ) {

				let iv = i;
				if ( index ) {

					iv = index.getX( iv );

				}

				box.expandByPoint( _vector.fromBufferAttribute( position, iv ) );

			}

			bound.boxInitialized = true;

		}

		target.copy( box );
		return target;

	}

	// get bounding sphere and compute it if it doesn't exist
	getBoundingSphereAt( geometryId, target ) {

		if ( geometryId >= this._geometryCount ) {

			return null;

		}

		// compute bounding sphere
		const bound = this._bounds[ geometryId ];
		const sphere = bound.sphere;
		const geometry = this.geometry;
		if ( bound.sphereInitialized === false ) {

			sphere.makeEmpty();

			this.getBoundingBoxAt( geometryId, _box );
			_box.getCenter( sphere.center );

			const index = geometry.index;
			const position = geometry.attributes.position;
			const drawRange = this._drawRanges[ geometryId ];

			let maxRadiusSq = 0;
			for ( let i = drawRange.start, l = drawRange.start + drawRange.count; i < l; i ++ ) {

				let iv = i;
				if ( index ) {

					iv = index.getX( iv );

				}

				_vector.fromBufferAttribute( position, iv );
				maxRadiusSq = Math.max( maxRadiusSq, sphere.center.distanceToSquared( _vector ) );

			}

			sphere.radius = Math.sqrt( maxRadiusSq );
			bound.sphereInitialized = true;

		}

		target.copy( sphere );
		return target;

	}

	setMatrixAt( instanceId, matrix ) {

		const drawInfo = this._drawInfo;
		const matricesTexture = this._matricesTexture;
		const matricesArray = this._matricesTexture.image.data;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		matrix.toArray( matricesArray, instanceId * 16 );
		matricesTexture.needsUpdate = true;

		return this;

	}

	getMatrixAt( instanceId, matrix ) {

		const drawInfo = this._drawInfo;
		const matricesArray = this._matricesTexture.image.data;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		return matrix.fromArray( matricesArray, instanceId * 16 );

	}

	setColorAt( instanceId, color ) {

		if ( this._colorsTexture === null ) {

			this._initColorsTexture();

		}

		const colorsTexture = this._colorsTexture;
		const colorsArray = this._colorsTexture.image.data;
		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			return this;

		}

		color.toArray( colorsArray, instanceId * 4 );
		colorsTexture.needsUpdate = true;

		return this;

	}

	getColorAt( instanceId, color ) {

		const colorsArray = this._colorsTexture.image.data;
		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		return color.fromArray( colorsArray, instanceId * 4 );

	}

	setVisibleAt( instanceId, value ) {

		const drawInfo = this._drawInfo;
		if (
			instanceId >= drawInfo.length ||
			drawInfo[ instanceId ].active === false
		) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		if ( drawInfo[ instanceId ].visible === value ) {

			return this;

		}

		drawInfo[ instanceId ].visible = value;
		this._visibilityChanged = true;

		return this;

	}

	getVisibleAt( instanceId ) {

		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		return drawInfo[ instanceId ].visible;

	}

	setGeometryIdAt( instanceId, geometryId ) {

		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		if ( geometryId < 0 || geometryId >= this._geometryCount ) {

			throw new Error( `BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.` );

		}

		drawInfo[ instanceId ].geometryIndex = geometryId;

		return this;

	}

	getGeometryIdAt( instanceId ) {

		const drawInfo = this._drawInfo;
		if ( instanceId >= drawInfo.length || drawInfo[ instanceId ].active === false ) {

			throw new Error( `BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.` );

		}

		return drawInfo[ instanceId ].geometryIndex;

	}

	getGeometryRangeAt( geometryId, target = {} ) {

		if ( geometryId < 0 || geometryId >= this._geometryCount ) {

			throw new Error( `BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.` );

		}

		const drawRange = this._drawRanges[ geometryId ];

		target.start = drawRange.start;
		target.count = drawRange.count;

		return target;

	}

	setInstanceCount( maxInstanceCount ) {

		// shrink the available instances as much as possible
		const availableInstanceIds = this._availableInstanceIds;
		const drawInfo = this._drawInfo;
		availableInstanceIds.sort( ascIdSort );
		while ( availableInstanceIds[ availableInstanceIds.length - 1 ] === drawInfo.length ) {

			drawInfo.pop();
			availableInstanceIds.pop();

		}

		// throw an error if it can't be shrunk to the desired size
		if ( maxInstanceCount < drawInfo.length ) {

			throw new Error( `BatchedMesh: Instance ids outside the range ${ maxInstanceCount } are being used. Cannot shrink instance count.` );

		}

		// copy the multi draw counts
		const multiDrawCounts = new Int32Array( maxInstanceCount );
		const multiDrawStarts = new Int32Array( maxInstanceCount );
		copyArrayContents( this._multiDrawCounts, multiDrawCounts );
		copyArrayContents( this._multiDrawStarts, multiDrawStarts );

		this._multiDrawCounts = multiDrawCounts;
		this._multiDrawStarts = multiDrawStarts;
		this._maxInstanceCount = maxInstanceCount;

		// update texture data for instance sampling
		const indirectTexture = this._indirectTexture;
		const matricesTexture = this._matricesTexture;
		const colorsTexture = this._colorsTexture;

		indirectTexture.dispose();
		this._initIndirectTexture();
		copyArrayContents( indirectTexture.image.data, this._indirectTexture.image.data );

		matricesTexture.dispose();
		this._initMatricesTexture();
		copyArrayContents( matricesTexture.image.data, this._matricesTexture.image.data );

		if ( colorsTexture ) {

			colorsTexture.dispose();
			this._initColorsTexture();
			copyArrayContents( colorsTexture.image.data, this._colorsTexture.image.data );

		}

	}

	setGeometrySize( maxVertexCount, maxIndexCount ) {

		// Check if we can shrink to the requested vertex attribute size
		const validRanges = [ ...this._reservedRanges ].filter( ( range, i ) => this._drawRanges[ i ].active );
		const requiredVertexLength = Math.max( ...validRanges.map( range => range.vertexStart + range.vertexCount ) );
		if ( requiredVertexLength > maxVertexCount ) {

			throw new Error( `BatchedMesh: Geometry vertex values are being used outside the range ${ maxIndexCount }. Cannot shrink further.` );

		}

		// Check if we can shrink to the requested index attribute size
		if ( this.geometry.index ) {

			const requiredIndexLength = Math.max( ...validRanges.map( range => range.indexStart + range.indexCount ) );
			if ( requiredIndexLength > maxIndexCount ) {

				throw new Error( `BatchedMesh: Geometry index values are being used outside the range ${ maxIndexCount }. Cannot shrink further.` );

			}

		}

		//

		// dispose of the previous geometry
		const oldGeometry = this.geometry;
		oldGeometry.dispose();

		// recreate the geometry needed based on the previous variant
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;
		this._geometryInitialized = false;

		this.geometry = new BufferGeometry();
		this._initializeGeometry( oldGeometry );

		// copy data from the previous geometry
		const geometry = this.geometry;
		if ( oldGeometry.index ) {

			copyArrayContents( oldGeometry.index.array, geometry.index.array );

		}

		for ( const key in oldGeometry.attributes ) {

			copyArrayContents( oldGeometry.attributes[ key ].array, geometry.attributes[ key ].array );

		}

	}

	raycast( raycaster, intersects ) {

		const drawInfo = this._drawInfo;
		const drawRanges = this._drawRanges;
		const matrixWorld = this.matrixWorld;
		const batchGeometry = this.geometry;

		// iterate over each geometry
		_mesh.material = this.material;
		_mesh.geometry.index = batchGeometry.index;
		_mesh.geometry.attributes = batchGeometry.attributes;
		if ( _mesh.geometry.boundingBox === null ) {

			_mesh.geometry.boundingBox = new Box3();

		}

		if ( _mesh.geometry.boundingSphere === null ) {

			_mesh.geometry.boundingSphere = new Sphere();

		}

		for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

			if ( ! drawInfo[ i ].visible || ! drawInfo[ i ].active ) {

				continue;

			}

			const geometryId = drawInfo[ i ].geometryIndex;
			const drawRange = drawRanges[ geometryId ];
			_mesh.geometry.setDrawRange( drawRange.start, drawRange.count );

			// get the intersects
			this.getMatrixAt( i, _mesh.matrixWorld ).premultiply( matrixWorld );
			this.getBoundingBoxAt( geometryId, _mesh.geometry.boundingBox );
			this.getBoundingSphereAt( geometryId, _mesh.geometry.boundingSphere );
			_mesh.raycast( raycaster, _batchIntersects );

			// add batch id to the intersects
			for ( let j = 0, l = _batchIntersects.length; j < l; j ++ ) {

				const intersect = _batchIntersects[ j ];
				intersect.object = this;
				intersect.batchId = i;
				intersects.push( intersect );

			}

			_batchIntersects.length = 0;

		}

		_mesh.material = null;
		_mesh.geometry.index = null;
		_mesh.geometry.attributes = {};
		_mesh.geometry.setDrawRange( 0, Infinity );

	}

	copy( source ) {

		super.copy( source );

		this.geometry = source.geometry.clone();
		this.perObjectFrustumCulled = source.perObjectFrustumCulled;
		this.sortObjects = source.sortObjects;
		this.boundingBox = source.boundingBox !== null ? source.boundingBox.clone() : null;
		this.boundingSphere = source.boundingSphere !== null ? source.boundingSphere.clone() : null;

		this._drawRanges = source._drawRanges.map( range => ( { ...range } ) );
		this._reservedRanges = source._reservedRanges.map( range => ( { ...range } ) );

		this._drawInfo = source._drawInfo.map( inf => ( { ...inf } ) );
		this._bounds = source._bounds.map( bound => ( {
			boxInitialized: bound.boxInitialized,
			box: bound.box.clone(),

			sphereInitialized: bound.sphereInitialized,
			sphere: bound.sphere.clone()
		} ) );

		this._maxInstanceCount = source._maxInstanceCount;
		this._maxVertexCount = source._maxVertexCount;
		this._maxIndexCount = source._maxIndexCount;

		this._geometryInitialized = source._geometryInitialized;
		this._geometryCount = source._geometryCount;
		this._multiDrawCounts = source._multiDrawCounts.slice();
		this._multiDrawStarts = source._multiDrawStarts.slice();

		this._matricesTexture = source._matricesTexture.clone();
		this._matricesTexture.image.data = this._matricesTexture.image.data.slice();

		if ( this._colorsTexture !== null ) {

			this._colorsTexture = source._colorsTexture.clone();
			this._colorsTexture.image.data = this._colorsTexture.image.data.slice();

		}

		return this;

	}

	dispose() {

		// Assuming the geometry is not shared with other meshes
		this.geometry.dispose();

		this._matricesTexture.dispose();
		this._matricesTexture = null;

		this._indirectTexture.dispose();
		this._indirectTexture = null;

		if ( this._colorsTexture !== null ) {

			this._colorsTexture.dispose();
			this._colorsTexture = null;

		}

		return this;

	}

	onBeforeRender( renderer, scene, camera, geometry, material/*, _group*/ ) {

		// if visibility has not changed and frustum culling and object sorting is not required
		// then skip iterating over all items
		if ( ! this._visibilityChanged && ! this.perObjectFrustumCulled && ! this.sortObjects ) {

			return;

		}

		// the indexed version of the multi draw function requires specifying the start
		// offset in bytes.
		const index = geometry.getIndex();
		const bytesPerElement = index === null ? 1 : index.array.BYTES_PER_ELEMENT;

		const drawInfo = this._drawInfo;
		const multiDrawStarts = this._multiDrawStarts;
		const multiDrawCounts = this._multiDrawCounts;
		const drawRanges = this._drawRanges;
		const perObjectFrustumCulled = this.perObjectFrustumCulled;
		const indirectTexture = this._indirectTexture;
		const indirectArray = indirectTexture.image.data;

		// prepare the frustum in the local frame
		if ( perObjectFrustumCulled ) {

			_projScreenMatrix
				.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse )
				.multiply( this.matrixWorld );
			_frustum.setFromProjectionMatrix(
				_projScreenMatrix,
				renderer.coordinateSystem
			);

		}

		let count = 0;
		if ( this.sortObjects ) {

			// get the camera position in the local frame
			_invMatrixWorld.copy( this.matrixWorld ).invert();
			_vector.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _invMatrixWorld );
			_forward.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld ).transformDirection( _invMatrixWorld );

			for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

				if ( drawInfo[ i ].visible && drawInfo[ i ].active ) {

					const geometryId = drawInfo[ i ].geometryIndex;

					// get the bounds in world space
					this.getMatrixAt( i, _matrix );
					this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						culled = ! _frustum.intersectsSphere( _sphere );

					}

					if ( ! culled ) {

						// get the distance from camera used for sorting
						const z = _temp.subVectors( _sphere.center, _vector ).dot( _forward );
						_renderList.push( drawRanges[ geometryId ], z, i );

					}

				}

			}

			// Sort the draw ranges and prep for rendering
			const list = _renderList.list;
			const customSort = this.customSort;
			if ( customSort === null ) {

				list.sort( material.transparent ? sortTransparent : sortOpaque );

			} else {

				customSort.call( this, list, camera );

			}

			for ( let i = 0, l = list.length; i < l; i ++ ) {

				const item = list[ i ];
				multiDrawStarts[ count ] = item.start * bytesPerElement;
				multiDrawCounts[ count ] = item.count;
				indirectArray[ count ] = item.index;
				count ++;

			}

			_renderList.reset();

		} else {

			for ( let i = 0, l = drawInfo.length; i < l; i ++ ) {

				if ( drawInfo[ i ].visible && drawInfo[ i ].active ) {

					const geometryId = drawInfo[ i ].geometryIndex;

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						// get the bounds in world space
						this.getMatrixAt( i, _matrix );
						this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );
						culled = ! _frustum.intersectsSphere( _sphere );

					}

					if ( ! culled ) {

						const range = drawRanges[ geometryId ];
						multiDrawStarts[ count ] = range.start * bytesPerElement;
						multiDrawCounts[ count ] = range.count;
						indirectArray[ count ] = i;
						count ++;

					}

				}

			}

		}

		indirectTexture.needsUpdate = true;
		this._multiDrawCount = count;
		this._visibilityChanged = false;

	}

	onBeforeShadow( renderer, object, camera, shadowCamera, geometry, depthMaterial/* , group */ ) {

		this.onBeforeRender( renderer, null, shadowCamera, geometry, depthMaterial );

	}

}

export { BatchedMesh };
