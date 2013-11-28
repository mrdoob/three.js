/**
 * @author mrdoob / http://mrdoob.com/
 * @author ryg / http://farbrausch.de/~fg
 * @author mraleph / http://mrale.ph/
 */

THREE.SoftwareRenderer = function () {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	var shaders = {};

	var canvasWidth, canvasHeight;
	var canvasWBlocks, canvasHBlocks;
	var viewportXScale, viewportYScale, viewportZScale;
	var viewportXOffs, viewportYOffs, viewportZOffs;

	var imagedata, data, zbuffer;
	var numBlocks, blockMaxZ, blockFlags;

	var BLOCK_ISCLEAR = (1 << 0);
	var BLOCK_NEEDCLEAR = (1 << 1);

	var subpixelBits = 4;
	var subpixelBias = (1 << subpixelBits) - 1;
	var blockShift = 3;
	var blockSize = 1 << blockShift;
	var maxZVal = (1 << 24); // Note: You want to size this so you don't get overflows.

	var rectx1 = Infinity, recty1 = Infinity;
	var rectx2 = 0, recty2 = 0;

	var prevrectx1 = Infinity, prevrecty1 = Infinity;
	var prevrectx2 = 0, prevrecty2 = 0;

	var projector = new THREE.Projector();

	var vector1 = new THREE.Vector3();
	var vector2 = new THREE.Vector3();
	var vector3 = new THREE.Vector3();

	this.domElement = canvas;

	this.autoClear = true;

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	this.setClearColor = function ( color, alpha ) {

		// TODO

	};

	this.setSize = function ( width, height ) {

		canvasWBlocks = Math.floor( width / blockSize );
		canvasHBlocks = Math.floor( height / blockSize );
		canvasWidth   = canvasWBlocks * blockSize;
		canvasHeight  = canvasHBlocks * blockSize;

		var fixScale = 1 << subpixelBits;

		viewportXScale =  fixScale * canvasWidth  / 2;
		viewportYScale = -fixScale * canvasHeight / 2;
		viewportZScale =             maxZVal      / 2;
		viewportXOffs  =  fixScale * canvasWidth  / 2 + 0.5;
		viewportYOffs  =  fixScale * canvasHeight / 2 + 0.5;
		viewportZOffs  =             maxZVal      / 2 + 0.5;

		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		imagedata = context.getImageData( 0, 0, canvasWidth, canvasHeight );
		data = imagedata.data;
		zbuffer = new Int32Array( data.length / 4 );

		numBlocks = canvasWBlocks * canvasHBlocks;
		blockMaxZ = new Int32Array( numBlocks );
		blockFlags = new Uint8Array( numBlocks );

		for ( var i = 0, l = zbuffer.length; i < l; i ++ ) {

			zbuffer[ i ] = maxZVal;

		}

		for ( var i = 0; i < numBlocks; i ++ ) {

			blockFlags[ i ] = BLOCK_ISCLEAR;

		}

	};

	this.setSize( canvas.width, canvas.height );

	this.clear = function () {

		rectx1 = Infinity;
		recty1 = Infinity;
		rectx2 = 0;
		recty2 = 0;

		for ( var i = 0; i < numBlocks; i ++ ) {

			blockMaxZ[ i ] = maxZVal;
			blockFlags[ i ] = (blockFlags[ i ] & BLOCK_ISCLEAR) ? BLOCK_ISCLEAR : BLOCK_NEEDCLEAR;

		}

	};

	this.render = function ( scene, camera ) {

		if ( this.autoClear === true ) this.clear();

		var renderData = projector.projectScene( scene, camera );
		var elements = renderData.elements;

		for ( var e = 0, el = elements.length; e < el; e ++ ) {

			var element = elements[ e ];
			var material = element.material;
			var shader = getMaterialShader( material );

			if ( element instanceof THREE.RenderableFace3 ) {

				drawTriangle(
					element.v1.positionScreen,
					element.v2.positionScreen,
					element.v3.positionScreen,
					shader, element, material
				);

			} else if ( element instanceof THREE.RenderableSprite ) {

				var scaleX = element.scale.x * 0.5;
				var scaleY = element.scale.y * 0.5;

				vector1.copy( element );
				vector1.x -= scaleX;
				vector1.y += scaleY;

				vector2.copy( element );
				vector2.x -= scaleX;
				vector2.y -= scaleY;

				vector3.copy( element );
				vector3.x += scaleX;
				vector3.y += scaleY;

				drawTriangle(
					vector1, vector2, vector3,
					shader, element, material
				);

				vector1.copy( element );
				vector1.x += scaleX;
				vector1.y += scaleY;

				vector2.copy( element );
				vector2.x -= scaleX;
				vector2.y -= scaleY;

				vector3.copy( element );
				vector3.x += scaleX;
				vector3.y -= scaleY;

				drawTriangle(
					vector1, vector2, vector3,
					shader, element, material
				);

			}

		}

		finishClear();

		var x = Math.min( rectx1, prevrectx1 );
		var y = Math.min( recty1, prevrecty1 );
		var width = Math.max( rectx2, prevrectx2 ) - x;
		var height = Math.max( recty2, prevrecty2 ) - y;

		/*
		// debug; draw zbuffer

		for ( var i = 0, l = zbuffer.length; i < l; i++ ) {

			var o = i * 4;
			var v = (65535 - zbuffer[ i ]) >> 3;
			data[ o + 0 ] = v;
			data[ o + 1 ] = v;
			data[ o + 2 ] = v;
			data[ o + 3 ] = 255;
		}
		*/

		if ( x !== Infinity ) {

			context.putImageData( imagedata, 0, 0, x, y, width, height );

		}

		prevrectx1 = rectx1; prevrecty1 = recty1;
		prevrectx2 = rectx2; prevrecty2 = recty2;

	};

	function getMaterialShader( material ) {

		var id = material.id;
		var shader = shaders[ id ];

		if ( shaders[ id ] === undefined ) {

			if ( material instanceof THREE.MeshBasicMaterial ||
			     material instanceof THREE.MeshLambertMaterial ||
			     material instanceof THREE.MeshPhongMaterial ||
			     material instanceof THREE.SpriteMaterial ) {

				var string;

				if ( material.vertexColors === THREE.FaceColors ) {

					string = [
						'buffer[ offset ] = face.color.r * 255;',
						'buffer[ offset + 1 ] = face.color.g * 255;',
						'buffer[ offset + 2 ] = face.color.b * 255;',
						'buffer[ offset + 3 ] = material.opacity * 255;',
					].join('\n');

				} else {

					string = [
						'buffer[ offset ] = material.color.r * 255;',
						'buffer[ offset + 1 ] = material.color.g * 255;',
						'buffer[ offset + 2 ] = material.color.b * 255;',
						'buffer[ offset + 3 ] = material.opacity * 255;',
					].join('\n');

				}

				shader = new Function( 'buffer, offset, u, v, face, material', string );

			} else {

				var string = [
					'buffer[ offset ] = u * 255;',
					'buffer[ offset + 1 ] = v * 255;',
					'buffer[ offset + 2 ] = 0;',
					'buffer[ offset + 3 ] = 255;'
				].join('\n');

				shader = new Function( 'buffer, offset, u, v', string );

			}

			shaders[ id ] = shader;

		}

		return shader;

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

				data[ offset += 4 ] = 0;

			}

			offset += linestep;

		}

	}

	function drawTriangle( v1, v2, v3, shader, face, material ) {

		// TODO: Implement per-pixel z-clipping

		if ( v1.z < -1 || v1.z > 1 || v2.z < -1 || v2.z > 1 || v3.z < -1 || v3.z > 1 ) return;

		// https://gist.github.com/2486101
		// explanation: http://pouet.net/topic.php?which=8760&page=1

		// 28.4 fixed-point coordinates

		var x1 = (v1.x * viewportXScale + viewportXOffs) | 0;
		var x2 = (v2.x * viewportXScale + viewportXOffs) | 0;
		var x3 = (v3.x * viewportXScale + viewportXOffs) | 0;

		var y1 = (v1.y * viewportYScale + viewportYOffs) | 0;
		var y2 = (v2.y * viewportYScale + viewportYOffs) | 0;
		var y3 = (v3.y * viewportYScale + viewportYOffs) | 0;

		// Z values (.28 fixed-point)

		var z1 = (v1.z * viewportZScale + viewportZOffs) | 0;
		var z2 = (v2.z * viewportZScale + viewportZOffs) | 0;
		var z3 = (v3.z * viewportZScale + viewportZOffs) | 0;

		// Deltas

		var dx12 = x1 - x2, dy12 = y2 - y1;
		var dx23 = x2 - x3, dy23 = y3 - y2;
		var dx31 = x3 - x1, dy31 = y1 - y3;

		// Bounding rectangle

		var minx = Math.max( ( Math.min( x1, x2, x3 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxx = Math.min( ( Math.max( x1, x2, x3 ) + subpixelBias ) >> subpixelBits, canvasWidth );
		var miny = Math.max( ( Math.min( y1, y2, y3 ) + subpixelBias ) >> subpixelBits, 0 );
		var maxy = Math.min( ( Math.max( y1, y2, y3 ) + subpixelBias ) >> subpixelBits, canvasHeight );

		rectx1 = Math.min( minx, rectx1 );
		rectx2 = Math.max( maxx, rectx2 );
		recty1 = Math.min( miny, recty1 );
		recty2 = Math.max( maxy, recty2 );

		// Block size, standard 8x8 (must be power of two)

		var q = blockSize;

		// Start in corner of 8x8 block

		minx &= ~(q - 1);
		miny &= ~(q - 1);

		// Constant part of half-edge functions

		var c1 = dy12 * ((minx << subpixelBits) - x1) + dx12 * ((miny << subpixelBits) - y1);
		var c2 = dy23 * ((minx << subpixelBits) - x2) + dx23 * ((miny << subpixelBits) - y2);
		var c3 = dy31 * ((minx << subpixelBits) - x3) + dx31 * ((miny << subpixelBits) - y3);

		// Correct for fill convention

		if ( dy12 > 0 || ( dy12 == 0 && dx12 > 0 ) ) c1 ++;
		if ( dy23 > 0 || ( dy23 == 0 && dx23 > 0 ) ) c2 ++;
		if ( dy31 > 0 || ( dy31 == 0 && dx31 > 0 ) ) c3 ++;

		// Note this doesn't kill subpixel precision, but only because we test for >=0 (not >0).
		// It's a bit subtle. :)
		c1 = (c1 - 1) >> subpixelBits;
		c2 = (c2 - 1) >> subpixelBits;
		c3 = (c3 - 1) >> subpixelBits;

		// Z interpolation setup

		var dz12 = z1 - z2, dz31 = z3 - z1;
		var invDet = 1.0 / (dx12*dy31 - dx31*dy12);
		var dzdx = (invDet * (dz12*dy31 - dz31*dy12)); // dz per one subpixel step in x
		var dzdy = (invDet * (dz12*dx31 - dx12*dz31)); // dz per one subpixel step in y

		// Z at top/left corner of rast area

		var cz = ( z1 + ((minx << subpixelBits) - x1) * dzdx + ((miny << subpixelBits) - y1) * dzdy ) | 0;

		// Z pixel steps

		var zfixscale = (1 << subpixelBits);
		dzdx = (dzdx * zfixscale) | 0;
		dzdy = (dzdy * zfixscale) | 0;

		// Set up min/max corners
		var qm1 = q - 1; // for convenience
		var nmin1 = 0, nmax1 = 0;
		var nmin2 = 0, nmax2 = 0;
		var nmin3 = 0, nmax3 = 0;
		var nminz = 0, nmaxz = 0;
		if (dx12 >= 0) nmax1 -= qm1*dx12; else nmin1 -= qm1*dx12;
		if (dy12 >= 0) nmax1 -= qm1*dy12; else nmin1 -= qm1*dy12;
		if (dx23 >= 0) nmax2 -= qm1*dx23; else nmin2 -= qm1*dx23;
		if (dy23 >= 0) nmax2 -= qm1*dy23; else nmin2 -= qm1*dy23;
		if (dx31 >= 0) nmax3 -= qm1*dx31; else nmin3 -= qm1*dx31;
		if (dy31 >= 0) nmax3 -= qm1*dy31; else nmin3 -= qm1*dy31;
		if (dzdx >= 0) nmaxz += qm1*dzdx; else nminz += qm1*dzdx;
		if (dzdy >= 0) nmaxz += qm1*dzdy; else nminz += qm1*dzdy;

		// Loop through blocks
		var linestep = canvasWidth - q;
		var scale = 1.0 / (c1 + c2 + c3);

		var cb1 = c1;
		var cb2 = c2;
		var cb3 = c3;
		var cbz = cz;
		var qstep = -q;
		var e1x = qstep * dy12;
		var e2x = qstep * dy23;
		var e3x = qstep * dy31;
		var ezx = qstep * dzdx;
		var x0 = minx;

		for ( var y0 = miny; y0 < maxy; y0 += q ) {

			// New block line - keep hunting for tri outer edge in old block line dir
			while ( x0 >= minx && x0 < maxx && cb1 >= nmax1 && cb2 >= nmax2 && cb3 >= nmax3 ) {

				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

			}

			// Okay, we're now in a block we know is outside. Reverse direction and go into main loop.
			qstep = -qstep;
			e1x = -e1x;
			e2x = -e2x;
			e3x = -e3x;
			ezx = -ezx;

			while ( 1 ) {

				// Step everything
				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

				// We're done with this block line when at least one edge completely out
				// If an edge function is too small and decreasing in the current traversal
				// dir, we're done with this line.
				if (x0 < minx || x0 >= maxx) break;
				if (cb1 < nmax1) if (e1x < 0) break; else continue;
				if (cb2 < nmax2) if (e2x < 0) break; else continue;
				if (cb3 < nmax3) if (e3x < 0) break; else continue;

				// We can skip this block if it's already fully covered
				var blockX = x0 >> blockShift;
				var blockY = y0 >> blockShift;
				var blockId = blockX + blockY * canvasWBlocks;
				var minz = cbz + nminz;

				// farthest point in block closer than closest point in our tri?
				if ( blockMaxZ[ blockId ] < minz ) continue;

				// Need to do a deferred clear?
				var bflags = blockFlags[ blockId ];
				if ( bflags & BLOCK_NEEDCLEAR) clearBlock( blockX, blockY );
				blockFlags[ blockId ] = bflags & ~( BLOCK_ISCLEAR | BLOCK_NEEDCLEAR );

				// Offset at top-left corner
				var offset = x0 + y0 * canvasWidth;

				// Accept whole block when fully covered
				if ( cb1 >= nmin1 && cb2 >= nmin2 && cb3 >= nmin3 ) {

					var maxz = cbz + nmaxz;
					blockMaxZ[ blockId ] = Math.min( blockMaxZ[ blockId ], maxz );

					var cy1 = cb1;
					var cy2 = cb2;
					var cyz = cbz;

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cxz = cyz;

						for ( var ix = 0; ix < q; ix ++ ) {

							var z = cxz;

							if ( z < zbuffer[ offset ] ) {
								zbuffer[ offset ] = z;
								var u = cx1 * scale;
								var v = cx2 * scale;
								shader( data, offset * 4, u, v, face, material );
							}

							cx1 += dy12;
							cx2 += dy23;
							cxz += dzdx;
							offset++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cyz += dzdy;
						offset += linestep;

					}

				} else { // Partially covered block

					var cy1 = cb1;
					var cy2 = cb2;
					var cy3 = cb3;
					var cyz = cbz;

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cx3 = cy3;
						var cxz = cyz;

						for ( var ix = 0; ix < q; ix ++ ) {

							if ( ( cx1 | cx2 | cx3 ) >= 0 ) {

								var z = cxz;

								if ( z < zbuffer[ offset ] ) {
									var u = cx1 * scale;
									var v = cx2 * scale;

									zbuffer[ offset ] = z;
									shader( data, offset * 4, u, v, face, material );

								}

							}

							cx1 += dy12;
							cx2 += dy23;
							cx3 += dy31;
							cxz += dzdx;
							offset++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cy3 += dx31;
						cyz += dzdy;
						offset += linestep;

					}

				}

			}

			// Advance to next row of blocks
			cb1 += q*dx12;
			cb2 += q*dx23;
			cb3 += q*dx31;
			cbz += q*dzdy;
		}

	}

	function clearBlock( blockX, blockY ) {

		var zoffset = blockX * blockSize + blockY * blockSize * canvasWidth;
		var poffset = zoffset * 4 + 3;

		var zlinestep = canvasWidth - blockSize;
		var plinestep = zlinestep * 4;

		for ( var y = 0; y < blockSize; y ++ ) {

			for ( var x = 0; x < blockSize; x ++ ) {

				zbuffer[ zoffset ] = maxZVal;
				data[ poffset ] = 0;

				zoffset ++;
				poffset += 4;

			}

			zoffset += zlinestep;
			poffset += plinestep;

		}

	}

	function finishClear( ) {

		var block = 0;

		for ( var y = 0; y < canvasHBlocks; y ++ ) {

			for ( var x = 0; x < canvasWBlocks; x ++ ) {

				if ( blockFlags[ block ] & BLOCK_NEEDCLEAR ) {

					clearBlock( x, y );
					blockFlags[ block ] = BLOCK_ISCLEAR;

				}

				block ++;
			}

		}

	}

};
