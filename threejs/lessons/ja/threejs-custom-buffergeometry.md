Title: Three.jsのカスタムバッファジオメトリ
Description: カスタムバッファジオメトリを作る
TOC: カスタムバッファジオメトリ

[前回の記事](threejs-custom-geometry.html)では`Geometry`を紹介しました。この記事では`BufferGeometry`を紹介します。`BufferGeometry`とは*一般的に*高速で動きメモリ消費も低く抑えられます。が、設定は少し難しいです。

A [previous article](threejs-custom-geometry.html) covered
how to use `Geometry`. This article is about `BufferGeometry`.
`BufferGeometry` is *generally* faster to start and uses
less memory but can be harder to setup.

[ジオメトリの記事](threejs-custom-geometry.html) のおさらいをしましょう。`Geometry`には`Vector3`を設定する必要がありました。これは頂点を表す三次元上の点です。次に`Face3`を設定することで面を定義しました。これはvertexの配列のインデックス情報を使って３つの点を指定することで面を定義しています。光の反射方向などの設定するためにfaceにはnormal（法線）が必要でした。faceに対して１つのnormalを設定することもできますし、vertexに指定して滑らかな面を擬似的に作ることもできました。colorもnormalと同じようにfaceに指定したりvertexに指定したりできました。記事の最後では配列の配列を使ってテクスチャ座標（UV）を設定しました。配列の中の配列の１つが１つのfaceに対応しておりその配列の１つの要素がvertex１つに対応しています。

In [the article on Geometry](threejs-custom-geometry.html) we went over that to use a `Geometry` you supply an
array of `Vector3` vertices (positions). You then make `Face3` objects specifying
by index the 3 vertices that make each triangle of the shape you're making. To
each `Face3` you can specify either a face normal or normals for each individual
vertex of the face. You can also specify a face color or individual vertex
colors. Finally you can make a parallel array of arrays of texture coordinates
(UVs), one array for each face containing an array of UVs, one for each vertex
of the face.

<div class="threejs_center"><img src="resources/threejs-geometry.svg" style="width: 700px"></div>

`BufferGeometry`は`BufferAttribute`を使います。１つの`BufferAttribute`はジオメトリを作るための１種類のデータに対応しています。vertexの位置情報を格納するための`BufferAttribute`、color情報を格納するための`BufferAttribute`、normal情報を格納するための`BufferAttribute`がそれぞれあります。

`BufferGeometry` on the other hand uses *named* `BufferAttribute`s.
Each `BufferAttribute` represents an array of one type of data: positions,
normals, colors, and uv. Together, the added `BufferAttribute`s represent
*parallel arrays* of all the data for each vertex.

<div class="threejs_center"><img src="resources/threejs-attributes.svg" style="width: 700px"></div>

上の図では`position`, `normal`, `color`, `uv`それぞれのattribute情報を格納した`BufferAttribute`を表しています。これらは*並列な配列*です。*並列な配列*というのはN番目にあるデータはN番目のvertexに対応しており、それがattributeの数だけあるという意味です。図ではindex=4のattributeがハイライトされています。

Above you can see we have 4 attributes: `position`, `normal`, `color`, `uv`.
They represent *parallel arrays* which means that the Nth set of data in each
attribute belongs to the same vertex. The vertex at index = 4 is highlighted
to show that the parallel data across all attributes defines one vertex.

This brings up a point, here's a diagram of a cube with one corner highlighted.

<div class="threejs_center"><img src="resources/cube-faces-vertex.svg" style="width: 500px"></div>

上の図のハイライトされたvertexにはこのvertexに接する全ての面のnormalが指定されています。UVを指定するときもすべてのfaceに対して指定する必要があります。これが`Geometry`と`BufferGeometry`の大きな違いです。`BufferGeometry`では情報が共有されることはありません。単一のvertexはこれらの情報の合成として表現されます。

Thinking about it that single corner needs a different normal for each face of the
cube. It needs different UVs for each face as well. This points out the biggest difference
between `Geometry` and `BufferGeometry`. Nothing is shared with `BufferGeometry`.
A single *vertex* is the combination of all of its parts. If a vertex needs any
part to be different then it must be a different vertex.


