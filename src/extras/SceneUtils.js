/**
 * @author alteredq / http://alteredqualia.com/
 */

var SceneUtils = {

	loadScene : function( url, callback_sync, callback_async, callback_progress ) {

		var worker = new Worker( url );
		worker.postMessage( 0 );

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
							s = o.scale;

							object = new THREE.Mesh( geometry, materials );
							object.position.set( p[0], p[1], p[2] );
							object.rotation.set( r[0], r[1], r[2] );
							object.scale.set( s[0], s[1], s[2] );
							object.visible = o.visible;

							result.scene.addObject( object );

							result.objects[ dd ] = object;

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

					async_callback_gate();

				}

			};

			function async_callback_gate() {

				var progress = {

					total_models: total_models,
					total_textures: total_textures,
					loaded_models: total_models - counter_models,
					loaded_textures: total_textures - counter_textures

				};

				callback_progress( progress, result );

				if( counter_models == 0 && counter_textures == 0 ) {

					callback_async( result );

				}

			};

			var callback_texture = function( images ) {

				counter_textures -= 1;
				async_callback_gate();

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

			for( dl in data.lights ) {

				l = data.lights[ dl ];

				if ( l.type == "directional" ) {

					p = l.direction;

					light = new THREE.DirectionalLight();
					light.position.set( p[0], p[1], p[2] );
					light.position.normalize();

				} else if ( l.type == "point" ) {

					p = l.position;

					light = new THREE.PointLight();
					light.position.set( p[0], p[1], p[2] );

				}

				c = l.color;
				i = l.intensity || 1;
				light.color.setRGB( c[0] * i, c[1] * i, c[2] * i );

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

				}

			}

			total_models = counter_models;

			for( dg in data.geometries ) {

				g = data.geometries[ dg ];

				if ( g.type == "cube" ) {

					geometry = new Cube( g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "plane" ) {

					geometry = new Plane( g.width, g.height, g.segmentsWidth, g.segmentsHeight );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "sphere" ) {

					geometry = new Sphere( g.radius, g.segmentsWidth, g.segmentsHeight );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "cylinder" ) {

					geometry = new Cylinder( g.numSegs, g.topRad, g.botRad, g.height, g.topOffset, g.botOffset );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "torus" ) {

					geometry = new Torus( g.radius, g.tube, g.segmentsR, g.segmentsT );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "icosahedron" ) {

					geometry = new Icosahedron( g.subdivisions );
					result.geometries[ dg ] = geometry;

				} else if ( g.type == "bin_mesh" ) {

					binLoader.load( { model: g.url,
									  callback: create_callback( dg )
									} );

				} else if ( g.type == "ascii_mesh" ) {

					jsonLoader.load( { model: g.url,
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

				} else {

					counter_textures += 1;

				}

			}

			total_textures = counter_textures;

			for( dt in data.textures ) {

				tt = data.textures[ dt ];

				if ( tt.mapping != undefined && THREE[ tt.mapping ] != undefined  ) {

					tt.mapping = new THREE[ tt.mapping ]();

				}

				if( tt.url instanceof Array ) {

					texture = ImageUtils.loadTextureCube( tt.url, tt.mapping, callback_texture );

				} else {

					texture = ImageUtils.loadTexture( tt.url, tt.mapping, callback_texture );

					if ( THREE[ tt.minFilter ] != undefined )
						texture.minFilter = THREE[ tt.minFilter ];

					if ( THREE[ tt.magFilter ] != undefined )
						texture.magFilter = THREE[ tt.magFilter ];

				}

				result.textures[ dt ] = texture;

			}

			// materials

			for( dm in data.materials ) {

				m = data.materials[ dm ];

				for( pp in m.parameters ) {

					if ( pp == "envMap" || pp == "map" || pp == "lightMap" ) {

						m.parameters[ pp ] = result.textures[ m.parameters[ pp ] ];

					} else if ( pp == "shading" ) {

						m.parameters[ pp ] = ( m.parameters[ pp ] == "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

					} else if ( pp == "blending" ) {

						m.parameters[ pp ] = THREE[ m.parameters[ pp ] ] ? THREE[ m.parameters[ pp ] ] : THREE.NormalBlending;

					} else if ( pp == "combine" ) {

						m.parameters[ pp ] = ( m.parameters[ pp ] == "MixOperation" ) ? THREE.MixOperation : THREE.MultiplyOperation;

					}

				}

				material = new THREE[ m.type ]( m.parameters );
				result.materials[ dm ] = material;

			}

			// objects ( synchronous init of procedural primitives )

			handle_objects();

			// synchronous callback

			callback_sync( result );

		};

	},

	addMesh : function ( scene, geometry, scale, x, y, z, rx, ry, rz, material ) {

		var mesh = new THREE.Mesh( geometry, material );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
		mesh.position.x = x;
		mesh.position.y = y;
		mesh.position.z = z;
		mesh.rotation.x = rx;
		mesh.rotation.y = ry;
		mesh.rotation.z = rz;
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubeWebGL : function ( scene, size, textureCube ) {

		var shader = ShaderUtils.lib["cube"];
		shader.uniforms["tCube"].texture = textureCube;

		var material = new THREE.MeshShaderMaterial( { fragmentShader: shader.fragmentShader,
								   vertexShader: shader.vertexShader,
								   uniforms: shader.uniforms
								} ),

		mesh = new THREE.Mesh( new Cube( size, size, size, 1, 1, 1, null, true ), material );
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCube : function( scene, size, images ) {

		var materials = [], mesh;
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 0 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 1 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 2 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 3 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 4 ] ) } ) );
		materials.push( new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[ 5 ] ) } ) );

		mesh = new THREE.Mesh( new Cube( size, size, size, 1, 1, materials, true ), new THREE.MeshFaceMaterial() );
		scene.addObject( mesh );

		return mesh;

	},

	addPanoramaCubePlanes : function ( scene, size, images ) {


		var hsize = size / 2, plane = new Plane( size, size ), pi = Math.PI, pi2 = Math.PI / 2;

		SceneUtils.addMesh( scene, plane, 1,      0,     0,  -hsize,  0,      0,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[5] ) } ) );
		SceneUtils.addMesh( scene, plane, 1, -hsize,     0,       0,  0,    pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[0] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,  hsize,     0,       0,  0,   -pi2,  0, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[1] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,     0,  hsize,       0,  pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[2] ) } ) );
		SceneUtils.addMesh( scene, plane, 1,     0, -hsize,       0, -pi2,    0, pi, new THREE.MeshBasicMaterial( { map: new THREE.Texture( images[3] ) } ) );

	},
	
	showHierarchy : function ( root, visible ) {
		
		SceneUtils.traverseHierarchy( root, function( node ) { node.visible = visible; } );
		
	},
	
	traverseHierarchy : function ( root, callback ) {
		
		var n, i, l = root.children.length;
		
		for( i = 0; i < l; i++ ) {
			
			n = root.children[ i ];
			
			callback( n );
			
			SceneUtils.traverseHierarchy( n, callback );
			
		}
		
	}

};
