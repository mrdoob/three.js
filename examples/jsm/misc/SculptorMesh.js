/*!
 * Portions adapted from SculptGL by Stéphane Ginier.
 * Copyright (c) 2019 Stéphane GINIER
 * Licensed under the MIT License; see ./SculptGL.LICENSE.txt.
 */

import {
	TRI_INDEX,
	MAX_FLAG,
	getMemory
} from './SculptorUtils.js';

const OCTREE_MAX_DEPTH = 8;
const OCTREE_MAX_FACES = 100;
// A depth-first walk retains at most seven siblings for each level.
const OCTREE_STACK = new Array( 1 + 7 * OCTREE_MAX_DEPTH ).fill( null );
const RELATIVE_WELD_TOLERANCE = 1e-7;

function queueLeaf( leaves, leaf ) {

	if ( leaves === undefined || leaf._queuedForUpdate ) return;
	leaf._queuedForUpdate = true;
	leaves.push( leaf );

}

function hashPosition( x, y, z ) {

	let hash = Math.imul( x, 0x85ebca6b );
	hash = Math.imul( hash ^ ( hash >>> 13 ) ^ y, 0xc2b2ae35 );
	hash = Math.imul( hash ^ ( hash >>> 16 ) ^ z, 0x27d4eb2d );
	return ( hash ^ ( hash >>> 15 ) ) >>> 0;

}

function resetTagFlags( flags, activeCount ) {

	for ( let i = 0; i < activeCount; i ++ ) {

		if ( flags[ i ] >= 0 ) flags[ i ] = 0;

	}

	flags.fill( 0, activeCount );

}

function readSourceElements( index, sourceVertexCount ) {

	const elementCount = index ? index.count : sourceVertexCount;

	if ( index && ( index.itemSize !== 1 || index.normalized ) ) {

		throw new Error( 'SculptorMesh: The index must be a non-normalized scalar attribute.' );

	}

	if ( index && typeof index.getX !== 'function' ) {

		throw new Error( 'SculptorMesh: The index attribute must be CPU-accessible.' );

	}

	if ( elementCount === 0 || elementCount % 3 !== 0 ) {

		throw new Error( 'SculptorMesh: The geometry must contain triangles with a complete, non-empty element list.' );

	}

	if ( index === null ) {

		return { elementCount, sourceIndices: null, referencedVertices: null };

	}

	const sourceIndices = new Uint32Array( elementCount );
	const referencedVertices = new Uint8Array( sourceVertexCount );

	for ( let i = 0; i < elementCount; i ++ ) {

		const sourceIndex = index.getX( i );

		if ( Number.isInteger( sourceIndex ) === false || sourceIndex < 0 || sourceIndex >= sourceVertexCount ) {

			throw new Error( 'SculptorMesh: Triangle indices must reference valid positions.' );

		}

		sourceIndices[ i ] = sourceIndex;
		referencedVertices[ sourceIndex ] = 1;

	}

	return { elementCount, sourceIndices, referencedVertices };

}

function readSourcePositions( position, referencedVertices ) {

	const sourceVertexCount = position.count;
	const positions = new Float32Array( sourceVertexCount * 3 );
	let minX = Infinity, minY = Infinity, minZ = Infinity;
	let maxX = - Infinity, maxY = - Infinity, maxZ = - Infinity;

	for ( let i = 0; i < sourceVertexCount; i ++ ) {

		if ( referencedVertices !== null && referencedVertices[ i ] === 0 ) continue;

		const sourceX = position.getX( i );
		const sourceY = position.getY( i );
		const sourceZ = position.getZ( i );

		if ( Number.isFinite( sourceX ) === false || Number.isFinite( sourceY ) === false || Number.isFinite( sourceZ ) === false ) {

			throw new Error( 'SculptorMesh: Position values must be finite.' );

		}

		const x = Math.fround( sourceX );
		const y = Math.fround( sourceY );
		const z = Math.fround( sourceZ );

		if ( Number.isFinite( x ) === false || Number.isFinite( y ) === false || Number.isFinite( z ) === false ) {

			throw new Error( 'SculptorMesh: Position values must fit in Float32 storage.' );

		}

		const offset = i * 3;
		positions[ offset ] = x;
		positions[ offset + 1 ] = y;
		positions[ offset + 2 ] = z;

		if ( x < minX ) minX = x;
		if ( y < minY ) minY = y;
		if ( z < minZ ) minZ = z;
		if ( x > maxX ) maxX = x;
		if ( y > maxY ) maxY = y;
		if ( z > maxZ ) maxZ = z;

	}

	return { positions, bounds: [ minX, minY, minZ, maxX, maxY, maxZ ] };

}

