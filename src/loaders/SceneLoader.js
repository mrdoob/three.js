/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneLoader = function () {

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};

	this.callbackSync = function () {};
	this.callbackProgress = function () {};

	this.geometryHandlerMap = {};
	this.hierarchyHandlerMap = {};

	this.addGeometryHandler( "ascii", THREE.JSONLoader );
	this.addGeometryHandler( "binary", THREE.BinaryLoader );

};

THREE.SceneLoader.prototype.constructor = THREE.SceneLoader;

THREE.SceneLoader.prototype.load = function ( url, callbackFinished ) {

	var scope = this;

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function () {

		if ( xhr.readyState === 4 ) {

			if ( xhr.status === 200 || xhr.status === 0 ) {

				var json = JSON.parse( xhr.responseText );
				scope.parse( json, callbackFinished, url );

			} else {

				console.error( "THREE.SceneLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );

			}

		}

	};

	xhr.open( "GET", url, true );
	xhr.send( null );

};

THREE.SceneLoader.prototype.addGeometryHandler = function ( typeID, loaderClass ) {

	this.geometryHandlerMap[ typeID ] = { "loaderClass": loaderClass };

};

THREE.SceneLoader.prototype.addHierarchyHandler = function ( typeID, loaderClass ) {

	this.hierarchyHandlerMap[ typeID ] = { "loaderClass": loaderClass };

};

THREE.SceneLoader.prototype.parse = function ( json, callbackFinished, url ) {

	var scope = this;

	var urlBase = THREE.Loader.prototype.extractUrlBase( url );

	var dg, dm, dc, df, dt,
		g, m, l, d, p, r, q, s, c, t, f, tt, pp, u,
		geometry, material, camera, fog,
		texture, images,
		light, hex, intensity,
		counter_models, counter_textures,
		total_models, total_textures,
		result;

	var target_array = [];

	var data = json;

	// async geometry loaders

	for ( var typeID in this.geometryHandlerMap ) {

		var loaderClass = this.geometryHandlerMap[ typeID ][ "loaderClass" ];
		this.geometryHandlerMap[ typeID ][ "loaderObject" ] = new loaderClass();

	}

	// async hierachy loaders

	for ( var typeID in this.hierarchyHandlerMap ) {

		var loaderClass = this.hierarchyHandlerMap[ typeID ][ "loaderClass" ];
		this.hierarchyHandlerMap[ typeID ][ "loaderObject" ] = new loaderClass();

	}

	counter_models = 0;
	counter_textures = 0;

	result = {

		scene: new THREE.Scene(),
		geometries: {},
		face_materials: {},
		materials: {},
		textures: {},
		objects: {},
		cameras: {},
		lights: {},
		fogs: {},
		empties: {}

	};

	if ( data.transform ) {

		var position = data.transform.position,
			rotation = data.transform.rotation,
			scale = data.transform.scale;

		if ( position )
			result.scene.position.set( position[ 0 ], position[ 1 ], position [ 2 ] );

		if ( rotation )
			result.scene.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation [ 2 ] );

		if ( scale )
			result.scene.scale.set( scale[ 0 ], scale[ 1 ], scale [ 2 ] );

		if ( position || rotation || scale ) {

			result.scene.updateMatrix();
			result.scene.updateMatrixWorld();

		}

	}

	function get_url( source_url, url_type ) {

		if ( url_type == "relativeToHTML" ) {

			return source_url;

		} else {

			return urlBase + "/" + source_url;

		}

	};

	// toplevel loader function, delegates to handle_children

	function handle_objects() {

		handle_children( result.scene, data.objects );

	}

	// handle all the children from the loaded json and attach them to given parent

	function handle_children( parent, children ) {

		for ( var dd in children ) {

			// check by id if child has already been handled,
			// if not, create new object

			if ( result.objects[ dd ] === undefined ) {

				var o = children[ dd ];

				var object = null;

				// meshes

				if ( o.type && ( o.type in scope.hierarchyHandlerMap ) && o.loading === undefined ) {

					var loaderParameters = {};

					for ( var parType in g ) {

						if ( parType !== "type" && parType !== "url" ) {

							loaderParameters[ parType ] = g[ parType ];

						}

					}

					material = result.materials[ o.material ];

					o.loading = true;

					var loader = scope.hierarchyHandlerMap[ o.type ][ "loaderObject" ];

					// OBJLoader

					if ( loader.addEventListener ) {

						loader.addEventListener( 'load', create_callback_hierachy( dd, parent, material, o ) );
						loader.load( get_url( o.url, data.urlBaseType ) );

					} else {

						// ColladaLoader

						if ( loader.options ) {

							loader.load( get_url( o.url, data.urlBaseType ), create_callback_hierachy( dd, parent, material, o ) );

						// UTF8Loader

						} else {

							loader.load( get_url( o.url, data.urlBaseType ), create_callback_hierachy( dd, parent, material, o ), loaderParameters );

						}

					}

				} else if ( o.geometry !== undefined ) {

					geometry = result.geometries[ o.geometry ];

					// geometry already loaded

					if ( geometry ) {

						var needsTangents = false;

						material = result.materials[ o.material ];
						needsTangents = material instanceof THREE.ShaderMaterial;

						p = o.position;
						r = o.rotation;
						q = o.quaternion;
						s = o.scale;
						m = o.matrix;

						// turn off quaternions, for the moment

						q = 0;

						// use materials from the model file
						// if there is no material specified in the object

						if ( ! o.material ) {

							material = new THREE.MeshFaceMaterial( result.face_materials[ o.geometry ] );

						}

						// use materials from the model file
						// if there is just empty face material
						// (must create new material as each model has its own face material)

						if ( ( material instanceof THREE.MeshFaceMaterial ) && material.materials.length === 0 ) {

							material = new THREE.MeshFaceMaterial( result.face_materials[ o.geometry ] );

						}

						if ( material instanceof THREE.MeshFaceMaterial ) {

							for ( var i = 0; i < material.materials.length; i ++ ) {

								needsTangents = needsTangents || ( material.materials[ i ] instanceof THREE.ShaderMaterial );

							}

						}

						if ( needsTangents ) {

							geometry.computeTangents();

						}

						if ( o.skin ) {

							object = new THREE.SkinnedMesh( geometry, material );

						} else if ( o.morph ) {

							object = new THREE.MorphAnimMesh( geometry, material );

							if ( o.duration !== undefined ) {

								object.duration = o.duration;

							}

							if ( o.time !== undefined ) {

								object.time = o.time;

							}

							if ( o.mirroredLoop !== undefined ) {

								object.mirroredLoop = o.mirroredLoop;

							}

							if ( material.morphNormals ) {

								geometry.computeMorphNormals();

							}

						} else {

							object = new THREE.Mesh( geometry, material );

						}

						object.name = dd;

						if ( m ) {

							object.matrixAutoUpdate = false;
							object.matrix.set(
								m[0], m[1], m[2], m[3],
								m[4], m[5], m[6], m[7],
								m[8], m[9], m[10], m[11],
								m[12], m[13], m[14], m[15]
							);

						} else {

							object.position.set( p[0], p[1], p[2] );

							if ( q ) {

								object.quaternion.set( q[0], q[1], q[2], q[3] );
								object.useQuaternion = true;

							} else {

								object.rotation.set( r[0], r[1], r[2] );

							}

							object.scale.set( s[0], s[1], s[2] );

						}

						object.visible = o.visible;
						object.castShadow = o.castShadow;
						object.receiveShadow = o.receiveShadow;

						parent.add( object );

						result.objects[ dd ] = object;

					}

				// lights

				} else if ( o.type === "DirectionalLight" || o.type === "PointLight" || o.type === "AmbientLight" ) {

					hex = ( o.color !== undefined ) ? o.color : 0xffffff;
					intensity = ( o.intensity !== undefined ) ? o.intensity : 1;

					if ( o.type === "DirectionalLight" ) {

						p = o.direction;

						light = new THREE.DirectionalLight( hex, intensity );
						light.position.set( p[0], p[1], p[2] );

						if ( o.target ) {

							target_array.push( { "object": light, "targetName" : o.target } );

							// kill existing default target
							// otherwise it gets added to scene when parent gets added

							light.target = null;

						}

					} else if ( o.type === "PointLight" ) {

						p = o.position;
						d = o.distance;

						light = new THREE.PointLight( hex, intensity, d );
						light.position.set( p[0], p[1], p[2] );

					} else if ( o.type === "AmbientLight" ) {

						light = new THREE.AmbientLight( hex );

					}

					parent.add( light );

					light.name = dd;
					result.lights[ dd ] = light;
					result.objects[ dd ] = light;

				// cameras

				} else if ( o.type === "PerspectiveCamera" || o.type === "OrthographicCamera" ) {

					if ( o.type === "PerspectiveCamera" ) {

						camera = new THREE.PerspectiveCamera( o.fov, o.aspect, o.near, o.far );

					} else if ( o.type === "OrthographicCamera" ) {

						camera = new THREE.OrthographicCamera( c.left, c.right, c.top, c.bottom, c.near, c.far );

					}

					p = o.position;
					camera.position.set( p[0], p[1], p[2] );
					parent.add( camera );

					camera.name = dd;
					result.cameras[ dd ] = camera;
					result.objects[ dd ] = camera;

				// pure Object3D

				} else {

					p = o.position;
					r = o.rotation;
					q = o.quaternion;
					s = o.scale;

					// turn off quaternions, for the moment

					q = 0;

					object = new THREE.Object3D();
					object.name = dd;
					object.position.set( p[0], p[1], p[2] );

					if ( q ) {

						object.quaternion.set( q[0], q[1], q[2], q[3] );
						object.useQuaternion = true;

					} else {

						object.rotation.set( r[0], r[1], r[2] );

					}

					object.scale.set( s[0], s[1], s[2] );
					object.visible = ( o.visible !== undefined ) ? o.visible : false;

					parent.add( object );

					result.objects[ dd ] = object;
					result.empties[ dd ] = object;

				}

				if ( object ) {

					if ( o.properties !== undefined )  {

						for ( var key in o.properties ) {

							var value = o.properties[ key ];
							object.properties[ key ] = value;

						}

					}

					if ( o.children !== undefined ) {

						handle_children( object, o.children );

					}

				}

			}

		}

	};

	function handle_mesh( geo, mat, id ) {

		result.geometries[ id ] = geo;
		result.face_materials[ id ] = mat;
		handle_objects();

	};

	function handle_hierarchy( node, id, parent, material, o ) {

		var p = o.position;
		var r = o.rotation;
		var q = o.quaternion;
		var s = o.scale;

		node.position.set( p[0], p[1], p[2] );

		if ( q ) {

			node.quaternion.set( q[0], q[1], q[2], q[3] );
			node.useQuaternion = true;

		} else {

			node.rotation.set( r[0], r[1], r[2] );

		}

		node.scale.set( s[0], s[1], s[2] );

		if ( material ) {

			node.traverse( function ( child )  {

				child.material = material;

			} );

		}

		parent.add( node );

		result.objects[ id ] = node;
		handle_objects();

	};

	function create_callback_geometry( id ) {

		return function( geo, mat ) {

			handle_mesh( geo, mat, id );

			counter_models -= 1;

			scope.onLoadComplete();

			async_callback_gate();

		}

	};

	function create_callback_hierachy( id, parent, material, obj ) {

		return function( event ) {

			var result;

			// loaders which use EventTarget

			if ( event.content ) {

				result = event.content;

			// ColladaLoader

			} else if ( event.dae ) {

				result = event.scene;


			// UTF8Loader

			} else {

				result = event;

			}

			handle_hierarchy( result, id, parent, material, obj );

			counter_models -= 1;

			scope.onLoadComplete();

			async_callback_gate();

		}

	};

	function create_callback_embed( id ) {

		return function( geo, mat ) {

			result.geometries[ id ] = geo;
			result.face_materials[ id ] = mat;

		}

	};

	function async_callback_gate() {

		var progress = {

			totalModels : total_models,
			totalTextures : total_textures,
			loadedModels : total_models - counter_models,
			loadedTextures : total_textures - counter_textures

		};

		scope.callbackProgress( progress, result );

		scope.onLoadProgress();

		if ( counter_models === 0 && counter_textures === 0 ) {

			finalize();
			callbackFinished( result );

		}

	};

	function finalize() {

		// take care of targets which could be asynchronously loaded objects

		for ( var i = 0; i < target_array.length; i ++ ) {

			var ta = target_array[ i ];

			var target = result.objects[ ta.targetName ];

			if ( target ) {

				ta.object.target = target;

			} else {

				// if there was error and target of specified name doesn't exist in the scene file
				// create instead dummy target
				// (target must be added to scene explicitly as parent is already added)

				ta.object.target = new THREE.Object3D();
				result.scene.add( ta.object.target );

			}

			ta.object.target.properties.targetInverse = ta.object;

		}

	};

	var callbackTexture = function ( count ) {

		counter_textures -= count;
		async_callback_gate();

		scope.onLoadComplete();

	};

	// must use this instead of just directly calling callbackTexture
	// because of closure in the calling context loop

	var generateTextureCallback = function ( count ) {

		return function() {

			callbackTexture( count );

		};

	};

	// first go synchronous elements

	// fogs

	for ( df in data.fogs ) {

		f = data.fogs[ df ];

		if ( f.type === "linear" ) {

			fog = new THREE.Fog( 0x000000, f.near, f.far );

		} else if ( f.type === "exp2" ) {

			fog = new THREE.FogExp2( 0x000000, f.density );

		}

		c = f.color;
		fog.color.setRGB( c[0], c[1], c[2] );

		result.fogs[ df ] = fog;

	}

	// now come potentially asynchronous elements

	// geometries

	// count how many geometries will be loaded asynchronously

	for ( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type in this.geometryHandlerMap ) {

			counter_models += 1;

			scope.onLoadStart();

		}

	}

	// count how many hierarchies will be loaded asynchronously

	for ( var dd in data.objects ) {

		var o = data.objects[ dd ];

		if ( o.type && ( o.type in this.hierarchyHandlerMap ) ) {

			counter_models += 1;

			scope.onLoadStart();

		}

	}

	total_models = counter_models;

	for ( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type === "cube" ) {

			geometry = new THREE.CubeGeometry( g.width, g.height, g.depth, g.widthSegments, g.heightSegments, g.depthSegments );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "plane" ) {

			geometry = new THREE.PlaneGeometry( g.width, g.height, g.widthSegments, g.heightSegments );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "sphere" ) {

			geometry = new THREE.SphereGeometry( g.radius, g.widthSegments, g.heightSegments );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "cylinder" ) {

			geometry = new THREE.CylinderGeometry( g.topRad, g.botRad, g.height, g.radSegs, g.heightSegs );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "torus" ) {

			geometry = new THREE.TorusGeometry( g.radius, g.tube, g.segmentsR, g.segmentsT );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "icosahedron" ) {

			geometry = new THREE.IcosahedronGeometry( g.radius, g.subdivisions );
			result.geometries[ dg ] = geometry;

		} else if ( g.type in this.geometryHandlerMap ) {

			var loaderParameters = {};
			for ( var parType in g ) {

				if ( parType !== "type" && parType !== "url" ) {

					loaderParameters[ parType ] = g[ parType ];

				}

			}

			var loader = this.geometryHandlerMap[ g.type ][ "loaderObject" ];
			loader.load( get_url( g.url, data.urlBaseType ), create_callback_geometry( dg ), loaderParameters );

		} else if ( g.type === "embedded" ) {

			var modelJson = data.embeds[ g.id ],
				texture_path = "";

			// pass metadata along to jsonLoader so it knows the format version

			modelJson.metadata = data.metadata;

			if ( modelJson ) {

				var jsonLoader = this.geometryHandlerMap[ "ascii" ][ "loaderObject" ];
				jsonLoader.createModel( modelJson, create_callback_embed( dg ), texture_path );

			}

		}

	}

	// textures

	// count how many textures will be loaded asynchronously

	for ( dt in data.textures ) {

		tt = data.textures[ dt ];

		if ( tt.url instanceof Array ) {

			counter_textures += tt.url.length;

			for( var n = 0; n < tt.url.length; n ++ ) {

				scope.onLoadStart();

			}

		} else {

			counter_textures += 1;

			scope.onLoadStart();

		}

	}

	total_textures = counter_textures;

	for ( dt in data.textures ) {

		tt = data.textures[ dt ];

		if ( tt.mapping !== undefined && THREE[ tt.mapping ] !== undefined  ) {

			tt.mapping = new THREE[ tt.mapping ]();

		}

		if ( tt.url instanceof Array ) {

			var count = tt.url.length;
			var url_array = [];

			for( var i = 0; i < count; i ++ ) {

				url_array[ i ] = get_url( tt.url[ i ], data.urlBaseType );

			}

			var isCompressed = url_array[ 0 ].endsWith( ".dds" );

			if ( isCompressed ) {

				texture = THREE.ImageUtils.loadCompressedTextureCube( url_array, tt.mapping, generateTextureCallback( count ) );

			} else {

				texture = THREE.ImageUtils.loadTextureCube( url_array, tt.mapping, generateTextureCallback( count ) );

			}

		} else {

			var isCompressed = tt.url.toLowerCase().endsWith( ".dds" );
			var fullUrl = get_url( tt.url, data.urlBaseType );
			var textureCallback = generateTextureCallback( 1 );

			if ( isCompressed ) {

				texture = THREE.ImageUtils.loadCompressedTexture( fullUrl, tt.mapping, textureCallback );

			} else {

				texture = THREE.ImageUtils.loadTexture( fullUrl, tt.mapping, textureCallback );

			}

			if ( THREE[ tt.minFilter ] !== undefined )
				texture.minFilter = THREE[ tt.minFilter ];

			if ( THREE[ tt.magFilter ] !== undefined )
				texture.magFilter = THREE[ tt.magFilter ];

			if ( tt.anisotropy ) texture.anisotropy = tt.anisotropy;

			if ( tt.repeat ) {

				texture.repeat.set( tt.repeat[ 0 ], tt.repeat[ 1 ] );

				if ( tt.repeat[ 0 ] !== 1 ) texture.wrapS = THREE.RepeatWrapping;
				if ( tt.repeat[ 1 ] !== 1 ) texture.wrapT = THREE.RepeatWrapping;

			}

			if ( tt.offset ) {

				texture.offset.set( tt.offset[ 0 ], tt.offset[ 1 ] );

			}

			// handle wrap after repeat so that default repeat can be overriden

			if ( tt.wrap ) {

				var wrapMap = {
				"repeat" 	: THREE.RepeatWrapping,
				"mirror"	: THREE.MirroredRepeatWrapping
				}

				if ( wrapMap[ tt.wrap[ 0 ] ] !== undefined ) texture.wrapS = wrapMap[ tt.wrap[ 0 ] ];
				if ( wrapMap[ tt.wrap[ 1 ] ] !== undefined ) texture.wrapT = wrapMap[ tt.wrap[ 1 ] ];

			}

		}

		result.textures[ dt ] = texture;

	}

	// materials

	for ( dm in data.materials ) {

		m = data.materials[ dm ];

		for ( pp in m.parameters ) {

			if ( pp === "envMap" || pp === "map" || pp === "lightMap" || pp === "bumpMap" ) {

				m.parameters[ pp ] = result.textures[ m.parameters[ pp ] ];

			} else if ( pp === "shading" ) {

				m.parameters[ pp ] = ( m.parameters[ pp ] === "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

			} else if ( pp === "side" ) {

				if (  m.parameters[ pp ] == "double" ) {

					m.parameters[ pp ] = THREE.DoubleSide;

				} else if ( m.parameters[ pp ] == "back" ) {

					m.parameters[ pp ] = THREE.BackSide;

				} else {

					m.parameters[ pp ] = THREE.FrontSide;

				}

			} else if ( pp === "blending" ) {

				m.parameters[ pp ] = m.parameters[ pp ] in THREE ? THREE[ m.parameters[ pp ] ] : THREE.NormalBlending;

			} else if ( pp === "combine" ) {

				m.parameters[ pp ] = ( m.parameters[ pp ] == "MixOperation" ) ? THREE.MixOperation : THREE.MultiplyOperation;

			} else if ( pp === "vertexColors" ) {

				if ( m.parameters[ pp ] == "face" ) {

					m.parameters[ pp ] = THREE.FaceColors;

				// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

				} else if ( m.parameters[ pp ] )   {

					m.parameters[ pp ] = THREE.VertexColors;

				}

			} else if ( pp === "wrapRGB" ) {

				var v3 = m.parameters[ pp ];
				m.parameters[ pp ] = new THREE.Vector3( v3[ 0 ], v3[ 1 ], v3[ 2 ] );

			}

		}

		if ( m.parameters.opacity !== undefined && m.parameters.opacity < 1.0 ) {

			m.parameters.transparent = true;

		}

		if ( m.parameters.normalMap ) {

			var shader = THREE.ShaderUtils.lib[ "normal" ];
			var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			var diffuse = m.parameters.color;
			var specular = m.parameters.specular;
			var ambient = m.parameters.ambient;
			var shininess = m.parameters.shininess;

			uniforms[ "tNormal" ].value = result.textures[ m.parameters.normalMap ];

			if ( m.parameters.normalScale ) {

				uniforms[ "uNormalScale" ].value.set( m.parameters.normalScale[ 0 ], m.parameters.normalScale[ 1 ] );

			}

			if ( m.parameters.map ) {

				uniforms[ "tDiffuse" ].value = m.parameters.map;
				uniforms[ "enableDiffuse" ].value = true;

			}

			if ( m.parameters.envMap ) {

				uniforms[ "tCube" ].value = m.parameters.envMap;
				uniforms[ "enableReflection" ].value = true;
				uniforms[ "uReflectivity" ].value = m.parameters.reflectivity;

			}

			if ( m.parameters.lightMap ) {

				uniforms[ "tAO" ].value = m.parameters.lightMap;
				uniforms[ "enableAO" ].value = true;

			}

			if ( m.parameters.specularMap ) {

				uniforms[ "tSpecular" ].value = result.textures[ m.parameters.specularMap ];
				uniforms[ "enableSpecular" ].value = true;

			}

			if ( m.parameters.displacementMap ) {

				uniforms[ "tDisplacement" ].value = result.textures[ m.parameters.displacementMap ];
				uniforms[ "enableDisplacement" ].value = true;

				uniforms[ "uDisplacementBias" ].value = m.parameters.displacementBias;
				uniforms[ "uDisplacementScale" ].value = m.parameters.displacementScale;

			}

			uniforms[ "uDiffuseColor" ].value.setHex( diffuse );
			uniforms[ "uSpecularColor" ].value.setHex( specular );
			uniforms[ "uAmbientColor" ].value.setHex( ambient );

			uniforms[ "uShininess" ].value = shininess;

			if ( m.parameters.opacity ) {

				uniforms[ "uOpacity" ].value = m.parameters.opacity;

			}

			var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };

			material = new THREE.ShaderMaterial( parameters );

		} else {

			material = new THREE[ m.type ]( m.parameters );

		}

		result.materials[ dm ] = material;

	}

	// second pass through all materials to initialize MeshFaceMaterials
	// that could be referring to other materials out of order

	for ( dm in data.materials ) {

		m = data.materials[ dm ];

		if ( m.parameters.materials ) {

			var materialArray = [];

			for ( var i = 0; i < m.parameters.materials.length; i ++ ) {

				var label = m.parameters.materials[ i ];
				materialArray.push( result.materials[ label ] );

			}

			result.materials[ dm ].materials = materialArray;

		}

	}

	// objects ( synchronous init of procedural primitives )

	handle_objects();

	// defaults

	if ( result.cameras && data.defaults.camera ) {

		result.currentCamera = result.cameras[ data.defaults.camera ];

	}

	if ( result.fogs && data.defaults.fog ) {

		result.scene.fog = result.fogs[ data.defaults.fog ];

	}

	c = data.defaults.bgcolor;
	result.bgColor = new THREE.Color();
	result.bgColor.setRGB( c[0], c[1], c[2] );

	result.bgColorAlpha = data.defaults.bgalpha;

	// synchronous callback

	scope.callbackSync( result );

	// just in case there are no async elements

	async_callback_gate();

};
