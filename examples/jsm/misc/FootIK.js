import {
	AnimationMixer,
	BufferGeometry,
	Line,
	LineBasicMaterial,
	MathUtils,
	Matrix3,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Quaternion,
	Raycaster,
	SphereGeometry,
	Vector3
} from 'three';

/**
 * Collects all bones under a root object.
 *
 * @param {Object3D|null|undefined} root - The root object to traverse.
 * @return {Array<Bone>} The collected bones.
 */
function collectBones( root ) {

	const bones = [];

	root?.traverse( ( object ) => {

		if ( object.isBone ) bones.push( object );

	} );

	return bones;

}

/**
 * Finds a hips/pelvis bone by common naming conventions.
 *
 * @param {Array<Bone>} bones - The bones to search.
 * @return {Bone|null} The hips bone, or `null` if none is found.
 */
function findHips( bones ) {

	return bones.find( ( bone ) => /hips|pelvis/i.test( bone.name ) ) ?? null;

}

/**
 * Creates runtime leg state for one side.
 *
 * @param {'left'|'right'} side - The leg side.
 * @param {Array<Bone>} bones - The bones to search.
 * @param {number} color - The debug color for this leg.
 * @param {Object|null} [skeletonConfig=null] - Optional skeleton bone overrides.
 * @return {Object} The runtime leg state.
 */
function createLeg( side, bones, color, skeletonConfig = null ) {

	const legConfig = skeletonConfig?.legs?.[ side ] ?? null;
	const upper = resolveConfiguredBone( legConfig?.upper, bones, `${ side }.upper` )
		?? findBone( bones, side, 'upper' );
	const lower = resolveConfiguredBone( legConfig?.lower, bones, `${ side }.lower` )
		?? findBone( bones, side, 'lower' );
	const foot = resolveConfiguredBone( legConfig?.foot, bones, `${ side }.foot` )
		?? findBone( bones, side, 'foot' );
	const toe = resolveConfiguredBone( legConfig?.toe, bones, `${ side }.toe` )
		?? findBone( bones, side, 'toe' );

	return {
		side,
		upper,
		lower,
		foot,
		toe,
		color,
		ready: ! ! ( upper && lower && foot ),
		smoothedTarget: new Vector3(),
		hitPoint: new Vector3(),
		hitNormal: new Vector3( 0, 1, 0 ),
		footSamplePoint: new Vector3(),
		soleSamples: [ 'heelL', 'heelR', 'toeL', 'toeR' ].map( ( name ) => ( {
			name,
			local: new Vector3(),
			point: new Vector3(),
			hitPoint: new Vector3(),
			hasHit: false,
			marker: null,
			rayLine: null,
			footMarker: null
		} ) ),
		offsetY: 0,
		movePenetrating: false,
		weight: 0,
		plantedWeight: 0,
		planted: false,
		lastPole: new Vector3(),
		hasLastPole: false,
		marker: null,
		rayLine: null
	};

}

/**
 * Returns whether a leg has the bones required for IK.
 *
 * @param {Object} leg - The runtime leg state.
 * @return {boolean} Whether the leg is ready.
 */
function isReadyLeg( leg ) {

	return ! ! ( leg.ready && leg.upper && leg.lower && leg.foot );

}

/**
 * Resolves a configured bone reference to a bone instance.
 *
 * @param {Bone|string|undefined} ref - A bone instance or bone name.
 * @param {Array<Bone>} bones - The bones to search.
 * @param {string} label - A label used in warning messages.
 * @param {boolean} [warnMissing=true] - Whether to warn when a named bone is missing.
 * @return {Bone|null} The resolved bone, or `null` if none is found.
 */
function resolveConfiguredBone( ref, bones, label, warnMissing = true ) {

	if ( ! ref ) return null;

	if ( typeof ref !== 'string' && ref.isBone ) return ref;

	if ( typeof ref === 'string' ) {

		const bone = bones.find( ( item ) => item.name === ref ) ?? null;

		if ( ! bone && warnMissing ) {

			console.warn( `[FootIK] Missing bone: ${ label } -> "${ ref }"` );

		}

		return bone;

	}

	console.warn( `[FootIK] Invalid bone config: ${ label }`, ref );
	return null;

}

/**
 * Finds a leg bone by side and role using common naming conventions.
 *
 * @param {Array<Bone>} bones - The bones to search.
 * @param {'left'|'right'} side - The leg side.
 * @param {'upper'|'lower'|'foot'|'toe'} type - The bone role.
 * @return {Bone|null} The matched bone, or `null` if none is found.
 */
function findBone( bones, side, type ) {

	const candidates = bones.filter( ( bone ) => matchesSide( bone.name, side ) );

	const score = ( bone ) => {

		const name = compactName( bone.name );

		if ( type === 'upper' ) return Number( name.includes( 'upleg' ) || name.includes( 'thigh' ) );
		if ( type === 'lower' ) return Number( ( name.includes( 'leg' ) || name.includes( 'calf' ) || name.includes( 'shin' ) ) && ! name.includes( 'upleg' ) && ! name.includes( 'foot' ) );
		if ( type === 'foot' ) return Number( ( name.includes( 'foot' ) || name.includes( 'ankle' ) ) && ! name.includes( 'toe' ) && ! name.includes( 'ball' ) );

		return Number( name.includes( 'toe' ) || ( name.includes( 'ball' ) && ! name.includes( 'leaf' ) ) );

	};

	return candidates
		.map( ( bone ) => ( { bone, score: score( bone ) } ) )
		.filter( ( item ) => item.score > 0 )
		.sort( ( a, b ) => b.score - a.score )[ 0 ]?.bone ?? null;

}

/**
 * Returns whether a bone name matches the given side.
 *
 * @param {string} name - The bone name.
 * @param {'left'|'right'} side - The leg side.
 * @return {boolean} Whether the name matches the side.
 */
function matchesSide( name, side ) {

	const lower = name.toLowerCase();
	const compact = compactName( name );

	if ( side === 'left' ) return compact.includes( 'left' ) || lower.includes( '_l' ) || lower.includes( '.l' ) || lower.includes( ' l' );

	return compact.includes( 'right' ) || lower.includes( '_r' ) || lower.includes( '.r' ) || lower.includes( ' r' );

}

/**
 * Returns a compact lowercase bone name with non-alphanumeric characters removed.
 *
 * @param {string} name - The bone name.
 * @return {string} The compact name.
 */
function compactName( name ) {

	return name.toLowerCase().replace( /[^a-z0-9]/g, '' );

}

/**
 * Creates reusable scratch vectors and quaternions for two-bone IK.
 *
 * @return {Object} The scratch object.
 */
function createTwoBoneIKScratch() {

	return {
		v1: new Vector3(),
		v2: new Vector3(),
		v3: new Vector3(),
		v4: new Vector3(),
		v5: new Vector3(),
		v6: new Vector3(),
		v7: new Vector3(),
		v8: new Vector3(),
		v9: new Vector3(),
		v10: new Vector3(),
		v11: new Vector3(),
		v12: new Vector3(),
		v13: new Vector3(),
		q1: new Quaternion(),
		q2: new Quaternion(),
		q3: new Quaternion(),
		identityQ: new Quaternion()
	};

}

/**
 * Solves a constrained two-bone IK chain for one leg.
 *
 * @param {Object|null|undefined} leg - The runtime leg state.
 * @param {Vector3} target - The world-space IK target.
 * @param {number} weight - The blend weight in the range `[0, 1]`.
 * @param {Object} [options={}] - Solver options.
 * @param {Object} [options.scratch] - Optional scratch object from `createTwoBoneIKScratch()`.
 * @param {function(Bone): void} [options.capture] - Called before a bone quaternion is modified.
 * @param {number} [options.minKneeBend] - Minimum knee bend angle in radians.
 * @param {number} [options.maxKneeBend] - Maximum knee bend angle in radians.
 * @param {Vector3} [options.kneePlaneNormal] - Optional preferred knee plane normal.
 */
