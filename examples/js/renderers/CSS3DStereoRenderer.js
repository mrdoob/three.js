/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.elementL = element.cloneNode( true );
	this.elementL.style.position = 'absolute';

	this.elementR = element.cloneNode( true );
	this.elementR.style.position = 'absolute';

	this.addEventListener( 'removed', function ( event ) {

		if ( this.elementL.parentNode !== null ) {

			this.elementL.parentNode.removeChild( this.elementL );

		}

		if ( this.elementR.parentNode !== null ) {

			this.elementR.parentNode.removeChild( this.elementR );

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

THREE.CSS3DStereoRenderer = function () {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;

	var matrix = new THREE.Matrix4();

	var cache = {
		camera: { fov: 0, style: '' },
		objects: {}
	};

	// Container
	var domElement = document.createElement( 'div' );
	domElement.className = 'base';
	domElement.style.position = 'absolute';
	domElement.style.overflow = 'hidden';

	domElement.style.WebkitTransformStyle = 'preserve-3d';
	domElement.style.MozTransformStyle = 'preserve-3d';
	domElement.style.oTransformStyle = 'preserve-3d';
	domElement.style.transformStyle = 'preserve-3d';

	this.domElement = domElement;

	// Left panel
	var domElementL = domElement.cloneNode(true);
	domElementL.className = 'left';
	this.domElement.appendChild( domElementL );

	// Right panel
	var domElementR = domElement.cloneNode(true);
	domElementR.className = 'right';
	this.domElement.appendChild( domElementR );

	// Camera
	var cameraElement = document.createElement( 'div' );
	cameraElement.style.WebkitTransformStyle = 'preserve-3d';
	cameraElement.style.MozTransformStyle = 'preserve-3d';
	cameraElement.style.oTransformStyle = 'preserve-3d';
	cameraElement.style.transformStyle = 'preserve-3d';

	// Left
	var cameraElementL = cameraElement.cloneNode(true);
	cameraElementL.className = 'left';
	domElementL.appendChild( cameraElementL );

	// Right
	var cameraElementR = cameraElement.cloneNode(true);
	cameraElementR.className = 'right';
	domElementR.appendChild( cameraElementR );

	this.setClearColor = function () {};

	this.getSize = function() {

		return {
			width: _width,
			height: _height
		};

	};

	this.setScissorTest = function () {};
	this.setScissor = function () {};

	this.setViewport = function ( x, y, width, height ) {

		domElementR.style.left = width + 'px';

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = _width + 'px';
		domElement.style.height = _height + 'px';

		domElementL.style.width = _widthHalf + 'px';
		domElementL.style.height = _height + 'px';

		domElementR.style.width = _widthHalf + 'px';
		domElementR.style.height = _height + 'px';

		cameraElement.style.width = _width + 'px';
		cameraElement.style.height = _height + 'px';

		cameraElementL.style.width = _widthHalf + 'px';
		cameraElementL.style.height = _height + 'px';

		cameraElementR.style.width = _widthHalf + 'px';
		cameraElementR.style.height = _height + 'px';

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

		return 'translate3d(-50%,-50%,0) matrix3d(' +
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

	};

	var switchElement = function (camera) {
		var currentElement;

		switch (camera.name) {
			case "L":
				currentElement = domElementL;
				break;

			case "R":
				currentElement = domElementR;
				break;

			default:
				currentElement = domElement;
				break;
		}

		return currentElement;
	};

	var switchCamera = function (camera) {
		var currentCamera;

		switch (camera.name) {
			case "L":
				currentCamera = cameraElementL;
				break;

			case "R":
				currentCamera = cameraElementR;
				break;

			default:
				currentCamera = cameraElement;
				break;
		}

		return currentCamera;
	};

	var renderObject = function ( object, camera ) {

		if ( object instanceof THREE.CSS3DObject ) {

			var style;

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

				style = getObjectCSSMatrix( matrix );

			} else {

				style = getObjectCSSMatrix( object.matrixWorld );

			}

			var element = object[ 'element' + camera.name ];
			var cachedStyle = cache.objects[ object.id ];

			// @todo re-enable cache (per side)
			//if ( cachedStyle === undefined || cachedStyle !== style ) {

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				cache.objects[ object.id ] = style;

			//}

			var currentCamera = switchCamera(camera);
			if ( element.parentNode !== currentCamera ) {

				currentCamera.appendChild( element );

			}

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera );

		}

	};

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.getEffectiveFOV() * 0.5 ) ) * _height;

		var currentElement = switchElement(camera);
		var currentCamera = switchCamera(camera);

		cache.camera.fov = null;// @todo cache per element
		if ( cache.camera.fov !== fov ) {
			currentElement.style.WebkitPerspective = fov + "px";
			currentElement.style.MozPerspective = fov + "px";
			currentElement.style.oPerspective = fov + "px";
			currentElement.style.perspective = fov + "px";

			cache.camera.fov = fov;

		}

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

		cache.camera.style = null;// @todo cache per camera
		if ( cache.camera.style !== style ) {

			currentCamera.style.WebkitTransform = style;
			currentCamera.style.MozTransform = style;
			currentCamera.style.oTransform = style;
			currentCamera.style.transform = style;

			cache.camera.style = style;

		}

		renderObject( scene, camera );

	};

};
