# MAINTENANCE

Three.js constantly evolves which means these articles will be **out of date*
if not constantly maintained. Leaving up out of date articles is irresponsible
because users will come to the site and get bad info that will confuse and 
frustrate them. Keeping the articles up to date with the latest release of
three.js is therefore very important.

### Upgrading three.js to the latest version

Clone `three.js` using git in a folder above wherever you checked out threejsfundamentals.

In other words if we were starting from scratch

```bash
git clone https://github.com/gfxfundamentals/threejsfundamentals.git
git clone https://github.com/mrdoob/three.js.git
```

Then checkout the latest release in three.js. Next, run `npm run bumpthree`.

```bash
# assuming you are in the threejsfundamentals folder
cd ..
cd three.js
git fetch origin master
git checkout r132   # the release you want
cd ../threejsfundamentals
npm run bumpthree
```

This will copy the relevant files from three.js to
`threejs/resources/threejs/<release>` and attempt to update
all references in the articles and examples to point to the
new release.

After that, check the [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
for the things that need to be changed.

### Examples of things that were changed or need to be changed

* The article on `Geometry` had to be removed and the article on `BufferGeometry` updated because
  `Geometry` was removed. Sadly it was a nice example of building a heightmap but I didn't have
  time to re-write it as a different article.

* The 3D LUT article should be deleted as there is now an official 3D LUT solution in the three.js examples

* The article on how to fix the bugs in the WebGL Globe by using morph targets needs to be fixed
  as how morph targets work has changed

* rAF loops should be changed to `Renderer.setAnimationLoop`

* `TextGeometry` needs to be removed or changed in the primitives article as is no longer part of core three.js

* `ParametricGeometry` needs to be removed or changed in the primitives article as is no longer part of core three.js

* lots of minor changes, for example function names changing, functions getting deprecated, parameters changing,
  default values changing and breaking things, import statements changing, etc...

* project organization changing (the npm version of changed making it no longer useful for this project)

* Significant changes for WebGPU
