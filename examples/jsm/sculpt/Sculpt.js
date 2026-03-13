// Ported from SculptGL by Stéphane Ginier
// https://github.com/stephomi/sculptgl

import {
	BufferAttribute,
	Matrix4,
	Vector3
} from 'three';

import {
	Flags,
	getMemory,
	sub,
	sqrLen,
	sqrDist,
	intersectionRayTriangle,
	vertexOnLine
} from './SculptUtils.js';

import { SculptMesh } from './SculptMesh.js';

import {
	subdivisionPass,
	decimationPass,
	getFrontVertices,
	areaNormal,
	areaCenter,
	toolFlatten,
	toolInflate,
	toolSmooth,
	toolPinch,
	toolCrease,
	toolDrag,
	toolScale
} from './SculptTools.js';

// ---- Main Sculpt Class ----

const _v3NearLocal = new Vector3();
const _v3FarLocal = new Vector3();
const _matInverse = new Matrix4();
const _tmpInter = [ 0, 0, 0 ];
const _tmpV1 = [ 0, 0, 0 ];
const _tmpV2 = [ 0, 0, 0 ];
const _tmpV3 = [ 0, 0, 0 ];
const _v3Temp = new Vector3();

class Sculpt {

	constructor( mesh, camera, domElement ) {

		this.tool = 'brush';
		this.radius = 50;
		this.strength = 1.5;
		this.negative = false;
		this.subdivision = 0.75;
		this.decimation = 0;

		this._mesh = mesh;
		this._camera = camera;
		this._domElement = domElement;

		this._sculptMesh = new SculptMesh();
		this._sculptMesh.initFromGeometry( mesh.geometry );

		// Sync geometry once at init
		this._syncGeometry();

		this._sculpting = false;
		this._lastMouseX = 0;
		this._lastMouseY = 0;
		this._pickedFace = - 1;
		this._interPoint = [ 0, 0, 0 ];
		this._eyeDir = [ 0, 0, 0 ];
		this._rLocal2 = 0;
		this._pickedNormal = [ 0, 0, 0 ];
		this._dragDir = [ 0, 0, 0 ];
		this._scalePrevX = 0;
		this._scaleDelta = 0;
		this._cachedRect = null;

		// Bind event handlers
		this._onPointerDown = this._onPointerDown.bind( this );
		this._onPointerMove = this._onPointerMove.bind( this );
		this._onPointerUp = this._onPointerUp.bind( this );

		domElement.addEventListener( 'pointerdown', this._onPointerDown );
		domElement.addEventListener( 'pointermove', this._onPointerMove );
		domElement.addEventListener( 'pointerup', this._onPointerUp );

	}

	dispose() {

		this._domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		this._domElement.removeEventListener( 'pointermove', this._onPointerMove );
		this._domElement.removeEventListener( 'pointerup', this._onPointerUp );

	}

	// ---- Picking ----

	_getRect() {

		if ( this._cachedRect === null ) {

			this._cachedRect = this._domElement.getBoundingClientRect();

		}

		return this._cachedRect;

	}

	_unproject( mouseX, mouseY, z ) {

		const rect = this._getRect();
		const x = ( ( mouseX - rect.left ) / rect.width ) * 2 - 1;
		const y = - ( ( mouseY - rect.top ) / rect.height ) * 2 + 1;
		_v3Temp.set( x, y, z ).unproject( this._camera );
		return [ _v3Temp.x, _v3Temp.y, _v3Temp.z ];

	}

	_project( point ) {

		_v3Temp.set( point[ 0 ], point[ 1 ], point[ 2 ] ).project( this._camera );
		const rect = this._getRect();
		return [
			( _v3Temp.x * 0.5 + 0.5 ) * rect.width + rect.left,
			( - _v3Temp.y * 0.5 + 0.5 ) * rect.height + rect.top,
			_v3Temp.z
		];

	}

