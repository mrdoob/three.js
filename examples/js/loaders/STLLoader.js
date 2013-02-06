/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 *
 * Description: A THREE loader for STL files, as created by Solidworks and other CAD programs.
 *
 * Limitations: Currently supports ASCII and binary format
 *
 * Usage:
 * 	var loader = new THREE.STLLoader();
 * 	loader.addEventListener( 'load', function ( event ) {
 *
 * 		var geometry = event.content;
 * 		scene.add( new THREE.Mesh( geometry ) );
 *
 * 	} );
 * 	loader.load( './models/stl/slotted_disk.stl' );
 */


THREE.STLLoader = function () {

	THREE.EventDispatcher.call( this );

};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();
		request.overrideMimeType("text/plain; charset=x-user-defined")

		request.addEventListener( 'load', function ( event ) {

			var geometry = scope.parse( event.target.responseText );

			scope.dispatchEvent( { type: 'load', content: geometry } );

			if ( callback ) callback( geometry );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( data ) {

		var geometry = new THREE.Geometry();

		if(data[0].toUpperCase() == 'S')
		{
		
		var patternFace = /facet([\s\S]*?)endfacet/g;
		var result;

		while ( ( result = patternFace.exec( data ) ) != null ) {

			var text = result[ 0 ];

			// Normal
			var patternNormal = /normal[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while( ( result = patternNormal.exec( text ) ) != null ) {

				var normal = new THREE.Vector3( result[ 1 ], result[ 3 ], result[ 5 ] );

			}

			// Vertex
			var patternVertex = /vertex[\s]+([-+]?[0-9]+\.?[0-9]*([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+[\s]+([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)+/g;

			while( ( result = patternVertex.exec( text ) ) != null ) {

				geometry.vertices.push(	new THREE.Vector3( result[ 1 ], result[ 3 ], result[ 5 ] ) );

			}

			var len = geometry.vertices.length;
			geometry.faces.push( new THREE.Face3( len - 3, len - 2, len - 1, normal ) );

		}
		
		}
		else
		{
			var buf = new ArrayBuffer(data.length);
			var bbuf = new Int8Array(buf);
			for(var i=0; i < data.length; ++i)
			{
				bbuf[i] = data.charCodeAt(i) & 0xff;
			}
			var headerEnd = 80;
			
			var numFacets = new Uint32Array(bbuf.buffer, headerEnd, 1)[0];
			var offset = headerEnd + 4; //
		
			var facetSize = 50;
			var slideBuf = new Int8Array(facetSize);
			var n =  new Float32Array(slideBuf.buffer, 0, 3);
			var v1 = new Float32Array(slideBuf.buffer, 12, 3);
			var v2 = new Float32Array(slideBuf.buffer, 24, 3);
			var v3 = new Float32Array(slideBuf.buffer, 36, 3);
			var bc = new Int16Array(slideBuf.buffer, 48, 1);
			for(var i=0; i < numFacets; ++i)
			{			
				for(var j=0; j < facetSize; ++j)
				{
					slideBuf[j] = bbuf[offset+j];
				}
				
				var normal = new THREE.Vector3(n[0], n[1], n[2]);
				var vt1 = new THREE.Vector3(v1[0], v1[1], v1[2]);
				var vt2 = new THREE.Vector3(v2[0], v2[1], v2[2]);
				var vt3 = new THREE.Vector3(v3[0], v3[1], v3[2]);

				geometry.vertices.push(vt1);
				geometry.vertices.push(vt2);
				geometry.vertices.push(vt3);
				
				var len = geometry.vertices.length;
				geometry.faces.push( new THREE.Face3( len - 3, len - 2, len - 1, normal) );
				
				offset += facetSize;
			}
		
			delete slideBuf;
			delete bbuf;
			delete buf;
			buf = null;
		}
		}

		geometry.computeCentroids();
		geometry.computeBoundingSphere();

		return geometry;

	}

};
