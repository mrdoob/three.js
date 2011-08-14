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
	var readyCallbackFunc = null;
	var baseUrl;
	
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
		
		daeScene = parseScene();
		scene = new THREE.Object3D();
		for (var i = 0; i < daeScene.nodes.length; i++) {
			scene.addChild(createSceneGraph(daeScene.nodes[i]));
		}
		
		createAnimations();

		var result = {
			scene: scene, 
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
		for (animation_id in animations) {
			createAnimation(animations[animation_id]);
		}
	}
	
	function createAnimation(animation) {
		
		for (var i = 0; i < animation.channel.length; i++) {
			var channel = animation.channel[i];
			var sampler = animation.sampler[i];
			
			var parts = channel.target.split("/");
			var id = parts.shift();
			var node = daeScene.getChildById(id, true);
			var object = scene.getChildByName(id, true);
			
			if (!node || !object) {
				console.error("Dae::createAnimation : could not find node with id=" + id);
				continue;
			}
			
			if (parts.length > 1) {
				console.log("Dae::createAnimation : can only handle simple paths [" + channel.target + "]");
				continue;
			}
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
			var transform = node.getTransformBySid(sid);
			
			sampler.create();
			switch (transform.type) {
				case 'matrix':
					//console.log(sampler.output[0]);
					break;
				default:
					break;
			}
		}
	}
	
	function createSceneGraph(node) {
		var obj = new THREE.Object3D();
		var skinned = false;
		var i;
		
		obj.name = node.id || "";
		obj.matrixAutoUpdate = false;
		obj.matrix = node.matrix;

		// controllers
		for (i =0; i < node.controllers.length; i++) {
			var controller = controllers[node.controllers[i].url];
			switch (controller.type) {
				case 'skin':
					if (geometries[controller.skin.geometry]) {
						var inst_geom = new InstanceGeometry();
						inst_geom.url = controller.skin.geometry;
						inst_geom.instance_material = node.controllers[i].instance_material;
						node.geometries.push(inst_geom);
						skinned = true;
					}
					break;
				case 'morph': // unsupported
					console.log("DAE: morph-controller not yet supported.")
				default:
					break;
			}
		}
		
		// geometries
		for (i = 0; i < node.geometries.length; i++) {
			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[instance_geometry.url];
			var shaders = {};
			
			// collect materials for this geometry instance
			if (instance_materials) {
				for (j = 0; j < instance_materials.length; j++) {
					var inst_material = instance_materials[j];
					var target = inst_material.target;
					var symbol = inst_material.symbol;
					var effect_id = materials[target].instance_effect.url;
					var effect = effects[effect_id];
					shaders[symbol] = effect;
				}
			}

			if (geometry) {
				if (!geometry.mesh || !geometry.mesh.primitives)
					continue;
					
				if (obj.name.length == 0) {
					obj.name = geometry.id;
				}
				
				var primitives = geometry.mesh.primitives;
				for (j = 0; j < primitives.length; j++) {
					var symbol = primitives[j].material;
					var effect = shaders[symbol];
					var shader = effect.shader;
					var ambient = shader.ambient ? shader.ambient.color : 0x505050;
					var diffuse = shader.diffuse ? shader.diffuse.color : 0xff0000;
					var specular = shader.specular ? shader.specular.color : null;
					var transparency = shader.transparency;
					var use_transparency = (transparency !== undefined && transparency < 1.0);
					var opacity = use_transparency ? transparency : 1.0;
					var texture;
					
					if (shader.diffuse && shader.diffuse.isTexture() && effect.sampler && effect.surface) {
						if (effect.sampler.source == effect.surface.sid) {
							var image = images[effect.surface.init_from];
							if (image) {
								texture = THREE.ImageUtils.loadTexture(baseUrl + image.init_from);
							}
						}
					}
					
					var mat = new THREE.MeshLambertMaterial( { 
						map: texture,
						color: diffuse.hex, 
						opacity: opacity, 
						transparent: use_transparency,
						shading: THREE.SmoothShading } );
					
					if (shader.type != 'lambert' && shader.shininess && specular && ambient) {
						mat = new THREE.MeshPhongMaterial( { 
							map: texture,
							ambient: ambient.hex, 
							color: diffuse.hex, 
							specular: specular.hex, 
							shininess: shader.shininess, 
							shading: THREE.SmoothShading,
							opacity: opacity,
							transparent: use_transparency } )
					}
					if (Math.abs(primitives[j].geometry.boundingBox.z[0]) < 0.01) {
						obj.matrix.n34 += Math.random() * 0.001;
					}
					if (skinned) {
						obj.addChild(new THREE.SkinnedMesh( primitives[j].geometry, mat ));
					} else {
						obj.addChild(new THREE.Mesh( primitives[j].geometry, mat ));
					}
				}
			}
		}
		
		for (i = 0; i < node.nodes.length; i++) {
			obj.addChild(createSceneGraph(node.nodes[i]));
		}
		
		return obj;
	}
	
	function getLibraryNode(id) {
		return COLLADA.evaluate(".//dae:library_nodes//dae:node[@id='"+id+"']", 
			COLLADA, 
			_nsResolver, 
			XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
			null).iterateNext();
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
				default:
					break;
			}
		}
		return this;
	}
	function Skin() {
		this.geometry = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];
	}
	Skin.prototype.parse = function(element) {
		var sources = {};
		var joints, weights;
		this.geometry = element.getAttribute('source').replace(/^#/, '');
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'bind_shape_matrix':
					this.bindShapeMatrix = new THREE.Matrix4(_floats(child.textContent));
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
		this.matrix = new THREE.Matrix4();
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
	
	function Triangles() {
		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.p = [];
		this.aabb = new AABB();
		this.geometry = new THREE.Geometry();
	}
	Triangles.prototype.create = function() {
		var i = 0, j, k, p = this.p, inputs = this.inputs, input, index;
		var v, n, t;
		var texture_sets = [];
		
		for (j = 0; j < inputs.length; j++) {
			input = inputs[j];
			if (input.semantic == 'TEXCOORD') {
				texture_sets.push(input.set);
			}
		}
		
		this.geometry = new THREE.Geometry();

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
							t = new THREE.UV(source.data[idx32+0], source.data[idx32+1]);
							t.daeId = ts[input.set].length;
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
				var c = this.geometry.vertices.length;
				this.geometry.vertices.push(vs[0], vs[1], vs[2]);
				this.geometry.faces.push( new THREE.Face3(c+0, c+1, c+2, ns ) );
				if (has_t) {
					for (k = 0; k < texture_sets.length; k++) {
						this.geometry.faceVertexUvs[ k ].push( ts[texture_sets[k]] );
					}
				}
			}
			i += 3 * inputs.length;
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
				case 'Name':
				case 'float':
					return this.data;
				case 'float4x4':
					for (var j = 0; j < this.data.length; j += 16) {
						result.push(new THREE.Matrix4(this.data.slice(j, j+16)));
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
	
	function Shader(type) {
		this.type = type;
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
		return this;
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
	Effect.prototype.parse = function(element) {
		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'profile_COMMON':
					this.parseProfileCOMMON(child);
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
				default:
					console.log(child.nodeName);
					break;
			}
		}
	}
	Effect.prototype.parseProfileCOMMON = function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'profile_COMMON':
					this.parseProfileCOMMON(child);
					break;
				case 'technique':
					this.parseTechnique(child);
					break;
				case 'newparam':
					this.parseNewparam(child);
					break;
				default:
					console.log(child.nodeName);
					break;
			}
		}
	}
	Effect.prototype.parseTechnique= function(element) {
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i];
			if (child.nodeType != 1) continue;
			switch (child.nodeName) {
				case 'lambert':
				case 'blinn':
				case 'phong':
					this.shader = (new Shader(child.nodeName)).parse(child);
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
	}
	Channel.prototype.parse = function(element) {
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.target = element.getAttribute('target');
		return this;
	}	
	function Sampler(animation) {
		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input;
		this.output;
		this.interpolation;
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
				default:
					console.log(input.semantic);
					break;
			}
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

