/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Animation = function( root, data, interpolationType, JITCompile ) {

	this.root = root;
	this.data = THREE.AnimationHandler.get( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );
	this.currentTime = 0;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.interpolationType = interpolationType !== undefined ? interpolationType : THREE.AnimationHandler.LINEAR;
	this.JITCompile = JITCompile !== undefined ? JITCompile : true;
}

/*
 * Play
 */

THREE.Animation.prototype.play = function( loop, startTimeMS ) {

	if( !this.isPlaying ) {

		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;


		// reset key cache

		for ( var h = 0; h < this.hierarchy.length; h++ ) {

			this.hierarchy[ h ].useQuaternion    = true;
			this.hierarchy[ h ].matrixAutoUpdate = true;

			if ( this.hierarchy[ h ].animationCache === undefined ) {

				this.hierarchy[ h ].animationCache = {};
				this.hierarchy[ h ].animationCache.prevKey = { pos: 0, rot: 0, scl: 0 };
				this.hierarchy[ h ].animationCache.nextKey = { pos: 0, rot: 0, scl: 0 };
				this.hierarchy[ h ].animationCache.originalMatrix = this.hierarchy[ h ] instanceof THREE.Bone ? this.hierarchy[ h ].skinMatrix : this.hierarchy[ h ].matrix;
			}


			var prevKey = this.hierarchy[ h ].animationCache.prevKey;
			var nextKey = this.hierarchy[ h ].animationCache.nextKey;

			prevKey.pos = this.data.hierarchy[ h ].keys[ 0 ];
			prevKey.rot = this.data.hierarchy[ h ].keys[ 0 ];
			prevKey.scl = this.data.hierarchy[ h ].keys[ 0 ];

			nextKey.pos = this.getNextKeyWith( "pos", h, 1 );
			nextKey.rot = this.getNextKeyWith( "rot", h, 1 );
			nextKey.scl = this.getNextKeyWith( "scl", h, 1 );
		}

		this.update( 0 );
	}

	this.isPaused = false;

	THREE.AnimationHandler.addToUpdate( this );
};


/*
 * Pause
 */

THREE.Animation.prototype.pause = function() {

	if( this.isPaused ) {
		
		THREE.AnimationHandler.addToUpdate( this );
		
	} else {
		
		THREE.AnimationHandler.removeFromUpdate( this );
		
	}
	
	this.isPaused = !this.isPaused;
}


/*
 * Stop
 */

THREE.Animation.prototype.stop = function() {

	this.isPlaying = false;
	THREE.AnimationHandler.removeFromUpdate( this );
	
	
	// reset JIT matrix and remove cache
	
	for ( var h = 0; h < this.hierarchy.length; h++ ) {
		
		if ( this.hierarchy[ h ].animationCache !== undefined ) {
			
			if( this.hierarchy[ h ] instanceof THREE.Bone ) {
			
				this.hierarchy[ h ].skinMatrix = this.hierarchy[ h ].animationCache.originalMatrix;
				
			} else {
				
				this.hierarchy[ h ].matrix = this.hierarchy[ h ].animationCache.originalMatrix;
			}
			
			
			delete this.hierarchy[ h ].animationCache;	
		}
	}
 	
}


/*
 * Update
 */

