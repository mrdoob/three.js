( function () {

	class RGBMLoader extends THREE.DataTextureLoader {

		loadCubemap( urls, onLoad, onProgress, onError ) {

			const texture = new THREE.CubeTexture();
			let loaded = 0;
			const scope = this;

			function loadTexture( i ) {

				scope.load( urls[ i ], function ( image ) {

					texture.images[ i ] = image;
					loaded ++;

					if ( loaded === 6 ) {

						texture.needsUpdate = true;
						if ( onLoad ) onLoad( texture );

					}

				}, undefined, onError );

			}

			for ( let i = 0; i < urls.length; ++ i ) {

				loadTexture( i );

			}

			texture.encoding = THREE.RGBM7Encoding;
			texture.format = THREE.RGBAFormat;
			texture.minFilter = THREE.LinearFilter;
			texture.generateMipmaps = false;
			return texture;

		}

		parse( buffer ) {

			const img = UPNG.decode( buffer );
			const rgba = UPNG.toRGBA8( img )[ 0 ];
			return {
				width: img.width,
				height: img.height,
				data: new Uint8Array( rgba ),
				format: THREE.RGBAFormat,
				type: THREE.UnsignedByteType,
				flipY: true,
				encoding: THREE.RGBM7Encoding
			};

		}

	} // from https://github.com/photopea/UPNG.js (MIT License)


	var UPNG = {};

	UPNG.toRGBA8 = function ( out ) {

		var w = out.width,
			h = out.height;
		if ( out.tabs.acTL == null ) return [ UPNG.toRGBA8.decodeImage( out.data, w, h, out ).buffer ];
		var frms = [];
		if ( out.frames[ 0 ].data == null ) out.frames[ 0 ].data = out.data;
		var len = w * h * 4,
			img = new Uint8Array( len ),
			empty = new Uint8Array( len ),
			prev = new Uint8Array( len );

		for ( var i = 0; i < out.frames.length; i ++ ) {

			var frm = out.frames[ i ];
			var fx = frm.rect.x,
				fy = frm.rect.y,
				fw = frm.rect.width,
				fh = frm.rect.height;
			var fdata = UPNG.toRGBA8.decodeImage( frm.data, fw, fh, out );
			if ( i != 0 ) for ( var j = 0; j < len; j ++ ) prev[ j ] = img[ j ];
			if ( frm.blend == 0 ) UPNG._copyTile( fdata, fw, fh, img, w, h, fx, fy, 0 ); else if ( frm.blend == 1 ) UPNG._copyTile( fdata, fw, fh, img, w, h, fx, fy, 1 );
			frms.push( img.buffer.slice( 0 ) );

			if ( frm.dispose == 0 ) {} else if ( frm.dispose == 1 ) UPNG._copyTile( empty, fw, fh, img, w, h, fx, fy, 0 ); else if ( frm.dispose == 2 ) for ( var j = 0; j < len; j ++ ) img[ j ] = prev[ j ];

		}

		return frms;

	};

	UPNG.toRGBA8.decodeImage = function ( data, w, h, out ) {

		var area = w * h,
			bpp = UPNG.decode._getBPP( out );

		var bpl = Math.ceil( w * bpp / 8 ); // bytes per line

		var bf = new Uint8Array( area * 4 ),
			bf32 = new Uint32Array( bf.buffer );
		var ctype = out.ctype,
			depth = out.depth;
		var rs = UPNG._bin.readUshort;

		if ( ctype == 6 ) {

			// RGB + alpha
			var qarea = area << 2;
			if ( depth == 8 ) for ( var i = 0; i < qarea; i += 4 ) {

				bf[ i ] = data[ i ];
				bf[ i + 1 ] = data[ i + 1 ];
				bf[ i + 2 ] = data[ i + 2 ];
				bf[ i + 3 ] = data[ i + 3 ];

			}

			if ( depth == 16 ) for ( var i = 0; i < qarea; i ++ ) {

				bf[ i ] = data[ i << 1 ];

			}

		} else if ( ctype == 2 ) {

			// RGB
			var ts = out.tabs[ 'tRNS' ];

			if ( ts == null ) {

				if ( depth == 8 ) for ( var i = 0; i < area; i ++ ) {

					var ti = i * 3;
					bf32[ i ] = 255 << 24 | data[ ti + 2 ] << 16 | data[ ti + 1 ] << 8 | data[ ti ];

				}

				if ( depth == 16 ) for ( var i = 0; i < area; i ++ ) {

					var ti = i * 6;
					bf32[ i ] = 255 << 24 | data[ ti + 4 ] << 16 | data[ ti + 2 ] << 8 | data[ ti ];

				}

			} else {

				var tr = ts[ 0 ],
					tg = ts[ 1 ],
					tb = ts[ 2 ];
				if ( depth == 8 ) for ( var i = 0; i < area; i ++ ) {

					var qi = i << 2,
						ti = i * 3;
					bf32[ i ] = 255 << 24 | data[ ti + 2 ] << 16 | data[ ti + 1 ] << 8 | data[ ti ];
					if ( data[ ti ] == tr && data[ ti + 1 ] == tg && data[ ti + 2 ] == tb ) bf[ qi + 3 ] = 0;

				}

				if ( depth == 16 ) for ( var i = 0; i < area; i ++ ) {

					var qi = i << 2,
						ti = i * 6;
					bf32[ i ] = 255 << 24 | data[ ti + 4 ] << 16 | data[ ti + 2 ] << 8 | data[ ti ];
					if ( rs( data, ti ) == tr && rs( data, ti + 2 ) == tg && rs( data, ti + 4 ) == tb ) bf[ qi + 3 ] = 0;

				}

			}

		} else if ( ctype == 3 ) {

			// palette
			var p = out.tabs[ 'PLTE' ],
				ap = out.tabs[ 'tRNS' ],
				tl = ap ? ap.length : 0; //console.log(p, ap);

			if ( depth == 1 ) for ( var y = 0; y < h; y ++ ) {

				var s0 = y * bpl,
					t0 = y * w;

				for ( var i = 0; i < w; i ++ ) {

					var qi = t0 + i << 2,
						j = data[ s0 + ( i >> 3 ) ] >> 7 - ( ( i & 7 ) << 0 ) & 1,
						cj = 3 * j;
					bf[ qi ] = p[ cj ];
					bf[ qi + 1 ] = p[ cj + 1 ];
					bf[ qi + 2 ] = p[ cj + 2 ];
					bf[ qi + 3 ] = j < tl ? ap[ j ] : 255;

				}

			}

			if ( depth == 2 ) for ( var y = 0; y < h; y ++ ) {

				var s0 = y * bpl,
					t0 = y * w;

				for ( var i = 0; i < w; i ++ ) {

					var qi = t0 + i << 2,
						j = data[ s0 + ( i >> 2 ) ] >> 6 - ( ( i & 3 ) << 1 ) & 3,
						cj = 3 * j;
					bf[ qi ] = p[ cj ];
					bf[ qi + 1 ] = p[ cj + 1 ];
					bf[ qi + 2 ] = p[ cj + 2 ];
					bf[ qi + 3 ] = j < tl ? ap[ j ] : 255;

				}

			}

			if ( depth == 4 ) for ( var y = 0; y < h; y ++ ) {

				var s0 = y * bpl,
					t0 = y * w;

				for ( var i = 0; i < w; i ++ ) {

					var qi = t0 + i << 2,
						j = data[ s0 + ( i >> 1 ) ] >> 4 - ( ( i & 1 ) << 2 ) & 15,
						cj = 3 * j;
					bf[ qi ] = p[ cj ];
					bf[ qi + 1 ] = p[ cj + 1 ];
					bf[ qi + 2 ] = p[ cj + 2 ];
					bf[ qi + 3 ] = j < tl ? ap[ j ] : 255;

				}

			}

			if ( depth == 8 ) for ( var i = 0; i < area; i ++ ) {

				var qi = i << 2,
					j = data[ i ],
					cj = 3 * j;
				bf[ qi ] = p[ cj ];
				bf[ qi + 1 ] = p[ cj + 1 ];
				bf[ qi + 2 ] = p[ cj + 2 ];
				bf[ qi + 3 ] = j < tl ? ap[ j ] : 255;

			}

		} else if ( ctype == 4 ) {

			// gray + alpha
			if ( depth == 8 ) for ( var i = 0; i < area; i ++ ) {

				var qi = i << 2,
					di = i << 1,
					gr = data[ di ];
				bf[ qi ] = gr;
				bf[ qi + 1 ] = gr;
				bf[ qi + 2 ] = gr;
				bf[ qi + 3 ] = data[ di + 1 ];

			}

			if ( depth == 16 ) for ( var i = 0; i < area; i ++ ) {

				var qi = i << 2,
					di = i << 2,
					gr = data[ di ];
				bf[ qi ] = gr;
				bf[ qi + 1 ] = gr;
				bf[ qi + 2 ] = gr;
				bf[ qi + 3 ] = data[ di + 2 ];

			}

		} else if ( ctype == 0 ) {

			// gray
			var tr = out.tabs[ 'tRNS' ] ? out.tabs[ 'tRNS' ] : - 1;

			for ( var y = 0; y < h; y ++ ) {

				var off = y * bpl,
					to = y * w;
				if ( depth == 1 ) for ( var x = 0; x < w; x ++ ) {

					var gr = 255 * ( data[ off + ( x >>> 3 ) ] >>> 7 - ( x & 7 ) & 1 ),
						al = gr == tr * 255 ? 0 : 255;
					bf32[ to + x ] = al << 24 | gr << 16 | gr << 8 | gr;

				} else if ( depth == 2 ) for ( var x = 0; x < w; x ++ ) {

					var gr = 85 * ( data[ off + ( x >>> 2 ) ] >>> 6 - ( ( x & 3 ) << 1 ) & 3 ),
						al = gr == tr * 85 ? 0 : 255;
					bf32[ to + x ] = al << 24 | gr << 16 | gr << 8 | gr;

				} else if ( depth == 4 ) for ( var x = 0; x < w; x ++ ) {

					var gr = 17 * ( data[ off + ( x >>> 1 ) ] >>> 4 - ( ( x & 1 ) << 2 ) & 15 ),
						al = gr == tr * 17 ? 0 : 255;
					bf32[ to + x ] = al << 24 | gr << 16 | gr << 8 | gr;

				} else if ( depth == 8 ) for ( var x = 0; x < w; x ++ ) {

					var gr = data[ off + x ],
						al = gr == tr ? 0 : 255;
					bf32[ to + x ] = al << 24 | gr << 16 | gr << 8 | gr;

				} else if ( depth == 16 ) for ( var x = 0; x < w; x ++ ) {

					var gr = data[ off + ( x << 1 ) ],
						al = rs( data, off + ( x << i ) ) == tr ? 0 : 255;
					bf32[ to + x ] = al << 24 | gr << 16 | gr << 8 | gr;

				}

			}

		} //console.log(Date.now()-time);


		return bf;

	};

	UPNG.decode = function ( buff ) {

		var data = new Uint8Array( buff ),
			offset = 8,
			bin = UPNG._bin,
			rUs = bin.readUshort,
			rUi = bin.readUint;
		var out = {
			tabs: {},
			frames: []
		};
		var dd = new Uint8Array( data.length ),
			doff = 0; // put all IDAT data into it

		var fd,
			foff = 0; // frames

		var mgck = [ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a ];

		for ( var i = 0; i < 8; i ++ ) if ( data[ i ] != mgck[ i ] ) throw 'The input is not a PNG file!';

		while ( offset < data.length ) {

			var len = bin.readUint( data, offset );
			offset += 4;
			var type = bin.readASCII( data, offset, 4 );
			offset += 4; //console.log(type,len);

			if ( type == 'IHDR' ) {

				UPNG.decode._IHDR( data, offset, out );

			} else if ( type == 'CgBI' ) {

				out.tabs[ type ] = data.slice( offset, offset + 4 );

			} else if ( type == 'IDAT' ) {

				for ( var i = 0; i < len; i ++ ) dd[ doff + i ] = data[ offset + i ];

				doff += len;

			} else if ( type == 'acTL' ) {

				out.tabs[ type ] = {
					num_frames: rUi( data, offset ),
					num_plays: rUi( data, offset + 4 )
				};
				fd = new Uint8Array( data.length );

			} else if ( type == 'fcTL' ) {

				if ( foff != 0 ) {

					var fr = out.frames[ out.frames.length - 1 ];
					fr.data = UPNG.decode._decompress( out, fd.slice( 0, foff ), fr.rect.width, fr.rect.height );
					foff = 0;

				}

				var rct = {
					x: rUi( data, offset + 12 ),
					y: rUi( data, offset + 16 ),
					width: rUi( data, offset + 4 ),
					height: rUi( data, offset + 8 )
				};
				var del = rUs( data, offset + 22 );
				del = rUs( data, offset + 20 ) / ( del == 0 ? 100 : del );
				var frm = {
					rect: rct,
					delay: Math.round( del * 1000 ),
					dispose: data[ offset + 24 ],
					blend: data[ offset + 25 ]
				}; //console.log(frm);

				out.frames.push( frm );

			} else if ( type == 'fdAT' ) {

				for ( var i = 0; i < len - 4; i ++ ) fd[ foff + i ] = data[ offset + i + 4 ];

				foff += len - 4;

			} else if ( type == 'pHYs' ) {

				out.tabs[ type ] = [ bin.readUint( data, offset ), bin.readUint( data, offset + 4 ), data[ offset + 8 ] ];

			} else if ( type == 'cHRM' ) {

				out.tabs[ type ] = [];

				for ( var i = 0; i < 8; i ++ ) out.tabs[ type ].push( bin.readUint( data, offset + i * 4 ) );

			} else if ( type == 'tEXt' || type == 'zTXt' ) {

				if ( out.tabs[ type ] == null ) out.tabs[ type ] = {};
				var nz = bin.nextZero( data, offset );
				var keyw = bin.readASCII( data, offset, nz - offset );
				var text,
					tl = offset + len - nz - 1;
				if ( type == 'tEXt' ) text = bin.readASCII( data, nz + 1, tl ); else {

					var bfr = UPNG.decode._inflate( data.slice( nz + 2, nz + 2 + tl ) );

					text = bin.readUTF8( bfr, 0, bfr.length );

				}

				out.tabs[ type ][ keyw ] = text;

			} else if ( type == 'iTXt' ) {

				if ( out.tabs[ type ] == null ) out.tabs[ type ] = {};
				var nz = 0,
					off = offset;
				nz = bin.nextZero( data, off );
				var keyw = bin.readASCII( data, off, nz - off );
				off = nz + 1;
				var cflag = data[ off ];
				off += 2;
				nz = bin.nextZero( data, off );
				bin.readASCII( data, off, nz - off );
				off = nz + 1;
				nz = bin.nextZero( data, off );
				bin.readUTF8( data, off, nz - off );
				off = nz + 1;
				var text,
					tl = len - ( off - offset );
				if ( cflag == 0 ) text = bin.readUTF8( data, off, tl ); else {

					var bfr = UPNG.decode._inflate( data.slice( off, off + tl ) );

					text = bin.readUTF8( bfr, 0, bfr.length );

				}

				out.tabs[ type ][ keyw ] = text;

			} else if ( type == 'PLTE' ) {

				out.tabs[ type ] = bin.readBytes( data, offset, len );

			} else if ( type == 'hIST' ) {

				var pl = out.tabs[ 'PLTE' ].length / 3;
				out.tabs[ type ] = [];

				for ( var i = 0; i < pl; i ++ ) out.tabs[ type ].push( rUs( data, offset + i * 2 ) );

			} else if ( type == 'tRNS' ) {

				if ( out.ctype == 3 ) out.tabs[ type ] = bin.readBytes( data, offset, len ); else if ( out.ctype == 0 ) out.tabs[ type ] = rUs( data, offset ); else if ( out.ctype == 2 ) out.tabs[ type ] = [ rUs( data, offset ), rUs( data, offset + 2 ), rUs( data, offset + 4 ) ]; //else console.log("tRNS for unsupported color type",out.ctype, len);

			} else if ( type == 'gAMA' ) out.tabs[ type ] = bin.readUint( data, offset ) / 100000; else if ( type == 'sRGB' ) out.tabs[ type ] = data[ offset ]; else if ( type == 'bKGD' ) {

				if ( out.ctype == 0 || out.ctype == 4 ) out.tabs[ type ] = [ rUs( data, offset ) ]; else if ( out.ctype == 2 || out.ctype == 6 ) out.tabs[ type ] = [ rUs( data, offset ), rUs( data, offset + 2 ), rUs( data, offset + 4 ) ]; else if ( out.ctype == 3 ) out.tabs[ type ] = data[ offset ];

			} else if ( type == 'IEND' ) {

				break;

			} //else {  log("unknown chunk type", type, len);  }


			offset += len;
			bin.readUint( data, offset );
			offset += 4;

		}

		if ( foff != 0 ) {

			var fr = out.frames[ out.frames.length - 1 ];
			fr.data = UPNG.decode._decompress( out, fd.slice( 0, foff ), fr.rect.width, fr.rect.height );
			foff = 0;

		}

		out.data = UPNG.decode._decompress( out, dd, out.width, out.height );
		delete out.compress;
		delete out.interlace;
		delete out.filter;
		return out;

	};

	UPNG.decode._decompress = function ( out, dd, w, h ) {

		var bpp = UPNG.decode._getBPP( out ),
			bpl = Math.ceil( w * bpp / 8 ),
			buff = new Uint8Array( ( bpl + 1 + out.interlace ) * h );

		if ( out.tabs[ 'CgBI' ] ) dd = UPNG.inflateRaw( dd, buff ); else dd = UPNG.decode._inflate( dd, buff );
		if ( out.interlace == 0 ) dd = UPNG.decode._filterZero( dd, out, 0, w, h ); else if ( out.interlace == 1 ) dd = UPNG.decode._readInterlace( dd, out );
		return dd;

	};

	UPNG.decode._inflate = function ( data, buff ) {

		var out = UPNG[ 'inflateRaw' ]( new Uint8Array( data.buffer, 2, data.length - 6 ), buff );
		return out;

	};

	UPNG.inflateRaw = function () {

		var H = {};
		H.H = {};

		H.H.N = function ( N, W ) {

			var R = Uint8Array,
				i = 0,
				m = 0,
				J = 0,
				h = 0,
				Q = 0,
				X = 0,
				u = 0,
				w = 0,
				d = 0,
				v,
				C;
			if ( N[ 0 ] == 3 && N[ 1 ] == 0 ) return W ? W : new R( 0 );
			var V = H.H,
				n = V.b,
				A = V.e,
				l = V.R,
				M = V.n,
				I = V.A,
				e = V.Z,
				b = V.m,
				Z = W == null;
			if ( Z ) W = new R( N.length >>> 2 << 5 );

			while ( i == 0 ) {

				i = n( N, d, 1 );
				m = n( N, d + 1, 2 );
				d += 3;

				if ( m == 0 ) {

					if ( ( d & 7 ) != 0 ) d += 8 - ( d & 7 );
					var D = ( d >>> 3 ) + 4,
						q = N[ D - 4 ] | N[ D - 3 ] << 8;
					if ( Z ) W = H.H.W( W, w + q );
					W.set( new R( N.buffer, N.byteOffset + D, q ), w );
					d = D + q << 3;
					w += q;
					continue;

				}

				if ( Z ) W = H.H.W( W, w + ( 1 << 17 ) );

				if ( m == 1 ) {

					v = b.J;
					C = b.h;
					X = ( 1 << 9 ) - 1;
					u = ( 1 << 5 ) - 1;

				}

				if ( m == 2 ) {

					J = A( N, d, 5 ) + 257;
					h = A( N, d + 5, 5 ) + 1;
					Q = A( N, d + 10, 4 ) + 4;
					d += 14;
					var j = 1;

					for ( var c = 0; c < 38; c += 2 ) {

						b.Q[ c ] = 0;
						b.Q[ c + 1 ] = 0;

					}

					for ( var c = 0; c < Q; c ++ ) {

						var K = A( N, d + c * 3, 3 );
						b.Q[ ( b.X[ c ] << 1 ) + 1 ] = K;
						if ( K > j ) j = K;

					}

					d += 3 * Q;
					M( b.Q, j );
					I( b.Q, j, b.u );
					v = b.w;
					C = b.d;
					d = l( b.u, ( 1 << j ) - 1, J + h, N, d, b.v );
					var r = V.V( b.v, 0, J, b.C );
					X = ( 1 << r ) - 1;
					var S = V.V( b.v, J, h, b.D );
					u = ( 1 << S ) - 1;
					M( b.C, r );
					I( b.C, r, v );
					M( b.D, S );
					I( b.D, S, C );

				}

				while ( ! 0 ) {

					var T = v[ e( N, d ) & X ];
					d += T & 15;
					var p = T >>> 4;

					if ( p >>> 8 == 0 ) {

						W[ w ++ ] = p;

					} else if ( p == 256 ) {

						break;

					} else {

						var z = w + p - 254;

						if ( p > 264 ) {

							var _ = b.q[ p - 257 ];
							z = w + ( _ >>> 3 ) + A( N, d, _ & 7 );
							d += _ & 7;

						}

						var $ = C[ e( N, d ) & u ];
						d += $ & 15;
						var s = $ >>> 4,
							Y = b.c[ s ],
							a = ( Y >>> 4 ) + n( N, d, Y & 15 );
						d += Y & 15;

						while ( w < z ) {

							W[ w ] = W[ w ++ - a ];
							W[ w ] = W[ w ++ - a ];
							W[ w ] = W[ w ++ - a ];
							W[ w ] = W[ w ++ - a ];

						}

						w = z;

					}

				}

			}

			return W.length == w ? W : W.slice( 0, w );

		};

		H.H.W = function ( N, W ) {

			var R = N.length;
			if ( W <= R ) return N;
			var V = new Uint8Array( R << 1 );
			V.set( N, 0 );
			return V;

		};

		H.H.R = function ( N, W, R, V, n, A ) {

			var l = H.H.e,
				M = H.H.Z,
				I = 0;

			while ( I < R ) {

				var e = N[ M( V, n ) & W ];
				n += e & 15;
				var b = e >>> 4;

				if ( b <= 15 ) {

					A[ I ] = b;
					I ++;

				} else {

					var Z = 0,
						m = 0;

					if ( b == 16 ) {

						m = 3 + l( V, n, 2 );
						n += 2;
						Z = A[ I - 1 ];

					} else if ( b == 17 ) {

						m = 3 + l( V, n, 3 );
						n += 3;

					} else if ( b == 18 ) {

						m = 11 + l( V, n, 7 );
						n += 7;

					}

					var J = I + m;

					while ( I < J ) {

						A[ I ] = Z;
						I ++;

					}

				}

			}

			return n;

		};

		H.H.V = function ( N, W, R, V ) {

			var n = 0,
				A = 0,
				l = V.length >>> 1;

			while ( A < R ) {

				var M = N[ A + W ];
				V[ A << 1 ] = 0;
				V[ ( A << 1 ) + 1 ] = M;
				if ( M > n ) n = M;
				A ++;

			}

			while ( A < l ) {

				V[ A << 1 ] = 0;
				V[ ( A << 1 ) + 1 ] = 0;
				A ++;

			}

			return n;

		};

		H.H.n = function ( N, W ) {

			var R = H.H.m,
				V = N.length,
				n,
				A,
				l,
				M,
				I,
				e = R.j;

			for ( var M = 0; M <= W; M ++ ) e[ M ] = 0;

			for ( M = 1; M < V; M += 2 ) e[ N[ M ] ] ++;

			var b = R.K;
			n = 0;
			e[ 0 ] = 0;

			for ( A = 1; A <= W; A ++ ) {

				n = n + e[ A - 1 ] << 1;
				b[ A ] = n;

			}

			for ( l = 0; l < V; l += 2 ) {

				I = N[ l + 1 ];

				if ( I != 0 ) {

					N[ l ] = b[ I ];
					b[ I ] ++;

				}

			}

		};

		H.H.A = function ( N, W, R ) {

			var V = N.length,
				n = H.H.m,
				A = n.r;

			for ( var l = 0; l < V; l += 2 ) if ( N[ l + 1 ] != 0 ) {

				var M = l >> 1,
					I = N[ l + 1 ],
					e = M << 4 | I,
					b = W - I,
					Z = N[ l ] << b,
					m = Z + ( 1 << b );

				while ( Z != m ) {

					var J = A[ Z ] >>> 15 - W;
					R[ J ] = e;
					Z ++;

				}

			}

		};

		H.H.l = function ( N, W ) {

			var R = H.H.m.r,
				V = 15 - W;

			for ( var n = 0; n < N.length; n += 2 ) {

				var A = N[ n ] << W - N[ n + 1 ];
				N[ n ] = R[ A ] >>> V;

			}

		};

		H.H.M = function ( N, W, R ) {

			R = R << ( W & 7 );
			var V = W >>> 3;
			N[ V ] |= R;
			N[ V + 1 ] |= R >>> 8;

		};

		H.H.I = function ( N, W, R ) {

			R = R << ( W & 7 );
			var V = W >>> 3;
			N[ V ] |= R;
			N[ V + 1 ] |= R >>> 8;
			N[ V + 2 ] |= R >>> 16;

		};

		H.H.e = function ( N, W, R ) {

			return ( N[ W >>> 3 ] | N[ ( W >>> 3 ) + 1 ] << 8 ) >>> ( W & 7 ) & ( 1 << R ) - 1;

		};

		H.H.b = function ( N, W, R ) {

			return ( N[ W >>> 3 ] | N[ ( W >>> 3 ) + 1 ] << 8 | N[ ( W >>> 3 ) + 2 ] << 16 ) >>> ( W & 7 ) & ( 1 << R ) - 1;

		};

		H.H.Z = function ( N, W ) {

			return ( N[ W >>> 3 ] | N[ ( W >>> 3 ) + 1 ] << 8 | N[ ( W >>> 3 ) + 2 ] << 16 ) >>> ( W & 7 );

		};

		H.H.i = function ( N, W ) {

			return ( N[ W >>> 3 ] | N[ ( W >>> 3 ) + 1 ] << 8 | N[ ( W >>> 3 ) + 2 ] << 16 | N[ ( W >>> 3 ) + 3 ] << 24 ) >>> ( W & 7 );

		};

		H.H.m = function () {

			var N = Uint16Array,
				W = Uint32Array;
			return {
				K: new N( 16 ),
				j: new N( 16 ),
				X: [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ],
				S: [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 999, 999, 999 ],
				T: [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0 ],
				q: new N( 32 ),
				p: [ 1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 65535, 65535 ],
				z: [ 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0 ],
				c: new W( 32 ),
				J: new N( 512 ),
				_: [],
				h: new N( 32 ),
				$: [],
				w: new N( 32768 ),
				C: [],
				v: [],
				d: new N( 32768 ),
				D: [],
				u: new N( 512 ),
				Q: [],
				r: new N( 1 << 15 ),
				s: new W( 286 ),
				Y: new W( 30 ),
				a: new W( 19 ),
				t: new W( 15e3 ),
				k: new N( 1 << 16 ),
				g: new N( 1 << 15 )
			};

		}();

		( function () {

			var N = H.H.m,
				W = 1 << 15;

			for ( var R = 0; R < W; R ++ ) {

				var V = R;
				V = ( V & 2863311530 ) >>> 1 | ( V & 1431655765 ) << 1;
				V = ( V & 3435973836 ) >>> 2 | ( V & 858993459 ) << 2;
				V = ( V & 4042322160 ) >>> 4 | ( V & 252645135 ) << 4;
				V = ( V & 4278255360 ) >>> 8 | ( V & 16711935 ) << 8;
				N.r[ R ] = ( V >>> 16 | V << 16 ) >>> 17;

			}

			function n( A, l, M ) {

				while ( l -- != 0 ) A.push( 0, M );

			}

			for ( var R = 0; R < 32; R ++ ) {

				N.q[ R ] = N.S[ R ] << 3 | N.T[ R ];
				N.c[ R ] = N.p[ R ] << 4 | N.z[ R ];

			}

			n( N._, 144, 8 );
			n( N._, 255 - 143, 9 );
			n( N._, 279 - 255, 7 );
			n( N._, 287 - 279, 8 );
			H.H.n( N._, 9 );
			H.H.A( N._, 9, N.J );
			H.H.l( N._, 9 );
			n( N.$, 32, 5 );
			H.H.n( N.$, 5 );
			H.H.A( N.$, 5, N.h );
			H.H.l( N.$, 5 );
			n( N.Q, 19, 0 );
			n( N.C, 286, 0 );
			n( N.D, 30, 0 );
			n( N.v, 320, 0 );

		} )();

		return H.H.N;

	}();

	UPNG.decode._readInterlace = function ( data, out ) {

		var w = out.width,
			h = out.height;

		var bpp = UPNG.decode._getBPP( out ),
			cbpp = bpp >> 3,
			bpl = Math.ceil( w * bpp / 8 );

		var img = new Uint8Array( h * bpl );
		var di = 0;
		var starting_row = [ 0, 0, 4, 0, 2, 0, 1 ];
		var starting_col = [ 0, 4, 0, 2, 0, 1, 0 ];
		var row_increment = [ 8, 8, 8, 4, 4, 2, 2 ];
		var col_increment = [ 8, 8, 4, 4, 2, 2, 1 ];
		var pass = 0;

		while ( pass < 7 ) {

			var ri = row_increment[ pass ],
				ci = col_increment[ pass ];
			var sw = 0,
				sh = 0;
			var cr = starting_row[ pass ];

			while ( cr < h ) {

				cr += ri;
				sh ++;

			}

			var cc = starting_col[ pass ];

			while ( cc < w ) {

				cc += ci;
				sw ++;

			}

			var bpll = Math.ceil( sw * bpp / 8 );

			UPNG.decode._filterZero( data, out, di, sw, sh );

			var y = 0,
				row = starting_row[ pass ];

			while ( row < h ) {

				var col = starting_col[ pass ];
				var cdi = di + y * bpll << 3;

				while ( col < w ) {

					if ( bpp == 1 ) {

						var val = data[ cdi >> 3 ];
						val = val >> 7 - ( cdi & 7 ) & 1;
						img[ row * bpl + ( col >> 3 ) ] |= val << 7 - ( ( col & 7 ) << 0 );

					}

					if ( bpp == 2 ) {

						var val = data[ cdi >> 3 ];
						val = val >> 6 - ( cdi & 7 ) & 3;
						img[ row * bpl + ( col >> 2 ) ] |= val << 6 - ( ( col & 3 ) << 1 );

					}

					if ( bpp == 4 ) {

						var val = data[ cdi >> 3 ];
						val = val >> 4 - ( cdi & 7 ) & 15;
						img[ row * bpl + ( col >> 1 ) ] |= val << 4 - ( ( col & 1 ) << 2 );

					}

					if ( bpp >= 8 ) {

						var ii = row * bpl + col * cbpp;

						for ( var j = 0; j < cbpp; j ++ ) img[ ii + j ] = data[ ( cdi >> 3 ) + j ];

					}

					cdi += bpp;
					col += ci;

				}

				y ++;
				row += ri;

			}

			if ( sw * sh != 0 ) di += sh * ( 1 + bpll );
			pass = pass + 1;

		}

		return img;

	};

	UPNG.decode._getBPP = function ( out ) {

		var noc = [ 1, null, 3, 1, 2, null, 4 ][ out.ctype ];
		return noc * out.depth;

	};

	UPNG.decode._filterZero = function ( data, out, off, w, h ) {

		var bpp = UPNG.decode._getBPP( out ),
			bpl = Math.ceil( w * bpp / 8 ),
			paeth = UPNG.decode._paeth;

		bpp = Math.ceil( bpp / 8 );
		var i = 0,
			di = 1,
			type = data[ off ],
			x = 0;
		if ( type > 1 ) data[ off ] = [ 0, 0, 1 ][ type - 2 ];
		if ( type == 3 ) for ( x = bpp; x < bpl; x ++ ) data[ x + 1 ] = data[ x + 1 ] + ( data[ x + 1 - bpp ] >>> 1 ) & 255;

		for ( var y = 0; y < h; y ++ ) {

			i = off + y * bpl;
			di = i + y + 1;
			type = data[ di - 1 ];
			x = 0;
			if ( type == 0 ) for ( ; x < bpl; x ++ ) data[ i + x ] = data[ di + x ]; else if ( type == 1 ) {

				for ( ; x < bpp; x ++ ) data[ i + x ] = data[ di + x ];

				for ( ; x < bpl; x ++ ) data[ i + x ] = data[ di + x ] + data[ i + x - bpp ];

			} else if ( type == 2 ) {

				for ( ; x < bpl; x ++ ) data[ i + x ] = data[ di + x ] + data[ i + x - bpl ];

			} else if ( type == 3 ) {

				for ( ; x < bpp; x ++ ) data[ i + x ] = data[ di + x ] + ( data[ i + x - bpl ] >>> 1 );

				for ( ; x < bpl; x ++ ) data[ i + x ] = data[ di + x ] + ( data[ i + x - bpl ] + data[ i + x - bpp ] >>> 1 );

			} else {

				for ( ; x < bpp; x ++ ) data[ i + x ] = data[ di + x ] + paeth( 0, data[ i + x - bpl ], 0 );

				for ( ; x < bpl; x ++ ) data[ i + x ] = data[ di + x ] + paeth( data[ i + x - bpp ], data[ i + x - bpl ], data[ i + x - bpp - bpl ] );

			}

		}

		return data;

	};

	UPNG.decode._paeth = function ( a, b, c ) {

		var p = a + b - c,
			pa = p - a,
			pb = p - b,
			pc = p - c;
		if ( pa * pa <= pb * pb && pa * pa <= pc * pc ) return a; else if ( pb * pb <= pc * pc ) return b;
		return c;

	};

	UPNG.decode._IHDR = function ( data, offset, out ) {

		var bin = UPNG._bin;
		out.width = bin.readUint( data, offset );
		offset += 4;
		out.height = bin.readUint( data, offset );
		offset += 4;
		out.depth = data[ offset ];
		offset ++;
		out.ctype = data[ offset ];
		offset ++;
		out.compress = data[ offset ];
		offset ++;
		out.filter = data[ offset ];
		offset ++;
		out.interlace = data[ offset ];
		offset ++;

	};

	UPNG._bin = {
		nextZero: function ( data, p ) {

			while ( data[ p ] != 0 ) p ++;

			return p;

		},
		readUshort: function ( buff, p ) {

			return buff[ p ] << 8 | buff[ p + 1 ];

		},
		writeUshort: function ( buff, p, n ) {

			buff[ p ] = n >> 8 & 255;
			buff[ p + 1 ] = n & 255;

		},
		readUint: function ( buff, p ) {

			return buff[ p ] * ( 256 * 256 * 256 ) + ( buff[ p + 1 ] << 16 | buff[ p + 2 ] << 8 | buff[ p + 3 ] );

		},
		writeUint: function ( buff, p, n ) {

			buff[ p ] = n >> 24 & 255;
			buff[ p + 1 ] = n >> 16 & 255;
			buff[ p + 2 ] = n >> 8 & 255;
			buff[ p + 3 ] = n & 255;

		},
		readASCII: function ( buff, p, l ) {

			var s = '';

			for ( var i = 0; i < l; i ++ ) s += String.fromCharCode( buff[ p + i ] );

			return s;

		},
		writeASCII: function ( data, p, s ) {

			for ( var i = 0; i < s.length; i ++ ) data[ p + i ] = s.charCodeAt( i );

		},
		readBytes: function ( buff, p, l ) {

			var arr = [];

			for ( var i = 0; i < l; i ++ ) arr.push( buff[ p + i ] );

			return arr;

		},
		pad: function ( n ) {

			return n.length < 2 ? '0' + n : n;

		},
		readUTF8: function ( buff, p, l ) {

			var s = '',
				ns;

			for ( var i = 0; i < l; i ++ ) s += '%' + UPNG._bin.pad( buff[ p + i ].toString( 16 ) );

			try {

				ns = decodeURIComponent( s );

			} catch ( e ) {

				return UPNG._bin.readASCII( buff, p, l );

			}

			return ns;

		}
	};

	UPNG._copyTile = function ( sb, sw, sh, tb, tw, th, xoff, yoff, mode ) {

		var w = Math.min( sw, tw ),
			h = Math.min( sh, th );
		var si = 0,
			ti = 0;

		for ( var y = 0; y < h; y ++ ) for ( var x = 0; x < w; x ++ ) {

			if ( xoff >= 0 && yoff >= 0 ) {

				si = y * sw + x << 2;
				ti = ( yoff + y ) * tw + xoff + x << 2;

			} else {

				si = ( - yoff + y ) * sw - xoff + x << 2;
				ti = y * tw + x << 2;

			}

			if ( mode == 0 ) {

				tb[ ti ] = sb[ si ];
				tb[ ti + 1 ] = sb[ si + 1 ];
				tb[ ti + 2 ] = sb[ si + 2 ];
				tb[ ti + 3 ] = sb[ si + 3 ];

			} else if ( mode == 1 ) {

				var fa = sb[ si + 3 ] * ( 1 / 255 ),
					fr = sb[ si ] * fa,
					fg = sb[ si + 1 ] * fa,
					fb = sb[ si + 2 ] * fa;
				var ba = tb[ ti + 3 ] * ( 1 / 255 ),
					br = tb[ ti ] * ba,
					bg = tb[ ti + 1 ] * ba,
					bb = tb[ ti + 2 ] * ba;
				var ifa = 1 - fa,
					oa = fa + ba * ifa,
					ioa = oa == 0 ? 0 : 1 / oa;
				tb[ ti + 3 ] = 255 * oa;
				tb[ ti + 0 ] = ( fr + br * ifa ) * ioa;
				tb[ ti + 1 ] = ( fg + bg * ifa ) * ioa;
				tb[ ti + 2 ] = ( fb + bb * ifa ) * ioa;

			} else if ( mode == 2 ) {

				// copy only differences, otherwise zero
				var fa = sb[ si + 3 ],
					fr = sb[ si ],
					fg = sb[ si + 1 ],
					fb = sb[ si + 2 ];
				var ba = tb[ ti + 3 ],
					br = tb[ ti ],
					bg = tb[ ti + 1 ],
					bb = tb[ ti + 2 ];

				if ( fa == ba && fr == br && fg == bg && fb == bb ) {

					tb[ ti ] = 0;
					tb[ ti + 1 ] = 0;
					tb[ ti + 2 ] = 0;
					tb[ ti + 3 ] = 0;

				} else {

					tb[ ti ] = fr;
					tb[ ti + 1 ] = fg;
					tb[ ti + 2 ] = fb;
					tb[ ti + 3 ] = fa;

				}

			} else if ( mode == 3 ) {

				// check if can be blended
				var fa = sb[ si + 3 ],
					fr = sb[ si ],
					fg = sb[ si + 1 ],
					fb = sb[ si + 2 ];
				var ba = tb[ ti + 3 ],
					br = tb[ ti ],
					bg = tb[ ti + 1 ],
					bb = tb[ ti + 2 ];
				if ( fa == ba && fr == br && fg == bg && fb == bb ) continue; //if(fa!=255 && ba!=0) return false;

				if ( fa < 220 && ba > 20 ) return false;

			}

		}

		return true;

	};

	THREE.RGBMLoader = RGBMLoader;

} )();
