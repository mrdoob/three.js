Title: Three.js Cleanup
Description: How to use free memory used by Three.js
Category: solutions
TOC: Freeing Resources

Three.js apps often use lots of memory. A 3D model
might be 1 to 20 meg memory for all of its vertices.
A model might use many textures that even if they are
compressed into jpg files they have to be expanded
to their uncompressed form to use. Each 1024x1024
texture takes 4 to 6meg of memory.

Most three.js apps load resources at init time and
then use those resources forever until the page is
closed. But, what if you want to load and change resources
over time?

Unlike most JavaScript, three.js can not automatically
clean these resources up. The browser will clean them
up if you switch pages but otherwise it's up to you
to manage them. This is an issue of how WebGL is designed
and so three.js has no recourse but to pass on the
responsibility to free resources back to you.

You free three.js resource this by calling the `dispose` function on
[textures](threejs-textures.html), 
[geometries](threejs-primitives.html), and
[materials](threejs-materials.html).

You could do this manually. At the start you might create
some of these resources

```js
const boxGeometry = new THREE.BoxBufferGeometry(...);
const boxTexture = textureLoader.load(...);
const boxMaterial = new THREE.MeshPhongMaterial({map: texture});
```

and then when you're done with them you'd free them

```js
boxGeometry.dispose();
boxTexture.dispose();
boxMaterial.dispose();
```

As you use more and more resources that would get more and
more tedious.

To help remove some of the tedium let's make a class to track
the resources. We'll then ask that class to do the cleanup
for us.

Here's a first pass at such a class

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose) {
      this.resources.add(resource);
    }
    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
      resource.dispose();
    }
    this.resources.clear();
  }
}
```

Let's use this class with the first example from [the article on textures](threejs-textures.html).
We can create an instance of this class

```js
const resTracker = new ResourceTracker();
```

and then just to make it easier to use let's create a bound function for the `track` method

```js
const resTracker = new ResourceTracker();
+const track = resTracker.track.bind(resTracker);
```

Now to use it we just need to call `track` with for each geometry, texture, and material
we create

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
-const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
+const geometry = track(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth));

const cubes = [];  // an array we can use to rotate the cubes
const loader = new THREE.TextureLoader();

-const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
-});
+const material = track(new THREE.MeshBasicMaterial({
+  map: track(loader.load('resources/images/wall.jpg')),
+}));
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cubes.push(cube);  // add to our list of cubes to rotate
```

And then to free them we'd want to remove the cubes from the scene
and then call `resTracker.dispose`

```js
for (const cube of cubes) {
  scene.remove(cube);
}
cubes.length = 0;  // clears the cubes array
resTracker.dispose();
```

That would work but I find having to remove the cubes from the
scene kind of tedious. Let's add that functionality to the `ResourceTracker`.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
-    if (resource.dispose) {
+    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
-      resource.dispose();
+      if (resource instanceof THREE.Object3D) {
+        if (resource.parent) {
+          resource.parent.remove(resource);
+        }
+      }
+      if (resource.dispose) {
+        resource.dispose();
+      }
+    }
    this.resources.clear();
  }
}
```

And now we can track the cubes

```js
const material = track(new THREE.MeshBasicMaterial({
  map: track(loader.load('resources/images/wall.jpg')),
}));
const cube = track(new THREE.Mesh(geometry, material));
scene.add(cube);
cubes.push(cube);  // add to our list of cubes to rotate
```

We no longer need the code to remove the cubes from the scene.

```js
-for (const cube of cubes) {
-  scene.remove(cube);
-}
cubes.length = 0;  // clears the cube array
resTracker.dispose();
```

Let's arrange this code so that we can re-add the cube,
texture, and material.

```js
const scene = new THREE.Scene();
*const cubes = [];  // just an array we can use to rotate the cubes