THREE.Animation.prototype.update = function( deltaTimeMS ) {

	// early out

	if( !this.isPlaying ) return;


	// vars

	var types = [ "pos", "rot", "scl" ];
	var type;
	var scale;
	var vector;
	var prevXYZ, nextXYZ;
	var prevKey, nextKey;
	var object;
	var animationCache;
	var frame;
	var JIThierarchy = this.data.JIT.hierarchy;
	var currentTime, unloopedCurrentTime;
	

	// update
	
	this.currentTime += deltaTimeMS;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;
	frame               = parseInt( Math.min( currentTime * this.data.fps, this.data.length * this.data.fps ), 10 );


	// update

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

		object = this.hierarchy[ h ];
		animationCache = object.animationCache;
	
		// use JIT?
	
		if ( this.JITCompile && JIThierarchy[ h ][ frame ] !== undefined ) {

			if( object instanceof THREE.Bone ) {
				
				object.skinMatrix = JIThierarchy[ h ][ frame ];
				
				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = false;
			}
			else {
			
				object.matrix = JIThierarchy[ h ][ frame ];
				
				object.matrixAutoUpdate = false;
				object.matrixWorldNeedsUpdate = true;
			}
			
		// use interpolation
	
		} else {

			// make sure so original matrix and not JIT matrix is set

			if ( this.JITCompile ) {
				
				if( object instanceof THREE.Bone ) {
					
					object.skinMatrix = object.animationCache.originalMatrix;
					
				} else {
					
					object.matrix = object.animationCache.originalMatrix;
					
				}

			}


			// loop through pos/rot/scl

			for ( var t = 0; t < 3; t++ ) {

				// get keys

				type    = types[ t ];
				prevKey = animationCache.prevKey[ type ];
				nextKey = animationCache.nextKey[ type ];

				// switch keys?

				if ( nextKey.time <= unloopedCurrentTime ) {

					// did we loop?

					if ( currentTime < unloopedCurrentTime ) {

						if ( this.loop ) {

							prevKey = this.data.hierarchy[ h ].keys[ 0 ];
							nextKey = this.getNextKeyWith( type, h, 1 );

							while( nextKey.time < currentTime ) {
	
								prevKey = nextKey;
								nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );
	
							}

						} else {

							this.stop();
							return;

						}

					} else {

						do {

							prevKey = nextKey;
							nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );

						} while( nextKey.time < currentTime )

					}

					animationCache.prevKey[ type ] = prevKey;
					animationCache.nextKey[ type ] = nextKey;

				}


				object.matrixAutoUpdate = true;
				object.matrixWorldNeedsUpdate = true;

				scale = ( currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );
				prevXYZ = prevKey[ type ];
				nextXYZ = nextKey[ type ];


				// check scale error

				if ( scale < 0 || scale > 1 ) {

					console.log( "THREE.Animation.update: Warning! Scale out of bounds:" + scale + " on bone " + h ); 
					scale = scale < 0 ? 0 : 1;

				}

				// interpolate

				if ( type === "pos" ) {

					if( this.interpolationType === THREE.AnimationHandler.LINEAR ) {
						
						vector   = object.position; 
						vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
						vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
						vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

					} else {
						
						var points = [];
		
						points[ 0 ] = this.getPrevKeyWith( type, h, prevKey.index - 1 )[ type ];
						points[ 1 ] = prevXYZ;
						points[ 2 ] = nextXYZ;
						points[ 3 ] = this.getNextKeyWith( type, h, nextKey.index + 1 )[ type ];

						scale = scale * 0.33 + 0.33;

						var result = this.interpolateCatmullRom( points, scale );
						
						object.position.x = result[ 0 ];
						object.position.y = result[ 1 ];
						object.position.z = result[ 2 ];
					}
				}
				else if ( type === "rot" ) {

					THREE.Quaternion.slerp( prevXYZ, nextXYZ, object.quaternion, scale );

				}
				else if( type === "scl" ) {

					vector   = object.scale; 
					vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
					vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
					vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

				}

			}

		}

	}

	// update JIT?

	if ( this.JITCompile ) {
		
		if ( JIThierarchy[ 0 ][ frame ] === undefined ) {
	
			this.hierarchy[ 0 ].update( undefined, true );
	
			for ( var h = 0; h < this.hierarchy.length; h++ ) {
	
				if( this.hierarchy[ h ] instanceof THREE.Bone ) {
	
					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].skinMatrix.clone();
					
				} else {
	
					JIThierarchy[ h ][ frame ] = this.hierarchy[ h ].matrix.clone();
				
				}
	
			}
	
		}

	}

};


/**
 * Spline from Tween.js, slightly optimized
 * Modified to fit to THREE.Animation.js
 * 
 * http://sole.github.com/tween.js/examples/05_spline.html
 *
 * @author mrdoob / http://mrdoob.com/
 */

 
THREE.Animation.prototype.interpolateCatmullRom = function ( points, scale ) {

	var c = [], v3 = [],
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;
	
	point = ( points.length - 1 ) * scale;
	intPoint = Math.floor( point );
	weight = point - intPoint;

	c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
	c[ 1 ] = intPoint;
	c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
	c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

	pa = points[ c[ 0 ] ];
	pb = points[ c[ 1 ] ];
	pc = points[ c[ 2 ] ];
	pd = points[ c[ 3 ] ];

	w2 = weight * weight;
	w3 = weight * w2;
	
	v3[ 0 ] = this.interpolate( pa[ 0 ], pb[ 0 ], pc[ 0 ], pd[ 0 ], weight, w2, w3 );
	v3[ 1 ] = this.interpolate( pa[ 1 ], pb[ 1 ], pc[ 1 ], pd[ 1 ], weight, w2, w3 );
	v3[ 2 ] = this.interpolate( pa[ 2 ], pb[ 2 ], pc[ 2 ], pd[ 2 ], weight, w2, w3 );
	
	return v3;
}


THREE.Animation.prototype.interpolate = function( p0, p1, p2, p3, t, t2, t3 ) {

	var v0 = ( p2 - p0 ) * 0.5,
		v1 = ( p3 - p1 ) * 0.5;

	return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;
}


/*
 * Get next key with
 */

THREE.Animation.prototype.getNextKeyWith = function( type, h, key ) {
	
	var keys = this.data.hierarchy[ h ].keys;
	key      = key % keys.length;

	for ( ; key < keys.length; key++ ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ 0 ];

}

THREE.Animation.prototype.getPrevKeyWith = function( type, h, key ) {
	
	var keys = this.data.hierarchy[ h ].keys;
	key      = key >= 0 ? key : key + keys.length;

	for ( ; key >= 0; key-- ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ keys.length - 1 ];
}
