/**
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

	var _stereo = new THREE.StereoCamera();
	_stereo.aspect = 0.5;

	var _cameraL, _cameraR;

	var _width, _height;
	var _widthHalf, _heightHalf;

	var matrix = new THREE.Matrix4();

	this.separation = 6;
	this.targetDistance = 500;

	//

	var domElement = document.createElement( 'div' );

	this.domElement = domElement;

	//

	var domElementL = document.createElement( 'div' );
	domElementL.style.display = 'inline-block';
	domElementL.style.overflow = 'hidden';

	domElementL.style.WebkitTransformStyle = 'preserve-3d';
	domElementL.style.MozTransformStyle = 'preserve-3d';
	domElementL.style.oTransformStyle = 'preserve-3d';
	domElementL.style.transformStyle = 'preserve-3d';

	domElement.appendChild( domElementL );

	var cameraElementL = document.createElement( 'div' );

	cameraElementL.style.WebkitTransformStyle = 'preserve-3d';
	cameraElementL.style.MozTransformStyle = 'preserve-3d';
	cameraElementL.style.oTransformStyle = 'preserve-3d';
	cameraElementL.style.transformStyle = 'preserve-3d';

	domElementL.appendChild( cameraElementL );

	//

	var domElementR = document.createElement( 'div' );
	domElementR.style.display = 'inline-block';
	domElementR.style.overflow = 'hidden';

	domElementR.style.WebkitTransformStyle = 'preserve-3d';
	domElementR.style.MozTransformStyle = 'preserve-3d';
	domElementR.style.oTransformStyle = 'preserve-3d';
	domElementR.style.transformStyle = 'preserve-3d';

	domElement.appendChild( domElementR );

	var cameraElementR = document.createElement( 'div' );

	cameraElementR.style.WebkitTransformStyle = 'preserve-3d';
	cameraElementR.style.MozTransformStyle = 'preserve-3d';
	cameraElementR.style.oTransformStyle = 'preserve-3d';
	cameraElementR.style.transformStyle = 'preserve-3d';

	domElementR.appendChild( cameraElementR );

	this.setClearColor = function () {

	};

	this.setSize = function ( width, height ) {

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

		_width = width / 2;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElementL.style.width = _width + 'px';
		domElementL.style.height = _height + 'px';

		cameraElementL.style.width = _width + 'px';
		cameraElementL.style.height = _height + 'px';

		domElementR.style.width = _width + 'px';
		domElementR.style.height = _height + 'px';

		cameraElementR.style.width = _width + 'px';
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

	var renderObject = function ( object, camera, cameraElement, side ) {

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

			var element = object[ 'element' + side ];

			element.style.WebkitTransform = style;
			element.style.MozTransform = style;
			element.style.oTransform = style;
			element.style.transform = style;

			if ( element.parentNode !== cameraElement ) {

				cameraElement.appendChild( element );

			}

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera, cameraElement, side );

		}

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		_stereo.update( camera );

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

		// Left

		_cameraL = _stereo.cameraL;

		domElementL.style.WebkitPerspective = fov + "px";
		domElementL.style.MozPerspective = fov + "px";
		domElementL.style.oPerspective = fov + "px";
		domElementL.style.perspective = fov + "px";

		_cameraL.matrixWorldInverse.getInverse( _cameraL.matrixWorld );

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( _cameraL.matrixWorldInverse ) +
			" translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

		cameraElementL.style.WebkitTransform = style;
		cameraElementL.style.MozTransform = style;
		cameraElementL.style.oTransform = style;
		cameraElementL.style.transform = style;

		renderObject( scene, _cameraL, cameraElementL, 'L' );

		// Right

		_cameraR = _stereo.cameraR;

		domElementR.style.WebkitPerspective = fov + "px";
		domElementR.style.MozPerspective = fov + "px";
		domElementR.style.oPerspective = fov + "px";
		domElementR.style.perspective = fov + "px";

		_cameraR.matrixWorldInverse.getInverse( _cameraR.matrixWorld );

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( _cameraR.matrixWorldInverse ) +
			" translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

		cameraElementR.style.WebkitTransform = style;
		cameraElementR.style.MozTransform = style;
		cameraElementR.style.oTransform = style;
		cameraElementR.style.transform = style;

		renderObject( scene, _cameraR, cameraElementR, 'R' );

	};

};
