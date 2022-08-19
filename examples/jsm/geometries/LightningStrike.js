import {
	BufferGeometry,
	DynamicDrawUsage,
	Float32BufferAttribute,
	MathUtils,
	Uint32BufferAttribute,
	Vector3
} from 'three';
import { SimplexNoise } from '../math/SimplexNoise.js';

/**
 * @fileoverview LightningStrike object for creating lightning strikes and voltaic arcs.
 *
 *
 * Usage
 *
 * var myRay = new LightningStrike( paramsObject );
 * var myRayMesh = new THREE.Mesh( myRay, myMaterial );
 * scene.add( myRayMesh );
 * ...
 * myRay.update( currentTime );
 *
 * The "currentTime" can vary its rate, go forwards, backwards or even jump, but it cannot be negative.
 *
 * You should normally leave the ray position to (0, 0, 0). You should control it by changing the sourceOffset and destOffset parameters.
 *
 *
 * LightningStrike parameters
 *
 * The paramsObject can contain any of the following parameters.
 *
 * Legend:
 * 'LightningStrike' (also called 'ray'): An independent voltaic arc with its ramifications and defined with a set of parameters.
 * 'Subray': A ramification of the ray. It is not a LightningStrike object.
 * 'Segment': A linear segment piece of a subray.
 * 'Leaf segment': A ray segment which cannot be smaller.
 *
 *
 * The following parameters can be changed any time and if they vary smoothly, the ray form will also change smoothly:
 *
 * @param {Vector3} sourceOffset The point where the ray starts.
 *
 * @param {Vector3} destOffset The point where the ray ends.
 *
 * @param {double} timeScale The rate at wich the ray form changes in time. Default: 1
 *
 * @param {double} roughness From 0 to 1. The higher the value, the more wrinkled is the ray. Default: 0.9
 *
 * @param {double} straightness From 0 to 1. The higher the value, the more straight will be a subray path. Default: 0.7
 *
 * @param {Vector3} up0 Ray 'up' direction at the ray starting point. Must be normalized. It should be perpendicular to the ray forward direction but it doesn't matter much.
 *
 * @param {Vector3} up1 Like the up0 parameter but at the end of the ray. Must be normalized.
 *
 * @param {double} radius0 Radius of the main ray trunk at the start point. Default: 1
 *
 * @param {double} radius1 Radius of the main ray trunk at the end point. Default: 1
 *
 * @param {double} radius0Factor The radius0 of a subray is this factor times the radius0 of its parent subray. Default: 0.5
 *
 * @param {double} radius1Factor The radius1 of a subray is this factor times the radius1 of its parent subray. Default: 0.2
 *
 * @param {minRadius} Minimum value a subray radius0 or radius1 can get. Default: 0.1
 *
 *
 * The following parameters should not be changed after lightning creation. They can be changed but the ray will change its form abruptly:
 *
 * @param {boolean} isEternal If true the ray never extinguishes. Otherwise its life is controlled by the 'birthTime' and 'deathTime' parameters. Default: true if any of those two parameters is undefined.
 *
 * @param {double} birthTime The time at which the ray starts its life and begins propagating. Only if isEternal is false. Default: None.
 *
 * @param {double} deathTime The time at which the ray ends vanishing and its life. Only if isEternal is false. Default: None.
 *
 * @param {double} propagationTimeFactor From 0 to 1. Lifetime factor at which the ray ends propagating and enters the steady phase. For example, 0.1 means it is propagating 1/10 of its lifetime. Default: 0.1
 *
 * @param {double} vanishingTimeFactor From 0 to 1. Lifetime factor at which the ray ends the steady phase and begins vanishing. For example, 0.9 means it is vanishing 1/10 of its lifetime. Default: 0.9
 *
 * @param {double} subrayPeriod Subrays cycle periodically. This is their time period. Default: 4
 *
 * @param {double} subrayDutyCycle From 0 to 1. This is the fraction of time a subray is active. Default: 0.6
 *
 *
 * These parameters cannot change after lightning creation:
 *
 * @param {integer} maxIterations: Greater than 0. The number of ray's leaf segments is 2**maxIterations. Default: 9
 *
 * @param {boolean} isStatic Set to true only for rays which won't change over time and are not attached to moving objects (Rare case). It is used to set the vertex buffers non-dynamic. You can omit calling update() for these rays.
 *
 * @param {integer} ramification Greater than 0. Maximum number of child subrays a subray can have. Default: 5
 *
 * @param {integer} maxSubrayRecursion Greater than 0. Maximum level of recursion (subray descendant generations). Default: 3
 *
 * @param {double} recursionProbability From 0 to 1. The lower the value, the less chance each new generation of subrays has to generate new subrays. Default: 0.6
 *
 * @param {boolean} generateUVs If true, the ray geometry will have uv coordinates generated. u runs along the ray, and v across its perimeter. Default: false.
 *
 * @param {Object} randomGenerator Set here your random number generator which will seed the SimplexNoise and other decisions during ray tree creation.
 * It can be used to generate repeatable rays. For that, set also the noiseSeed parameter, and each ray created with that generator and seed pair will be identical in time.
 * The randomGenerator parameter should be an object with a random() function similar to Math.random, but seedable.
 * It must have also a getSeed() method, which returns the current seed, and a setSeed( seed ) method, which accepts as seed a fractional number from 0 to 1, as well as any other number.
 * The default value is an internal generator for some uses and Math.random for others (It is non-repeatable even if noiseSeed is supplied)
 *
 * @param {double} noiseSeed Seed used to make repeatable rays (see the randomGenerator)
 *
 * @param {function} onDecideSubrayCreation Set this to change the callback which decides subray creation. You can look at the default callback in the code (createDefaultSubrayCreationCallbacks)for more info.
 *
 * @param {function} onSubrayCreation This is another callback, more simple than the previous one. It can be used to adapt the form of subrays or other parameters once a subray has been created and initialized. It is used in the examples to adapt subrays to a sphere or to a plane.
 *
 *
*/