	_pickClosestFace( near, eyeDir ) {

		const sm = this._sculptMesh;
		const iFacesCandidates = sm.intersectRay( near, eyeDir );
		const vAr = sm.getVertices();
		const fAr = sm.getFaces();
		let distance = Infinity;
		this._pickedFace = - 1;

		for ( let i = 0, l = iFacesCandidates.length; i < l; ++ i ) {

			const indFace = iFacesCandidates[ i ] * 4;
			const ind1 = fAr[ indFace ] * 3, ind2 = fAr[ indFace + 1 ] * 3, ind3 = fAr[ indFace + 2 ] * 3;
			_tmpV1[ 0 ] = vAr[ ind1 ]; _tmpV1[ 1 ] = vAr[ ind1 + 1 ]; _tmpV1[ 2 ] = vAr[ ind1 + 2 ];
			_tmpV2[ 0 ] = vAr[ ind2 ]; _tmpV2[ 1 ] = vAr[ ind2 + 1 ]; _tmpV2[ 2 ] = vAr[ ind2 + 2 ];
			_tmpV3[ 0 ] = vAr[ ind3 ]; _tmpV3[ 1 ] = vAr[ ind3 + 1 ]; _tmpV3[ 2 ] = vAr[ ind3 + 2 ];
			const hitDist = intersectionRayTriangle( near, eyeDir, _tmpV1, _tmpV2, _tmpV3, _tmpInter );
			if ( hitDist >= 0 && hitDist < distance ) {

				distance = hitDist;
				this._interPoint[ 0 ] = _tmpInter[ 0 ];
				this._interPoint[ 1 ] = _tmpInter[ 1 ];
				this._interPoint[ 2 ] = _tmpInter[ 2 ];
				this._pickedFace = iFacesCandidates[ i ];

			}

		}

		return this._pickedFace !== - 1;

	}

	_intersectionRayMesh( mouseX, mouseY ) {

		const vNear = this._unproject( mouseX, mouseY, 0 );
		const vFar = this._unproject( mouseX, mouseY, 0.1 );

		// Transform to local space
		_matInverse.copy( this._mesh.matrixWorld ).invert();
		_v3NearLocal.set( vNear[ 0 ], vNear[ 1 ], vNear[ 2 ] ).applyMatrix4( _matInverse );
		_v3FarLocal.set( vFar[ 0 ], vFar[ 1 ], vFar[ 2 ] ).applyMatrix4( _matInverse );

		const near = [ _v3NearLocal.x, _v3NearLocal.y, _v3NearLocal.z ];
		const far = [ _v3FarLocal.x, _v3FarLocal.y, _v3FarLocal.z ];
		const eyeDir = this._eyeDir;
		sub( eyeDir, far, near );
		const len = Math.sqrt( sqrLen( eyeDir ) );
		eyeDir[ 0 ] /= len; eyeDir[ 1 ] /= len; eyeDir[ 2 ] /= len;

		if ( ! this._pickClosestFace( near, eyeDir ) ) return false;

		this._updateLocalAndWorldRadius2();
		return true;

	}

	_updateLocalAndWorldRadius2() {

		// Transform intersection to world space
		const ip = this._interPoint;
		_v3Temp.set( ip[ 0 ], ip[ 1 ], ip[ 2 ] ).applyMatrix4( this._mesh.matrixWorld );
		const wx = _v3Temp.x, wy = _v3Temp.y, wz = _v3Temp.z;

		const screenInter = this._project( [ wx, wy, wz ] );
		const offsetX = this.radius;
		const worldPoint = this._unproject( screenInter[ 0 ] + offsetX, screenInter[ 1 ], screenInter[ 2 ] );
		const rWorld2 = sqrDist( [ wx, wy, wz ], worldPoint );

		// Convert to local space
		const m = this._mesh.matrixWorld.elements;
		const scale2 = m[ 0 ] * m[ 0 ] + m[ 4 ] * m[ 4 ] + m[ 8 ] * m[ 8 ];
		this._rLocal2 = rWorld2 / scale2;

	}

