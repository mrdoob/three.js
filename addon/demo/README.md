# WebGL Quad Tree Sphere

A WebGL/Three.js implementaiton of a quadtree planet.

##Repository Contents

* `build`			              - The build script for producing the packaged minified scripts.

* `demo/`			              - A number of example implementations of the Quad Tree Sphere
  * `scripts/`			          - Scripts used by the demos including minified versions of the QuadTreeSphere library and its delegate worker.
  * `shadedSphere.html`           - A basic sphere with each level of depth shaded slightly off of the primary color.
  * `depthMapping.html`           - (SOON) An example of how to depth map quad tree sphere.
  * `proceduralLandscape.html`    - (SOON) A procedural landscape generated in real time.
	
* `src/`                          - The main source files for the project.
  * `worker/`                     - The worker and it's componants that perform the quadtree work.

* `bin/`                          - The output directory for the build script.


##Bulding Project


##### Build Script Dependencies

Builds depend on uglify-js to perform minification.

```

sudo npm -g install uglify-js

```

##### Build Script

Once you have uglify-js installed simply run the build script.

```

./build

```

The build will generate a bin folder in which you will find minified files. The library and its delegate worker.

* `bin/`
	* `QuadSphere.min.js`          - The quad tree sphere.
	* `QuadSphereWorker.min.js`    - The worker delegate for the QuadSphere


##### Build Cleanup

To clean the builds from the working directory run

```

./build clean

```

## How To Use

The QuadTreeSphere consists of three main parts a QuadMaterialBuilder, the QuadTreeSphere its self, and a QuadTreeSphereWorker to which the majority of the computational work is delgated to.


### QuadMaterialBuilder
The material builder is called for each quad when it is created to provide you an opertunity to define the material that will be used when rendering that quads geometry.

```javascript

var quadMaterial = new QuadMaterialBuilder({

	onCreate: function () {
		// NOP
	},

	buildMaterialForQuad: function (centerPoint, position, radius, width) {

	    var color = new THREE.Color();

		var decimalColor = ((width/1E11) * 16777215);

	    var R =	 decimalColor%256;
	    var G =	 (decimalColor/256)%256;
	    var B =	 Math.sin(width);

	    color.r = R;
	    color.g = G;
	    color.b = B;

		return new THREE.MeshBasicMaterial({wireframe: true, color: color});
	
	}

});

```

### QuadTreeSphere

The quad tree sphere requires a path to the **QuadTreeSphereWorker** which is used to delegate the cpu intensive work of the quad tree splitting and merging. A **camera** is needed to track where the observer is with relation to the quad tree sphere. The **radius** of the sphere to be drawn. The **patchSize** of the patches. A **scene** to render into. The field of view or **fov**. And the **quadMaterial** builder.

```javascript

var quadSphere = new THREE.QuadTreeSphere({
	workerPath: "scripts/QuadTreeSphereWorker.min.js",
	camera: camera,
	radius: quadSphereRadius,
	patchSize: 16,
	scene: scene,
	fov: 30,
	quadMaterial: quadMaterial
});

```

### Render Loop

To tell the QuadTreeSphere to update you need to call it's update method during the main render loop of your application.

```javascript

var render = function () {

    quadSphere.update();
	
    renderer.render(scene, camera);
	
    requestAnimationFrame(render);
	
};

```



## Running Demos

Simply start a python simple http server

```

cd demo
python -m SimpleHTTPServer

```


<p align="center">
	<a href="https://vimeo.com/87995646"><img src="https://secure-b.vimeocdn.com/ts/466/301/466301987_640.jpg" /></a>
</p>

![QuadSphere](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/quad-sphere.png)
![DisplacementTest](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/displacement-test.png)
![HorizonTest](https://raw.github.com/merpnderp/webglquadtreeplanet/master/documentation/horizon-test.png)
