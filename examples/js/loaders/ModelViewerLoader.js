/**
 * @author jsidd / https://github.com/jsidd
 */

THREE.ModelViewerLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ModelViewerLoader.prototype = {

loadFromPath: function ( path, extra, onLoad, onProgress, onError ) {
  var token, fileName, fileType;

	var scope = this;

  token = path.split('.');
  fileType = token[token.length-1].toLowerCase();

  if (fileType === "json")
  {
    if (token[token.length-2] === "assimp")
      fileType = "assimp.json";
    }

    token = path.split('/');
    fileName = token[token.length-1];

  var loader;

  switch(fileType)
  {
    case "awd":
      console.log("awd");
      loader = new THREE.AWDLoader( scope.manager );
      loader.load( path , function ( data ) {
        onLoad(data);
      });
      break;
    case "assimp.json":
      console.log("assimp.json");
      loader = new THREE.AssimpJSONLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data);
      }, onProgress, onError);
      break;
    case "babylon":
      console.log("babylon");
      loader = new THREE.BabylonLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data);
      }, onProgress, onError);
      break;
    case "dae":
      console.log("dae");
      loader = new THREE.ColladaLoader( scope.manager );
      loader.options.convertUpAxis = true;
      loader.load( path , function ( data ) {
				onLoad(data.scene);
      });
      break;
    case "fbx":
      console.log("fbx");
      loader = new THREE.FBXLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data);
      });
      break;
    case "gltf":
      console.log("gltf");
      loader = new THREE.GLTFLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data.scene);
  		});
      break;
    case "json":
        console.log("json");
        loader = new THREE.ObjectLoader( scope.manager );
        loader.load( path , function ( data ) {
					onLoad(data);
        });
      break;
    case "obj":
      console.log("obj");
      loader = new THREE.OBJLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data);
      }, onProgress, onError);
      break;
    case "pcd":
      console.log("pcd");
      loader = new THREE.PCDLoader( scope.manager );
      loader.load( path , function ( mesh ) {
				onLoad(mesh);
        var center = mesh.geometry.boundingSphere.center;
        controls.target.set( center.x, center.y, center.z);
        controls.update();
        //camera.up.set(0,0,1);
        });
      break;
    case "sea":
      console.log("sea");
      loader = new THREE.SEA3D({
        autoPlay : false, // Auto play animations
        container : scene // Container to add models
      } );
      loader.load( path );
			loader.onComplete = function( e ) {
				// Get camera from SEA3D Studio
				// use loader.get... to get others objects
				var cam = loader.getCamera( extra );
				camera.position.copy( cam.position );
				camera.rotation.copy( cam.rotation );
			};
      break;
    case "wrl":
      console.log("wrl");
      loader = new THREE.VRMLLoader( scope.manager );
      loader.load( path , function ( data ) {
				onLoad(data);
        });
      break;
    default:
    alert( 'loadFromPath: Unsupported file format (' + extension +  ').' );
      break;
  }
},