function weldPositions( sourcePositions, referencedVertices, bounds ) {

	const sourceVertexCount = sourcePositions.length / 3;
	const extent = Math.max( bounds[ 3 ] - bounds[ 0 ], bounds[ 4 ] - bounds[ 1 ], bounds[ 5 ] - bounds[ 2 ] );
	const tolerance = extent * RELATIVE_WELD_TOLERANCE;
	const toleranceSquared = tolerance * tolerance;

	// Cells twice the weld radius only need the current and nearest neighboring
	// cell in each dimension. Exact distances resolve spatial-hash collisions.
	const inverseCellSize = tolerance > 0 ? 0.5 / tolerance : 0;
	const cellHeads = new Map();
	const nextHashEntry = [];
	const mergedPositions = [];
	const vertexMap = new Uint32Array( sourceVertexCount );
	const searchCellCount = inverseCellSize > 0 ? 2 : 1;

	for ( let i = 0; i < sourceVertexCount; i ++ ) {

		if ( referencedVertices !== null && referencedVertices[ i ] === 0 ) continue;

		const offset = i * 3;
		const x = sourcePositions[ offset ];
		const y = sourcePositions[ offset + 1 ];
		const z = sourcePositions[ offset + 2 ];
		const gridX = ( x - bounds[ 0 ] ) * inverseCellSize;
		const gridY = ( y - bounds[ 1 ] ) * inverseCellSize;
		const gridZ = ( z - bounds[ 2 ] ) * inverseCellSize;
		const cellX = Math.floor( gridX );
		const cellY = Math.floor( gridY );
		const cellZ = Math.floor( gridZ );
		const neighborX = cellX + ( gridX - cellX < 0.5 ? - 1 : 1 );
		const neighborY = cellY + ( gridY - cellY < 0.5 ? - 1 : 1 );
		const neighborZ = cellZ + ( gridZ - cellZ < 0.5 ? - 1 : 1 );
		let mergedIndex;
		let closestDistanceSquared = Infinity;

		searchCells: for ( let iz = 0; iz < searchCellCount; iz ++ ) {

			const searchZ = iz === 0 ? cellZ : neighborZ;

			for ( let iy = 0; iy < searchCellCount; iy ++ ) {

				const searchY = iy === 0 ? cellY : neighborY;

				for ( let ix = 0; ix < searchCellCount; ix ++ ) {

					const searchX = ix === 0 ? cellX : neighborX;
					let candidate = cellHeads.get( hashPosition( searchX, searchY, searchZ ) );

					while ( candidate !== undefined ) {

						const candidateOffset = candidate * 3;
						const dx = mergedPositions[ candidateOffset ] - x;
						const dy = mergedPositions[ candidateOffset + 1 ] - y;
						const dz = mergedPositions[ candidateOffset + 2 ] - z;
						const distanceSquared = dx * dx + dy * dy + dz * dz;

						if ( distanceSquared === 0 ) {

							mergedIndex = candidate;
							break searchCells;

						}

						if ( distanceSquared <= toleranceSquared && distanceSquared < closestDistanceSquared ) {

							mergedIndex = candidate;
							closestDistanceSquared = distanceSquared;

						}

						candidate = nextHashEntry[ candidate ];

					}

				}

			}

		}

		if ( mergedIndex === undefined ) {

			mergedIndex = mergedPositions.length / 3;
			const hash = hashPosition( cellX, cellY, cellZ );
			nextHashEntry[ mergedIndex ] = cellHeads.get( hash );
			cellHeads.set( hash, mergedIndex );
			mergedPositions.push( x, y, z );

		}

		vertexMap[ i ] = mergedIndex;

	}

	return { positions: mergedPositions, vertexMap };

}

function buildTriangleBuffers( elementCount, sourceIndices, vertexMap, positions ) {

	const triangleCount = elementCount / 3;
	const faces = new Uint32Array( triangleCount * 4 );
	const triangles = new Uint32Array( elementCount );

	for ( let i = 0; i < triangleCount; i ++ ) {

		const triangleOffset = i * 3;
		let a, b, c;

		if ( sourceIndices === null ) {

			a = vertexMap[ triangleOffset ];
			b = vertexMap[ triangleOffset + 1 ];
			c = vertexMap[ triangleOffset + 2 ];

		} else {

			a = vertexMap[ sourceIndices[ triangleOffset ] ];
			b = vertexMap[ sourceIndices[ triangleOffset + 1 ] ];
			c = vertexMap[ sourceIndices[ triangleOffset + 2 ] ];

		}

		if ( a === b || b === c || c === a ) {

			throw new Error( 'SculptorMesh: Welding produced a degenerate triangle.' );

		}

		const a3 = a * 3;
		const b3 = b * 3;
		const c3 = c * 3;
		const abx = positions[ b3 ] - positions[ a3 ];
		const aby = positions[ b3 + 1 ] - positions[ a3 + 1 ];
		const abz = positions[ b3 + 2 ] - positions[ a3 + 2 ];
		const acx = positions[ c3 ] - positions[ a3 ];
		const acy = positions[ c3 + 1 ] - positions[ a3 + 1 ];
		const acz = positions[ c3 + 2 ] - positions[ a3 + 2 ];
		const normalX = Math.fround( aby * acz - abz * acy );
		const normalY = Math.fround( abz * acx - abx * acz );
		const normalZ = Math.fround( abx * acy - aby * acx );

		if ( Number.isFinite( normalX ) === false || Number.isFinite( normalY ) === false || Number.isFinite( normalZ ) === false ) {

			throw new Error( 'SculptorMesh: Triangle normals must fit in Float32 storage.' );

		}

		if ( normalX === 0 && normalY === 0 && normalZ === 0 ) {

			throw new Error( 'SculptorMesh: The geometry contains a zero-area triangle at Float32 precision after welding.' );

		}

		const faceOffset = i * 4;
		faces[ faceOffset ] = a;
		faces[ faceOffset + 1 ] = b;
		faces[ faceOffset + 2 ] = c;
		faces[ faceOffset + 3 ] = TRI_INDEX;
		triangles[ triangleOffset ] = a;
		triangles[ triangleOffset + 1 ] = b;
		triangles[ triangleOffset + 2 ] = c;

	}

	return { faces, triangles };

}

// Octree

class OctreeCell {

	constructor( parent ) {

		this._parent = parent ?? null;
		this._depth = parent ? parent._depth + 1 : 0;
		this._children = [];
		this._aabbLoose = [ Infinity, Infinity, Infinity, - Infinity, - Infinity, - Infinity ];
		this._aabbSplit = [ Infinity, Infinity, Infinity, - Infinity, - Infinity, - Infinity ];
		this._iFaces = [];
		this._queuedForUpdate = false;

	}

	resetNbFaces( nbFaces ) {

		const f = this._iFaces;
		f.length = nbFaces;
		for ( let i = 0; i < nbFaces; ++ i ) f[ i ] = i;

	}

	build( mesh ) {

		const stack = OCTREE_STACK;
		stack[ 0 ] = this;
		let curStack = 1;
		const leaves = [];
		while ( curStack > 0 ) {

			const cell = stack[ -- curStack ];
			const nbFaces = cell._iFaces.length;
			if ( nbFaces > OCTREE_MAX_FACES && cell._depth < OCTREE_MAX_DEPTH ) {

				cell._constructChildren( mesh );
				const children = cell._children;
				for ( let i = 0; i < 8; ++ i ) stack[ curStack + i ] = children[ i ];
				curStack += 8;

			} else if ( nbFaces > 0 ) {

				leaves.push( cell );

			}

		}

		for ( let i = 0, l = leaves.length; i < l; ++ i ) leaves[ i ]._constructLeaf( mesh );
		stack.fill( null );

	}

