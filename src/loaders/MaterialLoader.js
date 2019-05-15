import { Color } from '../math/Color.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { FileLoader } from './FileLoader.js';
import { DefaultLoadingManager } from './LoadingManager.js';
import * as Materials from '../materials/Materials.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function MaterialLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.textures = {};

}

Object.assign( MaterialLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json ) {

		var textures = this.textures;

		function getTexture( name ) {

			if ( textures[ name ] === undefined ) {

				console.warn( 'THREE.MaterialLoader: Undefined texture', name );

			}

			return textures[ name ];

		}

		var material = new Materials[ json.type ]();

		if ( json.uuid !== undefined ) material.uuid = json.uuid;
		if ( json.name !== undefined ) material.name = json.name;
		if ( json.color !== undefined ) material.color.setHex( json.color );
		if ( json.roughness !== undefined ) material.roughness = json.roughness;
		if ( json.metalness !== undefined ) material.metalness = json.metalness;
		if ( json.emissive !== undefined ) material.emissive.setHex( json.emissive );
		if ( json.specular !== undefined ) material.specular.setHex( json.specular );
		if ( json.shininess !== undefined ) material.shininess = json.shininess;
		if ( json.clearCoat !== undefined ) material.clearCoat = json.clearCoat;
		if ( json.clearCoatRoughness !== undefined ) material.clearCoatRoughness = json.clearCoatRoughness;
		if ( json.vertexColors !== undefined ) material.vertexColors = json.vertexColors;
		if ( json.fog !== undefined ) material.fog = json.fog;
		if ( json.flatShading !== undefined ) material.flatShading = json.flatShading;
		if ( json.blending !== undefined ) material.blending = json.blending;
		if ( json.combine !== undefined ) material.combine = json.combine;
		if ( json.side !== undefined ) material.side = json.side;
		if ( json.opacity !== undefined ) material.opacity = json.opacity;
		if ( json.transparent !== undefined ) material.transparent = json.transparent;
		if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
		if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
		if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
		if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
		if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
		if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;
		if ( json.wireframeLinecap !== undefined ) material.wireframeLinecap = json.wireframeLinecap;
		if ( json.wireframeLinejoin !== undefined ) material.wireframeLinejoin = json.wireframeLinejoin;

		if ( json.rotation !== undefined ) material.rotation = json.rotation;

		if ( json.linewidth !== 1 ) material.linewidth = json.linewidth;
		if ( json.dashSize !== undefined ) material.dashSize = json.dashSize;
		if ( json.gapSize !== undefined ) material.gapSize = json.gapSize;
		if ( json.scale !== undefined ) material.scale = json.scale;

		if ( json.polygonOffset !== undefined ) material.polygonOffset = json.polygonOffset;
		if ( json.polygonOffsetFactor !== undefined ) material.polygonOffsetFactor = json.polygonOffsetFactor;
		if ( json.polygonOffsetUnits !== undefined ) material.polygonOffsetUnits = json.polygonOffsetUnits;

		if ( json.skinning !== undefined ) material.skinning = json.skinning;
		if ( json.morphTargets !== undefined ) material.morphTargets = json.morphTargets;
		if ( json.dithering !== undefined ) material.dithering = json.dithering;

		if ( json.visible !== undefined ) material.visible = json.visible;
		if ( json.userData !== undefined ) material.userData = json.userData;

		// Shader Material

		if ( json.uniforms !== undefined ) {

			for ( var name in json.uniforms ) {

				var uniform = json.uniforms[ name ];

				material.uniforms[ name ] = {};

				switch ( uniform.type ) {

					case 't':
						material.uniforms[ name ].value = getTexture( uniform.value );
						break;

					case 'c':
						material.uniforms[ name ].value = new Color().setHex( uniform.value );
						break;

					case 'v2':
						material.uniforms[ name ].value = new Vector2().fromArray( uniform.value );
						break;

					case 'v3':
						material.uniforms[ name ].value = new Vector3().fromArray( uniform.value );
						break;

					case 'v4':
						material.uniforms[ name ].value = new Vector4().fromArray( uniform.value );
						break;

					case 'm3':
						material.uniforms[ name ].value = new Matrix3().fromArray( uniform.value );

					case 'm4':
						material.uniforms[ name ].value = new Matrix4().fromArray( uniform.value );
						break;

					default:
						material.uniforms[ name ].value = uniform.value;

				}

			}

		}

		if ( json.defines !== undefined ) material.defines = json.defines;
		if ( json.vertexShader !== undefined ) material.vertexShader = json.vertexShader;
		if ( json.fragmentShader !== undefined ) material.fragmentShader = json.fragmentShader;

		if ( json.extensions !== undefined ) {

			for ( var key in json.extensions ) {

				material.extensions[ key ] = json.extensions[ key ];

			}

		}

		// Deprecated

		if ( json.shading !== undefined ) material.flatShading = json.shading === 1; // THREE.FlatShading

		// for PointsMaterial

		if ( json.size !== undefined ) material.size = json.size;
		if ( json.sizeAttenuation !== undefined ) material.sizeAttenuation = json.sizeAttenuation;

		// maps

		if ( json.map !== undefined ) material.map = getTexture( json.map );

		if ( json.alphaMap !== undefined ) {

			material.alphaMap = getTexture( json.alphaMap );
			material.transparent = true;

		}

		if ( json.bumpMap !== undefined ) material.bumpMap = getTexture( json.bumpMap );
		if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;

		if ( json.normalMap !== undefined ) material.normalMap = getTexture( json.normalMap );
		if ( json.normalMapType !== undefined ) material.normalMapType = json.normalMapType;
		if ( json.normalScale !== undefined ) {

			var normalScale = json.normalScale;

			if ( Array.isArray( normalScale ) === false ) {

				// Blender exporter used to export a scalar. See #7459

				normalScale = [ normalScale, normalScale ];

			}

			material.normalScale = new Vector2().fromArray( normalScale );

		}

		if ( json.displacementMap !== undefined ) material.displacementMap = getTexture( json.displacementMap );
		if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
		if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;

		if ( json.roughnessMap !== undefined ) material.roughnessMap = getTexture( json.roughnessMap );
		if ( json.metalnessMap !== undefined ) material.metalnessMap = getTexture( json.metalnessMap );

		if ( json.emissiveMap !== undefined ) material.emissiveMap = getTexture( json.emissiveMap );
		if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;

		if ( json.specularMap !== undefined ) material.specularMap = getTexture( json.specularMap );

		if ( json.envMap !== undefined ) material.envMap = getTexture( json.envMap );
		if ( json.envMapIntensity !== undefined ) material.envMapIntensity = json.envMapIntensity;

		if ( json.reflectivity !== undefined ) material.reflectivity = json.reflectivity;

		if ( json.lightMap !== undefined ) material.lightMap = getTexture( json.lightMap );
		if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;

		if ( json.aoMap !== undefined ) material.aoMap = getTexture( json.aoMap );
		if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;

		if ( json.gradientMap !== undefined ) material.gradientMap = getTexture( json.gradientMap );

		return material;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	setTextures: function ( value ) {

		this.textures = value;
		return this;

	}

} );


export { MaterialLoader };
