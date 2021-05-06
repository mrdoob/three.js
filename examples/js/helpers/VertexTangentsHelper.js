( function () {

	const _v1 = new THREE.Vector3();

	const _v2 = new THREE.Vector3();

	class VertexTangentsHelper extends THREE.LineSegments {

		constructor( object, size = 1, color = 0x00ffff ) {

			const objGeometry = object.geometry;

			if ( ! ( objGeometry && objGeometry.isBufferGeometry ) ) {

				console.error( 'THREE.VertexTangentsHelper: geometry not an instance of THREE.BufferGeometry.', objGeometry );
				return;

			}

			const nTangents = objGeometry.attributes.tangent.count; //

			const geometry = new THREE.BufferGeometry();
			const positions = new THREE.Float32BufferAttribute( nTangents * 2 * 3, 3 );
			geometry.setAttribute( 'position', positions );
			super( geometry, new THREE.LineBasicMaterial( {
				color,
				toneMapped: false
			} ) );
			this.object = object;
			this.size = size;
			this.type = 'VertexTangentsHelper'; //

			this.matrixAutoUpdate = false;
			this.update();

		}

		update() {

			this.object.updateMatrixWorld( true );
			const matrixWorld = this.object.matrixWorld;
			const position = this.geometry.attributes.position; //

			const objGeometry = this.object.geometry;
			const objPos = objGeometry.attributes.position;
			const objTan = objGeometry.attributes.tangent;
			let idx = 0; // for simplicity, ignore index and drawcalls, and render every tangent

			for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

				_v1.set( objPos.getX( j ), objPos.getY( j ), objPos.getZ( j ) ).applyMatrix4( matrixWorld );

				_v2.set( objTan.getX( j ), objTan.getY( j ), objTan.getZ( j ) );

				_v2.transformDirection( matrixWorld ).multiplyScalar( this.size ).add( _v1 );

				position.setXYZ( idx, _v1.x, _v1.y, _v1.z );
				idx = idx + 1;
				position.setXYZ( idx, _v2.x, _v2.y, _v2.z );
				idx = idx + 1;

			}

			position.needsUpdate = true;

		}

	}

	THREE.VertexTangentsHelper = VertexTangentsHelper;

} )();
