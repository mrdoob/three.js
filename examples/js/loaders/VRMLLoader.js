/**
 * @author mrdoob / http://mrdoob.com/
 * @author Bart McLeod / http://spaceweb.nl/
 */

/**
 *
 * @param manager A loader manager. Not 100% why we need this and if.
 * @param camera The camera used in the scene.
 * @param controls The active controls used in the scene. Will be overwritten / reset if a new viewpoint is selected.
 * @param viewpointsContainer
 * @param debug
 * @constructor
 */
THREE.VRMLLoader = function (manager, camera, controls, viewpointsContainer, debug) {
	this.manager             = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.parser              = (undefined !== window[ 'vrmlParser' ]) ? vrmlParser : false;
	this.debug               = debug;
	this.viewpointsContainer = viewpointsContainer;
	this.camera              = camera;
	this.controls            = controls;
};

THREE.VRMLLoader.prototype = {

	constructor: THREE.VRMLLoader,

	log: function (obj) {
		if ( this.debug ) {
			console.log(obj);
		}
	},

	load: function (url) {
		var scope = this;

		var _parse = function (data) {
			try {
				var tree = scope.parser.parse(data);
				scope.log(tree);
				return tree;
			} catch ( e ) {
				scope.log('Exception with message ' + e.message);

				if ( undefined !== e.location ) {
					scope.log('Exception at location start: offset: ' + e.location.start.offset + ' line: ' + e.location.start.line + ' column: ' + e.location.start.column);
					scope.log('Exception at location end: offset: ' + e.location.end.offset + ' line: ' + e.location.end.line + ' column: ' + e.location.end.column);
				}

				return false;
			}
		}

		var _onLoad = function (data) {
			var vrmlTree = _parse(data);

			if ( vrmlTree === false ) {
				return;
			}

			var vrmlConverter = new VrmlParser.Renderer.ThreeJs(this.debug);

			// initialize the viewpoinst with the camera from the global scope
			vrmlConverter.viewpoints = {
				reset: {
					getCamera: function () {
						return this.camera;
					}, name: 'surrounding_reset', camera: scope.camera
				}
			}; // key value store of cameras based on VRML viewpoint nodes, stored by their name.

			vrmlConverter.render(vrmlTree, scene);

			if ( scope.viewpointsContainer ) {

				/**
				 * Primitive way of forcing controls to work with the new camera, not likely needed when we animatie the
				 * camera instead of replacing it.
				 *
				 * @param camera
				 * @private
				 */
				var _resetControls = function (camera) {
					scope.controls             = new THREE.FlyControls(camera);
					scope.controls.rotateSpeed = 1;
					scope.controls.zoomSpeed   = 0.2;
					scope.controls.panSpeed    = 0.2;
					scope.controls.enableZoom  = true;
					scope.controls.enablePan   = true;
				}

				/**
				 * Triggers when a viewpoint is selected from the list. Currently replaces the camera,
				 * but @todo just animating the camera to a new position and rotation would probably be better.
				 * @param event
				 * @private
				 */
				var _selectViewpoint = function (event) {
					var viewpoint = event.target.dataset.name;
					console.log('clicked ' + viewpoint);
					camera = vrmlConverter.viewpoints[ viewpoint ].getCamera();
					_resetControls(camera);
					// animation isnot available in this scope, and also, replacing the camera does not work, instead, try to animate the camera
					//animation.addClickSupport(camera, renderer);
				}

				// render a list of clickable viewpoints
				var viewpointSelector = document.getElementById(scope.viewpointsContainer);

				for ( var a in vrmlConverter.viewpoints ) {

					if ( typeof a === 'string' ) {
						var option       = document.createElement('div');
						option.innerHTML = a;
						option.setAttribute('data-name', a);
						viewpointSelector.appendChild(option);
						option.addEventListener('click', function (event) {
							_selectViewpoint(event);
						});
					}

				}

				container = document.createElement('div');
				document.body.appendChild(container);
				container.appendChild(renderer.domElement);
			}
		}

		var _onError = function (error) {
			var request = error.target;
			if ( 404 === request.status ) {
				scope.log('VRML Document not found at ' + request.responseURL);
			}
			scope.log(error);
		}

		var _onProgress = function () {

		}

		var loader = new THREE.FileLoader(this.manager);
		loader.load(url, _onLoad, _onProgress, _onError);

	},

	setCrossOrigin: function (value) {

		this.crossOrigin = value;

	}

};
