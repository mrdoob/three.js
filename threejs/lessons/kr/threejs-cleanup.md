Title: Three.js 메모리 해제하기
Description: Three.js를 사용할 때 메모리를 해제하는 법을 알아봅니다
TOC: 메모리 해제하기

Three.js 앱은 생각보다 많은 메모리를 사용합니다. 3D 모델의 정점 데이터는 보통 1MB에서 20MB 정도의 메모리를 차지하죠. 텍스처로 JPG 파일을 사용하는 모델은 텍스처를 사용하기 위해 JPG 파일의 압축을 완전히 풀어야 하는데, 이 텍스처는 1024x1024당 약 4에서 6MB 정도의 메모리를 사용합니다.

대다수의 Three.js 앱은 자원을 한 번 불러오면 페이지가 닫히기 전까지 해당 자원을 버릴 일이 없습니다. 하지만 시간이 지남에 따라 데이터를 바꿔야 한다면 어떨까요?

Three.js는 자바스크립트와 달리 할당한 메모리를 알아서 비우지 못합니다. 페이지를 전환하는 경우야 브라우저가 알아서 해당 자원을 메모리에서 지우겠지만, 그 밖의 경우 메모리 해제는 전적으로 개발자에게 달렸습니다.

Three.js에서는 [textures](threejs-textures.html), [geometries](threejs-primitives.html), [materials](threejs-materials.html)의 `dispose` 메서드를 호출해 메모리를 해제할 수 있습니다.

가장 간단한 방법은 일일이 호출하는 겁니다. 초기화 시에 아래와 같이 지원을 메모리에 할당하고

```js
const boxGeometry = new THREE.BoxBufferGeometry(...);
const boxTexture = textureLoader.load(...);
const boxMaterial = new THREE.MeshPhongMaterial({ map: texture });
```

아래와 같이 직접 메서드를 호출해 메모리를 해제할 수 있죠.

```js
boxGeometry.dispose();
boxTexture.dispose();
boxMaterial.dispose();
```

하지만 자원이 많아질수록 코드는 지저분해질 겁니다.

자원을 추적하는 클래스를 하나 만드는 게 좋겠네요. 클래스에 자원을 지정하고 한 번에 버리도록 해보겠습니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose) {
      this.resources.add(resource);
    }
    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
      resource.dispose();
    }
    this.resources.clear();
  }
}
```

[텍스처에 관한 글](threejs-textures.html)의 첫 번째 예제에 이 클래스를 써 봅시다. 먼저 클래스의 인스턴스를 만듭니다.

```js
const resTracker = new ResourceTracker();
```

좀 더 간단한 형태로 쓰기 위해 `track` 메서드를 함수로 만듭니다.

```js
const resTracker = new ResourceTracker();
+const track = resTracker.track.bind(resTracker);
```

그리고 각 geometry, 텍스처, 재질(material)에 `track` 함수를 호출합니다.

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
-const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
+const geometry = track(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth));

const cubes = [];  // 정육면체를 회전시키기 위한 배열
const loader = new THREE.TextureLoader();

-const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
-});
+const material = track(new THREE.MeshBasicMaterial({
+  map: track(loader.load('resources/images/wall.jpg')),
+}));
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
```

자원을 해제할 때 정육면체를 장면에서 제거하고 `resTracker.dispose` 메서드를 호출하도록 합니다.

```js
for (const cube of cubes) {
  scene.remove(cube);
}
cubes.length = 0;  // 정육면체 배열을 비웁니다
resTracker.dispose();
```

