/**
 * @author Luis Fraguada / https://github.com/fraguada
 */

import {
	BufferGeometryLoader,
	FileLoader,
	Loader,
	Object3D,
	MeshStandardMaterial,
	Mesh,
	Color,
	Points,
	PointsMaterial,
	Line,
	LineBasicMaterial,
	Matrix4
} from "../../../build/three.module.js";
import { CSS2DObject } from '../renderers/CSS2DRenderer.js';

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
		loader.setRequestHeader( this.requestHeader );

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

	parse: function () {

		// parsing logic goes here
		console.warn( 'THREE.3DMLoader: TODO: Implement parse function' );

	},

	_createMaterial: function ( material ) {

		if ( material === undefined ) {

			return new MeshStandardMaterial( {
				color: new Color( 1, 1, 1 ),
				metalness: 0.8,
				name: 'default',
				side: 2
			} );

		}

		var _diffuseColor = material.diffuseColor;

		var diffusecolor = new Color( _diffuseColor.r / 255.0, _diffuseColor.g / 255.0, _diffuseColor.b / 255.0 );

		if ( _diffuseColor.r === 0 && _diffuseColor.g === 0 && _diffuseColor.b === 0 ) {

			diffusecolor.r = 1;
			diffusecolor.g = 1;
			diffusecolor.b = 1;

		}

		return new MeshStandardMaterial( {
			color: diffusecolor,
			metalness: 0.8,
			name: material.name,
			side: 2
		} );

	},

	_createGeometry: function ( data ) {

		// console.log(data);

		var object = new Object3D();
		var instanceDefinitionObjects = [];
		var instanceDefinitions = [];
		var instanceReferences = [];

		object.userData[ 'layers' ] = data.layers;
		object.userData[ 'groups' ] = data.groups;

		var objects = data.objects;
		var materials = data.materials;

		for ( var i = 0; i < objects.length; i ++ ) {

			var obj = objects[ i ];
			var attributes = obj.attributes;

			switch ( obj.objectType ) {

				case 'InstanceDefinition':

					instanceDefinitions.push( obj );

					break;

				case 'InstanceReference':

					instanceReferences.push( obj );

					break;

				default:

					var material = this._createMaterial( materials[ attributes.materialIndex ] );
					var _object = this._createObject( obj, material );
					_object.visible = data.layers[ attributes.layerIndex ].visible;

					if ( attributes.isInstanceDefinitionObject ) {

						instanceDefinitionObjects.push( _object );

					} else {

						object.add( _object );

					}

					break;

			}

		}

		for ( var i = 0; i < instanceDefinitions.length; i ++ ) {

			var iDef = instanceDefinitions[ i ];

			var objects = [];

			for ( var j = 0; j < iDef.attributes.objectIds.length; j ++ ) {

				var objId = iDef.attributes.objectIds[ j ];

				for ( var p = 0; p < instanceDefinitionObjects.length; p ++ ) {

					var idoId = instanceDefinitionObjects[ p ].userData.attributes.id;

					if ( objId === idoId ) {

						objects.push( instanceDefinitionObjects[ p ] );

					}

				}

			}

			// Currently clones geometry and does not take advantage of instancing

			for ( var j = 0; j < instanceReferences.length; j ++ ) {

				var iRef = instanceReferences[ j ];

				if ( iRef.geometry.parentIdefId === iDef.attributes.id ) {

					var iRefObject = new Object3D();
					var xf = iRef.geometry.xform.array;

					var matrix = new Matrix4();
          			matrix.set( xf[ 0 ], xf[ 1 ], xf[ 2 ], xf[ 3 ], xf[ 4 ], xf[ 5 ], xf[ 6 ], xf[ 7 ], xf[ 8 ], xf[ 9 ], xf[ 10 ], xf[ 11 ], xf[ 12 ], xf[ 13 ], xf[ 14 ], xf[ 15 ] );

					iRefObject.applyMatrix4( matrix );

					for ( var p = 0; p < objects.length; p ++ ) {

						iRefObject.add( objects[ p ].clone( true ) );

					}

					object.add( iRefObject );

				}

			}

		}

		return object;

	},

	_createObject: function ( obj, mat ) {

		var loader = new BufferGeometryLoader();

		var attributes = obj.attributes;

		switch ( obj.objectType ) {

			case 'Point':
			case 'PointSet':

				var geometry = loader.parse( obj.geometry );
				var material = new PointsMaterial( { sizeAttenuation: true, vertexColors: true } );
				var points = new Points( geometry, material );
				points.userData[ 'attributes' ] = attributes;
				points.userData[ 'objectType' ] = obj.objectType;
				return points;

			case 'Mesh':
			case 'Extrusion':

				var geometry = loader.parse( obj.geometry );

				var mesh = new Mesh( geometry, mat );
				mesh.castShadow = attributes.castsShadows;
				mesh.receiveShadow = attributes.receivesShadows;
				mesh.userData[ 'attributes' ] = attributes;
				mesh.userData[ 'objectType' ] = obj.objectType;

				return mesh;

			case 'Brep':

				var brepObject = new Object3D();

				for ( var j = 0; j < obj.geometry.length; j ++ ) {

					geometry = loader.parse( obj.geometry[ j ] );
					var mesh = new Mesh( geometry, mat );
					mesh.castShadow = attributes.castsShadows;
					mesh.receiveShadow = attributes.receivesShadows;

					brepObject.add( mesh );

				}

				brepObject.userData[ 'attributes' ] = attributes;
				brepObject.userData[ 'objectType' ] = obj.objectType;

				return brepObject;

			case 'Curve':

				geometry = loader.parse( obj.geometry );

				var _color = attributes.drawColor;
				var color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );

				var lines = new Line( geometry, new LineBasicMaterial( { color: color } ) );
				lines.userData[ 'attributes' ] = attributes;
				lines.userData[ 'objectType' ] = obj.objectType;

				return lines;

			case 'TextDot':

				geometry = obj.geometry;
				var dotDiv = document.createElement( 'div' );
				dotDiv.style.fontFamily = geometry.fontFace;
				dotDiv.style.fontSize = `${geometry.fontHeight}px`;
				dotDiv.style.marginTop = '-1em';
				dotDiv.style.color = '#FFF';
				dotDiv.style.padding = '2px';
				dotDiv.style.paddingRight = '5px';
				dotDiv.style.paddingLeft = '5px';
				dotDiv.style.borderRadius = '5px';
				var color = attributes.drawColor;
				dotDiv.style.background = `rgba(${color.r},${color.g},${color.b},${color.a})`;
				dotDiv.textContent = geometry.text;
				var dot = new CSS2DObject( dotDiv );
				var location = geometry.point;
				dot.position.set( location[ 0 ], location[ 1 ], location[ 2 ] );

				dot.userData[ 'attributes' ] = attributes;
				dot.userData[ 'objectType' ] = obj.objectType;

				return dot;

		}

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

				 } );

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

		var arr = new Uint8Array( buffer );
		var doc = rhino.File3dm.fromByteArray( arr );

		var objects = [];
		var materials = [];
		var layers = [];
		var views = [];
		var namedViews = [];
		var groups = [];
		var strings = [];

		//Handle objects

		for ( var i = 0; i < doc.objects().count; i ++ ) {

			var _object = doc.objects().get( i );

			var object = extractObjectData( _object, doc );

			if ( object !== undefined ) {

				objects.push( object );

			}

			_object.delete();

		}

		// Handle instance definitions

		for ( var i = 0; i < doc.instanceDefinitions().count(); i ++ ) {

			var idef = doc.instanceDefinitions().get( i );
			var idefAttributes = extractProperties( idef );
			idefAttributes.objectIds = idef.getObjectIds();

			objects.push( { geometry: null, attributes: idefAttributes, objectType: 'InstanceDefinition' } );

		}

		// Handle materials

		for ( var i = 0; i < doc.materials().count(); i ++ ) {

			var _material = doc.materials().get( i );
			var materialProperties = extractProperties( _material );
			var pbMaterialProperties = extractProperties( _material.physicallyBased() );

			var material = Object.assign( materialProperties, pbMaterialProperties );

			materials.push( material );

			_material.delete();

		}

		// Handle layers

		for ( var i = 0; i < doc.layers().count(); i ++ ) {

			var _layer = doc.layers().get( i );
			var layer = extractProperties( _layer );

			layers.push( layer );

			_layer.delete();

		}

		// Handle views

		for ( var i = 0; i < doc.views().count(); i ++ ) {

			var _view = doc.views().get( i );
			var view = extractProperties( _view );

			views.push( view );

			_view.delete();

		}

		// Handle named views

		for ( var i = 0; i < doc.namedViews().count(); i ++ ) {

			var _namedView = doc.namedViews().get( i );
			var namedView = extractProperties( _namedView );

			namedViews.push( namedView );

			_namedView.delete();

		}

		// Handle groups

		for ( var i = 0; i < doc.groups().count(); i ++ ) {

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

	function extractObjectData( object, doc ) {

		var _geometry = object.geometry();
		var _attributes = object.attributes();
		var objectType = _geometry.objectType;
		var geometry = null;
		var attributes = null;

		// skip instance definition objects
		//if( _attributes.isInstanceDefinitionObject ) { continue; }

		// TODO: handle other geometry types
		switch ( objectType ) {

			case rhino.ObjectType.Curve:

				var pts = curveToPoints( _geometry, 100 );

				var position = {};
				var color = {};
				var attributes = {};
				var data = {};

				position.itemSize = 3;
				position.type = 'Float32Array';
				position.array = [];

				for ( var j = 0; j < pts.length; j ++ ) {

					position.array.push( pts[ j ][ 0 ] );
					position.array.push( pts[ j ][ 1 ] );
					position.array.push( pts[ j ][ 2 ] );

				}

				attributes.position = position;
				data.attributes = attributes;

				geometry = { data };

				break;

			case rhino.ObjectType.Point:

				var pt = _geometry.location;

				var position = {};
				var color = {};
				var attributes = {};
				var data = {};

				position.itemSize = 3;
				position.type = 'Float32Array';
				position.array = [ pt[ 0 ], pt[ 1 ], pt[ 2 ] ];

				_color = _attributes.drawColor( doc );

				color.itemSize = 3;
				color.type = 'Float32Array';
				color.array = [ _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 ];

				attributes.position = position;
				attributes.color = color;
				data.attributes = attributes;

				geometry = { data };

				break;

			case rhino.ObjectType.PointSet:
			case rhino.ObjectType.Mesh:

				geometry = _geometry.toThreejsJSON();

				break;

			case rhino.ObjectType.Brep:

				var faces = _geometry.faces();
				geometry = [];

				for ( var faceIndex = 0; faceIndex < faces.count; faceIndex ++ ) {

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

				var mesh = _geometry.getMesh( rhino.MeshType.Any );

				if ( mesh ) {

					geometry = mesh.toThreejsJSON();
					mesh.delete();

				}

				break;

			case rhino.ObjectType.TextDot:

				geometry = extractProperties( _geometry );

				break;

			case rhino.ObjectType.InstanceReference:

				geometry = extractProperties( _geometry );
				geometry.xform = extractProperties( _geometry.xform );
				geometry.xform.array = _geometry.xform.toFloatArray( true );

				break;

				/*
				case rhino.ObjectType.Light:
				case rhino.ObjectType.Annotation:
				case rhino.ObjectType.Hatch:
				case rhino.ObjectType.SubD:
				case rhino.ObjectType.ClipPlane:
				*/

			default:
				console.warn( `THREE.3DMLoader: TODO: Implement ${objectType.constructor.name}` );
				break;

		}

		if ( geometry ) {

			var attributes = extractProperties( _attributes );

			if ( _attributes.groupCount > 0 ) {

				attributes.groupIds = _attributes.getGroupList();

			}

			attributes.drawColor = _attributes.drawColor( doc );

			objectType = objectType.constructor.name;
			objectType = objectType.substring( 11, objectType.length );

			return { geometry, attributes, objectType };

		}

	}

	function extractProperties( object ) {

		var result = {};

		for ( var property in object ) {

			if ( typeof object[ property ] !== 'function' ) {

				result[ property ] = object[ property ];

			} else {

				// console.log(`${property}: ${object[property]}`);

			}

		}

		return result;

	}

	function curveToPoints( curve, pointLimit ) {

		var pointCount = pointLimit;
		var rc = [];
		var ts = [];

		if ( curve instanceof rhino.LineCurve ) {

		  	return [ curve.pointAtStart, curve.pointAtEnd ];

		}

		if ( curve instanceof rhino.PolylineCurve ) {

		  	pointCount = curve.pointCount;
		  	for ( var i = 0; i < pointCount; i ++ ) {

				rc.push( curve.point( i ) );

		  	}

		  	return rc;

		}

		if ( curve instanceof rhino.PolyCurve ) {

		  	var segmentCount = curve.segmentCount;

		  	for ( var i = 0; i < segmentCount; i ++ ) {

				var segment = curve.segmentCurve( i );
				var segmentArray = curveToPoints( segment );
				rc = rc.concat( segmentArray );
				segment.delete();

			}

		  	return rc;

		}

		if ( curve instanceof rhino.NurbsCurve && curve.degree === 1 ) {

		  	// console.info( 'degree 1 curve' );

		}

		var domain = curve.domain;
		var divisions = pointCount - 1.0;

		for ( var j = 0; j < pointCount; j ++ ) {

			var t = domain[ 0 ] + ( j / divisions ) * ( domain[ 1 ] - domain[ 0 ] );

			if ( t === domain[ 0 ] || t === domain[ 1 ] ) {

				ts.push( t );
				continue;

		  	}

		  	var tan = curve.tangentAt( t );
		  	var prevTan = curve.tangentAt( ts.slice( - 1 )[ 0 ] );

		  	// Duplicaated from THREE.Vector3
		  	// How to pass imports to worker?

		  	tS = tan[ 0 ] * tan[ 0 ] + tan[ 1 ] * tan[ 1 ] + tan[ 2 ] * tan[ 2 ];
		  	ptS = prevTan[ 0 ] * prevTan[ 0 ] + prevTan[ 1 ] * prevTan[ 1 ] + prevTan[ 2 ] * prevTan[ 2 ];

		  	var denominator = Math.sqrt( tS * ptS );

		  	var angle;

		  	if ( denominator === 0 ) {

				angle = Math.PI / 2;

		  	} else {

				var theta = ( tan.x * prevTan.x + tan.y * prevTan.y + tan.z * prevTan.z ) / denominator;
				angle = Math.acos( Math.max( - 1, Math.min( 1, theta ) ) );

		  	}

		  	if ( angle < 0.1 ) continue;
		  	ts.push( t );

		}

		rc = ts.map( t => curve.pointAt( t ) );
		return rc;

	}

};

export { Rhino3dmLoader };
