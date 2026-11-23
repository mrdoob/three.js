import {
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	ClampToEdgeWrapping,
	Color,
	DirectionalLight,
	DoubleSide,
	FileLoader,
	LinearFilter,
	Line,
	LineBasicMaterial,
	Loader,
	Matrix4,
	Mesh,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	Object3D,
	PointLight,
	Points,
	PointsMaterial,
	RectAreaLight,
	RepeatWrapping,
	SpotLight,
	Sprite,
	SpriteMaterial,
	TextureLoader,
	EquirectangularReflectionMapping
} from 'three';

import { EXRLoader } from '../loaders/EXRLoader.js';
import { HDRLoader } from '../loaders/HDRLoader.js';

const _taskCache = new WeakMap();

/**
 * A loader for Rhinoceros 3D files and objects.
 *
 * Rhinoceros is a 3D modeler used to create, edit, analyze, document, render,
 * animate, and translate NURBS curves, surfaces, breps, extrusions, point clouds,
 * as well as polygon meshes and SubD objects. `rhino3dm.js` is compiled to WebAssembly
 * from the open source geometry library `openNURBS`. The loader currently uses
 * `rhino3dm.js 9.2.0-beta.1`; it needs 9.2 or later, whose API is generated from RhinoCommon.
 *
 * ```js
 * const loader = new Rhino3dmLoader();
 * loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@9.2.0-beta.1/' );
 *
 * const object = await loader.loadAsync( 'models/3dm/Rhino_Logo.3dm' );
 * scene.add( object );
 * ```
 *
 * @augments Loader
 * @three_import import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';
 */
class Rhino3dmLoader extends Loader {

	/**
	 * Constructs a new Rhino 3DM loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		// internals

		this.libraryPath = '';
		this.libraryPending = null;
		this.libraryBinary = null;
		this.libraryConfig = {};

		this.url = '';

		this.workerLimit = 4;
		this.workerPool = [];
		this.workerNextTaskID = 1;
		this.workerSourceURL = '';
		this.workerConfig = {};

		// Number of global subdivisions applied to SubD objects before meshing. Higher
		// values increase smoothness at the cost of (potentially very large) vertex counts.
		this.subdivisionLevel = 3;

		this.materials = [];
		this.warnings = [];

	}

	/**
	 * Path to a folder containing the JS and WASM libraries.
	 *
	 * @param {string} path - The library path to set.
	 * @return {Rhino3dmLoader} A reference to this loader.
	 */
	setLibraryPath( path ) {

		this.libraryPath = path;

		return this;

	}

	/**
	 * Sets the maximum number of Web Workers to be used during decoding.
	 * A lower limit may be preferable if workers are also for other
	 * tasks in the application.
	 *
	 * @param {number} workerLimit - The worker limit.
	 * @return {Rhino3dmLoader} A reference to this loader.
	 */
	setWorkerLimit( workerLimit ) {

		this.workerLimit = workerLimit;

		return this;

	}

	/**
	 * Sets the number of global subdivisions applied to SubD objects before they are
	 * meshed for display. The default is `3`. Large models with many SubD objects may
	 * benefit from a lower value to keep vertex counts manageable.
	 *
	 * @param {number} level - The subdivision level.
	 * @return {Rhino3dmLoader} A reference to this loader.
	 */
	setSubdivisionLevel( level ) {

		this.subdivisionLevel = level;

		return this;

	}

	/**
	 * Starts loading from the given URL and passes the loaded 3DM asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Object3D)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const loader = new FileLoader( this.manager );
		loader.setPriority( this.priority );
		loader.setCache( this.cache );

		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );

		this.url = url;

		loader.load( url, ( buffer ) => {

			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if ( _taskCache.has( buffer ) ) {

				const cachedTask = _taskCache.get( buffer );

				return cachedTask.promise.then( onLoad ).catch( onError );

			}

			this.decodeObjects( buffer, url )
				.then( result => {

					result.userData.warnings = this.warnings;
					onLoad( result );

				 } )
				.catch( e => onError( e ) );

		}, onProgress, onError );

	}

	/**
	 * Prints debug messages to the browser console.
	 */
	debug() {

		console.log( 'Task load: ', this.workerPool.map( ( worker ) => worker._taskLoad ) );

	}

	/**
	 * Decodes the 3DM asset data with a Web Worker.
	 *
	 * @param {ArrayBuffer} buffer - The raw 3DM asset data as an array buffer.
	 * @param {string} url - The asset URL.
	 * @return {Promise<Object3D>} A Promise that resolved with the decoded 3D object.
	 */
	decodeObjects( buffer, url ) {

		let worker;
		let taskID;

		const taskCost = buffer.byteLength;

		const objectPending = this._getWorker( taskCost )
			.then( ( _worker ) => {

				worker = _worker;
				taskID = this.workerNextTaskID ++;

				return new Promise( ( resolve, reject ) => {

					worker._callbacks[ taskID ] = { resolve, reject };
					worker._taskCosts[ taskID ] = taskCost;

					worker.postMessage( { type: 'decode', id: taskID, buffer, subdivisionLevel: this.subdivisionLevel }, [ buffer ] );

				} );

			} )
			.then( ( message ) => this._createGeometry( message.data ) )
			.catch( e => {

				throw e;

			} );

		// Remove task from the task list.
		// Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
		objectPending
			.catch( () => true )
			.then( () => {

				if ( worker && taskID ) {

					this._releaseTask( worker, taskID );


				}

			} );

		// Cache the task result.
		_taskCache.set( buffer, {

			url: url,
			promise: objectPending

		} );

		return objectPending;

	}

