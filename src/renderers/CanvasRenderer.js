/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	THREE.Renderer.call( this );

	var _canvas = document.createElement( 'canvas' ),
	_context = _canvas.getContext( '2d' ),
	_width, _height, _widthHalf, _heightHalf,
	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle( 0, 0, 0, 0 ),
	_bboxRect = new THREE.Rectangle(),
	_vector2 = new THREE.Vector2();

	this.domElement = _canvas;
	this.autoClear = true;

	this.setSize = function ( width, height ) {

		_width = width; _height = height;
		_widthHalf = _width / 2; _heightHalf = _height / 2;

		_canvas.width = _width;
		_canvas.height = _height;

		_context.setTransform( 1, 0, 0, -1, _widthHalf, _heightHalf );

		_clipRect.set( - _widthHalf, - _heightHalf, _widthHalf, _heightHalf );

	};

	this.clear = function () {

		_clearRect.inflate( 1 );
		_clearRect.minSelf( _clipRect );
		_context.clearRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
		_clearRect.empty();

	};

	this.render = function ( scene, camera ) {

		var e, el, m, ml, element, material, pi2 = Math.PI * 2,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y, width, height,

		uv1 = new THREE.Vector2(), uv2 = new THREE.Vector2(), uv3 = new THREE.Vector2(), uv4 = new THREE.Vector2(),
		bitmap, bitmapWidth, bitmapHeight;

		if ( this.autoClear ) {

			this.clear();

		}

		/* DEBUG
		_context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		_context.fillRect( _clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight() );
		*/

		this.project( scene, camera );

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

						width = element.scale.x * _widthHalf * bitmapWidth;
						height = element.scale.y * _heightHalf * bitmapHeight;

						_bboxRect.set( v1x - width, v1y - height, v1x + width, v1y + height );

						if ( !_clipRect.instersects( _bboxRect ) ) {

							continue;

						}

						_context.save();
						_context.translate( v1x - width, v1y + height );
						_context.rotate( - element.rotation );
						_context.scale( element.scale.x * _widthHalf, - ( element.scale.y * _heightHalf ) );

						_context.drawImage( bitmap, 0, 0 );

						_context.restore();

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
						bitmapWidth = bitmap.width;
						bitmapHeight = bitmap.height;

						uv1.copy( element.uvs[ 0 ] );
						uv2.copy( element.uvs[ 1 ] );
						uv3.copy( element.uvs[ 2 ] );

						uv1.x *= bitmapWidth; uv1.y *= bitmapHeight;
						uv2.x *= bitmapWidth; uv2.y *= bitmapHeight;
						uv3.x *= bitmapWidth; uv3.y *= bitmapHeight;

						drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, uv1.x, uv1.y, uv2.x, uv2.y, uv3.x, uv3.y );

					}

				}

			} else if ( element instanceof THREE.RenderableFace4 ) {

				element.v1.x *= _widthHalf; element.v1.y *= _heightHalf;
				element.v2.x *= _widthHalf; element.v2.y *= _heightHalf;
				element.v3.x *= _widthHalf; element.v3.y *= _heightHalf;
				element.v4.x *= _widthHalf; element.v4.y *= _heightHalf;

				if ( element.overdraw ) {

					expand( element.v1, element.v2 );
					expand( element.v2, element.v3 );
					expand( element.v3, element.v4 );
					expand( element.v4, element.v1 );

				}

				v1x = element.v1.x; v1y = element.v1.y;
				v2x = element.v2.x; v2y = element.v2.y;
				v3x = element.v3.x; v3y = element.v3.y;
				v4x = element.v4.x; v4y = element.v4.y;

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
						bitmapWidth = bitmap.width;
						bitmapHeight = bitmap.height;

						uv1.copy( element.uvs[ 0 ] );
						uv2.copy( element.uvs[ 1 ] );
						uv3.copy( element.uvs[ 2 ] );
						uv4.copy( element.uvs[ 3 ] );

						uv1.x *= bitmapWidth; uv1.y *= bitmapHeight;
						uv2.x *= bitmapWidth; uv2.y *= bitmapHeight;
						uv3.x *= bitmapWidth; uv3.y *= bitmapHeight;
						uv4.x *= bitmapWidth; uv4.y *= bitmapHeight;

						drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v4x, v4y, uv1.x, uv1.y, uv2.x, uv2.y, uv4.x, uv4.y );
						drawTexturedTriangle( bitmap, v2x, v2y, v3x, v3y, v4x, v4y, uv2.x, uv2.y, uv3.x, uv3.y, uv4.x, uv4.y );

					}

				}

			}

			/* DEBUG
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

	};

	function drawTexturedTriangle( bitmap, v1x, v1y, v2x, v2y, v3x, v3y, suv1x, suv1y, suv2x, suv2y, suv3x, suv3y )  {

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

		denom = suv1x * ( suv3y - suv2y ) - suv2x * suv3y + suv3x * suv2y + ( suv2x - suv3x ) * suv1y;

		m11 = - ( suv1y * (v3x - v2x ) - suv2y * v3x + suv3y * v2x + ( suv2y - suv3y ) * v1x ) / denom;
		m12 = ( suv2y * v3y + suv1y * ( v2y - v3y ) - suv3y * v2y + ( suv3y - suv2y) * v1y ) / denom;
		m21 = ( suv1x * ( v3x - v2x ) - suv2x * v3x + suv3x * v2x + ( suv2x - suv3x ) * v1x ) / denom;
		m22 = - ( suv2x * v3y + suv1x * ( v2y - v3y ) - suv3x * v2y + ( suv3x - suv2x ) * v1y ) / denom;
		dx = ( suv1x * ( suv3y * v2x - suv2y * v3x ) + suv1y * ( suv2x * v3x - suv3x * v2x ) + ( suv3x * suv2y - suv2x * suv3y ) * v1x ) / denom;
		dy = ( suv1x * ( suv3y * v2y - suv2y * v3y ) + suv1y * ( suv2x * v3y - suv3x * v2y ) + ( suv3x * suv2y - suv2x * suv3y ) * v1y ) / denom;

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
