/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ObjectLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.texturePath = '';

};

THREE.ObjectLoader.prototype = {

	constructor: THREE.ObjectLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		if ( this.texturePath === '' ) {

			this.texturePath = url.substring( 0, url.lastIndexOf( '/' ) + 1 );

		}

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
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

		var geometries = this.parseGeometries( json.geometries );

		var images = this.parseImages( json.images, function () {

			if ( onLoad !== undefined ) onLoad( object );

		} );

		var textures  = this.parseTextures( json.textures, images );
		var materials = this.parseMaterials( json.materials, textures );

		var object = this.parseObject( json.object, geometries, materials );

		if ( json.animations ) {

			object.animations = this.parseAnimations( json.animations );

		}

		if ( json.images === undefined || json.images.length === 0 ) {

			if ( onLoad !== undefined ) onLoad( object );

		}

		return object;

	},

	parseGeometries: function ( json ) {

		var geometries = {};

		if ( json !== undefined ) {

			var geometryLoader = new THREE.JSONLoader();
			var bufferGeometryLoader = new THREE.BufferGeometryLoader();

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var geometry;
				var data = json[ i ];

				switch ( data.type ) {

					case 'PlaneGeometry':
					case 'PlaneBufferGeometry':

						geometry = new THREE[ data.type ](
							data.width,
							data.height,
							data.widthSegments,
							data.heightSegments
						);

						break;

					case 'BoxGeometry':
					case 'BoxBufferGeometry':
					case 'CubeGeometry': // backwards compatible

						geometry = new THREE[ data.type ](
							data.width,
							data.height,
							data.depth,
							data.widthSegments,
							data.heightSegments,
							data.depthSegments
						);

						break;

					case 'CircleGeometry':
					case 'CircleBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.segments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'CylinderGeometry':
					case 'CylinderBufferGeometry':

						geometry = new THREE[ data.type ](
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

					case 'ConeGeometry':
					case 'ConeBufferGeometry':

						geometry = new THREE [ data.type ](
							data.radius,
							data.height,
							data.radialSegments,
							data.heightSegments,
							data.openEnded,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'SphereGeometry':
					case 'SphereBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.widthSegments,
							data.heightSegments,
							data.phiStart,
							data.phiLength,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'DodecahedronGeometry':
					case 'IcosahedronGeometry':
					case 'OctahedronGeometry':
					case 'TetrahedronGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.detail
						);

						break;

					case 'RingGeometry':
					case 'RingBufferGeometry':

						geometry = new THREE[ data.type ](
							data.innerRadius,
							data.outerRadius,
							data.thetaSegments,
							data.phiSegments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'TorusGeometry':
					case 'TorusBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.tube,
							data.radialSegments,
							data.tubularSegments,
							data.arc
						);

						break;

					case 'TorusKnotGeometry':
					case 'TorusKnotBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.tube,
							data.tubularSegments,
							data.radialSegments,
							data.p,
							data.q
						);

						break;

					case 'LatheGeometry':
					case 'LatheBufferGeometry':

						geometry = new THREE[ data.type ](
							data.points,
							data.segments,
							data.phiStart,
							data.phiLength
						);

						break;

					case 'BufferGeometry':

						geometry = bufferGeometryLoader.parse( data );

						break;

					case 'Geometry':

						geometry = geometryLoader.parse( data.data, this.texturePath ).geometry;

						break;

					default:

						console.warn( 'THREE.ObjectLoader: Unsupported geometry type "' + data.type + '"' );

						continue;

				}

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) geometry.name = data.name;

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	},

	parseMaterials: function ( json, textures ) {

		var materials = {};

		if ( json !== undefined ) {

			var loader = new THREE.MaterialLoader();
			loader.setTextures( textures );

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var material = loader.parse( json[ i ] );
				materials[ material.uuid ] = material;

			}

		}

		return materials;

	},

	parseAnimations: function ( json ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = THREE.AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	},

	parseImages: function ( json, onLoad ) {

		var scope = this;
		var images = {};

		function loadImage( url ) {

			scope.manager.itemStart( url );

			return loader.load( url, function () {

				scope.manager.itemEnd( url );

			} );

		}

		if ( json !== undefined && json.length > 0 ) {

			var manager = new THREE.LoadingManager( onLoad );

			var loader = new THREE.ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var image = json[ i ];
				var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( image.url ) ? image.url : scope.texturePath + image.url;

				images[ image.uuid ] = loadImage( path );

			}

		}

		return images;

	},

	parseTextures: function ( json, images ) {

		function parseConstant( value ) {

			if ( typeof( value ) === 'number' ) return value;

			console.warn( 'THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value );

			return THREE[ value ];

		}

		var textures = {};

		if ( json !== undefined ) {

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var data = json[ i ];

				if ( data.image === undefined ) {

					console.warn( 'THREE.ObjectLoader: No "image" specified for', data.uuid );

				}

				if ( images[ data.image ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined image', data.image );

				}

				var texture = new THREE.Texture( images[ data.image ] );
				texture.needsUpdate = true;

				texture.uuid = data.uuid;

				if ( data.name !== undefined ) texture.name = data.name;
				if ( data.mapping !== undefined ) texture.mapping = parseConstant( data.mapping );
				if ( data.offset !== undefined ) texture.offset = new THREE.Vector2( data.offset[ 0 ], data.offset[ 1 ] );
				if ( data.repeat !== undefined ) texture.repeat = new THREE.Vector2( data.repeat[ 0 ], data.repeat[ 1 ] );
				if ( data.minFilter !== undefined ) texture.minFilter = parseConstant( data.minFilter );
				if ( data.magFilter !== undefined ) texture.magFilter = parseConstant( data.magFilter );
				if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;
				if ( Array.isArray( data.wrap ) ) {

					texture.wrapS = parseConstant( data.wrap[ 0 ] );
					texture.wrapT = parseConstant( data.wrap[ 1 ] );

				}

				textures[ data.uuid ] = texture;

			}

		}

		return textures;

	},

	parseObject: function () {

		var matrix = new THREE.Matrix4();

		return function ( data, geometries, materials ) {

			var object;

			function getGeometry( name ) {

				if ( geometries[ name ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined geometry', name );

				}

				return geometries[ name ];

			}

			function getMaterial( name ) {

				if ( name === undefined ) return undefined;

				if ( materials[ name ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined material', name );

				}

				return materials[ name ];

			}

			switch ( data.type ) {

				case 'Scene':

					object = new THREE.Scene();

					break;

				case 'PerspectiveCamera':

					object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

					if ( data.focus !== undefined ) object.focus = data.focus;
					if ( data.zoom !== undefined ) object.zoom = data.zoom;
					if ( data.filmGauge !== undefined ) object.filmGauge = data.filmGauge;
					if ( data.filmOffset !== undefined ) object.filmOffset = data.filmOffset;
					if ( data.view !== undefined ) object.view = Object.assign( {}, data.view );

					break;

				case 'OrthographicCamera':

					object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

					break;

				case 'AmbientLight':

					object = new THREE.AmbientLight( data.color, data.intensity );

					break;

				case 'DirectionalLight':

					object = new THREE.DirectionalLight( data.color, data.intensity );

					break;

				case 'PointLight':

					object = new THREE.PointLight( data.color, data.intensity, data.distance, data.decay );

					break;

				case 'SpotLight':

					object = new THREE.SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );

					break;

				case 'HemisphereLight':

					object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );

					break;

				case 'Mesh':

					var geometry = getGeometry( data.geometry );
					var material = getMaterial( data.material );

					if ( geometry.bones && geometry.bones.length > 0 ) {

						object = new THREE.SkinnedMesh( geometry, material );

					} else {

						object = new THREE.Mesh( geometry, material );

					}

					break;

				case 'LOD':

					object = new THREE.LOD();

					break;

				case 'Line':

					object = new THREE.Line( getGeometry( data.geometry ), getMaterial( data.material ), data.mode );

					break;

				case 'PointCloud':
				case 'Points':

					object = new THREE.Points( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case 'Sprite':

					object = new THREE.Sprite( getMaterial( data.material ) );

					break;

				case 'Group':

					object = new THREE.Group();

					break;

				default:

					object = new THREE.Object3D();

			}

			object.uuid = data.uuid;

			if ( data.name !== undefined ) object.name = data.name;
			if ( data.matrix !== undefined ) {

				matrix.fromArray( data.matrix );
				matrix.decompose( object.position, object.quaternion, object.scale );

			} else {

				if ( data.position !== undefined ) object.position.fromArray( data.position );
				if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
				if ( data.scale !== undefined ) object.scale.fromArray( data.scale );

			}

			if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
			if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

			if ( data.visible !== undefined ) object.visible = data.visible;
			if ( data.userData !== undefined ) object.userData = data.userData;

			if ( data.children !== undefined ) {

				for ( var child in data.children ) {

					object.add( this.parseObject( data.children[ child ], geometries, materials ) );

				}

			}

			if ( data.type === 'LOD' ) {

				var levels = data.levels;

				for ( var l = 0; l < levels.length; l ++ ) {

					var level = levels[ l ];
					var child = object.getObjectByProperty( 'uuid', level.object );

					if ( child !== undefined ) {

						object.addLevel( child, level.distance );

					}

				}

			}

			return object;

		};

	}()

};
