/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeLib } from '../core/NodeLib.js';
import { ReflectNode } from './ReflectNode.js';

export class NormalNode extends TempNode {

	constructor( scope ) {

		super( 'v3' );

		this.scope = scope;

		this.unique = true;

		this.nodeType = "Normal";

	}

	generate( builder, output ) {

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

	}

	copy( source ) {

		super.copy( source );

		this.scope = source.scope;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.scope = this.scope;

		}

		return data;

	}
	
}

NormalNode.LOCAL = 'normal.local';
NormalNode.WORLD = 'normal.world';
NormalNode.VIEW = 'normal.view';

NodeLib.addStaticKeywords( NormalNode );
