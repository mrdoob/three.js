import {
	TRI_INDEX,
	Flags,
	getMemory
} from './SculptUtils.js';

// ---- OctreeCell ----

const OCTREE_MAX_DEPTH = 8;
const OCTREE_MAX_FACES = 100;
const OCTREE_STACK = new Array( 1 + 7 * OCTREE_MAX_DEPTH ).fill( null );

class OctreeCell {

	constructor( parent ) {

		this._parent = parent || null;
		this._depth = parent ? parent._depth + 1 : 0;
		this._children = [];
		this._aabbLoose = [ Infinity, Infinity, Infinity, - Infinity, - Infinity, - Infinity ];
		this._aabbSplit = [ Infinity, Infinity, Infinity, - Infinity, - Infinity, - Infinity ];
		this._iFaces = [];

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

		this._expandsAabbLoose( bxmin, bymin, bzmin, bxmax, bymax, bzmax );

	}

	_constructChildren( mesh ) {

		const split = this._aabbSplit;
		const xmin = split[ 0 ], ymin = split[ 1 ], zmin = split[ 2 ];
		const xmax = split[ 3 ], ymax = split[ 4 ], zmax = split[ 5 ];
		const dX = ( xmax - xmin ) * 0.5, dY = ( ymax - ymin ) * 0.5, dZ = ( zmax - zmin ) * 0.5;
		const xcen = ( xmax + xmin ) * 0.5, ycen = ( ymax + ymin ) * 0.5, zcen = ( zmax + zmin ) * 0.5;

		const children = [];
		for ( let i = 0; i < 8; ++ i ) children.push( new OctreeCell( this ) );

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
		children[ 1 ]._setAabbSplit( xmin + dX, ymin, zmin, xcen + dX, ycen, zcen );
		children[ 2 ]._setAabbSplit( xcen, ycen - dY, zcen, xmax, ymax - dY, zmax );
		children[ 3 ]._setAabbSplit( xmin, ymin, zmin + dZ, xcen, ycen, zcen + dZ );
		children[ 4 ]._setAabbSplit( xmin, ymin + dY, zmin, xcen, ycen + dY, zcen );
		children[ 5 ]._setAabbSplit( xcen, ycen, zcen - dZ, xmax, ymax, zmax - dZ );
		children[ 6 ]._setAabbSplit( xcen, ycen, zcen, xmax, ymax, zmax );
		children[ 7 ]._setAabbSplit( xcen - dX, ycen, zcen, xmax - dX, ymax, zmax );

		this._children = children;
		this._iFaces.length = 0;

	}

