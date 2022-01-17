import { MathUtils } from 'three';
import { Node } from './Node.js';

class TempNode extends Node {

	constructor( type, params = {} ) {

		super( type );

		this.shared = params.shared !== undefined ? params.shared : true;
		this.unique = params.unique !== undefined ? params.unique : false;

	}

	build( builder, output, uuid, ns ) {

		output = output || this.getType( builder );

		if ( this.getShared( builder, output ) ) {

			const isUnique = this.getUnique( builder, output );

			if ( isUnique && this.constructor.uuid === undefined ) {

				this.constructor.uuid = MathUtils.generateUUID();

			}

			uuid = builder.getUuid( uuid || this.getUuid(), ! isUnique );

			const data = builder.getNodeData( uuid ),
				type = data.output || this.getType( builder );

			if ( builder.analyzing ) {

				if ( ( data.deps || 0 ) > 0 || this.getLabel() ) {

					this.appendDepsNode( builder, data, output );

					return this.generate( builder, output, uuid );

				}

				return super.build( builder, output, uuid );

			} else if ( isUnique ) {

				data.name = data.name || super.build( builder, output, uuid );

				return data.name;

			} else if ( ! this.getLabel() && ( ! this.getShared( builder, type ) || ( builder.context.ignoreCache || data.deps === 1 ) ) ) {

				return super.build( builder, output, uuid );

			}

			uuid = this.getUuid( false );

			let name = this.getTemp( builder, uuid );

			if ( name ) {

				return builder.format( name, type, output );

			} else {

				name = TempNode.prototype.generate.call( this, builder, output, uuid, data.output, ns );

				const code = this.generate( builder, type, uuid );

				builder.addNodeCode( name + ' = ' + code + ';' );

				return builder.format( name, type, output );

			}

		}

		return super.build( builder, output, uuid );

	}

	getShared( builder, output ) {

		return output !== 'sampler2D' && output !== 'samplerCube' && this.shared;

	}

	getUnique( /* builder, output */ ) {

		return this.unique;

	}

	setLabel( name ) {

		this.label = name;

		return this;

	}

	getLabel( /* builder */ ) {

		return this.label;

	}

	getUuid( unique ) {

		let uuid = unique || unique == undefined ? this.constructor.uuid || this.uuid : this.uuid;

		if ( typeof this.scope === 'string' ) uuid = this.scope + '-' + uuid;

		return uuid;

	}

	getTemp( builder, uuid ) {

		uuid = uuid || this.uuid;

		const tempVar = builder.getVars()[ uuid ];

		return tempVar ? tempVar.name : undefined;

	}

	generate( builder, output, uuid, type, ns ) {

		if ( ! this.getShared( builder, output ) ) console.error( 'THREE.TempNode is not shared!' );

		uuid = uuid || this.uuid;

		return builder.getTempVar( uuid, type || this.getType( builder ), ns, this.getLabel() ).name;

	}

}

export { TempNode };
