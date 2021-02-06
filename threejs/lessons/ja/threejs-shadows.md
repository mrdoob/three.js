Title: Three.jsのシャドウ
Description: Three.jsのシャドウ
TOC: シャドウ

この記事はThree.jsの連載記事の1つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでいない場合、そこから始めると良いかもしれません。
この記事を読む前に、[前回のカメラの記事](threejs-cameras.html)と[ライトの記事](threejs-lights.html)も読んでおくと良いです。

コンピュータ上での影の表現は複雑なトピックになります。
three.jsで利用できる解決策も含め様々な解決策がありますが、どれもトレードオフがあります。

Three.jsは *シャドウマップ* をデフォルトで使用してます。
シャドウマップを機能させるには、*全てのライトにシャドウを落とし、光源に対して全てのオブジェクトもシャドウを落としてレンダリングします*。
急ぐ必要はないので ** もう一度読んでみて下さい！ **

つまり、20個のオブジェクトと5個のライトがあり、全てのオブジェクトとライトにシャドウを落としている場合、シーン全体が6回描画されます。
全てのオブジェクトがライト#1、ライト#2、ライト#3に描画され、最初の5回の描画からデータを使って実際のシーンが描画されます。

さらに悪い事に点光源がシャドウを落としている場合、6回もシーン描画しなければならないのです。

これらの理由からシャドウを生成するライトをたくさん持つよりも、他の解決策を見つけるのが一般的です。
一般的な解決策は複数ライトを持つ事ですが、ディレクショナルライトでシャドウを生成する方法があります。

もう1つの解決策はライトマップやアンビエントオクルージョンマップを使用し、オフラインでライティングの効果を事前計算する方法もあります。
静的なライティングのヒントになりますが、少なくともそれは速いです。
その両方に関しては別の記事で取り上げます。

もう1つの解決策はフェイクシャドウです。
平面を作り影に似たグレースケールのテクスチャを入れて、オブジェクト下の地面の上に描画します。

例えばこのテクスチャをフェイクシャドウしてみましょう。

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

[前回の記事](threejs-cameras.html)のコードの一部を使用します。

背景色を白に設定してみましょう。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

同じチェッカーボードの地面を使いますが、今回の地面には照明は必要ないので `MeshBasicMaterial` を使用します。

```js
+const loader = new THREE.TextureLoader();

{
  const planeSize = 40;

-  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
+  planeMat.color.setRGB(1.5, 1.5, 1.5);
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
```

色が `1.5, 1.5, 1.5` である事に注意して下さい。
これにより、チェッカーボードのテクスチャの色がそれぞれ1.5倍になります。
テクスチャの色は 0x808080 と 0xC0C0C0 でミディアムグレーとライトグレーなので、1.5を掛けると白とライトグレーのチェッカーボードになります。

シャドウテクスチャを読み込んでみましょう。

```js
const shadowTexture = loader.load('resources/images/roundshadow.png');
```

各球体と関連するオブジェクトを保持する配列を作成します。

```js
const sphereShadowBases = [];
```

そして、球体のジオメトリを作ります。

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
```

フェイクシャドウのための平面のジオメトリも作ります。

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);
```

そして、たくさんの球体を作ります。
各球体に対して `THREE.Object3D` を作成し `base` に格納しシャドウの平面と球体メッシュの両方をbaseの子にします。
これでbaseを動かすと、球体とシャドウの両方が動きます。
Ｚファイティングを防ぐためにシャドウを少し上にします。
また、`depthWrite` をfalseにしてシャドウがお互いに混乱しないようにします。
この2つの問題は[別の記事](threejs-transparency.html)で解説します。
このシャドウは照明が不要なので `MeshBasicMaterial` にします。

各球体を異なる色相、ベース、球体メッシュ、シャドウのメッシュ、各球体のyの初期位置を保存します。

```js
const numSpheres = 15;
for (let i = 0; i < numSpheres; ++i) {
  // make a base for the shadow and the sphere
  // so they move together.
  const base = new THREE.Object3D();
  scene.add(base);

  // add the shadow to the base
  // note: we make a new material for each sphere
  // so we can set that sphere's material transparency
  // separately.
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,    // so we can see the ground
    depthWrite: false,    // so we don't have to sort
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001;  // so we're above the ground slightly
  shadowMesh.rotation.x = Math.PI * -.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // add the sphere to the base
  const u = i / numSpheres;   // goes from 0 to 1 as we iterate the spheres.
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, .75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // remember all 3 plus the y position
  sphereShadowBases.push({base, sphereMesh, shadowMesh, y: sphereMesh.position.y});
}
```