	/**
	 * Parses the given 3DM data and passes the loaded 3DM asset
	 * to the `onLoad()` callback.
	 *
	 * @param {ArrayBuffer} data - The raw 3DM asset data as an array buffer.
	 * @param {function(Object3D)} onLoad - Executed when the loading process has been finished.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	parse( data, onLoad, onError ) {

		this.parseAsync( data ).then( onLoad ).catch( onError );

	}

	/**
	 * Parses the given 3DM data and returns a Promise that resolves with the loaded asset.
	 *
	 * @param {ArrayBuffer} data - The raw 3DM asset data as an array buffer.
	 * @return {Promise<Object3D>} A Promise that resolves with the decoded 3D object.
	 */
	parseAsync( data ) {

		return this.decodeObjects( data, '' ).then( result => {

			result.userData.warnings = this.warnings;
			return result;

		} );

	}

	_compareMaterials( material ) {

		const mat = {};
		mat.name = material.name;
		mat.color = {};
		mat.color.r = material.color.r;
		mat.color.g = material.color.g;
		mat.color.b = material.color.b;
		mat.type = material.type;
		mat.vertexColors = material.vertexColors;

		const json = JSON.stringify( mat );

		for ( let i = 0; i < this.materials.length; i ++ ) {

			const m = this.materials[ i ];
			const _mat = {};
			_mat.name = m.name;
			_mat.color = {};
			_mat.color.r = m.color.r;
			_mat.color.g = m.color.g;
			_mat.color.b = m.color.b;
			_mat.type = m.type;
			_mat.vertexColors = m.vertexColors;

			if ( JSON.stringify( _mat ) === json ) {

				return m;

			}

		}

		this.materials.push( material );

		return material;

	}

	_createMaterial( material, renderEnvironment, files ) {

		if ( material === undefined ) {

			return new MeshStandardMaterial( {
				color: new Color( 1, 1, 1 ),
				metalness: 0.8,
				name: Loader.DEFAULT_MATERIAL_NAME,
				side: DoubleSide
			} );

		}


		const mat = new MeshPhysicalMaterial( {

			color: new Color( material.diffuseColor.r / 255.0, material.diffuseColor.g / 255.0, material.diffuseColor.b / 255.0 ),
			emissive: new Color( material.emissionColor.r / 255.0, material.emissionColor.g / 255.0, material.emissionColor.b / 255.0 ),
			flatShading: material.disableLighting,
			ior: material.indexOfRefraction,
			name: material.name,
			reflectivity: material.reflectivity,
			opacity: 1.0 - material.transparency,
			side: DoubleSide,
			specularColor: new Color( material.specularColor.r / 255.0, material.specularColor.g / 255.0, material.specularColor.b / 255.0 ),
			transparent: material.transparency > 0 ? true : false

		} );

		mat.userData.id = material.id;

		if ( material.pbrSupported ) {

			const pbr = material.pbr;

			mat.anisotropy = pbr.anisotropic;
			mat.anisotropyRotation = pbr.anisotropicRotation;
			mat.color = new Color( pbr.baseColor.R, pbr.baseColor.G, pbr.baseColor.B );
			mat.clearcoat = pbr.clearcoat;
			mat.clearcoatRoughness = pbr.clearcoatRoughness;
			mat.metalness = pbr.metallic;
			mat.roughness = pbr.roughness;
			mat.sheen = pbr.sheen;
			mat.specularIntensity = pbr.specular;
			mat.thickness = pbr.subsurface;

			// Rhino PBR Opacity is coverage/alpha, not glass transmission, and is
			// 1 = opaque (glTF/Disney convention, matching three.js mat.opacity — unlike
			// the legacy Material.transparency used above, which is 0 = opaque). Map it
			// straight to opacity so it behaves as pure alpha; leave mat.transmission at
			// its default (0) rather than deriving glass from opacity. (RH3DM-190)
			mat.opacity = pbr.opacity;
			mat.transparent = pbr.opacity < 1.0;

		}

		const textureLoader = new TextureLoader();
		textureLoader.setPriority( this.priority );
		textureLoader.setCache( this.cache );

		for ( let i = 0; i < material.textures.length; i ++ ) {

			const texture = material.textures[ i ];

			if ( texture.file !== null ) {

				const map = textureLoader.load( this._fileURL( files, texture.file ) );


				switch ( texture.type ) {

					case 'Bump':

						mat.bumpMap = map;

						break;

					case 'Diffuse':

						mat.map = map;

						break;

					case 'Emap':

						mat.envMap = map;

						break;

					case 'Opacity':

						mat.transmissionMap = map;

						break;

					case 'Transparency':

						mat.alphaMap = map;
						mat.transparent = true;

						break;

					case 'PBR_Alpha':

						mat.alphaMap = map;
						mat.transparent = true;

						break;

					case 'PBR_AmbientOcclusion':

						mat.aoMap = map;

						break;

					case 'PBR_Anisotropic':

						mat.anisotropyMap = map;

						break;

					case 'PBR_BaseColor':

						mat.map = map;

						break;

					case 'PBR_Clearcoat':

						mat.clearcoatMap = map;

						break;

					case 'PBR_ClearcoatBump':

						mat.clearcoatNormalMap = map;

						break;

					case 'PBR_ClearcoatRoughness':

						mat.clearcoatRoughnessMap = map;

						break;

					case 'PBR_Displacement':

						mat.displacementMap = map;

						break;

					case 'PBR_Emission':

						mat.emissiveMap = map;

						break;

					case 'PBR_Metallic':

						mat.metalnessMap = map;

						break;

					case 'PBR_Roughness':

						mat.roughnessMap = map;

						break;

					case 'PBR_Sheen':

						mat.sheenColorMap = map;

						break;

					case 'PBR_Specular':

						mat.specularColorMap = map;

						break;

					case 'PBR_Subsurface':

						mat.thicknessMap = map;

						break;

					default:

						this.warnings.push( {
							message: `THREE.3DMLoader: No conversion exists for 3dm ${texture.type}.`,
							type: 'no conversion'
						} );

						break;

				}

				map.wrapS = texture.wrapU === 'Repeat' ? RepeatWrapping : ClampToEdgeWrapping;
				map.wrapT = texture.wrapV === 'Repeat' ? RepeatWrapping : ClampToEdgeWrapping;
				map.repeat.set( texture.repeat[ 0 ], texture.repeat[ 1 ] );
				map.offset.set( texture.offset[ 0 ], texture.offset[ 1 ] );
				map.rotation = texture.rotation;

			}

		}

		if ( renderEnvironment ) {

			const extension = files[ renderEnvironment.file ].extension;
			const EnvironmentLoader = extension === 'exr' ? EXRLoader : extension === 'hdr' ? HDRLoader : TextureLoader;

			new EnvironmentLoader().setPriority( this.priority ).setCache( this.cache ).load( this._fileURL( files, renderEnvironment.file ), function ( texture ) {

				texture.mapping = EquirectangularReflectionMapping;
				mat.envMap = texture;

			} );

		}

		return mat;

	}

