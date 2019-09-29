Title: Three.js Voxel(Minecraft Like) Geometry
Description: How to make voxel geometry like Minecraft
TOC: Making Voxel Geometry (Minecraft)

I've seen this topic come up more than once in various places.
That is basically, "How do I make a voxel display like Minecraft".

Most people first attempt this by making a cube geometry and then
making a mesh at each voxel position. Just for fun I tried
this. I made a 16777216 element `Uint8Array` to represent
a 256x256x256 cube of voxels.

```js
const cellSize = 256;
const cell = new Uint8Array(cellSize * cellSize * cellSize);
```

I then made a single layer with a kind of hills of 
sine waves like this

```js
for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const height = (Math.sin(x / cellSize * Math.PI * 4) + Math.sin(z / cellSize * Math.PI * 6)) * 20 + cellSize / 2;
      if (height > y && height < y + 1) {
        const offset = y * cellSize * cellSize +
                       z * cellSize +
                       x;
        cell[offset] = 1;
      }
    }
  }
}
```

I then walked through all the cells and if they were not
0 I created a mesh with a cube.

```js
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({color: 'green'});

for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const offset = y * cellSize * cellSize +
                     z * cellSize +
                     x;
      const block = cell[offset];
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
    }
  }
}
```

The rest of the code is based on the example from
[the article on rendering on demand](threejs-rendering-on-demand.html).

{{{example url="../threejs-voxel-geometry-separate-cubes.html" }}}

It takes a while to start and if you try to move the camera
it's likely too slow. Like [the article on how to optimize lots of objects](threejs-optimize-lots-of-objects.html)
the problem is there are just way too many objects. 256x256
is 65536 boxes!

Using [the technique of merging the geometry](threejs-rendering-on-demand.html)
will fix the issue for this example but what if instead of just making
a single layer we filled in everything below the ground with voxel. 
In otherwords change the loop filling in the voxels to this

```js
for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const height = (Math.sin(x / cellSize * Math.PI * 4) + Math.sin(z / cellSize * Math.PI * 6)) * 20 + cellSize / 2;
-      if (height > y && height < y + 1) {
+      if (height < y + 1) {
        const offset = y * cellSize * cellSize +
                       z * cellSize +
                       x;
        cell[offset] = 1;
      }
    }
  }
}
```

I tried it once just to see the results. It churned for
about a minute and then crashed with *out of memory* 😅

There are several issues but the biggest issue is
we're making all these faces inside the cubes that
we can actually never see.

In other words lets say we have a box of voxels
3x2x2. By merging cubes we're getting this

<div class="spread">
  <div data-diagram="mergedCubes" style="height: 300px;"></div>
</div>

but we really want this

<div class="spread">
  <div data-diagram="culledCubes" style="height: 300px;"></div>
</div>

In the top box there are faces between the voxels. Faces
that are a waste since they can't be seen. It's not just
one face between each voxel, there are 2 faces, one for
each voxel facing its neighbor that are a waste. All these extra faces,
especially for a large volume of voxels will kill performance.

It should be clear that we can't just merge geometry.
We need to build it ourselves, taking into account that
if a voxel has an adjacent neighbor it doesn't need the
face facing that neighbor.

The next issue is that 256x256x256 is just too big. 16meg is a lot of memory and
if nothing else in much of the space nothing is there so that's a lot of wasted
memory. It's also a huge number of voxels, 16 million! That's too much to
consider at once.

