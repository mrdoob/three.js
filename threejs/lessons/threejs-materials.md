Title: Three.js Materials
Description: Materials in Three.js

This article is part of a series of articles about three.js. The
first article is [three.js fundamentals](three-fundamentals.html). If
you haven't read that yet and you're new to three.js you might want to
consider starting there.
 
Three.js provides several types of materials. 
They define how objects will appear in the scene.
Which materials you use really depends on what you're trying to
accomplish.

There are 2 ways to set most material properties. One at creation time which
we've seen before.

```
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // red (can also use a CSS color string here)
  flatShading: true,
});
```

The other is after creation

```
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // red
material.flatShading = true;
```

note that properties of type `THREE.Color` have multiple ways to be set.

```
material.color.set(0x00FFFF);    // same as CSS's #RRGGBB style
material.color.set(cssString);   // any CSS color, eg 'purple', '#F32', 
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // some other THREE.Color
material.color.setHSL(h, s, l)   // where h, s, and l are 0 to 1
material.color.setRGB(r, g, b)   // where r, g, and b are 0 to 1                      
```

And at creation time you can pass either a hex number or a CSS string

```
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // red
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // red
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // red
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // red
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'); // red
```

So let's go over three.js's set of materials.

The `MeshBasicMaterial` is not affected by lights. 
The `MeshLambertMaterial` computes lighting only at the vertices vs the `MeshPhongMaterial` which computes lighting at every pixel. The `MeshPhongMaterial`
also supports specular highlights.

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterial" ></div>
    <div class="code">Basic</div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterial" ></div>
    <div class="code">Lambert</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterial" ></div>
    <div class="code">Phong</div>
  </div>
</div>
<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialLowPoly" ></div>
  </div>
</div>
<div class="threejs_center code">low-poly models with same materials</div>

The `shininess` setting of the `MeshPhongMaterial` determines the *shininess* of the specular highlight. It defaults to 30.

<div class="spread">
  <div>
    <div data-diagram="MeshPhongMaterialShininess0" ></div>
    <div class="code">shininess: 0</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess30" ></div>
    <div class="code">shininess: 30</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess150" ></div>
    <div class="code">shininess: 150</div>
  </div>
</div>

Note that setting the `emissive` property to a color on either a 
`MeshLambertMaterial` or a `MeshPhongMaterial` and setting the `color` to black
(and `shininess` to 0 for phong) ends up looking just like the `MeshBasicMaterial`.

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialCompare" ></div>
    <div class="code">
      <div>Basic</div>
      <div>color: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialCompare" ></div>
    <div class="code">
      <div>Lambert</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialCompare" ></div>
    <div class="code">
      <div>Phong</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
      <div>shininess: 0</div>
    </div>
  </div>
</div>

Why have all 3 when `MeshPhongMaterial` can do the same things as `MeshBasicMaterial`
and `MeshLambertMaterial`? The reason is the more sophisticated material
takes more GPU power to draw. On a slower GPU like say a mobile phone
you might want to reduce the GPU power needed to draw your scene by
using one of the less complex materials. It also follows that if you
don't need the extra features then use the simplest material. If you don't
need the lighting and the specular highlight then use the `MeshBasicMaterial`.

The `MeshToonMaterial` is similar to the `MeshPhongMaterial`
with one big difference. Rather than shading smoothly it uses a gradient map 
(an X by 1 texture) to decide how to shade. The default uses a gradient map
that is 70% brightness for the first 70% and 100% after but you can supply your
own gradient map. This ends up giving a 2 tone look that looks like a cartoon.

<div class="spread">
  <div data-diagram="MeshToonMaterial"></div>
</div>

There are 3 materials that have special uses. `ShadowMaterial`
is used to get the data created from shadows. We haven't
covered shadows yet. When we do we'll use this material
to take a peak at what's happening behind the scenes.

The `MeshDepthMaterial` renders the depth of each pixel where
pixels at negative [`near`](PerspectiveCamera.near) of the camera are 0 and negative [`far`](PerspectiveCamera.far) are 1. Certain special effects can use this data which we'll
get into at another time.

