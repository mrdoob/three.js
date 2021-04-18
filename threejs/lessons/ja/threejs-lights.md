Title: Three.jsのライト
Description: ライトの設定
TOC: ライト

この記事はThree.jsの連載記事の1つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでいない場合は、Three.jsの基礎知識や[セットアップ](threejs-setup.html)から始めると良いと思います。
前回の記事は[テクスチャ](threejs-textures.html)でした。

今回はthree.jsの色々な種類のライトの使い方を確認していきます。

前回のサンプルコードからカメラの設定を修正しましょう。
視野角(fov)を45度にし、遠平面(far)を100、カメラを原点からY座標に10、Z座標を20にします。

```js
*const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

次に `OrbitControls` を追加します。
`OrbitControls` は、カメラをある点を中心に*軌道*を回転できます。
`OrbitControls` はthree.jsのオプション機能なので、importする必要があります。

```js
import * as THREE from './resources/three/r127/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
```

これでOrbitControlsを利用できます。
`OrbitControls` にカメラと入力イベントを取得するDOM要素を渡します。

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

controls.targetのY座標を5にして `controls.update` を呼び出します。

次はライトアップするオブジェクトを作ってみましょう。
まずは地上となる平面を作ります。
この平面に2 x 2ピクセルの小さなチェッカーボードのテクスチャを適用します。

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

最初にテクスチャを読み込み、何回テクスチャのリピートを繰り返すかを設定し、フィルターはニアレスト(nearest)にします。
テクスチャは2 x 2ピクセルのチェッカーボードです。
テクスチャのリピートは平面の半分の大きさにし、チェッカーボードの1つのチェック部分は1にします。

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

平面のジオメトリとマテリアルを作り、それを元にシーンに追加するメッシュを作ります。
平面のデフォルトは縦向きなので横向きになるように回転します。

```js
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

キューブと球体を追加し、平面を含めて3つのオブジェクトをライティングします。

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

ライトアップするシーンができたのでライトを追加しましょう！

## `AmbientLight（環境光源）`

最初に `AmbientLight` を作りましょう。

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

ライトのパラメーターを調整できるようにします。
今回も[dat.GUI](https://github.com/dataarts/dat.gui)を使います。
dat.GUIで色を調整するにはヘルパーが必要です。
プロパティをdat.GUIにCSSの16進数の形で表示します(例: `#FF8844`)。
ヘルパーは名前付きプロパティから色を取得し、16進数の文字列に変換してdat.GUIに渡します。dat.GUIがヘルパーのプロパティを設定し、結果をライトの色に戻します。

これがヘルパーです。

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

dat.GUIの設定は以下の通りです。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

これで以下のような結果になります。

{{{example url="../threejs-lights-ambient.html" }}}

シーンをクリックしてドラッグして、カメラを*軌道*に乗せます。

環境光源だけでは正しくライティング表現できてません。キューブと球体に陰影がなく形状が平面に見えます。
以下のように `AmbientLight` はマテリアルの色とライトの色、ライトの強度(intensity)を掛けてます。

    color = materialColor * light.color * light.intensity;

それだけで方向性がないです。
この環境光源は100％均一でシーン内の全ての色を変える以外は*ライティング*としてはあまり役に立ちません。
環境光源は暗すぎない暗さを作る事ができます。

## `HemisphereLight（半球光源）`

コードを `HemisphereLight` に切り替えてみましょう。
`HemisphereLight` は空と地面の色を取得し、その2色とマテリアルの色を掛け合わせます。

これが新しいコードです。

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // light blue
+const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

dat.GUIのコードを修正し、両方の色を編集してみましょう。

```js
const gui = new GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

これが結果です。

{{{example url="../threejs-lights-hemisphere.html" }}}

まだ正しくライティング表現ができてなく、キューブと球体が平面に見えます。
別のライトと組み合わせて使用される `HemisphereLight` は、空や地面の色に良い影響を与えます。
この方法では他のライトと組み合わせて使うか、`HemisphereLight` を代わりに使うのがベストです。

## `DirectionalLight（平行光源）`

コードを `DirectionalLight` に切り替えてみましょう。
`DirectionalLight` は太陽を表すのによく使われます。

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

シーンに `light` と `light.target` を追加する必要があります。
three.jsの `DirectionalLight` はターゲットの方向にライティングします。

GUIに追加してlight.targetを動かせるようにしてみましょう。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

なんだか見づらいですね。
Three.jsにはシーンに追加できるヘルパーオブジェクトがたくさんあり、シーンの見えない部分を視覚化するのに役立ちます。
今回は `DirectionalLightHelper` を使い、ライトから平面までの線を描画します。
lightをDirectionalLightHelperに渡してシーンに追加します。

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

ライトの位置とターゲットの両方を設定できるようにしておきましょう。
`Vector3` が与えられた時に `dat.GUI` を使い `x`, `y`, `z` プロパティを調整できる関数を作ります。

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

変更時は常にヘルパーの `update` 関数を呼び出す必要があります。
そのため、dat.GUIが値を更新時に `onChangeFn` 関数を渡しています。

makeXYZGUI関数はlight.positionとlight.target.positionの両方に使えます。

```js
+function updateLight() {
+  light.target.updateMatrixWorld();
+  helper.update();
+}
+updateLight();

const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);

+makeXYZGUI(gui, light.position, 'position', updateLight);
+makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

これでライトを動かす事ができるようになりました。

{{{example url="../threejs-lights-directional-w-helper.html" }}}

カメラを軌道に乗せると見やすくなります。
この平面は `DirectionalLight` を表しており、DirectionalLightが一方向からのライティングを計算します。
光の出所は*点*ではなく、平面を無限に照らす平行光線です。

