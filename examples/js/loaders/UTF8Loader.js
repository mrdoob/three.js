THREE.UTF8Loader = function ( showStatus ) {
	THREE.Loader.call( this, showStatus );
};

THREE.UTF8Loader.prototype.load = function ( jsonUrl, callback, options, callbackProgress ) {
	this.downloadModelJson( jsonUrl, callback, options, callbackProgress );
};

THREE.UTF8Loader.BufferGeometryCreator = function () {
};

THREE.UTF8Loader.BufferGeometryCreator.prototype.create = function ( attribArray, indices ) {
	var ntris = indices.length / 3;
	var geometry = new THREE.BufferGeometry();
	var positions = new Float32Array( ntris * 3 * 3 );
	var normals = new Float32Array( ntris * 3 * 3 );
	var uvs = new Float32Array( ntris * 3 * 2 );
	var i, j, offset;
	var x, y, z;
	var u, v;
	var end = attribArray.length;
	var stride = 8;
	j = 0;
	offset = 0;
	for ( i = offset; i < end; i += stride ) {
		x = attribArray[ i ];
		y = attribArray[ i + 1 ];
		z = attribArray[ i + 2 ];
		positions[ j ++ ] = x;
		positions[ j ++ ] = y;
		positions[ j ++ ] = z;
	}
	j = 0;
	offset = 3;
	for ( i = offset; i < end; i += stride ) {
		u = attribArray[ i ];
		v = attribArray[ i + 1 ];
		uvs[ j ++ ] = u;
		uvs[ j ++ ] = v;
	}
	j = 0;
	offset = 5;
	for ( i = offset; i < end; i += stride ) {
		x = attribArray[ i ];
		y = attribArray[ i + 1 ];
		z = attribArray[ i + 2 ];
		normals[ j ++ ] = x;
		normals[ j ++ ] = y;
		normals[ j ++ ] = z;
	}
	geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
	geometry.offsets.push( { start: 0, count: indices.length, index: 0 } );
	geometry.computeBoundingSphere();
	return geometry;
};

var DEFAULT_DECODE_PARAMS = {
    decodeOffsets: [ -4095, -4095, -4095, 0, 0, -511, -511, -511 ],
    decodeScales: [ 1 / 8191, 1 / 8191, 1 / 8191, 1 / 1023, 1 / 1023, 1 / 1023, 1 / 1023, 1 / 1023 ]
};


THREE.UTF8Loader.prototype.decompressAttribsInner_ = function ( str, inputStart, inputEnd, output, outputStart, stride, decodeOffset, decodeScale ) {
	var prev = 0;
	for ( var j = inputStart; j < inputEnd; j ++ ) {
		var code = str.charCodeAt( j );
		prev += ( code >> 1 ) ^ ( -( code & 1 ) );
		output[ outputStart ] = decodeScale * ( prev + decodeOffset );
		outputStart += stride;
	}
};

THREE.UTF8Loader.prototype.decompressIndices_ = function( str, inputStart, numIndices, output, outputStart ) {
	var highest = 0;
	for ( var i = 0; i < numIndices; i ++ ) {
		var code = str.charCodeAt( inputStart ++ );
		output[ outputStart ++ ] = highest - code;
		if ( code === 0 ) {
			highest ++;
		}
	}
};

THREE.UTF8Loader.prototype.decompressAABBs_ = function ( str, inputStart, numBBoxen, decodeOffsets, decodeScales ) {
	var numFloats = 6 * numBBoxen;
	var inputEnd = inputStart + numFloats;
	var outputStart = 0;
	var bboxen = new Float32Array( numFloats );
	for ( var i = inputStart; i < inputEnd; i += 6 ) {
		var minX = str.charCodeAt(i + 0) + decodeOffsets[0];
		var minY = str.charCodeAt(i + 1) + decodeOffsets[1];
		var minZ = str.charCodeAt(i + 2) + decodeOffsets[2];
		var radiusX = (str.charCodeAt(i + 3) + 1) >> 1;
		var radiusY = (str.charCodeAt(i + 4) + 1) >> 1;
		var radiusZ = (str.charCodeAt(i + 5) + 1) >> 1;
		bboxen[ outputStart ++ ] = decodeScales[0] * (minX + radiusX);
		bboxen[ outputStart ++ ] = decodeScales[1] * (minY + radiusY);
		bboxen[ outputStart ++ ] = decodeScales[2] * (minZ + radiusZ);
		bboxen[ outputStart ++ ] = decodeScales[0] * radiusX;
		bboxen[ outputStart ++ ] = decodeScales[1] * radiusY;
		bboxen[ outputStart ++ ] = decodeScales[2] * radiusZ;
	}
	return bboxen;
};