class LightningStrike extends BufferGeometry {

	constructor( rayParameters = {} ) {

		super();

		this.isLightningStrike = true;

		this.type = 'LightningStrike';

		// Set parameters, and set undefined parameters to default values
		this.init( LightningStrike.copyParameters( rayParameters, rayParameters ) );

		// Creates and populates the mesh
		this.createMesh();

	}

	static createRandomGenerator() {

		const numSeeds = 2053;
		const seeds = [];

		for ( let i = 0; i < numSeeds; i ++ ) {

			seeds.push( Math.random() );

		}

		const generator = {

			currentSeed: 0,

			random: function () {

				const value = seeds[ generator.currentSeed ];

				generator.currentSeed = ( generator.currentSeed + 1 ) % numSeeds;

				return value;

			},

			getSeed: function () {

				return generator.currentSeed / numSeeds;

			},

			setSeed: function ( seed ) {

				generator.currentSeed = Math.floor( seed * numSeeds ) % numSeeds;

			}

		};

		return generator;

	}

	static copyParameters( dest = {}, source = {} ) {

		const vecCopy = function ( v ) {

			if ( source === dest ) {

				return v;

			} else {

				return v.clone();

			}

		};

		dest.sourceOffset = source.sourceOffset !== undefined ? vecCopy( source.sourceOffset ) : new Vector3( 0, 100, 0 ),
		dest.destOffset = source.destOffset !== undefined ? vecCopy( source.destOffset ) : new Vector3( 0, 0, 0 ),

		dest.timeScale = source.timeScale !== undefined ? source.timeScale : 1,
		dest.roughness = source.roughness !== undefined ? source.roughness : 0.9,
		dest.straightness = source.straightness !== undefined ? source.straightness : 0.7,

		dest.up0 = source.up0 !== undefined ? vecCopy( source.up0 ) : new Vector3( 0, 0, 1 );
		dest.up1 = source.up1 !== undefined ? vecCopy( source.up1 ) : new Vector3( 0, 0, 1 ),
		dest.radius0 = source.radius0 !== undefined ? source.radius0 : 1,
		dest.radius1 = source.radius1 !== undefined ? source.radius1 : 1,
		dest.radius0Factor = source.radius0Factor !== undefined ? source.radius0Factor : 0.5,
		dest.radius1Factor = source.radius1Factor !== undefined ? source.radius1Factor : 0.2,
		dest.minRadius = source.minRadius !== undefined ? source.minRadius : 0.2,

		// These parameters should not be changed after lightning creation. They can be changed but the ray will change its form abruptly:

		dest.isEternal = source.isEternal !== undefined ? source.isEternal : ( source.birthTime === undefined || source.deathTime === undefined ),
		dest.birthTime = source.birthTime,
		dest.deathTime = source.deathTime,
		dest.propagationTimeFactor = source.propagationTimeFactor !== undefined ? source.propagationTimeFactor : 0.1,
		dest.vanishingTimeFactor = source.vanishingTimeFactor !== undefined ? source.vanishingTimeFactor : 0.9,
		dest.subrayPeriod = source.subrayPeriod !== undefined ? source.subrayPeriod : 4,
		dest.subrayDutyCycle = source.subrayDutyCycle !== undefined ? source.subrayDutyCycle : 0.6;

		// These parameters cannot change after lightning creation:

		dest.maxIterations = source.maxIterations !== undefined ? source.maxIterations : 9;
		dest.isStatic = source.isStatic !== undefined ? source.isStatic : false;
		dest.ramification = source.ramification !== undefined ? source.ramification : 5;
		dest.maxSubrayRecursion = source.maxSubrayRecursion !== undefined ? source.maxSubrayRecursion : 3;
		dest.recursionProbability = source.recursionProbability !== undefined ? source.recursionProbability : 0.6;
		dest.generateUVs = source.generateUVs !== undefined ? source.generateUVs : false;
		dest.randomGenerator = source.randomGenerator,
		dest.noiseSeed = source.noiseSeed,
		dest.onDecideSubrayCreation = source.onDecideSubrayCreation,
		dest.onSubrayCreation = source.onSubrayCreation;

		return dest;

	}

