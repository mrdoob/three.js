/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.InputNode = function ( type, params ) {

	params = params || {};
	params.shared = params.shared !== undefined ? params.shared : false;

	THREE.TempNode.call( this, type, params );

	this.readonly = false;

};

THREE.InputNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.InputNode.prototype.constructor = THREE.InputNode;

THREE.InputNode.prototype.isReadonly = function ( builder ) {

	return this.readonly;

};

THREE.InputNode.prototype.generate = function ( builder, output, uuid, type, ns, needsUpdate ) {

	var material = builder.material;

	uuid = builder.getUuid( uuid || this.getUuid() );
	type = type || this.getType( builder );

	var data = material.getDataNode( uuid ),
		readonly = this.isReadonly( builder ) && this.generateReadonly !== undefined;

	if ( readonly ) {

		return this.generateReadonly( builder, output, uuid, type, ns, needsUpdate );

	} else {

		if ( builder.isShader( 'vertex' ) ) {

			if ( ! data.vertex ) {

				data.vertex = material.createVertexUniform( type, this.value, ns, needsUpdate );

			}

			return builder.format( data.vertex.name, type, output );

		} else {

			if ( ! data.fragment ) {

				data.fragment = material.createFragmentUniform( type, this.value, ns, needsUpdate );

			}

			return builder.format( data.fragment.name, type, output );

		}

	}

};