2つのライトを設定しました。
1つは `HemisphereLight` で強度2にしました。

```js
{
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

もう1つは `DirectionalLight` で球体はいくつかの定義を得られます。

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 5);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}
```

そのままレンダリングしてますが、球体をアニメーション化してみましょう。
それぞれの球体、シャドウ、baseのセットに対して、
baseをxz平面内で移動させて `Math.abs(Math.sin(time))` で球体を上下に移動させると弾むようなアニメーションします。
シャドウのマテリアルの不透明度を設定し、各球体が高くなるにつれてシャドウを薄くなるようにしています。

```js
function render(time) {
  time *= 0.001;  // convert to seconds

  ...

  sphereShadowBases.forEach((sphereShadowBase, ndx) => {
    const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;

    // u is a value that goes from 0 to 1 as we iterate the spheres
    const u = ndx / sphereShadowBases.length;

    // compute a position for the base. This will move
    // both the sphere and its shadow
    const speed = time * .2;
    const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
    const radius = Math.sin(speed - ndx) * 10;
    base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // yOff is a value that goes from 0 to 1
    const yOff = Math.abs(Math.sin(time * 2 + ndx));
    // move the sphere up and down
    sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
    // fade the shadow as the sphere goes up
    shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
  });

  ...
```

そして、ここに15種類の跳ねるボールがあります。

{{{example url="../threejs-shadows-fake.html" }}}

全てのオブジェクトに丸や楕円形のシャドウを使用するのが一般的です。
異なる形状のシャドウのテクスチャを使用できます。
シャドウをハードエッジでギザギザにしてもいいかもしれません。
このタイプのシャドウを使った良い例が[どうぶつの森 ポケットキャンプ](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots)です。
それぞれのキャラクターがシンプルな丸いシャドウになっており、レンダリングコストが低く効果的です。
[モニュメントバレー](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch)では、メインキャラクターにもこのシャドウが使われているようです。

そこでシャドウマップに移りますが、シャドウを落とす事ができるライトが3つあります。
`DirectionalLight` と `PointLight` と `SpotLight` です。

まずは、[ライトの記事](threejs-lights.html)のヘルパーの例を参考に `DirectionalLight` を使ってみましょう。

最初にレンダラーのシャドウを有効にします。

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.shadowMap.enabled = true;
```

そして、シャドウを落とすためにライトのcastShadowを有効にします。

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

シーン内の各メッシュを見て、シャドウを落とすか受け取るか決めます。

下敷きになっているものはあまり気にせず、平面（地面）はシャドウだけを受けるようにしましょう。

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

立方体と球体はシャドウを落とし受け取るようにしましょう。

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

これを実行してみます。

{{{example url="../threejs-shadows-directional-light.html" }}}

何が起こったのでしょうか？
なぜ影の一部が欠けているのでしょうか？

これはシャドウマップは光の視点でシーンをレンダリングし作成されるからです。
この場合、`DirectionalLight` にカメラがあり、ターゲットを見ています。
[以前取り上げたカメラと同じように](threejs-cameras.html)
ライトのシャドウカメラは影がレンダリングされ、内部の領域を定義します。
上記の例ではその面積が小さすぎます。

その領域を可視化するために、ライトのシャドウカメラを取得して `CameraHelper` をシーンに追加します。

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

これでシャドウが落とされ受け取れる領域が見えるようになりました。

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

ターゲットのX値を前後に調整すると、ライトのシャドウカメラボックスの中にあるものだけが影を描画する場所が明確になります。

ライトのシャドウカメラを調整するとその箱の大きさを調整できます。

ライトのシャドウカメラボックスを調整するためのGUIを追加してみましょう。
`DirectionLight` は全ての光が平行な方向に進むので、`DirectionalLight` はシャドウカメラに `OrthographicCamera` を使います。
[以前のカメラの記事](threejs-cameras.html)で `OrthographicCamera` がどのように動作するかを説明しました。

`OrthographicCamera` は、`left`、`right`、`top`、`bottom`、`near`、`far`、`zoom` プロパティでその箱、または *錐台の視点* を定義してる事を思い出して下さい。

ここでもdat.GUIのヘルパークラスを作ってみましょう。
オブジェクトと2つのプロパティを渡す `DimensionGUIHelper` を作ります。
dat.GUIが調整できるプロパティを追加し、2つのプロパティの正と負の値を設定します。
これを使い `left` と `right` を `width` に、`up` と `down` を `height` に設定します。

```js
class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.maxProp] * 2;
  }
  set value(v) {
    this.obj[this.maxProp] = v /  2;
    this.obj[this.minProp] = v / -2;
  }
}
```

[カメラの記事](threejs-cameras.html)で作成した `MinMaxGUIHelper` を使い `near` と `far` を調整します。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+{
+  const folder = gui.addFolder('Shadow Camera');
+  folder.open();
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 100)
+    .name('width')
+    .onChange(updateCamera);
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 100)
+    .name('height')
+    .onChange(updateCamera);
+  const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
+  folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+  folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+  folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
+}
```

