Title: Three.jsでピッキング
Description: Three.jsでマウスからオブジェクトを選択する
TOC: マウスでオブジェクトをピッキング

*ピッキング*とはユーザーがどのオブジェクトをクリックしたか、またはタッチしたかを把握するプロセスの事です。
ピッキングする方法のそれぞれにトレードオフがありますが、実装の仕方はたくさんあります。最も一般的な2つの方法を見てみましょう。

おそらく、最も一般的な*ピッキング*はレイキャスティングでマウスからシーンの錐台を通して光線を*キャスト*し、その光線が交差するオブジェクトを計算する方法です。
概念的には非常にシンプルです。

まずはマウスの位置を決めます。
それをカメラの投影と向きをワールド座標に変換します。
カメラの錐台の近くの面から遠くの面までの光線を計算します。
そして、シーン内の全ての三角形オブジェクトで光線と交差するかチェックします。
もしシーンに1000個のオブジェクトがあり、各オブジェクトに1000個の三角形がある場合、100万個の三角形をチェックする必要があります。

光線がオブジェクトのバウンディングスフィアやバウンディングボックス、つまりオブジェクト全体を含む球やボックスと交差するかを最初にチェックする事は最適化になります。
もし光線がオブジェクトと交差しなければ、そのオブジェクトの三角形をチェックする必要はありません。

Three.jsにはこれを行う `RayCaster` クラスを提供しています。

100個のオブジェクトがあるシーンを作ってピッキングしてみましょう。
[レスポンシブデザインの記事](threejs-responsive.html)のコード例から始めてみます。

いくつかの変更点

カメラを別のオブジェクトの親にして、そのオブジェクトを回転させるとカメラが自撮り棒のようにシーンの周りを動き回るようになります。

```js
*const fov = 60;
const aspect = 2;  // the canvas default
const near = 0.1;
*const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
*camera.position.z = 30;

const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');

+// put the camera on a pole (parent it to an object)
+// so we can spin the pole to move the camera around the scene
+const cameraPole = new THREE.Object3D();
+scene.add(cameraPole);
+cameraPole.add(camera);
```

そして、`render` 関数でcameraPoleを回転させます。

```js
cameraPole.rotation.y = time * .1;
```

カメラにライトを追加し、ライトが動くようにしましょう。

```js
-scene.add(light);
+camera.add(light);
```

ランダムな色、位置、向き、スケールの100個のキューブを生成してみましょう。

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}

function randomColor() {
  return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));
}
```

最後にピックします。

ピッキングを管理する簡単なクラスを作ってみましょう。

```js
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

`RayCaster` を作成し、`pick` 関数を呼び出してシーンに光線をキャストできます。
光線が何かに当たった場合、最初に当たったオブジェクトの色を変更します。

もちろん、マウスを *down* した時だけこの関数を呼べますが、今回は全てのフレームでマウスの下に何かあるかピックします。
そのためにはまずマウスがどこにあるかを追跡する必要があります。

```js
const pickPosition = {x: 0, y: 0};
clearPickPosition();

...

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);
```

正規化されたマウスの位置を記録している事に注意して下さい。
キャンバスの大きさに関わらず、leftの-1からrightの+1までの値が必要です。
同様にbottomが-1からtopが+1になるような値が必要です。

これでモバイル端末もサポートできます。

```js
window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

最後に `render` 関数で `PickHelper` の `pick` 関数を呼び出します。

```js
+const pickHelper = new PickHelper();

