/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodePosition = function( scope ) {
	
	THREE.NodeTemp.call( this, 'v3' );
	
	this.scope = scope || THREE.NodePosition.LOCAL;
	
};

THREE.NodePosition.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodePosition.prototype.constructor = THREE.NodePosition;

THREE.NodePosition.LOCAL = 'local';
THREE.NodePosition.WORLD = 'world';
THREE.NodePosition.VIEW = 'view';
THREE.NodePosition.PROJECTION = 'projection';

THREE.NodePosition.prototype.getType = function( builder ) {
	
	switch(this.method) {
		case THREE.NodePosition.PROJECTION:
			return 'v4';
	}
	
	return this.type;
	
};

THREE.NodePosition.prototype.isShared = function( builder ) {
	
	switch(this.method) {
		case THREE.NodePosition.LOCAL:
		case THREE.NodePosition.WORLD:
			return false;
	}
	
	return true;
	
};

THREE.NodePosition.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var result;
	
	switch (this.scope) {
	
		case THREE.NodePosition.LOCAL:
	
			material.requestAttrib.position = true;
			
			if (builder.isShader('vertex')) result = 'transformed';
			else result = 'vPosition';
			
			break;
			
		case THREE.NodePosition.WORLD:
	
			material.requestAttrib.worldPosition = true;
			
			if (builder.isShader('vertex')) result = 'vWPosition';
			else result = 'vWPosition';
			
			break;
			
		case THREE.NodePosition.VIEW:
	
			if (builder.isShader('vertex')) result = '-mvPosition.xyz';
			else result = 'vViewPosition';
			
			break;
			
		case THREE.NodePosition.PROJECTION:
	
			if (builder.isShader('vertex')) result = '(projectionMatrix * modelViewMatrix * vec4( position, 1.0 ))';
			else result = 'vec4( 0.0 )';
			
			break;
			
	}
	
	return builder.format( result, this.getType( builder ), output );

};