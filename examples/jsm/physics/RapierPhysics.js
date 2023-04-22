async function RapierPhysics() {

	const RAPIER = await import( 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2' );
	
	await RAPIER.init();

	const frameRate = 60;

	// Docs: https://rapier.rs/docs/api/javascript/JavaScript3D/	

	const gravity = { x: 0.0, y: - 9.81, z: 0.0 };
	const world = new RAPIER.World( gravity );

	function getCollider( geometry ) {

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

		}

		return null;

	}

	const meshes = [];
	const meshMap = new WeakMap();

	function addMesh( mesh, mass = 0, restitution = 0 ) {

		const shape = getCollider( mesh.geometry );

		if ( shape !== null ) {

			shape.setMass( mass );
			shape.setRestitution( restitution );
	
			if ( mesh.isInstancedMesh ) {

				handleInstancedMesh( mesh, mass, shape );

			} else if ( mesh.isMesh ) {

				handleMesh( mesh, mass, shape );

			}

		}

	}

	function handleMesh( mesh, mass, shape ) {

		const position = mesh.position;
		const quaternion = mesh.quaternion;

		const desc = mass > 0 ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
		desc.setTranslation( position.x, position.y, position.z );
		desc.setRotation( quaternion );

		const body = world.createRigidBody( desc );
		world.createCollider( shape, body );

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, body );

		}

	}

	function handleInstancedMesh( mesh, mass, shape ) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for ( let i = 0; i < mesh.count; i ++ ) {

			const index = i * 16;

			const desc = mass > 0 ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
			desc.setTranslation( array[ index + 12 ], array[ index + 13 ], array[ index + 14 ] );

			const body = world.createRigidBody( desc );
			world.createCollider( shape, body );

			bodies.push( body );

		}

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, bodies );

		}

	}

	const vector = { x: 0, y: 0, z: 0 };

	function setMeshPosition( mesh, position, index = 0 ) {

		if ( mesh.isInstancedMesh ) {

			const bodies = meshMap.get( mesh );
			const body = bodies[ index ];

			body.setAngvel( vector );
			body.setLinvel( vector );
			body.setTranslation( position );

		} else if ( mesh.isMesh ) {

			const body = meshMap.get( mesh );

			body.setAngvel( vector );
			body.setLinvel( vector );
			body.setTranslation( position );

		}

	}

	//

	let lastTime = 0;

	function step() {

		const time = performance.now();

		if ( lastTime > 0 ) {

			const delta = ( time - lastTime ) / 1000;

			world.timestep = delta;
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
						const quaternion = body.rotation();

						compose( position, quaternion, array, j * 16 );

					}

					mesh.instanceMatrix.needsUpdate = true;
					mesh.computeBoundingSphere();

				} else if ( mesh.isMesh ) {

					const body = meshMap.get( mesh );

					mesh.position.copy( body.translation() );
					mesh.quaternion.copy( body.rotation() );

				}

			}

		}

		lastTime = time;

	}

	// animate

	setInterval( step, 1000 / frameRate );

	return {
		addMesh: addMesh,
		setMeshPosition: setMeshPosition
	};

}

function compose( position, quaternion, array, index ) {

	const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
	const x2 = x + x, y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2;
	const yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;

	array[ index + 0 ] = ( 1 - ( yy + zz ) );
	array[ index + 1 ] = ( xy + wz );
	array[ index + 2 ] = ( xz - wy );
	array[ index + 3 ] = 0;

	array[ index + 4 ] = ( xy - wz );
	array[ index + 5 ] = ( 1 - ( xx + zz ) );
	array[ index + 6 ] = ( yz + wx );
	array[ index + 7 ] = 0;

	array[ index + 8 ] = ( xz + wy );
	array[ index + 9 ] = ( yz - wx );
	array[ index + 10 ] = ( 1 - ( xx + yy ) );
	array[ index + 11 ] = 0;

	array[ index + 12 ] = position.x;
	array[ index + 13 ] = position.y;
	array[ index + 14 ] = position.z;
	array[ index + 15 ] = 1;

}

export { RapierPhysics };
