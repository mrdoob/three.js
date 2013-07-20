/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BabylonLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.BabylonLoader.prototype = {

	constructor: THREE.ObjectLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		} );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var materials = this.parseMaterials( json.materials );
		var scene = this.parseObjects( json, materials );

		return scene;

	},

	parseMaterials: function ( json ) {

		var materials = {};

		for ( var i = 0, l = json.length; i < l; i ++ ) {

			var data = json[ i ];

			var material = new THREE.MeshPhongMaterial();
			material.name = data.name;
			material.ambient.fromArray( data.ambient );
			material.color.fromArray( data.diffuse );
			material.emissive.fromArray( data.emissive );
			material.specular.fromArray( data.specular );
			material.shininess = data.specularPower;
			material.opacity = data.alpha;

			materials[ data.id ] = material;

		}

		return materials;

	},

	parseObjects: function ( json, materials ) {

		var objects = {};
		var scene = new THREE.Scene();

		var lights = json.lights;

		for ( var i = 0, l = lights.length; i < l; i ++ ) {

			var data = lights[ i ];

			var light;

			switch ( data.type ) {

				case 0:
					light = new THREE.PointLight();
					break;

				case 1:
					light = new THREE.DirectionalLight();
					break;

				case 2:
					light = new BABYLON.SpotLight();
					break;

				case 3:
					light = new BABYLON.HemisphericLight();
					break;
			}

			light.name = data.name;
			light.position.set( data.data[ 0 ], data.data[ 1 ], - data.data[ 2 ] );
			light.color.fromArray( data.diffuse );
			if ( data.intensity ) light.intensity = data.intensity;

			objects[ data.id ] = light;

			scene.add( light );

		}

		var meshes = json.meshes;

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var data = meshes[ i ];

			var object;

			if ( data.indices !== null  ) {

				var geometry = new THREE.BufferGeometry();

				geometry.attributes.index = {
					itemSize: 1,
					array: new Uint16Array( data.indices )
				};

				var strideSize = 0;
				var positions = [];
				var normals = [];

				switch ( data.uvCount ) {

					case 0:
						strideSize = 6; // [3, 3]
						break;
					case 1:
						strideSize = 8; // [3, 3, 2]
						break;
					case 2:
						strideSize = 10; // [3, 3, 2, 2]
						break;

				}

				var vertices = data.vertices;

				for ( var j = 0, jl = vertices.length; j < jl; j += strideSize ) {

					positions.push(
						vertices[ j ],
						vertices[ j + 1 ],
						- vertices[ j + 2 ]
					);

					normals.push( 
						vertices[ j + 3 ],
						vertices[ j + 4 ],
						- vertices[ j + 5 ]
					);
				}

				geometry.attributes.position = {
					itemSize: 3,
					array: new Float32Array( positions )
				};

				geometry.attributes.normal = {
					itemSize: 3,
					array: new Float32Array( normals )
				};

				var subMeshes = data.subMeshes;

				if ( subMeshes !== null ) {

					for ( var j = 0, jl = subMeshes.length; j < jl; j ++ ) {

						var subMesh = subMeshes[ j ];

						geometry.offsets.push( {
							start: subMesh.indexStart,
							index: 0,
							count: subMesh.indexCount
						} );

					}

				} else {

					geometry.offsets.push( {
						start: 0,
						index: 0,
						count: data.indices.length
					} );

				}

				var material = materials[ data.materialId ];

				object = new THREE.Mesh( geometry, material );

			} else {

				object = new THREE.Object3D();

			}

			object.name = data.name;
			object.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
			object.rotation.fromArray( data.rotation );
			object.scale.fromArray( data.scaling );

			if ( data.parentId !== undefined && data.parentId !== '' ) {

				objects[ data.parentId ].add( object );

			} else {

				scene.add( object );

			}

			objects[ data.id ] = object;

		}

		return scene;

	}

};