	_constructLeaf( mesh ) {

		const iFaces = this._iFaces;
		const nbFaces = iFaces.length;
		let bxmin = Infinity, bymin = Infinity, bzmin = Infinity;
		let bxmax = - Infinity, bymax = - Infinity, bzmax = - Infinity;
		const faceBoxes = mesh._faceBoxes;
		const facePosInLeaf = mesh._facePosInLeaf;
		const faceLeaf = mesh._faceLeaf;
		for ( let i = 0; i < nbFaces; ++ i ) {

			const id = iFaces[ i ];
			faceLeaf[ id ] = this;
			facePosInLeaf[ id ] = i;
			const id6 = id * 6;
			if ( faceBoxes[ id6 ] < bxmin ) bxmin = faceBoxes[ id6 ];
			if ( faceBoxes[ id6 + 1 ] < bymin ) bymin = faceBoxes[ id6 + 1 ];
			if ( faceBoxes[ id6 + 2 ] < bzmin ) bzmin = faceBoxes[ id6 + 2 ];
			if ( faceBoxes[ id6 + 3 ] > bxmax ) bxmax = faceBoxes[ id6 + 3 ];
			if ( faceBoxes[ id6 + 4 ] > bymax ) bymax = faceBoxes[ id6 + 4 ];
			if ( faceBoxes[ id6 + 5 ] > bzmax ) bzmax = faceBoxes[ id6 + 5 ];

		}

		this._expandAabbLoose( bxmin, bymin, bzmin, bxmax, bymax, bzmax );

	}

	_constructChildren( mesh ) {

		const split = this._aabbSplit;
		const xmin = split[ 0 ], ymin = split[ 1 ], zmin = split[ 2 ];
		const xmax = split[ 3 ], ymax = split[ 4 ], zmax = split[ 5 ];
		const xcen = ( xmax + xmin ) * 0.5, ycen = ( ymax + ymin ) * 0.5, zcen = ( zmax + zmin ) * 0.5;

		const children = new Array( 8 );
		for ( let i = 0; i < 8; i ++ ) children[ i ] = new OctreeCell( this );

		const faceCenters = mesh._faceCenters;
		const iFaces = this._iFaces;
		for ( let i = 0, l = iFaces.length; i < l; ++ i ) {

			const iFace = iFaces[ i ];
			const id = iFace * 3;
			const cx = faceCenters[ id ], cy = faceCenters[ id + 1 ], cz = faceCenters[ id + 2 ];
			if ( cx > xcen ) {

				if ( cy > ycen ) children[ cz > zcen ? 6 : 5 ]._iFaces.push( iFace );
				else children[ cz > zcen ? 2 : 1 ]._iFaces.push( iFace );

			} else {

				if ( cy > ycen ) children[ cz > zcen ? 7 : 4 ]._iFaces.push( iFace );
				else children[ cz > zcen ? 3 : 0 ]._iFaces.push( iFace );

			}

		}

		children[ 0 ]._setAabbSplit( xmin, ymin, zmin, xcen, ycen, zcen );
		children[ 1 ]._setAabbSplit( xcen, ymin, zmin, xmax, ycen, zcen );
		children[ 2 ]._setAabbSplit( xcen, ymin, zcen, xmax, ycen, zmax );
		children[ 3 ]._setAabbSplit( xmin, ymin, zcen, xcen, ycen, zmax );
		children[ 4 ]._setAabbSplit( xmin, ycen, zmin, xcen, ymax, zcen );
		children[ 5 ]._setAabbSplit( xcen, ycen, zmin, xmax, ymax, zcen );
		children[ 6 ]._setAabbSplit( xcen, ycen, zcen, xmax, ymax, zmax );
		children[ 7 ]._setAabbSplit( xmin, ycen, zcen, xcen, ymax, zmax );

		this._children = children;
		this._iFaces.length = 0;

	}

	_setAabbSplit( xmin, ymin, zmin, xmax, ymax, zmax ) {

		const a = this._aabbSplit;
		a[ 0 ] = xmin; a[ 1 ] = ymin; a[ 2 ] = zmin;
		a[ 3 ] = xmax; a[ 4 ] = ymax; a[ 5 ] = zmax;

	}

	_setAabbLoose( xmin, ymin, zmin, xmax, ymax, zmax ) {

		const a = this._aabbLoose;
		a[ 0 ] = xmin; a[ 1 ] = ymin; a[ 2 ] = zmin;
		a[ 3 ] = xmax; a[ 4 ] = ymax; a[ 5 ] = zmax;

	}

	collectIntersectRay( vNear, eyeDir, collectFaces, leavesHit ) {

		const vx = vNear[ 0 ], vy = vNear[ 1 ], vz = vNear[ 2 ];
		const irx = 1.0 / eyeDir[ 0 ], iry = 1.0 / eyeDir[ 1 ], irz = 1.0 / eyeDir[ 2 ];
		let acc = 0;
		const stack = OCTREE_STACK;
		stack[ 0 ] = this;
		let curStack = 1;
		while ( curStack > 0 ) {

			const cell = stack[ -- curStack ];
			const loose = cell._aabbLoose;
			const t1 = ( loose[ 0 ] - vx ) * irx, t2 = ( loose[ 3 ] - vx ) * irx;
			const t3 = ( loose[ 1 ] - vy ) * iry, t4 = ( loose[ 4 ] - vy ) * iry;
			const t5 = ( loose[ 2 ] - vz ) * irz, t6 = ( loose[ 5 ] - vz ) * irz;
			const tmin = Math.max( Math.min( t1, t2 ), Math.min( t3, t4 ), Math.min( t5, t6 ) );
			const tmax = Math.min( Math.max( t1, t2 ), Math.max( t3, t4 ), Math.max( t5, t6 ) );
			if ( tmax < 0 || tmin > tmax ) continue;
			const children = cell._children;
			if ( children.length === 8 ) {

				for ( let i = 0; i < 8; ++ i ) stack[ curStack + i ] = children[ i ];
				curStack += 8;

			} else {

				queueLeaf( leavesHit, cell );
				const iFaces = cell._iFaces;
				collectFaces.set( iFaces, acc );
				acc += iFaces.length;

			}

		}

		stack.fill( null );
		return collectFaces.slice( 0, acc );

	}