	_fileURL( files, name ) {

		const file = files[ name ];
		if ( file.url === undefined ) file.url = URL.createObjectURL( new Blob( [ file.bytes ], { type: file.mimeType } ) );
		return file.url;

	}

	_createGeometry( data ) {

		const object = new Object3D();
		const instanceDefinitionObjects = [];
		const instanceDefinitions = [];
		const instanceReferences = [];

		object.userData[ 'layers' ] = data.layers;
		object.userData[ 'views' ] = data.views;
		object.userData[ 'namedViews' ] = data.namedViews;
		object.userData[ 'groups' ] = data.groups;
		object.userData[ 'strings' ] = data.strings;
		object.userData[ 'settings' ] = data.settings;
		object.userData.settings[ 'renderSettings' ] = data.renderSettings;
		object.userData[ 'objectType' ] = 'File3dm';

		object.name = this.url;

		let objects = data.objects;
		const materials = data.materials;

		for ( let i = 0; i < objects.length; i ++ ) {

			const obj = objects[ i ];
			const attributes = obj.attributes;

			switch ( obj.objectType ) {

				case 'InstanceDefinition':

					instanceDefinitions.push( obj );

					break;

				case 'InstanceReference':

					instanceReferences.push( obj );

					break;

				default:

					let matId = null;

					switch ( attributes.materialSource.name ) {

						case 'ObjectMaterialSource_MaterialFromLayer':
							//check layer index
							if ( attributes.layerIndex >= 0 ) {

								matId = data.layers[ attributes.layerIndex ].renderMaterialIndex;

							}

							break;

						case 'ObjectMaterialSource_MaterialFromObject':

							if ( attributes.materialIndex >= 0 ) {

								matId = attributes.materialIndex;

							}

							break;

					}

					let material = null;

					if ( matId >= 0 ) {

						const rMaterial = materials[ matId ];
						material = this._createMaterial( rMaterial, data.renderEnvironment, data.files );


					}

					const _object = this._createObject( obj, material );

					if ( _object === undefined ) {

						continue;

					}

					const layer = data.layers[ attributes.layerIndex ];

					_object.visible = layer ? data.layers[ attributes.layerIndex ].visible : true;

					if ( attributes.isInstanceDefinitionObject ) {

						instanceDefinitionObjects.push( _object );

					} else {

						object.add( _object );

					}

					break;

			}

		}

		for ( let i = 0; i < instanceDefinitions.length; i ++ ) {

			const iDef = instanceDefinitions[ i ];

			objects = [];

			for ( let j = 0; j < iDef.attributes.objectIds.length; j ++ ) {

				const objId = iDef.attributes.objectIds[ j ];

				for ( let p = 0; p < instanceDefinitionObjects.length; p ++ ) {

					const idoId = instanceDefinitionObjects[ p ].userData.attributes.id;

					if ( objId === idoId ) {

						objects.push( instanceDefinitionObjects[ p ] );

					}

				}

			}

			// Currently clones geometry and does not take advantage of instancing

			for ( let j = 0; j < instanceReferences.length; j ++ ) {

				const iRef = instanceReferences[ j ];

				if ( iRef.geometry.parentIdefId === iDef.attributes.id ) {

					const iRefObject = new Object3D();
					const xf = iRef.geometry.xform.array;

					const matrix = new Matrix4();
					matrix.set( ...xf );

					iRefObject.applyMatrix4( matrix );

					for ( let p = 0; p < objects.length; p ++ ) {

						iRefObject.add( objects[ p ].clone( true ) );

					}

					object.add( iRefObject );

				}

			}

		}

		object.name = '';
		return object;

	}

	/**
	 * Builds a BufferGeometry from a worker payload: meshes, point clouds, curves and points
	 * arrive as transferable typed arrays (`format: 'buffers'`).
	 */
	_geometryFromData( data ) {

		const geometry = new BufferGeometry();

		if ( data.position && data.position.length ) geometry.setAttribute( 'position', new BufferAttribute( data.position, 3 ) );
		if ( data.normal && data.normal.length ) geometry.setAttribute( 'normal', new BufferAttribute( data.normal, 3 ) );
		if ( data.uv && data.uv.length ) geometry.setAttribute( 'uv', new BufferAttribute( data.uv, 2 ) );
		if ( data.color && data.color.length ) geometry.setAttribute( 'color', new BufferAttribute( data.color, 3 ) );
		if ( data.index && data.index.length ) geometry.setIndex( new BufferAttribute( data.index, 1 ) );

		return geometry;

	}

