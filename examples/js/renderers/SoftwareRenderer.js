/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SoftwareRenderer = function () {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	var imagedata = context.getImageData( 0, 0, canvas.width, canvas.height );
	var data = imagedata.data;

	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	var canvasWidthHalf = canvasWidth / 2;
	var canvasHeightHalf = canvasHeight / 2;

	var edges = [ new Edge(), new Edge(), new Edge() ];
	var span = new Span();

	var projector = new THREE.Projector();

	this.domElement = canvas;

	this.autoClear = true;

	this.setSize = function ( width, height ) {

		canvas.width = width;
		canvas.height = height;

		canvasWidth = canvas.width;
		canvasHeight = canvas.height;

		canvasWidthHalf = width / 2;
		canvasHeightHalf = height / 2;

		imagedata = context.getImageData( 0, 0, width, height );
		data = imagedata.data;

	};

	this.clear = function () {

		for ( var i = 3, l = data.length; i < l; i += 4 ) {

			data[ i ] = 0;

		}

	};

	this.render = function ( scene, camera ) {

		var m, ml, element, material, dom, v1x, v1y;

		if ( this.autoClear ) this.clear();

		var renderData = projector.projectScene( scene, camera );
		var elements = renderData.elements;

		elements.sort( function painterSort( a, b ) { return a.z - b.z; } );

		for ( var e = 0, el = elements.length; e < el; e ++ ) {

			var element = elements[ e ];

			if ( element instanceof THREE.RenderableFace3 ) {

				var v1 = element.v1.positionScreen;
				var v2 = element.v2.positionScreen;
				var v3 = element.v3.positionScreen;

				drawTriangle(
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					0xff0000,
					v2.x * canvasWidthHalf + canvasWidthHalf,
					- v2.y * canvasHeightHalf + canvasHeightHalf,
					0x00ff00,
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					0x0000ff
				)

			} else if ( element instanceof THREE.RenderableFace4 ) {

				var v1 = element.v1.positionScreen;
				var v2 = element.v2.positionScreen;
				var v3 = element.v3.positionScreen;
				var v4 = element.v4.positionScreen;

				drawTriangle(
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					0xff0000,
					v2.x * canvasWidthHalf + canvasWidthHalf,
					- v2.y * canvasHeightHalf + canvasHeightHalf,
					0x00ff00,
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					0x0000ff
				);

				drawTriangle(
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					0x0000ff,
					v4.x * canvasWidthHalf + canvasWidthHalf,
					- v4.y * canvasHeightHalf + canvasHeightHalf,
					0xff00ff,
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					0xff0000
				);

			}

		}

		context.putImageData( imagedata, 0, 0 );

	};

	function drawPixel( x, y, r, g, b ) {

		var offset = ( x + y * canvasWidth ) * 4;

		if ( x < 0 || y < 0 ) return;
		if ( x > canvasWidth || y > canvasHeight ) return;

		if ( data[ offset + 3 ] ) return;

		data[ offset ] = r;
		data[ offset + 1 ] = g;
		data[ offset + 2 ] = b;
		data[ offset + 3 ] = 255;

	}

	/*
	function drawRectangle( x1, y1, x2, y2, color ) {

		var r = color >> 16 & 255;
		var g = color >> 8 & 255;
		var b = color & 255;

		var xmin = Math.min( x1, x2 ) >> 0;
		var xmax = Math.max( x1, x2 ) >> 0;
		var ymin = Math.min( y1, y2 ) >> 0;
		var ymax = Math.max( y1, y2 ) >> 0;

		for ( var y = ymin; y < ymax; y ++ ) {

			for ( var x = xmin; x < xmax; x ++ ) {

				drawPixel( x, y, r, g, b );

			}

		}

	}
	*/

	function drawTriangle( x1, y1, color1, x2, y2, color2, x3, y3, color3 ) {

		// http://joshbeam.com/articles/triangle_rasterization/

		edges[ 0 ].set( x1, y1, color1, x2, y2, color2 );
		edges[ 1 ].set( x2, y2, color2, x3, y3, color3 );
		edges[ 2 ].set( x3, y3, color3, x1, y1, color1 );

		var maxLength = 0;
		var longEdge = 0;

		// find edge with the greatest length in the y axis

		for ( var i = 0; i < 3; i ++ ) {

			var length = ( edges[ i ].y2 - edges[ i ].y1 );

			if ( length > maxLength ) {

				maxLength = length;
				longEdge = i;

			}
		}

		var shortEdge1 = ( longEdge + 1 ) % 3;
		var shortEdge2 = ( longEdge + 2 ) % 3;

		drawSpans( edges[ longEdge ], edges[ shortEdge1 ] );
		drawSpans( edges[ longEdge ], edges[ shortEdge2 ] );

	}

	function drawSpans( e1, e2 ) {

		var e1ydiff = e1.y2 - e1.y1;
		if ( e1ydiff === 0 ) return;

		var e2ydiff = e2.y2 - e2.y1;
		if ( e2ydiff === 0 ) return;

		var e1xdiff = e1.x2 - e1.x1;
		var e2xdiff = e2.x2 - e2.x1;

		var e1colordiffr = e1.r2 - e1.r1;
		var e1colordiffg = e1.g2 - e1.g1;
		var e1colordiffb = e1.b2 - e1.b1;

		var e2colordiffr = e2.r2 - e2.r1;
		var e2colordiffg = e2.g2 - e2.g1;
		var e2colordiffb = e2.b2 - e2.b1;

		var factor1 = ( e2.y1 - e1.y1 ) / e1ydiff;
		var factorStep1 = 1 / e1ydiff;
		var factor2 = 0;
		var factorStep2 = 1 / e2ydiff;


		for ( var y = e2.y1; y < e2.y2; y ++ ) {

			span.set(
				e1.x1 + ( e1xdiff * factor1 ),
				e1.r1 + e1colordiffr * factor1,
				e1.g1 + e1colordiffg * factor1,
				e1.b1 + e1colordiffb * factor1,

				e2.x1 + ( e2xdiff * factor2 ),
				e2.r1 + e2colordiffr * factor2,
				e2.g1 + e2colordiffg * factor2,
				e2.b1 + e2colordiffb * factor2
			);

			var xdiff = span.x2 - span.x1;
			if ( xdiff > 0 ) {

				var colordiffr = span.r2 - span.r1;
				var colordiffg = span.g2 - span.g1;
				var colordiffb = span.b2 - span.b1;

				var factor = 0;
				var factorStep = 1 / xdiff;

				for ( var x = span.x1; x < span.x2; x ++ ) {

					var r = span.r1 + colordiffr * factor;
					var g = span.g1 + colordiffg * factor;
					var b = span.b1 + colordiffb * factor;

					drawPixel( x, y, r, g, b );
					factor += factorStep;

				}

			}

			factor1 += factorStep1;
			factor2 += factorStep2;

		}

	}

	function Edge() {

		this.x1 = 0;
		this.y1 = 0;

		this.x2 = 0;
		this.y2 = 0;

		this.r1 = 0;
		this.g1 = 0;
		this.b1 = 0;

		this.r2 = 0;
		this.g2 = 0;
		this.b2 = 0;

		this.set = function ( x1, y1, color1, x2, y2, color2 ) {

			if ( y1 < y2 ) {

				this.x1 = x1 >> 0;
				this.y1 = y1 >> 0;

				this.x2 = x2 >> 0;
				this.y2 = y2 >> 0;

				this.r1 = color1 >> 16 & 255;
				this.g1 = color1 >> 8 & 255;
				this.b1 = color1 & 255;

				this.r2 = color2 >> 16 & 255;
				this.g2 = color2 >> 8 & 255;
				this.b2 = color2 & 255;

			} else {

				this.x1 = x2 >> 0;
				this.y1 = y2 >> 0;

				this.x2 = x1 >> 0;
				this.y2 = y1 >> 0;

				this.r1 = color2 >> 16 & 255;
				this.g1 = color2 >> 8 & 255;
				this.b1 = color2 & 255;

				this.r2 = color1 >> 16 & 255;
				this.g2 = color1 >> 8 & 255;
				this.b2 = color1 & 255;

			}

		}

	}

	function Span() {

		this.x1 = 0;
		this.x2 = 0;

		this.r1 = 0;
		this.g1 = 0;
		this.b1 = 0;

		this.r2 = 0;
		this.g2 = 0;
		this.b2 = 0;

		this.set = function ( x1, r1, g1, b1, x2, r2, g2, b2 ) {

			if ( x1 < x2 ) {

				this.x1 = x1 >> 0;
				this.x2 = x2 >> 0;

				this.r1 = r1;
				this.g1 = g1;
				this.b1 = b1;

				this.r2 = r2;
				this.g2 = g2;
				this.b2 = b2;

			} else {

				this.x1 = x2 >> 0;
				this.x2 = x1 >> 0;

				this.r1 = r2;
				this.g1 = g2;
				this.b1 = b2;

				this.r2 = r1;
				this.g2 = g1;
				this.b2 = b1;

			}

		}

	}

};
