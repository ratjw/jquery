
import { addStaff, doadddata, doupdatedata, dodeletedata } from "./addStaff.js"

import { inputHoliday, addHoliday, delHoliday } from "./inputHoliday.js"

export function setClickSetting()
{
	let onclick = {
		"clickaddStaff": addStaff,
		"clicksetHoliday": inputHoliday,
		"clickdoadddata": doadddata,
		"clickdoupdatedata": doupdatedata,
		"clickdodeletedata": dodeletedata,
		"addholiday": addHoliday
	}

	$.each(onclick, function(key, val) {
		document.getElementById(key).onclick= val
	})

	document.querySelectorAll(".delholiday").forEach(function(item) {
		item.addEventListener("click", function() {
			delHoliday(this)
		})
	})
}
