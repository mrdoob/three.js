import {
	BackSide,
	Box3,
	DoubleSide,
	Frustum,
	Matrix4,
	Sphere,
	Vector3
} from 'three';

import { MinHeap } from './MinHeap.js';

const _pixelToLocal = new Matrix4();
const _mvp = new Matrix4();
const _viewport = new Matrix4();
const _projScreenMatrix = new Matrix4();
const _frustum = new Frustum();
const _faceNormal = new Vector3();
const _faceCenter = new Vector3();
const _cameraPos = new Vector3();
const _toCamera = new Vector3();
const _faceBox = new Box3();
const _sphere = new Sphere();

const MAX_INTERACTIVE_FACES = 3;

// Per-face normal: [axis, sign] for BoxGeometry material groups
// 0:+X, 1:-X, 2:+Y, 3:-Y, 4:+Z, 5:-Z
const _FACE_NORMALS = [
	[ 'x', + 1 ],
	[ 'x', - 1 ],
	[ 'y', + 1 ],
	[ 'y', - 1 ],
	[ 'z', + 1 ],
	[ 'z', - 1 ]
];

/**
 * Manages interaction for box meshes with per-face {@link HTMLTexture} materials.
 *
 * Each frame, visible faces are collected and only the nearest faces inside the
 * camera frustum (at most three) receive CSS `matrix3d` updates.
 *
 * ```js
 * const interactions = new InteractionManager();
 * interactions.connect( renderer, camera );
 * interactions.add( mesh );
 * interactions.update();
 * ```
 * @three_import import { InteractionManager } from 'three/addons/interaction/BoxInteractionManager.js';
 */
class BoxInteractionManager {

	constructor() {

		/**
		 * The registered interactive objects.
		 *
		 * @type {Array<Object3D>}
		 */
		this.objects = [];

		/**
		 * The canvas element.
		 *
		 * @type {?HTMLCanvasElement}
		 * @default null
		 */
		this.element = null;

		/**
		 * The camera used for computing the element transforms.
		 *
		 * @type {?Camera}
		 * @default null
		 */
		this.camera = null;

		this._cachedCssW = - 1;
		this._cachedCssH = - 1;

	}

	/**
	 * Adds one or more objects to the manager.
	 *
	 * @param {...Object3D} objects - The objects to add.
	 * @return {this}
	 */
	add( ...objects ) {

		for ( const object of objects ) {

			if ( this.objects.indexOf( object ) === - 1 ) {

				this.objects.push( object );

			}

		}

		return this;

	}

	/**
	 * Removes one or more objects from the manager.
	 *
	 * @param {...Object3D} objects - The objects to remove.
	 * @return {this}
	 */
	remove( ...objects ) {

		for ( const object of objects ) {

			const index = this.objects.indexOf( object );

			if ( index !== - 1 ) {

				this.objects.splice( index, 1 );

			}

		}

		return this;

	}

	/**
	 * Stores the renderer and camera needed for computing element transforms.
	 *
	 * @param {(WebGPURenderer|WebGLRenderer)} renderer - The renderer.
	 * @param {Camera} camera - The camera.
	 */
	connect( renderer, camera ) {

		this.camera = camera;
		this.element = renderer.domElement;

	}

	/**
	 * Updates the element transforms for all registered objects.
	 * Call this once per frame in the animation loop.
	 */
	update() {

		const canvas = this.element;
		const camera = this.camera;

		if ( canvas === null || camera === null ) return;

		const cssW = canvas.clientWidth;
		const cssH = canvas.clientHeight;

		if ( cssW !== this._cachedCssW || cssH !== this._cachedCssH ) {

			_viewport.set(
				cssW / 2, 0, 0, cssW / 2,
				0, - cssH / 2, 0, cssH / 2,
				0, 0, 1, 0,
				0, 0, 0, 1
			);

			this._cachedCssW = cssW;
			this._cachedCssH = cssH;

		}

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromProjectionMatrix( _projScreenMatrix, camera.coordinateSystem, camera.reversedDepth );

		for ( const object of this.objects ) {

			const geometry = object.geometry;

			if ( ! geometry.boundingBox ) geometry.computeBoundingBox();

			this._updateObject( object, camera, geometry.boundingBox );

		}

	}