function solveTwoBoneIK( leg, target, weight, options = {} ) {

	if ( ! leg?.upper || ! leg?.lower || ! leg?.foot || weight <= 0.001 ) return;

	const scratch = options.scratch ?? createTwoBoneIKScratch();
	const capture = options.capture ?? ( () => {} );
	const minBend = options.minKneeBend ?? MathUtils.degToRad( 2 );
	const maxBend = options.maxKneeBend ?? MathUtils.degToRad( 145 );
	const solveWeight = MathUtils.clamp( weight, 0, 1 );

	const restPole = getRestPole( leg, scratch );

	const hip = leg.upper.getWorldPosition( scratch.v1 );
	const knee = leg.lower.getWorldPosition( scratch.v2 );
	const foot = leg.foot.getWorldPosition( scratch.v3 );
	const upperLen = Math.max( 0.0001, hip.distanceTo( knee ) );
	const lowerLen = Math.max( 0.0001, knee.distanceTo( foot ) );

	const hipToTarget = scratch.v4.copy( target ).sub( hip );
	const targetDistance = hipToTarget.length();
	if ( targetDistance < 0.0001 ) return;

	const maxReach = reachFromBend( upperLen, lowerLen, minBend );
	const minReach = reachFromBend( upperLen, lowerLen, maxBend );
	const clampedDistance = MathUtils.clamp( targetDistance, minReach, maxReach );
	const clampedTarget = scratch.v5.copy( hip ).addScaledVector( hipToTarget, clampedDistance / targetDistance );

	const chainDir = scratch.v6.copy( clampedTarget ).sub( hip ).normalize();
	const pole = getStablePole( leg, restPole, options.kneePlaneNormal, chainDir, scratch.v7 );
	const along = ( upperLen * upperLen - lowerLen * lowerLen + clampedDistance * clampedDistance ) / ( 2 * clampedDistance );
	const height = Math.sqrt( Math.max( 0, upperLen * upperLen - along * along ) );
	const desiredKnee = scratch.v8.copy( hip ).addScaledVector( chainDir, along ).addScaledVector( pole, height );

	rotateBoneToward( leg.upper, leg.lower.getWorldPosition( scratch.v9 ), desiredKnee, solveWeight, capture, scratch );
	leg.upper.updateMatrixWorld( true );
	leg.lower.updateMatrixWorld( true );

	rotateBoneToward( leg.lower, leg.foot.getWorldPosition( scratch.v9 ), clampedTarget, solveWeight, capture, scratch );
	leg.lower.updateMatrixWorld( true );

}

function reachFromBend( upperLen, lowerLen, bend ) {

	return Math.sqrt( upperLen * upperLen + lowerLen * lowerLen + 2 * upperLen * lowerLen * Math.cos( bend ) );

}

function getRestPole( leg, scratch ) {

	const hip = leg.upper.getWorldPosition( scratch.v9 );
	const knee = leg.lower.getWorldPosition( scratch.v10 );
	const foot = leg.foot.getWorldPosition( scratch.v11 );
	const restChain = scratch.v12.copy( foot ).sub( hip ).normalize();
	const restPole = scratch.v13.copy( knee ).sub( hip ).addScaledVector( restChain, - scratch.v10.copy( knee ).sub( hip ).dot( restChain ) );

	if ( restPole.lengthSq() < 0.000001 ) restPole.set( 0, 0, 1 );

	return scratch.v13.normalize();

}

function getStablePole( leg, restPole, kneePlaneNormal, chainDir, target ) {

	if ( kneePlaneNormal ) {

		target.crossVectors( chainDir, kneePlaneNormal );

		if ( normalizePole( target ) ) {

			rememberPole( leg, target );
			return target;

		}

		if ( leg.hasLastPole && leg.lastPole
			&& projectPoleToChainPlane( leg.lastPole, chainDir, target ) ) {

			rememberPole( leg, target );
			return target;

		}

	}

	if ( projectPoleToChainPlane( restPole, chainDir, target ) ) {

		rememberPole( leg, target );
		return target;

	}

	target.set( 0, chainDir.z, - chainDir.y );

	if ( ! normalizePole( target ) ) {

		target.set( - chainDir.y, chainDir.x, 0 );
		normalizePole( target );

	}

	rememberPole( leg, target );
	return target;

}

function projectPoleToChainPlane( direction, chainDir, target ) {

	target.copy( direction ).addScaledVector( chainDir, - direction.dot( chainDir ) );
	return normalizePole( target );

}

function normalizePole( pole ) {

	const lengthSq = pole.lengthSq();
	if ( lengthSq < 0.000001 ) return false;
	pole.multiplyScalar( 1 / Math.sqrt( lengthSq ) );
	return true;

}

function rememberPole( leg, pole ) {

	if ( ! leg.lastPole ) return;
	leg.lastPole.copy( pole );
	leg.hasLastPole = true;

}

function rotateBoneToward( bone, effectorWorld, targetWorld, weight, capture, scratch ) {

	capture( bone );

	const jointWorld = bone.getWorldPosition( scratch.v10 );
	const from = scratch.v11.copy( effectorWorld ).sub( jointWorld ).normalize();
	const to = scratch.v12.copy( targetWorld ).sub( jointWorld ).normalize();
	if ( from.lengthSq() < 0.0001 || to.lengthSq() < 0.0001 ) return;

	const deltaWorldQ = scratch.q1.setFromUnitVectors( from, to );
	deltaWorldQ.slerp( scratch.identityQ, 1 - weight );

	const jointWorldQ = bone.getWorldQuaternion( scratch.q2 );
	const targetWorldQ = deltaWorldQ.multiply( jointWorldQ );
	const parent = bone.parent;
	if ( ! parent ) return;

	const parentWorldQ = parent.getWorldQuaternion( scratch.q3 );
	bone.quaternion.copy( parentWorldQ.invert().multiply( targetWorldQ ) );
	bone.updateMatrixWorld( true );

}

const tmpFoot = new Vector3();
const tmpToe = new Vector3();

/**
 * Creates default runtime state for one foot phase.
 *
 * @return {Object} The runtime state.
 */
function createFootPhaseRuntimeState() {

	return {
		planted: false,
		progress: 0,
		timeToLand: Infinity
	};

}

/**
 * Builds foot phase sampling options from controller config.
 *
 * @param {Object} [options={}] - The controller options.
 * @return {Object} The sampling options.
 */
function createFootPhaseOptions( options = {} ) {

	return {
		sampleCount: Math.max( 16, Math.round( options.footPhaseSampleCount ?? 96 ) ),
		groundThreshold: Math.max( 0, options.footPhaseGroundThreshold ?? 0.05 ),
		minContactRatio: MathUtils.clamp( options.footPhaseMinContactRatio ?? 0.04, 0, 1 ),
		speedSlack: Math.max( 0, options.footPhaseSpeedSlack ?? 1.35 )
	};

}

/**
 * Offline samples locomotion clips to build left/right land and lift phases.
 *
 * @param {Object3D|null|undefined} model - The skinned model root.
 * @param {Array<AnimationClip>} clips - Animation clips to analyze.
 * @param {Object} legs - Bound left/right leg state.
 * @param {Object} options - Foot phase sampling options.
 * @param {function(string): boolean} isLocomotionClip - Returns whether a clip name is locomotion.
 * @return {Map} Phase data keyed by clip name.
 */
function buildFootPhaseDatabase(
	model,
	clips,
	legs,
	options,
	isLocomotionClip
) {

	const phaseClips = new Map();
	if ( ! model || ! clips.length || ! isReadyLeg( legs.left ) || ! isReadyLeg( legs.right ) ) return phaseClips;

	const bones = collectBones( model );
	const savedPoses = bones.map( ( bone ) => ( {
		bone,
		position: bone.position.clone(),
		quaternion: bone.quaternion.clone(),
		scale: bone.scale.clone()
	} ) );
	const savedModelMatrixNeedsUpdate = model.matrixWorldNeedsUpdate;
	const mixer = new AnimationMixer( model );

	try {

		for ( const clip of clips ) {

			if ( ! shouldAnalyzeFootPhaseClip( clip, isLocomotionClip ) ) continue;
			phaseClips.set( clip.name, sampleFootPhaseClip( model, mixer, clip, legs, options ) );

		}

	} finally {

		mixer.stopAllAction();
		mixer.uncacheRoot( model );
		for ( const pose of savedPoses ) {

			pose.bone.position.copy( pose.position );
			pose.bone.quaternion.copy( pose.quaternion );
			pose.bone.scale.copy( pose.scale );

		}

		model.matrixWorldNeedsUpdate = savedModelMatrixNeedsUpdate;
		model.updateMatrixWorld( true );

	}

	return phaseClips;

}

/**
 * Samples left/right runtime phase at the current animation time.
 *
 * @param {Object|null|undefined} phaseClip - Precomputed phase data for one clip.
 * @param {number} normalizedTime - Loop time in `[0, 1)`.
 * @param {number} duration - Clip duration in seconds.
 * @return {Object} Runtime phase state for both feet.
 */
function sampleFootPhaseRuntime( phaseClip, normalizedTime, duration ) {

	if ( ! phaseClip ) {

		return {
			left: createFootPhaseRuntimeState(),
			right: createFootPhaseRuntimeState()
		};

	}

	return {
		left: sampleFootPhaseRuntimeSide( phaseClip.left, normalizedTime, duration ),
		right: sampleFootPhaseRuntimeSide( phaseClip.right, normalizedTime, duration )
	};

}

