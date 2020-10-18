"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.fetchProfile = fetchProfile;
THREE.fetchProfilesList = fetchProfilesList;
THREE.MotionController = THREE.Constants = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Constants = {
  Handedness: Object.freeze({
    NONE: 'none',
    LEFT: 'left',
    RIGHT: 'right'
  }),
  ComponentState: Object.freeze({
    DEFAULT: 'default',
    TOUCHED: 'touched',
    PRESSED: 'pressed'
  }),
  ComponentProperty: Object.freeze({
    BUTTON: 'button',
    X_AXIS: 'xAxis',
    Y_AXIS: 'yAxis',
    STATE: 'state'
  }),
  ComponentType: Object.freeze({
    TRIGGER: 'trigger',
    SQUEEZE: 'squeeze',
    TOUCHPAD: 'touchpad',
    THUMBSTICK: 'thumbstick',
    BUTTON: 'button'
  }),
  ButtonTouchThreshold: 0.05,
  AxisTouchThreshold: 0.1,
  VisualResponseProperty: Object.freeze({
    TRANSFORM: 'transform',
    VISIBILITY: 'visibility'
  })
};
THREE.Constants = Constants;

function fetchJsonFile(_x) {
  return _fetchJsonFile.apply(this, arguments);
}

function _fetchJsonFile() {
  _fetchJsonFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(path) {
    var response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fetch(path);

          case 2:
            response = _context.sent;

            if (response.ok) {
              _context.next = 7;
              break;
            }

            throw new Error(response.statusText);

          case 7:
            return _context.abrupt("return", response.json());

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _fetchJsonFile.apply(this, arguments);
}

function fetchProfilesList(_x2) {
  return _fetchProfilesList.apply(this, arguments);
}

function _fetchProfilesList() {
  _fetchProfilesList = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(basePath) {
    var profileListFileName, profilesList;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (basePath) {
              _context2.next = 2;
              break;
            }

            throw new Error('No basePath supplied');

          case 2:
            profileListFileName = 'profilesList.json';
            _context2.next = 5;
            return fetchJsonFile("".concat(basePath, "/").concat(profileListFileName));

          case 5:
            profilesList = _context2.sent;
            return _context2.abrupt("return", profilesList);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _fetchProfilesList.apply(this, arguments);
}

function fetchProfile(_x3, _x4) {
  return _fetchProfile.apply(this, arguments);
}

function _fetchProfile() {
  _fetchProfile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(xrInputSource, basePath) {
    var defaultProfile,
        getAssetPath,
        supportedProfilesList,
        match,
        supportedProfile,
        profile,
        assetPath,
        layout,
        _args3 = arguments;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            defaultProfile = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : null;
            getAssetPath = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : true;

            if (xrInputSource) {
              _context3.next = 4;
              break;
            }

            throw new Error('No xrInputSource supplied');

          case 4:
            if (basePath) {
              _context3.next = 6;
              break;
            }

            throw new Error('No basePath supplied');

          case 6:
            _context3.next = 8;
            return fetchProfilesList(basePath);

          case 8:
            supportedProfilesList = _context3.sent;
            xrInputSource.profiles.some(function (profileId) {
              var supportedProfile = supportedProfilesList[profileId];

              if (supportedProfile) {
                match = {
                  profileId: profileId,
                  profilePath: "".concat(basePath, "/").concat(supportedProfile.path),
                  deprecated: !!supportedProfile.deprecated
                };
              }

              return !!match;
            });

            if (match) {
              _context3.next = 17;
              break;
            }

            if (defaultProfile) {
              _context3.next = 13;
              break;
            }

            throw new Error('No matching profile name found');

          case 13:
            supportedProfile = supportedProfilesList[defaultProfile];

            if (supportedProfile) {
              _context3.next = 16;
              break;
            }

            throw new Error("No matching profile name found and default profile \"".concat(defaultProfile, "\" missing."));

          case 16:
            match = {
              profileId: defaultProfile,
              profilePath: "".concat(basePath, "/").concat(supportedProfile.path),
              deprecated: !!supportedProfile.deprecated
            };

          case 17:
            _context3.next = 19;
            return fetchJsonFile(match.profilePath);

          case 19:
            profile = _context3.sent;

            if (!getAssetPath) {
              _context3.next = 25;
              break;
            }

            if (xrInputSource.handedness === 'any') {
              layout = profile.layouts[Object.keys(profile.layouts)[0]];
            } else {
              layout = profile.layouts[xrInputSource.handedness];
            }

            if (layout) {
              _context3.next = 24;
              break;
            }

            throw new Error("No matching handedness, ".concat(xrInputSource.handedness, ", in profile ").concat(match.profileId));

          case 24:
            if (layout.assetPath) {
              assetPath = match.profilePath.replace('profile.json', layout.assetPath);
            }

          case 25:
            return _context3.abrupt("return", {
              profile: profile,
              assetPath: assetPath
            });

          case 26:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _fetchProfile.apply(this, arguments);
}

var defaultComponentValues = {
  xAxis: 0,
  yAxis: 0,
  button: 0,
  state: Constants.ComponentState.DEFAULT
};

function normalizeAxes() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var xAxis = x;
  var yAxis = y;
  var hypotenuse = Math.sqrt(x * x + y * y);

  if (hypotenuse > 1) {
    var theta = Math.atan2(y, x);
    xAxis = Math.cos(theta);
    yAxis = Math.sin(theta);
  }

  var result = {
    normalizedXAxis: xAxis * 0.5 + 0.5,
    normalizedYAxis: yAxis * 0.5 + 0.5
  };
  return result;
}

var VisualResponse = /*#__PURE__*/function () {
  function VisualResponse(visualResponseDescription) {
    _classCallCheck(this, VisualResponse);

    this.componentProperty = visualResponseDescription.componentProperty;
    this.states = visualResponseDescription.states;
    this.valueNodeName = visualResponseDescription.valueNodeName;
    this.valueNodeProperty = visualResponseDescription.valueNodeProperty;

    if (this.valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
      this.minNodeName = visualResponseDescription.minNodeName;
      this.maxNodeName = visualResponseDescription.maxNodeName;
    }

    this.value = 0;
    this.updateFromComponent(defaultComponentValues);
  }

  _createClass(VisualResponse, [{
    key: "updateFromComponent",
    value: function updateFromComponent(_ref) {
      var xAxis = _ref.xAxis,
          yAxis = _ref.yAxis,
          button = _ref.button,
          state = _ref.state;

      var _normalizeAxes = normalizeAxes(xAxis, yAxis),
          normalizedXAxis = _normalizeAxes.normalizedXAxis,
          normalizedYAxis = _normalizeAxes.normalizedYAxis;

      switch (this.componentProperty) {
        case Constants.ComponentProperty.X_AXIS:
          this.value = this.states.includes(state) ? normalizedXAxis : 0.5;
          break;

        case Constants.ComponentProperty.Y_AXIS:
          this.value = this.states.includes(state) ? normalizedYAxis : 0.5;
          break;

        case Constants.ComponentProperty.BUTTON:
          this.value = this.states.includes(state) ? button : 0;
          break;

        case Constants.ComponentProperty.STATE:
          if (this.valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) {
            this.value = this.states.includes(state);
          } else {
            this.value = this.states.includes(state) ? 1.0 : 0.0;
          }

          break;

        default:
          throw new Error("Unexpected visualResponse componentProperty ".concat(this.componentProperty));
      }
    }
  }]);

  return VisualResponse;
}();

var Component = /*#__PURE__*/function () {
  function Component(componentId, componentDescription) {
    var _this = this;

    _classCallCheck(this, Component);

    if (!componentId || !componentDescription || !componentDescription.visualResponses || !componentDescription.gamepadIndices || Object.keys(componentDescription.gamepadIndices).length === 0) {
      throw new Error('Invalid arguments supplied');
    }

    this.id = componentId;
    this.type = componentDescription.type;
    this.rootNodeName = componentDescription.rootNodeName;
    this.touchPointNodeName = componentDescription.touchPointNodeName;
    this.visualResponses = {};
    Object.keys(componentDescription.visualResponses).forEach(function (responseName) {
      var visualResponse = new VisualResponse(componentDescription.visualResponses[responseName]);
      _this.visualResponses[responseName] = visualResponse;
    });
    this.gamepadIndices = Object.assign({}, componentDescription.gamepadIndices);
    this.values = {
      state: Constants.ComponentState.DEFAULT,
      button: this.gamepadIndices.button !== undefined ? 0 : undefined,
      xAxis: this.gamepadIndices.xAxis !== undefined ? 0 : undefined,
      yAxis: this.gamepadIndices.yAxis !== undefined ? 0 : undefined
    };
  }

  _createClass(Component, [{
    key: "updateFromGamepad",
    value: function updateFromGamepad(gamepad) {
      var _this2 = this;

      this.values.state = Constants.ComponentState.DEFAULT;

      if (this.gamepadIndices.button !== undefined && gamepad.buttons.length > this.gamepadIndices.button) {
        var gamepadButton = gamepad.buttons[this.gamepadIndices.button];
        this.values.button = gamepadButton.value;
        this.values.button = this.values.button < 0 ? 0 : this.values.button;
        this.values.button = this.values.button > 1 ? 1 : this.values.button;

        if (gamepadButton.pressed || this.values.button === 1) {
          this.values.state = Constants.ComponentState.PRESSED;
        } else if (gamepadButton.touched || this.values.button > Constants.ButtonTouchThreshold) {
          this.values.state = Constants.ComponentState.TOUCHED;
        }
      }

      if (this.gamepadIndices.xAxis !== undefined && gamepad.axes.length > this.gamepadIndices.xAxis) {
        this.values.xAxis = gamepad.axes[this.gamepadIndices.xAxis];
        this.values.xAxis = this.values.xAxis < -1 ? -1 : this.values.xAxis;
        this.values.xAxis = this.values.xAxis > 1 ? 1 : this.values.xAxis;

        if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.xAxis) > Constants.AxisTouchThreshold) {
          this.values.state = Constants.ComponentState.TOUCHED;
        }
      }

      if (this.gamepadIndices.yAxis !== undefined && gamepad.axes.length > this.gamepadIndices.yAxis) {
        this.values.yAxis = gamepad.axes[this.gamepadIndices.yAxis];
        this.values.yAxis = this.values.yAxis < -1 ? -1 : this.values.yAxis;
        this.values.yAxis = this.values.yAxis > 1 ? 1 : this.values.yAxis;

        if (this.values.state === Constants.ComponentState.DEFAULT && Math.abs(this.values.yAxis) > Constants.AxisTouchThreshold) {
          this.values.state = Constants.ComponentState.TOUCHED;
        }
      }

      Object.values(this.visualResponses).forEach(function (visualResponse) {
        visualResponse.updateFromComponent(_this2.values);
      });
    }
  }, {
    key: "data",
    get: function get() {
      var data = _objectSpread({
        id: this.id
      }, this.values);

      return data;
    }
  }]);

  return Component;
}();

