import { BufferAttribute, BufferGeometry, DoubleSide, IcosahedronGeometry, Mesh, Vector3, Matrix4 } from 'three';
import { MeshBasicMaterial, MeshPhysicalNodeMaterial } from 'three/webgpu';
import { Fn, If, Return, instancedArray, instanceIndex, uniform, select, attribute, uint, Loop, float, transformNormalToView, cross, triNoise3D, time, frontFacing, color as colorNode, } from 'three/tsl';

/**
 * Generates a plane that can be used as a cloth simulator.
 * Note that this class can only be used with {@link WebGPURenderer}.
 * @three_import import { ClothSimulator } from 'three/addons/objects/ClothSimulator.js';
 * @example
 *
 * // Create cloth simulation with 2 sphere colliders
 * const cloth = new ClothSimulator(renderer, {
 *     segmentsX: 20,
 *     segmentsY: 20,
 *     width: 1,
 *     height: 2,
 *     numSphereColliders: 2, //<-- how many "sphere colliders" will interact with the cloth
 *     sphereRadius: 0.2,
 *     stiffness: 0.3,
 *     wind: 0.1,
 * });

 * // Add cloth mesh to scene
 * scene.add(cloth.mesh);

 * // To modify the material access it via:
 * cloth.mesh.material; // it is a MeshPhysicalNodeMaterial

 * // OPTIONAL!! : Create and add sphere visualizers ( for debug )
 * const spheres = cloth.createSphereVisualizers();
 * spheres.forEach(sphere => scene.add(sphere));

 * // IN YOUR MAIN LOOP:
 * cloth.setSphereCollider(0, colPos); // set the position of the first sphere collider
 * cloth.setSphereCollider(1, colPos2); // set the position of the second sphere collider

 * // **** You can move the cloth object itself ****
 * cloth.mesh.position.x = .5 + Math.sin(elapsedTime * 1.1)*.3
 * cloth.mesh.rotateY( Math.sin(elapsedTime)*.01)

 * // update the cloth simulation
 * cloth.update(delta);
 */
class ClothSimulator {

	/**
	 * @param {WebGPURenderer} renderer - The renderer to use for the simulation.
	 * @param {ClothSimulator~Options} [options] - The options for the simulation.
	 */
	constructor( renderer, options = {} ) {

		this.renderer = renderer;
		this.sphereMeshes = [];
		this.verletVertices = [];
		this.verletSprings = [];
		this.verletVertexColumns = [];
		this.sphereColliders = [];
		this.timeSinceLastStep = 0;
		this.timestamp = 0;
		this.stepsPerSecond = 360;

		// Set defaults
		if ( options.material && ! options.material.isNodeMaterial ) {

			throw new Error( 'The material used must be a node material since it\'s position and normal nodes will be set/overriten' );

		}

		this.options = {
			segmentsX: options.segmentsX !== undefined ? options.segmentsX : 20,
			segmentsY: options.segmentsY !== undefined ? options.segmentsY : 20,
			width: options.width !== undefined ? options.width : 1,
			height: options.height !== undefined ? options.height : 1,
			numSphereColliders: options.numSphereColliders !== undefined ? options.numSphereColliders : 1,
			sphereRadius: options.sphereRadius !== undefined ? options.sphereRadius : 0.15,
			stiffness: options.stiffness !== undefined ? options.stiffness : 0.2,
			dampening: options.dampening !== undefined ? options.dampening : 0.99,
			wind: options.wind !== undefined ? options.wind : 1.0,
			gravity: options.gravity !== undefined ? options.gravity : 0.00005,
			fixedVertexPattern: options.fixedVertexPattern !== undefined ? options.fixedVertexPattern : ( ( x, y ) => y === 0 && ( x === 0 || x === options.segmentsX - 1 ) ),
			color: options.color !== undefined ? options.color : 0x204080,
			material: options.material !== undefined ? options.material : null,
		};
		this._setupVerletGeometry();
		this._setupVerletVertexBuffers();
		this._setupVerletSpringBuffers();
		this._setupUniforms();
		this._setupSphereColliders();
		this._setupComputeShaders();
		this.mesh = this._setupClothMesh();

	}