THREE.UTF8Loader.prototype.decompressMesh =  function ( str, meshParams, decodeParams, name, idx, callback ) {
	var stride = decodeParams.decodeScales.length;
	var decodeOffsets = decodeParams.decodeOffsets;
	var decodeScales = decodeParams.decodeScales;
	var attribStart = meshParams.attribRange[0];
	var numVerts = meshParams.attribRange[1];
	var inputOffset = attribStart;
	var attribsOut = new Float32Array( stride * numVerts );
	for (var j = 0; j < stride; j ++ ) {
		var end = inputOffset + numVerts;
		var decodeScale = decodeScales[j];
		if ( decodeScale ) {
			this.decompressAttribsInner_( str, inputOffset, end,
                attribsOut, j, stride,
                decodeOffsets[j], decodeScale );
		}
		inputOffset = end;
	}
	var indexStart = meshParams.indexRange[ 0 ];
	var numIndices = 3 * meshParams.indexRange[ 1 ];
	var indicesOut = new Uint16Array( numIndices );
	this.decompressIndices_( str, inputOffset, numIndices, indicesOut, 0 );
	var bboxen = undefined;
	var bboxOffset = meshParams.bboxes;
	if ( bboxOffset ) {
		bboxen = this.decompressAABBs_( str, bboxOffset, meshParams.names.length, decodeOffsets, decodeScales );
	}
	callback( name, idx, attribsOut, indicesOut, bboxen, meshParams );
};

THREE.UTF8Loader.prototype.copyAttrib = function ( stride, attribsOutFixed, lastAttrib, index ) {
	for ( var j = 0; j < stride; j ++ ) {
		lastAttrib[ j ] = attribsOutFixed[ stride * index + j ];
	}
};

THREE.UTF8Loader.prototype.decodeAttrib2 = function ( str, stride, decodeOffsets, decodeScales, deltaStart,
                                                        numVerts, attribsOut, attribsOutFixed, lastAttrib, index ) {
	for ( var j = 0; j < 5; j ++ ) {
		var code = str.charCodeAt( deltaStart + numVerts * j + index );
		var delta = ( code >> 1) ^ (-(code & 1));
		lastAttrib[ j ] += delta;
		attribsOutFixed[ stride * index + j ] = lastAttrib[ j ];
		attribsOut[ stride * index + j ] = decodeScales[ j ] * ( lastAttrib[ j ] + decodeOffsets[ j ] );
	}
};

THREE.UTF8Loader.prototype.accumulateNormal = function ( i0, i1, i2, attribsOutFixed, crosses ) {
	var p0x = attribsOutFixed[ 8 * i0 ];
	var p0y = attribsOutFixed[ 8 * i0 + 1 ];
	var p0z = attribsOutFixed[ 8 * i0 + 2 ];
	var p1x = attribsOutFixed[ 8 * i1 ];
	var p1y = attribsOutFixed[ 8 * i1 + 1 ];
	var p1z = attribsOutFixed[ 8 * i1 + 2 ];
	var p2x = attribsOutFixed[ 8 * i2 ];
	var p2y = attribsOutFixed[ 8 * i2 + 1 ];
	var p2z = attribsOutFixed[ 8 * i2 + 2 ];
	p1x -= p0x;
	p1y -= p0y;
	p1z -= p0z;
	p2x -= p0x;
	p2y -= p0y;
	p2z -= p0z;
	p0x = p1y * p2z - p1z * p2y;
	p0y = p1z * p2x - p1x * p2z;
	p0z = p1x * p2y - p1y * p2x;
	crosses[ 3 * i0 ]     += p0x;
	crosses[ 3 * i0 + 1 ] += p0y;
	crosses[ 3 * i0 + 2 ] += p0z;
	crosses[ 3 * i1 ]     += p0x;
	crosses[ 3 * i1 + 1 ] += p0y;
	crosses[ 3 * i1 + 2 ] += p0z;
	crosses[ 3 * i2 ]     += p0x;
	crosses[ 3 * i2 + 1 ] += p0y;
	crosses[ 3 * i2 + 2 ] += p0z;
};

