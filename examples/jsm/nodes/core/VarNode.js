import { Node } from './Node.js';

class VarNode extends Node {

	constructor( type, value ) {

		super( type );

		this.value = value;

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.type );

	}

	generate( builder, output ) {

		const varying = builder.getVar( this.uuid, this.type );

		if ( this.value && builder.isShader( 'vertex' ) ) {

			builder.addNodeCode( varying.name + ' = ' + this.value.build( builder, this.getType( builder ) ) + ';' );

		}

		return builder.format( varying.name, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.type = source.type;
		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.type = this.type;

			if ( this.value ) data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}

VarNode.prototype.nodeType = 'Var';

export { VarNode };
