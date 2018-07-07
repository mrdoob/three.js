/**
 * Automatic node cache
 * @author sunag / http://www.sunag.com.br/
 */

import { GLNode } from './GLNode.js';

function TempNode( type, params ) {

	GLNode.call( this, type );

	params = params || {};

	this.shared = params.shared !== undefined ? params.shared : true;
	this.unique = params.unique !== undefined ? params.unique : false;

};

TempNode.prototype = Object.create( GLNode.prototype );
TempNode.prototype.constructor = TempNode;

TempNode.prototype.build = function ( builder, output, uuid, ns ) {

	output = output || this.getType( builder );

	if ( this.isShared( builder, output ) ) {

		var isUnique = this.isUnique( builder, output );

		if ( isUnique && this.constructor.uuid === undefined ) {

			this.constructor.uuid = THREE.Math.generateUUID();

		}

		uuid = builder.getUuid( uuid || this.getUuid(), ! isUnique );

		var data = builder.getNodeData( uuid );

		if ( builder.parsing ) {

			if ( data.deps || 0 > 0 ) {

				this.appendDepsNode( builder, data, output );

				return this.generate( builder, type, uuid );

			}

			return GLNode.prototype.build.call( this, builder, output, uuid );

		} else if ( isUnique ) {

			data.name = data.name || GLNode.prototype.build.call( this, builder, output, uuid );

			return data.name;

		} else if ( ! builder.optimize || data.deps == 1 ) {

			return GLNode.prototype.build.call( this, builder, output, uuid );

		}

		uuid = this.getUuid( false );

		var name = this.getTemp( builder, uuid ),
			type = data.output || this.getType( builder );

		if ( name ) {

			return builder.format( name, type, output );

		} else {

			name = TempNode.prototype.generate.call( this, builder, output, uuid, data.output, ns );

			var code = this.generate( builder, type, uuid );

			builder.addNodeCode( name + ' = ' + code + ';' );

			return builder.format( name, type, output );

		}

	}

	return GLNode.prototype.build.call( this, builder, output, uuid );

};

TempNode.prototype.isShared = function ( builder, output ) {

	return output !== 'sampler2D' && output !== 'samplerCube' && this.shared;

};

TempNode.prototype.isUnique = function ( builder, output ) {

	return this.unique;

};

TempNode.prototype.getUuid = function ( unique ) {

	var uuid = unique || unique == undefined ? this.constructor.uuid || this.uuid : this.uuid;

	if ( typeof this.scope == "string" ) uuid = this.scope + '-' + uuid;

	return uuid;

};

TempNode.prototype.getTemp = function ( builder, uuid ) {

	uuid = uuid || this.uuid;

	var tempVar = builder.getVars()[uuid]
	
	return tempVar ? tempVar.name : undefined;
	
};

TempNode.prototype.generate = function ( builder, output, uuid, type, ns ) {

	if ( ! this.isShared( builder, output ) ) console.error( "THREE.TempNode is not shared!" );

	uuid = uuid || this.uuid;

	return builder.getTempVar( uuid, type || this.getType( builder ), ns ).name;

};

export { TempNode };
