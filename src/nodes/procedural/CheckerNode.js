/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

function CheckerNode( uv ) {

	TempNode.call( this, 'f' );

	this.uv = uv || new UVNode();

}

CheckerNode.prototype = Object.create( TempNode.prototype );
CheckerNode.prototype.constructor = CheckerNode;
CheckerNode.prototype.nodeType = "Noise";

CheckerNode.Nodes = ( function () {

	// https://github.com/mattdesl/glsl-checker/blob/master/index.glsl

	var checker = new FunctionNode( [
		"float checker( vec2 uv ) {",

		"	float cx = floor( uv.x );",
		"	float cy = floor( uv.y ); ",
		"	float result = mod( cx + cy, 2.0 );",

		"	return sign( result );",

		"}"
	].join( "\n" ) );

	return {
		checker: checker
	};

} )();

CheckerNode.prototype.generate = function ( builder, output ) {

	var snoise = builder.include( CheckerNode.Nodes.checker );

	return builder.format( snoise + '( ' + this.uv.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

};

CheckerNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.uv = source.uv;

	return this;

};

CheckerNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;

	}

	return data;

};

export { CheckerNode };
