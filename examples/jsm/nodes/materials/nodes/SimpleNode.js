/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../../core/Node.js';
import { ColorNode } from '../../inputs/ColorNode.js';

function SimpleNode() {

	Node.call( this );

	this.color = new ColorNode( 0xFFFFFF );

}

SimpleNode.prototype = Object.create( Node.prototype );
SimpleNode.prototype.constructor = SimpleNode;
SimpleNode.prototype.nodeType = "Simple";

SimpleNode.prototype.generate = function ( builder ) {

	var code;

	if ( builder.isShader( 'vertex' ) ) {

		var position = this.position ? this.position.analyzeAndFlow( builder, 'v3', { cache: 'position' } ) : undefined;

		var output = [
			"vec3 transformed = position;"
		];

		if ( position ) {

			output.push(
				position.code,
				position.result ? "gl_Position = " + position.result + ";" : ''
			);

		} else {

			output.push( "gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0)" );

		}

		code = output.join( "\n" );

	} else {

		// Analyze all nodes to reuse generate codes
		this.color.analyze( builder, { slot: 'color' } );

		if ( this.alpha ) this.alpha.analyze( builder );

		// Build code
		var color = this.color.flow( builder, 'c', { slot: 'color' } );
		var alpha = this.alpha ? this.alpha.flow( builder, 'f' ) : undefined;

		builder.requires.transparent = alpha !== undefined;

		var output = [
			color.code,
		];

		if ( alpha ) {

			output.push(
				alpha.code,
				'#ifdef ALPHATEST',

				' if ( ' + alpha.result + ' <= ALPHATEST ) discard;',

				'#endif'
			);

		}

		if ( alpha ) {

			output.push( "gl_FragColor = vec4(" + color.result + ", " + alpha.result + " );" );

		} else {

			output.push( "gl_FragColor = vec4(" + color.result + ", 1.0 );" );

		}

		code = output.join( "\n" );

	}

	return code;

};

SimpleNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	this.position = source.position;
	this.color = source.color;
	this.alpha = source.alpha;

	return this;

};

SimpleNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.position = this.position.toJSON( meta ).uuid;
		data.color = this.color.toJSON( meta ).uuid;
		data.alpha = this.alpha.toJSON( meta ).uuid;

	}

	return data;

};

export { SimpleNode };