	collectIntersectSphere( vert, radiusSquared, collectFaces, leavesHit ) {

		const vx = vert[ 0 ], vy = vert[ 1 ], vz = vert[ 2 ];
		let acc = 0;
		const stack = OCTREE_STACK;
		stack[ 0 ] = this;
		let curStack = 1;
		while ( curStack > 0 ) {

			const cell = stack[ -- curStack ];
			const loose = cell._aabbLoose;
			let dx = 0, dy = 0, dz = 0;
			if ( loose[ 0 ] > vx ) dx = loose[ 0 ] - vx;
			else if ( loose[ 3 ] < vx ) dx = loose[ 3 ] - vx;
			if ( loose[ 1 ] > vy ) dy = loose[ 1 ] - vy;
			else if ( loose[ 4 ] < vy ) dy = loose[ 4 ] - vy;
			if ( loose[ 2 ] > vz ) dz = loose[ 2 ] - vz;
			else if ( loose[ 5 ] < vz ) dz = loose[ 5 ] - vz;
			if ( dx * dx + dy * dy + dz * dz > radiusSquared ) continue;
			const children = cell._children;
			if ( children.length === 8 ) {

				for ( let i = 0; i < 8; ++ i ) stack[ curStack + i ] = children[ i ];
				curStack += 8;

			} else {

				queueLeaf( leavesHit, cell );
				const iFaces = cell._iFaces;
				collectFaces.set( iFaces, acc );
				acc += iFaces.length;

			}

		}

		stack.fill( null );
		return collectFaces.slice( 0, acc );

	}

	addFace( faceId, bxmin, bymin, bzmin, bxmax, bymax, bzmax, cx, cy, cz ) {

		const stack = OCTREE_STACK;
		stack[ 0 ] = this;
		let curStack = 1;
		while ( curStack > 0 ) {

			const cell = stack[ -- curStack ];
			const s = cell._aabbSplit;
			if ( cx <= s[ 0 ] || cy <= s[ 1 ] || cz <= s[ 2 ] || cx > s[ 3 ] || cy > s[ 4 ] || cz > s[ 5 ] ) continue;
			const loose = cell._aabbLoose;
			if ( bxmin < loose[ 0 ] ) loose[ 0 ] = bxmin;
			if ( bymin < loose[ 1 ] ) loose[ 1 ] = bymin;
			if ( bzmin < loose[ 2 ] ) loose[ 2 ] = bzmin;
			if ( bxmax > loose[ 3 ] ) loose[ 3 ] = bxmax;
			if ( bymax > loose[ 4 ] ) loose[ 4 ] = bymax;
			if ( bzmax > loose[ 5 ] ) loose[ 5 ] = bzmax;
			const children = cell._children;
			if ( children.length === 8 ) {

				for ( let i = 0; i < 8; ++ i ) stack[ curStack + i ] = children[ i ];
				curStack += 8;

			} else {

				cell._iFaces.push( faceId );
				stack.fill( null );
				return cell;

			}

		}

		stack.fill( null );

	}

	_expandAabbLoose( bxmin, bymin, bzmin, bxmax, bymax, bzmax ) {

		let parent = this;
		while ( parent ) {

			const p = parent._aabbLoose;
			let proceed = false;
			if ( bxmin < p[ 0 ] ) {

				p[ 0 ] = bxmin; proceed = true;

			}

			if ( bymin < p[ 1 ] ) {

				p[ 1 ] = bymin; proceed = true;

			}

			if ( bzmin < p[ 2 ] ) {

				p[ 2 ] = bzmin; proceed = true;

			}

			if ( bxmax > p[ 3 ] ) {

				p[ 3 ] = bxmax; proceed = true;

			}

			if ( bymax > p[ 4 ] ) {

				p[ 4 ] = bymax; proceed = true;

			}

			if ( bzmax > p[ 5 ] ) {

				p[ 5 ] = bzmax; proceed = true;

			}

			parent = proceed ? parent._parent : null;

		}

	}

	pruneIfPossible() {

		let cell = this;
		while ( cell._parent ) {

			const parent = cell._parent;
			const children = parent._children;
			if ( children.length === 0 ) return;
			for ( let i = 0; i < 8; ++ i ) {

				if ( children[ i ]._iFaces.length > 0 || children[ i ]._children.length === 8 ) return;

			}

			children.length = 0;
			cell = parent;

		}

	}

}

// Mesh topology and spatial queries

class SculptorMesh {

	constructor() {

		this._nbVertices = 0;
		this._nbFaces = 0;

		this._verticesXYZ = null;
		this._normalsXYZ = null;
		this._renderNormalsXYZ = null;

		this._facesABCD = null;
		this._trianglesABC = null;

		this._vertRingVert = [];
		this._vertRingFace = [];
		this._vertOnEdge = null;

		this._faceNormals = null;
		this._faceBoxes = null;
		this._faceCenters = null;
		this._facePosInLeaf = null;
		this._faceLeaf = [];

		this._vertTagFlags = null;
		this._vertSculptFlags = null;
		this._facesTagFlags = null;

		this._octree = null;
		this._leavesToUpdate = [];
		this._topologyVersion = 0;
		this._tagFlag = 1;
		this._sculptFlag = 1;

	}

