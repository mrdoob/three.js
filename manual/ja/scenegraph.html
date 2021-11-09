Title: Three.jsのシーングラフ
Description: シーングラフとはなにか？
TOC: シーングラフ

この記事はthree.jsについてのシリーズ記事の一つです。
最初の記事は[Three.jsの基礎](threejs-fundamentals.html)です。
まだ読んでない人は、そちらから先に読んでみるといいかもしれません。

Three.jsの核心は間違いなくシーングラフです。
3Dエンジンのシーングラフは、各ノードがローカルな空間を表現している、グラフ内のノードの階層です。

<img src="resources/images/scenegraph-generic.svg" align="center">

抽象的なので、例をいくつか挙げてみましょう。

例の一つは太陽系、太陽・地球・月でしょうか。

<img src="resources/images/scenegraph-solarsystem.svg" align="center">

地球は太陽を回っています。月は地球を回っています。
月は地球の周りを円を描いて移動しています。月から見ると、地球の"ローカルな空間"を回っていることになります。
太陽との相対的な動きは、月の視点から見るとクレイジーな螺旋のような曲線に見えますが、単に地球のローカルな空間を周回していると捉える必要があります。

{{{diagram url="resources/moon-orbit.html" }}}

別の考え方をしてみます。地球が地軸の周りを自転していることも、太陽の周りを公転していることも、
地球に住んでいるあなたが考える必要はありません。
皆さんは全くもって地球が動きも回りもしていないかのように、
歩いたり、ドライブしたり、泳いだり、走ったりするだけです。
地球の"ローカルな空間"で歩いたり、ドライブしたり、泳いだり、走ったり、そして生活したりしていても、みなさんは太陽と相対的に、地球の上で1,600km/hの速さで回転し、太陽の周りを107,200km/hの速度で回っています。
太陽系上のみなさんの位置は、前述した月と同じようなものですが、気にする必要はありません。
みなさんは地球の"ローカルな空間"で、地球との相対的な位置だけを心配していればいいのです。

一歩進みましょう。私たちは太陽と地球と月の図を作りたいと想像してみてください。
まず、太陽から始めましょう。ただ球体を作り原点に置くだけです。
シーングラフを使う方法の演習として、太陽、地球、月を使うことを、気に留めておいてください。
もちろん、現実の太陽、地球、月は物理学に従いますが、演習目的なので、シーングラフで代用します。


```js
// an array of objects whose rotation to update
const objects = [];

// use just one sphere for everything
const radius = 1;
const widthSegments = 6;
const heightSegments = 6;
const sphereGeometry = new THREE.SphereGeometry(
    radius, widthSegments, heightSegments);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);  // make the sun large
scene.add(sunMesh);
objects.push(sunMesh);
```

とても少ないポリゴンからできた球体を使います。緯度方向にたった6分割です。
これで、回転していることが見やすくなります。

同じ球体を全ての球体に使いまわすつもりなので、太陽のメッシュの大きさを5倍にしておきます。

また、phong materialの`emissive`属性を黄色に設定します。
phong materialのemissive属性は、基本的に、光が当たっていない表面に描かれる色です。
光源はその色に付け加えられます。

次に、シーンの真ん中に1つ点光源を置きましょう。後ほど、より詳細に点光源について説明しますが、
一点から発せられる明かりというのが、とりあえずの簡単な説明です。

```js
{
  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);
}
```

見やすくするために、直接原点を見下ろすようにカメラを置きましょう。
最も簡単な方法は `lookAt`関数を使うことです。
`lookAt`関数は、引数に渡した位置を「見る」ようにカメラを向けます。
その前に、カメラの上部がどの方向を向いているか、もしくは、
カメラにとってどの方向が"上"なのかを、カメラに伝える必要があります。
ほとんどの場合、Y軸の正が上で十分ですが、
今は見下ろしているので、Z軸の正が上だとカメラに伝える必要があります。

```js
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
```

レンダリングループの中で、前の例を参考にして、以下のコードで、`objects`配列内の全てのオブジェクトを回転させています。

```js
objects.forEach((obj) => {
  obj.rotation.y = time;
});
```

`sunMesh`を`objects`配列に追加したので、回転します。

{{{example url="../threejs-scenegraph-sun.html" }}}

さて、地球を追加してみましょう。

```js
const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
scene.add(earthMesh);
objects.push(earthMesh);
```

青いマテリアルを作っていますが、黒背景に対して目立つよう、
*emissive*に少し青色を設定します。

`earthMesh`を作るため、新しく作った青色の`earthMaterial`と、先と同じ`sphereGeometry`を使います。
それを太陽の10ユニット左側に置き、シーンに追加します。
これは`objects`配列にそれを追加されたので、同様に回転します。