하지만 실제로 테스트해보니 귀찮은 작업을 추가해야 합니다. `ResourceTracker`에 코드를 추가하겠습니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
-    if (resource.dispose) {
+    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    return resource;
  }
  untrack(resource) {
    this.resources.delete(resource);
  }
  dispose() {
    for (const resource of this.resources) {
-      resource.dispose();
+      if (resource instanceof THREE.Object3D) {
+        if (resource.parent) {
+          resource.parent.remove(resource);
+        }
+      }
+      if (resource.dispose) {
+        resource.dispose();
+      }
+    }
    this.resources.clear();
  }
}
```

이제 정육면체를 추적할 수 있습니다.

```js
const material = track(new THREE.MeshBasicMaterial({
  map: track(loader.load('resources/images/wall.jpg')),
}));
const cube = track(new THREE.Mesh(geometry, material));
scene.add(cube);
cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
```

별도로 정육면체를 제거해야할 필요가 없으니 코드를 삭제합니다.

```js
-for (const cube of cubes) {
-  scene.remove(cube);
-}
cubes.length = 0;  // 정육면체 배열을 비웁니다
resTracker.dispose();
```

코드를 정리해 정육면체, 텍스처, 재질을 다시 추가할 수 있도록 만들고

```js
const scene = new THREE.Scene();
*const cubes = [];  // 정육면체를 회전시키기 위한 배열

+function addStuffToScene() {
  const resTracker = new ResourceTracker();
  const track = resTracker.track.bind(resTracker);

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = track(new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth));

  const loader = new THREE.TextureLoader();

  const material = track(new THREE.MeshBasicMaterial({
    map: track(loader.load('resources/images/wall.jpg')),
  }));
  const cube = track(new THREE.Mesh(geometry, material));
  scene.add(cube);
  cubes.push(cube);  // 회전 애니메이션을 위해 배열에 추가
+  return resTracker;
+}
```

시간에 지남에 따라 물체들을 사라지고 나타나게 합니다.

```js
function waitSeconds(seconds = 0) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function process() {
  for (;;) {
    const resTracker = addStuffToScene();
    await wait(2);
    cubes.length = 0;  // 정육면체 배열을 비웁니다
    resTracker.dispose();
    await wait(1);
  }
}
process();
```

아래 예제는 정육면체, 텍스처, 재질을 렌더링한 뒤 2초 후에 해당 자원을 버리고, 다시 1초 후에 생성하기를 반복합니다.

{{{example url="../threejs-cleanup-simple.html" }}}

딱히 오류는 없네요.

불러온 파일을 해제하려면 코드를 좀 더 추가해야 합니다. Three.js의 로더는 대부분 최상위 `Object3D`만을 반환하기에 어떤 자원을 사용했는지 체크하려면 일일이 하위 요소를 뒤져봐야 합니다.

`ResourceTracker`를 업데이트해 저 역할을 맡겨보죠.

먼저 자원이 `Object3D`인지 확인해 해당 요소의 geometry, 재질, 하위 요소를 추적하도록 합니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
+    if (resource instanceof THREE.Object3D) {
+      this.track(resource.geometry);
+      this.track(resource.material);
+      this.track(resource.children);
+    }
    return resource;
  }
  ...
}
```

그리고 `resource.geometry`, `resource.material`, `resource.children`이 null이나 undefined일 수 있으므로 `track` 메서드 상단에서 체크해줍니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
+    if (!resource) {
+      return resource;
+    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
    }
    return resource;
  }
  ...
}
```

`resource.children`이나 `resource.material`은 배열 형식일 수 있습니다. 배열일 경우 배열의 요소를 추적하도록 합니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (!resource) {
      return resource;
    }

+    // 하위 요소 또는 재질이 배열일 경우
+    if (Array.isArray(resource)) {
+      resource.forEach(resource => this.track(resource));
+      return resource;
+    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
    }
    return resource;
  }
  ...
}
```

그리고 재질의 속성 중 텍스처와 균등 변수(uniform)를 처리해줍니다.

