/**
 * Quadric Error Metric (QEM) Mesh Simplifier
 * 
 * Based on "Surface Simplification Using Quadric Error Metrics"
 * by Michael Garland and Paul S. Heckbert (SIGGRAPH 1997)
 */

import * as THREE from 'three';

const _tempVec = new THREE.Vector3();
const _tempVec2 = new THREE.Vector3();
const _edge1 = new THREE.Vector3();
const _edge2 = new THREE.Vector3();

class Quadric {

	constructor() {
		this.a = 0; this.b = 0; this.c = 0; this.d = 0;
		this.e = 0; this.f = 0; this.g = 0;
		this.h = 0; this.i = 0; this.j = 0;
	}

	setFromPlane( a, b, c, d ) {
		this.a = a * a; this.b = a * b; this.c = a * c; this.d = a * d;
		this.e = b * b; this.f = b * c; this.g = b * d;
		this.h = c * c; this.i = c * d; this.j = d * d;
		return this;
	}

	add( q ) {
		this.a += q.a; this.b += q.b; this.c += q.c; this.d += q.d;
		this.e += q.e; this.f += q.f; this.g += q.g;
		this.h += q.h; this.i += q.i; this.j += q.j;
		return this;
	}

	copy( q ) {
		this.a = q.a; this.b = q.b; this.c = q.c; this.d = q.d;
		this.e = q.e; this.f = q.f; this.g = q.g;
		this.h = q.h; this.i = q.i; this.j = q.j;
		return this;
	}

	evaluate( x, y, z ) {
		return (
			this.a * x * x + 2 * this.b * x * y + 2 * this.c * x * z + 2 * this.d * x +
			this.e * y * y + 2 * this.f * y * z + 2 * this.g * y +
			this.h * z * z + 2 * this.i * z + this.j
		);
	}

	solveOptimal( target ) {
		const det =
			this.a * ( this.e * this.h - this.f * this.f ) -
			this.b * ( this.b * this.h - this.f * this.c ) +
			this.c * ( this.b * this.f - this.e * this.c );

		if ( Math.abs( det ) < 1e-10 ) return null;

		const invDet = 1 / det;
		target.x = invDet * ( -this.d * ( this.e * this.h - this.f * this.f ) + this.g * ( this.b * this.h - this.f * this.c ) - this.i * ( this.b * this.f - this.e * this.c ) );
		target.y = invDet * ( -this.a * ( this.g * this.h - this.f * this.i ) + this.b * ( this.d * this.h - this.i * this.c ) - this.c * ( this.d * this.f - this.g * this.c ) );
		target.z = invDet * ( -this.a * ( this.e * this.i - this.g * this.f ) + this.b * ( this.b * this.i - this.g * this.c ) - this.d * ( this.b * this.f - this.e * this.c ) );
		return target;
	}

}

class HEVertex {

	constructor( position, index ) {
		this.position = position.clone();
		this.index = index;
		this.halfEdge = null;
		this.quadric = new Quadric();
		this.removed = false;
		this.uv = null;
		this.normal = null;
		this.color = null;
	}

}

class HalfEdge {

	constructor( vertex, face ) {
		this.vertex = vertex;
		this.face = face;
		this.next = null;
		this.prev = null;
		this.twin = null;
		this.collapseError = 0;
		this.collapseTarget = new THREE.Vector3();
		this.heapIndex = -1;
	}

	get endVertex() { return this.next.vertex; }
	isBoundary() { return this.twin === null; }

}

class HEFace {

	constructor( index ) {
		this.index = index;
		this.halfEdge = null;
		this.normal = new THREE.Vector3();
		this.removed = false;
	}

	computeNormal() {
		const v0 = this.halfEdge.vertex.position;
		const v1 = this.halfEdge.next.vertex.position;
		const v2 = this.halfEdge.prev.vertex.position;
		_edge1.subVectors( v1, v0 );
		_edge2.subVectors( v2, v0 );
		this.normal.crossVectors( _edge1, _edge2 ).normalize();
		return this.normal;
	}

}

