/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Scene = function() {
	
	// call super
	
	THREE.Object3D.call( this );

	// vars

	this.objects = [];
	this.lights  = [];
	this.fog     = null;

};

THREE.Scene.prototype             = new THREE.Object3D();
THREE.Scene.prototype.constructor = THREE.Scene;
THREE.Scene.prototype.supr        = THREE.Object3D.prototype;

/*
 * Add Child
 */

THREE.Scene.prototype.addChild = function( child ) {

	this.supr.addChild.call( this, child );
	this.addChildRecurse( child );

}

THREE.Scene.prototype.addChildRecurse = function( object ) {
	
	
	if( object instanceof THREE.Light ) {
			
		if( this.lights.indexOf( object ) === -1 )
			this.lights.push( object );	

	} else if( !( object instanceof THREE.Camera ) ) {
		
		if( this.objects.indexOf( object ) === -1 )
			this.objects.push( object );

	}
	
	for( var c = 0; c < object.children.length; c++ )
		this.addChildRecurse( object.children[ c ] );

}


/*
 * Remove Child
 */

THREE.Scene.prototype.removeChild = function( child ) {

	this.supr.removeChild.call( this, child );
	this.removeChildRecurse( child );

}

THREE.Scene.prototype.removeChildRecurse = function( child ) {
	
	if( object instanceof THREE.Light ) {
		
		var i = this.lights.indexOf( object );
		
		if( i === -1 )
			this.lights.splice( i, 1 );

	} else if( !( object instanceof THREE.Camera ) ) {
		
		var i = this.objects.indexOf( object );
		
		if( i === -1 )
			this.objects.splice( i, 1 );

	}
	
	for( var c = 0; c < object.children.length; c++ )
		this.removeChildRecurse( object.children[ c ] );

}



/*
 * Backward Compatibility
 */

THREE.Scene.prototype.addObject    = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeObject = THREE.Scene.prototype.removeChild;
THREE.Scene.prototype.addLight     = THREE.Scene.prototype.addChild;
THREE.Scene.prototype.removeLight  = THREE.Scene.prototype.removeChild;
 