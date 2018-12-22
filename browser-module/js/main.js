
import { userStaff } from "./control.js"
import { Alert } from "./util.js"

// from login.js
export const USER = sessionStorage.getItem("userid")

document.getElementById("wrapper").style.display = "block"
document.getElementById("tblwrapper").style.height = window.innerHeight
  - document.getElementById("cssmenu").style.height;

/^\d{6}$/.test(USER)
? userStaff()
: Alert("Alert!", "Invalid userid")
