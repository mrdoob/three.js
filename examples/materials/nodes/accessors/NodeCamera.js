/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeCamera = function( scope, camera ) {
	
	THREE.NodeTemp.call( this, 'v3' );
	
	this.scope = scope || THREE.NodeCamera.POSITION;
	this.camera = camera;
	
	switch(scope) {
		
		case THREE.NodeCamera.DEPTH:
			
			this.near = new THREE.NodeFloat( camera ? camera.near : 1);
			this.far = new THREE.NodeFloat(camera ? camera.far : 1200);
			
			break;
	
	}
	
	this.requestUpdate = this.camera !== undefined;
	
};

THREE.NodeCamera.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeCamera.prototype.constructor = THREE.NodeCamera;

THREE.NodeCamera.POSITION = 'position';
THREE.NodeCamera.DEPTH = 'depth';

THREE.NodeCamera.prototype.getType = function( builder ) {
	
	switch(this.scope) {
		case THREE.NodeCamera.DEPTH:
			return 'fv1';
	}
	
	return this.type;
	
};

THREE.NodeCamera.prototype.isUnique = function( builder ) {
	
	switch(this.scope) {
		case THREE.NodeCamera.DEPTH:
			return true;
	}
	
	return false;
	
};

THREE.NodeCamera.prototype.isShared = function( builder ) {
	
	switch(this.scope) {
		case THREE.NodeCamera.POSITION:
			return false;
	}
	
	return true;
	
};

THREE.NodeCamera.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var result;
	
	switch (this.scope) {
	
		case THREE.NodeCamera.POSITION:
	
			result = 'cameraPosition';
			
			break;
			
		case THREE.NodeCamera.DEPTH:
			
			builder.include('depthcolor');
			
			result = 'depthcolor(' + this.near.build( builder, 'fv1' ) + ',' + this.far.build( builder, 'fv1' ) + ')';
		
			break;
			
	}
	
	return builder.format( result, this.getType( builder ), output );

};

THREE.NodeCamera.prototype.updateAnimation = function( delta ) {
	
	switch(this.scope) {
		
		case THREE.NodeCamera.DEPTH:
		
			this.near.number = camera.near;
			this.far.number = camera.far;
		
			break;
	
	}
	
};