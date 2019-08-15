/**
 * Automatic node cache
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from './Node.js';

function TempNode( type, params ) {

	Node.call( this, type );

	params = params || {};

	this.shared = params.shared !== undefined ? params.shared : true;
	this.unique = params.unique !== undefined ? params.unique : false;

}

TempNode.prototype = Object.create( Node.prototype );
TempNode.prototype.constructor = TempNode;

TempNode.prototype.build = function ( builder, output, uuid, ns ) {

	output = output || this.getType( builder );

	if ( this.getShared( builder, output ) ) {

		var isUnique = this.getUnique( builder, output );

		if ( isUnique && this.constructor.uuid === undefined ) {

			this.constructor.uuid = THREE.Math.generateUUID();

		}

		uuid = builder.getUuid( uuid || this.getUuid(), ! isUnique );

		var data = builder.getNodeData( uuid ),
			type = data.output || this.getType( builder );

		if ( builder.analyzing ) {

			if ( ( data.deps || 0 ) > 0 || this.getLabel() ) {

				this.appendDepsNode( builder, data, output );

				return this.generate( builder, output, uuid );

			}

			return Node.prototype.build.call( this, builder, output, uuid );

		} else if ( isUnique ) {

			data.name = data.name || Node.prototype.build.call( this, builder, output, uuid );

			return data.name;

		} else if ( ! this.getLabel() && ( ! this.getShared( builder, type ) || ( builder.context.ignoreCache || data.deps === 1 ) ) ) {

			return Node.prototype.build.call( this, builder, output, uuid );

		}

		uuid = this.getUuid( false );

		var name = this.getTemp( builder, uuid );

		if ( name ) {

			return builder.format( name, type, output );

		} else {

			name = TempNode.prototype.generate.call( this, builder, output, uuid, data.output, ns );

			var code = this.generate( builder, type, uuid );

			builder.addNodeCode( name + ' = ' + code + ';' );

			return builder.format( name, type, output );

		}

	}

	return Node.prototype.build.call( this, builder, output, uuid );

};

TempNode.prototype.getShared = function ( builder, output ) {

	return output !== 'sampler2D' && output !== 'samplerCube' && this.shared;

};

TempNode.prototype.getUnique = function ( builder, output ) {

	return this.unique;

};

TempNode.prototype.setLabel = function ( name ) {

	this.label = name;

	return this;

};

TempNode.prototype.getLabel = function ( builder ) {

	return this.label;

};

TempNode.prototype.getUuid = function ( unique ) {

	var uuid = unique || unique == undefined ? this.constructor.uuid || this.uuid : this.uuid;

	if ( typeof this.scope === "string" ) uuid = this.scope + '-' + uuid;

	return uuid;

};

TempNode.prototype.getTemp = function ( builder, uuid ) {

	uuid = uuid || this.uuid;

	var tempVar = builder.getVars()[ uuid ];

	return tempVar ? tempVar.name : undefined;

};

TempNode.prototype.generate = function ( builder, output, uuid, type, ns ) {

	if ( ! this.getShared( builder, output ) ) console.error( "THREE.TempNode is not shared!" );

	uuid = uuid || this.uuid;

	return builder.getTempVar( uuid, type || this.getType( builder ), ns, this.getLabel() ).name;

};

export { TempNode };
