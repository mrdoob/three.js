import {
	Group,
	Mesh,
	BufferAttribute
} from '../../../build/three.module.js';



function createMeshesFromInstancedMesh( instancedMesh ) {

	const group = new Group();

	const count = instancedMesh.count;
	const geometry = instancedMesh.geometry;
	const material = instancedMesh.material;

	for ( let i = 0; i < count; i ++ ) {

		const mesh = new Mesh( geometry, material );

		instancedMesh.getMatrixAt( i, mesh.matrix );
		mesh.matrix.decompose( mesh.position, mesh.quaternion, mesh.scale );

		group.add( mesh );

	}

	group.copy( instancedMesh );
	group.updateMatrixWorld(); // ensure correct world matrices of meshes

	return group;

}

function createMultiMaterialObject( geometry, materials ) {

	const group = new Group();

	for ( let i = 0, l = materials.length; i < l; i ++ ) {

		group.add( new Mesh( geometry, materials[ i ] ) );

	}

	return group;

}

//Convert multi-material mesh into group of mesh with single material
function createMeshesFromMultiMaterialMesh( mesh ) {

	const group = new Group();

	//split groups by material index
	const materials = mesh.material;

	if ( ! ( materials instanceof Array ) ) {

		console.error( 'Not a multimaterial mesh.' );
		return;

	}

	materials.forEach( ( mat, index ) => {

		const singleIndexGroups = mesh.geometry.groups.filter( g => g.materialIndex == index );
		const singleIndices = mesh.geometry.index.array.filter( ( val, i ) => {

			let belong = false;
			singleIndexGroups.forEach( g => {

				belong |= ( g.start <= i && g.count + g.start > i );

			} );

			return belong;

		} );
		const singleGeo = mesh.geometry.clone();
		singleGeo.setIndex( new BufferAttribute( new Uint16Array( singleIndices ), 1 ) );
		const singleMesh = new Mesh( singleGeo, mat );
		group.add( singleMesh );

	} );
	group.position.copy( mesh.position );
	group.rotation.copy( mesh.rotation );
	group.scale.copy( mesh.scale );
	group.name = mesh.name;
	group.visible = mesh.visible;

	return group;

}

function detach( child, parent, scene ) {

	console.warn( 'THREE.SceneUtils: detach() has been deprecated. Use scene.attach( child ) instead.' );

	scene.attach( child );

}

function attach( child, scene, parent ) {

	console.warn( 'THREE.SceneUtils: attach() has been deprecated. Use parent.attach( child ) instead.' );

	parent.attach( child );

}



export {
	createMeshesFromInstancedMesh,
	createMultiMaterialObject,
	createMeshesFromMultiMaterialMesh,
	detach,
	attach,
};
