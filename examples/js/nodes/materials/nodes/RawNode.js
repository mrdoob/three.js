/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../../core/Node.js';

function RawNode( value ) {

	Node.call( this, 'v4' );

	this.value = value;

}

RawNode.prototype = Object.create( Node.prototype );
RawNode.prototype.constructor = RawNode;
RawNode.prototype.nodeType = "Raw";

RawNode.prototype.generate = function ( builder ) {

	var data = this.value.parseAndBuildCode( builder, this.type ),
		code = data.code + '\n';

	if ( builder.isShader( 'vertex' ) ) {

		code += 'gl_Position = ' + data.result + ';';

	} else {

		code += 'gl_FragColor = ' + data.result + ';';

	}

	return code;

};

RawNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	this.value = source.value;

};

RawNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};

export { RawNode };
