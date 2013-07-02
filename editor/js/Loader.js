
var Loader = function ( signals ) {

	scope = this;

	var sceneExporter = new THREE.ObjectExporter();

	document.addEventListener( 'dragover', function ( event ) {

		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';

	}, false );

	document.addEventListener( 'drop', function ( event ) {

		event.preventDefault();

		var file = event.dataTransfer.files[ 0 ];

		var chunks = file.name.split( '.' );
		var extension = chunks.pop().toLowerCase();
		var filename = chunks.join( '.' );

		scope.parseFile( file, filename, extension );

	}, false );

	var timeout;

	signals.sceneChanged.add( function ( scene ) {

		clearTimeout( timeout );

		timeout = setTimeout( function () {

			scope.saveLocalStorage( scene );

		}, 3000 );

	} );

	this.loadLocalStorage = function () {

		if ( localStorage.threejsEditor !== undefined ) {

			try {

				var loader = new THREE.ObjectLoader();
				var scene = loader.parse( JSON.parse( localStorage.threejsEditor ) );

				signals.sceneAdded.dispatch( scene );

			} catch ( e ) {

				console.warn( "Unable to load object from localStorage." );

			}

		}

	};

	this.saveLocalStorage = function ( scene ) {

		localStorage.threejsEditor = JSON.stringify( sceneExporter.parse( scene ) );

	}

	this.handleJSON = function ( data, file, filename ) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'geometry';

		}

		if ( data.metadata.version === undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		if ( data.metadata.type === 'geometry' ) {

			var loader = new THREE.JSONLoader();
			var result = loader.parse( data );

			var geometry = result.geometry;
			var material = result.materials !== undefined
						? new THREE.MeshFaceMaterial( result.materials )
						: new THREE.MeshPhongMaterial();

			geometry.sourceType = "ascii";
			geometry.sourceFile = file.name;

			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = filename;

			signals.objectAdded.dispatch( mesh );

		} else if ( data.metadata.type === 'object' ) {

			var loader = new THREE.ObjectLoader();
			var result = loader.parse( data );

			if ( result instanceof THREE.Scene ) {

				signals.sceneAdded.dispatch( result );

			} else {

				signals.objectAdded.dispatch( result );

			}

		} else if ( data.metadata.type === 'scene' ) {

			// DEPRECATED

			var loader = new THREE.SceneLoader();
			loader.parse( data, function ( result ) {

				var scene = result.scene;

				while ( scene.children.length > 0 ) {

					signals.objectAdded.dispatch( scene.children[ 0 ] );

				}

			}, '' );

		}

	};

	this.parseFile = function ( file, filename, extension ) {

		switch ( extension ) {

			case 'ctm':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var stream = new CTM.Stream( contents );
					stream.offset = 0;

					var loader = new THREE.CTMLoader();
					loader.createModelClassic( new CTM.File( stream ), function( geometry ) {

						geometry.sourceType = "ctm";
						geometry.sourceFile = file.name;

						var material = new THREE.MeshPhongMaterial();

						var mesh = new THREE.Mesh( geometry, material );
						mesh.name = filename;

						signals.objectAdded.dispatch( mesh );

					} );

				}, false );
				reader.readAsBinaryString( file );

				break;

			case 'dae':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var parser = new DOMParser();
					var xml = parser.parseFromString( contents, 'text/xml' );

					var loader = new THREE.ColladaLoader();
					loader.parse( xml, function ( collada ) {

						collada.scene.name = filename;

						signals.objectAdded.dispatch( collada.scene );

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

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					// 2.0

					if ( contents.indexOf( 'postMessage' ) !== -1 ) {

						var blob = new Blob( [ contents ], { type: 'text/javascript' } );
						var url = URL.createObjectURL( blob );

						var worker = new Worker( url );

						worker.onmessage = function ( event ) {

							event.data.metadata = { version: 2 };
							scope.handleJSON( event.data, file, filename );

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

					scope.handleJSON( data, file, filename );

				}, false );
				reader.readAsText( file );

				break;

			case 'obj':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;

					signals.objectAdded.dispatch( object );

				}, false );
				reader.readAsText( file );

				break;

			case 'ply':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					console.log( contents );

					var geometry = new THREE.PLYLoader().parse( contents );
					geometry.sourceType = "ply";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					signals.objectAdded.dispatch( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'stl':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.STLLoader().parse( contents );
					geometry.sourceType = "stl";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					signals.objectAdded.dispatch( mesh );

				}, false );

				if ( reader.readAsBinaryString !== undefined ) {

					reader.readAsBinaryString( file );

				} else {

					reader.readAsArrayBuffer( file );

				}

				break;

			/*
			case 'utf8':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.UTF8Loader().parse( contents );
					var material = new THREE.MeshLambertMaterial();

					var mesh = new THREE.Mesh( geometry, material );

					signals.objectAdded.dispatch( mesh );

				}, false );
				reader.readAsBinaryString( file );

				break;
			*/

			case 'vtk':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var geometry = new THREE.VTKLoader().parse( contents );
					geometry.sourceType = "vtk";
					geometry.sourceFile = file.name;

					var material = new THREE.MeshPhongMaterial();

					var mesh = new THREE.Mesh( geometry, material );
					mesh.name = filename;

					signals.objectAdded.dispatch( mesh );

				}, false );
				reader.readAsText( file );

				break;

			case 'wrl':

				var reader = new FileReader();
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var result = new THREE.VRMLLoader().parse( contents );

					signals.sceneAdded.dispatch( result );

				}, false );
				reader.readAsText( file );

				break;

		}

	}

}
