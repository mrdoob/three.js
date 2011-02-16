/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Mesh = function( geometry, materials ) {

	THREE.Object3D.call( this );
	
	this.geometry     = geometry;
	this.materials    = materials && materials.length ? materials : [ materials ];
	this.normalMatrix = THREE.Matrix4.makeInvert3x3( this.globalMatrix ).transpose();
	
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

THREE.Mesh.prototype.update = function( parentGlobalMatrix, forceUpdate, camera, renderer ) {
	
	// visible?
	
	if( this.visible ) {

		// update local
		
		if( this.autoUpdateMatrix )
			forceUpdate |= this.updateMatrix();


		// update global

		if( forceUpdate || this.matrixNeedsToUpdate ) {
			
			if( parentGlobalMatrix )
				this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );
			else
				this.globalMatrix.copy( this.localMatrix );
			
			this.matrixNeedsToUpdate = false;
			forceUpdate               = true;
			
			
			// update normal

			this.normalMatrix = THREE.Matrix4.makeInvert3x3( this.globalMatrix ).transpose();

		}


		// update children
	
		for( var i = 0; i < this.children.length; i++ )
			this.children[ i ].update( this.globalMatrix, forceUpdate, camera, renderer );


		// check camera frustum and add to render list
		
		if( renderer && camera ) {
			
			if( camera.frustumContains( this ))
				renderer.addToRenderList( this );
			else
				renderer.removeFromRenderList( this );
		
		}
	
	} else {
		
		renderer.removeFromRenderList( this );

	}

}


