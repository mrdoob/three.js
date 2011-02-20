/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Mesh = function( geometry, materials ) {

	THREE.Object3D.call( this );
	
	this.geometry     = geometry;
	this.materials    = materials && materials.length ? materials : [ materials ];
	
	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false; // TODO: Move to material?
	
	// calc bound radius
	
	if( this.geometry ) {
		
		if( !this.geometry.boundingSphere )
			 this.geometry.computeBoundingSphere();
	
		this.boundRadius = geometry.boundingSphere.radius;

	}

}

THREE.Mesh.prototype             = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;
THREE.Mesh.prototype.supr        = THREE.Object3D.prototype;

/*
 * Update
 */

THREE.Mesh.prototype.update = function( parentGlobalMatrix, forceUpdate, camera ) {
	
	// visible?
	
	if( this.visible ) {

		// update local
		
		if( this.matrixAutoUpdate )
			forceUpdate |= this.updateMatrix();


		// update global

		if( forceUpdate || this.matrixNeedsUpdate ) {
			
			if( parentGlobalMatrix )
				this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );
			else
				this.globalMatrix.copy( this.localMatrix );
			
			this.matrixNeedsUpdate = false;
			forceUpdate               = true;			

		}


		// update children
	
		for( var i = 0; i < this.children.length; i++ )
			this.children[ i ].update( this.globalMatrix, forceUpdate, camera );

	}

}