	_updateObject( object, camera, boundingBox ) {

		const material = object.material;
		const heap = new MinHeap();

		if ( Array.isArray( material ) ) {

			for ( let i = 0, l = material.length; i < l; i ++ ) {

				const m = material[ i ];

				if ( m ) this._updateFace( object, camera, boundingBox, m, i, heap );

			}

		} else {

			this._updateFace( object, camera, boundingBox, material, 4, heap );

		}

		let updated = 0;

		while ( heap.size() > 0 && updated < MAX_INTERACTIVE_FACES ) {

			const item = heap.pop();

			if ( ! this._isFaceInFrustum( object, boundingBox, item.faceIndex ) ) {

				this._hideElement( item.element );
				continue;

			}

			this._applyFaceTransform( object, camera, boundingBox, item.faceIndex, item.element );
			updated ++;

		}

		while ( heap.size() > 0 ) {

			this._hideElement( heap.pop().element );

		}

	}

	/**
	 * Prepares a face element and, if it faces the camera, enqueues it on the heap
	 * keyed by center distance. Does not apply the CSS transform.
	 *
	 * @private
	 */
	_updateFace( object, camera, boundingBox, material, faceIndex, heap ) {

		const texture = material.map;

		if ( ! texture || ! texture.isHTMLTexture ) return;

		const element = texture.image;

		if ( ! element ) return;

		element.style.position = 'absolute';
		element.style.left = '0';
		element.style.top = '0';
		element.style.transformOrigin = '0 0';

		if ( ! this._isFaceVisible( object, camera, boundingBox, faceIndex, material.side ) ) {

			this._hideElement( element );
			return;

		}

		const distance = this._getFaceCenterDistance( object, camera, boundingBox, faceIndex );

		heap.push( {
			distance,
			faceIndex,
			element
		} );

	}

	/**
	 * @private
	 */
	_applyFaceTransform( object, camera, boundingBox, faceIndex, element ) {

		const elemW = element.offsetWidth;
		const elemH = element.offsetHeight;

		this._setPixelToLocalForFace( faceIndex, boundingBox, elemW, elemH, _pixelToLocal );

		_mvp.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_mvp.multiply( object.matrixWorld );
		_mvp.multiply( _pixelToLocal );
		_mvp.premultiply( _viewport );

		this._showElement( element );
		element.style.transform = 'matrix3d(' + _mvp.elements.join( ',' ) + ')';

	}

	/**
	 * @private
	 */
	_hideElement( element ) {

		element.style.pointerEvents = 'none';
		element.style.visibility = 'hidden';

	}

	/**
	 * @private
	 */
	_showElement( element ) {

		element.style.pointerEvents = '';
		element.style.visibility = '';

	}

	/**
	 * @private
	 * @return {number} Squared distance from the camera to the face center (world space).
	 */
	_getFaceCenterDistance( object, camera, boundingBox, faceIndex ) {

		this._getFaceCenter( boundingBox, faceIndex, _faceCenter );
		_faceCenter.applyMatrix4( object.matrixWorld );

		_cameraPos.setFromMatrixPosition( camera.matrixWorld );

		return _faceCenter.distanceToSquared( _cameraPos );

	}

	/**
	 * @private
	 */
	_getFaceCenter( boundingBox, faceIndex, target ) {

		const [ axis, sign ] = _FACE_NORMALS[ faceIndex ];

		boundingBox.getCenter( target );
		target[ axis ] = sign > 0 ? boundingBox.max[ axis ] : boundingBox.min[ axis ];

		return target;

	}

