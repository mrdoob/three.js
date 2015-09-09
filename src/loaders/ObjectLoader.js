/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = ObjectLoader;

var BufferGeometryLoader = require( "./BufferGeometryLoader" ),
	ImageLoader = require( "./ImageLoader" ),
	JSONLoader = require( "./JSONLoader" ),
	LoadingManager = require( "./LoadingManager" ),
	DefaultLoadingManager = LoadingManager.DefaultLoadingManager,
	MaterialLoader = require( "./MaterialLoader" ),
	XHRLoader = require( "./XHRLoader" ),

	Constants = require( "../Constants" ),

	OrthographicCamera = require( "../cameras/OrthographicCamera" ),
	PerspectiveCamera = require( "../cameras/PerspectiveCamera" ),

	Object3D = require( "../core/Object3D" ),

	BoxGeometry = require( "../extras/geometries/BoxGeometry" ),
	CircleBufferGeometry = require( "../extras/geometries/CircleBufferGeometry" ),
	CircleGeometry = require( "../extras/geometries/CircleGeometry" ),
	CylinderGeometry = require( "../extras/geometries/CylinderGeometry" ),
	DodecahedronGeometry = require( "../extras/geometries/DodecahedronGeometry" ),
	IcosahedronGeometry = require( "../extras/geometries/IcosahedronGeometry" ),
	OctahedronGeometry = require( "../extras/geometries/OctahedronGeometry" ),
	PlaneBufferGeometry = require( "../extras/geometries/PlaneBufferGeometry" ),
	PlaneGeometry = require( "../extras/geometries/PlaneGeometry" ),
	RingGeometry = require( "../extras/geometries/RingGeometry" ),
	SphereBufferGeometry = require( "../extras/geometries/SphereBufferGeometry" ),
	SphereGeometry = require( "../extras/geometries/SphereGeometry" ),
	TetrahedronGeometry = require( "../extras/geometries/TetrahedronGeometry" ),
	TextGeometry = require( "../extras/geometries/TextGeometry" ),
	TorusGeometry = require( "../extras/geometries/TorusGeometry" ),
	TorusKnotGeometry = require( "../extras/geometries/TorusKnotGeometry" ),

	AmbientLight = require( "../lights/AmbientLight" ),
	DirectionalLight = require( "../lights/DirectionalLight" ),
	HemisphereLight = require( "../lights/HemisphereLight" ),
	PointLight = require( "../lights/PointLight" ),
	SpotLight = require( "../lights/SpotLight" ),

	Vector2 = require( "../math/Vector2" ),
	Matrix4 = require( "../math/Matrix4" ),

	Group = require( "../objects/Group" ),
	Line = require( "../objects/Line" ),
	LOD = require( "../objects/LOD" ),
	Mesh = require( "../objects/Mesh" ),
	PointCloud = require( "../objects/PointCloud" ),
	Sprite = require( "../objects/Sprite" ),

	Scene = require( "../scenes/Scene" ),
	Texture = require( "../textures/Texture" );

function ObjectLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.texturePath = "";

}