	getNbVertices() {

		return this._nbVertices;

	}
	getNbFaces() {

		return this._nbFaces;

	}
	getNbTriangles() {

		return this._nbFaces;

	}
	getVertices() {

		return this._verticesXYZ;

	}
	getNormals() {

		return this._normalsXYZ;

	}
	getRenderNormals() {

		return this._renderNormalsXYZ;

	}
	getFaces() {

		return this._facesABCD;

	}
	getTriangles() {

		return this._trianglesABC;

	}
	getVerticesRingVert() {

		return this._vertRingVert;

	}
	getVerticesRingFace() {

		return this._vertRingFace;

	}
	getVerticesOnEdge() {

		return this._vertOnEdge;

	}
	getVerticesTagFlags() {

		return this._vertTagFlags;

	}
	getVerticesSculptFlags() {

		return this._vertSculptFlags;

	}
	getFaceNormals() {

		return this._faceNormals;

	}
	getFaceBoxes() {

		return this._faceBoxes;

	}
	getFaceCenters() {

		return this._faceCenters;

	}
	getFacePosInLeaf() {

		return this._facePosInLeaf;

	}
	getFaceLeaf() {

		return this._faceLeaf;

	}
	getFacesTagFlags() {

		return this._facesTagFlags;

	}
	getTopologyVersion() {

		return this._topologyVersion;

	}
	getSculptFlag() {

		return this._sculptFlag;

	}
	nextTagFlag() {

		if ( this._tagFlag >= MAX_FLAG ) {

			// Preserve pending deletion sentinels across tag rollover.
			resetTagFlags( this._vertTagFlags, this._nbVertices );
			resetTagFlags( this._facesTagFlags, this._nbFaces );
			this._tagFlag = 1;

		} else {

			this._tagFlag ++;

		}

		return this._tagFlag;

	}
	nextSculptFlag() {

		if ( this._sculptFlag >= MAX_FLAG ) {

			this._vertSculptFlags.fill( 0 );
			this._sculptFlag = 1;

		} else {

			this._sculptFlag ++;

		}

		return this._sculptFlag;

	}

	addNbVertice( nb ) {

		this._nbVertices += nb;

	}
	addNbFace( nb ) {

		this._nbFaces += nb;
		this._topologyVersion ++;

	}
	markTopologyChanged() {

		this._topologyVersion ++;

	}

	initFromGeometry( geometry ) {

		this._tagFlag = 1;
		this._sculptFlag = 1;

		const posAttr = geometry.getAttribute( 'position' );

		if ( posAttr === undefined || posAttr.itemSize !== 3 || posAttr.count === 0 ) {

			throw new Error( 'SculptorMesh: A non-empty position attribute with itemSize 3 is required.' );

		}

		if ( typeof posAttr.getX !== 'function' || typeof posAttr.getY !== 'function' || typeof posAttr.getZ !== 'function' ) {

			throw new Error( 'SculptorMesh: The position attribute must be CPU-accessible.' );

		}

		const index = geometry.getIndex();
		const sourceVertexCount = posAttr.count;
		const { elementCount, sourceIndices, referencedVertices } = readSourceElements( index, sourceVertexCount );
		const { positions: sourcePositions, bounds } = readSourcePositions( posAttr, referencedVertices );
		const { positions: weldedPositions, vertexMap } = weldPositions( sourcePositions, referencedVertices, bounds );
		const { faces, triangles } = buildTriangleBuffers( elementCount, sourceIndices, vertexMap, weldedPositions );
		const vertexCount = weldedPositions.length / 3;
		const triangleCount = elementCount / 3;
		const vertexDataLength = vertexCount * 3;

		this._nbVertices = vertexCount;
		this._nbFaces = triangleCount;
		this._topologyVersion = 0;
		this._leavesToUpdate.length = 0;

		this._verticesXYZ = new Float32Array( weldedPositions );
		this._normalsXYZ = new Float32Array( vertexDataLength );
		this._renderNormalsXYZ = new Float32Array( vertexDataLength );

		this._facesABCD = faces;
		this._trianglesABC = triangles;
		this._vertOnEdge = new Uint8Array( vertexCount );
		this._vertTagFlags = new Int32Array( vertexCount );
		this._vertSculptFlags = new Int32Array( vertexCount );
		this._facesTagFlags = new Int32Array( triangleCount );
		this._faceBoxes = new Float32Array( triangleCount * 6 );
		this._faceNormals = new Float32Array( triangleCount * 3 );
		this._faceCenters = new Float32Array( triangleCount * 3 );
		this._facePosInLeaf = new Uint32Array( triangleCount );
		this._faceLeaf = new Array( triangleCount ).fill( null );

		this._initTopology();
		this._updateGeometry();

	}

	_initTopology() {

		const vrings = this._vertRingVert;
		const frings = this._vertRingFace;
		const nbVertices = this._nbVertices;
		vrings.length = frings.length = nbVertices;
		for ( let i = 0; i < nbVertices; ++ i ) {

			vrings[ i ] = [];
			frings[ i ] = [];

		}

		const nbTriangles = this._nbFaces;
		const tAr = this._trianglesABC;
		for ( let i = 0; i < nbTriangles; ++ i ) {

			const j = i * 3;
			frings[ tAr[ j ] ].push( i );
			frings[ tAr[ j + 1 ] ].push( i );
			frings[ tAr[ j + 2 ] ].push( i );

		}

		const vOnEdge = this._vertOnEdge;
		for ( let i = 0; i < nbVertices; ++ i ) {

			this._computeRingVertices( i );
			vOnEdge[ i ] = frings[ i ].length !== vrings[ i ].length ? 1 : 0;

		}

	}

	_computeRingVertices( iVert ) {

		const tagFlag = this.nextTagFlag();
		const fAr = this._facesABCD;
		const vflags = this._vertTagFlags;
		const vring = this._vertRingVert[ iVert ];
		const fring = this._vertRingFace[ iVert ];
		vring.length = 0;
		for ( let i = 0, l = fring.length; i < l; ++ i ) {

			const ind = fring[ i ] * 4;
			let iVer1 = fAr[ ind ];
			let iVer2 = fAr[ ind + 1 ];
			if ( iVer1 === iVert ) iVer1 = fAr[ ind + 2 ];
			else if ( iVer2 === iVert ) iVer2 = fAr[ ind + 2 ];
			if ( vflags[ iVer1 ] !== tagFlag ) {

				vflags[ iVer1 ] = tagFlag; vring.push( iVer1 );

			}

			if ( vflags[ iVer2 ] !== tagFlag ) {

				vflags[ iVer2 ] = tagFlag; vring.push( iVer2 );

			}

		}

	}

	_updateGeometry( iFaces, iVerts ) {

		if ( iVerts === undefined && iFaces !== undefined ) iVerts = this.getVerticesFromFaces( iFaces );

		this._updateFacesAabbAndNormal( iFaces );
		this._updateVerticesNormal( iVerts );
		this._updateOctree( iFaces );

	}

