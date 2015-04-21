THREE.QuadTreeSphere = function (options) {
	
    THREE.Object3D.call(this);
	
    this.isInitialized = false;
    this.pause = false;
    this.meshes = {};
    this.meshBuildTimeAvg = 0;
	

	
	
	this.initializeOptions(options);
	
	this.initializeWorker();
	
	this.updateCounter = 0;
	this.avg = 0;
	
};

THREE.QuadTreeSphere.prototype = Object.create(THREE.Object3D.prototype);



THREE.QuadTreeSphere.prototype.initializeOptions = function (options, callback) {
	
	this.workerPath = options.workerPath || "QuadTreeSphereWorker.js";
	
	this.configureCamera(options.camera);

    this.scene = options.scene;
    this.radius = options.radius;
    this.patchSize = options.patchSize;
    this.fov = options.fov;
	
	this.quadMaterial = options.quadMaterial;
	
};

THREE.QuadTreeSphere.prototype.configureCamera = function ( camera ) {
	
    this.camera = camera;
    this.cameraHeight = 0;
	
};


THREE.QuadTreeSphere.prototype.initializeWorker = function () {

    this.worker = new Worker(this.workerPath);
    this.worker.onmessage = this.onWorkerMessage.bind(this);

    this.worker.postMessage({
		Init: {
			radius: this.radius,
			patchSize: this.patchSize,
			fov: this.fov,
			screenWidth: screen.width
		}
	});
	
};

THREE.QuadTreeSphere.prototype.update = function () {

    return function () {

		var localCameraPosition;
		
        if (!this.isInitialized) {
            return;
        }
		
        localCameraPosition = this.worldToLocal(this.camera.position.clone());
        this.cameraHeight = localCameraPosition.length() - this.radius;
        if (this.pause) {
            return;
        }
		
        this.worker.postMessage({
			update: {
				localCameraPosition: localCameraPosition,
				started: performance.now()
			}
		});
    }
}();



THREE.QuadTreeSphere.prototype.onWorkerMessage = function (event) {

    // var me = this;
	
	// Local reference so we don't have to scope traverse in the JIT compiler
	var data = event.data;

    if (data.isInitialized) {
        this.isInitialized = true;
        return;
    }
	
	// Is this akin to an Error?
    if (data.log) {
        console.log(data.log);
        return;
    }

    if (data.deletedMeshes) {
        data.deletedMeshes.forEach(this.removeMesh.bind(this));
    }

    if (data.newMeshes) {
        if (data.newMeshes.length > 0) {

            this.updateCounters += 1;
            this.avg += (performance.now() - data.started);
			
            this.meshBuildTimeAvg = this.avg / (this.updateCounters);
			
            if ( this.updateCounters % 10 == 0 ) {
				
                this.avg = 0;
				this.updateCounters= 0;
				
            }
        }
		
        data.newMeshes.forEach(this.buildNewMesh.bind(this));
    }
    
     console.log(Date.now() - data.started);
     console.log(data.finished);
     console.log(data);
    
};

/**
 * Remove a mesh from the scene and the THREE.QuadTreeSphere.
 */
THREE.QuadTreeSphere.prototype.removeMesh = function (name) {

    this.scene.remove(this.meshes[name]);
    delete this.meshes[name];
    console.log("Deleting: " + name);

};

THREE.QuadTreeSphere.prototype.buildNewMesh = function (mesh) {


    var buff = new THREE.BufferGeometry();
	
	
  //  buff.attributes.position = {};
  buff.addAttribute( 'position', new THREE.BufferAttribute( mesh.positions, 3 ) );
    //buff.attributes.position.array = mesh.positions;
    //buff.attributes.position.itemSize = 3;
   
     //buff.attributes.normal = {};
  buff.addAttribute( 'normal', new THREE.BufferAttribute( mesh.normals, 3 ) );
     //buff.attributes.normal.array = mesh.normals;
     //buff.attributes.normal.itemSize = 3;
     
    //buff.attributes.uv = {};
  buff.addAttribute( 'uv', new THREE.BufferAttribute( mesh.uvs, 2 ) );
    //buff.attributes.uv.array = mesh.uvs;
    //buff.attributes.uv.itemSize = 2;

    buff.computeBoundingSphere();
	
	
	
	
	var newMesh = new THREE.Mesh(
		buff, 
		this.quadMaterial.buildMaterial(
			new THREE.Vector3(mesh.center.x, mesh.center.y, mesh.center.z),
			this.position,
			this.radius,
			mesh.width
		)
	);
	
    newMesh.position.x = mesh.center.x;
    newMesh.position.y = mesh.center.y;
    newMesh.position.z = mesh.center.z;
    newMesh.position.add(this.position);

    this.scene.add(newMesh);
    this.meshes[mesh.name] = newMesh;
	
	delete mesh;
}


