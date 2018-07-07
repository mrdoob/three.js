/**
 * @author sunag / http://www.sunag.com.br/
 */

import { NodeUtils } from '../core/NodeUtils.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { RawNode } from '../materials/nodes/RawNode.js';
import { ScreenNode } from '../inputs/ScreenNode.js';

function NodePass() {

	THREE.ShaderPass.call( this );

	this.name = "";
	this.uuid = THREE.Math.generateUUID();

	this.userData = {};

	this.textureID = 'renderTexture';

	this.fragment = new RawNode( new ScreenNode() );

	this.node = new NodeMaterial();
	this.node.fragment = this.fragment;

	this.needsUpdate = true;

};

NodePass.prototype = Object.create( THREE.ShaderPass.prototype );
NodePass.prototype.constructor = NodePass;

NodeUtils.addShortcuts( NodePass.prototype, 'fragment', [ 'value' ] );

NodePass.prototype.render = function () {

	if ( this.needsUpdate ) {

		this.node.dispose();

		this.needsUpdate = false;

	}

	this.uniforms = this.node.uniforms;
	this.material = this.node;

	THREE.ShaderPass.prototype.render.apply( this, arguments );

};

NodePass.prototype.copy = function ( source ) {
	
	this.value = source.value;
	
};

NodePass.prototype.toJSON = function ( meta ) {

	var isRootObject = ( meta === undefined || typeof meta === 'string' );

	if ( isRootObject ) {

		meta = {
			nodes: {}
		};

	}

	if ( meta && ! meta.passes ) meta.passes = {};

	if ( ! meta.passes[ this.uuid ] ) {

		var data = {};

		data.uuid = this.uuid;
		data.type = "NodePass";

		meta.passes[ this.uuid ] = data;

		if ( this.name !== "" ) data.name = this.name;

		if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

		data.value = this.value.toJSON( meta ).uuid;

	}

	meta.pass = this.uuid;

	return meta;

};

export { NodePass };
