import { InstancedMesh } from './InstancedMesh.js';
import { Sphere } from '../math/Sphere.js';
import { Vector3 } from '../math/Vector3.js';


class InstancedMeshCulled extends InstancedMesh {

	constructor( geometry, material, count ) {

		super( geometry, material, count );

		this.frustumCulled = true;
		this.boundingSphere = null;

	}

	computeBoundingSphere() {

		if ( this.geometry.boundingSphere === null ) this.geometry.computeBoundingSphere();

		const min = new Vector3( Infinity, Infinity, Infinity );
		const max = new Vector3( - Infinity, - Infinity, - Infinity );
		const position = new Vector3();

		for ( let m = 0; m < this.count; m ++ ) {

			const x = this.instanceMatrix[ m * 16 + 12 ];
			const y = this.instanceMatrix[ m * 16 + 13 ];
			const z = this.instanceMatrix[ m * 16 + 14 ];
			position.set( x, y, z );
			min.min( position );
			max.max( position );

		}

		let radius = 0;
		const center = new Vector3().addVectors( min, max ).multiply( 0.5 );
		for ( let m = 0; m < this.count; m ++ ) {

			const x = this.instanceMatrix[ m * 16 + 12 ];
			const y = this.instanceMatrix[ m * 16 + 13 ];
			const z = this.instanceMatrix[ m * 16 + 14 ];
			position.set( x, y, z );
			const distance = position.distanceTo( center );
			// note: we assume no scaling - computing scale from instance matrix is not trivial
			const r = distance + this.geometry.boundingSphere.radius;
			if ( r > radius ) radius = r;

		}

		this.boundingSphere = new Sphere( center, radius );

	}

	intersectsFrustum( frustum ) {

		if ( this.boundingSphere === null ) this.computeBoundingSphere();
		frustum.intersectsSphere( this.boundingSphere );

	}

}

export { InstancedMeshCulled };
