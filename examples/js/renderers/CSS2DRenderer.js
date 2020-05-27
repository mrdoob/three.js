console.warn( "THREE.CSS2DRenderer: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS2DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = 'absolute';

	this.addEventListener( 'removed', function () {

		this.traverse( function ( object ) {

			if ( object.element instanceof Element && object.element.parentNode !== null ) {

				object.element.parentNode.removeChild( object.element );

			}

		} );

	} );

};

THREE.CSS2DObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.CSS2DObject.prototype.constructor = THREE.CSS2DObject;

//

THREE.CSS2DRenderer = function () {

	var _this = this;

	var _width, _height;
	var _widthHalf, _heightHalf;

	var vector = new THREE.Vector3();
	var viewMatrix = new THREE.Matrix4();
	var viewProjectionMatrix = new THREE.Matrix4();

	var cache = {
		objects: new WeakMap()
	};

	var domElement = document.createElement( 'div' );
	domElement.style.overflow = 'hidden';

	this.domElement = domElement;

	this.getSize = function () {

		return {
			width: _width,
			height: _height
		};

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

	};

	var renderObject = function ( object, scene, camera ) {

		if ( object instanceof THREE.CSS2DObject ) {

			object.onBeforeRender( _this, scene, camera );

			vector.setFromMatrixPosition( object.matrixWorld );
			vector.applyMatrix4( viewProjectionMatrix );

			var element = object.element;
			var style = 'translate(-50%,-50%) translate(' + ( vector.x * _widthHalf + _widthHalf ) + 'px,' + ( - vector.y * _heightHalf + _heightHalf ) + 'px)';

			element.style.WebkitTransform = style;
			element.style.MozTransform = style;
			element.style.oTransform = style;
			element.style.transform = style;

			element.style.display = ( object.visible && vector.z >= - 1 && vector.z <= 1 ) ? '' : 'none';

			var objectData = {
				distanceToCameraSquared: getDistanceToSquared( camera, object )
			};

			cache.objects.set( object, objectData );

			if ( element.parentNode !== domElement ) {

				domElement.appendChild( element );

			}

			object.onAfterRender( _this, scene, camera );

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], scene, camera );

		}

	};

	var getDistanceToSquared = function () {

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();

		return function ( object1, object2 ) {

			a.setFromMatrixPosition( object1.matrixWorld );
			b.setFromMatrixPosition( object2.matrixWorld );

			return a.distanceToSquared( b );

		};

	}();

	var filterAndFlatten = function ( scene ) {

		var result = [];

		scene.traverse( function ( object ) {

			if ( object instanceof THREE.CSS2DObject ) result.push( object );

		} );

		return result;

	};

	var zOrder = function ( scene ) {

		var sorted = filterAndFlatten( scene ).sort( function ( a, b ) {

			var distanceA = cache.objects.get( a ).distanceToCameraSquared;
			var distanceB = cache.objects.get( b ).distanceToCameraSquared;

			return distanceA - distanceB;

		} );

		var zMax = sorted.length;

		for ( var i = 0, l = sorted.length; i < l; i ++ ) {

			sorted[ i ].element.style.zIndex = zMax - i;

		}

	};

	this.render = function ( scene, camera ) {

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
		if ( camera.parent === null ) camera.updateMatrixWorld();

		viewMatrix.copy( camera.matrixWorldInverse );
		viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, viewMatrix );

		renderObject( scene, scene, camera );
		zOrder( scene );

	};

};
