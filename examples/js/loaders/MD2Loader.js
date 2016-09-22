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
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			onLoad( scope.parse( buffer ) );

		}, onProgress, onError );

	},

	parse: ( function () {

		var normals = [
			[ -0.525731,  0.000000,  0.850651 ], [ -0.442863,  0.238856,  0.864188 ],
			[ -0.295242,  0.000000,  0.955423 ], [ -0.309017,  0.500000,  0.809017 ],
			[ -0.162460,  0.262866,  0.951056 ], [  0.000000,  0.000000,  1.000000 ],
			[  0.000000,  0.850651,  0.525731 ], [ -0.147621,  0.716567,  0.681718 ],
			[  0.147621,  0.716567,  0.681718 ], [  0.000000,  0.525731,  0.850651 ],
			[  0.309017,  0.500000,  0.809017 ], [  0.525731,  0.000000,  0.850651 ],
			[  0.295242,  0.000000,  0.955423 ], [  0.442863,  0.238856,  0.864188 ],
			[  0.162460,  0.262866,  0.951056 ], [ -0.681718,  0.147621,  0.716567 ],
			[ -0.809017,  0.309017,  0.500000 ], [ -0.587785,  0.425325,  0.688191 ],
			[ -0.850651,  0.525731,  0.000000 ], [ -0.864188,  0.442863,  0.238856 ],
			[ -0.716567,  0.681718,  0.147621 ], [ -0.688191,  0.587785,  0.425325 ],
			[ -0.500000,  0.809017,  0.309017 ], [ -0.238856,  0.864188,  0.442863 ],
			[ -0.425325,  0.688191,  0.587785 ], [ -0.716567,  0.681718, -0.147621 ],
			[ -0.500000,  0.809017, -0.309017 ], [ -0.525731,  0.850651,  0.000000 ],
			[  0.000000,  0.850651, -0.525731 ], [ -0.238856,  0.864188, -0.442863 ],
			[  0.000000,  0.955423, -0.295242 ], [ -0.262866,  0.951056, -0.162460 ],
			[  0.000000,  1.000000,  0.000000 ], [  0.000000,  0.955423,  0.295242 ],
			[ -0.262866,  0.951056,  0.162460 ], [  0.238856,  0.864188,  0.442863 ],
			[  0.262866,  0.951056,  0.162460 ], [  0.500000,  0.809017,  0.309017 ],
			[  0.238856,  0.864188, -0.442863 ], [  0.262866,  0.951056, -0.162460 ],
			[  0.500000,  0.809017, -0.309017 ], [  0.850651,  0.525731,  0.000000 ],
			[  0.716567,  0.681718,  0.147621 ], [  0.716567,  0.681718, -0.147621 ],
			[  0.525731,  0.850651,  0.000000 ], [  0.425325,  0.688191,  0.587785 ],
			[  0.864188,  0.442863,  0.238856 ], [  0.688191,  0.587785,  0.425325 ],
			[  0.809017,  0.309017,  0.500000 ], [  0.681718,  0.147621,  0.716567 ],
			[  0.587785,  0.425325,  0.688191 ], [  0.955423,  0.295242,  0.000000 ],
			[  1.000000,  0.000000,  0.000000 ], [  0.951056,  0.162460,  0.262866 ],
			[  0.850651, -0.525731,  0.000000 ], [  0.955423, -0.295242,  0.000000 ],
			[  0.864188, -0.442863,  0.238856 ], [  0.951056, -0.162460,  0.262866 ],
			[  0.809017, -0.309017,  0.500000 ], [  0.681718, -0.147621,  0.716567 ],
			[  0.850651,  0.000000,  0.525731 ], [  0.864188,  0.442863, -0.238856 ],
			[  0.809017,  0.309017, -0.500000 ], [  0.951056,  0.162460, -0.262866 ],
			[  0.525731,  0.000000, -0.850651 ], [  0.681718,  0.147621, -0.716567 ],
			[  0.681718, -0.147621, -0.716567 ], [  0.850651,  0.000000, -0.525731 ],
			[  0.809017, -0.309017, -0.500000 ], [  0.864188, -0.442863, -0.238856 ],
			[  0.951056, -0.162460, -0.262866 ], [  0.147621,  0.716567, -0.681718 ],
			[  0.309017,  0.500000, -0.809017 ], [  0.425325,  0.688191, -0.587785 ],
			[  0.442863,  0.238856, -0.864188 ], [  0.587785,  0.425325, -0.688191 ],
			[  0.688191,  0.587785, -0.425325 ], [ -0.147621,  0.716567, -0.681718 ],
			[ -0.309017,  0.500000, -0.809017 ], [  0.000000,  0.525731, -0.850651 ],
			[ -0.525731,  0.000000, -0.850651 ], [ -0.442863,  0.238856, -0.864188 ],
			[ -0.295242,  0.000000, -0.955423 ], [ -0.162460,  0.262866, -0.951056 ],
			[  0.000000,  0.000000, -1.000000 ], [  0.295242,  0.000000, -0.955423 ],
			[  0.162460,  0.262866, -0.951056 ], [ -0.442863, -0.238856, -0.864188 ],
			[ -0.309017, -0.500000, -0.809017 ], [ -0.162460, -0.262866, -0.951056 ],
			[  0.000000, -0.850651, -0.525731 ], [ -0.147621, -0.716567, -0.681718 ],
			[  0.147621, -0.716567, -0.681718 ], [  0.000000, -0.525731, -0.850651 ],
			[  0.309017, -0.500000, -0.809017 ], [  0.442863, -0.238856, -0.864188 ],
			[  0.162460, -0.262866, -0.951056 ], [  0.238856, -0.864188, -0.442863 ],
			[  0.500000, -0.809017, -0.309017 ], [  0.425325, -0.688191, -0.587785 ],
			[  0.716567, -0.681718, -0.147621 ], [  0.688191, -0.587785, -0.425325 ],
			[  0.587785, -0.425325, -0.688191 ], [  0.000000, -0.955423, -0.295242 ],
			[  0.000000, -1.000000,  0.000000 ], [  0.262866, -0.951056, -0.162460 ],
			[  0.000000, -0.850651,  0.525731 ], [  0.000000, -0.955423,  0.295242 ],
			[  0.238856, -0.864188,  0.442863 ], [  0.262866, -0.951056,  0.162460 ],
			[  0.500000, -0.809017,  0.309017 ], [  0.716567, -0.681718,  0.147621 ],
			[  0.525731, -0.850651,  0.000000 ], [ -0.238856, -0.864188, -0.442863 ],
			[ -0.500000, -0.809017, -0.309017 ], [ -0.262866, -0.951056, -0.162460 ],
			[ -0.850651, -0.525731,  0.000000 ], [ -0.716567, -0.681718, -0.147621 ],
			[ -0.716567, -0.681718,  0.147621 ], [ -0.525731, -0.850651,  0.000000 ],
			[ -0.500000, -0.809017,  0.309017 ], [ -0.238856, -0.864188,  0.442863 ],
			[ -0.262866, -0.951056,  0.162460 ], [ -0.864188, -0.442863,  0.238856 ],
			[ -0.809017, -0.309017,  0.500000 ], [ -0.688191, -0.587785,  0.425325 ],
			[ -0.681718, -0.147621,  0.716567 ], [ -0.442863, -0.238856,  0.864188 ],
			[ -0.587785, -0.425325,  0.688191 ], [ -0.309017, -0.500000,  0.809017 ],
			[ -0.147621, -0.716567,  0.681718 ], [ -0.425325, -0.688191,  0.587785 ],
			[ -0.162460, -0.262866,  0.951056 ], [  0.442863, -0.238856,  0.864188 ],
			[  0.162460, -0.262866,  0.951056 ], [  0.309017, -0.500000,  0.809017 ],
			[  0.147621, -0.716567,  0.681718 ], [  0.000000, -0.525731,  0.850651 ],
			[  0.425325, -0.688191,  0.587785 ], [  0.587785, -0.425325,  0.688191 ],
			[  0.688191, -0.587785,  0.425325 ], [ -0.955423,  0.295242,  0.000000 ],
			[ -0.951056,  0.162460,  0.262866 ], [ -1.000000,  0.000000,  0.000000 ],
			[ -0.850651,  0.000000,  0.525731 ], [ -0.955423, -0.295242,  0.000000 ],
			[ -0.951056, -0.162460,  0.262866 ], [ -0.864188,  0.442863, -0.238856 ],
			[ -0.951056,  0.162460, -0.262866 ], [ -0.809017,  0.309017, -0.500000 ],
			[ -0.864188, -0.442863, -0.238856 ], [ -0.951056, -0.162460, -0.262866 ],
			[ -0.809017, -0.309017, -0.500000 ], [ -0.681718,  0.147621, -0.716567 ],
			[ -0.681718, -0.147621, -0.716567 ], [ -0.850651,  0.000000, -0.525731 ],
			[ -0.688191,  0.587785, -0.425325 ], [ -0.587785,  0.425325, -0.688191 ],
			[ -0.425325,  0.688191, -0.587785 ], [ -0.425325, -0.688191, -0.587785 ],
			[ -0.587785, -0.425325, -0.688191 ], [ -0.688191, -0.587785, -0.425325 ]
		];

		return function ( buffer ) {

			console.time( 'MD2Loader' );

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

			for ( var i = 0, l = header.num_st; i < l; i ++ ) {

				var u = data.getInt16( offset + 0, true );
				var v = data.getInt16( offset + 2, true );

				uvs.push( new THREE.Vector2( u / header.skinwidth, 1 - ( v / header.skinheight ) ) );

				offset += 4;

			}

			// triangles

			var offset = header.offset_tris;

			for ( var i = 0, l = header.num_tris; i < l; i ++ ) {

				var a = data.getUint16( offset + 0, true );
				var b = data.getUint16( offset + 2, true );
				var c = data.getUint16( offset + 4, true );

				geometry.faces.push( new THREE.Face3( a, b, c ) );

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
			var string = [];

			var offset = header.offset_frames;

			for ( var i = 0, l = header.num_frames; i < l; i ++ ) {

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

				for ( var j = 0; j < 16; j ++ ) {

					var character = data.getUint8( offset + j, true );
					if( character === 0 ) break;
					
					string[ j ] = character;

				}

				var frame = {
					name: String.fromCharCode.apply( null, string ),
					vertices: [],
					normals: []
				};

				offset += 16;

				for ( var j = 0; j < header.num_vertices; j ++ ) {

					var x = data.getUint8( offset ++, true );
					var y = data.getUint8( offset ++, true );
					var z = data.getUint8( offset ++, true );
					var n = normals[ data.getUint8( offset ++, true ) ];

					var vertex = new THREE.Vector3(
						x * scale.x + translation.x,
						z * scale.z + translation.z,
						y * scale.y + translation.y
					);

					var normal = new THREE.Vector3( n[ 0 ], n[ 2 ], n[ 1 ] );

					frame.vertices.push( vertex );
					frame.normals.push( normal );

				}

				geometry.morphTargets.push( frame );

			}

			// Static

			geometry.vertices = geometry.morphTargets[ 0 ].vertices;

			var morphTarget = geometry.morphTargets[ 0 ];

			for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

				var face = geometry.faces[ j ];

				face.vertexNormals = [
					morphTarget.normals[ face.a ],
					morphTarget.normals[ face.b ],
					morphTarget.normals[ face.c ]
				];

			}


			// Convert to geometry.morphNormals

			for ( var i = 0, l = geometry.morphTargets.length; i < l; i ++ ) {

				var morphTarget = geometry.morphTargets[ i ];
				var vertexNormals = [];

				for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {

					var face = geometry.faces[ j ];

					vertexNormals.push( {
						a: morphTarget.normals[ face.a ],
						b: morphTarget.normals[ face.b ],
						c: morphTarget.normals[ face.c ]
					} );

				}

				geometry.morphNormals.push( { vertexNormals: vertexNormals } );

			}

			geometry.animations = THREE.AnimationClip.CreateClipsFromMorphTargetSequences( geometry.morphTargets, 10 )

			console.timeEnd( 'MD2Loader' );

			return geometry;

		}

	} )()

}
