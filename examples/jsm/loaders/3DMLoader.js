/**
 * @author Luis Fraguada / https://github.com/fraguada
 */

import {
	BufferAttribute,
	BufferGeometry,
	BufferGeometryLoader,
	FileLoader,
	Loader,
	Object3D,
	MeshStandardMaterial,
	Mesh,
	Color,
	Points,
	PointsMaterial
} from "../../../build/three.module.js";

var Rhino3dmLoader = function ( manager ) {

    Loader.call( this, manager );

	this.libraryPath = '';
	this.libraryPending = null;
	this.libraryBinary = null;
	this.libraryConfig = {};

	this.workerLimit = 4;
	this.workerPool = [];
	this.workerNextTaskID = 1;
	this.workerSourceURL = '';
	this.workerConfig = {};

};

Rhino3dmLoader.taskCache = new WeakMap();

Rhino3dmLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

    constructor: Rhino3dmLoader,

    setLibraryPath: function ( path ) {

		this.libraryPath = path;

		return this;

	},
	
	setWorkerLimit: function ( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new FileLoader( this.manager );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );

		loader.load( url, ( buffer ) => {

			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if ( Rhino3dmLoader.taskCache.has( buffer ) ) {

				var cachedTask = Rhino3dmLoader.taskCache.get( buffer );

				return cachedTask.promise.then( onLoad ).catch( onError );

			}

			this.decodeObjects( buffer, url )
				.then( onLoad )
				.catch( onError );

		}, onProgress, onError );


	},

	debug: function () {

		console.log( 'Task load: ', this.workerPool.map( ( worker ) => worker._taskLoad ) );

	},

	decodeObjects: function ( buffer, url ) {

		var worker;
		var taskID;

		var taskCost = buffer.byteLength;

		var objectPending = this._getWorker( taskCost )
			.then( ( _worker ) => {

				worker = _worker;
				taskID = this.workerNextTaskID ++; //hmmm

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };

					worker.postMessage( { type: 'decode', id: taskID, buffer }, [ buffer ] );

					//this.debug();

				} );

			} )
			.then( ( message ) => this._createGeometry( message.data ) );

		// Remove task from the task list.
		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		objectPending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					this._releaseTask( worker, taskID );

					//this.debug();

				}

			} );

		// Cache the task result.
		Rhino3dmLoader.taskCache.set( buffer, {

			url: url,
			promise: objectPending

		} );

		return objectPending;
	},

	parse: function ( ) {

		// parsing logic goes here
		console.log('3dm parsing');

	},

	_createMaterial: function ( material ) {

		if ( material === undefined ) {

			return  new MeshStandardMaterial( { 
				color: new Color( 1,1,1 ), 
				metalness: 0.8,
				name: 'default',
				side: 2
			} );

		}

		var _diffuseColor = material.diffuseColor;

		var diffusecolor = new Color( _diffuseColor.r/ 255.0, _diffuseColor.g / 255.0, _diffuseColor.b / 255.0 );

		if ( _diffuseColor.r === 0 && _diffuseColor.g === 0 && _diffuseColor.b === 0 ) {
			diffusecolor.r = 1;
			diffusecolor.g = 1;
			diffusecolor.b = 1;
		}

		return  new MeshStandardMaterial( { 
			color: diffusecolor, 
			metalness: 0.8,
			name: material.name,
			side: 2
		} );

	},

	_createGeometry: function ( data ) {

		console.log(data);

		var object = new Object3D();
		object.userData['layers'] = data.layers;
		object.userData['groups'] = data.groups;

		var loader = new BufferGeometryLoader();

		var objects = data.objects;
		var materials = data.materials;

		for( var i = 0; i < objects.length; i++ ){

			var obj = objects[i];

			//console.log(obj);

			var attributes = obj.attributes;
			var geometry = null;
			var material = null;
			
			switch( obj.objectType ) {
				case 'PointSet':

					geometry = loader.parse( obj.geometry );
					material = new PointsMaterial( { sizeAttenuation: true, vertexColors:true } );
					var points = new Points( geometry, material );
					points.userData['attributes'] = attributes;
					object.add(points);

					break;

				case 'Mesh':
				case 'Extrusion':

					geometry = loader.parse( obj.geometry );

					var material = this._createMaterial( materials[attributes.materialIndex] );

					var mesh = new Mesh(geometry, material);
					mesh.castShadow = attributes.castsShadows;
					mesh.receiveShadow = attributes.receivesShadows;
					mesh.userData['attributes'] = attributes;
					mesh.userData['objectType'] = obj.objectType;

					object.add( mesh );

					break;

				case 'Brep':

					var brepObject = new Object3D();

					var material = this._createMaterial( materials[attributes.materialIndex] );

					for( var j = 0; j < obj.geometry.length; j++ ) {

						geometry = loader.parse( obj.geometry[j] );
						var mesh = new Mesh(geometry, material);
						mesh.castShadow = attributes.castsShadows;
						mesh.receiveShadow = attributes.receivesShadows;

						brepObject.add( mesh );

					}

					brepObject.userData['attributes'] = attributes;
					brepObject.userData['objectType'] = obj.objectType;

					object.add( brepObject );

					break;
			}

		}
		
		return object;

	},

	_initLibrary: function () {

		if ( ! this.libraryPending ) {

			// Load rhino3dm wrapper.
			var jsLoader = new FileLoader( this.manager );
			jsLoader.setPath( this.libraryPath );
			var jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'rhino3dm.js', resolve, undefined, reject );

			} );

			// Load rhino3dm WASM binary.
			var binaryLoader = new FileLoader( this.manager );
			binaryLoader.setPath( this.libraryPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			var binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'rhino3dm.wasm', resolve, undefined, reject );

			} );

			this.libraryPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					//this.libraryBinary = binaryContent;
					this.libraryConfig.wasmBinary = binaryContent;

					var fn = Rhino3dmLoader.Rhino3dmWorker.toString();

					var body = [
						'/* rhino3dm.js */',
						jsContent,
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

				} );

		}

		return this.libraryPending;

	},

	_getWorker: function ( taskCost ) {

		return this._initLibrary().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				var worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;

				worker.postMessage( {
					type: 'init',
					libraryConfig: this.libraryConfig
				} );

				worker.onmessage = function ( e ) {

					var message = e.data;

					switch ( message.type ) {

						case 'decode':
							worker._callbacks[ message.id ].resolve( message );
							break;

						case 'error':
							worker._callbacks[ message.id ].reject( message );
							break;

						default:
							console.error( 'THREE.Rhino3dmLoader: Unexpected message, "' + message.type + '"' );

					}

				};

				this.workerPool.push( worker );

			} else {

				this.workerPool.sort( function ( a, b ) {

					return a._taskLoad > b._taskLoad ? - 1 : 1;

				} );

			}

			var worker = this.workerPool[ this.workerPool.length - 1 ];

			worker._taskLoad += taskCost;

			return worker;

		} );
	},

	_releaseTask: function ( worker, taskID ) {

		worker._taskLoad -= worker._taskCosts[ taskID ];
		delete worker._callbacks[ taskID ];
		delete worker._taskCosts[ taskID ];

	},

	dispose: function () {

		for ( var i = 0; i < this.workerPool.length; ++ i ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

		return this;

	}

} );