	update( time ) {

		if ( this.isStatic ) return;

		if ( this.rayParameters.isEternal || ( this.rayParameters.birthTime <= time && time <= this.rayParameters.deathTime ) ) {

			this.updateMesh( time );

			if ( time < this.subrays[ 0 ].endPropagationTime ) {

				this.state = LightningStrike.RAY_PROPAGATING;

			} else if ( time > this.subrays[ 0 ].beginVanishingTime ) {

				this.state = LightningStrike.RAY_VANISHING;

			} else {

				this.state = LightningStrike.RAY_STEADY;

			}

			this.visible = true;

		} else {

			this.visible = false;

			if ( time < this.rayParameters.birthTime ) {

				this.state = LightningStrike.RAY_UNBORN;

			} else {

				this.state = LightningStrike.RAY_EXTINGUISHED;

			}

		}

	}

	init( rayParameters ) {

		// Init all the state from the parameters

		this.rayParameters = rayParameters;

		// These parameters cannot change after lightning creation:

		this.maxIterations = rayParameters.maxIterations !== undefined ? Math.floor( rayParameters.maxIterations ) : 9;
		rayParameters.maxIterations = this.maxIterations;
		this.isStatic = rayParameters.isStatic !== undefined ? rayParameters.isStatic : false;
		rayParameters.isStatic = this.isStatic;
		this.ramification = rayParameters.ramification !== undefined ? Math.floor( rayParameters.ramification ) : 5;
		rayParameters.ramification = this.ramification;
		this.maxSubrayRecursion = rayParameters.maxSubrayRecursion !== undefined ? Math.floor( rayParameters.maxSubrayRecursion ) : 3;
		rayParameters.maxSubrayRecursion = this.maxSubrayRecursion;
		this.recursionProbability = rayParameters.recursionProbability !== undefined ? rayParameters.recursionProbability : 0.6;
		rayParameters.recursionProbability = this.recursionProbability;
		this.generateUVs = rayParameters.generateUVs !== undefined ? rayParameters.generateUVs : false;
		rayParameters.generateUVs = this.generateUVs;

		// Random generator
		if ( rayParameters.randomGenerator !== undefined ) {

			this.randomGenerator = rayParameters.randomGenerator;
			this.seedGenerator = rayParameters.randomGenerator;

			if ( rayParameters.noiseSeed !== undefined ) {

				this.seedGenerator.setSeed( rayParameters.noiseSeed );

			}

		} else {

			this.randomGenerator = LightningStrike.createRandomGenerator();
			this.seedGenerator = Math;

		}

		// Ray creation callbacks
		if ( rayParameters.onDecideSubrayCreation !== undefined ) {

			this.onDecideSubrayCreation = rayParameters.onDecideSubrayCreation;

		} else {

			this.createDefaultSubrayCreationCallbacks();

			if ( rayParameters.onSubrayCreation !== undefined ) {

				this.onSubrayCreation = rayParameters.onSubrayCreation;

			}

		}

		// Internal state

		this.state = LightningStrike.RAY_INITIALIZED;

		this.maxSubrays = Math.ceil( 1 + Math.pow( this.ramification, Math.max( 0, this.maxSubrayRecursion - 1 ) ) );
		rayParameters.maxSubrays = this.maxSubrays;

		this.maxRaySegments = 2 * ( 1 << this.maxIterations );

		this.subrays = [];

		for ( let i = 0; i < this.maxSubrays; i ++ ) {

			this.subrays.push( this.createSubray() );

		}

		this.raySegments = [];

		for ( let i = 0; i < this.maxRaySegments; i ++ ) {

			this.raySegments.push( this.createSegment() );

		}

		this.time = 0;
		this.timeFraction = 0;
		this.currentSegmentCallback = null;
		this.currentCreateTriangleVertices = this.generateUVs ? this.createTriangleVerticesWithUVs : this.createTriangleVerticesWithoutUVs;
		this.numSubrays = 0;
		this.currentSubray = null;
		this.currentSegmentIndex = 0;
		this.isInitialSegment = false;
		this.subrayProbability = 0;

		this.currentVertex = 0;
		this.currentIndex = 0;
		this.currentCoordinate = 0;
		this.currentUVCoordinate = 0;
		this.vertices = null;
		this.uvs = null;
		this.indices = null;
		this.positionAttribute = null;
		this.uvsAttribute = null;

		this.simplexX = new SimplexNoise( this.seedGenerator );
		this.simplexY = new SimplexNoise( this.seedGenerator );
		this.simplexZ = new SimplexNoise( this.seedGenerator );

		// Temp vectors
		this.forwards = new Vector3();
		this.forwardsFill = new Vector3();
		this.side = new Vector3();
		this.down = new Vector3();
		this.middlePos = new Vector3();
		this.middleLinPos = new Vector3();
		this.newPos = new Vector3();
		this.vPos = new Vector3();
		this.cross1 = new Vector3();

	}

