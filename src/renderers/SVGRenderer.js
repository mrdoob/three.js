/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	var _renderList = null,
	_projector = new THREE.Projector(),
	_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	_width, _height, _widthHalf, _heightHalf,
	_clipRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color( 0xffffffff ),
	_light = new THREE.Color( 0xffffffff ),
	_ambientLight = new THREE.Color( 0xffffffff ),

	_vector3 = new THREE.Vector3(), // Needed for PointLight

	_svgPathPool = [], _svgCirclePool = [],
	_svgNode, _pathCount, _circleCount,
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

		var e, el, m, ml, fm, fml, element, material,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y;

		if ( this.autoClear ) {

			this.clear();

		}

		_renderList = _projector.projectScene( scene, camera );

		_pathCount = 0; _circleCount = 0;

		_enableLighting = scene.lights.length > 0;

		if ( _enableLighting ) {

			calculateAmbientLight( scene, _ambientLight );

		}

		for ( e = 0, el = _renderList.length; e < el; e++ ) {

			element = _renderList[ e ];

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				v1x = element.x * _widthHalf; v1y = element.y * -_heightHalf;

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];

					renderParticle( v1x, v1y, element, material, scene );

				}

			}/* else if ( element instanceof THREE.RenderableLine ) {

				

			}*/ else if ( element instanceof THREE.RenderableFace3 ) {

				v1x = element.v1.x * _widthHalf; v1y = element.v1.y * -_heightHalf;
				v2x = element.v2.x * _widthHalf; v2y = element.v2.y * -_heightHalf;
				v3x = element.v3.x * _widthHalf; v3y = element.v3.y * -_heightHalf;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );
				_bboxRect.addPoint( v3x, v3y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				m = 0; ml = element.meshMaterial.length;

				while ( m < ml ) {

					material = element.meshMaterial[ m ++ ];

					if ( material instanceof THREE.MeshFaceMaterial ) {

						fm = 0; fml = element.faceMaterial.length;

						while ( fm < fml ) {

							material = element.faceMaterial[ fm ++ ];

							renderFace3( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene );

						}

						continue;

					}

					renderFace3( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene );

				}

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

				m = 0; ml = element.meshMaterial.length;

				while ( m < ml ) {

					material = element.meshMaterial[ m ++ ];

					if ( material instanceof THREE.MeshFaceMaterial ) {

						fm = 0; fml = element.faceMaterial.length;

						while ( fm < fml ) {

							material = element.faceMaterial[ fm ++ ];

							renderFace4( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, element, material, scene );

						}

						continue;

					}

					renderFace4( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, element, material, scene );

				}

			}

		}

	};

	function calculateAmbientLight( scene, color ) {

		var l, ll, light;

		color.setRGBA( 1, 1, 1, 1 );

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.AmbientLight ) {

				color.r *= light.color.r;
				color.g *= light.color.g;
				color.b *= light.color.b;

			}

		}

	}

	function calculateLight( scene, element, color ) {

		var l, ll, light;

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.DirectionalLight ) {

				color.r += light.color.r;
				color.g += light.color.g;
				color.b += light.color.b;

			} else if ( light instanceof THREE.PointLight ) {

				color.r += light.color.r;
				color.g += light.color.g;
				color.b += light.color.b;

			}

		}

	}

	function calculateFaceLight( scene, element, color ) {

		var l, ll, light, amount;

		for ( l = 0, ll = scene.lights.length; l < ll; l++ ) {

			light = scene.lights[ l ];

			if ( light instanceof THREE.DirectionalLight ) {

				amount = element.normalWorld.dot( light.position ) * light.intensity;

				if ( amount > 0 ) {

					color.r += light.color.r * amount;
					color.g += light.color.g * amount;
					color.b += light.color.b * amount;

				}

			} else if ( light instanceof THREE.PointLight ) {

				_vector3.sub( light.position, element.centroidWorld );
				_vector3.normalize();

				amount = element.normalWorld.dot( _vector3 ) * light.intensity;

				if ( amount > 0 ) {

					color.r += light.color.r * amount;
					color.g += light.color.g * amount;
					color.b += light.color.b * amount;

				}

			}

		}

	}

	function renderParticle ( v1x, v1y, element, material, scene ) {

		_svgNode = getCircleNode( _circleCount++ );
		_svgNode.setAttribute( 'cx', v1x );
		_svgNode.setAttribute( 'cy', v1y );
		_svgNode.setAttribute( 'r', element.scale.x * _widthHalf );

		if ( material instanceof THREE.ParticleCircleMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: ' + _color.__styleString );

		}

		_svg.appendChild( _svgNode );

	}
	
	/*
	function renderLine ( ) {
	
		
	
	}
	*/
	
	function renderFace3 ( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene ) {

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + 'z' );

		if ( material instanceof THREE.MeshColorFillMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: ' + _color.__styleString );

		} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.__styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round' );

		}

		_svg.appendChild( _svgNode );

	}

	function renderFace4 ( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, element, material, scene ) {

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1x + ' ' + v1y + ' L ' + v2x + ' ' + v2y + ' L ' + v3x + ',' + v3y + ' L ' + v4x + ',' + v4y + 'z' );

		if ( material instanceof THREE.MeshColorFillMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: ' + _color.__styleString );

		} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.__styleString + '; stroke-width: ' + material.lineWidth + '; stroke-linecap: round; stroke-linejoin: round' );

		}

		_svg.appendChild( _svgNode );

	}

	function getPathNode ( id ) {

		if ( _svgPathPool[ id ] == null ) {

			_svgPathPool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

			if ( _quality == 0 ) {

				_svgPathPool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgPathPool[ id ];

		}

		return _svgPathPool[ id ];

	}

	function getCircleNode ( id ) {

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
