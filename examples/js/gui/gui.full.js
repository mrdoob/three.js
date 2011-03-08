var GUI = function() {

    var _this = this;
    
    var MIN_WIDTH = 240;
    var MAX_WIDTH = 500;
    
    var controllers = [];
    var listening = [];
    
    var autoListen = true;
    
    var listenInterval;
    
    // Sum total of heights of controllers in this gui
    var controllerHeight;
    
    var curControllerContainerHeight = 0;

    var _this = this;

    var open = false;
    var width = 280;

    // Prevents checkForOverflow bug in which loaded gui appearance
    // settings are not respected by presence of scrollbar.
    var explicitOpenHeight = false;

    // How big we get when we open
    var openHeight;
    
    var name;
    
    var resizeTo = 0;
    var resizeTimeout;
    
    this.domElement = document.createElement('div');
    this.domElement.setAttribute('class', 'guidat');
    this.domElement.style.width = width+'px';

    var controllerContainer = document.createElement('div');
    controllerContainer.setAttribute('class', 'guidat-controllers');
    
    // Firefox hack to prevent horizontal scrolling
    controllerContainer.addEventListener('DOMMouseScroll', function(e) {
        
        var scrollAmount = this.scrollTop;
        
        if (e.wheelDelta) {
            scrollAmount+=e.wheelDelta; 
        } else if (e.detail) {
            scrollAmount+=e.detail;
        }
            
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
        
        controllerContainer.scrollTop = scrollAmount;
        
    }, false);
    
    controllerContainer.style.height = '0px';

    var toggleButton = document.createElement('a');
    toggleButton.setAttribute('class', 'guidat-toggle');
    toggleButton.setAttribute('href', '#');
    toggleButton.innerHTML = "Show Controls";
    
    var toggleDragged = false;
    var dragDisplacementY = 0;
    var togglePressed = false;
    
    var my, pmy, mx, pmx;
    
    var resize = function(e) {
        pmy = my;
        pmx = mx;
        my = e.pageY;
        mx = e.pageX;
        
        var dmy = my - pmy;
                
        if (!open) { 
            if (dmy > 0) {
                open = true;
                curControllerContainerHeight = openHeight = 1;
                toggleButton.innerHTML = name || "Hide Controls";
            } else {
                return;
            }
        }
        
        // TODO: Flip this if you want to resize to the left.
        var dmx = pmx - mx;
        
        if (dmy > 0 && 
            curControllerContainerHeight > controllerHeight) {
            var d = GUI.map(curControllerContainerHeight, controllerHeight, controllerHeight + 100, 1, 0);
            dmy *= d;
        }
        
        toggleDragged = true;
        dragDisplacementY += dmy;
        dragDisplacementX += dmx;
        openHeight += dmy;
        width += dmx;
        curControllerContainerHeight += dmy;
        controllerContainer.style.height = openHeight+'px';
        width = GUI.constrain(width, MIN_WIDTH, MAX_WIDTH);
        _this.domElement.style.width = width+'px';
        checkForOverflow();
    };
    
    toggleButton.addEventListener('mousedown', function(e) {
        pmy = my = e.pageY;
        pmx = mx = e.pageX;
        togglePressed = true;
        e.preventDefault();
        dragDisplacementY = 0;
        dragDisplacementX = 0;
        document.addEventListener('mousemove', resize, false);
        return false;

    }, false);

    toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        return false;
    }, false);

    document.addEventListener('mouseup', function(e) {
        
        if (togglePressed && !toggleDragged) {
            _this.toggle();
        }
        
        if (togglePressed && toggleDragged) {
        
            if (dragDisplacementX == 0) {
                adaptToScrollbar();
            }
        
            if (openHeight > controllerHeight) {
            
                clearTimeout(resizeTimeout);
                openHeight = resizeTo = controllerHeight;
                beginResize();
                
            } else if (controllerContainer.children.length >= 1) {

                var singleControllerHeight = controllerContainer.children[0].offsetHeight;
                clearTimeout(resizeTimeout);
                var target = Math.round(curControllerContainerHeight/singleControllerHeight)*singleControllerHeight-1;
                resizeTo = target;
                if (resizeTo <= 0) {
                    _this.hide();
                    openHeight = singleControllerHeight*2;
                } else {
                    openHeight = resizeTo;
                    beginResize();
                }
            }
        };
        
        
        document.removeEventListener('mousemove', resize, false);
        e.preventDefault();
        toggleDragged = false;
        togglePressed = false;
        
        return false;

    }, false);
    
    this.domElement.appendChild(controllerContainer);
    this.domElement.appendChild(toggleButton);
    
    if (GUI.autoPlace) {
        if(GUI.autoPlaceContainer == null) {
            GUI.autoPlaceContainer = document.createElement('div');
            GUI.autoPlaceContainer.setAttribute("id", "guidat");
            
            document.body.appendChild(GUI.autoPlaceContainer);
        }
        GUI.autoPlaceContainer.appendChild(this.domElement);
    }
    
    this.autoListenIntervalTime = 1000/60;
    
    var createListenInterval = function() {
        listenInterval = setInterval(function() {
            _this.listen();
        }, this.autoListenIntervalTime);
    };
    
    this.__defineSetter__("autoListen", function(v) {
        autoListen = v;
        if (!autoListen) {
            clearInterval(listenInterval);
        } else { 
            if (listening.length > 0) createListenInterval();
        }
    });
    
    this.__defineGetter__("autoListen", function(v) {
        return autoListen;
    });
    
    this.listenTo = function(controller) {
        // TODO: check for duplicates
        if (listening.length == 0) {
            createListenInterval();
        }
        listening.push(controller);
    };
    
    this.unlistenTo = function(controller) {
        // TODO: test this
        for(var i = 0; i < listening.length; i++) {
            if(listening[i] == controller) listening.splice(i, 1);
        }
        if(listening.length <= 0) {
            clearInterval(listenInterval);
        }
    };
    
    this.listen = function(whoToListenTo) {
        var arr = whoToListenTo || listening;
        for (var i in arr) {
            arr[i].updateDisplay();
        }
    };
    
    this.listenAll = function() {
        this.listen(controllers);
    }
    
    this.autoListen = true;

    var alreadyControlled = function(object, propertyName) {
        for (var i in controllers) {
            if (controllers[i].object == object &&
                controllers[i].propertyName == propertyName) {
                return true;
            }
        }
        return false;
    };


    var construct = function(constructor, args) {
        function F() {
            return constructor.apply(this, args);
        }
        F.prototype = constructor.prototype;
        return new F();
    };

    this.add = function() {

        var object = arguments[0];
        var propertyName = arguments[1];

        // Have we already added this?
        if (alreadyControlled(object, propertyName)) {
        //  GUI.error("Controller for \"" + propertyName+"\" already added.");
        //  return;
        }

        var value = object[propertyName];

        // Does this value exist? Is it accessible?
        if (value == undefined) {
            GUI.error(object + " either has no property \""+propertyName+"\", or the property is inaccessible.");
            return;
        }

        var type = typeof value;
        var handler = handlerTypes[type];

        // Do we know how to deal with this data type?
        if (handler == undefined) {
            GUI.error("Cannot create controller for data type \""+type+"\"");
            return;
        }
    
        var args = [this]; // Set first arg (parent) to this 
        for (var j = 0; j < arguments.length; j++) {
            args.push(arguments[j]);
        }
    
        var controllerObject = construct(handler, args);
        
        // Were we able to make the controller?
        if (!controllerObject) {
            GUI.error("Error creating controller for \""+propertyName+"\".");
            return;
        }

        // Success.
        controllerContainer.appendChild(controllerObject.domElement);
        controllers.push(controllerObject);
        GUI.allControllers.push(controllerObject);

        // Do we have a saved value for this controller?
        if (type != "function" && 
            GUI.saveIndex < GUI.savedValues.length) {
            controllerObject.setValue(GUI.savedValues[GUI.saveIndex]);
            GUI.saveIndex++;
        }
    
        // Compute sum height of controllers.
        checkForOverflow();
        
        // Prevents checkForOverflow bug in which loaded gui appearance
        // settings are not respected by presence of scrollbar.
        if (!explicitOpenHeight) {
            openHeight = controllerHeight;
        }
        
        return controllerObject;
        
    }
    
    var checkForOverflow = function() {
        controllerHeight = 0;
        for (var i in controllers) {
            controllerHeight += controllers[i].domElement.offsetHeight;
        }
        if (controllerHeight - 1 > openHeight) {
            controllerContainer.style.overflowY = "auto";
        } else {
            controllerContainer.style.overflowY = "hidden";
        }   
    };
    
    var handlerTypes = {
        "number": GUI.NumberController,
        "string": GUI.StringController,
        "boolean": GUI.BooleanController,
        "function": GUI.FunctionController
    };
    
    var alreadyControlled = function(object, propertyName) {
        for (var i in controllers) {
            if (controllers[i].object == object &&
                controllers[i].propertyName == propertyName) {
                return true;
            }
        }
        return false;
    };
    
    var construct = function(constructor, args) {

        function F() {
            return constructor.apply(this, args);
        }
        F.prototype = constructor.prototype;
        return new F();
    };

    this.reset = function() {
        // TODO
    }

    // GUI ... GUI
    
    this.toggle = function() {
        open ? this.hide() : this.show();
    };

    this.show = function() {
        toggleButton.innerHTML = name || "Hide Controls";
        resizeTo = openHeight;
        clearTimeout(resizeTimeout);
        beginResize();
        open = true;
    }

    this.hide = function() {
        toggleButton.innerHTML = name || "Show Controls";
        resizeTo = 0;
        clearTimeout(resizeTimeout);
        beginResize();
        open = false;
    }
    
    this.name = function(n) {
        name = n;
        toggleButton.innerHTML = n;
    }
    
    // used in saveURL
    this.appearanceVars = function() {
        return [open, width, openHeight, controllerContainer.scrollTop]
    }
    
    var beginResize = function() {
        //console.log("Resizing from " + curControllerContainerHeight + " to " + resizeTo);
        curControllerContainerHeight += (resizeTo - curControllerContainerHeight)*0.6;
        if (Math.abs(curControllerContainerHeight-resizeTo) < 1) {
            curControllerContainerHeight = resizeTo;
            adaptToScrollbar();
            
        } else { 
            resizeTimeout = setTimeout(beginResize, 1000/30);
        }
        controllerContainer.style.height = Math.round(curControllerContainerHeight)+'px';
        checkForOverflow();
    }
    
    var adaptToScrollbar = function() {
        // Clears lingering slider column
        _this.domElement.style.width = (width+1)+'px';
        setTimeout(function() {
            _this.domElement.style.width = width+'px';
        }, 1);
    };
    
    // Load saved appearance:

    if (GUI.guiIndex < GUI.savedAppearanceVars.length) {

    
        width = parseInt(GUI.savedAppearanceVars[GUI.guiIndex][1]);
        _this.domElement.style.width = width+"px";
        
        openHeight = parseInt(GUI.savedAppearanceVars[GUI.guiIndex][2]);
        explicitOpenHeight = true;
        if (eval(GUI.savedAppearanceVars[GUI.guiIndex][0]) == true) {
            curControllerContainerHeight = openHeight;
            var t = GUI.savedAppearanceVars[GUI.guiIndex][3]
            
            // Hack.
            setTimeout(function() {
                controllerContainer.scrollTop = t;
            }, 0);
            
            if (GUI.scrollTop > -1) {
                document.body.scrollTop = GUI.scrollTop;
            }
            resizeTo = openHeight;
            this.show();
        }

        GUI.guiIndex++;
    }

    GUI.allGuis.push(this);

	// Add hide listener if this is the first GUI. 
	if (GUI.allGuis.length == 1) {
		window.addEventListener('keyup', function(e) {
			// Hide on "H"
			if (e.keyCode == 72) {
				GUI.toggleHide();
			}
		}, false);
	}

};

