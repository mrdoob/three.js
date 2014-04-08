/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

//==============================================================================
THREE.BlendCharacter = function () {

	var self = this;

	this.animations = {};
	this.boneHelpers = [];
	this.weightSchedule = [];
	this.warpSchedule = [];

	// ---------------------------------------------------------------------------
	this.load = function(url, loadedCB) {

		var loader = new THREE.JSONLoader();
		loader.load( url, function( geometry, materials ) {

			var originalMaterial = materials[ 0 ];

			originalMaterial.skinning = true;
			originalMaterial.transparent = true;
			originalMaterial.alphaTest = 0.75;

			THREE.SkinnedMesh.call( self, geometry, originalMaterial );

			for ( var i = 0; i < geometry.animations.length; ++i ) {

				THREE.AnimationHandler.add( geometry.animations[ i ] );

				// Create the animation object and set a default weight
				var animName = geometry.animations[ i ].name;
				self.animations[ animName ] = new THREE.Animation( self, animName );

			}

			for ( var i = 0; i < self.skeleton.bones.length; ++i ) {

				var helper = new THREE.BoneAxisHelper( self.skeleton.bones[i], 2, 1 );
				helper.update();
				self.add( helper );
				self.boneHelpers.push( helper );

			}

			self.toggleShowBones( false );

			// Loading is complete, fire the callback
			loadedCB && loadedCB();

		} );

	};

	// ---------------------------------------------------------------------------
	this.updateWeights = function( dt ) {

		for ( var i = this.weightSchedule.length - 1; i >= 0; --i ) {

			var data = this.weightSchedule[ i ];
			data.timeElapsed += dt;

			if ( data.timeElapsed > data.duration ) {

				data.anim.weight = data.endWeight;
				this.weightSchedule.splice( i, 1 );

				if ( data.anim.weight == 0 ) {
					data.anim.stop( 0 );
				}

			} else {

				data.anim.weight = data.startWeight + (data.endWeight - data.startWeight) * data.timeElapsed / data.duration;

			}

		}

		this.updateWarps( dt );

	};

	// ---------------------------------------------------------------------------
	this.updateWarps = function( dt ) {

		for ( var i = this.warpSchedule.length - 1; i >= 0; --i ) {

			var data = this.warpSchedule[ i ];
			data.timeElapsed += dt;

			if ( data.timeElapsed > data.duration ) {

				data.to.weight = 1;
				data.to.timeScale = 1;
				data.from.weight = 0;
				data.from.timeScale = 1;
				data.from.stop( 0 );

				this.warpSchedule.splice( i, 1 );

			} else {

				var alpha = data.timeElapsed / data.duration;

				var fromLength = data.from.data.length;
				var toLength = data.to.data.length;

				var fromToRatio = fromLength / toLength;
				var toFromRatio = toLength / fromLength;

				// scale from each time proportionally to the other animation
				data.from.timeScale = ( 1 - alpha ) + fromToRatio * alpha;
				data.to.timeScale = alpha + toFromRatio * ( 1 - alpha );

				data.from.weight = 1 - alpha;
				data.to.weight = alpha;

			}

		}

	}

	// ---------------------------------------------------------------------------
	this.updateBoneHelpers = function() {

		for ( var i = 0; i < this.boneHelpers.length; ++i ) {
			this.boneHelpers[ i ].update();
		}
	};

	// ---------------------------------------------------------------------------
	this.play = function(animName, weight) {
		this.animations[ animName ].play( 0, weight );
	};

	// ---------------------------------------------------------------------------
	this.crossfade = function( fromAnimName, toAnimName, duration ) {

		var fromAnim = this.animations[ fromAnimName ];
		var toAnim = this.animations[ toAnimName ];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.weightSchedule.push( {

			anim: fromAnim,
			startWeight: 1,
			endWeight: 0,
			timeElapsed: 0,
			duration: duration

		} );

		this.weightSchedule.push( {

			anim: toAnim,
			startWeight: 0,
			endWeight: 1,
			timeElapsed: 0,
			duration: duration

		} );

	};

	// ---------------------------------------------------------------------------
	this.warp = function( fromAnimName, toAnimName, duration ) {

		var fromAnim = this.animations[ fromAnimName ];
		var toAnim = this.animations[ toAnimName ];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.warpSchedule.push( {

			from: fromAnim,
			to: toAnim,
			timeElapsed: 0,
			duration: duration

		} );

	};

	// ---------------------------------------------------------------------------
	this.applyWeight = function(animName, weight) {

		this.animations[animName].weight = weight;

	};

	// ---------------------------------------------------------------------------
	this.pauseAll = function() {

		for ( var a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {

				this.animations[ a ].pause();

			}

		}

	};

	// ---------------------------------------------------------------------------
	this.unPauseAll = function() {

		for ( var a in this.animations ) {

			if ( this.animations[ a ].isPaused ) {

				this.animations[ a ].pause();

			}

		}

	};


	// ---------------------------------------------------------------------------
	this.stopAll = function() {

		for (a in this.animations) {

			if ( this.animations[ a ].isPlaying ) {
				this.animations[ a ].stop(0);
			}

			this.animations[ a ].weight = 0;

		}

		this.weightSchedule.length = 0;
		this.warpSchedule.length = 0;

	}

	// ---------------------------------------------------------------------------
	this.toggleShowBones = function( shouldShow ) {

		this.visible = !shouldShow;

		for ( var i = 0; i < self.boneHelpers.length; ++i ) {

			self.boneHelpers[ i ].traverse( function( obj ) {

				obj.visible = shouldShow;

			} );

		}

	}

};

//==============================================================================
THREE.BlendCharacter.prototype = Object.create( THREE.SkinnedMesh.prototype );

THREE.BlendCharacter.prototype.getForward = function() {

	var forward = new THREE.Vector3();

	return function() {

		// pull the character's forward basis vector out of the matrix
		forward.set(
			-this.matrix.elements[ 8 ],
			-this.matrix.elements[ 9 ],
			-this.matrix.elements[ 10 ]
		);

		return forward;
	}
}