実は`Geometry`を使うときはthree.jsが自動的にこのフォーマットに変換しています。`Geometry`が`BufferGeometry`よりメモリを使うのはこの変換のためです。すべての`Vector3`, `Vector2`, `Face3`を`BufferAttribute`配列に変換する際にメモリを使います。`Geometry`は簡単に書けるため便利ですが`BufferGeometry`を使う時にはこれら全ての変換を自分でする必要があります。

The truth is when you use `Geometry` three.js transforms it into this format.
That is where the extra memory and time comes from when using `Geometry`. Extra
memory for all the `Vector3`s, `Vector2`s, `Face3`s and array objects and then
extra time to translate all of that data into parallel arrays in the form of
`BufferAttribute`s like above. Sometimes that makes using `Geometry` easier.
With `BufferGeometry` it is up to us to supply the data already turned into this format.

簡単な例として`BufferGeometry`を使って立方体を作ってみましょう。立方体を例にするのはvertexがfaceによって共有されているように見えて実は共有されていないからです。この例ではまずすべてのvertexの情報をリストアップして並列の配列に変換して`BufferAttribute`を作り、最後に`BufferGeometry`を作ります。

As a simple example let's make a cube using `BufferGeometry`. A cube is interesting
because it appears to share vertices at the corners but really
does not. For our example we'll list out all the vertices with all their data
and then convert that data into parallel arrays and finally use those to make
`BufferAttribute`s and add them to a `BufferGeometry`.

[以前の記事](threejs-custom-geometry.html)のサンプルコードを使います。`Geometry`を作っていた部分は全て消します。次に立方体に必要な情報をすべてリストアップします。`Geometry`では１つのvertexを複数のfaceで共有できましたが今回は共有できないことに注意してください。つまり１つの立方体を作るために３６個のvertexが必要になります。１つの面につき２つの三角形、１つの三角形につき３つのvertex、これが６面あるので３６個のvertexが必要になる計算です。

Starting with the texture coordinate example from [the previous article](threejs-custom-geometry.html) we've deleted all the code related to setting up
a `Geometry`. Then we list all the data needed for the cube. Remember again
that if a vertex has any unique parts it has to be a separate vertex. As such
to make a cube requires 36 vertices. 2 triangles per face, 3 vertices per triangle,
6 faces = 36 vertices.

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

We can then translate all of that into 3 parallel arrays

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

Note that the names are significant. You must name your attributes the names
that match what three.js expects (unless you are creating a custom shader).
In this case `position`, `normal`, and `uv`. If you want vertex colors then
name your attribute `color`.

上の例では`positions`, `normals`, `uvs`の３つのJavaScriptのネイティブ配列を作りました。次に`Float32Array`型の[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)に変換します。`BufferAttribute`はネイティブ配列ではなくTypedArrayである必要があります。さらにそれぞれの`BufferAttribute`に対して「１つのvertexに対していくつの要素が必要か」を指定する必要があります。例えばpositionやnormalsは３次元なので１つのvertexつき３つの要素を必要とします。UVはテクスチャ上の２次元の点なので２つの要素を必要とします。

