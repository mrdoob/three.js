/**
 * Automatic node cache
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TempNode = function ( type, params ) {

	THREE.GLNode.call( this, type );

	params = params || {};

	this.shared = params.shared !== undefined ? params.shared : true;
	this.unique = params.unique !== undefined ? params.unique : false;

};

THREE.TempNode.prototype = Object.create( THREE.GLNode.prototype );
THREE.TempNode.prototype.constructor = THREE.TempNode;

THREE.TempNode.prototype.build = function ( builder, output, uuid, ns ) {

	output = output || this.getType( builder );

	var material = builder.material;

	if ( this.isShared( builder, output ) ) {

		var isUnique = this.isUnique( builder, output );

		if ( isUnique && this.constructor.uuid === undefined ) {

			this.constructor.uuid = THREE.Math.generateUUID();

		}

		uuid = builder.getUuid( uuid || this.getUuid(), ! isUnique );

		var data = material.getDataNode( uuid );

		if ( builder.parsing ) {

			if ( data.deps || 0 > 0 ) {

				this.appendDepsNode( builder, data, output );

				return this.generate( builder, type, uuid );

			}

			return THREE.GLNode.prototype.build.call( this, builder, output, uuid );

		} else if ( isUnique ) {

			data.name = data.name || THREE.GLNode.prototype.build.call( this, builder, output, uuid );

			return data.name;

		} else if ( ! builder.optimize || data.deps == 1 ) {

			return THREE.GLNode.prototype.build.call( this, builder, output, uuid );

		}

		uuid = this.getUuid( false );

		var name = this.getTemp( builder, uuid );
		var type = data.output || this.getType( builder );

		if ( name ) {

			return builder.format( name, type, output );

		} else {

			name = THREE.TempNode.prototype.generate.call( this, builder, output, uuid, data.output, ns );

			var code = this.generate( builder, type, uuid );

			if ( builder.isShader( 'vertex' ) ) material.addVertexNode( name + '=' + code + ';' );
			else material.addFragmentNode( name + '=' + code + ';' );

			return builder.format( name, type, output );

		}

	}

	return THREE.GLNode.prototype.build.call( this, builder, output, uuid );

};

THREE.TempNode.prototype.isShared = function ( builder, output ) {

	return output !== 'sampler2D' && output !== 'samplerCube' && this.shared;

};

THREE.TempNode.prototype.isUnique = function ( builder, output ) {

	return this.unique;

};

THREE.TempNode.prototype.getUuid = function ( unique ) {

	var uuid = unique || unique == undefined ? this.constructor.uuid || this.uuid : this.uuid;

	if ( typeof this.scope == "string" ) uuid = this.scope + '-' + uuid;

	return uuid;

};

THREE.TempNode.prototype.getTemp = function ( builder, uuid ) {

	uuid = uuid || this.uuid;

	var material = builder.material;

	if ( builder.isShader( 'vertex' ) && material.vertexTemps[ uuid ] ) return material.vertexTemps[ uuid ].name;
	else if ( material.fragmentTemps[ uuid ] ) return material.fragmentTemps[ uuid ].name;

};

THREE.TempNode.prototype.generate = function ( builder, output, uuid, type, ns ) {

	if ( ! this.isShared( builder, output ) ) console.error( "THREE.TempNode is not shared!" );

	uuid = uuid || this.uuid;

	if ( builder.isShader( 'vertex' ) ) return builder.material.getVertexTemp( uuid, type || this.getType( builder ), ns ).name;
	else return builder.material.getFragmentTemp( uuid, type || this.getType( builder ), ns ).name;

};