A solution is to divide the area into smaller areas.
Any area that has nothing in it needs no storage. Let's use 
32x32x32 areas (that's 32k) and only create an area if something is in it.
We'll call one of these larger 32x32x32 areas a "cell".

Let's break this into pieces. First let's make a class to manage the voxel data.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
}
```

Let's make the function that makes geometry for a cell. 
Let's assume you pass in a cell position.
In other words if you want the geometry for the cell that covers voxels (0-31x, 0-31y, 0-31z)
then you'd pass in 0,0,0. For the cell that covers voxels (32-63x, 0-31y, 0-31z) you'd
pass in 1,0,0.

We need to be able to check the neighboring voxels so let's assume our class
has a function `getVoxel` that given a voxel position returns the value of
the voxel there. In other words if you pass it 35,0,0 and the cellSize is 32
it's going to look at cell 1,0,0 and in that cell it will look at voxel 3,0,0.
Using this function we can look at a voxel's neighboring voxels even if they
happen to be in neighboring cells.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
+  generateGeometryDataForCell(cellX, cellY, cellZ) {
+    const {cellSize} = this;
+    const startX = cellX * cellSize;
+    const startY = cellY * cellSize;
+    const startZ = cellZ * cellSize;
+
+    for (let y = 0; y < cellSize; ++y) {
+      const voxelY = startY + y;
+      for (let z = 0; z < cellSize; ++z) {
+        const voxelZ = startZ + z;
+        for (let x = 0; x < cellSize; ++x) {
+          const voxelX = startX + x;
+          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
+          if (voxel) {
+            for (const {dir} of VoxelWorld.faces) {
+              const neighbor = getVoxel(
+                  voxelX + dir[0],
+                  voxelY + dir[1],
+                  voxelZ + dir[2]);
+              if (!neighbor) {
+                // this voxel has no neighbor in this direction so we need a face
+                // here.
+              }
+            }
+          }
+        }
+      }
+    }
+  }
}

+VoxelWorld.faces = [
+  { // left
+    dir: [ -1,  0,  0, ],
+  },
+  { // right
+    dir: [  1,  0,  0, ],
+  },
+  { // bottom
+    dir: [  0, -1,  0, ],
+  },
+  { // top
+    dir: [  0,  1,  0, ],
+  },
+  { // back
+    dir: [  0,  0, -1, ],
+  },
+  { // front
+    dir: [  0,  0,  1, ],
+  },
+];
```

So using the code above we know when we need a face. Let's generate the faces.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {
    const {cellSize} = this;
+    const positions = [];
+    const normals = [];
+    const indices = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
-            for (const {dir} of VoxelWorld.faces) {
+            for (const {dir, corners} of VoxelWorld.faces) {
              const neighbor = getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face.
+                const ndx = positions.length / 3;
+                for (const pos of corners) {
+                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
+                  normals.push(...dir);
+                }
+                indices.push(
+                  ndx, ndx + 1, ndx + 2,
+                  ndx + 2, ndx + 1, ndx + 3,
+                );
              }
            }
          }
        }
      }
    }
+    return {
+      positions,
+      normals,
+      indices,
    };
  }
}

VoxelWorld.faces = [
  { // left
    dir: [ -1,  0,  0, ],
+    corners: [
+      [ 0, 1, 0 ],
+      [ 0, 0, 0 ],
+      [ 0, 1, 1 ],
+      [ 0, 0, 1 ],
+    ],
  },
  { // right
    dir: [  1,  0,  0, ],
+    corners: [
+      [ 1, 1, 1 ],
+      [ 1, 0, 1 ],
+      [ 1, 1, 0 ],
+      [ 1, 0, 0 ],
+    ],
  },
  { // bottom
    dir: [  0, -1,  0, ],
+    corners: [
+      [ 1, 0, 1 ],
+      [ 0, 0, 1 ],
+      [ 1, 0, 0 ],
+      [ 0, 0, 0 ],
+    ],
  },
  { // top
    dir: [  0,  1,  0, ],
+    corners: [
+      [ 0, 1, 1 ],
+      [ 1, 1, 1 ],
+      [ 0, 1, 0 ],
+      [ 1, 1, 0 ],
+    ],
  },
  { // back
    dir: [  0,  0, -1, ],
+    corners: [
+      [ 1, 0, 0 ],
+      [ 0, 0, 0 ],
+      [ 1, 1, 0 ],
+      [ 0, 1, 0 ],
+    ],
  },
  { // front
    dir: [  0,  0,  1, ],
+    corners: [
+      [ 0, 0, 1 ],
+      [ 1, 0, 1 ],
+      [ 0, 1, 1 ],
+      [ 1, 1, 1 ],
+    ],
  },
];
```

The code above would make basic geometry data for us. We just need to supply
the `getVoxel` function. Let's start with just one hardcoded cell.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
+    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
+  getCellForVoxel(x, y, z) {
+    const {cellSize} = this;
+    const cellX = Math.floor(x / cellSize);
+    const cellY = Math.floor(y / cellSize);
+    const cellZ = Math.floor(z / cellSize);
+    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
+      return null
+    }
+    return this.cell;
+  }
+  getVoxel(x, y, z) {
+    const cell = this.getCellForVoxel(x, y, z);
+    if (!cell) {
+      return 0;
+    }
+    const {cellSize} = this;
+    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
+    const voxelOffset = voxelY * cellSize * cellSize +
+                        voxelZ * cellSize +
+                        voxelX;
+    return cell[voxelOffset];
+  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {

  ...
}
```

