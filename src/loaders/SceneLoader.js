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

THREE.SceneLoader.prototype.parse = function ( json, callbackFinished, url ) {

	var scope = this;

	var urlBase = THREE.Loader.prototype.extractUrlBase( url );

	var dg, dm, dl, dc, df, dt,
		g, m, l, d, p, r, q, s, c, t, f, tt, pp, u,
		geometry, material, camera, fog,
		texture, images,
		light,
		counter_models, counter_textures,
		total_models, total_textures,
		result;

	var data = json;

	// async geometry loaders

	for ( var typeID in this.geometryHandlerMap ) {

		var loaderClass = this.geometryHandlerMap[ typeID ][ "loaderClass" ];
		this.geometryHandlerMap[ typeID ][ "loaderObject" ] = new loaderClass();

	}

	counter_models = 0;
	counter_textures = 0;

	result = {

		scene: new THREE.Scene(),
		geometries: {},
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

				if ( o.geometry !== undefined ) {

					geometry = result.geometries[ o.geometry ];

					// geometry already loaded

					if ( geometry ) {

						var hasNormals = false;

						// not anymore support for multiple materials
						// shouldn't really be array

						material = result.materials[ o.materials[ 0 ] ];
						hasNormals = material instanceof THREE.ShaderMaterial;

						if ( hasNormals ) {

							geometry.computeTangents();

						}

						p = o.position;
						r = o.rotation;
						q = o.quaternion;
						s = o.scale;
						m = o.matrix;

						// turn off quaternions, for the moment

						q = 0;

						if ( o.materials.length === 0 ) {

							material = new THREE.MeshFaceMaterial();

						}

						// dirty hack to handle meshes with multiple materials
						// just use face materials defined in model

						if ( o.materials.length > 1 ) {

							material = new THREE.MeshFaceMaterial();

						}

						if ( o.morph ) {

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

	function handle_mesh( geo, id ) {

		result.geometries[ id ] = geo;
		handle_objects();

	};

	function create_callback( id ) {

		return function( geo ) {

			handle_mesh( geo, id );

			counter_models -= 1;

			scope.onLoadComplete();

			async_callback_gate();

		}

	};

	function create_callback_embed( id ) {

		return function( geo ) {

			result.geometries[ id ] = geo;

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

			callbackFinished( result );

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

	// cameras

	for( dc in data.cameras ) {

		c = data.cameras[ dc ];

		if ( c.type === "perspective" ) {

			camera = new THREE.PerspectiveCamera( c.fov, c.aspect, c.near, c.far );

		} else if ( c.type === "ortho" ) {

			camera = new THREE.OrthographicCamera( c.left, c.right, c.top, c.bottom, c.near, c.far );

		}

		p = c.position;
		t = c.target;
		u = c.up;

		camera.position.set( p[0], p[1], p[2] );
		camera.target = new THREE.Vector3( t[0], t[1], t[2] );
		if ( u ) camera.up.set( u[0], u[1], u[2] );

		result.cameras[ dc ] = camera;

	}

	// lights

	var hex, intensity;

	for ( dl in data.lights ) {

		l = data.lights[ dl ];

		hex = ( l.color !== undefined ) ? l.color : 0xffffff;
		intensity = ( l.intensity !== undefined ) ? l.intensity : 1;

		if ( l.type === "directional" ) {

			p = l.direction;

			light = new THREE.DirectionalLight( hex, intensity );
			light.position.set( p[0], p[1], p[2] );
			light.position.normalize();

		} else if ( l.type === "point" ) {

			p = l.position;
			d = l.distance;

			light = new THREE.PointLight( hex, intensity, d );
			light.position.set( p[0], p[1], p[2] );

		} else if ( l.type === "ambient" ) {

			light = new THREE.AmbientLight( hex );

		}

		result.scene.add( light );

		result.lights[ dl ] = light;

	}

	// fogs

	for( df in data.fogs ) {

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

	// now come potentially asynchronous elements

	// geometries

	// count how many models will be loaded asynchronously

	for( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type in this.geometryHandlerMap ) {

			counter_models += 1;

			scope.onLoadStart();

		}

	}

	total_models = counter_models;

	for ( dg in data.geometries ) {

		g = data.geometries[ dg ];

		if ( g.type === "cube" ) {

			geometry = new THREE.CubeGeometry( g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "plane" ) {

			geometry = new THREE.PlaneGeometry( g.width, g.height, g.segmentsWidth, g.segmentsHeight );
			result.geometries[ dg ] = geometry;

		} else if ( g.type === "sphere" ) {

			geometry = new THREE.SphereGeometry( g.radius, g.segmentsWidth, g.segmentsHeight );
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
			loader.load( get_url( g.url, data.urlBaseType ), create_callback( dg ), loaderParameters );

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

	for( dt in data.textures ) {

		tt = data.textures[ dt ];

		if( tt.url instanceof Array ) {

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

	// objects ( synchronous init of procedural primitives )

	handle_objects();

	// synchronous callback

	scope.callbackSync( result );

	// just in case there are no async elements

	async_callback_gate();

};
