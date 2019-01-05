/**
 * @author anhr / https://github.com/anhr/
*/

//Some functions, you can use for localization of gui interface and saving user settings.
THREE.gui = {
	controllerNameAndTitle: function (controller, name, title) {
		var elPropertyName = controller.__li.querySelector(".property-name");
		elPropertyName.innerHTML = name;
		if (title != undefined)
			elPropertyName.title = title;
	},

	//returns the "primary language" subtag of the version of the browser.
	//See the "Syntax" paragraph of RFC 4646 https://tools.ietf.org/html/rfc4646#section-2.1 for details.
	getLanguageCode: function () {

		//returns the language version of the browser.
		function getLocale() {
			if (!navigator) {
				console.error("getLocale() failed! !navigator");
				return "";
			}

			if (
				(typeof navigator.languages != 'undefined')
				&& (typeof navigator.languages != 'unknown')//for IE6
				&& (navigator.languages.length > 0)
				)
				return navigator.languages[0];//Chrome

			//IE
			if (navigator.language) {
				return navigator.language;
			}
			else if (navigator.browserLanguage) {
				return navigator.browserLanguage;
			}
			else if (navigator.systemLanguage) {
				return navigator.systemLanguage;
			}
			else if (navigator.userLanguage) {
				return navigator.userLanguage;
			}

			console.error("getLocale() failed!");
			return "";
		}

		var parts = getLocale().toLowerCase().match(/([a-z]+)(?:-([a-z]+))?/),
			lang = parts[1],
			locale = parts[2];
		return lang;
	},

	get_cookie: function (cookie_name, defaultValue) {
		if (!navigator.cookieEnabled) {
			console.error('navigator.cookieEnabled = ' + navigator.cookieEnabled);
			//Enable cookie
			//Chrome: Settings/Show advanced settings.../Privacy/Content settings.../Cookies/Allow local data to be set
			return;
		}
		var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

		if (results)
			return (unescape(results[2]));
		if (typeof defaultValue == 'undefined')
			return '';
		return defaultValue;
	},

	SetCookie: function (name, value, settings) {
		if (!navigator.cookieEnabled) {
			console.error('navigator.cookieEnabled = ' + navigator.cookieEnabled);
			//Enable cookie
			//Chrome: Settings/Show advanced settings.../Privacy/Content settings.../Cookies/Allow local data to be set
			return;
		}

		value = value.toString();
		var cookie_date = new Date();
		cookie_date.setTime(cookie_date.getTime() + 1000 * 60 * 60 * 24 * 365);
		document.cookie = name + "=" + value + ((typeof settings == 'undefined') ? '' : settings) + "; expires=" + cookie_date.toGMTString();
		return 0;
	}
}
