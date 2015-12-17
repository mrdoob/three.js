/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeNormal = function( scope ) {
	
	THREE.NodeTemp.call( this, 'v3' );
	
	this.scope = scope || THREE.NodeNormal.LOCAL;
	
};

THREE.NodeNormal.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeNormal.prototype.constructor = THREE.NodeNormal;

THREE.NodeNormal.LOCAL = 'local';
THREE.NodeNormal.WORLD = 'world';
THREE.NodeNormal.VIEW = 'view';

THREE.NodeNormal.prototype.isShared = function( builder ) {
	
	switch(this.method) {
		case THREE.NodeNormal.WORLD:
			return true;
	}
	
	return false;
	
};

THREE.NodeNormal.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var result;
	
	switch (this.scope) {
	
		case THREE.NodeNormal.LOCAL:
	
			material.requestAttrib.normal = true;
	
			if (builder.isShader('vertex')) result = 'normal';
			else result = 'vObjectNormal';
			
			break;
			
		case THREE.NodeNormal.WORLD:
	
			material.requestAttrib.worldNormal = true;
			
			if (builder.isShader('vertex')) result = '( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz';
			else result = 'vWNormal';
			
			break;
			
		case THREE.NodeNormal.VIEW:
	
			result = 'vNormal';
			
			break;
			
	}
	
	return builder.format( result, this.getType( builder ), output );

};