	_updateFacesAabbAndNormal( iFaces ) {

		const faceNormals = this._faceNormals;
		const faceBoxes = this._faceBoxes;
		const faceCenters = this._faceCenters;
		const vAr = this._verticesXYZ;
		const fAr = this._facesABCD;
		const full = iFaces === undefined;
		const nbFaces = full ? this._nbFaces : iFaces.length;

		for ( let i = 0; i < nbFaces; ++ i ) {

			const ind = full ? i : iFaces[ i ];
			const idTri = ind * 3;
			const idFace = ind * 4;
			const idBox = ind * 6;
			const ind1 = fAr[ idFace ] * 3;
			const ind2 = fAr[ idFace + 1 ] * 3;
			const ind3 = fAr[ idFace + 2 ] * 3;

			const v1x = vAr[ ind1 ], v1y = vAr[ ind1 + 1 ], v1z = vAr[ ind1 + 2 ];
			const v2x = vAr[ ind2 ], v2y = vAr[ ind2 + 1 ], v2z = vAr[ ind2 + 2 ];
			const v3x = vAr[ ind3 ], v3y = vAr[ ind3 + 1 ], v3z = vAr[ ind3 + 2 ];

			const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z;
			const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z;
			faceNormals[ idTri ] = ay * bz - az * by;
			faceNormals[ idTri + 1 ] = az * bx - ax * bz;
			faceNormals[ idTri + 2 ] = ax * by - ay * bx;

			const xmin = v1x < v2x ? ( v1x < v3x ? v1x : v3x ) : ( v2x < v3x ? v2x : v3x );
			const xmax = v1x > v2x ? ( v1x > v3x ? v1x : v3x ) : ( v2x > v3x ? v2x : v3x );
			const ymin = v1y < v2y ? ( v1y < v3y ? v1y : v3y ) : ( v2y < v3y ? v2y : v3y );
			const ymax = v1y > v2y ? ( v1y > v3y ? v1y : v3y ) : ( v2y > v3y ? v2y : v3y );
			const zmin = v1z < v2z ? ( v1z < v3z ? v1z : v3z ) : ( v2z < v3z ? v2z : v3z );
			const zmax = v1z > v2z ? ( v1z > v3z ? v1z : v3z ) : ( v2z > v3z ? v2z : v3z );

			faceBoxes[ idBox ] = xmin; faceBoxes[ idBox + 1 ] = ymin; faceBoxes[ idBox + 2 ] = zmin;
			faceBoxes[ idBox + 3 ] = xmax; faceBoxes[ idBox + 4 ] = ymax; faceBoxes[ idBox + 5 ] = zmax;
			faceCenters[ idTri ] = ( xmin + xmax ) * 0.5;
			faceCenters[ idTri + 1 ] = ( ymin + ymax ) * 0.5;
			faceCenters[ idTri + 2 ] = ( zmin + zmax ) * 0.5;

		}

	}

	_updateVerticesNormal( iVerts ) {

		const nAr = this._normalsXYZ;
		const renderNAr = this._renderNormalsXYZ;
		const faceNormals = this._faceNormals;
		const ringFaces = this._vertRingFace;
		const full = iVerts === undefined;
		const nbVerts = full ? this._nbVertices : iVerts.length;

		for ( let i = 0; i < nbVerts; ++ i ) {

			const ind = full ? i : iVerts[ i ];
			const vrf = ringFaces[ ind ];
			let nx = 0, ny = 0, nz = 0;
			for ( let j = 0, l = vrf.length; j < l; ++ j ) {

				const id = vrf[ j ] * 3;
				nx += faceNormals[ id ];
				ny += faceNormals[ id + 1 ];
				nz += faceNormals[ id + 2 ];

			}

			const inverseCount = vrf.length > 0 ? 1.0 / vrf.length : 0;
			const ind3 = ind * 3;
			nx *= inverseCount;
			ny *= inverseCount;
			nz *= inverseCount;
			nAr[ ind3 ] = nx;
			nAr[ ind3 + 1 ] = ny;
			nAr[ ind3 + 2 ] = nz;

			const length = Math.sqrt( nx * nx + ny * ny + nz * nz );
			const invLength = length > 0 ? 1.0 / length : 0;
			renderNAr[ ind3 ] = nx * invLength;
			renderNAr[ ind3 + 1 ] = ny * invLength;
			renderNAr[ ind3 + 2 ] = nz * invLength;

		}

	}

	_updateOctree( iFaces ) {

		if ( iFaces === undefined ) {

			this._computeOctree();

		} else {

			this._updateOctreeAdd( this._updateOctreeRemove( iFaces ) );

		}

	}

	_computeOctree() {

		const vAr = this._verticesXYZ;
		let xmin = Infinity, ymin = Infinity, zmin = Infinity;
		let xmax = - Infinity, ymax = - Infinity, zmax = - Infinity;

		for ( let i = 0, l = this._nbVertices * 3; i < l; i += 3 ) {

			if ( vAr[ i ] < xmin ) xmin = vAr[ i ];
			if ( vAr[ i ] > xmax ) xmax = vAr[ i ];
			if ( vAr[ i + 1 ] < ymin ) ymin = vAr[ i + 1 ];
			if ( vAr[ i + 1 ] > ymax ) ymax = vAr[ i + 1 ];
			if ( vAr[ i + 2 ] < zmin ) zmin = vAr[ i + 2 ];
			if ( vAr[ i + 2 ] > zmax ) zmax = vAr[ i + 2 ];

		}

		const dx = xmax - xmin;
		const dy = ymax - ymin;
		const dz = zmax - zmin;
		const thickness = Math.hypot( dx, dy, dz ) * 0.2;

		if ( dx === 0 ) {

			xmin -= thickness;
			xmax += thickness;

		}

		if ( dy === 0 ) {

			ymin -= thickness;
			ymax += thickness;

		}

		if ( dz === 0 ) {

			zmin -= thickness;
			zmax += thickness;

		}

		const octree = new OctreeCell();
		octree.resetNbFaces( this._nbFaces );
		octree._setAabbLoose( xmin, ymin, zmin, xmax, ymax, zmax );
		octree._setAabbSplit(
			xmin - dx * 0.3, ymin - dy * 0.3, zmin - dz * 0.3,
			xmax + dx * 0.3, ymax + dy * 0.3, zmax + dz * 0.3
		);
		octree.build( this );

		this._octree = octree;
		for ( let i = 0, l = this._leavesToUpdate.length; i < l; i ++ ) this._leavesToUpdate[ i ]._queuedForUpdate = false;
		this._leavesToUpdate.length = 0;

	}

