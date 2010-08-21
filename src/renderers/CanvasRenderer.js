/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	THREE.Renderer.call( this );

	var _canvas = document.createElement( 'canvas' ),
	_context = _canvas.getContext( '2d' ),
	_width, _height, _widthHalf, _heightHalf,
	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),
	_vector2 = new THREE.Vector2(),

	v5 = new THREE.Vector2(), v6 = new THREE.Vector2(),
	uv1 = new THREE.UV(), uv2 = new THREE.UV(), uv3 = new THREE.UV(), uv4 = new THREE.UV();

	this.domElement = _canvas;
	this.autoClear = true;

	this.setSize = function ( width, height ) {

		_width = width; _height = height;
		_widthHalf = _width / 2; _heightHalf = _height / 2;

		_canvas.width = _width;
		_canvas.height = _height;

		_clipRect.set( - _widthHalf, - _heightHalf, _widthHalf, _heightHalf );

	};

	this.clear = function () {

		if ( !_clearRect.isEmpty() ) {

			_clearRect.inflate( 1 );
			_clearRect.minSelf( _clipRect );

			/*
			_context.setTransform( 1, 0, 0, - 1, _widthHalf, _heightHalf );
			_context.clearRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
			*/

			// Opera workaround
			_context.setTransform( 1, 0, 0, 1, _widthHalf, _heightHalf );
			_context.clearRect( _clearRect.getX(), - ( _clearRect.getHeight() + _clearRect.getY() ), _clearRect.getWidth(), _clearRect.getHeight() );

			_clearRect.empty();

		}
	};

	this.render = function ( scene, camera ) {

		var e, el, m, ml, element, material, pi2 = Math.PI * 2,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, v5x, v5y, v6x, v6y,
		width, height, scaleX, scaleY, offsetX, offsetY,
		bitmap, bitmapWidth, bitmapHeight;

		this.project( scene, camera );

		if ( this.autoClear ) {

			this.clear();

		}

		_context.setTransform( 1, 0, 0, - 1, _widthHalf, _heightHalf );

		/* DEBUG
		_context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		_context.fillRect( _clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight() );
		*/

		for ( e = 0, el = this.renderList.length; e < el; e++ ) {

			element = this.renderList[ e ];

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				v1x = element.x * _widthHalf; v1y = element.y * _heightHalf;

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];

					if ( material instanceof THREE.ParticleCircleMaterial ) {

						width = element.scale.x * _widthHalf;
						height = element.scale.y * _heightHalf;

						_bboxRect.set( v1x - width, v1y - height, v1x + width, v1y + height );

						if ( !_clipRect.instersects( _bboxRect ) ) {

							continue;

						}

						_context.save();
						_context.translate( v1x, v1y );
						_context.rotate( - element.rotation );
						_context.scale( width, height );

						_context.beginPath();
						_context.arc( 0, 0, 1, 0, pi2, true );
						_context.closePath();

						_context.fillStyle = material.color.__styleString;
						_context.fill();

						_context.restore();

					} else if ( material instanceof THREE.ParticleBitmapMaterial ) {

						bitmap = material.bitmap;
						bitmapWidth = bitmap.width / 2;
						bitmapHeight = bitmap.height / 2;

						scaleX = element.scale.x * _widthHalf;
						scaleY = element.scale.y * _heightHalf;

						width = scaleX * bitmapWidth;
						height = scaleY * bitmapHeight;

						offsetX = material.offset.x * scaleX;
						offsetY = material.offset.y * scaleY;

						// TODO: Rotations break this...

						_bboxRect.set( v1x + offsetX - width, v1y + offsetY - height, v1x + offsetX + width, v1y + offsetY + height );

						if ( !_clipRect.instersects( _bboxRect ) ) {

							continue;

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

					}

				}

			} else if ( element instanceof THREE.RenderableLine ) {

				v1x = element.v1.x * _widthHalf; v1y = element.v1.y * _heightHalf;
				v2x = element.v2.x * _widthHalf; v2y = element.v2.y * _heightHalf;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				_context.beginPath();
				_context.moveTo( v1x, v1y );
				_context.lineTo( v2x, v2y );
				_context.closePath();

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];

					if ( material instanceof THREE.LineColorMaterial ) {

						_context.lineWidth = material.lineWidth;
						_context.lineJoin = "round";
						_context.lineCap = "round";

						_context.strokeStyle = material.color.__styleString;
						_context.stroke();

						_bboxRect.inflate( _context.lineWidth );

					}

				}

			} else if ( element instanceof THREE.RenderableFace3 ) {

				element.v1.x *= _widthHalf; element.v1.y *= _heightHalf;
				element.v2.x *= _widthHalf; element.v2.y *= _heightHalf;
				element.v3.x *= _widthHalf; element.v3.y *= _heightHalf;

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

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];

					if ( material instanceof THREE.MeshColorFillMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.fillStyle = material.color.__styleString;
						_context.fill();

					} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.lineWidth = material.lineWidth;
						_context.lineJoin = "round";
						_context.lineCap = "round";

						_context.strokeStyle = material.color.__styleString;
						_context.stroke();

						_bboxRect.inflate( _context.lineWidth );

					} else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.fillStyle = element.color.__styleString;
						_context.fill();

					} else if ( material instanceof THREE.MeshFaceColorStrokeMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.lineWidth = material.lineWidth;
						_context.lineJoin = "round";
						_context.lineCap = "round";

						_context.strokeStyle = element.color.__styleString;
						_context.stroke();

						_bboxRect.inflate( _context.lineWidth );


					} else if ( material instanceof THREE.MeshBitmapUVMappingMaterial ) {

						bitmap = material.bitmap;
						bitmapWidth = bitmap.width - 1;
						bitmapHeight = bitmap.height - 1;

						/* DEBUG
						if ( !element.uvs[ 0 ] || !element.uvs[ 1 ] || !element.uvs[ 2 ]) {

							_context.beginPath();
							_context.moveTo( v1x, v1y );
							_context.lineTo( v2x, v2y );
							_context.lineTo( v3x, v3y );
							_context.lineTo( v4x, v4y );
							_context.lineTo( v1x, v1y );
							_context.closePath();

							_context.fillStyle = 'rgb(0, 255, 0)';
							_context.fill();

							continue;

						}
						*/

						uv1.copy( element.uvs[ 0 ] );
						uv2.copy( element.uvs[ 1 ] );
						uv3.copy( element.uvs[ 2 ] );

						uv1.u *= bitmapWidth; uv1.v *= bitmapHeight;
						uv2.u *= bitmapWidth; uv2.v *= bitmapHeight;
						uv3.u *= bitmapWidth; uv3.v *= bitmapHeight;

						drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, uv1.u, uv1.v, uv2.u, uv2.v, uv3.u, uv3.v );

					}

				}

			} else if ( element instanceof THREE.RenderableFace4 ) {

				element.v1.x *= _widthHalf; element.v1.y *= _heightHalf;
				element.v2.x *= _widthHalf; element.v2.y *= _heightHalf;
				element.v3.x *= _widthHalf; element.v3.y *= _heightHalf;
				element.v4.x *= _widthHalf; element.v4.y *= _heightHalf;

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

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					material = element.material[ m ];

					if ( material instanceof THREE.MeshColorFillMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v4x, v4y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.fillStyle = material.color.__styleString;
						_context.fill();


					} else if ( material instanceof THREE.MeshColorStrokeMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v4x, v4y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.lineWidth = material.lineWidth;
						_context.lineJoin = "round";
						_context.lineCap = "round";

						_context.strokeStyle = material.color.__styleString;
						_context.stroke();

						_bboxRect.inflate( _context.lineWidth );

					} else if ( material instanceof THREE.MeshFaceColorFillMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v4x, v4y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.fillStyle = element.color.__styleString;
						_context.fill();

					} else if ( material instanceof THREE.MeshFaceColorStrokeMaterial ) {

						_context.beginPath();
						_context.moveTo( v1x, v1y );
						_context.lineTo( v2x, v2y );
						_context.lineTo( v3x, v3y );
						_context.lineTo( v4x, v4y );
						_context.lineTo( v1x, v1y );
						_context.closePath();

						_context.lineWidth = material.lineWidth;
						_context.lineJoin = "round";
						_context.lineCap = "round";

						_context.strokeStyle = element.color.__styleString;
						_context.stroke();

						_bboxRect.inflate( _context.lineWidth );

					} else if ( material instanceof THREE.MeshBitmapUVMappingMaterial ) {

						bitmap = material.bitmap;
						bitmapWidth = bitmap.width - 1;
						bitmapHeight = bitmap.height - 1;

						/* DEBUG
						if ( !element.uvs[ 0 ] || !element.uvs[ 1 ] || !element.uvs[ 2 ] || !element.uvs[ 3 ]) {

							_context.beginPath();
							_context.moveTo( v1x, v1y );
							_context.lineTo( v2x, v2y );
							_context.lineTo( v3x, v3y );
							_context.lineTo( v4x, v4y );
							_context.lineTo( v1x, v1y );
							_context.closePath();

							_context.fillStyle = 'rgb(255, 0, 255)';
							_context.fill();

							continue;

						}
						*/

						uv1.copy( element.uvs[ 0 ] );
						uv2.copy( element.uvs[ 1 ] );
						uv3.copy( element.uvs[ 2 ] );
						uv4.copy( element.uvs[ 3 ] );

						uv1.u *= bitmapWidth; uv1.v *= bitmapHeight;
						uv2.u *= bitmapWidth; uv2.v *= bitmapHeight;
						uv3.u *= bitmapWidth; uv3.v *= bitmapHeight;
						uv4.u *= bitmapWidth; uv4.v *= bitmapHeight;

						drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v4x, v4y, uv1.u, uv1.v, uv2.u, uv2.v, uv4.u, uv4.v );
						drawTexturedTriangle( bitmap, v5x, v5y, v3x, v3y, v6x, v6y, uv2.u, uv2.v, uv3.u, uv3.v, uv4.u, uv4.v );

					}

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

	function drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, uv1u, uv1v, uv2u, uv2v, uv3u, uv3v )  {

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

		denom = uv1u * ( uv3v - uv2v ) - uv2u * uv3v + uv3u * uv2v + ( uv2u - uv3u ) * uv1v;

		m11 = - ( uv1v * (v3x - v2x ) - uv2v * v3x + uv3v * v2x + ( uv2v - uv3v ) * v1x ) / denom;
		m12 = ( uv2v * v3y + uv1v * ( v2y - v3y ) - uv3v * v2y + ( uv3v - uv2v) * v1y ) / denom;
		m21 = ( uv1u * ( v3x - v2x ) - uv2u * v3x + uv3u * v2x + ( uv2u - uv3u ) * v1x ) / denom;
		m22 = - ( uv2u * v3y + uv1u * ( v2y - v3y ) - uv3u * v2y + ( uv3u - uv2u ) * v1y ) / denom;
		dx = ( uv1u * ( uv3v * v2x - uv2v * v3x ) + uv1v * ( uv2u * v3x - uv3u * v2x ) + ( uv3u * uv2v - uv2u * uv3v ) * v1x ) / denom;
		dy = ( uv1u * ( uv3v * v2y - uv2v * v3y ) + uv1v * ( uv2u * v3y - uv3u * v2y ) + ( uv3u * uv2v - uv2u * uv3v ) * v1y ) / denom;

		_context.transform( m11, m12, m21, m22, dx, dy );

		_context.drawImage( bitmap, 0, 0 );
		_context.restore();

	}

	function expand( a, b ) {

		_vector2.sub( b, a );
		_vector2.unit();

		b.addSelf( _vector2 );
		a.subSelf( _vector2 );

	}

};

THREE.CanvasRenderer.prototype = new THREE.Renderer();
THREE.CanvasRenderer.prototype.constructor = THREE.CanvasRenderer;
