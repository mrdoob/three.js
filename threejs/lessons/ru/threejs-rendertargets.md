Title: Three.js Render Targets
Description: How to render to a texture.
TOC: Render Targets

Цель рендеринга в three.js - это в основном текстура, которую вы можете рендерить. После рендеринга вы можете использовать эту текстуру как любую другую текстуру. 

Давайте сделаем простой пример. Начнем с примера [статьи об отзывчивости](threejs-responsive.html).

Рендеринг к цели рендеринга практически идентичен обычному рендерингу. Сначала мы создаем `WebGLRenderTarget`.  
```js
const rtWidth = 512;
const rtHeight = 512;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
```

Затем нам нужна `Camera` и `Scene` 

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

Обратите внимание, что мы устанавливаем aspect  для aspect  рендеринга, а не для canvas. Правильный aspect  зависит от того, для чего мы выполняем рендеринг. 
В этом случае мы будем использовать текстуру цели рендеринга на стороне куба. Поскольку грани куба являются квадратными, мы хотим, чтобы aspect = 1.0. 

Мы заполняем сцену материалом.  В этом случае мы используем свет и 3 куба [из предыдущей статьи](threejs-responsive.html).

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

`Scene` и `Camera` из предыдущей статьи все еще там. Мы будем использовать их для рендеринга на холст. Нам просто нужно добавить материал для рендеринга. 

Давайте добавим куб, который использует текстуру цели рендеринга.

```js
const material = new THREE.MeshPhongMaterial({
  map: renderTarget.texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

Теперь во время рендеринга сначала мы рендерим целевую сцену рендеринга в цель рендеринга. 

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

Затем мы визуализируем сцену с помощью одного куба, который использует текстуру цели рендеринга для холста. 

```js
  // rotate the cube in the scene
  cube.rotation.x = time;
  cube.rotation.y = time * 1.1;

  // render the scene to the canvas
  renderer.render(scene, camera);
```

И вуаля 

{{{example url="../threejs-render-target.html" }}}

Куб красный, потому что мы установили `background`  `rtScene` на красный, чтобы текстура цели рендеринга была очищена до красного. 

Цели рендеринга используются для всех видов вещей. [Тени](threejs-shadows.html) используют цели рендеринга. 
[Сбор может использовать цель рендеринга](threejs-picking.html). Различные виды
[эффектов постобработки](threejs-post-processing.html) требуют целей рендеринга.
Для рендеринга зеркала заднего вида в автомобиле или просмотра в реальном времени на мониторе в 3D-сцене может использоваться цель рендеринга. 

Несколько замечаний по использованию `WebGLRenderTarget`. 

* По умолчанию `WebGLRenderTarget` создает 2 текстуры. Цветная текстура и текстура глубины / трафарета. Если вам не нужны текстуры глубины или трафарета, вы можете попросить не создавать их, передав параметры. Пример: 

    ```js
    const rt = new THREE.WebGLRenderTarget(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    ```

* Возможно, вам придется изменить размер цели рендеринга 

  В приведенном выше примере мы делаем цель рендеринга фиксированного размера, 512x512. Для таких вещей, как постобработка, вам обычно нужно сделать цель рендеринга того же размера, что и ваш холст. В нашем коде это означало бы, что при изменении размера холста мы также обновляли бы и размер цели рендеринга, и камеру, которую мы используем при рендеринге, цели рендеринга. Пример: 

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
