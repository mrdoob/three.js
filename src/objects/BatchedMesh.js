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
// @TODO: Add an "optimize" function to pack geometry and remove data gaps

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
		this._drawInfos = new Map();
		this._activeInstances = [];
		this._instanceId = 0;
		this._drawIndex = 0;

		// geometry information
		this._drawRanges = new Map();
		this._reservedRanges = new Map();
		this._bounds = new Map();

		// Store ids after delete to use in optimize
		this._geometriesToDelete = [];
		this._instancesToDelete = [];
		this._needsUpdateDrawInfos = false;
		this._needsUpdateGeometry = false;

		this._maxInstanceCount = maxInstanceCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		this._geometryInitialized = false;
		this._geometryCount = 0;
		this._geometryLastId = 0;
		this._multiDrawCounts = new Int32Array( maxInstanceCount );
		this._multiDrawStarts = new Int32Array( maxInstanceCount );
		this._multiDrawCount = 0;
		this._multiDrawInstances = null;
		this._visibilityChanged = true;

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
		const drawInfos = this._drawInfos;
		const activeInstances = this._activeInstances;

		boundingBox.makeEmpty();
		for ( let i = 0; i < activeInstances.length; i ++ ) {

			const info = drawInfos.get( activeInstances[ i ] );

			if ( info.active === false ) continue;

			const geometryId = info.geometryId;
			const instanceId = info.instanceId;
			this.getMatrixAt( instanceId, _matrix );
			this.getBoundingBoxAt( geometryId, _box ).applyMatrix4( _matrix );
			boundingBox.union( _box );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		const boundingSphere = this.boundingSphere;
		const drawInfos = this._drawInfos;
		const activeInstances = this._activeInstances;

		boundingSphere.makeEmpty();
		for ( let i = 0, l = activeInstances.length; i < l; i ++ ) {

			const info = drawInfos.get( activeInstances[ i ] );

			if ( info.active === false ) continue;

			const geometryId = info.geometryId;
			const instanceId = info.instanceId;
			this.getMatrixAt( instanceId, _matrix );
			this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );
			boundingSphere.union( _sphere );

		}

	}

	addInstance( geometryId ) {

		// ensure we're not over geometry
		if ( this._drawInfos.size >= this._maxInstanceCount ) {

			throw new Error( 'BatchedMesh: Maximum item count reached.' );

		}

		const instanceId = this._instanceId;
		const drawIndex = this._drawIndex;
		const info = {
			visible: true,
			active: true,
			geometryId,
			instanceId,
			drawIndex,
		};
		this._instanceId ++;
		this._drawIndex ++;

		this._activeInstances.push( instanceId );
		this._drawInfos.set( instanceId, info );

		// initialize the matrix
		const matricesTexture = this._matricesTexture;
		const matricesArray = matricesTexture.image.data;
		_identityMatrix.toArray( matricesArray, drawIndex * 16 );
		matricesTexture.needsUpdate = true;

		const colorsTexture = this._colorsTexture;
		if ( colorsTexture ) {

			_whiteColor.toArray( colorsTexture.image.data, drawIndex * 4 );
			colorsTexture.needsUpdate = true;

		}

		return instanceId;

	}

	addGeometry( geometry, vertexCount = - 1, indexCount = - 1 ) {

		this._initializeGeometry( geometry );

		this._validateGeometry( geometry );

		// ensure we're not over geometry
		if ( this._drawInfos.size >= this._maxInstanceCount ) {

			throw new Error( 'BatchedMesh: Maximum item count reached.' );

		}

		// get the necessary range fo the geometry
		const reservedRange = {
			vertexStart: - 1,
			vertexCount: - 1,
			indexStart: - 1,
			indexCount: - 1,
		};

		let lastRange = null;
		const reservedRanges = this._reservedRanges;
		const drawRanges = this._drawRanges;
		const bounds = this._bounds;
		if ( this._geometryCount !== 0 ) {

			// get last reserved range:              last index         value
			lastRange = [ ...reservedRanges ][ reservedRanges.size - 1 ][ 1 ];

		}

		if ( vertexCount === - 1 ) {

			reservedRange.vertexCount = geometry.getAttribute( 'position' ).count;

		} else {

			reservedRange.vertexCount = vertexCount;

		}

		if ( lastRange === null ) {

			reservedRange.vertexStart = 0;

		} else {

			reservedRange.vertexStart = lastRange.vertexStart + lastRange.vertexCount;

		}

		const index = geometry.getIndex();
		const hasIndex = index !== null;
		if ( hasIndex ) {

			if ( indexCount	=== - 1 ) {

				reservedRange.indexCount = index.count;

			} else {

				reservedRange.indexCount = indexCount;

			}

			if ( lastRange === null ) {

				reservedRange.indexStart = 0;

			} else {

				reservedRange.indexStart = lastRange.indexStart + lastRange.indexCount;

			}

		}

		if (
			reservedRange.indexStart !== - 1 &&
			reservedRange.indexStart + reservedRange.indexCount > this._maxIndexCount ||
			reservedRange.vertexStart + reservedRange.vertexCount > this._maxVertexCount
		) {

			throw new Error( 'BatchedMesh: Reserved space request exceeds the maximum buffer size.' );

		}

		// update id
		const geometryId = this._geometryLastId;
		this._geometryLastId ++;
		this._geometryCount ++;

		// add the reserved range and draw range objects
		reservedRanges.set( geometryId, reservedRange );
		drawRanges.set(
			geometryId,
			{
				start: hasIndex ? reservedRange.indexStart : reservedRange.vertexStart,
				count: - 1
			}
		);
		bounds.set(
			geometryId,
			{
				boxInitialized: false,
				box: new Box3(),

				sphereInitialized: false,
				sphere: new Sphere()
			}
		);

		// update the geometry
		this.setGeometryAt( geometryId, geometry );

		return geometryId;

	}

	setGeometryAt( geometryId, geometry ) {

		if ( this._reservedRanges.has( geometryId ) === false ) {

			throw new Error( 'BatchedMesh: No geometry found with this ID' );

		}

		this._validateGeometry( geometry );

		const batchGeometry = this.geometry;
		const hasIndex = batchGeometry.getIndex() !== null;
		const dstIndex = batchGeometry.getIndex();
		const srcIndex = geometry.getIndex();
		const reservedRange = this._reservedRanges.get( geometryId );
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
		const bound = this._bounds.get( geometryId );
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
		const drawRange = this._drawRanges.get( geometryId );
		const posAttr = geometry.getAttribute( 'position' );
		drawRange.count = hasIndex ? srcIndex.count : posAttr.count;
		this._visibilityChanged = true;

		return geometryId;

	}

	deleteGeometry( geometryId ) {

		// Check has geometry by this id
		if ( this._reservedRanges.has( geometryId ) ) {

			// Do inactive all instances of this geometry
			this._geometriesToDelete.push( geometryId );
			this._drawInfos.forEach( ( info ) => {

				if ( info.geometryId === geometryId ) {

					info.active = false;
					this._instancesToDelete.push( info.instanceId );

				}

			} );

			this._visibilityChanged = true;

		}

		return this;

	}

	deleteInstance( instanceId ) {

		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return this;

		}

		info.active = false;
		this._instancesToDelete.push( instanceId );

		this._visibilityChanged = true;

		return this;

	}

	optimize() {

		if ( this._geometriesToDelete.length ) {

			// Delete geometries
			for ( let i = 0; i < this._geometriesToDelete.length; i ++ ) {

				this._reservedRanges.delete( this._geometriesToDelete[ i ] );
				this._drawRanges.delete( this._geometriesToDelete[ i ] );
				this._bounds.delete( this._geometriesToDelete[ i ] );

				this._geometryCount --;

			}

			this._geometriesToDelete.length = 0;
			this._visibilityChanged = true;
			this._needsUpdateGeometry = true;

			// Optimize geometry to pack data
			this._optimizeGeometry();

		}

		if ( this._instancesToDelete.length ) {

			// Delete instance data from draw info
			this._activeInstances = this._activeInstances.filter( id => ! this._instancesToDelete.includes( id ) );
			this._instancesToDelete.forEach( ( instanceId ) => {

				this._drawInfos.delete( instanceId );

			} );

			this._instancesToDelete.length = 0;
			this._needsUpdateDrawInfos = true;

			// Update matrix and colors texture after draw info changes
			this._optimizeMatricesAndColors();

		}

	}

	_optimizeGeometry() {

		if ( this._needsUpdateGeometry ) {

			const reservedRanges = this._reservedRanges;
			const drawRanges = this._drawRanges;
			const batchGeometry = this.geometry;
			const hasIndex = batchGeometry.getIndex() !== null;
			const batchIndex = batchGeometry.getIndex();
			let totalVertexCount = 0;
			let totalIndexCount = 0;

			// NOTE: for maximum safety we can sort reservedRanges by vertexStart
			reservedRanges.forEach( ( reservedRange, geometryId ) => {

				// copy geometry over
				const drawRange = drawRanges.get( geometryId );
				const vertexStart = reservedRange.vertexStart;
				const vertexCount = reservedRange.vertexCount;

				for ( const attributeName in batchGeometry.attributes ) {

					const attribute = batchGeometry.getAttribute( attributeName );
					const itemSize = attribute.itemSize;

					attribute.array.copyWithin(
						totalVertexCount * itemSize,
						vertexStart * itemSize,
						( vertexStart + vertexCount ) * itemSize
					);

					attribute.needsUpdate = true;

				}

				reservedRange.vertexStart = totalVertexCount;
				totalVertexCount += vertexCount;

				if ( ! hasIndex ) {

					drawRange.start = reservedRange.vertexStart;

				}

				if ( hasIndex ) {

					const indexStart = reservedRange.indexStart;
					const indexCount = reservedRange.indexCount;

					// Update indices by new vertexStart
					for ( let i = 0; i < indexCount; i ++ ) {

						const index = indexStart + i;
						const x = batchIndex.getX( index ) - vertexStart + reservedRange.vertexStart;

						batchIndex.setX( index, x );

					}

					batchIndex.array.copyWithin(
						totalIndexCount,
						indexStart,
						indexStart + indexCount
					);

					reservedRange.indexStart = totalIndexCount;
					totalIndexCount += indexCount;

					drawRange.start = reservedRange.indexStart;

				}

			} );

			// Fill unused data with zeros
			for ( const attributeName in batchGeometry.attributes ) {

				const attribute = batchGeometry.getAttribute( attributeName );
				const itemSize = attribute.itemSize;

				attribute.array.fill( 0, totalVertexCount * itemSize );
				attribute.needsUpdate = true;

			}

			// Fill unused indices with zeros
			if ( hasIndex ) {

				batchIndex.array.fill( 0, totalIndexCount );
				batchIndex.needsUpdate = true;

			}

			this._needsUpdateGeometry = false;

		}

	}

	_optimizeMatricesAndColors() {

		if ( this._needsUpdateDrawInfos ) {

			const colorsTexture = this._colorsTexture;
			const matrixTexture = this._matricesTexture;
			const matricesArray = matrixTexture.image.data;
			let drawIndex = 0;

			this._drawInfos.forEach( ( drawInfo ) => {

				matricesArray.copyWithin(
					drawIndex * 16,
					drawInfo.drawIndex * 16,
					drawInfo.drawIndex * 16 + 16
				);

				// Optimize colors texture if it is defined
				if ( colorsTexture ) {

					colorsTexture.image.data.copyWithin(
						drawIndex * 4,
						drawInfo.drawIndex * 4,
						drawInfo.drawIndex * 4 + 4

					);

				}

				drawInfo.drawIndex = drawIndex;
				drawIndex ++;

			} );

			this._drawIndex = drawIndex;

			matrixTexture.needsUpdate = true;

			if ( colorsTexture ) {

				colorsTexture.needsUpdate = true;

			}

			this._needsUpdateDrawInfos = false;

		}

	}

	// get bounding box and compute it if it doesn't exist
	getBoundingBoxAt( geometryId, target ) {

		if ( this._drawRanges.has( geometryId ) === false ) {

			return null;

		}

		// compute bounding box
		const bound = this._bounds.get( geometryId );
		const box = bound.box;
		const geometry = this.geometry;
		if ( bound.boxInitialized === false ) {

			box.makeEmpty();

			const index = geometry.index;
			const position = geometry.attributes.position;
			const drawRange = this._drawRanges.get( geometryId );
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

		if ( this._drawRanges.has( geometryId ) === false ) {

			return null;

		}

		// compute bounding sphere
		const bound = this._bounds.get( geometryId );
		const sphere = bound.sphere;
		const geometry = this.geometry;
		if ( bound.sphereInitialized === false ) {

			sphere.makeEmpty();

			this.getBoundingBoxAt( geometryId, _box );
			_box.getCenter( sphere.center );

			const index = geometry.index;
			const position = geometry.attributes.position;
			const drawRange = this._drawRanges.get( geometryId );

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

		// @TODO: Map geometryId to index of the arrays because
		//        optimize() can make geometryId mismatch the index

		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return this;

		}

		const matricesTexture = this._matricesTexture;
		const matricesArray = this._matricesTexture.image.data;

		matrix.toArray( matricesArray, info.drawIndex * 16 );
		matricesTexture.needsUpdate = true;

		return this;

	}

	getMatrixAt( instanceId, matrix ) {

		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return this;

		}

		const matricesArray = this._matricesTexture.image.data;

		return matrix.fromArray( matricesArray, info.drawIndex * 16 );

	}

	setColorAt( instanceId, color ) {

		// @TODO: Map id to index of the arrays because
		//        optimize() can make id mismatch the index
		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return this;

		}

		if ( this._colorsTexture === null ) {

			this._initColorsTexture();

		}

		const colorsTexture = this._colorsTexture;
		const colorsArray = this._colorsTexture.image.data;

		color.toArray( colorsArray, info.drawIndex * 4 );
		colorsTexture.needsUpdate = true;

		return this;

	}

	getColorAt( instanceId, color ) {

		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return this;

		}

		const colorsArray = this._colorsTexture.image.data;

		return color.fromArray( colorsArray, info.drawIndex * 4 );

	}

	setVisibleAt( instanceId, value ) {

		// if the geometry is out of range, not active, or visibility state
		// does not change then return early
		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false || info.visible === value ) {

			return this;

		}

		info.visible = value;
		this._visibilityChanged = true;

		return this;

	}

	getVisibleAt( instanceId ) {

		// return early if the geometry is out of range or not active
		const info = this._drawInfos.get( instanceId );
		if ( info === undefined || info.active === false ) {

			return false;

		}

		return info.visible;

	}

	raycast( raycaster, intersects ) {

		const activeInstances = this._activeInstances;
		const drawInfos = this._drawInfos;
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

		for ( let i = 0, l = activeInstances.length; i < l; i ++ ) {

			const info = drawInfos.get( activeInstances[ i ] );
			if ( info === undefined || ! info.visible || ! info.active ) {

				continue;

			}

			const geometryId = info.geometryId;
			const instanceId = info.instanceId;
			const drawRange = drawRanges.get( geometryId );
			_mesh.geometry.setDrawRange( drawRange.start, drawRange.count );

			// ge the intersects
			this.getMatrixAt( instanceId, _mesh.matrixWorld ).premultiply( matrixWorld );
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

		this._bounds.clear();
		this._drawRanges.clear();
		this._reservedRanges.clear();
		this._drawInfos.clear();

		source._drawRanges.forEach( ( range, key ) => {

			this._drawRanges.set( key, { ...range } );

		} );

		source._reservedRanges.forEach( ( range, key ) => {

			this._reservedRanges.set( key, { ...range } );

		} );
		source._bounds.forEach( ( bound, key ) => {

			this._bounds.set(
				key,
				{
					boxInitialized: bound.boxInitialized,
					box: bound.box.clone(),

					sphereInitialized: bound.sphereInitialized,
					sphere: bound.sphere.clone()
				}
			);

		} );

		source._drawInfos.forEach( ( range, key ) => {

			this._drawInfos.set( key, { ...range } );

		} );

		this._activeInstances = [ ...source._activeInstances ];
		this._drawIndex = source._drawIndex;
		this._instanceId = source._instanceId;

		this._maxInstanceCount = source._maxInstanceCount;
		this._maxVertexCount = source._maxVertexCount;
		this._maxIndexCount = source._maxIndexCount;

		this._geometryInitialized = source._geometryInitialized;
		this._geometryCount = source._geometryCount;
		this._geometryLastId = source._geometryLastId;
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

		const drawInfos = this._drawInfos;
		const activeInstances = this._activeInstances;
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

			for ( let i = 0, l = activeInstances.length; i < l; i ++ ) {

				const info = drawInfos.get( activeInstances[ i ] );

				if ( info && info.visible && info.active ) {

					const geometryId = info.geometryId;
					const instanceId = info.instanceId;
					const drawRange = drawRanges.get( geometryId );

					// get the bounds in world space
					this.getMatrixAt( instanceId, _matrix );
					this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						culled = ! _frustum.intersectsSphere( _sphere );

					}

					if ( ! culled ) {

						// get the distance from camera used for sorting
						const z = _temp.subVectors( _sphere.center, _vector ).dot( _forward );
						_renderList.push( drawRange, z, i );

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

			for ( let i = 0, l = activeInstances.length; i < l; i ++ ) {

				const info = drawInfos.get( activeInstances[ i ] );

				if ( info && info.visible && info.active ) {

					const geometryId = info.geometryId;
					const instanceId = info.instanceId;

					// determine whether the batched geometry is within the frustum
					let culled = false;
					if ( perObjectFrustumCulled ) {

						// get the bounds in world space
						this.getMatrixAt( instanceId, _matrix );
						this.getBoundingSphereAt( geometryId, _sphere ).applyMatrix4( _matrix );
						culled = ! _frustum.intersectsSphere( _sphere );

					}

					if ( ! culled ) {

						const range = drawRanges.get( geometryId );
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
