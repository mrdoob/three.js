/**
 * @author voondo
 */

THREE.KeyboardUtils = {

  map : function (keyCode) {

    if(THREE.KeyboardUtils.__currentLayout == undefined){
      THREE.KeyboardUtils.__currentLayout = THREE.KeyboardUtils.__layouts[THREE.KeyboardUtils.layout];
    }

    return THREE.KeyboardUtils.__currentLayout[keyCode];
  }
};

THREE.KeyboardUtils.layout = "en";
THREE.KeyboardUtils.__currentLayout = undefined;
THREE.KeyboardUtils.__layouts = {
  "en": {
      16: "shift",
      87: "W",
      83: "S",
      65: "A",
      68: "D",
      82: "R",
      70: "F",
      38: "up",
      40: "down",
      37: "left",
      39: "right",
      81: "Q",
      69: "E"
  },
  "fr": {
      16: "shift",
      90: "W", // Z
      83: "S",
      65: "Q", // A
      68: "D",
      82: "R",
      70: "F",
      38: "up",
      40: "down",
      37: "left",
      39: "right",
      81: "A", // Q
      69: "E"
  }
};

/*
// may be useful to add new layouts ;)
document.onkeydown = function(e){
    console.log("keydown event", e.keyCode);
}
*/