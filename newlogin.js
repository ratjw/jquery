function login()
{
    "use strict";

	// Ridirect to https
//	if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
//		window.location = "https://" + window.host
//	}

	// all via vpn (desktops and mobiles) must be "vpn-es5"
	// intranet old browser is in "vpn-es5"
	// Browsers that support module: Chrome/61, Firefox/60, Edge/16, Safari 10.1
	// (.*)$ is the second argument
	var ua = navigator.userAgent
	var isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile/i.test(ua)
/*	var Chrome = ua.match(/Chrome\/(.*)$/)
	var Firefox = ua.match(/Firefox\/(.*)$/)
	var Edge = ua.match(/Edge\/(.*)$/)
	var Safari = ua.match(/Safari\/(.*)$/)
	var module = (Chrome && Chrome.length > 1)
				? Chrome[1] >= "61"
				: (Firefox && Firefox.length > 1)
					? Firefox[1] >= "60"
					: (Edge && Edge.length > 1)
						? Edge[1] >= "16"
						: (Safari && Safari.length > 1)
							? Safari[1] >= "10.1"
							: false
*/	var browser = checkES6()
				? (isMobile === "true")
					? "browser-mobile"
//					: ($module === "true")
//						? "browser-module"
						: "browser-es6"
				: "browser-vpn-es5"

	document.getElementById("browser").value = browser
	sessionStorage.setItem('userid', document.getElementById("userid").value)
}

function namesix()
{
	var userid = document.getElementById("userid").value
	if (/^\d{6}$/.test(userid)) {
		sessionStorage.setItem('userid', userid)
		document.getElementById("pwd").focus()
	}
}

// vpn not run ES6
function checkES6() {
	if (/rvpn/.test(window.origin)) return false
    if (typeof fetch === "undefined") return false
    if (typeof find === "undefined") return false
    try {
        eval("class Foo {}")
        eval("var bar = async (x) => x+1")
		eval('"foo".includes("foo")')
    } catch (e) { return false }

    return true
}
