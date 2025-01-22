import { Clock, Vector3, Quaternion, Matrix4 } from 'three';

const RAPIER_PATH = 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.12.0';

const frameRate = 60;

const _scale = new Vector3( 1, 1, 1 );
const ZERO = new Vector3();

let RAPIER = null;

function getShape( geometry ) {

	const parameters = geometry.parameters;

	// TODO change type to is*

	if ( geometry.type === 'BoxGeometry' ) {

		const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
		const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
		const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

		return RAPIER.ColliderDesc.cuboid( sx, sy, sz );

	} else if ( geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry' ) {

		const radius = parameters.radius !== undefined ? parameters.radius : 1;
		return RAPIER.ColliderDesc.ball( radius );

	} else if ( geometry.type === 'BufferGeometry' ) {

		const vertices = [];
		const vertex = new Vector3();
		const position = geometry.getAttribute( 'position' );

		for ( let i = 0; i < position.count; i ++ ) {

			vertex.fromBufferAttribute( position, i );
			vertices.push( vertex.x, vertex.y, vertex.z );

		}

		// if the buffer is non-indexed, generate an index buffer
		const indices = geometry.getIndex() === null
			? Uint32Array.from( Array( parseInt( vertices.length / 3 ) ).keys() )
			: geometry.getIndex().array;

		return RAPIER.ColliderDesc.trimesh( vertices, indices );

	}

	return null;

}

async function RapierPhysics() {

	if ( RAPIER === null ) {

		RAPIER = await import( `${RAPIER_PATH}` );
		await RAPIER.init();

	}

	// Docs: https://rapier.rs/docs/api/javascript/JavaScript3D/

	const gravity = new Vector3( 0.0, - 9.81, 0.0 );
	const world = new RAPIER.World( gravity );

	const meshes = [];
	const meshMap = new WeakMap();

	const _vector = new Vector3();
	const _quaternion = new Quaternion();
	const _matrix = new Matrix4();

	function addScene( scene ) {

		scene.traverse( function ( child ) {

			if ( child.isMesh ) {

				const physics = child.userData.physics;

				if ( physics ) {

					addMesh( child, physics.mass, physics.restitution );

				}

			}

		} );

	}

	function addMesh( mesh, mass = 0, restitution = 0 ) {

		const shape = getShape( mesh.geometry );

		if ( shape === null ) return;

		shape.setMass( mass );
		shape.setRestitution( restitution );

		const body = mesh.isInstancedMesh
			? createInstancedBody( mesh, mass, shape )
			: createBody( mesh.position, mesh.quaternion, mass, shape );

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, body );

		}

	}

	function createInstancedBody( mesh, mass, shape ) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for ( let i = 0; i < mesh.count; i ++ ) {

			const position = _vector.fromArray( array, i * 16 + 12 );
			bodies.push( createBody( position, null, mass, shape ) );

		}

		return bodies;

	}

	function createBody( position, quaternion, mass, shape ) {

		const desc = mass > 0 ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
		desc.setTranslation( ...position );
		if ( quaternion !== null ) desc.setRotation( quaternion );

		const body = world.createRigidBody( desc );
		world.createCollider( shape, body );

		return body;

	}

	function setMeshPosition( mesh, position, index = 0 ) {

		let body = meshMap.get( mesh );

		if ( mesh.isInstancedMesh ) {

			body = body[ index ];

		}

		body.setAngvel( ZERO );
		body.setLinvel( ZERO );
		body.setTranslation( position );

	}

	function setMeshVelocity( mesh, velocity, index = 0 ) {

		let body = meshMap.get( mesh );

		if ( mesh.isInstancedMesh ) {

			body = body[ index ];

		}

		body.setLinvel( velocity );

	}

	//

	const clock = new Clock();

	function step() {

		world.timestep = clock.getDelta();
		world.step();

		//

		for ( let i = 0, l = meshes.length; i < l; i ++ ) {

			const mesh = meshes[ i ];

			if ( mesh.isInstancedMesh ) {

				const array = mesh.instanceMatrix.array;
				const bodies = meshMap.get( mesh );

				for ( let j = 0; j < bodies.length; j ++ ) {

					const body = bodies[ j ];

					const position = body.translation();
					_quaternion.copy( body.rotation() );

					_matrix.compose( position, _quaternion, _scale ).toArray( array, j * 16 );

				}

				mesh.instanceMatrix.needsUpdate = true;
				mesh.computeBoundingSphere();

			} else {

				const body = meshMap.get( mesh );

				mesh.position.copy( body.translation() );
				mesh.quaternion.copy( body.rotation() );

			}

		}

	}

	// animate

	setInterval( step, 1000 / frameRate );

	return {
		addScene: addScene,
		addMesh: addMesh,
		setMeshPosition: setMeshPosition,
		setMeshVelocity: setMeshVelocity
	};

}

export { RapierPhysics };
