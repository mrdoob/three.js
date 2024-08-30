import Node, { registerNode } from '../core/Node.js';
import { reference } from './ReferenceNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './Normal.js';
import { nodeImmutable, float, vec2, vec3, mat2 } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { bumpMap } from '../display/BumpMapNode.js';

import { Vector2 } from '../../math/Vector2.js';

const _propertyCache = new Map();

class MaterialNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

	}

	getCache( property, type ) {

		let node = _propertyCache.get( property );

		if ( node === undefined ) {

			node = materialReference( property, type );

			_propertyCache.set( property, node );

		}

		return node;

	}

	getFloat( property ) {

		return this.getCache( property, 'float' );

	}

	getColor( property ) {

		return this.getCache( property, 'color' );

	}

	getTexture( property ) {

		return this.getCache( property === 'map' ? 'map' : property + 'Map', 'texture' );

	}

	setup( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.COLOR ) {

			const colorNode = material.color !== undefined ? this.getColor( scope ) : vec3();

			if ( material.map && material.map.isTexture === true ) {

				node = colorNode.mul( this.getTexture( 'map' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = this.getFloat( scope );

			if ( material.alphaMap && material.alphaMap.isTexture === true ) {

				node = opacityNode.mul( this.getTexture( 'alpha' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SPECULAR_STRENGTH ) {

			if ( material.specularMap && material.specularMap.isTexture === true ) {

				node = this.getTexture( 'specular' ).r;

			} else {

				node = float( 1 );

			}

		} else if ( scope === MaterialNode.SPECULAR_INTENSITY ) {

			const specularIntensity = this.getFloat( scope );

			if ( material.specularMap ) {

				node = specularIntensity.mul( this.getTexture( scope ).a );

			} else {

				node = specularIntensity;

			}

		} else if ( scope === MaterialNode.SPECULAR_COLOR ) {

			const specularColorNode = this.getColor( scope );

			if ( material.specularColorMap && material.specularColorMap.isTexture === true ) {

				node = specularColorNode.mul( this.getTexture( scope ).rgb );

			} else {

				node = specularColorNode;

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) { // TODO: cleanup similar branches

			const roughnessNode = this.getFloat( scope );

			if ( material.roughnessMap && material.roughnessMap.isTexture === true ) {

				node = roughnessNode.mul( this.getTexture( scope ).g );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = this.getFloat( scope );

			if ( material.metalnessMap && material.metalnessMap.isTexture === true ) {

				node = metalnessNode.mul( this.getTexture( scope ).b );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveIntensityNode = this.getFloat( 'emissiveIntensity' );
			const emissiveNode = this.getColor( scope ).mul( emissiveIntensityNode );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( scope ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.NORMAL ) {

			if ( material.normalMap ) {

				node = normalMap( this.getTexture( 'normal' ), this.getCache( 'normalScale', 'vec2' ) );

			} else if ( material.bumpMap ) {

				node = bumpMap( this.getTexture( 'bump' ).r, this.getFloat( 'bumpScale' ) );

			} else {

				node = normalView;

			}

		} else if ( scope === MaterialNode.CLEARCOAT ) {

			const clearcoatNode = this.getFloat( scope );

			if ( material.clearcoatMap && material.clearcoatMap.isTexture === true ) {

				node = clearcoatNode.mul( this.getTexture( scope ).r );

			} else {

				node = clearcoatNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT_ROUGHNESS ) {

			const clearcoatRoughnessNode = this.getFloat( scope );

			if ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture === true ) {

				node = clearcoatRoughnessNode.mul( this.getTexture( scope ).r );

			} else {

				node = clearcoatRoughnessNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT_NORMAL ) {

			if ( material.clearcoatNormalMap ) {

				node = normalMap( this.getTexture( scope ), this.getCache( scope + 'Scale', 'vec2' ) );

			} else {

				node = normalView;

			}

		} else if ( scope === MaterialNode.SHEEN ) {

			const sheenNode = this.getColor( 'sheenColor' ).mul( this.getFloat( 'sheen' ) ); // Move this mul() to CPU

			if ( material.sheenColorMap && material.sheenColorMap.isTexture === true ) {

				node = sheenNode.mul( this.getTexture( 'sheenColor' ).rgb );

			} else {

				node = sheenNode;

			}

		} else if ( scope === MaterialNode.SHEEN_ROUGHNESS ) {

			const sheenRoughnessNode = this.getFloat( scope );

			if ( material.sheenRoughnessMap && material.sheenRoughnessMap.isTexture === true ) {

				node = sheenRoughnessNode.mul( this.getTexture( scope ).a );

			} else {

				node = sheenRoughnessNode;

			}

			node = node.clamp( 0.07, 1.0 );

		} else if ( scope === MaterialNode.ANISOTROPY ) {

			if ( material.anisotropyMap && material.anisotropyMap.isTexture === true ) {

				const anisotropyPolar = this.getTexture( scope );
				const anisotropyMat = mat2( materialAnisotropyVector.x, materialAnisotropyVector.y, materialAnisotropyVector.y.negate(), materialAnisotropyVector.x );

				node = anisotropyMat.mul( anisotropyPolar.rg.mul( 2.0 ).sub( vec2( 1.0 ) ).normalize().mul( anisotropyPolar.b ) );

			} else {

				node = materialAnisotropyVector;

			}

		} else if ( scope === MaterialNode.IRIDESCENCE_THICKNESS ) {

			const iridescenceThicknessMaximum = reference( '1', 'float', material.iridescenceThicknessRange );

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMinimum = reference( '0', 'float', material.iridescenceThicknessRange );

				node = iridescenceThicknessMaximum.sub( iridescenceThicknessMinimum ).mul( this.getTexture( scope ).g ).add( iridescenceThicknessMinimum );

			} else {

				node = iridescenceThicknessMaximum;

			}

		} else if ( scope === MaterialNode.TRANSMISSION ) {

			const transmissionNode = this.getFloat( scope );

			if ( material.transmissionMap ) {

				node = transmissionNode.mul( this.getTexture( scope ).r );

			} else {

				node = transmissionNode;

			}

		} else if ( scope === MaterialNode.THICKNESS ) {

			const thicknessNode = this.getFloat( scope );

			if ( material.thicknessMap ) {

				node = thicknessNode.mul( this.getTexture( scope ).g );

			} else {

				node = thicknessNode;

			}

		} else if ( scope === MaterialNode.IOR ) {

			node = this.getFloat( scope );

		} else if ( scope === MaterialNode.LIGHT_MAP ) {

			node = this.getTexture( scope ).rgb.mul( this.getFloat( 'lightMapIntensity' ) );

		} else if ( scope === MaterialNode.AO_MAP ) {

			node = this.getTexture( scope ).r.sub( 1.0 ).mul( this.getFloat( 'aoMapIntensity' ) ).add( 1.0 );

		} else {

			const outputType = this.getNodeType( builder );

			node = this.getCache( scope, outputType );

		}

		return node;

	}

}

MaterialNode.ALPHA_TEST = 'alphaTest';
MaterialNode.COLOR = 'color';
MaterialNode.OPACITY = 'opacity';
MaterialNode.SHININESS = 'shininess';
MaterialNode.SPECULAR = 'specular';
MaterialNode.SPECULAR_STRENGTH = 'specularStrength';
MaterialNode.SPECULAR_INTENSITY = 'specularIntensity';
MaterialNode.SPECULAR_COLOR = 'specularColor';
MaterialNode.REFLECTIVITY = 'reflectivity';
MaterialNode.ROUGHNESS = 'roughness';
MaterialNode.METALNESS = 'metalness';
MaterialNode.NORMAL = 'normal';
MaterialNode.CLEARCOAT = 'clearcoat';
MaterialNode.CLEARCOAT_ROUGHNESS = 'clearcoatRoughness';
MaterialNode.CLEARCOAT_NORMAL = 'clearcoatNormal';
MaterialNode.EMISSIVE = 'emissive';
MaterialNode.ROTATION = 'rotation';
MaterialNode.SHEEN = 'sheen';
MaterialNode.SHEEN_ROUGHNESS = 'sheenRoughness';
MaterialNode.ANISOTROPY = 'anisotropy';
MaterialNode.IRIDESCENCE = 'iridescence';
MaterialNode.IRIDESCENCE_IOR = 'iridescenceIOR';
MaterialNode.IRIDESCENCE_THICKNESS = 'iridescenceThickness';
MaterialNode.IOR = 'ior';
MaterialNode.TRANSMISSION = 'transmission';
MaterialNode.THICKNESS = 'thickness';
MaterialNode.ATTENUATION_DISTANCE = 'attenuationDistance';
MaterialNode.ATTENUATION_COLOR = 'attenuationColor';
MaterialNode.LINE_SCALE = 'scale';
MaterialNode.LINE_DASH_SIZE = 'dashSize';
MaterialNode.LINE_GAP_SIZE = 'gapSize';
MaterialNode.LINE_WIDTH = 'linewidth';
MaterialNode.LINE_DASH_OFFSET = 'dashOffset';
MaterialNode.POINT_WIDTH = 'pointWidth';
MaterialNode.DISPERSION = 'dispersion';
MaterialNode.LIGHT_MAP = 'light';
MaterialNode.AO_MAP = 'ao';

export default MaterialNode;

MaterialNode.type = /*@__PURE__*/ registerNode( 'Material', MaterialNode );

export const materialAlphaTest = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
export const materialColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.COLOR );
export const materialShininess = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHININESS );
export const materialEmissive = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
export const materialOpacity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.OPACITY );
export const materialSpecular = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR );

export const materialSpecularIntensity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_INTENSITY );
export const materialSpecularColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );

export const materialSpecularStrength = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_STRENGTH );
export const materialReflectivity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );
export const materialRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
export const materialMetalness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.METALNESS );
export const materialNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.NORMAL ).context( { getUV: null } );
export const materialClearcoat = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );
export const materialClearcoatRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );
export const materialClearcoatNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_NORMAL ).context( { getUV: null } );
export const materialRotation = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROTATION );
export const materialSheen = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN );
export const materialSheenRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );
export const materialAnisotropy = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ANISOTROPY );
export const materialIridescence = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );
export const materialIridescenceIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );
export const materialIridescenceThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );
export const materialTransmission = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.TRANSMISSION );
export const materialThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.THICKNESS );
export const materialIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IOR );
export const materialAttenuationDistance = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_DISTANCE );
export const materialAttenuationColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_COLOR );
export const materialLineScale = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_SCALE );
export const materialLineDashSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_SIZE );
export const materialLineGapSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_GAP_SIZE );
export const materialLineWidth = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_WIDTH );
export const materialLineDashOffset = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_OFFSET );
export const materialPointWidth = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.POINT_WIDTH );
export const materialDispersion = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.DISPERSION );
export const materialLightMap = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LIGHT_MAP );
export const materialAOMap = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.AO_MAP );
export const materialRefractionRatio = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.REFRACTION_RATIO );
export const materialAnisotropyVector = /*@__PURE__*/ uniform( new Vector2() ).onReference( function ( frame ) {

	return frame.material;

} ).onRenderUpdate( function ( { material } ) {

	this.value.set( material.anisotropy * Math.cos( material.anisotropyRotation ), material.anisotropy * Math.sin( material.anisotropyRotation ) );

} );
