import { Timer, Vector3, Quaternion, Matrix4 } from 'three';

const JOLT_PATH = 'https://cdn.jsdelivr.net/npm/jolt-physics@1.0.0/dist/jolt-physics.wasm-compat.js';

const frameRate = 60;

let Jolt = null;

function getShape( geometry ) {

	const parameters = geometry.parameters;

	// TODO change type to is*

	if ( geometry.type === 'BoxGeometry' ) {

		const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
		const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
		const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

		return new Jolt.BoxShape( new Jolt.Vec3( sx, sy, sz ), 0.05 * Math.min( sx, sy, sz ), null );

	} else if ( geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry' ) {

		const radius = parameters.radius !== undefined ? parameters.radius : 1;

		return new Jolt.SphereShape( radius, null );

	}

	console.error( 'JoltPhysics: Unsupported geometry type:', geometry.type );

	return null;

}

// Object layers
const LAYER_NON_MOVING = 0;
const LAYER_MOVING = 1;
const NUM_OBJECT_LAYERS = 2;

function setupCollisionFiltering( settings ) {

	const objectFilter = new Jolt.ObjectLayerPairFilterTable( NUM_OBJECT_LAYERS );
	objectFilter.EnableCollision( LAYER_NON_MOVING, LAYER_MOVING );
	objectFilter.EnableCollision( LAYER_MOVING, LAYER_MOVING );

	const BP_LAYER_NON_MOVING = new Jolt.BroadPhaseLayer( 0 );
	const BP_LAYER_MOVING = new Jolt.BroadPhaseLayer( 1 );
	const NUM_BROAD_PHASE_LAYERS = 2;

	const bpInterface = new Jolt.BroadPhaseLayerInterfaceTable( NUM_OBJECT_LAYERS, NUM_BROAD_PHASE_LAYERS );
	bpInterface.MapObjectToBroadPhaseLayer( LAYER_NON_MOVING, BP_LAYER_NON_MOVING );
	bpInterface.MapObjectToBroadPhaseLayer( LAYER_MOVING, BP_LAYER_MOVING );

	settings.mObjectLayerPairFilter = objectFilter;
	settings.mBroadPhaseLayerInterface = bpInterface;
	settings.mObjectVsBroadPhaseLayerFilter = new Jolt.ObjectVsBroadPhaseLayerFilterTable( settings.mBroadPhaseLayerInterface, NUM_BROAD_PHASE_LAYERS, settings.mObjectLayerPairFilter, NUM_OBJECT_LAYERS );

}

/**
 * @classdesc Can be used to include Jolt as a Physics engine into
 * `three.js` apps. The API can be initialized via:
 * ```js
 * const physics = await JoltPhysics();
 * ```
 * The component automatically imports Jolt from a CDN so make sure
 * to use the component with an active Internet connection.
 *
 * @name JoltPhysics
 * @class
 * @hideconstructor
 * @three_import import { JoltPhysics } from 'three/addons/physics/JoltPhysics.js';
 */
