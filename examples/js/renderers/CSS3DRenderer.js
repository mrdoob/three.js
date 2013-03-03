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

THREE.CSS3DRenderer = function (el) {

	console.log( 'THREE.CSS3DRenderer (dk)', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;
	var _projector = new THREE.Projector();
	var _tmpMatrix = new THREE.Matrix4();

	this.init = function(el) {

		// attach to existing element or create a new one
		this.domElement = el || document.createElement( 'div' );

		//this.domElement.style.overflow = 'hidden';
		setStyle( this.domElement, 'perspectiveOrigin', '50% 50% 0');
		setStyle( this.domElement, 'transformOrigin', '50% 50% 0');
		setStyle( this.domElement, 'transformStyle', 'preserve-3d');
	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		this.domElement.style.width = width + 'px';
		this.domElement.style.height = height + 'px';
	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

	};

	// apply prefixed styles to dom element
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
		')';

	}

	this.render = function ( scene, camera ) {

		var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

		setStyle( this.domElement, 'perspective', fov + "px");

		var objects = _projector.projectScene( scene, camera, false ).objects;

		var camera_css_matrix = getCameraCSSMatrix( camera.matrixWorldInverse );

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

				} else {

					_tmpMatrix.copy( object.matrixWorld  );

				}

				var style =
					"translate3d(-50%, -50%, 0)" +
					"translate3d(" + _widthHalf + "px," + _heightHalf + "px, "+fov+"px)" +
					camera_css_matrix +
					getObjectCSSMatrix( _tmpMatrix ) +
					"";

				setStyle(element, 'transform', style);
				setStyle(element, 'transformOrigin', "50% 50% 0");

				var container = this.domElement;
				if ( element.parentNode !== container ) {
					container.appendChild( element );
				}

			}

		}

	};

	this.init(el);



};