function shouldAnalyzeFootPhaseClip( clip, isLocomotionClip ) {

	return clip.duration > 0 && isLocomotionClip( clip.name );

}

function sampleFootPhaseClip( model, mixer, clip, legs, options ) {

	if ( ! isReadyLeg( legs.left ) || ! isReadyLeg( legs.right ) ) {

		throw new Error( '[FootIK] Leg bones incomplete during foot phase sampling.' );

	}

	const action = mixer.clipAction( clip );
	action.reset();
	action.setEffectiveWeight( 1 );
	action.play();

	const samples = [];
	for ( let i = 0; i < options.sampleCount; i ++ ) {

		const normalizedTime = i / options.sampleCount;
		mixer.setTime( normalizedTime * clip.duration );
		model.updateMatrixWorld( true );
		samples.push( {
			time: normalizedTime,
			left: getFootPhaseSample( model, legs.left ),
			right: getFootPhaseSample( model, legs.right )
		} );

	}

	action.stop();

	return {
		name: clip.name,
		duration: clip.duration,
		left: analyzeFootPhaseSide( samples, 'left', options ),
		right: analyzeFootPhaseSide( samples, 'right', options )
	};

}

function getFootPhaseSample( model, leg ) {

	const foot = leg.foot.getWorldPosition( tmpFoot );
	const toeY = leg.toe ? leg.toe.getWorldPosition( tmpToe ).y : foot.y;
	const contactY = Math.min( foot.y, toeY );
	model.worldToLocal( foot );
	return {
		y: contactY,
		x: foot.x,
		z: foot.z
	};

}

function analyzeFootPhaseSide( samples, side, options ) {

	let minY = Infinity;
	for ( const sample of samples ) minY = Math.min( minY, sample[ side ].y );

	const speeds = calculateFootPhaseSpeeds( samples, side );
	const heightContacts = samples.map( ( sample ) => sample[ side ].y <= minY + options.groundThreshold );
	const speedContacts = filterFootPhaseBySpeed( heightContacts, speeds, options.speedSlack );
	const contacts = keepMainFootContactRun( filterShortFootContacts( speedContacts, options.minContactRatio ) );
	const land = [];
	const lift = [];

	for ( let i = 0; i < contacts.length; i ++ ) {

		const prev = contacts[ ( i - 1 + contacts.length ) % contacts.length ];
		const current = contacts[ i ];
		if ( ! prev && current ) land.push( samples[ i ].time );
		if ( prev && ! current ) lift.push( samples[ i ].time );

	}

	return {
		contacts,
		land,
		lift
	};

}

function calculateFootPhaseSpeeds( samples, side ) {

	const speeds = [];
	for ( let i = 0; i < samples.length; i ++ ) {

		const prev = samples[ ( i - 1 + samples.length ) % samples.length ][ side ];
		const next = samples[ ( i + 1 ) % samples.length ][ side ];
		speeds.push( Math.hypot( next.x - prev.x, next.z - prev.z ) );

	}

	return speeds;

}

function filterFootPhaseBySpeed( contacts, speeds, speedSlack ) {

	const contactSpeeds = speeds
		.filter( ( _speed, index ) => contacts[ index ] )
		.sort( ( a, b ) => a - b );
	if ( contactSpeeds.length === 0 ) return contacts.slice();

	const median = contactSpeeds[ Math.floor( contactSpeeds.length * 0.5 ) ];
	const p75 = contactSpeeds[ Math.floor( contactSpeeds.length * 0.75 ) ];
	const threshold = Math.max( median, p75 ) * speedSlack;
	return contacts.map( ( contact, index ) => contact && speeds[ index ] <= threshold );

}

function filterShortFootContacts( contacts, minContactRatio ) {

	const minLength = Math.max( 1, Math.round( contacts.length * minContactRatio ) );
	const filtered = contacts.slice();

	for ( const run of getCircularContactRuns( contacts, true ) ) {

		if ( run.indices.length >= minLength ) continue;
		for ( const index of run.indices ) filtered[ index ] = false;

	}

	return filtered;

}

function keepMainFootContactRun( contacts ) {

	const runs = getCircularContactRuns( contacts, true );
	if ( runs.length <= 1 ) return contacts.slice();

	const mainRun = runs.sort( ( a, b ) => b.indices.length - a.indices.length )[ 0 ];
	const filtered = new Array( contacts.length ).fill( false );
	for ( const index of mainRun.indices ) filtered[ index ] = true;
	return filtered;

}

function getCircularContactRuns( values, targetValue ) {

	const runs = [];
	if ( values.length === 0 ) return runs;

	const visited = new Array( values.length ).fill( false );
	const start = values.findIndex( ( value, index ) => {

		const prev = values[ ( index - 1 + values.length ) % values.length ];
		return value === targetValue && prev !== targetValue;

	} );
	if ( start < 0 ) {

		return values[ 0 ] === targetValue
			? [ { indices: values.map( ( _value, index ) => index ) } ]
			: runs;

	}

	for ( let offset = 0; offset < values.length; offset ++ ) {

		const index = ( start + offset ) % values.length;
		if ( visited[ index ] || values[ index ] !== targetValue ) continue;

		const indices = [];
		let cursor = index;
		while ( ! visited[ cursor ] && values[ cursor ] === targetValue ) {

			visited[ cursor ] = true;
			indices.push( cursor );
			cursor = ( cursor + 1 ) % values.length;
			if ( cursor === index ) break;

		}

		runs.push( { indices } );

	}

	return runs;

}

function sampleFootPhaseRuntimeSide( sideData, normalizedTime, duration ) {

	const sampleCount = sideData.contacts.length;
	if ( sampleCount === 0 ) return createFootPhaseRuntimeState();

	const sampleIndex = Math.floor( normalizedTime * sampleCount ) % sampleCount;
	const planted = !! sideData.contacts[ sampleIndex ];
	const nextLand = nextPhaseEvent( sideData.land, normalizedTime );
	const prevLift = prevPhaseEvent( sideData.lift, normalizedTime );
	const swingSpan = wrapPhaseDistance( prevLift, nextLand ) || 1;
	const swingDone = wrapPhaseDistance( prevLift, normalizedTime );

	return {
		planted,
		progress: planted ? 1 : MathUtils.clamp( swingDone / swingSpan, 0, 1 ),
		timeToLand: wrapPhaseDistance( normalizedTime, nextLand ) * duration
	};

}

function nextPhaseEvent( events, normalizedTime ) {

	if ( ! events.length ) return null;
	let best = events[ 0 ];
	let bestDistance = Infinity;
	for ( const eventTime of events ) {

		const distance = wrapPhaseDistance( normalizedTime, eventTime );
		if ( distance < bestDistance ) {

			best = eventTime;
			bestDistance = distance;

		}

	}

	return best;

}

function prevPhaseEvent( events, normalizedTime ) {

	if ( ! events.length ) return normalizedTime;
	let best = events[ 0 ];
	let bestDistance = Infinity;
	for ( const eventTime of events ) {

		const distance = wrapPhaseDistance( eventTime, normalizedTime );
		if ( distance < bestDistance ) {

			best = eventTime;
			bestDistance = distance;

		}

	}

	return best;

}

function wrapPhaseDistance( from, to ) {

	if ( from === null || to === null ) return 0;
	return ( to - from + 1 ) % 1;

}

const FOOT_IK_SIDES = [ 'left', 'right' ];

/**
 * Creates foot IK debug target spheres and sample rays on demand.
 *
 * @param {Scene|null} scene - The scene used to host debug objects.
 * @param {Object} legs - The left/right runtime leg state.
 * @param {boolean} enabled - Whether debug visualization is enabled.
 */