	_pickVerticesInSphere( rLocal2 ) {

		const sm = this._sculptMesh;
		const vAr = sm.getVertices();
		const vertSculptFlags = sm.getVerticesSculptFlags();
		const inter = this._interPoint;
		const iFacesInCells = sm.intersectSphere( inter, rLocal2 );
		const iVerts = sm.getVerticesFromFaces( iFacesInCells );
		const nbVerts = iVerts.length;
		const sculptFlag = ++ Flags.SCULPT;
		const pickedVertices = new Uint32Array( getMemory( 4 * nbVerts ), 0, nbVerts );
		let acc = 0;
		const itx = inter[ 0 ], ity = inter[ 1 ], itz = inter[ 2 ];
		for ( let i = 0; i < nbVerts; ++ i ) {

			const ind = iVerts[ i ];
			const j = ind * 3;
			const dx = itx - vAr[ j ], dy = ity - vAr[ j + 1 ], dz = itz - vAr[ j + 2 ];
			if ( dx * dx + dy * dy + dz * dz < rLocal2 ) {

				vertSculptFlags[ ind ] = sculptFlag;
				pickedVertices[ acc ++ ] = ind;

			}

		}

		return new Uint32Array( pickedVertices.subarray( 0, acc ) );

	}

	_computePickedNormal() {

		const sm = this._sculptMesh;
		const fAr = sm.getFaces();
		const vAr = sm.getVertices();
		const nAr = sm.getNormals();
		const id = this._pickedFace * 4;
		const iv1 = fAr[ id ] * 3, iv2 = fAr[ id + 1 ] * 3, iv3 = fAr[ id + 2 ] * 3;

		const d1 = 1.0 / Math.max( 1e-10, Math.sqrt( sqrDist( this._interPoint, [ vAr[ iv1 ], vAr[ iv1 + 1 ], vAr[ iv1 + 2 ] ] ) ) );
		const d2 = 1.0 / Math.max( 1e-10, Math.sqrt( sqrDist( this._interPoint, [ vAr[ iv2 ], vAr[ iv2 + 1 ], vAr[ iv2 + 2 ] ] ) ) );
		const d3 = 1.0 / Math.max( 1e-10, Math.sqrt( sqrDist( this._interPoint, [ vAr[ iv3 ], vAr[ iv3 + 1 ], vAr[ iv3 + 2 ] ] ) ) );
		const invSum = 1.0 / ( d1 + d2 + d3 );

		this._pickedNormal[ 0 ] = ( nAr[ iv1 ] * d1 + nAr[ iv2 ] * d2 + nAr[ iv3 ] * d3 ) * invSum;
		this._pickedNormal[ 1 ] = ( nAr[ iv1 + 1 ] * d1 + nAr[ iv2 + 1 ] * d2 + nAr[ iv3 + 1 ] * d3 ) * invSum;
		this._pickedNormal[ 2 ] = ( nAr[ iv1 + 2 ] * d1 + nAr[ iv2 + 2 ] * d2 + nAr[ iv3 + 2 ] * d3 ) * invSum;
		const len = Math.sqrt( sqrLen( this._pickedNormal ) );
		if ( len > 0 ) { this._pickedNormal[ 0 ] /= len; this._pickedNormal[ 1 ] /= len; this._pickedNormal[ 2 ] /= len; }

	}

	// ---- Dynamic topology ----

