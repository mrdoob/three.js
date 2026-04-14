import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';

function WebGLClipping( properties ) {

	const scope = this;

	let globalState = null,
		numGlobalPlanes = 0,
		localClippingEnabled = false,
		renderingShadows = false;

	const plane = new Plane(),
		viewNormalMatrix = new Matrix3(),

		uniform = { value: null, needsUpdate: false },
		volumePlaneStartUniform = { value: null, needsUpdate: false },
		volumePlaneCountUniform = { value: null, needsUpdate: false },
		volumeModeUniform = { value: null, needsUpdate: false },
		numVolumesUniform = { value: 0, needsUpdate: false },
		numIncludeVolumesUniform = { value: 0, needsUpdate: false };

	this.uniform = uniform;
	this.volumePlaneStartUniform = volumePlaneStartUniform;
	this.volumePlaneCountUniform = volumePlaneCountUniform;
	this.volumeModeUniform = volumeModeUniform;
	this.numVolumesUniform = numVolumesUniform;
	this.numIncludeVolumesUniform = numIncludeVolumesUniform;

	this.numPlanes = 0;
	this.numIntersection = 0;
	this.numGlobalPlanes = 0;
	this.numVolumes = 0;
	this.useClippingVolumes = false;

	this.init = function ( planes, enableLocalClipping ) {

		const enabled =
			planes.length !== 0 ||
			enableLocalClipping ||
			// enable state of previous frame - the clipping code has to
			// run another frame in order to reset the state:
			numGlobalPlanes !== 0 ||
			localClippingEnabled;

		localClippingEnabled = enableLocalClipping;

		numGlobalPlanes = planes.length;

		return enabled;

	};

	this.beginShadows = function () {

		renderingShadows = true;
		projectPlanes( null );

	};

	this.endShadows = function () {

		renderingShadows = false;

	};

	this.setGlobalState = function ( planes, camera ) {

		globalState = projectPlanes( planes, camera, 0 );

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

				// there's no global clipping

				projectPlanes( null );

			} else {

				resetGlobalState();

			}

		} else {

			const hasClippingPlanes = planes !== null && planes.length > 0;
			const hasClippingVolumes = clippingVolumes !== undefined;

			if ( ! hasClippingPlanes && ! hasClippingVolumes ) {

				resetGlobalState();

			} else {

				setVolumeState( getLocalClippingVolumes( planes, clipIntersection, clippingVolumes, materialProperties ), camera, useCache, materialProperties );

			}

		}


	};

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

	function setVolumeState( volumes, camera, useCache, materialProperties ) {

		const nGlobal = renderingShadows ? 0 : numGlobalPlanes;

		let dstArray = materialProperties.clippingState || null;
		let volumePlaneStartArray = materialProperties.clippingVolumePlaneStartState || null;
		let volumePlaneCountArray = materialProperties.clippingVolumePlaneCountState || null;
		let volumeModeArray = materialProperties.clippingVolumeModeState || null;

		let nVolumes = materialProperties.clippingVolumeCount || 0;
		let nIncludeVolumes = materialProperties.clippingIncludeVolumeCount || 0;
		let nVolumePlanes = materialProperties.clippingVolumePlaneCount || 0;

		uniform.value = dstArray; // ensure unique state

		if ( useCache !== true || dstArray === null || volumePlaneStartArray === null || volumePlaneCountArray === null || volumeModeArray === null ) {

			nVolumes = volumes.length;
			nIncludeVolumes = 0;

			volumePlaneStartArray = new Int32Array( nVolumes );
			volumePlaneCountArray = new Int32Array( nVolumes );
			volumeModeArray = new Int32Array( nVolumes );

			let planeIndex = nGlobal;

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

			nVolumePlanes = planeIndex - nGlobal;

			const flatSize = planeIndex * 4;
			const viewMatrix = camera.matrixWorldInverse;

			viewNormalMatrix.getNormalMatrix( viewMatrix );

			if ( dstArray === null || dstArray.length < flatSize ) {

				dstArray = new Float32Array( flatSize );

			}

			if ( nGlobal !== 0 ) {

				for ( let i = 0, l = nGlobal * 4; i < l; i ++ ) {

					dstArray[ i ] = globalState[ i ];

				}

			}

			for ( let i = 0, i4 = nGlobal * 4; i < nVolumes; i ++ ) {

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
			numIncludeVolumesUniform.needsUpdate = true;

			materialProperties.clippingState = dstArray;
			materialProperties.clippingVolumePlaneStartState = volumePlaneStartArray;
			materialProperties.clippingVolumePlaneCountState = volumePlaneCountArray;
			materialProperties.clippingVolumeModeState = volumeModeArray;
			materialProperties.clippingVolumeCount = nVolumes;
			materialProperties.clippingIncludeVolumeCount = nIncludeVolumes;
			materialProperties.clippingVolumePlaneCount = nVolumePlanes;

		}

		uniform.value = dstArray;
		volumePlaneStartUniform.value = volumePlaneStartArray;
		volumePlaneCountUniform.value = volumePlaneCountArray;
		volumeModeUniform.value = volumeModeArray;
		numVolumesUniform.value = nVolumes;
		numIncludeVolumesUniform.value = nIncludeVolumes;

		scope.numPlanes = nGlobal + nVolumePlanes;
		scope.numIntersection = 0;
		scope.numGlobalPlanes = nGlobal;
		scope.numVolumes = nVolumes;
		scope.useClippingVolumes = true;

	}

	function resetVolumeUniforms() {

		volumePlaneStartUniform.value = null;
		volumePlaneCountUniform.value = null;
		volumeModeUniform.value = null;
		numVolumesUniform.value = 0;
		numIncludeVolumesUniform.value = 0;

		volumePlaneStartUniform.needsUpdate = false;
		volumePlaneCountUniform.needsUpdate = false;
		volumeModeUniform.needsUpdate = false;
		numVolumesUniform.needsUpdate = false;
		numIncludeVolumesUniform.needsUpdate = false;

	}

	function resetGlobalState() {

		if ( uniform.value !== globalState ) {

			uniform.value = globalState;
			uniform.needsUpdate = numGlobalPlanes > 0;

		}

		scope.numPlanes = numGlobalPlanes;
		scope.numIntersection = 0;
		scope.numGlobalPlanes = numGlobalPlanes;
		scope.numVolumes = 0;
		scope.useClippingVolumes = false;

		resetVolumeUniforms();

	}

	function projectPlanes( planes, camera, dstOffset, skipTransform ) {

		const nPlanes = planes !== null ? planes.length : 0;
		let dstArray = null;

		if ( nPlanes !== 0 ) {

			dstArray = uniform.value;

			if ( skipTransform !== true || dstArray === null ) {

				const flatSize = dstOffset + nPlanes * 4,
					viewMatrix = camera.matrixWorldInverse;

				viewNormalMatrix.getNormalMatrix( viewMatrix );

				if ( dstArray === null || dstArray.length < flatSize ) {

					dstArray = new Float32Array( flatSize );

				}

				for ( let i = 0, i4 = dstOffset; i !== nPlanes; ++ i, i4 += 4 ) {

					plane.copy( planes[ i ] ).applyMatrix4( viewMatrix, viewNormalMatrix );

					plane.normal.toArray( dstArray, i4 );
					dstArray[ i4 + 3 ] = plane.constant;

				}

			}

			uniform.value = dstArray;
			uniform.needsUpdate = true;

		}

		scope.numPlanes = nPlanes;
		scope.numIntersection = 0;
		scope.numGlobalPlanes = 0;
		scope.numVolumes = 0;
		scope.useClippingVolumes = false;

		return dstArray;

	}

}


export { WebGLClipping };
