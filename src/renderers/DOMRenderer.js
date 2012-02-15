/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.DOMRenderer = function () {

	var _renderData, _elements,
	_projector = new THREE.Projector(),
	_width, _height, _widthHalf, _heightHalf;

	this.domElement = document.createElement( 'div' );

	this.setSize = function ( width, height ) {

		_width = width; _height = height;
		_widthHalf = _width / 2; _heightHalf = _height / 2;

	};

	this.render = function ( scene, camera ) {

		var e, el, m, ml, element, material, dom, v1x, v1y;

		_renderData = _projector.projectScene( scene, camera );
		_elements = _renderData.elements;

		for ( e = 0, el = _elements.length; e < el; e ++ ) {

			element = _elements[ e ];

			if ( element instanceof THREE.RenderableParticle ) {

				v1x = element.x * _widthHalf + _widthHalf; v1y = element.y * _heightHalf + _heightHalf;

				material = element.material;

				if ( material instanceof THREE.ParticleDOMMaterial ) {

					dom = material.domElement;
					dom.style.left = v1x + 'px';
					dom.style.top = v1y + 'px';

				}

			}

		}

	};

}
