import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';

const CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE = 0;
const CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE = 1;
const CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE = 2;
const CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE = 3;
const CLIPPING_PLANE_VOLUME_END = 4;

function getPlaneVolumeState( volumeMode, isGlobalVolume, isVolumeEnd ) {

	let state = isGlobalVolume
		? ( volumeMode === 0 ? CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE : CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE )
		: ( volumeMode === 0 ? CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE : CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE );

	if ( isVolumeEnd ) state += CLIPPING_PLANE_VOLUME_END;

	return state;

}

function countActiveVolumes( volumes ) {

	let volumeCount = 0;
	let includeVolumeCount = 0;
	let planeCount = 0;

	for ( let i = 0, l = volumes.length; i < l; i ++ ) {

		const clippingVolume = volumes[ i ];
		const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];

		if ( volumePlanes.length === 0 ) continue;

		const volumeMode = clippingVolume.mode === 'exclude' ? 1 : 0;

		volumeCount ++;
		if ( volumeMode === 0 ) includeVolumeCount ++;
		planeCount += volumePlanes.length;

	}

	return { volumeCount, includeVolumeCount, planeCount };

}

function WebGLClipping( properties ) {

	const scope = this;

	let globalState = null,
		globalPlaneVolumeState = null,
		globalPlaneCount = 0,
		globalVolumeCount = 0,
		globalIncludeVolumeCount = 0,
		localClippingEnabled = false,
		renderingShadows = false;

	const plane = new Plane(),
		viewNormalMatrix = new Matrix3(),

		uniform = { value: null, needsUpdate: false },
		planeVolumeStateUniform = { value: null, needsUpdate: false },
		numGlobalIncludeVolumesUniform = { value: 0, needsUpdate: false },
		numLocalIncludeVolumesUniform = { value: 0, needsUpdate: false };

	const globalClippingPlaneVolume = { planes: null, mode: 'include' },
		globalClippingPlaneVolumes = [ globalClippingPlaneVolume ];

	const combinedGlobalClippingVolumes = [];

	this.uniform = uniform;
	this.planeVolumeStateUniform = planeVolumeStateUniform;
	this.numGlobalIncludeVolumesUniform = numGlobalIncludeVolumesUniform;
	this.numLocalIncludeVolumesUniform = numLocalIncludeVolumesUniform;

	this.numPlanes = 0;
	this.numIntersection = 0;
	this.numVolumes = 0;
	this.useClippingVolumes = false;

	this.init = function ( planes, clippingVolumes, enableLocalClipping ) {

		const globalVolumes = getGlobalClippingVolumes( planes, clippingVolumes );

		const enabled =
			globalVolumes.length !== 0 ||
			enableLocalClipping ||
			// enable state of previous frame - the clipping code has to
			// run another frame in order to reset the state:
			globalVolumeCount !== 0 ||
			localClippingEnabled;

		localClippingEnabled = enableLocalClipping;

		return enabled;

	};

	this.beginShadows = function () {

		renderingShadows = true;
		resetShadowState();

	};

	this.endShadows = function () {

		renderingShadows = false;

	};

	this.setGlobalState = function ( planes, clippingVolumes, camera ) {

		const globalVolumes = getGlobalClippingVolumes( planes, clippingVolumes );

		setGlobalVolumeState( globalVolumes, camera );

	};

	this.setState = function ( material, camera, useCache ) {

		const planes = material.clippingPlanes,
			clippingVolumes = material.clippingVolumes,
			clipIntersection = material.clipIntersection,
			clipShadows = material.clipShadows;

		const materialProperties = properties.get( material );

		if ( ! localClippingEnabled || renderingShadows && ! clipShadows ) {

			// there's no local clipping

			if ( renderingShadows ) {

				// there's no global clipping in shadow rendering

				resetShadowState();

			} else {

				applyGlobalState();

			}

		} else {

			const hasClippingPlanes = planes !== null && planes.length > 0;
			const hasClippingVolumes = clippingVolumes !== undefined;

			if ( ! hasClippingPlanes && ! hasClippingVolumes ) {

				if ( renderingShadows ) {

					resetShadowState();

				} else {

					applyGlobalState();

				}

			} else {

				setVolumeState(
					getLocalClippingVolumes( planes, clipIntersection, clippingVolumes, materialProperties ),
					camera,
					useCache,
					materialProperties,
					renderingShadows === false
				);

			}

		}

	};

	function projectPlanes( volumes, camera, dstArray, planeVolumeStateArray, dstOffset, stateOffset, isGlobalVolume ) {

		const viewMatrix = camera.matrixWorldInverse;

		viewNormalMatrix.getNormalMatrix( viewMatrix );

		for ( let i = 0, i4 = dstOffset, stateIndex = stateOffset, l = volumes.length; i < l; i ++ ) {

			const clippingVolume = volumes[ i ];
			const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];

			if ( volumePlanes.length === 0 ) continue;

			const volumeMode = clippingVolume.mode === 'exclude' ? 1 : 0;
			const midVolumeState = getPlaneVolumeState( volumeMode, isGlobalVolume, false );
			const endVolumeState = getPlaneVolumeState( volumeMode, isGlobalVolume, true );

			for ( let j = 0, jl = volumePlanes.length; j < jl; j ++, i4 += 4, stateIndex ++ ) {

				plane.copy( volumePlanes[ j ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

				plane.normal.toArray( dstArray, i4 );
				dstArray[ i4 + 3 ] = plane.constant;
				planeVolumeStateArray[ stateIndex ] = ( j === jl - 1 ) ? endVolumeState : midVolumeState;

			}

		}

	}

	function resetGlobalVolumeState() {

		globalState = null;
		globalPlaneVolumeState = null;
		globalPlaneCount = 0;
		globalVolumeCount = 0;
		globalIncludeVolumeCount = 0;

	}

	function getGlobalClippingVolumes( planes, clippingVolumes ) {

		const hasClippingPlanes = planes.length > 0;
		const rendererClippingVolumes = Array.isArray( clippingVolumes ) ? clippingVolumes : [];

		if ( hasClippingPlanes === false && rendererClippingVolumes.length === 0 ) {

			return [];

		}

		if ( rendererClippingVolumes.length === 0 ) {

			globalClippingPlaneVolume.planes = planes;

			return globalClippingPlaneVolumes;

		}

		if ( hasClippingPlanes === false ) {

			return rendererClippingVolumes;

		}

		combinedGlobalClippingVolumes.length = 0;
		globalClippingPlaneVolume.planes = planes;
		combinedGlobalClippingVolumes.push( globalClippingPlaneVolume );

		for ( let i = 0, l = rendererClippingVolumes.length; i < l; i ++ ) {

			combinedGlobalClippingVolumes.push( rendererClippingVolumes[ i ] );

		}

		return combinedGlobalClippingVolumes;

	}

	function getLocalClippingVolumes( planes, clipIntersection, clippingVolumes, materialProperties ) {

		const hasClippingPlanes = planes !== null && planes.length > 0;
		const hasClippingVolumes = clippingVolumes !== undefined;

		if ( ! hasClippingVolumes ) {

			return getClippingPlaneVolumes( planes, clipIntersection, materialProperties );

		}

		const materialClippingVolumes = Array.isArray( clippingVolumes ) ? clippingVolumes : [];

		if ( ! hasClippingPlanes ) {

			return materialClippingVolumes;

		}

		const clippingPlaneVolume = getClippingPlaneVolumes( planes, clipIntersection, materialProperties )[ 0 ];

		let combinedClippingVolumes = materialProperties.combinedClippingVolumes;

		if ( combinedClippingVolumes === undefined ) {

			combinedClippingVolumes = [];
			materialProperties.combinedClippingVolumes = combinedClippingVolumes;

		}

		combinedClippingVolumes.length = 0;
		combinedClippingVolumes.push( clippingPlaneVolume );

		for ( let i = 0, l = materialClippingVolumes.length; i < l; i ++ ) {

			combinedClippingVolumes.push( materialClippingVolumes[ i ] );

		}

		return combinedClippingVolumes;

	}

	function getClippingPlaneVolumes( planes, clipIntersection, materialProperties ) {

		let volumes = materialProperties.clippingPlaneVolumes;

		if ( volumes === undefined ) {

			volumes = [ { planes: planes, mode: 'include' } ];
			materialProperties.clippingPlaneVolumes = volumes;

		}

		const volume = volumes[ 0 ];

		if ( clipIntersection ) {

			const nPlanes = planes.length;

			let invertedPlanes = materialProperties.clippingPlaneIntersectionPlanes;

			if ( invertedPlanes === undefined || invertedPlanes.length !== nPlanes ) {

				invertedPlanes = new Array( nPlanes );

				for ( let i = 0; i < nPlanes; i ++ ) {

					invertedPlanes[ i ] = new Plane();

				}

				materialProperties.clippingPlaneIntersectionPlanes = invertedPlanes;

			}

			for ( let i = 0; i < nPlanes; i ++ ) {

				invertedPlanes[ i ].copy( planes[ i ] ).negate();

			}

			volume.mode = 'exclude';
			volume.planes = invertedPlanes;

		} else {

			volume.mode = 'include';
			volume.planes = planes;

		}

		return volumes;

	}

	function setGlobalVolumeState( volumes, camera ) {

		const nSourceVolumes = volumes.length;

		if ( nSourceVolumes === 0 ) {

			resetGlobalVolumeState();

			applyGlobalState();

			return;

		}

		let planeVolumeStateArray = globalPlaneVolumeState;
		const { volumeCount: nVolumes, includeVolumeCount: nIncludeVolumes, planeCount } = countActiveVolumes( volumes );

		if ( nVolumes === 0 ) {

			resetGlobalVolumeState();

			applyGlobalState();

			return;

		}

		let dstArray = globalState;
		const flatSize = planeCount * 4;

		if ( dstArray === null || dstArray.length !== flatSize ) {

			dstArray = new Float32Array( flatSize );

		}

		if ( planeVolumeStateArray === null || planeVolumeStateArray.length !== planeCount ) {

			planeVolumeStateArray = new Int32Array( planeCount );

		}

		projectPlanes( volumes, camera, dstArray, planeVolumeStateArray, 0, 0, true );

		globalState = dstArray;
		globalPlaneVolumeState = planeVolumeStateArray;
		globalPlaneCount = planeCount;
		globalVolumeCount = nVolumes;
		globalIncludeVolumeCount = nIncludeVolumes;

		applyGlobalState();

	}

	function setVolumeState( volumes, camera, useCache, materialProperties, useGlobalState ) {

		const nGlobalPlanes = useGlobalState ? globalPlaneCount : 0;
		const nGlobalVolumes = useGlobalState ? globalVolumeCount : 0;
		const nGlobalIncludeVolumes = useGlobalState ? globalIncludeVolumeCount : 0;

		const clippingGlobalPlaneCount = materialProperties.clippingGlobalPlaneCount;
		const clippingGlobalVolumeCount = materialProperties.clippingGlobalVolumeCount;
		const clippingGlobalIncludeVolumeCount = materialProperties.clippingGlobalIncludeVolumeCount;

		const globalStateChanged =
			clippingGlobalPlaneCount !== nGlobalPlanes ||
			clippingGlobalVolumeCount !== nGlobalVolumes ||
			clippingGlobalIncludeVolumeCount !== nGlobalIncludeVolumes;

		let dstArray = materialProperties.clippingState || null;
		let planeVolumeStateArray = materialProperties.clippingPlaneVolumeState || null;
		let nLocalVolumes = materialProperties.clippingLocalVolumeCount || 0;
		let nLocalIncludeVolumes = materialProperties.clippingLocalIncludeVolumeCount || 0;
		let nLocalPlanes = materialProperties.clippingLocalPlaneCount || 0;

		uniform.value = dstArray; // ensure unique state
		planeVolumeStateUniform.value = planeVolumeStateArray;

		if ( useCache !== true || globalStateChanged || dstArray === null || planeVolumeStateArray === null ) {

			const counts = countActiveVolumes( volumes );
			nLocalVolumes = counts.volumeCount;
			nLocalIncludeVolumes = counts.includeVolumeCount;
			nLocalPlanes = counts.planeCount;

			const planeCount = nGlobalPlanes + nLocalPlanes;
			const flatSize = planeCount * 4;

			if ( dstArray === null || dstArray.length !== flatSize ) {

				dstArray = new Float32Array( flatSize );

			}

			if ( planeVolumeStateArray === null || planeVolumeStateArray.length !== planeCount ) {

				planeVolumeStateArray = new Int32Array( planeCount );

			}

			if ( nGlobalPlanes !== 0 ) {

				for ( let i = 0, l = nGlobalPlanes * 4; i < l; i ++ ) {

					dstArray[ i ] = globalState[ i ];

				}

				for ( let i = 0; i < nGlobalPlanes; i ++ ) {

					planeVolumeStateArray[ i ] = globalPlaneVolumeState[ i ];

				}

			}

			projectPlanes( volumes, camera, dstArray, planeVolumeStateArray, nGlobalPlanes * 4, nGlobalPlanes, false );

			uniform.needsUpdate = true;
			planeVolumeStateUniform.needsUpdate = true;
			numGlobalIncludeVolumesUniform.needsUpdate = true;
			numLocalIncludeVolumesUniform.needsUpdate = true;

			materialProperties.clippingState = dstArray;
			materialProperties.clippingPlaneVolumeState = planeVolumeStateArray;
			materialProperties.clippingLocalVolumeCount = nLocalVolumes;
			materialProperties.clippingLocalIncludeVolumeCount = nLocalIncludeVolumes;
			materialProperties.clippingLocalPlaneCount = nLocalPlanes;
			materialProperties.clippingGlobalPlaneCount = nGlobalPlanes;
			materialProperties.clippingGlobalVolumeCount = nGlobalVolumes;
			materialProperties.clippingGlobalIncludeVolumeCount = nGlobalIncludeVolumes;

		}

		uniform.value = dstArray;
		planeVolumeStateUniform.value = planeVolumeStateArray;
		numGlobalIncludeVolumesUniform.value = nGlobalIncludeVolumes;
		numLocalIncludeVolumesUniform.value = nLocalIncludeVolumes;

		scope.numPlanes = nGlobalPlanes + nLocalPlanes;
		scope.numIntersection = 0;
		scope.numVolumes = nGlobalVolumes + nLocalVolumes;
		scope.useClippingVolumes = scope.numVolumes > 0;

	}

	function applyGlobalState() {

		uniform.value = globalState;
		uniform.needsUpdate = globalPlaneCount > 0;
		planeVolumeStateUniform.value = globalPlaneVolumeState;
		planeVolumeStateUniform.needsUpdate = globalPlaneCount > 0;
		numGlobalIncludeVolumesUniform.value = globalIncludeVolumeCount;
		numLocalIncludeVolumesUniform.value = 0;
		numGlobalIncludeVolumesUniform.needsUpdate = true;
		numLocalIncludeVolumesUniform.needsUpdate = true;

		scope.numPlanes = globalPlaneCount;
		scope.numIntersection = 0;
		scope.numVolumes = globalVolumeCount;
		scope.useClippingVolumes = globalVolumeCount > 0;

	}

	function resetShadowState() {

		uniform.value = null;
		uniform.needsUpdate = false;
		planeVolumeStateUniform.value = null;
		numGlobalIncludeVolumesUniform.value = 0;
		numLocalIncludeVolumesUniform.value = 0;

		planeVolumeStateUniform.needsUpdate = false;
		numGlobalIncludeVolumesUniform.needsUpdate = false;
		numLocalIncludeVolumesUniform.needsUpdate = false;

		scope.numIntersection = 0;
		scope.numVolumes = 0;
		scope.useClippingVolumes = false;
		scope.numPlanes = 0;

	}

}


export { WebGLClipping };