async function JoltPhysics() {

	if ( Jolt === null ) {

		const { default: initJolt } = await import( JOLT_PATH /* @vite-ignore */ );
		Jolt = await initJolt();

	}

	const settings = new Jolt.JoltSettings();
	setupCollisionFiltering( settings );

	const jolt = new Jolt.JoltInterface( settings );
	Jolt.destroy( settings );

	const physicsSystem = jolt.GetPhysicsSystem();
	const bodyInterface = physicsSystem.GetBodyInterface();

	const meshes = [];
	const meshMap = new WeakMap();

	const _position = new Vector3();
	const _quaternion = new Quaternion();
	const _scale = new Vector3( 1, 1, 1 );

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

		const body = mesh.isInstancedMesh
			? createInstancedBody( mesh, mass, restitution, shape )
			: createBody( mesh.position, mesh.quaternion, mass, restitution, shape );

		if ( mass > 0 ) {

			meshes.push( mesh );
			meshMap.set( mesh, body );

		}

	}

	function createInstancedBody( mesh, mass, restitution, shape ) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for ( let i = 0; i < mesh.count; i ++ ) {

			const position = _position.fromArray( array, i * 16 + 12 );
			const quaternion = _quaternion.setFromRotationMatrix( _matrix.fromArray( array, i * 16 ) ); // TODO Copilot did this
			bodies.push( createBody( position, quaternion, mass, restitution, shape ) );

		}

		return bodies;

	}

	function createBody( position, rotation, mass, restitution, shape ) {

		const pos = new Jolt.Vec3( position.x, position.y, position.z );
		const rot = new Jolt.Quat( rotation.x, rotation.y, rotation.z, rotation.w );

		const motion = mass > 0 ? Jolt.EMotionType_Dynamic : Jolt.EMotionType_Static;
		const layer = mass > 0 ? LAYER_MOVING : LAYER_NON_MOVING;

		const creationSettings = new Jolt.BodyCreationSettings( shape, pos, rot, motion, layer );
		creationSettings.mRestitution = restitution;

		const body = bodyInterface.CreateBody( creationSettings );

		bodyInterface.AddBody( body.GetID(), Jolt.EActivation_Activate );

		Jolt.destroy( creationSettings );

		return body;

	}

	function setMeshPosition( mesh, position, index = 0 ) {

		if ( mesh.isInstancedMesh ) {

			const bodies = meshMap.get( mesh );

			const body = bodies[ index ];

			bodyInterface.RemoveBody( body.GetID() );
			bodyInterface.DestroyBody( body.GetID() );

			const physics = mesh.userData.physics;

			const shape = body.GetShape();
			const body2 = createBody( position, { x: 0, y: 0, z: 0, w: 1 }, physics.mass, physics.restitution, shape );

			bodies[ index ] = body2;

		} else {

			// TODO: Implement this

		}

	}

	function setMeshVelocity( mesh, velocity, index = 0 ) {

		/*
		let body = meshMap.get( mesh );

		if ( mesh.isInstancedMesh ) {

			body = body[ index ];

		}

		body.setLinvel( velocity );
		*/

	}

	//

	const timer = new Timer();

	function step() {

		timer.update();

		let deltaTime = timer.getDelta();

		// Don't go below 30 Hz to prevent spiral of death
		deltaTime = Math.min( deltaTime, 1.0 / 30.0 );

		// When running below 55 Hz, do 2 steps instead of 1
		const numSteps = deltaTime > 1.0 / 55.0 ? 2 : 1;

		// Step the physics world
		jolt.Step( deltaTime, numSteps );

		//

		for ( let i = 0, l = meshes.length; i < l; i ++ ) {

			const mesh = meshes[ i ];

			if ( mesh.isInstancedMesh ) {

				const array = mesh.instanceMatrix.array;
				const bodies = meshMap.get( mesh );

				for ( let j = 0; j < bodies.length; j ++ ) {

					const body = bodies[ j ];

					const position = body.GetPosition();
					const quaternion = body.GetRotation();

					_position.set( position.GetX(), position.GetY(), position.GetZ() );
					_quaternion.set( quaternion.GetX(), quaternion.GetY(), quaternion.GetZ(), quaternion.GetW() );

					_matrix.compose( _position, _quaternion, _scale ).toArray( array, j * 16 );

				}

				mesh.instanceMatrix.needsUpdate = true;
				mesh.computeBoundingSphere();

			} else {

				const body = meshMap.get( mesh );

				const position = body.GetPosition();
				const rotation = body.GetRotation();

				mesh.position.set( position.GetX(), position.GetY(), position.GetZ() );
				mesh.quaternion.set( rotation.GetX(), rotation.GetY(), rotation.GetZ(), rotation.GetW() );

			}

		}

	}

	// animate

	setInterval( step, 1000 / frameRate );

	return {
		/**
		 * Adds the given scene to this physics simulation. Only meshes with a
		 * `physics` object in their {@link Object3D#userData} field will be honored.
		 * The object can be used to store the mass and restitution of the mesh. E.g.:
		 * ```js
		 * box.userData.physics = { mass: 1, restitution: 0 };
		 * ```
		 *
		 * @method
		 * @name JoltPhysics#addScene
		 * @param {Object3D} scene The scene or any type of 3D object to add.
		 */
		addScene: addScene,

		/**
		 * Adds the given mesh to this physics simulation.
		 *
		 * @method
		 * @name JoltPhysics#addMesh
		 * @param {Mesh} mesh The mesh to add.
		 * @param {number} [mass=0] The mass in kg of the mesh.
		 * @param {number} [restitution=0] The restitution of the mesh, usually from 0 to 1. Represents how "bouncy" objects are when they collide with each other.
		 */
		addMesh: addMesh,

		/**
		 * Set the position of the given mesh which is part of the physics simulation. Calling this
		 * method will reset the current simulated velocity of the mesh.
		 *
		 * @method
		 * @name JoltPhysics#setMeshPosition
		 * @param {Mesh} mesh The mesh to update the position for.
		 * @param {Vector3} position - The new position.
		 * @param {number} [index=0] - If the mesh is instanced, the index represents the instanced ID.
		 */
		setMeshPosition: setMeshPosition,

		// NOOP
		setMeshVelocity: setMeshVelocity
	};

}

export { JoltPhysics };
