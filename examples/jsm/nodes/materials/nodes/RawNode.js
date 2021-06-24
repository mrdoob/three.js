import { Node } from '../../core/Node.js';

class RawNode extends Node {

	constructor( value ) {

		super( 'v4' );

		this.value = value;

	}

	generate( builder ) {

		const data = this.value.analyzeAndFlow( builder, this.type );
		let code = data.code + '\n';

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

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}

RawNode.prototype.nodeType = 'Raw';

export { RawNode };