// Do not set this directly.
GUI.hidden = false;


// Static members

GUI.autoPlace = true;
GUI.autoPlaceContainer = null;
GUI.allControllers = [];
GUI.allGuis = [];


GUI.toggleHide = function() {
	if (GUI.hidden) {
		GUI.show();
	} else { 
		GUI.hide();
	}
}

GUI.show = function() {
	GUI.hidden = false;
	for (var i in GUI.allGuis) {
		GUI.allGuis[i].domElement.style.display = "block";
	}
}

GUI.hide = function() {
	GUI.hidden = true;
	for (var i in GUI.allGuis) {
		GUI.allGuis[i].domElement.style.display = "none";
	}
}

GUI.saveURL = function() {
    var url = GUI.replaceGetVar("saveString", GUI.getSaveString());
    window.location = url;
};

GUI.scrollTop = -1;

GUI.load = function(saveString) {

    //GUI.savedAppearanceVars = [];
    var vals = saveString.split(",");
    var numGuis = parseInt(vals[0]);
    GUI.scrollTop = parseInt(vals[1]);
    for (var i = 0; i < numGuis; i++) {
        var appr = vals.splice(2, 4);
        GUI.savedAppearanceVars.push(appr);
    }

    GUI.savedValues = vals.splice(2, vals.length);

};

