import { InstancedMesh, MathUtils } from 'three';

// Shared lifecycle for street furniture with one geometry and material.
class InstancedMeshGenerator {

	constructor( parameters, createGeometry, createMaterial, name, receiveShadow = true ) {

		this.parameters = Object.assign( {}, this.constructor.defaults, parameters );
		this.geometry = null;
		this.material = null;
		this.mesh = null;

		this._createGeometry = createGeometry;
		this._createMaterial = createMaterial;
		this._name = name;
		this._receiveShadow = receiveShadow;
		this._parametersKey = null;

	}

	build( placements ) {

		const parametersKey = JSON.stringify( this.parameters );

		if ( parametersKey !== this._parametersKey || ( this.mesh && placements.length > this.mesh.instanceMatrix.count ) ) {

			this.dispose();
			this._parametersKey = parametersKey;

		}

		if ( this.geometry === null ) this.geometry = this._createGeometry( this.parameters );
		if ( this.material === null ) this.material = this._createMaterial();

		if ( this.mesh === null ) {

			this.mesh = createInstances( this.geometry, this.material, placements.length, this._name );
			this.mesh.receiveShadow = this._receiveShadow;

		}

		updateInstances( this.mesh, placements );

		return this.mesh;

	}

	dispose() {

		if ( this.geometry ) this.geometry.dispose();
		if ( this.mesh ) this.mesh.dispose();
		if ( this.material ) this.material.dispose();

		this.geometry = null;
		this.material = null;
		this.mesh = null;

	}

}

function createInstances( geometry, material, count, name ) {

	const capacity = MathUtils.ceilPowerOfTwo( Math.max( 1, count ) );
	const mesh = new InstancedMesh( geometry, material, capacity );
	mesh.castShadow = mesh.receiveShadow = true;
	mesh.name = name;

	return mesh;

}

function updateInstances( mesh, placements ) {

	mesh.count = placements.length;
	mesh.visible = placements.length > 0;

	for ( let i = 0; i < placements.length; i ++ ) mesh.setMatrixAt( i, placements[ i ] );

	mesh.instanceMatrix.needsUpdate = true;
	mesh.boundingBox = null;
	mesh.computeBoundingSphere();

}

export { InstancedMeshGenerator, createInstances, updateInstances };
