Title: Three.js의 텍스처(Textures)
Description: Three.js에서 텍스처(Textures)를 사용하는 법을 알아봅니다.
TOC: 텍스처(Textures)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)과
[개발 환경 설정하는 법](threejs-setup.html)을 읽고 오길 권장합니다.

※ 텍스처, Texture는 질감으로 번역할 수 있으나, 그대로 표기하는 쪽이
직관적이라고 판단하여 **텍스처**로 번역하였습니다.


Three.js에서 텍스처를 이야기하기란 쉽지 않습니다. 텍스처는 워낙 방대한
주제이고, 각 주제끼리도 서로 연결되어 있어 한 번에 설명하는 것이 거의
불가능하기 때문이죠. 어떻게 설명해야 잘 설명했다고 할 수 있을지 확신은
없지만, 일단 해보기로 합시다. 다음은 이 글의 간략한 목차입니다.

<ul>
<li><a href="#hello">하이, 텍스처</a></li>
<li><a href="#six">육면체 각 면에 다른 텍스처 지정하기</a></li>
<li><a href="#loading">텍스처 불러오기</a></li>
<ul>
  <li><a href="#easy">간단한 방법</a></li>
  <li><a href="#wait1">텍스처를 불러온 후 처리하기</a></li>
  <li><a href="#waitmany">다수의 텍스처를 불러온 후 처리하기</a></li>
  <li><a href="#cors">다른 도메인(origin)에서 텍스처 불러오기</a></li>
</ul>
<li><a href="#memory">메모리 관리</a></li>
<li><a href="#format">JPG vs PNG</a></li>
<li><a href="#filtering-and-mips">필터링과 Mips</a></li>
<li><a href="#uvmanipulation">반복하기, 파생하기, 회전하기, 감싸기</a></li>
</ul>

## <a name="hello"></a> 하이, 텍스처

텍스처는 *일반적으로* 포토샵이나 김프 등의 프로그램으로 만든 이미지입니다.
예를 들어 아래 이미지를 정육면체에 씌워보죠.

<div class="threejs_center">
  <img src="../resources/images/wall.jpg" style="width: 600px;" class="border" >
</div>

예제는 처음 만들었던 것을 사용하겠습니다. 추가로 `TextureLoader`를 새로 생성한
뒤, 인스턴스의 [`load`](TextureLoader.load) 메서드에 이미지의 URL을 넘겨주어 호출하고,
반환 받은 값을 재질(material)의 `map` 속성에 지정합니다(`color` 속성은 지정하지
않습니다).

```js
+const loader = new THREE.TextureLoader();

const material = new THREE.MeshBasicMaterial({
-  color: 0xFF8844,
+  map: loader.load('resources/images/wall.jpg'),
});
```

※ `MeshBasicMaterial`을 사용했으므로 광원을 사용할 필요가 없습니다.

{{{example url="../threejs-textured-cube.html" }}}

## <a name="six"></a> 육면체 각 면에 다른 텍스처 지정하기

이번에는 육면체의 각 면에 다른 텍스처를 넣어볼까요?

<div class="threejs_center">
  <div>
    <img src="../resources/images/flower-1.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-2.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-3.jpg" style="width: 100px;" class="border" >
  </div>
  <div>
    <img src="../resources/images/flower-4.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-5.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-6.jpg" style="width: 100px;" class="border" >
  </div>
</div>

단순히 재질을 6개 만들어 `Mesh`를 생성할 때 배열로 넘겨주기만 하면 됩니다.

```js
const loader = new THREE.TextureLoader();

-const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
-});
+const materials = [
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-1.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-2.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-3.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-4.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-5.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-6.jpg')}),
+];
-const cube = new THREE.Mesh(geometry, material);
+const cube = new THREE.Mesh(geometry, materials);
```

껌이네요.

{{{example url="../threejs-textured-cube-6-textures.html" }}}

주의해야할 점은 모든 `geometry`가 재질을 배열로 받진 않는다는 점입니다.
`BoxGeometry`나 `BoxBufferGeometry`는 최대 6개, `ConeGeometry`와
`ConeBufferGeometry`는 밑면과 뿔 부분에 하나씩 최대 2개, `CylinderGeometry`와
`CylinderBufferGeometry`는 아래, 위, 옆면 하나씩 최대 3개를 지정할 수 있죠.
다른 경우에는 `geometry`를 따로 만들거나, 텍스처의 좌표를 직접 수정해야 합니다.