	_dynamicTopology( iVerts ) {

		const sm = this._sculptMesh;
		const subFactor = this.subdivision;
		const decFactor = this.decimation;
		if ( subFactor === 0 && decFactor === 0 ) return iVerts;
		if ( iVerts.length === 0 ) {

			iVerts = sm.getVerticesFromFaces( [ this._pickedFace ] );

		}

		let iFaces = sm.getFacesFromVertices( iVerts );
		const radius2 = this._rLocal2;
		const center = this._interPoint;
		const d2Max = radius2 * ( 1.1 - subFactor ) * 0.2;
		const d2Min = ( d2Max / 4.2025 ) * decFactor;

		if ( subFactor ) iFaces = subdivisionPass( sm, iFaces, center, radius2, d2Max );
		if ( decFactor ) iFaces = decimationPass( sm, iFaces, center, radius2, d2Min );

		iVerts = sm.getVerticesFromFaces( iFaces );
		const nbVerts = iVerts.length;
		const sculptFlag = Flags.SCULPT;
		const vscf = sm.getVerticesSculptFlags();
		const iVertsInRadius = new Uint32Array( getMemory( nbVerts * 4 ), 0, nbVerts );
		let acc = 0;
		for ( let i = 0; i < nbVerts; ++ i ) {

			const iVert = iVerts[ i ];
			if ( vscf[ iVert ] === sculptFlag ) iVertsInRadius[ acc ++ ] = iVert;

		}

		const result = new Uint32Array( iVertsInRadius.subarray( 0, acc ) );
		sm.updateTopology( iFaces, iVerts );
		sm._updateGeometry( iFaces, iVerts );
		return result;

	}

	// ---- Ray-based API (for XR / programmatic use) ----

	_intersectionFromRay( worldOrigin, worldDirection, worldRadius ) {

		// Transform ray to local space
		_matInverse.copy( this._mesh.matrixWorld ).invert();
		_v3NearLocal.copy( worldOrigin ).applyMatrix4( _matInverse );
		_v3FarLocal.copy( worldDirection ).transformDirection( _matInverse ).normalize();

		const near = [ _v3NearLocal.x, _v3NearLocal.y, _v3NearLocal.z ];
		const eyeDir = this._eyeDir;
		eyeDir[ 0 ] = _v3FarLocal.x; eyeDir[ 1 ] = _v3FarLocal.y; eyeDir[ 2 ] = _v3FarLocal.z;

		if ( ! this._pickClosestFace( near, eyeDir ) ) return false;

		// Set radius in local space from world radius
		const m = this._mesh.matrixWorld.elements;
		const scale2 = m[ 0 ] * m[ 0 ] + m[ 4 ] * m[ 4 ] + m[ 8 ] * m[ 8 ];
		this._rLocal2 = ( worldRadius * worldRadius ) / scale2;

		return true;

	}

	strokeFromRay( origin, direction, worldRadius ) {

		if ( ! this._intersectionFromRay( origin, direction, worldRadius ) ) return false;
		this._applyStroke();
		this._syncGeometry();
		return true;

	}

	endStroke() {

		this._sculptMesh.balanceOctree();

	}

	// ---- Stroke pipeline ----

	_applyStroke() {

		const rLocal2 = this._rLocal2;
		let iVerts = this._pickVerticesInSphere( rLocal2 );

		const sm = this._sculptMesh;
		const tool = this.tool;

		// Compute before dynamic topology changes the picked face
		if ( tool === 'crease' ) this._computePickedNormal();

		// Dynamic topology for all tools except scale
		if ( tool !== 'scale' ) {

			iVerts = this._dynamicTopology( iVerts );

		}

		const iVertsFront = getFrontVertices( sm, iVerts, this._eyeDir );
		const center = this._interPoint;
		const intensity = this.strength;
		const negative = this.negative;

		if ( tool === 'brush' ) {

			const aN = areaNormal( sm, iVertsFront );
			if ( ! aN ) return;
			const aC = areaCenter( sm, iVertsFront );
			const off = Math.sqrt( rLocal2 ) * 0.1;
			aC[ 0 ] += aN[ 0 ] * ( negative ? - off : off );
			aC[ 1 ] += aN[ 1 ] * ( negative ? - off : off );
			aC[ 2 ] += aN[ 2 ] * ( negative ? - off : off );
			toolFlatten( sm, iVerts, aN, aC, center, rLocal2, intensity, negative );

		} else if ( tool === 'inflate' ) {

			toolInflate( sm, iVerts, center, rLocal2, intensity, negative );

		} else if ( tool === 'smooth' ) {

			toolSmooth( sm, iVerts, intensity );

		} else if ( tool === 'flatten' ) {

			const aN = areaNormal( sm, iVertsFront );
			if ( ! aN ) return;
			const aC = areaCenter( sm, iVertsFront );
			toolFlatten( sm, iVerts, aN, aC, center, rLocal2, intensity, negative );

		} else if ( tool === 'pinch' ) {

			toolPinch( sm, iVerts, center, rLocal2, intensity, negative );

		} else if ( tool === 'crease' ) {

			const pN = this._pickedNormal;
			toolCrease( sm, iVerts, pN, center, rLocal2, intensity, negative );

		} else if ( tool === 'drag' ) {

			toolDrag( sm, iVerts, center, rLocal2, this._dragDir );

		} else if ( tool === 'scale' ) {

			toolScale( sm, iVerts, center, rLocal2, this._scaleDelta );

		}

		// Update geometry
		const iFaces = sm.getFacesFromVertices( iVerts );
		sm._updateGeometry( iFaces, iVerts );

	}

