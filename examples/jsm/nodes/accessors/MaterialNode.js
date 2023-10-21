import Node, { addNodeClass } from '../core/Node.js';
import { reference } from './ReferenceNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { normalView } from './NormalNode.js';
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

		return this.getCache( property === 'map' ? 'map' : property + 'Map', 'texture' );

	}

	setup( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.COLOR ) {

			const colorNode = this.getColor( scope );

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

				node = this.getTexture( scope ).r;

			} else {

				node = float( 1 );

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

			const emissiveNode = this.getColor( scope );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( scope ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.NORMAL ) {

			if ( material.normalMap ) {

				node = this.getTexture( 'normal' ).normalMap( this.getCache( 'normalScale', 'vec2' ) );

			} else if ( material.bumpMap ) {

				node = this.getTexture( 'bump' ).r.bumpMap( this.getFloat( 'bumpScale' ) );

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

				node = this.getTexture( scope ).normalMap( this.getCache( scope + 'Scale', 'vec2' ) );

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

		} else if ( scope === MaterialNode.IRIDESCENCE_THICKNESS ) {

			const iridescenceThicknessMaximum = reference( 1, 'float', material.iridescenceThicknessRange );

			if ( material.iridescenceThicknessMap ) {

				const iridescenceThicknessMinimum = reference( 0, 'float', material.iridescenceThicknessRange );

				node = iridescenceThicknessMaximum.sub( iridescenceThicknessMinimum ).mul( this.getTexture( scope ).g ).add( iridescenceThicknessMinimum );

			} else {

				node = iridescenceThicknessMaximum;

			}

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
MaterialNode.SPECULAR_COLOR = 'specular';
MaterialNode.SPECULAR_STRENGTH = 'specularStrength';
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
MaterialNode.IRIDESCENCE = 'iridescence';
MaterialNode.IRIDESCENCE_IOR = 'iridescenceIOR';
MaterialNode.IRIDESCENCE_THICKNESS = 'iridescenceThickness';
MaterialNode.LINE_SCALE = 'scale';
MaterialNode.LINE_DASH_SIZE = 'dashSize';
MaterialNode.LINE_GAP_SIZE = 'gapSize';
MaterialNode.LINE_WIDTH = 'linewidth';
MaterialNode.LINE_DASH_OFFSET = 'dashOffset';
MaterialNode.POINT_WIDTH = 'pointWidth';

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
export const materialNormal = nodeImmutable( MaterialNode, MaterialNode.NORMAL );
export const materialClearcoat = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT );
export const materialClearcoatRoughness = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_ROUGHNESS );
export const materialClearcoatNormal = nodeImmutable( MaterialNode, MaterialNode.CLEARCOAT_NORMAL );
export const materialRotation = nodeImmutable( MaterialNode, MaterialNode.ROTATION );
export const materialSheen = nodeImmutable( MaterialNode, MaterialNode.SHEEN );
export const materialSheenRoughness = nodeImmutable( MaterialNode, MaterialNode.SHEEN_ROUGHNESS );
export const materialIridescence = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE );
export const materialIridescenceIOR = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_IOR );
export const materialIridescenceThickness = nodeImmutable( MaterialNode, MaterialNode.IRIDESCENCE_THICKNESS );
export const materialLineScale = nodeImmutable( MaterialNode, MaterialNode.LINE_SCALE );
export const materialLineDashSize = nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_SIZE );
export const materialLineGapSize = nodeImmutable( MaterialNode, MaterialNode.LINE_GAP_SIZE );
export const materialLineWidth = nodeImmutable( MaterialNode, MaterialNode.LINE_WIDTH );
export const materialLineDashOffset = nodeImmutable( MaterialNode, MaterialNode.LINE_DASH_OFFSET );
export const materialPointWidth = nodeImmutable( MaterialNode, MaterialNode.POINT_WIDTH );

addNodeClass( 'MaterialNode', MaterialNode );
