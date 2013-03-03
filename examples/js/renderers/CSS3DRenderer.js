/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.element.style.position = "absolute";

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );

//

THREE.CSS3DRenderer = function () {

	console.log( 'THREE.CSS3DRenderer (dk)', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;
	var _projector = new THREE.Projector();
	var _tmpMatrix = new THREE.Matrix4();

	this.init = function() {

		this.domElement = document.createElement( 'div' );
		this.domElement.style.overflow = 'hidden';

		// TODO: Shouldn't it be possible to remove cameraElement?
		this.cameraElement = document.createElement( 'div' );
		this.domElement.appendChild( this.cameraElement );

		setStyle( this.domElement, 'perspectiveOrigin', '50% 50%');
		setStyle( this.domElement, 'transformStyle', 'preserve-3d');
		setStyle( this.cameraElement, 'transformStyle', 'preserve-3d');

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';

		if ( this.cameraElement ) {
			this.cameraElement.style.width = width + 'px';
			this.cameraElement.style.height = height + 'px';
		}

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

	};

	var setStyle = function ( el, name, value, prefixes ) {
		prefixes = prefixes || ["Webkit","Moz","O","Ms"];
		var n=prefixes.length;
		while(n--) {
			var prefix = prefixes[n];
			el.style[prefix+name.charAt(0 ).toUpperCase()+name.slice(1)] = value;
			el.style[name] = value;
		}
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

	var getSceneMatrix = function ( matrix_world_inverse ) {

		var elements = matrix_world_inverse.elements;
		return new THREE.Matrix4(
			epsilon(  elements[  0 ] ),
			epsilon( -elements[  1 ] ),
			epsilon(  elements[  2 ] ),
			epsilon(  elements[  3 ] ),
			epsilon(  elements[  4 ] ),
			epsilon( -elements[  5 ] ),
			epsilon(  elements[  6 ] ),
			epsilon(  elements[  7 ] ),
			epsilon(  elements[  8 ] ),
			epsilon( -elements[  9 ] ),
			epsilon(  elements[ 10 ] ),
			epsilon(  elements[ 11 ] ),
			epsilon(  elements[ 12 ] ),
			epsilon( -elements[ 13 ] ),
			epsilon(  elements[ 14 ] ),
			epsilon(  elements[ 15 ] )
		);

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

	}

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

		setStyle( this.domElement, 'perspective', fov + "px");

		var viewMatrix = new THREE.Matrix4();

		var objects = _projector.projectScene( scene, camera, false ).objects;

		if( true ) {
			var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) + " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

			setStyle( this.cameraElement, 'transform', style);

//			// Create view matrix by getting computed style and turning the result
//			// back into a new THREE.Matrix4
//			var computedStyle = window.getComputedStyle(this.cameraElement, null);
//			var css_transform = computedStyle.getPropertyValue( '-webkit-transform' ) ||
//								computedStyle.getPropertyValue( '-moz-transform' ) ||
//								computedStyle.getPropertyValue( '-o-transform' ) ||
//								computedStyle.getPropertyValue( '-ms-transform' ) ||
//								computedStyle.getPropertyValue( '-transform' );
//
//			viewMatrix.set.apply( viewMatrix, css_transform.replace('matrix3d(', '' ).replace(')', '' ).split(',' ).map(function(n){return Number(n);}));
//
//			viewMatrix.transpose();

		} else {

			//viewMatrix.copy( camera.matrixWorldInverse );

			viewMatrix = getSceneMatrix( camera.matrixWorldInverse );
			viewMatrix.transpose();
		}

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

					//_tmpMatrix = _tmpMatrix.multiply( viewMatrix );
					//_tmpMatrix.multiplyMatrices(_tmpMatrix, viewMatrix  );

				} else {

					_tmpMatrix.identity();
					_tmpMatrix.multiply( object.matrixWorld );
//
//					_tmpMatrix.translate({x:0, y: 0, z: fov});
//					_tmpMatrix.translate({x:-_widthHalf, y: -_heightHalf, z: 0});
//					_tmpMatrix.multiply( viewMatrix );
//					_tmpMatrix.translate({x:_widthHalf, y: _heightHalf, z: 0});
//					_tmpMatrix.multiply( object.matrixWorld );

				}

				//setStyle(element, 'backfaceVisibility', 'hidden');
				//setStyle(element, 'transformOrigin', '0 0');
				setStyle(element, 'transform', getObjectCSSMatrix( _tmpMatrix ));

				var container = this.cameraElement; //this.domElement;
				if ( element.parentNode !== container ) {

					container.appendChild( element );

				}

			}

		}

	};

	this.init();



};
