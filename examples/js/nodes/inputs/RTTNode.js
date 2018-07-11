/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeMaterial } from '../materials/NodeMaterial.js';
import { TextureNode } from './TextureNode.js';

function RTTNode( width, height, input, options ) {

	options = options || {};

	this.input = input;
	
	this.clear = options.clear !== undefined ? options.clear : true;
	
	this.renderTarget = new THREE.WebGLRenderTarget( width, height, options );
	
	this.material = new THREE.NodeMaterial();
	
	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

	this.render = true;
	
	TextureNode.call( this, this.renderTarget.texture );

};

RTTNode.prototype = Object.create( TextureNode.prototype );
RTTNode.prototype.constructor = RTTNode;
RTTNode.prototype.nodeType = "RTT";

RTTNode.prototype.build = function ( builder, output, uuid ) {
	
	var rttBuilder = new THREE.NodeBuilder();
	rttBuilder.nodes = builder.nodes;
	rttBuilder.updaters = builder.updaters;
	
	this.material.fragment.value = this.input;
	this.material.build( { builder: rttBuilder } );
	
	return TextureNode.prototype.build.call( this, builder, output, uuid );
};

RTTNode.prototype.updateFrame = function ( frame ) {
	
	if ( frame.renderer ) {
		
		if (this.render) {
			
			frame.renderer.render( this.scene, this.camera, this.renderTarget, this.clear );
			
		}
		
		if (this.saveToRTT) {
			
			this.saveToRTT.render = false;
			
			if (this.saveToRTT !== this.saveToRTTCurrent) {
				
				if (this.saveToRTTMaterial) this.saveToRTTMaterial.dispose();
				
				var material = new THREE.NodeMaterial();
				material.fragment.value = this;
				material.build();
				
				var scene = new THREE.Scene();
				
				var quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), material );
				quad.frustumCulled = false; // Avoid getting clipped
				scene.add( quad );
				
				this.saveToRTTScene = scene;
				this.saveToRTTMaterial = material;
				
			}
			
			this.saveToRTTCurrent = this.saveToRTT;

			frame.renderer.render( this.saveToRTTScene, this.camera, this.saveToRTT.renderTarget, this.saveToRTT.clear );
			
		}
		
	} else {
		
		console.warn("RTTNode need a renderer in NodeFrame")
		
	}
	
};

RTTNode.prototype.copy = function ( source ) {
			
	TextureNode.prototype.copy.call( this, source );
	
	this.saveToRTT = source.saveToRTT;
	
};

RTTNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {
		
		data = THREE.TextureNode.prototype.toJSON.call( this, meta );

		if (this.saveToRTT) data.saveToRTT = this.saveToRTT.toJSON( meta ).uuid;

	}

	return data;

};

export { RTTNode };
