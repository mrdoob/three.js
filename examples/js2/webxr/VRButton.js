"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.VRButton = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VRButton = /*#__PURE__*/function () {
  function VRButton() {
    _classCallCheck(this, VRButton);
  }

  _createClass(VRButton, null, [{
    key: "createButton",
    value: function createButton(renderer, options) {
      if (options) {
        console.error('THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.');
      }

      var button = document.createElement('button');

      function showEnterVR() {
        var currentSession = null;

        function onSessionStarted(session) {
          session.addEventListener('end', onSessionEnded);
          renderer.xr.setSession(session);
          button.textContent = 'EXIT VR';
          currentSession = session;
        }

        function onSessionEnded() {
          currentSession.removeEventListener('end', onSessionEnded);
          button.textContent = 'ENTER VR';
          currentSession = null;
        }

        button.style.display = '';
        button.style.cursor = 'pointer';
        button.style.left = 'calc(50% - 50px)';
        button.style.width = '100px';
        button.textContent = 'ENTER VR';

        button.onmouseenter = function () {
          button.style.opacity = '1.0';
        };

        button.onmouseleave = function () {
          button.style.opacity = '0.5';
        };

        button.onclick = function () {
          if (currentSession === null) {
            var sessionInit = {
              optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
            };
            navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
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

      function showWebXRNotFound() {
        disableButton();
        button.textContent = 'VR NOT SUPPORTED';
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
        button.id = 'VRButton';
        button.style.display = 'none';
        stylizeElement(button);
        navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
          supported ? showEnterVR() : showWebXRNotFound();
        });
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

  return VRButton;
}();

THREE.VRButton = VRButton;