This seems like it would work. Let's make a `setVoxel` function
so we can set some data.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  getCellForVoxel(x, y, z) {
    const {cellSize} = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || celllZ !== 0) {
      return null
    }
    return this.cell;
  }
+  setVoxel(x, y, z, v) {
+    let cell = this.getCellForVoxel(x, y, z);
+    if (!cell) {
+      return;  // TODO: add a new cell?
+    }
+    const {cellSize} = this;
+    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
+    const voxelOffset = voxelY * cellSize * cellSize +
+                        voxelZ * cellSize +
+                        voxelX;
+    cell[voxelOffset] = v;
+  }
  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const {cellSize} = this;
    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
    const voxelOffset = voxelY * cellSize * cellSize +
                        voxelZ * cellSize +
                        voxelX;
    return cell[voxelOffset];
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {

  ...
}
```

Hmmm, I see a lot of repeated code. Let's fix that up

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
+    this.cellSliceSize = cellSize * cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  getCellForVoxel(x, y, z) {
    const {cellSize} = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }
+  computeVoxelOffset(x, y, z) {
+    const {cellSize, cellSliceSize} = this;
+    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
+    return voxelY * cellSliceSize +
+           voxelZ * cellSize +
+           voxelX;
+  }
  setVoxel(x, y, z, v) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // TODO: add a new cell?
    }
-    const {cellSize} = this;
-    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
-    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
-    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
-    const voxelOffset = voxelY * cellSize * cellSize +
-                        voxelZ * cellSize +
-                        voxelX;
+    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
  getVoxel(x, y, z) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
-    const {cellSize} = this;
-    const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
-    const voxelY = THREE.Math.euclideanModulo(y, cellSize) | 0;
-    const voxelZ = THREE.Math.euclideanModulo(z, cellSize) | 0;
-    const voxelOffset = voxelY * cellSize * cellSize +
-                        voxelZ * cellSize +
-                        voxelX;
+    const voxelOffset = this.computeVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {

  ...
}
```

Now let's make some code to fill out the first cell with voxels.

```js
const cellSize = 32;

const world = new VoxelWorld(cellSize);

for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const height = (Math.sin(x / cellSize * Math.PI * 2) + Math.sin(z / cellSize * Math.PI * 3)) * (cellSize / 6) + (cellSize / 2);
      if (y < height) {
        world.setVoxel(x, y, z, 1);
      }
    }
  }
}
```

and some code to actually generate geometry like we covered in
[the article on custom BufferGeometry](threejs-custom-buffergeometry.html).