THREE.UTF8Loader.prototype.decompressMesh2 = function( str, meshParams, decodeParams, name, idx, callback ) {
	var MAX_BACKREF = 96;
	var stride = decodeParams.decodeScales.length;
	var decodeOffsets = decodeParams.decodeOffsets;
	var decodeScales = decodeParams.decodeScales;
	var deltaStart = meshParams.attribRange[ 0 ];
	var numVerts = meshParams.attribRange[ 1 ];
	var codeStart = meshParams.codeRange[ 0 ];
	var codeLength = meshParams.codeRange[ 1 ];
	var numIndices = 3 * meshParams.codeRange[ 2 ];
	var indicesOut = new Uint16Array( numIndices );
	var crosses = new Int32Array( 3 * numVerts );
	var lastAttrib = new Uint16Array( stride );
	var attribsOutFixed = new Uint16Array( stride * numVerts );
	var attribsOut = new Float32Array( stride * numVerts );
	var highest = 0;
	var outputStart = 0;
	for ( var i = 0; i < numIndices; i += 3 ) {
		var code = str.charCodeAt( codeStart ++ );
		var max_backref = Math.min( i, MAX_BACKREF );
		if ( code < max_backref ) {
			var winding = code % 3;
			var backref = i - ( code - winding );
			var i0, i1, i2;
			switch ( winding ) {
				case 0:
					i0 = indicesOut[ backref + 2 ];
					i1 = indicesOut[ backref + 1 ];
					i2 = indicesOut[ backref + 0 ];
					break;
				case 1:
					i0 = indicesOut[ backref + 0 ];
					i1 = indicesOut[ backref + 2 ];
					i2 = indicesOut[ backref + 1 ];
					break;
				case 2:
					i0 = indicesOut[ backref + 1 ];
					i1 = indicesOut[ backref + 0 ];
					i2 = indicesOut[ backref + 2 ];
					break;
			}
			indicesOut[ outputStart ++ ] = i0;
			indicesOut[ outputStart ++ ] = i1;
			code = str.charCodeAt( codeStart ++ );
			var index = highest - code;
			indicesOut[ outputStart ++ ] = index;
			if ( code === 0 ) {
				for (var j = 0; j < 5; j ++ ) {
					var deltaCode = str.charCodeAt( deltaStart + numVerts * j + highest );
					var prediction = ((deltaCode >> 1) ^ (-(deltaCode & 1))) +
                        attribsOutFixed[stride * i0 + j] + attribsOutFixed[stride * i1 + j] - attribsOutFixed[stride * i2 + j];
					lastAttrib[j] = prediction;
					attribsOutFixed[ stride * highest + j ] = prediction;
					attribsOut[ stride * highest + j ] = decodeScales[ j ] * ( prediction + decodeOffsets[ j ] );
				}
				highest ++;
			} else {
				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index );
			}
			this.accumulateNormal( i0, i1, index, attribsOutFixed, crosses );
		} else {
			var index0 = highest - ( code - max_backref );
			indicesOut[ outputStart ++ ] = index0;
			if ( code === max_backref ) {
				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart, numVerts, attribsOut, attribsOutFixed, lastAttrib, highest ++ );
			} else {
				this.copyAttrib(stride, attribsOutFixed, lastAttrib, index0);
			}
			code = str.charCodeAt( codeStart ++ );
			var index1 = highest - code;
			indicesOut[ outputStart ++ ] = index1;
			if ( code === 0 ) {
				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart, numVerts, attribsOut, attribsOutFixed, lastAttrib, highest ++ );
			} else {
				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index1 );
			}
			code = str.charCodeAt( codeStart ++ );
			var index2 = highest - code;
			indicesOut[ outputStart ++ ] = index2;
			if ( code === 0 ) {
				for ( var j = 0; j < 5; j ++ ) {
					lastAttrib[ j ] = ( attribsOutFixed[ stride * index0 + j ] + attribsOutFixed[ stride * index1 + j ] ) / 2;
				}
				this.decodeAttrib2( str, stride, decodeOffsets, decodeScales, deltaStart,
                    numVerts, attribsOut, attribsOutFixed, lastAttrib, highest ++ );
			} else {
				this.copyAttrib( stride, attribsOutFixed, lastAttrib, index2 );
			}
			this.accumulateNormal( index0, index1, index2, attribsOutFixed, crosses );
		}
	}
	for ( var i = 0; i < numVerts; i ++ ) {
		var nx = crosses[ 3 * i ];
		var ny = crosses[ 3 * i + 1 ];
		var nz = crosses[ 3 * i + 2 ];
		var norm = 511.0 / Math.sqrt( nx * nx + ny * ny + nz * nz );
		var cx = str.charCodeAt( deltaStart + 5 * numVerts + i );
		var cy = str.charCodeAt( deltaStart + 6 * numVerts + i );
		var cz = str.charCodeAt( deltaStart + 7 * numVerts + i );
		attribsOut[ stride * i + 5 ] = norm * nx + ((cx >> 1) ^ (-(cx & 1)));
		attribsOut[ stride * i + 6 ] = norm * ny + ((cy >> 1) ^ (-(cy & 1)));
		attribsOut[ stride * i + 7 ] = norm * nz + ((cz >> 1) ^ (-(cz & 1)));
	}
	callback( name, idx, attribsOut, indicesOut, undefined, meshParams );
};

