/**
 * @author mrdoob / http://mrdoob.com/
 * @author mraleph / http://mrale.ph/
 */

THREE.SoftwareRenderer3 = function () {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;

	var canvasWidthHalf = canvasWidth / 2;
	var canvasHeightHalf = canvasHeight / 2;

	var imagedata = context.getImageData( 0, 0, canvas.width, canvas.height );
	var data = imagedata.data;

	var blocksize = 8;

	var canvasWBlocks = Math.floor( ( canvasWidth + blocksize - 1 ) / blocksize );
	var canvasHBlocks = Math.floor( ( canvasHeight + blocksize - 1 ) / blocksize );

	var block_full = new Uint8Array( canvasWBlocks * canvasHBlocks );

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

		canvasWBlocks = Math.floor( ( canvasWidth + blocksize - 1 ) / blocksize );
		canvasHBlocks = Math.floor( ( canvasHeight + blocksize - 1 ) / blocksize );

		console.log( canvasWBlocks, canvasHBlocks );

		block_full = new Uint8Array( canvasWBlocks * canvasHBlocks )

	};

	this.clear = function () {

		clearRectangle( prevrectx1, prevrecty1, prevrectx2, prevrecty2 );

		for ( var i = 0, l = block_full.length; i < l; i ++ ) {

			block_full[ i ] = 0;

		}

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

		var offset = ( xmin + ymin * canvasWidth - 1 ) * 4 + 3;
		var linestep = ( canvasWidth - ( xmax - xmin ) ) * 4;

		for ( var y = ymin; y < ymax; y ++ ) {

			for ( var x = xmin; x < xmax; x ++ ) {

				data[ offset += 4 ] = 0;

			}

			offset += linestep;

		}

	}

	function drawTriangle( x1, y1, x2, y2, x3, y3, r, g, b ) {

		// https://gist.github.com/2486101
		// explanation: ttp://pouet.net/topic.php?which=8760&page=1

		// 28.4 fixed-point coordinates

		var x1 = (16 * x1) | 0;
		var x2 = (16 * x2) | 0;
		var x3 = (16 * x3) | 0;

		var y1 = (16 * y1) | 0;
		var y2 = (16 * y2) | 0;
		var y3 = (16 * y3) | 0;

		// Deltas

		var dx12 = x1 - x2, dy12 = y2 - y1;
		var dx23 = x2 - x3, dy23 = y3 - y2;
		var dx31 = x3 - x1, dy31 = y1 - y3;

		// Bounding rectangle

		var minx = Math.max( ( Math.min( x1, x2, x3 ) + 0xf ) >> 4, 0 );
		var maxx = Math.min( ( Math.max( x1, x2, x3 ) + 0xf ) >> 4, canvasWidth );
		var miny = Math.max( ( Math.min( y1, y2, y3 ) + 0xf ) >> 4, 0 );
		var maxy = Math.min( ( Math.max( y1, y2, y3 ) + 0xf ) >> 4, canvasHeight );

		rectx1 = Math.min( minx, rectx1 );
		rectx2 = Math.max( maxx, rectx2 );
		recty1 = Math.min( miny, recty1 );
		recty2 = Math.max( maxy, recty2 );

		// Block size, standard 8x8 (must be power of two)

		var q = blocksize;

		// Start in corner of 8x8 block

		minx &= ~(q - 1);
		miny &= ~(q - 1);

		// Constant part of half-edge functions

		var c1 = dy12 * ((minx << 4) - x1) + dx12 * ((miny << 4) - y1);
		var c2 = dy23 * ((minx << 4) - x2) + dx23 * ((miny << 4) - y2);
		var c3 = dy31 * ((minx << 4) - x3) + dx31 * ((miny << 4) - y3);

		// Correct for fill convention

		if ( dy12 > 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
		if ( dy23 > 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
		if ( dy31 > 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;

		// Note this doesn't kill subpixel precision, but only because we test for >=0 (not >0).
		// It's a bit subtle. :)
		c1 = (c1 - 1) >> 4;
		c2 = (c2 - 1) >> 4;
		c3 = (c3 - 1) >> 4;

		// Set up min/max corners
		var qm1 = q - 1; // for convenience
		var nmin1 = 0, nmax1 = 0;
		var nmin2 = 0, nmax2 = 0;
		var nmin3 = 0, nmax3 = 0;
		if (dx12 >= 0) nmax1 -= qm1*dx12; else nmin1 -= qm1*dx12;
		if (dy12 >= 0) nmax1 -= qm1*dy12; else nmin1 -= qm1*dy12;
		if (dx23 >= 0) nmax2 -= qm1*dx23; else nmin2 -= qm1*dx23;
		if (dy23 >= 0) nmax2 -= qm1*dy23; else nmin2 -= qm1*dy23;
		if (dx31 >= 0) nmax3 -= qm1*dx31; else nmin3 -= qm1*dx31;
		if (dy31 >= 0) nmax3 -= qm1*dy31; else nmin3 -= qm1*dy31;

		// Loop through blocks
		var linestep = (canvasWidth - q) * 4;
		var scale = 255.0 / (c1 + c2 + c3);

		var cb1 = c1;
		var cb2 = c2;
		var cb3 = c3;
		var qstep = -q;
		var e1x = qstep * dy12;
		var e2x = qstep * dy23;
		var e3x = qstep * dy31;
		var x0 = minx;

		for (var y0 = miny; y0 < maxy; y0 += q) {

			// New block line - keep hunting for tri outer edge in old block line dir
			while (x0 >= minx && x0 < maxx && cb1 >= nmax1 && cb2 >= nmax2 && cb3 >= nmax3) {

				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;

			}

			// Okay, we're now in a block we know is outside. Reverse direction and go into main loop.
			qstep = -qstep;
			e1x = -e1x;
			e2x = -e2x;
			e3x = -e3x;

			while (1) {

				// Step everything
				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;

				// We're done with this block line when at least one edge completely out
				// If an edge function is too small and decreasing in the current traversal
				// dir, we're done with this line.
				if (x0 < minx || x0 >= maxx) break;
				if (cb1 < nmax1) if (e1x < 0) break; else continue;
				if (cb2 < nmax2) if (e2x < 0) break; else continue;
				if (cb3 < nmax3) if (e3x < 0) break; else continue;

				// We can skip this block if it's already fully covered
				var blockX = (x0 / q) | 0;
				var blockY = (y0 / q) | 0;
				var blockInd = blockX + blockY * canvasWBlocks;
				if (block_full[blockInd]) continue;

				// Offset at top-left corner
				var offset = (x0 + y0 * canvasWidth) * 4;

				// Accept whole block when fully covered
				if (cb1 >= nmin1 && cb2 >= nmin2 && cb3 >= nmin3) {

					var cy1 = cb1;
					var cy2 = cb2;

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;

						for ( var ix = 0; ix < q; ix ++ ) {

							if (!data[offset + 3]) {

								var u = cx1 * scale; // 0-255!
								var v = cx2 * scale; // 0-255!
								data[offset] = u;
								data[offset + 1] = v;
								data[offset + 2] = 0;
								data[offset + 3] = 255;

							}

							cx1 += dy12;
							cx2 += dy23;
							offset += 4;

						}

						cy1 += dx12;
						cy2 += dx23;
						offset += linestep;

					}

					block_full[blockInd] = 1;

				} else { // Partially covered block

					var cy1 = cb1;
					var cy2 = cb2;
					var cy3 = cb3;

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cx3 = cy3;

						for ( var ix = 0; ix < q; ix ++ ) {

							if ( (cx1 | cx2 | cx3) >= 0 && !data[offset+3]) {

								var u = cx1 * scale; // 0-255!
								var v = cx2 * scale; // 0-255!
								data[offset] = u;
								data[offset + 1] = v;
								data[offset + 2] = 0;
								data[offset + 3] = 255;

							}

							cx1 += dy12;
							cx2 += dy23;
							cx3 += dy31;
							offset += 4;

						}

						cy1 += dx12;
						cy2 += dx23;
						cy3 += dx31;
						offset += linestep;

					}

				}

			}

			// Advance to next row of blocks
			cb1 += q*dx12;
			cb2 += q*dx23;
			cb3 += q*dx31;

		}

	}

	function normalToComponent( normal ) {

		var component = ( normal + 1 ) * 127;
		return component < 0 ? 0 : ( component > 255 ? 255 : component );

	}

};
