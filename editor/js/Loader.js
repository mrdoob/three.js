/**
 * @author mrdoob / http://mrdoob.com/
 */

var Loader = function ( editor ) {

	var scope = this;
	var signals = editor.signals;

	this.texturePath = '';

	this.loadFiles = function ( files ) {

		if ( files.length > 0 ) {

			var filesMap = createFileMap( files );

			var manager = new THREE.LoadingManager();
			manager.setURLModifier( function ( url ) {

				var file = filesMap[ url ];

				if ( file ) {

					console.log( 'Loading', url );

					return URL.createObjectURL( file );

				}

				return url;

			} );

			for ( var i = 0; i < files.length; i ++ ) {

				scope.loadFile( files[ i ], manager );

			}

		}

	};

	this.loadFile = function ( file, manager ) {

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';

			console.log( 'Loading', filename, size, progress );

		} );

		switch ( extension ) {

			case '3ds':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.TDSLoader();
					var object = loader.parse( event.target.result );

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'amf':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AMFLoader();
					var amfobject = loader.parse( event.target.result );

					editor.execute( new AddObjectCommand( amfobject ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'awd':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.AWDLoader();
					var scene = loader.parse( event.target.result );

					editor.execute( new SetSceneCommand( scene ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'babylon':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();
					var scene = loader.parse( json );

					editor.execute( new SetSceneCommand( scene ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'babylonmeshdata':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.BabylonLoader();

					var geometry = loader.parseGeometry( json );
					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.execute( new AddObjectCommand( mesh ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'ctm':

				reader.addEventListener( 'load', function ( event ) {

					var data = new Uint8Array( event.target.result );

					var stream = new CTM.Stream( data );
					stream.offset = 0;

					var loader = new THREE.CTMLoader();
					loader.createModel( new CTM.File( stream ), function ( geometry ) {

						geometry.sourceType = "ctm";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshStandardMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						editor.execute( new AddObjectCommand( mesh ) );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader( manager );
					var collada = loader.parse( contents );

					collada.scene.name = filename;

					editor.execute( new AddObjectCommand( collada.scene ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'fbx':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.FBXLoader( manager );
					var object = loader.parse( contents );

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'glb':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					THREE.DRACOLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

					var loader = new THREE.GLTFLoader();
					loader.setDRACOLoader( new THREE.DRACOLoader() );
					loader.parse( contents, '', function ( result ) {

						var scene = result.scene;
						scene.name = filename;
						editor.addAnimation( scene, result.animations );
						editor.execute( new AddObjectCommand( scene ) );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'gltf':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader;

					if ( isGLTF1( contents ) ) {

						loader = new THREE.LegacyGLTFLoader( manager );

					} else {

						loader = new THREE.GLTFLoader( manager );

					}

					loader.parse( contents, '', function ( result ) {

						var scene = result.scene;
						scene.name = filename;
						editor.addAnimation( scene, result.animations );
						editor.execute( new AddObjectCommand( scene ) );

					} );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'js':
			case 'json':

			case '3geo':
			case '3mat':
			case '3obj':
			case '3scn':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							handleJSON( event.data, file, filename );

						};

						worker.postMessage( Date.now() );

						return;

					}

					// >= 3.0

					var data;

					try {

						data = JSON.parse( contents );

					} catch ( error ) {

						alert( error );
						return;

					}

					handleJSON( data, file, filename );

				}, false );
				reader.readAsText( file );

				break;


			case 'kmz':

				reader.addEventListener( 'load', function ( event ) {

					var loader = new THREE.KMZLoader();
					var collada = loader.parse( event.target.result );

					collada.scene.name = filename;

					editor.execute( new AddObjectCommand( collada.scene ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'md2':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.MD2Loader().parse( contents );
					var material = new THREE.MeshStandardMaterial( {
						morphTargets: true,
						morphNormals: true
					} );

					var mesh = new THREE.Mesh( geometry, material );
					mesh.mixer = new THREE.AnimationMixer( mesh );
					mesh.name = filename;

					editor.execute( new AddObjectCommand( mesh ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'obj':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'playcanvas':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var json = JSON.parse( contents );

					var loader = new THREE.PlayCanvasLoader();
					var object = loader.parse( json );

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.execute( new AddObjectCommand( mesh ) );

				}, false );
				reader.readAsArrayBuffer( file );

				break;

			case 'stl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.execute( new AddObjectCommand( mesh ) );

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			case 'svg':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.SVGLoader();
					var paths = loader.parse( contents );

					//

					var group = new THREE.Group();
					group.scale.multiplyScalar( 0.1 );
					group.scale.y *= - 1;

					for ( var i = 0; i < paths.length; i ++ ) {

						var path = paths[ i ];

						var material = new THREE.MeshBasicMaterial( {
							color: path.color,
							depthWrite: false
						} );

						var shapes = path.toShapes( true );

						for ( var j = 0; j < shapes.length; j ++ ) {

							var shape = shapes[ j ];

							var geometry = new THREE.ShapeBufferGeometry( shape );
							var mesh = new THREE.Mesh( geometry, material );

							group.add( mesh );

						}

					}

					editor.execute( new AddObjectCommand( group ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'vtk':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					editor.execute( new AddObjectCommand( mesh ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					editor.execute( new SetSceneCommand( result ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'zip':

				reader.addEventListener( 'load', function ( event ) {

					handleZIP( event.target.result );

				}, false );
				reader.readAsBinaryString( file );

				break;

			default:

				// alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}

	};

	function handleJSON( data, file, filename ) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.formatVersion !== undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		switch ( data.metadata.type.toLowerCase() ) {

			case 'buffergeometry':

				var loader = new THREE.BufferGeometryLoader();
				var result = loader.parse( data );

				var mesh = new THREE.Mesh( result );

				editor.execute( new AddObjectCommand( mesh ) );

				break;

			case 'geometry':

				console.error( 'Loader: "Geometry" is no longer supported.' );

				break;

			case 'object':

				var loader = new THREE.ObjectLoader();
				loader.setResourcePath( scope.texturePath );

				var result = loader.parse( data );

				if ( result instanceof THREE.Scene ) {

					editor.execute( new SetSceneCommand( result ) );

				} else {

					editor.execute( new AddObjectCommand( result ) );

				}

				break;

			case 'app':

				editor.fromJSON( data );

				break;

		}

	}

	function createFileMap( files ) {

		var map = {};

		for ( var i = 0; i < files.length; i ++ ) {

			var file = files[ i ];
			map[ file.name ] = file;

		}

		return map;

	}

	function handleZIP( contents ) {

		var zip = new JSZip( contents );

		// Poly

		if ( zip.files[ 'model.obj' ] && zip.files[ 'materials.mtl' ] ) {

			var materials = new THREE.MTLLoader().parse( zip.file( 'materials.mtl' ).asText() );
			var object = new THREE.OBJLoader().setMaterials( materials ).parse( zip.file( 'model.obj' ).asText() );
			editor.execute( new AddObjectCommand( object ) );

		}

		//

		zip.filter( function ( path, file ) {

			var manager = new THREE.LoadingManager();
			manager.setURLModifier( function ( url ) {

				var file = zip.files[ url ];

				if ( file ) {

					console.log( 'Loading', url );

					var blob = new Blob( [ file.asArrayBuffer() ], { type: 'application/octet-stream' } );
					return URL.createObjectURL( blob );

				}

				return url;

			} );

			var extension = file.name.split( '.' ).pop().toLowerCase();

			switch ( extension ) {

				case 'fbx':

					var loader = new THREE.FBXLoader( manager );
					var object = loader.parse( file.asArrayBuffer() );

					editor.execute( new AddObjectCommand( object ) );

					break;

				case 'glb':

					var loader = new THREE.GLTFLoader();
					loader.parse( file.asArrayBuffer(), '', function ( result ) {

						var scene = result.scene;
						editor.addAnimation( scene, result.animations );
						editor.execute( new AddObjectCommand( scene ) );

					} );

					break;

				case 'gltf':

					var loader = new THREE.GLTFLoader( manager );
					loader.parse( file.asText(), '', function ( result ) {

						var scene = result.scene;
						editor.addAnimation( scene, result.animations );
						editor.execute( new AddObjectCommand( scene ) );

					} );

					break;

			}

		} );

	}

	function isGLTF1( contents ) {

		var resultContent;

		if ( typeof contents === 'string' ) {

			// contents is a JSON string
			resultContent = contents;

		} else {

			var magic = THREE.LoaderUtils.decodeText( new Uint8Array( contents, 0, 4 ) );

			if ( magic === 'glTF' ) {

				// contents is a .glb file; extract the version
				var version = new DataView( contents ).getUint32( 4, true );

				return version < 2;

			} else {

				// contents is a .gltf file
				resultContent = THREE.LoaderUtils.decodeText( new Uint8Array( contents ) );

			}

		}

		var json = JSON.parse( resultContent );

		return ( json.asset != undefined && json.asset.version[ 0 ] < 2 );

	}

};