function createDebugObjects( scene, legs, enabled ) {

	if ( ! enabled || ! scene ) return;

	let markerGeometry = null;
	let sampleGeometry = null;
	for ( const side of FOOT_IK_SIDES ) {

		const leg = legs[ side ];

		if ( ! leg.marker ) {

			markerGeometry ??= new SphereGeometry( 0.035, 10, 8 );
			leg.marker = new Mesh(
				markerGeometry,
				new MeshStandardMaterial( { color: leg.color, roughness: 0.5 } )
			);
			scene.add( leg.marker );

		}

		if ( ! leg.rayLine ) {

			leg.rayLine = new Line(
				new BufferGeometry().setFromPoints( [ new Vector3(), new Vector3() ] ),
				new LineBasicMaterial( { color: leg.color } )
			);
			scene.add( leg.rayLine );

		}

		for ( const sample of leg.soleSamples ) {

			if ( ! sample.marker ) {

				sampleGeometry ??= new SphereGeometry( 0.022, 10, 8 );
				sample.marker = new Mesh(
					sampleGeometry,
					new MeshStandardMaterial( {
						color: leg.color,
						emissive: leg.color,
						emissiveIntensity: 0.18,
						roughness: 0.5
					} )
				);
				scene.add( sample.marker );

			}

			if ( ! sample.rayLine ) {

				sample.rayLine = new Line(
					new BufferGeometry().setFromPoints( [ new Vector3(), new Vector3() ] ),
					new LineBasicMaterial( {
						color: leg.color,
						transparent: true,
						opacity: 0.45
					} )
				);
				scene.add( sample.rayLine );

			}

		}

	}

}

/**
 * Updates one foot IK target, main ray, and sole sample visuals.
 *
 * @param {boolean} enabled - Whether debug visualization is enabled.
 * @param {Object} leg - The runtime leg state.
 * @param {Vector3} footWorld - The foot world position.
 * @param {Vector3} hitPoint - The ground hit point.
 */
function updateFootDebug( enabled, leg, footWorld, hitPoint ) {

	if ( ! enabled || ! leg.marker || ! leg.rayLine ) return;

	leg.marker.visible = true;
	leg.rayLine.visible = true;
	leg.marker.position.copy( leg.smoothedTarget );
	leg.rayLine.geometry.setFromPoints( [ footWorld, hitPoint ] );

	for ( const sample of leg.soleSamples ) {

		if ( ! sample.marker || ! sample.rayLine ) continue;
		sample.marker.visible = sample.hasHit;
		sample.rayLine.visible = sample.hasHit;
		if ( sample.hasHit ) {

			sample.marker.position.copy( sample.hitPoint );
			sample.rayLine.geometry.setFromPoints( [ sample.point, sample.hitPoint ] );

		}

	}

}

/**
 * Toggles visibility for all leg IK debug objects.
 *
 * @param {Object} legs - The left/right runtime leg state.
 * @param {boolean} visible - Whether the objects should be visible.
 */
function setDebugVisible( legs, visible ) {

	for ( const side of FOOT_IK_SIDES ) {

		const leg = legs[ side ];
		if ( leg.marker ) leg.marker.visible = visible;
		if ( leg.rayLine ) leg.rayLine.visible = visible;
		for ( const sample of leg.soleSamples ) {

			if ( sample.marker ) sample.marker.visible = visible && sample.hasHit;
			if ( sample.rayLine ) sample.rayLine.visible = visible && sample.hasHit;

		}

	}

}

/**
 * Creates sole sample markers that follow the foot bone on demand.
 *
 * @param {Scene|null} scene - The scene used to host debug objects.
 * @param {Object} legs - The left/right runtime leg state.
 * @param {boolean} enabled - Whether sole sample debug visualization is enabled.
 */
function createSoleSampleDebugObjects( scene, legs, enabled ) {

	if ( ! enabled || ! scene ) return;

	let geometry = null;
	for ( const side of FOOT_IK_SIDES ) {

		const leg = legs[ side ];
		for ( const sample of leg.soleSamples ) {

			if ( sample.footMarker ) continue;
			geometry ??= new SphereGeometry( 0.018, 10, 8 );
			sample.footMarker = new Mesh(
				geometry,
				new MeshBasicMaterial( { color: leg.color, depthTest: false } )
			);
			sample.footMarker.renderOrder = 20;
			scene.add( sample.footMarker );

		}

	}

}

/**
 * Updates sole local sample debug marker positions.
 *
 * @param {boolean} enabled - Whether sole sample debug visualization is enabled.
 * @param {Scene|null} scene - The scene used to host debug objects.
 * @param {Object} legs - The left/right runtime leg state.
 * @param {Function} updateSamples - Callback that refreshes sole sample world positions.
 * @param {Vector3} target - Scratch vector used while updating samples.
 */
function updateSoleSampleDebugObjects( enabled, scene, legs, updateSamples, target ) {

	if ( ! enabled ) return;
	createSoleSampleDebugObjects( scene, legs, enabled );

	for ( const side of FOOT_IK_SIDES ) {

		const leg = legs[ side ];
		if ( ! isReadyLeg( leg ) ) continue;

		updateSamples( leg, leg.foot.getWorldPosition( target ), leg.soleSamples, null );
		for ( const sample of leg.soleSamples ) {

			if ( ! sample.footMarker ) continue;
			sample.footMarker.visible = true;
			sample.footMarker.position.copy( sample.point );

		}

	}

}

/**
 * Toggles visibility for sole local sample debug markers.
 *
 * @param {Object} legs - The left/right runtime leg state.
 * @param {boolean} visible - Whether the markers should be visible.
 */
function setSoleSampleDebugVisible( legs, visible ) {

	for ( const side of FOOT_IK_SIDES ) {

		for ( const sample of legs[ side ].soleSamples ) {

			if ( sample.footMarker ) sample.footMarker.visible = visible;

		}

	}

}

/**
 * Removes debug objects and disposes GPU resources.
 *
 * @param {Object} legs - The left/right runtime leg state.
 */
function disposeDebugObjects( legs ) {

	const geometries = new Set();
	const materials = new Set();

	for ( const side of FOOT_IK_SIDES ) {

		const leg = legs[ side ];
		collectDebugObject( leg.marker, geometries, materials );
		collectDebugObject( leg.rayLine, geometries, materials );
		leg.marker = null;
		leg.rayLine = null;

		for ( const sample of leg.soleSamples ) {

			collectDebugObject( sample.marker, geometries, materials );
			collectDebugObject( sample.rayLine, geometries, materials );
			collectDebugObject( sample.footMarker, geometries, materials );
			sample.marker = null;
			sample.rayLine = null;
			sample.footMarker = null;

		}

	}

	for ( const geometry of geometries ) geometry.dispose();
	for ( const material of materials ) material.dispose();

}

function collectDebugObject( object, geometries, materials ) {

	if ( ! object ) return;
	object.parent?.remove( object );
	geometries.add( object.geometry );
	const objectMaterials = Array.isArray( object.material )
		? object.material
		: [ object.material ];
	for ( const material of objectMaterials ) materials.add( material );

}

/**
 * Foot IK controller that adjusts leg and foot pose from animation and ground height.
 *
 * @three_import import { FootIK } from 'three/addons/misc/FootIK.js';
 */
class FootIK {

