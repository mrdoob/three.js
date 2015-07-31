/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MD2Loader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MD2Loader.prototype = {

	constructor: THREE.MD2Loader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( buffer ) {

		var data = new DataView( buffer );

		// http://tfc.duke.free.fr/coding/md2-specs-en.html

		var header = {};
		var headerNames = [
			'ident', 'version',
			'skinwidth', 'skinheight',
			'framesize',
			'num_skins', 'num_vertices', 'num_st', 'num_tris', 'num_glcmds', 'num_frames',
			'offset_skins', 'offset_st', 'offset_tris', 'offset_frames', 'offset_glcmds', 'offset_end'
		];

		for ( var i = 0; i < headerNames.length; i ++ ) {

			header[ headerNames[ i ] ] = data.getInt32( i * 4, true );

		}

		if ( header.ident !== 844121161 || header.version !== 8 ) {

			console.error( 'Not a valid MD2 file' );
			return;

		}

		if ( header.offset_end !== data.byteLength ) {

			console.error( 'Corrupted MD2 file' );
			return;

		}

		//

		var geometry = new THREE.Geometry();

		// uvs

		var uvs = [];
		var offset = header.offset_st;

		for ( var i = 0; i < header.num_st; i ++, offset += 4 ) {

			var u = data.getInt16( offset + 0, true );
			var v = data.getInt16( offset + 2, true );

			var uv = new THREE.Vector2( u / header.skinwidth, 1 - ( v / header.skinheight ) );

			uvs.push( uv );

		}

		// triangles

		var offset = header.offset_tris;

		for ( var i = 0; i < header.num_tris; i ++ ) {

			var a = data.getUint16( offset + 0, true );
			var b = data.getUint16( offset + 2, true );
			var c = data.getUint16( offset + 4, true );

			var face = new THREE.Face3( a, b, c );

			geometry.faces.push( face );

			geometry.faceVertexUvs[ 0 ].push( [
				uvs[ data.getUint16( offset + 6, true ) ],
				uvs[ data.getUint16( offset + 8, true ) ],
				uvs[ data.getUint16( offset + 10, true ) ]
			] );

			offset += 12;

		}

		// frames

		var translation = new THREE.Vector3();
		var scale = new THREE.Vector3();

		var offset = header.offset_frames;

		for ( var i = 0; i < header.num_frames; i ++ ) {

			scale.set(
				data.getFloat32( offset + 0, true ),
				data.getFloat32( offset + 4, true ),
				data.getFloat32( offset + 8, true )
			);

			translation.set(
				data.getFloat32( offset + 12, true ),
				data.getFloat32( offset + 16, true ),
				data.getFloat32( offset + 20, true )
			);

			offset += 24;

			var string = [];

			for ( var j = 0; j < 16; j ++ ) {

				string[ j ] = data.getUint8( offset + j, true );

			}

			var frame = {
				name: String.fromCharCode.apply( null, string ),
				vertices: []
			};

			offset += 16;

			for ( var j = 0; j < header.num_vertices; j ++ ) {

				var x = data.getUint8( offset ++, true );
				var y = data.getUint8( offset ++, true );
				var z = data.getUint8( offset ++, true );
				var n = data.getUint8( offset ++, true );

				var vertex = new THREE.Vector3(
					x * scale.x + translation.x,
					z * scale.z + translation.z,
					y * scale.y + translation.y
				);

				frame.vertices.push( vertex );

			}

			geometry.morphTargets.push( frame );

		}

		geometry.vertices = geometry.morphTargets[ 0 ].vertices;

		return geometry;

	}

}