THREE.UTF8Loader.prototype.downloadMesh = function ( path, name, meshEntry, decodeParams, callback, callbackProgress ) {
	var loader = this;
	var idx = 0;
	var xhr = new XMLHttpRequest();
	var length = 0;
	function onprogress( req, e ) {
		while ( idx < meshEntry.length ) {
			var meshParams = meshEntry[ idx ];
			var indexRange = meshParams.indexRange;
			if ( indexRange ) {
				var meshEnd = indexRange[ 0 ] + 3 * indexRange[ 1 ];
				if ( req.responseText.length < meshEnd ) break;
				loader.decompressMesh( req.responseText, meshParams, decodeParams, name, idx, callback );
			} else {
				var codeRange = meshParams.codeRange;
				var meshEnd = codeRange[ 0 ] + codeRange[ 1 ];
				if ( req.responseText.length < meshEnd ) break;
				loader.decompressMesh2( req.responseText, meshParams, decodeParams, name, idx, callback );
			}
			++ idx;
		}
	};
	xhr.onreadystatechange = function( e ) {
		if ( xhr.readyState == 4 ) {
			if ( xhr.status == 200 || xhr.status == 0 ) {
				onprogress( xhr, e );
			}
		} else if ( xhr.readyState == 3 ) {
			if ( callbackProgress ) {
				if ( length == 0 ) {
					length = xhr.getResponseHeader( "Content-Length" );
				}
				callbackProgress( {total: length, loaded: xhr.responseText.length} );
			}
		}
	}
	xhr.open( "GET", path, true );
	xhr.send( null );
};

THREE.UTF8Loader.prototype.downloadMeshes = function ( path, meshUrlMap, decodeParams, callback, callbackProgress ) {
	for ( var url in meshUrlMap ) {
		var meshEntry = meshUrlMap[url];
		this.downloadMesh( path + url, url, meshEntry, decodeParams, callback, callbackProgress );
	}
};

