Title: Three.js 복셀 Geometry
Description: 마인크래프트 같은 복셀 geometry를 만드는 법을 알아봅니다
TOC: 복셀 Geometry(마인크래프트) 만들기

※ [복셀](https://ko.wikipedia.org/wiki/%EB%B3%B5%EC%85%80): Voxel, 볼륨(volume, 부피)과 픽셀(pixel)의 합성어로, 마인크래프트의 블록처럼 부피가 있는 픽셀을 말합니다. 역주.

이 주제는 꽤 많은 커뮤니티에 공통적으로 올라오는 주제입니다. "마인크래프트 블록 같은 복셀을 어떻게 만들 수 있나요?"라는 것이죠.

대부분의 초심자가 이를 정육면체 geometry를 만들고 각 복셀의 위치에 mesh를 따로 만들어 구현하려고 합니다. 재미삼아 이 방식으로 한 번 구현해보죠. 먼저 256x256x256짜리 복셀 큐브를 만들기 위해 16,777,216개의 요소를 가진 `Uint8Array`를 만듭니다.

```js
const cellSize = 256;
const cell = new Uint8Array(cellSize * cellSize * cellSize);
```

그리고 사인(sine) 함수 곡선으로 언덕을 한 겹 만듭니다.

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

다음으로 모든 블럭을 돌면서 0이 아닐 경우 정육면체를 새로 만듭니다.

```js
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 'green' });

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

나머지 코드는 [불필요한 렌더링 제거하기](threejs-rendering-on-demand.html)에서 가져왔습니다.

{{{example url="../threejs-voxel-geometry-separate-cubes.html" }}}

처음 초기화하는 데도 시간이 오래 걸리고 카메라를 움직이면 굉장히 버벅일 겁니다. [다중 요소 최적화하기](threejs-optimize-lots-of-objects.html)의 경우와 마찬가지로 너무 많은 물체가 있는 탓이죠. 256x256, 육면체가 총 65,536개나 있으니 그럴 만합니다.

[geometry를 합치면](threejs-rendering-on-demand.html) 이 문제를 해결할 수 있습니다. 내친김에 언덕 한 겹이 아니라 땅까지 복셀을 채워보도록 하죠. 반복문을 다음처럼 수정해 빈 공간을 전부 채우도록 합니다.

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

테스트를 돌려봤더니 잠시 멈췄다가 *out of memery* 오류가 뜹니다 😅.

몇 가지 문제가 있을 테지만 현재 가장 큰 문제는 전혀 볼 일이 없는 정육면체 안쪽도 렌더링한다는 겁니다.

쉽게 설명해 복셀로 이루어진 3x2x2짜리 육면체가 있다고 해보죠. 각 복셀을 합치면 아래와 같은 모습이 될 겁니다.

<div class="spread">
  <div data-diagram="mergedCubes" style="height: 300px;"></div>
</div>

문제를 해결하려면 아래와 같은 형태로 구현해야 하죠.

<div class="spread">
  <div data-diagram="culledCubes" style="height: 300px;"></div>
</div>

위쪽 예제에는 복셀 사이에 면들이 있습니다. 밖에서는 전혀 볼 일이 없기에 불필요한 것들이죠. 거기다 각 복셀 사이에는 면이 하나도 아니고 마주 보는 면당 하나씩, 총 두 개가 있습니다. 이 역시 낭비이죠. 복셀에 이런 면들이 많아질수록 성능은 처참해질 겁니다.

이쯤에서 그냥 말해야겠네요. 단순히 geometry를 합쳐버려서는 이 문제를 해결할 수 없습니다. 복셀이 서로 마주 본다면 해당 면을 만들지 않도록 직접 복셀을 만들어야 하죠.

다른 문제는 크기가 너무 크다는 겁니다. 256x256x256이면 16MB 정도로 메모리 점유율이 꽤 큰 편에 속하죠. 특히 빈 공간은 아무것도 있을 필요가 없습니다. 복셀의 숫자도 약 천육백만 개가 넘으니 연산이 버거울 만합니다.

한 가지 해결 방법은 영역을 작은 영역으로 쪼개는 겁니다. 아무것도 없는 영역에는 메모리를 할당할 필요가 없으니, 32x32x32 크기(32KB)의 영역을 만들어 안에 요소가 있는 영역만 렌더링하도록 하겠습니다. 이 32x32x32 영역은 편의상 "cell"이라고 부르도록 하죠.

먼저 복셀 데이터를 관리할 클래스를 만듭니다.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
}
```

다음으로 각 cell의 geometry를 생성하는 메서드를 작성합니다. 이 메서드는 cell의 위치값을 인자로 받는데, 쉽게 말해 (x축 0-31, y축 0-31, z축 0-31)을 포함하는 복셀들을 생성하려면 (0,0,0)을 넘겨주면 됩니다. (x축 32-63, y축 0-31, z축 0-31)을 포함하는 복셀을 생성하려면 (1,0,0)을 넘겨주면 되죠.

그리고 이웃하는 복셀을 검사해야 합니다. 일단 해당 위치의 복셀값을 반환하는 `getVoxel` 메서드가 있다고 가정합시다. 예를 들어 cell의 크기가 32일 경우, 이 메서드에 (35,0,0)을 넘겨주면 (1,0,0) 쪽 cell을 찾아 해당 cell의 (3,0,0)에 위치한 복셀값을 반환할 겁니다. 다른 cell의 복셀이라고 해도 이웃 복셀을 얼마든지 찾아낼 수 있다는 이야기죠.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
+  generateGeometryDataForCell(cellX, cellY, cellZ) {
+    const { cellSize } = this;
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
+            for (const { dir } of VoxelWorld.faces) {
+              const neighbor = this.getVoxel(
+                  voxelX + dir[0],
+                  voxelY + dir[1],
+                  voxelZ + dir[2]);
+              if (!neighbor) {
+                // 이 복셀은 이 방향에 이웃하는 복셀이 없으므로
+                // 이쪽에 면을 만듭니다.
+              }
+            }
+          }
+        }
+      }
+    }
+  }
}