	_makeStroke( mouseX, mouseY ) {

		if ( ! this._intersectionRayMesh( mouseX, mouseY ) ) return false;
		this._applyStroke();
		return true;

	}

	_sculptStroke( mouseX, mouseY ) {

		const dx = mouseX - this._lastMouseX;
		const dy = mouseY - this._lastMouseY;
		const dist = Math.sqrt( dx * dx + dy * dy );
		const minSpacing = 0.15 * this.radius;

		if ( dist <= minSpacing ) return;

		const step = 1.0 / Math.floor( dist / minSpacing );
		const stepX = dx * step;
		const stepY = dy * step;
		let mx = this._lastMouseX + stepX;
		let my = this._lastMouseY + stepY;

		for ( let i = step; i <= 1.0; i += step ) {

			if ( ! this._makeStroke( mx, my ) ) break;
			mx += stepX;
			my += stepY;

		}

		this._lastMouseX = mouseX;
		this._lastMouseY = mouseY;

		this._syncGeometry();

	}

	_updateDragDir( mouseX, mouseY ) {

		const vNear = this._unproject( mouseX, mouseY, 0 );
		const vFar = this._unproject( mouseX, mouseY, 0.1 );

		_matInverse.copy( this._mesh.matrixWorld ).invert();
		_v3NearLocal.set( vNear[ 0 ], vNear[ 1 ], vNear[ 2 ] ).applyMatrix4( _matInverse );
		_v3FarLocal.set( vFar[ 0 ], vFar[ 1 ], vFar[ 2 ] ).applyMatrix4( _matInverse );

		const near = [ _v3NearLocal.x, _v3NearLocal.y, _v3NearLocal.z ];
		const far = [ _v3FarLocal.x, _v3FarLocal.y, _v3FarLocal.z ];

		const center = this._interPoint;
		const newCenter = vertexOnLine( center, near, far );
		this._dragDir[ 0 ] = newCenter[ 0 ] - center[ 0 ];
		this._dragDir[ 1 ] = newCenter[ 1 ] - center[ 1 ];
		this._dragDir[ 2 ] = newCenter[ 2 ] - center[ 2 ];
		this._interPoint[ 0 ] = newCenter[ 0 ];
		this._interPoint[ 1 ] = newCenter[ 1 ];
		this._interPoint[ 2 ] = newCenter[ 2 ];

		// Update eye dir
		const eyeDir = this._eyeDir;
		sub( eyeDir, far, near );
		const len = Math.sqrt( sqrLen( eyeDir ) );
		eyeDir[ 0 ] /= len; eyeDir[ 1 ] /= len; eyeDir[ 2 ] /= len;

		this._updateLocalAndWorldRadius2();

	}

