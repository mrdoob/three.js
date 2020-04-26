/**
 * @author mrdoob / http://mrdoob.com/
 */

function compose( position, quaternion, array, index ) {

	var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
	var x2 = x + x,	y2 = y + y, z2 = z + z;
	var xx = x * x2, xy = x * y2, xz = x * z2;
	var yy = y * y2, yz = y * z2, zz = z * z2;
	var wx = w * x2, wy = w * y2, wz = w * z2;

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

function CannonPhysics() {

	var frameRate = 60;
	var frameTime = 1 / frameRate;

	var world = new CANNON.World();
	world.gravity.set( 0, - 9.8, 0 );
	world.broadphase = new CANNON.SAPBroadphase( world );
	// world.solver.iterations = 20;
	// world.solver.tolerance = 0.001;
	// world.allowSleep = true;

	//

	function getShape( geometry ) {

		var parameters = geometry.parameters;

		// TODO change type to is*

		switch ( geometry.type ) {

			case 'BoxBufferGeometry':
				var halfExtents = new CANNON.Vec3();
				halfExtents.x = parameters.width !== undefined ? parameters.width / 2 : 0.5;
				halfExtents.y = parameters.height !== undefined ? parameters.height / 2 : 0.5;
				halfExtents.z = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
				return new CANNON.Box( halfExtents );

			case 'PlaneBufferGeometry':
				return new CANNON.Plane();

			case 'SphereBufferGeometry':
				var radius = parameters.radius;
				return new CANNON.Sphere( radius );

		}

		return null;

	}

	var meshes = [];
	var meshMap = new WeakMap();

	function addMesh( mesh, mass = 0 ) {

		var shape = getShape( mesh.geometry );

		if ( shape !== null ) {

			if ( mesh.isInstancedMesh ) {

				handleInstancedMesh( mesh, mass, shape );

			} else if ( mesh.isMesh ) {

				handleMesh( mesh, mass, shape );

			}

		}

	}

	function handleMesh( mesh, mass, shape ) {

		var position = new CANNON.Vec3();
		position.copy( mesh.position );

		var quaternion = new CANNON.Quaternion();
		quaternion.copy( mesh.quaternion );

		var body = new CANNON.Body( {
			position: position,
			quaternion: quaternion,
			mass: mass,
			shape: shape
		} );
		world.addBody( body );

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, body );

		}

	}

	function handleInstancedMesh( mesh, mass, shape ) {

		var array = mesh.instanceMatrix.array;

		var bodies = [];

		for ( var i = 0; i < mesh.count; i ++ ) {

			var index = i * 16;

			var position = new CANNON.Vec3();
			position.set( array[ index + 12 ], array[ index + 13 ], array[ index + 14 ] );

			var body = new CANNON.Body( {
				position: position,
				mass: mass,
				shape: shape
			} );
			world.addBody( body );

			bodies.push( body );

		}

		if ( mass > 0 ) {

			mesh.instanceMatrix.setUsage( 35048 ); // THREE.DynamicDrawUsage = 35048
			meshes.push( mesh );

			meshMap.set( mesh, bodies );

		}

	}

	//

	function setMeshPosition( mesh, position, index = 0 ) {

		if ( mesh.isInstancedMesh ) {

			var bodies = meshMap.get( mesh );
			bodies[ index ].position.copy( position );

		} else if ( mesh.isMesh ) {

			var body = meshMap.get( mesh );
			body.position.copy( position );

		}

	}

	//

	var lastTime = 0;

	function step() {

		var time = performance.now();

		if ( lastTime > 0 ) {

			var delta = ( time - lastTime ) / 1000;

			// console.time( 'world.step' );
			world.step( frameTime, delta, frameRate );
			// console.timeEnd( 'world.step' );

		}

		lastTime = time;

		//

		for ( var i = 0, l = meshes.length; i < l; i ++ ) {

			var mesh = meshes[ i ];

			if ( mesh.isInstancedMesh ) {

				var array = mesh.instanceMatrix.array;
				var bodies = meshMap.get( mesh );

				for ( var j = 0; j < bodies.length; j ++ ) {

					var body = bodies[ j ];
					compose( body.position, body.quaternion, array, j * 16 );

				}

				mesh.instanceMatrix.needsUpdate = true;

			} else if ( mesh.isMesh ) {

				var body = meshMap.get( mesh );
				mesh.position.copy( body.position );
				mesh.quaternion.copy( body.quaternion );

			}

		}

	}

	// animate

	setInterval( step, 1000 / frameRate );

	return {
		addMesh: addMesh,
		setMeshPosition: setMeshPosition
		// addCompoundMesh
	};

}

export { CannonPhysics };
