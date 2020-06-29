Title: Three.js 개발 환경 구성하기
Description: Three.js의 개발 환경을 구성해봅니다
TOC: 개발 환경

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


Three.js의 다른 요소를 더 살펴보기 전에, 개발 환경을 구축하는 방법에 대해
알아보겠습니다. WebGL은 보안 때문에 기본적으로 로컬 파일을 직접 가져다 쓸
수 없습니다. 말인즉 실제 프로젝트를 배포/테스트하려면 웹 서버를 써야한다는
이야기죠. 다행히도 웹 서버 관련 라이브러리는 굉장히 많고, 사용하기도 쉽습니다.

먼저 서버에 올릴 예시를 준비해야 합니다. 원한다면 [이 사이트 전체를 다운](https://github.com/gfxfundamentals/threejsfundamentals/archive/gh-pages.zip)
받을 수도 있죠. 다운 받은 뒤에는 압축 프로그램으로 압축을 풀어주세요.

다음으로 간단한 웹 서버를 하나 다운 받습니다.

만약 UI가 있는 웹 서버를 찾는다면
[Servez](https://greggman.github.io/servez)를 추천합니다.

{{{image url="resources/servez.gif" className="border" }}}

압축을 푼 경로를 지정하고, "Start" 버튼을 클릭하세요. 그런 다음
[`http://localhost:8080/`](http://localhost:8080/)로 이동하기만
하면 됩니다. 만약 예제를 보고 싶다면 [`http://localhost:8080/threejs`](http://localhost:8080/threejs)로
이동하세요.

서버를 중지하려면 Servez를 멈추거나 종료하면 됩니다.

만약 CLI(Command Line Interface, 명령 줄 인터페이스)를 선호한다면(전 선호합니다)
[node.js](https://nodejs.org)를 써도 좋습니다. 다운 받아 설치한 다음 프롬프트 /
콘솔 / 터미널 창을 엽니다. 윈도우를 사용한다면 설치 마법사가 "Node Command Prompt"를
추가할 테니 그걸 사용해도 좋습니다.

창을 띄웠으면 [`servez`](https://github.com/greggman/servez-cli)를 설치합니다.

    npm -g install servez

OS X를 사용한다면 다음과 같이 설치할 수 있습니다.

    sudo npm -g install servez

설치가 완료되면 다음과 같이 Servez를 실행합니다.

    servez path/to/folder/where/you/unzipped/files

사족이지만, 다음처럼 쓸 수도 있죠.

    cd path/to/folder/where/you/unzipped/files
    servez

정상적으로 작동했다면 다음과 같은 메시지가 뜰 겁니다.

{{{image url="resources/servez-response.png" }}}

다음으로 브라우저에서 [`http://localhost:8080/`](http://localhost:8080/)로
접속하세요. 경로를 지정하지 않으면 현재 경로를 서버의 ROOT 경로로 사용합니다.

만약 Servez가 마음에 들지 않는다면, [다른 간단한 웹 서버](https://stackoverflow.com/questions/12905426/what-is-a-faster-alternative-to-pythons-servez-or-simplehttpserver)를 사용해도 좋습니다.

이제 개발 환경을 갖추었으니, [텍스처](threejs-textures.html)에 대해 알아봅시다.
