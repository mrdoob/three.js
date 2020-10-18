"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CodeSerializationInstruction = THREE.CodeSerializer = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var CodeSerializer = {
  serializeClass: function serializeClass(targetPrototype, targetPrototypeInstance, basePrototypeName, overrideFunctions) {
    var objectPart, constructorString, i, funcInstructions, funcTemp;
    var fullObjectName = targetPrototypeInstance.constructor.name;
    var prototypeFunctions = [];
    var objectProperties = [];
    var objectFunctions = [];
    var isExtended = basePrototypeName !== null && basePrototypeName !== undefined;
    if (!Array.isArray(overrideFunctions)) overrideFunctions = [];

    for (var name in targetPrototype.prototype) {
      objectPart = targetPrototype.prototype[name];
      funcInstructions = new CodeSerializationInstruction(name, fullObjectName + '.prototype.' + name);
      funcInstructions.setCode(objectPart.toString());

      if (name === 'constructor') {
        if (!funcInstructions.isRemoveCode()) {
          constructorString = fullObjectName + ' = ' + funcInstructions.getCode() + ';\n\n';
        }
      } else if (typeof objectPart === 'function') {
        funcTemp = overrideFunctions[name];

        if (funcTemp instanceof CodeSerializationInstruction && funcTemp.getName() === funcInstructions.getName()) {
          funcInstructions = funcTemp;
        }

        if (!funcInstructions.isRemoveCode()) {
          if (isExtended) {
            prototypeFunctions.push(funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n\n');
          } else {
            prototypeFunctions.push('\t' + funcInstructions.getName() + ': ' + funcInstructions.getCode() + ',\n\n');
          }
        }
      }
    }

    for (var _name in targetPrototype) {
      objectPart = targetPrototype[_name];
      funcInstructions = new CodeSerializationInstruction(_name, fullObjectName + '.' + _name);

      if (typeof objectPart === 'function') {
        funcTemp = overrideFunctions[_name];

        if (funcTemp instanceof CodeSerializationInstruction && funcTemp.getName() === funcInstructions.getName()) {
          funcInstructions = funcTemp;
        } else {
          funcInstructions.setCode(objectPart.toString());
        }

        if (!funcInstructions.isRemoveCode()) {
          objectFunctions.push(funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n\n');
        }
      } else {
        if (typeof objectPart === 'string' || objectPart instanceof String) {
          funcInstructions.setCode('\"' + objectPart.toString() + '\"');
        } else if (_typeof(objectPart) === 'object') {
          console.log('Omitting object "' + funcInstructions.getName() + '" and replace it with empty object.');
          funcInstructions.setCode("{}");
        } else {
          funcInstructions.setCode(objectPart);
        }

        if (!funcInstructions.isRemoveCode()) {
          objectProperties.push(funcInstructions.getFullName() + ' = ' + funcInstructions.getCode() + ';\n');
        }
      }
    }

    var objectString = constructorString + '\n\n';

    if (isExtended) {
      objectString += fullObjectName + '.prototype = Object.create( ' + basePrototypeName + '.prototype );\n';
    }

    objectString += fullObjectName + '.prototype.constructor = ' + fullObjectName + ';\n';
    objectString += '\n\n';

    for (i = 0; i < objectProperties.length; i++) {
      objectString += objectProperties[i];
    }

    objectString += '\n\n';

    for (i = 0; i < objectFunctions.length; i++) {
      objectString += objectFunctions[i];
    }

    objectString += '\n\n';

    if (isExtended) {
      for (i = 0; i < prototypeFunctions.length; i++) {
        objectString += prototypeFunctions[i];
      }
    } else {
      objectString += fullObjectName + '.prototype = {\n\n';

      for (i = 0; i < prototypeFunctions.length; i++) {
        objectString += prototypeFunctions[i];
      }

      objectString += '\n};';
    }

    objectString += '\n\n';
    return objectString;
  }
};
THREE.CodeSerializer = CodeSerializer;

var CodeSerializationInstruction = function CodeSerializationInstruction(name, fullName) {
  this.name = name;
  this.fullName = fullName;
  this.code = null;
  this.removeCode = false;
};

THREE.CodeSerializationInstruction = CodeSerializationInstruction;
CodeSerializationInstruction.prototype = {
  constructor: CodeSerializationInstruction,
  getName: function getName() {
    return this.name;
  },
  getFullName: function getFullName() {
    return this.fullName;
  },
  setCode: function setCode(code) {
    this.code = code;
    return this;
  },
  getCode: function getCode() {
    return this.code;
  },
  setRemoveCode: function setRemoveCode(removeCode) {
    this.removeCode = removeCode;
    return this;
  },
  isRemoveCode: function isRemoveCode() {
    return this.removeCode;
  }
};