GUI.savedValues = [];
GUI.savedAppearanceVars = [];

GUI.getSaveString = function() {

    var vals = [],
        i;

    vals.push(GUI.allGuis.length);
    vals.push(document.body.scrollTop);


    for (i in GUI.allGuis) {
        var av = GUI.allGuis[i].appearanceVars();
        for (var j = 0; j < av.length; j++) {
            vals.push(av[j]);
        }
    }

    for (i in GUI.allControllers) {

        // We don't save values for functions.
        if (GUI.allControllers[i].type == "function") {
            continue;
        }

        var v = GUI.allControllers[i].getValue();

        // Round numbers so they don't get enormous
        if (GUI.allControllers[i].type == "number") {
            v = GUI.roundToDecimal(v, 4);
        }

        vals.push(v);

    }

    return vals.join(',');

};

GUI.getVarFromURL = function(v) {

    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        if (hash == undefined) continue;
        if (hash[0] == v) {
            return hash[1];
        }
    }

    return null;

};

GUI.replaceGetVar = function(varName, val) {

    var vars = [], hash;
    var loc = window.location.href;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        if (hash == undefined) continue;
        if (hash[0] == varName) {
            return loc.replace(hash[1], val);
        }
    }

    if (window.location.href.indexOf('?') != -1) {
        return loc + "&"+varName+"="+val;
    }

    return loc+"?"+varName+"="+val;

};

