/*!
 * Portions adapted from SculptGL by Stéphane Ginier.
 * Copyright (c) 2019 Stéphane GINIER
 * Licensed under the MIT License; see ./SculptGL.LICENSE.txt.
 */

import {
	Box3,
	BufferAttribute,
	BufferGeometry,
	EventDispatcher,
	Matrix4,
	Sphere,
	Vector3,
	WebGPUCoordinateSystem
} from 'three';

import {
	getMemory,
	intersectionRayTriangle
} from './SculptorUtils.js';

import { SculptorMesh } from './SculptorMesh.js';

import {
	subdivisionPass,
	decimationPass,
	getFrontVertices,
	areaNormal,
	areaCenter,
	toolBrush,
	toolFlatten,
	toolInflate,
	toolSmooth,
	toolPinch,
	toolCrease,
	toolDrag,
	toolScale
} from './SculptorTools.js';

const TOOL_DEFAULTS = {
	clay: { size: 50, strength: 0.5, negative: false },
	brush: { size: 50, strength: 0.5, negative: false },
	inflate: { size: 50, strength: 0.3, negative: false },
	smooth: { size: 50, strength: 0.75, negative: false },
	flatten: { size: 50, strength: 0.75, negative: true },
	pinch: { size: 50, strength: 0.75, negative: false },
	crease: { size: 25, strength: 0.75, negative: true },
	drag: { size: 150, strength: 0.5, negative: false },
	scale: { size: 50, strength: 0.5, negative: false }
};

const MAX_FLOAT32 = 3.4028234663852886e38;
const MAX_UPDATE_RANGES = 8;
const MAX_UPDATE_GAP_COMPONENTS = 96;
const STAMP_SPACING_RATIO = 0.15;
const TOPOLOGY_HYSTERESIS2 = 2.05 * 2.05;
const UNIFORM_SCALE_TOLERANCE = 1e-10;
const CLAY_OFFSET_RATIO = 0.1;

/**
 * Fires when a pointer or programmatic stroke begins.
 *
 * @event Sculptor#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires after the sculpt geometry has been updated.
 *
 * @event Sculptor#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires after the active stroke finishes and exact bounds are up to date.
 *
 * @event Sculptor#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };
const sortAscending = ( a, b ) => a - b;
const sortByRangeStart = ( a, b ) => a.start - b.start;

const _matInverse = new Matrix4();
const _v3NearWorld = new Vector3();
const _v3FarWorld = new Vector3();
const _v3NearLocal = new Vector3();
const _v3FarLocal = new Vector3();
const _v3WorldPoint = new Vector3();
const _v3WorldRadiusPoint = new Vector3();
const _v3ScreenPoint = new Vector3();
const _v3Temp = new Vector3();

const _tmpInter = [ 0, 0, 0 ];
const _tmpV1 = [ 0, 0, 0 ];
const _tmpV2 = [ 0, 0, 0 ];
const _tmpV3 = [ 0, 0, 0 ];

function validateUnitInterval( name, value ) {

	if ( Number.isFinite( value ) === false || value < 0 || value > 1 ) {

		throw new RangeError( `Sculptor: ${ name } must be a finite number between 0 and 1.` );

	}

	return value;

}

function validatePositive( name, value ) {

	if ( Number.isFinite( value ) === false || value <= 0 ) {

		throw new RangeError( `Sculptor: ${ name } must be a finite number greater than 0.` );

	}

	return value;

}

function validateSize( value ) {

	if ( Number.isFinite( value ) === false || value < 5 || value > 500 ) {

		throw new RangeError( 'Sculptor: size must be a finite number between 5 and 500 pixels.' );

	}

	return value;

}

function validateRayTool( tool ) {

	if ( tool === 'drag' || tool === 'scale' ) {

		throw new Error( `Sculptor: The ${ tool } tool requires pointer movement and cannot be used with strokeFromRay().` );

	}

}

function attributeMatches( attribute, source, itemSize ) {

	return attribute !== undefined && attribute !== null &&
		attribute.itemSize === itemSize &&
		attribute.array.buffer === source.buffer &&
		attribute.array.byteOffset === source.byteOffset &&
		attribute.array.length === source.length;

}

function createVersionedAttribute( source, itemSize, previous ) {

	const attribute = new BufferAttribute( source, itemSize );

	// Static usage keeps uploads version-driven in both renderers.
	if ( previous !== undefined && previous !== null ) attribute.version = previous.version + 1;

	return attribute;

}

function createReplacementGeometry( source ) {

	const geometry = new BufferGeometry();
	geometry.name = source.name;
	geometry.userData = source.userData;
	geometry.boundingBox = source.boundingBox === null ? null : source.boundingBox.clone();
	geometry.boundingSphere = source.boundingSphere === null ? null : source.boundingSphere.clone();
	return geometry;

}

function addVertexUpdateRanges( attribute, vertices ) {

	let start = vertices[ 0 ];
	let previous = start;

	for ( let i = 1, l = vertices.length; i < l; ++ i ) {

		const current = vertices[ i ];

		if ( current === previous ) continue;

		if ( current !== previous + 1 ) {

			attribute.addUpdateRange( start * 3, ( previous - start + 1 ) * 3 );
			start = current;

		}

		previous = current;

	}

	attribute.addUpdateRange( start * 3, ( previous - start + 1 ) * 3 );

	const ranges = attribute.updateRanges;
	ranges.sort( sortByRangeStart );
	let writeIndex = 0;

	// Merge nearby spans with pending ranges to limit upload calls.
	for ( let i = 1, l = ranges.length; i < l; i ++ ) {

		const previousRange = ranges[ writeIndex ];
		const range = ranges[ i ];
		const previousEnd = previousRange.start + previousRange.count;

		if ( range.start - previousEnd <= MAX_UPDATE_GAP_COMPONENTS ) {

			previousRange.count = Math.max( previousEnd, range.start + range.count ) - previousRange.start;

		} else {

			ranges[ ++ writeIndex ] = range;

		}

	}

	ranges.length = writeIndex + 1;

	if ( ranges.length <= MAX_UPDATE_RANGES ) return;

	// Preserve the largest gaps when limiting the number of upload ranges.
	const splitIndices = [];

	for ( let i = 1, l = ranges.length; i < l; i ++ ) splitIndices.push( i );

	splitIndices.sort( ( a, b ) => {

		const gapA = ranges[ a ].start - ranges[ a - 1 ].start - ranges[ a - 1 ].count;
		const gapB = ranges[ b ].start - ranges[ b - 1 ].start - ranges[ b - 1 ].count;
		return gapB - gapA;

	} );
	splitIndices.length = MAX_UPDATE_RANGES - 1;
	splitIndices.sort( sortAscending );

	writeIndex = 0;
	let splitIndex = 0;

	for ( let i = 1, l = ranges.length; i < l; i ++ ) {

		const range = ranges[ i ];

		if ( i === splitIndices[ splitIndex ] ) {

			ranges[ ++ writeIndex ] = range;
			splitIndex ++;

		} else {

			const previousRange = ranges[ writeIndex ];
			previousRange.count = Math.max( previousRange.start + previousRange.count, range.start + range.count ) - previousRange.start;

		}

	}

	ranges.length = writeIndex + 1;

}

function compactDirtyVertices( vertices, vertexCount ) {

	vertices.sort( sortAscending );

	let writeIndex = 0;
	let previous = - 1;

	for ( let i = 0, l = vertices.length; i < l; i ++ ) {

		const vertex = vertices[ i ];

		// Exclude vertices removed by later stamps in the same pointer event.
		if ( vertex >= vertexCount ) break;
		if ( vertex < 0 || vertex === previous ) continue;

		vertices[ writeIndex ++ ] = vertex;
		previous = vertex;

	}

	vertices.length = writeIndex;
	return writeIndex > 0;

}

/**
 * Sculpts triangle meshes with adaptive topology.
 *
 * ```js
 * const sculptor = new Sculptor( mesh, camera )
 * 	.setTool( 'inflate' )
 * 	.setSize( 75 )
 * 	.setStrength( 0.3 );
 * sculptor.connect( renderer.domElement );
 * ```
 *
 * Replaces `mesh.geometry` with a welded geometry containing positions, normals
 * and indices. The source geometry is unchanged and is not disposed.
 *
 * The mesh must use one material and a non-zero uniform world scale without
 * shear. Skinned, instanced and batched meshes are not supported.
 *
 * Sculptor manages bounds, draw range and spare buffer capacity. Geometry and
 * attributes may be replaced as capacity changes; do not cache them. Use
 * {@link Sculptor#getGeometry} for a compact copy for export or geometry processing.
 *
 * @three_import import { Sculptor } from 'three/addons/misc/Sculptor.js';
 */
