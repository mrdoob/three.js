/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { TextureNode } from './TextureNode.js';

function RTTNode( width, height, input, options ) {

	this.input = input;
	
	this.clear = true;
	
	this.rtt = new THREE.WebGLRenderTarget( width, height, options );
	
	this.material = new THREE.NodeMaterial();
	
	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

	TextureNode.call( this, this.rtt.texture );

};

RTTNode.prototype = Object.create( TextureNode.prototype );
RTTNode.prototype.constructor = RTTNode;
RTTNode.prototype.nodeType = "RTT";

RTTNode.prototype.generate = function ( builder, output ) {
	
	this.material.fragment.value = this.input;
	
	return TextureNode.prototype.generate.call( this, builder, output );
};

RTTNode.prototype.updateFrame = function ( frame ) {
	
	if ( frame.renderer ) {
		
		frame.renderer.render( this.scene, this.camera, this.rtt, this.clear );
		
	} else {
		
		console.warn("RTTNode need a renderer in NodeFrame")
		
	}
	
};

export { RTTNode };
