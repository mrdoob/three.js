/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';

export class FunctionCallNode extends TempNode {

	constructor( func, inputs ) {

		super();

		this.nodeType = "FunctionCall";

		this.setFunction( func, inputs );

	}

	setFunction( func, inputs ) {

		this.value = func;
		this.inputs = inputs || [];

	}

	getFunction() {

		return this.value;

	}

	getType( builder ) {

		return this.value.getType( builder );

	}

	generate( builder, output ) {

		var type = this.getType( builder ),
			func = this.value;

		var code = func.build( builder, output ) + '( ',
			params = [];

		for ( var i = 0; i < func.inputs.length; i ++ ) {

			var inpt = func.inputs[ i ],
				param = this.inputs[ i ] || this.inputs[ inpt.name ];

			params.push( param.build( builder, builder.getTypeByFormat( inpt.type ) ) );

		}

		code += params.join( ', ' ) + ' )';

		return builder.format( code, type, output );

	}

	copy( source ) {

		super.copy( source );

		for ( var prop in source.inputs ) {

			this.inputs[ prop ] = source.inputs[ prop ];

		}

		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			var func = this.value;

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;

			if ( func.inputs.length ) {

				data.inputs = {};

				for ( var i = 0; i < func.inputs.length; i ++ ) {

					var inpt = func.inputs[ i ],
						node = this.inputs[ i ] || this.inputs[ inpt.name ];

					data.inputs[ inpt.name ] = node.toJSON( meta ).uuid;

				}

			}

		}

		return data;

	}

}
