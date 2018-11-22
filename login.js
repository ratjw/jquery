(function ()
{
    "use strict";

	// Ridirect to https
//	if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
//		window.location = "https://" + window.host
//	}
	// Browsers that support module: Chrome/61, Firefox/60, Edge/16, Safari 10.1
	var module = false
	var ua = navigator.userAgent
	var isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(ua)
	var browser = ""

	if (!isMobile) {
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
		browser = "es6"
	} else {
		browser = "es5"
	}

	document.getElementById("isMobile").value = isMobile
	document.getElementById("module").value = false//module
	document.getElementById("browser").value = browser
	sessionStorage.clear()
})()

function namesix()
{
	var userid = document.getElementById("userid").value
	if (/^\d{6}$/.test(userid)) {
		sessionStorage.setItem('userid', userid)
		document.getElementById("pwd").focus()
	}
}

function check() {
//	if (/rvpn/.test(window.location.href)) return false;
    if (typeof fetch === "undefined") return false;
    if (typeof find === "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = async (x) => x+1");
		eval('"foo".includes("foo")')
    } catch (e) { return false; }

    return true;
}
