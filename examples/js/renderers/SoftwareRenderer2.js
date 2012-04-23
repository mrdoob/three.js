/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.SoftwareRenderer2 = function () {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	var imagedata = context.getImageData( 0, 0, canvas.width, canvas.height );
	var data = imagedata.data;

	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	var canvasWidthHalf = canvasWidth / 2;
	var canvasHeightHalf = canvasHeight / 2;

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

		// http://devmaster.net/forums/topic/1145-advanced-rasterization/

		// Deltas

		var dx12 = x1 - x2;
		var dx23 = x2 - x3;
		var dx31 = x3 - x1;

		var dy12 = y1 - y2;
		var dy23 = y2 - y3;
		var dy31 = y3 - y1;

		// Bounding rectangle

		var minx = Math.max( Math.min( x1, x2, x3 ) >> 0, 0 );
		var maxx = Math.min( Math.max( x1, x2, x3 ) >> 0, canvasWidth );
		var miny = Math.max( Math.min( y1, y2, y3 ) >> 0, 0 );
		var maxy = Math.min( Math.max( y1, y2, y3 ) >> 0, canvasHeight );

		// Constant part of half-edge functions

		var c1 = dy12 * x1 - dx12 * y1;
		var c2 = dy23 * x2 - dx23 * y2;
		var c3 = dy31 * x3 - dx31 * y3;

		var cy1 = c1 + dx12 * miny - dy12 * minx;
		var cy2 = c2 + dx23 * miny - dy23 * minx;
		var cy3 = c3 + dx31 * miny - dy31 * minx;

		// Scan through bounding rectangle

		for ( var y = miny; y < maxy; y ++ ) {

			// Start value for horizontal scan

			var cx1 = cy1;
			var cx2 = cy2;
			var cx3 = cy3;

			for ( var x = minx; x < maxx; x ++ ) {

				if ( cx1 > 0 && cx2 > 0 && cx3 > 0 ) {

					drawPixel( x, y, 255, 0, 0 );

				}

				cx1 -= dy12;
				cx2 -= dy23;
				cx3 -= dy31;

			}

			cy1 += dx12;
			cy2 += dx23;
			cy3 += dx31;

		}

	}

};