何か値が変更された時は `updateCamera` 関数を呼び出すようにします。
ライトやヘルパー、ライトのシャドウカメラやカメラのヘルパーを更新するupdateCamera関数を書いてみましょう。

```js
function updateCamera() {
  // update the light target's matrixWorld because it's needed by the helper
  light.target.updateMatrixWorld();
  helper.update();
  // update the light's shadow camera's projection matrix
  light.shadow.camera.updateProjectionMatrix();
  // and now update the camera helper we're using to show the light's shadow camera
  cameraHelper.update();
}
updateCamera();
```

これでライトのシャドウカメラにGUIを追加したので値を変更できます。

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

`width` と `height` を30ぐらいにすると、シャドウが正しく描画されこのシーンでシャドウにする設定が完全にカバーできました。

しかし、ここで疑問が湧いてきます。
なぜ `width` と `height` に巨大な数値を設定して全てをカバーしないのでしょうか？
`width` と `height` を100にすると、以下のようなものが表示されます。

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

この低解像度のシャドウはどうなっているでしょうか！？

この問題はシャドウに関連した設定を意識する必要があります。
シャドウマップとはシャドウが描かれるテクスチャです。
このテクスチャはサイズがあります。
上記で設定したシャドウカメラの領域はその大きさになっています。
つまり、設定した面積が大きいほどシャドウのブロックが多くなります。

シャドウマップのテクスチャの解像度は `light.shadow.mapSize.width` と `light.shadow.mapSize.height` で設定できます。
デフォルトは512 x 512です。
大きくするほどメモリを消費し計算が遅くなるので、できるだけ小さく設定しシーンを動作させたいです。
ライトのシャドウカメラ領域も同様です。
小さくすると影の見栄えが良くなるので、面積を小さくしてシーンをカバーしましょう。
各ユーザーのコンピューターには、利用可能な最大テクスチャサイズがある事に注意して下さい。
[`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities)で利用可能な最大テクスチャサイズがわかります。

<!--
Ok but what about `near` and `far` I hear you thinking. Can we set `near` to 0.00001 and far to `100000000`
-->

`SpotLight` に切り替えると、ライトのシャドウカメラは `PerspectiveCamera` になります。
`DirectionalLight` のシャドウカメラの設定を手動で行えます。
ただ、`SpotLight` のシャドウカメラは `SpotLight` 自身によって制御されます。
シャドウカメラの `fov` は `SpotLight` の `angle` に接続しています。
`aspect` はシャドウマップのサイズによって自動的に設定されます。

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

[ライトの記事](threejs-lights.html)にあった `penumbra` と `angle` の設定を元に戻しました。

{{{example url="../threejs-shadows-spot-light-with-camera-gui.html" }}}

<!--
You can notice, just like the last example if we set the angle high
then the shadow map, the texture is spread over a very large area and
the resolution of our shadows gets really low.

div class="threejs_center"><img src="resources/images/low-res-shadow-map-spotlight.png" style="width: 344px"></div>

You can increase the size of the shadow map as mentioned above. You can
also blur the result

{{{example url="../threejs-shadows-spot-light-with-shadow-radius" }}}
-->

そして最後に `PointLight` でシャドウをつけます。
`PointLight` は全方向に光を放つので関連する設定は `near` と `far` だけです。
それ以外の場合、`PointLight` のシャドウは、効果的な6つの `SpotLight` のシャドウになります。
これは `PointLight` のシャドウの描画が非常に遅くなります。

シーンの周りに箱を置いて、壁や天井にシャドウが見えるようにしてみましょう。
マテリアルの `side` プロパティを `THREE.BackSide` に設定します。
これで箱の外側ではなく内側をレンダリングしています。
床のようにシャドウを受けるように設定します。
また、箱の底が床より少し下になるように箱の位置を設定し、床と箱がズレないようにします。

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: '#CCC',
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
```

そして、ライトを `PointLight` に切り替えます。

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// so we can easily see where the point light is
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

GUIの `position` を使ってライトを移動させると、壁一面にシャドウが落ちます。
また、`near` と `far` の設定を調整できます。
`near` よりも近い時にはシャドウを受け取らず、`far` よりも遠い時には常にシャドウになっています。

<!--
self shadow, shadow acne
-->

