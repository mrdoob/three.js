/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NormalNode = function( scope ) {

	THREE.TempNode.call( this, 'v3' );

	this.scope = scope || THREE.NormalNode.LOCAL;

};

THREE.NormalNode.LOCAL = 'local';
THREE.NormalNode.WORLD = 'world';
THREE.NormalNode.VIEW = 'view';

THREE.NormalNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.NormalNode.prototype.constructor = THREE.NormalNode;

THREE.NormalNode.prototype.isShared = function( builder ) {

	switch ( this.scope ) {
		case THREE.NormalNode.WORLD:
			return true;
	}

	return false;

};

THREE.NormalNode.prototype.generate = function( builder, output ) {

	var material = builder.material;
	var result;

	switch ( this.scope ) {

		case THREE.NormalNode.LOCAL:

			material.requestAttrib.normal = true;

			if ( builder.isShader( 'vertex' ) ) result = 'normal';
			else result = 'vObjectNormal';

			break;

		case THREE.NormalNode.WORLD:

			material.requestAttrib.worldNormal = true;

			if ( builder.isShader( 'vertex' ) ) result = '( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz';
			else result = 'vWNormal';

			break;

		case THREE.NormalNode.VIEW:

			result = 'vNormal';

			break;

	}

	return builder.format( result, this.getType( builder ), output );

};
