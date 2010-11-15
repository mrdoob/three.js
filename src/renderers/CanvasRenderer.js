/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	var _renderList = null,
	_projector = new THREE.Projector(),

	_canvas = document.createElement( 'canvas' ),
	_canvasWidth, _canvasHeight, _canvasWidthHalf, _canvasHeightHalf,
	_context = _canvas.getContext( '2d' ),

	_contextGlobalAlpha = 1,
	_contextGlobalCompositeOperation = 0,
	_contextStrokeStyle = '#000000',
	_contextFillStyle = '#000000',
	_contextLineWidth = 1,

	_v1, _v2, _v3, _v4,
	_v5 = new THREE.Vertex(), _v6 = new THREE.Vertex(), // Needed for latter splitting tris to quads

	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color( 0xffffffff ),
	_light = new THREE.Color( 0xffffffff ),
	_ambientLight = new THREE.Color( 0xff000000 ),

	_pi2 = Math.PI * 2,
	_vector3 = new THREE.Vector3(), // Needed for PointLight
	_uv1 = new THREE.UV(), _uv2 = new THREE.UV(), _uv3 = new THREE.UV(), _uv4 = new THREE.UV(),

	_depthMap = document.createElement( 'canvas' ),
	_depthMapContext = _depthMap.getContext( '2d' ),
	_depthMapGradient = _depthMapContext.createLinearGradient( 0, 0, 255, 0);

	_depthMap.width = 255;
	_depthMap.height = 4;

	_depthMapGradient.addColorStop( 0, "white" );
	_depthMapGradient.addColorStop( 1, "black" );

	_depthMapContext.fillStyle = _depthMapGradient;
	_depthMapContext.fillRect( 0, 0, 255, 4 );

	this.domElement = _canvas;
	this.autoClear = true;

	this.setSize = function ( width, height ) {

		_canvasWidth = width;
		_canvasHeight = height;
		_canvasWidthHalf = _canvasWidth / 2;
		_canvasHeightHalf = _canvasHeight / 2;

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		_context.lineJoin = 'round';
		_context.lineCap = 'round';

		_clipRect.set( - _canvasWidthHalf, - _canvasHeightHalf, _canvasWidthHalf, _canvasHeightHalf );

	};

	this.clear = function () {

		if ( !_clearRect.isEmpty() ) {

			_clearRect.inflate( 1 );
			_clearRect.minSelf( _clipRect );

			_context.setTransform( 1, 0, 0, - 1, _canvasWidthHalf, _canvasHeightHalf );
			_context.clearRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );

			_clearRect.empty();

		}
	};

	this.render = function ( scene, camera ) {

		var e, el, element, m, ml, fm, fml, material;

		if ( this.autoClear ) {

			this.clear();

		}

		_renderList = _projector.projectScene( scene, camera );

		_context.setTransform( 1, 0, 0, - 1, _canvasWidthHalf, _canvasHeightHalf );

		/* DEBUG
		_context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		_context.fillRect( _clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight() );
		*/

		_enableLighting = scene.lights.length > 0;

		if ( _enableLighting ) {

			calculateAmbientLight( scene, _ambientLight );

		}

		for ( e = 0, el = _renderList.length; e < el; e++ ) {

			element = _renderList[ e ];

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				_v1 = element;
				_v1.x *= _canvasWidthHalf; _v1.y *= _canvasHeightHalf;

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];
					material && renderParticle( _v1, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				m = 0; ml = element.material.length;

				while ( m < ml ) {

					material = element.material[ m ++ ];
					material && renderLine( _v1, _v2, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableFace3 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;

				if ( element.overdraw ) {

					expand( _v1.positionScreen, _v2.positionScreen );
					expand( _v2.positionScreen, _v3.positionScreen );
					expand( _v3.positionScreen, _v1.positionScreen );

				}

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );

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
							material && renderFace3( _v1, _v2, _v3, element, material, scene );

						}

						continue;

					}

					material && renderFace3( _v1, _v2, _v3, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableFace4 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3; _v4 = element.v4;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;
				_v4.positionScreen.x *= _canvasWidthHalf; _v4.positionScreen.y *= _canvasHeightHalf;

				_v5.positionScreen.copy( _v2.positionScreen );
				_v6.positionScreen.copy( _v4.positionScreen );

				if ( element.overdraw ) {

					expand( _v1.positionScreen, _v2.positionScreen );
					expand( _v2.positionScreen, _v4.positionScreen );
					expand( _v4.positionScreen, _v1.positionScreen );

				}

				if ( element.overdraw ) {

					expand( _v3.positionScreen, _v5.positionScreen );
					expand( _v3.positionScreen, _v6.positionScreen );

				}

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );
				_bboxRect.addPoint( _v4.positionScreen.x, _v4.positionScreen.y );

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
							material && renderFace4( _v1, _v2, _v3, _v4, _v5, _v6, element, material, scene );

						}

						continue;

					}

					material && renderFace4( _v1, _v2, _v3, _v4, _v5, _v6, element, material, scene );

				}

			}

			/*
			_context.lineWidth = 1;
			_context.strokeStyle = 'rgba( 0, 255, 0, 0.5 )';
			_context.strokeRect( _bboxRect.getX(), _bboxRect.getY(), _bboxRect.getWidth(), _bboxRect.getHeight() );
			*/

			_clearRect.addRectangle( _bboxRect );


		}

		/* DEBUG
		_context.lineWidth = 1;
		_context.strokeStyle = 'rgba( 255, 0, 0, 0.5 )';
		_context.strokeRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
		*/

		_context.setTransform( 1, 0, 0, 1, 0, 0 );

	};

	function setBlending( blending ) {

		switch( blending ) {

			case 0: // THREE.NormalBlending
				_context.globalCompositeOperation = "source-over";
				break;
			case 1: // THREE.AdditiveBlending
				_context.globalCompositeOperation = "lighter";
				break;
			case 2: // THREE.SubtractiveBlending
				_context.globalCompositeOperation = "darker";
				break;

		}

		_contextGlobalCompositeOperation = blending;

	}

	function calculateAmbientLight( scene, color ) {

		var l, ll, light, lightColor,
		lights = scene.lights;

		color.setRGBA( 0, 0, 0, 1 );

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				color.r += lightColor.r;
				color.g += lightColor.g;
				color.b += lightColor.b;

			}

		}

	}

	// TODO: This can be done just once

	function calculateLight( scene, element, color ) {

		var l, ll, light, lightColor,
		lights = scene.lights;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				color.r += lightColor.r;
				color.g += lightColor.g;
				color.b += lightColor.b;

			} else if ( light instanceof THREE.PointLight ) {

				color.r += lightColor.r;
				color.g += lightColor.g;
				color.b += lightColor.b;

			}

		}

	}

	function calculateFaceLight( scene, element, color ) {

		var l, ll, light, lightColor, amount
		lights = scene.lights;

		for ( l = 0, ll = lights.length; l < ll; l++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				amount = element.normalWorld.dot( light.position ) * light.intensity;

				if ( amount > 0 ) {

					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				}

			} else if ( light instanceof THREE.PointLight ) {

				_vector3.sub( light.position, element.centroidWorld );
				_vector3.normalize();

				amount = element.normalWorld.dot( _vector3 ) * light.intensity;

				if ( amount > 0 ) {

					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				}

			}

		}

	}

	function renderParticle ( v1, element, material, scene ) {

		var width, height, scaleX, scaleY, offsetX, offsetY,
		bitmap, bitmapWidth, bitmapHeight;

		if ( material.opacity != _contextGlobalAlpha ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material.blending != _contextGlobalCompositeOperation ) {

			setBlending( material.blending );

		}

		if ( material instanceof THREE.ParticleBasicMaterial ) {

			bitmap = material.bitmap;
			bitmapWidth = bitmap.width / 2;
			bitmapHeight = bitmap.height / 2;

			scaleX = element.scale.x * _canvasWidthHalf;
			scaleY = element.scale.y * _canvasHeightHalf;

			width = scaleX * bitmapWidth;
			height = scaleY * bitmapHeight;

			offsetX = material.offset.x * scaleX;
			offsetY = material.offset.y * scaleY;

			// TODO: Rotations break this...

			_bboxRect.set( v1.x + offsetX - width, v1.y + offsetY - height, v1.x + offsetX + width, v1.y + offsetY + height );

			if ( !_clipRect.instersects( _bboxRect ) ) {

				return;

			}

			_context.save();
			_context.translate( v1.x, v1.y );
			_context.rotate( - element.rotation );
			_context.scale( scaleX, - scaleY );
			_context.translate( - bitmapWidth + material.offset.x, - bitmapHeight - material.offset.y );

			_context.drawImage( bitmap, 0, 0 );

			_context.restore();

			/* DEBUG
			_context.beginPath();
			_context.moveTo( v1.x - 10, v1.y );
			_context.lineTo( v1.x + 10, v1.y );
			_context.moveTo( v1.x, v1.y - 10 );
			_context.lineTo( v1.x, v1.y + 10 );
			_context.closePath();
			_context.strokeStyle = 'rgb(255,255,0)';
			_context.stroke();
			*/

		} else if ( material instanceof THREE.ParticleCircleMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color.__styleString = material.color.__styleString;

			}

			width = element.scale.x * _canvasWidthHalf;
			height = element.scale.y * _canvasHeightHalf;

			_bboxRect.set( v1.x - width, v1.y - height, v1.x + width, v1.y + height );

			if ( !_clipRect.instersects( _bboxRect ) ) {

				return;

			}

			_context.save();
			_context.translate( v1.x, v1.y );
			_context.rotate( - element.rotation );
			_context.scale( width, height );

			_context.beginPath();
			_context.arc( 0, 0, 1, 0, _pi2, true );
			_context.closePath();

			_context.fillStyle = _color.__styleString;
			_context.fill();

			_context.restore();

		}

	}

	function renderLine( v1, v2, element, material, scene ) {

		if ( material.opacity != _contextGlobalAlpha ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material.blending != _contextGlobalCompositeOperation ) {

			setBlending( material.blending );

		}

		if ( material instanceof THREE.LineBasicMaterial ) {

			_context.beginPath();
			_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
			_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );
			_context.closePath();

			_color.__styleString = material.color.__styleString;

			if ( _contextLineWidth != material.linewidth ) {

				_context.lineWidth = _contextLineWidth = material.linewidth;

			}

			if ( _contextStrokeStyle != _color.__styleString ) {

				_context.strokeStyle = _contextStrokeStyle  = _color.__styleString;

			}

			_context.stroke();

			_bboxRect.inflate( material.linewidth * 2 );

		}

	}

	function renderFace3( v1, v2, v3, element, material, scene ) {

		var bitmap, bitmapWidth, bitmapHeight;

		if ( material.opacity != _contextGlobalAlpha ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material.blending != _contextGlobalCompositeOperation ) {

			setBlending( material.blending );

		}

		if ( material.map ) {

			bitmap = material.map.image;
			bitmapWidth = bitmap.width - 1;
			bitmapHeight = bitmap.height - 1;

			_uv1.u = element.uvs[ 0 ].u * bitmapWidth; _uv1.v = element.uvs[ 0 ].v * bitmapHeight;
			_uv2.u = element.uvs[ 1 ].u * bitmapWidth; _uv2.v = element.uvs[ 1 ].v * bitmapHeight;
			_uv3.u = element.uvs[ 2 ].u * bitmapWidth; _uv3.v = element.uvs[ 2 ].v * bitmapHeight;

			drawTexturedTriangle( bitmap, v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y, v3.positionScreen.x, v3.positionScreen.y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv3.u, _uv3.v );

			return;

		}

		if ( material instanceof THREE.MeshDepthMaterial ) {

			bitmap = _depthMap;

			_uv1.u = ( material.__2near / (material.__farPlusNear - v1.positionScreen.z * material.__farMinusNear ) ) * 255;
			_uv2.u = ( material.__2near / (material.__farPlusNear - v2.positionScreen.z * material.__farMinusNear ) ) * 255;
			_uv3.u = ( material.__2near / (material.__farPlusNear - v3.positionScreen.z * material.__farMinusNear ) ) * 255;

			_uv1.v = 0; _uv2.v = 1; _uv3.v = 2;

			drawTexturedTriangle( bitmap, v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y, v3.positionScreen.x, v3.positionScreen.y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv3.u, _uv3.v );

			return;

		}

		_context.beginPath();
		_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );
		_context.lineTo( v3.positionScreen.x, v3.positionScreen.y );
		_context.lineTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.closePath();

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.__styleString = material.color.__styleString;

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color.__styleString = material.color.__styleString;

			}

		}/* else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear ) );
			_color.setRGBA( _w, _w, _w, 1 );


		}*/ else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGBA( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ), 1 );

		}

		if ( material.wireframe ) {

			if ( _contextLineWidth != material.wireframe_linewidth ) {

				_context.lineWidth = _contextLineWidth = material.wireframe_linewidth;

			}

			if ( _contextStrokeStyle != _color.__styleString ) {

				_context.strokeStyle = _contextStrokeStyle  = _color.__styleString;

			}

			_context.stroke();

			_bboxRect.inflate( material.wireframe_linewidth * 2 );

		} else {

			if ( _contextFillStyle != _color.__styleString ) {

				_context.fillStyle = _contextFillStyle = _color.__styleString;

			}

			_context.fill();

		}

	}

	function renderFace4( v1, v2, v3, v4, v5, v6, element, material, scene ) {

		var bitmap, bitmapWidth, bitmapHeight;

		if ( material.opacity != _contextGlobalAlpha ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material.blending != _contextGlobalCompositeOperation ) {

			setBlending( material.blending );

		}

		if ( material.map ) {

			bitmap = material.map.image;
			bitmapWidth = bitmap.width - 1;
			bitmapHeight = bitmap.height - 1;

			_uv1.copy( element.uvs[ 0 ] );
			_uv2.copy( element.uvs[ 1 ] );
			_uv3.copy( element.uvs[ 2 ] );
			_uv4.copy( element.uvs[ 3 ] );

			_uv1.u *= bitmapWidth; _uv1.v *= bitmapHeight;
			_uv2.u *= bitmapWidth; _uv2.v *= bitmapHeight;
			_uv3.u *= bitmapWidth; _uv3.v *= bitmapHeight;
			_uv4.u *= bitmapWidth; _uv4.v *= bitmapHeight;

			drawTexturedTriangle( bitmap, v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y, v4.positionScreen.x, v4.positionScreen.y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv4.u, _uv4.v );
			drawTexturedTriangle( bitmap, v5.positionScreen.x, v5.positionScreen.y, v3.positionScreen.x, v3.positionScreen.y, v6.positionScreen.x, v6.positionScreen.y, _uv2.u, _uv2.v, _uv3.u, _uv3.v, _uv4.u, _uv4.v );

			return;

		}

		if ( material instanceof THREE.MeshDepthMaterial ) {

			bitmap = _depthMap;

			_uv1.u = ( material.__2near / (material.__farPlusNear - v1.positionScreen.z * material.__farMinusNear ) ) * 255;
			_uv2.u = ( material.__2near / (material.__farPlusNear - v2.positionScreen.z * material.__farMinusNear ) ) * 255;
			_uv3.u = ( material.__2near / (material.__farPlusNear - v3.positionScreen.z * material.__farMinusNear ) ) * 255;
			_uv4.u = ( material.__2near / (material.__farPlusNear - v4.positionScreen.z * material.__farMinusNear ) ) * 255;

			_uv1.v = 0; _uv2.v = 1; _uv3.v = 2; _uv4.v = 3;

			drawTexturedTriangle( bitmap, v1.positionScreen.x, v1.positionScreen.y, v2.positionScreen.x, v2.positionScreen.y, v4.positionScreen.x, v4.positionScreen.y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv4.u, _uv4.v );
			drawTexturedTriangle( bitmap, v5.positionScreen.x, v5.positionScreen.y, v3.positionScreen.x, v3.positionScreen.y, v6.positionScreen.x, v6.positionScreen.y, _uv2.u, _uv2.v, _uv3.u, _uv3.v, _uv4.u, _uv4.v );

			return;

		}

		_context.beginPath();
		_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );
		_context.lineTo( v3.positionScreen.x, v3.positionScreen.y );
		_context.lineTo( v4.positionScreen.x, v4.positionScreen.y );
		_context.lineTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.closePath();

		if ( material instanceof THREE.MeshBasicMaterial ) {

			_color.__styleString = material.color.__styleString;

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_light.copyRGB( _ambientLight );
				calculateFaceLight( scene, element, _light );

				_color.copyRGBA( material.color );
				_color.multiplySelfRGB( _light );
				_color.updateStyleString();

			} else {

				_color.__styleString = material.color.__styleString;

			}

		}/* else if ( material instanceof THREE.MeshDepthMaterial ) {

			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear ) );
			_color.setRGBA( _w, _w, _w, 1 );


		}*/ else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.setRGBA( normalToComponent( element.normalWorld.x ), normalToComponent( element.normalWorld.y ), normalToComponent( element.normalWorld.z ), 1 );

		}

		if ( material.wireframe ) {

			if ( _contextLineWidth != material.wireframe_linewidth ) {

				_context.lineWidth = _contextLineWidth = material.wireframe_linewidth;

			}

			if ( _contextStrokeStyle != _color.__styleString ) {

				_context.strokeStyle = _contextStrokeStyle  = _color.__styleString;

			}

			_context.stroke();

			_bboxRect.inflate( material.wireframe_linewidth * 2 );

		} else {

			if ( _contextFillStyle != _color.__styleString ) {

				_context.fillStyle = _contextFillStyle = _color.__styleString;

			}

			_context.fill();

		}

	}

	function drawTexturedTriangle( bitmap, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2 ) {

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.closePath();

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		var det = 1 / ( u1 * v2 - u2 * v1 ),

		a = ( v2 * x1 - v1 * x2 ) * det,
		b = ( v2 * y1 - v1 * y2 ) * det,
		c = ( u1 * x2 - u2 * x1 ) * det,
		d = ( u1 * y2 - u2 * y1 ) * det,

		e = x0 - a * u0 - c * v0,
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.clip();
		_context.drawImage( bitmap, 0, 0 );
		_context.restore();
	}

	function normalToComponent( normal ) {

		// https://gist.github.com/665829

		return normal < 0 ? Math.min( ( 1 + normal ) * 0.5, 0.5 ) : 0.5 + Math.min( normal * 0.5, 0.5 );

	}

	// Hide anti-alias gaps

	function expand( v1, v2 ) {

		var x = v2.x - v1.x, y =  v2.y - v1.y,
		unit = 1 / Math.sqrt( x * x + y * y );

		x *= unit; y *= unit;

		v2.x += x; v2.y += y;
		v1.x -= x; v1.y -= y;

	}

};
