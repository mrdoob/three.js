/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SVGRenderer = function () {

	console.log( 'THREE.SVGRenderer', THREE.REVISION );

	var _this = this,
	_renderData, _elements, _lights,
	_projector = new THREE.Projector(),
	_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
	_svgWidth, _svgHeight, _svgWidthHalf, _svgHeightHalf,

	_v1, _v2, _v3, _v4,

	_clipRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color(),
	_ambientLight = new THREE.Color(),
	_directionalLights = new THREE.Color(),
	_pointLights = new THREE.Color(),

	_w, // z-buffer to w-buffer
	_vector3 = new THREE.Vector3(), // Needed for PointLight

	_svgPathPool = [], _svgCirclePool = [], _svgLinePool = [],
	_svgNode, _pathCount, _circleCount, _lineCount,
	_quality = 1;

	this.domElement = _svg;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	}

	this.setQuality = function( quality ) {

		switch(quality) {

			case "high": _quality = 1; break;
			case "low": _quality = 0; break;

		}

	};

	this.setSize = function( width, height ) {

		_svgWidth = width; _svgHeight = height;
		_svgWidthHalf = _svgWidth / 2; _svgHeightHalf = _svgHeight / 2;

		_svg.setAttribute( 'viewBox', ( - _svgWidthHalf ) + ' ' + ( - _svgHeightHalf ) + ' ' + _svgWidth + ' ' + _svgHeight );
		_svg.setAttribute( 'width', _svgWidth );
		_svg.setAttribute( 'height', _svgHeight );

		_clipRect.set( - _svgWidthHalf, - _svgHeightHalf, _svgWidthHalf, _svgHeightHalf );

	};

	this.clear = function () {

		while ( _svg.childNodes.length > 0 ) {

			_svg.removeChild( _svg.childNodes[ 0 ] );

		}

	};

	this.render = function ( scene, camera ) {

		var e, el, element, material;

		this.autoClear && this.clear();

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_renderData = _projector.projectScene( scene, camera, this.sortElements );
		_elements = _renderData.elements;
		_lights = _renderData.lights;

		_pathCount = 0; _circleCount = 0; _lineCount = 0;

		_enableLighting = _lights.length > 0;

		if ( _enableLighting ) {

			 calculateLights( _lights );

		}

		for ( e = 0, el = _elements.length; e < el; e ++ ) {

			element = _elements[ e ];

			material = element.material;
			material = material instanceof THREE.MeshFaceMaterial ? element.faceMaterial : material;

			if ( material === undefined || material.visible === false ) continue;

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				_v1 = element;
				_v1.x *= _svgWidthHalf; _v1.y *= -_svgHeightHalf;

				renderParticle( _v1, element, material, scene );

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect ) ) {

					continue;

				}

				renderLine( _v1, _v2, element, material, scene );

			} else if ( element instanceof THREE.RenderableFace3 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= - _svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= - _svgHeightHalf;
				_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= - _svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect ) ) {

					continue;

				}

				renderFace3( _v1, _v2, _v3, element, material, scene );

			} else if ( element instanceof THREE.RenderableFace4 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3; _v4 = element.v4;

				_v1.positionScreen.x *= _svgWidthHalf; _v1.positionScreen.y *= -_svgHeightHalf;
				_v2.positionScreen.x *= _svgWidthHalf; _v2.positionScreen.y *= -_svgHeightHalf;
				_v3.positionScreen.x *= _svgWidthHalf; _v3.positionScreen.y *= -_svgHeightHalf;
				_v4.positionScreen.x *= _svgWidthHalf; _v4.positionScreen.y *= -_svgHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );
				_bboxRect.addPoint( _v4.positionScreen.x, _v4.positionScreen.y );

				if ( !_clipRect.intersects( _bboxRect) ) {

					continue;

				}

				renderFace4( _v1, _v2, _v3, _v4, element, material, scene );

			}

		}

	};

	function calculateLights( lights ) {

		var l, ll, light, lightColor;

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				_ambientLight.r += lightColor.r;
				_ambientLight.g += lightColor.g;
				_ambientLight.b += lightColor.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				_directionalLights.r += lightColor.r;
				_directionalLights.g += lightColor.g;
				_directionalLights.b += lightColor.b;

			} else if ( light instanceof THREE.PointLight ) {

				_pointLights.r += lightColor.r;
				_pointLights.g += lightColor.g;
				_pointLights.b += lightColor.b;

			}

		}

	}

	function calculateLight( lights, position, normal, color ) {

		var l, ll, light, lightColor, lightPosition, amount;

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				lightPosition = light.matrixWorld.getPosition();

				amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			} else if ( light instanceof THREE.PointLight ) {

				lightPosition = light.matrixWorld.getPosition();

				amount = normal.dot( _vector3.sub( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.r += lightColor.r * amount;
				color.g += lightColor.g * amount;
				color.b += lightColor.b * amount;

			}

		}

	}

	function renderParticle( v1, element, material, scene ) {

		/*
		_svgNode = getCircleNode( _circleCount++ );
		_svgNode.setAttribute( 'cx', v1.x );
		_svgNode.setAttribute( 'cy', v1.y );
		_svgNode.setAttribute( 'r', element.scale.x * _svgWidthHalf );

		if ( material instanceof THREE.ParticleCircleMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r + _directionalLights.r + _pointLights.r;
				_color.g = _ambientLight.g + _directionalLights.g + _pointLights.g;
				_color.b = _ambientLight.b + _directionalLights.b + _pointLights.b;

				_color.r = material.color.r * _color.r;
				_color.g = material.color.g * _color.g;
				_color.b = material.color.b * _color.b;

				_color.updateStyleString();

			} else {

				_color = material.color;

			}

			_svgNode.setAttribute( 'style', 'fill: ' + _color.__styleString );

		}

		_svg.appendChild( _svgNode );
		*/

	}

	function renderLine ( v1, v2, element, material, scene ) {

		_svgNode = getLineNode( _lineCount ++ );

		_svgNode.setAttribute( 'x1', v1.positionScreen.x );
		_svgNode.setAttribute( 'y1', v1.positionScreen.y );
		_svgNode.setAttribute( 'x2', v2.positionScreen.x );
		_svgNode.setAttribute( 'y2', v2.positionScreen.y );

		if ( material instanceof THREE.LineBasicMaterial ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + material.color.getContextStyle() + '; stroke-width: ' + material.linewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.linecap + '; stroke-linejoin: ' + material.linejoin );

			_svg.appendChild( _svgNode );

		}

	}

	function renderFace3( v1, v2, v3, element, material, scene ) {

		_this.info.render.vertices += 3;
		_this.info.render.faces ++;

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1.positionScreen.x + ' ' + v1.positionScreen.y + ' L ' + v2.positionScreen.x + ' ' + v2.positionScreen.y + ' L ' + v3.positionScreen.x + ',' + v3.positionScreen.y + 'z' );

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.copy( material.color );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r;
				_color.g = _ambientLight.g;
				_color.b = _ambientLight.b;

				calculateLight( _lights, element.centroidWorld, element.normalWorld, _color );

				_color.r = Math.max( 0, Math.min( material.color.r * _color.r, 1 ) );
				_color.g = Math.max( 0, Math.min( material.color.g * _color.g, 1 ) );
				_color.b = Math.max( 0, Math.min( material.color.b * _color.b, 1 ) );

			} else {

				_color.copy( material.color );

			}

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear) );
			_color.setRGB( _w, _w, _w );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGB( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ) );

		}

		if ( material.wireframe ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.getContextStyle() + '; stroke-width: ' + material.wireframeLinewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.wireframeLinecap + '; stroke-linejoin: ' + material.wireframeLinejoin );

		} else {

			_svgNode.setAttribute( 'style', 'fill: ' + _color.getContextStyle() + '; fill-opacity: ' + material.opacity );

		}

		_svg.appendChild( _svgNode );

	}

	function renderFace4( v1, v2, v3, v4, element, material, scene ) {

		_this.info.render.vertices += 4;
		_this.info.render.faces ++;

		_svgNode = getPathNode( _pathCount ++ );
		_svgNode.setAttribute( 'd', 'M ' + v1.positionScreen.x + ' ' + v1.positionScreen.y + ' L ' + v2.positionScreen.x + ' ' + v2.positionScreen.y + ' L ' + v3.positionScreen.x + ',' + v3.positionScreen.y + ' L ' + v4.positionScreen.x + ',' + v4.positionScreen.y + 'z' );

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.copy( material.color );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_color.r = _ambientLight.r;
				_color.g = _ambientLight.g;
				_color.b = _ambientLight.b;

				calculateLight( _lights, element.centroidWorld, element.normalWorld, _color );

				_color.r = Math.max( 0, Math.min( material.color.r * _color.r, 1 ) );
				_color.g = Math.max( 0, Math.min( material.color.g * _color.g, 1 ) );
				_color.b = Math.max( 0, Math.min( material.color.b * _color.b, 1 ) );

			} else {

				_color.copy( material.color );

			}

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear) );
			_color.setRGB( _w, _w, _w );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGB( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ) );

		}

		if ( material.wireframe ) {

			_svgNode.setAttribute( 'style', 'fill: none; stroke: ' + _color.getContextStyle() + '; stroke-width: ' + material.wireframeLinewidth + '; stroke-opacity: ' + material.opacity + '; stroke-linecap: ' + material.wireframeLinecap + '; stroke-linejoin: ' + material.wireframeLinejoin );

		} else {

			_svgNode.setAttribute( 'style', 'fill: ' + _color.getContextStyle() + '; fill-opacity: ' + material.opacity );

		}

		_svg.appendChild( _svgNode );

	}

	function getLineNode( id ) {

		if ( _svgLinePool[ id ] == null ) {

			_svgLinePool[ id ] = document.createElementNS( 'http://www.w3.org/2000/svg', 'line' );

			if ( _quality == 0 ) {

				_svgLinePool[ id ].setAttribute( 'shape-rendering', 'crispEdges' ); //optimizeSpeed

			}

			return _svgLinePool[ id ];

		}

		return _svgLinePool[ id ];

	}

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

	function normalToComponent( normal ) {

		var component = ( normal + 1 ) * 0.5;
		return component < 0 ? 0 : ( component > 1 ? 1 : component );

	}

	function pad( str ) {

		while ( str.length < 6 ) str = '0' + str;
		return str;

	}

};
