( function () {

	const _v1 = new THREE.Vector3();

	const _v2 = new THREE.Vector3();

	const _normalMatrix = new THREE.Matrix3();

	class VertexNormalsHelper extends THREE.LineSegments {

		constructor( object, size = 1, color = 0xff0000 ) {

			let nNormals = 0;
			const objGeometry = object.geometry;

			if ( objGeometry && objGeometry.isGeometry ) {

				console.error( 'THREE.VertexNormalsHelper no longer supports Geometry. Use THREE.BufferGeometry instead.' );
				return;

			} else if ( objGeometry && objGeometry.isBufferGeometry ) {

				nNormals = objGeometry.attributes.normal.count;

			} //


			const geometry = new THREE.BufferGeometry();
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

			if ( objGeometry && objGeometry.isGeometry ) {

				console.error( 'THREE.VertexNormalsHelper no longer supports Geometry. Use THREE.BufferGeometry instead.' );
				return;

			} else if ( objGeometry && objGeometry.isBufferGeometry ) {

				const objPos = objGeometry.attributes.position;
				const objNorm = objGeometry.attributes.normal;
				let idx = 0; // for simplicity, ignore index and drawcalls, and render every normal

				for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

					_v1.set( objPos.getX( j ), objPos.getY( j ), objPos.getZ( j ) ).applyMatrix4( matrixWorld );

					_v2.set( objNorm.getX( j ), objNorm.getY( j ), objNorm.getZ( j ) );

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
