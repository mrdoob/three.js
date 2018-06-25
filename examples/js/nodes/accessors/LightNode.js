/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.LightNode = function ( scope ) {

	THREE.TempNode.call( this, 'v3', { shared: false } );

	this.scope = scope || THREE.LightNode.TOTAL;

};

THREE.LightNode.TOTAL = 'total';

THREE.LightNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.LightNode.prototype.constructor = THREE.LightNode;
THREE.LightNode.prototype.nodeType = "Light";

THREE.LightNode.prototype.generate = function ( builder, output ) {

	if ( builder.isCache( 'light' ) ) {

		return builder.format( 'reflectedLight.directDiffuse', this.getType( builder ), output );

	} else {

		console.warn( "THREE.LightNode is only compatible in \"light\" channel." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

THREE.LightNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.scope = this.scope;

	}

	return data;

};
