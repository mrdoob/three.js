/**
 * @author mr.doob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Object3D = function() {

	this.id = THREE.Object3DCounter.value ++;
	
	this.visible             = true;
	this.autoUpdateMatrix    = true;
	this.matrixNeedsToUpdate = true;
	
	this.parent		  		 = undefined;
	this.children     		 = [];

	this.position            = new THREE.Vector3();
	this.rotation            = new THREE.Vector3();
	this.scale               = new THREE.Vector3( 1.0, 1.0, 1.0 );
	this.localMatrix         = new THREE.Matrix4();
	this.globalMatrix        = new THREE.Matrix4();
	this.quaternion          = new THREE.Quaternion();
	this.useQuaternion       = false;
	this.screenPosition      = new THREE.Vector4(); // xyzr
	
	this.boundRadius         = 0.0;
	this.boundRadiusScale    = 1.0;
	
	this.rotationMatrix 	 = new THREE.Matrix4(); // this is just to cache it when somewhere it's computed somewhere else (stripped down globalMatrix)

};


/*
 * Update
 */

THREE.Object3D.prototype.update = function( parentGlobalMatrix, forceUpdate, camera ) {

	// visible and auto update?
	
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
			forceUpdate              = true;

		}


		// update children
	
		var i, l = this.children.length;
		
		for( i = 0; i < l; i++ ) {
			
			this.children[ i ].update( this.globalMatrix, forceUpdate, camera );
			
		}

	}

};


/*
 * Update Matrix
 */

THREE.Object3D.prototype.updateMatrix = function() {
	
	// update position
		
	this.localMatrix.setPosition( this.position );	
	
	// update quaternion
	
	if( this.useQuaternion )  {
		
		if( this.quaternion.isDirty ) {
			
			this.localMatrix.setRotationFromQuaternion( this.quaternion );
			this.quaternion.isDirty = false;

		}
		
	// update rotation
	
	} else {
		
		this.localMatrix.setRotationFromEuler( this.rotation );
	
	}

	// update scale
	
	if( this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {
		
		this.localMatrix.scale( this.scale );
		this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );
	
	}
	
	return true;

};


/*
 * AddChild
 */

THREE.Object3D.prototype.addChild = function( child ) {
	
	if( this.children.indexOf( child ) === -1 ) {

		if( child.parent !== undefined )
			child.parent.removeChild( child );
		
		child.parent = this;		
		this.children.push( child );

	}

};


/*
 * RemoveChild
 */

THREE.Object3D.prototype.removeChild = function( child ) {
	
	var childIndex = this.children.indexOf( child ); 
	
	if( childIndex !== -1 )	{
		
		this.children.splice( childIndex, 1 );
		child.parent = undefined;

	}

};

THREE.Object3DCounter = { value: 0 };