loadFile: function ( file, onLoad ) {
	var scope = this;
	//copied with changes to root node loading from:
	//https://github.com/mrdoob/three.js/blob/dev/editor/js/Loader.js
	var filename = file.name;
	var extension = filename.split( '.' ).pop().toLowerCase();

	var reader = new FileReader();
	reader.addEventListener( 'progress', function ( event ) {

		//got error here
		//var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
		//var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
		//console.log( 'Loading', filename, size, progress );

	} );

	switch ( extension ) {

		case 'amf':

			reader.addEventListener( 'load', function ( event ) {

				var loader = new THREE.AMFLoader( scope.manager );
				var amfobject = loader.parse( event.target.result );

				//editor.execute( new AddObjectCommand( amfobject ) );
				onLoad( amfobject );

			}, false );
			reader.readAsArrayBuffer( file );

			break;

		case 'awd':

			reader.addEventListener( 'load', function ( event ) {

				var loader = new THREE.AWDLoader( scope.manager );
				var scene = loader.parse( event.target.result );

				//editor.execute( new SetSceneCommand( scene ) );
				onLoad( scene );

			}, false );
			reader.readAsArrayBuffer( file );

			break;

		case 'babylon':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;
				var json = JSON.parse( contents );

				var loader = new THREE.BabylonLoader( scope.manager );
				var scene = loader.parse( json );

				//editor.execute( new SetSceneCommand( scene ) );
				onLoad( scene );

			}, false );
			reader.readAsText( file );

			break;

		case 'babylonmeshdata':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;
				var json = JSON.parse( contents );

				var loader = new THREE.BabylonLoader( scope.manager );

				var geometry = loader.parseGeometry( json );
				var material = new THREE.MeshStandardMaterial();

				var mesh = new THREE.Mesh( geometry, material );
				mesh.name = filename;

				//editor.execute( new AddObjectCommand( mesh ) );
				onLoad( mesh );

			}, false );
			reader.readAsText( file );

			break;

		case 'ctm':

			reader.addEventListener( 'load', function ( event ) {

				var data = new Uint8Array( event.target.result );

				var stream = new CTM.Stream( data );
				stream.offset = 0;

				var loader = new THREE.CTMLoader( scope.manager );
				loader.createModel( new CTM.File( stream ), function( geometry ) {

					geometry.sourceType = "ctm";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshStandardMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					//editor.execute( new AddObjectCommand( mesh ) );
					onLoad( mesh );

				} );

			}, false );
			reader.readAsArrayBuffer( file );

			break;

		case 'dae':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var loader = new THREE.ColladaLoader( scope.manager );

				//display model facing camera
				loader.options.convertUpAxis = true;

				var collada = loader.parse( contents );

				collada.scene.name = filename;

				//editor.execute( new AddObjectCommand( collada.scene ) );
				onLoad( collada.scene );

			}, false );
			reader.readAsText( file );

			break;

		case 'fbx':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var loader = new THREE.FBXLoader( scope.manager );
				var object = loader.parse( contents );

				//editor.execute( new AddObjectCommand( object ) );
				onLoad ( object );

			}, false );
			reader.readAsText( file );

			break;

		case 'gltf':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;
				var json = JSON.parse( contents );

				var loader = new THREE.GLTFLoader( scope.manager );
				loader.parse( json, function ( result ) {

					result.scene.name = filename;
					//editor.execute( new AddObjectCommand( result.scene ) );
					onLoad ( result.scene );

				} );

			}, false );
			reader.readAsText( file );

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
						scope.handleJSON( event.data, file, filename, onLoad );

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

				scope.handleJSON( data, file, filename, onLoad );

			}, false );
			reader.readAsText( file );

			break;

		case 'kmz':

			reader.addEventListener( 'load', function ( event ) {

				var loader = new THREE.KMZLoader( scope.manager );
				var collada = loader.parse( event.target.result );

				collada.scene.name = filename;

				//editor.execute( new AddObjectCommand( collada.scene ) );
				onLoad( collada.scene );

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

				//editor.execute( new AddObjectCommand( mesh ) );
				onLoad( mesh );

			}, false );
			reader.readAsArrayBuffer( file );

			break;

		case 'obj':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var object = new THREE.OBJLoader().parse( contents );
				object.name = filename;

				//editor.execute( new AddObjectCommand( object ) );
				onLoad( object );

			}, false );
			reader.readAsText( file );

			break;

		case 'playcanvas':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;
				var json = JSON.parse( contents );

				var loader = new THREE.PlayCanvasLoader( scope.manager );
				var object = loader.parse( json );

				//editor.execute( new AddObjectCommand( object ) );
				onLoad ( object );

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

				//editor.execute( new AddObjectCommand( mesh ) );
				onLoad ( mesh );

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

				//editor.execute( new AddObjectCommand( mesh ) );
				onLoad( mesh );

			}, false );

			if ( reader.readAsBinaryString !== undefined ) {

				reader.readAsBinaryString( file );

			} else {

				reader.readAsArrayBuffer( file );

			}

			break;

		/*
		case 'utf8':
			reader.addEventListener( 'load', function ( event ) {
				var contents = event.target.result;
				var geometry = new THREE.UTF8Loader().parse( contents );
				var material = new THREE.MeshLambertMaterial();
				var mesh = new THREE.Mesh( geometry, material );
				editor.execute( new AddObjectCommand( mesh ) );
			}, false );
			reader.readAsBinaryString( file );
			break;
		*/

		case 'vtk':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var geometry = new THREE.VTKLoader().parse( contents );
				geometry.sourceType = "vtk";
				geometry.sourceFile = file.name;

				var material = new THREE.MeshStandardMaterial();

				var mesh = new THREE.Mesh( geometry, material );
				mesh.name = filename;

				//editor.execute( new AddObjectCommand( mesh ) );
				onLoad( mesh );

			}, false );
			reader.readAsText( file );

			break;

		case 'wrl':

			reader.addEventListener( 'load', function ( event ) {

				var contents = event.target.result;

				var result = new THREE.VRMLLoader().parse( contents );

				//editor.execute( new SetSceneCommand( result ) );
				onLoad ( result );

			}, false );
			reader.readAsText( file );

			break;

		default:

			alert( 'loadFile: Unsupported file format (' + extension +  ').' );

			break;

	}
},

handleJSON: function ( data, file, filename, onLoad ) {
	//copied from:
	//https://github.com/mrdoob/three.js/blob/dev/editor/js/Loader.js

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

			var loader = new THREE.BufferGeometryLoader( this.manager );
			var result = loader.parse( data );

			var mesh = new THREE.Mesh( result );

			//editor.execute( new AddObjectCommand( mesh ) );
			onLoad(mesh);

			break;

		case 'geometry':

			var loader = new THREE.JSONLoader( this.manager );
			loader.setTexturePath( this.texturePath );

			var result = loader.parse( data );

			var geometry = result.geometry;
			var material;

			if ( result.materials !== undefined ) {

				if ( result.materials.length > 1 ) {

					material = new THREE.MultiMaterial( result.materials );

				} else {

					material = result.materials[ 0 ];

				}

			} else {

				material = new THREE.MeshStandardMaterial();

			}

			geometry.sourceType = "ascii";
			geometry.sourceFile = file.name;

			var mesh;

			if ( geometry.animation && geometry.animation.hierarchy ) {

				mesh = new THREE.SkinnedMesh( geometry, material );

			} else {

				mesh = new THREE.Mesh( geometry, material );

			}

			mesh.name = filename;

			//editor.execute( new AddObjectCommand( mesh ) );
			onLoad( mesh );

			break;

		case 'object':

			var loader = new THREE.ObjectLoader( this.manager );
			loader.setTexturePath( this.texturePath );

			var result = loader.parse( data );

			/*if ( result instanceof THREE.Scene ) {

				editor.execute( new SetSceneCommand( result ) );

			} else {

				editor.execute( new AddObjectCommand( result ) );

			}*/
			onLoad ( result );

			break;

		case 'scene':

			// DEPRECATED

			var loader = new THREE.SceneLoader( this.manager );
			loader.parse( data, function ( result ) {

				//editor.execute( new SetSceneCommand( result.scene ) );
				onLoad ( result.scene );
			}, '' );

			break;

		/*case 'app':

			editor.fromJSON( data );

			break;*/

	}

}

};
