( function () {

	class MorphAnimMesh extends THREE.Mesh {

		constructor( geometry, material ) {

			super( geometry, material );
			this.type = 'MorphAnimMesh';
			this.mixer = new THREE.AnimationMixer( this );
			this.activeAction = null;

		}
		setDirectionForward() {

			this.mixer.timeScale = 1.0;

		}
		setDirectionBackward() {

			this.mixer.timeScale = - 1.0;

		}
		playAnimation( label, fps ) {

			if ( this.activeAction ) {

				this.activeAction.stop();
				this.activeAction = null;

			}

			const clip = THREE.AnimationClip.findByName( this, label );
			if ( clip ) {

				const action = this.mixer.clipAction( clip );
				action.timeScale = clip.tracks.length * fps / clip.duration;
				this.activeAction = action.play();

			} else {

				throw new Error( 'THREE.MorphAnimMesh: animations[' + label + '] undefined in .playAnimation()' );

			}

		}
		updateAnimation( delta ) {

			this.mixer.update( delta );

		}
		copy( source, recursive ) {

			super.copy( source, recursive );
			this.mixer = new THREE.AnimationMixer( this );
			return this;

		}

	}

	THREE.MorphAnimMesh = MorphAnimMesh;

} )();
