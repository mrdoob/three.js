( function () {

	const _v1 = new THREE.Vector3();

	const _v2 = new THREE.Vector3();

	const _normalMatrix = new THREE.Matrix3();

	class VertexNormalsHelper extends THREE.LineSegments {

		constructor( object, size = 1, color = 0xff0000 ) {

			const geometry = new THREE.BufferGeometry();
			const nNormals = object.geometry.attributes.normal.count;
			const positions = new THREE.Float32BufferAttribute( nNormals * 2 * 3, 3 );
			geometry.setAttribute( 'position', positions );
			super( geometry, new THREE.LineBasicMaterial( {
				color,
				toneMapped: false
			} ) );
			this.object = object;
			this.size = size;
			this.type = 'VertexNormalsHelper'; //

			this.matrixAutoUpdate = false;
			this.update();

		}

		update() {

			this.object.updateMatrixWorld( true );

			_normalMatrix.getNormalMatrix( this.object.matrixWorld );

			const matrixWorld = this.object.matrixWorld;
			const position = this.geometry.attributes.position; //

			const objGeometry = this.object.geometry;

			if ( objGeometry ) {

				const objPos = objGeometry.attributes.position;
				const objNorm = objGeometry.attributes.normal;
				let idx = 0; // for simplicity, ignore index and drawcalls, and render every normal

				for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

					_v1.fromBufferAttribute( objPos, j ).applyMatrix4( matrixWorld );

					_v2.fromBufferAttribute( objNorm, j );

					_v2.applyMatrix3( _normalMatrix ).normalize().multiplyScalar( this.size ).add( _v1 );

					position.setXYZ( idx, _v1.x, _v1.y, _v1.z );
					idx = idx + 1;
					position.setXYZ( idx, _v2.x, _v2.y, _v2.z );
					idx = idx + 1;

				}

			}

			position.needsUpdate = true;

		}

	}

	THREE.VertexNormalsHelper = VertexNormalsHelper;

} )();
