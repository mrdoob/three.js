"use strict";

/**
 * THREE.GCodeLoader is used to load gcode files usually used for 3D printing or CNC applications.
 *
 * Gcode files are composed by commands used by machines to create objects.
 *
 * @class THREE.GCodeLoader
 * @param {Manager} manager Loading manager.
 * @author tentone
 * @author joewalnes
 */
THREE.GCodeLoader = function(manager)
{
	this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
}

THREE.GCodeLoader.prototype.load = function(url, onLoad, onProgress, onError)
{
	var self = this;

	var loader = new THREE.FileLoader(self.manager);
	loader.setPath(this.path);
	loader.load(url, function(text)
	{

		onLoad(self.parse(text));

	}, onProgress, onError);
};

THREE.GCodeLoader.prototype.parse = function(data)
{
	var currentState = {x:0, y:0, z:0, e:0, f:0, extruding:false};
	var currentLayer = undefined;
	var relative = false;

	var box = new THREE.Box3();
	var layers = [];
	
	var pathMaterial = new THREE.LineBasicMaterial({color: 0xFFFF00});
	pathMaterial.name = "path";

	var extrudingMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
	extrudingMaterial.name = "extruded";

	function newLayer(line)
	{
		currentLayer = {lines: [], currentLayer: layers.length, z: line.z};
		layers.push(currentLayer);
	}

	function getLineGroup(line)
	{
		if(currentLayer === undefined)
		{
			newLayer(line);
		}

		var grouptype = line.extruding ? 1 : 0;

		if(currentLayer.lines[grouptype] === undefined)
		{
			currentLayer.lines[grouptype] =
			{
				type: grouptype,
				feed: line.e,
				extruding: line.extruding,
				geometry: new THREE.Geometry(),
				material: line.extruding ? extrudingMaterial : pathMaterial,
				segmentCount: 0
			};
		}

		return currentLayer.lines[grouptype];
	}

	//Create lie segment between p1 and p2
	function addSegment(p1, p2)
	{
		var group = getLineGroup(p2);
		var geometry = group.geometry;
		
		group.segmentCount++;
		geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
		geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));

		if(p2.extruding)
		{
			box.min.set(Math.min(box.min.x, p2.x), Math.min(box.min.y, p2.y), Math.min(box.min.z, p2.z));
			box.max.set(Math.max(box.max.x, p2.x), Math.max(box.max.y, p2.y), Math.max(box.max.z, p2.z));
		}
	}

	function delta(v1, v2)
	{
		return relative ? v2 : v2 - v1;
	}

	function absolute (v1, v2)
	{
		return relative ? v1 + v2 : v2;
	}

	var lines = data.replace(/;.+/g,'').split("\n");

	for(var i = 0; i < lines.length; i++)
	{
		var tokens = lines[i].split(" ");
		var cmd = tokens[0].toUpperCase();

		//Argumments
		var args = {};
		tokens.splice(1).forEach(function(token) 
		{ 
			if(token[0] !== undefined)
			{
				var key = token[0].toLowerCase(); 
				var value = parseFloat(token.substring(1)); 
				args[key] = value; 
			}
		}); 

		//Process commands
		//G0/G1 – Linear Movement
		if(cmd === "G0" || cmd === "G1")
		{
			var line =
			{
				x: args.x !== undefined ? absolute(currentState.x, args.x) : currentState.x,
				y: args.y !== undefined ? absolute(currentState.y, args.y) : currentState.y,
				z: args.z !== undefined ? absolute(currentState.z, args.z) : currentState.z,
				e: args.e !== undefined ? absolute(currentState.e, args.e) : currentState.e,
				f: args.f !== undefined ? absolute(currentState.f, args.f) : currentState.f,
			};

			//Layer change detection is or made by watching Z, it"s made by watching when we extrude at a new Z position
			if(delta(currentState.e, line.e) > 0)
			{
				line.extruding = delta(currentState.e, line.e) > 0;
				if(currentLayer == undefined || line.z != currentLayer.z)
				{
					newLayer(line);
				}
			}

			addSegment(currentState, line);
			currentState = line;
		}
		//G2/G3 - Arc Movement (G2 clock wise and G3 counter clock wise)
		else if(cmd === "G2" || cmd === "G3")
		{
			console.warn("THREE.GCodeLoader: Arc command not supported");
		}
		//G90: Set to Absolute Positioning
		else if(cmd === "G90")
		{
			relative = false;
		}
		//G91: Set to Relative Positioning
		else if(cmd === "G91")
		{
			relative = true;
		}
		//G92: Set Position
		else if(cmd === "G92")
		{
			var line = currentState;
			line.x = args.x !== undefined ? args.x : line.x;
			line.y = args.y !== undefined ? args.y : line.y;
			line.z = args.z !== undefined ? args.z : line.z;
			line.e = args.e !== undefined ? args.e : line.e;
			currentState = line;
		}
		else
		{
			console.warn("THREE.GCodeLoader: Command not supported:" + cmd);
		}
	}

	var object = new THREE.Object3D();
	object.name = "gcode";

	for(var i = 0; i < layers.length; i++)
	{
		var layer = layers[i];

		for(var j = 0; j < layer.lines.length; j++)
		{
			var line = layer.lines[j];
			if(line !== undefined)
			{
				var segments = new THREE.LineSegments(line.geometry, line.material);
				segments.name = "layer" + i;
				object.add(segments);
			}
		}
	}
	
	return object;
};
