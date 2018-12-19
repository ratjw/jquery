
import { userStaff } from "./control.js"
import { setuser, user, Alert } from "./util.js"

setuser()

document.getElementById("wrapper").style.display = "block"
document.getElementById("tblwrapper").style.height = window.innerHeight
  - document.getElementById("cssmenu").style.height;

/^\d{6}$/.test(user)
? userStaff()
: Alert("Alert!", "Invalid userid")
