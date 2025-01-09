import Node from '../core/Node.js';
import { reference } from './ReferenceNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './Normal.js';
import { nodeImmutable, float, vec2, vec3, mat2 } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';
import { normalMap } from '../display/NormalMapNode.js';
import { bumpMap } from '../display/BumpMapNode.js';
import { Vector2 } from '../../math/Vector2.js';

/** @module MaterialNode **/

const _propertyCache = new Map();

/**
 * This class should simplify the node access to material properties.
 * It internal uses reference nodes to make sure  changes to material
 * properties are automatically reflected to predefined TSL objects
 * like e.g. `materialColor`.
 *
 * @augments Node
 */
class MaterialNode extends Node {

	static get type() {

		return 'MaterialNode';

	}

	/**
	 * Constructs a new material node.
	 *
	 * @param {String} scope - The scope defines what kind of material property is referred by the node.
	 */
	constructor( scope ) {

		super();

		/**
		 * The scope defines what material property is referred by the node.
		 *
		 * @type {String}
		 */
		this.scope = scope;

	}

	/**
	 * Returns a cached reference node for the given property and type.
	 *
	 * @param {String} property - The name of the material property.
	 * @param {String} type - The uniform type of the property.
	 * @return {MaterialReferenceNode} A material reference node representing the property access.
	 */
	getCache( property, type ) {

		let node = _propertyCache.get( property );

		if ( node === undefined ) {

			node = materialReference( property, type );

			_propertyCache.set( property, node );

		}

		return node;

	}

	/**
	 * Returns a float-typed material reference node for the given property name.
	 *
	 * @param {String} property - The name of the material property.
	 * @return {MaterialReferenceNode<float>} A material reference node representing the property access.
	 */
	getFloat( property ) {

		return this.getCache( property, 'float' );

	}

	/**
	 * Returns a color-typed material reference node for the given property name.
	 *
	 * @param {String} property - The name of the material property.
	 * @return {MaterialReferenceNode<color>} A material reference node representing the property access.
	 */
	getColor( property ) {

		return this.getCache( property, 'color' );

	}

	/**
	 * Returns a texture-typed material reference node for the given property name.
	 *
	 * @param {String} property - The name of the material property.
	 * @return {MaterialReferenceNode} A material reference node representing the property access.
	 */
	getTexture( property ) {

		return this.getCache( property === 'map' ? 'map' : property + 'Map', 'texture' );

	}

	/**
	 * The node setup is done depending on the selected scope. Multiple material properties
	 * might be grouped into a single node composition if they logically belong together.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The node representing the selected scope.
	 */
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

			const specularIntensityNode = this.getFloat( scope );

			if ( material.specularIntensityMap && material.specularIntensityMap.isTexture === true ) {

				node = specularIntensityNode.mul( this.getTexture( scope ).a );

			} else {

				node = specularIntensityNode;

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
				node.normalMapType = material.normalMapType;

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

		} else if ( scope === MaterialNode.AO ) {

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
MaterialNode.POINT_SIZE = 'size';
MaterialNode.DISPERSION = 'dispersion';
MaterialNode.LIGHT_MAP = 'light';
MaterialNode.AO = 'ao';

export default MaterialNode;

/**
 * TSL object that represents alpha test of the current material.
 *
 * @type {Node<float>}
 */
export const materialAlphaTest = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );

/**
 * TSL object that represents the diffuse color of the current material.
 * The value is composed via `color` * `map`.
 *
 * @type {Node<vec3>}
 */
export const materialColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.COLOR );

/**
 * TSL object that represents the shininess of the current material.
 *
 * @type {Node<float>}
 */
export const materialShininess = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHININESS );

/**
 * TSL object that represents the emissive color of the current material.
 * The value is composed via `emissive` * `emissiveIntensity` * `emissiveMap`.
 *
 * @type {Node<vec3>}
 */
export const materialEmissive = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );

/**
 * TSL object that represents the opacity of the current material.
 * The value is composed via `opacity` * `alphaMap`.
 *
 * @type {Node<float>}
 */
export const materialOpacity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.OPACITY );

/**
 * TSL object that represents the specular of the current material.
 *
 * @type {Node<vec3>}
 */
export const materialSpecular = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR );

/**
 * TSL object that represents the specular intensity of the current material.
 * The value is composed via `specularIntensity` * `specularMap.a`.
 *
 * @type {Node<float>}
 */
export const materialSpecularIntensity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_INTENSITY );

/**
 * TSL object that represents the specular color of the current material.
 * The value is composed via `specularColor` * `specularMap.rgb`.
 *
 * @type {Node<vec3>}
 */
export const materialSpecularColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );

/**
 * TSL object that represents the specular strength of the current material.
 * The value is composed via `specularMap.r`.
 *
 * @type {Node<float>}
 */
export const materialSpecularStrength = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SPECULAR_STRENGTH );

/**
 * TSL object that represents the reflectivity of the current material.
 *
 * @type {Node<float>}
 */
export const materialReflectivity = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );

/**
 * TSL object that represents the roughness of the current material.
 * The value is composed via `roughness` * `roughnessMap.g`.
 *
 * @type {Node<float>}
 */
export const materialRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );

