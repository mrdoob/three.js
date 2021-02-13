Title: Three.jsのカスタムバッファジオメトリ
Description: カスタムバッファジオメトリを作る
TOC: カスタムバッファジオメトリ

`BufferGeometry`は全てのジオメトリを表現する方法です。
BufferGeometryは`BufferAttribute`を使います。１つの`BufferAttribute`はジオメトリを作るための１種類のデータに対応しています。vertexの位置情報を格納するための`BufferAttribute`、color情報を格納するための`BufferAttribute`、normal情報を格納するための`BufferAttribute`がそれぞれあります。

<div class="threejs_center"><img src="resources/threejs-attributes.svg" style="width: 700px"></div>

上の図では`position`, `normal`, `color`, `uv`それぞれのattribute情報を格納した`BufferAttribute`を表しています。これらは*並列な配列*です。*並列な配列*というのはN番目にあるデータはN番目のvertexに対応しており、それがattributeの数だけあるという意味です。図ではindex=4のattributeがハイライトされています。

<div class="threejs_center"><img src="resources/cube-faces-vertex.svg" style="width: 500px"></div>

上の図のハイライトされたvertexには、このvertexに接する全ての面に異なるnormalが必要です。normalとはどの方向を向いているかの情報です。
この図ではnormalは角の頂点の周りの矢印で示されており、その頂点に接する全ての面には異なる方向を指すnormalが必要です。

同様に面ごとに違うUVも必要です。
UVはテクスチャのどの部分に頂点位置が対応しているか指定するテクスチャ座標です。
緑の面はFテクスチャの右上に対応するUV、青い面は左上に対応するUV、赤の面は左下に対応したUVが必要な事が分かります。

単一のvertexはこれらの情報の合成として表現されます。
頂点が異なる部分を必要とする場合、それは異なる頂点でなければなりません。

簡単な例として`BufferGeometry`を使って立方体を作ってみましょう。立方体を例にするのはvertexがfaceによって共有されているように見えて実は共有されていないからです。この例ではまずすべてのvertexの情報をリストアップして並列の配列に変換して`BufferAttribute`を作り、最後に`BufferGeometry`を作ります。

立方体に必要な情報をすべてリストアップします。`Geometry`では１つのvertexを複数のfaceで共有できましたが今回は共有できないことに注意してください。つまり１つの立方体を作るために３６個のvertexが必要になります。１つの面につき２つの三角形、１つの三角形につき３つのvertex、これが６面あるので３６個のvertexが必要になる計算です。

```js
const vertices = [
  // front
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },

  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
  // right
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
  // back
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },

  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
  // left
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },

  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], },
  // top
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], },
  // bottom
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },

  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], },
];
```

次にこれを３つの並列な配列に変換します。
（訳註：並列な配列*parallel arrays*とは例えば頂点を指定する配列と色を指定する配列があり１つの頂点をレンダリングするために２つの配列の同じインデックスの要素を指定するような使われ方をする配列のことです。次の例ではpositions, normals, uvsの３つの配列が並列の配列として使われています）

```js
const positions = [];
const normals = [];
const uvs = [];
for (const vertex of vertices) {
  positions.push(...vertex.pos);
  normals.push(...vertex.norm);
  uvs.push(...vertex.uv);
}
```

最後にそれぞれの配列に対して`BufferAttribute`を作り`BufferGeometry`に指定します。

```js
  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
```

名前の付け方に注意してください。three.jsで決められている名前以外を指定することはできません（カスタムシェーダーを使用する場合は別です）。`position`, `normal`, `uv`はthree.jsで決められている名前です。ここでは指定していませんが`color`も指定可能です。

上の例では`positions`, `normals`, `uvs`の３つのJavaScriptのネイティブ配列を作りました。次に`Float32Array`型の[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)に変換します。`BufferAttribute`はネイティブ配列ではなくTypedArrayである必要があります。さらにそれぞれの`BufferAttribute`に対して「１つのvertexに対していくつの要素が必要か」を指定する必要があります。例えばpositionやnormalsは３次元なので１つのvertexつき３つの要素を必要とします。UVはテクスチャ上の２次元の点なので２つの要素を必要とします。

{{{example url="../threejs-custom-buffergeometry-cube.html"}}}

