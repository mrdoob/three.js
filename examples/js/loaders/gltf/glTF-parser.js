// Copyright (c) 2013 Fabrice Robinet
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/*
	The Abstract Loader has two modes:
		#1: [static] load all the JSON at once [as of now]
		#2: [stream] stream and parse JSON progressively [not yet supported]

	Whatever is the mechanism used to parse the JSON (#1 or #2),
	The loader starts by resolving the paths to binaries and referenced json files (by replace the value of the path property with an absolute path if it was relative).

	In case #1: it is guaranteed to call the concrete loader implementation methods in a order that solves the dependencies between the entries.
	only the nodes requires an extra pass to set up the hirerarchy.
	In case #2: the concrete implementation will have to solve the dependencies. no order is guaranteed.

	When case #1 is used the followed dependency order is:

	scenes -> nodes -> meshes -> materials -> techniques -> shaders
					-> buffers
					-> cameras
					-> lights

	The readers starts with the leafs, i.e:
		shaders, techniques, materials, meshes, buffers, cameras, lights, nodes, scenes

	For each called handle method called the client should return true if the next handle can be call right after returning,
	or false if a callback on client side will notify the loader that the next handle method can be called.

*/
var global = window;
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		factory(module.exports);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], function () {
			return factory(root);
		});
	} else {
		// Browser globals
		factory(root);
	}
}(this, function (root) {
	"use strict";

	var categoriesDepsOrder = ["extensions", "buffers", "bufferViews", "images",  "videos", "samplers", "textures", "shaders", "programs", "techniques", "materials", "accessors", "meshes", "cameras", "lights", "skins", "nodes", "animations", "scenes"];

	var glTFParser = Object.create(Object.prototype, {

		_rootDescription: { value: null, writable: true },

		rootDescription: {
			set: function(value) {
				this._rootDescription = value;
			},
			get: function() {
				return this._rootDescription;
			}
		},

		baseURL: { value: null, writable: true },

		//detect absolute path following the same protocol than window.location
		_isAbsolutePath: {
			value: function(path) {
				var isAbsolutePathRegExp = new RegExp("^"+window.location.protocol, "i");

				return path.match(isAbsolutePathRegExp) ? true : false;
			}
		},

		resolvePathIfNeeded: {
			value: function(path) {
				if (this._isAbsolutePath(path)) {
					return path;
				}

				var isDataUriRegex = /^data:/;
				if (isDataUriRegex.test(path)) {
					return path;
				}
				
				return this.baseURL + path;
			}
		},

		_resolvePathsForCategories: {
			value: function(categories) {
				categories.forEach( function(category) {
					var descriptions = this.json[category];
					if (descriptions) {
						var descriptionKeys = Object.keys(descriptions);
						descriptionKeys.forEach( function(descriptionKey) {
							var description = descriptions[descriptionKey];
							description.uri = this.resolvePathIfNeeded(description.uri);
						}, this);
					}
				}, this);
			}
		},

		_json: {
			value: null,
			writable: true
		},

		json: {
			enumerable: true,
			get: function() {
				return this._json;
			},
			set: function(value) {
				if (this._json !== value) {
					this._json = value;
					this._resolvePathsForCategories(["buffers", "shaders", "images", "videos"]);
				}
			}
		},

		_path: {
			value: null,
			writable: true
		},

		getEntryDescription: {
			value: function (entryID, entryType) {
				var entries = null;

				var category = entryType;
				entries = this.rootDescription[category];
				if (!entries) {
					console.log("ERROR:CANNOT find expected category named:"+category);
					return null;
				}

				return entries ? entries[entryID] : null;
			}
		},

		_stepToNextCategory: {
			value: function() {
				this._state.categoryIndex = this.getNextCategoryIndex(this._state.categoryIndex + 1);
				if (this._state.categoryIndex !== -1) {
					this._state.categoryState.index = 0;
					return true;
				}

				return false;
			}
		},

		_stepToNextDescription: {
			enumerable: false,
			value: function() {
				var categoryState = this._state.categoryState;
				var keys = categoryState.keys;
				if (!keys) {
					console.log("INCONSISTENCY ERROR");
					return false;
				}

				categoryState.index++;
				categoryState.keys = null;
				if (categoryState.index >= keys.length) {
					return this._stepToNextCategory();
				}
				return false;
			}
		},

		hasCategory: {
			value: function(category) {
				return this.rootDescription[category] ? true : false;
			}
		},

		_handleState: {
			value: function() {

				var methodForType = {
					"buffers" : this.handleBuffer,
					"bufferViews" : this.handleBufferView,
					"shaders" : this.handleShader,
					"programs" : this.handleProgram,
					"techniques" : this.handleTechnique,
					"materials" : this.handleMaterial,
					"meshes" : this.handleMesh,
					"cameras" : this.handleCamera,
					"lights" : this.handleLight,
					"nodes" : this.handleNode,
					"scenes" : this.handleScene,
					"images" : this.handleImage,
					"animations" : this.handleAnimation,
					"accessors" : this.handleAccessor,
					"skins" : this.handleSkin,
					"samplers" : this.handleSampler,
					"textures" : this.handleTexture,
					"videos" : this.handleVideo,
					"extensions" : this.handleExtension,

				};

				var success = true;
				while (this._state.categoryIndex !== -1) {
					var category = categoriesDepsOrder[this._state.categoryIndex];
					var categoryState = this._state.categoryState;
					var keys = categoryState.keys;
					if (!keys) {
						categoryState.keys = keys = Object.keys(this.rootDescription[category]);
						if (keys) {
							if (keys.length == 0) {
								this._stepToNextDescription();
								continue;
							}
						}
					}

					var type = category;
					var entryID = keys[categoryState.index];
					var description = this.getEntryDescription(entryID, type);
					if (!description) {
						if (this.handleError) {
							this.handleError("INCONSISTENCY ERROR: no description found for entry "+entryID);
							success = false;
							break;
						}
					} else {

						if (methodForType[type]) {
							if (methodForType[type].call(this, entryID, description, this._state.userInfo) === false) {
								success = false;
								break;
							}
						}

						this._stepToNextDescription();
					}
				}

				if (this.handleLoadCompleted) {
					this.handleLoadCompleted(success);
				}

			}
		},

		_loadJSONIfNeeded: {
			enumerable: true,
			value: function(callback) {
				var self = this;
				//FIXME: handle error
				if (!this._json)  {
					var jsonPath = this._path;
					var i = jsonPath.lastIndexOf("/");
					this.baseURL = (i !== 0) ? jsonPath.substring(0, i + 1) : '';
					var jsonfile = new XMLHttpRequest();
					jsonfile.open("GET", jsonPath, true);
					jsonfile.onreadystatechange = function() {
						if (jsonfile.readyState == 4) {
							if (jsonfile.status == 200) {
								self.json = JSON.parse(jsonfile.responseText);
								if (callback) {
									callback(self.json);
								}
							}
						}
					};
					jsonfile.send(null);
			   } else {
					if (callback) {
						callback(this.json);
					}
				}
			}
		},

		/* load JSON and assign it as description to the reader */
		_buildLoader: {
			value: function(callback) {
				var self = this;
				function JSONReady(json) {
					self.rootDescription = json;
					if (callback)
						callback(this);
				}

				this._loadJSONIfNeeded(JSONReady);
			}
		},

		_state: { value: null, writable: true },

		_getEntryType: {
			value: function(entryID) {
				var rootKeys = categoriesDepsOrder;
				for (var i = 0 ;  i < rootKeys.length ; i++) {
					var rootValues = this.rootDescription[rootKeys[i]];
					if (rootValues) {
						return rootKeys[i];
					}
				}
				return null;
			}
		},

		getNextCategoryIndex: {
			value: function(currentIndex) {
				for (var i = currentIndex ; i < categoriesDepsOrder.length ; i++) {
					if (this.hasCategory(categoriesDepsOrder[i])) {
						return i;
					}
				}

				return -1;
			}
		},

		load: {
			enumerable: true,
			value: function(userInfo, options) {
				var self = this;
				this._buildLoader(function loaderReady(reader) {
					var startCategory = self.getNextCategoryIndex.call(self,0);
					if (startCategory !== -1) {
						self._state = { "userInfo" : userInfo,
										"options" : options,
										"categoryIndex" : startCategory,
										"categoryState" : { "index" : "0" } };
						self._handleState();
					}
				});
			}
		},

		initWithPath: {
			value: function(path) {
				this._path = path;
				this._json = null;
				return this;
			}
		},

		//this is meant to be global and common for all instances
		_knownURLs: { writable: true, value: {} },

		//to be invoked by subclass, so that ids can be ensured to not overlap
		loaderContext: {
			value: function() {
				if (typeof this._knownURLs[this._path] === "undefined") {
					this._knownURLs[this._path] = Object.keys(this._knownURLs).length;
				}
				return "__" + this._knownURLs[this._path];
			}
		},

		initWithJSON: {
			value: function(json, baseURL) {
				this.json = json;
				this.baseURL = baseURL;
				if (!baseURL) {
					console.log("WARNING: no base URL passed to Reader:initWithJSON");
				}
				return this;
			}
		}

	});

	if(root) {
		root.glTFParser = glTFParser;
	}

	return glTFParser;

}));