{{{example url="../threejs-scenegraph-sun-earth.html" }}}

太陽と地球の両方が回転して見えますが、地球は太陽の周りを公転していません。
地球を太陽の子要素にしてみましょう。

```js
-scene.add(earthMesh);
+sunMesh.add(earthMesh);
```

そして...

{{{example url="../threejs-scenegraph-sun-earth-orbit.html" }}}

なにが起きましたか？なぜ地球が太陽と同じ大きさで、こんなに離れているのでしょうか。
地球を見るためには、実際のところ、カメラを50ユニット上から、150ユニット上に動かす必要がありました。

`earthMesh`を`sunMesh`の子要素としました。
`sunMesh`は`sunMesh.scale.set(5, 5, 5)`によって5倍に大きさを設定しています。
よって、`sunMesh`のローカルな空間は5倍大きくなりました。
その空間におかれるあらゆるものは5倍されるのです。
つまり、地球が5倍大きくなり、太陽からの距離も5倍（`earthMesh.position.x = 10`）になったのです。

  シーングラフは、このようになります。

<img src="resources/images/scenegraph-sun-earth.svg" align="center">

これを修正するため、シーングラフに空のノードを追加しましょう。
そして、太陽と地球の両方をそのノードの子要素にしましょう。

```js
+const solarSystem = new THREE.Object3D();
+scene.add(solarSystem);
+objects.push(solarSystem);

const sunMaterial = new THREE.MeshPhongMaterial({emissive: 0xFFFF00});
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(5, 5, 5);
-scene.add(sunMesh);
+solarSystem.add(sunMesh);
objects.push(sunMesh);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
earthMesh.position.x = 10;
-sunMesh.add(earthMesh);
+solarSystem.add(earthMesh);
objects.push(earthMesh);
```

ここで`Object3D`を作りました。`Mesh`のように、シーングラフのノードですが、`Mesh`とは異なり、マテリアルやジオメトリを持ちません。
ただローカルな空間を表現するだけです。

新しいシーングラフは、このようになります。

<img src="resources/images/scenegraph-sun-earth-fixed.svg" align="center">

`sunMesh`と`earthMesh`は共に`solarSystem`の子要素です。3つ全部が回転していますが、
いま`earthMesh`は`sunMesh`の子要素ではないので、5倍に拡大されません。

{{{example url="../threejs-scenegraph-sun-earth-orbit-fixed.html" }}}

とてもよくなりました。地球は太陽よりも小さく、太陽の周りを公転しつつ、自転しています。

続けて、同様の方法で月を追加してみましょう。

```js
+const earthOrbit = new THREE.Object3D();
+earthOrbit.position.x = 10;
+solarSystem.add(earthOrbit);
+objects.push(earthOrbit);

const earthMaterial = new THREE.MeshPhongMaterial({color: 0x2233FF, emissive: 0x112244});
const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
-solarSystem.add(earthMesh);
+earthOrbit.add(earthMesh);
objects.push(earthMesh);

+const moonOrbit = new THREE.Object3D();
+moonOrbit.position.x = 2;
+earthOrbit.add(moonOrbit);

+const moonMaterial = new THREE.MeshPhongMaterial({color: 0x888888, emissive: 0x222222});
+const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
+moonMesh.scale.set(.5, .5, .5);
+moonOrbit.add(moonMesh);
+objects.push(moonMesh);
```

再び、描画されないシーングラフのノードを追加しました。これは、`earthOrbit`と呼ばれる`Object3D`です。
そして、このノードに`earthMesh`と`moonMesh`の両方を追加しました。
新しいシーングラフは、このようになります。

<img src="resources/images/scenegraph-sun-earth-moon.svg" align="center">

そして、このように描画されます。

{{{example url="../threejs-scenegraph-sun-earth-moon.html" }}}

記事の上部でお見せした螺旋のパターンに沿った月が見えます。
しかし、手動で操作する必要はありませんでした。
ただ、シーングラフを設定しただけです。

シーングラフのノードが分かるような、なにかを描写すると、便利なことがあります。
Three.jsはこれをするために、helpfulとか、helpersとかがあります。

一つは`AxesHelper`です。
ローカルな<span style="color:red">X</span>、<span style="color:green">Y</span>、<span style="color:blue">Z</span>軸を表す
3つの線を描画します。
私たちが作った全てのノードに加えましょう。

```js
// add an AxesHelper to each node
objects.forEach((node) => {
  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  node.add(axes);
});
```

私たちの場合、たとえ球体の内部であったとしても、軸を表示させたいです。
これをするために、マテリアルの`depthTest`をfalseにします。
これによって、軸がなにかの内部に描画されているかどうかチェックしなくなります。
全ての球体の後に描画されるように、`renderOrder`も1に設定します（デフォルト値は0です）。
そうしないと、球体が軸の上に描画され、軸を覆ってしまう可能性があります。