	_setAabbSplit( xmin, ymin, zmin, xmax, ymax, zmax ) {

		const a = this._aabbSplit;
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

				if ( leavesHit ) leavesHit.push( cell );
				const iFaces = cell._iFaces;
				collectFaces.set( iFaces, acc );
				acc += iFaces.length;

			}

		}

		return new Uint32Array( collectFaces.subarray( 0, acc ) );

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

				if ( leavesHit ) leavesHit.push( cell );
				const iFaces = cell._iFaces;
				collectFaces.set( iFaces, acc );
				acc += iFaces.length;

			}

		}

		return new Uint32Array( collectFaces.subarray( 0, acc ) );

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
				return cell;

			}

		}

	}

	_expandsAabbLoose( bxmin, bymin, bzmin, bxmax, bymax, bzmax ) {

		let parent = this;
		while ( parent ) {

			const p = parent._aabbLoose;
			let proceed = false;
			if ( bxmin < p[ 0 ] ) { p[ 0 ] = bxmin; proceed = true; }
			if ( bymin < p[ 1 ] ) { p[ 1 ] = bymin; proceed = true; }
			if ( bzmin < p[ 2 ] ) { p[ 2 ] = bzmin; proceed = true; }
			if ( bxmax > p[ 3 ] ) { p[ 3 ] = bxmax; proceed = true; }
			if ( bymax > p[ 4 ] ) { p[ 4 ] = bymax; proceed = true; }
			if ( bzmax > p[ 5 ] ) { p[ 5 ] = bzmax; proceed = true; }
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

// ---- Internal Mesh Data ----
// This class wraps all the internal sculpting data structures.
// It mirrors SculptGL's MeshData + MeshDynamic in a single object.

class SculptMesh {

	constructor() {

		this._nbVertices = 0;
		this._nbFaces = 0;

		this._verticesXYZ = null;
		this._normalsXYZ = null;
		this._colorsRGB = null;
		this._materialsPBR = null;

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
		this._vertStateFlags = null;
		this._facesTagFlags = null;
		this._facesStateFlags = null;

		this._octree = null;

		this.isDynamic = true;

	}

	// ---- Accessors matching SculptGL's Mesh interface ----

	getNbVertices() { return this._nbVertices; }
	getNbFaces() { return this._nbFaces; }
	getNbTriangles() { return this._nbFaces; }
	getVertices() { return this._verticesXYZ; }
	getNormals() { return this._normalsXYZ; }
	getColors() { return this._colorsRGB; }
	getMaterials() { return this._materialsPBR; }
	getFaces() { return this._facesABCD; }
	getTriangles() { return this._trianglesABC; }
	getVerticesRingVert() { return this._vertRingVert; }
	getVerticesRingFace() { return this._vertRingFace; }
	getVerticesOnEdge() { return this._vertOnEdge; }
	getVerticesTagFlags() { return this._vertTagFlags; }
	getVerticesSculptFlags() { return this._vertSculptFlags; }
	getVerticesStateFlags() { return this._vertStateFlags; }
	getVerticesProxy() { return this._verticesXYZ; }
	getFaceNormals() { return this._faceNormals; }
	getFaceBoxes() { return this._faceBoxes; }
	getFaceCenters() { return this._faceCenters; }
	getFacePosInLeaf() { return this._facePosInLeaf; }
	getFaceLeaf() { return this._faceLeaf; }
	getFacesTagFlags() { return this._facesTagFlags; }
	getFacesStateFlags() { return this._facesStateFlags; }

	addNbVertice( nb ) { this._nbVertices += nb; }
	addNbFace( nb ) { this._nbFaces += nb; }

	// ---- Init from Three.js BufferGeometry ----

	initFromGeometry( geometry ) {

		const posAttr = geometry.getAttribute( 'position' );
		const index = geometry.getIndex();
		const srcPositions = posAttr.array;
		const srcCount = posAttr.count;

		// Merge duplicate vertices by position
		// Build a map from original vertex index to merged vertex index
		const precision = 1e-6;
		const vertexMap = new Uint32Array( srcCount ); // old index -> merged index
		const mergedPositions = [];
		const hashMap = new Map();

		for ( let i = 0; i < srcCount; ++ i ) {

			const x = srcPositions[ i * 3 ];
			const y = srcPositions[ i * 3 + 1 ];
			const z = srcPositions[ i * 3 + 2 ];

			// Quantize to grid for hashing
			const kx = Math.round( x / precision );
			const ky = Math.round( y / precision );
			const kz = Math.round( z / precision );
			const key = kx + ',' + ky + ',' + kz;

			if ( hashMap.has( key ) ) {

				vertexMap[ i ] = hashMap.get( key );

			} else {

				const newIdx = mergedPositions.length / 3;
				hashMap.set( key, newIdx );
				vertexMap[ i ] = newIdx;
				mergedPositions.push( x, y, z );

			}

		}

		const nbVertices = mergedPositions.length / 3;
		this._nbVertices = nbVertices;

		this._verticesXYZ = new Float32Array( mergedPositions );
		this._normalsXYZ = new Float32Array( nbVertices * 3 );
		this._colorsRGB = new Float32Array( nbVertices * 3 );
		this._materialsPBR = new Float32Array( nbVertices * 3 );

		for ( let i = 0; i < nbVertices; ++ i ) {

			this._colorsRGB[ i * 3 ] = 1.0;
			this._colorsRGB[ i * 3 + 1 ] = 1.0;
			this._colorsRGB[ i * 3 + 2 ] = 1.0;
			this._materialsPBR[ i * 3 ] = 0.18;
			this._materialsPBR[ i * 3 + 1 ] = 0.08;
			this._materialsPBR[ i * 3 + 2 ] = 1.0;

		}

		// Build faces using merged vertex indices
		let nbTriangles;
		if ( index ) {

			nbTriangles = index.count / 3;

		} else {

			nbTriangles = srcCount / 3;

		}

		this._nbFaces = nbTriangles;
		this._facesABCD = new Uint32Array( nbTriangles * 4 );
		this._trianglesABC = new Uint32Array( nbTriangles * 3 );

		for ( let i = 0; i < nbTriangles; ++ i ) {

			let a, b, c;
			if ( index ) {

				a = vertexMap[ index.array[ i * 3 ] ];
				b = vertexMap[ index.array[ i * 3 + 1 ] ];
				c = vertexMap[ index.array[ i * 3 + 2 ] ];

			} else {

				a = vertexMap[ i * 3 ];
				b = vertexMap[ i * 3 + 1 ];
				c = vertexMap[ i * 3 + 2 ];

			}

			this._facesABCD[ i * 4 ] = a;
			this._facesABCD[ i * 4 + 1 ] = b;
			this._facesABCD[ i * 4 + 2 ] = c;
			this._facesABCD[ i * 4 + 3 ] = TRI_INDEX;
			this._trianglesABC[ i * 3 ] = a;
			this._trianglesABC[ i * 3 + 1 ] = b;
			this._trianglesABC[ i * 3 + 2 ] = c;

		}

		// Allocate arrays
		this._vertOnEdge = new Uint8Array( nbVertices );
		this._vertTagFlags = new Int32Array( nbVertices );
		this._vertSculptFlags = new Int32Array( nbVertices );
		this._vertStateFlags = new Int32Array( nbVertices );
		this._facesTagFlags = new Int32Array( nbTriangles );
		this._facesStateFlags = new Int32Array( nbTriangles );
		this._faceBoxes = new Float32Array( nbTriangles * 6 );
		this._faceNormals = new Float32Array( nbTriangles * 3 );
		this._faceCenters = new Float32Array( nbTriangles * 3 );
		this._facePosInLeaf = new Uint32Array( nbTriangles );
		this._faceLeaf = new Array( nbTriangles ).fill( null );

		// Init topology (Array of Arrays for dynamic topo)
		this._initTopology();

		// Compute geometry (normals, aabbs, octree)
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

		const tagFlag = ++ Flags.TAG;
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
			if ( vflags[ iVer1 ] !== tagFlag ) { vflags[ iVer1 ] = tagFlag; vring.push( iVer1 ); }
			if ( vflags[ iVer2 ] !== tagFlag ) { vflags[ iVer2 ] = tagFlag; vring.push( iVer2 ); }

		}

	}

	_updateGeometry( iFaces, iVerts ) {

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

			let len = Math.sqrt( nx * nx + ny * ny + nz * nz );
			if ( len > 0 ) len = 1.0 / len;
			const ind3 = ind * 3;
			nAr[ ind3 ] = nx * len;
			nAr[ ind3 + 1 ] = ny * len;
			nAr[ ind3 + 2 ] = nz * len;

		}

	}

	_updateOctree( iFaces ) {

		if ( iFaces === undefined ) {

			// Full rebuild
			const octree = new OctreeCell();
			octree.resetNbFaces( this._nbFaces );

			// Compute world bounds
			const vAr = this._verticesXYZ;
			let bxmin = Infinity, bymin = Infinity, bzmin = Infinity;
			let bxmax = - Infinity, bymax = - Infinity, bzmax = - Infinity;
			for ( let i = 0, l = this._nbVertices * 3; i < l; i += 3 ) {

				if ( vAr[ i ] < bxmin ) bxmin = vAr[ i ];
				if ( vAr[ i ] > bxmax ) bxmax = vAr[ i ];
				if ( vAr[ i + 1 ] < bymin ) bymin = vAr[ i + 1 ];
				if ( vAr[ i + 1 ] > bymax ) bymax = vAr[ i + 1 ];
				if ( vAr[ i + 2 ] < bzmin ) bzmin = vAr[ i + 2 ];
				if ( vAr[ i + 2 ] > bzmax ) bzmax = vAr[ i + 2 ];

			}

			const rangeX = bxmax - bxmin, rangeY = bymax - bymin, rangeZ = bzmax - bzmin;
			const margin = Math.max( rangeX, rangeY, rangeZ, 0.1 ) * 0.5;
			octree._setAabbSplit( bxmin - margin, bymin - margin, bzmin - margin, bxmax + margin, bymax + margin, bzmax + margin );
			octree.build( this );
			this._octree = octree;

		} else {

			// Partial update: reinsert modified faces
			const faceBoxes = this._faceBoxes;
			const faceCenters = this._faceCenters;
			const faceLeaf = this._faceLeaf;
			const facePosInLeaf = this._facePosInLeaf;
			const nbFaces = iFaces.length;

			const leavesToUpdate = [];

			for ( let i = 0; i < nbFaces; ++ i ) {

				const iFace = iFaces[ i ];
				const leaf = faceLeaf[ iFace ];
				if ( ! leaf ) continue;
				const pos = facePosInLeaf[ iFace ];
				const iTrisLeaf = leaf._iFaces;
				const last = iTrisLeaf[ iTrisLeaf.length - 1 ];
				if ( iFace !== last ) {

					iTrisLeaf[ pos ] = last;
					facePosInLeaf[ last ] = pos;

				}

				iTrisLeaf.pop();
				leavesToUpdate.push( leaf );

			}

			for ( let i = 0; i < nbFaces; ++ i ) {

				const iFace = iFaces[ i ];
				const id6 = iFace * 6;
				const id3 = iFace * 3;
				const newLeaf = this._octree.addFace(
					iFace,
					faceBoxes[ id6 ], faceBoxes[ id6 + 1 ], faceBoxes[ id6 + 2 ],
					faceBoxes[ id6 + 3 ], faceBoxes[ id6 + 4 ], faceBoxes[ id6 + 5 ],
					faceCenters[ id3 ], faceCenters[ id3 + 1 ], faceCenters[ id3 + 2 ]
				);
				if ( newLeaf ) {

					faceLeaf[ iFace ] = newLeaf;
					facePosInLeaf[ iFace ] = newLeaf._iFaces.length - 1;

				}

			}

			for ( let i = 0, l = leavesToUpdate.length; i < l; ++ i ) {

				if ( leavesToUpdate[ i ]._iFaces.length === 0 ) leavesToUpdate[ i ].pruneIfPossible();

			}

		}

	}

	// ---- Mesh queries (used by Picking, SculptBase, etc.) ----

	intersectRay( vNear, eyeDir ) {

		const nbFaces = this._nbFaces;
		const collectBuffer = new Uint32Array( getMemory( nbFaces * 4 ), 0, nbFaces );
		return this._octree.collectIntersectRay( vNear, eyeDir, collectBuffer );

	}

	intersectSphere( center, radiusSq ) {

		const nbFaces = this._nbFaces;
		const collectBuffer = new Uint32Array( getMemory( nbFaces * 4 ), 0, nbFaces );
		return this._octree.collectIntersectSphere( center, radiusSq, collectBuffer );

	}

	getVerticesFromFaces( iFaces ) {

		const tagFlag = ++ Flags.TAG;
		const nbFaces = iFaces.length;
		const vtf = this._vertTagFlags;
		const fAr = this._facesABCD;
		let acc = 0;
		const verts = new Uint32Array( getMemory( 4 * nbFaces * 4 ), 0, nbFaces * 4 );
		for ( let i = 0; i < nbFaces; ++ i ) {

			const ind = iFaces[ i ] * 4;
			const iv1 = fAr[ ind ], iv2 = fAr[ ind + 1 ], iv3 = fAr[ ind + 2 ];
			if ( vtf[ iv1 ] !== tagFlag ) { vtf[ iv1 ] = tagFlag; verts[ acc ++ ] = iv1; }
			if ( vtf[ iv2 ] !== tagFlag ) { vtf[ iv2 ] = tagFlag; verts[ acc ++ ] = iv2; }
			if ( vtf[ iv3 ] !== tagFlag ) { vtf[ iv3 ] = tagFlag; verts[ acc ++ ] = iv3; }

		}

		return new Uint32Array( verts.subarray( 0, acc ) );

	}

	getFacesFromVertices( iVerts ) {

		const tagFlag = ++ Flags.TAG;
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

		return new Uint32Array( faces.subarray( 0, acc ) );

	}

	expandsFaces( iFaces, nRing ) {

		const tagFlag = ++ Flags.TAG;
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

		return new Uint32Array( iFacesExpanded.subarray( 0, acc ) );

	}

	expandsVertices( iVerts, nRing ) {

		const tagFlag = ++ Flags.TAG;
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

		return new Uint32Array( iVertsExpanded.subarray( 0, acc ) );

	}

	// ---- Dynamic topology helpers ----

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

	_resizeArray( orig, targetSize ) {

		if ( ! orig ) return null;
		if ( orig.length >= targetSize ) return orig.subarray( 0, targetSize * 2 );
		const tmp = new orig.constructor( targetSize * 2 );
		tmp.set( orig );
		return tmp;

	}

	reAllocateArrays( nbAddElements ) {

		let nbDyna = this._facesStateFlags.length;
		const nbTriangles = this._nbFaces;
		let len = nbTriangles + nbAddElements;
		if ( nbDyna < len || nbDyna > len * 4 ) {

			this._facesStateFlags = this._resizeArray( this._facesStateFlags, len );
			this._facesABCD = this._resizeArray( this._facesABCD, len * 4 );
			this._trianglesABC = this._resizeArray( this._trianglesABC, len * 3 );
			this._faceBoxes = this._resizeArray( this._faceBoxes, len * 6 );
			this._faceNormals = this._resizeArray( this._faceNormals, len * 3 );
			this._faceCenters = this._resizeArray( this._faceCenters, len * 3 );
			this._facesTagFlags = this._resizeArray( this._facesTagFlags, len );
			this._facePosInLeaf = this._resizeArray( this._facePosInLeaf, len );

		}

		nbDyna = this._verticesXYZ.length / 3;
		const nbVertices = this._nbVertices;
		len = nbVertices + nbAddElements;
		if ( nbDyna < len || nbDyna > len * 4 ) {

			this._verticesXYZ = this._resizeArray( this._verticesXYZ, len * 3 );
			this._normalsXYZ = this._resizeArray( this._normalsXYZ, len * 3 );
			this._colorsRGB = this._resizeArray( this._colorsRGB, len * 3 );
			this._materialsPBR = this._resizeArray( this._materialsPBR, len * 3 );
			this._vertOnEdge = this._resizeArray( this._vertOnEdge, len );
			this._vertTagFlags = this._resizeArray( this._vertTagFlags, len );
			this._vertSculptFlags = this._resizeArray( this._vertSculptFlags, len );
			this._vertStateFlags = this._resizeArray( this._vertStateFlags, len );

		}

	}

	balanceOctree() {

		// Rebuild octree from scratch
		this._updateOctree();

	}

}

export { SculptMesh };
