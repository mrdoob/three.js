Title: Three.js 렌더 타겟
Description: Three.js에서 장면을 텍스처로 만드는 방법을 알아봅니다
TOC: 렌더 타겟(Render Targets)

Three.js의 렌더 타겟이란, 직접 렌더링할 수 있는 텍스처(texture)를 말합니다.
한 번 텍스처로 렌더링한 뒤에는 다른 텍스처처럼 사용할 수 있죠.

간단한 예제를 만들어보겠습니다. [반응형 디자인에 관한 글](threejs-responsive.html)에서
썼던 예제를 가져오도록 하죠.

렌더 타겟을 만드는 방법은 기존 렌더링 방법과 유사합니다. 먼저 `WebGLRenderTarget` 인스턴스를
생성합니다.

```js
const rtWidth = 512;
const rtHeight = 512;
const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
```

그리고 `Camera`와 `Scene`(장면)을 추가합니다.

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

위 예제에서는 렌더 타겟의 가로세로비(aspect, 종횡비)를 canvas가 아닌 렌더 타겟
자체의 사이즈로 구했습니다. 렌더 타켓의 가로세로비는 텍스처를 사용할 물체에 맞춰
정해야 하기 때문이죠. 예제의 경우 렌더 타겟을 정육면체의 텍스처로 사용할 것이고,
정육면체의 모든 면은 정사각형이므로 가로세로비는 1.0입니다.

그리고 [이전 글](threejs-responsive.html)에서 썼던 조명과 정육면체 3개를 추가하겠습니다.

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

이전 글의 `Scene`과 `Camera`는 그대로 둡니다. 이 둘은 canvas를 렌더링하는
데 사용할 거예요.

먼저 렌더 타겟의 텍스처를 사용하는 정육면체를 추가합니다.

```js
const material = new THREE.MeshPhongMaterial({
  map: renderTarget.texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

그리고 `render` 함수 안에서 렌더 타겟의 장면을 먼저 렌더링한 뒤,

```js
function render(time) {
  time *= 0.001;

  ...

  // 렌더 타겟의 장면 안에서 정육면체를 각각 회전시킵니다
  rtCubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  // 렌더 타겟의 장면을 렌더 타겟에 렌더링합니다
  renderer.setRenderTarget(renderTarget);
  renderer.render(rtScene, rtCamera);
  renderer.setRenderTarget(null);
```

canvas에 렌더 타겟의 텍스처를 사용하는 정육면체를 렌더링합니다.

```js
  // 장면 중앙의 정육면체를 회전시킵니다
  cube.rotation.x = time;
  cube.rotation.y = time * 1.1;

  // 장면은 canvas에 렌더링합니다
  renderer.render(scene, camera);
```

붐!

{{{example url="../threejs-render-target.html" }}}

정육면체가 빨간 건 정육면체를 잘 보이도록 하기 위해 `rtScene`의 `background`
속성을 빨강으로 설정했기 때문입니다.

렌더 타겟의 용도는 무궁무진합니다. [그림자](threejs-shadows.html)가 렌더 타겟을
사용하고, [피킹(picking)도 렌더 타겟을 사용할 수 있죠](threejs-picking.html).
많은 [후처리 효과](threejs-post-processing.html)를 사용할 때 렌더 타겟이 필수
요소인 경우도 있고, 차의 후사경(rear view mirror, 백미러)이나 모니터 화면 등에도
렌더 타겟을 활용할 수 있습니다.

이번 글은 여기까지입니다. 마지막으로 `WebGLRenderTarget`을 사용할 때의 주의해야
할 점 몇 가지만 살펴보고 끝내도록 하죠.

* 기본적으로 `WebGLRenderTarget`은 2개의 텍스처를 생성합니다. 하나는 색상 텍스처이고, 다른 하나는 깊이/스텐실(depth/stencil) 텍스처이죠. 깊이 텍스처나 스텐실 텍스처를 사용하지 않을 거라면 인스턴스 생성 시 옵션을 지정해 텍스처를 아예 생성하지 않도록 할 수 있습니다.

    ```js
    const rt = new THREE.WebGLRenderTarget(width, height, {
      depthBuffer: false,
      stencilBuffer: false,
    });
    ```

* 렌더 타겟의 크기를 바꿔야 한다면

  앞선 예제에서는 렌더 타겟을 생성할 때 고정 사이즈, 512x512를 사용했습니다. 하지만 후처리 등에서 렌더 타겟을 사용할 경우, canvas 크기와 렌더 타겟의 크기를 똑같이 설정하는 것이 일반적입니다. 예제를 바탕으로 이를 구현하려면 canvas의 사이즈가 변경되었을 때 카메라와 렌더 타겟의 사이즈를 변경해주어야 하죠.

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
