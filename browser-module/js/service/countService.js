
import { serviceFromDate, serviceToDate } from "./setSERVICE.js"

export function countService(thiscase) {
	let classname = "",
		items = ["admitted", "operated", "radiosurgery", "endovascular", "infection", "morbid", "dead"]

	$.each(items, function() {
		if (thiscase[this]) {
			classname += thiscase[this] + " "
		}
	})
	// Assume consult cases (waitnum < 0) are admitted in another service ???
	if ((thiscase.waitnum > 0)
		&& (thiscase.admit >= serviceFromDate)
		&& (thiscase.admit <= serviceToDate)) {
		if (!/Admission/.test(classname)) {
			classname += "Admission "
		}
	}
	if ((thiscase.discharge >= serviceFromDate)
		&& (thiscase.discharge <= serviceToDate)
		&& (thiscase.waitnum > 0)) {
		classname += "Discharge "
	}

	return $.trim(classname)
}

export function countAllServices() {
	resetcountService()

	$.each( $("#servicetbl tr"), function() {
		let counter = this.className.split(" "),
			id

		$.each(counter, function() {
			if (id = String(this)) {
				if (document.getElementById(id)) {
					document.getElementById(id).innerHTML++
				}
				if (id === "Readmission") {
					document.getElementById("Admission").innerHTML++
				}
				if (id === "Reoperation") {
					document.getElementById("Operation").innerHTML++
				}
			}
		})
	})
}

function resetcountService() {
	[ "Admission", "Discharge", "Operation", "Readmission",
	   "Reoperation", "Infection", "Morbidity", "Dead"
	].forEach(function(item) {
		document.getElementById(item).innerHTML = 0
	})
}
