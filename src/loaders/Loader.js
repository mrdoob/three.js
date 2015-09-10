/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = Loader;

var ImageLoader = require( "./ImageLoader" ),
	Constants = require( "../Constants" ),

	MeshBasicMaterial = require( "../materials/MeshBasicMaterial" ),
	MeshLambertMaterial = require( "../materials/MeshLambertMaterial" ),
	MeshPhongMaterial = require( "../materials/MeshPhongMaterial" ),

	_Math = require( "../math/Math" ),
	Vector2 = require( "../math/Vector2" ),
	Texture = require( "../textures/Texture" );

function Loader() {

	this.onLoadStart = function () {};
	this.onLoadProgress = function () {};
	this.onLoadComplete = function () {};

}

Loader.prototype = {

	constructor: Loader,

	crossOrigin: undefined,

	extractUrlBase: function ( url ) {

		var parts = url.split( "/" );

		if ( parts.length === 1 ) { return "./"; }

		parts.pop();

		return parts.join( "/" ) + "/";

	},

	initMaterials: function ( materials, texturePath, crossOrigin ) {

		var array = [];

		for ( var i = 0; i < materials.length; ++ i ) {

			array[ i ] = this.createMaterial( materials[ i ], texturePath, crossOrigin );

		}

		return array;

	},

	createMaterial: ( function () {

		var imageLoader;

		return function createMaterial( m, texturePath, crossOrigin ) {

			var scope = this;

			if ( crossOrigin === undefined && scope.crossOrigin !== undefined ) { crossOrigin = scope.crossOrigin; }

			if ( imageLoader === undefined ) { imageLoader = new ImageLoader(); }

			function nearest_pow2( n ) {

				var l = Math.log( n ) / Math.LN2;
				return Math.pow( 2, Math.round(  l ) );

			}

			function create_texture( where, name, sourceFile, repeat, offset, wrap, anisotropy ) {

				var fullPath = texturePath + sourceFile;

				var texture;

				var loader = Loader.Handlers.get( fullPath );

				if ( loader !== null ) {

					texture = loader.load( fullPath );

				} else {

					texture = new Texture();

					loader = imageLoader;
					loader.setCrossOrigin( crossOrigin );
					loader.load( fullPath, function ( image ) {

						if ( _Math.isPowerOfTwo( image.width ) === false ||
							_Math.isPowerOfTwo( image.height ) === false ) {

							var width = nearest_pow2( image.width );
							var height = nearest_pow2( image.height );

							var canvas = document.createElement( "canvas" );
							canvas.width = width;
							canvas.height = height;

							var context = canvas.getContext( "2d" );
							context.drawImage( image, 0, 0, width, height );

							texture.image = canvas;

						} else {

							texture.image = image;

						}

						texture.needsUpdate = true;

					} );

				}

				texture.sourceFile = sourceFile;

				if ( repeat ) {

					texture.repeat.set( repeat[ 0 ], repeat[ 1 ] );

					if ( repeat[ 0 ] !== 1 ) { texture.wrapS = Constants.RepeatWrapping; }
					if ( repeat[ 1 ] !== 1 ) { texture.wrapT = Constants.RepeatWrapping; }

				}

				if ( offset ) {

					texture.offset.set( offset[ 0 ], offset[ 1 ] );

				}

				if ( wrap ) {

					var wrapMap = {
						"repeat": Constants.RepeatWrapping,
						"mirror": Constants.MirroredRepeatWrapping
					};

					if ( wrapMap[ wrap[ 0 ] ] !== undefined ) { texture.wrapS = wrapMap[ wrap[ 0 ] ]; }
					if ( wrapMap[ wrap[ 1 ] ] !== undefined ) { texture.wrapT = wrapMap[ wrap[ 1 ] ]; }

				}

				if ( anisotropy ) {

					texture.anisotropy = anisotropy;

				}

				where[ name ] = texture;

			}

			function rgb2hex( rgb ) {

				return ( rgb[ 0 ] * 255 << 16 ) + ( rgb[ 1 ] * 255 << 8 ) + rgb[ 2 ] * 255;

			}

			// defaults

			var mtype = "MeshLambertMaterial";
			var mpars = {};

			// parameters from model file

			if ( m.shading ) {

				var shading = m.shading.toLowerCase();

				if ( shading === "phong" ) { mtype = "MeshPhongMaterial"; }
				else if ( shading === "basic" ) { mtype = "MeshBasicMaterial"; }

			}

			if ( m.blending !== undefined && Constants[ m.blending ] !== undefined ) {

				mpars.blending = Constants[ m.blending ];

			}

			if ( m.transparent !== undefined ) {

				mpars.transparent = m.transparent;

			}

			if ( m.opacity !== undefined && m.opacity < 1.0 ) {

				mpars.transparent = true;

			}

			if ( m.depthTest !== undefined ) {

				mpars.depthTest = m.depthTest;

			}

			if ( m.depthWrite !== undefined ) {

				mpars.depthWrite = m.depthWrite;

			}

			if ( m.visible !== undefined ) {

				mpars.visible = m.visible;

			}

			if ( m.flipSided !== undefined ) {

				mpars.side = Constants.BackSide;

			}

			if ( m.doubleSided !== undefined ) {

				mpars.side = Constants.DoubleSide;

			}

			if ( m.wireframe !== undefined ) {

				mpars.wireframe = m.wireframe;

			}

			if ( m.vertexColors !== undefined ) {

				if ( m.vertexColors === "face" ) {

					mpars.vertexColors = Constants.FaceColors;

				} else if ( m.vertexColors ) {

					mpars.vertexColors = Constants.VertexColors;

				}

			}

			// colors

			if ( m.colorDiffuse ) {

				mpars.color = rgb2hex( m.colorDiffuse );

			} else if ( m.DbgColor ) {

				mpars.color = m.DbgColor;

			}

			if ( m.colorEmissive ) {

				mpars.emissive = rgb2hex( m.colorEmissive );

			}

			if ( mtype === "MeshPhongMaterial" ) {

				if ( m.colorSpecular ) {

					mpars.specular = rgb2hex( m.colorSpecular );

				}

				if ( m.specularCoef ) {

					mpars.shininess = m.specularCoef;

				}

			}

			// modifiers

			if ( m.transparency !== undefined ) {

				console.warn( "Loader: transparency has been renamed to opacity" );
				m.opacity = m.transparency;

			}

			if ( m.opacity !== undefined ) {

				mpars.opacity = m.opacity;

			}

			// textures

			if ( texturePath ) {

				if ( m.mapDiffuse ) {

					create_texture( mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy );

				}

				if ( m.mapLight ) {

					create_texture( mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy );

				}

				if ( m.mapAO ) {

					create_texture( mpars, "aoMap", m.mapAO, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy );

				}

				if ( m.mapBump ) {

					create_texture( mpars, "bumpMap", m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy );

				}

				if ( m.mapNormal ) {

					create_texture( mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy );

				}

				if ( m.mapSpecular ) {

					create_texture( mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy );

				}

				if ( m.mapAlpha ) {

					create_texture( mpars, "alphaMap", m.mapAlpha, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy );

				}

			}

			//

			if ( m.mapBumpScale ) {

				mpars.bumpScale = m.mapBumpScale;

			}

			if ( m.mapNormalFactor ) {

				mpars.normalScale = new Vector2( m.mapNormalFactor, m.mapNormalFactor );

			}

			var material;

			switch ( mtype ) {

				case "MeshBasicMaterial":

					material = new MeshBasicMaterial( mpars );
					break;

				case "MeshLambertMaterial":

					material = new MeshLambertMaterial( mpars );
					break;

				case "MeshPhongMaterial":

					material = new MeshPhongMaterial( mpars );
					break;

			}

			if ( m.DbgName !== undefined ) { material.name = m.DbgName; }

			return material;

		};

	}() )

};

Loader.Handlers = {

	handlers: [],

	add: function ( regex, loader ) {

		this.handlers.push( regex, loader );

	},

	get: function ( file ) {

		for ( var i = 0, l = this.handlers.length; i < l; i += 2 ) {

			var regex = this.handlers[ i ];
			var loader  = this.handlers[ i + 1 ];

			if ( regex.test( file ) ) {

				return loader;

			}

		}

		return null;

	}

};
