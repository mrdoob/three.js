( function () {

	class AnimationClipCreator {

		static CreateRotationAnimation( period, axis = 'x' ) {

			const times = [ 0, period ],
				values = [ 0, 360 ];
			const trackName = '.rotation[' + axis + ']';
			const track = new THREE.NumberKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, period, [ track ] );

		}

		static CreateScaleAxisAnimation( period, axis = 'x' ) {

			const times = [ 0, period ],
				values = [ 0, 1 ];
			const trackName = '.scale[' + axis + ']';
			const track = new THREE.NumberKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, period, [ track ] );

		}

		static CreateShakeAnimation( duration, shakeScale ) {

			const times = [],
				values = [],
				tmp = new THREE.Vector3();

			for ( let i = 0; i < duration * 10; i ++ ) {

				times.push( i / 10 );
				tmp.set( Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0 ).multiply( shakeScale ).toArray( values, values.length );

			}

			const trackName = '.position';
			const track = new THREE.VectorKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, duration, [ track ] );

		}

		static CreatePulsationAnimation( duration, pulseScale ) {

			const times = [],
				values = [],
				tmp = new THREE.Vector3();

			for ( let i = 0; i < duration * 10; i ++ ) {

				times.push( i / 10 );
				const scaleFactor = Math.random() * pulseScale;
				tmp.set( scaleFactor, scaleFactor, scaleFactor ).toArray( values, values.length );

			}

			const trackName = '.scale';
			const track = new THREE.VectorKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, duration, [ track ] );

		}

		static CreateVisibilityAnimation( duration ) {

			const times = [ 0, duration / 2, duration ],
				values = [ true, false, true ];
			const trackName = '.visible';
			const track = new THREE.BooleanKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, duration, [ track ] );

		}

		static CreateMaterialColorAnimation( duration, colors ) {

			const times = [],
				values = [],
				timeStep = duration / colors.length;

			for ( let i = 0; i <= colors.length; i ++ ) {

				times.push( i * timeStep );
				values.push( colors[ i % colors.length ] );

			}

			const trackName = '.material[0].color';
			const track = new THREE.ColorKeyframeTrack( trackName, times, values );
			return new THREE.AnimationClip( null, duration, [ track ] );

		}

	}

	THREE.AnimationClipCreator = AnimationClipCreator;

} )();