	/**
	 * Constructs a new foot IK controller.
	 *
	 * @param {Object} [options={}] - The foot IK options.
	 */
	constructor( options = {} ) {

		/**
		 * The plugin name.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.name = 'foot-ik';

		this.player = null;

		this.enabled = options.enabled ?? true;
		this.disposed = false;
		this.debug = options.debug ?? false;
		this.soleSampleDebug = options.soleSampleDebug ?? false;

		this.maxPelvisDrop = 0.2;
		this.soleHalfWidth = 0.07;
		this.soleToeExtend = 0.07;
		this.soleHeelExtend = 0.03;
		this.soleSkinThickness = 0.016;
		this.moveLiftThreshold = 0.001;
		this.maxMeshStepDrop = 0.36;
		this.maxMeshStepRaise = 0.36;
		this.meshStepCoplanarThreshold = 0.08;
		this.footPhaseGroundThreshold = 0.05;
		this.pelvisMaxRaise = 0.07;
		this.fakeToeExtend = 0.24;
		this.meshStepEpsilon = 0.04;
		this.sampleRayOriginY = 0.9;
		this.raycastFar = 4.4;
		this.snapEpsilon = 0.0002;
		this.appliedScale = 1;

		this.maxPelvisDrop = Math.max( 0, options.maxPelvisDrop ?? this.maxPelvisDrop );
		this.soleHalfWidth = Math.max( 0, options.soleHalfWidth ?? this.soleHalfWidth );
		this.soleToeExtend = Math.max( 0, options.soleToeExtend ?? this.soleToeExtend );
		this.soleHeelExtend = Math.max( 0, options.soleHeelExtend ?? this.soleHeelExtend );
		this.soleSkinThickness = Math.max( 0, options.soleSkinThickness ?? this.soleSkinThickness );
		this.moveLiftThreshold = Math.max( 0, options.moveLiftThreshold ?? this.moveLiftThreshold );
		this.maxMeshStepDrop = Math.max( 0, options.maxMeshStepDrop ?? this.maxMeshStepDrop );
		this.maxMeshStepRaise = Math.max( 0, options.maxMeshStepRaise ?? this.maxMeshStepRaise );
		this.meshStepCoplanarThreshold = Math.max( 0, options.meshStepCoplanarThreshold ?? this.meshStepCoplanarThreshold );
		this.footPhaseGroundThreshold = Math.max( 0, options.footPhaseGroundThreshold ?? this.footPhaseGroundThreshold );

		this.footAlignWeight = MathUtils.clamp( options.footAlignWeight ?? 1, 0, 1 );
		this.maxFootTilt = MathUtils.clamp( options.maxFootTilt ?? Math.PI / 2, 0, Math.PI );
		const configuredMinBend = MathUtils.clamp( options.minKneeBend ?? MathUtils.degToRad( 2 ), 0, Math.PI );
		const configuredMaxBend = MathUtils.clamp( options.maxKneeBend ?? MathUtils.degToRad( 145 ), 0, Math.PI );
		this.minKneeBend = Math.min( configuredMinBend, configuredMaxBend );
		this.maxKneeBend = Math.max( configuredMinBend, configuredMaxBend );

		this.meshBaseY = 0;
		this.meshStepOffsetY = 0;
		this.pelvisOffset = 0;

		this.raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, this.raycastFar );
		this.raycaster.firstHitOnly = true;

		this.up = new Vector3( 0, 1, 0 );
		this.tmpV1 = new Vector3();
		this.tmpV2 = new Vector3();
		this.tmpV3 = new Vector3();
		this.tmpV4 = new Vector3();
		this.tmpV5 = new Vector3();
		this.tmpQ1 = new Quaternion();
		this.tmpQ2 = new Quaternion();
		this.tmpQ3 = new Quaternion();
		this.savedFootWorldQ = new Quaternion();
		this.savedAlignedFootWorldQ = new Quaternion();
		this.identityQ = new Quaternion();
		this.normalMatrix = new Matrix3();

		this.footPhaseOptions = createFootPhaseOptions( {
			...options,
			footPhaseGroundThreshold: this.footPhaseGroundThreshold
		} );
		this.footPhaseState = {
			clipName: '',
			normalizedTime: 0,
			left: createFootPhaseRuntimeState(),
			right: createFootPhaseRuntimeState()
		};

		this.twoBoneIKScratch = createTwoBoneIKScratch();
		this.meshStepProbeSamples = [ 'heelL', 'heelR', 'toeL', 'toeR' ].map( name => ( {
			name,
			point: new Vector3(),
			hitPoint: new Vector3(),
			hasHit: false
		} ) );

		this.adjusted = new Set();
		this.poseCache = new Map();

		this.skeletonConfig = options.skeleton ?? null;
		this.footPhaseClips = new Map();
		this.hips = null;
		this.legs = this.createEmptyLegs();

	}

	/**
	 * Attaches to a player host and binds the current model skeleton.
	 *
	 * @param {Object} player - The player host object.
	 */
	onAttach( player ) {

		if ( this.disposed ) {

			throw new Error( '[FootIK] Cannot attach a disposed plugin.' );

		}

		if ( this.player && this.player !== player ) this.detachPlayer();
		this.attachPlayer( player );

	}

	/**
	 * Restores bone poses modified by IK before the animation update runs.
	 *
	 * @param {number} _delta - The delta time in seconds.
	 */
	onBeforeAnimationUpdate( _delta ) {

		if ( ! this.enabled || this.disposed ) return;
		this.restore();

	}

	/**
	 * Applies foot IK after the animation update for the current frame.
	 *
	 * @param {number} delta - The delta time in seconds.
	 */
	onAfterAnimationUpdate( delta ) {

		if ( ! this.enabled || this.disposed ) return;
		this.syncDistanceScale();
		this.update( delta );
		this.updateSoleSampleDebug();

	}

	getPlayerScale() {

		const scale = this.player?.playerModelConfig?.scale;
		return typeof scale === 'number' && scale > 0 ? scale : 1;

	}

	scaleDistance( value ) {

		return Math.max( 0, value ) * this.getPlayerScale();

	}

	toBaseDistance( world ) {

		return this.appliedScale > 0 ? world / this.appliedScale : world;

	}

	syncDistanceScale() {

		const scale = this.getPlayerScale();
		if ( scale === this.appliedScale ) return;
		this.rescaleDistances( scale );
		this.initSoleLocalSamples( this.legs.left );
		this.initSoleLocalSamples( this.legs.right );
		this.buildFootPhaseDatabase();

	}

	rescaleDistances( newScale ) {

		const next = newScale > 0 ? newScale : 1;
		const ratio = next / this.appliedScale;
		if ( ratio === 1 ) {

			this.appliedScale = next;
			return;

		}

		this.maxPelvisDrop *= ratio;
		this.soleHalfWidth *= ratio;
		this.soleToeExtend *= ratio;
		this.soleHeelExtend *= ratio;
		this.soleSkinThickness *= ratio;
		this.moveLiftThreshold *= ratio;
		this.maxMeshStepDrop *= ratio;
		this.maxMeshStepRaise *= ratio;
		this.meshStepCoplanarThreshold *= ratio;
		this.footPhaseGroundThreshold *= ratio;
		this.pelvisMaxRaise *= ratio;
		this.fakeToeExtend *= ratio;
		this.meshStepEpsilon *= ratio;
		this.sampleRayOriginY *= ratio;
		this.raycastFar *= ratio;
		this.snapEpsilon *= ratio;
		this.raycaster.far = this.raycastFar;
		this.footPhaseOptions.groundThreshold = this.footPhaseGroundThreshold;
		this.appliedScale = next;

	}

	/**
	 * Enables or disables foot IK. Restores modifications when disabled.
	 *
	 * @param {boolean} enabled - Whether foot IK is enabled.
	 */
	setEnabled( enabled ) {

		if ( this.disposed ) return;
		this.enabled = enabled;
		if ( ! enabled ) {

			this.restore();
			this.resetMeshStepOffsetImmediately();
			this.pelvisOffset = 0;
			this.setDebugVisible( false );
			this.setSoleSampleDebugVisible( false );

		} else if ( this.debug ) {

			this.setDebugEnabled( true );

		}

	}

	attachPlayer( player ) {

		if ( this.player === player && this.legs.left.ready ) return;
		this.player = player;
		this.syncDistanceScale();
		this.meshBaseY = player.playerModel?.position.y ?? 0;
		this.meshStepOffsetY = 0;
		this.pelvisOffset = 0;
		this.bindSkeleton();

	}

	detachPlayer() {

		this.restore();
		this.resetMeshStepOffsetImmediately();
		disposeDebugObjects( this.legs );
		this.footPhaseClips.clear();
		this.adjusted.clear();
		this.poseCache.clear();
		this.hips = null;
		this.legs = this.createEmptyLegs();
		this.rescaleDistances( 1 );
		this.player = null;
		this.meshStepOffsetY = 0;
		this.pelvisOffset = 0;

	}

	createEmptyLegs() {

		return {
			left: createLeg( 'left', [], 0x2dd4bf ),
			right: createLeg( 'right', [], 0xf97316 )
		};

	}

	bindSkeleton() {

		const bones = collectBones( this.player?.playerModel );
		this.hips = resolveConfiguredBone( this.skeletonConfig?.hips, bones, 'hips' )
			?? findHips( bones );
		this.legs = {
			left: createLeg( 'left', bones, 0x2dd4bf, this.skeletonConfig ),
			right: createLeg( 'right', bones, 0xf97316, this.skeletonConfig )
		};

		if ( ! this.hips || ! isReadyLeg( this.legs.left ) || ! isReadyLeg( this.legs.right ) ) {

			console.warn( '[FootIK] Incomplete skeleton binding. Bone names:', bones.map( b => b.name ) );

		}

		this.player?.playerModel?.updateMatrixWorld( true );
		this.meshBaseY = this.player?.playerModel?.position.y ?? this.meshBaseY;
		this.initSoleLocalSamples( this.legs.left );
		this.initSoleLocalSamples( this.legs.right );
		this.buildFootPhaseDatabase();
		this.createDebugObjects();
		this.createSoleSampleDebugObjects();

	}

	restore() {

		for ( const bone of this.adjusted ) {

			const pose = this.poseCache.get( bone );
			if ( ! pose ) continue;
			bone.position.copy( pose.position );
			bone.quaternion.copy( pose.quaternion );

		}

		this.adjusted.clear();

	}

	update( delta = 1 / 60 ) {

		if ( ! this.enabled || this.disposed ) return;
		this.updateFootPhaseRuntime();

		if (
			! this.player?.collider
			|| ! this.player.playerCapsule
			|| ! this.player.playerIsOnGround
		) {

			this.resetMeshStepOffset( delta );
			this.setDebugVisible( false );
			return;

		}

		const model = this.player.playerModel;
		model?.updateMatrixWorld( true );

		const moving = this.isLocomotion();

		this.applyMeshStepOffset( delta );
		model?.updateMatrixWorld( true );

		this.updateFoot( 'left', delta, moving );
		this.updateFoot( 'right', delta, moving );
		this.applyPelvis( delta );
		this.applyLeg( 'left', moving );
		this.applyLeg( 'right', moving );

	}

	buildFootPhaseDatabase() {

		const model = this.player?.playerModel;
		const clips = this.player?.animation?.clips ?? [];
		this.footPhaseClips = buildFootPhaseDatabase(
			model,
			clips,
			this.legs,
			this.footPhaseOptions,
			name => this.isLocomotionClipName( name )
		);

		if ( this.debug && this.footPhaseClips.size === 0 ) {

			console.warn( '[FootIK] No foot phase data generated; check locomotion clips and foot bones.' );

		}

	}

	updateFootPhaseRuntime() {

		const action = this.player?.animation?.state;
		if ( ! action ) {

			this.footPhaseState.clipName = '';
			return;

		}

		const clip = action.getClip();
		if ( clip.duration <= 0 ) return;

		const data = this.footPhaseClips.get( clip.name );
		this.footPhaseState.clipName = clip.name;
		this.footPhaseState.normalizedTime = ( ( action.time / clip.duration ) % 1 + 1 ) % 1;

		if ( ! data ) {

			this.footPhaseState.left = createFootPhaseRuntimeState();
			this.footPhaseState.right = createFootPhaseRuntimeState();
			return;

		}

		const runtime = sampleFootPhaseRuntime( data, this.footPhaseState.normalizedTime, clip.duration );
		this.footPhaseState.left = runtime.left;
		this.footPhaseState.right = runtime.right;

	}

	updateFoot( side, delta, moving ) {

		const leg = this.legs[ side ];
		if ( ! isReadyLeg( leg ) ) return;

		const footWorld = leg.foot.getWorldPosition( this.tmpV1 );
		const phase = this.footPhaseState?.[ side ];
		const phasePlanted = moving && !! phase?.planted;
		leg.planted = ! moving || phasePlanted;
		const hit = this.castBestFootGround( leg, footWorld );

		if ( ! hit ) {

			leg.plantedWeight = 0;
			leg.movePenetrating = false;
			leg.weight = 0;
			leg.offsetY = 0;
			return;

		}

		this.getWorldHitNormal( hit, leg.hitNormal );
		leg.hitPoint.copy( hit.point );

		if ( this.hasFootHitAboveCapsuleBottom( leg ) ) {

			leg.weight = 0;
			leg.plantedWeight = 0;
			leg.offsetY = 0;
			leg.movePenetrating = false;
			leg.smoothedTarget.copy( footWorld );
			this.updateFootDebug( leg, leg.footSamplePoint, hit.point );
			return;

		}

		const liftAmount = this.getMovePenetrationLift( leg );
		const liftTargetY = footWorld.y + liftAmount;
		const targetY = liftTargetY;

		const target = this.tmpV2.copy( footWorld );
		target.y = targetY;

		leg.movePenetrating = liftAmount > this.moveLiftThreshold;

		const wantedPlantedWeight = leg.planted ? 1 : 0;
		leg.plantedWeight = MathUtils.damp( leg.plantedWeight ?? 0, wantedPlantedWeight, 10, delta );

		if ( leg.movePenetrating ) {

			leg.weight = 1;

		} else if ( leg.plantedWeight > 0.001 ) {

			leg.weight = leg.plantedWeight;

		} else {

			leg.weight = 0;

		}

		leg.offsetY = ( leg.planted || leg.movePenetrating ) ? ( targetY - footWorld.y ) * leg.weight : 0;
		leg.smoothedTarget.copy( ( leg.planted || leg.movePenetrating ) ? target : footWorld );

		this.updateFootDebug( leg, leg.footSamplePoint, hit.point );

	}

	castBestFootGround( leg, footWorld, samples = leg.soleSamples, footSamplePoint = leg.footSamplePoint ) {

		this.updateSoleSamples( leg, footWorld, samples, footSamplePoint );

		let bestHit = null;
		for ( const sample of samples ) {

			sample.hasHit = false;
			const hit = this.castGroundAtSample( sample.point );
			if ( ! hit ) continue;
			sample.hasHit = true;
			sample.hitPoint.copy( hit.point );
			if ( ! bestHit || hit.point.y > bestHit.point.y ) {

				bestHit = hit;
				footSamplePoint?.copy( sample.point );

			}

		}

		return bestHit;

	}

	initSoleLocalSamples( leg ) {

		if ( ! isReadyLeg( leg ) ) return;

		const footWorld = leg.foot.getWorldPosition( this.tmpV1 );
		const toeWorld = leg.toe
			? leg.toe.getWorldPosition( this.tmpV2 )
			: this.tmpV2.copy( footWorld ).add( this.tmpV3.set( 0, 0, 1 ).applyQuaternion( leg.foot.getWorldQuaternion( this.tmpQ1 ) ).setY( 0 ).normalize().multiplyScalar( this.fakeToeExtend ) );

		const forward = this.tmpV3.copy( toeWorld ).sub( footWorld ).setY( 0 );
		if ( forward.lengthSq() < 0.0001 ) {

			forward.set( 0, 0, 1 ).applyQuaternion( leg.foot.getWorldQuaternion( this.tmpQ1 ) ).setY( 0 );

		}

		forward.normalize();

		const side = this.tmpV4.crossVectors( forward, this.up ).normalize();
		const heelCenter = this.tmpV5.copy( footWorld ).addScaledVector( forward, - this.soleHeelExtend );
		const toeCenter = this.tmpV2.copy( toeWorld ).addScaledVector( forward, this.soleToeExtend );

		heelCenter.y = toeCenter.y;

		leg.foot.updateMatrixWorld( true );
		const samples = leg.soleSamples;
		samples[ 0 ].point.copy( heelCenter ).addScaledVector( side, this.soleHalfWidth );
		samples[ 1 ].point.copy( heelCenter ).addScaledVector( side, - this.soleHalfWidth );
		samples[ 2 ].point.copy( toeCenter ).addScaledVector( side, this.soleHalfWidth );
		samples[ 3 ].point.copy( toeCenter ).addScaledVector( side, - this.soleHalfWidth );

		for ( const sample of samples ) {

			sample.local.copy( sample.point );
			leg.foot.worldToLocal( sample.local );

		}

		leg.footSamplePoint.copy( heelCenter );

	}

	updateSoleSamples( leg, _footWorld, samples = leg.soleSamples, footSamplePoint = leg.footSamplePoint ) {

		if ( ! isReadyLeg( leg ) ) return;

		leg.foot.updateMatrixWorld( true );
		const sourceSamples = leg.soleSamples;
		const count = Math.min( samples.length, sourceSamples.length );
		for ( let i = 0; i < count; i ++ ) {

			samples[ i ].point.copy( sourceSamples[ i ].local ).applyMatrix4( leg.foot.matrixWorld );

		}

		if ( footSamplePoint && samples.length >= 2 ) {

			footSamplePoint.copy( samples[ 0 ].point ).add( samples[ 1 ].point ).multiplyScalar( 0.5 );

		}

	}

	getMovePenetrationLift( leg ) {

		let lift = 0;
		for ( const sample of leg.soleSamples ) {

			if ( ! sample.hasHit ) continue;

			const penetration = sample.hitPoint.y - sample.point.y;
			if ( penetration > this.moveLiftThreshold ) {

				lift = Math.max( lift, penetration );

			}

		}

		return lift;

	}

	getCapsuleSupportY() {

		const capsule = this.player?.playerCapsule;
		const info = capsule?.capsuleInfo;
		if ( ! capsule || ! info?.segment ) return NaN;

		capsule.updateMatrixWorld();
		const start = this.tmpV2.copy( info.segment.start ).applyMatrix4( capsule.matrixWorld );
		const end = this.tmpV3.copy( info.segment.end ).applyMatrix4( capsule.matrixWorld );
		return Math.min( start.y, end.y );

	}

	hasFootHitAboveCapsuleBottom( leg ) {

		const capsuleSupportY = this.getCapsuleSupportY();
		if ( ! Number.isFinite( capsuleSupportY ) ) return false;

		for ( const sample of leg.soleSamples ) {

			if ( sample.hasHit && sample.hitPoint.y > capsuleSupportY ) return true;

		}

		return false;

	}

	applyMeshStepOffset( delta ) {

		const model = this.player?.playerModel;
		const capsule = this.player?.playerCapsule;
		if ( ! model || ! capsule ) return;

		const capsuleHit = this.castCapsuleGround();
		if ( ! capsuleHit ) {

			this.resetMeshStepOffset( delta );
			return;

		}

		let leftGroundY = NaN;
		let rightGroundY = NaN;
		for ( const side of [ 'left', 'right' ] ) {

			const leg = this.legs[ side ];
			if ( ! isReadyLeg( leg ) ) continue;

			const footWorld = leg.foot.getWorldPosition( this.tmpV1 );
			const footHit = this.castBestFootGround(
				leg,
				footWorld,
				this.meshStepProbeSamples,
				null
			);
			if ( ! footHit ) continue;
			if ( side === 'left' ) leftGroundY = footHit.point.y;
			else rightGroundY = footHit.point.y;

		}

		if ( ! Number.isFinite( leftGroundY ) || ! Number.isFinite( rightGroundY ) ) {

			return;

		}

		const capsuleGroundY = capsuleHit.point.y;
		const supportY = Math.min( leftGroundY, rightGroundY );
		const planeDelta = Math.abs( leftGroundY - rightGroundY );
		const heightDelta = supportY - capsuleGroundY;

		let wantedOffset = 0;
		if (
			planeDelta <= this.meshStepCoplanarThreshold
			&& heightDelta > this.meshStepEpsilon
		) {

			wantedOffset = MathUtils.clamp( heightDelta, 0, this.maxMeshStepRaise );

		} else if ( heightDelta < - this.meshStepEpsilon ) {

			wantedOffset = MathUtils.clamp( heightDelta, - this.maxMeshStepDrop, 0 );

		}

		this.setMeshStepOffset( wantedOffset, delta );

	}

	setMeshStepOffset( wantedOffset, delta ) {

		const model = this.player?.playerModel;
		if ( ! model ) return;

		const speed = 10;

		this.meshStepOffsetY = MathUtils.damp( this.meshStepOffsetY, wantedOffset, speed, delta );
		if ( Math.abs( this.meshStepOffsetY ) < this.snapEpsilon ) this.meshStepOffsetY = 0;

		model.position.y = this.meshBaseY + this.meshStepOffsetY;
		model.updateMatrixWorld( true );

	}

	resetMeshStepOffset( delta ) {

		this.setMeshStepOffset( 0, delta );

	}

	resetMeshStepOffsetImmediately() {

		const model = this.player?.playerModel;
		this.meshStepOffsetY = 0;
		if ( ! model ) return;
		model.position.y = this.meshBaseY;
		model.updateMatrixWorld( true );

	}

	isLocomotion() {

		const name = this.player?.animation.state?.getClip().name ?? '';
		return this.isLocomotionClipName( name );

	}

	isLocomotionClipName( name ) {

		if ( ! name ) return false;
		const config = this.player?.playerModelConfig;
		if ( ! config ) return false;
		return [
			config.walkAnim,
			config.runAnim
		].filter( value => !! value ).includes( name );

	}

	castGroundAtSample( sampleWorld ) {

		return this.castGroundFrom( sampleWorld.x, sampleWorld.y + this.sampleRayOriginY, sampleWorld.z );

	}

	castCapsuleGround() {

		const capsule = this.player?.playerCapsule;
		if ( ! capsule ) return null;
		return this.castGroundFrom( capsule.position.x, capsule.position.y, capsule.position.z );

	}

	castGroundFrom( x, y, z ) {

		const collider = this.player?.collider;
		if ( ! collider ) return null;
		this.raycaster.ray.origin.set( x, y, z );
		const hits = this.raycaster.intersectObject( collider, false );
		return hits.find( hit => this.getWorldHitNormal( hit, this.tmpV3 ).y > 0.18 ) ?? null;

	}

	getWorldHitNormal( hit, target ) {

		target.copy( hit.face?.normal ?? this.up );
		this.normalMatrix.getNormalMatrix( hit.object.matrixWorld );
		target.applyMatrix3( this.normalMatrix ).normalize();
		return target;

	}

	applyPelvis( delta ) {

		if ( ! this.hips ) return;

		const left = this.legs.left.offsetY;
		const right = this.legs.right.offsetY;
		const leftW = this.legs.left.weight;
		const rightW = this.legs.right.weight;
		const wantedWorldOffset = MathUtils.clamp(
			Math.min( left * leftW, right * rightW ),
			- this.maxPelvisDrop,
			this.pelvisMaxRaise
		);

		this.pelvisOffset = MathUtils.damp( this.pelvisOffset, wantedWorldOffset, 12, delta );
		if ( Math.abs( this.pelvisOffset ) < this.snapEpsilon ) return;

		this.capture( this.hips );
		const parentScale = this.hips.parent?.getWorldScale( this.tmpV1 ).y || 1;
		this.hips.position.y += this.pelvisOffset / parentScale;
		this.hips.updateMatrixWorld( true );

	}

	applyLeg( side, useStraightPole ) {

		const leg = this.legs[ side ];
		if ( ! isReadyLeg( leg ) || leg.weight <= 0.001 ) return;

		this.savedFootWorldQ.copy( leg.foot.getWorldQuaternion( this.tmpQ1 ) );

		this.solveLeg( leg, leg.smoothedTarget, leg.weight, useStraightPole );
		this.preserveFootWorldRotation( leg, this.savedFootWorldQ, leg.weight );
		this.alignFootToGround( leg );
		this.correctPostAlignSoleContact( leg, useStraightPole );

	}

	preserveFootWorldRotation( leg, animatedWorldQ, weight ) {

		this.capture( leg.foot );

		const currentWorldQ = leg.foot.getWorldQuaternion( this.tmpQ1 );
		currentWorldQ.slerp( animatedWorldQ, MathUtils.clamp( weight, 0, 1 ) );

		const parentWorldQ = leg.foot.parent?.getWorldQuaternion( this.tmpQ2 );
		if ( ! parentWorldQ ) return;
		leg.foot.quaternion.copy( parentWorldQ.invert().multiply( currentWorldQ ) );
		leg.foot.updateMatrixWorld( true );

	}

	solveLeg( leg, target, weight, useStraightPole = false ) {

		let kneePlaneNormal;
		if ( useStraightPole ) {

			const capsule = this.player?.playerCapsule;
			if ( ! capsule ) return;
			kneePlaneNormal = this.tmpV4
				.set( 1, 0, 0 )
				.applyQuaternion( capsule.getWorldQuaternion( this.tmpQ3 ) )
				.normalize();

		}

		solveTwoBoneIK( leg, target, weight, {
			capture: bone => this.capture( bone ),
			minKneeBend: this.minKneeBend,
			maxKneeBend: this.maxKneeBend,
			kneePlaneNormal,
			scratch: this.twoBoneIKScratch
		} );

	}

	correctPostAlignSoleContact( leg, useStraightPole ) {

		if ( leg.weight <= 0.001 ) return;

		const footWorld = leg.foot.getWorldPosition( this.tmpV1 );
		this.updateSoleSamples( leg, footWorld );

		let contactOffset = - Infinity;
		let anyHit = false;
		for ( const sample of leg.soleSamples ) {

			sample.hasHit = false;
			const hit = this.castGroundAtSample( sample.point );
			if ( ! hit ) continue;

			sample.hasHit = true;
			sample.hitPoint.copy( hit.point );
			anyHit = true;
			const offset = hit.point.y - sample.point.y;
			contactOffset = Math.max( contactOffset, offset );

		}

		if ( ! anyHit ) return;

		const slopeContactWeight = MathUtils.clamp( leg.hitNormal.y, 0, 1 );
		contactOffset += this.soleSkinThickness * slopeContactWeight;
		if ( Math.abs( contactOffset ) <= this.snapEpsilon ) return;

		this.savedAlignedFootWorldQ.copy( leg.foot.getWorldQuaternion( this.tmpQ1 ) );
		const correctedTarget = this.tmpV2.copy( footWorld ).addScaledVector( this.up, contactOffset );

		this.solveLeg( leg, correctedTarget, leg.weight, useStraightPole );
		this.preserveFootWorldRotation( leg, this.savedAlignedFootWorldQ, 1 );

	}

	alignFootToGround( leg ) {

		if ( leg.hitNormal.y < 0.35 || leg.weight <= 0.001 ) return;
		this.capture( leg.foot );

		const footWorldQ = leg.foot.getWorldQuaternion( this.tmpQ1 );
		const alignQ = this.tmpQ2.setFromUnitVectors( this.up, leg.hitNormal );

		const maxTilt = this.maxFootTilt;
		const realAngle = 2 * Math.acos( MathUtils.clamp( alignQ.w, - 1, 1 ) );
		if ( realAngle > maxTilt ) {

			alignQ.slerp( this.identityQ, 1 - maxTilt / realAngle );

		}

		alignQ.slerp( this.identityQ, 1 - leg.weight * this.footAlignWeight );

		const targetWorldQ = alignQ.multiply( footWorldQ );
		const parentWorldQ = leg.foot.parent?.getWorldQuaternion( this.tmpQ3 );
		if ( ! parentWorldQ ) return;
		leg.foot.quaternion.copy( parentWorldQ.invert().multiply( targetWorldQ ) );
		leg.foot.updateMatrixWorld( true );

	}

	capture( bone ) {

		if ( this.adjusted.has( bone ) ) return;
		let pose = this.poseCache.get( bone );
		if ( ! pose ) {

			pose = {
				position: new Vector3(),
				quaternion: new Quaternion()
			};
			this.poseCache.set( bone, pose );

		}

		pose.position.copy( bone.position );
		pose.quaternion.copy( bone.quaternion );
		this.adjusted.add( bone );

	}

	createDebugObjects() {

		createDebugObjects( this.player?.scene ?? null, this.legs, this.debug );

	}

	updateFootDebug( leg, footWorld, hitPoint ) {

		updateFootDebug( this.debug, leg, footWorld, hitPoint );

	}

	setDebugVisible( visible ) {

		setDebugVisible( this.legs, visible );

	}

	createSoleSampleDebugObjects() {

		createSoleSampleDebugObjects( this.player?.scene ?? null, this.legs, this.soleSampleDebug );

	}

	updateSoleSampleDebug() {

		updateSoleSampleDebugObjects(
			this.soleSampleDebug,
			this.player?.scene ?? null,
			this.legs,
			( leg, footWorld, samples, footSamplePoint ) => {

				this.updateSoleSamples( leg, footWorld, samples, footSamplePoint );

			},
			this.tmpV1
		);

	}

	setSoleSampleDebugVisible( visible ) {

		setSoleSampleDebugVisible( this.legs, visible );

	}

	/**
	 * Toggles foot IK target and ray debug visualization.
	 *
	 * @param {boolean} enabled - Whether debug visualization is enabled.
	 */
	setDebugEnabled( enabled ) {

		if ( this.disposed ) return;
		this.debug = enabled;
		if ( enabled ) {

			this.createDebugObjects();

		}

		this.setDebugVisible( enabled );

	}

	/**
	 * Toggles foot-local sole sample point debug visualization.
	 *
	 * @param {boolean} enabled - Whether sole sample debug visualization is enabled.
	 */
	setSoleSampleDebugEnabled( enabled ) {

		if ( this.disposed ) return;
		this.soleSampleDebug = enabled;
		if ( enabled ) {

			this.createSoleSampleDebugObjects();

		}

		this.setSoleSampleDebugVisible( enabled );

	}

	/**
	 * Returns the current tunable options (excluding skeleton).
	 * Distance values are expressed in scale=`1` base units.
	 *
	 * @return {Object} The current options.
	 */
	getOptions() {

		return {
			enabled: this.enabled,
			debug: this.debug,
			soleSampleDebug: this.soleSampleDebug,
			maxPelvisDrop: this.toBaseDistance( this.maxPelvisDrop ),
			soleHalfWidth: this.toBaseDistance( this.soleHalfWidth ),
			soleToeExtend: this.toBaseDistance( this.soleToeExtend ),
			soleHeelExtend: this.toBaseDistance( this.soleHeelExtend ),
			soleSkinThickness: this.toBaseDistance( this.soleSkinThickness ),
			footAlignWeight: this.footAlignWeight,
			maxFootTilt: this.maxFootTilt,
			minKneeBend: this.minKneeBend,
			maxKneeBend: this.maxKneeBend,
			moveLiftThreshold: this.toBaseDistance( this.moveLiftThreshold ),
			maxMeshStepDrop: this.toBaseDistance( this.maxMeshStepDrop ),
			maxMeshStepRaise: this.toBaseDistance( this.maxMeshStepRaise ),
			meshStepCoplanarThreshold: this.toBaseDistance( this.meshStepCoplanarThreshold ),
			footPhaseSampleCount: this.footPhaseOptions.sampleCount,
			footPhaseGroundThreshold: this.toBaseDistance( this.footPhaseGroundThreshold ),
			footPhaseMinContactRatio: this.footPhaseOptions.minContactRatio,
			footPhaseSpeedSlack: this.footPhaseOptions.speedSlack
		};

	}

	/**
	 * Updates options at runtime.
	 * Distance values are scale=`1` base units multiplied by the player scale.
	 *
	 * @param {Object} options - The options to apply.
	 */
	configure( options ) {

		if ( this.disposed ) return;

		if ( options.enabled !== undefined ) this.setEnabled( options.enabled );
		if ( options.debug !== undefined ) this.setDebugEnabled( options.debug );
		if ( options.soleSampleDebug !== undefined ) this.setSoleSampleDebugEnabled( options.soleSampleDebug );

		let soleDirty = false;
		let phaseDirty = false;

		if ( options.maxPelvisDrop !== undefined ) {

			this.maxPelvisDrop = this.scaleDistance( options.maxPelvisDrop );

		}

		if ( options.soleHalfWidth !== undefined ) {

			this.soleHalfWidth = this.scaleDistance( options.soleHalfWidth );
			soleDirty = true;

		}

		if ( options.soleToeExtend !== undefined ) {

			this.soleToeExtend = this.scaleDistance( options.soleToeExtend );
			soleDirty = true;

		}

		if ( options.soleHeelExtend !== undefined ) {

			this.soleHeelExtend = this.scaleDistance( options.soleHeelExtend );
			soleDirty = true;

		}

		if ( options.soleSkinThickness !== undefined ) {

			this.soleSkinThickness = this.scaleDistance( options.soleSkinThickness );

		}

		if ( options.footAlignWeight !== undefined ) {

			this.footAlignWeight = MathUtils.clamp( options.footAlignWeight, 0, 1 );

		}

		if ( options.maxFootTilt !== undefined ) {

			this.maxFootTilt = MathUtils.clamp( options.maxFootTilt, 0, Math.PI );

		}

		if ( options.minKneeBend !== undefined || options.maxKneeBend !== undefined ) {

			const minBend = MathUtils.clamp( options.minKneeBend ?? this.minKneeBend, 0, Math.PI );
			const maxBend = MathUtils.clamp( options.maxKneeBend ?? this.maxKneeBend, 0, Math.PI );
			this.minKneeBend = Math.min( minBend, maxBend );
			this.maxKneeBend = Math.max( minBend, maxBend );

		}

		if ( options.moveLiftThreshold !== undefined ) {

			this.moveLiftThreshold = this.scaleDistance( options.moveLiftThreshold );

		}

		if ( options.maxMeshStepDrop !== undefined ) {

			this.maxMeshStepDrop = this.scaleDistance( options.maxMeshStepDrop );

		}

		if ( options.maxMeshStepRaise !== undefined ) {

			this.maxMeshStepRaise = this.scaleDistance( options.maxMeshStepRaise );

		}

		if ( options.meshStepCoplanarThreshold !== undefined ) {

			this.meshStepCoplanarThreshold = this.scaleDistance( options.meshStepCoplanarThreshold );

		}

		if ( options.footPhaseGroundThreshold !== undefined ) {

			this.footPhaseGroundThreshold = this.scaleDistance( options.footPhaseGroundThreshold );
			this.footPhaseOptions.groundThreshold = this.footPhaseGroundThreshold;
			phaseDirty = true;

		}

		if (
			options.footPhaseSampleCount !== undefined
			|| options.footPhaseMinContactRatio !== undefined
			|| options.footPhaseSpeedSlack !== undefined
		) {

			this.footPhaseOptions = createFootPhaseOptions( {
				footPhaseSampleCount: options.footPhaseSampleCount ?? this.footPhaseOptions.sampleCount,
				footPhaseGroundThreshold: this.footPhaseGroundThreshold,
				footPhaseMinContactRatio: options.footPhaseMinContactRatio ?? this.footPhaseOptions.minContactRatio,
				footPhaseSpeedSlack: options.footPhaseSpeedSlack ?? this.footPhaseOptions.speedSlack
			} );
			phaseDirty = true;

		}

		if ( soleDirty ) {

			this.initSoleLocalSamples( this.legs.left );
			this.initSoleLocalSamples( this.legs.right );

		}

		if ( phaseDirty ) {

			this.buildFootPhaseDatabase();

		}

	}

}

export { FootIK };
