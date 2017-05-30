importScripts("Three.Lite.js", "Vector2.js", "Vector3.js", "QuadBuilder.js", "QuadTree.js", "TreeNode.js");

var QuadTreeSphereWorker = function () {
	
	// console.log("QuadTreeSphereWorker Spawned.");
	
	self.onmessage = this.handleMessage.bind(this);
};

QuadTreeSphereWorker.prototype = {
	
	handleMessage: function (event) {
	    if (event.data.Init) {
	        this.Init(event.data.Init);
	    }
	    if (event.data.update) {
	        this.update(event.data.update);
	    }
	},
	
	log: function (text) {
        self.postMessage({
			log: text
		});
    },
	
	update: function (data) {
		
		this.log("Worker says update called");
		
	    this.returnObject = {
			started: data.started,
			newMeshes: [],
			deletedMeshes: []
		};
	
	
	    this.meshesToAdd = [];


	    //Get local position of player
	    this.localCameraPosition = new THREE.Vector3(data.localCameraPosition.x, data.localCameraPosition.y, data.localCameraPosition.z);
	    this.localCameraPlanetProjectionPosition = this.localCameraPosition.clone().normalize().multiplyScalar(this.radius);
	    //this.cameraHeight = this.localCameraPosition.distanceTo(this.position) - this.radius;
	    this.cameraHeight = this.localCameraPosition.length() - this.radius;

	    this.localCameraMaxAngle = Math.acos(this.radius / (this.cameraHeight + this.radius));

	    this.cameraHeight = this.cameraHeight > 0 ? this.cameraHeight : this.radius + 1;
	    // this.log = function (text) {
	    //     self.postMessage({log: text});
	    // };
	    this.quadTrees.forEach(function (tree) {
	        tree.rootNode.update();
	    });
	    this.quadTrees.forEach(function (tree) {
	        tree.rootNode.checkNeighbors();
	    });

	    this.quadTrees.forEach(function (tree) {
	        tree.rootNode.Draw();
	    });


	    self.postMessage(this.returnObject, this.meshesToAdd);

	},
	
	RemoveFromDeletedMeshes: function (name) {
		
	    for (var i = 0, length = this.returnObject.deletedMeshes; i < length; i++) {
	        if (this.returnObject.deletedMeshes[i] == name) {
	            this.returnObject.deletedMeshes.splice(i, 1);
	            return;
	        }
	    }
		
	},
	
	Init: function (data) {

		this.log("Worker says Init called");
	
	    this.radius = data.radius;
	    this.patchSize = data.patchSize;
	    this.fov = data.fov;
	    // this.geometryProvider = new GeometryProvider(this.patchSize);
	    this.vs = Math.tan(this.fov / data.screenWidth);
	    this.quadTrees = [];
	    this.splitTable = [];
	    this.BuildSplitTable();
	    this.InitQuadTrees();
	    this.AssignNeighbors();
	    self.postMessage({isInitialized: true});
	},
	
	BuildSplitTable: function () {
	    var patchPixelWidth, i = 0, patchSize = this.patchSize;
	    while (i < 200) {
	        patchPixelWidth = (Math.PI * this.radius * 2) / (patchSize * 6);
	        this.splitTable[i] = patchPixelWidth / this.vs;
	        patchSize = patchSize * 2;
	        if (this.splitTable[i] < 3) {
	            this.maxLevel = i;
	            break;
	        }
	        i++;
	    }
	},
	
	InitQuadTrees: function () {
		
	    var nearCorner = new THREE.Vector3(1, 1, 1).multiplyScalar(this.radius);
	    var farCorner = nearCorner.clone().multiplyScalar(-1);
		
	    //Near quadtrees
	    this.quadTrees.push(new THREE.QuadTree({name: "Bottom", corner: nearCorner, widthDir: new THREE.Vector3(0, 0, -1), heightDir: new THREE.Vector3(-1, 0, 0), planet: this}));
	    this.quadTrees.push(new THREE.QuadTree({name: "Front", corner: nearCorner, widthDir: new THREE.Vector3(-1, 0, 0), heightDir: new THREE.Vector3(0, -1, 0), planet: this}));
	    this.quadTrees.push(new THREE.QuadTree({name: "Left", corner: nearCorner, widthDir: new THREE.Vector3(0, -1, 0), heightDir: new THREE.Vector3(0, 0, -1), planet: this}));
	    
		//Far quadtrees
	    this.quadTrees.push(new THREE.QuadTree({name: "Top", corner: farCorner, widthDir: new THREE.Vector3(1, 0, 0), heightDir: new THREE.Vector3(0, 0, 1), planet: this}));
	    this.quadTrees.push(new THREE.QuadTree({name: "Back", corner: farCorner, widthDir: new THREE.Vector3(0, 1, 0), heightDir: new THREE.Vector3(1, 0, 0), planet: this}));
	    this.quadTrees.push(new THREE.QuadTree({name: "Right", corner: farCorner, widthDir: new THREE.Vector3(0, 0, 1), heightDir: new THREE.Vector3(0, 1, 0), planet: this}));

	},
	
	AssignNeighbors: function () {
		
	    var bottom = this.quadTrees[0].rootNode;
	    var front = this.quadTrees[1].rootNode;
	    var left = this.quadTrees[2].rootNode;
	    var top = this.quadTrees[3].rootNode;
	    var back = this.quadTrees[4].rootNode;
	    var right = this.quadTrees[5].rootNode;

	    this.quadTrees[0].AssignNeighbors(left, back, right, front);
	    this.quadTrees[1].AssignNeighbors(left, top, right, bottom);
	    this.quadTrees[2].AssignNeighbors(bottom, back, top, front);
	    this.quadTrees[3].AssignNeighbors(right, front, left, back);
	    this.quadTrees[4].AssignNeighbors(top, left, bottom, right);
	    this.quadTrees[5].AssignNeighbors(back, bottom, front, top);
		
	}
}


var worker = new QuadTreeSphereWorker();