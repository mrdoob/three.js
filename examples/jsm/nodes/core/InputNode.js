import { TempNode } from './TempNode.js';

class InputNode extends TempNode {

	constructor( type, params ) {

		params = params || {};
		params.shared = params.shared !== undefined ? params.shared : false;

		super( type, params );

		this.readonly = false;

	}

	setReadonly( value ) {

		this.readonly = value;

		this.hashProperties = this.readonly ? [ 'value' ] : undefined;

		return this;

	}

	getReadonly( /* builder */ ) {

		return this.readonly;

	}

	copy( source ) {

		super.copy( source );

		if ( source.readonly !== undefined ) this.readonly = source.readonly;

		return this;

	}

	createJSONNode( meta ) {

		const data = super.createJSONNode( meta );

		if ( this.readonly === true ) data.readonly = this.readonly;

		return data;

	}

	generate( builder, output, uuid, type, ns, needsUpdate ) {

		uuid = builder.getUuid( uuid || this.getUuid() );
		type = type || this.getType( builder );

		const data = builder.getNodeData( uuid ),
			readonly = this.getReadonly( builder ) && this.generateReadonly !== undefined;

		if ( readonly ) {

			return this.generateReadonly( builder, output, uuid, type, ns, needsUpdate );

		} else {

			if ( builder.isShader( 'vertex' ) ) {

				if ( ! data.vertex ) {

					data.vertex = builder.createVertexUniform( type, this, ns, needsUpdate, this.getLabel() );

				}

				return builder.format( data.vertex.name, type, output );

			} else {

				if ( ! data.fragment ) {

					data.fragment = builder.createFragmentUniform( type, this, ns, needsUpdate, this.getLabel() );

				}

				return builder.format( data.fragment.name, type, output );

			}

		}

	}

}

export { InputNode };
