console.warn( "THREE.MD2Loader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );

THREE.MD2Loader = function ( manager ) {

	THREE.Loader.call( this, manager );

};

THREE.MD2Loader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.MD2Loader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	parse: ( function () {

		var normalData = [
			[ - 0.525731, 0.000000, 0.850651 ], [ - 0.442863, 0.238856, 0.864188 ],
			[ - 0.295242, 0.000000, 0.955423 ], [ - 0.309017, 0.500000, 0.809017 ],
			[ - 0.162460, 0.262866, 0.951056 ], [ 0.000000, 0.000000, 1.000000 ],
			[ 0.000000, 0.850651, 0.525731 ], [ - 0.147621, 0.716567, 0.681718 ],
			[ 0.147621, 0.716567, 0.681718 ], [ 0.000000, 0.525731, 0.850651 ],
			[ 0.309017, 0.500000, 0.809017 ], [ 0.525731, 0.000000, 0.850651 ],
			[ 0.295242, 0.000000, 0.955423 ], [ 0.442863, 0.238856, 0.864188 ],
			[ 0.162460, 0.262866, 0.951056 ], [ - 0.681718, 0.147621, 0.716567 ],
			[ - 0.809017, 0.309017, 0.500000 ], [ - 0.587785, 0.425325, 0.688191 ],
			[ - 0.850651, 0.525731, 0.000000 ], [ - 0.864188, 0.442863, 0.238856 ],
			[ - 0.716567, 0.681718, 0.147621 ], [ - 0.688191, 0.587785, 0.425325 ],
			[ - 0.500000, 0.809017, 0.309017 ], [ - 0.238856, 0.864188, 0.442863 ],
			[ - 0.425325, 0.688191, 0.587785 ], [ - 0.716567, 0.681718, - 0.147621 ],
			[ - 0.500000, 0.809017, - 0.309017 ], [ - 0.525731, 0.850651, 0.000000 ],
			[ 0.000000, 0.850651, - 0.525731 ], [ - 0.238856, 0.864188, - 0.442863 ],
			[ 0.000000, 0.955423, - 0.295242 ], [ - 0.262866, 0.951056, - 0.162460 ],
			[ 0.000000, 1.000000, 0.000000 ], [ 0.000000, 0.955423, 0.295242 ],
			[ - 0.262866, 0.951056, 0.162460 ], [ 0.238856, 0.864188, 0.442863 ],
			[ 0.262866, 0.951056, 0.162460 ], [ 0.500000, 0.809017, 0.309017 ],
			[ 0.238856, 0.864188, - 0.442863 ], [ 0.262866, 0.951056, - 0.162460 ],
			[ 0.500000, 0.809017, - 0.309017 ], [ 0.850651, 0.525731, 0.000000 ],
			[ 0.716567, 0.681718, 0.147621 ], [ 0.716567, 0.681718, - 0.147621 ],
			[ 0.525731, 0.850651, 0.000000 ], [ 0.425325, 0.688191, 0.587785 ],
			[ 0.864188, 0.442863, 0.238856 ], [ 0.688191, 0.587785, 0.425325 ],
			[ 0.809017, 0.309017, 0.500000 ], [ 0.681718, 0.147621, 0.716567 ],
			[ 0.587785, 0.425325, 0.688191 ], [ 0.955423, 0.295242, 0.000000 ],
			[ 1.000000, 0.000000, 0.000000 ], [ 0.951056, 0.162460, 0.262866 ],
			[ 0.850651, - 0.525731, 0.000000 ], [ 0.955423, - 0.295242, 0.000000 ],
			[ 0.864188, - 0.442863, 0.238856 ], [ 0.951056, - 0.162460, 0.262866 ],
			[ 0.809017, - 0.309017, 0.500000 ], [ 0.681718, - 0.147621, 0.716567 ],
			[ 0.850651, 0.000000, 0.525731 ], [ 0.864188, 0.442863, - 0.238856 ],
			[ 0.809017, 0.309017, - 0.500000 ], [ 0.951056, 0.162460, - 0.262866 ],
			[ 0.525731, 0.000000, - 0.850651 ], [ 0.681718, 0.147621, - 0.716567 ],
			[ 0.681718, - 0.147621, - 0.716567 ], [ 0.850651, 0.000000, - 0.525731 ],
			[ 0.809017, - 0.309017, - 0.500000 ], [ 0.864188, - 0.442863, - 0.238856 ],
			[ 0.951056, - 0.162460, - 0.262866 ], [ 0.147621, 0.716567, - 0.681718 ],
			[ 0.309017, 0.500000, - 0.809017 ], [ 0.425325, 0.688191, - 0.587785 ],
			[ 0.442863, 0.238856, - 0.864188 ], [ 0.587785, 0.425325, - 0.688191 ],
			[ 0.688191, 0.587785, - 0.425325 ], [ - 0.147621, 0.716567, - 0.681718 ],
			[ - 0.309017, 0.500000, - 0.809017 ], [ 0.000000, 0.525731, - 0.850651 ],
			[ - 0.525731, 0.000000, - 0.850651 ], [ - 0.442863, 0.238856, - 0.864188 ],
			[ - 0.295242, 0.000000, - 0.955423 ], [ - 0.162460, 0.262866, - 0.951056 ],
			[ 0.000000, 0.000000, - 1.000000 ], [ 0.295242, 0.000000, - 0.955423 ],
			[ 0.162460, 0.262866, - 0.951056 ], [ - 0.442863, - 0.238856, - 0.864188 ],
			[ - 0.309017, - 0.500000, - 0.809017 ], [ - 0.162460, - 0.262866, - 0.951056 ],
			[ 0.000000, - 0.850651, - 0.525731 ], [ - 0.147621, - 0.716567, - 0.681718 ],
			[ 0.147621, - 0.716567, - 0.681718 ], [ 0.000000, - 0.525731, - 0.850651 ],
			[ 0.309017, - 0.500000, - 0.809017 ], [ 0.442863, - 0.238856, - 0.864188 ],
			[ 0.162460, - 0.262866, - 0.951056 ], [ 0.238856, - 0.864188, - 0.442863 ],
			[ 0.500000, - 0.809017, - 0.309017 ], [ 0.425325, - 0.688191, - 0.587785 ],
			[ 0.716567, - 0.681718, - 0.147621 ], [ 0.688191, - 0.587785, - 0.425325 ],
			[ 0.587785, - 0.425325, - 0.688191 ], [ 0.000000, - 0.955423, - 0.295242 ],
			[ 0.000000, - 1.000000, 0.000000 ], [ 0.262866, - 0.951056, - 0.162460 ],
			[ 0.000000, - 0.850651, 0.525731 ], [ 0.000000, - 0.955423, 0.295242 ],
			[ 0.238856, - 0.864188, 0.442863 ], [ 0.262866, - 0.951056, 0.162460 ],
			[ 0.500000, - 0.809017, 0.309017 ], [ 0.716567, - 0.681718, 0.147621 ],
			[ 0.525731, - 0.850651, 0.000000 ], [ - 0.238856, - 0.864188, - 0.442863 ],
			[ - 0.500000, - 0.809017, - 0.309017 ], [ - 0.262866, - 0.951056, - 0.162460 ],
			[ - 0.850651, - 0.525731, 0.000000 ], [ - 0.716567, - 0.681718, - 0.147621 ],
			[ - 0.716567, - 0.681718, 0.147621 ], [ - 0.525731, - 0.850651, 0.000000 ],
			[ - 0.500000, - 0.809017, 0.309017 ], [ - 0.238856, - 0.864188, 0.442863 ],
			[ - 0.262866, - 0.951056, 0.162460 ], [ - 0.864188, - 0.442863, 0.238856 ],
			[ - 0.809017, - 0.309017, 0.500000 ], [ - 0.688191, - 0.587785, 0.425325 ],
			[ - 0.681718, - 0.147621, 0.716567 ], [ - 0.442863, - 0.238856, 0.864188 ],
			[ - 0.587785, - 0.425325, 0.688191 ], [ - 0.309017, - 0.500000, 0.809017 ],
			[ - 0.147621, - 0.716567, 0.681718 ], [ - 0.425325, - 0.688191, 0.587785 ],
			[ - 0.162460, - 0.262866, 0.951056 ], [ 0.442863, - 0.238856, 0.864188 ],
			[ 0.162460, - 0.262866, 0.951056 ], [ 0.309017, - 0.500000, 0.809017 ],
			[ 0.147621, - 0.716567, 0.681718 ], [ 0.000000, - 0.525731, 0.850651 ],
			[ 0.425325, - 0.688191, 0.587785 ], [ 0.587785, - 0.425325, 0.688191 ],
			[ 0.688191, - 0.587785, 0.425325 ], [ - 0.955423, 0.295242, 0.000000 ],
			[ - 0.951056, 0.162460, 0.262866 ], [ - 1.000000, 0.000000, 0.000000 ],
			[ - 0.850651, 0.000000, 0.525731 ], [ - 0.955423, - 0.295242, 0.000000 ],
			[ - 0.951056, - 0.162460, 0.262866 ], [ - 0.864188, 0.442863, - 0.238856 ],
			[ - 0.951056, 0.162460, - 0.262866 ], [ - 0.809017, 0.309017, - 0.500000 ],
			[ - 0.864188, - 0.442863, - 0.238856 ], [ - 0.951056, - 0.162460, - 0.262866 ],
			[ - 0.809017, - 0.309017, - 0.500000 ], [ - 0.681718, 0.147621, - 0.716567 ],
			[ - 0.681718, - 0.147621, - 0.716567 ], [ - 0.850651, 0.000000, - 0.525731 ],
			[ - 0.688191, 0.587785, - 0.425325 ], [ - 0.587785, 0.425325, - 0.688191 ],
			[ - 0.425325, 0.688191, - 0.587785 ], [ - 0.425325, - 0.688191, - 0.587785 ],
			[ - 0.587785, - 0.425325, - 0.688191 ], [ - 0.688191, - 0.587785, - 0.425325 ]
		];

		return function ( buffer ) {

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

			var geometry = new THREE.BufferGeometry();

			// uvs

			var uvsTemp = [];
			var offset = header.offset_st;

			for ( var i = 0, l = header.num_st; i < l; i ++ ) {

				var u = data.getInt16( offset + 0, true );
				var v = data.getInt16( offset + 2, true );

				uvsTemp.push( u / header.skinwidth, 1 - ( v / header.skinheight ) );

				offset += 4;

			}

			// triangles

			offset = header.offset_tris;

			var vertexIndices = [];
			var uvIndices = [];

			for ( var i = 0, l = header.num_tris; i < l; i ++ ) {

				vertexIndices.push(
					data.getUint16( offset + 0, true ),
					data.getUint16( offset + 2, true ),
					data.getUint16( offset + 4, true )
				);

				uvIndices.push(
					data.getUint16( offset + 6, true ),
					data.getUint16( offset + 8, true ),
					data.getUint16( offset + 10, true )
				);

				offset += 12;

			}

			// frames

			var translation = new THREE.Vector3();
			var scale = new THREE.Vector3();
			var string = [];

			var frames = [];

			offset = header.offset_frames;

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
					if ( character === 0 ) break;

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
					var n = normalData[ data.getUint8( offset ++, true ) ];

					x = x * scale.x + translation.x;
					y = y * scale.y + translation.y;
					z = z * scale.z + translation.z;

					frame.vertices.push( x, z, y ); // convert to Y-up
					frame.normals.push( n[ 0 ], n[ 2 ], n[ 1 ] ); // convert to Y-up

				}

				frames.push( frame );

			}

			// static

			var positions = [];
			var normals = [];
			var uvs = [];

			var verticesTemp = frames[ 0 ].vertices;
			var normalsTemp = frames[ 0 ].normals;

			for ( var i = 0, l = vertexIndices.length; i < l; i ++ ) {

				var vertexIndex = vertexIndices[ i ];
				var stride = vertexIndex * 3;

				//

				var x = verticesTemp[ stride ];
				var y = verticesTemp[ stride + 1 ];
				var z = verticesTemp[ stride + 2 ];

				positions.push( x, y, z );

				//

				var nx = normalsTemp[ stride ];
				var ny = normalsTemp[ stride + 1 ];
				var nz = normalsTemp[ stride + 2 ];

				normals.push( nx, ny, nz );

				//

				var uvIndex = uvIndices[ i ];
				stride = uvIndex * 2;

				var u = uvsTemp[ stride ];
				var v = uvsTemp[ stride + 1 ];

				uvs.push( u, v );

			}

			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
			geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
			geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

			// animation

			var morphPositions = [];
			var morphNormals = [];

			for ( var i = 0, l = frames.length; i < l; i ++ ) {

				var frame = frames[ i ];
				var attributeName = frame.name;

				if ( frame.vertices.length > 0 ) {

					var positions = [];

					for ( var j = 0, jl = vertexIndices.length; j < jl; j ++ ) {

						var vertexIndex = vertexIndices[ j ];
						var stride = vertexIndex * 3;

						var x = frame.vertices[ stride ];
						var y = frame.vertices[ stride + 1 ];
						var z = frame.vertices[ stride + 2 ];

						positions.push( x, y, z );

					}

					var positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
					positionAttribute.name = attributeName;

					morphPositions.push( positionAttribute );

				}

				if ( frame.normals.length > 0 ) {

					var normals = [];

					for ( var j = 0, jl = vertexIndices.length; j < jl; j ++ ) {

						var vertexIndex = vertexIndices[ j ];
						var stride = vertexIndex * 3;

						var nx = frame.normals[ stride ];
						var ny = frame.normals[ stride + 1 ];
						var nz = frame.normals[ stride + 2 ];

						normals.push( nx, ny, nz );

					}

					var normalAttribute = new THREE.Float32BufferAttribute( normals, 3 );
					normalAttribute.name = attributeName;

					morphNormals.push( normalAttribute );

				}

			}

			geometry.morphAttributes.position = morphPositions;
			geometry.morphAttributes.normal = morphNormals;
			geometry.morphTargetsRelative = false;

			geometry.animations = THREE.AnimationClip.CreateClipsFromMorphTargetSequences( frames, 10 );

			return geometry;

		};

	} )()

} );