```js
const {positions, normals, indices} = world.generateGeometryDataForCell(0, 0, 0);
const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshLambertMaterial({color: 'green'});

const positionNumComponents = 3;
const normalNumComponents = 3;
geometry.addAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
geometry.addAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
geometry.setIndex(indices);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

let's try it

{{{example url="../threejs-voxel-geometry-culled-faces.html" }}}

That seems to be working! Okay, let's add in textures.

Searching on the net I found [this set](https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/resource-packs/1245961-16x-1-7-4-wip-flourish)
of [CC-BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/) licensed minecraft textures
by [Joshtimus](https://www.minecraftforum.net/members/Joshtimus).
I picked a few at random and built this [texture atlas](https://www.google.com/search?q=texture+atlas).

<div class="threejs_center"><img class="checkerboard" src="../resources/images/minecraft/flourish-cc-by-nc-sa.png" style="width: 512px; image-rendering: pixelated;"></div>

To make things simple they are arranged a voxel type per column
where the top row is the side of a voxel. The 2nd row is
the top of voxel, and the 3rd row is the bottom of the voxel.

Knowing that we can add info to our `VoxelWorld.faces` data
to specify for each face which row to use and the UVs to use
for that face.

```js
VoxelWorld.faces = [
  { // left
+    uvRow: 0,
    dir: [ -1,  0,  0, ],
    corners: [
-      [ 0, 1, 0 ],
-      [ 0, 0, 0 ],
-      [ 0, 1, 1 ],
-      [ 0, 0, 1 ],
+      { pos: [ 0, 1, 0 ], uv: [ 0, 1 ], },
+      { pos: [ 0, 0, 0 ], uv: [ 0, 0 ], },
+      { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
+      { pos: [ 0, 0, 1 ], uv: [ 1, 0 ], },
    ],
  },
  { // right
+    uvRow: 0,
    dir: [  1,  0,  0, ],
    corners: [
-      [ 1, 1, 1 ],
-      [ 1, 0, 1 ],
-      [ 1, 1, 0 ],
-      [ 1, 0, 0 ],
+      { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
+      { pos: [ 1, 0, 1 ], uv: [ 0, 0 ], },
+      { pos: [ 1, 1, 0 ], uv: [ 1, 1 ], },
+      { pos: [ 1, 0, 0 ], uv: [ 1, 0 ], },
    ],
  },
  { // bottom
+    uvRow: 1,
    dir: [  0, -1,  0, ],
    corners: [
-      [ 1, 0, 1 ],
-      [ 0, 0, 1 ],
-      [ 1, 0, 0 ],
-      [ 0, 0, 0 ],
+      { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
+      { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
+      { pos: [ 1, 0, 0 ], uv: [ 1, 1 ], },
+      { pos: [ 0, 0, 0 ], uv: [ 0, 1 ], },
    ],
  },
  { // top
+    uvRow: 2,
    dir: [  0,  1,  0, ],
    corners: [
-      [ 0, 1, 1 ],
-      [ 1, 1, 1 ],
-      [ 0, 1, 0 ],
-      [ 1, 1, 0 ],
+      { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
+      { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
+      { pos: [ 0, 1, 0 ], uv: [ 1, 0 ], },
+      { pos: [ 1, 1, 0 ], uv: [ 0, 0 ], },
    ],
  },
  { // back
+    uvRow: 0,
    dir: [  0,  0, -1, ],
    corners: [
-      [ 1, 0, 0 ],
-      [ 0, 0, 0 ],
-      [ 1, 1, 0 ],
-      [ 0, 1, 0 ],
+      { pos: [ 1, 0, 0 ], uv: [ 0, 0 ], },
+      { pos: [ 0, 0, 0 ], uv: [ 1, 0 ], },
+      { pos: [ 1, 1, 0 ], uv: [ 0, 1 ], },
+      { pos: [ 0, 1, 0 ], uv: [ 1, 1 ], },
    ],
  },
  { // front
+    uvRow: 0,
    dir: [  0,  0,  1, ],
    corners: [
-      [ 0, 0, 1 ],
-      [ 1, 0, 1 ],
-      [ 0, 1, 1 ],
-      [ 1, 1, 1 ],
+      { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
+      { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
+      { pos: [ 0, 1, 1 ], uv: [ 0, 1 ], },
+      { pos: [ 1, 1, 1 ], uv: [ 1, 1 ], },
    ],
  },
];
```

And we can update the code to use that data. We need to
know the size of a tile in the texture atlas and the dimensions
of the texture.

```js
class VoxelWorld {
-  constructor(cellSize) {
-    this.cellSize = cellSize;
+  constructor(options) {
+    this.cellSize = options.cellSize;
+    this.tileSize = options.tileSize;
+    this.tileTextureWidth = options.tileTextureWidth;
+    this.tileTextureHeight = options.tileTextureHeight;
+    const {cellSize} = this;
+    this.cellSliceSize = cellSize * cellSize;
+    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }

  ...

  generateGeometryDataForCell(cellX, cellY, cellZ) {
-    const {cellSize} = this;
+    const {cellSize, tileSize, tileTextureWidth, tileTextureHeight} = this;
    const positions = [];
    const normals = [];
+    const uvs = [];
    const indices = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            const uvVoxel = voxel - 1;  // voxel 0 is sky so for UVs we start at 0
            // There is a voxel here but do we need faces for it?
-            for (const {dir, corners} of VoxelWorld.faces) {
+            for (const {dir, corners, uvRow} of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
                // this voxel has no neighbor in this direction so we need a face.
                const ndx = positions.length / 3;
-                for (const pos of corners) {
+                for (const {pos, uv} of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  normals.push(...dir);
+                  uvs.push(
+                        (uvRow +     uv[0]) * tileSize / tileTextureWidth,
+                    1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                }
                indices.push(
                  ndx, ndx + 1, ndx + 2,
                  ndx + 2, ndx + 1, ndx + 3,
                );
              }
            }
          }
        }
      }
    }

    return {
      positions,
      normals,
      uvs,
      indices,
    };
  }
}
```

We then need to [load the texture](threejs-textures.html)

```js
const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/minecraft/flourish-cc-by-nc-sa.png', render);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
```

and pass the settings to the `VoxelWorld` class

```js
+const tileSize = 16;
+const tileTextureWidth = 256;
+const tileTextureHeight = 64;
-const world = new VoxelWorld(cellSize);
+const world = new VoxelWorld({
+  cellSize,
+  tileSize,
+  tileTextureWidth,
+  tileTextureHeight,
+});
```

Let's actually use the UVs when we create the geometry
and the texture when we make the material

```js
-const {positions, normals, indices} = world.generateGeometryDataForCell(0, 0, 0);
+const {positions, normals, uvs, indices} = world.generateGeometryDataForCell(0, 0, 0);
const geometry = new THREE.BufferGeometry();
-const material = new THREE.MeshLambertMaterial({color: 'green'});
+const material = new THREE.MeshLambertMaterial({
+  map: texture,
+  side: THREE.DoubleSide,
+  alphaTest: 0.1,
+  transparent: true,
+});

const positionNumComponents = 3;
const normalNumComponents = 3;
+const uvNumComponents = 2;
geometry.addAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
geometry.addAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
+geometry.addAttribute(
+    'uv',
+    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
geometry.setIndex(indices);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

One last thing, we actually need to set some voxels
to use different textures.

```js
for (let y = 0; y < cellSize; ++y) {
  for (let z = 0; z < cellSize; ++z) {
    for (let x = 0; x < cellSize; ++x) {
      const height = (Math.sin(x / cellSize * Math.PI * 2) + Math.sin(z / cellSize * Math.PI * 3)) * (cellSize / 6) + (cellSize / 2);
      if (y < height) {
-        world.setVoxel(x, y, z, 1);
+        world.setVoxel(x, y, z, randInt(1, 17));
      }
    }
  }
}

+function randInt(min, max) {
+  return Math.floor(Math.random() * (max - min) + min);
+}
```

and with that we get textures!

{{{example url="../threejs-voxel-geometry-culled-faces-with-textures.html"}}}

Let's make it support more than one cell.

To do this lets store cells in an object using cell ids.
A cell id will just be a cell's coordinates separated by
a comma. In other words if we ask for voxel 35,0,0
that is in cell 1,0,0 so its id is `"1,0,0"`.

```js
class VoxelWorld {
  constructor(options) {
    this.cellSize = options.cellSize;
    this.tileSize = options.tileSize;
    this.tileTextureWidth = options.tileTextureWidth;
    this.tileTextureHeight = options.tileTextureHeight;
    const {cellSize} = this;
    this.cellSliceSize = cellSize * cellSize;
-    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
+    this.cells = {};
  }
+  computeCellId(x, y, z) {
+    const {cellSize} = this;
+    const cellX = Math.floor(x / cellSize);
+    const cellY = Math.floor(y / cellSize);
+    const cellZ = Math.floor(z / cellSize);
+    return `${cellX},${cellY},${cellZ}`;
+  }
+  getCellForVoxel(x, y, z) {
-    const cellX = Math.floor(x / cellSize);
-    const cellY = Math.floor(y / cellSize);
-    const cellZ = Math.floor(z / cellSize);
-    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
-      return null;
-    }
-    return this.cell;
+    return this.cells[this.computeCellId(x, y, z)];
  }

   ...
}
```

and now we can make `setVoxel` add new cells if
we try to set a voxel in a cell that does not yet exist

```js
  setVoxel(x, y, z, v) {
-    const cell = this.getCellForVoxel(x, y, z);
+    let cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
-      return 0;
+      cell = this.addCellForVoxel(x, y, z);
    }
    const voxelOffset = this.computeVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }
+  addCellForVoxel(x, y, z) {
+    const cellId = this.computeCellId(x, y, z);
+    let cell = this.cells[cellId];
+    if (!cell) {
+      const {cellSize} = this;
+      cell = new Uint8Array(cellSize * cellSize * cellSize);
+      this.cells[cellId] = cell;
+    }
+    return cell;
+  }
```

Let's make this editable.

First we`ll add a UI. Using radio buttons we can make an 8x2
array of tiles

```html
<body>
  <canvas id="c"></canvas>
+  <div id="ui">
+    <div class="tiles">
+      <input type="radio" name="voxel" id="voxel1" value="1"><label for="voxel1" style="background-position:   -0% -0%"></label>
+      <input type="radio" name="voxel" id="voxel2" value="2"><label for="voxel2" style="background-position: -100% -0%"></label>
+      <input type="radio" name="voxel" id="voxel3" value="3"><label for="voxel3" style="background-position: -200% -0%"></label>
+      <input type="radio" name="voxel" id="voxel4" value="4"><label for="voxel4" style="background-position: -300% -0%"></label>
+      <input type="radio" name="voxel" id="voxel5" value="5"><label for="voxel5" style="background-position: -400% -0%"></label>
+      <input type="radio" name="voxel" id="voxel6" value="6"><label for="voxel6" style="background-position: -500% -0%"></label>
+      <input type="radio" name="voxel" id="voxel7" value="7"><label for="voxel7" style="background-position: -600% -0%"></label>
+      <input type="radio" name="voxel" id="voxel8" value="8"><label for="voxel8" style="background-position: -700% -0%"></label>
+    </div>
+    <div class="tiles">
+      <input type="radio" name="voxel" id="voxel9"  value="9" ><label for="voxel9"  style="background-position:  -800% -0%"></label>
+      <input type="radio" name="voxel" id="voxel10" value="10"><label for="voxel10" style="background-position:  -900% -0%"></label>
+      <input type="radio" name="voxel" id="voxel11" value="11"><label for="voxel11" style="background-position: -1000% -0%"></label>
+      <input type="radio" name="voxel" id="voxel12" value="12"><label for="voxel12" style="background-position: -1100% -0%"></label>
+      <input type="radio" name="voxel" id="voxel13" value="13"><label for="voxel13" style="background-position: -1200% -0%"></label>
+      <input type="radio" name="voxel" id="voxel14" value="14"><label for="voxel14" style="background-position: -1300% -0%"></label>
+      <input type="radio" name="voxel" id="voxel15" value="15"><label for="voxel15" style="background-position: -1400% -0%"></label>
+      <input type="radio" name="voxel" id="voxel16" value="16"><label for="voxel16" style="background-position: -1500% -0%"></label>
+    </div>
+  </div>
</body>
```

And add some CSS to style it, display the tiles and highlight
the current selection

```css
body {
    margin: 0;
}
#c {
    width: 100vw;
    height: 100vh;
    display: block;
}
+#ui {
+    position: absolute;
+    left: 10px;
+    top: 10px;
+    background: rgba(0, 0, 0, 0.8);
+    padding: 5px;
+}
+#ui input[type=radio] {
+  width: 0;
+  height: 0;
+  display: none;
+}
+#ui input[type=radio] + label {
+  background-image: url('resources/images/minecraft/flourish-cc-by-nc-sa.png');
+  background-size: 1600% 400%;
+  image-rendering: pixelated;
+  width: 64px;
+  height: 64px;
+  display: inline-block;
+}
+#ui input[type=radio]:checked + label {
+  outline: 3px solid red;
+}
+@media (max-width: 600px), (max-height: 600px) {
+  #ui input[type=radio] + label {
+    width: 32px;
+    height: 32px;
+  }
+}
```

The UX will be as follows. If no tile is selected and you click a voxel that
voxel will be erased or if you click a voxel and are holding the shift key it
will be erased. Otherwise if a tiles is selected it will be added. You can
deselect the selected tile type by clicking it again.

This code will let the user unselect the highlighted
radio button.

```js
let currentVoxel = 0;
let currentId;

document.querySelectorAll('#ui .tiles input[type=radio][name=voxel]').forEach((elem) => {
  elem.addEventListener('click', allowUncheck);
});

function allowUncheck() {
  if (this.id === currentId) {
    this.checked = false;
    currentId = undefined;
    currentVoxel = 0;
  } else {
    currentId = this.id;
    currentVoxel = parseInt(this.value);
  }
}
```

And this below code will let us set a voxel based on where
the user clicks. It uses code similar to the code we
made in [the article on picking](threejs-picking.html)
but it's not using the built in `RayCaster`. Instead
it's using `VoxelWorld.intersectRay` which returns
the position of intersection and the normal of the face
hit.

```js
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function placeVoxel(event) {
  const pos = getCanvasRelativePosition(event);
  const x = (pos.x / canvas.clientWidth ) *  2 - 1;
  const y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y

  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  start.setFromMatrixPosition(camera.matrixWorld);
  end.set(x, y, 1).unproject(camera);

  const intersection = world.intersectRay(start, end);
  if (intersection) {
    const voxelId = event.shiftKey ? 0 : currentVoxel;
    // the intersection point is on the face. That means
    // the math imprecision could put us on either side of the face.
    // so go half a normal into the voxel if removing (currentVoxel = 0)
    // our out of the voxel if adding (currentVoxel  > 0)
    const pos = intersection.position.map((v, ndx) => {
      return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5);
    });
    world.setVoxel(...pos, voxelId);
    updateVoxelGeometry(...pos);
    requestRenderIfNotRequested();
  }
}

const mouse = {
  x: 0,
  y: 0,
};

function recordStartPosition(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.moveX = 0;
  mouse.moveY = 0;
}
function recordMovement(event) {
  mouse.moveX += Math.abs(mouse.x - event.clientX);
  mouse.moveY += Math.abs(mouse.y - event.clientY);
}
function placeVoxelIfNoMovement(event) {
  if (mouse.moveX < 5 && mouse.moveY < 5) {
    placeVoxel(event);
  }
  window.removeEventListener('mousemove', recordMovement);
  window.removeEventListener('mouseup', placeVoxelIfNoMovement);
}
canvas.addEventListener('mousedown', (event) => {
  event.preventDefault();
  recordStartPosition(event);
  window.addEventListener('mousemove', recordMovement);
  window.addEventListener('mouseup', placeVoxelIfNoMovement);
}, {passive: false});
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  recordStartPosition(event.touches[0]);
}, {passive: false});
canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  recordMovement(event.touches[0]);
}, {passive: false});
canvas.addEventListener('touchend', () => {
  placeVoxelIfNoMovement({
    clientX: mouse.x,
    clientY: mouse.y,
  });
});
```

There's a lot going on in the code above. Basically the mouse
has a dual purpose. One is to move the camera. The other is to
edit the world. Placing/Erasing a voxel happen when you let off the mouse
but only if you have not moved the mouse since you first pressed down.
This is just a guess that if you did move the mouse you were trying
to move the camera, not place a block. `moveX` and `moveY` are
in absolute movement so if you move to the left 10 and then back to
the right 10 you'll have moved 20 units. In that case the user likely
was just rotating the model back and forth and does not want to
place a block. I didn't do any testing to see if `5` is a good range or not. 

In the code we call `world.setVoxel` to set a voxel and
then `updateVoxelGeometry` to update the three.js geometry
based on what's changed.

Let's make that now. If the user clicks a
voxel on the edge of a cell then the geometry for the voxel
in the adjacent cell might need new geometry. This means
we need to check the cell for the voxel we just edited
as well as in all 6 directions from that cell.

```js
const neighborOffsets = [
  [ 0,  0,  0], // self
  [-1,  0,  0], // left
  [ 1,  0,  0], // right
  [ 0, -1,  0], // down
  [ 0,  1,  0], // up
  [ 0,  0, -1], // back
  [ 0,  0,  1], // front
];
function updateVoxelGeometry(x, y, z) {
  const updatedCellIds = {};
  for (const offset of neighborOffsets) {
    const ox = x + offset[0];
    const oy = y + offset[1];
    const oz = z + offset[2];
    const cellId = world.computeCellId(ox, oy, oz);
    if (!updatedCellIds[cellId]) {
      updatedCellIds[cellId] = true;
      updateCellGeometry(ox, oy, oz);
    }
  }
}
```

I thought about checking for adjacent cells like 

```js
const voxelX = THREE.Math.euclideanModulo(x, cellSize) | 0;
if (voxelX === 0) {
  // update cell to the left
} else if (voxelX === cellSize - 1) {
  // update cell to the right
}
```

and there would be 4 more checks for the other 4 directions
but it occurred to me the code would be much simpler with
just an array of offsets and saving off the cell ids of
the cells we already updated. If the updated voxel is not
on the edge of a cell then the test will quickly reject updating
the same cell.

For `updateCellGeometry` we're just going to take the code we
had before that was generating the geometry for one cell
and make it handle multiple cells.

```js
const cellIdToMesh = {};
function updateCellGeometry(x, y, z) {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  const cellZ = Math.floor(z / cellSize);
  const cellId = world.computeCellId(x, y, z);
  let mesh = cellIdToMesh[cellId];
  if (!mesh) {
    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;

    geometry.addAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(0), positionNumComponents));
    geometry.addAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(0), normalNumComponents));
    geometry.addAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(0), uvNumComponents));

    mesh = new THREE.Mesh(geometry, material);
    mesh.name = cellId;
    cellIdToMesh[cellId] = mesh;
    scene.add(mesh);
    mesh.position.set(cellX * cellSize, cellY * cellSize, cellZ * cellSize);
  }

  const {positions, normals, uvs, indices} = world.generateGeometryDataForCell(cellX, cellY, cellZ);
  const geometry = mesh.geometry;
  geometry.getAttribute('position').setArray(new Float32Array(positions)).needsUpdate = true;
  geometry.getAttribute('normal').setArray(new Float32Array(normals)).needsUpdate = true;
  geometry.getAttribute('uv').setArray(new Float32Array(uvs)).needsUpdate = true;
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
}
```

The code above checks a map of cell ids to meshes. If
we ask for a cell that doesn't exist a new `Mesh` is made
and added to the correct place in world space.
At the end we update the attributes and indices with the new data.

{{{example url="../threejs-voxel-geometry-culled-faces-ui.html"}}}

Some notes:

`RayCaster` might have worked just fine. I didn't try it.
Instead I found [a voxel specific raycaster](http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf).
that is optimized for voxels.

I made `intersectRay` part of VoxelWorld because it seemed
like if it gets too slow we could raycast against cells
before raycasting on voxels as a simple speed up if it becomes
too slow.

You might want to change the length of the raycast 
as currently it's all the way to Z-far. I expect if the
user clicks something too far way they don't really want
to be placing blocks on the other side of the world that
are 1 or 2 pixel large.

Calling `geometry.computeBoundingSphere` might be slow.
We could just manually set the bounding sphere to the fit
the entire cell.

Do we want remove cells if all voxels in that cell are 0? 
That would probably be reasonable change if we wanted to ship this.

Thinking about how this works it's clear the absolute
worst case is a checking board of on and off voxels. I don't
know off the top of my head what other strategies to use
if things get too slow. Maybe getting too slow would just
encourage the user not to make giant checkerboard areas.

To keep it simple the texture atlas is just 1 column
per voxel type. It would be better to make something more
flexible where we have a table of voxel types and each
type can specify where its face textures are in the atlas.
As it is lots of space is wasted.

Looking at real minecraft there are tiles that are not
voxels, not cubes. Like a fence tile or flowers. To do that
we'd again need some table of voxel types and for each
voxel whether it's a cube or some other geometry. If it's
not a cube the neighbor check when generating the geometry
would also need to change. A flower voxel next to another
voxel should not remove the faces between them.

If you want to make some minecraft like thing using three.js
I hope this has given you some ideas where to start and how
to generate some what efficient geometry.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-voxel-geometry.js"></script>