	_updateOctreeRemove( iFaces ) {

		const faceBoxes = this._faceBoxes;
		const faceCenters = this._faceCenters;
		const faceLeaf = this._faceLeaf;
		const facePosInLeaf = this._facePosInLeaf;
		const facesToMove = new Uint32Array( getMemory( iFaces.length * 4 ), 0, iFaces.length );
		let count = 0;

		for ( let i = 0, l = iFaces.length; i < l; ++ i ) {

			const iFace = iFaces[ i ];
			const leaf = faceLeaf[ iFace ];
			const idCenter = iFace * 3;

			if ( leaf === undefined || leaf === null ) {

				facesToMove[ count ++ ] = iFace;
				continue;

			}

			const split = leaf._aabbSplit;
			const x = faceCenters[ idCenter ];
			const y = faceCenters[ idCenter + 1 ];
			const z = faceCenters[ idCenter + 2 ];

			if ( x <= split[ 0 ] || y <= split[ 1 ] || z <= split[ 2 ] || x > split[ 3 ] || y > split[ 4 ] || z > split[ 5 ] ) {

				facesToMove[ count ++ ] = iFace;
				const facesInLeaf = leaf._iFaces;
				const position = facePosInLeaf[ iFace ];
				const lastFace = facesInLeaf[ facesInLeaf.length - 1 ];

				facesInLeaf[ position ] = lastFace;
				facePosInLeaf[ lastFace ] = position;
				facesInLeaf.pop();
				queueLeaf( this._leavesToUpdate, leaf );

			} else {

				const idBox = iFace * 6;
				leaf._expandAabbLoose(
					faceBoxes[ idBox ], faceBoxes[ idBox + 1 ], faceBoxes[ idBox + 2 ],
					faceBoxes[ idBox + 3 ], faceBoxes[ idBox + 4 ], faceBoxes[ idBox + 5 ]
				);

			}

		}

		return facesToMove.subarray( 0, count );

	}

	_updateOctreeAdd( iFaces ) {

		const faceBoxes = this._faceBoxes;
		const faceCenters = this._faceCenters;
		const faceLeaf = this._faceLeaf;
		const facePosInLeaf = this._facePosInLeaf;

		for ( let i = 0, l = iFaces.length; i < l; ++ i ) {

			const iFace = iFaces[ i ];
			const idBox = iFace * 6;
			const idCenter = iFace * 3;
			const newLeaf = this._octree.addFace(
				iFace,
				faceBoxes[ idBox ], faceBoxes[ idBox + 1 ], faceBoxes[ idBox + 2 ],
				faceBoxes[ idBox + 3 ], faceBoxes[ idBox + 4 ], faceBoxes[ idBox + 5 ],
				faceCenters[ idCenter ], faceCenters[ idCenter + 1 ], faceCenters[ idCenter + 2 ]
			);

			if ( newLeaf === undefined ) {

				this._computeOctree();
				return;

			}

			faceLeaf[ iFace ] = newLeaf;
			facePosInLeaf[ iFace ] = newLeaf._iFaces.length - 1;
			queueLeaf( this._leavesToUpdate, newLeaf );

		}

	}

	// Mesh queries

	intersectRay( vNear, eyeDir ) {

		const nbFaces = this._nbFaces;
		const collectBuffer = new Uint32Array( getMemory( nbFaces * 4 ), 0, nbFaces );
		return this._octree.collectIntersectRay( vNear, eyeDir, collectBuffer );

	}

	intersectSphere( center, radiusSq, collectLeaves = false ) {

		const nbFaces = this._nbFaces;
		const collectBuffer = new Uint32Array( getMemory( nbFaces * 4 ), 0, nbFaces );
		return this._octree.collectIntersectSphere( center, radiusSq, collectBuffer, collectLeaves ? this._leavesToUpdate : undefined );

	}

	getVerticesFromFaces( iFaces ) {

		const tagFlag = this.nextTagFlag();
		const nbFaces = iFaces.length;
		const vtf = this._vertTagFlags;
		const fAr = this._facesABCD;
		let acc = 0;
		const verts = new Uint32Array( getMemory( 3 * nbFaces * 4 ), 0, nbFaces * 3 );
		for ( let i = 0; i < nbFaces; ++ i ) {

			const ind = iFaces[ i ] * 4;
			const iv1 = fAr[ ind ], iv2 = fAr[ ind + 1 ], iv3 = fAr[ ind + 2 ];
			if ( vtf[ iv1 ] !== tagFlag ) {

				vtf[ iv1 ] = tagFlag; verts[ acc ++ ] = iv1;

			}

			if ( vtf[ iv2 ] !== tagFlag ) {

				vtf[ iv2 ] = tagFlag; verts[ acc ++ ] = iv2;

			}

			if ( vtf[ iv3 ] !== tagFlag ) {

				vtf[ iv3 ] = tagFlag; verts[ acc ++ ] = iv3;

			}

		}

		return verts.slice( 0, acc );

	}

	getFacesFromVertices( iVerts ) {

		const tagFlag = this.nextTagFlag();
		const ftf = this._facesTagFlags;
		const frings = this._vertRingFace;
		const nbVerts = iVerts.length;
		const faces = new Uint32Array( getMemory( 4 * this._nbFaces ), 0, this._nbFaces );
		let acc = 0;
		for ( let i = 0; i < nbVerts; ++ i ) {

			const fring = frings[ iVerts[ i ] ];
			for ( let j = 0, l = fring.length; j < l; ++ j ) {

				const iFace = fring[ j ];
				if ( ftf[ iFace ] !== tagFlag ) {

					ftf[ iFace ] = tagFlag;
					faces[ acc ++ ] = iFace;

				}

			}

		}

		return faces.slice( 0, acc );

	}

