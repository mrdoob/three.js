/**
 * @author sunag / http://www.sunag.com.br/
 */

import { FunctionNode } from '../core/FunctionNode.js';
import { Matrix3Node } from '../inputs/Matrix3Node.js';
import { UVNode } from '../accessors/UVNode.js';
 
function UVTransformNode( uv, transform ) {

	FunctionNode.call( this, "( uvTransform * vec3( uvNode, 1 ) ).xy", "vec2" );

	this.uv = uv || new UVNode();
	this.transform = transform || new Matrix3Node();

};

UVTransformNode.prototype = Object.create( FunctionNode.prototype );
UVTransformNode.prototype.constructor = UVTransformNode;
UVTransformNode.prototype.nodeType = "UVTransform";

UVTransformNode.prototype.generate = function ( builder, output ) {

	this.keywords[ "uvNode" ] = this.uv;
	this.keywords[ "uvTransform" ] = this.transform;

	return FunctionNode.prototype.generate.call( this, builder, output );

};

UVTransformNode.prototype.setUvTransform = function ( tx, ty, sx, sy, rotation, cx, cy ) {

	cx = cx !== undefined ? cx : .5;
	cy = cy !== undefined ? cy : .5;

	this.transform.value.setUvTransform( tx, ty, sx, sy, rotation, cx, cy );

};

UVTransformNode.prototype.copy = function ( source ) {
			
	FunctionNode.prototype.copy.call( this, source );
	
	this.uv = source.uv;
	this.transform = source.transform;
					
};

UVTransformNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;
		data.transform = this.transform.toJSON( meta ).uuid;

	}

	return data;

};

export { UVTransformNode };