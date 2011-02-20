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
	
	var b, bone, gbone, p, q, s;
	
	if( this.geometry.bones !== undefined ) {
		
		for( b = 0; b < this.geometry.bones.length; b++ ) {
			
			gbone = this.geometry.bones[ b ];
			
			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;
			
			bone = this.addBone();
			
			bone.name = gbone.name;
			bone.position.set( p[0], p[1], p[2] ); 
			bone.quaternion.set( q[0], q[1], q[2], q[3] );
			
			if ( s !== undefined )
				bone.scale.set( s[0], s[1], s[2] );
			else
				bone.scale.set( 1, 1, 1 );

		}
		
		for( b = 0; b < this.bones.length; b++ ) {
			
			gbone = this.geometry.bones[ b ];
			bone = this.bones[ b ];
			
			if( gbone.parent === -1 ) 
				this.addChild( bone );
			else
				this.bones[ gbone.parent ].addChild( bone );

		}

		this.boneMatrices = new Float32Array( 16 * this.bones.length );
		
		this.pose();

	}

};

THREE.SkinnedMesh.prototype             = new THREE.Mesh();
THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh;


/*
 * Update
 */

THREE.SkinnedMesh.prototype.update = function( parentGlobalMatrix, forceUpdate, camera ) {
	
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
			forceUpdate              = true;

		}


		// update children
	
		var child, i, l = this.children.length;
		
		for( i = 0; i < l; i++ ) {
			
			child = this.children[ i ];
			
			if( child instanceof THREE.Bone )
				child.update( this.identityMatrix, false, camera );
			else
				child.update( this.globalMatrix, forceUpdate, camera );
			
		}

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

		bone = this.bones[ b ];
		
		boneInverses.push( THREE.Matrix4.makeInvert( bone.skinMatrix ) );

		bone.skinMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );

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

