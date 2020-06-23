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

압축을 푼 경로를 지정하고, "Start" 버튼을 클릭합니다. 

Just point it at the folder where you unzipped the files, click "Start", then go to
in your browser [`http://localhost:8080/`](http://localhost:8080/) or if you'd
like to browse the samples go to [`http://localhost:8080/threejs`](http://localhost:8080/threejs).

To stop serving pick stop or quit Servez.

If you prefer the command line (I do), another way is to use [node.js](https://nodejs.org).
Download it, install it, then open a command prompt / console / terminal window. If you're on Windows the installer will add a special "Node Command Prompt" so use that.

Then install the [`servez`](https://github.com/greggman/servez-cli) by typing

    npm -g install servez

If you're on OSX use

    sudo npm -g install servez

Once you've done that type

    servez path/to/folder/where/you/unzipped/files

Or if you're like me

    cd path/to/folder/where/you/unzipped/files
    servez

It should print something like

{{{image url="resources/servez-response.png" }}}

Then in your browser go to [`http://localhost:8080/`](http://localhost:8080/).

If you don't specify a path then servez will serve the current folder.

If either of those options are not to your liking
[there are many other simple servers to choose from](https://stackoverflow.com/questions/12905426/what-is-a-faster-alternative-to-pythons-servez-or-simplehttpserver).

Now that you have a server setup we can move on to [textures](threejs-textures.html).