	expandsFaces( iFaces, nRing ) {

		const tagFlag = this.nextTagFlag();
		let nbFaces = iFaces.length;
		const ftf = this._facesTagFlags;
		const fAr = this._facesABCD;
		const ringFaces = this._vertRingFace;
		let acc = nbFaces;
		const iFacesExpanded = new Uint32Array( getMemory( 4 * this._nbFaces ), 0, this._nbFaces );
		iFacesExpanded.set( iFaces );
		for ( let i = 0; i < nbFaces; ++ i ) ftf[ iFacesExpanded[ i ] ] = tagFlag;
		let iBegin = 0;
		while ( nRing ) {

			-- nRing;
			for ( let i = iBegin; i < nbFaces; ++ i ) {

				const ind = iFacesExpanded[ i ] * 4;
				for ( let j = 0; j < 3; ++ j ) {

					const idv = fAr[ ind + j ];
					const vrf = ringFaces[ idv ];
					for ( let k = 0, l = vrf.length; k < l; ++ k ) {

						const id = vrf[ k ];
						if ( ftf[ id ] === tagFlag ) continue;
						ftf[ id ] = tagFlag;
						iFacesExpanded[ acc ++ ] = id;

					}

				}

			}

			iBegin = nbFaces;
			nbFaces = acc;

		}

		return iFacesExpanded.slice( 0, acc );

	}

	expandsVertices( iVerts, nRing ) {

		const tagFlag = this.nextTagFlag();
		let nbVerts = iVerts.length;
		const vrings = this._vertRingVert;
		const vtf = this._vertTagFlags;
		let acc = nbVerts;
		const nbVertices = this._nbVertices;
		const iVertsExpanded = new Uint32Array( getMemory( 4 * nbVertices ), 0, nbVertices );
		iVertsExpanded.set( iVerts );
		for ( let i = 0; i < nbVerts; ++ i ) vtf[ iVertsExpanded[ i ] ] = tagFlag;
		let iBegin = 0;
		while ( nRing ) {

			-- nRing;
			for ( let i = iBegin; i < nbVerts; ++ i ) {

				const ring = vrings[ iVertsExpanded[ i ] ];
				for ( let j = 0, l = ring.length; j < l; ++ j ) {

					const id = ring[ j ];
					if ( vtf[ id ] === tagFlag ) continue;
					vtf[ id ] = tagFlag;
					iVertsExpanded[ acc ++ ] = id;

				}

			}

			iBegin = nbVerts;
			nbVerts = acc;

		}

		return iVertsExpanded.slice( 0, acc );

	}

	// Dynamic topology

	updateRenderTriangles( iFaces ) {

		const tAr = this._trianglesABC;
		const fAr = this._facesABCD;
		const full = iFaces === undefined;
		const nbFaces = full ? this._nbFaces : iFaces.length;
		for ( let i = 0; i < nbFaces; ++ i ) {

			const id = full ? i : iFaces[ i ];
			const idt = id * 3;
			const idf = id * 4;
			tAr[ idt ] = fAr[ idf ];
			tAr[ idt + 1 ] = fAr[ idf + 1 ];
			tAr[ idt + 2 ] = fAr[ idf + 2 ];

		}

	}

	updateVerticesOnEdge( iVerts ) {

		const vOnEdge = this._vertOnEdge;
		const vrings = this._vertRingVert;
		const frings = this._vertRingFace;
		const full = iVerts === undefined;
		const nbVerts = full ? this._nbVertices : iVerts.length;
		for ( let i = 0; i < nbVerts; ++ i ) {

			const id = full ? i : iVerts[ i ];
			vOnEdge[ id ] = vrings[ id ].length !== frings[ id ].length ? 1 : 0;

		}

	}

	updateTopology( iFaces, iVerts ) {

		this.updateRenderTriangles( iFaces );
		this.updateVerticesOnEdge( iVerts );

	}

	_resizeArray( array, requiredLength ) {

		if ( array === null ) return null;

		const resized = new array.constructor( requiredLength * 2 );
		resized.set( array.subarray( 0, Math.min( array.length, resized.length ) ) );
		return resized;

	}

	reAllocateArrays( nbAddElements ) {

		let capacity = this._facesABCD.length / 4;
		let requiredCount = this._nbFaces + nbAddElements;

		if ( capacity < requiredCount || capacity > requiredCount * 4 ) {

			this._facesABCD = this._resizeArray( this._facesABCD, requiredCount * 4 );
			this._trianglesABC = this._resizeArray( this._trianglesABC, requiredCount * 3 );
			this._faceBoxes = this._resizeArray( this._faceBoxes, requiredCount * 6 );
			this._faceNormals = this._resizeArray( this._faceNormals, requiredCount * 3 );
			this._faceCenters = this._resizeArray( this._faceCenters, requiredCount * 3 );
			this._facesTagFlags = this._resizeArray( this._facesTagFlags, requiredCount );
			this._facePosInLeaf = this._resizeArray( this._facePosInLeaf, requiredCount );

		}

		capacity = this._verticesXYZ.length / 3;
		requiredCount = this._nbVertices + nbAddElements;

		if ( capacity < requiredCount || capacity > requiredCount * 4 ) {

			this._verticesXYZ = this._resizeArray( this._verticesXYZ, requiredCount * 3 );
			this._normalsXYZ = this._resizeArray( this._normalsXYZ, requiredCount * 3 );
			this._renderNormalsXYZ = this._resizeArray( this._renderNormalsXYZ, requiredCount * 3 );
			this._vertOnEdge = this._resizeArray( this._vertOnEdge, requiredCount );
			this._vertTagFlags = this._resizeArray( this._vertTagFlags, requiredCount );
			this._vertSculptFlags = this._resizeArray( this._vertSculptFlags, requiredCount );

		}

	}

	balanceOctree() {

		const leaves = this._leavesToUpdate;

		for ( let i = 0, l = leaves.length; i < l; ++ i ) {

			const leaf = leaves[ i ];
			leaf._queuedForUpdate = false;

			if ( leaf._iFaces.length === 0 ) {

				leaf.pruneIfPossible();

			} else if ( leaf._iFaces.length > OCTREE_MAX_FACES && leaf._depth < OCTREE_MAX_DEPTH ) {

				leaf.build( this );

			}

		}

		leaves.length = 0;

	}

}

export { SculptorMesh };