class HalfEdgeMesh {

	constructor() {
		this.vertices = [];
		this.halfEdges = [];
		this.faces = [];
	}

	buildFromBufferGeometry( geometry ) {
		const posAttr = geometry.getAttribute( 'position' );
		const uvAttr = geometry.getAttribute( 'uv' );
		const normalAttr = geometry.getAttribute( 'normal' );
		const colorAttr = geometry.getAttribute( 'color' );
		const index = geometry.index;

		for ( let i = 0; i < posAttr.count; i++ ) {
			const pos = new THREE.Vector3().fromBufferAttribute( posAttr, i );
			const vertex = new HEVertex( pos, i );
			if ( uvAttr ) vertex.uv = new THREE.Vector2().fromBufferAttribute( uvAttr, i );
			if ( normalAttr ) vertex.normal = new THREE.Vector3().fromBufferAttribute( normalAttr, i );
			if ( colorAttr ) vertex.color = new THREE.Color().fromBufferAttribute( colorAttr, i );
			this.vertices.push( vertex );
		}

		const edgeMap = new Map();
		const getEdgeKey = ( i1, i2 ) => i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;

		const indices = index ? index.array : null;
		const faceCount = index ? index.count / 3 : posAttr.count / 3;

		for ( let f = 0; f < faceCount; f++ ) {
			const face = new HEFace( f );
			this.faces.push( face );

			const i0 = indices ? indices[ f * 3 ] : f * 3;
			const i1 = indices ? indices[ f * 3 + 1 ] : f * 3 + 1;
			const i2 = indices ? indices[ f * 3 + 2 ] : f * 3 + 2;

			const v0 = this.vertices[ i0 ];
			const v1 = this.vertices[ i1 ];
			const v2 = this.vertices[ i2 ];

			const he0 = new HalfEdge( v0, face );
			const he1 = new HalfEdge( v1, face );
			const he2 = new HalfEdge( v2, face );

			he0.next = he1; he1.next = he2; he2.next = he0;
			he0.prev = he2; he1.prev = he0; he2.prev = he1;

			face.halfEdge = he0;
			if ( !v0.halfEdge ) v0.halfEdge = he0;
			if ( !v1.halfEdge ) v1.halfEdge = he1;
			if ( !v2.halfEdge ) v2.halfEdge = he2;

			this.halfEdges.push( he0, he1, he2 );

			const edges = [ [ i0, i1, he0 ], [ i1, i2, he1 ], [ i2, i0, he2 ] ];
			for ( const [ a, b, he ] of edges ) {
				const key = getEdgeKey( a, b );
				const existing = edgeMap.get( key );
				if ( existing ) {
					he.twin = existing;
					existing.twin = he;
				} else {
					edgeMap.set( key, he );
				}
			}

			face.computeNormal();
		}
	}

}

class EdgeHeap {

	constructor() {
		this.heap = [];
		this.size = 0;
	}

	insert( edge ) {
		edge.heapIndex = this.size;
		this.heap[ this.size ] = edge;
		this.size++;
		this._bubbleUp( edge.heapIndex );
	}

	extractMin() {
		if ( this.size === 0 ) return null;
		const min = this.heap[ 0 ];
		min.heapIndex = -1;
		this.size--;
		if ( this.size > 0 ) {
			this.heap[ 0 ] = this.heap[ this.size ];
			this.heap[ 0 ].heapIndex = 0;
			this._bubbleDown( 0 );
		}
		return min;
	}

	remove( edge ) {
		if ( edge.heapIndex < 0 || edge.heapIndex >= this.size ) return;
		const idx = edge.heapIndex;
		edge.heapIndex = -1;
		this.size--;
		if ( idx === this.size ) return;
		this.heap[ idx ] = this.heap[ this.size ];
		this.heap[ idx ].heapIndex = idx;
		this._bubbleUp( idx );
		this._bubbleDown( idx );
	}

