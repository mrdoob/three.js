<!-- Licensed under a BSD license. See license.html for license -->
(function($){
var log = function(msg) {
  return;
  if (window.dump) {
    dump(msg + "\n");
  }
  if (window.console && window.console.log) {
    console.log(msg);
  }
};

function getQueryParams() {
  var params = {};
  if (window.location.search) {
    window.location.search.substring(1).split("&").forEach(function(pair) {
      var keyValue = pair.split("=").map(function (kv) {
        return decodeURIComponent(kv);
      });
      params[keyValue[0]] = keyValue[1];
    });
  }
  return params;
}

$(document).ready(function($){
  var g_imgs = { };
  var linkImgs = function(bigHref) {
    return function() {
      var src = this.src;
      var a = document.createElement('a');
      a.href = bigHref;
      a.title = this.alt;
      a.className = this.className;
      a.setAttribute('align', this.align);
      this.setAttribute('align', '');
      this.className = '';
      this.style.border = "0px";
      return a;
    };
  };
  var linkSmallImgs = function(ext) {
    return function() {
      var src = this.src;
      return linkImgs(src.substr(0, src.length - 7) + ext);
    };
  };
  var linkBigImgs = function() {
    var src = $(this).attr("big");
    return linkImgs(src);
  };
  $('img[big$=".jpg"]').wrap(linkBigImgs);
  $('img[src$="-sm.jpg"]').wrap(linkSmallImgs(".jpg"));
  $('img[src$="-sm.gif"]').wrap(linkSmallImgs(".gif"));
  $('img[src$="-sm.png"]').wrap(linkSmallImgs(".png"));
  $('pre>code')
     .unwrap()
     .replaceWith(function() {
       return $('<pre class="prettyprint showlinemods">' + this.innerHTML + '</pre>')
     });
  if (window.prettyPrint) {
    window.prettyPrint();
  }

  var params = getQueryParams();
  if (params.doubleSpace || params.doublespace) {
    document.body.className = document.body.className + " doubleSpace";
  }

  $(".language").on('change', function() {
    window.location.href = this.value;
  });

});
}(jQuery));

