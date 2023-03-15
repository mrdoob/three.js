import {
	Matrix4,
	Object3D,
	Vector2,
	Vector3
} from 'three';

class CSS2DObject extends Object3D {

	constructor( element = document.createElement( 'div' ) ) {

		super();

		this.isCSS2DObject = true;

		this.element = element;

		this.element.style.position = 'absolute';
		this.element.style.userSelect = 'none';

		this.element.setAttribute( 'draggable', false );

		this.center = new Vector2( 0.5, 0.5 ); // ( 0, 0 ) is the lower left; ( 1, 1 ) is the top right

		this.addEventListener( 'removed', function () {

			this.traverse( function ( object ) {

				if ( object.element instanceof Element && object.element.parentNode !== null ) {

					object.element.parentNode.removeChild( object.element );

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

class CSS2DRenderer {

	constructor( parameters = {} ) {

		const _this = this;

		let _width, _height;
		let _widthHalf, _heightHalf;

		const cache = {
			objects: new WeakMap()
		};

		const domElement = parameters.element !== undefined ? parameters.element : document.createElement( 'div' );

		domElement.style.overflow = 'hidden';

		this.domElement = domElement;

		this.getSize = function () {

			return {
				width: _width,
				height: _height
			};

		};

		this.render = function ( scene, camera ) {

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			_viewMatrix.copy( camera.matrixWorldInverse );
			_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

			renderObject( scene, scene, camera );
			zOrder( scene );

		};

		this.setSize = function ( width, height ) {

			_width = width;
			_height = height;

			_widthHalf = _width / 2;
			_heightHalf = _height / 2;

			domElement.style.width = width + 'px';
			domElement.style.height = height + 'px';

		};

		function renderObject( object, scene, camera ) {

			if ( object.isCSS2DObject ) {

				_vector.setFromMatrixPosition( object.matrixWorld );
				_vector.applyMatrix4( _viewProjectionMatrix );

				const visible = ( object.visible === true ) && ( _vector.z >= - 1 && _vector.z <= 1 ) && ( object.layers.test( camera.layers ) === true );
				object.element.style.display = ( visible === true ) ? '' : 'none';

				if ( visible === true ) {

					object.onBeforeRender( _this, scene, camera );

					const element = object.element;

					element.style.transform = 'translate(' + ( - 100 * object.center.x ) + '%,' + ( - 100 * object.center.y ) + '%)' +  'translate(' + ( _vector.x * _widthHalf + _widthHalf ) + 'px,' + ( - _vector.y * _heightHalf + _heightHalf ) + 'px)';

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

			scene.traverse( function ( object ) {

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

export { CSS2DObject, CSS2DRenderer };