	createMesh() {

		const maxDrawableSegmentsPerSubRay = 1 << this.maxIterations;

		const maxVerts = 3 * ( maxDrawableSegmentsPerSubRay + 1 ) * this.maxSubrays;
		const maxIndices = 18 * maxDrawableSegmentsPerSubRay * this.maxSubrays;

		this.vertices = new Float32Array( maxVerts * 3 );
		this.indices = new Uint32Array( maxIndices );

		if ( this.generateUVs ) {

			this.uvs = new Float32Array( maxVerts * 2 );

		}

		// Populate the mesh
		this.fillMesh( 0 );

		this.setIndex( new Uint32BufferAttribute( this.indices, 1 ) );

		this.positionAttribute = new Float32BufferAttribute( this.vertices, 3 );
		this.setAttribute( 'position', this.positionAttribute );

		if ( this.generateUVs ) {

			this.uvsAttribute = new Float32BufferAttribute( new Float32Array( this.uvs ), 2 );
			this.setAttribute( 'uv', this.uvsAttribute );

		}

		if ( ! this.isStatic ) {

			this.index.usage = DynamicDrawUsage;
			this.positionAttribute.usage = DynamicDrawUsage;

			if ( this.generateUVs ) {

				this.uvsAttribute.usage = DynamicDrawUsage;

			}

		}

		// Store buffers for later modification
		this.vertices = this.positionAttribute.array;
		this.indices = this.index.array;

		if ( this.generateUVs ) {

			this.uvs = this.uvsAttribute.array;

		}

	}

	updateMesh( time ) {

		this.fillMesh( time );

		this.drawRange.count = this.currentIndex;

		this.index.needsUpdate = true;

		this.positionAttribute.needsUpdate = true;

		if ( this.generateUVs ) {

			this.uvsAttribute.needsUpdate = true;

		}

	}

	fillMesh( time ) {

		const scope = this;

		this.currentVertex = 0;
		this.currentIndex = 0;
		this.currentCoordinate = 0;
		this.currentUVCoordinate = 0;

		this.fractalRay( time, function fillVertices( segment ) {

			const subray = scope.currentSubray;

			if ( time < subray.birthTime ) { //&& ( ! this.rayParameters.isEternal || scope.currentSubray.recursion > 0 ) ) {

				return;

			} else if ( this.rayParameters.isEternal && scope.currentSubray.recursion == 0 ) {

				// Eternal rays don't propagate nor vanish, but its subrays do

				scope.createPrism( segment );

				scope.onDecideSubrayCreation( segment, scope );

			} else if ( time < subray.endPropagationTime ) {

				if ( scope.timeFraction >= segment.fraction0 * subray.propagationTimeFactor ) {

					// Ray propagation has arrived to this segment

					scope.createPrism( segment );

					scope.onDecideSubrayCreation( segment, scope );

				}

			} else if ( time < subray.beginVanishingTime ) {

				// Ray is steady (nor propagating nor vanishing)

				scope.createPrism( segment );

				scope.onDecideSubrayCreation( segment, scope );

			} else {

				if ( scope.timeFraction <= subray.vanishingTimeFactor + segment.fraction1 * ( 1 - subray.vanishingTimeFactor ) ) {

					// Segment has not yet vanished

					scope.createPrism( segment );

				}

				scope.onDecideSubrayCreation( segment, scope );

			}

		} );

	}

