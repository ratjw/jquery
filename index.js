
	// Browsers that support ES6 module: Edge/16, Firefox/60, Chrome/61, Safari 10.1
	var module = false
	var ua = navigator.userAgent
	var isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(ua);
	var isPACS = !isMobile
	var engine = ""

	if (isPACS) {
		// (.*)$ is the second argument
		var Chrome = ua.match(/Chrome\/(.*)$/)
		var Firefox = ua.match(/Firefox\/(.*)$/)
		var Edge = ua.match(/Edge\/(.*)$/)
		var Safari = ua.match(/Safari\/(.*)$/)

		if (Chrome && Chrome.length > 1) {
			module = Chrome[1] >= "61"
		}
		else if (Firefox && Firefox.length > 1) {
			module = Firefox[1] >= "60"
		}
		else if (Edge && Edge.length > 1) {
			module = Edge[1] >= "16"
		}
		else if (Safari && Safari.length > 1) {
			module = Safari[1] >= "10.1"
		}
	}

	if (check()) {
		// The engine supports ES6 features you want to use
		engine = "es6"
	} else {
		// The engine doesn't support those ES6 features
		// Use the boring ES5 :(
		engine = "es5"
	}

	document.getElementById("isPACS").value = isPACS
	document.getElementById("module").value = module
	document.getElementById("engine").value = engine

function namesix()
{
	var userid = document.getElementById("userid").value
	if (/^\d{6}$/.test(userid)) {
		document.getElementById("pwd").focus()
	}
}

function signin()
{
	var h4 = document.getElementsByTagName('h4')[0]
	if (h4) { h4.remove() }
}

function nurse()
{
	var userid = document.getElementById("userid")
	var nurseid = document.getElementById("nurseid")

	if (/^\d{1,2}$/.test(userid.value)) {
		nurseid.value = userid.value
	} else {
		nurseid.value = 'nurse'
	}
	document.getElementsByTagName('form').submit()
	document.getElementById('nurseid').value = ''

}

function check() {
    "use strict";

    if (typeof Symbol == "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }

    return true;
}
