/**
 * @author TatumCreative (Greg Tatum) / http://gregtatum.com/
 */

THREE.MeshGroup = function( objectType, material ) {
	
	THREE.Object3D.call( this );
	
	console.warn( "Todo: check for valid materials" );
		
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );
	this.material.shared = true;
	this.objectType = objectType !== undefined ? objectType : THREE.Mesh;

	
	this.type = 'MeshGroup';
	this.geometry = new THREE.BufferGeometry();
	
	this.matricesTextureWidth = null;
	this.matricesData = null;
	this.matrixIndices = null;
	
	this.matricesTexture = null;
	this.vertexShader = null;
	this.fragmentShader = null;
	
};

THREE.MeshGroup.prototype = Object.create( THREE.Object3D.prototype );
THREE.MeshGroup.prototype.constructor = THREE.MeshGroup;

THREE.MeshGroup.prototype.build = function() {
	
	
	this.buildGeometry();
	this.buildMatrices();
	this.buildMaterial();
	
	this.object = new this.objectType( this.geometry, this.material );
	
	this.object.matricesTexture = this.matricesTexture;

	return this.object;
		
};
	
THREE.MeshGroup.prototype.calculateSquaredTextureWidth = function( count ) {

	var width = 1;
	var i = 0;

	while( width * width < (count / 4) ) {
	
		i++;
		width = Math.pow( 2, i );
	
	}

	return width;
	
};
	
THREE.MeshGroup.prototype.buildGeometry = function() {
	
	var mergedGeometry = new THREE.Geometry();
	
	var childGeometry;
	var matrixIndices = [];
	var i, il, j, jl;
	
	for( i = 0, il = this.children.length; i < il; i++ ) {
		
		childGeometry = this.children[i].geometry;
		
		if( childGeometry ) {
			
			mergedGeometry.merge( childGeometry );
			
			j = mergedGeometry.vertices.length - childGeometry.vertices.length;
			jl = mergedGeometry.vertices.length;
			
			for( ; j < jl; j++ ) {
				matrixIndices[j] = i;
			}
			
		}
		
	}
	
	this.geometry.fromGeometry( mergedGeometry );
	
};
	
THREE.MeshGroup.prototype.generateTransformMatrixIndices = function( object3Ds ) {
	
	var matrixIndices = [];
	var totalLength = 0;
	var positionsInFaces;
	var childGeometry;
	
	var i, il, j, jl;
	
	for( i = 0, il = object3Ds.length; i < il; i++ ) {
		
		childGeometry = object3Ds[i].geometry;
		
		if( childGeometry ) {
			
			positionsInFaces = childGeometry.faces.length * 3; //3 vertices per face
			totalLength += positionsInFaces;
			
			j = totalLength - positionsInFaces;
			jl = totalLength;
			
			for( ; j < jl; j++ ) {
				matrixIndices[j] = i;
			}
			
		}
		
	}
	
	return new Float32Array( matrixIndices );
};

THREE.MeshGroup.prototype.buildMatrices = function() {
	
	//Calculates the n^2 width of the texture
	this.matricesTextureWidth = this.calculateSquaredTextureWidth( this.children.length * 16 ); //16 floats per matrix
	
	//The texture has 4 floats per pixel
	this.matricesData = new Float32Array( this.matricesTextureWidth * this.matricesTextureWidth * 4 );
	
	this.matricesTexture = new THREE.DataTexture(
		this.matricesData,
		this.matricesTextureWidth,
		this.matricesTextureWidth,
		THREE.RGBAFormat,
		THREE.FloatType
	);
	this.matricesTexture.minFilter = THREE.NearestFilter;
	this.matricesTexture.magFilter = THREE.NearestFilter;
	this.matricesTexture.generateMipmaps = false;
	this.matricesTexture.flipY = false;
	this.matricesTexture.needsUpdate = true;
	
	this.material.matricesTexture = this.matricesTexture;
	this.material.matricesTextureWidth = this.matricesTextureWidth;
	
	for( var i = 0, il = this.children.length; i < il ; i++ ) {
		
		this.children[i].visible = false;
		
	}
	
};

THREE.MeshGroup.prototype.buildMaterial = function() {
		
	this.matrixIndices = this.generateTransformMatrixIndices( this.children );
	
	this.geometry.addAttribute( 'transformMatrixIndex', new THREE.BufferAttribute( this.matrixIndices, 1 ) );
			
};

THREE.MeshGroup.prototype.updateMatrixWorld = function( force ) {
	
	if ( this.matrixWorldNeedsUpdate === true || force === true ) {
	
		for( var i = 0, il = this.children.length; i < il ; i++ ) {
			
			this.children[i].updateMatrixWorld( force );
			this.children[i].matrixWorld.flattenToArrayOffset( this.matricesData, i * 16 );
			this.matricesTexture.needsUpdate = true;
			
		}
		
	}
	
};