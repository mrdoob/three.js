Title: Three.js 渲染目标
Description: 如何渲染到纹理
TOC: 渲染目标

在three.js中，渲染目标大体上指的是可以被渲染的纹理。当它被渲染之后，你可以像使用其他纹理一样使用它。

让我们举个简单的例子。我们将从[the article on responsiveness](threejs-responsive.html)开始。

渲染到渲染目标基本上跟通常的渲染一样。首先我们创建一个 `WebGLRenderTarget`。

```js
const rtWidth = 512;
const rtHeight = 512;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
```

然后我们需要一个 `Camera`  和一个 `Scene`

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

注意我们设置长宽比(aspect)是相对渲染目标而言的，不是画布(canvas)。
正确的长宽比取决于我们要渲染的对象。在本例，我们要将渲染目标的纹理用在方块的一个面，基于方块的面我们设置长宽比为1.0。

我们将需要的东西添加到场景中。在本例我们使用灯光和三个方块[from the previous article](threejs-responsive.html)。

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

在上个例子中的 `Scene` 和 `Camera` 保持不变，我们将在画布中继续使用它们，只需要添加渲染的物体。

让我们添加使用了渲染目标纹理的方块。

```js
const material = new THREE.MeshPhongMaterial({
  map: renderTarget.texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

现在在渲染的时候，我们首先将渲染目标的场景(rtScene)，渲染到渲染目标(注：这里有点绕，需要结合代码理解)。

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

然后我们在画布中，渲染使用了渲染目标纹理的方块的场景。

```js
  // rotate the cube in the scene
  cube.rotation.x = time;
  cube.rotation.y = time * 1.1;

  // render the scene to the canvas
  renderer.render(scene, camera);
```

就是这样啦

{{{example url="../threejs-render-target.html" }}}

方块是红色的，这是因为我们设置了 `rtScene` 的 `background` 为红色，所以渲染目标的纹理所处的背景为红色。

渲染目标可以用在各种各样的物体上。[Shadows](threejs-shadows.html)用了渲染目标，[Picking can use a render target](threejs-picking.html)，多种效果[post processing effects](threejs-post-processing.html)需要用到渲染目标。
渲染汽车的后视镜，或者3D场景中的监控实时画面，都可能用到渲染目标。

关于 `WebGLRenderTarget` 的笔记。

* 默认情况下 `WebGLRenderTarget` 会创建两个纹理。 颜色纹理和深度/模版纹理。如果你不需要深度或者模版纹理，你可以通过可选设置取消创建。例如：

    ```js
    const rt = new THREE.WebGLRenderTarget(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    ```

* 你可能需要改变渲染目标的尺寸

  在上面的例子，我们创建了固定尺寸512X512的渲染目标。对于像后处理，你通常需要创建跟画布一样尺寸的渲染目标。在我们的代码中意味着，当我们改变画布的尺寸，会同时更新渲染目标尺寸，和渲染目标中正在使用的摄像机。例如：

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
