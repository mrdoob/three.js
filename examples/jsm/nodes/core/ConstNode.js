/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';
import { NodeLib } from './NodeLib.js';

import { GLSLParser } from './GLSLParser.js';

export class ConstNode extends TempNode {

	constructor( name, type = 'f', value = '', isDefine = false ) {

		super();

		this.name = name;
		this.type = type;
		this.value = value;

		this.isDefine = isDefine;

		this.nodeType = "Const";

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.type );

	}

	fromParser( parser, prop ) {

		if ( prop.type === 'define' ) {

			this.type = 'f';
			this.isDefine = true;
			
		} else {
			
			this.type = prop.type;
			this.isDefine = false;
			
		}

		this.name = prop.name;
		this.value = prop.getSourceValue();

		return this;

	}

	parse( src ) {

		var parser = new GLSLParser( src );

		return this.fromParser( parser, parser.getMainProperty() );
		
	}
	
	build( builder, output ) {

		if ( output === 'source' ) {
			
			if (this.value) {

				if (this.isDefine) {
					
					return `#define ${this.name} ${this.value}`;
					
				} else {
					
					var type = builder.getFormatByType( this.type );
					
					return `const ${type} ${this.name} = ${this.value};`;
					
				}

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

		TempNode.prototype.copy.call( this, source );

		this.name = source.name;
		this.type = source.type;
		this.value = source.value;

		this.isDefine = source.isDefine;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.name = source.name;
			data.type = source.type;
			data.value = source.value;

			data.isDefine = source.isDefine;

		}

		return data;

	}

}

ConstNode.PI = 'PI';
ConstNode.PI2 = 'PI2';
ConstNode.RECIPROCAL_PI = 'RECIPROCAL_PI';
ConstNode.RECIPROCAL_PI2 = 'RECIPROCAL_PI2';
ConstNode.LOG2 = 'LOG2';
ConstNode.EPSILON = 'EPSILON';

NodeLib.addStaticKeywords( ConstNode );