```js
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (!resource) {
      return resource;
    }

*    // 하위 요소 또는 재질이 배열일 경우,
*    // 균등 변수가 텍스처 배열일 경우
    if (Array.isArray(resource)) {
      resource.forEach(resource => this.track(resource));
      return resource;
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
-    }
+    } else if (resource instanceof THREE.Material) {
+      // 재질에 텍스처가 있는지 검사해 추적합니다.
+      for (const value of Object.values(resource)) {
+        if (value instanceof THREE.Texture) {
+          this.track(value);
+        }
+      }
+      // 균등 변수가 텍스처 또는 텍스처의 배열인지 체크합니다.
+      if (resource.uniforms) {
+        for (const value of Object.values(resource.uniforms)) {
+          if (value) {
+            const uniformValue = value.value;
+            if (uniformValue instanceof THREE.Texture ||
+                Array.isArray(uniformValue)) {
+              this.track(uniformValue);
+            }
+          }
+        }
+      }
+    }
    return resource;
  }
  ...
}
```

수정한 클래스를 [glTF 파일 불러오기](threejs-load-gltf.html)에서 썼던 예제에 적용해 무료 glTF 파일을 불러와보도록 합시다.

```js
const gltfLoader = new GLTFLoader();
function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, resolve, undefined, reject);
  });
}

function waitSeconds(seconds = 0) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const fileURLs = [
  'resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf',
  'resources/models/3dbustchallange_submission/scene.gltf',
  'resources/models/mountain_landscape/scene.gltf',
  'resources/models/simple_house_scene/scene.gltf',
];

async function loadFiles() {
  for (;;) {
    for (const url of fileURLs) {
      const resMgr = new ResourceTracker();
      const track = resMgr.track.bind(resMgr);
      const gltf = await loadGLTF(url);
      const root = track(gltf.scene);
      scene.add(root);

      // 해당 요소의 모든 하위 물체를 포함하는 육면체를 계산합니다.
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // 카메라가 화면을 전부 담도록 설정합니다.
      frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

      await waitSeconds(2);
      renderer.render(scene, camera);

      resMgr.dispose();

      await waitSeconds(1);

    }
  }
}
loadFiles();
```

{{{example url="../threejs-cleanup-loaded-files.html"}}}

코드에 대해 몇 가지 설명하고 끝내겠습니다.

만약 2개 이상의 파일을 한 번에 불러오고 나중에 따로 해제하려면 `ResourceTracker`를 파일별로 생성하면 됩니다.

위 예제에서는 `gltf.scene`에만 `track` 메서드를 사용했습니다. 이것만으로 지금 `ResourceTracker`는 포함된 모든 요소를 추적하겠죠. 화면에 뭔가를 더 추가하려면 해당 자원을 추적할지 말지를 먼저 결정해야 합니다.

특정 도구를 캐릭터의 자식 요소로 추가해 손에 쥐어 주는 경우를 예로 들 수 있습니다. 그냥 도구만 추가해서는 해당 요소를 추적할 수 없을 테니까요. 모르긴 해도 꽤나 흔한 경우일 거라 생각합니다.

처음에 `ResourceTracker`를 작성했을 때는 모든 것을 `track`이 아니라 `dispose` 메서드 안에서 해결하려고 했습니다. 하지만 캐릭터의 손에 도구를 쥐어 주는 경우를 생각해보니 `track`을 통해 등록한 자원을 해제하는 게 확장성 면에서도 그렇고 더 나은 방법 같더군요. 씬 그래프 전체를 해제시키는 것보다는 불러온 파일만 해제시키는 게 나을 테니까요.

`ResourceTracker`를 만들긴 했지만 100% 만족스럽진 않습니다. 3D 엔진에서 자원을 이런 식으로 관리하는 건 흔한 일이 아니거든요. 어떤 자원이 올라올지 추측하는 게 아니라 미리 알고 있어야 하는 쪽이 맞습니다. Three.js의 파일 로더가 불러온 자원의 주소값을 전부 반환하도록 바뀐다면 좋겠지만, 지금은 장면(scene)을 불러올 때 다른 선택지가 없기에 이 해결책이 최선이겠죠.

이 예시가 Three.js에서 자원을 해제하는 데 조금이나마 도움이 되었으면 합니다.
