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
	_contextStrokeStyle = '#000000',
	_contextFillStyle = '#000000',
	_contextLineWidth = 1,

	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color( 0xffffffff ),
	_light = new THREE.Color( 0xffffffff ),
	_ambientLight = new THREE.Color( 0xff000000 ),

	_pi2 = Math.PI * 2,
	_vector2 = new THREE.Vector2(), // Needed for expand
	_vector3 = new THREE.Vector3(), // Needed for PointLight
	_uv1 = new THREE.UV(), _uv2 = new THREE.UV(), _uv3 = new THREE.UV(), _uv4 = new THREE.UV(),
	v5 = new THREE.Vector2(), v6 = new THREE.Vector2(); // Needed for latter splitting tris to quads

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

		var e, el, element, m, ml, fm, fml, material,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y;

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

				v1x = element.x * _canvasWidthHalf; v1y = element.y * _canvasHeightHalf;

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];
					material && renderParticle( v1x, v1y, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableLine ) {

				v1x = element.v1.x * _canvasWidthHalf; v1y = element.v1.y * _canvasHeightHalf;
				v2x = element.v2.x * _canvasWidthHalf; v2y = element.v2.y * _canvasHeightHalf;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				m = 0; ml = element.material.length;

				while ( m < ml ) {

					material = element.material[ m ++ ];
					material && renderLine( v1x, v1y, v2x, v2y, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableFace3 ) {

				element.v1.x *= _canvasWidthHalf; element.v1.y *= _canvasHeightHalf;
				element.v2.x *= _canvasWidthHalf; element.v2.y *= _canvasHeightHalf;
				element.v3.x *= _canvasWidthHalf; element.v3.y *= _canvasHeightHalf;

				if ( element.overdraw ) {

					expand( element.v1, element.v2 );
					expand( element.v2, element.v3 );
					expand( element.v3, element.v1 );

				}

				v1x = element.v1.x; v1y = element.v1.y;
				v2x = element.v2.x; v2y = element.v2.y;
				v3x = element.v3.x; v3y = element.v3.y;

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
							material && renderFace3( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene );

						}

						continue;

					}

					renderFace3( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene );

				}

			} else if ( element instanceof THREE.RenderableFace4 ) {

				element.v1.x *= _canvasWidthHalf; element.v1.y *= _canvasHeightHalf;
				element.v2.x *= _canvasWidthHalf; element.v2.y *= _canvasHeightHalf;
				element.v3.x *= _canvasWidthHalf; element.v3.y *= _canvasHeightHalf;
				element.v4.x *= _canvasWidthHalf; element.v4.y *= _canvasHeightHalf;

				v5.copy( element.v2 ); v6.copy( element.v4 );

				if ( element.overdraw ) {

					expand( element.v1, element.v2 );
					expand( element.v2, element.v4 );
					expand( element.v4, element.v1 );

				}

				v1x = element.v1.x; v1y = element.v1.y;
				v2x = element.v2.x; v2y = element.v2.y;
				v4x = element.v4.x; v4y = element.v4.y;

				if ( element.overdraw ) {

					expand( element.v3, v5 );
					expand( element.v3, v6 );

				}

				v3x = element.v3.x; v3y = element.v3.y;
				v5x = v5.x; v5y = v5.y;
				v6x = v6.x; v6y = v6.y;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );
				_bboxRect.addPoint( v3x, v3y );
				_bboxRect.addPoint( v4x, v4y );

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
							material && renderFace4( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y, element, material, scene );

						}

						continue;

					}

					renderFace4( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y, element, material, scene );

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

	function renderParticle ( v1x, v1y, element, material, scene ) {

		var width, height, scaleX, scaleY, offsetX, offsetY,
		bitmap, bitmapWidth, bitmapHeight;

		if ( _contextGlobalAlpha != material.opacity ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

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

			_bboxRect.set( v1x + offsetX - width, v1y + offsetY - height, v1x + offsetX + width, v1y + offsetY + height );

			if ( !_clipRect.instersects( _bboxRect ) ) {

				return;

			}

			_context.save();
			_context.translate( v1x, v1y );
			_context.rotate( - element.rotation );
			_context.scale( scaleX, - scaleY );
			_context.translate( - bitmapWidth + material.offset.x, - bitmapHeight - material.offset.y );

			_context.drawImage( bitmap, 0, 0 );

			_context.restore();

			/* DEBUG
			_context.beginPath();
			_context.moveTo( v1x - 10, v1y );
			_context.lineTo( v1x + 10, v1y );
			_context.moveTo( v1x, v1y - 10 );
			_context.lineTo( v1x, v1y + 10 );
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

			_bboxRect.set( v1x - width, v1y - height, v1x + width, v1y + height );

			if ( !_clipRect.instersects( _bboxRect ) ) {

				return;

			}

			_context.save();
			_context.translate( v1x, v1y );
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

	function renderLine( v1x, v1y, v2x, v2y, element, material, scene ) {

		if ( _contextGlobalAlpha != material.opacity ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material instanceof THREE.LineBasicMaterial ) {

			_context.beginPath();
			_context.moveTo( v1x, v1y );
			_context.lineTo( v2x, v2y );
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

	function renderFace3( v1x, v1y, v2x, v2y, v3x, v3y, element, material, scene ) {

		var bitmap, bitmapWidth, bitmapHeight;

		if ( _contextGlobalAlpha != material.opacity ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

		}

		if ( material.map ) {

			bitmap = material.map.image;
			bitmapWidth = bitmap.width - 1;
			bitmapHeight = bitmap.height - 1;

			_uv1.copy( element.uvs[ 0 ] );
			_uv2.copy( element.uvs[ 1 ] );
			_uv3.copy( element.uvs[ 2 ] );

			_uv1.u *= bitmapWidth; _uv1.v *= bitmapHeight;
			_uv2.u *= bitmapWidth; _uv2.v *= bitmapHeight;
			_uv3.u *= bitmapWidth; _uv3.v *= bitmapHeight;

			drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv3.u, _uv3.v );

			return;

		}

		_context.beginPath();
		_context.moveTo( v1x, v1y );
		_context.lineTo( v2x, v2y );
		_context.lineTo( v3x, v3y );
		_context.lineTo( v1x, v1y );
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

	function renderFace4 ( v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y, element, material, scene ) {

		var bitmap, bitmapWidth, bitmapHeight;

		if ( _contextGlobalAlpha != material.opacity ) {

			_context.globalAlpha = _contextGlobalAlpha = material.opacity;

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

			drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v4x, v4y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv4.u, _uv4.v );
			drawTexturedTriangle( bitmap, v5x, v5y, v3x, v3y, v6x, v6y, _uv2.u, _uv2.v, _uv3.u, _uv3.v, _uv4.u, _uv4.v );

			return;

		}

		_context.beginPath();
		_context.moveTo( v1x, v1y );
		_context.lineTo( v2x, v2y );
		_context.lineTo( v3x, v3y );
		_context.lineTo( v4x, v4y );
		_context.lineTo( v1x, v1y );
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

	function drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, _uv1u, _uv1v, _uv2u, _uv2v, _uv3u, _uv3v ) {

		// Textured triangle drawing by Thatcher Ulrich.
		// http://tulrich.com/geekstuff/canvas/jsgl.js

		var denom, m11, m12, m21, m22, dx, dy;

		_context.beginPath();
		_context.moveTo( v1x, v1y );
		_context.lineTo( v2x, v2y );
		_context.lineTo( v3x, v3y );
		_context.lineTo( v1x, v1y );
		_context.closePath();

		_context.save();
		_context.clip();

		denom = _uv1u * ( _uv3v - _uv2v ) - _uv2u * _uv3v + _uv3u * _uv2v + ( _uv2u - _uv3u ) * _uv1v;

		m11 = - ( _uv1v * (v3x - v2x ) - _uv2v * v3x + _uv3v * v2x + ( _uv2v - _uv3v ) * v1x ) / denom;
		m12 = ( _uv2v * v3y + _uv1v * ( v2y - v3y ) - _uv3v * v2y + ( _uv3v - _uv2v) * v1y ) / denom;
		m21 = ( _uv1u * ( v3x - v2x ) - _uv2u * v3x + _uv3u * v2x + ( _uv2u - _uv3u ) * v1x ) / denom;
		m22 = - ( _uv2u * v3y + _uv1u * ( v2y - v3y ) - _uv3u * v2y + ( _uv3u - _uv2u ) * v1y ) / denom;
		dx = ( _uv1u * ( _uv3v * v2x - _uv2v * v3x ) + _uv1v * ( _uv2u * v3x - _uv3u * v2x ) + ( _uv3u * _uv2v - _uv2u * _uv3v ) * v1x ) / denom;
		dy = ( _uv1u * ( _uv3v * v2y - _uv2v * v3y ) + _uv1v * ( _uv2u * v3y - _uv3u * v2y ) + ( _uv3u * _uv2v - _uv2u * _uv3v ) * v1y ) / denom;

		_context.transform( m11, m12, m21, m22, dx, dy );

		_context.drawImage( bitmap, 0, 0 );
		_context.restore();

	}

	// Hide anti-alias gaps

	function expand( a, b ) {

		_vector2.sub( b, a );
		_vector2.unit();
		_vector2.multiplyScalar( 0.75 );

		b.addSelf( _vector2 );
		a.subSelf( _vector2 );

	}

};
