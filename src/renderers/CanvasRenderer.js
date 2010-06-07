/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	THREE.Renderer.call( this );

	var _viewport = document.createElement( "canvas" ),
	_context = _viewport.getContext( "2d" ),
	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle( 0, 0, 0, 0 ),
	_bboxRect = new THREE.Rectangle(),

	_uvs, _bitmap, _bitmap_width, _bitmap_height,
	_denom, _m11, _m12, _m21, _m22, _dx, _dy,
	_vector2 = new THREE.Vector2();

	this.setSize = function ( width, height ) {

		_viewport.width = width;
		_viewport.height = height;

		_context.setTransform( 1, 0, 0, 1, width / 2, height / 2 );

		_clipRect.set( -width / 2, -height / 2, width / 2, height / 2 );

	}

	this.domElement = _viewport;

	this.render = function ( scene, camera ) {

		var i, j, element, pi2 = Math.PI * 2,
		elementsLength, material, materialLength,
		v1x, v1y, v2x, v2y, v3x, v3y, v4x, v4y,
		size;

		_clearRect.inflate( 1 );
		_clearRect.minSelf( _clipRect );
		_context.clearRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
		_clearRect.empty();

		/*
		_context.fillStyle = 'rgba(255, 255, 0, 0.5)';
		_context.fillRect(_clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight());
		*/

		this.project( scene, camera );

		elementsLength = this.renderList.length;

		for ( i = 0; i < elementsLength; i++ ) {

			element = this.renderList[ i ];

			_bboxRect.empty();

			_context.beginPath();

			if ( element instanceof THREE.RenderableParticle ) {

				size = element.size * element.screenZ;

				_bboxRect.set( element.x - size, element.y - size, element.x + size, element.y + size );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				_context.arc( element.x, element.y, size, 0, pi2, true );

			} else if ( element instanceof THREE.RenderableLine ) {

				v1x = element.v1.x; v1y = element.v1.y;
				v2x = element.v2.x; v2y = element.v2.y;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				_context.moveTo( v1x, v1y );
				_context.lineTo( v2x, v2y );

			} else if ( element instanceof THREE.RenderableFace3 ) {

				expand( element.v1, element.v2 );
				expand( element.v2, element.v3 );
				expand( element.v3, element.v1 );

				v1x = element.v1.x; v1y = element.v1.y;
				v2x = element.v2.x; v2y = element.v2.y;
				v3x = element.v3.x; v3y = element.v3.y;

				_bboxRect.addPoint( v1x, v1y );
				_bboxRect.addPoint( v2x, v2y );
				_bboxRect.addPoint( v3x, v3y );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					continue;

				}

				_clearRect.addRectangle( _bboxRect );

				_context.moveTo( v1x, v1y );
				_context.lineTo( v2x, v2y );
				_context.lineTo( v3x, v3y );
				_context.lineTo( v1x, v1y );

			} else if ( element instanceof THREE.RenderableFace4 ) {

				expand( element.v1, element.v2 );
				expand( element.v2, element.v3 );
				expand( element.v3, element.v4 );
				expand( element.v4, element.v1 );

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

				_context.moveTo( v1x, v1y );
				_context.lineTo( v2x, v2y );
				_context.lineTo( v3x, v3y );
				_context.lineTo( v4x, v4y );
				_context.lineTo( v1x, v1y );

			}

			_context.closePath();

			materialLength = element.material.length;

			for ( j = 0; j < materialLength; j++ ) {

				material = element.material[ j ];

				if ( material instanceof THREE.ColorFillMaterial ) {

					_context.fillStyle = material.color.__styleString;
					_context.fill();

				} else if ( material instanceof THREE.FaceColorFillMaterial ) {

					_context.fillStyle = element.color.__styleString;
					_context.fill();

				} else if ( material instanceof THREE.ColorStrokeMaterial ) {

					_context.lineWidth = material.lineWidth;
					_context.lineJoin = "round";
					_context.lineCap = "round";

					_context.strokeStyle = material.color.__styleString;
					_context.stroke();

					_bboxRect.inflate( _context.lineWidth );

				} else if ( material instanceof THREE.FaceColorStrokeMaterial ) {

					_context.lineWidth = material.lineWidth;
					_context.lineJoin = "round";
					_context.lineCap = "round";

					_context.strokeStyle = element.color.__styleString;
					_context.stroke();

					_bboxRect.inflate( _context.lineWidth );

				} else if ( material instanceof THREE.TextureUVMappingMaterial ) {

					_uvs = element.uvs;
					_bitmap = material.bitmap,
					_bitmap_width = _bitmap.width,
					_bitmap_height = _bitmap.height;

					drawTexturedTriangle( _bitmap, _bboxRect, v1x, v1y, v2x, v2y, v3x, v3y,
						_uvs[ 0 ].x * _bitmap_width, _uvs[ 0 ].y * _bitmap_height,
						_uvs[ 1 ].x * _bitmap_width, _uvs[ 1 ].y * _bitmap_height,
						_uvs[ 2 ].x * _bitmap_width, _uvs[ 2 ].y * _bitmap_height );

				}

			}

			_clearRect.addRectangle( _bboxRect );

		}

		/*
		_context.lineWidth = 1;
		_context.strokeStyle = 'rgba( 0, 0, 255, 0.5 )';
		_context.strokeRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
		*/

	}

	// Textured triangle drawing by Thatcher Ulrich.
	// http://tulrich.com/geekstuff/canvas/jsgl.js

	function drawTexturedTriangle( texture, bbox, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2 ) {

		_context.save();
		_context.clip();

		_denom = sx0 * ( sy2 - sy1 ) - sx1 * sy2 + sx2 * sy1 + ( sx1 - sx2 ) * sy0;
		_m11 = - ( sy0 * (x2 - x1 ) - sy1 * x2 + sy2 * x1 + ( sy1 - sy2 ) * x0 ) / _denom;
		_m12 = ( sy1 * y2 + sy0 * ( y1 - y2 ) - sy2 * y1 + ( sy2 - sy1) * y0 ) / _denom;
		_m21 = ( sx0 * ( x2 - x1 ) - sx1 * x2 + sx2 * x1 + ( sx1 - sx2 ) * x0 ) / _denom;
		_m22 = - ( sx1 * y2 + sx0 * ( y1 - y2 ) - sx2 * y1 + ( sx2 - sx1 ) * y0 ) / _denom;
		_dx = ( sx0 * ( sy2 * x1 - sy1 * x2 ) + sy0 * ( sx1 * x2 - sx2 * x1 ) + ( sx2 * sy1 - sx1 * sy2 ) * x0 ) / _denom;
		_dy = ( sx0 * ( sy2 * y1 - sy1 * y2 ) + sy0 * ( sx1 * y2 - sx2 * y1 ) + ( sx2 * sy1 - sx1 * sy2 ) * y0 ) / _denom;

		_context.transform( _m11, _m12, _m21, _m22, _dx, _dy );

		_context.drawImage( texture, 0, 0 );
		_context.restore();

	}

	function expand( a, b ) {

		_vector2.sub( b, a );
		_vector2.unit();

		b.addSelf( _vector2 );
		a.subSelf( _vector2 );

	}

}

THREE.CanvasRenderer.prototype = new THREE.Renderer();
THREE.CanvasRenderer.prototype.constructor = THREE.CanvasRenderer;
