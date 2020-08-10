Title: Three.js のプリミティブ　
Description: three.js プリミティブの旅
TOC: プリミティブ

この記事はthree.jsについてのシリーズ記事の一つです。
最初の記事は[Three.jsの基礎](threejs-fundamentals.html)です。
まだ読んでない人は、そちらから先に読んでみるといいかもしれません。

Three.jsは多くのプリミティブがあります。
プリミティブは、3D形状のことで、一般的に、実行時に複数のパラメータを指定して生成されます。


地球儀の球体や、3Dグラフを描くための箱の集まりのようなものに、プリミティブはよく使われます。
特に、プリミティブを使って実験して、3Dを始めるのが一般的です。
3Dアプリケーションの多くは、3Dモデルを[Blender](https://blender.org)や
[Maya](https://www.autodesk.com/products/maya/)や
[Cinema 4D](https://www.maxon.net/en-us/products/cinema-4d/)といった
3Dモデリングプログラムを使って、アーティストに作ってもらう方が一般的です。
このシリーズの後半では、いくつかの3Dモデリングプログラムからデータを作って
読み込む方法もカバーするつもりです。
では、three.jsで利用できるプリミティブについて説明しましょう。


以下のプリミティブの多くは、一部または全てのパラメータにデフォルト値が設定されています。
そのため、必要に応じて、上手く使い分けることができます。


<div id="Diagram-BoxBufferGeometry" data-primitive="BoxBufferGeometry">立方体</div>
<div id="Diagram-CircleBufferGeometry" data-primitive="CircleBufferGeometry">2次元の円</div>
<div id="Diagram-ConeBufferGeometry" data-primitive="ConeBufferGeometry">円錐</div>
<div id="Diagram-CylinderBufferGeometry" data-primitive="CylinderBufferGeometry">円筒</div>
<div id="Diagram-DodecahedronBufferGeometry" data-primitive="DodecahedronBufferGeometry">十二面体（12面のもの）</div>
<div id="Diagram-ExtrudeBufferGeometry" data-primitive="ExtrudeBufferGeometry">
押し出しでできた2次元形状、ベベルオプション付き。
これは<code>TextBufferGeometry</code>と<code>TextGeometry</code>のそれぞれの基礎になることに注意してください。</div>
<div id="Diagram-IcosahedronBufferGeometry" data-primitive="IcosahedronBufferGeometry">二十面体（20面のもの）</div>
<div id="Diagram-LatheBufferGeometry" data-primitive="LatheBufferGeometry">線を回転させてできる形状。例としてはこんなところでしょうか：ランプやボーリングのピン、ろうそく、ろうそく立て、ワイングラス、ドリンクグラス、などなど...。点の連続として2次元の輪郭を与え、その輪郭を軸の周りで回転させる際に、どのくらい細分化するかthree.jsに指示することができます。</div>
<div id="Diagram-OctahedronBufferGeometry" data-primitive="OctahedronBufferGeometry">八面体（8面）</div>
<div id="Diagram-ParametricBufferGeometry" data-primitive="ParametricBufferGeometry">関数を与えることでできる表面。この関数は、グリッド上2次元の点を引数に取り、対応する3次元の点を返す。</div>
<div id="Diagram-PlaneBufferGeometry" data-primitive="PlaneBufferGeometry">2次元の四角形</div>
<div id="Diagram-PolyhedronBufferGeometry" data-primitive="PolyhedronBufferGeometry">三角形を点の周りに集めて球体にする</div>
<div id="Diagram-RingBufferGeometry" data-primitive="RingBufferGeometry">真ん中に穴のあいた円盤</div>
<div id="Diagram-ShapeBufferGeometry" data-primitive="ShapeBufferGeometry">三角形分割された2次元の輪郭</div>
<div id="Diagram-SphereBufferGeometry" data-primitive="SphereBufferGeometry">球体</div>
<div id="Diagram-TetrahedronBufferGeometry" data-primitive="TetrahedronBufferGeometry">四面体（4面のもの）</div>
<div id="Diagram-TextBufferGeometry" data-primitive="TextBufferGeometry">3Dフォントと文字列からできた、3Dテキスト</div>
<div id="Diagram-TorusBufferGeometry" data-primitive="TorusBufferGeometry">円環（ドーナツ）</div>
<div id="Diagram-TorusKnotBufferGeometry" data-primitive="TorusKnotBufferGeometry">円環（結び目）</div>
<div id="Diagram-TubeBufferGeometry" data-primitive="TubeBufferGeometry">経路をなぞらせた管</div>
<div id="Diagram-EdgesGeometry" data-primitive="EdgesGeometry">異なるジオメトリを入力として、その面同士の角度が閾値以上なら角を作り出す、補助オブジェクト。例えば、記事の最初の方で紹介した立方体を見てみると、それぞれの面に、立方体を作っている全ての三角形の線が表示されています。<code>EdgesGeometry</code>を代わりに使うことで、面内の線は全て除去されます。下記のthresholdAngleを調整してみてください。閾値以下の角が消えて見えるでしょう。</div>
<div id="Diagram-WireframeGeometry" data-primitive="WireframeGeometry">1つの角ごとに1つの線分（2点）を持つジオメトリを生成する。WebGLは線分を作るのに2点が必要なので、この機能がないと、しばしば角を忘れたり、余分な角を作ってしまうでしょう。例えば、たった3点しかない1つの三角形あるとします。<code>wireframe: true</code>のマテリアルを使ってそれを描こうとした場合、1本の線分しか得られません。<code>WireframeGeometry</code>にその三角形のジオメトリを渡すと、6点からなる3つの線分を持った新しいジオメトリを生成します。</div>

ほとんどのプリミティブは`Geometry`か`BufferGeometry`の2つの種類があることに気づいたかもしれません。
この2つの違いは、高い柔軟性とパフォーマンスです。

`BufferGeometry`に基づいたプリミティブはパフォーマンス志向の種類です。
ジオメトリの頂点は、GPUにアップロードして描画するのに適した配列形式へ、直接変換されます。
これは、起動が速く省メモリであることを意味しますが、データの修正により複雑なプログラミングが必要になることが多いです。

`Geometry`に基づいたプリミティブは柔軟で、操作しやすい種類です。
これらは、3次元の点のための`Vector3`、三角形のための`Face3`のようなJavaScriptに基づくクラスからできています。結構メモリを必要としますし、three.jsにレンダリングされる前に、対応する`BufferGeometry`表現に似たものに変換する必要があります。

プリミティブを操作しないことが分かっているか、計算をして内部を操作することに抵抗がないなら、
`BufferGeometry`に基づいたプリミティブを使うのがベストです。
一方で、描画前に多少の変更をしたいなら、`Geometry`に基づいたプリミティブを使うと、
より簡単に扱うことができます。

単純な例だと、`BufferGeometry`は新しい頂点群を簡単に追加できません。
使う頂点の数は作成時に宣言され、記憶領域が確保され、データが書き込まれます。
一方、`Geometry`は、みなさんがしたいように頂点群を追加できます。

[別の記事](threejs-custom-geometry.html)で、カスタムジオメトリの作成について説明します。
今はそれぞれの種類のプリミティブを作成する例を作ってみます。
[以前の記事](threejs-responsive.html)を例に始めましょう。

最初の方で、背景色を指定します。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color(0xAAAAAA);
```

これでthree.jsに、透明からライトグレーに変えるように伝えます。

全てのオブジェクトを見られるよう、カメラの位置も変える必要があります。

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

`addObject`関数を加えましょう。これはx座標とy座標と`Object3D`を取り、シーンにオブジェクトを追加します。

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
変わります。0.5から1.0に変化するにつれて、`hue`から白に変化します。

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
理由はありません。
しかしこの例だと、2次元で裏側が存在しない`PlaneBufferGeometry`や`ShapeBufferGeometry`のようなものも描こうとしています。
`side: THREE.DoubleSide`を設定しないと、裏側を見たときに消えてしまうことでしょう。

`side: THREE.DoubleSide`に**not**が設定された方が、描画が速くなります。
そのため、理想的には本当に必要なときだけ設定するのが良いことを注記しておきます。
しかしこの例だと、そんなにたくさん描画しないので心配ありません。

`addSolidGeometry`関数を作りましょう。ジオメトリを渡すと`createMaterial`によってランダムに色が付いたマテリアルを作り、`addObject`によってシーンに追加してくれます。

```js
function addSolidGeometry(x, y, geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  addObject(x, y, mesh);
}
```

これで私たちの作るプリミティブの大多数に、この関数が使用できます。
例えば、立方体を作ってみます。

```js
{
  const width = 8;
  const height = 8;
  const depth = 8;
  addSolidGeometry(-2, -2, new THREE.BoxBufferGeometry(width, height, depth));
}
```

下記のコードを覗いてみると、それぞれの種類のジオメトリに対して、同じような箇所があります。

結果はこのようになります：

{{{example url="../threejs-primitives.html" }}}

上記のパターンには、2つの特筆すべき例外があります。
一番大きなものは、たぶん`TextBufferGeometry`です。テキストのメッシュを作るときは、事前に3Dフォントデータを読み込む必要があります。このデータの読み込みは非同期的に行われるので、ジオメトリを作ろうとする前に、読み込みを待つ必要があります。フォントの読み込みにpromiseを使うと、もっと速く読み込むことができます。
`FontLoader`を作成し、読み込みが完了するとフォントを提供してくれるpromiseを返す`loadFont`関数を作ります。
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

また、もう一つ違いがあります。私たちはテキストを、自身の中心の周りで回転させたかったのですが、
three.jsはデフォルトで、テキストを左端中心に回転するよう作成します。
これを回避するため、three.jsにジオメトリのバウンディングボックスの計算をさせることができます。
バウンディングボックスの`getCenter`メソッドを呼ぶことができるので、それにメッシュの位置オブジェクトに渡します。
すると、`getCenter`が箱の中心をその位置にコピーします。このとき、位置オブジェクトも返すので、回転の中心が物体の中心になるように、オブジェクト全体の位置に対して`multiplyScalar(-1)`を呼ぶことができます。

これだと、もし先の例のように`addSolidGeometry`を呼ぶと、
再び位置が設定されてしまいますが、それはよくありませんよね。
そのためこの例では、three.jsのシーングラフの標準的なノードである`Object3D`を作ります。
`Mesh`は同様に`Object3D`を継承しています。
[別の記事](threejs-scenegraph.html)でどのようにシーングラフが働くかカバーします。
今はとりあえず、DOMノードのように、子ノードは親ノードと関連して描画されると知っていれば十分です。
`Object3D`を作成し、メッシュをその子にすることで、どこにでも`Object3D`に配置し、
先ほど設定した中心のオフセットを維持したままにできます。

こうしないと、テキストが中央からずれて回ってしまうことになります。

{{{example url="../threejs-primitives-text.html" }}}

左側のものは自身の中心の周りを回転していませんが、右側のものはそうなっていることに
注意してください。

もう一つの例外は、`EdgesGeometry`と`WireframeGeometry`の、2つの直線に基づいた例です。
`addSolidGeometry`を呼ぶ代わりに、このように`addLineGeometry`を呼んでいます。

```js
function addLineGeometry(x, y, geometry) {
  const material = new THREE.LineBasicMaterial({color: 0x000000});
  const mesh = new THREE.LineSegments(geometry, material);
  addObject(x, y, mesh);
}
```

黒色の`LineBasicMaterial`を作り、次に`LineSegments`オブジェクトを作成しています。
これは`Mesh`のラッパーで、あなたが線分（線分あたり2点）を描画しようとしていることを
threeが知る手助けをします。

プリミティブのそれぞれは、作成時に渡すことができる複数のパラメーターを持っていて、
ここで繰り返し説明するよりも[このドキュメント](https://threejs.org/docs/)を覗いてもらうのが最善です。
また、各形状の横にある上記のリンクをクリックすると、その形状のドキュメントに直接案内されます。

上記パターンに全然当てはまらないクラスの組があります。
それは`PointsMaterial`と`Points`クラスです。`Points`は`LineSegments`に似ていて、
`Geometry`か`BufferGeometry`を引数に取ります。しかし、線の代わりに各頂点の点を描画します。
使うためには、`PointsMaterial`も渡す必要があります。
これは、点をどれくらい大きくするか決めるため[`size`](PointsMaterial.size) を引数に取ります。

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

カメラからの距離に関わらず点の大きさを同じにしたいなら、[`sizeAttenuation`](PointsMaterial.sizeAttenuation) をfalseにすることで、サイズ変更を止めることができます。

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

もう一つ説明が必要な大切なことは、ほとんど全部の形状が、
どのくらい細分化するか決めるための設定を持っていることです。
球体のジオメトリが良い例かもしれません。
球体は周囲と上下にどのくらい分割するかのパラメータがあります。
例えば、

<div class="spread">
<div data-diagram="SphereBufferGeometryLow"></div>
<div data-diagram="SphereBufferGeometryMedium"></div>
<div data-diagram="SphereBufferGeometryHigh"></div>
</div>

最初の球体は、15セグメントまたは30個の三角形になる、周囲に5セグメント、高さ3です。
二つ目の球体は、240セグメントまたは480個の三角形になる、周囲に24セグメント、高さ10です。です。
最後の球体は、2500セグメントまたは5000個の三角形になる、周囲に50セグメント、高さ50です。

どのくらい分割が必要かは、みなさんが決めることです。
多くのセグメントが必要なように見えるかもしれませんが、線を除去して、
影をならすことで、このようになります。

<div class="spread">
<div data-diagram="SphereBufferGeometryLowSmooth"></div>
<div data-diagram="SphereBufferGeometryMediumSmooth"></div>
<div data-diagram="SphereBufferGeometryHighSmooth"></div>
</div>

5000個の三角形からできる右側の球体が、たった480個の三角形からできる真ん中の球体よりも良いかは、明らかではありません。
地球の地図のために1個の地球儀を作るときのように、もし少ない数の球体を描くだけなら、
10000個の三角形の球体でも悪い選択ではありません。
一方で、1000個の球体を書こうとしているなら、1000個の球体におのおの10000個の三角形が
かかり、一千万個の三角形になります。
滑らかに動かすにはブラウザが一秒間に60フレーム描画する必要があるため、
ブラウザは1秒間に6億個の三角形を描画する必要があります。
それは計算が多すぎます。

選ぶのが簡単なときもあります。例えば、平面の細分化を選ぶこともできます。

<div class="spread">
<div data-diagram="PlaneBufferGeometryLow"></div>
<div data-diagram="PlaneBufferGeometryHigh"></div>
</div>

左側の四角形は2個の三角形からできています。右側の四角形は200個の三角形からできています。
球体のときと異なり、四角形の場合だと、質的なトレードオフは全くありません。
いくつかの用途で、たいてい四角形を改造したり歪めたりしたいと思っているときに、細分化するだけで良いでしょう。
立方体も同様です。

みなさんの状況にふさわしいものを選びましょう。
物体は、選んだ細分化が小さいほど、より滑らかに動いて、省メモリになることでしょう。
あなたの特定の状況にふさわしい、正しいトレードオフは何か、決めなければいけません。

みなさんの用途に適した形状がないなら、例えば、[.obj file](threejs-load-obj.html)
や[.gltf file](threejs-load-gltf.html)からジオメトリを読み込むことができます。
[カスタムジオメトリ](threejs-custom-geometry.html) 
や[カスタムBufferGeometry](threejs-custom-buffergeometry.html)を作ることもできます。

次は、[threeのシーングラフの動き方と使い方](threejs-scenegraph.html)を説明します。

<link rel="stylesheet" href="resources/threejs-primitives.css">
<script type="module" src="resources/threejs-primitives.js"></script>