	_sculptStrokeDrag( mouseX, mouseY ) {

		const sm = this._sculptMesh;
		const dx = mouseX - this._lastMouseX;
		const dy = mouseY - this._lastMouseY;
		const dist = Math.sqrt( dx * dx + dy * dy );
		const minSpacing = 0.15 * this.radius;
		const step = 1.0 / Math.max( 1, Math.floor( dist / minSpacing ) );
		const stepX = dx * step;
		const stepY = dy * step;
		let mx = this._lastMouseX;
		let my = this._lastMouseY;

		for ( let i = 0.0; i < 1.0; i += step ) {

			mx += stepX;
			my += stepY;
			this._updateDragDir( mx, my );
			const iVerts = this._pickVerticesInSphere( this._rLocal2 );
			const iVertsDyn = this._dynamicTopology( iVerts );
			toolDrag( sm, iVertsDyn, this._interPoint, this._rLocal2, this._dragDir );
			const iFaces = sm.getFacesFromVertices( iVertsDyn );
			sm._updateGeometry( iFaces, iVertsDyn );

		}

		this._lastMouseX = mouseX;
		this._lastMouseY = mouseY;
		this._syncGeometry();

	}

	_sculptStrokeScale( mouseX, mouseY ) {

		this._scaleDelta = mouseX - this._scalePrevX;
		this._scalePrevX = mouseX;
		this._applyStroke();
		this._syncGeometry();

	}

	// ---- Sync back to Three.js ----

	_syncGeometry() {

		const sm = this._sculptMesh;
		const geometry = this._mesh.geometry;
		const nbVerts = sm.getNbVertices();
		const nbTris = sm.getNbTriangles();

		geometry.setAttribute( 'position', new BufferAttribute( sm.getVertices().slice( 0, nbVerts * 3 ), 3 ) );
		geometry.setAttribute( 'normal', new BufferAttribute( sm.getNormals().slice( 0, nbVerts * 3 ), 3 ) );
		geometry.setIndex( new BufferAttribute( sm.getTriangles().slice( 0, nbTris * 3 ), 1 ) );
		geometry.computeBoundingSphere();

	}

	// ---- Event handling ----

	_onPointerDown( event ) {

		if ( event.button !== 0 ) return;

		this._cachedRect = null;

		const mouseX = event.clientX;
		const mouseY = event.clientY;

		if ( ! this._intersectionRayMesh( mouseX, mouseY ) ) return;

		this._sculpting = true;
		this._lastMouseX = mouseX;
		this._lastMouseY = mouseY;
		try { this._domElement.setPointerCapture( event.pointerId ); } catch ( e ) { /* synthetic events */ }

		if ( this.tool === 'scale' ) {

			this._scalePrevX = mouseX;

		} else if ( this.tool !== 'drag' ) {

			// Do first stroke immediately
			this._makeStroke( mouseX, mouseY );
			this._syncGeometry();

		}

	}

	_onPointerMove( event ) {

		if ( ! this._sculpting ) return;

		this._cachedRect = null;

		const mouseX = event.clientX;
		const mouseY = event.clientY;

		if ( this.tool === 'drag' ) {

			this._sculptStrokeDrag( mouseX, mouseY );

		} else if ( this.tool === 'scale' ) {

			this._sculptStrokeScale( mouseX, mouseY );

		} else {

			this._sculptStroke( mouseX, mouseY );

		}

	}

	_onPointerUp( event ) {

		if ( ! this._sculpting ) return;
		this._sculpting = false;
		try { this._domElement.releasePointerCapture( event.pointerId ); } catch ( e ) { /* synthetic events */ }

		// Balance octree after stroke
		this._sculptMesh.balanceOctree();

	}

	get isSculpting() {

		return this._sculpting;

	}

	get hitPoint() {

		return this._interPoint;

	}

	get hitNormal() {

		return this._pickedNormal;

	}

	pickFromMouse( mouseX, mouseY ) {

		this._cachedRect = null;

		if ( ! this._intersectionRayMesh( mouseX, mouseY ) ) return false;
		this._computePickedNormal();
		return true;

	}

}

export { Sculpt };
