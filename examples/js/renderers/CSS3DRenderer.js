/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = "absolute";
	this.element.style.WebkitTransformStyle = 'preserve-3d';
	this.element.style.MozTransformStyle = 'preserve-3d';
	this.element.style.oTransformStyle = 'preserve-3d';
	this.element.style.transformStyle = 'preserve-3d';

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );

//

THREE.CSS3DRenderer = function () {

	console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;
	var _projector = new THREE.Projector();

	var _tmpMatrix = new THREE.Matrix4();

	this.domElement = document.createElement( 'div' );

	this.domElement.style.overflow = 'hidden';

	this.domElement.style.WebkitTransformStyle = 'preserve-3d';
	this.domElement.style.WebkitPerspectiveOrigin = '50% 50%';

	this.domElement.style.MozTransformStyle = 'preserve-3d';
	this.domElement.style.MozPerspectiveOrigin = '50% 50%';

	this.domElement.style.oTransformStyle = 'preserve-3d';
	this.domElement.style.oPerspectiveOrigin = '50% 50%';

	this.domElement.style.transformStyle = 'preserve-3d';
	this.domElement.style.perspectiveOrigin = '50% 50%';

	// TODO: Shouldn't it be possible to remove cameraElement?

	this.cameraElement = document.createElement( 'div' );

	this.cameraElement.style.WebkitTransformStyle = 'preserve-3d';
	this.cameraElement.style.MozTransformStyle = 'preserve-3d';
	this.cameraElement.style.oTransformStyle = 'preserve-3d';
	this.cameraElement.style.transformStyle = 'preserve-3d';

	this.domElement.appendChild( this.cameraElement );

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';

		this.cameraElement.style.width = width + 'px';
		this.cameraElement.style.height = height + 'px';

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

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

	}

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

	}

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

		this.domElement.style.WebkitPerspective = fov + "px";
		this.domElement.style.MozPerspective = fov + "px";
		this.domElement.style.oPerspective = fov + "px";
		this.domElement.style.perspective = fov + "px";

		var objects = _projector.projectScene( scene, camera, false ).objects;

		var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

		this.cameraElement.style.WebkitTransform = style;
		this.cameraElement.style.MozTransform = style;
		this.cameraElement.style.oTransform = style;
		this.cameraElement.style.transform = style;

		for ( var i = 0, il = objects.length; i < il; i ++ ) {

			var object = objects[ i ].object;

			if ( object instanceof THREE.CSS3DObject ) {

				var element = object.element;

				if ( object instanceof THREE.CSS3DSprite ) {

					// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

					_tmpMatrix.copy( camera.matrixWorldInverse );
					_tmpMatrix.transpose();
					_tmpMatrix.extractPosition( object.matrixWorld );
					_tmpMatrix.scale( object.scale );

					_tmpMatrix.elements[ 3 ] = 0;
					_tmpMatrix.elements[ 7 ] = 0;
					_tmpMatrix.elements[ 11 ] = 0;
					_tmpMatrix.elements[ 15 ] = 1;

					style = getObjectCSSMatrix( _tmpMatrix );

				} else {

					style = getObjectCSSMatrix( object.matrixWorld );

				}

				/*
				element.style.WebkitBackfaceVisibility = 'hidden';
				element.style.MozBackfaceVisibility = 'hidden';
				element.style.oBackfaceVisibility = 'hidden';
				element.style.backfaceVisibility = 'hidden';
				*/

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				if ( element.parentNode !== this.cameraElement ) {

					this.cameraElement.appendChild( element );

				}

			}

		}

	};

};