/**
 * TSL object that represents the metalness of the current material.
 * The value is composed via `metalness` * `metalnessMap.b`.
 *
 * @type {Node<float>}
 */
export const materialMetalness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.METALNESS );

/**
 * TSL object that represents the normal of the current material.
 * The value will be either `normalMap` * `normalScale`, `bumpMap` * `bumpScale` or `normalView`.
 *
 * @type {Node<vec3>}
 */
export const materialNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.NORMAL );

/**
 * TSL object that represents the clearcoat of the current material.
 * The value is composed via `clearcoat` * `clearcoatMap.r`
 *
 * @type {Node<float>}
 */
export const materialClearcoat = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );

/**
 * TSL object that represents the clearcoat roughness of the current material.
 * The value is composed via `clearcoatRoughness` * `clearcoatRoughnessMap.r`.
 *
 * @type {Node<float>}
 */
export const materialClearcoatRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );

/**
 * TSL object that represents the clearcoat normal of the current material.
 * The value will be either `clearcoatNormalMap` or `normalView`.
 *
 * @type {Node<vec3>}
 */
export const materialClearcoatNormal = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_NORMAL );

/**
 * TSL object that represents the rotation of the current sprite material.
 *
 * @type {Node<float>}
 */
export const materialRotation = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ROTATION );

/**
 * TSL object that represents the sheen color of the current material.
 * The value is composed via `sheen` * `sheenColor` * `sheenColorMap`.
 *
 * @type {Node<vec3>}
 */
export const materialSheen = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN );

/**
 * TSL object that represents the sheen roughness of the current material.
 * The value is composed via `sheenRoughness` * `sheenRoughnessMap.a`.
 *
 * @type {Node<float>}
 */
export const materialSheenRoughness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );

/**
 * TSL object that represents the anisotropy of the current material.
 *
 * @type {Node<vec2>}
 */
export const materialAnisotropy = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ANISOTROPY );

/**
 * TSL object that represents the iridescence of the current material.
 *
 * @type {Node<float>}
 */
export const materialIridescence = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );

/**
 * TSL object that represents the iridescence IOR of the current material.
 *
 * @type {Node<float>}
 */
export const materialIridescenceIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );

/**
 * TSL object that represents the iridescence thickness of the current material.
 *
 * @type {Node<float>}
 */
export const materialIridescenceThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );

/**
 * TSL object that represents the transmission of the current material.
 * The value is composed via `transmission` * `transmissionMap.r`.
 *
 * @type {Node<float>}
 */
export const materialTransmission = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.TRANSMISSION );

/**
 * TSL object that represents the thickness of the current material.
 * The value is composed via `thickness` * `thicknessMap.g`.
 *
 * @type {Node<float>}
 */
export const materialThickness = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.THICKNESS );

/**
 * TSL object that represents the IOR of the current material.
 *
 * @type {Node<float>}
 */
export const materialIOR = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.IOR );

/**
 * TSL object that represents the attenuation distance of the current material.
 *
 * @type {Node<float>}
 */
export const materialAttenuationDistance = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_DISTANCE );

/**
 * TSL object that represents the attenuation color of the current material.
 *
 * @type {Node<vec3>}
 */
export const materialAttenuationColor = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.ATTENUATION_COLOR );

/**
 * TSL object that represents the scale of the current dashed line material.
 *
 * @type {Node<float>}
 */
export const materialLineScale = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_SCALE );

/**
 * TSL object that represents the dash size of the current dashed line material.
 *
 * @type {Node<float>}
 */
export const materialLineDashSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_SIZE );

/**
 * TSL object that represents the gap size of the current dashed line material.
 *
 * @type {Node<float>}
 */
export const materialLineGapSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_GAP_SIZE );

/**
 * TSL object that represents the line width of the current line material.
 *
 * @type {Node<float>}
 */
export const materialLineWidth = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_WIDTH );

/**
 * TSL object that represents the dash offset of the current line material.
 *
 * @type {Node<float>}
 */
export const materialLineDashOffset = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_OFFSET );

/**
 * TSL object that represents the point size of the current points material.
 *
 * @type {Node<float>}
 */
export const materialPointSize = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.POINT_SIZE );

/**
 * TSL object that represents the dispersion of the current material.
 *
 * @type {Node<float>}
 */
export const materialDispersion = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.DISPERSION );

/**
 * TSL object that represents the light map of the current material.
 * The value is composed via `lightMapIntensity` * `lightMap.rgb`.
 *
 * @type {Node<vec3>}
 */
export const materialLightMap = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.LIGHT_MAP );

/**
 * TSL object that represents the ambient occlusion map of the current material.
 * The value is composed via `aoMap.r` - 1 * `aoMapIntensity` + 1.
 *
 * @type {Node<float>}
 */
export const materialAO = /*@__PURE__*/ nodeImmutable( MaterialNode, MaterialNode.AO );

/**
 * TSL object that represents the anisotropy vector of the current material.
 *
 * @type {Node<vec2>}
 */
export const materialAnisotropyVector = /*@__PURE__*/ uniform( new Vector2() ).onReference( function ( frame ) {

	return frame.material;

} ).onRenderUpdate( function ( { material } ) {

	this.value.set( material.anisotropy * Math.cos( material.anisotropyRotation ), material.anisotropy * Math.sin( material.anisotropyRotation ) );

} );
