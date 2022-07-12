import * as THREE from 'three';

import { TGALoader } from '../../examples/jsm/loaders/TGALoader.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { SetSceneCommand } from './commands/SetSceneCommand.js';

import { LoaderUtils } from './LoaderUtils.js';

import { unzipSync, strFromU8 } from '../../examples/jsm/libs/fflate.module.js';

class ExtensionLoader {

	constructor( extension, load, format = 'binary' ) {

		this.extension = extension;
		this.load = load;
		this.format = format;

	}

}

class Loader {

	constructor( editor ) {

		this.texturePath = '';
		this.extensions = [];

		// default loaders

		this.addExtension( new ExtensionLoader( '3dm', async ( { contents } ) => {

			const { Rhino3dmLoader } = await import( '../../examples/jsm/loaders/3DMLoader.js' );

			const loader = new Rhino3dmLoader();
			loader.setLibraryPath( '../examples/jsm/libs/rhino3dm/' );
			loader.parse( contents, function ( object ) {

				editor.execute( new AddObjectCommand( editor, object ) );

			} );

		} ) );

		this.addExtension( new ExtensionLoader( '3ds', async ( { contents } ) => {

			const { TDSLoader } = await import( '../../examples/jsm/loaders/TDSLoader.js' );

			const loader = new TDSLoader();
			const object = loader.parse( contents );

			editor.execute( new AddObjectCommand( editor, object ) );

		} ) );

		this.addExtension( new ExtensionLoader( '3mf', async ( { contents } ) => {

			const { ThreeMFLoader } = await import( '../../examples/jsm/loaders/3MFLoader.js' );

			const loader = new ThreeMFLoader();
			const object = loader.parse( contents );

			editor.execute( new AddObjectCommand( editor, object ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'amf', async ( { contents } ) => {

			const { AMFLoader } = await import( '../../examples/jsm/loaders/AMFLoader.js' );

			const loader = new AMFLoader();
			const amfobject = loader.parse( contents );

			editor.execute( new AddObjectCommand( editor, amfobject ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'dae', async ( { contents, manager, filename } ) => {

			const { ColladaLoader } = await import( '../../examples/jsm/loaders/ColladaLoader.js' );

			const loader = new ColladaLoader( manager );
			const collada = loader.parse( contents );

			collada.scene.name = filename;

			editor.execute( new AddObjectCommand( editor, collada.scene ) );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'drc', async ( { contents, filename } ) => {

			const { DRACOLoader } = await import( '../../examples/jsm/loaders/DRACOLoader.js' );

			const loader = new DRACOLoader();
			loader.setDecoderPath( '../examples/js/libs/draco/' );
			loader.decodeDracoFile( contents, function ( geometry ) {

				let object;

				if ( geometry.index !== null ) {

					const material = new THREE.MeshStandardMaterial();

					object = new THREE.Mesh( geometry, material );
					object.name = filename;

				} else {

					const material = new THREE.PointsMaterial( { size: 0.01 } );
					material.vertexColors = geometry.hasAttribute( 'color' );

					object = new THREE.Points( geometry, material );
					object.name = filename;

				}

				loader.dispose();
				editor.execute( new AddObjectCommand( editor, object ) );

			} );

		} ) );

		this.addExtension( new ExtensionLoader( 'fbx', async ( { contents, manager } ) => {

			const { FBXLoader } = await import( '../../examples/jsm/loaders/FBXLoader.js' );

			const loader = new FBXLoader( manager );
			const object = loader.parse( contents );

			editor.execute( new AddObjectCommand( editor, object ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'glb', async ( { contents, filename } ) => {

			const { DRACOLoader } = await import( '../../examples/jsm/loaders/DRACOLoader.js' );
			const { GLTFLoader } = await import( '../../examples/jsm/loaders/GLTFLoader.js' );

			const dracoLoader = new DRACOLoader();
			dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

			const loader = new GLTFLoader();
			loader.setDRACOLoader( dracoLoader );
			loader.parse( contents, '', function ( result ) {

				const scene = result.scene;
				scene.name = filename;

				scene.animations.push( ...result.animations );
				editor.execute( new AddObjectCommand( editor, scene ) );

			} );

		} ) );

		this.addExtension( new ExtensionLoader( 'gltf', async ( { contents, manager, filename } ) => {

			const isGLTF1 = ( contents ) => {

				let resultContent;

				if ( typeof contents === 'string' ) {

					// contents is a JSON string
					resultContent = contents;

				} else {

					const magic = THREE.LoaderUtils.decodeText( new Uint8Array( contents, 0, 4 ) );

					if ( magic === 'glTF' ) {

						// contents is a .glb file; extract the version
						const version = new DataView( contents ).getUint32( 4, true );

						return version < 2;

					} else {

						// contents is a .gltf file
						resultContent = THREE.LoaderUtils.decodeText( new Uint8Array( contents ) );

					}

				}

				const json = JSON.parse( resultContent );

				return ( json.asset != undefined && json.asset.version[ 0 ] < 2 );

			};

			//

			let loader;

			if ( isGLTF1( contents ) ) {

				alert( 'Import of glTF asset not possible. Only versions >= 2.0 are supported. Please try to upgrade the file to glTF 2.0 using glTF-Pipeline.' );

			} else {

				const { DRACOLoader } = await import( '../../examples/jsm/loaders/DRACOLoader.js' );
				const { GLTFLoader } = await import( '../../examples/jsm/loaders/GLTFLoader.js' );

				const dracoLoader = new DRACOLoader();
				dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

				loader = new GLTFLoader( manager );
				loader.setDRACOLoader( dracoLoader );

			}

			loader.parse( contents, '', function ( result ) {

				const scene = result.scene;
				scene.name = filename;

				scene.animations.push( ...result.animations );
				editor.execute( new AddObjectCommand( editor, scene ) );

			} );

		} ) );

		this.addExtension( new ExtensionLoader( 'js,json', async ( { contents } ) => {

			const handleJSON = ( data ) => {

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

					{

						const loader = new THREE.BufferGeometryLoader();
						const result = loader.parse( data );

						const mesh = new THREE.Mesh( result );

						editor.execute( new AddObjectCommand( editor, mesh ) );

						break;

					}

					case 'geometry':

						console.error( 'Loader: "Geometry" is no longer supported.' );

						break;

					case 'object':

					{

						const loader = new THREE.ObjectLoader();
						loader.setResourcePath( this.texturePath );

						loader.parse( data, function ( result ) {

							if ( result.isScene ) {

								editor.execute( new SetSceneCommand( editor, result ) );

							} else {

								editor.execute( new AddObjectCommand( editor, result ) );

							}

						} );

						break;

					}

					case 'app':

						editor.fromJSON( data );

						break;

				}

			};

			// 2.0

			if ( contents.indexOf( 'postMessage' ) !== - 1 ) {

				const blob = new Blob( [ contents ], { type: 'text/javascript' } );
				const url = URL.createObjectURL( blob );

				const worker = new Worker( url );

				worker.onmessage = function ( event ) {

					event.data.metadata = { version: 2 };

					handleJSON( event.data );

				};

				worker.postMessage( Date.now() );

				return;

			}

			// >= 3.0

			let data;

			try {

				data = JSON.parse( contents );

			} catch ( error ) {

				alert( error );
				return;

			}

			handleJSON( data );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'ifc', async ( { contents, filename } ) => {

			const { IFCLoader } = await import( '../../examples/jsm/loaders/IFCLoader.js' );

			const loader = new IFCLoader();
			loader.ifcManager.setWasmPath( '../../examples/jsm/loaders/ifc/' );

			const model = await loader.parse( contents );
			model.mesh.name = filename;

			editor.execute( new AddObjectCommand( editor, model.mesh ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'kmz', async ( { contents, filename } ) => {

			const { KMZLoader } = await import( '../../examples/jsm/loaders/KMZLoader.js' );

			const loader = new KMZLoader();
			const collada = loader.parse( contents );

			collada.scene.name = filename;

			editor.execute( new AddObjectCommand( editor, collada.scene ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'ldr,mpd', async ( { contents, filename } ) => {

			const { LDrawLoader } = await import( '../../examples/jsm/loaders/LDrawLoader.js' );

			const loader = new LDrawLoader();
			loader.setPath( '../../examples/models/ldraw/officialLibrary/' );
			loader.parse( contents, undefined, function ( group ) {

				group.name = filename;
				// Convert from LDraw coordinates: rotate 180 degrees around OX
				group.rotation.x = Math.PI;

				editor.execute( new AddObjectCommand( editor, group ) );

			} );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'md2', async ( { contents, filename } ) => {

			const { MD2Loader } = await import( '../../examples/jsm/loaders/MD2Loader.js' );

			const geometry = new MD2Loader().parse( contents );
			const material = new THREE.MeshStandardMaterial();

			const mesh = new THREE.Mesh( geometry, material );
			mesh.mixer = new THREE.AnimationMixer( mesh );
			mesh.name = filename;

			mesh.animations.push( ...geometry.animations );
			editor.execute( new AddObjectCommand( editor, mesh ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'obj', async ( { contents, filename } ) => {

			const { OBJLoader } = await import( '../../examples/jsm/loaders/OBJLoader.js' );

			const object = new OBJLoader().parse( contents );
			object.name = filename;

			editor.execute( new AddObjectCommand( editor, object ) );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'pcd', async ( { contents, filename } ) => {

			const { PCDLoader } = await import( '../../examples/jsm/loaders/PCDLoader.js' );

			const points = new PCDLoader().parse( contents );
			points.name = filename;

			editor.execute( new AddObjectCommand( editor, points ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'ply', async ( { contents, filename } ) => {

			const { PLYLoader } = await import( '../../examples/jsm/loaders/PLYLoader.js' );

			const geometry = new PLYLoader().parse( contents );
			let object;

			if ( geometry.index !== null ) {

				const material = new THREE.MeshStandardMaterial();

				object = new THREE.Mesh( geometry, material );
				object.name = filename;

			} else {

				const material = new THREE.PointsMaterial( { size: 0.01 } );
				material.vertexColors = geometry.hasAttribute( 'color' );

				object = new THREE.Points( geometry, material );
				object.name = filename;

			}

			editor.execute( new AddObjectCommand( editor, object ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'stl', async ( { contents, filename } ) => {

			const { STLLoader } = await import( '../../examples/jsm/loaders/STLLoader.js' );

			const geometry = new STLLoader().parse( contents );
			const material = new THREE.MeshStandardMaterial();

			const mesh = new THREE.Mesh( geometry, material );
			mesh.name = filename;

			editor.execute( new AddObjectCommand( editor, mesh ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'svg', async ( { contents } ) => {

			const { SVGLoader } = await import( '../../examples/jsm/loaders/SVGLoader.js' );

			const loader = new SVGLoader();
			const paths = loader.parse( contents ).paths;

			//

			const group = new THREE.Group();
			group.scale.multiplyScalar( 0.1 );
			group.scale.y *= - 1;

			for ( let i = 0; i < paths.length; i ++ ) {

				const path = paths[ i ];

				const material = new THREE.MeshBasicMaterial( {
					color: path.color,
					depthWrite: false
				} );

				const shapes = SVGLoader.createShapes( path );

				for ( let j = 0; j < shapes.length; j ++ ) {

					const shape = shapes[ j ];

					const geometry = new THREE.ShapeGeometry( shape );
					const mesh = new THREE.Mesh( geometry, material );

					group.add( mesh );

				}

			}

			editor.execute( new AddObjectCommand( editor, group ) );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'vox', async ( { contents, filename } ) => {

			const { VOXLoader, VOXMesh } = await import( '../../examples/jsm/loaders/VOXLoader.js' );

			const chunks = new VOXLoader().parse( contents );

			const group = new THREE.Group();
			group.name = filename;

			for ( let i = 0; i < chunks.length; i ++ ) {

				const chunk = chunks[ i ];

				const mesh = new VOXMesh( chunk );
				group.add( mesh );

			}

			editor.execute( new AddObjectCommand( editor, group ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'vtk,vtp', async ( { contents, filename } ) => {

			const { VTKLoader } = await import( '../../examples/jsm/loaders/VTKLoader.js' );

			const geometry = new VTKLoader().parse( contents );
			const material = new THREE.MeshStandardMaterial();

			const mesh = new THREE.Mesh( geometry, material );
			mesh.name = filename;

			editor.execute( new AddObjectCommand( editor, mesh ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'wrl', async ( { contents } ) => {

			const { VRMLLoader } = await import( '../../examples/jsm/loaders/VRMLLoader.js' );

			const result = new VRMLLoader().parse( contents );

			editor.execute( new SetSceneCommand( editor, result ) );

		}, 'string' ) );

		this.addExtension( new ExtensionLoader( 'xyz', async ( { contents, filename } ) => {

			const { XYZLoader } = await import( '../../examples/jsm/loaders/XYZLoader.js' );

			const geometry = new XYZLoader().parse( contents );

			const material = new THREE.PointsMaterial();
			material.vertexColors = geometry.hasAttribute( 'color' );

			const points = new THREE.Points( geometry, material );
			points.name = filename;

			editor.execute( new AddObjectCommand( editor, points ) );

		} ) );

		this.addExtension( new ExtensionLoader( 'zip', async ( { contents, filename } ) => {

			const zip = unzipSync( new Uint8Array( contents ) );

			// Poly

			if ( zip[ 'model.obj' ] && zip[ 'materials.mtl' ] ) {

				const { MTLLoader } = await import( '../../examples/jsm/loaders/MTLLoader.js' );
				const { OBJLoader } = await import( '../../examples/jsm/loaders/OBJLoader.js' );

				const materials = new MTLLoader().parse( strFromU8( zip[ 'materials.mtl' ] ) );
				const object = new OBJLoader().setMaterials( materials ).parse( strFromU8( zip[ 'model.obj' ] ) );
				editor.execute( new AddObjectCommand( editor, object ) );

			}

			//

			for ( const path in zip ) {

				const file = zip[ path ];

				const manager = new THREE.LoadingManager();
				manager.setURLModifier( ( url ) => {

					const file = zip[ url ];

					if ( file ) {

						console.log( 'Loading', url );

						const blob = new Blob( [ file.buffer ], { type: 'application/octet-stream' } );

						return URL.createObjectURL( blob );

					}

					return url;

				} );

				const extension = path.split( '.' ).pop().toLowerCase();

				const extensionLoader = this.getExtension( extension );

				if ( extensionLoader !== null ) {

					const contents = extensionLoader.format === 'string' ? strFromU8( file ) : file.buffer;

					extensionLoader.load( { contents, filename, manager } );

				}

			}

		} ) );

	}

	loadItemList( items ) {

		LoaderUtils.getFilesFromItemList( items, ( files, filesMap ) => {

			this.loadFiles( files, filesMap );

		} );

	}

	loadFiles( files, filesMap ) {

		if ( files.length > 0 ) {

			filesMap = filesMap || LoaderUtils.createFilesMap( files );

			const manager = new THREE.LoadingManager();
			manager.setURLModifier( ( url ) => {

				url = url.replace( /^(\.?\/)/, '' ); // remove './'

				const file = filesMap[ url ];

				if ( file ) {

					console.log( 'Loading', url );

					return URL.createObjectURL( file );

				}

				return url;

			} );

			manager.addHandler( /\.tga$/i, new TGALoader() );

			for ( let i = 0; i < files.length; i ++ ) {

				this.loadFile( files[ i ], manager );

			}

		}

	}

	loadFile( file, manager ) {

		const filename = file.name;
		const extension = filename.split( '.' ).pop().toLowerCase();

		const reader = new FileReader();

		reader.addEventListener( 'progress', function ( event ) {

			const size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			const progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';

			console.log( 'Loading', filename, size, progress );

		} );

		const extensionLoader = this.getExtension( extension );

		if ( extensionLoader !== null ) {

			reader.addEventListener( 'load', async ( event ) => {

				const contents = event.target.result;

				extensionLoader.load( { contents, filename, manager } );

			}, false );

			if ( extensionLoader.format === 'string' ) {

				reader.readAsText( file );

			} else {

				reader.readAsArrayBuffer( file );

			}

		} else {

			console.error( 'Unsupported file format (' + extension + ').' );

		}

	}

	getExtension( extension ) {

		const extRegexp = new RegExp( '(^|,)' + extension + '($|,)' );

		let extensionLoader = null;

		for ( const extLoader of this.extensions ) {

			if ( extRegexp.test( extLoader.extension ) === true ) {

				extensionLoader = extLoader;

				break;

			}

		}

		return extensionLoader;

	}

	addExtension( extensionLoader ) {

		this.extensions.push( extensionLoader );

	}

}

export { Loader, ExtensionLoader };
