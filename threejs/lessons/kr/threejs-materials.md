Title: Three.js의 재질(Materials)
Description: Three.js의 재질(Materials)에 대해 알아봅니다
TOC: 재질(Materials)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


Three.js에는 기본으로 제공하는 재질(materials) 몇 개가 있습니다.
재질이란, 물체가 씬(scene)에 어떤 식으로 나타날지를 결정하는 요소로서,
어떤 재질을 사용할지는 전적으로 상황에 따라 판단해야 합니다.

재질의 속성(property)를 정하는 방법은 크게 두 가지로 나뉩니다. 하나는
이전에 보았든 생성자를 호출할 때 값을 넘겨주는 것이고,

```js
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // 빨강 (CSS처럼 문자열로 넘겨줄 수도 있음. "#ff0000")
  flatShading: true,
});
```

다른 하나는 생성한 뒤에 바꾸는 것이죠.

```js
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // 빨강
material.flatShading = true;
```

물론 HSL 색상 모델 외에 rgb, hex 등 다양한 방법으로 색을 지정할
수 있습니다.

```js
material.color.set(0x00FFFF);    // CSS의 #RRGGBB 형식
material.color.set(cssString);   /* CSS 색상 문자열, 예를 들어 'purple', '#F32',
                                  * 'rgb(255, 127, 64)',
                                  * 'hsl(180, 50%, 25%)' 등
                                  */
material.color.set(someColor)    // THREE.Color에 정의된 static 색상
material.color.setHSL(h, s, l)   // hsl 색상, 0부터 1까지
material.color.setRGB(r, g, b)   // rgb 색상, 0부터 1까지
```

생성시에도 hex 값 또는 CSS 문자열을 전달해도 됩니다.

```js
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // 빨강
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // 빨강
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // 빨강
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // 빨강
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'); // 빨강
```

이제 Three.js의 기본 재질을 살펴보겠습니다.

`MeshBasicMaterial`은 광원의 영향을 받지 않습니다. `MeshLamberMaterial`은
정점에서만 광원을 계산하고, `MeshPhongMaterial`은 픽셀 하나하나 전부 광원을
계산합니다. 뿐만 아니라 `MeshPhongMaterial`은 반사점(specular highlights, 물체가 조명을 받을 때 물체에 나타나는 밝은 점. 역주)도
지원합니다.

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterial" ></div>
    <div class="code">Basic</div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterial" ></div>
    <div class="code">Lambert</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterial" ></div>
    <div class="code">Phong</div>
  </div>
</div>
<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialLowPoly" ></div>
  </div>
</div>
<div class="threejs_center code">같은 모델을 로우-폴리(low poly) 모델로 바꾼 것</div>

`MeshPhongMaterial`의 `shininess` 속성으로 반사점의 *밝기*를 조절할 수
있습니다(기본값 30).

<div class="spread">
  <div>
    <div data-diagram="MeshPhongMaterialShininess0" ></div>
    <div class="code">shininess: 0</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess30" ></div>
    <div class="code">shininess: 30</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess150" ></div>
    <div class="code">shininess: 150</div>
  </div>
</div>

만약 `MeshLamberMaterial`이나 `MeshPhongMaterial`의 `emissive` 속성에
색상값을 지정하고, (`MeshPhongMaterial`은 `shininess`도 0으로 지정해야함)
`color` 속성을 검정으로 지정하면 `MeshBasicMaterial`과 마찬가지로 입체감이
사라집니다.

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialCompare" ></div>
    <div class="code">
      <div>Basic</div>
      <div>color: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialCompare" ></div>
    <div class="code">
      <div>Lambert</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialCompare" ></div>
    <div class="code">
      <div>Phong</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
      <div>shininess: 0</div>
    </div>
  </div>
</div>

왜 `MeshPhongMaterial`로 `MeshBasicMaterial`과 `MeshLamberMaterial`을
구현할 수 있는데 3가지로 분리해 놓았을까요? 이미 감을 잡으셨겠지만, 재질이
정교할수록 GPU의 부담이 커지기 때문입니다. GPU 성능이 낮은 저사양 기기에서는
덜 정교한 재질을 씀으로써 GPU의 부담을 줄일 수 있죠. 또한 복잡한 표현이 필요
없다면 더 간단한 재질을, 광원 효과가 아예 필요 없다면 `MeshBasicMaterial`을
사용하는 것이 좋습니다.