Above we created 3 JavaScript native arrays, `positions`, `normals` and `uvs`.
We then convert those into
[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
of type `Float32Array`. A `BufferAttribute` requires a TypedArray not a native
array. A `BufferAttribute` also requires you to tell it how many components there
are per vertex. For the positions and normals we have 3 components per vertex,
x, y, and z. For the UVs we have 2, u and v.

{{{example url="../threejs-custom-buffergeometry-cube.html"}}}


かなり大量のデータです。この配列からvertexを選ぶときにはインデックスを使います。１つの三角形は３つのvertexで構成されていて２つの三角形が１つのfaceを作っています。これが６枚で１つの立方体を構成しています。１つのfaceを構成する２つの三角形を作っているvertexは２つが同じデータを持っています。position, normal, UVすべて同じです。そこで重複しているデータを１つ消して１つにして、そのデータを別のインデックスで指定します。

ではまず重複したデータを１つにします。


That's a lot of data. A small thing we can do is use indices to reference
the vertices. Looking back at our cube data, each face is made from 2 triangles
with 3 vertices each, 6 vertices total, but 2 of those vertices are exactly the same;
The same position, the same normal, and the same uv.
So, we can remove the matching vertices and then
reference them by index. First we remove the matching vertices.

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

So now we have 24 unique vertices. Then we specify 36 indices
for the 36 vertices we need drawn to make 12 triangles by calling `BufferGeometry.setIndex` with an array of indices.

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

Just like `Geometry`, `BufferGeometry` has a [`computeVertexNormals`](BufferGeometry.computeVertexNormals) method for computing normals if you
are not supplying them. Unlike the `Geometry` version of the same function,
since positions can not be shared if any other part of a vertex is different
the results of calling `computeVertexNormals` will be different.

<div class="spread">
  <div>
    <div data-diagram="bufferGeometryCylinder"></div>
    <div class="code">BufferGeometry</div>
  </div>
  <div>
    <div data-diagram="geometryCylinder"></div>
    <div class="code">Geometry</div>
  </div>
</div>

シリンダーで`computeVertexNormals`の違いを比較してみましょう。よく見ると左のシリンダーには縫い目が見えると思います。これはvertexを共有することができないためにUVも異なるためです。ちょっとしたことですが、気になるときは自分でnormalを指定すれば良いだけです。

Here are 2 cylinders where the normals were created using `computeVertexNormals`.
If you look closely there is a seam on the left cylinder. This is because there
is no way to share the vertices at the start and end of the cylinder since they
require different UVs. Just a small thing to be aware of. The solution is
to supply your own normals.

ネイティブの配列を使う代わりに[TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)を使うこともできます。TypedArrayは最初に配列の大きさを指定する必要があるため少し面倒です。ネイティブの配列は`push`で追加して`length`で配列の長さを確認することができます。TypedArrayには`push`メソッドがないのであらかじめ用意した配列に注意しながら要素を入れていく必要があります。

We can also use [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) from the start instead of native JavaScript arrays.
The disadvantage to TypedArrays is you must specify their size up front. Of
course that's not that large of a burden but with native arrays we can just
`push` values onto them and look at what size they end up by checking their
`length` at the end. With TypedArrays there is no push function so we need
to do our own bookkeeping when adding values to them.

この例では最初に大きなデータを使っているので配列の長さを意識することはそれほど大変ではありません。

In this example knowing the length up front is pretty easy since we're using
a big block of static data to start.

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

A good reason to use typedarrays is if you want to dynamically update any
part of the vertices.

I couldn't think of a really good example of dynamically updating the vertices
so I decided to make a sphere and move each quad in and out from the center. Hopefully
it's a useful example.

Here's the code to generate positions and indices for a sphere. The code
is sharing vertices within a quad but it's not sharing vertices between
quads because we want to be able to move each quad separately.

Because I'm lazy I used a small hierarchy of 3 `Object3D` objects to compute
sphere points. How this works is explained in [the article on optimizing lots of objects](threejs-optimize-lots-of-objects.html).

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

We can then call it like this

```js
const segmentsAround = 24;
const segmentsDown = 16;
const {positions, indices} = makeSpherePositions(segmentsAround, segmentsDown);
```

returnされているpositionは単位球（半径が１の球体）なのでそのままこのデータをnormalに使えます。

Because positions returned are unit sphere positions so they are exactly the same
values we need for normals so we can just duplicated them for the normals.

```js
const normals = positions.slice();
```

attributeも設定しましょう。

And then we setup the attributes like before

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

I've highlighted a few differences. We save a reference to the position attribute.
We also mark it as dynamic. This is a hint to THREE.js that we're going to be changing
the contents of the attribute often.

In our render loop we update the positions based off their normals every frame.

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

And we set `positionAttribute.needsUpdate` to tell THREE.js to use our changes.

{{{example url="../threejs-custom-buffergeometry-dynamic.html"}}}

`BufferGeometry`を作って`BufferAttribute`をアップデートする方法を紹介しました。`BufferAttribute`を使うか`Geometry`はケースバイケースです。

I hope these were useful examples of how to use `BufferGeometry` directly to
make your own geometry and how to dynamically update the contents of a
`BufferAttribute`. Which you use, `Geometry` or `BufferGeometry`, really
depends on your needs.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-custom-buffergeometry.js"></script>