class Sculptor extends EventDispatcher {

	/**
	 * @param {Mesh} mesh - The mesh to sculpt.
	 * @param {Camera} camera - The camera used for pointer picking.
	 */

	constructor( mesh, camera ) {

		super();

		if ( mesh === undefined || mesh.isMesh !== true || mesh.geometry === undefined || mesh.geometry.isBufferGeometry !== true ) {

			throw new TypeError( 'Sculptor: mesh must be a Mesh with a BufferGeometry.' );

		}

		if ( mesh.isSkinnedMesh === true || mesh.isInstancedMesh === true || mesh.isBatchedMesh === true ) {

			throw new TypeError( 'Sculptor: SkinnedMesh, InstancedMesh and BatchedMesh are not supported.' );

		}

		if ( Array.isArray( mesh.material ) ) throw new Error( 'Sculptor: Multi-material meshes are not supported.' );

		if ( camera === undefined || camera.isCamera !== true ) throw new TypeError( 'Sculptor: camera must be a Camera.' );

		this._toolSettings = {};

		for ( const tool in TOOL_DEFAULTS ) this._toolSettings[ tool ] = { ...TOOL_DEFAULTS[ tool ] };

		this._tool = 'clay';
		this._size = TOOL_DEFAULTS.clay.size;
		this._strength = TOOL_DEFAULTS.clay.strength;
		this._negative = TOOL_DEFAULTS.clay.negative;
		this._detail = 0.75;

		/**
		 * The mesh being sculpted.
		 *
		 * @type {Mesh}
		 * @readonly
		 */
		this.mesh = mesh;

		/**
		 * The camera used for pointer picking.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The element receiving pointer events, or `null` while disconnected.
		 *
		 * @type {?HTMLElement}
		 * @default null
		 */
		this.domElement = null;

		/**
		 * Whether pointer input is enabled. Does not affect programmatic strokes.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		this._sculptMesh = new SculptorMesh();
		this._sculptMesh.initFromGeometry( mesh.geometry );

		this._sculpting = false;
		this._activePointerId = null;
		this._lastPointerX = 0;
		this._lastPointerY = 0;
		this._hitFace = - 1;
		this._rayOrigin = [ 0, 0, 0 ];
		this._rayDirection = [ 0, 0, 0 ];
		this._hitPoint = [ 0, 0, 0 ];
		this._hitNormal = [ 0, 0, 0 ];
		this._localRadius2 = 0;
		this._worldRadius2 = 0;
		this._dragDirection = [ 0, 0, 0 ];
		this._cachedRect = null;
		this._lastTopologyVersion = - 1;
		this._dirtyVertices = [];
		this._geometrySynced = false;
		this._boundsDirty = false;

		this._prepareGeometry();
		this._syncGeometry();
		this._computeExactBounds();

		this._onPointerDown = this._onPointerDown.bind( this );
		this._onPointerMove = this._onPointerMove.bind( this );
		this._onPointerUp = this._onPointerUp.bind( this );

	}

	/**
	 * Connects pointer input to a DOM element.
	 *
	 * @param {HTMLElement} element - The element receiving pointer events.
	 */
	connect( element ) {

		if ( element === undefined || element === null || typeof element.addEventListener !== 'function' ||
			typeof element.removeEventListener !== 'function' || typeof element.getBoundingClientRect !== 'function' ) {

			throw new TypeError( 'Sculptor: element must be an EventTarget with getBoundingClientRect().' );

		}

		if ( this.domElement !== null ) this.disconnect();

		this.domElement = element;
		this._cachedRect = null;

		element.addEventListener( 'pointerdown', this._onPointerDown );
		element.addEventListener( 'pointermove', this._onPointerMove );
		element.addEventListener( 'pointerup', this._onPointerUp );
		element.addEventListener( 'pointercancel', this._onPointerUp );
		element.addEventListener( 'lostpointercapture', this._onPointerUp );

	}

	/**
	 * Disconnects pointer input and finishes the active stroke.
	 */
	disconnect() {

		const element = this.domElement;
		this.endStroke();

		if ( element === null ) return;

		element.removeEventListener( 'pointerdown', this._onPointerDown );
		element.removeEventListener( 'pointermove', this._onPointerMove );
		element.removeEventListener( 'pointerup', this._onPointerUp );
		element.removeEventListener( 'pointercancel', this._onPointerUp );
		element.removeEventListener( 'lostpointercapture', this._onPointerUp );
		this.domElement = null;
		this._cachedRect = null;
		this._clearHit();

	}

	/**
	 * Disconnects the sculptor. The mesh and its geometry are not disposed.
	 */
	dispose() {

		this.disconnect();

	}

	_prepareGeometry() {

		const sourceGeometry = this.mesh.geometry;
		const geometry = new BufferGeometry();
		geometry.name = sourceGeometry.name;
		geometry.userData = JSON.parse( JSON.stringify( sourceGeometry.userData ) );
		this.mesh.geometry = geometry;

	}

	_getRect() {

		if ( this.domElement === null ) {

			throw new Error( 'Sculptor: connect() must be called before using pointer coordinates.' );

		}

		if ( this._cachedRect === null ) this._cachedRect = this.domElement.getBoundingClientRect();

		return this._cachedRect;

	}

	_unproject( clientX, clientY, z, target ) {

		const rect = this._getRect();
		const x = ( ( clientX - rect.left ) / rect.width ) * 2 - 1;
		const y = - ( ( clientY - rect.top ) / rect.height ) * 2 + 1;

		return target.set( x, y, z ).unproject( this.camera );

	}

	_project( point, target ) {

		target.copy( point ).project( this.camera );

		const rect = this._getRect();
		target.x = ( target.x * 0.5 + 0.5 ) * rect.width + rect.left;
		target.y = ( - target.y * 0.5 + 0.5 ) * rect.height + rect.top;

		return target;

	}

	_updatePointerRay( clientX, clientY ) {

		const camera = this.camera;
		const nearDepth = camera.reversedDepth ? 1 : camera.coordinateSystem === WebGPUCoordinateSystem ? 0 : - 1;
		const farDepth = camera.reversedDepth ? 0 : 1;
		const directionDepth = nearDepth + ( farDepth - nearDepth ) * 0.1;

		this._unproject( clientX, clientY, nearDepth, _v3NearWorld );
		this._unproject( clientX, clientY, directionDepth, _v3FarWorld );
		_v3NearLocal.copy( _v3NearWorld ).applyMatrix4( _matInverse );
		_v3FarLocal.copy( _v3FarWorld ).applyMatrix4( _matInverse );

		const rayOrigin = this._rayOrigin;
		rayOrigin[ 0 ] = _v3NearLocal.x;
		rayOrigin[ 1 ] = _v3NearLocal.y;
		rayOrigin[ 2 ] = _v3NearLocal.z;

		const rayDirection = this._rayDirection;
		rayDirection[ 0 ] = _v3FarLocal.x - _v3NearLocal.x;
		rayDirection[ 1 ] = _v3FarLocal.y - _v3NearLocal.y;
		rayDirection[ 2 ] = _v3FarLocal.z - _v3NearLocal.z;

		const length = Math.hypot( rayDirection[ 0 ], rayDirection[ 1 ], rayDirection[ 2 ] );

		if ( length === 0 || Number.isFinite( length ) === false ) return false;

		rayDirection[ 0 ] /= length;
		rayDirection[ 1 ] /= length;
		rayDirection[ 2 ] /= length;
		return true;

	}

	_updateMeshMatrix() {

		this.mesh.updateWorldMatrix( true, false );

		const elements = this.mesh.matrixWorld.elements;
		const sx2 = elements[ 0 ] * elements[ 0 ] + elements[ 1 ] * elements[ 1 ] + elements[ 2 ] * elements[ 2 ];
		const sy2 = elements[ 4 ] * elements[ 4 ] + elements[ 5 ] * elements[ 5 ] + elements[ 6 ] * elements[ 6 ];
		const sz2 = elements[ 8 ] * elements[ 8 ] + elements[ 9 ] * elements[ 9 ] + elements[ 10 ] * elements[ 10 ];
		const scaleMax2 = Math.max( sx2, sy2, sz2 );
		const scaleMin2 = Math.min( sx2, sy2, sz2 );
		const tolerance = scaleMax2 * UNIFORM_SCALE_TOLERANCE;
		const dotXY = elements[ 0 ] * elements[ 4 ] + elements[ 1 ] * elements[ 5 ] + elements[ 2 ] * elements[ 6 ];
		const dotXZ = elements[ 0 ] * elements[ 8 ] + elements[ 1 ] * elements[ 9 ] + elements[ 2 ] * elements[ 10 ];
		const dotYZ = elements[ 4 ] * elements[ 8 ] + elements[ 5 ] * elements[ 9 ] + elements[ 6 ] * elements[ 10 ];

		if ( Number.isFinite( scaleMin2 ) === false || Number.isFinite( scaleMax2 ) === false ||
			Number.isFinite( dotXY ) === false || Number.isFinite( dotXZ ) === false || Number.isFinite( dotYZ ) === false ||
			scaleMin2 <= Number.EPSILON || scaleMax2 - scaleMin2 > tolerance ||
			Math.abs( dotXY ) > tolerance || Math.abs( dotXZ ) > tolerance || Math.abs( dotYZ ) > tolerance ) {

			throw new Error( 'Sculptor: The mesh must have a non-zero uniform world scale without shear.' );

		}

		_matInverse.copy( this.mesh.matrixWorld ).invert();

		return ( sx2 + sy2 + sz2 ) / 3;

	}

	_updatePickingMatrices() {

		const scale2 = this._updateMeshMatrix();
		this.camera.updateWorldMatrix( true, false );

		return scale2;

	}

	_clearHit() {

		this._hitFace = - 1;
		this._localRadius2 = 0;
		this._worldRadius2 = 0;
		this._hitPoint[ 0 ] = 0;
		this._hitPoint[ 1 ] = 0;
		this._hitPoint[ 2 ] = 0;
		this._hitNormal[ 0 ] = 0;
		this._hitNormal[ 1 ] = 0;
		this._hitNormal[ 2 ] = 0;

	}

	_pickClosestFace( rayOrigin, rayDirection ) {

		const sculptMesh = this._sculptMesh;
		const candidateFaces = sculptMesh.intersectRay( rayOrigin, rayDirection );
		const vertices = sculptMesh.getVertices();
		const faces = sculptMesh.getFaces();
		let distance = Infinity;

		this._hitFace = - 1;

		for ( let i = 0, l = candidateFaces.length; i < l; ++ i ) {

			const faceIndex = candidateFaces[ i ];
			const faceOffset = faceIndex * 4;
			const offset1 = faces[ faceOffset ] * 3;
			const offset2 = faces[ faceOffset + 1 ] * 3;
			const offset3 = faces[ faceOffset + 2 ] * 3;

			_tmpV1[ 0 ] = vertices[ offset1 ];
			_tmpV1[ 1 ] = vertices[ offset1 + 1 ];
			_tmpV1[ 2 ] = vertices[ offset1 + 2 ];
			_tmpV2[ 0 ] = vertices[ offset2 ];
			_tmpV2[ 1 ] = vertices[ offset2 + 1 ];
			_tmpV2[ 2 ] = vertices[ offset2 + 2 ];
			_tmpV3[ 0 ] = vertices[ offset3 ];
			_tmpV3[ 1 ] = vertices[ offset3 + 1 ];
			_tmpV3[ 2 ] = vertices[ offset3 + 2 ];

			const hitDistance = intersectionRayTriangle( rayOrigin, rayDirection, _tmpV1, _tmpV2, _tmpV3, _tmpInter );

			if ( hitDistance >= 0 && hitDistance < distance ) {

				distance = hitDistance;
				this._hitPoint[ 0 ] = _tmpInter[ 0 ];
				this._hitPoint[ 1 ] = _tmpInter[ 1 ];
				this._hitPoint[ 2 ] = _tmpInter[ 2 ];
				this._hitFace = faceIndex;

			}

		}

		return this._hitFace !== - 1;

	}

	_intersectionRayMesh( clientX, clientY, scale2 ) {

		const rect = this._getRect();

		if ( Number.isFinite( clientX ) === false || Number.isFinite( clientY ) === false ||
			Number.isFinite( rect.width ) === false || Number.isFinite( rect.height ) === false || rect.width <= 0 || rect.height <= 0 ) {

			this._clearHit();
			return false;

		}

		if ( scale2 === undefined ) scale2 = this._updatePickingMatrices();

		if ( this._updatePointerRay( clientX, clientY ) === false ) {

			this._clearHit();
			return false;

		}

		if ( this._pickClosestFace( this._rayOrigin, this._rayDirection ) === false ) {

			this._clearHit();
			return false;

		}

		this._updateRadii( scale2 );

		return true;

	}

	_updateRadii( scale2 ) {

		const hitPoint = this._hitPoint;
		_v3WorldPoint.set( hitPoint[ 0 ], hitPoint[ 1 ], hitPoint[ 2 ] ).applyMatrix4( this.mesh.matrixWorld );
		this._project( _v3WorldPoint, _v3ScreenPoint );
		this._unproject( _v3ScreenPoint.x + this._size, _v3ScreenPoint.y, _v3ScreenPoint.z, _v3WorldRadiusPoint );

		this._worldRadius2 = _v3WorldPoint.distanceToSquared( _v3WorldRadiusPoint );
		this._localRadius2 = this._worldRadius2 / scale2;

	}

	_pickVerticesInSphere( radius2 ) {

		const sculptMesh = this._sculptMesh;
		const vertices = sculptMesh.getVertices();
		const sculptFlags = sculptMesh.getVerticesSculptFlags();
		const hitPoint = this._hitPoint;
		const facesInCells = sculptMesh.intersectSphere( hitPoint, radius2, true );
		const verticesInCells = sculptMesh.getVerticesFromFaces( facesInCells );
		const sculptFlag = sculptMesh.nextSculptFlag();
		const pickedVertices = new Uint32Array( getMemory( 4 * verticesInCells.length ), 0, verticesInCells.length );
		let count = 0;
		const ix = hitPoint[ 0 ];
		const iy = hitPoint[ 1 ];
		const iz = hitPoint[ 2 ];

		for ( let i = 0, l = verticesInCells.length; i < l; ++ i ) {

			const vertexIndex = verticesInCells[ i ];
			const offset = vertexIndex * 3;
			const dx = ix - vertices[ offset ];
			const dy = iy - vertices[ offset + 1 ];
			const dz = iz - vertices[ offset + 2 ];

			if ( dx * dx + dy * dy + dz * dz < radius2 ) {

				sculptFlags[ vertexIndex ] = sculptFlag;
				pickedVertices[ count ++ ] = vertexIndex;

			}

		}

		return pickedVertices.slice( 0, count );

	}

	_computePickedNormal() {

		if ( this._hitFace < 0 ) return false;

		const sculptMesh = this._sculptMesh;
		const faces = sculptMesh.getFaces();
		const vertices = sculptMesh.getVertices();
		const normals = sculptMesh.getNormals();
		const faceOffset = this._hitFace * 4;
		const offset1 = faces[ faceOffset ] * 3;
		const offset2 = faces[ faceOffset + 1 ] * 3;
		const offset3 = faces[ faceOffset + 2 ] * 3;
		const hitPoint = this._hitPoint;
		const dx1 = hitPoint[ 0 ] - vertices[ offset1 ];
		const dy1 = hitPoint[ 1 ] - vertices[ offset1 + 1 ];
		const dz1 = hitPoint[ 2 ] - vertices[ offset1 + 2 ];
		const dx2 = hitPoint[ 0 ] - vertices[ offset2 ];
		const dy2 = hitPoint[ 1 ] - vertices[ offset2 + 1 ];
		const dz2 = hitPoint[ 2 ] - vertices[ offset2 + 2 ];
		const dx3 = hitPoint[ 0 ] - vertices[ offset3 ];
		const dy3 = hitPoint[ 1 ] - vertices[ offset3 + 1 ];
		const dz3 = hitPoint[ 2 ] - vertices[ offset3 + 2 ];
		const hitNormal = this._hitNormal;
		const distance1 = Math.hypot( dx1, dy1, dz1 );
		const distance2 = Math.hypot( dx2, dy2, dz2 );
		const distance3 = Math.hypot( dx3, dy3, dz3 );

		if ( distance1 === 0 || distance2 === 0 || distance3 === 0 ) {

			const offset = distance1 === 0 ? offset1 : ( distance2 === 0 ? offset2 : offset3 );
			hitNormal[ 0 ] = normals[ offset ];
			hitNormal[ 1 ] = normals[ offset + 1 ];
			hitNormal[ 2 ] = normals[ offset + 2 ];

		} else {

			const weight1 = 1 / distance1;
			const weight2 = 1 / distance2;
			const weight3 = 1 / distance3;
			const inverseSum = 1 / ( weight1 + weight2 + weight3 );

			hitNormal[ 0 ] = ( normals[ offset1 ] * weight1 + normals[ offset2 ] * weight2 + normals[ offset3 ] * weight3 ) * inverseSum;
			hitNormal[ 1 ] = ( normals[ offset1 + 1 ] * weight1 + normals[ offset2 + 1 ] * weight2 + normals[ offset3 + 1 ] * weight3 ) * inverseSum;
			hitNormal[ 2 ] = ( normals[ offset1 + 2 ] * weight1 + normals[ offset2 + 2 ] * weight2 + normals[ offset3 + 2 ] * weight3 ) * inverseSum;

		}

		const length = Math.hypot( hitNormal[ 0 ], hitNormal[ 1 ], hitNormal[ 2 ] );

		if ( length > 0 ) {

			hitNormal[ 0 ] /= length;
			hitNormal[ 1 ] /= length;
			hitNormal[ 2 ] /= length;

		}

		return true;

	}

	_dynamicTopology( pickedVertices ) {

		const sculptMesh = this._sculptMesh;
		const detail = this._detail;

		if ( detail === 0 ) return pickedVertices;

		const originalPickedVertices = pickedVertices;
		const topologyVersion = sculptMesh.getTopologyVersion();

		if ( pickedVertices.length === 0 ) pickedVertices = sculptMesh.getVerticesFromFaces( [ this._hitFace ] );

		let faces = sculptMesh.getFacesFromVertices( pickedVertices );
		const radius2 = this._localRadius2;
		const hitPoint = this._hitPoint;
		// Keep edge targets non-zero at maximum detail.
		const edgeMax2 = radius2 * ( 1.1 - detail ) * 0.2;
		// Keep the collapse threshold below half the split length to avoid oscillation.
		const edgeMin2 = edgeMax2 / TOPOLOGY_HYSTERESIS2;

		faces = subdivisionPass( sculptMesh, faces, hitPoint, radius2, edgeMax2 );
		faces = decimationPass( sculptMesh, faces, hitPoint, radius2, edgeMin2 );

		// Rebuild topology caches only when connectivity changes.
		if ( sculptMesh.getTopologyVersion() === topologyVersion ) return originalPickedVertices;

		let affectedVertices = sculptMesh.getVerticesFromFaces( faces );

		// Include faces adjacent to smoothed vertices to update their normals,
		// bounds and octree cells.
		faces = sculptMesh.getFacesFromVertices( affectedVertices );
		affectedVertices = sculptMesh.getVerticesFromFaces( faces );
		const sculptFlags = sculptMesh.getVerticesSculptFlags();
		const sculptFlag = sculptMesh.getSculptFlag();
		const verticesInRadius = new Uint32Array( getMemory( affectedVertices.length * 4 ), 0, affectedVertices.length );
		let count = 0;

		for ( let i = 0, l = affectedVertices.length; i < l; ++ i ) {

			const vertexIndex = affectedVertices[ i ];

			if ( sculptFlags[ vertexIndex ] === sculptFlag ) verticesInRadius[ count ++ ] = vertexIndex;

		}

		const result = verticesInRadius.slice( 0, count );
		sculptMesh.updateTopology( faces, affectedVertices );
		sculptMesh._updateGeometry( faces, affectedVertices );
		this._markVerticesDirty( affectedVertices );

		return result;

	}

	_intersectionFromRay( ray, worldRadius ) {

		validatePositive( 'worldRadius', worldRadius );

		if ( ray === undefined || ray === null || ray.origin?.isVector3 !== true || ray.direction?.isVector3 !== true ) {

			throw new TypeError( 'Sculptor: ray must have Vector3 origin and direction properties.' );

		}

		const worldOrigin = ray.origin;
		const worldDirection = ray.direction;
		const directionLengthSq = worldDirection.lengthSq();

		if ( Number.isFinite( worldOrigin.x ) === false || Number.isFinite( worldOrigin.y ) === false || Number.isFinite( worldOrigin.z ) === false ||
			Number.isFinite( worldDirection.x ) === false || Number.isFinite( worldDirection.y ) === false || Number.isFinite( worldDirection.z ) === false ||
			Number.isFinite( directionLengthSq ) === false || directionLengthSq === 0 ) {

			throw new RangeError( 'Sculptor: origin and direction must contain finite values, and direction must be non-zero.' );

		}

		const scale2 = this._updateMeshMatrix();
		const worldRadius2 = worldRadius * worldRadius;
		const localRadius = worldRadius / Math.sqrt( scale2 );
		const localRadius2 = localRadius * localRadius;

		if ( Number.isFinite( worldRadius2 ) === false || Number.isFinite( localRadius2 ) === false ||
			localRadius2 === 0 || localRadius > MAX_FLOAT32 ) {

			throw new RangeError( 'Sculptor: worldRadius is too large or too small for the mesh scale.' );

		}

		_v3NearLocal.copy( worldOrigin ).applyMatrix4( _matInverse );
		_v3FarLocal.copy( worldDirection ).transformDirection( _matInverse );

		const rayOrigin = this._rayOrigin;
		rayOrigin[ 0 ] = _v3NearLocal.x;
		rayOrigin[ 1 ] = _v3NearLocal.y;
		rayOrigin[ 2 ] = _v3NearLocal.z;

		const rayDirection = this._rayDirection;
		rayDirection[ 0 ] = _v3FarLocal.x;
		rayDirection[ 1 ] = _v3FarLocal.y;
		rayDirection[ 2 ] = _v3FarLocal.z;

		if ( this._pickClosestFace( rayOrigin, rayDirection ) === false ) {

			this._clearHit();
			return false;

		}

		this._worldRadius2 = worldRadius2;
		this._localRadius2 = localRadius2;

		return true;

	}

	/**
	 * Applies a ray stamp, starting a stroke on a hit. Call
	 * {@link Sculptor#endStroke} after the last stamp.
	 *
	 * Returns `false` without updating the hit during a pointer stroke.
	 * Drag and Scale require pointer input.
	 *
	 * @param {Ray} ray - The world-space ray, with a non-zero direction.
	 * @param {number} worldRadius - The brush radius in world units.
	 * @return {boolean} Whether the ray hit the mesh.
	 */
	strokeFromRay( ray, worldRadius ) {

		if ( this._activePointerId !== null ) return false;

		const tool = this._tool;
		validateRayTool( tool );

		if ( this.pickFromRay( ray, worldRadius ) === false ) return false;
		this.beginStroke();
		if ( this._sculpting === false ) return false;
		if ( this._tool !== tool ) validateRayTool( this._tool );
		this._applyStroke();
		this._syncGeometry();

		return true;

	}

	/**
	 * Begins a stroke and fires `start`. Does nothing while a stroke is active.
	 * Called automatically by pointer input or the first successful ray stamp.
	 *
	 * @return {Sculptor} A reference to this sculptor.
	 */
	beginStroke() {

		if ( this._sculpting ) return this;

		this._sculpting = true;
		this.dispatchEvent( _startEvent );
		return this;

	}

	/**
	 * Releases pointer capture, balances the octree and updates exact bounds,
	 * then fires `end`. Does nothing while idle. Called automatically when a
	 * pointer stroke ends or is cancelled.
	 *
	 * @return {Sculptor} A reference to this sculptor.
	 */
	endStroke() {

		if ( this._sculpting === false ) return this;

		const pointerId = this._activePointerId;
		this._activePointerId = null;
		this._sculpting = false;

		if ( pointerId !== null && this.domElement !== null && typeof this.domElement.releasePointerCapture === 'function' ) {

			try {

				this.domElement.releasePointerCapture( pointerId );

			} catch {

				// Synthetic events and detached elements may not support capture.

			}

		}

		this._sculptMesh.balanceOctree();
		if ( this._boundsDirty ) this._computeExactBounds();
		this.dispatchEvent( _endEvent );
		return this;

	}

	_applyStroke( scaleDelta = 0 ) {

		const tool = this._tool;
		const strength = this._strength;
		const deforms = strength !== 0 || tool === 'drag' || tool === 'scale';
		const remeshes = tool !== 'smooth' && this._detail !== 0;

		if ( deforms === false && remeshes === false ) return;

		const radius2 = this._localRadius2;
		let pickedVertices = this._pickVerticesInSphere( radius2 );
		const sculptMesh = this._sculptMesh;

		if ( remeshes ) pickedVertices = this._dynamicTopology( pickedVertices );
		if ( deforms === false || pickedVertices.length === 0 ) return;

		const hitPoint = this._hitPoint;
		const negative = this._negative;

		switch ( tool ) {

			case 'clay':
			case 'flatten': {

				const frontVertices = getFrontVertices( sculptMesh, pickedVertices, this._rayDirection );
				const planeNormal = areaNormal( sculptMesh, frontVertices );

				if ( planeNormal === null ) return;

				const planePoint = areaCenter( sculptMesh, frontVertices );

				if ( tool === 'clay' ) {

					const offset = Math.sqrt( radius2 ) * CLAY_OFFSET_RATIO * ( negative ? - 1 : 1 );
					planePoint[ 0 ] += planeNormal[ 0 ] * offset;
					planePoint[ 1 ] += planeNormal[ 1 ] * offset;
					planePoint[ 2 ] += planeNormal[ 2 ] * offset;

				}

				toolFlatten( sculptMesh, pickedVertices, planeNormal, planePoint, hitPoint, radius2, strength, negative );
				break;

			}

			case 'brush':
				toolBrush( sculptMesh, pickedVertices, this._hitNormal, hitPoint, radius2, strength, negative );
				break;

			case 'inflate':
				toolInflate( sculptMesh, pickedVertices, hitPoint, radius2, strength, negative );
				break;

			case 'smooth':
				toolSmooth( sculptMesh, pickedVertices, strength );
				break;

			case 'pinch':
				toolPinch( sculptMesh, pickedVertices, hitPoint, radius2, strength, negative );
				break;

			case 'crease':
				toolCrease( sculptMesh, pickedVertices, this._hitNormal, hitPoint, radius2, strength, negative );
				break;

			case 'drag':
				toolDrag( sculptMesh, pickedVertices, hitPoint, radius2, this._dragDirection );
				break;

			case 'scale':
				toolScale( sculptMesh, pickedVertices, hitPoint, radius2, scaleDelta );
				break;

		}

		const faces = sculptMesh.getFacesFromVertices( pickedVertices );
		const affectedVertices = sculptMesh.getVerticesFromFaces( faces );
		sculptMesh._updateGeometry( faces, affectedVertices );
		this._markVerticesDirty( affectedVertices );

	}

	_makeStroke( clientX, clientY, scale2 ) {

		if ( this._intersectionRayMesh( clientX, clientY, scale2 ) === false ) return false;

		this._computePickedNormal();
		this._applyStroke();

		return true;

	}

	_sculptStroke( clientX, clientY ) {

		const dx = clientX - this._lastPointerX;
		const dy = clientY - this._lastPointerY;
		const distance = Math.hypot( dx, dy );
		const minSpacing = STAMP_SPACING_RATIO * this._size;

		if ( distance <= minSpacing ) return false;

		const count = Math.floor( distance / minSpacing );
		const stepX = dx / count;
		const stepY = dy / count;
		let x = this._lastPointerX + stepX;
		let y = this._lastPointerY + stepY;
		let stamped = false;
		let pointerSampled = false;
		const scale2 = this._updatePickingMatrices();

		for ( let i = 0; i < count; ++ i ) {

			pointerSampled = i === count - 1;
			if ( this._makeStroke( x, y, scale2 ) === false ) break;

			stamped = true;
			x += stepX;
			y += stepY;

		}

		this._lastPointerX = clientX;
		this._lastPointerY = clientY;

		if ( stamped ) this._syncGeometry();

		return pointerSampled;

	}

	_updateDragDirection( clientX, clientY, scale2 ) {

		if ( this._updatePointerRay( clientX, clientY ) === false ) return false;

		const hitPoint = this._hitPoint;
		const rayOrigin = this._rayOrigin;
		const rayDirection = this._rayDirection;
		const abx = rayDirection[ 0 ];
		const aby = rayDirection[ 1 ];
		const abz = rayDirection[ 2 ];
		const px = hitPoint[ 0 ] - rayOrigin[ 0 ];
		const py = hitPoint[ 1 ] - rayOrigin[ 1 ];
		const pz = hitPoint[ 2 ] - rayOrigin[ 2 ];
		const denominator = abx * abx + aby * aby + abz * abz;
		const projection = denominator > 0 ? ( abx * px + aby * py + abz * pz ) / denominator : 0;
		const x = rayOrigin[ 0 ] + abx * projection;
		const y = rayOrigin[ 1 ] + aby * projection;
		const z = rayOrigin[ 2 ] + abz * projection;

		this._dragDirection[ 0 ] = x - hitPoint[ 0 ];
		this._dragDirection[ 1 ] = y - hitPoint[ 1 ];
		this._dragDirection[ 2 ] = z - hitPoint[ 2 ];
		hitPoint[ 0 ] = x;
		hitPoint[ 1 ] = y;
		hitPoint[ 2 ] = z;

		this._updateRadii( scale2 );
		return true;

	}

	_sculptStrokeDrag( clientX, clientY ) {

		const dx = clientX - this._lastPointerX;
		const dy = clientY - this._lastPointerY;
		const distance = Math.hypot( dx, dy );

		if ( distance === 0 ) return false;

		const minSpacing = STAMP_SPACING_RATIO * this._size;
		const count = Math.max( 1, Math.floor( distance / minSpacing ) );
		const stepX = dx / count;
		const stepY = dy / count;
		let x = this._lastPointerX + stepX;
		let y = this._lastPointerY + stepY;
		let stamped = false;
		const scale2 = this._updatePickingMatrices();

		for ( let i = 0; i < count; ++ i ) {

			if ( this._updateDragDirection( x, y, scale2 ) === false ) break;
			this._computePickedNormal();
			this._applyStroke();
			stamped = true;
			x += stepX;
			y += stepY;

		}

		this._lastPointerX = clientX;
		this._lastPointerY = clientY;

		if ( stamped ) this._syncGeometry();

		return stamped;

	}

	_sculptStrokeScale( clientX, clientY ) {

		const scaleDelta = clientX - this._lastPointerX;
		this._lastPointerX = clientX;
		this._lastPointerY = clientY;

		if ( scaleDelta === 0 ) return false;

		this._applyStroke( scaleDelta );
		this._syncGeometry();

		return true;

	}

	_markVerticesDirty( vertices ) {

		if ( vertices.length === 0 ) return;

		this._boundsDirty = true;
		const positions = this._sculptMesh.getVertices();
		const geometry = this.mesh.geometry;
		const box = geometry.boundingBox;
		const sphere = geometry.boundingSphere;
		let radius2 = sphere === null ? 0 : sphere.radius * sphere.radius;

		for ( let i = 0, l = vertices.length; i < l; ++ i ) {

			const vertexIndex = vertices[ i ];
			const offset = vertexIndex * 3;

			this._dirtyVertices.push( vertexIndex );

			_v3Temp.fromArray( positions, offset );

			if ( box !== null ) box.expandByPoint( _v3Temp );
			if ( sphere !== null ) radius2 = Math.max( radius2, sphere.center.distanceToSquared( _v3Temp ) );

		}

		if ( sphere !== null ) sphere.radius = Math.sqrt( radius2 );

	}

	_syncGeometry() {

		const sculptMesh = this._sculptMesh;
		let geometry = this.mesh.geometry;
		const vertexCount = sculptMesh.getNbVertices();
		const indexLength = sculptMesh.getNbTriangles() * 3;
		const positions = sculptMesh.getVertices();
		const normals = sculptMesh.getRenderNormals();
		const indices = sculptMesh.getTriangles();
		let positionAttribute = geometry.getAttribute( 'position' );
		let normalAttribute = geometry.getAttribute( 'normal' );
		let indexAttribute = geometry.getIndex();
		const replacePosition = attributeMatches( positionAttribute, positions, 3 ) === false;
		const replaceNormal = attributeMatches( normalAttribute, normals, 3 ) === false;
		const replaceIndex = attributeMatches( indexAttribute, indices, 1 ) === false;
		const replaceGeometry = this._geometrySynced && ( replacePosition || replaceNormal || replaceIndex );
		let previousGeometry = null;
		const dirtyVertices = this._dirtyVertices;
		let hasDirtyVertices = dirtyVertices.length > 0;

		if ( hasDirtyVertices && replaceGeometry === false ) {

			hasDirtyVertices = compactDirtyVertices( dirtyVertices, vertexCount );

		}

		// Uploaded buffers cannot resize. Replace the geometry to release its GPU
		// resources without invalidating the new attributes.
		if ( replaceGeometry ) {

			previousGeometry = geometry;
			geometry = createReplacementGeometry( previousGeometry );

		}

		if ( replaceGeometry || replacePosition ) {

			positionAttribute = createVersionedAttribute( positions, 3, positionAttribute );
			geometry.setAttribute( 'position', positionAttribute );

		} else if ( hasDirtyVertices ) {

			addVertexUpdateRanges( positionAttribute, dirtyVertices );
			positionAttribute.needsUpdate = true;

		}

		if ( replaceGeometry || replaceNormal ) {

			normalAttribute = createVersionedAttribute( normals, 3, normalAttribute );
			geometry.setAttribute( 'normal', normalAttribute );

		} else if ( hasDirtyVertices ) {

			addVertexUpdateRanges( normalAttribute, dirtyVertices );
			normalAttribute.needsUpdate = true;

		}

		const topologyVersion = sculptMesh.getTopologyVersion();
		const changed = this._geometrySynced && ( replaceGeometry || hasDirtyVertices || topologyVersion !== this._lastTopologyVersion );

		if ( replaceGeometry || replaceIndex ) {

			indexAttribute = createVersionedAttribute( indices, 1, indexAttribute );
			geometry.setIndex( indexAttribute );

		} else if ( topologyVersion !== this._lastTopologyVersion ) {

			indexAttribute.clearUpdateRanges();
			indexAttribute.addUpdateRange( 0, indexLength );
			indexAttribute.needsUpdate = true;

		}

		geometry.setDrawRange( 0, indexLength );

		if ( previousGeometry !== null ) {

			this.mesh.geometry = geometry;
			previousGeometry.dispose();

		}

		this._lastTopologyVersion = topologyVersion;
		this._dirtyVertices.length = 0;
		this._geometrySynced = true;

		if ( changed ) this.dispatchEvent( _changeEvent );

	}

	_computeExactBounds() {

		const geometry = this.mesh.geometry;
		const positions = this._sculptMesh.getVertices();
		const length = this._sculptMesh.getNbVertices() * 3;

		if ( geometry.boundingBox === null ) geometry.boundingBox = new Box3();
		if ( geometry.boundingSphere === null ) geometry.boundingSphere = new Sphere();

		const box = geometry.boundingBox;
		const sphere = geometry.boundingSphere;
		box.makeEmpty();

		// Spare capacity may contain deleted vertices; only bound the active prefix.
		for ( let i = 0; i < length; i += 3 ) box.expandByPoint( _v3Temp.fromArray( positions, i ) );

		box.getCenter( sphere.center );
		let radius2 = 0;

		for ( let i = 0; i < length; i += 3 ) {

			radius2 = Math.max( radius2, sphere.center.distanceToSquared( _v3Temp.fromArray( positions, i ) ) );

		}

		sphere.radius = Math.sqrt( radius2 );
		this._boundsDirty = false;

	}

	/**
	 * Returns an independent copy of the active vertices and triangles, without
	 * spare capacity. Suitable for export or geometry processing. The caller owns it.
	 *
	 * @return {BufferGeometry} A new geometry containing the active vertices and triangles.
	 */
	getGeometry() {

		const sculptMesh = this._sculptMesh;
		const vertexLength = sculptMesh.getNbVertices() * 3;
		const geometry = new BufferGeometry();
		geometry.name = this.mesh.geometry.name;
		geometry.setAttribute( 'position', new BufferAttribute( sculptMesh.getVertices().slice( 0, vertexLength ), 3 ) );
		geometry.setAttribute( 'normal', new BufferAttribute( sculptMesh.getRenderNormals().slice( 0, vertexLength ), 3 ) );
		geometry.setIndex( new BufferAttribute( sculptMesh.getTriangles().slice( 0, sculptMesh.getNbTriangles() * 3 ), 1 ) );
		return geometry;

	}

	_onPointerDown( event ) {

		if ( this.enabled === false || event.button !== 0 || event.isPrimary === false || this._sculpting ) return;

		this._cachedRect = null;

		if ( this._intersectionRayMesh( event.clientX, event.clientY ) === false ) return;

		this._computePickedNormal();
		this._activePointerId = event.pointerId;
		this._lastPointerX = event.clientX;
		this._lastPointerY = event.clientY;

		if ( typeof this.domElement.setPointerCapture === 'function' ) {

			try {

				this.domElement.setPointerCapture( event.pointerId );

			} catch {

				// Synthetic events and detached elements may not support capture.

			}

		}

		this.beginStroke();

	}

	_onPointerMove( event ) {

		if ( this.enabled === false || this._sculpting === false || event.pointerId !== this._activePointerId ) return;

		this._cachedRect = null;
		const tool = this._tool;

		if ( tool === 'drag' ) {

			this._sculptStrokeDrag( event.clientX, event.clientY );

		} else if ( tool === 'scale' ) {

			this._sculptStrokeScale( event.clientX, event.clientY );

		} else {

			const pointerSampled = this._sculptStroke( event.clientX, event.clientY );

			// Update the cursor between stamps.
			if ( pointerSampled !== true && this._intersectionRayMesh( event.clientX, event.clientY ) ) this._computePickedNormal();

		}

	}

	_onPointerUp( event ) {

		if ( event.pointerId === this._activePointerId ) this.endStroke();

	}

	/**
	 * Returns the active sculpting tool.
	 *
	 * @return {('clay'|'brush'|'inflate'|'smooth'|'flatten'|'pinch'|'crease'|'drag'|'scale')} The tool name.
	 */
	getTool() {

		return this._tool;

	}

	/**
	 * Selects a tool and restores its size, strength and negative setting.
	 *
	 * @param {('clay'|'brush'|'inflate'|'smooth'|'flatten'|'pinch'|'crease'|'drag'|'scale')} value - The tool name.
	 * @return {Sculptor} A reference to this sculptor.
	 */
	setTool( value ) {

		if ( Object.prototype.hasOwnProperty.call( TOOL_DEFAULTS, value ) === false ) {

			throw new RangeError( `Sculptor: Unknown tool "${ value }".` );

		}

		if ( value === this._tool ) return this;

		const settings = this._toolSettings[ value ];
		this._tool = value;
		this._size = settings.size;
		this._strength = settings.strength;
		this._negative = settings.negative;

		return this;

	}

	/**
	 * Returns the pointer brush radius in CSS pixels.
	 *
	 * @return {number} The brush radius.
	 */
	getSize() {

		return this._size;

	}

	/**
	 * Sets the pointer brush radius in CSS pixels.
	 *
	 * @param {number} value - A value between 5 and 500.
	 * @return {Sculptor} A reference to this sculptor.
	 */
	setSize( value ) {

		const size = validateSize( value );
		this._size = size;
		this._toolSettings[ this._tool ].size = size;
		return this;

	}

	/**
	 * Returns the strength of the active tool.
	 *
	 * @return {number} The tool strength.
	 */
	getStrength() {

		return this._strength;

	}

	/**
	 * Sets the strength of the active tool.
	 * A value of `0` disables deformation, but not adaptive remeshing.
	 * Drag and Scale use pointer movement instead of this setting.
	 *
	 * @param {number} value - A value between 0 and 1.
	 * @return {Sculptor} A reference to this sculptor.
	 */
	setStrength( value ) {

		const strength = validateUnitInterval( 'strength', value );
		this._strength = strength;
		this._toolSettings[ this._tool ].strength = strength;
		return this;

	}

	/**
	 * Returns whether the active tool applies its inverse effect.
	 *
	 * @return {boolean} Whether the tool direction is inverted.
	 */
	getNegative() {

		return this._negative;

	}

	/**
	 * Sets whether the active tool applies its inverse effect.
	 *
	 * @param {boolean} value - Whether the tool direction is inverted.
	 * @return {Sculptor} A reference to this sculptor.
	 */
	setNegative( value ) {

		if ( typeof value !== 'boolean' ) throw new TypeError( 'Sculptor: negative must be a boolean.' );

		this._negative = value;
		this._toolSettings[ this._tool ].negative = value;
		return this;

	}

	/**
	 * Returns the adaptive-topology detail. `0` freezes topology.
	 *
	 * @return {number} The detail level.
	 */
	getDetail() {

		return this._detail;

	}

	/**
	 * Sets the adaptive-topology detail. Higher values produce shorter edges
	 * relative to the brush radius; `0` freezes topology. Remeshing splits long
	 * edges and collapses short ones, and can alter the surface even at zero strength.
	 *
	 * @param {number} value - A value between 0 and 1.
	 * @return {Sculptor} A reference to this sculptor.
	 */
	setDetail( value ) {

		this._detail = validateUnitInterval( 'detail', value );
		return this;

	}

	/**
	 * Returns whether a pointer or programmatic stroke is active.
	 *
	 * @return {boolean} Whether a stroke is active.
	 */
	isSculpting() {

		return this._sculpting;

	}

	/**
	 * Returns whether the latest pick or stroke ray hit the mesh.
	 *
	 * @return {boolean} Whether the latest ray hit the mesh.
	 */
	hasHit() {

		return this._hitFace >= 0;

	}

	/**
	 * Copies the current local-space hit position into the target vector.
	 * Returns a zero vector when there is no hit.
	 *
	 * @param {Vector3} target - The vector to receive the hit position.
	 * @return {Vector3} The target vector.
	 */
	getHitPoint( target ) {

		return target.fromArray( this._hitPoint );

	}

	/**
	 * Copies the current local-space unit surface normal into the target vector.
	 * Returns a zero vector when there is no hit.
	 *
	 * @param {Vector3} target - The vector to receive the surface normal.
	 * @return {Vector3} The target vector.
	 */
	getHitNormal( target ) {

		return target.fromArray( this._hitNormal );

	}

	/**
	 * Returns the brush radius in world units, or `0` without a hit.
	 *
	 * @return {number} The brush radius in world units.
	 */
	getWorldRadius() {

		return Math.sqrt( this._worldRadius2 );

	}

	/**
	 * Updates the current hit from a world-space ray without sculpting.
	 *
	 * @param {Ray} ray - The world-space ray, with a non-zero direction.
	 * @param {number} worldRadius - The brush radius in world units.
	 * @return {boolean} Whether the ray hit the mesh.
	 */
	pickFromRay( ray, worldRadius ) {

		if ( this._intersectionFromRay( ray, worldRadius ) === false ) return false;

		this._computePickedNormal();
		return true;

	}

	/**
	 * Updates the current hit from client coordinates without sculpting.
	 *
	 * @param {number} clientX - Horizontal client coordinate in CSS pixels.
	 * @param {number} clientY - Vertical client coordinate in CSS pixels.
	 * @return {boolean} Whether the pointer ray hit the mesh.
	 */
	pickFromPointer( clientX, clientY ) {

		this._cachedRect = null;

		if ( this._intersectionRayMesh( clientX, clientY ) === false ) return false;

		this._computePickedNormal();

		return true;

	}

}

export { Sculptor };
