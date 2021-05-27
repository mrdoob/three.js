import { Material } from './Material.js';
import { BasicDepthPacking } from '../constants.js';

/**
 * @typedef { import('../textures/Texture.js').Texture } THREE.Texture
 */
/**
 * @param {Parameters} parameters
 * @template {{
 *  opacity: number,
 *  map: new THREE.Texture,
 *  alphaMap: new THREE.Texture,
 *  displacementMap: new THREE.Texture,
 *  displacementScale: number,
 *  displacementBias: number,
 *  wireframe: number,
 *  wireframeLinewidth: number
 * }} Parameters
 */

class MeshDepthMaterial extends Material {

	constructor( parameters ) {

		super();

		this.type = 'MeshDepthMaterial';

		this.depthPacking = BasicDepthPacking;

		this.morphTargets = false;

		this.map = null;

		this.alphaMap = null;

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.wireframe = false;
		this.wireframeLinewidth = 1;

		this.fog = false;

		this.setValues( parameters );

	}

	copy( source ) {

		super.copy( source );

		this.depthPacking = source.depthPacking;

		this.morphTargets = source.morphTargets;

		this.map = source.map;

		this.alphaMap = source.alphaMap;

		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		return this;

	}

}

MeshDepthMaterial.prototype.isMeshDepthMaterial = true;

export { MeshDepthMaterial };