	_bubbleUp( idx ) {
		while ( idx > 0 ) {
			const parentIdx = Math.floor( ( idx - 1 ) / 2 );
			if ( this.heap[ idx ].collapseError >= this.heap[ parentIdx ].collapseError ) break;
			this._swap( idx, parentIdx );
			idx = parentIdx;
		}
	}

	_bubbleDown( idx ) {
		while ( true ) {
			const left = 2 * idx + 1;
			const right = 2 * idx + 2;
			let smallest = idx;
			if ( left < this.size && this.heap[ left ].collapseError < this.heap[ smallest ].collapseError ) smallest = left;
			if ( right < this.size && this.heap[ right ].collapseError < this.heap[ smallest ].collapseError ) smallest = right;
			if ( smallest === idx ) break;
			this._swap( idx, smallest );
			idx = smallest;
		}
	}

	_swap( i, j ) {
		const temp = this.heap[ i ];
		this.heap[ i ] = this.heap[ j ];
		this.heap[ j ] = temp;
		this.heap[ i ].heapIndex = i;
		this.heap[ j ].heapIndex = j;
	}

}

class QEMSimplifier {

	constructor() {
		this.mesh = null;
		this.heap = null;
		this.stats = null;
		this.preserveBoundary = true;
		this.preserveUVSeams = true;
		this.boundaryWeight = 100.0;
	}

	simplify( geometry, options = {} ) {
		const startTime = performance.now();
		const ratio = options.ratio ?? 0.5;
		this.preserveBoundary = options.preserveBoundary ?? true;
		this.preserveUVSeams = options.preserveUVSeams ?? true;
		this.boundaryWeight = options.boundaryWeight ?? 100.0;

		geometry = geometry.clone();

		if ( geometry.index === null ) {
			const positions = geometry.getAttribute( 'position' );
			const indices = [];
			for ( let i = 0; i < positions.count; i++ ) indices.push( i );
			geometry.setIndex( indices );
		}

		this.mesh = new HalfEdgeMesh();
		this.mesh.buildFromBufferGeometry( geometry );
		this._computeVertexQuadrics();

		this.heap = new EdgeHeap();
		this._initializeEdgeHeap();

		const originalFaceCount = this.mesh.faces.length;
		const targetFaces = Math.max( 4, Math.floor( originalFaceCount * ratio ) );

		let failedAttempts = 0;
		const maxFailedAttempts = Math.min( 10000, this.mesh.halfEdges.length );

		while ( this.heap.size > 0 && failedAttempts < maxFailedAttempts ) {
			const currentFaces = this._countActiveFaces();
			if ( currentFaces <= targetFaces ) break;

			const edge = this.heap.extractMin();
			if ( !edge ) break;
			if ( edge.collapseError === Infinity ) { failedAttempts++; continue; }
			if ( !this._isCollapseValid( edge ) ) { failedAttempts++; continue; }

			this._collapseEdge( edge );
			failedAttempts = 0;
		}

		const result = this._buildOutputGeometry();

		this.stats = {
			originalVertices: geometry.getAttribute( 'position' ).count,
			originalTriangles: originalFaceCount,
			finalVertices: result.getAttribute( 'position' ).count,
			finalTriangles: result.index.count / 3,
			ratio: ( result.index.count / 3 ) / originalFaceCount,
			timeTaken: performance.now() - startTime
		};

		return result;
	}

	_countActiveFaces() {
		let count = 0;
		for ( const face of this.mesh.faces ) if ( !face.removed ) count++;
		return count;
	}

	_computeVertexQuadrics() {
		for ( const face of this.mesh.faces ) {
			const n = face.normal;
			const v = face.halfEdge.vertex.position;
			const d = -n.dot( v );
			const faceQuadric = new Quadric().setFromPlane( n.x, n.y, n.z, d );

			let he = face.halfEdge;
			do {
				he.vertex.quadric.add( faceQuadric );
				he = he.next;
			} while ( he !== face.halfEdge );
		}

		if ( this.preserveBoundary ) this._addBoundaryConstraints();
	}