+VoxelWorld.faces = [
+  { // 왼쪽
+    dir: [ -1,  0,  0, ],
+  },
+  { // 오른쪽
+    dir: [  1,  0,  0, ],
+  },
+  { // 아래
+    dir: [  0, -1,  0, ],
+  },
+  { // 위
+    dir: [  0,  1,  0, ],
+  },
+  { // 뒤
+    dir: [  0,  0, -1, ],
+  },
+  { // 앞
+    dir: [  0,  0,  1, ],
+  },
+];
```

이제 언제 면을 만들 기준이 생겼으니 한 번 면들을 만들어봅시다.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {
    const { cellSize } = this;
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
-            for (const { dir } of VoxelWorld.faces) {
+            for (const { dir, corners } of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
+                // 이 복셀은 이 방향에 이웃하는 복셀이 없으므로
+                // 이쪽에 면을 만듭니다.
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
  { // 왼쪽
    dir: [ -1,  0,  0, ],
+    corners: [
+      [ 0, 1, 0 ],
+      [ 0, 0, 0 ],
+      [ 0, 1, 1 ],
+      [ 0, 0, 1 ],
+    ],
  },
  { // 오른쪽
    dir: [  1,  0,  0, ],
+    corners: [
+      [ 1, 1, 1 ],
+      [ 1, 0, 1 ],
+      [ 1, 1, 0 ],
+      [ 1, 0, 0 ],
+    ],
  },
  { // 아래
    dir: [  0, -1,  0, ],
+    corners: [
+      [ 1, 0, 1 ],
+      [ 0, 0, 1 ],
+      [ 1, 0, 0 ],
+      [ 0, 0, 0 ],
+    ],
  },
  { // 위
    dir: [  0,  1,  0, ],
+    corners: [
+      [ 0, 1, 1 ],
+      [ 1, 1, 1 ],
+      [ 0, 1, 0 ],
+      [ 1, 1, 0 ],
+    ],
  },
  { // 뒤
    dir: [  0,  0, -1, ],
+    corners: [
+      [ 1, 0, 0 ],
+      [ 0, 0, 0 ],
+      [ 1, 1, 0 ],
+      [ 0, 1, 0 ],
+    ],
  },
  { // 앞
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

위 코드는 기본 geometry 데이터를 만들어줍니다. 이제 `getVoxel` 메서드만 만들면 되겠네요. 일단 약간의 하드코딩을 더해 cell을 만듭니다.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
+    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
+  getCellForVoxel(x, y, z) {
+    const { cellSize } = this;
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
+    const { cellSize } = this;
+    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
+    const voxelOffset = voxelY * cellSize * cellSize +
+                        voxelZ * cellSize +
+                        voxelX;
+    return cell[voxelOffset];
+  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {

  ...
}
```

