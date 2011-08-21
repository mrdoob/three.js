/**
 * @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
 */

var DAE = (function() {
	var COLLADA = null;
	var scene = null;
	var daeScene;
 	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var visualScenes;
	var flip_uv = true;
	var readyCallbackFunc = null;
	var baseUrl;
	var morphs;
	var skins;
	
	function load(url, readyCallback) {
		if (document.implementation && document.implementation.createDocument) {
			var namespaceURL = "http://www.collada.org/2005/11/COLLADASchema";
			var rootTagName = "COLLADA";

			var xmldoc = document.implementation.createDocument(namespaceURL, rootTagName, null);
			var me = this;
			url += "?rnd=" + Math.random();

			var req = new XMLHttpRequest();

			if(req.overrideMimeType) {
				// need this? yes... if extension is other then *.xml :-S
				req.overrideMimeType("text/xml");
			}

			req.onreadystatechange = function() {
				if(req.readyState == 4) {
					if(req.status == 0 || req.status == 200) {
						
						readyCallbackFunc = readyCallback;
						parse(req.responseXML, undefined, url);
					}
				}
			}
			req.open("GET", url, true); 
			req.send(null);
		} else {
			alert("Don't know how to parse XML!");
		}
	}
	
	function parse(doc, callBack, url) {
		COLLADA = doc;
		callBack = callBack || readyCallbackFunc;
		if (url !== undefined) {
			var parts = url.split('/');
			parts.pop();
			baseUrl = parts.join('/') + '/';
		}
		images = parseLib("//dae:library_images/dae:image", _Image, "image");
		materials = parseLib("//dae:library_materials/dae:material", Material, "material");
		effects = parseLib("//dae:library_effects/dae:effect", Effect, "effect");
		geometries = parseLib("//dae:library_geometries/dae:geometry", Geometry, "geometry");
		controllers = parseLib("//dae:library_controllers/dae:controller", Controller, "controller");
		animations = parseLib("//dae:library_animations/dae:animation", Animation, "animation");
		visualScenes = parseLib(".//dae:library_visual_scenes/dae:visual_scene", VisualScene, "visual_scene");
		
		morphs = [];
		skins = [];
		
		daeScene = parseScene();
		scene = new THREE.Object3D();
		for (var i = 0; i < daeScene.nodes.length; i++) {
			scene.addChild(createSceneGraph(daeScene.nodes[i]));
		}

		createAnimations();

		var result = {
			scene: scene, 
			morphs: morphs,
			skins: skins,
			dae: {
				images: images,
				materials: materials,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				scene: daeScene
			}
		};
		
		if (callBack) {
			callBack(result);
		}
		return result;
	}
	
	function parseLib(q, classSpec, prefix) {
		var elements = COLLADA.evaluate(q, 
			COLLADA, 
			_nsResolver, 
			XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
			null);
		var lib = {};
		var element = elements.iterateNext();
		var i = 0;
		while (element) {
			var daeElement = (new classSpec()).parse(element);
			if (daeElement.id.length == 0) daeElement.id = prefix + (i++); 
			lib[daeElement.id] = daeElement;
			element = elements.iterateNext();
		}
		return lib;
	}
	
	function parseScene() {
		var sceneElement = COLLADA.evaluate(".//dae:scene/dae:instance_visual_scene", 
			COLLADA, 
			_nsResolver, 
			XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
			null).iterateNext();
		
		
		if (sceneElement) {
			var url = sceneElement.getAttribute('url').replace(/^#/, '');
			return visualScenes[url];
		} else {
			return null;
		}
	}
	
	function createAnimations() {
		calcAnimationBounds();
		for (animation_id in animations) {
			createAnimation(animations[animation_id]);
		}
	}
	
	function createAnimation(animation) {
	}
	
	function calcAnimationBounds() {
		var start = 1000000;
		var end = -start;
		
		for (id in animations) {
			var animation = animations[id];
			for (var i = 0; i < animation.sampler.length; i++) {
				var sampler = animation.sampler[i];
				sampler.create();	
				start = Math.min(start, sampler.startTime);
				end = Math.max(end, sampler.endTime);
			}
		}
		return {start:start, end:end}
	}
	
	function createMorph(geometry, ctrl) {
		var morphCtrl = ctrl instanceof InstanceController ? controllers[ctrl.url] : ctrl;
		if (!morphCtrl || !morphCtrl.morph) {
			console.log("could not find morph controller!");
			return;
		}
		var morph = morphCtrl.morph;

		for (var i = 0; i < morph.targets.length; i++) {
			var target_id = morph.targets[i];
			var daeGeometry = geometries[target_id];
			if (!daeGeometry.mesh || 
				!daeGeometry.mesh.primitives || 
				!daeGeometry.mesh.primitives.length) {
				continue;
			}
			var target = daeGeometry.mesh.primitives[0].geometry;
			if (target.vertices.length === geometry.vertices.length) {
				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );
			}
		}
		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );
	}
	
	function createSkin(geometry, ctrl, applyBindShape) {
		var skinCtrl = controllers[ctrl.url];
		if (!skinCtrl || !skinCtrl.skin) {
			console.log("could not find skin controller!");
			return;
		}
		if (!ctrl.skeleton || !ctrl.skeleton.length) {
			console.log("could not find the skeleton for the skin!");
			return;
		}
		var skin = skinCtrl.skin;
		var skeleton = daeScene.getChildById(ctrl.skeleton[0]);
		var hierarchy = [];
		
		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;
		
		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];
		
		createBones(geometry.bones, skin, hierarchy, skeleton, null, -1);
		createWeights(skin, geometry.bones, geometry.skinIndices, geometry.skinWeights);
		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/
		if (applyBindShape) {
			for (var i = 0; i < geometry.vertices.length; i++) {
				skin.bindShapeMatrix.multiplyVector3(geometry.vertices[i].position);
			}
		}
	}
	
	function createSceneGraph(node, parent) {
		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i;
		
		obj.name = node.id || "";
		obj.matrixAutoUpdate = false;
		obj.matrix = node.matrix;
		
		// FIXME: controllers
		for (i =0; i < node.controllers.length; i++) {
			var controller = controllers[node.controllers[i].url];
			switch (controller.type) {
				case 'skin':
					if (geometries[controller.skin.source]) {
						var inst_geom = new InstanceGeometry();
						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[i].instance_material;
						node.geometries.push(inst_geom);
						skinned = true;
						skinController = node.controllers[i];
					} else if (controllers[controller.skin.source]) {
						// urgh: controller can be chained
						// handle the most basic case...
						var second = controllers[controller.skin.source];
						morphController = second;
					//	skinController = node.controllers[i];
						if (second.morph && geometries[second.morph.source]) {
							var inst_geom = new InstanceGeometry();
							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[i].instance_material;
							node.geometries.push(inst_geom);
						}
					}
					break;
				case 'morph':
					if (geometries[controller.morph.source]) {
						var inst_geom = new InstanceGeometry();
						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[i].instance_material;
						node.geometries.push(inst_geom);
						morphController = node.controllers[i];
					}
					console.log("DAE: morph-controller partially supported.")
				default:
					break;
			}
		}
		
		// FIXME: multi-material mesh?
		// geometries
		for (i = 0; i < node.geometries.length; i++) {
			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[instance_geometry.url];
			var used_effects = {};

			if (geometry) {
				if (!geometry.mesh || !geometry.mesh.primitives)
					continue;
					
				if (obj.name.length == 0) {
					obj.name = geometry.id;
				}
				
				// collect used fx for this geometry-instance
				if (instance_materials) {
					for (j = 0; j < instance_materials.length; j++) {
						var inst_material = instance_materials[j];
						var effect_id = materials[inst_material.target].instance_effect.url;
						used_effects[inst_material.symbol] = effects[effect_id];
					}
				}
				
				var primitives = geometry.mesh.primitives;
				
				for (j = 0; j < primitives.length; j++) {
					var effect = used_effects[ primitives[j].material ];
					var shader = effect.shader;
					var geom = primitives[j].geometry;
					var material = shader.material;
					var mesh;
					
					if (skinController !== undefined) {
						//createSkin(geom, skinController);
						//material.skinning = true;
						mesh = new THREE.SkinnedMesh( geom, material );
						mesh.name = 'skin_' + skins.length;
						skins.push(mesh);
					} else {
						if (morphController !== undefined) {
							console.log("morphing")
							createMorph(geom, morphController);
							material.morphTargets = true;
							mesh = new THREE.Mesh( geom, material );
							mesh.name = 'morph_' + morphs.length;
							morphs.push(mesh);
						} else {
							mesh = new THREE.Mesh( geom, material );
						}
					}
					obj.addChild(mesh);
				}
			}
		}
		
		for (i = 0; i < node.nodes.length; i++) {
			obj.addChild(createSceneGraph(node.nodes[i], node));
		}
		
		return obj;
	}
	
	function getJointId(skin, id) {
		for (var i = 0; i < skin.joints.length; i++) {
			if (skin.joints[i] == id) {
				return i;
			}
		}
	}
	function test(geometry, skin) {
		var maxId = -1000;
		var skinIndices = [];
		var skinWeights = [];
		for (var i = 0; i < geometry.vertices.length; i++) {
			var v = geometry.vertices[i];
			var weights = skin.weights[v.daeId];
			var vi = new THREE.Vector3();
			var wi = new THREE.Vector3();
			for (var j = 0; j < weights.length && j < 2; j++) {
				var vw = weights[j];
				var jointIdx = getJointId(skin, vw.joint);
				if (j == 0) {
					vi.x = jointIdx;
					wi.x = vw.weight;
				} else {
					vi.y = jointIdx;
					wi.y = vw.weight;
				}
			}
			skinIndices.push(vi);
			skinWeights.push(wi);
		}
		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = [];
		var hierarchy = [];
		
		for (var i = 0; i < skin.joints.length; i++) {
			var bone = skin.joints[i];
			var idx = i == 0 ? -1 : Math.round(Math.random()*10);
			var n = daeScene.getChildBySid(bone, true);
			if (n && n.keys) {
				hierarchy.push({parent:idx, keys:n.keys});
			
			
			geometry.bones.push({
				parent: idx,
				pos: [0, 0, 0],
				rotq: [0, 0, 0, 1],
				scl: [1,1,1],
				rot: [0,0,0]
			});
		}
		}
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 3.333,
			JIT: undefined,
			hierarchy: hierarchy
		};
		console.log(hierarchy)
	}
	function getLibraryNode(id) {
		return COLLADA.evaluate(".//dae:library_nodes//dae:node[@id='"+id+"']", 
			COLLADA, 
			_nsResolver, 
			XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
			null).iterateNext();
	}
	
	function getChannelsForNode(node) {
		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;
		for (var id in animations) {
			var animation = animations[id];
			for (var i = 0; i < animation.channel.length; i++) {
				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];
				if (id == node.id) {
					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);
				}
			}
		}
		if (channels.length) {
			node.startTime = startTime;
			node.endTime = endTime;	
		}
		return channels;
	}
	
	function calcFrameDuration(node) {
		var minT = 10000000;
		for (i = 0; i < node.channels.length; i++) {
			var sampler = node.channels[i].sampler;
			
			for (var j = 0; j < sampler.input.length - 1; j++) {
				var t0 = sampler.input[j];
				var t1 = sampler.input[j+1];
				minT = Math.min(minT, t1 - t0);
			}
		}
		return minT;
	}
	
	function calcMatrixAt(node, t) {
		var animated = {};
		var i, j;
		for (i = 0; i < node.channels.length; i++) {
			var channel = node.channels[i];
			animated[ channel.sid ] = channel;
		}
		var matrix = new THREE.Matrix4();
		for (i = 0; i < node.transforms.length; i++) {
			var transform = node.transforms[i];
			var channel = animated[transform.sid];
			if (channel !== undefined) {
				var sampler = channel.sampler;
				var value;
				for (var j = 0; j < sampler.input.length - 1; j++) {
					if (sampler.input[j+1] > t) {
						value = sampler.output[j];
						//console.log(value.flatten)
						break;
					}
				}
				if (value !== undefined) {
					if (value instanceof THREE.Matrix4) {
						matrix = matrix.multiply(matrix, value);
					} else {
						// FIXME: handle other types
						matrix = matrix.multiply(matrix, transform.matrix);
					}
				} else {
					matrix = matrix.multiply(matrix, transform.matrix);
				}
			} else {
				matrix = matrix.multiply(matrix, transform.matrix);
			}
		}
		return matrix;
	}
	
	function bakeAnimations(node) {
		if (node.channels && node.channels.length) {
			var frameDuration = calcFrameDuration(node);
			var t, matrix;
			var keys = [];
			for (t = node.startTime; t < node.endTime; t += frameDuration) {
				matrix = calcMatrixAt(node, t);
				//keys.push({time: t, mat: matrix.flatten()})
				keys.push({
					time: t,
					pos: [matrix.n14, matrix.n24, matrix.n34],
					rotq: [0, 0, 0, 1],
					scl: [1,1,1]
				});
			}
			node.keys = keys;
		}
	}
	
	function _Image() {
		this.id = "";
		this.init_from = "";
	}
	_Image.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeName == 'init_from') {
				this.init_from = child.textContent;
			}
		}
		return this;
	}
	
	function Controller() {
		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;
	}
	Controller.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			switch (child.nodeName) {
				case 'skin':
					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;
				case 'morph':
					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;
				default:
					break;
			}
		}
		return this;
	}
	function Morph() {
		this.method;
		this.source;
		this.targets;
		this.weights;
	}
	Morph.prototype.parse = function(element) {
		var sources = {};
		var inputs = [];
		var i;
		this.method = element.getAttribute('method');
		this.source = element.getAttribute('source').replace(/^#/, '');
		for (i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'source':
					var source = (new Source()).parse(child);
					sources[source.id] = source;
					break;
				case 'targets':
					inputs = this.parseInputs(child);
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
		for (i = 0; i < inputs.length; i++) {
			var input = inputs[i];
			var source = sources[input.source];
			switch (input.semantic) {
				case 'MORPH_TARGET':
					this.targets = source.read();
					break;
				case 'MORPH_WEIGHT':
					this.weights = source.read();
					break;
				default:
					break;
			}
		}
		return this;
	}
	Morph.prototype.parseInputs = function(element) {
		var inputs = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'input':
					inputs.push((new Input()).parse(child));
					break;
				default:
					break;
			}
		}
		return inputs;
	}
	
	function Skin() {
		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];
	}
	Skin.prototype.parse = function(element) {
		var sources = {};
		var joints, weights;
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'bind_shape_matrix':
					var f = _floats(child.textContent);
					this.bindShapeMatrix = new THREE.Matrix4();
					this.bindShapeMatrix.set(
						f[0], f[1], f[2], f[3],
						f[4], f[5], f[6], f[7],
						f[8], f[9], f[10], f[11],
						f[12], f[13], f[14], f[15]
						);
					break;
				case 'source':
					var src = new Source().parse(child);
					sources[src.id] = src;
					break;
				case 'joints':
					joints = child;
					break;
				case 'vertex_weights':
					weights = child;
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
		this.parseJoints(joints, sources);
		this.parseWeights(weights, sources);
		return this;
	}
	Skin.prototype.parseJoints = function(element, sources) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'input':
					var input = (new Input()).parse(child);
					var source = sources[input.source];
					if (input.semantic == 'JOINT') {
						this.joints = source.read();
					} else if (input.semantic == 'INV_BIND_MATRIX') {
						this.invBindMatrices = source.read();
					}
					break;
				default:
					break;
			}
		}
	}
	Skin.prototype.parseWeights = function(element, sources) {
		var v, vcount, inputs = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'input':
					inputs.push((new Input()).parse(child));
					break;
				case 'v':
					v = _ints(child.textContent);
					break;
				case 'vcount':
					vcount = _ints(child.textContent);
					break;
				default:
					break;
			}
		}
		var index = 0;
		
		for (var i = 0; i < vcount.length; i++) {
			var numBones = vcount[i];
			var vertex_weights = [];
			for (var j = 0; j < numBones; j++) {
				var influence = {};
				for (var k = 0; k < inputs.length; k++) {
					var input = inputs[k];
					var value = v[index + input.offset];
					switch (input.semantic) {
						case 'JOINT':
							influence.joint = this.joints[value];
							break;
						case 'WEIGHT':
							influence.weight = sources[input.source].data[value];
							break;
						default:
							break;
					}
				}
				vertex_weights.push(influence);
				index += inputs.length;
			}
			this.weights.push(vertex_weights);
		}
	}
	
	function VisualScene() {
		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Object3D();
	}
	VisualScene.prototype.getChildById = function(id, recursive) {
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i].getChildById(id, recursive);
			if (node) {
				return node;
			}
		}
		return null;
	}
	VisualScene.prototype.getChildBySid = function(sid, recursive) {
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i].getChildBySid(sid, recursive);
			if (node) {
				return node;
			}
		}
		return null;
	}
	VisualScene.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.nodes = [];
		
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'node':
					this.nodes.push((new Node()).parse(child));
					break;
				default:
					break;
			}
		}
		return this;
	}
	
	function Node() {
		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();
	}
	Node.prototype.getChannelForTransform = function(transformSid) {
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;
			
			if (dotSyntax) {
				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();
			} else if (arrSyntax) {
				arrIndices = sid.split("(");
				sid = arrIndices.shift();
				for (var j = 0; j < arrIndices.length; j++) {
					arrIndices[j] = parseInt(arrIndices[j].replace(/\)/, ''));
				}
			}
			if (sid == transformSid) {
				channel.info = {sid:sid, dotSyntax:dotSyntax, arrSyntax:arrSyntax, arrIndices:arrIndices};
				return channel;
			}
		}
		return null;
	}
	Node.prototype.getChildById = function(id, recursive) {
		if (this.id == id) {
			return this;
		}
		if (recursive) {
			for (var i = 0; i < this.nodes.length; i++) {
				var n = this.nodes[i].getChildById(id, recursive);
				if (n) {
					return n;
				}
			}
		}
		return null;
	}
	Node.prototype.getChildBySid = function(sid, recursive) {
		if (this.sid == sid) {
			return this;
		}
		if (recursive) {
			for (var i = 0; i < this.nodes.length; i++) {
				var n = this.nodes[i].getChildBySid(sid, recursive);
				if (n) {
					return n;
				}
			}
		}
		return null;
	}
	Node.prototype.getTransformBySid = function(sid) {
		for (var i = 0; i < this.transforms.length; i++) {
			if (this.transforms[i].sid == sid) return this.transforms[i];
		}
		return null;
	}
	Node.prototype.parse = function(element) {
		var url;
		
		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');
		this.type = this.type == 'JOINT' ? this.type : 'NODE';
		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'node':
					this.nodes.push((new Node()).parse(child));
					break;
				case 'instance_camera':
					break;
				case 'instance_controller':
					this.controllers.push((new InstanceController()).parse(child));
					break;
				case 'instance_geometry':
					this.geometries.push((new InstanceGeometry()).parse(child));
					break;
				case 'instance_light':
					break;
				case 'instance_node':
					url = child.getAttribute('url').replace(/^#/, '');
					var iNode = getLibraryNode(url);
					if (iNode) {
						this.nodes.push((new Node()).parse(iNode));
					}
					break;
				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':
					this.transforms.push((new Transform()).parse(child));
					break;
				case 'extra':
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
		this.channels = getChannelsForNode(this);
		bakeAnimations(this);
		this.updateMatrix();
		
		return this;
	}
	Node.prototype.updateMatrix = function() {
		this.matrix.identity();
		for (var i = 0; i < this.transforms.length; i++) {
			this.matrix.multiply(this.matrix, this.transforms[i].matrix);
		}
	}
	function Transform() {
		this.sid = "";
		this.type = "";
		this.data = [];
		this.matrix = new THREE.Matrix4();
	}
	Transform.prototype.parse = function(element) {
		this.sid = element.getAttribute('sid');
		this.type = element.nodeName;
		this.data = _floats(element.textContent);
		this.updateMatrix();
		return this;
	}
	Transform.prototype.updateMatrix = function() {
		var angle = 0;
		
		this.matrix.identity();
		
		switch (this.type) {
			case 'matrix':
				this.matrix.set(
					this.data[0], this.data[1], this.data[2], this.data[3],
					this.data[4], this.data[5], this.data[6], this.data[7],
					this.data[8], this.data[9], this.data[10], this.data[11],
					this.data[12], this.data[13], this.data[14], this.data[15]
					);
				break;
			case 'translate':
				this.matrix.setTranslation(this.data[0], this.data[1], this.data[2]);
				break;
			case 'rotate':
				angle = this.data[3] * (Math.PI / 180.0);
				this.matrix.setRotationAxis(new THREE.Vector3(this.data[0], this.data[1], this.data[2]), angle);
				break;
			case 'scale':
				this.matrix.setScale(this.data[0], this.data[1], this.data[2]);
				break;
			default:
				break;
		}
		return this.matrix;
	}

	function InstanceController() {
		this.url = "";
		this.skeleton = [];
		this.instance_material = [];
	}
	InstanceController.prototype.parse = function(element) {
		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			
			switch (child.nodeName) {
				case 'skeleton':
					this.skeleton.push(child.textContent.replace(/^#/, ''));
					break;
				case 'bind_material':
					var instances = COLLADA.evaluate(".//dae:instance_material", 
						child, 
						_nsResolver, 
						XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
						null);
					if (instances) {
						var instance = instances.iterateNext();
						while (instance) {
							this.instance_material.push((new InstanceMaterial()).parse(instance));
							instance = instances.iterateNext();	
						}
					}
					break;
				case 'extra':
					break;
				default:
					break;
			}
		}
		return this;
	}
		
	function InstanceMaterial() {
		this.symbol = "";
		this.target = "";
	}
	InstanceMaterial.prototype.parse = function(element) {
		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;
	}
	
	function InstanceGeometry() {
		this.url = "";
		this.instance_material = [];
	}
	InstanceGeometry.prototype.parse = function(element) {
		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			if (child.nodeName == 'bind_material') {
				var instances = COLLADA.evaluate(".//dae:instance_material", 
					child, 
					_nsResolver, 
					XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
					null);
				if (instances) {
					var instance = instances.iterateNext();
					while (instance) {
						this.instance_material.push((new InstanceMaterial()).parse(instance));
						instance = instances.iterateNext();	
					}
				}
				break;
			}
		}
		return this;
	}
	
	function Geometry() {
		this.id = "";
		this.mesh = null;
	}
	Geometry.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			switch (child.nodeName) {
				case 'mesh':
					this.mesh = (new Mesh(this)).parse(child);
					break;
				default:
					break;
			}
		}
		return this;
	}
	
	function Mesh(geometry) {
		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
	}
	Mesh.prototype.parse = function(element) {
		this.primitives = [];
		var i;
		for (i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			switch (child.nodeName) {
				case 'source':
					_source(child);
					break;
				case 'vertices':
					this.vertices = (new Vertices()).parse(child);
					break;
				case 'triangles':
					this.primitives.push((new Triangles().parse(child)));
					break;
				case 'polygons':
					console.warn('polygon holes not yet supported!');
				case 'polylist':
					this.primitives.push((new Polylist().parse(child)));
					break;
				default:
					break;
			}
		}
		for (i = 0; i < this.primitives.length; i++) {
			primitive = this.primitives[i];
			primitive.setVertices(this.vertices);
			primitive.create();
		}
		return this;
	}
	
	function Polylist() {
	}
	Polylist.prototype = new Triangles();
	Polylist.prototype.constructor = Polylist;
	Polylist.prototype.create = function() {
		var p = this.p, inputs = this.inputs, num_inputs = this.inputs.length;
		var idx = 0, input;
		var i, j, k, v, n, t;
		var texture_sets = [];
		var polygons = [];
		
		for (j = 0; j < inputs.length; j++) {
			input = inputs[j];
			if (input.semantic == 'TEXCOORD') {
				texture_sets.push(input.set);
			}
		}
		
		for (i = 0; i < this.vcount.length; i++) {
			var num_verts = this.vcount[i]
			var vs = [], ns = [], ts = [];
			for (j = 0; j < num_verts; j++) {
				for (k = 0; k < num_inputs; k++) {
					input = inputs[k];
					source = sources[input.source];
					index = p[idx + input.offset];
					numParams = source.accessor.params.length;
					idx32 = index * numParams;
					switch (input.semantic) {
						case 'VERTEX':
							v = new THREE.Vertex(new THREE.Vector3(source.data[idx32+0], source.data[idx32+1], source.data[idx32+2]));
							v.daeId = vs.length;
							vs.push(v);
							break;
						case 'NORMAL':
							n = new THREE.Vector3(source.data[idx32+0], source.data[idx32+1], source.data[idx32+2]);
							n.daeId = ns.length;
							ns.push(n);
							break;
						case 'TEXCOORD':
							if (ts[input.set] == undefined) ts[input.set] = [];
							t = new THREE.UV(source.data[idx32+0], (flip_uv ? 1-source.data[idx32+1] : source.data[idx32+1]));
							t.daeId = ts[input.set].length;
							ts[input.set].push(t);
							break;
						default:
							break;
					}
				}
				idx += num_inputs;
			}
			polygons.push([vs, ns, ts])
		}
		
		this.geometry = new THREE.Geometry();
		this.triangulate(polygons, texture_sets);
	}
	Polylist.prototype.triangulate = function(polygons, texture_sets) {
		var i, j, k;
		var vertex_store = {};
		var last_index = 0;
		
		function get_vertex(v)  {
			var hash = _hash_vector3(v.position);
			if (vertex_store[hash] === undefined) {
				vertex_store[hash] = {v:v, index:last_index++};
			}
			return vertex_store[hash];
		}
		
		for (i = 0; i < polygons.length; i++) {
			var polygon = polygons[i];
			var v = polygon[0];
			var n = polygon[1];
			var t = polygon[2];
			var uvs = [];
			for (j = 0; j < texture_sets.length; j++) {
				uvs.push(t[texture_sets[j]]);
			}
			var has_uv = (uvs.length > 0 && uvs[0].length > 0);
			if (v.length < 3) continue;
			var va = get_vertex(v[0]);
			var na = n[0];
			for (j = 1; j < v.length - 1; j++) {
				var vb = get_vertex(v[j]);
				var vc = get_vertex(v[j+1]);
				var a = va.index;
				var b = vb.index;
				var c = vc.index;
				var nb = n[j];
				var nc = n[j+1];
				this.geometry.faces.push( new THREE.Face3(a, b, c, [na, nb, nc] ) );
				if (has_uv) {
					for (k = 0; k < uvs.length; k++) {
						this.geometry.faceVertexUvs[ k ].push( [uvs[k][0], uvs[k][j], uvs[k][j+1]] );
					}
				}
			}
		}
		for (var hash in vertex_store) {
			this.geometry.vertices.push(vertex_store[hash].v);
		}
		this.geometry.material = this.material;
		this.geometry.computeCentroids();
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.computeBoundingBox();
	}
	
	function Triangles(flip_uv) {
		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount;
		this.p = [];
		this.aabb = new AABB();
		this.geometry = new THREE.Geometry();
	}
	Triangles.prototype.create = function() {
		var i = 0, j, k, p = this.p, inputs = this.inputs, input, index;
		var v, n, t;
		var texture_sets = [];
		var vertex_store = {};
		var last_index = 0;
		
		function get_vertex(v)  {
			var hash = _hash_vector3(v.position);
			if (vertex_store[hash] === undefined) {
				vertex_store[hash] = {v:v, index:last_index++};
			}
			return vertex_store[hash];
		}
		
		for (j = 0; j < inputs.length; j++) {
			input = inputs[j];
			if (input.semantic == 'TEXCOORD') {
				texture_sets.push(input.set);
			}
		}
		
		this.geometry = new THREE.Geometry();
		var daeIdx = 0;
		
		while (i < p.length) {
			vs = [];
			ns = [];
			ts = {};
			for (j = 0; j < 3; j++) {
				for (k = 0; k < inputs.length; k++) {
					input = inputs[k];
					source = sources[input.source];
					index = p[i + (j*inputs.length) + input.offset];
					numParams = source.accessor.params.length;
					idx32 = index * numParams;
					switch (input.semantic) {
						case 'VERTEX':
							v = new THREE.Vertex(new THREE.Vector3(source.data[idx32+0], source.data[idx32+1], source.data[idx32+2]));
							v.daeId = index;
							vs.push(v);
							break;
						case 'NORMAL':
							n = new THREE.Vector3(source.data[idx32+0], source.data[idx32+1], source.data[idx32+2]);
							n.daeId = daeIdx;
							ns.push(n);
							break;
						case 'TEXCOORD':
							if (ts[input.set] == undefined) ts[input.set] = [];
							t = new THREE.UV(source.data[idx32+0], source.data[idx32+1]);
							t.daeId = daeIdx;
							ts[input.set].push(t);
							break;
						default:
							break;
					}
				}
				
			}

			var has_v = (vs.length == 3);
			var has_t = (texture_sets.length > 0 && ts[texture_sets[0]].length == 3);
			if (has_v) {
				var a = get_vertex(vs[0]);
				var b = get_vertex(vs[1]);
				var c = get_vertex(vs[2]);
				this.geometry.faces.push( new THREE.Face3(a.index, b.index, c.index, ns ) );
				if (has_t) {
					for (k = 0; k < texture_sets.length; k++) {
						this.geometry.faceVertexUvs[ k ].push( ts[texture_sets[k]] );
					}
				}
			}
			i += 3 * inputs.length;
		}
		for (var hash in vertex_store) {
			this.geometry.vertices.push(vertex_store[hash].v);
		}
		this.geometry.material = this.material;
		this.geometry.computeCentroids();
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.computeBoundingBox();	
	}
	Triangles.prototype.setVertices = function(vertices) {
		for (var i = 0; i < this.inputs.length; i++) {
			if (this.inputs[i].source == vertices.id) {
				this.inputs[i].source = vertices.input['POSITION'].source;
			}
		}
	}
	Triangles.prototype.parse = function(element) {
		this.inputs = [];
		this.material = element.getAttribute('material');
		this.count = _attr_as_int(element, 'count', 0);
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			switch (child.nodeName) {
				case 'input':
					this.inputs.push((new Input()).parse(element.childNodes[i]));
					break;
				case 'vcount':
					this.vcount = _ints(child.textContent);
					break;
				case 'p':
					this.p = _ints(child.textContent);
					break;
				default:
					break;
			}
		}
		return this;
	}
	Triangles.prototype.calcNormals = function(v, n) {
		var i;
		var v0 = [0, 0, 0];
		var v1 = [0, 0, 0];
		var v2 = [0, 0, 0];
		var n0 = [0, 0, 0];
		for (i = 0; i < v.length; i += 9) {
			v0[0] = v[i+0]; v0[1] = v[i+1]; v0[2] = v[i+2];
			v1[0] = v[i+3]; v1[1] = v[i+4]; v1[2] = v[i+5];
			v2[0] = v[i+6]; v2[1] = v[i+7]; v2[2] = v[i+8];
			// sub
			v1[0] = v1[0] - v0[0];
			v1[1] = v1[1] - v0[1];
			v1[2] = v1[2] - v0[2];
			v2[0] = v2[0] - v0[0];
			v2[1] = v2[1] - v0[1];
			v2[2] = v2[2] - v0[2];
			// cross
			n0[0] = v1[1] * v2[2] - v1[2] * v2[1];
			n0[1] = v1[2] * v2[0] - v1[0] * v2[2];
			n0[2] = v1[0] * v2[1] - v1[1] * v2[0];
			// normalize
			length = 1.0 / Math.sqrt(n0[0]*n0[0]+n0[1]*n0[1]+n0[2]*n0[2]);
			if (length == 0) length = 1.0;
			n[i+0] = n[i+3] = n[i+6] = n0[0] * length;
			n[i+1] = n[i+4] = n[i+7] = n0[1] * length;
			n[i+2] = n[i+5] = n[i+8] = n0[2] * length;
		}
	}
	
	function AABB() {
		this.minx = 0;	this.miny = 0;	this.minz = 0;
		this.maxx = 0;	this.maxy = 0;	this.maxz = 0;
	}
	AABB.prototype.reset = function() {
		this.minx = this.miny = this.minz = Number.MAX_VALUE;
		this.maxx = this.maxy = this.maxz = Number.MIN_VALUE;
		return this;
	}
	AABB.prototype.setTriangles = function(positions) {
		this.reset();
		for (var i = 0; i < positions.length; i += 3) {
			this.minx = Math.min(this.minx, positions[i+0]); 
			this.miny = Math.min(this.miny, positions[i+1]);
			this.minz = Math.min(this.minz, positions[i+2]);
			this.maxx = Math.max(this.maxx, positions[i+0]);
			this.maxy = Math.max(this.maxy, positions[i+1]);
			this.maxz = Math.max(this.maxz, positions[i+2]);
		}
		return this;
	}
	AABB.prototype.centerX = function() { return this.minx + (this.sizeX() / 2); }
	AABB.prototype.centerY = function() { return this.miny + (this.sizeY() / 2); }
	AABB.prototype.centerZ = function() { return this.minz + (this.sizeZ() / 2); }
	AABB.prototype.sizeX = function() { return this.maxx - this.minx; }
	AABB.prototype.sizeY = function() { return this.maxy - this.miny; }
	AABB.prototype.sizeZ = function() { return this.maxz - this.minz; }
	
	function Accessor() {
		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];
	}
	Accessor.prototype.parse = function(element) {
		this.params = [];
		this.source = element.getAttribute('source');
		this.count = _attr_as_int(element, 'count', 0);
		this.stride = _attr_as_int(element, 'stride', 0);
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeName == 'param') {
				var param = {};
				param['name'] = child.getAttribute('name');
				param['type'] = child.getAttribute('type');
				this.params.push(param);
			}
		}
		return this;
	}
	
	function Vertices() {
		this.input = {};
	}
	Vertices.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		for (var i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeName == 'input') {
				input = (new Input()).parse(element.childNodes[i]);
				this.input[input.semantic] = input;
			}
		}
		return this;
	}
	
	function Input() {
		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;
	}
	Input.prototype.parse = function(element) {
		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);
		if (this.semantic == 'TEXCOORD' && this.set < 0) {
			this.set = 0;
		}
		return this;
	}
	
	function Source(id) {
		this.id = id;
		this.type = null;
	}
	Source.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			switch (child.nodeName) {
				case 'bool_array':
					this.data = _bools(child.textContent);
					this.type = child.nodeName;
					break;
				case 'float_array':
					this.data = _floats(child.textContent);
					this.type = child.nodeName;
					break;
				case 'int_array':
					this.data = _ints(child.textContent);
					this.type = child.nodeName;
					break;
				case 'IDREF_array':
				case 'Name_array':
					this.data = _strings(child.textContent);
					this.type = child.nodeName;
					break;
				case 'technique_common':
					for (var j = 0; j < child.childNodes.length; j++) {
						if (child.childNodes[j].nodeName == 'accessor') {
							this.accessor = (new Accessor()).parse(child.childNodes[j]);
							break;
						}
					}
					break;
				default:
					//console.log(child.nodeName);
					break;
			}
		}
		return this;
	}
	Source.prototype.read = function() {
		var result = [];
		//for (var i = 0; i < this.accessor.params.length; i++) {
			var param = this.accessor.params[0];
			//console.log(param.name + " " + param.type);
			switch (param.type) {
				case 'IDREF':
				case 'Name':
				case 'float':
					return this.data;
				case 'float4x4':
					for (var j = 0; j < this.data.length; j += 16) {
						var s = this.data.slice(j, j+16);
						var m = new THREE.Matrix4();
						m.set(
							s[0], s[1], s[2], s[3],
							s[4], s[5], s[6], s[7],
							s[8], s[9], s[10], s[11],
							s[12], s[13], s[14], s[15]
							);
						result.push(m);
					}
					break;
				default:
					console.log('Dae::Source:read dont know how to read ' + param.type);
					break;
			}
		//}
		return result;
	}
	function Material() {
		this.id = "";
		this.name = "";
		this.instance_effect = null;
	}
	Material.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		for (var i = 0; i < element.childNodes.length; i++) {
			if (element.childNodes[i].nodeName == 'instance_effect') {
				this.instance_effect = (new InstanceEffect()).parse(element.childNodes[i]);
				break;
			}
		}
		return this;
	}
	
	function ColorOrTexture() {
		this.color = new THREE.Color(0);
		this.color.setRGB(Math.random(), Math.random(), Math.random());
		this.color.a = 1.0;
		this.texture = null;
		this.texcoord = null;
	}
	ColorOrTexture.prototype.isColor = function() {
		return (this.texture == null);
	}
	ColorOrTexture.prototype.isTexture = function() {
		return (this.texture != null);
	}
	ColorOrTexture.prototype.parse = function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'color':
					var rgba = _floats(child.textContent);
					this.color = new THREE.Color(0);
					this.color.setRGB(rgba[0], rgba[1], rgba[2]);
					this.color.a = rgba[3];
					break;
				case 'texture':
					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					break;
				default:
					break;
			}
		}
		return this;
	}
	
	function Shader(type, effect) {
		this.type = type;
		this.effect = effect;
		this.material;
	}
	Shader.prototype.parse = function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':
					this[child.nodeName] = (new ColorOrTexture()).parse(child);
					break;
				case 'shininess':
				case 'reflectivity':
				case 'transparency':
					var f = evaluateXPath(child, ".//dae:float");
					if (f.length > 0)
						this[child.nodeName] = parseFloat(f[0].textContent);
					break;
				default:
					break;
			}
		}
		this.create();
		return this;
	}
	Shader.prototype.create = function() {
		var props = {};
		var transparent = (this['transparency'] !== undefined && this['transparency'] < 1.0);
		for (var prop in this) {
			switch (prop) {
				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
					var cot = this[prop];
					if (cot instanceof ColorOrTexture) {
						if (cot.isTexture()) {
							if (this.effect.sampler && this.effect.surface) {
								if (this.effect.sampler.source == this.effect.surface.sid) {
									var image = images[this.effect.surface.init_from];
									if (image) {
										props['map'] = THREE.ImageUtils.loadTexture(baseUrl + image.init_from);
										props['map'].wrapS = THREE.RepeatWrapping;
										props['map'].wrapT = THREE.RepeatWrapping;
									//	props['map'].repeat.x = 1;
									//	props['map'].repeat.y = 1;
									}
								}
							}
						} else {
							if (prop == 'diffuse') {
								props['color'] = cot.color.getHex();
							} else if (!transparent){
								props[prop] = cot.color.getHex();
							}
						}
					}
					break;
				case 'shininess':
				case 'reflectivity':
					props[prop] = this[prop];
					break;
				case 'transparency':
					if (transparent) {
						props['transparent'] = true;
						props['opacity'] = this[prop];
						transparent = true;
					}
					break;
				default:
					break;
			}
		}

		props['shading'] = THREE.SmoothShading;
		this.material = new THREE.MeshLambertMaterial(props);
		
		switch (this.type) {
			case 'constant':
			case 'lambert':
				break;
			case 'phong':
			case 'blinn':
			default:
				if (!transparent) {
					this.material = new THREE.MeshPhongMaterial(props);
				}
				break;
		}
		return this.material;
	}
	
	function Surface(effect) {
		this.effect = effect;
		this.init_from;
		this.format;
	}
	Surface.prototype.parse = function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'init_from':
					this.init_from = child.textContent;
					break;
				case 'format':
					this.format = child.textContent;
					break;
				default:
					console.log("unhandled Surface prop: " + child.nodeName);
					break;
			}
		}
		return this;
	}
	function Sampler2D(effect) {
		this.effect = effect;
		this.source;
		this.wrap_s;
		this.wrap_t;
		this.minfilter;
		this.magfilter;
		this.mipfilter;
	}
	Sampler2D.prototype.parse = function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'source':
					this.source = child.textContent;
					break;
				case 'minfilter':
					this.minfilter = child.textContent;
					break;
				case 'magfilter':
					this.magfilter = child.textContent;
					break;
				case 'mipfilter':
					this.mipfilter = child.textContent;
					break;
				case 'wrap_s':
					this.wrap_s = child.textContent;
					break;
				case 'wrap_t':
					this.wrap_t = child.textContent;
					break;
				default:
					console.log("unhandled Sampler2D prop: " + child.nodeName);
					break;
			}
		}
		return this;
	}
	
	function Effect() {
		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface;
		this.sampler;
	}
	Effect.prototype.create = function() {
		if (this.shader == null) {
			return null;
		}
		
	}
	Effect.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.shader = null;
		
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'profile_COMMON':
					this.parseTechnique(this.parseProfileCOMMON(child));
					break;
				default:
					break;
			}
		}
		return this;
	}
	Effect.prototype.parseNewparam = function(element) {
		var sid = element.getAttribute('sid');
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'surface':
					this.surface = (new Surface(this)).parse(child);
					this.surface.sid = sid;
					break;
				case 'sampler2D':
					this.sampler = (new Sampler2D(this)).parse(child);
					this.sampler.sid = sid;
					break;
				case 'extra':
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
	}
	Effect.prototype.parseProfileCOMMON = function(element) {
		var technique;
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'profile_COMMON':
					this.parseProfileCOMMON(child);
					break;
				case 'technique':
					technique = child;
					break;
				case 'newparam':
					this.parseNewparam(child);
					break;
				case 'extra':
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
		return technique;
	}
	Effect.prototype.parseTechnique= function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'lambert':
				case 'blinn':
				case 'phong':
					this.shader = (new Shader(child.nodeName, this)).parse(child);
					break;
				default:
					break;
			}
		}
	}
	
	function InstanceEffect() {
		this.url = "";
	}
	InstanceEffect.prototype.parse = function(element) {
		this.url = element.getAttribute('url').replace(/^#/, '');
		return this;
	}

	function Animation() {
		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];
	}
	Animation.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.source = {};
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'source':
					var src = (new Source()).parse(child);
					this.source[src.id] = src;
					break;
				case 'sampler':
					this.sampler.push((new Sampler(this)).parse(child));
					break;
				case 'channel':
					this.channel.push((new Channel(this)).parse(child));
					break;
				default:
					break;
			}
		}
		return this;
	}

	function Channel(animation) {
		this.animation = animation;
		this.source = "";
		this.target = "";
		this.sid;
		this.dotSyntax;
		this.arrSyntax;
		this.arrIndices;
		this.member;
	}
	Channel.prototype.parse = function(element) {
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.target = element.getAttribute('target');
		
		var parts = this.target.split('/');
		var id = parts.shift();
		var sid = parts.shift();
		var dotSyntax = (sid.indexOf(".") >= 0);
		var arrSyntax = (sid.indexOf("(") >= 0);
		var arrIndices;
		var member;
		
		if (dotSyntax) {
			parts = sid.split(".");
			sid = parts.shift();
			member = parts.shift();
		} else if (arrSyntax) {
			arrIndices = sid.split("(");
			sid = arrIndices.shift();
			for (var j = 0; j < arrIndices.length; j++) {
				arrIndices[j] = parseInt(arrIndices[j].replace(/\)/, ''));
			}
		}
		this.sid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;
		this.arrIndices = arrIndices;
		this.member = member;
		return this;
	}	
	function Sampler(animation) {
		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input;
		this.output;
		this.interpolation;
		this.startTime;
		this.endTime;
		this.duration = 0;
	}
	Sampler.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.inputs = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'input':
					this.inputs.push((new Input()).parse(child));
					break;
				default:
					break;
			}
		}
		return this;
	}
	Sampler.prototype.create = function() {
		for (var i = 0; i < this.inputs.length; i++) {
			var input = this.inputs[i];
			var source = this.animation.source[input.source];
			switch (input.semantic) {
				case 'INPUT':
					this.input = source.read();
					break;
				case 'OUTPUT':
					this.output = source.read();
					break;
				case 'INTERPOLATION':
					this.interpolation = source.read();
					break;
				case 'IN_TANGENT':
					break;
				case 'OUT_TANGENT':
					break;
				default:
					console.log(input.semantic);
					break;
			}
		}
		
		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;
		if (this.input.length) {
			this.startTime = 100000000;
			this.endTime = -100000000;
			for (var i = 0; i < this.input.length; i++) {
				this.startTime = Math.min(this.startTime, this.input[i]);
				this.endTime = Math.max(this.endTime, this.input[i]);
			}
			this.duration = this.endTime - this.startTime;
		}
	}
	
	function _source(element) {
		var id = element.getAttribute('id');
		if (sources[id] != undefined) {
			return sources[id];
		}
		sources[id] = (new Source(id)).parse(element);
		return sources[id];
	}
	
	function _nsResolver (nsPrefix) {
		if (nsPrefix == "dae") {
			return "http://www.collada.org/2005/11/COLLADASchema";
		}
		return null;
	}
	
	function _bools ( str ) {
		var raw = _strings(str);
		var data = [];
		var i;
		for (i = 0; i < raw.length; i++) {
			data.push((raw[i] == 'true' || raw[i] == '1') ? true : false);
		}
		return data;
	}
	
	function _floats ( str ) {
		var raw = _strings(str);
		var data = [];
		var i;
		for (i = 0; i < raw.length; i++) {
			data.push( parseFloat(raw[i]) );
		}
		return data;
	}

	function _ints ( str ) {
		var raw = _strings(str);
		var data = [];
		var i;
		for (i = 0; i < raw.length; i++) {
			data.push( parseInt(raw[i], 10) );
		}
		return data;
	}
	
	function _strings ( str ) {
		return _trimString(str).split(/\s+/);
	}

	function _trimString ( str ) {
		return str.replace(/^\s+/, "").replace(/\s+$/, "");
	}

	function _attr_as_float ( element, name, defaultValue ) {
		if ( element.hasAttribute(name) ) {
			return parseFloat(element.getAttribute(name));
		} else {
			return defaultValue;
		}
	}

	function _attr_as_int ( element, name, defaultValue ) {
		if ( element.hasAttribute(name) ) {
			return parseInt(element.getAttribute(name), 10);
		} else {
			return defaultValue;
		}
	}

	function _attr_as_string ( element, name, defaultValue ) {
		if ( element.hasAttribute(name) ) {
			return element.getAttribute(name);
		} else {
			return defaultValue;
		}
	}
	
	function _format_float(f, num) {
		if (f === undefined) {
			var s = '0.';
			while (s.length < num + 2) {
				s += '0';
			}
			return s;
		}
		var parts = f.toString().split('.');
		num = num || 2;
		parts[1] = parts.length > 1 ? parts[1].substr(0, num) : "0";
		while(parts[1].length < num) {
			parts[1] += '0';
		}
		return parts.join('.');
	}
	
	function _hash_vertex(v, n, t0, t1, precision) {
		precision = precision || 2;
		var s = v instanceof THREE.Vertex ? _hash_vector3(v.position, precision) : _hash_vector3(v, precision);
		if (n === undefined) {
			s += '_0.00,0.00,0.00';
		} else {
			s += '_' + _hash_vector3(n, precision);
		}
		if (t0 === undefined) {
			s += '_0.00,0.00';
		} else {
			s += '_' + _hash_uv(t0, precision);
		}
		if (t1 === undefined) {
			s += '_0.00,0.00';
		} else {
			s += '_' + _hash_uv(t1, precision);
		}
		return s;
	}
	
	function _hash_uv(uv, num) {
		var s = '';
		s += _format_float(uv.u, num) + ',';
		s += _format_float(uv.v, num);
		return s;
	}
	
	function _hash_vector3(vec, num) {
		var s = '';
		s += _format_float(vec.x, num) + ',';
		s += _format_float(vec.y, num) + ',';
		s += _format_float(vec.z, num);
		return s;
	}
	
	function evaluateXPath(node, query) {
		var instances = COLLADA.evaluate(query, 
			node, 
			_nsResolver, 
			XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
			null);
		var inst = instances.iterateNext();
		var result = [];
		while (inst) {
			result.push(inst);
			inst = instances.iterateNext();
		} 
		return result;
	}
	return {
		load: load,
		geometries : geometries
	};
})();

