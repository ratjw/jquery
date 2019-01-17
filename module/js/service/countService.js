
import { SERVICE, serviceFromDate, serviceToDate } from "./setSERVICE.js"

const COMPLICATION = {
	"infection": "Infection",
	"morbid": "Morbidity",
	"dead": "Dead"
}
const COUNTER = [ "Admission", "Discharge", "Operation", "Readmission",
   "Reoperation", "Infection", "Morbidity", "Dead"
]

// for coloring of a row
export function countService(thiscase) {
	let classname = ""

	if (thiscase.admitted > 1) {
		classname += "Readmission "
	}
	if (thiscase.operated > 1) {
		classname += "Reoperation "
	}
	$.each(COMPLICATION, function(key, val) {
		if (thiscase[key] === val) {
			classname += thiscase[val] + " "
		}
	})

	return $.trim(classname)
}

export function countAllServices() {
	COUNTER.forEach(function(item) {
		document.getElementById(item).innerHTML = 0
	})

	let x = ""
	SERVICE.forEach(thiscase => {

		// Assume consult cases (waitnum < 0) are admitted in another service
		if (thiscase.waitnum > 0) {
			x = document.getElementById("Admission").innerHTML
			document.getElementById("Admission").innerHTML = Number(thiscase.admitted) + Number(x)
		}
		if (thiscase.waitnum > 0) {
			if ((thiscase.discharge >= serviceFromDate)
			 && (thiscase.discharge <= serviceToDate)) {
				document.getElementById("Discharge").innerHTML++
			}
		}
		if (thiscase.admitted > 1) {
			x = document.getElementById("Readmission").innerHTML
			document.getElementById("Readmission").innerHTML = (Number(thiscase.admitted) - 1) + Number(x)
		}
		if (thiscase.operated) {
			x = document.getElementById("Operation").innerHTML
			document.getElementById("Operation").innerHTML = Number(thiscase.operated) + Number(x)
		}
		if (thiscase.operated > 1) {
			x = document.getElementById("Reoperation").innerHTML
			document.getElementById("Reoperation").innerHTML = (Number(thiscase.operated) - 1) + Number(x)
		}

		$.each(COMPLICATION, function(key, val) {
			if (thiscase[key] === val) {
				document.getElementById(val).innerHTML++
			}
		})
	})
}
