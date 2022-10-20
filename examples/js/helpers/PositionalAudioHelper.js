( function () {

	class PositionalAudioHelper extends THREE.Line {

		constructor( audio, range = 1, divisionsInnerAngle = 16, divisionsOuterAngle = 2 ) {

			const geometry = new THREE.BufferGeometry();
			const divisions = divisionsInnerAngle + divisionsOuterAngle * 2;
			const positions = new Float32Array( ( divisions * 3 + 3 ) * 3 );
			geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			const materialInnerAngle = new THREE.LineBasicMaterial( {
				color: 0x00ff00
			} );
			const materialOuterAngle = new THREE.LineBasicMaterial( {
				color: 0xffff00
			} );
			super( geometry, [ materialOuterAngle, materialInnerAngle ] );
			this.audio = audio;
			this.range = range;
			this.divisionsInnerAngle = divisionsInnerAngle;
			this.divisionsOuterAngle = divisionsOuterAngle;
			this.type = 'PositionalAudioHelper';
			this.update();

		}
		update() {

			const audio = this.audio;
			const range = this.range;
			const divisionsInnerAngle = this.divisionsInnerAngle;
			const divisionsOuterAngle = this.divisionsOuterAngle;
			const coneInnerAngle = THREE.MathUtils.degToRad( audio.panner.coneInnerAngle );
			const coneOuterAngle = THREE.MathUtils.degToRad( audio.panner.coneOuterAngle );
			const halfConeInnerAngle = coneInnerAngle / 2;
			const halfConeOuterAngle = coneOuterAngle / 2;
			let start = 0;
			let count = 0;
			let i;
			let stride;
			const geometry = this.geometry;
			const positionAttribute = geometry.attributes.position;
			geometry.clearGroups();

			//

			function generateSegment( from, to, divisions, materialIndex ) {

				const step = ( to - from ) / divisions;
				positionAttribute.setXYZ( start, 0, 0, 0 );
				count ++;
				for ( i = from; i < to; i += step ) {

					stride = start + count;
					positionAttribute.setXYZ( stride, Math.sin( i ) * range, 0, Math.cos( i ) * range );
					positionAttribute.setXYZ( stride + 1, Math.sin( Math.min( i + step, to ) ) * range, 0, Math.cos( Math.min( i + step, to ) ) * range );
					positionAttribute.setXYZ( stride + 2, 0, 0, 0 );
					count += 3;

				}

				geometry.addGroup( start, count, materialIndex );
				start += count;
				count = 0;

			}

			//

			generateSegment( - halfConeOuterAngle, - halfConeInnerAngle, divisionsOuterAngle, 0 );
			generateSegment( - halfConeInnerAngle, halfConeInnerAngle, divisionsInnerAngle, 1 );
			generateSegment( halfConeInnerAngle, halfConeOuterAngle, divisionsOuterAngle, 0 );

			//

			positionAttribute.needsUpdate = true;
			if ( coneInnerAngle === coneOuterAngle ) this.material[ 0 ].visible = false;

		}
		dispose() {

			this.geometry.dispose();
			this.material[ 0 ].dispose();
			this.material[ 1 ].dispose();

		}

	}

	THREE.PositionalAudioHelper = PositionalAudioHelper;

} )();
