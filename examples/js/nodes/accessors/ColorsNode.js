/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ColorsNode = function ( index ) {

	THREE.TempNode.call( this, 'v4', { shared: false } );

	this.index = index || 0;

};

THREE.ColorsNode.vertexDict = [ 'color', 'color2' ];
THREE.ColorsNode.fragmentDict = [ 'vColor', 'vColor2' ];

THREE.ColorsNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ColorsNode.prototype.constructor = THREE.ColorsNode;

THREE.ColorsNode.prototype.generate = function ( builder, output ) {

	var material = builder.material;
	var result;

	material.requires.color[ this.index ] = true;

	if ( builder.isShader( 'vertex' ) ) result = THREE.ColorsNode.vertexDict[ this.index ];
	else result = THREE.ColorsNode.fragmentDict[ this.index ];

	return builder.format( result, this.getType( builder ), output );

};

THREE.ColorsNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.index = this.index;

	}

	return data;

};