	/**
     * Update the cloth simulation. Call this every frame.
     * @param {number} delta Time since last frame in seconds
     */
	update( delta ) {

		// Clamp delta to prevent large jumps
		const clampedDelta = Math.min( delta, 1 / 60 );
		const timePerStep = 1 / this.stepsPerSecond;
		this.timeSinceLastStep += clampedDelta;
		while ( this.timeSinceLastStep >= timePerStep ) {

			this.timestamp += timePerStep;
			this.timeSinceLastStep -= timePerStep;
			this.mesh.updateMatrixWorld();
			this.worldMatrixUniform.value.copy( this.mesh.matrixWorld );
			this.worldMatrixInverseUniform.value.copy( this.mesh.matrixWorld ).invert();
			this.renderer.compute( this.computeSpringForces );
			this.renderer.compute( this.computeVertexForces );

		}

	}
	/**
     * Set the position and optionally radius of a sphere collider
     * @param {number} index Index of the sphere collider (0-based)
     * @param {Vector3} position Position of the sphere
     * @param {number} [radius] Optional new radius
     */
	setSphereCollider( index, position, radius ) {

		if ( index < 0 || index >= this.sphereColliders.length ) {

			console.warn( `ClothSimulation: Invalid sphere collider index ${index}` );
			return;

		}

		const collider = this.sphereColliders[ index ];
		collider.positionUniform.value.copy( position );
		if ( radius !== undefined ) {

			collider.radiusUniform.value = radius;

		}

		// Update visualization mesh if it exists
		if ( this.sphereMeshes[ index ] ) {

			this.sphereMeshes[ index ].position.copy( position );
			if ( radius !== undefined ) {

				this.sphereMeshes[ index ].scale.setScalar( radius / this.options.sphereRadius );

			}

		}

	}
	/**
     * Enable or disable a sphere collider
     * @param {number} index Index of the sphere collider
     * @param {boolean} enabled Whether the collider is active
     */
	setSphereEnabled( index, enabled ) {

		if ( index < 0 || index >= this.sphereColliders.length ) {

			console.warn( `ClothSimulation: Invalid sphere collider index ${index}` );
			return;

		}

		this.sphereColliders[ index ].enabledUniform.value = enabled ? 1 : 0;
		if ( this.sphereMeshes[ index ] ) {

			this.sphereMeshes[ index ].visible = enabled;

		}

	}
	/**
     * Set wind strength
	 * @param {number} value New wind strength
     */
	setWind( value ) {

		this.windUniform.value = value;

	}
	/**
     * Set spring stiffness
	 * @param {number} value New stiffness value
     */
	setStiffness( value ) {

		this.stiffnessUniform.value = value;

	}
	/**
     * Set velocity dampening
	 * @param {number} value New dampening value
     */
	setDampening( value ) {

		this.dampeningUniform.value = value;

	}
	/**
     * Create visualization meshes for sphere colliders
     * @returns Array of meshes that can be added to the scene
     */
	createSphereVisualizers() {

		this.sphereMeshes.length = 0;
		for ( let i = 0; i < this.sphereColliders.length; i ++ ) {

			const collider = this.sphereColliders[ i ];
			const geometry = new IcosahedronGeometry( collider.radiusUniform.value * 0.95, 4 );
			const material = new MeshBasicMaterial( { wireframe: true } );
			const sphere = new Mesh( geometry, material );
			sphere.position.copy( collider.positionUniform.value );
			this.sphereMeshes.push( sphere );

		}

		return this.sphereMeshes;

	}
	/**
     * Clean up resources
     */
	dispose() {

		this.mesh.geometry.dispose();
		if ( this.mesh.material.isMeshPhysicalNodeMaterial ) {

			this.mesh.material.dispose();

		}

		for ( const sphere of this.sphereMeshes ) {

			sphere.geometry.dispose();
			if ( sphere.material.isMeshPhysicalNodeMaterial ) {

				sphere.material.dispose();

			}

		}

	}

