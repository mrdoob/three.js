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

	uuid = builder.getUuid( uuid || this.uuid );
	type = type || this.type;

	var data = material.getDataNode( uuid );

	if ( builder.isShader( 'vertex' ) ) {

		if ( ! data.vertex ) {

			data.vertex = material.getVertexUniform( this.value, type, ns, needsUpdate );

		}

		return builder.format( data.vertex.name, type, output );

	}
	else {

		if ( ! data.fragment ) {

			data.fragment = material.getFragmentUniform( this.value, type, ns, needsUpdate );

		}

		return builder.format( data.fragment.name, type, output );

	}

};
