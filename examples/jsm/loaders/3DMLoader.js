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
	Matrix4,
	DirectionalLight,
	PointLight,
	SpotLight,
	RectAreaLight,
	Vector3,
	Sprite,
	SpriteMaterial,
	CanvasTexture,
	LinearFilter,
	ClampToEdgeWrapping,
	TextureLoader
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

	this.materials = [];

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

	parse: function ( data, onLoad, onError ) {

		this.decodeObjects( data, '' )
			.then( onLoad )
			.catch( onError );

	},

	_compareMaterials: function ( material ) {

		var mat = {};
		mat.name = material.name;
		mat.color = {};
		mat.color.r = material.color.r;
		mat.color.g = material.color.g;
		mat.color.b = material.color.b;
		mat.type = material.type;

		for ( var i = 0; i < this.materials.length; i ++ ) {

			var m = this.materials[ i ];
			var _mat = {};
			_mat.name = m.name;
			_mat.color = {};
			_mat.color.r = m.color.r;
			_mat.color.g = m.color.g;
			_mat.color.b = m.color.b;
			_mat.type = m.type;

			if ( JSON.stringify( mat ) === JSON.stringify( _mat ) ) {

				return m;

			}

		}

		this.materials.push( material );

		return material;

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

		// console.log( material );

		var mat = new MeshStandardMaterial( {
			color: diffusecolor,
			name: material.name,
			side: 2,
			transparent: material.transparency > 0 ? true : false,
			opacity: 1.0 - material.transparency
		} );

		var textureLoader = new TextureLoader();

		for ( var i = 0; i < material.textures.length; i ++ ) {

			var texture = material.textures[ i ];

			if ( texture.image !== null ) {

				var map = textureLoader.load( texture.image );

				switch ( texture.type ) {

					case 'Diffuse':

						mat.map = map;

						break;

					case 'Bump':

						mat.bumpMap = map;

						break;

					case 'Transparency':

						mat.alphaMap = map;
						mat.transparent = true;

						break;

					case 'Emap':

						mat.envMap = map;

						break;

				}

			}

		}

		return mat;

	},

	_createGeometry: function ( data ) {

		// console.log(data);

		var object = new Object3D();
		var instanceDefinitionObjects = [];
		var instanceDefinitions = [];
		var instanceReferences = [];

		object.userData[ 'layers' ] = data.layers;
		object.userData[ 'groups' ] = data.groups;
		object.userData[ 'settings' ] = data.settings;

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

					if ( attributes.hasOwnProperty( 'materialUUID' ) ) {

						var rMaterial = materials.find( m => m.id === attributes.materialUUID );
						var material = this._createMaterial( rMaterial );
						material = this._compareMaterials( material );
						var _object = this._createObject( obj, material );

					} else {

						var _object = this._createObject( obj, null );

					}

					if ( _object === undefined ) {

						continue;

					}

					var layer = data.layers[ attributes.layerIndex ];

					_object.visible = layer ? data.layers[ attributes.layerIndex ].visible : true;

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

		this.materials = [];

		return object;

	},

	_createObject: function ( obj, mat ) {

		var loader = new BufferGeometryLoader();

		var attributes = obj.attributes;

		switch ( obj.objectType ) {

			case 'Point':
			case 'PointSet':

				var geometry = loader.parse( obj.geometry );
				var _color = attributes.drawColor;
				var color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );
				var material = new PointsMaterial( { color: color, sizeAttenuation: false, size: 2 } );

				if ( geometry.attributes.hasOwnProperty( 'color' ) ) {

					material.vertexColors = true;

				}

				material = this._compareMaterials( material );

				var points = new Points( geometry, material );
				points.userData[ 'attributes' ] = attributes;
				points.userData[ 'objectType' ] = obj.objectType;
				return points;

			case 'Mesh':
			case 'Extrusion':
			case 'SubD':

				var geometry = loader.parse( obj.geometry );

				if ( geometry.attributes.hasOwnProperty( 'color' ) ) {

					mat.vertexColors = true;

				}

				if ( mat === null ) {

					mat = this._createMaterial();
					mat = this._compareMaterials( mat );

				}

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

				var material = new LineBasicMaterial( { color: color } );
				material = this._compareMaterials( material );

				var lines = new Line( geometry, material );
				lines.userData[ 'attributes' ] = attributes;
				lines.userData[ 'objectType' ] = obj.objectType;

				return lines;

			case 'TextDot':

				geometry = obj.geometry;

				var ctx = document.createElement( 'canvas' ).getContext( '2d' );
				var font = `${geometry.fontHeight}px ${geometry.fontFace}`;
				ctx.font = font;
				var width = ctx.measureText( geometry.text ).width + 10;
				var height = geometry.fontHeight + 10;

				var r = window.devicePixelRatio;

				ctx.canvas.width = width * r;
				ctx.canvas.height = height * r;
				ctx.canvas.style.width = width + 'px';
				ctx.canvas.style.height = height + 'px';
				ctx.setTransform( r, 0, 0, r, 0, 0 );

				ctx.font = font;
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'center';
				var color = attributes.drawColor;
				ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
				ctx.fillRect( 0, 0, width, height );
				ctx.fillStyle = 'white';
				ctx.fillText( geometry.text, width / 2, height / 2 );

				var texture = new CanvasTexture( ctx.canvas );
				texture.minFilter = LinearFilter;
				texture.wrapS = ClampToEdgeWrapping;
				texture.wrapT = ClampToEdgeWrapping;

				var material = new SpriteMaterial( { map: texture, depthTest: false } );
				var sprite = new Sprite( material );
				sprite.position.set( geometry.point[ 0 ], geometry.point[ 1 ], geometry.point[ 2 ] );
				sprite.scale.set( width / 10, height / 10, 1.0 );

				sprite.userData[ 'attributes' ] = attributes;
				sprite.userData[ 'objectType' ] = obj.objectType;

				return sprite;

			case 'Light':

				geometry = obj.geometry;

				var light;

				if ( geometry.isDirectionalLight ) {

					light = new DirectionalLight();
					light.castShadow = attributes.castsShadows;
					light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
					light.target.position.set( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] );
					light.shadow.normalBias = 0.1;

				} else if ( geometry.isPointLight ) {

					light = new PointLight();
					light.castShadow = attributes.castsShadows;
					light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
					light.shadow.normalBias = 0.1;

				} else if ( geometry.isRectangularLight ) {

					light = new RectAreaLight();

					var width = Math.abs( geometry.width[ 2 ] );
					var height = Math.abs( geometry.length[ 0 ] );

					light.position.set( geometry.location[ 0 ] - ( height / 2 ), geometry.location[ 1 ], geometry.location[ 2 ] - ( width / 2 ) );

					light.height = height;
					light.width = width;

					light.lookAt( new Vector3( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] ) );

				} else if ( geometry.isSpotLight ) {

					light = new SpotLight();
					light.castShadow = attributes.castsShadows;
					light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
					light.target.position.set( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] );
					light.angle = geometry.spotAngleRadians;
					light.shadow.normalBias = 0.1;

				} else if ( geometry.isLinearLight ) {

					console.warn( `THREE.3DMLoader:  No conversion exists for linear lights.` );

					return;

				}

				if ( light ) {

					light.intensity = geometry.intensity;
					var _color = geometry.diffuse;
					var color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );
					light.color = color;
					light.userData[ 'attributes' ] = attributes;
					light.userData[ 'objectType' ] = obj.objectType;

				}

				return light;

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

					rhino3dm( RhinoModule ); // eslint-disable-line no-undef

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

		//Handle objects

		for ( var i = 0; i < doc.objects().count; i ++ ) {

			var _object = doc.objects().get( i );

			var object = extractObjectData( _object, doc );

			if ( object !== undefined ) {

				if ( object.attributes.materialIndex >= 0 ) {

					var mId = doc.materials().findIndex( object.attributes.materialIndex ).id;
					object.attributes.materialUUID = mId;

				}

				objects.push( object );

			}

			_object.delete();

		}

		// Handle instance definitions
		// console.log( `Instance Definitions Count: ${doc.instanceDefinitions().count()}` );

		for ( var i = 0; i < doc.instanceDefinitions().count(); i ++ ) {

			var idef = doc.instanceDefinitions().get( i );
			var idefAttributes = extractProperties( idef );
			idefAttributes.objectIds = idef.getObjectIds();

			objects.push( { geometry: null, attributes: idefAttributes, objectType: 'InstanceDefinition' } );

		}

		// Handle materials

		var textureTypes = [
			// rhino.TextureType.Bitmap,
			rhino.TextureType.Diffuse,
			rhino.TextureType.Bump,
			rhino.TextureType.Transparency,
			rhino.TextureType.Opacity,
			rhino.TextureType.Emap
		];

		var pbrTextureTypes = [
			rhino.TextureType.PBR_BaseColor,
			rhino.TextureType.PBR_Subsurface,
			rhino.TextureType.PBR_SubsurfaceScattering,
			rhino.TextureType.PBR_SubsurfaceScatteringRadius,
			rhino.TextureType.PBR_Metallic,
			rhino.TextureType.PBR_Specular,
			rhino.TextureType.PBR_SpecularTint,
			rhino.TextureType.PBR_Roughness,
			rhino.TextureType.PBR_Anisotropic,
			rhino.TextureType.PBR_Anisotropic_Rotation,
			rhino.TextureType.PBR_Sheen,
			rhino.TextureType.PBR_SheenTint,
			rhino.TextureType.PBR_Clearcoat,
			rhino.TextureType.PBR_ClearcoatBump,
			rhino.TextureType.PBR_ClearcoatRoughness,
			rhino.TextureType.PBR_OpacityIor,
			rhino.TextureType.PBR_OpacityRoughness,
			rhino.TextureType.PBR_Emission,
			rhino.TextureType.PBR_AmbientOcclusion,
			rhino.TextureType.PBR_Displacement
		];

		for ( var i = 0; i < doc.materials().count(); i ++ ) {

			var _material = doc.materials().get( i );
			var _pbrMaterial = _material.physicallyBased();

			var material = extractProperties( _material );

			var textures = [];

			for ( var j = 0; j < textureTypes.length; j ++ ) {

				var _texture = _material.getTexture( textureTypes[ j ] );
				if ( _texture ) {

					var textureType = textureTypes[ j ].constructor.name;
					textureType = textureType.substring( 12, textureType.length );
					var texture = { type: textureType };

					var image = doc.getEmbeddedFileAsBase64( _texture.fileName );

					if ( image ) {

						texture.image = 'data:image/png;base64,' + image;

					} else {

						console.warn( `THREE.3DMLoader: Image for ${textureType} texture not embedded in file.` );
						texture.image = null;

					}

					textures.push( texture );

					_texture.delete();

				}

			}

			material.textures = textures;

			if ( _pbrMaterial.supported ) {

				console.log( 'pbr true' );

				for ( var j = 0; j < pbrTextureTypes.length; j ++ ) {

					var _texture = _material.getTexture( textureTypes[ j ] );
					if ( _texture ) {

						var image = doc.getEmbeddedFileAsBase64( _texture.fileName );
						var textureType = textureTypes[ j ].constructor.name;
						textureType = textureType.substring( 12, textureType.length );
						var texture = { type: textureType, image: 'data:image/png;base64,' + image };
						textures.push( texture );

						_texture.delete();

					}

				}

				var pbMaterialProperties = extractProperties( _material.physicallyBased() );

				material = Object.assign( pbMaterialProperties, material );

			}

			materials.push( material );

			_material.delete();
			_pbrMaterial.delete();

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
		// console.log( `Dimstyle Count: ${doc.dimstyles().count()}` );

		// Handle bitmaps
		// console.log( `Bitmap Count: ${doc.bitmaps().count()}` );

		// Handle strings -- this seems to be broken at the moment in rhino3dm
		// console.log( `Document Strings Count: ${doc.strings().count()}` );

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

				var _color = _attributes.drawColor( doc );

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

			case rhino.ObjectType.Light:

				geometry = extractProperties( _geometry );

				break;

			case rhino.ObjectType.InstanceReference:

				geometry = extractProperties( _geometry );
				geometry.xform = extractProperties( _geometry.xform );
				geometry.xform.array = _geometry.xform.toFloatArray( true );

				break;

			case rhino.ObjectType.SubD:

				// TODO: precalculate resulting vertices and faces and warn on excessive results
				_geometry.subdivide( 3 );
				var mesh = rhino.Mesh.createFromSubDControlNet( _geometry );
				if ( mesh ) {

					geometry = mesh.toThreejsJSON();
					mesh.delete();

				}

				break;

				/*
				case rhino.ObjectType.Annotation:
				case rhino.ObjectType.Hatch:
				case rhino.ObjectType.ClipPlane:
				*/

			default:
				console.warn( `THREE.3DMLoader: TODO: Implement ${objectType.constructor.name}` );
				break;

		}

		if ( geometry ) {

			var attributes = extractProperties( _attributes );
			attributes.geometry = extractProperties( _geometry );

			if ( _attributes.groupCount > 0 ) {

				attributes.groupIds = _attributes.getGroupList();

			}

			if ( _attributes.userStringCount > 0 ) {

				attributes.userStrings = _attributes.getUserStrings();

			}

			attributes.drawColor = _attributes.drawColor( doc );

			objectType = objectType.constructor.name;
			objectType = objectType.substring( 11, objectType.length );
			attributes.geometry.objectType = objectType;

			return { geometry, attributes, objectType };

		}

	}

	function extractProperties( object ) {

		var result = {};

		for ( var property in object ) {

			if ( typeof object[ property ] !== 'function' ) {

				result[ property ] = object[ property ];

			} else {

				// console.log( `${property}: ${object[ property ]}` );

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
				var segmentArray = curveToPoints( segment, pointCount );
				rc = rc.concat( segmentArray );
				segment.delete();

			}

			return rc;

		}

		if ( curve instanceof rhino.ArcCurve ) {

			pointCount = Math.floor( curve.angleDegrees / 5 );
			pointCount = pointCount < 1 ? 2 : pointCount;
			// alternative to this hardcoded version: https://stackoverflow.com/a/18499923/2179399

		}

		if ( curve instanceof rhino.NurbsCurve && curve.degree === 1 ) {

			if ( curve.segmentCount === undefined || curve.segmentCount === 1 ) {

				return [ curve.pointAtStart, curve.pointAtEnd ];

			}

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

			var tS = tan[ 0 ] * tan[ 0 ] + tan[ 1 ] * tan[ 1 ] + tan[ 2 ] * tan[ 2 ];
			var ptS = prevTan[ 0 ] * prevTan[ 0 ] + prevTan[ 1 ] * prevTan[ 1 ] + prevTan[ 2 ] * prevTan[ 2 ];

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
