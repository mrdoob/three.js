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

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var materials = this.parseMaterials( json );
		var scene = this.parseObjects( json, materials );

		return scene;

	},

	parseMaterials: function ( json ) {

		var materials = {};

		for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

			var data = json.materials[ i ];

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

		if ( json.multiMaterials ) {

			for ( var i = 0, l = json.multiMaterials.length; i < l; i ++ ) {

				var data = json.multiMaterials[ i ];

				console.warn( 'THREE.BabylonLoader: Multi materials not yet supported.' );

				materials[ data.id ] = new THREE.MeshPhongMaterial();

			}

		}

		return materials;

	},

	parseGeometry: function ( json ) {

		var geometry = new THREE.BufferGeometry();

		// indices

		var indices = new Uint16Array( json.indices );

		geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );

		// positions

		var positions = new Float32Array( json.positions );

		for ( var j = 2, jl = positions.length; j < jl; j += 3 ) {

			positions[ j ] = - positions[ j ];

		}

		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		// normals

		if ( json.normals ) {

			var normals = new Float32Array( json.normals );

			for ( var j = 2, jl = normals.length; j < jl; j += 3 ) {

				normals[ j ] = - normals[ j ];

			}

			geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

		}

		// uvs

		if ( json.uvs ) {

			var uvs = new Float32Array( json.uvs );

			geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

		}

		// offsets

		var subMeshes = json.subMeshes;

		if ( subMeshes ) {

			for ( var j = 0, jl = subMeshes.length; j < jl; j ++ ) {

				var subMesh = subMeshes[ j ];

				geometry.addDrawCall( subMesh.indexStart, subMesh.indexCount );

			}

		} else {

			geometry.addDrawCall( 0, json.indices.length );

		}

		return geometry;

	},

	parseObjects: function ( json, materials ) {

		var objects = {};
		var scene = new THREE.Scene();

		var cameras = json.cameras;

		for ( var i = 0, l = cameras.length; i < l; i ++ ) {

			var data = cameras[ i ];

			var camera = new THREE.PerspectiveCamera( ( data.fov / Math.PI ) * 180, 1.33, data.minZ, data.maxZ );

			camera.name = data.name;
			camera.position.fromArray( data.position );
			if ( data.rotation ) camera.rotation.fromArray( data.rotation );

			objects[ data.id ] = camera;

		}

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
					light = new THREE.SpotLight();
					break;

				case 3:
					light = new THREE.HemisphereLight();
					break;
			}

			light.name = data.name;
			light.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
			light.color.fromArray( data.diffuse );
			if ( data.intensity ) light.intensity = data.intensity;

			objects[ data.id ] = light;

			scene.add( light );

		}

		var meshes = json.meshes;

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var data = meshes[ i ];

			var object;

			if ( data.indices ) {

				var geometry = this.parseGeometry( data );

				object = new THREE.Mesh( geometry, materials[ data.materialId ] );

			} else {

				object = new THREE.Group();

			}

			object.name = data.name;
			object.position.set( data.position[ 0 ], data.position[ 1 ], - data.position[ 2 ] );
			object.rotation.fromArray( data.rotation );
			if ( data.rotationQuaternion ) object.quaternion.fromArray( data.rotationQuaternion );
			object.scale.fromArray( data.scaling );
			// object.visible = data.isVisible;

			if ( data.parentId ) {

				objects[ data.parentId ].add( object );

			} else {

				scene.add( object );

			}

			objects[ data.id ] = object;

		}

		return scene;

	}

};
