/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = 'absolute';

	this.addEventListener( 'removed', function ( event ) {

		if ( this.element.parentNode !== null ) {

			this.element.parentNode.removeChild( this.element );

		}

	} );

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );
THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;

//

THREE.CSS3DRenderer = function () {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;

	var matrix = new THREE.Matrix4();

	var cache = {
		camera: { fov: 0, style: '' },
		objects: {}
	};

	var domElement = document.createElement( 'div' );
	domElement.style.overflow = 'hidden';

	this.domElement = domElement;

	var cameraElement = document.createElement( 'div' );

	// IE10 and 11 does not support 'preserve-3d'.
	// Thus, z-order in 3D will not work.
	// We have to calc z-order and set "CSS z-index" manually for IE.
	cameraElement.style.WebkitTransformStyle = 'preserve-3d';
	cameraElement.style.MozTransformStyle = 'preserve-3d';
	cameraElement.style.oTransformStyle = 'preserve-3d';
	cameraElement.style.transformStyle = 'preserve-3d';

	domElement.appendChild( cameraElement );

	// Should we replace to feature detection?
	// https://github.com/Modernizr/Modernizr/issues/762
	var isIE = !!document.documentMode;

	this.setClearColor = function () {};

	this.getSize = function() {

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

		cameraElement.style.width = width + 'px';
		cameraElement.style.height = height + 'px';

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < Number.EPSILON ? 0 : value;

	};

	var getCameraCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

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

	};

	var getObjectCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

		return 'matrix3d(' +
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
		') ';

	};

	var getDistanceToSquared = function () {

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();

		return function ( object1, object2 ) {

			a.set(
				object1.matrixWorld.elements[ 12 ],
				object1.matrixWorld.elements[ 13 ],
				object1.matrixWorld.elements[ 14 ]
			);
			b.set(
				object2.matrixWorld.elements[ 12 ],
				object2.matrixWorld.elements[ 13 ],
				object2.matrixWorld.elements[ 14 ]
			);

			return a.distanceToSquared( b );

		}

	}();

	var renderObject = function ( object, camera, parentTransfrom ) {

		var style;

		if ( object instanceof THREE.CSS3DObject ) {

			if ( object instanceof THREE.CSS3DSprite ) {

				// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

				matrix.copy( camera.matrixWorldInverse );
				matrix.transpose();
				matrix.copyPosition( object.matrixWorld );
				matrix.scale( object.scale );

				matrix.elements[ 3 ] = 0;
				matrix.elements[ 7 ] = 0;
				matrix.elements[ 11 ] = 0;
				matrix.elements[ 15 ] = 1;

				style = parentTransfrom + getObjectCSSMatrix( matrix );

			} else {

				style = parentTransfrom + getObjectCSSMatrix( object.matrixWorld );

			}

			var element = object.element;
			var cachedStyle = cache.objects[ object.id ] && cache.objects[ object.id ].style;

			if ( cachedStyle === undefined || cachedStyle !== style ) {
			       
				element.style.WebkitTransform = 'translate3d(-50%,-50%,0) ' + style;
				element.style.MozTransform = 'translate3d(-50%,-50%,0) ' + style;
				element.style.oTransform = 'translate3d(-50%,-50%,0) ' + style;
				element.style.transform = 'translate3d(-50%,-50%,0) ' + style;

				cache.objects[ object.id ] = { style: 'translate3d(-50%,-50%,0) ' + style };
				if ( isIE ) cache.objects[ object.id ].distanceToCameraSquared = getDistanceToSquared( camera, object );

			}

			if ( element.parentNode !== cameraElement ) {

				cameraElement.appendChild( element );

			}

		}

		var parentTransfrom = style || parentTransfrom;

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera, parentTransfrom );

		}

	};

	this.zOrder = function ( scene ) {

		var order = Object.keys( cache.objects ).sort( function ( a, b ) {

			return cache.objects[ a ].distanceToCameraSquared - cache.objects[ b ].distanceToCameraSquared;

		} );
		var zMax = order.length;

		scene.traverse( function ( object ) {

			var index = order.indexOf( object.id + '' );

			if ( index !== -1 ) {

				object.element.style.zIndex = zMax - index;

			}

		} );

	}

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.getEffectiveFOV() * 0.5 ) ) * _height;

		if ( cache.camera.fov !== fov ) {

			domElement.style.WebkitPerspective = fov + 'px';
			domElement.style.MozPerspective = fov + 'px';
			domElement.style.oPerspective = fov + 'px';
			domElement.style.perspective = fov + 'px';

			cache.camera.fov = fov;

		}

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		var style = 'translate3d(' + _widthHalf + 'px,' + _heightHalf + 'px, ' + fov  + 'px) ' + 
		            getCameraCSSMatrix( camera.matrixWorldInverse );

		renderObject( scene, camera, style );

		if ( isIE ) this.zOrder( scene );

	};

};
