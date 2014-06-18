/**
 * @author mikael emtinger / http://gomo.se/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Animation = function ( root, data ) {

	this.root = root;
	this.data = THREE.AnimationHandler.init( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );

	this.currentTime = 0;
	this.timeScale = 1;

	this.isPlaying = false;
	this.loop = true;
	this.weight = 0;

	this.interpolationType = THREE.AnimationHandler.LINEAR;

};


THREE.Animation.prototype.keyTypes = [ "pos", "rot", "scl" ];


THREE.Animation.prototype.play = function ( startTime, weight ) {

	this.currentTime = startTime !== undefined ? startTime : 0;
	this.weight = weight !== undefined ? weight: 1;

	this.isPlaying = true;

	this.reset();

	THREE.AnimationHandler.play( this );

};


THREE.Animation.prototype.stop = function() {

	this.isPlaying = false;

	THREE.AnimationHandler.stop( this );

};

THREE.Animation.prototype.reset = function () {

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

		var object = this.hierarchy[ h ];

		object.matrixAutoUpdate = true;

		if ( object.animationCache === undefined ) {

			object.animationCache = {};

		}

		if ( object.animationCache[this.data.name] === undefined ) {

			object.animationCache[this.data.name] = {};
			object.animationCache[this.data.name].prevKey = { pos: 0, rot: 0, scl: 0 };
			object.animationCache[this.data.name].nextKey = { pos: 0, rot: 0, scl: 0 };
			object.animationCache[this.data.name].originalMatrix = object.matrix;

		}

		var animationCache = object.animationCache[this.data.name];

		// Get keys to match our current time

		for ( var t = 0; t < 3; t ++ ) {

			var type = this.keyTypes[ t ];

			var prevKey = this.data.hierarchy[ h ].keys[ 0 ];
			var nextKey = this.getNextKeyWith( type, h, 1 );

			while ( nextKey.time < this.currentTime && nextKey.index > prevKey.index ) {

				prevKey = nextKey;
				nextKey = this.getNextKeyWith( type, h, nextKey.index + 1 );

			}

			animationCache.prevKey[ type ] = prevKey;
			animationCache.nextKey[ type ] = nextKey;

		}

	}

};


THREE.Animation.prototype.update = (function(){

	var points = [];
	var target = new THREE.Vector3();
	var newVector = new THREE.Vector3();
	var newQuat = new THREE.Quaternion();

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

		if ( this.weight === 0 )
			return;

		//

		var duration = this.data.length;

		if ( this.loop === true && this.currentTime > duration ) {

			this.currentTime %= duration;
			this.reset();

		} else if ( this.loop === false && this.currentTime > duration ) {

			this.stop();
			return;

		}

		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var object = this.hierarchy[ h ];
			var animationCache = object.animationCache[this.data.name];

			// loop through pos/rot/scl

			for ( var t = 0; t < 3; t ++ ) {

				// get keys

				var type    = this.keyTypes[ t ];
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

					if ( this.interpolationType === THREE.AnimationHandler.LINEAR ) {

						newVector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
						newVector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
						newVector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

						// blend
						if ( object instanceof THREE.Bone ) {

							var proportionalWeight = this.weight / ( this.weight + object.accumulatedPosWeight );
							object.position.lerp( newVector, proportionalWeight );
							object.accumulatedPosWeight += this.weight;

						} else {

							object.position.copy( newVector );

						}

					} else if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
								this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

						points[ 0 ] = this.getPrevKeyWith( "pos", h, prevKey.index - 1 )[ "pos" ];
						points[ 1 ] = prevXYZ;
						points[ 2 ] = nextXYZ;
						points[ 3 ] = this.getNextKeyWith( "pos", h, nextKey.index + 1 )[ "pos" ];

						scale = scale * 0.33 + 0.33;

						var currentPoint = interpolateCatmullRom( points, scale );
						var proportionalWeight = 1;
						
						if ( object instanceof THREE.Bone ) {

							proportionalWeight = this.weight / ( this.weight + object.accumulatedPosWeight );
							object.accumulatedPosWeight += this.weight;

						}

						// blend

						var vector = object.position;
						
						vector.x = vector.x + ( currentPoint[ 0 ] - vector.x ) * proportionalWeight;
						vector.y = vector.y + ( currentPoint[ 1 ] - vector.y ) * proportionalWeight;
						vector.z = vector.z + ( currentPoint[ 2 ] - vector.z ) * proportionalWeight;

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

					THREE.Quaternion.slerp( prevXYZ, nextXYZ, newQuat, scale );

					// Avoid paying the cost of an additional slerp if we don't have to
					if ( ! ( object instanceof THREE.Bone ) ) {

						object.quaternion.copy(newQuat);

					} else if ( object.accumulatedRotWeight === 0 ) {

						object.quaternion.copy(newQuat);
						object.accumulatedRotWeight = this.weight;

					} else {

						var proportionalWeight = this.weight / ( this.weight + object.accumulatedRotWeight );
						THREE.Quaternion.slerp( object.quaternion, newQuat, object.quaternion, proportionalWeight );
						object.accumulatedRotWeight += this.weight;

					}

				} else if ( type === "scl" ) {

					newVector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
					newVector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
					newVector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

					if ( object instanceof THREE.Bone ) {

						var proportionalWeight = this.weight / ( this.weight + object.accumulatedSclWeight);
						object.scale.lerp( newVector, proportionalWeight );
						object.accumulatedSclWeight += this.weight;

					} else {

						object.scale.copy( newVector );

					}

				}

			}

		}

		return true;

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

	for ( ; key < keys.length; key ++ ) {

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