	addNewSubray( /*rayParameters*/ ) {

		return this.subrays[ this.numSubrays ++ ];

	}

	initSubray( subray, rayParameters ) {

		subray.pos0.copy( rayParameters.sourceOffset );
		subray.pos1.copy( rayParameters.destOffset );
		subray.up0.copy( rayParameters.up0 );
		subray.up1.copy( rayParameters.up1 );
		subray.radius0 = rayParameters.radius0;
		subray.radius1 = rayParameters.radius1;
		subray.birthTime = rayParameters.birthTime;
		subray.deathTime = rayParameters.deathTime;
		subray.timeScale = rayParameters.timeScale;
		subray.roughness = rayParameters.roughness;
		subray.straightness = rayParameters.straightness;
		subray.propagationTimeFactor = rayParameters.propagationTimeFactor;
		subray.vanishingTimeFactor = rayParameters.vanishingTimeFactor;

		subray.maxIterations = this.maxIterations;
		subray.seed = rayParameters.noiseSeed !== undefined ? rayParameters.noiseSeed : 0;
		subray.recursion = 0;

	}

	fractalRay( time, segmentCallback ) {

		this.time = time;
		this.currentSegmentCallback = segmentCallback;
		this.numSubrays = 0;

		// Add the top level subray
		this.initSubray( this.addNewSubray(), this.rayParameters );

		// Process all subrays that are being generated until consuming all of them
		for ( let subrayIndex = 0; subrayIndex < this.numSubrays; subrayIndex ++ ) {

			const subray = this.subrays[ subrayIndex ];
			this.currentSubray = subray;

			this.randomGenerator.setSeed( subray.seed );

			subray.endPropagationTime = MathUtils.lerp( subray.birthTime, subray.deathTime, subray.propagationTimeFactor );
			subray.beginVanishingTime = MathUtils.lerp( subray.deathTime, subray.birthTime, 1 - subray.vanishingTimeFactor );

			const random1 = this.randomGenerator.random;
			subray.linPos0.set( random1(), random1(), random1() ).multiplyScalar( 1000 );
			subray.linPos1.set( random1(), random1(), random1() ).multiplyScalar( 1000 );

			this.timeFraction = ( time - subray.birthTime ) / ( subray.deathTime - subray.birthTime );

			this.currentSegmentIndex = 0;
			this.isInitialSegment = true;

			const segment = this.getNewSegment();
			segment.iteration = 0;
			segment.pos0.copy( subray.pos0 );
			segment.pos1.copy( subray.pos1 );
			segment.linPos0.copy( subray.linPos0 );
			segment.linPos1.copy( subray.linPos1 );
			segment.up0.copy( subray.up0 );
			segment.up1.copy( subray.up1 );
			segment.radius0 = subray.radius0;
			segment.radius1 = subray.radius1;
			segment.fraction0 = 0;
			segment.fraction1 = 1;
			segment.positionVariationFactor = 1 - subray.straightness;

			this.subrayProbability = this.ramification * Math.pow( this.recursionProbability, subray.recursion ) / ( 1 << subray.maxIterations );

			this.fractalRayRecursive( segment );

		}

		this.currentSegmentCallback = null;
		this.currentSubray = null;

	}