var MotionController = /*#__PURE__*/function () {
  function MotionController(xrInputSource, profile, assetUrl) {
    var _this3 = this;

    _classCallCheck(this, MotionController);

    if (!xrInputSource) {
      throw new Error('No xrInputSource supplied');
    }

    if (!profile) {
      throw new Error('No profile supplied');
    }

    this.xrInputSource = xrInputSource;
    this.assetUrl = assetUrl;
    this.id = profile.profileId;
    this.layoutDescription = profile.layouts[xrInputSource.handedness];
    this.components = {};
    Object.keys(this.layoutDescription.components).forEach(function (componentId) {
      var componentDescription = _this3.layoutDescription.components[componentId];
      _this3.components[componentId] = new Component(componentId, componentDescription);
    });
    this.updateFromGamepad();
  }

  _createClass(MotionController, [{
    key: "updateFromGamepad",
    value: function updateFromGamepad() {
      var _this4 = this;

      Object.values(this.components).forEach(function (component) {
        component.updateFromGamepad(_this4.xrInputSource.gamepad);
      });
    }
  }, {
    key: "gripSpace",
    get: function get() {
      return this.xrInputSource.gripSpace;
    }
  }, {
    key: "targetRaySpace",
    get: function get() {
      return this.xrInputSource.targetRaySpace;
    }
  }, {
    key: "data",
    get: function get() {
      var data = [];
      Object.values(this.components).forEach(function (component) {
        data.push(component.data);
      });
      return data;
    }
  }]);

  return MotionController;
}();

THREE.MotionController = MotionController;