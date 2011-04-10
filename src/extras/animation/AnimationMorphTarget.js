/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.AnimationMorphTarget = function( root, data ) {

	this.root = root;
	this.data = THREE.AnimationHandler.get( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );
	this.currentTime = 0;
	this.timeScale = 1;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;
	this.influence = 1;
}

/*
 * Play
 */

THREE.AnimationMorphTarget.prototype.play = function( loop, startTimeMS ) {

	if( !this.isPlaying ) {

		this.isPlaying = true;
		this.loop = loop !== undefined ? loop : true;
		this.currentTime = startTimeMS !== undefined ? startTimeMS : 0;


		// reset key cache

		for ( var h = 0; h < this.hierarchy.length; h++ ) {

			if ( this.hierarchy[ h ].animationCache === undefined ) {

				this.hierarchy[ h ].animationCache = {};
				this.hierarchy[ h ].animationCache.prevKey = 0;
				this.hierarchy[ h ].animationCache.nextKey = 0;
			}

			this.hierarchy[ h ].animationCache.prevKey = this.data.hierarchy[ h ].keys[ 0 ];
			this.hierarchy[ h ].animationCache.nextKey = this.data.hierarchy[ h ].keys[ 1 ];
		}

		this.update( 0 );
	}

	this.isPaused = false;
	THREE.AnimationHandler.addToUpdate( this );
}


/*
 * Pause
 */

THREE.AnimationMorphTarget.prototype.pause = function() {

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

THREE.AnimationMorphTarget.prototype.stop = function() {

	this.isPlaying = false;
	this.isPaused  = false;
	
	THREE.AnimationHandler.removeFromUpdate( this );
	
	
	// reset JIT matrix and remove cache
	
	for ( var h = 0; h < this.hierarchy.length; h++ ) {
		
		if ( this.hierarchy[ h ].animationCache !== undefined ) {
			
			delete this.hierarchy[ h ].animationCache;	
		}

	}

}


/*
 * Update
 */

THREE.AnimationMorphTarget.prototype.update = function( deltaTimeMS ) {

	// early out

	if( !this.isPlaying ) return;


	// vars

	var scale;
	var vector;
	var prevXYZ, nextXYZ;
	var prevKey, nextKey;
	var object;
	var animationCache;
	var currentTime, unloopedCurrentTime;
	

	// update time
	
	this.currentTime += deltaTimeMS * this.timeScale;

	unloopedCurrentTime = this.currentTime;
	currentTime         = this.currentTime = this.currentTime % this.data.length;


	// update

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h++ ) {

		object = this.hierarchy[ h ];
		animationCache = object.animationCache;


		// get keys

		prevKey = animationCache.prevKey;
		nextKey = animationCache.nextKey;


		// switch keys?

		if ( nextKey.time <= unloopedCurrentTime ) {

			// did we loop?

			if ( currentTime < unloopedCurrentTime ) {

				if ( this.loop ) {

					prevKey = this.data.hierarchy[ h ].keys[ 0 ];
					nextKey = this.data.hierarchy[ h ].keys[ 1 ];

					while( nextKey.time < currentTime ) {

						prevKey = nextKey;
						nextKey = this.data.hierarchy[ h ].keys[ nextKey.index + 1 ];

					}

				} else {

					this.stop();
					return;

				}

			} else {

				do {

					prevKey = nextKey;
					nextKey = this.data.hierarchy[ h ].keys[ nextKey.index + 1 ];

				} while( nextKey.time < currentTime )

			}

			animationCache.prevKey = prevKey;
			animationCache.nextKey = nextKey;

		}


		// calc scale and check for error

		scale = ( currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );

		if ( scale < 0 || scale > 1 ) {

			console.log( "THREE.AnimationMorphTarget.update: Warning! Scale out of bounds:" + scale ); 
			scale = scale < 0 ? 0 : 1;

		}


		// interpolate
		
		var pi, pmti = prevKey.morphTargetsInfluences;
		var ni, nmti = nextKey.morphTargetsInfluences;
		var mt, i;
		
		for( mt in pmti ) {
			
			pi = pmti[ mt ];
			ni = nmti[ mt ];
			i = this.root.getMorphTargetIndexByName( mt );
			
			this.root.morphTargetInfluences[ i ] = ( pi + ( ni - pi ) * scale ) * this.influence;
		}

	}

};

