Title: Three.jsのレンダーターゲット
Description: テクスチャにレンダリングする方法
TOC: レンダーターゲット

レンダーターゲットとはレンダリングする先のテクスチャです。一度レンダリングすればテクスチャのように使うことができます。

簡単な例を作ってみましょう。[レスポンシブデザインの記事](https://threejsfundamentals.org/threejs/lessons/threejs-responsive.html)にある例を試してみましょう。

レンダーターゲットへのレンダリングは通常のレンダリングとほぼ同じです。まず`WebGLRenderTarget`を作ります。

```js
const rtWidth = 512;
const rtHeight = 512;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
```

`Camera`と`Scene`を作ります。

```js
const rtFov = 75;
const rtAspect = rtWidth / rtHeight;
const rtNear = 0.1;
const rtFar = 5;
const rtCamera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar);
rtCamera.position.z = 2;

const rtScene = new THREE.Scene();
rtScene.background = new THREE.Color('red');
```

アスペクトをキャンバスのアスペクトではなくレンダーターゲットのアスペクトに設定したことに注意してください。レンダリング先のアスペクトに合わせるのが正解です。この例では立方体の側面につかうテクスチャにレンダリング先にします。立方体の側面ば正方形なのでアスペクトは1.0です。

いろいろ入れてみましょう。この例ではライトと３つの立方体を[この前の記事](https://threejsfundamentals.org/threejs/lessons/threejs-responsive.html)から使います。

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
*  rtScene.add(light);
}

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
*  rtScene.add(cube);

  cube.position.x = x;

  return cube;
}

*const rtCubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
];
```

前の記事の`Scene`と`Camera`はそのままにしてあります。これらをキャンバスにレンダリングするために使います。空の空間をレンダリングしても意味がないのでとりあえず入れてあります。

レンダーターゲットとなるテクスチャを貼る立方体をシーンに追加します。

```js
const material = new THREE.MeshPhongMaterial({
  map: renderTarget.texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

このシーンをレンダーターゲットにレンダリングします。

```js
function render(time) {
  time *= 0.001;

  ...

  // rotate all the cubes in the render target scene
  rtCubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  // draw render target scene to render target
  renderer.setRenderTarget(renderTarget);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);
```

次にレンダーターゲットのテクスチャが貼られている立方体を追加したシーンをキャンバスにレンダリングします。

```js
  // rotate the cube in the scene
  cube.rotation.x = time;
  cube.rotation.y = time * 1.1;

  // render the scene to the canvas
  renderer.render(scene, camera);
```

見てください！

{{{example url="../threejs-render-target.html" }}}

立方体が赤いのはレンダーターゲットのテクスチャとしてレンダリングした`rtScene`の`background`を赤でクリアーしたからです。

レンダーターゲットは色々な使い方ができます。[シャドウ](https://threejsfundamentals.org/threejs/lessons/threejs-shadows.html)もレンダーターゲットを使います。[ピッキング](https://threejsfundamentals.org/threejs/lessons/threejs-picking.html)もレンダーターゲットを使います。[ポストプロセッシング効果](https://threejsfundamentals.org/threejs/lessons/threejs-post-processing.html)もレンダーターゲットを使います。車のミラーを再現するために車の背後をレンダリングしたテクスチャを利用できますし、３Dゲームに出てくる監視モニターにも使うことができます。

`WebGLRenderTarget`を使う時にはいくつか注意点があります。

* デフォルトで`WebGLRenderTarget`は２つのテクスチャを作ります。

    color textureとdepth (stencil) textureです。もし後者のテクスチャが必要なければオプションでオフにできます。

    ```js
    const rt = new THREE.WebGLRenderTarget(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    ```

* レンダーテクスチャのサイズを変更する必要があるかもしれません

  上の例では512 x 512のサイズのレンダーテクスチャを作りました。通常はポストプロセッシングにおいてキャンバスと同じサイズのレンダーターゲットが必要になります。つまりキャンバスのサイズを変えたら同時にレンダーターゲットとレンダーターゲットに使うカメラのサイズも一緒に変える必要があります。

      function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();

      +    renderTarget.setSize(canvas.width, canvas.height);
      +    rtCamera.aspect = camera.aspect;
      +    rtCamera.updateProjectionMatrix();
      }
