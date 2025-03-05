import {
	Matrix4,
	Object3D,
	Quaternion,
	Vector3
} from 'three';

// Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();

/**
 * The base 3D object that is supported by {@link CSS3DRenderer}.
 *
 * @augments Object3D
 */
class CSS3DObject extends Object3D {

	/**
	 * Constructs a new CSS3D object.
	 *
	 * @param {DOMElement} [element] - The DOM element.
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
		this.isCSS3DObject = true;

		/**
		 * The DOM element which defines the appearance of this 3D object.
		 *
		 * @type {DOMElement}
		 * @readonly
		 * @default true
		 */
		this.element = element;
		this.element.style.position = 'absolute';
		this.element.style.pointerEvents = 'auto';
		this.element.style.userSelect = 'none';

		this.element.setAttribute( 'draggable', false );

		this.addEventListener( 'removed', function () {

			this.traverse( function ( object ) {

				if (
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

		return this;

	}

}

/**
 * A specialized version of {@link CSS3DObject} that represents
 * DOM elements as sprites.
 *
 * @augments CSS3DObject
 */
class CSS3DSprite extends CSS3DObject {

	/**
	 * Constructs a new CSS3D sprite object.
	 *
	 * @param {DOMElement} [element] - The DOM element.
	 */
	constructor( element ) {

		super( element );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCSS3DSprite = true;

		/**
		 * The sprite's rotation in radians.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.rotation2D = 0;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.rotation2D = source.rotation2D;

		return this;

	}

}

//

const _matrix = new Matrix4();
const _matrix2 = new Matrix4();

/**
 * This renderer can be used to apply hierarchical 3D transformations to DOM elements
 * via the CSS3 [transform]{@link https://www.w3schools.com/cssref/css3_pr_transform.asp} property.
 * `CSS3DRenderer` is particularly interesting if you want to apply 3D effects to a website without
 * canvas based rendering. It can also be used in order to combine DOM elements with WebGLcontent.
 *
 * There are, however, some important limitations:
 *
 * - It's not possible to use the material system of *three.js*.
 * - It's also not possible to use geometries.
 * - The renderer only supports 100% browser and display zoom.
 *
 * So `CSS3DRenderer` is just focused on ordinary DOM elements. These elements are wrapped into special
 * 3D objects ({@link CSS3DObject} or {@link CSS3DSprite}) and then added to the scene graph.
 */
class CSS3DRenderer {

	/**
	 * Constructs a new CSS3D renderer.
	 *
	 * @param {CSS3DRenderer~Parameters} [parameters] - The parameters.
	 */
	constructor( parameters = {} ) {

		const _this = this;

		let _width, _height;
		let _widthHalf, _heightHalf;

		const cache = {
			camera: { style: '' },
			objects: new WeakMap()
		};

		const domElement = parameters.element !== undefined ? parameters.element : document.createElement( 'div' );

		domElement.style.overflow = 'hidden';

		/**
		 * The DOM where the renderer appends its child-elements.
		 *
		 * @type {DOMElement}
		 */
		this.domElement = domElement;

		const viewElement = document.createElement( 'div' );
		viewElement.style.transformOrigin = '0 0';
		viewElement.style.pointerEvents = 'none';
		domElement.appendChild( viewElement );

		const cameraElement = document.createElement( 'div' );

		cameraElement.style.transformStyle = 'preserve-3d';

		viewElement.appendChild( cameraElement );

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

			const fov = camera.projectionMatrix.elements[ 5 ] * _heightHalf;

			if ( camera.view && camera.view.enabled ) {

				// view offset
				viewElement.style.transform = `translate( ${ - camera.view.offsetX * ( _width / camera.view.width ) }px, ${ - camera.view.offsetY * ( _height / camera.view.height ) }px )`;

				// view fullWidth and fullHeight, view width and height
				viewElement.style.transform += `scale( ${ camera.view.fullWidth / camera.view.width }, ${ camera.view.fullHeight / camera.view.height } )`;

			} else {

				viewElement.style.transform = '';

			}

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			let tx, ty;

			if ( camera.isOrthographicCamera ) {

				tx = - ( camera.right + camera.left ) / 2;
				ty = ( camera.top + camera.bottom ) / 2;

			}

			const scaleByViewOffset = camera.view && camera.view.enabled ? camera.view.height / camera.view.fullHeight : 1;
			const cameraCSSMatrix = camera.isOrthographicCamera ?
				`scale( ${ scaleByViewOffset } )` + 'scale(' + fov + ')' + 'translate(' + epsilon( tx ) + 'px,' + epsilon( ty ) + 'px)' + getCameraCSSMatrix( camera.matrixWorldInverse ) :
				`scale( ${ scaleByViewOffset } )` + 'translateZ(' + fov + 'px)' + getCameraCSSMatrix( camera.matrixWorldInverse );
			const perspective = camera.isPerspectiveCamera ? 'perspective(' + fov + 'px) ' : '';

			const style = perspective + cameraCSSMatrix +
				'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)';

			if ( cache.camera.style !== style ) {

				cameraElement.style.transform = style;

				cache.camera.style = style;

			}

			renderObject( scene, scene, camera, cameraCSSMatrix );

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

			viewElement.style.width = width + 'px';
			viewElement.style.height = height + 'px';

			cameraElement.style.width = width + 'px';
			cameraElement.style.height = height + 'px';

		};

		function epsilon( value ) {

			return Math.abs( value ) < 1e-10 ? 0 : value;

		}

		function getCameraCSSMatrix( matrix ) {

			const elements = matrix.elements;

			return 'matrix3d(' +
				epsilon( elements[ 0 ] ) + ',' +
				epsilon( - elements[ 1 ] ) + ',' +
				epsilon( elements[ 2 ] ) + ',' +
				epsilon( elements[ 3 ] ) + ',' +
				epsilon( elements[ 4 ] ) + ',' +
				epsilon( - elements[ 5 ] ) + ',' +
				epsilon( elements[ 6 ] ) + ',' +
				epsilon( elements[ 7 ] ) + ',' +
				epsilon( elements[ 8 ] ) + ',' +
				epsilon( - elements[ 9 ] ) + ',' +
				epsilon( elements[ 10 ] ) + ',' +
				epsilon( elements[ 11 ] ) + ',' +
				epsilon( elements[ 12 ] ) + ',' +
				epsilon( - elements[ 13 ] ) + ',' +
				epsilon( elements[ 14 ] ) + ',' +
				epsilon( elements[ 15 ] ) +
			')';

		}

		function getObjectCSSMatrix( matrix ) {

			const elements = matrix.elements;
			const matrix3d = 'matrix3d(' +
				epsilon( elements[ 0 ] ) + ',' +
				epsilon( elements[ 1 ] ) + ',' +
				epsilon( elements[ 2 ] ) + ',' +
				epsilon( elements[ 3 ] ) + ',' +
				epsilon( - elements[ 4 ] ) + ',' +
				epsilon( - elements[ 5 ] ) + ',' +
				epsilon( - elements[ 6 ] ) + ',' +
				epsilon( - elements[ 7 ] ) + ',' +
				epsilon( elements[ 8 ] ) + ',' +
				epsilon( elements[ 9 ] ) + ',' +
				epsilon( elements[ 10 ] ) + ',' +
				epsilon( elements[ 11 ] ) + ',' +
				epsilon( elements[ 12 ] ) + ',' +
				epsilon( elements[ 13 ] ) + ',' +
				epsilon( elements[ 14 ] ) + ',' +
				epsilon( elements[ 15 ] ) +
			')';

			return 'translate(-50%,-50%)' + matrix3d;

		}

		function hideObject( object ) {

			if ( object.isCSS3DObject ) object.element.style.display = 'none';

			for ( let i = 0, l = object.children.length; i < l; i ++ ) {

				hideObject( object.children[ i ] );

			}

		}

		function renderObject( object, scene, camera, cameraCSSMatrix ) {

			if ( object.visible === false ) {

				hideObject( object );

				return;

			}

			if ( object.isCSS3DObject ) {

				const visible = ( object.layers.test( camera.layers ) === true );

				const element = object.element;
				element.style.display = visible === true ? '' : 'none';

				if ( visible === true ) {

					object.onBeforeRender( _this, scene, camera );

					let style;

					if ( object.isCSS3DSprite ) {

						// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

						_matrix.copy( camera.matrixWorldInverse );
						_matrix.transpose();

						if ( object.rotation2D !== 0 ) _matrix.multiply( _matrix2.makeRotationZ( object.rotation2D ) );

						object.matrixWorld.decompose( _position, _quaternion, _scale );
						_matrix.setPosition( _position );
						_matrix.scale( _scale );

						_matrix.elements[ 3 ] = 0;
						_matrix.elements[ 7 ] = 0;
						_matrix.elements[ 11 ] = 0;
						_matrix.elements[ 15 ] = 1;

						style = getObjectCSSMatrix( _matrix );

					} else {

						style = getObjectCSSMatrix( object.matrixWorld );

					}

					const cachedObject = cache.objects.get( object );

					if ( cachedObject === undefined || cachedObject.style !== style ) {

						element.style.transform = style;

						const objectData = { style: style };
						cache.objects.set( object, objectData );

					}

					if ( element.parentNode !== cameraElement ) {

						cameraElement.appendChild( element );

					}

					object.onAfterRender( _this, scene, camera );

				}

			}

			for ( let i = 0, l = object.children.length; i < l; i ++ ) {

				renderObject( object.children[ i ], scene, camera, cameraCSSMatrix );

			}

		}

	}

}

/**
 * Constructor parameters of `CSS3DRenderer`.
 *
 * @typedef {Object} CSS3DRenderer~Parameters
 * @property {DOMElement} [element] - A DOM element where the renderer appends its child-elements.
 * If not passed in here, a new div element will be created.
 **/

export { CSS3DObject, CSS3DSprite, CSS3DRenderer };
