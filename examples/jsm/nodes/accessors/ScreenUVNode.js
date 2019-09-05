/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { ResolutionNode } from './ResolutionNode.js';

export class ScreenUVNode extends TempNode {

	constructor( resolution ) {

		super( 'v2' );

		this.resolution = resolution || new ResolutionNode();

		this.nodeType = "ScreenUV";

	}

	generate( builder, output ) {

		var result;

		if ( builder.isShader( 'fragment' ) ) {

			result = '( gl_FragCoord.xy / ' + this.resolution.build( builder, 'v2' ) + ')';

		} else {

			console.warn( "THREE.ScreenUVNode is not compatible with " + builder.shader + " shader." );

			result = 'vec2( 0.0 )';

		}

		return builder.format( result, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.resolution = source.resolution;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.resolution = this.resolution.toJSON( meta ).uuid;

		}

		return data;

	}

}
