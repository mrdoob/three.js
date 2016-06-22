/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.InputNode = function( type, params ) {

	THREE.TempNode.call( this, type, params );

};

THREE.InputNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.InputNode.prototype.constructor = THREE.InputNode;

THREE.InputNode.prototype.generate = function( builder, output, uuid, type, ns, needsUpdate ) {

	var material = builder.material;

	uuid = builder.getUuid( uuid || this.getUuid() );
	type = type || this.getType( builder );

	var data = material.getDataNode( uuid );

	if ( builder.isShader( 'vertex' ) ) {

		if ( ! data.vertex ) {

			data.vertex = material.createVertexUniform( type, this.value, ns, needsUpdate );

		}

		return builder.format( data.vertex.name, type, output );

	}
	else {

		if ( ! data.fragment ) {

			data.fragment = material.createFragmentUniform( type, this.value, ns, needsUpdate );

		}

		return builder.format( data.fragment.name, type, output );

	}

};
