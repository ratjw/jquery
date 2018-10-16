
import { userOR } from "./equip.js"
import { userStaff } from "./control.js"

// from PHP form login
export const userID = localStorage.getItem("userID")

document.getElementById("login").parentNode.removeChild(login)
document.getElementById("logo").parentNode.removeChild(logo)
document.getElementById("wrapper").style.display = "block"

// to make table scrollable while dragging
let	html = document.getElementsByTagName("html")[0],
	body = document.getElementsByTagName("body")[0]

html.style.height = "100%"
html.style.overflow = "hidden"
html.style.margin = "0px"
body.style.height = "100%"
body.style.overflow = "hidden"
body.style.margin = "0px"

userID === "000000" ? userOR() : userStaff()
