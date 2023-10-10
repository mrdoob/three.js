import Node, { addNodeClass } from '../core/Node.js';
import { reference } from './ReferenceNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { nodeImmutable, float } from '../shadernode/ShaderNode.js';

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

		return this.getCache( property, 'texture' );

	}

	setup( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.ALPHA_TEST || scope === MaterialNode.SHININESS || scope === MaterialNode.REFLECTIVITY || scope === MaterialNode.ROTATION || scope === MaterialNode.IRIDESCENCE || scope === MaterialNode.IRIDESCENCE_IOR ) {

			node = this.getFloat( scope );

		} else if ( scope === MaterialNode.SPECULAR_COLOR ) {

			node = this.getColor( 'specular' );

		} else if ( scope === MaterialNode.COLOR ) {

			const colorNode = this.getColor( 'color' );

			if ( material.map && material.map.isTexture === true ) {

				node = colorNode.mul( this.getTexture( 'map' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = this.getFloat( 'opacity' );

			if ( material.alphaMap && material.alphaMap.isTexture === true ) {

				node = opacityNode.mul( this.getTexture( 'alphaMap' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SPECULAR_STRENGTH ) {

			if ( material.specularMap && material.specularMap.isTexture === true ) {

				node = this.getTexture( 'specularMap' ).r;

			} else {

				node = float( 1 );

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) {

			const roughnessNode = this.getFloat( 'roughness' );

			if ( material.roughnessMap && material.roughnessMap.isTexture === true ) {

				node = roughnessNode.mul( this.getTexture( 'roughnessMap' ).g );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = this.getFloat( 'metalness' );

			if ( material.metalnessMap && material.metalnessMap.isTexture === true ) {

				node = metalnessNode.mul( this.getTexture( 'metalnessMap' ).b );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveNode = this.getColor( 'emissive' );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( 'emissiveMap' ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT ) {

			const clearcoatNode = this.getFloat( 'clearcoat' );

			if ( material.clearcoatMap && material.clearcoatMap.isTexture === true ) {

				node = clearcoatNode.mul( this.getTexture( 'clearcoatMap' ).r );

			} else {

				node = clearcoatNode;

			}

		} else if ( scope === MaterialNode.CLEARCOAT_ROUGHNESS ) {

			const clearcoatRoughnessNode = this.getFloat( 'clearcoatRoughness' );

			if ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture === true ) {

				node = clearcoatRoughnessNode.mul( this.getTexture( 'clearcoatRoughnessMap' ).r );

			} else {

				node = clearcoatRoughnessNode;

			}

		} else if ( scope === MaterialNode.SHEEN ) {

			const sheenNode = this.getColor( 'sheenColor' ).mul( this.getFloat( 'sheen' ) ); // Move this mul() to CPU

			if ( material.sheenColorMap && material.sheenColorMap.isTexture === true ) {

				node = sheenNode.mul( this.getTexture( 'sheenColorMap' ).rgb );

			} else {

				node = sheenNode;

			}

		} else if ( scope === MaterialNode.SHEEN_ROUGHNESS ) {

			const sheenRoughnessNode = this.getFloat( 'sheenRoughness' );

			if ( material.sheenRoughnessMap && material.sheenRoughnessMap.isTexture === true ) {

				node = sheenRoughnessNode.mul( this.getTexture( 'sheenRoughnessMap' ).a );

			} else {

				node = sheenRoughnessNode;

			}

			node = node.clamp( 0.07, 1.0 );

		} else if ( scope === MaterialNode.IRIDESCENCE_THICKNESS ) {

			const iridescenceThicknessMaximum = reference( 1, 'float', material.iridescenceThicknessRange );

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMinimum = reference( 0, 'float', material.iridescenceThicknessRange );

				node = iridescenceThicknessMaximum.sub( iridescenceThicknessMinimum ).mul( this.getTexture( 'iridescenceThicknessMap' ).g ).add( iridescenceThicknessMinimum );

			} else {

				node = iridescenceThicknessMaximum;

			}

		} else {

			const outputType = this.getNodeType( builder );

			node = materialReference( scope, outputType );

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
MaterialNode.REFLECTIVITY = 'reflectivity';
MaterialNode.ROUGHNESS = 'roughness';
MaterialNode.METALNESS = 'metalness';
MaterialNode.CLEARCOAT = 'clearcoat';
MaterialNode.CLEARCOAT_ROUGHNESS = 'clearcoatRoughness';
MaterialNode.EMISSIVE = 'emissive';
MaterialNode.ROTATION = 'rotation';
MaterialNode.SHEEN = 'sheen';
MaterialNode.SHEEN_ROUGHNESS = 'sheenRoughness';
MaterialNode.IRIDESCENCE = 'iridescence';
MaterialNode.IRIDESCENCE_IOR = 'iridescenceIOR';
MaterialNode.IRIDESCENCE_THICKNESS = 'iridescenceThickness';

export default MaterialNode;

export const materialAlphaTest = nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
export const materialColor = nodeImmutable( MaterialNode, MaterialNode.COLOR );
export const materialShininess = nodeImmutable( MaterialNode, MaterialNode.SHININESS );
export const materialEmissive = nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
export const materialOpacity = nodeImmutable( MaterialNode, MaterialNode.OPACITY );
export const materialSpecularColor = nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );
export const materialSpecularStrength = nodeImmutable( MaterialNode, MaterialNode.SPECULAR_STRENGTH );
export const materialReflectivity = nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );
export const materialRoughness = nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
export const materialMetalness = nodeImmutable( MaterialNode, MaterialNode.METALNESS );
export const materialClearcoat = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );
export const materialClearcoatRoughness = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );
export const materialRotation = nodeImmutable( MaterialNode, MaterialNode.ROTATION );
export const materialSheen = nodeImmutable( MaterialNode, MaterialNode.SHEEN );
export const materialSheenRoughness = nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );
export const materialIridescence = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );
export const materialIridescenceIOR = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );
export const materialIridescenceThickness = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );

addNodeClass( 'MaterialNode', MaterialNode );