{{{example url="../threejs-scenegraph-sun-earth-moon-axes.html" }}}

<span style="color:red">x (赤)</span> と<span style="color:blue">z (青)</span>の
軸が見えます。私たちはオブジェクトをまっすぐ見下ろしていて、オブジェクトはy軸を中心に
回転しているので、<span style="color:green">y (緑)</span>軸があまり見えません。

位置が重なった軸が2組あるので、見づらいかもしれません。
`sunMesh`と`solarSystem`は同じ場所にあります。
同様に、`earthMesh`と`earthOrbit`は同じ場所にあります。
各ノードに対してオン/オフできるように、簡単な操作を加えてみましょう。
そのついでに、`GridHelper` というヘルパー関数も追加しておきましょう。
これはX,Z平面に2次元グリッドを作ります。デフォルトでは、グリッドは10x10ユニットです。

[dat.GUI](https://github.com/dataarts/dat.gui)も使います。
これはthree.jsプロジェクトでとても一般的なUIライブラリです。
dat.GUIはオブジェクトとそのオブジェクトの属性名を受け取り、
属性の型に基づいて、自動的にその属性を操作するUIを作成します。

それぞれのノードに対して、`GridHelper`と`AxesHelper`の両方を作りたいです。
それぞれのノートにラベルが必要なので、古いループを削除し、
各ノードにhelperを加える関数を呼ぶ形式にします。

```js
-// add an AxesHelper to each node
-objects.forEach((node) => {
-  const axes = new THREE.AxesHelper();
-  axes.material.depthTest = false;
-  axes.renderOrder = 1;
-  node.add(axes);
-});

+function makeAxisGrid(node, label, units) {
+  const helper = new AxisGridHelper(node, units);
+  gui.add(helper, 'visible').name(label);
+}
+
+makeAxisGrid(solarSystem, 'solarSystem', 25);
+makeAxisGrid(sunMesh, 'sunMesh');
+makeAxisGrid(earthOrbit, 'earthOrbit');
+makeAxisGrid(earthMesh, 'earthMesh');
+makeAxisGrid(moonMesh, 'moonMesh');
```

`makeAxisGrid`は、dat.GUIをハッピーにする`AxisGridHelper`クラスを作ります。
前述したように、dat.GUIは、オブジェクトの名前が付いた属性を操作するUIを自動的に生成します。
属性の型に応じて異なるUIが作成されます。
チェックボックスを作って欲しいので、`bool`属性を指定する必要があります。
しかし、軸とグリッドの両方を一つの属性で表示/非表示にしたいので、
属性のgetterとsetterを持ったクラスを作成します。
この方法で、dat.GUIに一つの属性を操作するように思わせることができますが、
内部的には各ノードに`AxesHelper`と`GridHelper`の両方のvisible属性を設定することができます。


```js
// Turns both axes and grid visible on/off
// dat.GUI requires a property that returns a bool
// to decide to make a checkbox so we make a setter
// and getter for `visible` which we can tell dat.GUI
// to look at.
class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;  // after the grid
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}
```

注意することは、`AxesHelper`の`renderOrder`を2に設定し、`GridHelper`には1を設定することです。
こうすることで、軸はグリッドの後に描画されます。
そうしないと、グリッドが軸を上書きしてしまうかもしれません。

{{{example url="../threejs-scenegraph-sun-earth-moon-axes-grids.html" }}}

`solarSystem`のチェックをオンにすると、上で設定したように、
どのように地球が中心からちょうど10ユニットにあるか分かるでしょう。
地球が`solarSystem`の*ローカルな空間*にどのように存在するか分かります。
同様に、もし`earthOrbit`のチェックをオンにすると、
どのように月が`earthOrbit`の*ローカルな空間*の中心から、ちょうど2ユニットあるか分かるでしょう。

もう少しシーングラフの例を紹介します。
簡単なゲームの世界の自動車は、このようなシーングラフだとしましょう。

<img src="resources/images/scenegraph-car.svg" align="center">

もし車のbody全体を動かすと、それに伴ってwheelsが動くでしょう。
もしbodyにwheelsとは別にバウンドして欲しいとすると、
bodyとwheelsを、車のフレームを表す"frame"ノードの子要素にできます。

別の例はゲームの世界の人間です。

<img src="resources/images/scenegraph-human.svg" align="center">

とても複雑な人間のシーングラフを見てください。
実際は、上記のシーングラフは単純化されています。
例えば、全ての手の指(少なくとも28ノード)、全ての足の指(さらに28ノード)、
加えて顔と顎、目、そしてもっと様々な部位もカバーするように、グラフを拡張できるかもしれません。


もう少し複雑なシーングラフを作りましょう。戦車を作ります。
戦車は6つの車輪と砲塔があります。この戦車はある道筋に沿って走ります。
そこら中を移動する球体があり、戦車はその球体を狙うとしましょう。

これがシーングラフです。メッシュは緑色、`Object3D`は青色、明かりは金色、カメラは紫色です。
シーングラフに追加されていないカメラが一つあります。

<div class="threejs_center"><img src="resources/images/scenegraph-tank.svg" style="width: 800px;"></div>

コードを見て、これらのノードの設定を確認してください。

ターゲット、つまり戦車が狙っているものとして、`targetOrbit`(`Object3D`) があります。
これはちょうど前述の`earthOrbit`と同じように回転します。
`targetOrbit`の子要素である`targetElevation` (`Object3D`)は、
`targetOrbit`からのオフセットと基準となる高さを提供します。
この子要素には、`targetElevation`に対して相対的に浮き沈みする、`targetBob`と呼ばれる`Object3D`があります。
最後に、`targetMesh`があります。回転させて色を変えることができる、ただの立方体です。


```js
// move target
targetOrbit.rotation.y = time * .27;
targetBob.position.y = Math.sin(time * 2) * 4;
targetMesh.rotation.x = time * 7;
targetMesh.rotation.y = time * 13;
targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
targetMaterial.color.setHSL(time * 10 % 1, 1, .25);
```

戦車には、`tank`と呼ばれる`Object3D`があります。
これを使って戦車の子要素をすべて移動させることができます。
コードでは`SplineCurve`を使っています。これは曲線に沿った位置を求めることができます。
0.0は曲線の始点です。1.0は曲線の終点です。これにより、戦車がある現在地を求めます。
次に、カーブの少し下の位置を求めて、`Object3D.lookAt`を使い、戦車をその方向に向けます。


```js
const tankPosition = new THREE.Vector2();
const tankTarget = new THREE.Vector2();

...

// move tank
const tankTime = time * .05;
curve.getPointAt(tankTime % 1, tankPosition);
curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
tank.position.set(tankPosition.x, 0, tankPosition.y);
tank.lookAt(tankTarget.x, 0, tankTarget.y);
```

戦車のてっぺんに付いている砲塔は、戦車の子要素なので自動的に動きます。
ターゲットの方を向かせるのに、ターゲットの位置を求め、次に再び`Object3D.lookAt`を使うだけです。

```js
const targetPosition = new THREE.Vector3();

...

// face turret at target
targetMesh.getWorldPosition(targetPosition);
turretPivot.lookAt(targetPosition);
```

`turretCamera`は`turretMesh`の子要素なので、砲塔と一緒に上下に動き、回転します。


```js
// make the turretCamera look at target
turretCamera.lookAt(targetPosition);
```

`targetBob`の子要素である`targetCameraPivot`もあります。これはターゲットと一緒に浮遊します。
戦車に狙いを定めましょう。`targetCamera`にターゲット自身に高さを合わせるためです。
もしカメラを`targetBob`の子要素にして、カメラ自身に狙いを定めさせただけだと、
カメラがターゲットの内側に入り込んでしまうでしょう。

```js
// make the targetCameraPivot look at the tank
tank.getWorldPosition(targetPosition);
targetCameraPivot.lookAt(targetPosition);
```

最後に、全ての車輪を回転させます。

```js
wheelMeshes.forEach((obj) => {
  obj.rotation.x = time * 3;
});
```

初期化時に、4つ全てのカメラの配列を設定します。

```js
const cameras = [
  { cam: camera, desc: 'detached camera', },
  { cam: turretCamera, desc: 'on turret looking at target', },
  { cam: targetCamera, desc: 'near target looking at tank', },
  { cam: tankCamera, desc: 'above back of tank', },
];

const infoElem = document.querySelector('#info');
```

描画時にカメラを周回させます。

```js
const camera = cameras[time * .25 % cameras.length | 0];
infoElem.textContent = camera.desc;
```

{{{example url="../threejs-scenegraph-tank.html"}}}

シーングラフの動作と、使い方のアイデアを、この例から得られればと思います。
`Object3D`ノードを作り、物体をその子要素にすることは、three.jsのような3Dエンジンを上手く使うために
重要なステップです。
思い通りになにかを動かしたり回転させたりすることは、しばしば複雑な数学が必要に見えるかもしれません。
例えばシーングラフなしで、月の動きを操作したり、車の車体に対して壮太知的に車輪を置いたりすることは、
とても難しいかもしれません。しかし、シーングラフを使うことで、とても簡単になるのです。

[次はマテリアルを説明します](threejs-materials.html)。