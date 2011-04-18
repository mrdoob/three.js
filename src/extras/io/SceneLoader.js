/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneLoader = function () {

	this.onLoadStart = function () {};
	this.onLoadProgress = function() {};
	this.onLoadComplete = function () {};
		
	this.callbackSync = function () {};
	this.callbackProgress = function () {};

};

THREE.SceneLoader.prototype = {

	load : function ( url, callbackFinished ) {

		var scope = this;

		var worker = new Worker( url );
		worker.postMessage( 0 );

		var urlBase = THREE.Loader.prototype.extractUrlbase( url );

		worker.onmessage = function( event ) {

			var dg, dm, dd, dl, dc, df, dt,
				g, o, m, l, p, c, t, f, tt, pp,
				geometry, material, camera, fog,
				texture, images,
				materials,
				data, binLoader, jsonLoader,
				counter_models, counter_textures,
				total_models, total_textures,
				result;

			data = event.data;

			binLoader = new THREE.BinaryLoader();
			jsonLoader = new THREE.JSONLoader();

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
				fogs: {}

			};

			// find out if there are some colliders
			
			var hasColliders = false;
			
			for( dd in data.objects ) {
				
				o = data.objects[ dd ];

				if ( o.meshCollider )  {
					
					hasColliders = true;
					break;

				}
				
			}
			
			if ( hasColliders ) {
			
				result.scene.collisions = new THREE.CollisionSystem();

			}

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

				if ( position || rotation || scale )
					result.scene.updateMatrix();

			}

			function get_url( source_url, url_type ) {

				if ( url_type == "relativeToHTML" ) {

					return source_url;

				} else {

					return urlBase + "/" + source_url;

				}

			};

			function handle_objects() {

				for( dd in data.objects ) {

					if ( !result.objects[ dd ] ) {

						o = data.objects[ dd ];

						geometry = result.geometries[ o.geometry ];

						if ( geometry ) {

							materials = [];
							for( i = 0; i < o.materials.length; i++ ) {

								materials[ i ] = result.materials[ o.materials[i] ];

							}

							p = o.position;
							r = o.rotation;
							q = o.quaternion;
							s = o.scale;

							// turn off quaternions, for the moment

							q = 0;

							if ( materials.length == 0 ) {

								materials[ 0 ] = new THREE.MeshFaceMaterial();

							}

							// dirty hack to handle meshes with multiple materials
							// just use face materials defined in model

							if ( materials.length > 1 ) {

								materials = [ new THREE.MeshFaceMaterial() ];

							}

							object = new THREE.Mesh( geometry, materials );
							object.name = dd;
							object.position.set( p[0], p[1], p[2] );

							if ( q ) {

								object.quaternion.set( q[0], q[1], q[2], q[3] );
								object.useQuaternion = true;

							} else {

								object.rotation.set( r[0], r[1], r[2] );

							}

							object.scale.set( s[0], s[1], s[2] );
							object.visible = o.visible;

							result.scene.addObject( object );

							result.objects[ dd ] = object;

							if ( o.meshCollider ) {

								var meshCollider = THREE.CollisionUtils.MeshColliderWBox( object );
								result.scene.collisions.colliders.push( meshCollider );

							}

							if ( o.castsShadow ) {
								
								//object.visible = true;
								//object.materials = [ new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ];

								var shadow = new THREE.ShadowVolume( geometry )
								result.scene.addChild( shadow );
								
								shadow.position = object.position;
								shadow.rotation = object.rotation;
								shadow.scale = object.scale;

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

			function async_callback_gate() {

				var progress = {

					totalModels		: total_models,
					totalTextures	: total_textures,
					loadedModels	: total_models - counter_models,
					loadedTextures	: total_textures - counter_textures

				};

				scope.callbackProgress( progress, result );
				
				scope.onLoadProgress();

				if( counter_models == 0 && counter_textures == 0 ) {

					callbackFinished( result );

				}

			};

			var callbackTexture = function( images ) {

				counter_textures -= 1;
				async_callback_gate();

				scope.onLoadComplete();

			};

			// first go synchronous elements

			// cameras

			for( dc in data.cameras ) {

				c = data.cameras[ dc ];

				if ( c.type == "perspective" ) {

					camera = new THREE.Camera( c.fov, c.aspect, c.near, c.far );

				} else if ( c.type == "ortho" ) {

					camera = new THREE.Camera();
					camera.projectionMatrix = THREE.Matrix4.makeOrtho( c.left, c.right, c.top, c.bottom, c.near, c.far );

				}

				p = c.position;
				t = c.target;
				camera.position.set( p[0], p[1], p[2] );
				camera.target.position.set( t[0], t[1], t[2] );

				result.cameras[ dc ] = camera;

			}

			// lights

			var hex, intensity;

			for ( dl in data.lights ) {

				l = data.lights[ dl ];

				hex = ( l.color !== undefined ) ? l.color : 0xffffff;
				intensity = ( l.intensity !== undefined ) ? l.intensity : 1;

				if ( l.type == "directional" ) {

					p = l.direction;

					light = new THREE.DirectionalLight( hex, intensity );
					light.position.set( p[0], p[1], p[2] );
					light.position.normalize();

				} else if ( l.type == "point" ) {

					p = l.position;

					light = new THREE.PointLight( hex, intensity );
					light.position.set( p[0], p[1], p[2] );

				}

				result.scene.addLight( light );

				result.lights[ dl ] = light;

			}

			// fogs

			for( df in data.fogs ) {

				f = data.fogs[ df ];

				if ( f.type == "linear" ) {

					fog = new THREE.Fog( 0x000000, f.near, f.far );

				} else if ( f.type == "exp2" ) {

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

				if ( g.type == "bin_mesh" || g.type == "ascii_mesh" ) {

					counter_models += 1;
					
					scope.onLoadStart();

				}

			}

			total_models = counter_models;

			for ( dg in data.geometries ) {

				g = data.geometries[ dg ];

				if ( g.type == "cube" ) {

					geometry = new THREE.Cube( g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "plane" ) {

					geometry = new THREE.Plane( g.width, g.height, g.segmentsWidth, g.segmentsHeight );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "sphere" ) {

					geometry = new THREE.Sphere( g.radius, g.segmentsWidth, g.segmentsHeight );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "cylinder" ) {

					geometry = new THREE.Cylinder( g.numSegs, g.topRad, g.botRad, g.height, g.topOffset, g.botOffset );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "torus" ) {

					geometry = new THREE.Torus( g.radius, g.tube, g.segmentsR, g.segmentsT );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "icosahedron" ) {

					geometry = new THREE.Icosahedron( g.subdivisions );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "bin_mesh" ) {

					binLoader.load( { model: get_url( g.url, data.urlBaseType ),
									  callback: create_callback( dg )
									} );

				} else if ( g.type == "ascii_mesh" ) {

					jsonLoader.load( { model: get_url( g.url, data.urlBaseType ),
									   callback: create_callback( dg )
									} );

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

			for( dt in data.textures ) {

				tt = data.textures[ dt ];

				if ( tt.mapping != undefined && THREE[ tt.mapping ] != undefined  ) {

					tt.mapping = new THREE[ tt.mapping ]();

				}

				if( tt.url instanceof Array ) {

					var url_array = [];

					for( var i = 0; i < tt.url.length; i ++ ) {

						url_array[ i ] = get_url( tt.url[ i ], data.urlBaseType );

					}

					texture = THREE.ImageUtils.loadTextureCube( url_array, tt.mapping, callbackTexture );

				} else {

					texture = THREE.ImageUtils.loadTexture( get_url( tt.url, data.urlBaseType ), tt.mapping, callbackTexture );

					if ( THREE[ tt.minFilter ] != undefined )
						texture.minFilter = THREE[ tt.minFilter ];

					if ( THREE[ tt.magFilter ] != undefined )
						texture.magFilter = THREE[ tt.magFilter ];

				}

				result.textures[ dt ] = texture;

			}

			// materials

			for ( dm in data.materials ) {

				m = data.materials[ dm ];

				for ( pp in m.parameters ) {

					if ( pp == "envMap" || pp == "map" || pp == "lightMap" ) {

						m.parameters[ pp ] = result.textures[ m.parameters[ pp ] ];

					} else if ( pp == "shading" ) {

						m.parameters[ pp ] = ( m.parameters[ pp ] == "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

					} else if ( pp == "blending" ) {

						m.parameters[ pp ] = THREE[ m.parameters[ pp ] ] ? THREE[ m.parameters[ pp ] ] : THREE.NormalBlending;

					} else if ( pp == "combine" ) {

						m.parameters[ pp ] = ( m.parameters[ pp ] == "MixOperation" ) ? THREE.MixOperation : THREE.MultiplyOperation;

					} else if ( pp == "vertexColors" ) {

						if ( m.parameters[ pp ] == "face" ) {

							m.parameters[ pp ] = THREE.FaceColors;

						// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

						} else if ( m.parameters[ pp ] )   {

							m.parameters[ pp ] = THREE.VertexColors;

						}

					}

				}

				if ( m.parameters.opacity !== undefined && m.parameters.opacity < 1.0 ) {
					
					m.parameters.transparent = true;

				}
				
				material = new THREE[ m.type ]( m.parameters );
				result.materials[ dm ] = material;

			}

			// objects ( synchronous init of procedural primitives )

			handle_objects();

			// synchronous callback

			scope.callbackSync( result );

		};

	}

};
