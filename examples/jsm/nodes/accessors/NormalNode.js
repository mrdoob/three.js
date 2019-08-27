/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';
import { ReflectNode } from './ReflectNode.js';

function NormalNode( scope ) {

	TempNode.call( this, 'v3' );

	this.scope = scope;

	this.unique = true;

}

NormalNode.LOCAL = 'local';
NormalNode.WORLD = 'world';
NormalNode.VIEW = 'view';

NormalNode.prototype = Object.create( TempNode.prototype );
NormalNode.prototype.constructor = NormalNode;
NormalNode.prototype.nodeType = "Normal";

NormalNode.prototype.generate = function ( builder, output ) {

	var result, setVaryCode;

	var nodeData = builder.getNodeData( this );

	switch ( this.scope ) {

		case NormalNode.VIEW:

			result = builder.isShader( 'vertex' ) ? 'transformedNormal' : 'geometryNormal';

			break;

		case NormalNode.LOCAL:

			builder.addVaryNodeCode( this, 'varying vec3 vObjectNormal;' );

			setVaryCode = 'vObjectNormal = objectNormal;'

			if ( builder.isShader( 'vertex' ) ) {

				nodeData.defined = true;

				builder.addNodeCode( setVaryCode );

			} else if ( ! nodeData.defined ) {

				builder.addVertexFinalNodeCode( this, setVaryCode );

			}

			result = 'vObjectNormal';

			break;

		case NormalNode.WORLD:

			var reflectVec = new ReflectNode( ReflectNode.VECTOR ).build( builder, 'v3' );

			builder.addVaryNodeCode( this, 'varying vec3 vWNormal;' );

			setVaryCode = `vWNormal = inverseTransformDirection( transformedNormal, viewMatrix ).xyz;`;

			if ( builder.isShader( 'vertex' ) ) {

				nodeData.defined = true;

				builder.addNodeCode( setVaryCode );

			} else if ( ! nodeData.defined ) {

				builder.addVertexFinalNodeCode( this, setVaryCode );

			}

			result = 'vWNormal';

			break;

	}

	return builder.format( result, this.getType( builder ), output );

};

NormalNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.scope = source.scope;

	return this;

};

NormalNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;

	}

	return data;

};

NodeLib.addKeyword( 'normal.view', function () {

	return new NormalNode( NormalNode.VIEW );

} );

NodeLib.addKeyword( 'normal.local', function () {

	return new NormalNode( NormalNode.LOCAL );

} );

NodeLib.addKeyword( 'normal.world', function () {

	return new NormalNode( NormalNode.WORLD );

} );

export { NormalNode };