`MeshToonMaterial`은 `MeshPhongMaterial`과 유사하나, 큰 차이점이 하나 있습니다.
부드럽게 쉐이딩(shading)하는 대신, `MeshToonMaterial`은 그라디언트 맵(gradient map)을
사용합니다. 기본적으로 `MeshToonMaterial`은 처음 70%까지는 밝고 다음 100%까지는
어두운 그라디언트 맵을 사용하나, 그라디언트 맵을 직접 지정해 줄 수도 있죠. `MeshToonMaterial`로
만든 물체는 투톤을 띄어 카툰 느낌을 줍니다.

<div class="spread">
  <div data-diagram="MeshToonMaterial"></div>
</div>

다음으로 살펴 볼 두 재질은 *물리 기반 렌더링을 위한* 재질입니다. 물리 기반 렌더링(Physically Based Rendering)은
줄여서 PBR이라고 하죠.

위에서 살펴본 재질들은 재질을 3D처럼 보이게 하기 위해 간단한 수학을 사용하나,
이는 실제 세계와는 다릅니다. 이 두 가지 PBR 재질은 실제 세계에서처럼 물체를
구현하기 위해 훨씬 복잡한 수학을 사용하죠.

첫 번째는 `MeshStandardMaterial`입니다.`MeshPhongMaterial`과 `MeshStandardMaterial`의
가장 큰 차이점은 사용하는 속성이 다르다는 점입니다. `MeshPhongMaterial`은
`shininess`를 사용하지만, `MeshStandardMaterial`은 `roughness`와 `metalness`
두 가지 속성을 사용합니다.

[`roughness`](MeshStandardMaterial.roughness)는 `roughness`는
0부터 1까지의 숫자값으로, `shininess`의 반대입니다. 높은 `roughness`를
가진 물체, 예를 들어 야구공은 빛 반사가 거의 없지만, 반대로 낮은
`roughness`를 가진 물체, 당구공은 매우 번들번들하죠.

[`metalness`](MeshStandardMaterial.metalness)는 얼마나 금속성입니다.
얼마나 금속 재질에 가까울 것인가로써, 0은 아예 금속 같지 않은 것이고,
1은 완전히 금속처럼 보이는 것을 의미합니다.

아래의 예제는 `MeshStandardMaterial`의 `roughness`를 왼쪽에서 오른쪽으로
커지게(0 -> 1), `metalness`를 위에서 아래로 커지게(0 -> 1) 한 것입니다.

<div data-diagram="MeshStandardMaterial" style="min-height: 400px"></div>

`MeshPhysicalMaterial`은 `MeshStandardMaterial`과 기본적으로 같지만,
0부터 1까지의 `clearcoat` 속성으로 표면에 코팅 세기를 설정하고,
`clearcoatRoughness` 속성으로 코팅의 거침 정도를 설정한다는 점이 다릅니다.

아래는 위의 예제와 마찬가지로 `roughness`와 `metalness` 속성을 주고
`clearcoat` 속성과 `clearcoatRoughness` 속성을 조정할 수 있도록 한 예제입니다.

<div data-diagram="MeshPhysicalMaterial" style="min-height: 400px"></div>

여태까지 살펴본 Three.js의 기본 재질을 성능이 빠른 것부터 나열하면,

`MeshBasicMaterial` ➡ `MeshLambertMaterial` ➡ `MeshPhongMaterial` ➡
`MeshStandardMaterial` ➡ `MeshPhysicalMaterial`

입니다. 성능에 부담이
클수록 더 현실적인 결과물을 얻을 수 있지만, 저사양 지원을 위해서는 코드
최적화에 그만큼 신경을 써야합니다.

또 특수한 경우에 사용하는 세 가지 재질이 있습니다. `ShadowMaterial`은
그림자로부터 데이터를 가져오는데 사용하죠. 아직 그림자에 대해서는 다루지
않았지만, 그림자에 대해서 살펴볼 때 씬 뒤에서 무슨 일이 일어나는지
자세히 살펴볼 것입니다.

