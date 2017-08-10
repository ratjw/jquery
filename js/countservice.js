
function resetcountService()
{
	document.getElementById("Admit").innerHTML = 0
	document.getElementById("Discharge").innerHTML = 0
	document.getElementById("Operation").innerHTML = 0
	document.getElementById("Readmission").innerHTML = 0
	document.getElementById("Reoperation").innerHTML = 0
	document.getElementById("Infection").innerHTML = 0
	document.getElementById("Morbidity").innerHTML = 0
	document.getElementById("Dead").innerHTML = 0
}

function countService(thiscase, fromDate, toDate)
{
	var color = ""

	if (isAdmit(thiscase, fromDate, toDate)) {
		color += "Admit"
	}
	if (isDischarge(thiscase, fromDate, toDate)) {
		color += color? " Discharge" : "Discharge"
	}
	if (isOperation(thiscase)) {
		color += color? " Operation" : "Operation"
	}
	if (isReadmission(thiscase)) {
		color += color? " Readmission" : "Readmission"
	}
	if (isReoperation(thiscase)) {
		color += color? " Reoperation" : "Reoperation"
	}
	if (isInfection(thiscase)) {
		color += color? " Infection" : "Infection"
	}
	if (isMorbidity(thiscase)) {
		color += color? " Morbidity" : "Morbidity"
	}
	if (isDead(thiscase)) {
		color += color? " Dead" : "Dead"
	}
	return color
}

function isAdmit(thiscase, fromDate, toDate)
{
	if ((thiscase.admit >= fromDate)
	&& (thiscase.admit <= toDate)
	&& (thiscase.waitnum > 0)) {
		return true
	}
}

function isDischarge(thiscase, fromDate, toDate)
{
	if ((thiscase.discharge >= fromDate)
	&& (thiscase.discharge <= toDate)
	&& (thiscase.waitnum > 0)) {
		return true
	}
}

function isOperation(thiscase)
{
	var Operation = false
	$.each( neuroSxOp, function(i, each) {
		if (each.test(thiscase.treatment)) {
			Operation = true
			return false
		}
	})
	return Operation
}

function isReadmission(thiscase)
{
	if (/\b[Rr]e-ad/.test(thiscase.admission)) {
		return true
	}
}

function isReoperation(thiscase)
{
	if (/\b[Rr]e-op/.test(thiscase.treatment)) {
		return true
	}
}

function isInfection(thiscase)
{
	if (/SSI/i.test(thiscase.final)) {
		return true
	}
	if (/Infect/.test(thiscase.final)) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (/Morbid/.test(thiscase.final)) {
		return true
	}
}

function isDead(thiscase)
{
	if (/Dead/.test(thiscase.final)) {
		return true
	}
	if (/passed away/.test(thiscase.final)) {
		return true
	}
}
