/**
 * @author mikael emtinger / http://gomo.se/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Animation = function ( root, name ) {

	this.root = root;
	this.data = THREE.AnimationHandler.get( name );
	this.hierarchy = THREE.AnimationHandler.parse( root );

	this.currentTime = 0;
	this.timeScale = 1;

	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;

	this.interpolationType = THREE.AnimationHandler.LINEAR;

};

THREE.Animation.prototype.play = function ( startTime ) {

	this.currentTime = startTime !== undefined ? startTime : 0;

	if ( this.isPlaying === false ) {

		this.isPlaying = true;

		this.reset();
		this.update( 0 );

	}

	this.isPaused = false;

	THREE.AnimationHandler.addToUpdate( this );

};


THREE.Animation.prototype.pause = function() {

	if ( this.isPaused === true ) {

		THREE.AnimationHandler.addToUpdate( this );

	} else {

		THREE.AnimationHandler.removeFromUpdate( this );

	}

	this.isPaused = !this.isPaused;

};


THREE.Animation.prototype.stop = function() {

	this.isPlaying = false;
	this.isPaused  = false;
	THREE.AnimationHandler.removeFromUpdate( this );

};

THREE.Animation.prototype.reset = function () {

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

		var object = this.hierarchy[ h ];

		object.matrixAutoUpdate = true;

		if ( object.animationCache === undefined ) {

			object.animationCache = {};
			object.animationCache.prevKey = { pos: 0, rot: 0, scl: 0 };
			object.animationCache.nextKey = { pos: 0, rot: 0, scl: 0 };
			object.animationCache.originalMatrix = object instanceof THREE.Bone ? object.skinMatrix : object.matrix;

		}

		var prevKey = object.animationCache.prevKey;
		var nextKey = object.animationCache.nextKey;

		prevKey.pos = this.data.hierarchy[ h ].keys[ 0 ];
		prevKey.rot = this.data.hierarchy[ h ].keys[ 0 ];
		prevKey.scl = this.data.hierarchy[ h ].keys[ 0 ];

		nextKey.pos = this.getNextKeyWith( "pos", h, 1 );
		nextKey.rot = this.getNextKeyWith( "rot", h, 1 );
		nextKey.scl = this.getNextKeyWith( "scl", h, 1 );

	}

};


THREE.Animation.prototype.update = (function(){

	var points = [];
	var target = new THREE.Vector3();
	
	// Catmull-Rom spline

	var interpolateCatmullRom = function ( points, scale ) {

		var c = [], v3 = [],
		point, intPoint, weight, w2, w3,
		pa, pb, pc, pd;
	
		point = ( points.length - 1 ) * scale;
		intPoint = Math.floor( point );
		weight = point - intPoint;
	
		c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
		c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;
	
		pa = points[ c[ 0 ] ];
		pb = points[ c[ 1 ] ];
		pc = points[ c[ 2 ] ];
		pd = points[ c[ 3 ] ];
	
		w2 = weight * weight;
		w3 = weight * w2;
	
		v3[ 0 ] = interpolate( pa[ 0 ], pb[ 0 ], pc[ 0 ], pd[ 0 ], weight, w2, w3 );
		v3[ 1 ] = interpolate( pa[ 1 ], pb[ 1 ], pc[ 1 ], pd[ 1 ], weight, w2, w3 );
		v3[ 2 ] = interpolate( pa[ 2 ], pb[ 2 ], pc[ 2 ], pd[ 2 ], weight, w2, w3 );
	
		return v3;

	};

	var interpolate = function ( p0, p1, p2, p3, t, t2, t3 ) {
	
		var v0 = ( p2 - p0 ) * 0.5,
			v1 = ( p3 - p1 ) * 0.5;
	
		return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;
	
	};
	
	return function ( delta ) {
		if ( this.isPlaying === false ) return;
	
		this.currentTime += delta * this.timeScale;
	
		//
	
		var vector;
		var types = [ "pos", "rot", "scl" ];
	
		var duration = this.data.length;
	
		if ( this.loop === true && this.currentTime > duration ) {
	
			this.currentTime %= duration;
			this.reset();
	
		} else if ( this.loop === false && this.currentTime > duration ) {
	
			this.stop();
			return;
	
		}
	
		this.currentTime = Math.min( this.currentTime, duration );
	
		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {
	
			var object = this.hierarchy[ h ];
			var animationCache = object.animationCache;
	
			// loop through pos/rot/scl
	
			for ( var t = 0; t < 3; t ++ ) {
	
				// get keys
	
				var type    = types[ t ];
				var prevKey = animationCache.prevKey[ type ];
				var nextKey = animationCache.nextKey[ type ];
	
				if ( nextKey.time <= this.currentTime ) {
	
					prevKey = this.data.hierarchy[ h ].keys[ 0 ];
					nextKey = this.getNextKeyWith( type, h, 1 );
	
					while ( nextKey.time < this.currentTime && nextKey.index > prevKey.index ) {
	
						prevKey = nextKey;
						nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );
	
					}
	
					animationCache.prevKey[ type ] = prevKey;
					animationCache.nextKey[ type ] = nextKey;
	
				}
	
				object.matrixAutoUpdate = true;
				object.matrixWorldNeedsUpdate = true;
	
				var scale = ( this.currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );
	
				var prevXYZ = prevKey[ type ];
				var nextXYZ = nextKey[ type ];
	
				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;
	
				// interpolate
	
				if ( type === "pos" ) {
	
					vector = object.position;
	
					if ( this.interpolationType === THREE.AnimationHandler.LINEAR ) {
	
						vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
						vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
						vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;
	
					} else if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
						this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {
	
						points[ 0 ] = this.getPrevKeyWith( "pos", h, prevKey.index - 1 )[ "pos" ];
						points[ 1 ] = prevXYZ;
						points[ 2 ] = nextXYZ;
						points[ 3 ] = this.getNextKeyWith( "pos", h, nextKey.index + 1 )[ "pos" ];
	
						scale = scale * 0.33 + 0.33;
	
						var currentPoint = interpolateCatmullRom( points, scale );
	
						vector.x = currentPoint[ 0 ];
						vector.y = currentPoint[ 1 ];
						vector.z = currentPoint[ 2 ];
	
						if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {
	
							var forwardPoint = interpolateCatmullRom( points, scale * 1.01 );
	
							target.set( forwardPoint[ 0 ], forwardPoint[ 1 ], forwardPoint[ 2 ] );
							target.sub( vector );
							target.y = 0;
							target.normalize();
	
							var angle = Math.atan2( target.x, target.z );
							object.rotation.set( 0, angle, 0 );
	
						}
	
					}
	
				} else if ( type === "rot" ) {
	
					THREE.Quaternion.slerp( prevXYZ, nextXYZ, object.quaternion, scale );
	
				} else if ( type === "scl" ) {
	
					vector = object.scale;
	
					vector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
					vector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
					vector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;
	
				}
	
			}
	
		}

	};

})();





// Get next key with

THREE.Animation.prototype.getNextKeyWith = function ( type, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;

	if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
		 this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

		key = key < keys.length - 1 ? key : keys.length - 1;

	} else {

		key = key % keys.length;

	}

	for ( ; key < keys.length; key++ ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ 0 ];

};

// Get previous key with

THREE.Animation.prototype.getPrevKeyWith = function ( type, h, key ) {

	var keys = this.data.hierarchy[ h ].keys;

	if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
		this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

		key = key > 0 ? key : 0;

	} else {

		key = key >= 0 ? key : key + keys.length;

	}


	for ( ; key >= 0; key -- ) {

		if ( keys[ key ][ type ] !== undefined ) {

			return keys[ key ];

		}

	}

	return this.data.hierarchy[ h ].keys[ keys.length - 1 ];

};
