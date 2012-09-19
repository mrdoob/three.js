/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DOMRenderer = function () {

	console.log( 'THREE.DOMRenderer', THREE.REVISION );

	var _renderData, _elements,
	_width, _height, _widthHalf, _heightHalf, _transformProp,
	_projector = new THREE.Projector();

	var getSupportedProp = function ( proparray ) {

		var root = document.documentElement

		for ( var i = 0; i < proparray.length; i ++ ) {

			if ( typeof root.style[ proparray[ i ] ] === "string" ) {

				return proparray[i];

			}

		}

		return null;

	};

	_transformProp = getSupportedProp( [ 'transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform' ] );

	this.domElement = document.createElement( 'div' );

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

	};

	this.render = function ( scene, camera ) {

		var e, el, m, ml, element, material, dom, v1x, v1y;

		_renderData = _projector.projectScene( scene, camera );
		_elements = _renderData.elements;

		for ( e = 0, el = _elements.length; e < el; e ++ ) {

			element = _elements[ e ];

			if ( element instanceof THREE.RenderableParticle && element.material instanceof THREE.ParticleDOMMaterial ) {

				dom = element.material.domElement;

				v1x = element.x * _widthHalf + _widthHalf - ( dom.offsetWidth >> 1 );
				v1y = element.y * _heightHalf + _heightHalf - ( dom.offsetHeight >> 1 );

				dom.style.left = v1x + 'px';
				dom.style.top = v1y + 'px';
				dom.style.zIndex = Math.abs( Math.floor( ( 1 - element.z ) * camera.far / camera.near ) )

				if ( _transformProp ) {

					var scaleX = element.scale.x * _widthHalf;
					var scaleY = element.scale.y * _heightHalf;
					var scaleVal = "scale(" + scaleX + "," + scaleY + ")";

					dom.style[ _transformProp ] = scaleVal;

				}

			}

		}

	};

};