	fractalRayRecursive( segment ) {

		// Leave recursion condition
		if ( segment.iteration >= this.currentSubray.maxIterations ) {

			this.currentSegmentCallback( segment );

			return;

		}

		// Interpolation
		this.forwards.subVectors( segment.pos1, segment.pos0 );
		let lForwards = this.forwards.length();

		if ( lForwards < 0.000001 ) {

			this.forwards.set( 0, 0, 0.01 );
			lForwards = this.forwards.length();

		}

		const middleRadius = ( segment.radius0 + segment.radius1 ) * 0.5;
		const middleFraction = ( segment.fraction0 + segment.fraction1 ) * 0.5;

		const timeDimension = this.time * this.currentSubray.timeScale * Math.pow( 2, segment.iteration );

		this.middlePos.lerpVectors( segment.pos0, segment.pos1, 0.5 );
		this.middleLinPos.lerpVectors( segment.linPos0, segment.linPos1, 0.5 );
		const p = this.middleLinPos;

		// Noise
		this.newPos.set( this.simplexX.noise4d( p.x, p.y, p.z, timeDimension ),
			this.simplexY.noise4d( p.x, p.y, p.z, timeDimension ),
			this.simplexZ.noise4d( p.x, p.y, p.z, timeDimension ) );

		this.newPos.multiplyScalar( segment.positionVariationFactor * lForwards );
		this.newPos.add( this.middlePos );

		// Recursion

		const newSegment1 = this.getNewSegment();
		newSegment1.pos0.copy( segment.pos0 );
		newSegment1.pos1.copy( this.newPos );
		newSegment1.linPos0.copy( segment.linPos0 );
		newSegment1.linPos1.copy( this.middleLinPos );
		newSegment1.up0.copy( segment.up0 );
		newSegment1.up1.copy( segment.up1 );
		newSegment1.radius0 = segment.radius0;
		newSegment1.radius1 = middleRadius;
		newSegment1.fraction0 = segment.fraction0;
		newSegment1.fraction1 = middleFraction;
		newSegment1.positionVariationFactor = segment.positionVariationFactor * this.currentSubray.roughness;
		newSegment1.iteration = segment.iteration + 1;

		const newSegment2 = this.getNewSegment();
		newSegment2.pos0.copy( this.newPos );
		newSegment2.pos1.copy( segment.pos1 );
		newSegment2.linPos0.copy( this.middleLinPos );
		newSegment2.linPos1.copy( segment.linPos1 );
		this.cross1.crossVectors( segment.up0, this.forwards.normalize() );
		newSegment2.up0.crossVectors( this.forwards, this.cross1 ).normalize();
		newSegment2.up1.copy( segment.up1 );
		newSegment2.radius0 = middleRadius;
		newSegment2.radius1 = segment.radius1;
		newSegment2.fraction0 = middleFraction;
		newSegment2.fraction1 = segment.fraction1;
		newSegment2.positionVariationFactor = segment.positionVariationFactor * this.currentSubray.roughness;
		newSegment2.iteration = segment.iteration + 1;

		this.fractalRayRecursive( newSegment1 );

		this.fractalRayRecursive( newSegment2 );

	}

	createPrism( segment ) {

		// Creates one triangular prism and its vertices at the segment

		this.forwardsFill.subVectors( segment.pos1, segment.pos0 ).normalize();

		if ( this.isInitialSegment ) {

			this.currentCreateTriangleVertices( segment.pos0, segment.up0, this.forwardsFill, segment.radius0, 0 );

			this.isInitialSegment = false;

		}

		this.currentCreateTriangleVertices( segment.pos1, segment.up0, this.forwardsFill, segment.radius1, segment.fraction1 );

		this.createPrismFaces();

	}

	createTriangleVerticesWithoutUVs( pos, up, forwards, radius ) {

		// Create an equilateral triangle (only vertices)

		this.side.crossVectors( up, forwards ).multiplyScalar( radius * LightningStrike.COS30DEG );
		this.down.copy( up ).multiplyScalar( - radius * LightningStrike.SIN30DEG );

		const p = this.vPos;
		const v = this.vertices;

		p.copy( pos ).sub( this.side ).add( this.down );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		p.copy( pos ).add( this.side ).add( this.down );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		p.copy( up ).multiplyScalar( radius ).add( pos );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		this.currentVertex += 3;

	}

	createTriangleVerticesWithUVs( pos, up, forwards, radius, u ) {

		// Create an equilateral triangle (only vertices)

		this.side.crossVectors( up, forwards ).multiplyScalar( radius * LightningStrike.COS30DEG );
		this.down.copy( up ).multiplyScalar( - radius * LightningStrike.SIN30DEG );

		const p = this.vPos;
		const v = this.vertices;
		const uv = this.uvs;

		p.copy( pos ).sub( this.side ).add( this.down );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		uv[ this.currentUVCoordinate ++ ] = u;
		uv[ this.currentUVCoordinate ++ ] = 0;

		p.copy( pos ).add( this.side ).add( this.down );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		uv[ this.currentUVCoordinate ++ ] = u;
		uv[ this.currentUVCoordinate ++ ] = 0.5;

		p.copy( up ).multiplyScalar( radius ).add( pos );

		v[ this.currentCoordinate ++ ] = p.x;
		v[ this.currentCoordinate ++ ] = p.y;
		v[ this.currentCoordinate ++ ] = p.z;

		uv[ this.currentUVCoordinate ++ ] = u;
		uv[ this.currentUVCoordinate ++ ] = 1;

		this.currentVertex += 3;

	}