かなり大量のデータです。この配列からvertexを選ぶときにはインデックスを使います。１つの三角形は３つのvertexで構成されていて２つの三角形が１つのfaceを作っています。これが６枚で１つの立方体を構成しています。１つのfaceを構成する２つの三角形を作っているvertexは２つが同じデータを持っています。position, normal, UVすべて同じです。そこで重複しているデータを１つ消して１つにして、そのデータを別のインデックスで指定します。

ではまず重複したデータを１つにします。

```js
const vertices = [
  // front
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
-
-  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
-  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
  // right
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
-
-  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
-  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
  // back
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
-
-  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
-  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
  // left
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 12
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 13
-
-  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 14
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 15
  // top
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
-
-  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
-  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
  // bottom
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
-
-  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
];
```

はい、24個になりました。これに対して36個のインデックスを指定して36個のvertexを作ります。`BufferGeometry.setIndex`により36個のインデックスを使って12個の三角形を作ります。

```js
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(uvs, uvNumComponents));

+geometry.setIndex([
+   0,  1,  2,   2,  1,  3,  // front
+   4,  5,  6,   6,  5,  7,  // right
+   8,  9, 10,  10,  9, 11,  // back
+  12, 13, 14,  14, 13, 15,  // left
+  16, 17, 18,  18, 17, 19,  // top
+  20, 21, 22,  22, 21, 23,  // bottom
+]);
```

{{{example url="../threejs-custom-buffergeometry-cube-indexed.html"}}}

`Geometry`と同じように`BufferGeometry`も[`computeVertexNormals`](BufferGeometry.computeVertexNormals)メソッドを持っています。これは特に指定がない場合に自動的にnormalを計算するメソッドです。ただし`Geometry`の場合と違いvertexがfaceによって共有されていないために`computeVertexNormals`の結果も少し違います。

<div class="spread">
  <div>
    <div data-diagram="bufferGeometryCylinder"></div>
  </div>
</div>

シリンダーで`computeVertexNormals`の違いを比較してみましょう。よく見ると左のシリンダーには縫い目が見えると思います。これはvertexを共有することができないためにUVも異なるためです。ちょっとしたことですが、気になるときは自分でnormalを指定すれば良いだけです。

ネイティブの配列を使う代わりに[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)を使うこともできます。TypedArrayは最初に配列の大きさを指定する必要があるため少し面倒です。ネイティブの配列は`push`で追加して`length`で配列の長さを確認することができます。TypedArrayには`push`メソッドがないのであらかじめ用意した配列に注意しながら要素を入れていく必要があります。

この例では最初に大きなデータを使っているので配列の長さを意識することはそれほど大変ではありません。

```js
-const positions = [];
-const normals = [];
-const uvs = [];
+const numVertices = vertices.length;
+const positionNumComponents = 3;
+const normalNumComponents = 3;
+const uvNumComponents = 2;
+const positions = new Float32Array(numVertices * positionNumComponents);
+const normals = new Float32Array(numVertices * normalNumComponents);
+const uvs = new Float32Array(numVertices * uvNumComponents);
+let posNdx = 0;
+let nrmNdx = 0;
+let uvNdx = 0;
for (const vertex of vertices) {
-  positions.push(...vertex.pos);
-  normals.push(...vertex.norm);
-  uvs.push(...vertex.uv);
+  positions.set(vertex.pos, posNdx);
+  normals.set(vertex.norm, nrmNdx);
+  uvs.set(vertex.uv, uvNdx);
+  posNdx += positionNumComponents;
+  nrmNdx += normalNumComponents;
+  uvNdx += uvNumComponents;
}

geometry.setAttribute(
    'position',
-    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
+    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
-    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
+    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
-    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
+    new THREE.BufferAttribute(uvs, uvNumComponents));

geometry.setIndex([
   0,  1,  2,   2,  1,  3,  // front
   4,  5,  6,   6,  5,  7,  // right
   8,  9, 10,  10,  9, 11,  // back
  12, 13, 14,  14, 13, 15,  // left
  16, 17, 18,  18, 17, 19,  // top
  20, 21, 22,  22, 21, 23,  // bottom
]);
```

{{{example url="../threejs-custom-buffergeometry-cube-typedarrays.html"}}}

