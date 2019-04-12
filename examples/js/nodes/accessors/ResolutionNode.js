/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Vector2Node } from '../inputs/Vector2Node.js';

function ResolutionNode() {

	Vector2Node.call( this );

	this.size = new THREE.Vector2();

}

ResolutionNode.prototype = Object.create( Vector2Node.prototype );
ResolutionNode.prototype.constructor = ResolutionNode;
ResolutionNode.prototype.nodeType = "Resolution";

ResolutionNode.prototype.updateFrame = function ( frame ) {

	if ( frame.renderer ) {

		frame.renderer.getSize( this.size );

		var pixelRatio = frame.renderer.getPixelRatio();

		this.x = this.size.width * pixelRatio;
		this.y = this.size.height * pixelRatio;

	} else {

		console.warn( "ResolutionNode need a renderer in NodeFrame" );

	}

};

ResolutionNode.prototype.copy = function ( source ) {

	Vector2Node.prototype.copy.call( this, source );

	this.renderer = source.renderer;

};

ResolutionNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.renderer = this.renderer.uuid;

	}

	return data;

};

export { ResolutionNode };