ObjectLoader.prototype = {

	constructor: ObjectLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		if ( this.texturePath === "" ) {

			this.texturePath = url.substring( 0, url.lastIndexOf( "/" ) + 1 );

		}

		var scope = this;

		var loader = new XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			scope.parse( JSON.parse( text ), onLoad );

		}, onProgress, onError );

	},

	setTexturePath: function ( value ) {

		this.texturePath = value;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json, onLoad ) {

		var images = this.parseImages( json.images, callback );
		var textures = this.parseTextures( json.textures, images );
		var materials = this.parseMaterials( json.materials, textures );
		var geometries = this.parseGeometries( json.geometries );
		var object = this.parseObject( json.object, geometries, materials );

		function callback() {

			if ( onLoad !== undefined ) { onLoad( object ); }

		}

		if ( json.images === undefined || json.images.length === 0 ) {

			if ( onLoad !== undefined ) { onLoad( object ); }

		}

		return object;

	},

	parseGeometries: function ( json ) {

		var geometries = {};

		if ( json !== undefined ) {

			var geometryLoader = new JSONLoader();
			var bufferGeometryLoader = new BufferGeometryLoader();

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var geometry;
				var data = json[ i ];

				switch ( data.type ) {

					case "PlaneBufferGeometry":

						geometry = new PlaneBufferGeometry(
							data.width,
							data.height,
							data.widthSegments,
							data.heightSegments
						);

						break;

					case "PlaneGeometry":

						geometry = new PlaneGeometry(
							data.width,
							data.height,
							data.widthSegments,
							data.heightSegments
						);

						break;

					case "BoxGeometry":
					case "CubeGeometry":

						geometry = new BoxGeometry(
							data.width,
							data.height,
							data.depth,
							data.widthSegments,
							data.heightSegments,
							data.depthSegments
						);

						break;

					case "CircleBufferGeometry":

						geometry = new CircleBufferGeometry(
							data.radius,
							data.segments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "CircleGeometry":

						geometry = new CircleGeometry(
							data.radius,
							data.segments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "CylinderGeometry":

						geometry = new CylinderGeometry(
							data.radiusTop,
							data.radiusBottom,
							data.height,
							data.radialSegments,
							data.heightSegments,
							data.openEnded,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "SphereBufferGeometry":

						geometry = new SphereBufferGeometry(
							data.radius,
							data.widthSegments,
							data.heightSegments,
							data.phiStart,
							data.phiLength,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "SphereGeometry":

						geometry = new SphereGeometry(
							data.radius,
							data.widthSegments,
							data.heightSegments,
							data.phiStart,
							data.phiLength,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "DodecahedronGeometry":

						geometry = new DodecahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case "IcosahedronGeometry":

						geometry = new IcosahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case "OctahedronGeometry":

						geometry = new OctahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case "TetrahedronGeometry":

						geometry = new TetrahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case "RingGeometry":

						geometry = new RingGeometry(
							data.innerRadius,
							data.outerRadius,
							data.thetaSegments,
							data.phiSegments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case "TorusGeometry":

						geometry = new TorusGeometry(
							data.radius,
							data.tube,
							data.radialSegments,
							data.tubularSegments,
							data.arc
						);

						break;

					case "TorusKnotGeometry":

						geometry = new TorusKnotGeometry(
							data.radius,
							data.tube,
							data.radialSegments,
							data.tubularSegments,
							data.p,
							data.q,
							data.heightScale
						);

						break;

					case "TextGeometry":

						geometry = new TextGeometry(
							data.text,
							data.data
						);

						break;

					case "BufferGeometry":

						geometry = bufferGeometryLoader.parse( data );

						break;

					case "Geometry":

						geometry = geometryLoader.parse( data.data, this.texturePath ).geometry;

						break;

					default:

						console.warn( "ObjectLoader: Unsupported geometry type \"" + data.type + "\"" );

						continue;

				}

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) { geometry.name = data.name; }

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	},

	parseMaterials: function ( json, textures ) {

		var materials = {};

		if ( json !== undefined ) {

			var loader = new MaterialLoader();
			loader.setTextures( textures );

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var material = loader.parse( json[ i ] );
				materials[ material.uuid ] = material;

			}

		}

		return materials;

	},

	parseImages: function ( json, onLoad ) {

		var scope = this;
		var images = {};

		if ( json !== undefined && json.length > 0 ) {

			var manager = new LoadingManager( onLoad );

			var loader = new ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );

			var loadImage = function ( url ) {

				url = scope.texturePath + url;

				scope.manager.itemStart( url );

				return loader.load( url, function () {

					scope.manager.itemEnd( url );

				} );

			};

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var image = json[ i ];
				images[ image.uuid ] = loadImage( image.url );

			}

		}

		return images;

	},

	parseTextures: function ( json, images ) {

		function parseConstant( value ) {

			if ( typeof( value ) === "number" ) { return value; }

			console.warn( "ObjectLoader.parseTexture: Constant should be in numeric form.", value );

			return Constants[ value ];

		}

		var textures = {};

		if ( json !== undefined ) {

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var data = json[ i ];

				if ( data.image === undefined ) {

					console.warn( "ObjectLoader: No \"image\" specified for", data.uuid );

				}

				if ( images[ data.image ] === undefined ) {

					console.warn( "ObjectLoader: Undefined image", data.image );

				}

				var texture = new Texture( images[ data.image ] );
				texture.needsUpdate = true;

				texture.uuid = data.uuid;

				if ( data.name !== undefined ) { texture.name = data.name; }
				if ( data.mapping !== undefined ) { texture.mapping = parseConstant( data.mapping ); }
				if ( data.offset !== undefined ) { texture.offset = new Vector2( data.offset[ 0 ], data.offset[ 1 ] ); }
				if ( data.repeat !== undefined ) { texture.repeat = new Vector2( data.repeat[ 0 ], data.repeat[ 1 ] ); }
				if ( data.minFilter !== undefined ) { texture.minFilter = parseConstant( data.minFilter ); }
				if ( data.magFilter !== undefined ) { texture.magFilter = parseConstant( data.magFilter ); }
				if ( data.anisotropy !== undefined ) { texture.anisotropy = data.anisotropy; }
				if ( Array.isArray( data.wrap ) ) {

					texture.wrapS = parseConstant( data.wrap[ 0 ] );
					texture.wrapT = parseConstant( data.wrap[ 1 ] );

				}

				textures[ data.uuid ] = texture;

			}

		}

		return textures;

	},

	parseObject: ( function () {

		var matrix = new Matrix4();

		return function ( data, geometries, materials ) {

			var object;

			var getGeometry = function ( name ) {

				if ( geometries[ name ] === undefined ) {

					console.warn( "ObjectLoader: Undefined geometry", name );

				}

				return geometries[ name ];

			};

			var getMaterial = function ( name ) {

				if ( materials[ name ] === undefined ) {

					console.warn( "ObjectLoader: Undefined material", name );

				}

				return materials[ name ];

			};

			switch ( data.type ) {

				case "Scene":

					object = new Scene();

					break;

				case "PerspectiveCamera":

					object = new PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

					break;

				case "OrthographicCamera":

					object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

					break;

				case "AmbientLight":

					object = new AmbientLight( data.color );

					break;

				case "DirectionalLight":

					object = new DirectionalLight( data.color, data.intensity );

					break;

				case "PointLight":

					object = new PointLight( data.color, data.intensity, data.distance, data.decay );

					break;

				case "SpotLight":

					object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.exponent, data.decay );

					break;

				case "HemisphereLight":

					object = new HemisphereLight( data.color, data.groundColor, data.intensity );

					break;

				case "Mesh":

					object = new Mesh( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case "LOD":

					object = new LOD();

					break;

				case "Line":

					object = new Line( getGeometry( data.geometry ), getMaterial( data.material ), data.mode );

					break;

				case "PointCloud":

					object = new PointCloud( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case "Sprite":

					object = new Sprite( getMaterial( data.material ) );

					break;

				case "Group":

					object = new Group();

					break;

				default:

					object = new Object3D();

			}

			object.uuid = data.uuid;

			if ( data.name !== undefined ) { object.name = data.name; }
			if ( data.matrix !== undefined ) {

				matrix.fromArray( data.matrix );
				matrix.decompose( object.position, object.quaternion, object.scale );

			} else {

				if ( data.position !== undefined ) { object.position.fromArray( data.position ); }
				if ( data.rotation !== undefined ) { object.rotation.fromArray( data.rotation ); }
				if ( data.scale !== undefined ) { object.scale.fromArray( data.scale ); }

			}

			if ( data.castShadow !== undefined ) { object.castShadow = data.castShadow; }
			if ( data.receiveShadow !== undefined ) { object.receiveShadow = data.receiveShadow; }

			if ( data.visible !== undefined ) { object.visible = data.visible; }
			if ( data.userData !== undefined ) { object.userData = data.userData; }

			var child, levels, level, l;

			if ( data.children !== undefined ) {

				for ( child in data.children ) {

					object.add( this.parseObject( data.children[ child ], geometries, materials ) );

				}

			}

			if ( data.type === "LOD" ) {

				levels = data.levels;

				for ( l = 0; l < levels.length; l ++ ) {

					level = levels[ l ];
					child = object.getObjectByProperty( "uuid", level.object );

					if ( child !== undefined ) {

						object.addLevel( child, level.distance );

					}

				}

			}

			return object;

		};

	}() )

};