`MeshDepthMaterial`은 각 픽셀의 깊이를 렌더링합니다. 카메라의 마이너스
[`near`](PerspectiveCamera.near)에 위치한 픽셀은 0으로, 마이너스
[`far`](PerspectiveCamera.far)에 위치한 픽셀은 1로 렌더링하죠. 이 재질을
사용해 구현할 수 있는 것에 대해서는 다른 글에서 나중에 다뤄보겠습니다.

<div class="spread">
  <div>
    <div data-diagram="MeshDepthMaterial"></div>
  </div>
</div>

`MeshNormalMaterial`은 `geometry`의 *법선(normals)*을 보여줍니다.
*법선*이란 특정한 삼각형이나 픽셀이 가리키는 방향을 의미하죠.
`MeshNormalMaterial`은 카메라를 기반으로 법선을 렌더링합니다.
<span class="color:red;">x축은 빨강</span>,
<span class="color:green;">y축은 초록</span>,
<span class="color:blue;">z축은 파랑</span>이죠.
다시 말해 오른쪽 면은 <span class="color:#FF7F7F;">분홍</span>,
왼쪽 면은 <span class="color:#007F7F;">청녹</span>,
위쪽 면은 <span class="color:#7FFF7F;">청녹</span>,
아래쪽 면은 <span class="color:#7F007F;">자주</span>,
정면은 <span class="color:#7F7FFF;">연보라</span>가 됩니다.

<div class="spread">
  <div>
    <div data-diagram="MeshNormalMaterial"></div>
  </div>
</div>

`ShaderMaterial` is for making custom materials using the three.js shader
system. `RawShaderMaterial` is for making entirely custom shaders with
no help from three.js. Both of these topics are large and will be
covered later.

Most materials share a bunch of settings all defined by `Material`.
[See the docs](Material)
for all of them but let's go over two of the most commonly used
properties.

[`flatShading`](Material.flatShading):
whether or not the object looks faceted or smooth. default = `false`.

<div class="spread">
  <div>
    <div data-diagram="smoothShading"></div>
    <div class="code">flatShading: false</div>
  </div>
  <div>
    <div data-diagram="flatShading"></div>
    <div class="code">flatShading: true</div>
  </div>
</div>

[`side`](Material.side): which sides of triangles to show. The default is `THREE.FrontSide`.
Other options are `THREE.BackSide` and `THREE.DoubleSide` (both sides).
Most 3D objects drawn in three are probably opaque solids so the back sides
(the sides facing inside the solid) do not need to be drawn. The most common
reason to set `side` is for planes or other non-solid objects where it is
common to see the back sides of triangles.

Here are 6 planes drawn with `THREE.FrontSide` and `THREE.DoubleSide`.

<div class="spread">
  <div>
    <div data-diagram="sideDefault" style="height: 250px;"></div>
    <div class="code">side: THREE.FrontSide</div>
  </div>
  <div>
    <div data-diagram="sideDouble" style="height: 250px;"></div>
    <div class="code">side: THREE.DoubleSide</div>
  </div>
</div>

There's really a lot to consider with materials and we actually still
have a bunch more to go. In particular we've mostly ignored textures
which open up a whole slew of options. Before we cover textures though
we need to take a break and cover
[setting up your development environment](threejs-setup.html)

<div class="threejs_bottombar">
<h3>material.needsUpdate</h3>
<p>
This topic rarely affects most three.js apps but just as an FYI...
Three.js applies material settings when a material is used where "used"
means "something is rendered that uses the material". Some material settings are
only applied once as changing them requires lots of work by three.js.
In those cases you need to set <code>material.needsUpdate = true</code> to tell
three.js to apply your material changes. The most common settings
that require you to set <code>needsUpdate</code> if you change the settings after
using the material are:
</p>
<ul>
  <li><code>flatShading</code></li>
  <li>adding or removing a texture
    <p>
    Changing a texture is ok, but if want to switch from using no texture
    to using a texture or from using a texture to using no texture
    then you need to set <code>needsUpdate = true</code>.
    </p>
    <p>In the case of going from texture to no-texture it is often
    just better to use a 1x1 pixel white texture.</p>
  </li>
</ul>
<p>As mentioned above most apps never run into these issues. Most apps
do not switch between flat shaded and non flat shaded. Most apps also
either use textures or a solid color for a given material, they rarely
switch from using one to using the other.
</p>
</div>

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-materials.js"></script>