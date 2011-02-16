/**
 * @author mikael emtinger / http://gomo.se/
 */

// do not crash if somebody includes the file in oldie browser

if ( !window.Float32Array ) {

	window.Float32Array = Array;

}

THREE.SkinnedMesh = function( geometry, materials ) {
	
	THREE.Mesh.call( this, geometry, materials );
	
	
	// init bones

	this.identityMatrix = new THREE.Matrix4();

	this.bones        = [];
	this.boneMatrices = [];
	
	if( this.geometry.bones !== undefined ) {
		
		for( var b = 0; b < this.geometry.bones.length; b++ ) {
			
			var bone = this.addBone();
			
			bone.name         = this.geometry.bones[ b ].name;
			bone.position.x   = this.geometry.bones[ b ].pos [ 0 ];
			bone.position.y   = this.geometry.bones[ b ].pos [ 1 ];
			bone.position.z   = this.geometry.bones[ b ].pos [ 2 ];
			bone.quaternion.x = this.geometry.bones[ b ].rotq[ 0 ];
			bone.quaternion.y = this.geometry.bones[ b ].rotq[ 1 ];
			bone.quaternion.z = this.geometry.bones[ b ].rotq[ 2 ];
			bone.quaternion.w = this.geometry.bones[ b ].rotq[ 3 ];
			bone.scale.x      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 0 ] : 1;
			bone.scale.y      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 1 ] : 1;
			bone.scale.z      = this.geometry.bones[ b ].scl !== undefined ? this.geometry.bones[ b ].scl[ 2 ] : 1;

		}
		
		for( var b = 0; b < this.bones.length; b++ ) {
			
			if( this.geometry.bones[ b ].parent === -1 ) 
				this.addChild( this.bones[ b ] );
			else
				this.bones[ this.geometry.bones[ b ].parent ].addChild( this.bones[ b ] );
		}

		//this.boneMatrices = new Float32Array( 16 * this.bones.length );
		
		this.pose();

	}

};

THREE.SkinnedMesh.prototype             = new THREE.Mesh();
THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh;


/*
 * Update
 */

THREE.SkinnedMesh.prototype.update = function( parentGlobalMatrix, forceUpdate, camera, renderer ) {
	
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
			forceUpdate              = true;
			
			
			// update normal

			this.normalMatrix = THREE.Matrix4.makeInvert3x3( this.globalMatrix ).transpose();

		}


		// update children
	
		for( var i = 0; i < this.children.length; i++ )
			if( this.children[ i ] instanceof THREE.Bone )
				this.children[ i ].update( this.identityMatrix, false, camera, renderer );
			else
				this.children[ i ].update( this.globalMatrix, forceUpdate, camera, renderer );
			


		// check camera frustum and add to render list
		
		if( renderer && camera ) {
			
			if( camera.frustumContains( this ) )
				renderer.addToRenderList( this );
			else
				renderer.removeFromRenderList( this );

		}

	} else {
		
		renderer.removeFromRenderList( this );

	}

};


/*
 * Add 
 */

THREE.SkinnedMesh.prototype.addBone = function( bone ) {
	
	if( bone === undefined ) 
		bone = new THREE.Bone( this );
	
	this.bones.push( bone );
	
	return bone;

};

/*
 * Pose
 */

THREE.SkinnedMesh.prototype.pose = function() {

	this.update( undefined, true );

	var bim, bone,
		boneInverses = [];
	
	for( var b = 0; b < this.bones.length; b++ ) {
		
		boneInverses.push( THREE.Matrix4.makeInvert( this.bones[ b ].skinMatrix, new THREE.Matrix4() ) );
		this.boneMatrices.push( this.bones[ b ].skinMatrix.flatten32 );
		
/*		
		bone = this.bones[ b ];
		
		boneInverses.push( THREE.Matrix4.makeInvert( bone.skinMatrix ) );
		
		bim = new Float32Array( 16 );
		bone.skinMatrix.flattenToArray( bim );
		this.boneMatrices.push( bim );

		//bone.skinMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );
*/
	}
	

	// project vertices to local 

	if( this.geometry.skinVerticesA === undefined ) {
		
		this.geometry.skinVerticesA = [];
		this.geometry.skinVerticesB = [];
		var orgVertex;
		var vertex;
	
		for( var i = 0; i < this.geometry.skinIndices.length; i++ ) {
			
			orgVertex = this.geometry.vertices[ i ].position;
	
			var indexA = this.geometry.skinIndices[ i ].x;
			var indexB = this.geometry.skinIndices[ i ].y;
	
			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesA.push( boneInverses[ indexA ].multiplyVector3( vertex ) );
	
			vertex = new THREE.Vector3( orgVertex.x, orgVertex.y, orgVertex.z );
			this.geometry.skinVerticesB.push( boneInverses[ indexB ].multiplyVector3( vertex ) );
			
			// todo: add more influences
	
			// normalize weights
	
			if( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y !== 1 ) {
				
				var len = ( 1.0 - ( this.geometry.skinWeights[ i ].x + this.geometry.skinWeights[ i ].y )) * 0.5;
				this.geometry.skinWeights[ i ].x += len;
				this.geometry.skinWeights[ i ].y += len;

			}

		}

	}

};

