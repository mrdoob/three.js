import {
	Matrix4,
	Vector3
} from 'three';

const _pixelToLocal = new Matrix4();
const _mvp = new Matrix4();
const _viewport = new Matrix4();
const _size = new Vector3();

/**
 * Manages interaction for 3D objects independently of the scene graph.
 *
 * For objects with an {@link HTMLTexture}, the manager computes CSS `matrix3d`
 * transforms each frame so the underlying HTML elements stay aligned with
 * their meshes. Because the elements are children of the canvas, the browser
 * dispatches pointer events to them natively.
 *
 * ```js
 * const interactions = new InteractionManager();
 * interactions.connect( renderer, camera );
 *
 * // Objects live anywhere in the scene graph
 * scene.add( mesh );
 *
 * // Register for interaction separately
 * interactions.add( mesh );
 *
 * // In the animation loop
 * interactions.update();
 * ```
 * @three_import import { InteractionManager } from 'three/addons/interaction/InteractionManager.js';
 */
class InteractionManager {

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

		// TODO: Remove once Chromium 157.0.8081.0+ is the baseline.
		this._supportsCanvasTransform = null;

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
		this._supportsCanvasTransform = null; // TODO: Remove once Chromium 157.0.8081.0+ is the baseline.

	}

	/**
	 * Updates the element transforms for all registered objects.
	 * Call this once per frame in the animation loop.
	 */
	update() {

		const canvas = this.element;
		const camera = this.camera;

		if ( canvas === null || camera === null ) return;

		// Viewport: NDC (-1,1) to canvas CSS pixels, Y flipped.
		// Using CSS pixels (clientWidth/clientHeight) so the resulting matrix
		// can be applied directly as a CSS transform without DPR conversion.

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

		for ( const object of this.objects ) {

			const texture = object.material.map;

			if ( ! texture || ! texture.isHTMLTexture ) continue;

			const element = texture.image;

			if ( ! element ) continue;

			// Position at canvas origin so the CSS matrix3d maps correctly.
			element.style.position = 'absolute';
			element.style.left = '0';
			element.style.top = '0';
			element.style.transformOrigin = '0 0'; // TODO: Remove once Chromium 157.0.8081.0+ is the baseline

			const elemW = element.offsetWidth;
			const elemH = element.offsetHeight;

			// Get mesh dimensions from geometry bounding box

			const geometry = object.geometry;

			if ( ! geometry.boundingBox ) geometry.computeBoundingBox();

			geometry.boundingBox.getSize( _size );

			// Map element pixel coords (0,0)-(elemW,elemH) to mesh local coords.
			// Front face: top-left at (-sizeX/2, sizeY/2, maxZ), bottom-right at (sizeX/2, -sizeY/2, maxZ).

			_pixelToLocal.set(
				_size.x / elemW, 0, 0, - _size.x / 2,
				0, - _size.y / elemH, 0, _size.y / 2,
				0, 0, 1, geometry.boundingBox.max.z,
				0, 0, 0, 1
			);

			// Model-View-Projection

			_mvp.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			_mvp.multiply( object.matrixWorld );
			_mvp.multiply( _pixelToLocal );

			// Apply viewport

			_mvp.premultiply( _viewport );

			if ( typeof canvas.updateElementGeometry === 'function' ) {

				const initialized =
					( canvas.hasAttribute( 'content' ) || canvas.hasAttribute( 'layoutsubtree' ) ) &&
					element.hasAttribute( 'drawable' ) &&
					canvas.contains( element );

				if ( initialized === false ) continue;

				// TODO: Remove once Chromium 157.0.8081.0+ is the baseline.
				if ( this._supportsCanvasTransform === null ) {

					this._supportsCanvasTransform = supportsElementCanvasTransform( canvas, element );

				}

			}

			// TODO: Remove once Chromium 157.0.8081.0+ is the baseline: drop this check and the
			// legacy `else` branch, keeping only updateElementGeometry().
			if ( this._supportsCanvasTransform === true ) {

				// Chromium 157.0.8081.0+

				canvas.updateElementGeometry( element, { canvasTransform: new DOMMatrix( _mvp.elements ) } );

			} else {

				// Legacy: Chromium <= 157.0.8079.0.

				element.style.transform = 'matrix3d(' + _mvp.elements.join( ',' ) + ')';

				// Chromium 155 - 157.0.8079.0 only hit test canvas children registered via
				// updateElementGeometry(). Register the element without a canvas transform,
				// since it isn't applied in these versions.
				if ( typeof canvas.updateElementGeometry === 'function' ) {

					canvas.updateElementGeometry( element );

				}

			}

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
		this._supportsCanvasTransform = null; // TODO: Remove once Chromium 157.0.8081.0+ is the baseline.

	}

}

// TODO: Remove once Chromium 157.0.8081.0+ is the baseline.
// Chromium builds 155.0.8059.12 - 157.0.8079.0 expose updateElementGeometry()
// but don't apply the transform without a flag, see crrev.com/c/8489932.

function supportsElementCanvasTransform( canvas, element ) {

	if ( typeof canvas.updateElementGeometry !== 'function' || typeof canvas.getElementTransform !== 'function' ) return false;

	try {

		canvas.getElementTransform( element );
		return true;

	} catch ( e ) {

		// Any other error (e.g. InvalidStateError) means the overload exists.
		return e.name !== 'TypeError';

	}

}

export { InteractionManager };
