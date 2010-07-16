/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	THREE.Renderer.call( this );

	var _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	_width, _height, _widthHalf, _heightHalf,
	_clipRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),
	_svgPathPool = [], _svgCirclePool = [],
	_quality = 1;

	this.domElement = _svg;
	this.autoClear = true;

	this.setQuality = function( quality ) {

		switch(quality) {

			case "high": _quality = 1; break;
			case "low": _quality = 0; break;

		}

	};

	this.setSize = function ( width, height ) {

		_width = width; _height = height;
		_widthHalf = _width / 2; _heightHalf = _height / 2;

		_svg.setAttribute( 'viewBox', ( - _widthHalf ) + ' ' + ( - _heightHalf ) + ' ' + _width + ' ' + _height );
		_svg.setAttribute( 'width', _width );
		_svg.setAttribute( 'height', _height );

		_clipRect.set( - _widthHalf, - _heightHalf, _widthHalf, _heightHalf );

	};

	this.clear = function () {

		while ( _svg.childNodes.length > 0 ) {

			_svg.removeChild( _svg.childNodes[ 0 ] );

		}

	};

	this.render = function ( scene, camera ) {

		var e, el, m, ml, element, material,
		pathCount = 0, circleCount = 0, svgNode,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y,
		size;

		if ( this.autoClear ) {

			this.clear();

		}

		this.project( scene, camera );

		for ( e = 0, el = this.renderList.length; e < el; e++ ) {

			element = this.renderList[ e ];

			for ( m = 0, ml = element.material.length; m < ml; m++ ) {

				material = element.material[ m ];

				_bboxRect.empty();

				if ( element instanceof THREE.RenderableParticle ) {

					v1x = element.x * _widthHalf; v1y = element.y * -_heightHalf;
					size = element.size  * _widthHalf;

					_bboxRect.set( v1x - size, v1y - size, v1x + size, v1y + size );

					if ( !_clipRect.instersects( _bboxRect ) ) {

						continue;

					}

					svgNode = getCircleNode( circleCount++ );
					svgNode.setAttribute( 'cx', v1x );
					svgNode.setAttribute( 'cy', v1y );
					svgNode.setAttribute( 'r', size );

				} else if ( element instanceof THREE.RenderableFace3 ) {

					v1x = element.v1.x * _widthHalf; v1y = element.v1.y * -_heightHalf;
					v2x = element.v2.x * _widthHalf; v2y = element.v2.y * -_heightHalf;
					v3x = element.v3.x * _widthHalf; v3y = element.v3.y * -_heightHalf;

					_bboxRect.addPoint( v1x, v1y );
					_bboxRect.addPoint( v2x, v2y );
					_bboxRect.addPoint( v3x, v3y );

					if ( !_clipRect.instersects( _bboxRect ) ) {

						continue;

					}

					svgNode = getPathNode( pathCount++ );
					svgNode.setAttribute( 'd', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + 'z' );

				} else if ( element instanceof THREE.RenderableFace4 ) {

					v1x = element.v1.x * _widthHalf; v1y = element.v1.y * -_heightHalf;
					v2x = element.v2.x * _widthHalf; v2y = element.v2.y * -_heightHalf;
					v3x = element.v3.x * _widthHalf; v3y = element.v3.y * -_heightHalf;
					v4x = element.v4.x * _widthHalf; v4y = element.v4.y * -_heightHalf;

					_bboxRect.addPoint( v1x, v1y );
					_bboxRect.addPoint( v2x, v2y );
					_bboxRect.addPoint( v3x, v3y );
					_bboxRect.addPoint( v4x, v4y );

					if ( !_clipRect.instersects( _bboxRect) ) {

						continue;

					}

					svgNode = getPathNode( pathCount++ );
					svgNode.setAttribute( 'd', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + ' L ' + v4x + ',' + v4y + 'z' );

				}

				// TODO: Move out of materials loop

				if ( material instanceof THREE.MeshColorFillMaterial ) {

					svgNode.setAttribute( 'style', 'fill: ' + material.color.__styleString );

				} else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {

					svgNode.setAttribute( 'style', 'fill: ' + element.color.__styleString );

				} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

					svgNode.setAttribute( 'style', 'fill: none; stroke: ' + material.color.__styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round' );

				} else if ( material instanceof THREE.MeshFaceColorStrokeMaterial ) {

					svgNode.setAttribute( 'style', 'fill: none; stroke: ' + element.color.__styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round' );

				}

				_svg.appendChild( svgNode );

			}

		}

	};

	function getPathNode( id ) {

		if ( _svgPathPool[ id ] == null ) {

			_svgPathPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

			if ( _quality == 0 ) {

				_svgPathPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgPathPool[ id ];

		}

		return _svgPathPool[ id ];

	}

	function getCircleNode( id ) {

		if ( _svgCirclePool[id] == null ) {

			_svgCirclePool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );

			if ( _quality == 0 ) {

				_svgCirclePool[id].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgCirclePool[ id ];

		}

		return _svgCirclePool[ id ];

	}

};

THREE.SVGRenderer.prototype = new THREE.Renderer();
THREE.SVGRenderer.prototype.constructor = THREE.CanvasRenderer;
