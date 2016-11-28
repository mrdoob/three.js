/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.PositionNode = function( scope ) {

	THREE.TempNode.call( this, 'v3' );

	this.scope = scope || THREE.PositionNode.LOCAL;

};

THREE.PositionNode.LOCAL = 'local';
THREE.PositionNode.WORLD = 'world';
THREE.PositionNode.VIEW = 'view';
THREE.PositionNode.PROJECTION = 'projection';

THREE.PositionNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.PositionNode.prototype.constructor = THREE.PositionNode;

THREE.PositionNode.prototype.getType = function( builder ) {

	switch ( this.scope ) {
		case THREE.PositionNode.PROJECTION:
			return 'v4';
	}

	return this.type;

};

THREE.PositionNode.prototype.isShared = function( builder ) {

	switch ( this.scope ) {
		case THREE.PositionNode.LOCAL:
		case THREE.PositionNode.WORLD:
			return false;
	}

	return true;

};

THREE.PositionNode.prototype.generate = function( builder, output ) {

	var material = builder.material;
	var result;

	switch ( this.scope ) {

		case THREE.PositionNode.LOCAL:

			material.requestAttribs.position = true;

			if ( builder.isShader( 'vertex' ) ) result = 'transformed';
			else result = 'vPosition';

			break;

		case THREE.PositionNode.WORLD:

			material.requestAttribs.worldPosition = true;

			if ( builder.isShader( 'vertex' ) ) result = 'vWPosition';
			else result = 'vWPosition';

			break;

		case THREE.PositionNode.VIEW:

			if ( builder.isShader( 'vertex' ) ) result = '-mvPosition.xyz';
			else result = 'vViewPosition';

			break;

		case THREE.PositionNode.PROJECTION:

			if ( builder.isShader( 'vertex' ) ) result = '(projectionMatrix * modelViewMatrix * vec4( position, 1.0 ))';
			else result = 'vec4( 0.0 )';

			break;

	}

	return builder.format( result, this.getType( builder ), output );

};