+function addStuffToScene() {
  const resTracker = new ResourceTracker();
  const track = resTracker.track.bind(resTracker);

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = track(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth));

  const loader = new THREE.TextureLoader();

  const material = track(new THREE.MeshBasicMaterial({
    map: track(loader.load('resources/images/wall.jpg')),
  }));
  const cube = track(new THREE.Mesh(geometry, material));
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
+  return resTracker;
+}
```

And then let's write some code to add and remove things over time.

```js
function waitSeconds(seconds = 0) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function process() {
  for (;;) {
    const resTracker = addStuffToScene();
    await wait(2);
    cubes.length = 0;  // remove the cubes
    resTracker.dispose();
    await wait(1);
  }
}
process();
```

This code will create the cube, texture and material, wait for 2 seconds, then dispose of them and wait for 1 second
and repeat.

{{{example url="../threejs-cleanup-simple.html" }}}

So that seems to work.

For a loaded file though it's a little more work. Most loaders only return an `Object3D`
as a root of the hierarchy of objects they load so we need to discover what all the resources
are.

Let's update our `ResourceTracker` to try to do that.

First we'll check if the object is an `Object3D` then track its geometry, material, and children

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
+    if (resource instanceof THREE.Object3D) {
+      this.track(resource.geometry);
+      this.track(resource.material);
+      this.track(resource.children);
+    }
    return resource;
  }
  ...
}
```

Now, because any of `resource.geometry`, `resource.material`, and `resource.children`
might be null or undefined we'll check at the top of `track`.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
+    if (!resource) {
+      return resource;
+    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
    }
    return resource;
  }
  ...
}
```

Also because `resource.children` is an array and because `resource.material` can be
an array let's check for arrays

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (!resource) {
      return resource;
    }

+    // handle children and when material is an array of materials.
+    if (Array.isArray(resource)) {
+      resource.forEach(resource => this.track(resource));
+      return resource;
+    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
    }
    return resource;
  }
  ...
}
```

And finally we need to walk the properties and uniforms
of a material looking for textures.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (!resource) {
      return resource;
    }

*    // handle children and when material is an array of materials or
*    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach(resource => this.track(resource));
      return resource;
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
-    }
+    } else if (resource instanceof THREE.Material) {
+      // We have to check if there are any textures on the material
+      for (const value of Object.values(resource)) {
+        if (value instanceof THREE.Texture) {
+          this.track(value);
+        }
+      }
+      // We also have to check if any uniforms reference textures or arrays of textures
+      if (resource.uniforms) {
+        for (const value of Object.values(resource.uniforms)) {
+          if (value) {
+            const uniformValue = value.value;
+            if (uniformValue instanceof THREE.Texture ||
+                Array.isArray(uniformValue)) {
+              this.track(uniformValue);
+            }
+          }
+        }
+      }
+    }
    return resource;
  }
  ...
}
```

And with that let's take an example from [the article on loading gltf files](threejs-load-glft.html)
and make it load and free files.

```js
const gltfLoader = new THREE.GLTFLoader();
function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, resolve, undefined, reject);
  });
}

function waitSeconds(seconds = 0) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const fileURLs = [
  'resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf',
  'resources/models/3dbustchallange_submission/scene.gltf',
  'resources/models/mountain_landscape/scene.gltf',
  'resources/models/simple_house_scene/scene.gltf',
];

async function loadFiles() {
  for (;;) {
    for (const url of fileURLs) {
      const resMgr = new ResourceTracker();
      const track = resMgr.track.bind(resMgr);
      const gltf = await loadGLTF(url);
      const root = track(gltf.scene);
      scene.add(root);

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

      await waitSeconds(2);
      renderer.render(scene, camera);

      resMgr.dispose();

      await waitSeconds(1);

    }
  }
}
loadFiles();
```

and we get

{{{example url="../threejs-cleanup-loaded-files.html"}}}

Some notes about the code.

If we wanted to load 2 or more files at once and free them at
anytime we would use one `ResourceTracker` per file.

Above we are only tracking `gltf.scene` right after loading.
Based on our current implementation of `ResourceTracker` that 
will track all the resources just loaded. If we added more
things to the scene we need to decide whether or not to track them.

For example let's say after we loaded a character we put a tool
in their hand by making the tool a child of their hand. As it is
that tool will not be freed. I'm guessing more often than not
this is what we want. 

That brings up a point. Originally when I first wrote the `ResourceTracker`
above I walked through everything inside the `dispose` method instead of `track`.
It was only later as I thought about the tool as a child of hand case above
that it became clear that tracking exactly what to free in `track` was more
flexible and arguably more correct since we could then track what was loaded
from the file rather than just freeing the state of the scene graph later.

I honestly am not 100% happy with `ResourceTracker`. Doing things this
way is not common in 3D engines. We shouldn't have to guess what
resources were loaded, we should know. It would be nice if three.js
changed so that all file loaders returned some standard object with
references to all the resources loaded. At least at the moment,
three.js doesn't give us any more info when loading a scene so this
solution seems to work.

I hope you find this example useful or at least a good reference for what is
required to free resources in three.js