	_createObject( obj, mat ) {

		const attributes = obj.attributes;

		let geometry, material, _color, color;

		switch ( obj.objectType ) {

			case 'Point':
			case 'PointSet':

				geometry = this._geometryFromData( obj.geometry );

				if ( geometry.hasAttribute( 'color' ) ) {

					material = new PointsMaterial( { vertexColors: true, sizeAttenuation: false, size: 2 } );

				} else {

					_color = attributes.drawColor;
					color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );
					material = new PointsMaterial( { color: color, sizeAttenuation: false, size: 2 } );

				}

				material = this._compareMaterials( material );

				const points = new Points( geometry, material );
				points.userData[ 'attributes' ] = attributes;
				points.userData[ 'objectType' ] = obj.objectType;

				if ( attributes.name ) {

					points.name = attributes.name;

				}

				return points;

			case 'Mesh':
			case 'Extrusion':
			case 'SubD':
			case 'Brep':

				if ( obj.geometry === null ) return;

				geometry = this._geometryFromData( obj.geometry );


				if ( mat === null ) {

					mat = this._createMaterial();

				}


				if ( geometry.hasAttribute( 'color' ) ) {

					mat.vertexColors = true;

				}

				mat = this._compareMaterials( mat );

				const mesh = new Mesh( geometry, mat );
				mesh.castShadow = attributes.castsShadows;
				mesh.receiveShadow = attributes.receivesShadows;
				mesh.userData[ 'attributes' ] = attributes;
				mesh.userData[ 'objectType' ] = obj.objectType;

				if ( attributes.name ) {

					mesh.name = attributes.name;

				}

				return mesh;

			case 'Curve':

				geometry = this._geometryFromData( obj.geometry );

				_color = attributes.drawColor;
				color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );

				material = new LineBasicMaterial( { color: color } );
				material = this._compareMaterials( material );

				const lines = new Line( geometry, material );
				lines.userData[ 'attributes' ] = attributes;
				lines.userData[ 'objectType' ] = obj.objectType;

				if ( attributes.name ) {

					lines.name = attributes.name;

				}

				return lines;

			case 'TextDot':

				geometry = obj.geometry;

				const ctx = document.createElement( 'canvas' ).getContext( '2d' );
				const font = `${geometry.fontHeight}px ${geometry.fontFace}`;
				ctx.font = font;
				const width = ctx.measureText( geometry.text ).width + 10;
				const height = geometry.fontHeight + 10;

				const r = window.devicePixelRatio;

				ctx.canvas.width = width * r;
				ctx.canvas.height = height * r;
				ctx.canvas.style.width = width + 'px';
				ctx.canvas.style.height = height + 'px';
				ctx.setTransform( r, 0, 0, r, 0, 0 );

				ctx.font = font;
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'center';
				color = attributes.drawColor;
				ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
				ctx.fillRect( 0, 0, width, height );
				ctx.fillStyle = 'white';
				ctx.fillText( geometry.text, width / 2, height / 2 );

				const texture = new CanvasTexture( ctx.canvas );
				texture.minFilter = LinearFilter;
				texture.generateMipmaps = false;
				texture.wrapS = ClampToEdgeWrapping;
				texture.wrapT = ClampToEdgeWrapping;

				material = new SpriteMaterial( { map: texture, depthTest: false } );
				const sprite = new Sprite( material );
				sprite.position.set( geometry.point[ 0 ], geometry.point[ 1 ], geometry.point[ 2 ] );
				sprite.scale.set( width / 10, height / 10, 1.0 );

				sprite.userData[ 'attributes' ] = attributes;
				sprite.userData[ 'objectType' ] = obj.objectType;

				if ( attributes.name ) {

					sprite.name = attributes.name;

				}

				return sprite;

			case 'Light':

				geometry = obj.geometry;

				let light;

				switch ( geometry.lightStyle.name ) {

					case 'LightStyle_WorldPoint':

						light = new PointLight();
						light.castShadow = attributes.castsShadows;
						light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
						light.shadow.normalBias = 0.1;

						break;

					case 'LightStyle_WorldSpot':

						light = new SpotLight();
						light.castShadow = attributes.castsShadows;
						light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
						light.target.position.set( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] );
						light.angle = geometry.spotAngleRadians;
						light.shadow.normalBias = 0.1;

						break;

					case 'LightStyle_WorldRectangular':

