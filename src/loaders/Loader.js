import {
	NoBlending,
	NormalBlending,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,
	CustomBlending,

	FaceColors,
	VertexColors,

	DoubleSide,
	BackSide,

	MirroredRepeatWrapping,
	RepeatWrapping
} from '../constants.js';
import { _Math } from '../math/Math.js';
import { MaterialLoader } from './MaterialLoader.js';
import { TextureLoader } from './TextureLoader.js';
import { Color } from '../math/Color.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function Loader() {

	this.onLoadStart = function () {};
	this.onLoadProgress = function () {};
	this.onLoadComplete = function () {};

}

Loader.Handlers = {

	handlers: [],

	add: function ( regex, loader ) {

		this.handlers.push( regex, loader );

	},

	get: function ( file ) {

		var handlers = this.handlers;

		for ( var i = 0, l = handlers.length; i < l; i += 2 ) {

			var regex = handlers[ i ];
			var loader = handlers[ i + 1 ];

			if ( regex.test( file ) ) {

				return loader;

			}

		}

		return null;

	}

};

Object.assign( Loader.prototype, {

	crossOrigin: undefined,

	extractUrlBase: function ( url ) {

		var parts = url.split( '/' );

		if ( parts.length === 1 ) return './';

		parts.pop();

		return parts.join( '/' ) + '/';

	},

	initMaterials: function ( materials, texturePath, crossOrigin ) {

		var array = [];

		for ( var i = 0; i < materials.length; ++ i ) {

			array[ i ] = this.createMaterial( materials[ i ], texturePath, crossOrigin );

		}

		return array;

	},

	createMaterial: ( function () {

		var BlendingMode = {
			NoBlending: NoBlending,
			NormalBlending: NormalBlending,
			AdditiveBlending: AdditiveBlending,
			SubtractiveBlending: SubtractiveBlending,
			MultiplyBlending: MultiplyBlending,
			CustomBlending: CustomBlending
		};

		var color = new Color();
		var textureLoader = new TextureLoader();
		var materialLoader = new MaterialLoader();

		return function createMaterial( m, texturePath, crossOrigin ) {

			// convert from old material format

			var textures = {};

			function loadTexture( path, repeat, offset, wrap, anisotropy ) {

				var fullPath = texturePath + path;
				var loader = Loader.Handlers.get( fullPath );

				var texture;

				if ( loader !== null ) {

					texture = loader.load( fullPath );

				} else {

					textureLoader.setCrossOrigin( crossOrigin );
					texture = textureLoader.load( fullPath );

				}

				if ( repeat !== undefined ) {

					texture.repeat.fromArray( repeat );

					if ( repeat[ 0 ] !== 1 ) texture.wrapS = RepeatWrapping;
					if ( repeat[ 1 ] !== 1 ) texture.wrapT = RepeatWrapping;

				}

				if ( offset !== undefined ) {

					texture.offset.fromArray( offset );

				}

				if ( wrap !== undefined ) {

					if ( wrap[ 0 ] === 'repeat' ) texture.wrapS = RepeatWrapping;
					if ( wrap[ 0 ] === 'mirror' ) texture.wrapS = MirroredRepeatWrapping;

					if ( wrap[ 1 ] === 'repeat' ) texture.wrapT = RepeatWrapping;
					if ( wrap[ 1 ] === 'mirror' ) texture.wrapT = MirroredRepeatWrapping;

				}

				if ( anisotropy !== undefined ) {

					texture.anisotropy = anisotropy;

				}

				var uuid = _Math.generateUUID();

				textures[ uuid ] = texture;

				return uuid;

			}

			//

			var json = {
				uuid: _Math.generateUUID(),
				type: 'MeshLambertMaterial'
			};

			for ( var name in m ) {

				var value = m[ name ];

				switch ( name ) {

					case 'DbgColor':
					case 'DbgIndex':
					case 'opticalDensity':
					case 'illumination':
						break;
					case 'DbgName':
						json.name = value;
						break;
					case 'blending':
						json.blending = BlendingMode[ value ];
						break;
					case 'colorAmbient':
					case 'mapAmbient':
						console.warn( 'THREE.Loader.createMaterial:', name, 'is no longer supported.' );
						break;
					case 'colorDiffuse':
						json.color = color.fromArray( value ).getHex();
						break;
					case 'colorSpecular':
						json.specular = color.fromArray( value ).getHex();
						break;
					case 'colorEmissive':
						json.emissive = color.fromArray( value ).getHex();
						break;
					case 'specularCoef':
						json.shininess = value;
						break;
					case 'shading':
						if ( value.toLowerCase() === 'basic' ) json.type = 'MeshBasicMaterial';
						if ( value.toLowerCase() === 'phong' ) json.type = 'MeshPhongMaterial';
						if ( value.toLowerCase() === 'standard' ) json.type = 'MeshStandardMaterial';
						break;
					case 'mapDiffuse':
						json.map = loadTexture( value, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy );
						break;
					case 'mapDiffuseRepeat':
					case 'mapDiffuseOffset':
					case 'mapDiffuseWrap':
					case 'mapDiffuseAnisotropy':
						break;
					case 'mapEmissive':
						json.emissiveMap = loadTexture( value, m.mapEmissiveRepeat, m.mapEmissiveOffset, m.mapEmissiveWrap, m.mapEmissiveAnisotropy );
						break;
					case 'mapEmissiveRepeat':
					case 'mapEmissiveOffset':
					case 'mapEmissiveWrap':
					case 'mapEmissiveAnisotropy':
						break;
					case 'mapLight':
						json.lightMap = loadTexture( value, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy );
						break;
					case 'mapLightRepeat':
					case 'mapLightOffset':
					case 'mapLightWrap':
					case 'mapLightAnisotropy':
						break;
					case 'mapAO':
						json.aoMap = loadTexture( value, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy );
						break;
					case 'mapAORepeat':
					case 'mapAOOffset':
					case 'mapAOWrap':
					case 'mapAOAnisotropy':
						break;
					case 'mapBump':
						json.bumpMap = loadTexture( value, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy );
						break;
					case 'mapBumpScale':
						json.bumpScale = value;
						break;
					case 'mapBumpRepeat':
					case 'mapBumpOffset':
					case 'mapBumpWrap':
					case 'mapBumpAnisotropy':
						break;
					case 'mapNormal':
						json.normalMap = loadTexture( value, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy );
						break;
					case 'mapNormalFactor':
						json.normalScale = [ value, value ];
						break;
					case 'mapNormalRepeat':
					case 'mapNormalOffset':
					case 'mapNormalWrap':
					case 'mapNormalAnisotropy':
						break;
					case 'mapSpecular':
						json.specularMap = loadTexture( value, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy );
						break;
					case 'mapSpecularRepeat':
					case 'mapSpecularOffset':
					case 'mapSpecularWrap':
					case 'mapSpecularAnisotropy':
						break;
					case 'mapMetalness':
						json.metalnessMap = loadTexture( value, m.mapMetalnessRepeat, m.mapMetalnessOffset, m.mapMetalnessWrap, m.mapMetalnessAnisotropy );
						break;
					case 'mapMetalnessRepeat':
					case 'mapMetalnessOffset':
					case 'mapMetalnessWrap':
					case 'mapMetalnessAnisotropy':
						break;
					case 'mapRoughness':
						json.roughnessMap = loadTexture( value, m.mapRoughnessRepeat, m.mapRoughnessOffset, m.mapRoughnessWrap, m.mapRoughnessAnisotropy );
						break;
					case 'mapRoughnessRepeat':
					case 'mapRoughnessOffset':
					case 'mapRoughnessWrap':
					case 'mapRoughnessAnisotropy':
						break;
					case 'mapAlpha':
						json.alphaMap = loadTexture( value, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy );
						break;
					case 'mapAlphaRepeat':
					case 'mapAlphaOffset':
					case 'mapAlphaWrap':
					case 'mapAlphaAnisotropy':
						break;
					case 'flipSided':
						json.side = BackSide;
						break;
					case 'doubleSided':
						json.side = DoubleSide;
						break;
					case 'transparency':
						console.warn( 'THREE.Loader.createMaterial: transparency has been renamed to opacity' );
						json.opacity = value;
						break;
					case 'depthTest':
					case 'depthWrite':
					case 'colorWrite':
					case 'opacity':
					case 'reflectivity':
					case 'transparent':
					case 'visible':
					case 'wireframe':
						json[ name ] = value;
						break;
					case 'vertexColors':
						if ( value === true ) json.vertexColors = VertexColors;
						if ( value === 'face' ) json.vertexColors = FaceColors;
						break;
					default:
						console.error( 'THREE.Loader.createMaterial: Unsupported', name, value );
						break;

				}

			}

			if ( json.type === 'MeshBasicMaterial' ) delete json.emissive;
			if ( json.type !== 'MeshPhongMaterial' ) delete json.specular;

			if ( json.opacity < 1 ) json.transparent = true;

			materialLoader.setTextures( textures );

			return materialLoader.parse( json );

		};

	} )()

} );


export { Loader };
