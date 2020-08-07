Title: Three.js のプリミティブ　
Description: three.js プリミティブの旅。
TOC: プリミティブ

この記事はthree.jsについてのシリーズ記事の一つです。
最初の記事は[Three.jsの基礎](threejs-fundamentals.html)です。
もしまだ読まれていない場合は、そちらを先に始めるのが良いでしょう。

Three.jsは多くのプリミティブがあります。
プリミティブは、一般的に実行時にパラメータ群を指定して生成される、3D形状のことです。


地球儀の球体や、3Dグラフを描くための箱の集まりのようなものに、プリミティブを使うのは一般的です。
実験したり3Dを始めたりするために、プリミティブを使うことは、とても普通です。
3Dアプリケーションの多くは、3Dモデルを[Blender](https://blender.org)や
[Maya](https://www.autodesk.com/products/maya/)や
[Cinema 4D](https://www.maxon.net/en-us/products/cinema-4d/)といった
3Dモデリングプログラムでを使って、アーティストに作ってもらう方が一般的です。
このシリーズの後半では、いくつかの3Dモデリングプログラムからデータを作って
読み込む方法にも言及するつもりです。
では、利用できるプリミティブについて説明しましょう。


以下のプリミティブの多くは、一部または全てのパラメーターのデフォルト値があり、
必要に応じて、多かれ少なかれ使うことができるでしょう。


<div id="Diagram-BoxBufferGeometry" data-primitive="BoxBufferGeometry">立方体</div>
<div id="Diagram-CircleBufferGeometry" data-primitive="CircleBufferGeometry">2次元の円</div>
<div id="Diagram-ConeBufferGeometry" data-primitive="ConeBufferGeometry">円錐</div>
<div id="Diagram-CylinderBufferGeometry" data-primitive="CylinderBufferGeometry">円筒</div>
<div id="Diagram-DodecahedronBufferGeometry" data-primitive="DodecahedronBufferGeometry">十二面体（12面のもの）</div>
<div id="Diagram-ExtrudeBufferGeometry" data-primitive="ExtrudeBufferGeometry">
ベベルのオプションが付いた、押し出された2次元形状。
これは<code>TextBufferGeometry</code>と<code>TextGeometry</code>のそれぞれの基礎になることに注意してください。</div>
<div id="Diagram-IcosahedronBufferGeometry" data-primitive="IcosahedronBufferGeometry">二十面体（20面のもの）</div>
<div id="Diagram-LatheBufferGeometry" data-primitive="LatheBufferGeometry">ある軸の周りを回転してできた形状。例としてはこんなところでしょうか：ランプやボーリングのピン、ろうそく、ろうそく立て、ワイングラス、ドリンクグラス、などなど...。点の連続として2次元の輪郭を与え、その輪郭を軸の周りで回転させる際に、どのくらい細かくするかthree.jsに指示することができます。</div>
<div id="Diagram-OctahedronBufferGeometry" data-primitive="OctahedronBufferGeometry">八面体（8面）</div>
<div id="Diagram-ParametricBufferGeometry" data-primitive="ParametricBufferGeometry">グリッドから2次元の点を取得し、対応する3次元の点を返す関数を作ることでできた表面。</div>
<div id="Diagram-PlaneBufferGeometry" data-primitive="PlaneBufferGeometry">2次元の四角形</div>
<div id="Diagram-PolyhedronBufferGeometry" data-primitive="PolyhedronBufferGeometry">ある点の周りに三角形の集まりを集めて球にする</div>
<div id="Diagram-RingBufferGeometry" data-primitive="RingBufferGeometry">真ん中に穴のあいた円盤</div>
<div id="Diagram-ShapeBufferGeometry" data-primitive="ShapeBufferGeometry">三角形分割された2次元の輪郭</div>
<div id="Diagram-SphereBufferGeometry" data-primitive="SphereBufferGeometry">球体</div>
<div id="Diagram-TetrahedronBufferGeometry" data-primitive="TetrahedronBufferGeometry">四面体（4面のもの）</div>
<div id="Diagram-TextBufferGeometry" data-primitive="TextBufferGeometry">3Dフォントと文字による3Dテキスト</div>
<div id="Diagram-TorusBufferGeometry" data-primitive="TorusBufferGeometry">円環（ドーナツ）</div>
<div id="Diagram-TorusKnotBufferGeometry" data-primitive="TorusKnotBufferGeometry">円環（結び目）</div>
<div id="Diagram-TubeBufferGeometry" data-primitive="TubeBufferGeometry">経路をなぞらせた管</div>
<div id="Diagram-EdgesGeometry" data-primitive="EdgesGeometry">異なるジオメトリを入力として、その面同士の角度が閾値以上なら角を作り出した補助オブジェクト。例えば、記事の最初の方で紹介した立方体を見てみると、それぞれの面に、立方体を作っている全ての三角形の線が表示されています。<code>EdgesGeometry</code>を代わりに使うことで、面内の線はす全て除去されます。下記のthresholdAngleを調整してみてください。閾値以下の角が消えて見えるでしょう。</div>
<div id="Diagram-WireframeGeometry" data-primitive="WireframeGeometry">1つの角ごとに1つの線分（2点）を持つジオメトリを生成する。WebGLは線分を作るのに2点が必要なので、この機能がないと、しばしば角を忘れたり、余分な角を作ってしまうでしょう。例えば、たった3点しかない1つの三角形あるとします。<code>wireframe: true</code>のマテリアルを使ってそれを描こうとした場合、1本の線分しか得られません。<code>WireframeGeometry</code>にその三角形のジオメトリを渡すと、6点からなる3つの線分を持った新しいジオメトリを生成します。</div>

ほとんどのプリミティブは`Geometry`か`BufferGeometry`の2つの種類があることに気づいたかもしれません。
この2つの違いは、高い柔軟性とパフォーマンスです。

`BufferGeometry`に基づいた基本形状はパフォーマンス志向の種類です。
形状の頂点は、レンダリングのためGPUにアップロードするのに適した配列形式に、直接生成されます。
これは、起動が速く省メモリであることを意味しますが、データの修正により複雑なプログラミングが必要になることが多いです。

`Geometry`に基づいた基本形状はより柔軟で、操作しやすい種類です。
これらは、3次元の点のための`Vector3`、三角形のための`Face3`のようなJavaScriptに基づくクラスからできています。結構メモリを必要としますし、three.jsにレンダリングされる前に、対応する`BufferGeometry`表現の類似物に変換する必要があります。

プリミティブを操作しないことが分かっているか、計算をして内部を操作することに抵抗がないなら、
`BufferGeometry`に基づいたプリミティブを使うのがベストです。
一方で、レンダリング前に少なからず変更を入れたいなら、`Geometry`に基づいたプリミティブを使うと、
より簡単に扱うことができます。

単純な例だと、`BufferGeometry`は新しい頂点群を簡単に追加できません。
使う頂点の数は作成時に宣言され、記憶領域が確保され、頂点群に関するデータが書き込まれます。
一方、`Geometry`は、あなたがしたいように頂点群を追加できます。

[別の記事](threejs-custom-geometry.html)で、カスタムジオメトリの作成について説明します。
今は、それぞれの種類のプリミティブを作成する例を作ってみましょう。
[以前の記事](threejs-responsive.html)を例に始めましょう。

最初の方で、背景色を指定します。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color(0xAAAAAA);
```

これでthree.jsに、透明からライトグレーに変えるように伝えます。

全てのオブジェクトを見られるよう、カメラも位置を変える必要があります。

```js
-const fov = 75;
+const fov = 40;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 120;
```

`addObject`関数を加えましょう。これはx座標とy座標と`Object3D`を取り、sceneにオブジェクトを追加します。

```js
const objects = [];
const spread = 15;

function addObject(x, y, obj) {
  obj.position.x = x * spread;
  obj.position.y = y * spread;

  scene.add(obj);
  objects.push(obj);
}
```

ランダムに色付けされたマテリアルを作る関数も作成してみましょう。
色相、彩度、輝度に基づいて色を設定できる、`Color`の機能を使ってみます。

`hue`は色相環を0から1まで変化します。赤は0、緑は.33、青は.66です。
`saturation`は0から1まで変化します。0 は無色で、1は最も彩度の高いです。
`luminance`は0から1まで変化します。0は黒、1は白、0.5が色の最大量になります。
言い換えると、`luminance`が0.0から0.5に変化するにつれて、色は黒から`hue`に
変わります。0.5から1.0までは`hue`から白に変化します。

```js
function createMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = .5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}
```

私たちは`side: THREE.DoubleSide`もマテリアルに渡しました。
これはthreeに形状を作るときに三角形の両面を描くように指示します。
球体や立方体のような立体形状には、形状の内側を向いている裏側を描く
理由がないのです。
しかしこの例では、2次元で裏側が存在しない`PlaneBufferGeometry`や`ShapeBufferGeometry`のような
ものを描こうとしています。
`side: THREE.DoubleSide`を設定しないと、裏側を見たときに消滅してしまうでしょう。

`side: THREE.DoubleSide`に**not**が設定された方が、描画が速くなるため、
理想的には本当に必要な時だけ設定するのが良いことを注記しておきます。
しかし、この例だと、そんなにたくさん描画しないので、心配ありません。

ジオメトリを渡すと`createMaterial`によってランダムに色が付いたマテリアルを作り、
`addObject`によってシーンに追加する`addSolidGeometry`関数を作りましょう。

```js
function addSolidGeometry(x, y, geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  addObject(x, y, mesh);
}
```

さて、私たちの作るプリミティブの大多数に、この関数が使用できます。
例えば、立方体を作ってみます。

```js
{
  const width = 8;
  const height = 8;
  const depth = 8;
  addSolidGeometry(-2, -2, new THREE.BoxBufferGeometry(width, height, depth));
}
```

下記のコードを覗いてみると、それぞれの種類のジオメトリに対して、同じようなセクションがあります。

結果はこのようになります：

{{{example url="../threejs-primitives.html" }}}

上記のパターンには、2つの特筆すべき例外があります。
最も大きなものは、たぶん`TextBufferGeometry`です。テキストのメッシュを作る前に、
3Dフォントデータを読み込む必要があります。フォントの読み込みにpromiseを使うと、
より速く読み込むことができます。
`FontLoader`を作ると、promiseを返す`loadFont`関数は、完了時にフォントを提供してくれるでしょう。
次に、`doit` と呼ばれる`async`関数を作り、`await`を使ってフォントを読み込みます。
最後に、ジオメトリを作り、`addObject`を呼んでシーンに追加します。

```js
{
  const loader = new THREE.FontLoader();
  // promisify font loading
  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  async function doit() {
    const font = await loadFont('resources/threejs/fonts/helvetiker_regular.typeface.json');  /* threejsfundamentals: url */
    const geometry = new THREE.TextBufferGeometry('three.js', {
      font: font,
      size: 3.0,
      height: .2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: .3,
      bevelSegments: 5,
    });
    const mesh = new THREE.Mesh(geometry, createMaterial());
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.add(mesh);

    addObject(-1, -1, parent);
  }
  doit();
}
```

もう一つ違いがあります。私たちはテキストをそれ自身の中心の周りで回転させたかったのですが、
three.jsはデフォルトではテキストを左端を中心に回転するように作成します。
これを回避するため、three.jsにジオメトリのバウンディングボックスの計算をさせることができます。
そこで、バウンディングボックスの`getCenter`メソッドを呼んで、それをメッシュの位置オブジェクトに
渡すことができます。
`getCenter`が箱の中心をその位置にコピーします。位置オブジェクトも返すので、
`multiplyScalar(-1)`を呼んでオブジェクト全体を置くことができます。
結果、回転の中心は物体の中心になります。

これだと、もし先の例のように`addSolidGeometry`を呼ぶと、
再び位置が設定されてしまいますが、それはよくありません。
そのため、この例では、three.jsのシーングラフでは標準的なノードである
`Object3D`を作ります。`Mesh`は同様に`Object3D`を継承しています。
[別の記事](threejs-scenegraph.html)でどのようにシーングラフが働くか扱います。
とりあえず、DOMノードのように、子ノードは親ノードと関連して描かれるというように、
知っていれば十分です。
`Object3D`を作成し、メッシュをその子にすることで、どこにでも`Object3D`に配置し、
先ほど設定した中心のオフセットを維持したままにできます。

こうしないと、テキストが中央からずれて回ってしまいます。

{{{example url="../threejs-primitives-text.html" }}}

左側のものは自身の中心の周りを回転していませんが、右側のものはそうなっていることに
気づいてください。

もう一つの例外は、`EdgesGeometry`と`WireframeGeometry`の、2つの直線に基づいた例です。
`addSolidGeometry`を呼ぶ代わりに、このように`addLineGeometry`を呼んでいます。

```js
function addLineGeometry(x, y, geometry) {
  const material = new THREE.LineBasicMaterial({color: 0x000000});
  const mesh = new THREE.LineSegments(geometry, material);
  addObject(x, y, mesh);
}
```

黒色の`LineBasicMaterial`を作り、次に`LineSegments`オブジェクトを作成します。
これは`Mesh`のラッパーで、あなたが線分（線分あたり2点）をレンダリングしようとしていることを
threeが知る補助をします。

プリミティブのそれぞれは、作成する際に渡すことができる複数のパラメーターを持っていて、
ここで繰り返すよりも[このドキュメント](https://threejs.org/docs/)を覗いてもらうことが一番良いです。
また、各形状の横にある上記のリンクをクリックすると、その形状のドキュメントに直接案内されます。

上記のパターンに全然はまらない1組のクラスがほかにあります。
それは`PointsMaterial`と`Points`クラスです。`Points`は`LineSegments`に似ていて、
`Geometry`か`BufferGeometry`を引数に取ります。しかし、線の代わりに各頂点の点を描画します。
使うためには、`PointsMaterial`も渡す必要があります。
これは、点をどれくらい大きくするか決めるため[`size`](PointsMaterial.size) を取ります。

```js
const radius = 7;
const widthSegments = 12;
const heightSegments = 8;
const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
const material = new THREE.PointsMaterial({
    color: 'red',
    size: 0.2,     // in world units
});
const points = new THREE.Points(geometry, material);
scene.add(points);
```

<div class="spread">
<div data-diagram="Points"></div>
</div>

カメラからの距離に関わらず店の大きさを同じにしたいのであれば、
 [`sizeAttenuation`](PointsMaterial.sizeAttenuation) をfalseにすることで、止めることができます。

```js
const material = new THREE.PointsMaterial({
    color: 'red',
+    sizeAttenuation: false,
+    size: 3,       // in pixels
-    size: 0.2,     // in world units
});
...
```

<div class="spread">
<div data-diagram="PointsUniformSize"></div>
</div>

説明が必要なもう一つの大切なことは、ほとんど全部の形状が、
どのくらい小分けにするか決める、様々な設定を持っていることです。
球体のジオメトリが良い例かもしれません。
球体は周囲と上下にどのくらい分割するかのパラメータがあります。
例えば、

<div class="spread">
<div data-diagram="SphereBufferGeometryLow"></div>
<div data-diagram="SphereBufferGeometryMedium"></div>
<div data-diagram="SphereBufferGeometryHigh"></div>
</div>

最初の球体は、周囲に5セグメント、高さ3なので、15セグメントまたは30個の三角形です。。
二つ目の球体は、周囲に24セグメント、高さが10です。240セグメントか480個の三角形です。
最後の球体は、周囲に50セグメント、高さが50で、2500セグメントか5000個の三角形です。

どのくらい分割が必要かは、あなたが決めることです。
多くのセグメントが必要なように見えるかもしれませんが、線を除去して、
影をならすことで、このようになります。

<div class="spread">
<div data-diagram="SphereBufferGeometryLowSmooth"></div>
<div data-diagram="SphereBufferGeometryMediumSmooth"></div>
<div data-diagram="SphereBufferGeometryHighSmooth"></div>
</div>

5000個の三角形による右側の球体の方が、たった480の真ん中の球体よりも
全くもって良いかは、明らかではありません。
地球の地図として一個の地球儀というように、もし、いくつかの球体を描くだけなら、
10000個の三角形の球体でも悪い選択ではありません。
一方で、1000個の球体を書こうとしているなら、1000個の球体におのおの10000個の三角形が
かかり、一千万個の三角形になります。
滑らかに動かすにはブラウザが一秒間に60フレーム描画する必要があるため、
ブラウザは1秒間に6億個の三角形を描画する必要があります。
それは計算が多すぎます。

Sometimes it's easy to choose. For example you can also choose
to subdivide a plane.
選ぶのが簡単な時もあります。例えば、平面の細分化を選ぶこともできます。

<div class="spread">
<div data-diagram="PlaneBufferGeometryLow"></div>
<div data-diagram="PlaneBufferGeometryHigh"></div>
</div>

左側の四角形は2つの三角形から成ります。右側の四角形は200個の三角形から成ります。
球体の時と異なり、四角形の場合だと、質的なトレードオフは全くありません。
いくつかの用途で、大抵の場合、四角形を改造したり歪めたりしたいと思っている時に、
四角形を細分化するだけで良いでしょう。
立方体も同様です。

あなたの状況にふさわしいものを選びましょう。
選んだ細分化が少ないほど、より滑らかに動いて、省メモリになることでしょう。
あなたの特定の状況にふさわしい、正しいトレードオフは何か、決めなければいけません。

あなたの用途に適した形状がないなら、例えば、[.obj file](threejs-load-obj.html)
や[.gltf file](threejs-load-gltf.html)からジオメトリを読み込むことができます。
[カスタムジオメトリ](threejs-custom-geometry.html) 
や[カスタムBufferGeometry](threejs-custom-buffergeometry.html)を作ることもできます。

次は、[threeのシーングラフの動き方と使い方](threejs-scenegraph.html)を説明します。

<link rel="stylesheet" href="../resources/threejs-primitives.css">
<script type="module" src="../resources/threejs-primitives.js"></script>

