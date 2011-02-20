/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Animation = function( root, data ) {
	
	this.root      = root;
	this.data      = data;
	this.hierarchy = [];

	this.startTime = 0;
	this.isPlaying = false;
	this.loop      = true;
	
	this.offset    = 0;


	// need to initialize data?

	if( !this.data.initialized )
		THREE.AnimationHandler.initData( this.data );


	// setup hierarchy

	if( root instanceof THREE.SkinnedMesh ) {
		
		for( var b = 0; b < this.root.bones.length; b++ )
			this.hierarchy.push( this.root.bones[ b ] );

	}
	else {
		
		// parse hierarchy and match against animation (somehow)
	}

}


/*
 * Play
 */

THREE.Animation.prototype.play = function( loop ) {

	if( !this.isPlaying ) {
		
		this.isPlaying = true;
		this.startTime = new Date().getTime() * 0.001;

		
		// reset key cache
		
		for( var h = 0; h < this.hierarchy.length; h++ ) {
			
			this.hierarchy[ h ].useQuaternion    = true;
			this.hierarchy[ h ].matrixAutoUpdate = true;
			
			if( this.hierarchy[ h ].prevKey === undefined ) {
				
				this.hierarchy[ h ].prevKey = { pos: 0, rot: 0, scl: 0 };
				this.hierarchy[ h ].nextKey = { pos: 0, rot: 0, scl: 0 };

			}
			
			this.hierarchy[ h ].prevKey.pos = this.data.hierarchy[ h ].keys[ 0 ];
			this.hierarchy[ h ].prevKey.rot = this.data.hierarchy[ h ].keys[ 0 ];
			this.hierarchy[ h ].prevKey.scl = this.data.hierarchy[ h ].keys[ 0 ];
			
			this.hierarchy[ h ].nextKey.pos = this.getNextKeyWith( "pos", h, 1 );
			this.hierarchy[ h ].nextKey.rot = this.getNextKeyWith( "rot", h, 1 );
			this.hierarchy[ h ].nextKey.scl = this.getNextKeyWith( "scl", h, 1 );
		}	
		
		this.update();
		
		THREE.AnimationHandler.add( this );

	}

};


/*
 * Pause
 */

THREE.Animation.prototype.pause = function() {
	
	THREE.AnimationHandler.remove( this );
	
	// todo
}


/*
 * Stop
 */

THREE.Animation.prototype.stop = function() {
	
	this.isPlaying = false;
	THREE.AnimationHandler.remove( this );
}


/*
 * Update
 */

THREE.Animation.prototype.update = function( time ) {

	// todo: add input time

	// early out
	
	if( !this.isPlaying ) return;


	// vars
	
	var types = [ "pos", "rot", "scl" ];
	var scale;
	var relative;
	var vector;
	var prevXYZ, nextXYZ;
	var object;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	
	
	// update
	
	var currentTime         = new Date().getTime() * 0.001 - this.startTime + this.offset;
	var unloopedCurrentTime = currentTime;


	// looped?
	
	if( currentTime > this.data.length ) {
		
		while( currentTime > this.data.length )
			currentTime -= this.data.length;
		
		this.startTime = new Date().getTime() * 0.001 - currentTime;
		currentTime    = new Date().getTime() * 0.001 - this.startTime;

	}
	
	frame = Math.min( parseInt( currentTime * this.data.fps ), parseInt( this.data.length * this.data.fps ));
	
	
	// update
	
	for( var h = 0, hl = this.hierarchy.length; h < hl; h++ )
	{
		object = this.hierarchy[ h ];
	
		if( JIThierarchy[ h ][ frame ] !== undefined ) {

			object.skinMatrix           = JIThierarchy[ h ][ frame ];
			object.matrixAutoUpdate     = false;
			object.matrixNeedsUpdate  = false;
			
			//object.skinMatrix.flattenToArray( this.root.boneMatrices[ h ] );
			object.skinMatrix.flattenToArrayOffset( this.root.boneMatrices, h * 16 );
			
		}
		else {
		
			for( var t = 0; t < 3; t++ ) {
				
				// get keys
				
				var type    = types[ t ];
				var prevKey = object.prevKey[ type ];
				var nextKey = object.nextKey[ type ];
				
				// switch keys?
							
				if( nextKey.time < unloopedCurrentTime ) {
		
					// did we loop?
		
					if( currentTime < unloopedCurrentTime ) {
						
						if( this.loop ) {
							
							prevKey = this.data.hierarchy[ h ].keys[ 0 ];
							nextKey = this.getNextKeyWith( type, h, 1 );

						} else {
							
							this.stop();
							return;

						}

					} else {
						
						do {
							
							prevKey = nextKey;
							nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );
						}
						while( nextKey.time < currentTime )
					}
		
					object.prevKey[ type ] = prevKey;
					object.nextKey[ type ] = nextKey;

				}
				
				
				// interpolate rot (quaternion slerp)
				
				object.matrixAutoUpdate = true;
				object.matrixNeedsUpdate = true;
				
				scale   = ( currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );
				prevXYZ = prevKey[ type ];
				nextXYZ = nextKey[ type ];
		
				if( type === "rot" ) {
		
					if( scale < 0 || scale > 1 ) {
						
						console.log( "Scale out of bounds:" + scale ); 
						scale = scale < 0 ? 0 : 1;
					
					}
		
					THREE.Quaternion.slerp( prevXYZ, nextXYZ, object.quaternion, scale );

				}
				
				// lerp pos/scl 

				else {
					
					vector   = type === "pos" ? object.position : object.scale; 
					vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
					vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
					vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

				}
			}	
		}
	}
	
	
	// update JIT?
	
	if( JIThierarchy[ 0 ][ frame ] === undefined ) {
		
		this.hierarchy[ 0 ].update( undefined, true );
	
		for( var h = 0; h < this.hierarchy.length; h++ ) 
			JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].skinMatrix.clone();

	}

};



/*
 * Update Object
 */	

THREE.Animation.prototype.updateObject = function( h, currentTime, unloopedCurrentTime ) {
	

}
		
		


THREE.Animation.prototype.getNextKeyWith = function( type, h, key ) {
	
	var keys = this.data.hierarchy[ h ].keys;
	
	for( ; key < keys.length; key++ ) {
		
		if( keys[ key ][ type ] !== undefined )
			return keys[ key ];

	}

	return this.data.hierarchy[ h ].keys[ 0 ];

}