<div class="spread">
  <div>
    <div data-diagram="MeshDepthMaterial"></div>
  </div>
</div>

The `MeshNormalMaterial` will show you the *normals* of geometry.
*Normals* are the direction a particular triangle or pixel faces. 
`MeshNormalMaterial` draws the view space normals. (the normals relative to the camera).
<span class="color:red;">x is red</span>,
<span class="color:green;">y is green</span>, and
<span class="color:blue;">z is blue</span> so things facing
to the right will be red, up will be green, and toward the screen will be blue.

<div class="spread">
  <div>
    <div data-diagram="MeshNormalMaterial"></div>
  </div>
</div>

`ShaderMaterial` is for making custom materials using three.js shader
system. `RawShaderMaterial` is for making entirely custom shaders with
no help from three.js. Both of these topics are large and will be
covered later.

The last 2 materials we'll mention here are the `MeshStandardMaterial`
and the `MeshPhysicsMaterial`. Both implement what's called *physically
based rendering* or often PBR for short. This is a way of computing
material properties and lights that comes close to the way
lights and materials work in the real word. We'll cover these in
more detail in another article.

Most materials share a bunch of settings all defined by `Material`.
[See the docs](Material)
for all of them but let's go over two of the most commonly used
properties.

[`flatShading`](Material.flatShading): 
whether or not the object looks faceted or smooth. default = `false`.

<div class="spread">
  <div>
    <div data-diagram="smoothShading"></div>
    <div class="code">flatShading: false</div>
  </div>
  <div>
    <div data-diagram="flatShading"></div>
    <div class="code">flatShading: true</div>
  </div>
</div>

[`side`](Material.side): which sides of triangles to show. The default is `THREE.FrontSide`.
Other options are `THREE.BackSide` and `THREE.DoubleSide` (both sides).
Most 3D objects drawn in three are probably opaque solids so the back sides
(the sides facing inside the solid) do not need to be drawn. The most common
reason to set `side` is for planes or other non-solid objects where it is
common to see the back sides of triangles.

Here are 6 planes drawn with `THREE.FrontSide` and `THREE.DoubleSide`.

<div class="spread">
  <div>
    <div data-diagram="sideDefault" style="height: 250px;"></div>
    <div class="code">side: THREE.FrontSide</div>
  </div>
  <div>
    <div data-diagram="sideDouble" style="height: 250px;"></div>
    <div class="code">side: THREE.DoubleSide</div>
  </div>
</div>

There's really a lot to consider with materials and we actually still
have a bunch more to go. In particular we've mostly ignored textures
which open up a whole slew of options. Before we cover textures though
we need to take a break and cover 
[setting up your development environment](threejs-setup.html)

<div class="threejs_bottombar">
<h3>material.needsUpdate</h3>
<p>
This topic rarely affects most three.js apps but just as an FYI...
Three.js applies material settings when a material is used where "used" 
means "something is rendered that uses the material". Some material settings are
only applied once as changing them requires lots of work by three.js.
In those cases you need to set <code>material.needsUpdate = true</code> to tell
three.js to apply your material changes. The most common settings
that require you to set <code>needsUpdate</code> if you change the settings after
using the material are:
</p>
<ul>
  <li><code>flatShading</code></li>
  <li>adding or removing a texture.
    <p>
    Changing a texture is ok, but if want switch from using no texture 
    to using a texture or from using a texture to using no texture 
    then you need to set <code>needsUpdate = true</code>.
    </p>
    <p>In the case of going from texture to no-texture it is often
    just better to use a 1x1 pixel white texture.</p>
  </li>
</ul>
<p>As mentioned above most apps never run into these issues. Most apps
do not switch between flat shaded and non flat shaded. Most apps also
either use textures or a solid color for a given material, they rarely
switch from using one to using the other.
</p>
</div>

<canvas id="c"></canvas>
<script src="../resources/threejs/r94/three.min.js"></script>
<script src="../resources/threejs/r94/js/controls/TrackballControls.js"></script>
<script src="resources/threejs-lesson-utils.js"></script>
<script src="resources/threejs-materials.js"></script>


