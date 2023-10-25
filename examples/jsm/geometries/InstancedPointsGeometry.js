import {
	Box3,
	Float32BufferAttribute,
	InstancedBufferGeometry,
	InstancedBufferAttribute,
	Sphere,
	Vector3
} from 'three';

const _vector = new Vector3();

class InstancedPointsGeometry extends InstancedBufferGeometry {

	constructor() {

		super();

		this.isInstancedPointsGeometry = true;

		this.type = 'InstancedPointsGeometry';

		const positions = [ - 1, 1, 0, 1, 1, 0, - 1, - 1, 0, 1, - 1, 0 ];
		const uvs = [ - 1, 1, 1, 1, - 1, - 1, 1, - 1 ];
		const index = [ 0, 2, 1, 2, 3, 1 ];

		this.setIndex( index );
		this.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	applyMatrix4( matrix ) {

		const pos = this.attributes.instancePosition;

		if ( pos !== undefined ) {

			pos.applyMatrix4( matrix );

			pos.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	setPositions( array ) {

		let points;

		if ( array instanceof Float32Array ) {

			points = array;

		} else if ( Array.isArray( array ) ) {

			points = new Float32Array( array );

		}

		this.setAttribute( 'instancePosition', new InstancedBufferAttribute( points, 3 ) ); // xyz

		//

		this.computeBoundingBox();
		this.computeBoundingSphere();

		return this;

	}

	setColors( array ) {

		let colors;

		if ( array instanceof Float32Array ) {

			colors = array;

		} else if ( Array.isArray( array ) ) {

			colors = new Float32Array( array );

		}

		this.setAttribute( 'instanceColor', new InstancedBufferAttribute( colors, 3 ) ); // rgb

		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		const pos = this.attributes.instancePosition;

		if ( pos !== undefined ) {

			this.boundingBox.setFromBufferAttribute( pos );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		if ( this.boundingBox === null ) {

			this.computeBoundingBox();

		}

		const pos = this.attributes.instancePosition;

		if ( pos !== undefined ) {

			const center = this.boundingSphere.center;

			this.boundingBox.getCenter( center );

			let maxRadiusSq = 0;

			for ( let i = 0, il = pos.count; i < il; i ++ ) {

				_vector.fromBufferAttribute( pos, i );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.InstancedPointsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this );

			}

		}

	}

	toJSON() {

		// todo

	}

}

export default InstancedPointsGeometry;