THREE.UTF8Loader.prototype.createMeshCallback = function( materialBaseUrl, loadModelInfo, allDoneCallback ) {
	var nCompletedUrls = 0;
	var nExpectedUrls = 0;
	var expectedMeshesPerUrl = {};
	var decodedMeshesPerUrl = {};
	var modelParts = {};
	var meshUrlMap = loadModelInfo.urls;
	for ( var url in meshUrlMap ) {
		expectedMeshesPerUrl[ url ] = meshUrlMap[ url ].length;
		decodedMeshesPerUrl[ url ] = 0;
		nExpectedUrls ++;
		modelParts[ url ] = new THREE.Object3D();
	}
	var model = new THREE.Object3D();
	var materialCreator = new THREE.MTLLoader.MaterialCreator( materialBaseUrl, loadModelInfo.options );
	materialCreator.setMaterials( loadModelInfo.materials );
	materialCreator.preload();
	var bufferGeometryCreator = new THREE.UTF8Loader.BufferGeometryCreator();
	var meshCallback = function( name, idx, attribArray, indexArray, bboxen, meshParams ) {
		var geometry = bufferGeometryCreator.create( attribArray, indexArray );
		var material = materialCreator.create( meshParams.material );
		var mesh = new THREE.Mesh( geometry, material );
		modelParts[ name ].add( mesh );
        //model.add(new THREE.Mesh(geometry, material));
		decodedMeshesPerUrl[ name ] ++;
		if ( decodedMeshesPerUrl[ name ] === expectedMeshesPerUrl[ name ] ) {
			nCompletedUrls ++;
			model.add( modelParts[ name ] );
			if ( nCompletedUrls === nExpectedUrls ) {
				allDoneCallback( model );
			}
		}
	};
	return meshCallback;
};

THREE.UTF8Loader.prototype.downloadModel = function ( geometryBase, materialBase, model, callback, callbackProgress ) {
	var meshCallback = this.createMeshCallback( materialBase, model, callback );
	this.downloadMeshes( geometryBase, model.urls, model.decodeParams, meshCallback, callbackProgress );
};

THREE.UTF8Loader.prototype.downloadModelJson = function ( jsonUrl, callback, options, callbackProgress ) {
	this.getJsonRequest( jsonUrl, function( loaded ) {
		if ( ! loaded.decodeParams ) {
			if ( options && options.decodeParams ) {
				loaded.decodeParams = options.decodeParams;
			} else {
				loaded.decodeParams = DEFAULT_DECODE_PARAMS;
			}
		}
		loaded.options = options;
		var geometryBase = jsonUrl.substr( 0, jsonUrl.lastIndexOf( "/" ) + 1 );
		var materialBase = geometryBase;
		if ( options && options.geometryBase ) {
			geometryBase = options.geometryBase;
			if ( geometryBase.charAt( geometryBase.length - 1 ) !== "/" ) {
				geometryBase = geometryBase + "/";
			}
		}
		if ( options && options.materialBase ) {
			materialBase = options.materialBase;
			if ( materialBase.charAt( materialBase.length - 1 ) !== "/" ) {
				materialBase = materialBase  + "/";
			}
		}
		this.downloadModel( geometryBase, materialBase, loaded, callback, callbackProgress );
	}.bind( this ) );
};

THREE.UTF8Loader.prototype.getHttpRequest = function( url, onload, opt_onprogress ) {
	var LISTENERS = {
        	load: function( e ) { onload( req, e ); },
        	progress: function( e ) { opt_onprogress( e ); }
	};
	var req = new XMLHttpRequest();
	this.addListeners( req, LISTENERS );
	req.open( 'GET', url, true );
	req.send( null );
}

THREE.UTF8Loader.prototype.getJsonRequest = function( url, onjson ) {
	this.getHttpRequest( url,
        function( e ) { onjson( JSON.parse( e.responseText ) ); },
        function() {} );
}

THREE.UTF8Loader.prototype.addListeners = function( dom, listeners ) {
    // TODO: handle event capture, object binding.
	for ( var key in listeners ) {
		dom.addEventListener( key, listeners[ key ] );
	}
}