TypedArrayはプログラムが走っている状態でvertexの編集をしたいときに便利です。

良い例が思いつかないのでとりあえずメッシュの四角形が出たり入ったりする球体を作ってみます。

球体の位置とindexを生成するコードです。四角形の中でvertexを共有していますが四角形と四角形でvertexを共有することはありません。共有してしまうと１つの四角形が出たり入ったりするたびに隣の四角形が移動してしまいます。今回は別々に移動させたいのでそうしています。

面倒なので３つの`Object3D`階層を用意して球体のvertexを計算します。くわしくは[たくさんのオブジェクトを最適化するこの記事](threejs-optimize-lots-of-objects.html)をご覧ください。

```js
function makeSpherePositions(segmentsAround, segmentsDown) {
  const numVertices = segmentsAround * segmentsDown * 6;
  const numComponents = 3;
  const positions = new Float32Array(numVertices * numComponents);
  const indices = [];

  const longHelper = new THREE.Object3D();
  const latHelper = new THREE.Object3D();
  const pointHelper = new THREE.Object3D();
  longHelper.add(latHelper);
  latHelper.add(pointHelper);
  pointHelper.position.z = 1;
  const temp = new THREE.Vector3();

  function getPoint(lat, long) {
    latHelper.rotation.x = lat;
    longHelper.rotation.y = long;
    longHelper.updateMatrixWorld(true);
    return pointHelper.getWorldPosition(temp).toArray();
  }

  let posNdx = 0;
  let ndx = 0;
  for (let down = 0; down < segmentsDown; ++down) {
    const v0 = down / segmentsDown;
    const v1 = (down + 1) / segmentsDown;
    const lat0 = (v0 - 0.5) * Math.PI;
    const lat1 = (v1 - 0.5) * Math.PI;

    for (let across = 0; across < segmentsAround; ++across) {
      const u0 = across / segmentsAround;
      const u1 = (across + 1) / segmentsAround;
      const long0 = u0 * Math.PI * 2;
      const long1 = u1 * Math.PI * 2;

      positions.set(getPoint(lat0, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat0, long1), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long1), posNdx);  posNdx += numComponents;

      indices.push(
        ndx, ndx + 1, ndx + 2,
        ndx + 2, ndx + 1, ndx + 3,
      );
      ndx += 4;
    }
  }
  return {positions, indices};
}
```

こんな感じです。

```js
const segmentsAround = 24;
const segmentsDown = 16;
const {positions, indices} = makeSpherePositions(segmentsAround, segmentsDown);
```

returnされているpositionは単位球（半径が１の球体）なのでそのままこのデータをnormalに使えます。

```js
const normals = positions.slice();
```

attributeも設定しましょう。

```js
const geometry = new THREE.BufferGeometry();
const positionNumComponents = 3;
const normalNumComponents = 3;

+const positionAttribute = new THREE.BufferAttribute(positions, positionNumComponents);
+positionAttribute.setUsage(THREE.DynamicDrawUsage);
geometry.setAttribute(
    'position',
+    positionAttribute);
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setIndex(indices);
```

position attributeに対する参照を保存しています。dynamicに指定しているところも注意が必要です。これはTHREE.jsに「これからこのattributeは変更が加えられる」ことを教えます。renderループではpositionを毎度アップデートします。

```js
const temp = new THREE.Vector3();

...

for (let i = 0; i < positions.length; i += 3) {
  const quad = (i / 12 | 0);
  const ringId = quad / segmentsAround | 0;
  const ringQuadId = quad % segmentsAround;
  const ringU = ringQuadId / segmentsAround;
  const angle = ringU * Math.PI * 2;
  temp.fromArray(normals, i);
  temp.multiplyScalar(THREE.MathUtils.lerp(1, 1.4, Math.sin(time + ringId + angle) * .5 + .5));
  temp.toArray(positions, i);
}
positionAttribute.needsUpdate = true;
```

最後に`positionAttribute.needsUpdate`を設定してTHREE.jsに変更が必要であることを伝えます。

{{{example url="../threejs-custom-buffergeometry-dynamic.html"}}}

`BufferGeometry`を作って`BufferAttribute`をアップデートする方法を紹介しました。

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-custom-buffergeometry.js"></script>

