/**
 * @author sunag / http://www.sunag.com.br/
 */

import { MeshStandardNode } from './nodes/MeshStandardNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function MeshStandardNodeMaterial() {

	var node = new MeshStandardNode();

	NodeMaterial.call( this, node, node );

	this.type = "MeshStandardNodeMaterial";

}

MeshStandardNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;

NodeUtils.addShortcuts( MeshStandardNodeMaterial.prototype, 'properties', [
	"color",
	"roughness",
	"metalness",
	"map",
	"normalMap",
	"normalScale",
	"metalnessMap",
	"roughnessMap",
	"envMap"
] );

export { MeshStandardNodeMaterial };