	/**
	 * @private
	 */
	_isFaceInFrustum( object, boundingBox, faceIndex ) {

		const [ axis ] = _FACE_NORMALS[ faceIndex ];

		_faceBox.copy( boundingBox );

		const min = _faceBox.min;
		const max = _faceBox.max;

		if ( axis === 'x' ) {

			min.x = max.x = ( min.x + max.x ) * 0.5;

		} else if ( axis === 'y' ) {

			min.y = max.y = ( min.y + max.y ) * 0.5;

		} else {

			min.z = max.z = ( min.z + max.z ) * 0.5;

		}

		_faceBox.applyMatrix4( object.matrixWorld );

		if ( _frustum.intersectsBox( _faceBox ) ) return true;

		this._getFaceCenter( boundingBox, faceIndex, _faceCenter );
		_faceCenter.applyMatrix4( object.matrixWorld );

		const sizeX = boundingBox.max.x - boundingBox.min.x;
		const sizeY = boundingBox.max.y - boundingBox.min.y;
		const sizeZ = boundingBox.max.z - boundingBox.min.z;

		let radius;

		if ( axis === 'x' ) {

			radius = 0.5 * Math.hypot( sizeY, sizeZ );

		} else if ( axis === 'y' ) {

			radius = 0.5 * Math.hypot( sizeX, sizeZ );

		} else {

			radius = 0.5 * Math.hypot( sizeX, sizeY );

		}

		_sphere.set( _faceCenter, radius );

		return _frustum.intersectsSphere( _sphere );

	}

	/**
	 * Tests whether a box face currently faces the camera, honoring the
	 * material's `side` property.
	 *
	 * @private
	 */
	_isFaceVisible( object, camera, boundingBox, faceIndex, side ) {

		if ( side === DoubleSide ) return true;

		const [ axis, sign ] = _FACE_NORMALS[ faceIndex ];

		_faceNormal.set( 0, 0, 0 );
		_faceNormal[ axis ] = sign;

		this._getFaceCenter( boundingBox, faceIndex, _faceCenter );

		_faceNormal.transformDirection( object.matrixWorld );
		_faceCenter.applyMatrix4( object.matrixWorld );

		_cameraPos.setFromMatrixPosition( camera.matrixWorld );
		_toCamera.subVectors( _cameraPos, _faceCenter );

		const dot = _faceNormal.dot( _toCamera );

		return side === BackSide ? dot < 0 : dot > 0;

	}

	/**
	 * Builds a matrix that maps element pixel coordinates to mesh local space
	 * on a box face. Indices match {@link BoxGeometry} material groups.
	 *
	 * @private
	 */
	_setPixelToLocalForFace( materialIndex, box, elemW, elemH, target ) {

		const min = box.min;
		const max = box.max;
		const sizeX = max.x - min.x;
		const sizeY = max.y - min.y;
		const sizeZ = max.z - min.z;

		const sx = sizeX / elemW;
		const sy = sizeY / elemH;
		const sz = sizeZ / elemW;
		const szY = sizeZ / elemH;

		switch ( materialIndex ) {

			case 0: // +X
				target.set(
					0, 0, 1, max.x,
					0, - sy, 0, max.y,
					- sz, 0, 0, max.z,
					0, 0, 0, 1
				);
				break;

			case 1: // -X
				target.set(
					0, 0, - 1, min.x,
					0, - sy, 0, max.y,
					sz, 0, 0, min.z,
					0, 0, 0, 1
				);
				break;

			case 2: // +Y
				target.set(
					sx, 0, 0, min.x,
					0, 0, 1, max.y,
					0, szY, 0, min.z,
					0, 0, 0, 1
				);
				break;

			case 3: // -Y
				target.set(
					sx, 0, 0, min.x,
					0, 0, - 1, min.y,
					0, - szY, 0, max.z,
					0, 0, 0, 1
				);
				break;

			case 5: // -Z
				target.set(
					- sx, 0, 0, max.x,
					0, - sy, 0, max.y,
					0, 0, - 1, min.z,
					0, 0, 0, 1
				);
				break;

			case 4: // +Z
			default:
				target.set(
					sx, 0, 0, min.x,
					0, - sy, 0, max.y,
					0, 0, 1, max.z,
					0, 0, 0, 1
				);
				break;

		}

	}

	/**
	 * Disconnects this manager, clearing the renderer and camera references.
	 */
	disconnect() {

		this.camera = null;
		this.element = null;
		this._cachedCssW = - 1;
		this._cachedCssH = - 1;

	}

}

export { BoxInteractionManager };
