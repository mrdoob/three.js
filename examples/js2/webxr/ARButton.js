"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.ARButton = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ARButton = /*#__PURE__*/function () {
  function ARButton() {
    _classCallCheck(this, ARButton);
  }

  _createClass(ARButton, null, [{
    key: "createButton",
    value: function createButton(renderer) {
      var sessionInit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var button = document.createElement('button');

      function showStartAR() {
        var currentSession = null;

        function onSessionStarted(session) {
          session.addEventListener('end', onSessionEnded);
          renderer.xr.setReferenceSpaceType('local');
          renderer.xr.setSession(session);
          button.textContent = 'STOP AR';
          currentSession = session;
        }

        function onSessionEnded() {
          currentSession.removeEventListener('end', onSessionEnded);
          button.textContent = 'START AR';
          currentSession = null;
        }

        button.style.display = '';
        button.style.cursor = 'pointer';
        button.style.left = 'calc(50% - 50px)';
        button.style.width = '100px';
        button.textContent = 'START AR';

        button.onmouseenter = function () {
          button.style.opacity = '1.0';
        };

        button.onmouseleave = function () {
          button.style.opacity = '0.5';
        };

        button.onclick = function () {
          if (currentSession === null) {
            navigator.xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);
          } else {
            currentSession.end();
          }
        };
      }

      function disableButton() {
        button.style.display = '';
        button.style.cursor = 'auto';
        button.style.left = 'calc(50% - 75px)';
        button.style.width = '150px';
        button.onmouseenter = null;
        button.onmouseleave = null;
        button.onclick = null;
      }

      function showARNotSupported() {
        disableButton();
        button.textContent = 'AR NOT SUPPORTED';
      }

      function stylizeElement(element) {
        element.style.position = 'absolute';
        element.style.bottom = '20px';
        element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = 'rgba(0,0,0,0.1)';
        element.style.color = '#fff';
        element.style.font = 'normal 13px sans-serif';
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';
      }

      if ('xr' in navigator) {
        button.id = 'ARButton';
        button.style.display = 'none';
        stylizeElement(button);
        navigator.xr.isSessionSupported('immersive-ar').then(function (supported) {
          supported ? showStartAR() : showARNotSupported();
        })["catch"](showARNotSupported);
        return button;
      } else {
        var message = document.createElement('a');

        if (window.isSecureContext === false) {
          message.href = document.location.href.replace(/^http:/, 'https:');
          message.innerHTML = 'WEBXR NEEDS HTTPS';
        } else {
          message.href = 'https://immersiveweb.dev/';
          message.innerHTML = 'WEBXR NOT AVAILABLE';
        }

        message.style.left = 'calc(50% - 90px)';
        message.style.width = '180px';
        message.style.textDecoration = 'none';
        stylizeElement(message);
        return message;
      }
    }
  }]);

  return ARButton;
}();

THREE.ARButton = ARButton;