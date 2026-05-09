import {
	Matrix4,
	Object3D,
	Vector2,
	Vector3
} from 'three';

/**
 * The only type of 3D object that is supported by {@link CSS2DRenderer}.
 *
 * @augments Object3D
 * @three_import import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
 */
class CSS2DObject extends Object3D {

	/**
	 * Constructs a new CSS2D object.
	 *
	 * @param {HTMLElement} [element] - The DOM element.
	 */
	constructor( element = document.createElement( 'div' ) ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCSS2DObject = true;

		/**
		 * The DOM element which defines the appearance of this 3D object.
		 *
		 * @type {HTMLElement}
		 * @readonly
		 * @default true
		 */
		this.element = element;

		this.element.style.position = 'absolute';
		this.element.style.userSelect = 'none';

		this.element.setAttribute( 'draggable', false );

		/**
		 * The 3D objects center point.
		 * `( 0, 0 )` is the lower left, `( 1, 1 )` is the top right.
		 *
		 * @type {Vector2}
		 * @default (0.5,0.5)
		 */
		this.center = new Vector2( 0.5, 0.5 );

		this.addEventListener( 'removed', function () {

			this.traverse( function ( object ) {

				if (
					object.element &&
					object.element instanceof object.element.ownerDocument.defaultView.Element &&
					object.element.parentNode !== null
				) {

					object.element.remove();

				}

			} );

		} );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.element = source.element.cloneNode( true );

		this.center = source.center;

		return this;

	}

}

//

const _vector = new Vector3();
const _viewMatrix = new Matrix4();
const _viewProjectionMatrix = new Matrix4();
const _a = new Vector3();
const _b = new Vector3();

/**
 * This renderer is a simplified version of {@link CSS3DRenderer}. The only transformation that is
 * supported is translation.
 *
 * The renderer is very useful if you want to combine HTML based labels with 3D objects. Here too,
 * the respective DOM elements are wrapped into an instance of {@link CSS2DObject} and added to the
 * scene graph. All other types of renderable 3D objects (like meshes or point clouds) are ignored.
 *
 * `CSS2DRenderer` only supports 100% browser and display zoom.
 *
 * @three_import import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
 */
class CSS2DRenderer {

	/**
	 * Constructs a new CSS2D renderer.
	 *
	 * @param {CSS2DRenderer~Parameters} [parameters] - The parameters.
	 */
	constructor( parameters = {} ) {

		const _this = this;

		let _width, _height;
		let _widthHalf, _heightHalf;

		const cache = {
			objects: new WeakMap()
		};

		const domElement = parameters.element !== undefined ? parameters.element : document.createElement( 'div' );

		domElement.style.overflow = 'hidden';

		/**
		 * The DOM where the renderer appends its child-elements.
		 *
		 * @type {HTMLElement}
		 */
		this.domElement = domElement;

		/**
		 * Controls whether the renderer assigns `z-index` values to CSS2DObject DOM elements.
		 * If set to `true`, z-index values are assigned first based on the `renderOrder`
		 * and secondly - the distance to the camera. If set to `false`, no z-index values are assigned.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.sortObjects = true;

		/**
		 * Returns an object containing the width and height of the renderer.
		 *
		 * @return {{width:number,height:number}} The size of the renderer.
		 */
		this.getSize = function () {

			return {
				width: _width,
				height: _height
			};

		};

		/**
		 * Renders the given scene using the given camera.
		 *
		 * @param {Object3D} scene - A scene or any other type of 3D object.
		 * @param {Camera} camera - The camera.
		 */
		this.render = function ( scene, camera ) {

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			_viewMatrix.copy( camera.matrixWorldInverse );
			_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

			renderObject( scene, scene, camera );
			if ( this.sortObjects ) zOrder( scene );

		};

		/**
		 * Resizes the renderer to the given width and height.
		 *
		 * @param {number} width - The width of the renderer.
		 * @param {number} height - The height of the renderer.
		 */
		this.setSize = function ( width, height ) {

			_width = width;
			_height = height;

			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			domElement.style.width = width + 'px';
			domElement.style.height = height + 'px';

		};

		function hideObject( object ) {

			if ( object.isCSS2DObject ) object.element.style.display = 'none';

			for ( let i = 0, l = object.children.length; i < l; i ++ ) {

				hideObject( object.children[ i ] );

			}

		}

		function renderObject( object, scene, camera ) {

			if ( object.visible === false ) {

				hideObject( object );

				return;

			}

			if ( object.isCSS2DObject ) {

				_vector.setFromMatrixPosition( object.matrixWorld );
				_vector.applyMatrix4( _viewProjectionMatrix );

				const visible = ( _vector.z >= - 1 && _vector.z <= 1 ) && ( object.layers.test( camera.layers ) === true );

				const element = object.element;
				element.style.display = visible === true ? '' : 'none';

				if ( visible === true ) {

					object.onBeforeRender( _this, scene, camera );

					element.style.transform = 'translate(' + ( - 100 * object.center.x ) + '%,' + ( - 100 * object.center.y ) + '%)' + 'translate(' + ( _vector.x * _widthHalf + _widthHalf ) + 'px,' + ( - _vector.y * _heightHalf + _heightHalf ) + 'px)';

					if ( element.parentNode !== domElement ) {

						domElement.appendChild( element );

					}

					object.onAfterRender( _this, scene, camera );

				}

				const objectData = {
					distanceToCameraSquared: getDistanceToSquared( camera, object )
				};

				cache.objects.set( object, objectData );

			}

			for ( let i = 0, l = object.children.length; i < l; i ++ ) {

				renderObject( object.children[ i ], scene, camera );

			}

		}

		function getDistanceToSquared( object1, object2 ) {

			_a.setFromMatrixPosition( object1.matrixWorld );
			_b.setFromMatrixPosition( object2.matrixWorld );

			return _a.distanceToSquared( _b );

		}

		function filterAndFlatten( scene ) {

			const result = [];

			scene.traverseVisible( function ( object ) {

				if ( object.isCSS2DObject ) result.push( object );

			} );

			return result;

		}

		function zOrder( scene ) {

			const sorted = filterAndFlatten( scene ).sort( function ( a, b ) {

				if ( a.renderOrder !== b.renderOrder ) {

					return b.renderOrder - a.renderOrder;

				}

				const distanceA = cache.objects.get( a ).distanceToCameraSquared;
				const distanceB = cache.objects.get( b ).distanceToCameraSquared;

				return distanceA - distanceB;

			} );

			const zMax = sorted.length;

			for ( let i = 0, l = sorted.length; i < l; i ++ ) {

				sorted[ i ].element.style.zIndex = zMax - i;

			}

		}

	}

}

/**
 * Constructor parameters of `CSS2DRenderer`.
 *
 * @typedef {Object} CSS2DRenderer~Parameters
 * @property {HTMLElement} [element] - A DOM element where the renderer appends its child-elements.
 * If not passed in here, a new div element will be created.
 **/

export { CSS2DObject, CSS2DRenderer };
