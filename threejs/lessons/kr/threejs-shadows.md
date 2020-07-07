Title: Three.js 그림자
Description: Three.js의 그림자에 대해 알아봅니다
TOC: 그림자(Shadows)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.

※ 이전 글인 [카메라에 관한 글](threejs-cameras.html)과
[조명에 관한 글](threejs-lights.html)에서 이 장을 읽는 꼭 필요한 내용을
다루었으니 꼭 먼저 읽고 오기 바랍니다.


컴퓨터에서 그림자란 그리 간단한 주제가 아닙니다. 그림자를 구현하는 방법은
아주 많지만 모두 단점이 있기에 어떤 것이 가장 효율적이라고 말하기 어렵습니다.
이는 Three.js에서 제공하는 방법도 마찬가지이죠.

Three.js는 기본적으로 *그림자 맵(shadow maps)*을 사용합니다. 그림자 맵은
*그림자를 만드는 빛의 영향을 받는, 그림자를 드리우는 모든 물체를 빛의 시점에서
렌더링*하는 방식을 말합니다. 중요하니 **다시 한 번 읽어보세요!**

다시 말해, 공간 안에 20개의 물체와 5개의 조명이 있고, 20개의 물체 모두
그림자를 드리우며 5개의 조명 모두 그림자를 지게 한다면, 한 장면을 만들기
위해 총 6번 화면을 렌더링할 것이라는 이야기입니다. 먼저 조명 1번에 대해
20개의 물체를 전부 렌더링하고, 다음에는 2번 조명, 그 다음에는 3번...
이렇게 처음 5번 렌더링한 결과물을 합쳐 최종 결과물을 만드는 것이죠.

만약 여기에 포인트(point) 조명을 하나 추가하면 조명 하나 때문에 6번을 다시
렌더링해야 합니다.

이 때문에 그림자를 지게 하는 조명을 여러개 만들기보다 다른 방법을 찾는
경우가 보통입니다. 주로 사용하는 방법은 조명이 여러개 있어도 하나의 조명만
그림자를 지게끔 설정하는 것이죠.

물론 라이트맵(lightmaps)이나 앰비언트 오클루전(ambient occlusion)을 이용해
빛의 영향을 미리 계산할 수도 있습니다. 이러면 정적 조명이나 정적 빛 반사를
사용하는 것이기에 수정하기가 어렵지만, 적어도 성능은 빠릅니다. 이 두 가지
모두 나중에 별도로 다룰 것입니다.

가짜 그림자를 사용하는 방법도 있습니다. 평면을 만들고, 흑백 텍스처를 입혀
땅 위에 그림자가 있을 만한 위치에 가져다 놓는 것이죠.

예를 들어 아래 텍스처를 사용해 가짜 그림자를 만들어보겠습니다.

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

[이전 글](threejs-cameras.html)에서 작성했던 코드를 일부 활용하겠습니다.

먼저 배경을 흰색으로 칠합니다.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

같은 체크판 무늬 땅을 사용하되, 땅이 조명의 영향을 받을 필요는 없으니
`MeshBasicMaterial`을 사용하겠습니다.

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

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
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

평면의 색상을 `1.5, 1.5, 1.5`로 설정했습니다. 체크판 텍스처의 색상을 1.5, 1.5, 1.5 만큼
곱해준 것이죠. 체크판 원본 텍스처의 색상이 0x808080(회색), 0xC0C0C0(옅은 회색)이므로,
여기에 1.5를 곱해주면 흰색, 옅은 회색 체크판이 됩니다.

이제 그림자 텍스처를 로드해보죠.

```js
const shadowTexture = loader.load('resources/images/roundshadow.png');
```

구체와 관련된 객체를 분류하기 위해 배열을 만들겠습니다.

```js
const sphereShadowBases = [];
```

다음으로 구체 geometry를 만듭니다.

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
```

가짜 그림자를 위한 평면 `geometry`도 만듭니다.

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
```

이제 구체를 아주 많이 만들겠습니다. 각각 구체마다 `기초` 역할을 할
`THREE.Object3D`를 만들고, 그림자 평면 mesh, 구체 mesh를 이
기초의 자식으로 만듭니다. 이러면 구체와 그림자를 동시에 움직일 수
있죠. z-파이팅 현상을 막기 위해 그림자는 땅보다 약간 위에 둡니다.
또 `depthWrite` 속성을 false로 설정해 그림자끼리 충돌하는 현상을
막습니다. 이 충돌 현상은 [다른 글](threejs-transparency.html)에서
더 자세히 이야기할 거예요. 그림자는 빛을 반사하지 않으니 `MeshBasicMaterial`을
사용합니다.

