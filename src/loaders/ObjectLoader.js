/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ObjectLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ObjectLoader.prototype = {

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

		var geometries = this.parseGeometries( json.geometries );
		var materials = this.parseMaterials( json.materials );
		var object = this.parseObject( json.object, geometries, materials );

		return object;

	},

	parseGeometries: function ( json ) {

		var geometries = {};

		if ( json !== undefined ) {

			var loaders = {
				geometryLoader: new THREE.JSONLoader(),
				bufferGeometryLoader: new THREE.BufferGeometryLoader()
			};

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var data = json[ i ];

				// Backwards compatibility for depricated classes
				if (data.type === 'CubeGeometry') data.type = 'BoxGeometry'

				var GeometryClass = THREE[ data.type ];
				var geometry = GeometryClass.fromJSON( data, loaders );

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) geometry.name = data.name;

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	},

	parseMaterials: function ( json ) {

		var materials = {};

		if ( json !== undefined ) {

			var loader = new THREE.MaterialLoader();

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var data = json[ i ];
				var material = loader.parse( data );

				materials[ data.uuid ] = material;

			}

		}

		return materials;

	},

	parseObject: function ( data, geometries, materials ) {
			
		var ObjectClass = THREE[ data.type ];
		var object = ObjectClass.fromJSON( data, geometries, materials );

		return object;

	}

};
