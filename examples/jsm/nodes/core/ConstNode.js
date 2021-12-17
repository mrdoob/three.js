import { TempNode } from './TempNode.js';

const declarationRegexp = /^([a-z_0-9]+)\s([a-z_0-9]+)\s?\=?\s?(.*?)(\;|$)/i;

class ConstNode extends TempNode {

	constructor( src, useDefine ) {

		super();

		this.parse( src || ConstNode.PI, useDefine );

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.type );

	}

	parse( src, useDefine ) {

		this.src = src || '';

		let name, type, value = '';

		const match = this.src.match( declarationRegexp );

		this.useDefine = useDefine || this.src.charAt( 0 ) === '#';

		if ( match && match.length > 1 ) {

			type = match[ 1 ];
			name = match[ 2 ];
			value = match[ 3 ];

		} else {

			name = this.src;
			type = 'f';

		}

		this.name = name;
		this.type = type;
		this.value = value;

	}

	build( builder, output ) {

		if ( output === 'source' ) {

			if ( this.value ) {

				if ( this.useDefine ) {

					return '#define ' + this.name + ' ' + this.value;

				}

				return 'const ' + this.type + ' ' + this.name + ' = ' + this.value + ';';

			} else if ( this.useDefine ) {

				return this.src;

			}

		} else {

			builder.include( this );

			return builder.format( this.name, this.getType( builder ), output );

		}

	}

	generate( builder, output ) {

		return builder.format( this.name, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.parse( source.src, source.useDefine );

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.src = this.src;

			if ( data.useDefine === true ) data.useDefine = true;

		}

		return data;

	}

}

ConstNode.prototype.nodeType = 'Const';

ConstNode.PI = 'PI';
ConstNode.PI2 = 'PI2';
ConstNode.RECIPROCAL_PI = 'RECIPROCAL_PI';
ConstNode.RECIPROCAL_PI2 = 'RECIPROCAL_PI2';
ConstNode.LOG2 = 'LOG2';
ConstNode.EPSILON = 'EPSILON';

export { ConstNode };
