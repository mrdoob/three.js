import * as THREE from 'three';

let quadMesh;
let model;

async function init() {

	const material = new THREE.NodeMaterial();
	quadMesh = new THREE.QuadMesh( material );
	model = quadMesh;

}

function update() {

	if ( quadMesh ) {

		quadMesh.render( renderer );

	}

}

function resize( width, height ) {

	// QuadMesh is full-screen, no camera aspect update needed

}

function dispose() {

	if ( quadMesh ) {

		quadMesh.material.dispose();

	}

}

function debug() {

	return { object: model };

}

export { model, debug };
