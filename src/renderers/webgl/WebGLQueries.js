
/**
 * @author simon paris / https://github.com/simon-paris
 */

/*
Browser WebGL2 Query source code:
Chrome (js bindings): https://github.com/chromium/chromium/blob/206c0777170302d87809a0dd87e77a9e8901521f/third_party/blink/renderer/modules/webgl/webgl2_rendering_context_base.cc
Chrome (gpu process): https://github.com/chromium/chromium/blob/d5f73ba89a508cc9c9e40aa279f68eca82e4f1ce/gpu/command_buffer/service/query_manager.cc
Firefox: https://github.com/mozilla/gecko/blob/feab53c7f23345feb767b8094a42d1fe6767c888/dom/canvas/WebGLQuery.cpp
Angle (public api): https://github.com/google/angle/blob/3fd614d06e50fb98d1434fabf31e8583516ad5c1/src/libANGLE/renderer/gl/ContextGL.cpp
Angle (opengl): https://github.com/google/angle/blob/master/src/libANGLE/renderer/gl/QueryGL.cpp
Angle (dx9): https://github.com/google/angle/blob/master/src/libANGLE/renderer/d3d/d3d9/Query9.cpp
Angle (dx11): https://github.com/google/angle/blob/master/src/libANGLE/renderer/d3d/d3d11/Query11.cpp
Angle (vulkan): https://github.com/google/angle/blob/master/src/libANGLE/renderer/vulkan/QueryVk.cpp
Webkit (stubs): https://github.com/WebKit/webkit/blob/89c28d471fae35f1788a0f857067896a10af8974/Source/WebCore/html/canvas/WebGLQuery.cpp
*/

var REASON_AUTO = 1;
var REASON_MANUAL_ALL = 2;
var REASON_MANUAL_ONE = 3;