딱히 문제는 없어보입니다. 데이터를 지정할 수 있는 `setVoxel` 메서드도 만들도록 하죠.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  getCellForVoxel(x, y, z) {
    const { cellSize } = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null
    }
    return this.cell;
  }
+  setVoxel(x, y, z, v) {
+    let cell = this.getCellForVoxel(x, y, z);
+    if (!cell) {
+      return;  // 할 일: 새로운 cell 추가 기능?
+    }
+    const { cellSize } = this;
+    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
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
    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
    const voxelOffset = voxelY * cellSize * cellSize +
                        voxelZ * cellSize +
                        voxelX;
    return cell[voxelOffset];
  }
  generateGeometryDataForCell(cellX, cellY, cellZ) {

  ...
}
```

흠, 반복되는 코드가 많네요. 코드를 좀 정리해봅시다.

```js
class VoxelWorld {
  constructor(cellSize) {
    this.cellSize = cellSize;
+    this.cellSliceSize = cellSize * cellSize;
    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }
  getCellForVoxel(x, y, z) {
    const { cellSize } = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    if (cellX !== 0 || cellY !== 0 || cellZ !== 0) {
      return null;
    }
    return this.cell;
  }
+  computeVoxelOffset(x, y, z) {
+    const { cellSize, cellSliceSize } = this;
+    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
+    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
+    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
+    return voxelY * cellSliceSize +
+           voxelZ * cellSize +
+           voxelX;
+  }
  setVoxel(x, y, z, v) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return;  // 할 일: 새로운 cell 추가 기능?
    }
-    const { cellSize } = this;
-    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
-    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
-    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
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
-    const { cellSize } = this;
-    const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
-    const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
-    const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
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

다음으로 첫 번째 cell을 복셀로 채우는 코드를 작성합니다.

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

[BufferGeometry에 관한 글](threejs-custom-buffergeometry.html)에서 다뤘던 대로 실제 geometry를 생성하는 코드도 작성합니다.