	createPrismFaces( vertex/*, index*/ ) {

		const indices = this.indices;
		vertex = this.currentVertex - 6;

		indices[ this.currentIndex ++ ] = vertex + 1;
		indices[ this.currentIndex ++ ] = vertex + 2;
		indices[ this.currentIndex ++ ] = vertex + 5;
		indices[ this.currentIndex ++ ] = vertex + 1;
		indices[ this.currentIndex ++ ] = vertex + 5;
		indices[ this.currentIndex ++ ] = vertex + 4;
		indices[ this.currentIndex ++ ] = vertex + 0;
		indices[ this.currentIndex ++ ] = vertex + 1;
		indices[ this.currentIndex ++ ] = vertex + 4;
		indices[ this.currentIndex ++ ] = vertex + 0;
		indices[ this.currentIndex ++ ] = vertex + 4;
		indices[ this.currentIndex ++ ] = vertex + 3;
		indices[ this.currentIndex ++ ] = vertex + 2;
		indices[ this.currentIndex ++ ] = vertex + 0;
		indices[ this.currentIndex ++ ] = vertex + 3;
		indices[ this.currentIndex ++ ] = vertex + 2;
		indices[ this.currentIndex ++ ] = vertex + 3;
		indices[ this.currentIndex ++ ] = vertex + 5;

	}

	createDefaultSubrayCreationCallbacks() {

		const random1 = this.randomGenerator.random;

		this.onDecideSubrayCreation = function ( segment, lightningStrike ) {

			// Decide subrays creation at parent (sub)ray segment

			const subray = lightningStrike.currentSubray;

			const period = lightningStrike.rayParameters.subrayPeriod;
			const dutyCycle = lightningStrike.rayParameters.subrayDutyCycle;

			const phase0 = ( lightningStrike.rayParameters.isEternal && subray.recursion == 0 ) ? - random1() * period : MathUtils.lerp( subray.birthTime, subray.endPropagationTime, segment.fraction0 ) - random1() * period;

			const phase = lightningStrike.time - phase0;
			const currentCycle = Math.floor( phase / period );

			const childSubraySeed = random1() * ( currentCycle + 1 );

			const isActive = phase % period <= dutyCycle * period;

			let probability = 0;

			if ( isActive ) {

				probability = lightningStrike.subrayProbability;
				// Distribution test: probability *= segment.fraction0 > 0.5 && segment.fraction0 < 0.9 ? 1 / 0.4 : 0;

			}

			if ( subray.recursion < lightningStrike.maxSubrayRecursion && lightningStrike.numSubrays < lightningStrike.maxSubrays && random1() < probability ) {

				const childSubray = lightningStrike.addNewSubray();

				const parentSeed = lightningStrike.randomGenerator.getSeed();
				childSubray.seed = childSubraySeed;
				lightningStrike.randomGenerator.setSeed( childSubraySeed );

				childSubray.recursion = subray.recursion + 1;
				childSubray.maxIterations = Math.max( 1, subray.maxIterations - 1 );

				childSubray.linPos0.set( random1(), random1(), random1() ).multiplyScalar( 1000 );
				childSubray.linPos1.set( random1(), random1(), random1() ).multiplyScalar( 1000 );
				childSubray.up0.copy( subray.up0 );
				childSubray.up1.copy( subray.up1 );
				childSubray.radius0 = segment.radius0 * lightningStrike.rayParameters.radius0Factor;
				childSubray.radius1 = Math.min( lightningStrike.rayParameters.minRadius, segment.radius1 * lightningStrike.rayParameters.radius1Factor );

				childSubray.birthTime = phase0 + ( currentCycle ) * period;
				childSubray.deathTime = childSubray.birthTime + period * dutyCycle;

				if ( ! lightningStrike.rayParameters.isEternal && subray.recursion == 0 ) {

					childSubray.birthTime = Math.max( childSubray.birthTime, subray.birthTime );
					childSubray.deathTime = Math.min( childSubray.deathTime, subray.deathTime );

				}

				childSubray.timeScale = subray.timeScale * 2;
				childSubray.roughness = subray.roughness;
				childSubray.straightness = subray.straightness;
				childSubray.propagationTimeFactor = subray.propagationTimeFactor;
				childSubray.vanishingTimeFactor = subray.vanishingTimeFactor;

				lightningStrike.onSubrayCreation( segment, subray, childSubray, lightningStrike );

				lightningStrike.randomGenerator.setSeed( parentSeed );

			}

		};

		const vec1Pos = new Vector3();
		const vec2Forward = new Vector3();
		const vec3Side = new Vector3();
		const vec4Up = new Vector3();

		this.onSubrayCreation = function ( segment, parentSubray, childSubray, lightningStrike ) {

			// Decide childSubray origin and destination positions (pos0 and pos1) and possibly other properties of childSubray

			// Just use the default cone position generator
			lightningStrike.subrayCylinderPosition( segment, parentSubray, childSubray, 0.5, 0.6, 0.2 );

		};

		this.subrayConePosition = function ( segment, parentSubray, childSubray, heightFactor, sideWidthFactor, minSideWidthFactor ) {

			// Sets childSubray pos0 and pos1 in a cone

			childSubray.pos0.copy( segment.pos0 );

			vec1Pos.subVectors( parentSubray.pos1, parentSubray.pos0 );
			vec2Forward.copy( vec1Pos ).normalize();
			vec1Pos.multiplyScalar( segment.fraction0 + ( 1 - segment.fraction0 ) * ( random1() * heightFactor ) );
			const length = vec1Pos.length();
			vec3Side.crossVectors( parentSubray.up0, vec2Forward );
			const angle = 2 * Math.PI * random1();
			vec3Side.multiplyScalar( Math.cos( angle ) );
			vec4Up.copy( parentSubray.up0 ).multiplyScalar( Math.sin( angle ) );

			childSubray.pos1.copy( vec3Side ).add( vec4Up ).multiplyScalar( length * sideWidthFactor * ( minSideWidthFactor + random1() * ( 1 - minSideWidthFactor ) ) ).add( vec1Pos ).add( parentSubray.pos0 );

		};

		this.subrayCylinderPosition = function ( segment, parentSubray, childSubray, heightFactor, sideWidthFactor, minSideWidthFactor ) {

			// Sets childSubray pos0 and pos1 in a cylinder

			childSubray.pos0.copy( segment.pos0 );

			vec1Pos.subVectors( parentSubray.pos1, parentSubray.pos0 );
			vec2Forward.copy( vec1Pos ).normalize();
			vec1Pos.multiplyScalar( segment.fraction0 + ( 1 - segment.fraction0 ) * ( ( 2 * random1() - 1 ) * heightFactor ) );
			const length = vec1Pos.length();
			vec3Side.crossVectors( parentSubray.up0, vec2Forward );
			const angle = 2 * Math.PI * random1();
			vec3Side.multiplyScalar( Math.cos( angle ) );
			vec4Up.copy( parentSubray.up0 ).multiplyScalar( Math.sin( angle ) );

			childSubray.pos1.copy( vec3Side ).add( vec4Up ).multiplyScalar( length * sideWidthFactor * ( minSideWidthFactor + random1() * ( 1 - minSideWidthFactor ) ) ).add( vec1Pos ).add( parentSubray.pos0 );

		};

	}