	_addBoundaryConstraints() {
		for ( const he of this.mesh.halfEdges ) {
			if ( he.isBoundary() ) {
				const v0 = he.vertex.position;
				const v1 = he.endVertex.position;
				_tempVec.subVectors( v1, v0 ).normalize();
				_tempVec2.crossVectors( _tempVec, he.face.normal ).normalize();
				const d = -_tempVec2.dot( v0 );
				const constraint = new Quadric().setFromPlane(
					_tempVec2.x * this.boundaryWeight,
					_tempVec2.y * this.boundaryWeight,
					_tempVec2.z * this.boundaryWeight,
					d * this.boundaryWeight
				);
				he.vertex.quadric.add( constraint );
				he.endVertex.quadric.add( constraint );
			}
		}
	}

	_initializeEdgeHeap() {
		const processed = new Set();
		for ( const he of this.mesh.halfEdges ) {
			const key = this._edgeKey( he );
			if ( processed.has( key ) ) continue;
			processed.add( key );
			this._computeEdgeError( he );
			this.heap.insert( he );
		}
	}

	_edgeKey( edge ) {
		const i1 = edge.vertex.index;
		const i2 = edge.endVertex.index;
		return i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
	}

	_computeEdgeError( edge ) {
		const v1 = edge.vertex;
		const v2 = edge.endVertex;

		if ( v1.removed || v2.removed ) {
			edge.collapseError = Infinity;
			return;
		}

		const Q = new Quadric();
		Q.copy( v1.quadric );
		Q.add( v2.quadric );

		const optimal = Q.solveOptimal( edge.collapseTarget );
		if ( optimal === null ) {
			edge.collapseTarget.addVectors( v1.position, v2.position ).multiplyScalar( 0.5 );
		}

		edge.collapseError = Q.evaluate( edge.collapseTarget.x, edge.collapseTarget.y, edge.collapseTarget.z );

		if ( this.preserveBoundary && edge.isBoundary() ) {
			edge.collapseError += this.boundaryWeight * 1000;
		}
	}

	_isCollapseValid( edge ) {
		const v1 = edge.vertex;
		const v2 = edge.endVertex;
		if ( v1.removed || v2.removed ) return false;
		if ( edge.face.removed ) return false;
		if ( !this._checkNoInversion( edge ) ) return false;
		return true;
	}

	_checkNoInversion( edge ) {
		const target = edge.collapseTarget;
		const v1 = edge.vertex;
		const v2 = edge.endVertex;

		const facesToCheck = [];
		for ( const face of this.mesh.faces ) {
			if ( face.removed ) continue;
			if ( this._faceContainsEdge( face, v1, v2 ) ) continue;

			let fhe = face.halfEdge;
			let containsV1OrV2 = false;
			do {
				if ( fhe.vertex === v1 || fhe.vertex === v2 ) { containsV1OrV2 = true; break; }
				fhe = fhe.next;
			} while ( fhe !== face.halfEdge );

			if ( containsV1OrV2 ) facesToCheck.push( face );
		}

		for ( const face of facesToCheck ) {
			const fv = [];
			let fhe = face.halfEdge;
			do {
				fv.push( fhe.vertex );
				fhe = fhe.next;
			} while ( fhe !== face.halfEdge );

			const newPositions = fv.map( v => ( v === v1 || v === v2 ) ? target : v.position );

			_edge1.subVectors( newPositions[ 1 ], newPositions[ 0 ] );
			_edge2.subVectors( newPositions[ 2 ], newPositions[ 0 ] );
			_tempVec.crossVectors( _edge1, _edge2 );

			if ( _tempVec.lengthSq() < 1e-20 ) return false;

			_tempVec.normalize();
			if ( _tempVec.dot( face.normal ) < -0.2 ) return false;
		}

		return true;
	}

