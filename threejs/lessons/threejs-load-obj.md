Title: Three.js Loading a .OBJ File
Description: Loading a .OBJ File

One of the most common things people want to do with three.js
is to load and display 3D models. A common format is the .OBJ
3D format so let's try loading one.

Searching the net I found [this CC-BY-NC 3.0 windmill 3D model](https://www.blendswap.com/blends/view/69174) by [ahedov](https://www.blendswap.com/user/ahedov).

<div class="threejs_center"><img src="resources/images/windmill-obj.jpg"></div>

I downloaded the .blend file from that site, loaded it into [Blender](https://blender.org)
and exported it as an .OBJ file.

<div class="threejs_center"><img style="width: 827px;" src="resources/images/windmill-export-as-obj.jpg"></div>

I used these export options

<div class="threejs_center"><img style="width: 239px;" src="resources/images/windmill-export-options.jpg"></div>

Let's try to display it!

I started with the directional lighting example from 
[the lights article](threejs-lights.html) and I combined it with
the hemispherical lighting example so I ended up with one
`HemisphereLight` and one `DirectionalLight`. I also removed all the GUI stuff
related to adjusting the lights. I also removed the cube and sphere
that were being added to the scene.

From that the first thing we need to do is include the `THREE.OBJLoader2` loader in our scene. The `THREE.OBJLoader2` also needs the `LoadingSupport.js` file so let's add both.

```
<script src="resources/threejs/r98/js/loaders/LoadingSupport.js"></script>
<script src="resources/threejs/r98/js/loaders/OBJLoader2.js"></script>
```

Then to load the .OBJ file we create an instance of `THREE.OBJLoader2`,
pass it the URL of our .OBJ file, and pass in a callback that adds
the loaded model to our scene.

```
{
  const objLoader = new THREE.OBJLoader2();
  objLoader.load('resources/models/windmill/windmill.obj', (event) => {
    const root = event.detail.loaderRootNode;
    scene.add(root);
  });
}
```

If we run that what happens?

{{{example url="../threejs-load-obj-no-materials.html" }}}

Well it's close but we're getting errors about materials since we haven't
given the scene any matrials and .OBJ files don't have material
parameters. 

The .OBJ loader can be passed an
object of name / material pairs. When it loads the .OBJ file,
any material name it finds it will look for the corresponding material
in the map of materials set on the loader. If it finds a
material that matches by name it will use that material. If
not it will use the loader's default material.

Sometimes .OBJ files come with a .MTL file that defines
materials. In our case the exporter also created a .MTL file.
.MTL format is plain ASCII so it's easy to look at. Looking at it here

```
# Blender MTL File: 'windmill_001.blend'
# Material Count: 2

newmtl Material
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_lopatky_COL.jpg
map_Bump windmill_001_lopatky_NOR.jpg

newmtl windmill
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_base_COL.jpg
map_Bump windmill_001_base_NOR.jpg
map_Ns windmill_001_base_SPEC.jpg
```

We can see there are 2 materials referencing 5 jpg textures
but where are the texture files?

<div class="threejs_center"><img style="width: 757px;" src="resources/images/windmill-exported-files.png"></div>

All we got was a .OBJ and an .MTL file.

At least for this model it turns out the textures are embedded
in the .blend file we downloaded. We can ask blender to
export those files to by picking **File->External Data->Unpack All Into Files**

<div class="threejs_center"><img style="width: 828px;" src="resources/images/windmill-export-textures.jpg"></div>

and then chosing **Write Files to Current Directory**

<div class="threejs_center"><img style="width: 828px;" src="resources/images/windmill-overwrite.jpg"></div>

This ends up writing the files with the .blend file in a folder
called **textures**.

<div class="threejs_center"><img style="width: 758px;" src="resources/images/windmill-exported-texture-files.png"></div>

I copied those textures into the same folder I exported the .OBJ
file too.

<div class="threejs_center"><img style="width: 757px;" src="resources/images/windmill-exported-files-with-textures.png"></div>

Now that we have the textures available we can load the .MTL file.

First we need to include the `MTLLoader`

```
<script src="resources/threejs/r98/three.min.js"></script>
<script src="resources/threejs/r98/js/controls/OrbitControls.js"></script>
<script src="resources/threejs/r98/js/loaders/LoaderSupport.js"></script>
<script src="resources/threejs/r98/js/loaders/OBJLoader2.js"></script>
+<script src="resources/threejs/r98/js/loaders/MTLLoader.js"></script>
```

Then we first load the .MTL file. When it's finished loading we set the just loaded materials on to the OBJLoader2 itself and then load the .OBJ file.

```
{
+  const objLoader = new THREE.OBJLoader2();
+  objLoader.loadMtl('resources/models/windmill/windmill.mtl', null, (materials) => {
+    objLoader.setMaterials(materials);
    objLoader.load('resources/models/windmill/windmill.obj', (event) => {
      const root = event.detail.loaderRootNode;
      scene.add(root);
    });
+  });
}
```

And if we try that...

{{{example url="../threejs-load-obj-materials.html" }}}

The last thing I wanted to show is spinning the windmill. Unfortunately, .OBJ files have no hirerarchy. That means all parts of the
windmill are basically considered 1 single mesh. You can't spin the blades of the mill as they aren't separated from the rest of the building.

This is one of the main reasons why .OBJ is not really a good format. If I was to guess, the reason it's more common than other formats
is because it's simple and doesn't support many features it works more often than not. Especially if you're making something still like
an architectural image and there's no need to animate anything it's not a bad way to get static props into a scene.

Next up we'll try loading a gLTF scene. The gLTF format supports many more features.

