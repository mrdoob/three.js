( function () {

	class LogLuvLoader extends THREE.DataTextureLoader {

		constructor( manager ) {

			super( manager );
			this.type = THREE.HalfFloatType;

		}

		parse( buffer ) {

			const ifds = UTIF.decode( buffer );
			UTIF.decodeImage( buffer, ifds[ 0 ] );
			const rgba = UTIF.toRGBA( ifds[ 0 ], this.type );
			return {
				width: ifds[ 0 ].width,
				height: ifds[ 0 ].height,
				data: rgba,
				format: THREE.RGBAFormat,
				type: this.type,
				flipY: true
			};

		}

		setDataType( value ) {

			this.type = value;
			return this;

		}

	} // from https://github.com/photopea/UTIF.js (MIT License)


	const UTIF = {};

	UTIF.decode = function ( buff, prm ) {

		if ( prm == null ) prm = {
			parseMN: true,
			debug: false
		}; // read MakerNote, debug

		var data = new Uint8Array( buff ),
			offset = 0;

		var id = UTIF._binBE.readASCII( data, offset, 2 );

		offset += 2;
		var bin = id == 'II' ? UTIF._binLE : UTIF._binBE;
		bin.readUshort( data, offset );
		offset += 2;
		var ifdo = bin.readUint( data, offset );
		var ifds = [];

		while ( true ) {

			var cnt = bin.readUshort( data, ifdo ),
				typ = bin.readUshort( data, ifdo + 4 );
			if ( cnt != 0 ) if ( typ < 1 || 13 < typ ) {

				console.log( 'error in TIFF' );
				break;

			}

			UTIF._readIFD( bin, data, ifdo, ifds, 0, prm );

			ifdo = bin.readUint( data, ifdo + 2 + cnt * 12 );
			if ( ifdo == 0 ) break;

		}

		return ifds;

	};

	UTIF.decodeImage = function ( buff, img, ifds ) {

		if ( img.data ) return;
		var data = new Uint8Array( buff );

		var id = UTIF._binBE.readASCII( data, 0, 2 );

		if ( img[ 't256' ] == null ) return; // No width => probably not an image

		img.isLE = id == 'II';
		img.width = img[ 't256' ][ 0 ]; //delete img["t256"];

		img.height = img[ 't257' ][ 0 ]; //delete img["t257"];

		var cmpr = img[ 't259' ] ? img[ 't259' ][ 0 ] : 1; //delete img["t259"];

		var fo = img[ 't266' ] ? img[ 't266' ][ 0 ] : 1; //delete img["t266"];

		if ( img[ 't284' ] && img[ 't284' ][ 0 ] == 2 ) console.log( 'PlanarConfiguration 2 should not be used!' );
		if ( cmpr == 7 && img[ 't258' ] && img[ 't258' ].length > 3 ) img[ 't258' ] = img[ 't258' ].slice( 0, 3 );
		var bipp; // bits per pixel

		if ( img[ 't258' ] ) bipp = Math.min( 32, img[ 't258' ][ 0 ] ) * img[ 't258' ].length; else bipp = img[ 't277' ] ? img[ 't277' ][ 0 ] : 1; // Some .NEF files have t258==14, even though they use 16 bits per pixel

		if ( cmpr == 1 && img[ 't279' ] != null && img[ 't278' ] && img[ 't262' ][ 0 ] == 32803 ) {

			bipp = Math.round( img[ 't279' ][ 0 ] * 8 / ( img.width * img[ 't278' ][ 0 ] ) );

		}

		var bipl = Math.ceil( img.width * bipp / 8 ) * 8;
		var soff = img[ 't273' ];
		if ( soff == null ) soff = img[ 't324' ];
		var bcnt = img[ 't279' ];
		if ( cmpr == 1 && soff.length == 1 ) bcnt = [ img.height * ( bipl >>> 3 ) ];
		if ( bcnt == null ) bcnt = img[ 't325' ]; //bcnt[0] = Math.min(bcnt[0], data.length);  // Hasselblad, "RAW_HASSELBLAD_H3D39II.3FR"

		var bytes = new Uint8Array( img.height * ( bipl >>> 3 ) ),
			bilen = 0;

		if ( img[ 't322' ] != null ) {

			var tw = img[ 't322' ][ 0 ],
				th = img[ 't323' ][ 0 ];
			var tx = Math.floor( ( img.width + tw - 1 ) / tw );
			var ty = Math.floor( ( img.height + th - 1 ) / th );
			var tbuff = new Uint8Array( Math.ceil( tw * th * bipp / 8 ) | 0 );

			for ( var y = 0; y < ty; y ++ ) for ( var x = 0; x < tx; x ++ ) {

				var i = y * tx + x;

				for ( var j = 0; j < tbuff.length; j ++ ) tbuff[ j ] = 0;

				UTIF.decode._decompress( img, ifds, data, soff[ i ], bcnt[ i ], cmpr, tbuff, 0, fo ); // Might be required for 7 too. Need to check


				if ( cmpr == 6 ) bytes = tbuff; else UTIF._copyTile( tbuff, Math.ceil( tw * bipp / 8 ) | 0, th, bytes, Math.ceil( img.width * bipp / 8 ) | 0, img.height, Math.ceil( x * tw * bipp / 8 ) | 0, y * th );

			}

			bilen = bytes.length * 8;

		} else {

			var rps = img[ 't278' ] ? img[ 't278' ][ 0 ] : img.height;
			rps = Math.min( rps, img.height );

			for ( var i = 0; i < soff.length; i ++ ) {

				UTIF.decode._decompress( img, ifds, data, soff[ i ], bcnt[ i ], cmpr, bytes, Math.ceil( bilen / 8 ) | 0, fo );

				bilen += bipl * rps;

			}

			bilen = Math.min( bilen, bytes.length * 8 );

		}

		img.data = new Uint8Array( bytes.buffer, 0, Math.ceil( bilen / 8 ) | 0 );

	};

	UTIF.decode._decompress = function ( img, ifds, data, off, len, cmpr, tgt, toff ) {

		//console.log("compression", cmpr);
		//var time = Date.now();
		if ( cmpr == 34676 ) UTIF.decode._decodeLogLuv32( img, data, off, len, tgt, toff ); else console.log( 'Unsupported compression', cmpr ); //console.log(Date.now()-time);

		var bps = img[ 't258' ] ? Math.min( 32, img[ 't258' ][ 0 ] ) : 1;
		var noc = img[ 't277' ] ? img[ 't277' ][ 0 ] : 1,
			bpp = bps * noc >>> 3,
			h = img[ 't278' ] ? img[ 't278' ][ 0 ] : img.height,
			bpl = Math.ceil( bps * noc * img.width / 8 ); // convert to Little Endian  /*

		if ( bps == 16 && ! img.isLE && img[ 't33422' ] == null ) // not DNG
			for ( var y = 0; y < h; y ++ ) {

				//console.log("fixing endianity");
				var roff = toff + y * bpl;

				for ( var x = 1; x < bpl; x += 2 ) {

					var t = tgt[ roff + x ];
					tgt[ roff + x ] = tgt[ roff + x - 1 ];
					tgt[ roff + x - 1 ] = t;

				}

			} //*/

		if ( img[ 't317' ] && img[ 't317' ][ 0 ] == 2 ) {

			for ( var y = 0; y < h; y ++ ) {

				var ntoff = toff + y * bpl;
				if ( bps == 16 ) for ( var j = bpp; j < bpl; j += 2 ) {

					var nv = ( tgt[ ntoff + j + 1 ] << 8 | tgt[ ntoff + j ] ) + ( tgt[ ntoff + j - bpp + 1 ] << 8 | tgt[ ntoff + j - bpp ] );
					tgt[ ntoff + j ] = nv & 255;
					tgt[ ntoff + j + 1 ] = nv >>> 8 & 255;

				} else if ( noc == 3 ) for ( var j = 3; j < bpl; j += 3 ) {

					tgt[ ntoff + j ] = tgt[ ntoff + j ] + tgt[ ntoff + j - 3 ] & 255;
					tgt[ ntoff + j + 1 ] = tgt[ ntoff + j + 1 ] + tgt[ ntoff + j - 2 ] & 255;
					tgt[ ntoff + j + 2 ] = tgt[ ntoff + j + 2 ] + tgt[ ntoff + j - 1 ] & 255;

				} else for ( var j = bpp; j < bpl; j ++ ) tgt[ ntoff + j ] = tgt[ ntoff + j ] + tgt[ ntoff + j - bpp ] & 255;

			}

		}

	};

	UTIF.decode._decodeLogLuv32 = function ( img, data, off, len, tgt, toff ) {

		var w = img.width,
			qw = w * 4;
		var io = 0,
			out = new Uint8Array( qw );

		while ( io < len ) {

			var oo = 0;

			while ( oo < qw ) {

				var c = data[ off + io ];
				io ++;

				if ( c < 128 ) {

					for ( var j = 0; j < c; j ++ ) out[ oo + j ] = data[ off + io + j ];

					oo += c;
					io += c;

				} else {

					c = c - 126;

					for ( var j = 0; j < c; j ++ ) out[ oo + j ] = data[ off + io ];

					oo += c;
					io ++;

				}

			}

			for ( var x = 0; x < w; x ++ ) {

				tgt[ toff + 0 ] = out[ x ];
				tgt[ toff + 1 ] = out[ x + w ];
				tgt[ toff + 2 ] = out[ x + w * 2 ];
				tgt[ toff + 4 ] = out[ x + w * 3 ];
				toff += 6;

			}

		}

	};

	UTIF.tags = {}; //UTIF.ttypes = {  256:3,257:3,258:3,   259:3, 262:3,  273:4,  274:3, 277:3,278:4,279:4, 282:5, 283:5, 284:3, 286:5,287:5, 296:3, 305:2, 306:2, 338:3, 513:4, 514:4, 34665:4  };
	// start at tag 250

	UTIF._types = function () {

		var main = new Array( 250 );
		main.fill( 0 );
		main = main.concat( [ 0, 0, 0, 0, 4, 3, 3, 3, 3, 3, 0, 0, 3, 0, 0, 0, 3, 0, 0, 2, 2, 2, 2, 4, 3, 0, 0, 3, 4, 4, 3, 3, 5, 5, 3, 2, 5, 5, 0, 0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 5, 5, 3, 0, 3, 3, 4, 4, 4, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
		var rest = {
			33432: 2,
			33434: 5,
			33437: 5,
			34665: 4,
			34850: 3,
			34853: 4,
			34855: 3,
			34864: 3,
			34866: 4,
			36864: 7,
			36867: 2,
			36868: 2,
			37121: 7,
			37377: 10,
			37378: 5,
			37380: 10,
			37381: 5,
			37383: 3,
			37384: 3,
			37385: 3,
			37386: 5,
			37510: 7,
			37520: 2,
			37521: 2,
			37522: 2,
			40960: 7,
			40961: 3,
			40962: 4,
			40963: 4,
			40965: 4,
			41486: 5,
			41487: 5,
			41488: 3,
			41985: 3,
			41986: 3,
			41987: 3,
			41988: 5,
			41989: 3,
			41990: 3,
			41993: 3,
			41994: 3,
			41995: 7,
			41996: 3,
			42032: 2,
			42033: 2,
			42034: 5,
			42036: 2,
			42037: 2,
			59932: 7
		};
		return {
			basic: {
				main: main,
				rest: rest
			},
			gps: {
				main: [ 1, 2, 5, 2, 5, 1, 5, 5, 0, 9 ],
				rest: {
					18: 2,
					29: 2
				}
			}
		};

	}();

	UTIF._readIFD = function ( bin, data, offset, ifds, depth, prm ) {

		var cnt = bin.readUshort( data, offset );
		offset += 2;
		var ifd = {};
		if ( prm.debug ) console.log( '   '.repeat( depth ), ifds.length - 1, '>>>----------------' );

		for ( var i = 0; i < cnt; i ++ ) {

			var tag = bin.readUshort( data, offset );
			offset += 2;
			var type = bin.readUshort( data, offset );
			offset += 2;
			var num = bin.readUint( data, offset );
			offset += 4;
			var voff = bin.readUint( data, offset );
			offset += 4;
			var arr = []; //ifd["t"+tag+"-"+UTIF.tags[tag]] = arr;

			if ( type == 1 || type == 7 ) {

				arr = new Uint8Array( data.buffer, num < 5 ? offset - 4 : voff, num );

			}

			if ( type == 2 ) {

				var o0 = num < 5 ? offset - 4 : voff,
					c = data[ o0 ],
					len = Math.max( 0, Math.min( num - 1, data.length - o0 ) );
				if ( c < 128 || len == 0 ) arr.push( bin.readASCII( data, o0, len ) ); else arr = new Uint8Array( data.buffer, o0, len );

			}

			if ( type == 3 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readUshort( data, ( num < 3 ? offset - 4 : voff ) + 2 * j ) );

			}

			if ( type == 4 || type == 13 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readUint( data, ( num < 2 ? offset - 4 : voff ) + 4 * j ) );

			}

			if ( type == 5 || type == 10 ) {

				var ri = type == 5 ? bin.readUint : bin.readInt;

				for ( var j = 0; j < num; j ++ ) arr.push( [ ri( data, voff + j * 8 ), ri( data, voff + j * 8 + 4 ) ] );

			}

			if ( type == 8 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readShort( data, ( num < 3 ? offset - 4 : voff ) + 2 * j ) );

			}

			if ( type == 9 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readInt( data, ( num < 2 ? offset - 4 : voff ) + 4 * j ) );

			}

			if ( type == 11 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readFloat( data, voff + j * 4 ) );

			}

			if ( type == 12 ) {

				for ( var j = 0; j < num; j ++ ) arr.push( bin.readDouble( data, voff + j * 8 ) );

			}

			if ( num != 0 && arr.length == 0 ) {

				console.log( tag, 'unknown TIFF tag type: ', type, 'num:', num );
				if ( i == 0 ) return;
				continue;

			}

			if ( prm.debug ) console.log( '   '.repeat( depth ), tag, type, UTIF.tags[ tag ], arr );
			ifd[ 't' + tag ] = arr;

			if ( tag == 330 || tag == 34665 || tag == 34853 || tag == 50740 && bin.readUshort( data, bin.readUint( arr, 0 ) ) < 300 || tag == 61440 ) {

				var oarr = tag == 50740 ? [ bin.readUint( arr, 0 ) ] : arr;
				var subfd = [];

				for ( var j = 0; j < oarr.length; j ++ ) UTIF._readIFD( bin, data, oarr[ j ], subfd, depth + 1, prm );

				if ( tag == 330 ) ifd.subIFD = subfd;
				if ( tag == 34665 ) ifd.exifIFD = subfd[ 0 ];
				if ( tag == 34853 ) ifd.gpsiIFD = subfd[ 0 ]; //console.log("gps", subfd[0]);  }

				if ( tag == 50740 ) ifd.dngPrvt = subfd[ 0 ];
				if ( tag == 61440 ) ifd.fujiIFD = subfd[ 0 ];

			}

			if ( tag == 37500 && prm.parseMN ) {

				var mn = arr; //console.log(bin.readASCII(mn,0,mn.length), mn);

				if ( bin.readASCII( mn, 0, 5 ) == 'Nikon' ) ifd.makerNote = UTIF[ 'decode' ]( mn.slice( 10 ).buffer )[ 0 ]; else if ( bin.readUshort( data, voff ) < 300 && bin.readUshort( data, voff + 4 ) <= 12 ) {

					var subsub = [];

					UTIF._readIFD( bin, data, voff, subsub, depth + 1, prm );

					ifd.makerNote = subsub[ 0 ];

				}

			}

		}

		ifds.push( ifd );
		if ( prm.debug ) console.log( '   '.repeat( depth ), '<<<---------------' );
		return offset;

	};

	UTIF.toRGBA = function ( out, type ) {

		const w = out.width,
			h = out.height,
			area = w * h,
			data = out.data;
		let img;

		switch ( type ) {

			case THREE.HalfFloatType:
				img = new Uint16Array( area * 4 );
				break;

			case THREE.FloatType:
				img = new Float32Array( area * 4 );
				break;

			default:
				console.error( 'THREE.LogLuvLoader: Unsupported texture data type:', type );

		}

		let intp = out[ 't262' ] ? out[ 't262' ][ 0 ] : 2;
		const bps = out[ 't258' ] ? Math.min( 32, out[ 't258' ][ 0 ] ) : 1;
		if ( out[ 't262' ] == null && bps == 1 ) intp = 0;

		if ( intp == 32845 ) {

			for ( let y = 0; y < h; y ++ ) {

				for ( let x = 0; x < w; x ++ ) {

					const si = ( y * w + x ) * 6,
						qi = ( y * w + x ) * 4;
					let L = data[ si + 1 ] << 8 | data[ si ];
					L = Math.pow( 2, ( L + 0.5 ) / 256 - 64 );
					const u = ( data[ si + 3 ] + 0.5 ) / 410;
					const v = ( data[ si + 5 ] + 0.5 ) / 410; // Luv to xyY

					const sX = 9 * u / ( 6 * u - 16 * v + 12 );
					const sY = 4 * v / ( 6 * u - 16 * v + 12 );
					const bY = L; // xyY to XYZ

					const X = sX * bY / sY,
						Y = bY,
						Z = ( 1 - sX - sY ) * bY / sY; // XYZ to linear RGB

					const r = 2.690 * X - 1.276 * Y - 0.414 * Z;
					const g = - 1.022 * X + 1.978 * Y + 0.044 * Z;
					const b = 0.061 * X - 0.224 * Y + 1.163 * Z;

					if ( type === THREE.HalfFloatType ) {

						img[ qi ] = THREE.DataUtils.toHalfFloat( Math.min( r, 65504 ) );
						img[ qi + 1 ] = THREE.DataUtils.toHalfFloat( Math.min( g, 65504 ) );
						img[ qi + 2 ] = THREE.DataUtils.toHalfFloat( Math.min( b, 65504 ) );
						img[ qi + 3 ] = THREE.DataUtils.toHalfFloat( 1 );

					} else {

						img[ qi ] = r;
						img[ qi + 1 ] = g;
						img[ qi + 2 ] = b;
						img[ qi + 3 ] = 1;

					}

				}

			}

		} else {

			console.log( 'Unsupported Photometric interpretation: ' + intp );

		}

		return img;

	};

	UTIF._binBE = {
		nextZero: function ( data, o ) {

			while ( data[ o ] != 0 ) o ++;

			return o;

		},
		readUshort: function ( buff, p ) {

			return buff[ p ] << 8 | buff[ p + 1 ];

		},
		readShort: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 1 ];
			a[ 1 ] = buff[ p + 0 ];
			return UTIF._binBE.i16[ 0 ];

		},
		readInt: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 3 ];
			a[ 1 ] = buff[ p + 2 ];
			a[ 2 ] = buff[ p + 1 ];
			a[ 3 ] = buff[ p + 0 ];
			return UTIF._binBE.i32[ 0 ];

		},
		readUint: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 3 ];
			a[ 1 ] = buff[ p + 2 ];
			a[ 2 ] = buff[ p + 1 ];
			a[ 3 ] = buff[ p + 0 ];
			return UTIF._binBE.ui32[ 0 ];

		},
		readASCII: function ( buff, p, l ) {

			var s = '';

			for ( var i = 0; i < l; i ++ ) s += String.fromCharCode( buff[ p + i ] );

			return s;

		},
		readFloat: function ( buff, p ) {

			var a = UTIF._binBE.ui8;

			for ( var i = 0; i < 4; i ++ ) a[ i ] = buff[ p + 3 - i ];

			return UTIF._binBE.fl32[ 0 ];

		},
		readDouble: function ( buff, p ) {

			var a = UTIF._binBE.ui8;

			for ( var i = 0; i < 8; i ++ ) a[ i ] = buff[ p + 7 - i ];

			return UTIF._binBE.fl64[ 0 ];

		},
		writeUshort: function ( buff, p, n ) {

			buff[ p ] = n >> 8 & 255;
			buff[ p + 1 ] = n & 255;

		},
		writeInt: function ( buff, p, n ) {

			var a = UTIF._binBE.ui8;
			UTIF._binBE.i32[ 0 ] = n;
			buff[ p + 3 ] = a[ 0 ];
			buff[ p + 2 ] = a[ 1 ];
			buff[ p + 1 ] = a[ 2 ];
			buff[ p + 0 ] = a[ 3 ];

		},
		writeUint: function ( buff, p, n ) {

			buff[ p ] = n >> 24 & 255;
			buff[ p + 1 ] = n >> 16 & 255;
			buff[ p + 2 ] = n >> 8 & 255;
			buff[ p + 3 ] = n >> 0 & 255;

		},
		writeASCII: function ( buff, p, s ) {

			for ( var i = 0; i < s.length; i ++ ) buff[ p + i ] = s.charCodeAt( i );

		},
		writeDouble: function ( buff, p, n ) {

			UTIF._binBE.fl64[ 0 ] = n;

			for ( var i = 0; i < 8; i ++ ) buff[ p + i ] = UTIF._binBE.ui8[ 7 - i ];

		}
	};
	UTIF._binBE.ui8 = new Uint8Array( 8 );
	UTIF._binBE.i16 = new Int16Array( UTIF._binBE.ui8.buffer );
	UTIF._binBE.i32 = new Int32Array( UTIF._binBE.ui8.buffer );
	UTIF._binBE.ui32 = new Uint32Array( UTIF._binBE.ui8.buffer );
	UTIF._binBE.fl32 = new Float32Array( UTIF._binBE.ui8.buffer );
	UTIF._binBE.fl64 = new Float64Array( UTIF._binBE.ui8.buffer );
	UTIF._binLE = {
		nextZero: UTIF._binBE.nextZero,
		readUshort: function ( buff, p ) {

			return buff[ p + 1 ] << 8 | buff[ p ];

		},
		readShort: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 0 ];
			a[ 1 ] = buff[ p + 1 ];
			return UTIF._binBE.i16[ 0 ];

		},
		readInt: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 0 ];
			a[ 1 ] = buff[ p + 1 ];
			a[ 2 ] = buff[ p + 2 ];
			a[ 3 ] = buff[ p + 3 ];
			return UTIF._binBE.i32[ 0 ];

		},
		readUint: function ( buff, p ) {

			var a = UTIF._binBE.ui8;
			a[ 0 ] = buff[ p + 0 ];
			a[ 1 ] = buff[ p + 1 ];
			a[ 2 ] = buff[ p + 2 ];
			a[ 3 ] = buff[ p + 3 ];
			return UTIF._binBE.ui32[ 0 ];

		},
		readASCII: UTIF._binBE.readASCII,
		readFloat: function ( buff, p ) {

			var a = UTIF._binBE.ui8;

			for ( var i = 0; i < 4; i ++ ) a[ i ] = buff[ p + i ];

			return UTIF._binBE.fl32[ 0 ];

		},
		readDouble: function ( buff, p ) {

			var a = UTIF._binBE.ui8;

			for ( var i = 0; i < 8; i ++ ) a[ i ] = buff[ p + i ];

			return UTIF._binBE.fl64[ 0 ];

		},
		writeUshort: function ( buff, p, n ) {

			buff[ p ] = n & 255;
			buff[ p + 1 ] = n >> 8 & 255;

		},
		writeInt: function ( buff, p, n ) {

			var a = UTIF._binBE.ui8;
			UTIF._binBE.i32[ 0 ] = n;
			buff[ p + 0 ] = a[ 0 ];
			buff[ p + 1 ] = a[ 1 ];
			buff[ p + 2 ] = a[ 2 ];
			buff[ p + 3 ] = a[ 3 ];

		},
		writeUint: function ( buff, p, n ) {

			buff[ p ] = n >>> 0 & 255;
			buff[ p + 1 ] = n >>> 8 & 255;
			buff[ p + 2 ] = n >>> 16 & 255;
			buff[ p + 3 ] = n >>> 24 & 255;

		},
		writeASCII: UTIF._binBE.writeASCII
	};

	UTIF._copyTile = function ( tb, tw, th, b, w, h, xoff, yoff ) {

		//log("copyTile", tw, th,  w, h, xoff, yoff);
		var xlim = Math.min( tw, w - xoff );
		var ylim = Math.min( th, h - yoff );

		for ( var y = 0; y < ylim; y ++ ) {

			var tof = ( yoff + y ) * w + xoff;
			var sof = y * tw;

			for ( var x = 0; x < xlim; x ++ ) b[ tof + x ] = tb[ sof + x ];

		}

	};

	THREE.LogLuvLoader = LogLuvLoader;

} )();