GUI.saveIndex = 0;
GUI.guiIndex = 0;

GUI.showSaveString = function() {
    alert(GUI.getSaveString());
};

// Util functions

GUI.makeUnselectable = function(elem) {
    elem.onselectstart = function() { return false; };
    elem.style.MozUserSelect = "none";
    elem.style.KhtmlUserSelect = "none";
    elem.unselectable = "on";
};

GUI.makeSelectable = function(elem) {
    elem.onselectstart = function() { };
    elem.style.MozUserSelect = "auto";
    elem.style.KhtmlUserSelect = "auto";
    elem.unselectable = "off";
};

GUI.map = function(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
};

GUI.constrain = function (v, o1, o2) {
    if (v < o1) v = o1;
    else if (v > o2) v = o2;
    return v;
};

GUI.error = function(str) {
    if (typeof console.error == 'function') {
        console.error("[GUI ERROR] " + str);
    }
};

GUI.roundToDecimal = function(n, decimals) {
    var t = Math.pow(10, decimals);
    return Math.round(n*t)/t;
};

GUI.extendController = function(clazz) {
    clazz.prototype = new GUI.Controller();
    clazz.prototype.constructor = clazz;
};

if (GUI.getVarFromURL('saveString') != null) GUI.load(GUI.getVarFromURL('saveString'));
GUI.Slider = function(numberController, min, max, step, initValue) {

    var clicked = false;
    var _this = this;

    var x, px;

    this.domElement = document.createElement('div');
    this.domElement.setAttribute('class', 'guidat-slider-bg');

    this.fg = document.createElement('div');
    this.fg.setAttribute('class', 'guidat-slider-fg');

    this.domElement.appendChild(this.fg);
    
    var onDrag = function(e) {
        if (!clicked) return;
        var pos = findPos(_this.domElement);
        var val = GUI.map(e.pageX, pos[0], pos[0] + _this.domElement.offsetWidth, min, max);
        val = Math.round(val/step)*step;
        numberController.setValue(val);
    };
    
    this.domElement.addEventListener('mousedown', function(e) {
        clicked = true;
        x = px = e.pageX;
        _this.domElement.className += ' active';
        _this.fg.className += ' active';
        numberController.domElement.className += ' active';
        onDrag(e);
        document.addEventListener('mouseup', mouseup, false);
    }, false);
    
    var mouseup = function(e) { 
        _this.domElement.className = _this.domElement.className.replace(' active', '');
        _this.fg.className = _this.fg.className.replace(' active', '');
        numberController.domElement.className = numberController.domElement.className.replace(' active', '');
        clicked = false;            
        if (numberController.finishChangeFunction != null) {
            numberController.finishChangeFunction.call(this, numberController.getValue());
        }
        document.removeEventListener('mouseup', mouseup, false);
    };

    var findPos = function(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
            return [curleft,curtop];
        }
    };

    this.__defineSetter__('value', function(e) {
        var pct = GUI.map(e, min, max, 0, 100);
        this.fg.style.width = pct+"%";
    });

    var onDrag = function(e) {
        if (!clicked) return;
        var pos = findPos(_this.domElement);
        var val = GUI.map(e.pageX, pos[0], pos[0] + _this.domElement.offsetWidth, min, max);
        val = Math.round(val/step)*step;
        numberController.setValue(val);
    };

    this.domElement.addEventListener('mousedown', function(e) {
        clicked = true;
        x = px = e.pageX;
        _this.domElement.setAttribute('class', 'guidat-slider-bg active');
        _this.fg.setAttribute('class', 'guidat-slider-fg active');
        onDrag(e);
        document.addEventListener('mouseup', mouseup, false);
    }, false);

    var mouseup = function(e) {
        _this.domElement.setAttribute('class', 'guidat-slider-bg');
        _this.fg.setAttribute('class', 'guidat-slider-fg');
        clicked = false;
        if (numberController.finishChangeFunction != null) {
            numberController.finishChangeFunction.call(this, numberController.getValue());
        }
        document.removeEventListener('mouseup', mouseup, false);
    };

    document.addEventListener('mousemove', onDrag, false);

    this.value = initValue;

};
GUI.Controller = function() {

    this.parent = arguments[0];
    this.object = arguments[1];
    this.propertyName = arguments[2];

    if (arguments.length > 0) this.initialValue = this.propertyName[this.object];

    this.domElement = document.createElement('div');
    this.domElement.setAttribute('class', 'guidat-controller ' + this.type);

    this.propertyNameElement = document.createElement('span');
    this.propertyNameElement.setAttribute('class', 'guidat-propertyname');
    this.name(this.propertyName);
    this.domElement.appendChild(this.propertyNameElement);

    GUI.makeUnselectable(this.domElement);

};