구체의 색상을 각각 다르게 지정하고, 기초, 구체 mesh, 그림자 mesh와
구체의 처음 y축 좌표를 배열에 기록합니다.

```js
const numSpheres = 15;
for (let i = 0; i < numSpheres; ++i) {
  // 구체와 그림자가 같이 움직이도록 기초(base)를 만듭니다
  const base = new THREE.Object3D();
  scene.add(base);

  /**
   * 그림자를 기초에 추가합니다
   * 주의: 여기서는 각 구체의 투명도를 따로 설정할 수 있도록
   * 재질을 각각 따로 만듬
   */
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,    // 땅이 보이도록
    depthWrite: false,    // 그림자를 따로 정렬하지 않도록
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001;  // 그림자를 땅에서 살짝 위에 배치
  shadowMesh.rotation.x = Math.PI * -.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // 구체를 기초에 추가
  const u = i / numSpheres;   // 반복문이 진행됨에 따라 0에서 1사이 값을 지정
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, .75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // y축 좌표를 포함해 나머지 요소를 기록
  sphereShadowBases.push({ base, sphereMesh, shadowMesh, y: sphereMesh.position.y });
}
```

조명은 2개를 만들겠습니다. 하나는 `HemisphereLight`, 강도를 2로 설정해 굉장히 밝은
화면을 만들 겁니다.

