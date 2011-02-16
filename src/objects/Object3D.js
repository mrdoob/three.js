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

};


/*
 * Update
 */

THREE.Object3D.prototype.update = function( parentGlobalMatrix, forceUpdate, camera, renderer ) {

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
	
		for( var i = 0; i < this.children.length; i++ ) {
			
			this.children[ i ].update( this.globalMatrix, forceUpdate, camera, renderer );
			
		}

	}

};


/*
 * Update Matrix
 */

THREE.Object3D.prototype.updateMatrix = function() {
	
	// update position
	
	var isDirty = false;
	
	if( this.position.isDirty ) {
		
		this.localMatrix.setPosition( this.position );
		this.position.isDirty = false;
		isDirty = true;

	}


	// update quaternion
	
	if( this.useQuaternion ) {
		
		if( this.quaternion.isDirty ) {
			
			this.localMatrix.setRotationFromQuaternion( this.quaternion );
			this.quaternion.isDirty = false;
			this.rotation  .isDirty = false;
			
			if( this.scale.isDirty || this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {
				
				this.localMatrix.scale( this.scale );
				this.scale.isDirty = false;
	
				this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

			}
			
			isDirty = true;

		}

	}

	// update rotation

	else if( this.rotation.isDirty ) {
	
		this.localMatrix.setRotationFromEuler( this.rotation );
		this.rotation.isDirty = false;

		if( this.scale.isDirty || this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1 ) {
			
			this.localMatrix.scale( this.scale );
			this.scale.isDirty = false;
			
			this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ) );

		}

		isDirty = true;

	}


	// update scale
	
	if( this.scale.isDirty ) {
		
		if( this.useQuaternion ) 
			this.localMatrix.setRotationFromQuaternion( this.quaternion );
		else
			this.localMatrix.setRotationFromEuler( this.rotation );

		this.localMatrix.scale( this.scale );
		this.scale.isDirty = false;

		this.boundRadiusScale = Math.max( this.scale.x, Math.max( this.scale.y, this.scale.z ));

		isDirty = true;

	}

	
	return isDirty;

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

THREE.Object3D.prototype.removeChild = function() {
	
	var childIndex = this.children.indexOf( child ); 
	
	if( childIndex !== -1 )	{
		
		this.children.splice( childIndex, 1 );
		child.parent = undefined;

	}

};

THREE.Object3DCounter = { value: 0 };


