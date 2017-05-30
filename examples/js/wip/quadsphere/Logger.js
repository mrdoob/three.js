var Logger = function () {

    //Singleton code
    if (typeof Logger.instance === 'object') {
        return Logger.instance;
    }

    this.domElement = document.createElement('div');
    this.domElement.style.fontSize = "xx-small";
    this.domElement.style.color = "white";

    this.updated = false;

    this.strings = {};

    Logger.instance = this;
};


Logger.prototype = {
    Log: function (text, value) {
        var valueText;

        if (value instanceof THREE.Vector3) {
            valueText = Math.round(value.x) + ", " + Math.round(value.y) + ", " + Math.round(value.z);
        } else {
            valueText = value;
        }

        if (this.strings[text] !== valueText) {
            this.updated = true;
            this.strings[text] = valueText;
        }

        if (this.updated) {
            this.WriteLogs();
            this.updated = false;
        }
    },

    WriteLogs: function () {
        var text = '';
        for (var k in this.strings) {
            if (this.strings.hasOwnProperty(k)) {
                text += k + " : " + this.strings[k] + "<br />";
            }
        }
        this.domElement.innerHTML = text;
    }

};
