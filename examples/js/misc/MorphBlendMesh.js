/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MorphBlendMesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.animationsMap = {};
	this.animationsList = [];

	// prepare default animation
	// (all frames played together in 1 second)

	var numFrames = Object.keys( this.morphTargetDictionary ).length;

	var name = '__default';

	var startFrame = 0;
	var endFrame = numFrames - 1;

	var fps = numFrames / 1;

	this.createAnimation( name, startFrame, endFrame, fps );
	this.setAnimationWeight( name, 1 );

};

THREE.MorphBlendMesh.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {

	constructor: THREE.MorphBlendMesh,

	createAnimation: function ( name, start, end, fps ) {

		var animation = {

			start: start,
			end: end,

			length: end - start + 1,

			fps: fps,
			duration: ( end - start ) / fps,

			lastFrame: 0,
			currentFrame: 0,

			active: false,

			time: 0,
			direction: 1,
			weight: 1,

			directionBackwards: false,
			mirroredLoop: false

		};

		this.animationsMap[ name ] = animation;
		this.animationsList.push( animation );

	},

	autoCreateAnimations: function ( fps ) {

		var pattern = /([a-z]+)_?(\d+)/i;

		var firstAnimation, frameRanges = {};

		var i = 0;

		for ( var key in this.morphTargetDictionary ) {

			var chunks = key.match( pattern );

			if ( chunks && chunks.length > 1 ) {

				var name = chunks[ 1 ];

				if ( ! frameRanges[ name ] ) frameRanges[ name ] = { start: Infinity, end: - Infinity };

				var range = frameRanges[ name ];

				if ( i < range.start ) range.start = i;
				if ( i > range.end ) range.end = i;

				if ( ! firstAnimation ) firstAnimation = name;

			}

			i ++;

		}

		for ( var name in frameRanges ) {

			var range = frameRanges[ name ];
			this.createAnimation( name, range.start, range.end, fps );

		}

		this.firstAnimation = firstAnimation;

	},

	setAnimationDirectionForward: function ( name ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.direction = 1;
			animation.directionBackwards = false;

		}

	},

	setAnimationDirectionBackward: function ( name ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.direction = - 1;
			animation.directionBackwards = true;

		}

	},

	setAnimationFPS: function ( name, fps ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.fps = fps;
			animation.duration = ( animation.end - animation.start ) / animation.fps;

		}

	},

	setAnimationDuration: function ( name, duration ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.duration = duration;
			animation.fps = ( animation.end - animation.start ) / animation.duration;

		}

	},

	setAnimationWeight: function ( name, weight ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.weight = weight;

		}

	},

	setAnimationTime: function ( name, time ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.time = time;

		}

	},

	getAnimationTime: function ( name ) {

		var time = 0;

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			time = animation.time;

		}

		return time;

	},

	getAnimationDuration: function ( name ) {

		var duration = - 1;

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			duration = animation.duration;

		}

		return duration;

	},

	playAnimation: function ( name ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.time = 0;
			animation.active = true;

		} else {

			console.warn( "THREE.MorphBlendMesh: animation[" + name + "] undefined in .playAnimation()" );

		}

	},

	stopAnimation: function ( name ) {

		var animation = this.animationsMap[ name ];

		if ( animation ) {

			animation.active = false;

		}

	},

	update: function ( delta ) {

		for ( var i = 0, il = this.animationsList.length; i < il; i ++ ) {

			var animation = this.animationsList[ i ];

			if ( ! animation.active ) continue;

			var frameTime = animation.duration / animation.length;

			animation.time += animation.direction * delta;

			if ( animation.mirroredLoop ) {

				if ( animation.time > animation.duration || animation.time < 0 ) {

					animation.direction *= - 1;

					if ( animation.time > animation.duration ) {

						animation.time = animation.duration;
						animation.directionBackwards = true;

					}

					if ( animation.time < 0 ) {

						animation.time = 0;
						animation.directionBackwards = false;

					}

				}

			} else {

				animation.time = animation.time % animation.duration;

				if ( animation.time < 0 ) animation.time += animation.duration;

			}

			var keyframe = animation.start + THREE.MathUtils.clamp( Math.floor( animation.time / frameTime ), 0, animation.length - 1 );
			var weight = animation.weight;

			if ( keyframe !== animation.currentFrame ) {

				this.morphTargetInfluences[ animation.lastFrame ] = 0;
				this.morphTargetInfluences[ animation.currentFrame ] = 1 * weight;

				this.morphTargetInfluences[ keyframe ] = 0;

				animation.lastFrame = animation.currentFrame;
				animation.currentFrame = keyframe;

			}

			var mix = ( animation.time % frameTime ) / frameTime;

			if ( animation.directionBackwards ) mix = 1 - mix;

			if ( animation.currentFrame !== animation.lastFrame ) {

				this.morphTargetInfluences[ animation.currentFrame ] = mix * weight;
				this.morphTargetInfluences[ animation.lastFrame ] = ( 1 - mix ) * weight;

			} else {

				this.morphTargetInfluences[ animation.currentFrame ] = weight;

			}

		}

	}

} );
