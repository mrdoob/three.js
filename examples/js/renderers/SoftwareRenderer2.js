/**
 * @author mrdoob / http://mrdoob.com/
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

	var rectx1 = Infinity, recty1 = Infinity;
	var rectx2 = 0, recty2 = 0;

	var prevrectx1 = Infinity, prevrecty1 = Infinity;
	var prevrectx2 = 0, prevrecty2 = 0;

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

		clearRectangle( prevrectx1, prevrecty1, prevrectx2, prevrecty2 );

	};

	this.render = function ( scene, camera ) {

		rectx1 = Infinity;
		recty1 = Infinity;
		rectx2 = 0;
		recty2 = 0;

		if ( this.autoClear ) this.clear();

		var renderData = projector.projectScene( scene, camera );
		var elements = renderData.elements;

		elements.sort( numericalSort );

		for ( var e = 0, el = elements.length; e < el; e ++ ) {

			var element = elements[ e ];

			if ( element instanceof THREE.RenderableFace3 ) {

				var v1 = element.v1.positionScreen;
				var v2 = element.v2.positionScreen;
				var v3 = element.v3.positionScreen;

				drawTriangle(
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					v2.x * canvasWidthHalf + canvasWidthHalf,
					- v2.y * canvasHeightHalf + canvasHeightHalf,
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					normalToComponent( element.normalWorld.x ),
					normalToComponent( element.normalWorld.y ),
					normalToComponent( element.normalWorld.z )
				)

			} else if ( element instanceof THREE.RenderableFace4 ) {

				var v1 = element.v1.positionScreen;
				var v2 = element.v2.positionScreen;
				var v3 = element.v3.positionScreen;
				var v4 = element.v4.positionScreen;

				drawTriangle(
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					v2.x * canvasWidthHalf + canvasWidthHalf,
					- v2.y * canvasHeightHalf + canvasHeightHalf,
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					normalToComponent( element.normalWorld.x ),
					normalToComponent( element.normalWorld.y ),
					normalToComponent( element.normalWorld.z )
				);

				drawTriangle(
					v3.x * canvasWidthHalf + canvasWidthHalf,
					- v3.y * canvasHeightHalf + canvasHeightHalf,
					v4.x * canvasWidthHalf + canvasWidthHalf,
					- v4.y * canvasHeightHalf + canvasHeightHalf,
					v1.x * canvasWidthHalf + canvasWidthHalf,
					- v1.y * canvasHeightHalf + canvasHeightHalf,
					normalToComponent( element.normalWorld.x ),
					normalToComponent( element.normalWorld.y ),
					normalToComponent( element.normalWorld.z )
				);

			}

		}

		var x = Math.min( rectx1, prevrectx1 );
		var y = Math.min( recty1, prevrecty1 );
		var width = Math.max( rectx2, prevrectx2 ) - x;
		var height = Math.max( recty2, prevrecty2 ) - y;

		/*
		console.log( rectx1, recty1, rectx2, recty2 );
		console.log( prevrectx1, prevrecty1, prevrectx2, prevrecty2 );
		console.log( x, y, width, height );
		console.log( canvasWidth, canvasHeight );
		*/

		context.putImageData( imagedata, 0, 0, x, y, width, height );

		prevrectx1 = rectx1; prevrecty1 = recty1;
		prevrectx2 = rectx2; prevrecty2 = recty2;

	};

	function numericalSort( a, b ) {

		return a.z - b.z;

	}

	function drawPixel( x, y, r, g, b ) {

		var offset = ( x + y * canvasWidth ) * 4;

		if ( data[ offset + 3 ] ) return;

		data[ offset ] = r;
		data[ offset + 1 ] = g;
		data[ offset + 2 ] = b;
		data[ offset + 3 ] = 255;

	}

	function clearRectangle( x1, y1, x2, y2 ) {

		var xmin = Math.max( Math.min( x1, x2 ), 0 );
		var xmax = Math.min( Math.max( x1, x2 ), canvasWidth );
		var ymin = Math.max( Math.min( y1, y2 ), 0 );
		var ymax = Math.min( Math.max( y1, y2 ), canvasHeight );

		var offset = ( xmin + ymin * canvasWidth ) * 4 + 3;
		var linestep = ( canvasWidth - ( xmax - xmin ) ) * 4;

		for ( var y = ymin; y < ymax; y ++ ) {

			for ( var x = xmin; x < xmax; x ++ ) {

				data[ offset ] = 0;
				offset += 4;

			}

			offset += linestep;

		}

	}

	function drawTriangle( x1, y1, x2, y2, x3, y3, r, g, b ) {

		// http://devmaster.net/forums/topic/1145-advanced-rasterization/

		// 28.4 fixed-point coordinates

		var x1 = Math.round( 16 * x1 );
		var x2 = Math.round( 16 * x2 );
		var x3 = Math.round( 16 * x3 );

		var y1 = Math.round( 16 * y1 );
		var y2 = Math.round( 16 * y2 );
		var y3 = Math.round( 16 * y3 );

		// Deltas

		var dx12 = x1 - x2;
		var dx23 = x2 - x3;
		var dx31 = x3 - x1;

		var dy12 = y1 - y2;
		var dy23 = y2 - y3;
		var dy31 = y3 - y1;

		// Fixed-point deltas

		var fdx12 = dx12 << 4;
		var fdx23 = dx23 << 4;
		var fdx31 = dx31 << 4;

		var fdy12 = dy12 << 4;
		var fdy23 = dy23 << 4;
		var fdy31 = dy31 << 4;

		// Bounding rectangle

		var xmin = Math.max( ( Math.min( x1, x2, x3 ) + 0xf ) >> 4, 0 );
		var xmax = Math.min( ( Math.max( x1, x2, x3 ) + 0xf ) >> 4, canvasWidth );
		var ymin = Math.max( ( Math.min( y1, y2, y3 ) + 0xf ) >> 4, 0 );
		var ymax = Math.min( ( Math.max( y1, y2, y3 ) + 0xf ) >> 4, canvasHeight );

		rectx1 = Math.min( xmin, rectx1 );
		rectx2 = Math.max( xmax, rectx2 );
		recty1 = Math.min( ymin, recty1 );
		recty2 = Math.max( ymax, recty2 );

		// Constant part of half-edge functions

		var c1 = dy12 * x1 - dx12 * y1;
		var c2 = dy23 * x2 - dx23 * y2;
		var c3 = dy31 * x3 - dx31 * y3;

		// Correct for fill convention

		if ( dy12 < 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
		if ( dy23 < 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
		if ( dy31 < 0 || ( dy31 == 0 && dx31 > 0 ) ) c3++;

		var cy1 = c1 + dx12 * ( ymin << 4 ) - dy12 * ( xmin << 4 );
		var cy2 = c2 + dx23 * ( ymin << 4 ) - dy23 * ( xmin << 4 );
		var cy3 = c3 + dx31 * ( ymin << 4 ) - dy31 * ( xmin << 4 );

		// Scan through bounding rectangle

		for ( var y = ymin; y < ymax; y ++ ) {

			// Start value for horizontal scan

			var cx1 = cy1;
			var cx2 = cy2;
			var cx3 = cy3;

			for ( var x = xmin; x < xmax; x ++ ) {

				if ( cx1 > 0 && cx2 > 0 && cx3 > 0 ) {

					drawPixel( x, y, r, g, b );

				}

				cx1 -= fdy12;
				cx2 -= fdy23;
				cx3 -= fdy31;

			}

			cy1 += fdx12;
			cy2 += fdx23;
			cy3 += fdx31;

		}

	}

	function drawTriangleColor3( x1, y1, x2, y2, x3, y3, color1, color2, color3 ) {

		// http://devmaster.net/forums/topic/1145-advanced-rasterization/

		var r1 = color1 >> 16 & 255;
		var r2 = color2 >> 16 & 255;
		var r3 = color3 >> 16 & 255;

		var g1 = color1 >> 8 & 255;
		var g2 = color2 >> 8 & 255;
		var g3 = color3 >> 8 & 255;

		var b1 = color1 & 255;
		var b2 = color2 & 255;
		var b3 = color3 & 255;

		var deltasr = computeDelta( x1, y1, r1, x2, y2, r2, x3, y3, r3 );
		var deltasg = computeDelta( x1, y1, g1, x2, y2, g2, x3, y3, g3 );
		var deltasb = computeDelta( x1, y1, b1, x2, y2, b2, x3, y3, b3 );

		// 28.4 fixed-point coordinates

		var X1 = Math.round( 16 * x1 );
		var X2 = Math.round( 16 * x2 );
		var X3 = Math.round( 16 * x3 );

		var Y1 = Math.round( 16 * y1 );
		var Y2 = Math.round( 16 * y2 );
		var Y3 = Math.round( 16 * y3 );

		// Deltas

		var dx12 = X1 - X2;
		var dx23 = X2 - X3;
		var dx31 = X3 - X1;

		var dy12 = Y1 - Y2;
		var dy23 = Y2 - Y3;
		var dy31 = Y3 - Y1;

		// Fixed-point deltas

		var fdx = [ dx12 << 4, dx23 << 4, dx31 << 4 ];
		var fdy = [ dy12 << 4, dy23 << 4, dy31 << 4 ];

		// Bounding rectangle

		var minx = Math.max( ( Math.min( X1, X2, X3 ) + 0xf ) >> 4, 0 );
		var maxx = Math.min( ( Math.max( X1, X2, X3 ) + 0xf ) >> 4, canvasWidth );
		var miny = Math.max( ( Math.min( Y1, Y2, Y3 ) + 0xf ) >> 4, 0 );
		var maxy = Math.min( ( Math.max( Y1, Y2, Y3 ) + 0xf ) >> 4, canvasHeight );

		// Constant part of half-edge functions

		var c1 = dy12 * X1 - dx12 * Y1;
		var c2 = dy23 * X2 - dx23 * Y2;
		var c3 = dy31 * X3 - dx31 * Y3;

		// Correct for fill convention

		if ( dy12 < 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
		if ( dy23 < 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
		if ( dy31 < 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;

		var cy1 = c1 + dx12 * ( miny << 4 ) - dy12 * ( minx << 4 );
		var cy2 = c2 + dx23 * ( miny << 4 ) - dy23 * ( minx << 4 );
		var cy3 = c3 + dx31 * ( miny << 4 ) - dy31 * ( minx << 4 );

		// Scan through bounding rectangle

		var minyx1 = ( minx - x1 );
		var minyy1 = ( miny - y1 );

		var ry = deltasr[ 1 ] * minyy1;
		var gy = deltasg[ 1 ] * minyy1;
		var by = deltasb[ 1 ] * minyy1;

		for ( var y = miny; y < maxy; y ++ ) {

			// Start value for horizontal scan

			var cx1 = cy1;
			var cx2 = cy2;
			var cx3 = cy3;

			var rx = deltasr[ 0 ] * minyx1 + ry;
			var gx = deltasg[ 0 ] * minyx1 + gy;
			var bx = deltasb[ 0 ] * minyx1 + by;

			for ( var x = minx; x < maxx; x ++ ) {

				if ( cx1 > 0 && cx2 > 0 && cx3 > 0 ) {

					drawPixel( x, y, r1 + rx, g1 + gx, b1 + bx );

				}

				cx1 -= fdy[ 0 ];
				cx2 -= fdy[ 1 ];
				cx3 -= fdy[ 2 ];

				rx += deltasr[ 0 ];
				gx += deltasg[ 0 ];
				bx += deltasb[ 0 ];

			}

			cy1 += fdx[ 0 ];
			cy2 += fdx[ 1 ];
			cy3 += fdx[ 2 ];

			ry += deltasr[ 1 ];
			gy += deltasg[ 1 ];
			by += deltasb[ 1 ];

		}

	}

	function normalToComponent( normal ) {

		var component = ( normal + 1 ) * 127;
		return component < 0 ? 0 : ( component > 255 ? 255 : component );

	}

};
