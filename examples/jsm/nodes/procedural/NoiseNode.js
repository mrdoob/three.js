import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { UVNode } from '../accessors/UVNode.js';

function NoiseNode( uv ) {

	TempNode.call( this, 'f' );

	this.uv = uv || new UVNode();

}

NoiseNode.prototype = Object.create( TempNode.prototype );
NoiseNode.prototype.constructor = NoiseNode;
NoiseNode.prototype.nodeType = 'Noise';

NoiseNode.Nodes = ( function () {

	var snoise = new FunctionNode( [
		'float snoise(vec2 co) {',

		'	return fract( sin( dot( co.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );',

		'}'
	].join( '\n' ) );

	return {
		snoise: snoise
	};

} )();

NoiseNode.prototype.generate = function ( builder, output ) {

	var snoise = builder.include( NoiseNode.Nodes.snoise );

	return builder.format( snoise + '( ' + this.uv.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

};

NoiseNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.uv = source.uv;

	return this;

};

NoiseNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;

	}

	return data;

};

export { NoiseNode };