	_faceContainsEdge( face, v1, v2 ) {
		let he = face.halfEdge;
		do {
			const a = he.vertex;
			const b = he.endVertex;
			if ( ( a === v1 && b === v2 ) || ( a === v2 && b === v1 ) ) return true;
			he = he.next;
		} while ( he !== face.halfEdge );
		return false;
	}

	_collapseEdge( edge ) {
		const v1 = edge.vertex;
		const v2 = edge.endVertex;

		v1.position.copy( edge.collapseTarget );
		v1.quadric.add( v2.quadric );
		this._interpolateAttributes( v1, v2, edge.collapseTarget );

		if ( !edge.face.removed ) edge.face.removed = true;
		if ( edge.twin && !edge.twin.face.removed ) edge.twin.face.removed = true;

		for ( const he of this.mesh.halfEdges ) {
			if ( he.vertex === v2 ) he.vertex = v1;
		}

		v2.removed = true;

		if ( v1.halfEdge && ( v1.halfEdge.face.removed || v1.halfEdge.vertex !== v1 ) ) {
			for ( const he of this.mesh.halfEdges ) {
				if ( he.vertex === v1 && !he.face.removed ) { v1.halfEdge = he; break; }
			}
		}

		this._updateAffectedEdges( v1 );
	}

	_interpolateAttributes( v1, v2, target ) {
		const d1 = v1.position.distanceTo( target );
		const d2 = v2.position.distanceTo( target );
		const total = d1 + d2;
		const t = total > 0 ? d1 / total : 0.5;

		if ( v1.uv && v2.uv ) v1.uv.lerp( v2.uv, t );
		else if ( v2.uv ) v1.uv = v2.uv.clone();

		if ( v1.normal && v2.normal ) v1.normal.lerp( v2.normal, t ).normalize();
		else if ( v2.normal ) v1.normal = v2.normal.clone();

		if ( v1.color && v2.color ) v1.color.lerp( v2.color, t );
		else if ( v2.color ) v1.color = v2.color.clone();
	}

	_updateAffectedEdges( vertex ) {
		const edgesToUpdate = new Set();

		for ( const he of this.mesh.halfEdges ) {
			if ( he.face.removed ) continue;
			if ( he.vertex === vertex || he.endVertex === vertex ) edgesToUpdate.add( he );
		}

		for ( const he of edgesToUpdate ) {
			this._computeEdgeError( he );
			if ( he.heapIndex >= 0 ) {
				this.heap.remove( he );
				if ( he.collapseError < Infinity ) this.heap.insert( he );
			} else if ( he.collapseError < Infinity ) {
				this.heap.insert( he );
			}
		}
	}

	_buildOutputGeometry() {
		const positions = [];
		const uvs = [];
		const normals = [];
		const colors = [];
		const indices = [];

		const vertexMap = new Map();
		let newIndex = 0;

		for ( const face of this.mesh.faces ) {
			if ( face.removed ) continue;

			let he = face.halfEdge;
			const faceIndices = [];

			do {
				const v = he.vertex;
				if ( !vertexMap.has( v ) ) {
					vertexMap.set( v, newIndex );
					positions.push( v.position.x, v.position.y, v.position.z );
					if ( v.uv ) uvs.push( v.uv.x, v.uv.y );
					if ( v.normal ) normals.push( v.normal.x, v.normal.y, v.normal.z );
					if ( v.color ) colors.push( v.color.r, v.color.g, v.color.b );
					newIndex++;
				}
				faceIndices.push( vertexMap.get( v ) );
				he = he.next;
			} while ( he !== face.halfEdge );

			indices.push( faceIndices[ 0 ], faceIndices[ 1 ], faceIndices[ 2 ] );
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		if ( uvs.length > 0 ) geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );
		if ( normals.length > 0 ) geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
		if ( colors.length > 0 ) geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		geometry.setIndex( indices );

		return geometry;
	}

}

export { QEMSimplifier, Quadric, HalfEdgeMesh };