	_setupVerletGeometry() {

		const { segmentsX, segmentsY, width, height, fixedVertexPattern } = this.options;
		const addVerletVertex = ( x, y, z, isFixed ) => {

			const id = this.verletVertices.length;
			const vertex = {
				id,
				position: new Vector3( x, y, z ),
				isFixed,
				springIds: [],
			};
			this.verletVertices.push( vertex );
			return vertex;

		};

		const addVerletSpring = ( vertex0, vertex1 ) => {

			const id = this.verletSprings.length;
			const spring = {
				id,
				vertex0,
				vertex1,
			};
			vertex0.springIds.push( id );
			vertex1.springIds.push( id );
			this.verletSprings.push( spring );
			return spring;

		};

		// Create cloth vertices
		for ( let x = 0; x <= segmentsX; x ++ ) {

			const column = [];
			for ( let y = 0; y <= segmentsY; y ++ ) {

				const posX = x * ( width / segmentsX ) - width * 0.5;
				const posZ = y * ( height / segmentsY );
				const isFixed = fixedVertexPattern( x, y, segmentsX, segmentsY );
				const vertex = addVerletVertex( posX, height * 0.5, posZ, isFixed );
				column.push( vertex );

			}

			this.verletVertexColumns.push( column );

		}

		// Create springs
		for ( let x = 0; x <= segmentsX; x ++ ) {

			for ( let y = 0; y <= segmentsY; y ++ ) {

				const vertex0 = this.verletVertexColumns[ x ][ y ];
				if ( x > 0 )
					addVerletSpring( vertex0, this.verletVertexColumns[ x - 1 ][ y ] );
				if ( y > 0 )
					addVerletSpring( vertex0, this.verletVertexColumns[ x ][ y - 1 ] );
				if ( x > 0 && y > 0 )
					addVerletSpring( vertex0, this.verletVertexColumns[ x - 1 ][ y - 1 ] );
				if ( x > 0 && y < segmentsY )
					addVerletSpring( vertex0, this.verletVertexColumns[ x - 1 ][ y + 1 ] );

			}

		}

	}
	_setupVerletVertexBuffers() {

		const vertexCount = this.verletVertices.length;
		const springListArray = [];
		const vertexPositionArray = new Float32Array( vertexCount * 3 );
		const vertexParamsArray = new Uint32Array( vertexCount * 3 );
		for ( let i = 0; i < vertexCount; i ++ ) {

			const vertex = this.verletVertices[ i ];
			vertexPositionArray[ i * 3 ] = vertex.position.x;
			vertexPositionArray[ i * 3 + 1 ] = vertex.position.y;
			vertexPositionArray[ i * 3 + 2 ] = vertex.position.z;
			vertexParamsArray[ i * 3 ] = vertex.isFixed ? 1 : 0;
			if ( ! vertex.isFixed ) {

				vertexParamsArray[ i * 3 + 1 ] = vertex.springIds.length;
				vertexParamsArray[ i * 3 + 2 ] = springListArray.length;
				springListArray.push( ...vertex.springIds );

			}

		}

		this.vertexPositionBuffer = instancedArray( vertexPositionArray, 'vec3' ).setPBO( true );
		this.initialPositionBuffer = instancedArray( vertexPositionArray, 'vec3' ); // Read-only copy of initial local positions
		this.vertexForceBuffer = instancedArray( vertexCount, 'vec3' );
		this.vertexParamsBuffer = instancedArray( vertexParamsArray, 'uvec3' );
		this.springListBuffer = instancedArray( new Uint32Array( springListArray ), 'uint' ).setPBO( true );

	}
	_setupVerletSpringBuffers() {

		const springCount = this.verletSprings.length;
		const springVertexIdArray = new Uint32Array( springCount * 2 );
		const springRestLengthArray = new Float32Array( springCount );
		for ( let i = 0; i < springCount; i ++ ) {

			const spring = this.verletSprings[ i ];
			springVertexIdArray[ i * 2 ] = spring.vertex0.id;
			springVertexIdArray[ i * 2 + 1 ] = spring.vertex1.id;
			springRestLengthArray[ i ] = spring.vertex0.position.distanceTo( spring.vertex1.position );

		}

		this.springVertexIdBuffer = instancedArray( springVertexIdArray, 'uvec2' ).setPBO( true );
		this.springRestLengthBuffer = instancedArray( springRestLengthArray, 'float' );
		this.springForceBuffer = instancedArray( springCount * 3, 'vec3' ).setPBO( true );

	}
	_setupUniforms() {

		this.dampeningUniform = uniform( this.options.dampening );
		this.stiffnessUniform = uniform( this.options.stiffness );
		this.windUniform = uniform( this.options.wind );
		this.gravityUniform = uniform( this.options.gravity );
		this.worldMatrixUniform = uniform( new Matrix4() );
		this.worldMatrixInverseUniform = uniform( new Matrix4() );

	}
	_setupSphereColliders() {

		for ( let i = 0; i < this.options.numSphereColliders; i ++ ) {

			this.sphereColliders.push( {
				positionUniform: uniform( new Vector3( 0, 0, 0 ) ),
				radiusUniform: uniform( this.options.sphereRadius ),
				enabledUniform: uniform( 1.0 ),
			} );

		}

	}
	_setupComputeShaders() {

		const vertexCount = this.verletVertices.length;
		const springCount = this.verletSprings.length;
		// Capture references for use in shaders
		const springVertexIdBuffer = this.springVertexIdBuffer;
		const springRestLengthBuffer = this.springRestLengthBuffer;
		const vertexPositionBuffer = this.vertexPositionBuffer;
		const springForceBuffer = this.springForceBuffer;
		const stiffnessUniform = this.stiffnessUniform;
		const vertexParamsBuffer = this.vertexParamsBuffer;
		const vertexForceBuffer = this.vertexForceBuffer;
		const dampeningUniform = this.dampeningUniform;
		const springListBuffer = this.springListBuffer;
		const windUniform = this.windUniform;
		const gravityUniform = this.gravityUniform;
		const sphereColliders = this.sphereColliders;
		const initialPositionBuffer = this.initialPositionBuffer;
		const worldMatrixUniform = this.worldMatrixUniform;
		// 1. Compute spring forces
		this.computeSpringForces = Fn( () => {

			If( instanceIndex.greaterThanEqual( uint( springCount ) ), () => {

				Return();

			} );
			const vertexIds = springVertexIdBuffer.element( instanceIndex );
			const restLength = springRestLengthBuffer.element( instanceIndex );
			const vertex0Position = vertexPositionBuffer.element( vertexIds.x );
			const vertex1Position = vertexPositionBuffer.element( vertexIds.y );
			const vertex0Velocity = vertexForceBuffer.element( vertexIds.x );
			const vertex1Velocity = vertexForceBuffer.element( vertexIds.y );
			const delta = vertex1Position.sub( vertex0Position ).toVar();
			const dist = delta.length().max( 0.000001 ).toVar();
			const dir = delta.div( dist );
			const relVelocity = vertex1Velocity.sub( vertex0Velocity );
			const damping = relVelocity.dot( dir ).mul( 0.1 );
			const force = dist.sub( restLength ).mul( stiffnessUniform ).add( damping ).mul( dir ).mul( 0.5 );
			springForceBuffer.element( instanceIndex ).assign( force );

		} )().compute( springCount );
		// 2. Compute vertex forces
		this.computeVertexForces = Fn( () => {

			If( instanceIndex.greaterThanEqual( uint( vertexCount ) ), () => {

				Return();

			} );
			const params = vertexParamsBuffer.element( instanceIndex ).toVar();
			const isFixed = params.x;
			const springCountVar = params.y;
			const springPointer = params.z;
			const position = vertexPositionBuffer.element( instanceIndex ).toVar( 'vertexPosition' );
			const force = vertexForceBuffer.element( instanceIndex ).toVar( 'vertexForce' );
			If( isFixed, () => {

				const initialPos = initialPositionBuffer.element( instanceIndex );
				const targetWorldPos = worldMatrixUniform.mul( initialPos ).xyz;
				// Calculate velocity for correct damping interactions
				const velocity = targetWorldPos.sub( position );
				vertexForceBuffer.element( instanceIndex ).assign( velocity );
				vertexPositionBuffer.element( instanceIndex ).assign( targetWorldPos );
				Return();

			} );
			force.mulAssign( dampeningUniform );
			const ptrStart = springPointer.toVar( 'ptrStart' );
			const ptrEnd = ptrStart.add( springCountVar ).toVar( 'ptrEnd' );
			Loop( { start: ptrStart, end: ptrEnd, type: 'uint', condition: '<' }, ( { i } ) => {

				const springId = springListBuffer.element( i ).toVar( 'springId' );
				const springForce = springForceBuffer.element( springId );
				const springVertexIds = springVertexIdBuffer.element( springId );
				const factor = select( springVertexIds.x.equal( instanceIndex ), 1.0, - 1.0 );
				force.addAssign( springForce.mul( factor ) );

			} );
			// Gravity
			force.y.subAssign( gravityUniform );
			// Wind
			const noise = triNoise3D( position, 1, time ).sub( 0.2 ).mul( 0.0001 );
			const windForce = noise.mul( windUniform );
			force.z.subAssign( windForce );
			// Sphere collisions
			for ( const collider of sphereColliders ) {

				const deltaSphere = position.add( force ).sub( collider.positionUniform );
				const dist = deltaSphere.length();
				const sphereForce = float( collider.radiusUniform )
					.sub( dist )
					.max( 0 )
					.mul( deltaSphere )
					.div( dist )
					.mul( collider.enabledUniform );
				force.addAssign( sphereForce );

			}

			vertexForceBuffer.element( instanceIndex ).assign( force );
			vertexPositionBuffer.element( instanceIndex ).addAssign( force );

		} )().compute( vertexCount );

	}
	_setupClothMesh() {

		const { segmentsX, segmentsY } = this.options;
		const vertexCount = segmentsX * segmentsY;
		const geometry = new BufferGeometry();
		const verletVertexIdArray = new Uint32Array( vertexCount * 4 );
		const uvArray = new Float32Array( vertexCount * 2 );
		const indices = [];
		const getIndex = ( x, y ) => y * segmentsX + x;
		for ( let x = 0; x < segmentsX; x ++ ) {

			for ( let y = 0; y < segmentsY; y ++ ) {

				const index = getIndex( x, y );
				verletVertexIdArray[ index * 4 ] = this.verletVertexColumns[ x ][ y ].id;
				verletVertexIdArray[ index * 4 + 1 ] = this.verletVertexColumns[ x + 1 ][ y ].id;
				verletVertexIdArray[ index * 4 + 2 ] = this.verletVertexColumns[ x ][ y + 1 ].id;
				verletVertexIdArray[ index * 4 + 3 ] = this.verletVertexColumns[ x + 1 ][ y + 1 ].id;
				uvArray[ index * 2 ] = x / ( segmentsX - 1 );
				uvArray[ index * 2 + 1 ] = 1 - ( y / ( segmentsY - 1 ) );
				if ( x > 0 && y > 0 ) {

					indices.push( getIndex( x, y ), getIndex( x - 1, y ), getIndex( x - 1, y - 1 ) );
					indices.push( getIndex( x, y ), getIndex( x - 1, y - 1 ), getIndex( x, y - 1 ) );

				}

			}

		}

		const verletVertexIdBuffer = new BufferAttribute( verletVertexIdArray, 4, false );
		const positionBuffer = new BufferAttribute( new Float32Array( vertexCount * 3 ), 3, false );
		const uvBuffer = new BufferAttribute( uvArray, 2, false );
		geometry.setAttribute( 'position', positionBuffer );
		geometry.setAttribute( 'vertexIds', verletVertexIdBuffer );
		geometry.setAttribute( 'uv', uvBuffer );
		geometry.setIndex( indices );
		// Capture for closure
		const vertexPositionBuffer = this.vertexPositionBuffer;
		const worldMatrixInverseUniform = this.worldMatrixInverseUniform;
		const clothMaterial = this.options.material ? this.options.material : new MeshPhysicalNodeMaterial( {
			colorNode: colorNode( this.options.color ),
			side: DoubleSide,
		} );
		const calculateNormal = Fn( () => {

			const vertexIds = attribute( 'vertexIds' );
			const v0 = vertexPositionBuffer.element( vertexIds.x ).toVar();
			const v1 = vertexPositionBuffer.element( vertexIds.y ).toVar();
			const v2 = vertexPositionBuffer.element( vertexIds.z ).toVar();

			// Compute edges from the actual vertices
			const edge1 = v1.sub( v0 );
			const edge2 = v2.sub( v0 );
			// Cross product gives the normal
			const normal = cross( edge1, edge2 ).normalize();
			const localNormal = worldMatrixInverseUniform.transformDirection( normal );
			return transformNormalToView( localNormal );

		} );
		clothMaterial.positionNode = Fn( () => {

			const vertexIds = attribute( 'vertexIds' );
			const v0 = vertexPositionBuffer.element( vertexIds.x ).toVar();
			const v1 = vertexPositionBuffer.element( vertexIds.y ).toVar();
			const v2 = vertexPositionBuffer.element( vertexIds.z ).toVar();
			const v3 = vertexPositionBuffer.element( vertexIds.w ).toVar();
			const worldPos = v0.add( v1 ).add( v2 ).add( v3 ).mul( 0.25 );
			const localPos = worldMatrixInverseUniform.mul( worldPos ).xyz;
			return localPos;

		} )();

		const vNormal = calculateNormal().toVarying();
		clothMaterial.normalNode = select( frontFacing, vNormal, vNormal.negate() );

		return new Mesh( geometry, clothMaterial );

	}

}


/**
 * Constructor options of `ClothSimulator`.
 *
 * @typedef {Object} ClothSimulator~Options
 * @property {number} [segmentsX=20] - The number of segments in the X direction.
 * @property {number} [segmentsY=20] - The number of segments in the Y direction.
 * @property {number} [width=1] - The width of the cloth.
 * @property {number} [height=2] - The height of the cloth.
 * @property {number} [numSphereColliders=1] - The number of sphere colliders.
 * @property {number} [sphereRadius=0.2] - The radius of the sphere colliders.
 * @property {number} [stiffness=0.3] - The stiffness of the cloth.
 * @property {number} [wind=0.1] - The wind strength.
 * @property {number} [gravity=0.00005] - The gravity strength.
 * @property {(x:number, y:number) => boolean} [fixedVertexPattern] - Given the X and Y coordinates of a vertex, returns whether it should be fixed or dynamic (moves).
 * @property {number} [color=0x204080] - The color of the cloth's material
 * @property {NodeMaterial} [material] - Optional: cloth's material. It must be a NodeMaterial and it's positionNode and normalNode will be set/overriten!
 **/

export { ClothSimulator };