	createSubray() {

		return {

			seed: 0,
			maxIterations: 0,
			recursion: 0,
			pos0: new Vector3(),
			pos1: new Vector3(),
			linPos0: new Vector3(),
			linPos1: new Vector3(),
			up0: new Vector3(),
			up1: new Vector3(),
			radius0: 0,
			radius1: 0,
			birthTime: 0,
			deathTime: 0,
			timeScale: 0,
			roughness: 0,
			straightness: 0,
			propagationTimeFactor: 0,
			vanishingTimeFactor: 0,
			endPropagationTime: 0,
			beginVanishingTime: 0

		};

	}

	createSegment() {

		return {
			iteration: 0,
			pos0: new Vector3(),
			pos1: new Vector3(),
			linPos0: new Vector3(),
			linPos1: new Vector3(),
			up0: new Vector3(),
			up1: new Vector3(),
			radius0: 0,
			radius1: 0,
			fraction0: 0,
			fraction1: 0,
			positionVariationFactor: 0
		};

	}

	getNewSegment() {

		return this.raySegments[ this.currentSegmentIndex ++ ];

	}

	copy( source ) {

		super.copy( source );

		this.init( LightningStrike.copyParameters( {}, source.rayParameters ) );

		return this;

	}

	clone() {

		return new this.constructor( LightningStrike.copyParameters( {}, this.rayParameters ) );

	}

}

// Ray states
LightningStrike.RAY_INITIALIZED = 0;
LightningStrike.RAY_UNBORN = 1;
LightningStrike.RAY_PROPAGATING = 2;
LightningStrike.RAY_STEADY = 3;
LightningStrike.RAY_VANISHING = 4;
LightningStrike.RAY_EXTINGUISHED = 5;

LightningStrike.COS30DEG = Math.cos( 30 * Math.PI / 180 );
LightningStrike.SIN30DEG = Math.sin( 30 * Math.PI / 180 );

export { LightningStrike };
