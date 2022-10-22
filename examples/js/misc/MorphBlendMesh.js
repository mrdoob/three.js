( function () {

	class MorphBlendMesh extends THREE.Mesh {

		constructor( geometry, material ) {

			super( geometry, material );
			this.animationsMap = {};
			this.animationsList = [];

			// prepare default animation
			// (all frames played together in 1 second)

			const numFrames = Object.keys( this.morphTargetDictionary ).length;
			const name = '__default';
			const startFrame = 0;
			const endFrame = numFrames - 1;
			const fps = numFrames / 1;
			this.createAnimation( name, startFrame, endFrame, fps );
			this.setAnimationWeight( name, 1 );

		}
		createAnimation( name, start, end, fps ) {

			const animation = {
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

		}
		autoCreateAnimations( fps ) {

			const pattern = /([a-z]+)_?(\d+)/i;
			let firstAnimation;
			const frameRanges = {};
			let i = 0;
			for ( const key in this.morphTargetDictionary ) {

				const chunks = key.match( pattern );
				if ( chunks && chunks.length > 1 ) {

					const name = chunks[ 1 ];
					if ( ! frameRanges[ name ] ) frameRanges[ name ] = {
						start: Infinity,
						end: - Infinity
					};
					const range = frameRanges[ name ];
					if ( i < range.start ) range.start = i;
					if ( i > range.end ) range.end = i;
					if ( ! firstAnimation ) firstAnimation = name;

				}

				i ++;

			}

			for ( const name in frameRanges ) {

				const range = frameRanges[ name ];
				this.createAnimation( name, range.start, range.end, fps );

			}

			this.firstAnimation = firstAnimation;

		}
		setAnimationDirectionForward( name ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.direction = 1;
				animation.directionBackwards = false;

			}

		}
		setAnimationDirectionBackward( name ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.direction = - 1;
				animation.directionBackwards = true;

			}

		}
		setAnimationFPS( name, fps ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.fps = fps;
				animation.duration = ( animation.end - animation.start ) / animation.fps;

			}

		}
		setAnimationDuration( name, duration ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.duration = duration;
				animation.fps = ( animation.end - animation.start ) / animation.duration;

			}

		}
		setAnimationWeight( name, weight ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.weight = weight;

			}

		}
		setAnimationTime( name, time ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.time = time;

			}

		}
		getAnimationTime( name ) {

			let time = 0;
			const animation = this.animationsMap[ name ];
			if ( animation ) {

				time = animation.time;

			}

			return time;

		}
		getAnimationDuration( name ) {

			let duration = - 1;
			const animation = this.animationsMap[ name ];
			if ( animation ) {

				duration = animation.duration;

			}

			return duration;

		}
		playAnimation( name ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.time = 0;
				animation.active = true;

			} else {

				console.warn( 'THREE.MorphBlendMesh: animation[' + name + '] undefined in .playAnimation()' );

			}

		}
		stopAnimation( name ) {

			const animation = this.animationsMap[ name ];
			if ( animation ) {

				animation.active = false;

			}

		}
		update( delta ) {

			for ( let i = 0, il = this.animationsList.length; i < il; i ++ ) {

				const animation = this.animationsList[ i ];
				if ( ! animation.active ) continue;
				const frameTime = animation.duration / animation.length;
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

				const keyframe = animation.start + THREE.MathUtils.clamp( Math.floor( animation.time / frameTime ), 0, animation.length - 1 );
				const weight = animation.weight;
				if ( keyframe !== animation.currentFrame ) {

					this.morphTargetInfluences[ animation.lastFrame ] = 0;
					this.morphTargetInfluences[ animation.currentFrame ] = 1 * weight;
					this.morphTargetInfluences[ keyframe ] = 0;
					animation.lastFrame = animation.currentFrame;
					animation.currentFrame = keyframe;

				}

				let mix = animation.time % frameTime / frameTime;
				if ( animation.directionBackwards ) mix = 1 - mix;
				if ( animation.currentFrame !== animation.lastFrame ) {

					this.morphTargetInfluences[ animation.currentFrame ] = mix * weight;
					this.morphTargetInfluences[ animation.lastFrame ] = ( 1 - mix ) * weight;

				} else {

					this.morphTargetInfluences[ animation.currentFrame ] = weight;

				}

			}

		}

	}

	THREE.MorphBlendMesh = MorphBlendMesh;

} )();