```js
{
  const skyColor = 0xB1E1FF;  // 하늘색
  const groundColor = 0xB97A20;  // 오렌지 브라운
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

다른 하나는 구체의 윤곽을 좀 더 분명하게 해 줄 `DirectionalLight`입니다.

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

이대로도 렌더링해도 좋지만, 구체들에 애니메이션을 한 번 줘봅시다.
기초를 움직여 구체, 그림자가 xz축 평면을 따라 움직이게 하고,
`Math.abs(Math.sin(time))`를 사용해 구체에 위아래로 통통 튀는
애니메이션을 넣어줍니다. 또 그림자 재질의 투명도를 조절해 구체가
높을수록 그림자가 옅어지도록 합니다.

```js
function render(time) {
  time *= 0.001;  // 초 단위로 변환

  ...

  sphereShadowBases.forEach((sphereShadowBase, ndx) => {
    const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

    // u는 구체의 반복문을 실행하면서 인덱스에 따라 0 이상, 1 이하로 지정됩니다
    const u = ndx / sphereShadowBases.length;

    /**
     * 기초의 위치를 계산합니다. 구체와 그림자가
     * 기초에 종속적이므로 위치가 같이 변합니다
     */
    const speed = time * .2;
    const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
    const radius = Math.sin(speed - ndx) * 10;
    base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // yOff 값은 0 이상 1 이하입니다
    const yOff = Math.abs(Math.sin(time * 2 + ndx));
    // 구체를 위아래로 튕김
    sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
    // 구체가 위로 올라갈수록 그림자가 옅어짐
    shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
  });

  ...
```

15가지 색상의 탱탱볼을 완성했습니다.

{{{example url="../threejs-shadows-fake.html" }}}

In some apps it's common to use a round or oval shadow for everything but
of course you could also use different shaped shadow textures. You might also
give the shadow a harder edge. A good example of using this type
of shadow is [Animal Crossing Pocket Camp](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots)
where you can see each character has a simple round shadow. It's effective and cheap.
[Monument Valley](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch)
appears to also use this kind of shadow for the main character.

So, moving on to shadow maps, there are 3 lights which can cast shadows. The `DirectionalLight`,
the `PointLight`, and the `SpotLight`.

Let's start with the `DirectionalLight` with the helper example from [the lights article](threejs-lights.html).

The first thing we need to do is turn on shadows in the renderer.

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.shadowMap.enabled = true;
```

Then we also need to tell the light to cast a shadow

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

We also need to go to each mesh in the scene and decide if it should
both cast shadows and/or receive shadows.

Let's make the plane (the ground) only receive shadows since we don't
really care what happens underneath.

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

For the cube and the sphere let's have them both receive and cast shadows

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

And then we run it.

{{{example url="../threejs-shadows-directional-light.html" }}}

What happened? Why are parts of the shadows missing?

The reason is shadow maps are created by rendering the scene from the point
of view of the light. In this case there is a camera at the `DirectionalLight`
that is looking at its target. Just like [the camera's we previously covered](threejs-cameras.html)
the light's shadow camera defines an area inside of which
the shadows get rendered. In the example above that area is too small.

In order to visualize that area we can get the light's shadow camera and add
a `CameraHelper` to the scene.

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

And now you can see the area for which shadows are cast and received.

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

Adjust the target x value back and forth and it should be pretty clear that only
what's inside the light's shadow camera box is where shadows are drawn.

We can adjust the size of that box by adjusting the light's shadow camera.

Let's add some GUI setting to adjust the light's shadow camera box. Since a
`DirectionalLight` represents light all going in a parallel direction, the
`DirectionalLight` uses an `OrthographicCamera` for its shadow camera.
We went over how an `OrthographicCamera` works in [the previous article about cameras](threejs-cameras.html).

Recall an `OrthographicCamera` defines
its box or *view frustum* by its `left`, `right`, `top`, `bottom`, `near`, `far`,
and `zoom` properties.

Again let's make a helper class for the dat.GUI. We'll make a `DimensionGUIHelper`
that we'll pass an object and 2 properties. It will present one property that dat.GUI
can adjust and in response will set the two properties one positive and one negative.
We can use this to set `left` and `right` as `width` and `up` and `down` as `height`.

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

We'll also use the `MinMaxGUIHelper` we created in the [camera article](threejs-cameras.html)
to adjust `near` and `far`.

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

We tell the GUI to call our `updateCamera` function anytime anything changes.
Let's write that function to update the light, the helper for the light, the
light's shadow camera, and the helper showing the light's shadow camera.

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

And now that we've given the light's shadow camera a GUI we can play with the values.

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

Set the `width` and `height` to about 30 and you can see the shadows are correct
and the areas that need to be in shadow for this scene are entirely covered.

But this brings up the question, why not just set `width` and `height` to some
giant numbers to just cover everything? Set the `width` and `height` to 100
and you might see something like this

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

What's going on with these low-res shadows?!

This issue is yet another shadow related setting to be aware of.
Shadow maps are textures the shadows get drawn into.
Those textures have a size. The shadow camera's area we set above is stretched
across that size. That means the larger area you set, the more blocky your shadows will
be.

You can set the resolution of the shadow map's texture by setting `light.shadow.mapSize.width`
and `light.shadow.mapSize.height`. They default to 512x512.
The larger you make them the more memory they take and the slower they are to compute so you want
to set them as small as you can and still make your scene work. The same is true with the
light's shadow camera area. Smaller means better looking shadows so make the area as small as you
can and still cover your scene. Be aware that each user's machine has a maximum texture size
allowed which is available on the renderer as [`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities).

<!--
Ok but what about `near` and `far` I hear you thinking. Can we set `near` to 0.00001 and far to `100000000`
-->

Switching to the `SpotLight` the light's shadow camera becomes a `PerspectiveCamera`. Unlike the `DirectionalLight`'s shadow camera
where we could manually set most its settings, `SpotLight`'s shadow camera is controlled by the `SpotLight` itself. The `fov` for the shadow
camera is directly connected to the `SpotLight`'s `angle` setting.
The `aspect` is set automatically based on the size of the shadow map.

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

and we added back in the `penumbra` and `angle` settings
from our [article about lights](threejs-lights.html).

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


And finally there's shadows with a `PointLight`. Since a `PointLight`
shines in all directions the only relevant settings are `near` and `far`.
Otherwise the `PointLight` shadow is effectively 6 `SpotLight` shadows
each one pointing to the face of a cube around the light. This means
`PointLight` shadows are much slower since the entire scene must be
drawn 6 times, one for each direction.

Let's put a box around our scene so we can see shadows on the walls
and ceiling. We'll set the material's `side` property to `THREE.BackSide`
so we render the inside of the box instead of the outside. Like the floor
we'll set it only to receive shadows. Also we'll set the position of the
box so its bottom is slightly below the floor so the floor and the bottom
of the box don't z-fight.

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
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

And of course we need to switch the light to a `PointLight`.

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// so we can easily see where the point light is
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

Use the `position` GUI settings to move the light around
and you'll see the shadows fall on all the walls. You can
also adjust `near` and `far` settings and see just like
the other shadows when things are closer than `near` they
no longer receive a shadow and they are further than `far`
they are always in shadow.

<!--
self shadow, shadow acne
-->