						light = new RectAreaLight();
						const width = Math.abs( geometry.width[ 2 ] );
						const height = Math.abs( geometry.length[ 0 ] );
						light.position.set( geometry.location[ 0 ] - ( height / 2 ), geometry.location[ 1 ], geometry.location[ 2 ] - ( width / 2 ) );
						light.height = height;
						light.width = width;
						light.lookAt( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] );

						break;

					case 'LightStyle_WorldDirectional':

						light = new DirectionalLight();
						light.castShadow = attributes.castsShadows;
						light.position.set( geometry.location[ 0 ], geometry.location[ 1 ], geometry.location[ 2 ] );
						light.target.position.set( geometry.direction[ 0 ], geometry.direction[ 1 ], geometry.direction[ 2 ] );
						light.shadow.normalBias = 0.1;

						break;

					case 'LightStyle_WorldLinear':
						// no conversion exists, warning has already been printed to the console
						break;

					default:
						break;

				}

				if ( light ) {

					light.intensity = geometry.intensity;
					_color = geometry.diffuse;
					color = new Color( _color.r / 255.0, _color.g / 255.0, _color.b / 255.0 );
					light.color = color;
					light.userData[ 'attributes' ] = attributes;
					light.userData[ 'objectType' ] = obj.objectType;

				}

				return light;

		}

	}

	_initLibrary() {

		if ( ! this.libraryPending ) {

			// Load rhino3dm wrapper.
			const jsLoader = new FileLoader( this.manager );
			jsLoader.setPriority( this.priority );
			jsLoader.setCache( this.cache );
			jsLoader.setPath( this.libraryPath );
			const jsContent = new Promise( ( resolve, reject ) => {

				jsLoader.load( 'rhino3dm.js', resolve, undefined, reject );

			} );

			// Load rhino3dm WASM binary.
			const binaryLoader = new FileLoader( this.manager );
			binaryLoader.setPriority( this.priority );
			binaryLoader.setCache( this.cache );
			binaryLoader.setPath( this.libraryPath );
			binaryLoader.setResponseType( 'arraybuffer' );
			const binaryContent = new Promise( ( resolve, reject ) => {

				binaryLoader.load( 'rhino3dm.wasm', resolve, undefined, reject );

			} );

			this.libraryPending = Promise.all( [ jsContent, binaryContent ] )
				.then( ( [ jsContent, binaryContent ] ) => {

					//this.libraryBinary = binaryContent;
					this.libraryConfig.wasmBinary = binaryContent;

					const fn = Rhino3dmWorker.toString();

					const body = [
						'/* rhino3dm.js */',
						jsContent,
						'/* worker */',
						fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) )
					].join( '\n' );

					this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

				} );

		}

		return this.libraryPending;

	}

	_getWorker( taskCost ) {

		return this._initLibrary().then( () => {

			if ( this.workerPool.length < this.workerLimit ) {

				const worker = new Worker( this.workerSourceURL );

				worker._callbacks = {};
				worker._taskCosts = {};
				worker._taskLoad = 0;

				worker.postMessage( {
					type: 'init',
					libraryConfig: this.libraryConfig
				} );

				worker.onmessage = e => {

					const message = e.data;

					switch ( message.type ) {

						case 'warning':
							this.warnings.push( message.data );
							console.warn( message.data );
							break;

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

			const worker = this.workerPool[ this.workerPool.length - 1 ];

			worker._taskLoad += taskCost;

			return worker;

		} );

	}

	_releaseTask( worker, taskID ) {

		worker._taskLoad -= worker._taskCosts[ taskID ];
		delete worker._callbacks[ taskID ];
		delete worker._taskCosts[ taskID ];

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the loader is no longer required.
	 */
	dispose() {

		for ( let i = 0; i < this.workerPool.length; ++ i ) {

			this.workerPool[ i ].terminate();

		}

		this.workerPool.length = 0;

	}

}

/* WEB WORKER */

function Rhino3dmWorker() {

	let libraryPending;
	let rhino;
	let taskID;

	onmessage = function ( e ) {

		const message = e.data;

		switch ( message.type ) {

			case 'init':

				// rhino3dm >= 9.2: the factory resolves with the module.
				libraryPending = rhino3dm( { wasmBinary: message.libraryConfig.wasmBinary } ) // eslint-disable-line no-undef
					.then( ( module ) => {

						rhino = module;

					} );

				break;

			case 'decode':

				libraryPending.then( () => {

					taskID = message.id;

					try {

						const data = decodeObjects( new Uint8Array( message.buffer ), message.subdivisionLevel );
						self.postMessage( { type: 'decode', id: message.id, data }, collectTransferables( data ) );

					} catch ( error ) {

						self.postMessage( { type: 'error', id: message.id, error: errorToObject( error ) } );

					}

				} );

				break;

		}

	};

	// rhino3dm 9.2 throws WebAssembly.Exception; its text is read (and the exception freed) through the module.
	function errorToObject( error ) {

		if ( typeof WebAssembly.Exception === 'function' && error instanceof WebAssembly.Exception ) {

			const message = rhino.getExceptionMessage( error );
			rhino.decrementExceptionRefcount( error );
			return { message: String( message ) };

		}

		return { message: error.message, stack: error.stack };

	}

	function warn( message, type, guid ) {

		self.postMessage( { type: 'warning', id: taskID, data: { message: `THREE.3DMLoader: ${message}`, type, guid } } );

	}

	// 'ObjectType_Brep' -> 'Brep'
	function enumName( value ) {

		const name = value.constructor.name;
		return name.substring( name.indexOf( '_' ) + 1 );

	}

	function color( c ) {

		return { r: c.r, g: c.g, b: c.b, a: c.a };

	}

	function meshToBuffers( mesh ) {

		const b = mesh.toThreejsBuffers( false );
		const g = { format: 'buffers', position: b.position };
		if ( b.normal ) g.normal = b.normal;
		if ( b.index ) g.index = b.index;
		if ( b.uv ) g.uv = b.uv;
		if ( b.color ) g.color = b.color;
		return g;

	}

	function collectTransferables( data ) {

		const transfer = new Set();

		for ( const obj of data.objects ) {

			const g = obj.geometry;
			if ( g && g.format === 'buffers' ) {

				for ( const key of [ 'position', 'normal', 'uv', 'color', 'index' ] ) {

					if ( g[ key ] ) transfer.add( g[ key ].buffer );

				}

			}

		}

		for ( const file of Object.values( data.files ) ) transfer.add( file.bytes.buffer );

		return Array.from( transfer );

	}

	// Embedded files keyed as getEmbeddedFileAsBase64( path ) matched them: the full path, then the file name
	// alone, ignoring case. Embedded paths are normalized for the platform (C:\a\b.png reads /a/b.png) while
	// texture paths are not, so a Windows file only ever matches by name.
	function embeddedFileLookup( doc ) {

		const byPath = new Map();
		const byName = new Map();

		for ( const file of doc.embeddedFiles ) {

			const path = file.filename;
			byPath.set( path.toLowerCase(), file );
			const name = baseName( path );
			if ( ! byName.has( name ) ) byName.set( name, file );

		}

		return ( path ) => path ? ( byPath.get( path.toLowerCase() ) || byName.get( baseName( path ) ) ) : undefined;

	}

	function baseName( path ) {

		return path.split( /[\\/]/ ).pop().toLowerCase();

	}

	const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff', exr: 'image/x-exr', hdr: 'image/vnd.radiance' };

	// Embedded images are sent once per file as transferable bytes; textures refer to them by name.
	function addFile( files, findFile, path ) {

		const file = findFile( path );
		if ( ! file ) return null;

		const name = file.filename;

		if ( ! files[ name ] ) {

			const extension = baseName( name ).split( '.' ).pop();
			files[ name ] = { bytes: file.toByteArray(), mimeType: mimeTypes[ extension ] || 'application/octet-stream', extension };

		}

		return name;

	}

	function decodeObjects( bytes, subdivisionLevel ) {

		const doc = rhino.File3dm.fromByteArray( bytes );

		if ( ! doc ) throw new Error( 'THREE.3DMLoader: Not a 3dm file, or the file could not be read.' );

		const findFile = embeddedFileLookup( doc );
		const files = {};

		// Tables are indexed by component index: iteration skips deleted components, so array position and
		// attributes.layerIndex / materialIndex can disagree.

		const materials = [];

		for ( const _material of doc.materials ) {

			materials[ _material.index ] = extractMaterial( _material, files, findFile );
			_material.delete();

		}

		const layers = [];

		for ( const _layer of doc.layers ) {

			const layer = extractProperties( _layer );
			layer.visible = _layer.isVisible; // 8.x name, read by userData consumers
			layers[ _layer.index ] = layer;
			_layer.delete();

		}

		// Whether the material the object renders with (resolved as Rhino3dmLoader does) shows an image.
		const hasTexture = ( attributes ) => {

			let index = - 1;
			const source = attributes.materialSource;

			if ( source === rhino.ObjectMaterialSource.MaterialFromLayer ) {

				const layer = layers[ attributes.layerIndex ];
				if ( layer ) index = layer.renderMaterialIndex;

			} else if ( source === rhino.ObjectMaterialSource.MaterialFromObject ) {

				index = attributes.materialIndex;

			}

			const material = materials[ index ];
			return material !== undefined && material.textures.some( ( t ) => t.file !== null );

		};

		const objects = [];

		for ( const _object of doc.objects ) {

			const object = extractObjectData( _object, doc, subdivisionLevel, hasTexture );
			_object.delete();
			if ( object ) objects.push( object );

		}

		for ( const idef of doc.instanceDefinitions ) {

			objects.push( { geometry: null, attributes: { id: idef.id, name: idef.name, description: idef.description, objectIds: idef.getObjectIds() }, objectType: 'InstanceDefinition' } );
			idef.delete();

		}

		const views = [];
		for ( let i = 0; i < doc.views.count; i ++ ) views.push( extractProperties( doc.views.get( i ) ) );

		const namedViews = [];
		for ( let i = 0; i < doc.namedViews.count; i ++ ) namedViews.push( extractProperties( doc.namedViews.get( i ) ) );

		const groups = [];
		for ( const group of doc.allGroups ) groups.push( extractProperties( group ) );

		const settings = extractProperties( doc.settings );

		const strings = [];
		for ( let i = 0; i < doc.strings.count; i ++ ) strings.push( [ doc.strings.getKey( i ), doc.strings.getValue( i ) ] );

		const rs = doc.settings.renderSettings;
		const Usage = rhino.RenderSettingsEnvironmentUsage;
		const Purpose = rhino.RenderSettingsEnvironmentPurpose;
		const environmentId = ( usage ) => rs.renderEnvironmentId( usage, Purpose.ForRendering );

		let renderEnvironment = null;
		const environment = doc.renderEnvironments.find( environmentId( Usage.Reflection ) );

		if ( environment ) {

			const texture = environment.findChild( 'texture' );
			const file = texture ? addFile( files, findFile, texture.filename ) : null;
			if ( file ) renderEnvironment = { file };

		}

		const postEffects = [];
		for ( const effect of rs.postEffects ) postEffects.push( { id: effect.id, localName: effect.localName, on: effect.on, shown: effect.shown, type: enumName( effect.type ) } );

		const renderSettings = {
			ambientLight: color( rs.ambientLight ),
			backgroundColorTop: color( rs.backgroundColorTop ),
			backgroundColorBottom: color( rs.backgroundColorBottom ),
			useHiddenLights: rs.useHiddenLights,
			depthCue: rs.depthCue,
			flatShade: rs.flatShade,
			renderBackfaces: rs.renderBackfaces,
			renderPoints: rs.renderPoints,
			renderCurves: rs.renderCurves,
			renderIsoparams: rs.renderIsoparams,
			renderMeshEdges: rs.renderMeshEdges,
			renderAnnotations: rs.renderAnnotations,
			useViewportSize: rs.useViewportSize,
			scaleBackgroundToFit: rs.scaleBackgroundToFit,
			transparentBackground: rs.transparentBackground,
			imageDpi: rs.imageDpi,
			shadowmapLevel: rs.shadowmapLevel,
			namedView: rs.namedView,
			snapshot: rs.snapshot,
			specificViewport: rs.specificViewport,
			groundPlane: extractProperties( rs.groundPlane ),
			safeFrame: extractProperties( rs.safeFrame ),
			dithering: extractProperties( rs.dithering ),
			skylight: extractProperties( rs.skylight ),
			linearWorkflow: extractProperties( rs.linearWorkflow ),
			renderChannels: extractProperties( rs.renderChannels ),
			sun: extractProperties( rs.sun ),
			renderEnvironments: {
				backgroundId: environmentId( Usage.Background ),
				reflectionId: environmentId( Usage.Reflection ),
				skylightingId: environmentId( Usage.Skylighting )
			},
			postEffects
		};

		doc.delete();

		return { objects, materials, layers, views, namedViews, groups, strings, settings, renderSettings, renderEnvironment, files };

	}

	const textureTypes = [ 'Diffuse', 'Bump', 'Transparency', 'Opacity', 'Emap' ];

	const pbrTextureTypes = [
		'PBR_BaseColor', 'PBR_Subsurface', 'PBR_SubsurfaceScattering', 'PBR_SubsurfaceScatteringRadius', 'PBR_Metallic',
		'PBR_Specular', 'PBR_SpecularTint', 'PBR_Roughness', 'PBR_Anisotropic', 'PBR_Anisotropic_Rotation', 'PBR_Sheen',
		'PBR_SheenTint', 'PBR_Clearcoat', 'PBR_ClearcoatBump', 'PBR_ClearcoatRoughness', 'PBR_OpacityIor',
		'PBR_OpacityRoughness', 'PBR_Emission', 'PBR_AmbientOcclusion', 'PBR_Displacement', 'PBR_Alpha'
	];

	function extractMaterial( m, files, findFile ) {

		const material = {
			id: m.id,
			index: m.index,
			name: m.name,
			diffuseColor: color( m.diffuseColor ),
			emissionColor: color( m.emissionColor ),
			specularColor: color( m.specularColor ),
			transparency: m.transparency,
			indexOfRefraction: m.indexOfRefraction,
			reflectivity: m.reflectivity,
			disableLighting: m.disableLighting,
			pbrSupported: m.isPhysicallyBased,
			textures: extractTextures( m, textureTypes, files, findFile )
		};

		if ( material.pbrSupported ) {

			material.pbr = extractProperties( m.physicallyBased ); // baseColor, emission are Color4f: { R, G, B, A } in 0..1
			material.textures.push( ...extractTextures( m, pbrTextureTypes, files, findFile ) );

		}

		return material;

	}

	function extractTextures( m, types, files, findFile ) {

		const textures = [];

		for ( const type of types ) {

			const t = m.getTexture( rhino.TextureType[ type ] );
			if ( ! t ) continue;

			const file = addFile( files, findFile, t.fileName );

			if ( ! file ) warn( `Image for ${type} texture not embedded in file.`, 'missing resource' );

			textures.push( {
				type,
				file,
				wrapU: enumName( t.wrapU ),
				wrapV: enumName( t.wrapV ),
				repeat: [ t.repeat.X, t.repeat.Y ],
				offset: [ t.offset.X, t.offset.Y ],
				rotation: t.rotation
			} );

			t.delete();

		}

		return textures;

	}

	function extractObjectData( object, doc, subdivisionLevel, hasTexture ) {

		const _geometry = object.geometry;
		const _attributes = object.attributes;
		const objectType = enumName( _geometry.objectType );
		let geometry, mesh;

		switch ( objectType ) {

			case 'Curve':

				geometry = { format: 'buffers', position: curveToPositions( _geometry ) };
				break;

			case 'Point': {

				const p = _geometry.location;
				const c = _attributes.drawColor( doc );
				geometry = { format: 'buffers', position: new Float32Array( [ p.X, p.Y, p.Z ] ), color: new Float32Array( [ c.r / 255, c.g / 255, c.b / 255 ] ) };
				break;

			}

			case 'PointSet':
			case 'Mesh':

				geometry = meshToBuffers( _geometry );
				break;

			case 'Brep':

				mesh = new rhino.Mesh();

				for ( const face of _geometry.faces ) {

					const faceMesh = face.getMesh( rhino.MeshType.Any );

					if ( faceMesh ) {

						mesh.append( faceMesh );
						faceMesh.delete();

					}

					face.delete();

				}

				if ( mesh.faces.count > 0 ) {

					mesh.compact();
					geometry = meshToBuffers( mesh );

				}

				mesh.delete();
				break;

			case 'Extrusion':

				mesh = _geometry.getMesh( rhino.MeshType.Any );

				if ( mesh ) {

					geometry = meshToBuffers( mesh );
					mesh.delete();

				}

				break;

			case 'SubD':

				// obj.geometry is copy-on-write: subdividing it leaves the file's SubD as it was.
				_geometry.subdivide( subdivisionLevel );

				// The texture-coordinate control net gives every SubD face its own vertices with the face's normal,
				// so it shades flat: use it only when the object shows a texture, the smooth control net otherwise.
				mesh = hasTexture( _attributes )
					? rhino.Mesh.createFromSubDControlNetWithTextureCoordinates( _geometry )
					: rhino.Mesh.createFromSubDControlNet( _geometry );

				if ( mesh ) {

					geometry = meshToBuffers( mesh );
					mesh.delete();

				}

				break;

			case 'TextDot':

				geometry = { text: _geometry.text, fontFace: _geometry.fontFace, fontHeight: _geometry.fontHeight, point: xyz( _geometry.point ) };
				break;

			case 'Light':

				geometry = {
					lightStyle: { name: _geometry.lightStyle.constructor.name },
					location: xyz( _geometry.location ),
					direction: xyz( _geometry.direction ),
					width: xyz( _geometry.width ),
					length: xyz( _geometry.length ),
					diffuse: color( _geometry.diffuse ),
					intensity: _geometry.intensity,
					spotAngleRadians: _geometry.spotAngleRadians
				};

				if ( geometry.lightStyle.name === 'LightStyle_WorldLinear' ) warn( `No conversion exists for ${objectType} ${geometry.lightStyle.name}`, 'no conversion', _attributes.objectId );

				break;

			case 'InstanceReference':

				geometry = { parentIdefId: _geometry.parentIdefId, xform: { array: Array.from( rhino.Transform.toFloatArray( _geometry.xform, true ) ) } };
				break;

			default:

				warn( `Conversion not implemented for ${objectType}`, 'not implemented', _attributes.objectId );
				break;

		}

		if ( ! geometry ) {

			if ( objectType === 'Brep' || objectType === 'Extrusion' || objectType === 'SubD' ) warn( `${objectType} has no associated mesh geometry.`, 'missing mesh', _attributes.objectId );
			return;

		}

		const attributes = extractProperties( _attributes );
		attributes.id = _attributes.objectId; // 8.x name
		attributes.geometry = extractProperties( _geometry );
		attributes.drawColor = color( _attributes.drawColor( doc ) );

		if ( _attributes.groupCount > 0 ) attributes.groupIds = _attributes.getGroupList();
		if ( _attributes.userStringCount > 0 ) attributes.userStrings = _attributes.getUserStrings();
		if ( _geometry.userStringCount > 0 ) attributes.geometry.userStrings = _geometry.getUserStrings();

		if ( _attributes.decals.count > 0 ) warn( 'No conversion exists for the decals associated with this object.', 'no conversion', _attributes.objectId );

		return { geometry, attributes, objectType };

	}

	function xyz( p ) {

		return [ p.X, p.Y, p.Z ];

	}

	// Copies an object's own data: primitives, enums (as { name, value }) and plain objects (rhino3dm 9.2 value
	// types such as Point3d and Transform). Wrapped C++ objects (lists, sub-objects, SubD components, ...) are
	// skipped: following them walks linked structures without end (SubD vertex.next / previous).
	function extractProperties( object ) {

		const result = {};

		for ( const property in object ) {

			let value;

			try {

				value = object[ property ];

			} catch ( error ) {

				errorToObject( error );
				continue;

			}

			result[ property ] = plainValue( value );

		}

		return result;

	}

	function plainValue( value ) {

		if ( value === null || typeof value !== 'object' ) return typeof value === 'function' ? undefined : value;
		if ( Object.prototype.hasOwnProperty.call( value, 'constructor' ) ) return { name: value.constructor.name, value: value.value }; // enum
		if ( value.$$ ) return undefined; // wrapped C++ object
		if ( ArrayBuffer.isView( value ) ) return Array.from( value );
		if ( Array.isArray( value ) ) return value.map( plainValue );

		const result = {};
		for ( const key in value ) result[ key ] = plainValue( value[ key ] );
		return result;

	}

	// A curve as a polyline: exact for lines and polylines, otherwise sampled with points added where the
	// tangent turns by more than ~5.7 degrees.
	function curveToPositions( curve ) {

		const points = [];
		curveToPoints( curve, 100, points );

		const position = new Float32Array( points.length * 3 );

		for ( let i = 0; i < points.length; i ++ ) {

			position[ i * 3 ] = points[ i ].X;
			position[ i * 3 + 1 ] = points[ i ].Y;
			position[ i * 3 + 2 ] = points[ i ].Z;

		}

		return position;

	}

	function curveToPoints( curve, pointLimit, out ) {

		let pointCount = pointLimit;

		if ( curve instanceof rhino.LineCurve ) {

			out.push( curve.pointAtStart, curve.pointAtEnd );
			return;

		}

		if ( curve instanceof rhino.PolylineCurve ) {

			for ( let i = 0; i < curve.pointCount; i ++ ) out.push( curve.point( i ) );
			return;

		}

		if ( curve instanceof rhino.PolyCurve ) {

			for ( let i = 0; i < curve.segmentCount; i ++ ) {

				const segment = curve.segmentCurve( i );
				curveToPoints( segment, pointCount, out );
				segment.delete();

			}

			return;

		}

		if ( curve instanceof rhino.ArcCurve ) {

			pointCount = Math.max( 2, Math.floor( curve.angleDegrees / 5 ) );

		}

		if ( curve instanceof rhino.NurbsCurve && curve.degree === 1 ) {

			const [ ok, polyline ] = curve.tryGetPolyline();

			if ( ok ) {

				for ( let i = 0; i < polyline.count; i ++ ) out.push( polyline.get( i ) );
				polyline.delete();
				return;

			}

		}

		const domain = curve.domain;
		const divisions = pointCount - 1.0;
		const ts = [];

		for ( let j = 0; j < pointCount; j ++ ) {

			// The ends by index: T0 + ( T1 - T0 ) is not always T1 in floating point.
			const t = j === pointCount - 1 ? domain.T1 : domain.T0 + ( j / divisions ) * ( domain.T1 - domain.T0 );

			if ( j === 0 || j === pointCount - 1 ) {

				ts.push( t );
				continue;

			}

			const tan = curve.tangentAt( t );
			const prevTan = curve.tangentAt( ts[ ts.length - 1 ] );

			const tS = tan.X * tan.X + tan.Y * tan.Y + tan.Z * tan.Z;
			const ptS = prevTan.X * prevTan.X + prevTan.Y * prevTan.Y + prevTan.Z * prevTan.Z;
			const denominator = Math.sqrt( tS * ptS );

			let angle;

			if ( denominator === 0 ) {

				angle = Math.PI / 2;

			} else {

				const theta = ( tan.X * prevTan.X + tan.Y * prevTan.Y + tan.Z * prevTan.Z ) / denominator;
				angle = Math.acos( Math.max( - 1, Math.min( 1, theta ) ) );

			}

			if ( angle < 0.1 ) continue;

			ts.push( t );

		}

		for ( const t of ts ) out.push( curve.pointAt( t ) );

	}

}

export { Rhino3dmLoader };