GUI.Controller.prototype.changeFunction = null;
GUI.Controller.prototype.finishChangeFunction = null;

GUI.Controller.prototype.name = function(n) {
    this.propertyNameElement.innerHTML = n;
    return this;
};

GUI.Controller.prototype.reset = function() {
    this.setValue(this.initialValue);
    return this;
};

GUI.Controller.prototype.listen = function() {
    this.parent.listenTo(this);
    return this;
};

GUI.Controller.prototype.unlisten = function() {
    this.parent.unlistenTo(this); // <--- hasn't been tested yet
    return this;
};

GUI.Controller.prototype.setValue = function(n) {
    this.object[this.propertyName] = n;
    if (this.changeFunction != null) {
        this.changeFunction.call(this, n);
    }
    this.updateDisplay();
    return this;
};

GUI.Controller.prototype.getValue = function() {
    return this.object[this.propertyName];
};

GUI.Controller.prototype.updateDisplay = function() {};

GUI.Controller.prototype.onChange = function(fnc) {
    this.changeFunction = fnc;
    return this;
};

GUI.Controller.prototype.onFinishChange = function(fnc) {
    this.finishChangeFunction = fnc;
    return this;
};

GUI.Controller.prototype.options = function() {
    var _this = this;
    var select = document.createElement('select');
    if (arguments.length == 1) {
        var arr = arguments[0];
        for (var i in arr) {
            var opt = document.createElement('option');
            opt.innerHTML = i;
            opt.setAttribute('value', arr[i]);
            select.appendChild(opt);
        }
    } else {
        for (var i = 0; i < arguments.length; i++) {
            var opt = document.createElement('option');
            opt.innerHTML = arguments[i];
            opt.setAttribute('value', arguments[i]);
            select.appendChild(opt);
        }
    }

    select.addEventListener('change', function() {
        _this.setValue(this.value);
        if (_this.finishChangeFunction != null) {
            _this.finishChangeFunction.call(this, _this.getValue());
        }
    }, false);
    _this.domElement.appendChild(select);
    return this;
};
GUI.BooleanController = function() {

    this.type = "boolean";
    GUI.Controller.apply(this, arguments);

    var _this = this;
    var input = document.createElement('input');
    input.setAttribute('type', 'checkbox');

    this.domElement.addEventListener('click', function(e) {
        input.checked = !input.checked;
        e.preventDefault();
        _this.setValue(input.checked);
    }, false);

    input.addEventListener('mouseup', function(e) {
        input.checked = !input.checked; // counteracts default.
    }, false);

    this.domElement.style.cursor = "pointer";
    this.propertyNameElement.style.cursor = "pointer";
    this.domElement.appendChild(input);

    this.updateDisplay = function() {
        input.checked = _this.getValue();
    };


    this.setValue = function(val) {
        if (typeof val != "boolean") {
            try {
                val = eval(val);
            } catch (e) {}
        }
        return GUI.Controller.prototype.setValue.call(this, val);
    };

};
GUI.extendController(GUI.BooleanController);
GUI.FunctionController = function() {
    
    this.type = "function";
    
    var _this = this;
    
    GUI.Controller.apply(this, arguments);
    
    this.domElement.addEventListener('click', function() {
        _this.fire();
    }, false);
    
    this.domElement.style.cursor = "pointer";
    this.propertyNameElement.style.cursor = "pointer";
    
    var fireFunction = null;
    this.onFire = function(fnc) {
        fireFunction = fnc;
        return this;
    }
    
    this.fire = function() {
        if (fireFunction != null) {
            fireFunction.call(this);
        }
        _this.object[_this.propertyName].call(_this.object);
    };
};
GUI.extendController(GUI.FunctionController);
GUI.NumberController = function() {

    this.type = "number";

    GUI.Controller.apply(this, arguments);

    var _this = this;

    // If we simply click and release a number field, we want to highlight it.
    // This variable keeps track of whether or not we've dragged
    var draggedNumberField = false;

    var clickedNumberField = false;

    var y = 0, py = 0;

    var min = arguments[3];
    var max = arguments[4];
    var step = arguments[5];

    if (!step) {
        if (min != undefined && max != undefined) {
            step = (max-min)*0.01;
        } else {
            step = 1;
        }
    }

    var numberField = document.createElement('input');
    numberField.setAttribute('id', this.propertyName);
    numberField.setAttribute('type', 'text');
    numberField.setAttribute('value', this.getValue());

    if (step) numberField.setAttribute('step', step);

    this.domElement.appendChild(numberField);

    var slider;

    if (min != undefined && max != undefined) {
        slider = new GUI.Slider(this, min, max, step, this.getValue());
        this.domElement.appendChild(slider.domElement);
    }

    numberField.addEventListener('blur', function(e) {
        var val = parseFloat(this.value);
        if (!isNaN(val)) {
            _this.setValue(val);
        }
    }, false);

    numberField.addEventListener('mousewheel', function(e) {
        e.preventDefault();
        _this.setValue(_this.getValue() + Math.abs(e.wheelDeltaY)/e.wheelDeltaY*step);
        return false;
    }, false);

    numberField.addEventListener('mousedown', function(e) {
        py = y = e.pageY;
        clickedNumberField = true;
        document.addEventListener('mousemove', dragNumberField, false);
        document.addEventListener('mouseup', mouseup, false);
    }, false);

    // Handle up arrow and down arrow
    numberField.addEventListener('keydown', function(e) {
        var newVal;
        switch(e.keyCode) {
            case 13:    // enter
                newVal = parseFloat(this.value);
                _this.setValue(newVal);
                break;
            case 38:    // up
                newVal = _this.getValue() + step;
                _this.setValue(newVal);
                break;
            case 40:    // down
                newVal = _this.getValue() - step;
                _this.setValue(newVal);
                break;
        }
    }, false);

    var mouseup = function(e) {
        document.removeEventListener('mousemove', dragNumberField, false);
        GUI.makeSelectable(_this.parent.domElement);
        GUI.makeSelectable(numberField);
        if (clickedNumberField && !draggedNumberField) {
            numberField.focus();
            numberField.select();
        }
        if(slider) slider.domElement.className = slider.domElement.className.replace(' active', '');
        draggedNumberField = false;
        clickedNumberField = false;
        if (_this.finishChangeFunction != null) {
            _this.finishChangeFunction.call(this, _this.getValue());
        }
        document.removeEventListener('mouseup', mouseup, false);
    };

    var dragNumberField = function(e) {

        draggedNumberField = true;
        e.preventDefault();

        // We don't want to be highlighting this field as we scroll.
        // Or any other fields in this gui for that matter ...
        // TODO: Make makeUselectable go through each element and child element.

        GUI.makeUnselectable(_this.parent.domElement);
        GUI.makeUnselectable(numberField);
        
        if(slider) slider.domElement.className += ' active';
        
        py = y;
        y = e.pageY;
        var dy = py - y;
        var newVal = _this.getValue() + dy*step;
        _this.setValue(newVal);
        return false;
    };

    this.options = function() {
        _this.noSlider();
        _this.domElement.removeChild(numberField);
        return GUI.Controller.prototype.options.apply(this, arguments);
    };

    this.noSlider = function() {
        if (slider) {
            _this.domElement.removeChild(slider.domElement);
        }
        return this;
    };

    this.setValue = function(val) {

        val = parseFloat(val);

        if (min != undefined && val <= min) {
            val = min;
        } else if (max != undefined && val >= max) {
            val = max;
        }

        return GUI.Controller.prototype.setValue.call(this, val);

    };

    this.updateDisplay = function() {
        numberField.value = GUI.roundToDecimal(_this.getValue(), 4);
        if (slider) slider.value = _this.getValue();
    };
};

GUI.extendController(GUI.NumberController);
GUI.StringController = function() {

    this.type = "string";

    var _this = this;
    GUI.Controller.apply(this, arguments);

    var input = document.createElement('input');

    var initialValue = this.getValue();

    input.setAttribute('value', initialValue);
    input.setAttribute('spellcheck', 'false');

    this.domElement.addEventListener('mouseup', function() {
        input.focus();
        input.select();
    }, false);

    // TODO: getting messed up on ctrl a
    input.addEventListener('keyup', function(e) {
        if (e.keyCode == 13 && _this.finishChangeFunction != null) {
            _this.finishChangeFunction.call(this, _this.getValue());
        }
        _this.setValue(input.value);
    }, false);

    input.addEventListener('blur', function() {
        if (_this.finishChangeFunction != null) {
            _this.finishChangeFunction.call(this, _this.getValue());
        }
    }, false);

    this.updateDisplay = function() {
        input.value = _this.getValue();
    };

    this.options = function() {
        _this.domElement.removeChild(input);
        return GUI.Controller.prototype.options.apply(this, arguments);
    };

    this.domElement.appendChild(input);

};

GUI.extendController(GUI.StringController);