```js
const { positions, normals, indices } = world.generateGeometryDataForCell(0, 0, 0);
const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshLambertMaterial({ color: 'green' });

const positionNumComponents = 3;
const normalNumComponents = 3;
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
geometry.setIndex(indices);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

한 번 테스트해보죠.

{{{example url="../threejs-voxel-geometry-culled-faces.html" }}}

잘 완성한 것 같네요! 여기에 실제 마인크래프트처럼 텍스처를 넣어봅시다.

인터넷을 뒤져 이 [텍스처들](https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/resource-packs/1245961-16x-1-7-4-wip-flourish)을 찾았습니다(라이선스: [CC-BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/), 작가: [Joshtimus](https://www.minecraftforum.net/members/Joshtimus)). 그리고 여기서 몇 가지를 임의로 골라 [텍스처 아틀라스(texture atlas)](https://www.google.com/search?q=texture+atlas)를 만들었습니다.

<div class="threejs_center"><img class="checkerboard" src="../resources/images/minecraft/flourish-cc-by-nc-sa.png" style="width: 512px; image-rendering: pixelated;"></div>

작업을 간단히 하기 위해 텍스처를 열별로 정렬했습니다. 첫 번째 줄은 복셀의 옆면, 두 번째 줄은 복셀의 윗면, 세 번째 줄은 복셀의 아랫면이죠.

이 데이터를 바탕으로 `VoxelWorld.faces`에 각 복셀에 사용할 텍스처의 줄 번호와 복셀의 각 면에 사용할 UV 좌표 데이터를 지정합니다.

```js
VoxelWorld.faces = [
  { // 왼쪽
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
  { // 오른쪽
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
  { // 아래
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
  { // 위
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
  { // 뒤
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
  { // 앞
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

방금 지정한 데이터를 사용하도록 코드를 수정합니다. 텍스처 아틀라스 타일 하나의 크기와 텍스처의 크기를 알아야 하니 생성 시에 넘겨 받도록 합니다.

```js
class VoxelWorld {
-  constructor(cellSize) {
-    this.cellSize = cellSize;
+  constructor(options) {
+    this.cellSize = options.cellSize;
+    this.tileSize = options.tileSize;
+    this.tileTextureWidth = options.tileTextureWidth;
+    this.tileTextureHeight = options.tileTextureHeight;
+    const { cellSize } = this;
+    this.cellSliceSize = cellSize * cellSize;
+    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
  }

  ...

  generateGeometryDataForCell(cellX, cellY, cellZ) {
-    const { cellSize } = this;
+    const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
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
            const uvVoxel = voxel - 1;  // 0 위치의 복셀은 하늘이므로 UV의 경우는 0에서 시작하도록 합니다.
            // 현재 위치에 복셀이 있을 때 해당 위치에 면이 필요한지 검사합니다.
-            for (const { dir, corners } of VoxelWorld.faces) {
+            for (const { dir, corners, uvRow } of VoxelWorld.faces) {
              const neighbor = this.getVoxel(
                  voxelX + dir[0],
                  voxelY + dir[1],
                  voxelZ + dir[2]);
              if (!neighbor) {
                // 이 복셀은 이 방향에 이웃하는 복셀이 없으므로
                // 이쪽에 면을 만듭니다.
                const ndx = positions.length / 3;
-                for (const pos of corners) {
+                for (const {pos, uv} of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  normals.push(...dir);
+                  uvs.push(
+                        (uvVoxel +   uv[0]) * tileSize / tileTextureWidth,
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

다음으로 텍스처를 불러옵니다.

```js
const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/minecraft/flourish-cc-by-nc-sa.png', render);
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.NearestFilter;
```

그리고 `VoxelWorld`에 설정값을 넘겨줍니다.

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

geometry를 만들 때 UV 좌표를, 재질을 만들 때 텍스처를 사용하도록 변경합니다.

```js
-const { positions, normals, indices } = world.generateGeometryDataForCell(0, 0, 0);
+const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(0, 0, 0);
const geometry = new THREE.BufferGeometry();
-const material = new THREE.MeshLambertMaterial({ color: 'green' });
+const material = new THREE.MeshLambertMaterial({
+  map: texture,
+  side: THREE.DoubleSide,
+  alphaTest: 0.1,
+  transparent: true,
+});

const positionNumComponents = 3;
const normalNumComponents = 3;
+const uvNumComponents = 2;
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
+geometry.setAttribute(
+    'uv',
+    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
geometry.setIndex(indices);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

마지막으로 복셀이 서로 다른 텍스처를 쓰도록 설정합니다.

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

한 번 실행해보죠!

{{{example url="../threejs-voxel-geometry-culled-faces-with-textures.html"}}}

코드를 좀 더 발전시켜 하나 이상의 cell을 추가할 수 있도록 해봅시다.

먼저 각 cell에 id를 부여해 객체 형태로 저장하도록 합니다. 이 id는 각 cell의 위치값을 쉼표로 분할한 문자열로 지정할 겁니다. 예를 들어 (35,0,0) 복셀은 cell (1,0,0)에 있을 테니 해당 cell의 id는 `"1,0,0"`이 되겠죠.

```js
class VoxelWorld {
  constructor(options) {
    this.cellSize = options.cellSize;
    this.tileSize = options.tileSize;
    this.tileTextureWidth = options.tileTextureWidth;
    this.tileTextureHeight = options.tileTextureHeight;
    const { cellSize } = this;
    this.cellSliceSize = cellSize * cellSize;
-    this.cell = new Uint8Array(cellSize * cellSize * cellSize);
+    this.cells = {};
  }
+  computeCellId(x, y, z) {
+    const { cellSize } = this;
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

그리고 `setVoxel` 메서드를 수정해 존재하지 않는 cell의 복셀을 추가할 때 새로운 cell을 추가하도록 합니다.

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
+      const { cellSize } = this;
+      cell = new Uint8Array(cellSize * cellSize * cellSize);
+      this.cells[cellId] = cell;
+    }
+    return cell;
+  }
```

준비를 마쳤으니 복셀을 마음대로 수정할 수 있도록 해봅시다.

먼저 라디오 버튼을 이용해 타일을 8x2짜리 UI로 만듭니다.

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

UI가 현재 선택한 타일을 보여주도록 CSS도 추가합니다.

```css
body {
    margin: 0;
}
#c {
    width: 100%;
    height: 100%;
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

기능은 다음처럼 구현할 겁니다. 선택한 타일이 없거나 shift 키를 누르고 있는 경우, 복셀을 클릭하면 해당 복셀이 지워집니다. 반대로 선택한 타일이 있는 경우 선택한 타일이 추가되죠. 선택한 타일을 다시 클릭하면 선택을 해제할 수 있습니다.

아래는 사용자가 선택한 라디오 버튼을 해제할 수 있게끔 해주는 코드입니다.

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

아래 코드는 사용자가 클릭한 지점에 복셀을 추가하는 역할입니다. [피킹에 관한 글](threejs-picking.html)에서 썼던 것과 비슷한 방법을 사용하는데, Three.js의 내장 `RayCaster`가 아닌 교차하는 지점의 좌표와 교차한 점의 법선(normal)을 반환하는 `VoxelWorld.intersectRay`를 사용합니다.

```js
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function placeVoxel(event) {
  const pos = getCanvasRelativePosition(event);
  const x = (pos.x / canvas.width ) *  2 - 1;
  const y = (pos.y / canvas.height) * -2 + 1;  // Y축을 뒤집었음

  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  start.setFromMatrixPosition(camera.matrixWorld);
  end.set(x, y, 1).unproject(camera);

  const intersection = world.intersectRay(start, end);
  if (intersection) {
    const voxelId = event.shiftKey ? 0 : currentVoxel;
    /**
     * 교차점은 면 위에 있습니다. 이는 수학적 오차로 인해 교차점이 면의 양면
     * 어디로 떨어질지 모른다는 이야기죠.
     * 그래서 복셀을 제거하는 경우(currentVoxel = 0)는 normal의 값을 반으로
     * 줄이고, 추가하는 경우(currentVoxel > 0)에는 방향을 바꾼 뒤 반만큼 줄입니다.
     **/
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
}, { passive: false });
canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  recordStartPosition(event.touches[0]);
}, { passive: false });
canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  recordMovement(event.touches[0]);
}, { passive: false });
canvas.addEventListener('touchend', () => {
  placeVoxelIfNoMovement({
    clientX: mouse.x,
    clientY: mouse.y,
  });
});
```

마우스는 두 가지 용도로 사용합니다. 하나는 카메라를 움직이는 용도이고, 다른 하나는 복셀을 수정하는 용도이죠. 복셀의 추가/제거 액션은 마우스를 누르고 전혀 움직이지 않았을 때만 발생합니다. 마우스를 누른 뒤 움직였다면 카메라를 돌리려는 의도로 간주한 것이죠. `moveX`와 `moveY`는 절대값으로, 왼쪽으로 10픽셀, 오른쪽으로 다시 10픽셀을 움직였다면 `moveX`는 20픽셀이 됩니다. 이러면 화면을 돌렸다가 다시 제자리에 놓는 경우에도 복셀의 추가/제거 액션이 발생하지 않을 겁니다. 5픽셀 이상 움직이지 않았을 경우 클릭으로 간주했는데, 별도 테스트는 진행하지 않은 임의의 값이니 참고 바랍니다.

위 코드에서는 `world.setVoxel`로 복셀을 추가한 뒤 `updateVoxelGeometry`를 호출해 Three.js가 변경된 geometry를 반영하도록 했습니다.

이제 이 `updateVoxelGeometry`를 만들어야 합니다. 사용자가 cell 가장자리의 복셀을 클릭했다면 새로운 cell geometry를 만들어야 할 수도 있죠. 때문에 방금 추가한 복셀 뿐만 아니라 해당 복셀의 cell 주변 cell들도 전부 확인해야 합니다.

```js
const neighborOffsets = [
  [ 0,  0,  0], // 자신
  [-1,  0,  0], // 왼쪽
  [ 1,  0,  0], // 오른쪽
  [ 0, -1,  0], // 아래
  [ 0,  1,  0], // 위
  [ 0,  0, -1], // 뒤
  [ 0,  0,  1], // 앞
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

처음에는 아래처럼 인접한 cell을 검사하려 했습니다.

```js
const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
if (voxelX === 0) {
  // cell을 왼쪽에 추가합니다.
} else if (voxelX === cellSize - 1) {
  // cell을 오른쪽에 추가합니다.
}
```

여기에 다른 4방향을 검사하는 코드를 추가하려 했지만, 이때 그냥 좌표값 배열을 만들어 이미 만든 cell의 id로 사용하는 게 더 낫다는 생각이 들었습니다. 추가한 복셀이 cell의 안에 있는 게 아니라면 해당 복셀을 추가하길 거부하는 게 더 빠를 테니까요.

`updateCellGeometry`는 간단히 이전에 cell을 만들었던 코드를 가져와 여러 cell을 만들 수 있도록 수정했습니다.

```js
const cellIdToMesh = {};
function updateCellGeometry(x, y, z) {
  const cellX = Math.floor(x / cellSize);
  const cellY = Math.floor(y / cellSize);
  const cellZ = Math.floor(z / cellSize);
  const cellId = world.computeCellId(x, y, z);
  let mesh = cellIdToMesh[cellId];
  const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();

  const { positions, normals, uvs, indices } = world.generateGeometryDataForCell(cellX, cellY, cellZ);
  const positionNumComponents = 3;
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  const normalNumComponents = 3;
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  const uvNumComponents = 2;
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  if (!mesh) {
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = cellId;
    cellIdToMesh[cellId] = mesh;
    scene.add(mesh);
    mesh.position.set(cellX * cellSize, cellY * cellSize, cellZ * cellSize);
  }
}
```

위 함수는 인덱스 맵과 cell의 id로 미리 만든 mesh가 있는지 확인합니다. 만약 해당 id(좌표)에 해당하는 cell이 없다면 새로운 cell mesh를 만들어 장면에 추가한 뒤 mesh의 속성과 인덱스 맵을 업데이트합니다.

{{{example url="../threejs-voxel-geometry-culled-faces-ui.html"}}}

참고:

예제의 방법 대신 `RayCaster`를 써도 괜찮은 결과가 나올 수 있습니다. 따로 테스트를 해보진 않았지만, 대신 [복셀에 최적화된 raycaster](http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf)를 찾아 이걸 적용했습니다.

`intersectRay`를 VoxelWorld의 메서드로 만든 건 성능 때문입니다. 복셀 단위로 체크하는 게 너무 느릴 경우 cell 단위로 먼저 체크해 성능을 좀 더 높혀보려는 계획이었죠.

현재 raycaster의 길이는 z-far까지인데, 이 값을 바꿔도 됩니다. 이건 제가 예제를 만들 때 1-2픽셀 정도로 보이는 먼 곳에는 복셀을 만들 일이 없다고 생각했기 때문이니까요.

`geometry.computeBoundingSphere` 메서드의 성능은 다소 느릴 수 있습니다. 이 경우 cell을 전부 포함하는 경계 구체를 직접 만들 수 있죠.

실제 프로젝트였다면 아마 복셀이 아예 없는 cell도 제거하는 게 좋았을 겁니다.

이 방법이 가장 별로일 경우는 당연히 체크판 형태로 복셀을 배치하는 경우(예를 들어 체크판의 흰색 칸에만 배치)일 겁니다. 당장은 이런 경우에 어떻게 성능을 향상시킬지 생각나는 방법이 없네요. 아마 사용자가 성능 때문에 거대한 체크판 만들기를 포기하는 게 더 빠를 겁니다.

예제에서는 간단한 형태만 구현하기 위해 텍스처 아틀라스를 텍스처 한 종류당 한 열씩만 만들었습니다. 각 복셀의 면에 다른 텍스처를 지정할 수 있도록 별도의 테이블을 만들면 좀 더 범용성을 추구할 수 있겠죠. 예제에서는 불필요한 낭비라고 생각해 해당 부분을 제외했습니다.

실제 마인크래프트에는 복셀도, 정육면체도 아닌 타일(tile)이라는 것이 있습니다. 울타리나 꽃 같은 것이 여기에 해당하죠. 이걸 구현하려면 각 복셀이 정육면체인지, 다른 geometry인지 판별하는 테이블을 만들어 복셀이 정육면체가 아닐 경우, 맞닿는 면을 제거하지 않도록 해야 합니다. 꽃 복셀 아래에 있는 땅 복셀이 지워져서는 안 되니까요.

이 글이 Three.js로 마인크래프트 같은 그래픽을 구현할 때 좋은 시작점을 마련하고, geometry를 최적화하는 데 도움이 되었으면 합니다.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-voxel-geometry.js"></script>