다른 3D 엔진에서나 Three.js에서나, 하나의 `geometry`에서 여러 텍스처를 쓰고 싶을 때는
보통 [텍스처 아틀라스](https://en.wikipedia.org/wiki/Texture_atlas)를 사용합니다.
텍스처 아틀라스란 여러 이미지로 구성된 하나의 텍스처로, `geometry`의 정점에 따라 텍스처의
좌표를 조절해 `geometry`의 각 삼각형이 텍스처의 일정 부분을 표현하도록 할 수 있습니다.

그렇다면 텍스처의 좌표란 무엇일까요? 이는 `geometry`의 각 정점에 추가되는 데이터로, 특정
정점에 텍스처의 어느 부분을 써야하는지를 나타냅니다. 자세한 사용법은 나중에
[사용자 지정 geometry 만들기](threejs-custom-geometry.html)에서 살펴보겠습니다.

## <a name="loading"></a> 텍스처 불러오기

### <a name="easy"></a> 간단한 방법

이 사이트의 예제는 대부분 텍스처를 로딩할 때 간단한 메서드를 사용했습니다.
`TextureLoader`를 생성하고, 인스턴스의 [`load`](TextureLoader.load) 메서드를
호출하는 거죠. 이 `load` 메서드는 `Texture` 객체를 반환합니다.

```js
const texture = loader.load('resources/images/flower-1.jpg');
```

알아둬야 할 건 이 메서드는 비동기로 작동한다는 점입니다. 이미지를 완전히
불러온 후 이미지로 텍스처를 업데이트하기 전까지, 텍스처는 투명하게 보일 겁니다.

텍스처를 전부 불러오지 않아도 브라우저가 페이지 렌더링을 시작할 것이므로 이는
속도면에서 꽤 큰 장점입니다. 텍스처를 언제 다 불러왔는지 알아야 하는 경우가
아니라면, 대부분 큰 문제가 되지 않겠죠.

### <a name="wait1"></a> 텍스처를 불러온 후 처리하기

텍스처를 불러온 후 후처리를 위해 `load` 메서드는 두 번째 인자로 콜백(callback)
함수를 받습니다. 이 함수는 텍스처를 전부 불러온 후 호출되죠. 글의 첫 번째 예제를
조금 수정해보겠습니다.

```js
const loader = new THREE.TextureLoader();
loader.load('resources/images/wall.jpg', (texture) => {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
});
```

브라우저의 캐시를 비우거나 인터넷 연결 속도가 느리지 않는 한 차이를 느끼기
어렵긴 하지만, 텍스처를 불러온 뒤 화면을 렌더링합니다.

{{{example url="../threejs-textured-cube-wait-for-texture.html" }}}

### <a name="waitmany"></a> 다수의 텍스처를 불러온 후 처리하기

다수의 텍스처를 한 번에 불러와야 할 경우 `LoadingManager`를 사용할 수 있습니다.
`TextureLoader`를 생성할 때 미리 생성한 `LoadingManager`의 인스턴스를 인자로
넘겨주고, `LoadingManager` 인스턴스의 [`onLoad`](LoadingManager.onLoad) 속성에
콜백 함수를 설정해주는 거죠.

```js
+const loadManager = new THREE.LoadingManager();
*const loader = new THREE.TextureLoader(loadManager);

const materials = [
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-1.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-2.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-3.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-4.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-5.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-6.jpg')}),
];

+loadManager.onLoad = () => {
+  const cube = new THREE.Mesh(geometry, materials);
+  scene.add(cube);
+  cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
+};
```

`LoadingManager`의 [`onProgress`](LoadingManager.onProgress)에 콜백 함수를 지정하면
현재 진행 상태를 추적할 수 있습니다.

일단 HTML로 프로그래스 바(progress bar)를 만들겠습니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div id="loading">
+    <div class="progress"><div class="progressbar"></div></div>
+  </div>
</body>
```

스타일도 추가하죠.

```css
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#loading .progress {
    margin: 1.5em;
    border: 1px solid white;
    width: 50vw;
}
#loading .progressbar {
    margin: 2px;
    background: white;
    height: 1em;
    transform-origin: top left;
    transform: scaleX(0);
}
```

다음으로 `onProgress` 콜백에서 `.progressbar`의 X축 크기를 조정하겠습니다.
콜백 함수는 마지막으로 불러온 자원의 URL, 현재까지 불러온 자원의 수, 총 지원의
수를 매개변수로 받습니다.

```js
+const loadingElem = document.querySelector('#loading');
+const progressBarElem = loadingElem.querySelector('.progressbar');

loadManager.onLoad = () => {
+  loadingElem.style.display = 'none';
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
};

+loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => { // 마지막으로 불러온 자원의 URL, 현재까지 불러온 자원의 수, 총 지원의 수
+  const progress = itemsLoaded / itemsTotal;
+  progressBarElem.style.transform = `scaleX(${progress})`;
+};
```

캐시를 비우거나 인터넷 속도가 느리지 않다면 프로그래스 바가 보이지 않을
수도 있습니다.

{{{example url="../threejs-textured-cube-wait-for-all-textures.html" }}}

## <a name="cors"></a> 다른 도메인(origin)에서 텍스처 불러오기

다른 서버에서 이미지를 불러오려면 해당 서버가 [CORS 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)를
보내줘야 합니다. CORS 헤더가 없다면 Three.js가 이미지를 불러오지 않을 것이고,
에러가 발생할 겁니다. 만약 이미지 호스팅 서버를 운영한다면 해당 서버가 CORS 헤더를
보내는지 확인해보세요.

[imgur](https://imgur.com), [flickr](https://flickr.com), [github](https://github.com)
등의 사이트는 자신이 호스팅하는 이미지를 사용해도 좋다는 헤더를 보냅니다.
대부분의 웹사이트는 이를 허용하지 않죠.

## <a name="memory"></a> 메모리 관리

텍스처는 Three.js 앱에서 메모리를 가장 많이 사용하는 요소 중 하나입니다.
*대체로* 텍스처는 약 `너비 * 높이 * 4 * 1.33` 바이트의 메모리를 사용합니다.

여기서 압축은 그다지 중요한 요소가 아닙니다. 예를 들어 집이 포함된 장면(scene)을
만든다고 해보죠. 집 안에는 탁자가 있고, 탁자의 윗면에 나무 텍스처를 씌우려고
합니다.

<div class="threejs_center"><img class="border" src="resources/images/compressed-but-large-wood-texture.jpg" align="center" style="width: 300px"></div>

이 이미지는 매우 고 배율로 압축되어 157kb 밖에 되지 않습니다. 상대적으로
다운 속도는 빠를 것이나, 이 [이미지의 실제 크기는 3024 x 3761 픽셀입니다](resources/images/compressed-but-large-wood-texture.jpg).
위 공식에 따르면 이 이미지를 적용해보면,

    3024 * 3761 * 4 * 1.33 = 60505764.5

무려 **약 60 메가바이트의 메모리**를 사용합니다. 이런 텍스처가 몇 개만 더
있어도 메모리 부족으로 앱을 사용하지 못할 수 있죠(OUT_OF_MEMORY).

극단적인 예제이기는 하나 이 예제는 텍스처를 사용하는데 숨겨진 비용을 고려해야
한다는 것을 잘 알려줍니다. Three.js가 텍스처를 사용하려면 GPU에 텍스처를
넘겨주어야 하는데, GPU는 *일반적으로* 압축하지 않은 데이터를 사용하죠.

이 예시의 교훈은 파일의 용량이 아니라 파일의 해상도를 줄어야 한다는 것입니다.
파일의 용량이 작다면 불러오는 속도가 빠를 것이고, 해상도가 낮다면 메모리를
그만큼 적게 사용하겠죠. 얼마나 낮게 만들어야 할까요? 필요한 만큼 퀄리티를
유지한 선에서 가능한 낮게 만드는 게 좋습니다.

## <a name="format"></a> JPG vs PNG

이는 HTML과 마찬가지입니다. JPG는 손실 압축을 사용하고, PNG는 비손실 압축을
사용하는 대신 보통 PNG가 더 용량이 크죠. 하지만 PNG는 투명도를 지원합니다.
PNG는 비-이미지 데이터인 법선 맵(normal maps), 그리고 나중에 살펴볼 다른
비-이미지 데이터를 사용하기에 현재로써는 가장 적당한 파일 형식입니다.

위에서 말했듯, WebGL에서는 JPG가 용량이 더 작긴 해도 
PNG 형식보다 메모리 점유율이 낮진 않습니다.

## <a name="filtering-and-mips"></a> 필터링과 Mips

이 16x16 텍스처를

<div class="threejs_center"><img src="resources/images/mip-low-res-enlarged.png" class="nobg" align="center"></div>

아래의 정육면체에 적용해보죠.

<div class="spread"><div data-diagram="filterCube"></div></div>

그리고 정육면체를 아주 작게 렌더링합니다.

<div class="spread"><div data-diagram="filterCubeSmall"></div></div>

음, 보기가 어렵네요. 확대해봅시다.

<div class="spread"><div data-diagram="filterCubeSmallLowRes"></div></div>

GPU는 작은 정육면체를 표현할 때 어떻게 각 픽셀의 색상을 결정할까요? 정육면체가
작아도 너무 작아서 1, 2 픽셀 정도라면요?

이게 바로 필터링(filtering)이 있는 이유입니다.

포토샵의 경우는 근처 픽셀의 평균을 내 해당 1, 2 픽셀의 형태를 결정할 겁니다.
이는 매우 무거운 작업이죠. GPU는 이 문제를 해결하기 위해 [밉맵(mipmaps)](https://ko.wikipedia.org/wiki/%EB%B0%89%EB%A7%B5)을
사용합니다.

밉(mips)은 텍스처의 복사본으로, 각 밉은 축소된 이전 밉보다 반만큼 작습니다.
밉은 1x1 픽셀 밉을 생성할 때까지 계속 생성되죠. 위 이미지의 경우 밉은 다음과
같이 생성됩니다.

<div class="threejs_center"><img src="resources/images/mipmap-low-res-enlarged.png" class="nobg" align="center"></div>

이제 1, 2 픽셀 정도로 작은 정육면체를 렌더링할 때 GPU는 가장 작거나, 두 번째로
작은 밉을 선택해 텍스처를 적용하기만 하면 되죠.

Three.js에서는 텍스처의 크기가 원본보다 클 때와 작을 때 각각 어떻게 표현할지를
설정할 수 있습니다.

텍스처의 크기가 원본보다 클 때의 필터는 [`texture.magFilter`](Texture.magFilter)
속성을 `THREE.NearestFilter`나 `THREE.LinearFilter`로 지정해 설정합니다.

`NearestFilter`는 말 그대로 텍스처에서 가장 가까운 픽셀을 고르는 것입니다.
낮은 해상도라면 텍스처가 픽셀화되어 마인크래프트 같은 느낌을 주겠죠.

`LinearFilter`는 가장 가까운 4개의 픽셀을 골라 각 픽셀의 실제 거리에 따라 적절한
비율로 섞는 것을 말합니다.

<div class="spread">
  <div>
    <div data-diagram="filterCubeMagNearest" style="height: 250px;"></div>
    <div class="code">Nearest</div>
  </div>
  <div>
    <div data-diagram="filterCubeMagLinear" style="height: 250px;"></div>
    <div class="code">Linear</div>
  </div>
</div>

For setting the filter when the texture is drawn smaller than its original size
you set the [`texture.minFilter`](Texture.minFilter) property to one of 6 values.

* `THREE.NearestFilter`

   same as above, choose the closest pixel in the texture

* `THREE.LinearFilter`

   same as above, choose 4 pixels from the texture and blend them

* `THREE.NearestMipmapNearestFilter`

   choose the appropriate mip then choose one pixel

* `THREE.NearestMipmapLinearFilter`

   choose 2 mips, choose one pixel from each, blend the 2 pixels

* `THREE.LinearMipmapNearestFilter`

   chose the appropriate mip then choose 4 pixels and blend them

*  `THREE.LinearMipmapLinearFilter`

   choose 2 mips, choose 4 pixels from each and blend all 8 into 1 pixel

Here's an example showing all 6 settings

<div class="spread">
  <div data-diagram="filterModes" style="
    height: 450px;
    position: relative;
  ">
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    ">
      <div style="
        background: rgba(255,0,0,.8);
        color: white;
        padding: .5em;
        margin: 1em;
        font-size: small;
        border-radius: .5em;
        line-height: 1.2;
        user-select: none;"
      >click to<br/>change<br/>texture</div>
    </div>
    <div class="filter-caption" style="left: 0.5em; top: 0.5em;">nearest</div>
    <div class="filter-caption" style="width: 100%; text-align: center; top: 0.5em;">linear</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; top: 0.5em;">nearest<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="left: 0.5em; text-align: left; bottom: 0.5em;">nearest<br/>mipmap<br/>linear</div>
    <div class="filter-caption" style="width: 100%; text-align: center; bottom: 0.5em;">linear<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; bottom: 0.5em;">linear<br/>mipmap<br/>linear</div>
  </div>
</div>

One thing to notice is the top left and top middle using `NearestFilter` and `LinearFilter`
don't use the mips. Because of that they flicker in the distance because the GPU is
picking pixels from the original texture. On the left just one pixel is chosen and
in the middle 4 are chosen and blended but it's not enough come up with a good
representative color. The other 4 strips do better with the bottom right,
`LinearMipmapLinearFilter` being best.

If you click the picture above it will toggle between the texture we've been using above
and a texture where every mip level is a different color.

<div class="threejs_center">
  <div data-texture-diagram="differentColoredMips"></div>
</div>

This makes it more clear
what is happening. You can see in the top left and top middle the first mip is used all the way
into the distance. The top right and bottom middle you can clearly see where a different mip
is used.

Switching back to the original texture you can see the bottom right is the smoothest,
highest quality. You might ask why not always use that mode. The most obvious reason
is sometimes you want things to be pixelated for a retro look or some other reason.
The next most common reason is that reading 8 pixels and blending them is slower
than reading 1 pixel and blending. While it's unlikely that a single texture is going
to be the difference between fast and slow as we progress further into these articles
we'll eventually have materials that use 4 or 5 textures all at once. 4 textures * 8
pixels per texture is looking up 32 pixels for ever pixel rendered.
This can be especially important to consider on mobile devices.

## <a name="uvmanipulation"></a> Repeating, offseting, rotating, wrapping a texture

Textures have settings for repeating, offseting, and rotating a texture.

By default textures in three.js do not repeat. To set whether or not a
texture repeats there are 2 properties, [`wrapS`](Texture.wrapS) for horizontal wrapping
and [`wrapT`](Texture.wrapT) for vertical wrapping.

They can be set to one of:

* `THREE.ClampToEdgeWrapping`

   the last pixel on each edge is repeated forever

* `THREE.RepeatWrapping`

   the texture is repeated

* `THREE.MirroredRepeatWrapping`

   the texture is mirrored and repeated

For example to turn on wrapping in both directions:

```js
someTexture.wrapS = THREE.RepeatWrapping;
someTexture.wrapT = THREE.RepeatWrapping;
```

Repeating is set with the [repeat] repeat property.

```js
const timesToRepeatHorizontally = 4;
const timesToRepeatVertically = 2;
someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
```

Offseting the texture can be done by setting the `offset` property. Textures
are offset with units where 1 unit = 1 texture size. On other words 0 = no offset
and 1 = offset one full texture amount.

```js
const xOffset = .5;   // offset by half the texture
const yOffset = .25;  // offset by 1/4 the texture
someTexture.offset.set(xOffset, yOffset);
```

Rotating the texture can be set by setting the `rotation` property in radians
as well as the `center` property for choosing the center of rotation.
It defaults to 0,0 which rotates from the bottom left corner. Like offset
these units are in texture size so setting them to `.5, .5` would rotate
around the center of the texture.

```js
someTexture.center.set(.5, .5);
someTexture.rotation = THREE.MathUtils.degToRad(45);
```

Let's modify the top sample above to play with these values

First we'll keep a reference to the texture so we can manipulate it

```js
+const texture = loader.load('resources/images/wall.jpg');
const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg');
+  map: texture,
});
```

Then we'll use [dat.GUI](https://github.com/dataarts/dat.gui) again to provide a simple interface.

```js
import {GUI} from '../3rdparty/dat.gui.module.js';
```

As we did in previous dat.GUI examples we'll use a simple class to
give dat.GUI an object that it can manipulate in degrees
but that will set a property in radians.

```js
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}
```

We also need a class that will convert from a string like `"123"` into
a number like `123` since three.js requires numbers for enum settings
like `wrapS` and `wrapT` but dat.GUI only uses strings for enums.

```js
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}
```

Using those classes we can setup a simple GUI for the settings above

```js
const wrapModes = {
  'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
  'RepeatWrapping': THREE.RepeatWrapping,
  'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
};

function updateTexture() {
  texture.needsUpdate = true;
}

const gui = new GUI();
gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
  .name('texture.wrapS')
  .onChange(updateTexture);
gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
  .name('texture.wrapT')
  .onChange(updateTexture);
gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
  .name('texture.rotation');
```

The last thing to note about the example is that if you change `wrapS` or
`wrapT` on the texture you must also set [`texture.needsUpdate`](Texture.needsUpdate)
so three.js knows to apply those settings. The other settings are automatically applied.

{{{example url="../threejs-textured-cube-adjust.html" }}}

This is only one step into the topic of textures. At some point we'll go over
texture coordinates as well as 9 other types of textures that can be applied
to materials.

For now let's move on to [lights](threejs-lights.html).

<!--
alpha
ao
env
light
specular
bumpmap ?
normalmap ?
metalness
roughness
-->

<link rel="stylesheet" href="../resources/threejs-textures.css">
<script type="module" src="../resources/threejs-textures.js"></script>