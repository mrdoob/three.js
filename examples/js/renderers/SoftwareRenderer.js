/**
 * @author mrdoob / http://mrdoob.com/
 * @author ryg / http://farbrausch.de/~fg
 * @author mraleph / http://mrale.ph/
 * @author daoshengmu / http://dsmu.me/
 */

THREE.SoftwareRenderer = function ( parameters ) {

	console.log( 'THREE.SoftwareRenderer', THREE.REVISION );

	parameters = parameters || {};

	var canvas = parameters.canvas !== undefined
			 ? parameters.canvas
			 : document.createElement( 'canvas' );

	var context = canvas.getContext( '2d', {
		alpha: parameters.alpha === true
	} );

	var shaders = {};
	var textures = {};

	var canvasWidth, canvasHeight;
	var canvasWBlocks, canvasHBlocks;
	var viewportXScale, viewportYScale, viewportZScale;
	var viewportXOffs, viewportYOffs, viewportZOffs;

	var clearColor = new THREE.Color( 0x000000 );

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

	var texCoord1 = new THREE.Vector2();
	var texCoord2 = new THREE.Vector2();
	var texCoord3 = new THREE.Vector2();

	this.domElement = canvas;

	this.autoClear = true;

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	this.setClearColor = function ( color, alpha ) {

		clearColor.set( color );
		cleanColorBuffer();
	};

	this.setPixelRatio = function () {};

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

		context.fillStyle = clearColor.getStyle();
		context.fillRect( 0, 0, canvasWidth, canvasHeight );

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

		cleanColorBuffer();

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

		var renderData = projector.projectScene( scene, camera, false, false );
		var elements = renderData.elements;

		for ( var e = 0, el = elements.length; e < el; e ++ ) {

			var element = elements[ e ];
			var material = element.material;
			var shader = getMaterialShader( material );

			if ( element instanceof THREE.RenderableFace ) {

				if ( !element.uvs ) {

					drawTriangle(
						element.v1.positionScreen,
						element.v2.positionScreen,
						element.v3.positionScreen,
						null, null, null,
						shader, element, material
					);
				} else {

					drawTriangle(
						element.v1.positionScreen,
						element.v2.positionScreen,
						element.v3.positionScreen,
						element.uvs[0], element.uvs[1], element.uvs[2],
						shader, element, material
					);
				}


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

				if ( material.map ) {

					texCoord1.set( 0, 1 );
					texCoord2.set( 0, 0 );
					texCoord3.set( 1, 1 );

					drawTriangle(
						vector1, vector2, vector3,
						texCoord1, texCoord2, texCoord3,
						shader, element, material
					);

				} else {

					drawTriangle(
						vector1, vector2, vector3,
						null, null, null,
						shader, element, material
					);

				}

				vector1.copy( element );
				vector1.x += scaleX;
				vector1.y += scaleY;

				vector2.copy( element );
				vector2.x -= scaleX;
				vector2.y -= scaleY;

				vector3.copy( element );
				vector3.x += scaleX;
				vector3.y -= scaleY;

				if ( material.map ) {

					texCoord1.set( 1, 1 );
					texCoord2.set( 0, 0 );
					texCoord3.set( 1, 0 );

					drawTriangle(
						vector1, vector2, vector3,
						texCoord1, texCoord2, texCoord3,
						shader, element, material
					);

				} else {

					drawTriangle(
						vector1, vector2, vector3,
						null, null, null,
						shader, element, material
					);

				}

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

	function cleanColorBuffer() {

		var size = canvasWidth * canvasHeight * 4;

		for ( var i = 0; i < size; i+=4 ) {

			data[ i ] = clearColor.r * 255 | 0;
			data[ i + 1 ] = clearColor.g * 255 | 0;
			data[ i + 2 ] = clearColor.b * 255 | 0;
			data[ i + 3 ] = 255;
		}

		context.fillStyle = clearColor.getStyle();
		context.fillRect( 0, 0, canvasWidth, canvasHeight );
	}

	function getPalette( material, bSimulateSpecular ) {
		var i = 0, j = 0;
		var diffuseR = material.color.r * 255;
		var diffuseG = material.color.g * 255;
		var diffuseB = material.color.b * 255;
		var palette = new Uint8Array(256 * 3);

		if ( bSimulateSpecular ) {

			while (i < 204) {
				palette[j ++] = Math.min( i * diffuseR / 204, 255 );
				palette[j ++] = Math.min( i * diffuseG / 204, 255 );
				palette[j ++] = Math.min( i * diffuseB / 204, 255 );
				++ i;
			}

			while (i < 256) { // plus specular highlight
				palette[j ++] = Math.min( diffuseR + (i - 204) * (255 - diffuseR) / 82, 255 );
				palette[j ++] = Math.min( diffuseG + (i - 204) * (255 - diffuseG) / 82, 255 );
				palette[j ++] = Math.min( diffuseB + (i - 204) * (255 - diffuseB) / 82, 255 );
				++ i;
			}

		} else {

			while (i < 256) {
				palette[j ++] = Math.min( i * diffuseR / 255, 255 );
				palette[j ++] = Math.min( i * diffuseG / 255, 255 );
				palette[j ++] = Math.min( i * diffuseB / 255, 255 );
				++ i;
			}

		}

		return palette;
	}

	function basicMaterialShader( buffer, depthBuf, offset, depth, u, v, n, face, material ) {

		var colorOffset = offset * 4;

		var texture = textures[ material.map.id ];

		if ( !texture.data )
			return;

		var tdim = texture.width;
		var isTransparent = material.transparent;
		var tbound = tdim - 1;
		var tdata = texture.data;
		var tIndex = (((v * tdim) & tbound) * tdim + ((u * tdim) & tbound)) * 4;

		if ( !isTransparent ) {
			buffer[ colorOffset ] = tdata[tIndex];
			buffer[ colorOffset + 1 ] = tdata[tIndex + 1];
			buffer[ colorOffset + 2 ] = tdata[tIndex + 2];
			buffer[ colorOffset + 3 ] = material.opacity * 255;
			depthBuf[ offset ] = depth;
		}
		else {
			var opaci = tdata[tIndex + 3] * material.opacity;
			var texel = (tdata[tIndex] << 16) + (tdata[tIndex + 1] << 8) + tdata[tIndex + 2];
			if (opaci < 250) {
				var backColor = (buffer[colorOffset] << 16) + (buffer[colorOffset + 1] << 8) + buffer[colorOffset + 2];
				texel = texel * opaci + backColor * (1 - opaci);
			}

			buffer[ colorOffset ] = (texel & 0xff0000) >> 16;
			buffer[ colorOffset + 1 ] = (texel & 0xff00) >> 8;
			buffer[ colorOffset + 2 ] = texel & 0xff;
			buffer[ colorOffset + 3 ] = material.opacity * 255;
		}
	}

	function lightingMaterialShader( buffer, depthBuf, offset, depth, u, v, n, face, material ) {

		var colorOffset = offset * 4;

		var texture = textures[ material.map.id ];

		if ( !texture.data )
			return;

		var tdim = texture.width;
		var isTransparent = material.transparent;
		var cIndex = (n > 0 ? (~~n) : 0) * 3;
		var tbound = tdim - 1;
		var tdata = texture.data;
		var tIndex = (((v * tdim) & tbound) * tdim + ((u * tdim) & tbound)) * 4;

		if ( !isTransparent ) {
			buffer[ colorOffset ] = (material.palette[cIndex] * tdata[tIndex]) >> 8;
			buffer[ colorOffset + 1 ] = (material.palette[cIndex + 1] * tdata[tIndex + 1]) >> 8;
			buffer[ colorOffset + 2 ] = (material.palette[cIndex + 2] * tdata[tIndex + 2]) >> 8;
			buffer[ colorOffset + 3 ] = material.opacity * 255;
			depthBuf[ offset ] = depth;
		} else {
			var opaci = tdata[tIndex + 3] * material.opacity;
			var foreColor = ((material.palette[cIndex] * tdata[tIndex]) << 16)
							+ ((material.palette[cIndex + 1] * tdata[tIndex + 1]) << 8 )
							+ (material.palette[cIndex + 2] * tdata[tIndex + 2]);

			if (opaci < 250) {
				var backColor = buffer[ colorOffset ] << 24 + buffer[ colorOffset + 1 ] << 16 + buffer[ colorOffset + 2 ] << 8;
				foreColor = foreColor * opaci + backColor * (1 - opaci);
			}

			buffer[ colorOffset ] = (foreColor & 0xff0000) >> 16;
			buffer[ colorOffset + 1 ] = (foreColor & 0xff00) >> 8;
			buffer[ colorOffset + 2 ] = (foreColor & 0xff);
			buffer[ colorOffset + 3 ] = material.opacity * 255;
		}

	}

	function onMaterialUpdate ( event ) {

		var material = event.target;

		material.removeEventListener( 'update', onMaterialUpdate );

		delete shaders[ material.id ];

	}

	function getMaterialShader( material ) {

		var id = material.id;
		var shader = shaders[ id ];

		if ( shaders[ id ] === undefined ) {

			material.addEventListener( 'update', onMaterialUpdate );

			if ( material instanceof THREE.MeshBasicMaterial ||
				 material instanceof THREE.MeshLambertMaterial ||
				 material instanceof THREE.MeshPhongMaterial ||
				 material instanceof THREE.SpriteMaterial ) {

				if ( material instanceof THREE.MeshLambertMaterial ) {
					// Generate color palette
					if ( !material.palette ) {
						material.palette = getPalette( material, false );
					}

				} else if ( material instanceof THREE.MeshPhongMaterial ) {
					// Generate color palette
					if ( !material.palette ) {
						material.palette = getPalette( material, true );
					}
				}

				var string;

				if ( material.map ) {

					var texture = new THREE.SoftwareRenderer.Texture();
					texture.fromImage( material.map.image );

					material.map.addEventListener( 'update', function ( event ) {

						texture.fromImage( event.target.image );

					} );

					textures[ material.map.id ] = texture;

					if ( material instanceof THREE.MeshBasicMaterial
						|| material instanceof THREE.SpriteMaterial ) {

						shader = basicMaterialShader;
					} else {

						shader = lightingMaterialShader;
					}


				} else {

					if ( material.vertexColors === THREE.FaceColors ) {

						string = [
							'var colorOffset = offset * 4;',
							'buffer[ colorOffset ] = face.color.r * 255;',
							'buffer[ colorOffset + 1 ] = face.color.g * 255;',
							'buffer[ colorOffset + 2 ] = face.color.b * 255;',
							'buffer[ colorOffset + 3 ] = material.opacity * 255;',
							'depthBuf[ offset ] = depth;'
						].join('\n');

					} else {

						string = [
							'var colorOffset = offset * 4;',
							'buffer[ colorOffset ] = material.color.r * 255;',
							'buffer[ colorOffset + 1 ] = material.color.g * 255;',
							'buffer[ colorOffset + 2 ] = material.color.b * 255;',
							'buffer[ colorOffset + 3 ] = material.opacity * 255;',
							'depthBuf[ offset ] = depth;'
						].join('\n');

					}

					shader = new Function( 'buffer, depthBuf, offset, depth, u, v, n, face, material', string );
				}

			} else {

				var string = [
					'var colorOffset = offset * 4;',
					'buffer[ colorOffset ] = u * 255;',
					'buffer[ colorOffset + 1 ] = v * 255;',
					'buffer[ colorOffset + 2 ] = 0;',
					'buffer[ colorOffset + 3 ] = 255;',
					'depthBuf[ offset ] = depth;'
				].join('\n');

				shader = new Function( 'buffer, depthBuf, offset, depth, u, v', string );

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

	function drawTriangle( v1, v2, v3, uv1, uv2, uv3, shader, face, material ) {

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

		// UV values
		var bHasUV = false;
		var tu1, tv1, tu2, tv2, tu3, tv3;

		if ( uv1 && uv2 && uv3 ) {
			bHasUV = true;

			tu1 = uv1.x;
			tv1 = 1 - uv1.y;
			tu2 = uv2.x;
			tv2 = 1 - uv2.y;
			tu3 = uv3.x;
			tv3 = 1 - uv3.y;
		}

		// Normal values
		var bHasNormal = false;
		var n1, n2, n3, nz1, nz2, nz3;

		if ( face.vertexNormalsModel ) {
			bHasNormal = true;

			n1 = face.vertexNormalsModel[0];
			n2 = face.vertexNormalsModel[1];
			n3 = face.vertexNormalsModel[2];
			nz1 = n1.z * 255;
			nz2 = n2.z * 255;
			nz3 = n3.z * 255;
		}

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

		var minXfixscale = (minx << subpixelBits);
		var minYfixscale = (miny << subpixelBits);

		var c1 = dy12 * ((minXfixscale) - x1) + dx12 * ((minYfixscale) - y1);
		var c2 = dy23 * ((minXfixscale) - x2) + dx23 * ((minYfixscale) - y2);
		var c3 = dy31 * ((minXfixscale) - x3) + dx31 * ((minYfixscale) - y3);

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
		var invDet = 1.0 / (dx12 * dy31 - dx31 * dy12);
		var dzdx = (invDet * (dz12 * dy31 - dz31 * dy12)); // dz per one subpixel step in x
		var dzdy = (invDet * (dz12 * dx31 - dx12 * dz31)); // dz per one subpixel step in y

		// Z at top/left corner of rast area

		var cz = ( z1 + ((minXfixscale) - x1) * dzdx + ((minYfixscale) - y1) * dzdy ) | 0;

		// Z pixel steps

		var fixscale = (1 << subpixelBits);
		dzdx = (dzdx * fixscale) | 0;
		dzdy = (dzdy * fixscale) | 0;

		var dtvdx, dtvdy, cbtu, cbtv;
		if ( bHasUV ) {
			// UV interpolation setup
			var dtu12 = tu1 - tu2, dtu31 = tu3 - tu1;
			var dtudx = (invDet * (dtu12 * dy31 - dtu31 * dy12)); // dtu per one subpixel step in x
			var dtudy = (invDet * (dtu12 * dx31 - dx12 * dtu31)); // dtu per one subpixel step in y
			var dtv12 = tv1 - tv2, dtv31 = tv3 - tv1;
			dtvdx = (invDet * (dtv12 * dy31 - dtv31 * dy12)); // dtv per one subpixel step in x
			dtvdy = (invDet * (dtv12 * dx31 - dx12 * dtv31)); // dtv per one subpixel step in y

			// UV at top/left corner of rast area
			cbtu = ( tu1 + (minXfixscale - x1) * dtudx + (minYfixscale - y1) * dtudy );
			cbtv = ( tv1 + (minXfixscale - x1) * dtvdx + (minYfixscale - y1) * dtvdy );

			// UV pixel steps
			dtudx = dtudx * fixscale;
			dtudy = dtudy * fixscale;
			dtvdx = dtvdx * fixscale;
			dtvdy = dtvdy * fixscale;
		}

		var dnxdx, dnzdy, cbnz;
		if ( bHasNormal ) {
			 // Normal interpolation setup
			var dnz12 = nz1 - nz2, dnz31 = nz3 - nz1;
			var dnzdx = (invDet * (dnz12 * dy31 - dnz31 * dy12)); // dnz per one subpixel step in x
			var dnzdy = (invDet * (dnz12 * dx31 - dx12 * dnz31)); // dnz per one subpixel step in y

			// Normal at top/left corner of rast area
			cbnz = ( nz1 + (minXfixscale - x1) * dnzdx + (minYfixscale - y1) * dnzdy );

			// Normal pixel steps
			dnzdx = (dnzdx * fixscale);
			dnzdy = (dnzdy * fixscale);
		}

		// Set up min/max corners
		var qm1 = q - 1; // for convenience
		var nmin1 = 0, nmax1 = 0;
		var nmin2 = 0, nmax2 = 0;
		var nmin3 = 0, nmax3 = 0;
		var nminz = 0, nmaxz = 0;
		if (dx12 >= 0) nmax1 -= qm1 * dx12; else nmin1 -= qm1 * dx12;
		if (dy12 >= 0) nmax1 -= qm1 * dy12; else nmin1 -= qm1 * dy12;
		if (dx23 >= 0) nmax2 -= qm1 * dx23; else nmin2 -= qm1 * dx23;
		if (dy23 >= 0) nmax2 -= qm1 * dy23; else nmin2 -= qm1 * dy23;
		if (dx31 >= 0) nmax3 -= qm1 * dx31; else nmin3 -= qm1 * dx31;
		if (dy31 >= 0) nmax3 -= qm1 * dy31; else nmin3 -= qm1 * dy31;
		if (dzdx >= 0) nmaxz += qm1 * dzdx; else nminz += qm1 * dzdx;
		if (dzdy >= 0) nmaxz += qm1 * dzdy; else nminz += qm1 * dzdy;

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

		var etux, etvx;
		if ( bHasUV ) {
			etux = qstep * dtudx;
			etvx = qstep * dtvdx;
		}

		var enzx;
		if ( bHasNormal ) {
			enzx = qstep * dnzdx;
		}

		var x0 = minx;

		for ( var y0 = miny; y0 < maxy; y0 += q ) {

			// New block line - keep hunting for tri outer edge in old block line dir
			while ( x0 >= minx && x0 < maxx && cb1 >= nmax1 && cb2 >= nmax2 && cb3 >= nmax3 ) {

				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

				if ( bHasUV ) {
					cbtu += etux;
					cbtv += etvx;
				}

				if ( bHasNormal ) {
					cbnz += enzx;
				}

			}

			// Okay, we're now in a block we know is outside. Reverse direction and go into main loop.
			qstep = -qstep;
			e1x = -e1x;
			e2x = -e2x;
			e3x = -e3x;
			ezx = -ezx;

			if ( bHasUV ) {
				etux = -etux;
				etvx = -etvx;
			}

			if ( bHasNormal ) {
				enzx = -enzx;
			}

			while ( 1 ) {

				// Step everything
				x0 += qstep;
				cb1 += e1x;
				cb2 += e2x;
				cb3 += e3x;
				cbz += ezx;

				if ( bHasUV ) {
					cbtu += etux;
					cbtv += etvx;
				}

				if ( bHasNormal ) {
					cbnz += enzx;
				}

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

					var cytu, cytv;
					if ( bHasUV ) {
						cytu = cbtu;
						cytv = cbtv;
					}

					var cynz;
					if ( bHasNormal ) {
						cynz = cbnz;
					}


					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cxz = cyz;

						var cxtu;
						var cxtv;
						if ( bHasUV ) {
							cxtu = cytu;
							cxtv = cytv;
						}

						var cxnz;
						if ( bHasNormal ) {
							cxnz = cynz;
						}

						for ( var ix = 0; ix < q; ix ++ ) {

							var z = cxz;

							if ( z < zbuffer[ offset ] ) {
								shader( data, zbuffer, offset, z, cxtu, cxtv, cxnz, face, material );
							}

							cx1 += dy12;
							cx2 += dy23;
							cxz += dzdx;

							if ( bHasUV ) {
								cxtu += dtudx;
								cxtv += dtvdx;
							}

							if ( bHasNormal ) {
								cxnz += dnzdx;
							}

							offset ++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cyz += dzdy;

						if ( bHasUV ) {
							cytu += dtudy;
							cytv += dtvdy;
						}

						if ( bHasNormal ) {
							cynz += dnzdy;
						}

						offset += linestep;

					}

				} else { // Partially covered block

					var cy1 = cb1;
					var cy2 = cb2;
					var cy3 = cb3;
					var cyz = cbz;

					var cytu, cytv;
					if ( bHasUV ) {
						cytu = cbtu;
						cytv = cbtv;
					}

					var cynz;
					if ( bHasNormal ) {
						cynz = cbnz;
					}

					for ( var iy = 0; iy < q; iy ++ ) {

						var cx1 = cy1;
						var cx2 = cy2;
						var cx3 = cy3;
						var cxz = cyz;

						var cxtu;
						var cxtv;
						if ( bHasUV ) {
							cxtu = cytu;
							cxtv = cytv;
						}

						var cxnz;
						if ( bHasNormal ) {
							cxnz = cynz;
						}

						for ( var ix = 0; ix < q; ix ++ ) {

							if ( ( cx1 | cx2 | cx3 ) >= 0 ) {

								var z = cxz;

								if ( z < zbuffer[ offset ] ) {
									shader( data, zbuffer, offset, z, cxtu, cxtv, cxnz, face, material );
								}

							}

							cx1 += dy12;
							cx2 += dy23;
							cx3 += dy31;
							cxz += dzdx;

							if ( bHasUV ) {
								cxtu += dtudx;
								cxtv += dtvdx;
							}

							if ( bHasNormal ) {
								cxnz += dnzdx;
							}

							offset ++;

						}

						cy1 += dx12;
						cy2 += dx23;
						cy3 += dx31;
						cyz += dzdy;

						if ( bHasUV ) {
							cytu += dtudy;
							cytv += dtvdy;
						}

						if ( bHasNormal ) {
							cynz += dnzdy;
						}

						offset += linestep;

					}

				}

			}

			// Advance to next row of blocks
			cb1 += q * dx12;
			cb2 += q * dx23;
			cb3 += q * dx31;
			cbz += q * dzdy;

			if ( bHasUV ) {
				cbtu += q * dtudy;
				cbtv += q * dtvdy;
			}

			if ( bHasNormal ) {
				cbnz += q * dnzdy;
			}

		}

	}

	function clearBlock( blockX, blockY ) {

		var zoffset = blockX * blockSize + blockY * blockSize * canvasWidth;
		var poffset = zoffset * 4;

		var zlinestep = canvasWidth - blockSize;
		var plinestep = zlinestep * 4;

		for ( var y = 0; y < blockSize; y ++ ) {

			for ( var x = 0; x < blockSize; x ++ ) {

				zbuffer[ zoffset ++ ] = maxZVal;

				data[ poffset ++ ] = clearColor.r * 255 | 0;
				data[ poffset ++ ] = clearColor.g * 255 | 0;
				data[ poffset ++ ] = clearColor.b * 255 | 0;
				data[ poffset ++ ] = 255;

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

THREE.SoftwareRenderer.Texture = function() {

	var canvas;

	this.fromImage = function( image ) {

		if ( !image || image.width <= 0 || image.height <= 0 )
			return;

		if ( canvas === undefined ) {

			canvas = document.createElement( 'canvas' );

		}

		var size = image.width > image.height ? image.width : image.height;
		size = THREE.Math.nextPowerOfTwo( size );

		if ( canvas.width != size || canvas.height != size) {
			canvas.width = size;
			canvas.height = size;
		}

		var ctx = canvas.getContext('2d');
		ctx.clearRect( 0, 0, size, size );
		ctx.drawImage( image, 0, 0, size, size );

		var imgData = ctx.getImageData( 0, 0, size, size );

		this.data = imgData.data;
		this.width = size;
		this.height = size;
		this.srcUrl = image.src;
	};
};
