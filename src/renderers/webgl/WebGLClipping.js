import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';

function WebGLClipping( properties ) {

	const scope = this;

	let globalState = null,
		globalVolumePlaneStartState = null,
		globalVolumePlaneCountState = null,
		globalVolumeModeState = null,
		globalPlaneCount = 0,
		globalVolumeCount = 0,
		globalIncludeVolumeCount = 0,
		localClippingEnabled = false,
		renderingShadows = false;

	const plane = new Plane(),
		viewNormalMatrix = new Matrix3(),

		uniform = { value: null, needsUpdate: false },
		volumePlaneStartUniform = { value: null, needsUpdate: false },
		volumePlaneCountUniform = { value: null, needsUpdate: false },
		volumeModeUniform = { value: null, needsUpdate: false },
		numVolumesUniform = { value: 0, needsUpdate: false },
		numGlobalVolumesUniform = { value: 0, needsUpdate: false },
		numGlobalIncludeVolumesUniform = { value: 0, needsUpdate: false },
		numLocalIncludeVolumesUniform = { value: 0, needsUpdate: false };

	const globalClippingPlaneVolume = { planes: null, mode: 'include' },
		globalClippingPlaneVolumes = [ globalClippingPlaneVolume ];

	const combinedGlobalClippingVolumes = [];

	this.uniform = uniform;
	this.volumePlaneStartUniform = volumePlaneStartUniform;
	this.volumePlaneCountUniform = volumePlaneCountUniform;
	this.volumeModeUniform = volumeModeUniform;
	this.numVolumesUniform = numVolumesUniform;
	this.numGlobalVolumesUniform = numGlobalVolumesUniform;
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

		const nVolumes = volumes.length;

		if ( nVolumes === 0 ) {

			globalState = null;
			globalVolumePlaneStartState = null;
			globalVolumePlaneCountState = null;
			globalVolumeModeState = null;
			globalPlaneCount = 0;
			globalVolumeCount = 0;
			globalIncludeVolumeCount = 0;

			applyGlobalState();

			return;

		}

		const volumePlaneStartArray = new Int32Array( nVolumes );
		const volumePlaneCountArray = new Int32Array( nVolumes );
		const volumeModeArray = new Int32Array( nVolumes );

		let planeIndex = 0;
		let nIncludeVolumes = 0;

		for ( let i = 0; i < nVolumes; i ++ ) {

			const clippingVolume = volumes[ i ];
			const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];
			const volumeMode = clippingVolume.mode === 'exclude' ? 1 : 0;

			volumePlaneStartArray[ i ] = planeIndex;
			volumePlaneCountArray[ i ] = volumePlanes.length;
			volumeModeArray[ i ] = volumeMode;

			if ( volumeMode === 0 ) nIncludeVolumes ++;

			planeIndex += volumePlanes.length;

		}

		const dstArray = new Float32Array( planeIndex * 4 );
		const viewMatrix = camera.matrixWorldInverse;

		viewNormalMatrix.getNormalMatrix( viewMatrix );

		for ( let i = 0, i4 = 0; i < nVolumes; i ++ ) {

			const clippingVolume = volumes[ i ];
			const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];

			for ( let j = 0, jl = volumePlanes.length; j < jl; j ++, i4 += 4 ) {

				plane.copy( volumePlanes[ j ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

				plane.normal.toArray( dstArray, i4 );
				dstArray[ i4 + 3 ] = plane.constant;

			}

		}

		globalState = dstArray;
		globalVolumePlaneStartState = volumePlaneStartArray;
		globalVolumePlaneCountState = volumePlaneCountArray;
		globalVolumeModeState = volumeModeArray;
		globalPlaneCount = planeIndex;
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

		const nLocalVolumes = volumes.length;
		let dstArray = materialProperties.clippingState || null;
		let volumePlaneStartArray = materialProperties.clippingVolumePlaneStartState || null;
		let volumePlaneCountArray = materialProperties.clippingVolumePlaneCountState || null;
		let volumeModeArray = materialProperties.clippingVolumeModeState || null;

		let nVolumes = materialProperties.clippingVolumeCount || 0;
		let nLocalIncludeVolumes = materialProperties.clippingLocalIncludeVolumeCount || 0;
		let nLocalPlanes = materialProperties.clippingLocalPlaneCount || 0;

		uniform.value = dstArray; // ensure unique state

		if ( useCache !== true || globalStateChanged || dstArray === null || volumePlaneStartArray === null || volumePlaneCountArray === null || volumeModeArray === null ) {

			nVolumes = nGlobalVolumes + nLocalVolumes;
			nLocalIncludeVolumes = 0;

			volumePlaneStartArray = new Int32Array( nVolumes );
			volumePlaneCountArray = new Int32Array( nVolumes );
			volumeModeArray = new Int32Array( nVolumes );

			if ( nGlobalVolumes !== 0 ) {

				for ( let i = 0; i < nGlobalVolumes; i ++ ) {

					volumePlaneStartArray[ i ] = globalVolumePlaneStartState[ i ];
					volumePlaneCountArray[ i ] = globalVolumePlaneCountState[ i ];
					volumeModeArray[ i ] = globalVolumeModeState[ i ];

				}

			}

			let planeIndex = nGlobalPlanes;

			for ( let i = 0; i < nLocalVolumes; i ++ ) {

				const stateIndex = nGlobalVolumes + i;
				const clippingVolume = volumes[ i ];
				const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];
				const volumeMode = clippingVolume.mode === 'exclude' ? 1 : 0;

				volumePlaneStartArray[ stateIndex ] = planeIndex;
				volumePlaneCountArray[ stateIndex ] = volumePlanes.length;
				volumeModeArray[ stateIndex ] = volumeMode;

				if ( volumeMode === 0 ) nLocalIncludeVolumes ++;

				planeIndex += volumePlanes.length;

			}

			nLocalPlanes = planeIndex - nGlobalPlanes;

			const flatSize = planeIndex * 4;
			const viewMatrix = camera.matrixWorldInverse;

			viewNormalMatrix.getNormalMatrix( viewMatrix );

			if ( dstArray === null || dstArray.length < flatSize ) {

				dstArray = new Float32Array( flatSize );

			}

			if ( nGlobalPlanes !== 0 ) {

				for ( let i = 0, l = nGlobalPlanes * 4; i < l; i ++ ) {

					dstArray[ i ] = globalState[ i ];

				}

			}

			for ( let i = 0, i4 = nGlobalPlanes * 4; i < nLocalVolumes; i ++ ) {

				const clippingVolume = volumes[ i ];
				const volumePlanes = Array.isArray( clippingVolume.planes ) ? clippingVolume.planes : [];

				for ( let j = 0, jl = volumePlanes.length; j < jl; j ++, i4 += 4 ) {

					plane.copy( volumePlanes[ j ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

					plane.normal.toArray( dstArray, i4 );
					dstArray[ i4 + 3 ] = plane.constant;

				}

			}

			uniform.needsUpdate = true;
			volumePlaneStartUniform.needsUpdate = true;
			volumePlaneCountUniform.needsUpdate = true;
			volumeModeUniform.needsUpdate = true;
			numVolumesUniform.needsUpdate = true;
			numGlobalVolumesUniform.needsUpdate = true;
			numGlobalIncludeVolumesUniform.needsUpdate = true;
			numLocalIncludeVolumesUniform.needsUpdate = true;

			materialProperties.clippingState = dstArray;
			materialProperties.clippingVolumePlaneStartState = volumePlaneStartArray;
			materialProperties.clippingVolumePlaneCountState = volumePlaneCountArray;
			materialProperties.clippingVolumeModeState = volumeModeArray;
			materialProperties.clippingVolumeCount = nVolumes;
			materialProperties.clippingLocalIncludeVolumeCount = nLocalIncludeVolumes;
			materialProperties.clippingLocalPlaneCount = nLocalPlanes;
			materialProperties.clippingGlobalPlaneCount = nGlobalPlanes;
			materialProperties.clippingGlobalVolumeCount = nGlobalVolumes;
			materialProperties.clippingGlobalIncludeVolumeCount = nGlobalIncludeVolumes;

		}

		uniform.value = dstArray;
		volumePlaneStartUniform.value = volumePlaneStartArray;
		volumePlaneCountUniform.value = volumePlaneCountArray;
		volumeModeUniform.value = volumeModeArray;
		numVolumesUniform.value = nVolumes;
		numGlobalVolumesUniform.value = nGlobalVolumes;
		numGlobalIncludeVolumesUniform.value = nGlobalIncludeVolumes;
		numLocalIncludeVolumesUniform.value = nLocalIncludeVolumes;

		scope.numPlanes = nGlobalPlanes + nLocalPlanes;
		scope.numIntersection = 0;
		scope.numVolumes = nVolumes;
		scope.useClippingVolumes = nVolumes > 0;

	}

	function applyGlobalState() {

		uniform.value = globalState;
		uniform.needsUpdate = globalPlaneCount > 0;

		volumePlaneStartUniform.value = globalVolumePlaneStartState;
		volumePlaneCountUniform.value = globalVolumePlaneCountState;
		volumeModeUniform.value = globalVolumeModeState;
		volumePlaneStartUniform.needsUpdate = globalVolumeCount > 0;
		volumePlaneCountUniform.needsUpdate = globalVolumeCount > 0;
		volumeModeUniform.needsUpdate = globalVolumeCount > 0;

		numVolumesUniform.value = globalVolumeCount;
		numGlobalVolumesUniform.value = globalVolumeCount;
		numGlobalIncludeVolumesUniform.value = globalIncludeVolumeCount;
		numLocalIncludeVolumesUniform.value = 0;
		numVolumesUniform.needsUpdate = true;
		numGlobalVolumesUniform.needsUpdate = true;
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
		volumePlaneStartUniform.value = null;
		volumePlaneCountUniform.value = null;
		volumeModeUniform.value = null;
		numVolumesUniform.value = 0;
		numGlobalVolumesUniform.value = 0;
		numGlobalIncludeVolumesUniform.value = 0;
		numLocalIncludeVolumesUniform.value = 0;

		volumePlaneStartUniform.needsUpdate = false;
		volumePlaneCountUniform.needsUpdate = false;
		volumeModeUniform.needsUpdate = false;
		numVolumesUniform.needsUpdate = false;
		numGlobalVolumesUniform.needsUpdate = false;
		numGlobalIncludeVolumesUniform.needsUpdate = false;
		numLocalIncludeVolumesUniform.needsUpdate = false;

		scope.numIntersection = 0;
		scope.numVolumes = 0;
		scope.useClippingVolumes = false;
		scope.numPlanes = 0;

	}

}


export { WebGLClipping };
