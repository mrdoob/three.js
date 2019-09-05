/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../../core/Node.js';

export class RawNode extends Node {

	constructor( value ) {

		super( 'v4' );

		this.value = value;

		this.nodeType = "Raw";

	}

	generate( builder ) {

		var data = this.value.analyzeAndFlow( builder, this.type ),
			code = data.code + '\n';

		if ( builder.isShader( 'vertex' ) ) {

			code += 'gl_Position = ' + data.result + ';';

		} else {

			code += 'gl_FragColor = ' + data.result + ';';

		}

		return code;

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}