function render(time) {
  time *= 0.001;  // convert to seconds;

  ...

+  pickHelper.pick(pickPosition, scene, camera, time);

  renderer.render(scene, camera);

  ...
```

その結果がこれです。

{{{example url="../threejs-picking-raycaster.html" }}}

望んだ動作でおそらく多くのユースケースに対応できますが、いくつか問題点があります。

1. CPUベース

  JavaScriptは各オブジェクトを通過し、光線がそのオブジェクトのバウンディングボックス、またはバウンディングスフィアと交差するかをチェックしています。
  そのオブジェクト内の各三角形を通過し、光線が三角形と交差するかチェックしなければなりません。

  これの良い点はJavaScriptが簡単に光線が三角形と交差する場所を正確に計算し、その結果が分かります。
  例えば交差する点があった場所に目印をつけたい場合などです。

  悪い点はCPUの負担が大きい所ですね。
  三角形がたくさんあるオブジェクトを持っている場合は遅いかもしれません。

2. 変なシェーダーやズレを処理しません

  ジオメトリを変形またはモーフィングするシェーダーがある場合、JavaScriptはその変形を認識できなく、間違った答えを返してしまいます。
  例えばAFAIKのように、メソッドはスキニングされたオブジェクトでは使えません。

3. 透明な穴には対応しません

例として、このテクスチャをキューブに適用してみましょう。

<div class="threejs_center"><img class="checkerboard" src="../resources/images/frame.png"></div>

以下のように変更します。

```js
+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/frame.png');

const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    +map: texture,
    +transparent: true,
    +side: THREE.DoubleSide,
    +alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

以下の例で動作確認をすると、すぐにこの問題が分かると思います。

{{{example url="../threejs-picking-raycaster-transparency.html" }}}

ボックスの穴の部分でピックしてみて下さい。

<div class="threejs_center"><img src="resources/images/picking-transparent-issue.jpg" style="width: 635px;"></div>

この原因は、JavaScriptがテクスチャやマテリアルを調べて、オブジェクトの一部が本当に透明か判断できないからです。

これらの問題を全て解決するのが、GPUベースのピッキングです。
概念的には簡単ですが、残念ながら上記のレイキャスティングよりも使用方法が複雑になっています。

GPUピッキングを行うには、各オブジェクトをオフスクリーンでユニークな色でレンダリングします。
次にマウスの位置に対応するピクセルの色を調べます。
色でどのオブジェクトが選ばれたか分かります。

これで上記の2と3の問題を解決できます。問題1は速度に依存しています。
全てのオブジェクトは2回描画されなければなりません。
1回は見るための描画、もう1回はピッキングの描画です。
洗練された解決策は、その両方を同時に行う事ですが今回はそれを試しません。

1つのやり方としては、1つのピクセルしか読まないのでそのピクセルだけ描画されるようにカメラを設定します。
これを行うには `PerspectiveCamera.setViewOffset` を使用します。
これでカメラを計算できます。
これで時間を節約できるはずです。

現時点ではこのピッキングを行うには、2つのシーンを作成する必要があります。
1つは通常のメッシュで埋めます。
もう1つはピッキングマテリアルを使用したメッシュで埋めます。

そこでまず2つ目のシーンを作り黒でクリアします。

```js
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const pickingScene = new THREE.Scene();
pickingScene.background = new THREE.Color(0);
```

次にメインシーンに配置する各キューブでオリジナルのキューブと同じ位置に対応する"ピッキングキューブ"を作成し、`pickingScene` に配置します。
オブジェクトのidを色として描画するようにマテリアルを設定します。
また、idとオブジェクトのマップがあるので、後でidを調べた時に対応するオブジェクトにマップを戻す事ができます。

```js
const idToObject = {};
+const numObjects = 100;
for (let i = 0; i < numObjects; ++i) {
+  const id = i + 1;
  const material = new THREE.MeshPhongMaterial({
    color: randomColor(),
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
+  idToObject[id] = cube;

  cube.position.set(rand(-20, 20), rand(-20, 20), rand(-20, 20));
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  cube.scale.set(rand(3, 6), rand(3, 6), rand(3, 6));

+  const pickingMaterial = new THREE.MeshPhongMaterial({
+    emissive: new THREE.Color(id),
+    color: new THREE.Color(0, 0, 0),
+    specular: new THREE.Color(0, 0, 0),
+    map: texture,
+    transparent: true,
+    side: THREE.DoubleSide,
+    alphaTest: 0.5,
+    blending: THREE.NoBlending,
+  });
+  const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
+  pickingScene.add(pickingCube);
+  pickingCube.position.copy(cube.position);
+  pickingCube.rotation.copy(cube.rotation);
+  pickingCube.scale.copy(cube.scale);
}
```

ここでは `MeshPhongMaterial` を悪用している事に注意して下さい。
`emissive` をidにし、`color` と `specular` を0に設定しテクスチャのアルファ値が `alphaTest` よりも大きい場合にのみ、idをレンダリングできます。
また、`blending` を `NoBlending` に設定し、idにアルファが乗算しないようにする必要があります。

`MeshPhongMaterial`を悪用する事は、最良の解決策でない事に注意して下さい。
さらに最適化された解決策は、テクスチャのアルファ値が `alphaTest` よりも大きい場合にidを書き込むカスタムシェーダーを作成する事です。

レイキャスティングではなくピクセルからピックしているので、ピック位置を設定するコードを変更してピクセルだけを使用できます。

```js
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y
+  pickPosition.x = pos.x;
+  pickPosition.y = pos.y;
}
```

`PickHelper` を `GPUPickHelper` に変更してみましょう。
[レンダーターゲットの記事](threejs-rendertargets.html)で説明したように `WebGLRenderTarget` を使います。
ここでのレンダーターゲットは1 x 1の1ピクセルのサイズしかありません。

```js
-class PickHelper {
+class GPUPickHelper {
  constructor() {
-    this.raycaster = new THREE.Raycaster();
+    // create a 1x1 pixel render target
+    this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
+    this.pixelBuffer = new Uint8Array(4);
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(cssPosition, scene, camera, time) {
+    const {pickingTexture, pixelBuffer} = this;

    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

+    // set the view offset to represent just a single pixel under the mouse
+    const pixelRatio = renderer.getPixelRatio();
+    camera.setViewOffset(
+        renderer.getContext().drawingBufferWidth,   // full width
+        renderer.getContext().drawingBufferHeight,  // full top
+        cssPosition.x * pixelRatio | 0,             // rect x
+        cssPosition.y * pixelRatio | 0,             // rect y
+        1,                                          // rect width
+        1,                                          // rect height
+    );
+    // render the scene
+    renderer.setRenderTarget(pickingTexture)
+    renderer.render(scene, camera);
+    renderer.setRenderTarget(null);
+
+    // clear the view offset so rendering returns to normal
+    camera.clearViewOffset();
+    //read the pixel
+    renderer.readRenderTargetPixels(
+        pickingTexture,
+        0,   // x
+        0,   // y
+        1,   // width
+        1,   // height
+        pixelBuffer);
+
+    const id =
+        (pixelBuffer[0] << 16) |
+        (pixelBuffer[1] <<  8) |
+        (pixelBuffer[2]      );

-    // cast a ray through the frustum
-    this.raycaster.setFromCamera(normalizedPosition, camera);
-    // get the list of objects the ray intersected
-    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
-    if (intersectedObjects.length) {
-      // pick the first object. It's the closest one
-      this.pickedObject = intersectedObjects[0].object;

+    const intersectedObject = idToObject[id];
+    if (intersectedObject) {
+      // pick the first object. It's the closest one
+      this.pickedObject = intersectedObject;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
```

それならば、それを使えばいいだけです。

```js
-const pickHelper = new PickHelper();
+const pickHelper = new GPUPickHelper();
```

これを指定し `scene` の代わりに `pickScene` を渡します。

```js
-  pickHelper.pick(pickPosition, scene, camera, time);
+  pickHelper.pick(pickPosition, pickScene, camera, time);
```

そして、透明な部分を選択するようにする必要があります。

{{{example url="../threejs-picking-gpu.html" }}}

ピッキングを実装する方法のアイデアをいくつか得られたと思います。
今後の記事ではマウスを使ってオブジェクトを操作する方法を取り上げるかもしれません。
