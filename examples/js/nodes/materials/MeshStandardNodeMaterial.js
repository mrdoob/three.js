/**
 * @author sunag / http://www.sunag.com.br/
 */

import { MeshStandardNode } from './nodes/MeshStandardNode.js';
import { NodeMaterial } from './NodeMaterial.js';
import { NodeUtils } from '../core/NodeUtils.js';

function MeshStandardNodeMaterial( parameters ) {

	var node = new MeshStandardNode();

	NodeMaterial.call( this, node, node );

	this.type = "MeshStandardNodeMaterial";

	this.setValues( parameters );

}

MeshStandardNodeMaterial.prototype = Object.create( NodeMaterial.prototype );
MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial;

NodeUtils.addShortcuts( MeshStandardNodeMaterial.prototype, 'properties', [
	"color",
	"emissive",
	"emissiveMap",
	"emissiveIntensity",
	"ao",
	"aoMap",
	"aoMapIntensity",
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