/* WEB WORKER */

Rhino3dmLoader.Rhino3dmWorker = function () {

	var libraryPending;
	var libraryConfig;
	var rhino;

	onmessage = function ( e ) {

		var message = e.data;

		switch ( message.type ) {

			case 'init':

				libraryConfig = message.libraryConfig;
				var wasmBinary = libraryConfig.wasmBinary;
				var RhinoModule;
				libraryPending = new Promise( function ( resolve ) { 

					/* Like Basis Loader */
					RhinoModule = { wasmBinary, onRuntimeInitialized: resolve };

					rhino3dm( RhinoModule );

				 } ).then( () => {

					rhino = RhinoModule;

				 });
				 
				break;

			case 'decode':

				var buffer = message.buffer;
				libraryPending.then( () => {

					var data = decodeObjects( rhino, buffer );

					self.postMessage( { type: 'decode', id: message.id, data } );

				} );
				
			break;
		}
	};

	function decodeObjects( rhino, buffer ) {

		var arr = new Uint8Array(buffer);
		var doc = rhino.File3dm.fromByteArray(arr);

		var objects = [];
		var materials = [];
		var layers = [];
		var views = [];
		var namedViews = [];
		var groups = [];
		// var strings = [];

		//Handle objects

		for( var i = 0; i < doc.objects().count; i++ ) {

			var _object = doc.objects().get(i);
			var _geometry = _object.geometry();
			var _attributes = _object.attributes();
			var objectType = _geometry.objectType;
			var geometry = null;

			// TODO: handle other geometry types
			switch( objectType ) {

				case rhino.ObjectType.Point:
				case rhino.ObjectType.Light:
				case rhino.ObjectType.Curve:
				case rhino.ObjectType.Annotation:
				case rhino.ObjectType.InstanceReference:
				case rhino.ObjectType.TextDot:
				case rhino.ObjectType.Hatch:
				case rhino.ObjectType.SubD:
				case rhino.ObjectType.ClipPlane:

					console.warn(`THREE.3DMLoader: TODO: Implement ${objectType.constructor.name}`);
					
					break;

				case rhino.ObjectType.PointSet:
				case rhino.ObjectType.Mesh:

					geometry = _geometry.toThreejsJSON();

					break;

				case rhino.ObjectType.Brep:

					var faces = _geometry.faces();
					geometry = [];

					for (var faceIndex = 0; faceIndex < faces.count; faceIndex++) {

						var face = faces.get( faceIndex );
						var mesh = face.getMesh( rhino.MeshType.Any );

						if ( mesh ) {

							geometry.push( mesh.toThreejsJSON() );
							mesh.delete();

						}

						face.delete();
					}

					faces.delete();

					break;

				case rhino.ObjectType.Extrusion:

					var mesh = _geometry.getMesh(rhino.MeshType.Any);

					if( mesh ) {

						geometry = mesh.toThreejsJSON();
						mesh.delete();

					} 

					break;

			}

			if( geometry ) {

				var attributes = extractProperties( _attributes );

				objectType = objectType.constructor.name;
				objectType = objectType.substring( 11, objectType.length );

				objects.push( { geometry, attributes, objectType: objectType } );

			}

			_geometry.delete();
			_object.delete();
			
		}

		//Handle materials

		for( var i = 0; i < doc.materials().count(); i++) {

			var _material = doc.materials().get( i );
			var materialProperties = extractProperties( _material );
			var pbMaterialProperties = extractProperties( _material.physicallyBased() );
			
			var material = Object.assign(materialProperties, pbMaterialProperties);

			materials.push( material );

			_material.delete();

		}

		// Handle layers

		for( var i = 0; i < doc.layers().count(); i++) {

			var _layer = doc.layers().get( i );
			var layer = extractProperties( _layer );

			layers.push( layer );

			_layer.delete();
			
		} 

		// Handle views

		for( var i = 0; i < doc.views().count(); i++) {

			var _view = doc.views().get( i );
			var view = extractProperties( _view );

			views.push( view );

			_view.delete();
		}

		// Handle named views

		for( var i = 0; i < doc.namedViews().count(); i++) {

			var _namedView = doc.namedViews().get( i );
			var namedView = extractProperties( _namedView );

			namedViews.push( namedView );

			_namedView.delete();
		}

		// Handle groups

		for( var i = 0; i < doc.groups().count(); i++ ){

			var _group = doc.groups().get( i );
			var group = extractProperties( _group );

			groups.push( group );

			_group.delete();

		}

		// Handle settings

		var settings = extractProperties( doc.settings() );

		//TODO: Handle other document stuff like dimstyles, instance definitions, bitmaps etc.

		// Handle dimstyles
		// console.log(`Dimstyle Count: ${doc.dimstyles().count()}`); 

		// Handle bitmaps
		// console.log(`Bitmap Count: ${doc.bitmaps().count()}`); 

		// Handle instance definitions
		// console.log(`Instance Definitions Count: ${doc.instanceDefinitions().count()}`); 

		// Handle strings -- this seems to be broken at the moment in rhino3dm
		// console.log(`Strings Count: ${doc.strings().count()}`); 

		/*
		for( var i = 0; i < doc.strings().count(); i++ ){

			var _string= doc.strings().get( i );

			console.log(_string);
			var string = extractProperties( _group );

			strings.push( string );

			_string.delete();

		}
		*/

		doc.delete();

		return { objects, materials, layers, views, namedViews, groups, settings };

	}

	function extractProperties( object ) {

		var result = {};

		for ( var property in object ) {

			if( typeof object[property] !== 'function' ){

				result[property] = object[property];

			} else {

				// console.log(`${property}: ${object[property]}`);

			}

		}

		return result;
	}

};

export { Rhino3dmLoader };