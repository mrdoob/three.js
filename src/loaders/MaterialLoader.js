import { Color } from '../math/Color.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';
import * as Materials from '../materials/Materials.js';

class MaterialLoader extends Loader {

	constructor( manager ) {

		super( manager );
		this.textures = {};

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( json ) {

		const textures = this.textures;

		function getTexture( name ) {

			if ( textures[ name ] === undefined ) {

				console.warn( 'THREE.MaterialLoader: Undefined texture', name );

			}

			return textures[ name ];

		}

		const material = new Materials[ json.type ]();

		// Base properties of material
		if ( json.uuid !== undefined ) material.uuid = json.uuid;
		if ( json.name !== undefined ) material.name = json.name;
		if ( json.fog !== undefined ) material.fog = json.fog;
		if ( json.blending !== undefined ) material.blending = json.blending;
		if ( json.side !== undefined ) material.side = json.side;
		if ( json.vertexColors !== undefined ) {

			if ( typeof json.vertexColors === 'number' ) {

				material.vertexColors = ( json.vertexColors > 0 ) ? true : false;

			} else {

				material.vertexColors = json.vertexColors;

			}

		}

		if ( json.opacity !== undefined ) material.opacity = json.opacity;
		if ( json.transparent !== undefined ) material.transparent = json.transparent;
		if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
		if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
		if ( json.stencilWriteMask !== undefined ) material.stencilWriteMask = json.stencilWriteMask;
		if ( json.stencilFunc !== undefined ) material.stencilFunc = json.stencilFunc;
		if ( json.stencilRef !== undefined ) material.stencilRef = json.stencilRef;
		if ( json.stencilFuncMask !== undefined ) material.stencilFuncMask = json.stencilFuncMask;
		if ( json.stencilFail !== undefined ) material.stencilFail = json.stencilFail;
		if ( json.stencilZFail !== undefined ) material.stencilZFail = json.stencilZFail;
		if ( json.stencilZPass !== undefined ) material.stencilZPass = json.stencilZPass;
		if ( json.stencilWrite !== undefined ) material.stencilWrite = json.stencilWrite;
		if ( json.shadowSide !== undefined ) material.shadowSide = json.shadowSide;
		if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
		if ( json.polygonOffset !== undefined ) material.polygonOffset = json.polygonOffset;
		if ( json.polygonOffsetFactor !== undefined ) material.polygonOffsetFactor = json.polygonOffsetFactor;
		if ( json.polygonOffsetUnits !== undefined ) material.polygonOffsetUnits = json.polygonOffsetUnits;
		if ( json.dithering !== undefined ) material.dithering = json.dithering;
		if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
		if ( json.alphaToCoverage !== undefined ) material.alphaToCoverage = json.alphaToCoverage;
		if ( json.premultipliedAlpha !== undefined ) material.premultipliedAlpha = json.premultipliedAlpha;
		if ( json.visible !== undefined ) material.visible = json.visible;
		if ( json.toneMapped !== undefined ) material.toneMapped = json.toneMapped;
		if ( json.userData !== undefined ) material.userData = json.userData;

		// Start: Common properties of sub-material.
		if ( json.color !== undefined && material.color !== undefined ) material.color.setHex( json.color );
		if ( json.linewidth !== 1 ) material.linewidth = json.linewidth;
		if ( json.map !== undefined ) material.map = getTexture( json.map );
		if ( json.lightMap !== undefined ) material.lightMap = getTexture( json.lightMap );
		if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;
		if ( json.aoMap !== undefined ) material.aoMap = getTexture( json.aoMap );
		if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;
		if ( json.specularMap !== undefined ) material.specularMap = getTexture( json.specularMap );
		if ( json.alphaMap !== undefined ) material.alphaMap = getTexture( json.alphaMap );
		if ( json.envMap !== undefined ) material.envMap = getTexture( json.envMap );
		if ( json.combine !== undefined ) material.combine = json.combine;
		if ( json.reflectivity !== undefined ) material.reflectivity = json.reflectivity;
		if ( json.refractionRatio !== undefined ) material.refractionRatio = json.refractionRatio;
		if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
		if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;
		if ( json.wireframeLinecap !== undefined ) material.wireframeLinecap = json.wireframeLinecap;
		if ( json.wireframeLinejoin !== undefined ) material.wireframeLinejoin = json.wireframeLinejoin;
		if ( json.displacementMap !== undefined ) material.displacementMap = getTexture( json.displacementMap );
		if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
		if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;
		if ( json.emissive !== undefined && material.emissive !== undefined ) material.emissive.setHex( json.emissive );
		if ( json.emissiveMap !== undefined ) material.emissiveMap = getTexture( json.emissiveMap );
		if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;
		if ( json.morphTargets !== undefined ) material.morphTargets = json.morphTargets;
		if ( json.morphNormals !== undefined ) material.morphNormals = json.morphNormals;
		if ( json.defines !== undefined ) material.defines = json.defines;
		if ( json.bumpMap !== undefined ) material.bumpMap = getTexture( json.bumpMap );
		if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;
		if ( json.normalMap !== undefined ) material.normalMap = getTexture( json.normalMap );
		if ( json.normalMapType !== undefined ) material.normalMapType = json.normalMapType;
		if ( json.normalScale !== undefined ) {

			let normalScale = json.normalScale;

			if ( Array.isArray( normalScale ) === false ) {

				// Blender exporter used to export a scalar. See #7459

				normalScale = [ normalScale, normalScale ];

			}

			material.normalScale = new Vector2().fromArray( normalScale );

		}

		if ( json.flatShading !== undefined ) material.flatShading = json.flatShading;
		if ( json.sizeAttenuation !== undefined ) material.sizeAttenuation = json.sizeAttenuation;
		// End: Common properties of sub-material.

		if ( material.isLineDashedMaterial ) {

			if ( json.scale !== undefined ) material.scale = json.scale;
			if ( json.dashSize !== undefined ) material.dashSize = json.dashSize;
			if ( json.gapSize !== undefined ) material.gapSize = json.gapSize;

		} else if ( material.isMeshMatcapMaterial ) {

			if ( json.matcap !== undefined ) material.matcap = getTexture( json.matcap );

		} else if ( material.isMeshPhongMaterial ) {

			if ( json.specular !== undefined && material.specular !== undefined ) material.specular.setHex( json.specular );
			if ( json.shininess !== undefined ) material.shininess = json.shininess;

		} else if ( material.isMeshPhysicalMaterial ) {

			if ( json.clearcoat !== undefined ) material.clearcoat = json.clearcoat;
			if ( json.clearcoatRoughness !== undefined ) material.clearcoatRoughness = json.clearcoatRoughness;
			if ( json.clearcoatMap !== undefined ) material.clearcoatMap = getTexture( json.clearcoatMap );
			if ( json.clearcoatRoughnessMap !== undefined ) material.clearcoatRoughnessMap = getTexture( json.clearcoatRoughnessMap );
			if ( json.clearcoatNormalMap !== undefined ) material.clearcoatNormalMap = getTexture( json.clearcoatNormalMap );
			if ( json.clearcoatNormalScale !== undefined ) material.clearcoatNormalScale = new Vector2().fromArray( json.clearcoatNormalScale );
			if ( json.sheen !== undefined ) material.sheen = new Color().setHex( json.sheen );
			if ( json.transmission !== undefined ) material.transmission = json.transmission;
			if ( json.transmissionMap !== undefined ) material.transmissionMap = getTexture( json.transmissionMap );
			if ( json.thickness !== undefined ) material.thickness = json.thickness;
			if ( json.thicknessMap !== undefined ) material.thicknessMap = getTexture( json.thicknessMap );
			if ( json.attenuationDistance !== undefined ) material.attenuationDistance = json.attenuationDistance;
			if ( json.attenuationColor !== undefined && material.attenuationColor !== undefined ) material.attenuationColor.setHex( json.attenuationColor );

		} else if ( material.isMeshStandardMaterial ) {

			if ( json.roughness !== undefined ) material.roughness = json.roughness;
			if ( json.metalness !== undefined ) material.metalness = json.metalness;
			if ( json.roughnessMap !== undefined ) material.roughnessMap = getTexture( json.roughnessMap );
			if ( json.metalnessMap !== undefined ) material.metalnessMap = getTexture( json.metalnessMap );
			if ( json.envMapIntensity !== undefined ) material.envMapIntensity = json.envMapIntensity;
			if ( json.vertexTangents !== undefined ) material.vertexTangents = json.vertexTangents;

		} else if ( material.isMeshToonMaterial ) {

			if ( json.gradientMap !== undefined ) material.gradientMap = getTexture( json.gradientMap );

		} else if ( material.isPointsMaterial ) {

			if ( json.size !== undefined ) material.size = json.size;

		} else if ( material.isShaderMaterial ) {

			if ( json.uniforms !== undefined ) {

				for ( const name in json.uniforms ) {

					const uniform = json.uniforms[ name ];

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
							break;

						case 'm4':
							material.uniforms[ name ].value = new Matrix4().fromArray( uniform.value );
							break;

						default:
							material.uniforms[ name ].value = uniform.value;

					}

				}

			}

			if ( json.vertexShader !== undefined ) material.vertexShader = json.vertexShader;
			if ( json.fragmentShader !== undefined ) material.fragmentShader = json.fragmentShader;
			if ( json.extensions !== undefined ) {

				for ( const key in json.extensions ) {

					material.extensions[ key ] = json.extensions[ key ];

				}

			}

		} else if ( material.isSpriteMaterial ) {

			if ( json.rotation !== undefined ) material.rotation = json.rotation;

		}

		// Deprecated

		if ( json.shading !== undefined ) material.flatShading = json.shading === 1; // THREE.FlatShading

		return material;

	}

	setTextures( value ) {

		this.textures = value;
		return this;

	}

}


export { MaterialLoader };