## `PointLight（点光源）`

`PointLight` はある点から全方向に光を放つライトです。
コード変更しましょう。

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
-light.target.position.set(-5, 0, 0);
scene.add(light);
-scene.add(light.target);
```

`PointLightHelper` に切り替えます。

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

light.targetがないので `onChange` 関数はもっとシンプルになります。

```js
function updateLight() {
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

`PointLightHelper` には点がない事に注意して下さい。
小さなダイヤモンドのワイヤーフレームを描画します。
簡単に望む任意の形状にできて、ライト自体にメッシュを追加します。

`PointLight` は [`distance`](PointLight.distance)プロパティを持ちます。
`distance` が0ならば `PointLight` は無限大に輝きます。
`distance` が0よりも大きい場合、ライトに向かってライトの全強度を照らし、ライトから離れた `distance` では影響を受けないようにフェードアウトします。

distanceを調整できるようにGUIを設定してみましょう。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

これを試してみて下さい。

{{{example url="../threejs-lights-point.html" }}}

`distance` が > 0 の時にライトがフェードアウトしている事に注目して下さい。

## `SpotLight（集中光線）`

集中光源は円錐体にライティングする時に効果的です。
実際は2つの円錐体があります。外側と内側の円錐体です。
内側と外側の円錐体の間では、ライトは強度のMAX値から0にフェードします。

`SpotLight` を使うには、平行光源と同じようにターゲットが必要です。
ライトの円錐体がターゲットに向かって照らされます。

上記のヘルパーを使って `DirectionalLight` を修正します。

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

集中光源の円錐体の角度は [`angle`](SpotLight.angle)プロパティでラジアン単位で設定します。
[テクスチャ記事](threejs-textures.html)の `DegRadHelper` を使い、度数でUIに表示します。

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

内側の円錐は[`penumbra`](SpotLight.penumbra)プロパティを外側の円錐からの%として設定します。
`penumbra` が1の時、ライトは円錐の中心から外側の円錐に向かってフェードしていきます。
`penumbra` が5の時、ライトは外側の円錐体の中心から50%からフェードしていきます。

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

デフォルトの `penumbra` が0の場合、集中光源は非常にシャープなエッジを持っていますが、1 に向けて `penumbra` を調整するとエッジがぼやけます。

集中光源の*円錐体*が見えにくいかもしれません。
その理由は地面にあります。
距離を5くらいまで縮めると、円錐体の端が開いているのが見えてきます。

## `RectAreaLight（矩形光源）`

もう1種類のライトに `RectAreaLight` があります。
これはまさにその名の通り、長い蛍光灯のような長方形のエリアのライトや天井にある曇り空のライトです。

`RectAreaLight` は `MeshStandardMaterial` と `MeshPhysicalMaterial` でしか動作しないので、全てのマテリアルを `MeshStandardMaterial` に変更しましょう。

```js
  ...

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
-  const planeMat = new THREE.MeshPhongMaterial({
+  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
- const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
+ const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

`RectAreaLight` を使用するには、three.jsから追加のimportが必要です。
ライトを可視化するために `RectAreaLightHelper` をimportします。

```js
import * as THREE from './resources/three/r127/build/three.module.js';
+import {RectAreaLightUniformsLib} from './resources/threejs/r127/examples/jsm/lights/RectAreaLightUniformsLib.js';
+import {RectAreaLightHelper} from './resources/threejs/r127/examples/jsm/helpers/RectAreaLightHelper.js';
```

`RectAreaLightUniformsLib.init` を呼び出します。

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  RectAreaLightUniformsLib.init();
```

RectAreaLightUniformsLibを忘れてもライトは動作しますが、見た目がおかしくなるので忘れないようにして下さい。

これでライトを作れました。

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);

*const helper = new RectAreaLightHelper(light);
*light.add(helper);
```

注意すべき点は `DirectionalLight` や `SpotLight` と異なり、`RectAreaLight` はターゲットを使いません。
その回転を利用しているだけです。
もう1つ気をつける事は、ヘルパーがライトの子である必要があります。
他のヘルパーのようにシーンの子ではありません。

GUIも調整してみましょう。
ライトを回転させて `width` と `height` を調整できるようにします。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20);
gui.add(light, 'height', 0, 20);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

makeXYZGUI(gui, light.position, 'position');
```

そして、これが結果です。

{{{example url="../threejs-lights-rectarea.html" }}}

説明してない事が1つあり、 `WebGLRenderer` に `physicallyCorrectLights` を設定します。
ライトとの距離は、ライトの落ち方に影響を与えます。
これは `PointLight` と `SpotLight` にのみ影響します。
`RectAreaLight` は自動的にこれを行います。

ライトの場合の基本的な考え方は、フェードアウトする距離を設定しない、`intensity` を設定しない事です。
代わりにライトの[`power`](PointLight.power)をルーメン単位で設定すると、three.jsは実際のライトのように物理計算を行います。
この場合の単位はメートルで、60Wの電球であれば800ルーメン程度の明るさになります。
また[`decay`](PointLight.decay)プロパティもあります。
現実的な減衰のためには `2` に設定します。

試してみましょう。

まずは物理的に正しいライトを作ります。

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.physicallyCorrectLights = true;
```

次に `power` を800ルーメンにし、`decay` を2にします。
`distance` は `Infinity` にします。

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

GUIを追加して `power` と `decay` を変更できるようにします。

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

シーンにライトを追加するたびに、Three.jsのレンダリング速度が遅くなる事に注意して下さい。

次は[カメラの扱い方](threejs-cameras.html)についてです。

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lights.js"></script>