function WebGLQueries( _gl, info, capabilities ) {

	// map from OcclusionQueryMesh objects to objects like:
	// {
	//   alive: [queryObject...], // queries that are being being run or pending response
	//   idle: [queryObject...] // query objects that are not alive
	// }
	// Where queryObject looks like
	// {
	//   mesh: null, // points back to the mesh object
	//   query: null, // the webgl query object
	//   frame: 0, // the frame number on which the query was initiated
	//   lastChecked: 0, // the frame number on which the query response was polled
	//   camera: null, // the camera used to render the query mesh
	// }
	const occlusionQueryMeshStates = new Map();


	function pollQueriesHandler( event ) {

		var queryObjects = occlusionQueryMeshStates.get( event.target );
		if ( queryObjects ) {

			checkOcclusionQueryStatus( queryObjects.alive, queryObjects.idle, null, REASON_MANUAL_ONE );

		}

	}

	function disposeHandler( event ) {

		var queryObjects = occlusionQueryMeshStates.get( event.target );
		occlusionQueryMeshStates.delete( event.target );
		if ( queryObjects ) {

			disposeOcclusionQueries( queryObjects.alive );
			disposeOcclusionQueries( queryObjects.idle );

		}

	}

	function disposeOcclusionQueries( list ) {

		if ( ! capabilities.isWebGL2 ) return;
		for ( var i = 0; i < list.length; i ++ ) {

			_gl.deleteQuery( list[ i ].query );

		}

	}

	this.occlusionQueryStart = function ( occlusionQueryMesh, camera ) {

		var queryObjects = occlusionQueryMeshStates.get( occlusionQueryMesh );
		if ( ! queryObjects ) {

			queryObjects = { alive: [], idle: [] };
			occlusionQueryMeshStates.set( occlusionQueryMesh, queryObjects );
			occlusionQueryMesh.addEventListener( 'dispose', disposeHandler );
			occlusionQueryMesh.addEventListener( 'pollQueries', pollQueriesHandler );

		}

		if ( occlusionQueryMesh.cameraFilter ) {

			var cameraMatches = 0;
			for ( var i = 0; i < occlusionQueryMesh.cameraFilter.length; i ++ ) {

				cameraMatches += occlusionQueryMesh.cameraFilter[ i ] === camera;

			}
			if ( ! cameraMatches ) {

				checkOcclusionQueryStatus( queryObjects.alive, queryObjects.idle, camera, REASON_AUTO );
				return false;

			}

		}

		if ( ! capabilities.isWebGL2 ) {

			console.error( 'WebGLQueries: Using OcclusionQueryMeshes in your scene is only allowed in WebGL2. You can set OcclusionQueryMesh.cameraFilter=[] to disable it.' );
			return false;

		}

		if ( Array.isArray( occlusionQueryMesh.material ) && occlusionQueryMesh.geometry.groups && occlusionQueryMesh.geometry.groups.length > 1 ) {

			console.error( 'WebGLQueries: Do not do occlusion queries using Multi-Materials.' );

		}

		checkOcclusionQueryStatus( queryObjects.alive, queryObjects.idle, camera, REASON_AUTO );

		var numAlive = 0;
		for ( var i = 0; i < queryObjects.alive.length; i ++ ) {

			numAlive += queryObjects.alive[ i ].camera === camera;

		}
		if ( numAlive < occlusionQueryMesh.maxAliveQueries ) {

			var queryInfo = queryObjects.idle.pop() || {
				mesh: null,
				lastChecked: 0,
				frame: 0,
				camera: null,
				query: _gl.createQuery(),
			};
			queryInfo.mesh = occlusionQueryMesh;
			// the query is 'checked' this frame, because we already know that the result is unavailable til the end of the frame
			queryInfo.lastChecked = info.render.frame;
			queryInfo.frame = info.render.frame;
			queryInfo.camera = camera;
			queryObjects.alive.push( queryInfo );

			_gl.beginQuery( _gl.ANY_SAMPLES_PASSED, queryInfo.query );
			return true;

		}
		return false;

	};

	this.occlusionQueryEnd = function () {

		if ( ! capabilities.isWebGL2 ) return;
		_gl.endQuery( _gl.ANY_SAMPLES_PASSED );

	};

	function checkOcclusionQueryStatus( alive, idle, camera, reason ) {

		if ( ! capabilities.isWebGL2 ) return;

		var i = 0;
		var j = 0;
		var frame = info.render.frame;

		while ( i < alive.length ) {

			var queryObject = alive[ i ];

			if ( camera !== null && camera !== queryObject.camera ) {

				// filtering by camera makes the order of callbacks more predictable
				i ++;
				j ++;
				continue;

			}

			if ( queryObject.lastChecked === frame && reason === REASON_AUTO ) {

				// Checking the query on the same frame it's issued or multiple times in the
				// same frame is guarenteed to fail, so ignore requests to check the result in those cases.
				// User initiated checks are probably not initiated during rendering, so don't ignore those.
				// https://www.khronos.org/registry/webgl/specs/latest/2.0/#3.7.12
				i ++;
				j ++;
				continue;

			}

			queryObject.lastChecked = frame;

			// backwards logic - get the query result without checking if it's available. If it's true, we know it was available.
			// If it's false, we don't know so we check. This reduces the total number of gl calls.
			var success = false;
			var available = true;
			success = _gl.getQueryParameter( queryObject.query, _gl.QUERY_RESULT ) > 0;
			if ( ! success ) {

				available = _gl.getQueryParameter( queryObject.query, _gl.QUERY_RESULT_AVAILABLE );

			}

			if ( queryObject.mesh.occlusionQueryCallback && available ) {

				queryObject.mesh.occlusionQueryCallback( success, queryObject.frame, queryObject.camera );

			}

			alive[ j ] = queryObject;

			if ( available === true ) {

				queryObject.frame = 0;
				queryObject.camera = null;
				if ( idle ) {

					idle.push( queryObject );

				}

			} else {

				j ++;

			}
			i ++;

		}

		alive.length = j;

	}

	this.pollAllOcclusionQueries = function () {

		var statesArrays = [];
		return function ( auto ) {

			statesArrays.length = 0;

			occlusionQueryMeshStates.forEach( function ( value ) {

				statesArrays.push( value );

			} );

			for ( var i = 0; i < statesArrays.length; i ++ ) {

				checkOcclusionQueryStatus( statesArrays[ i ].alive, statesArrays[ i ].idle, null, auto ? REASON_AUTO : REASON_MANUAL_ALL );

			}

		};

	}();

	this.dispose = function () {

		occlusionQueryMeshStates.forEach( function ( value ) {

			disposeOcclusionQueries( value.alive );
			disposeOcclusionQueries( value.idle );

		} );

	};

}

export { WebGLQueries };
