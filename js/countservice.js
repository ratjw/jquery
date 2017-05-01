
function countService(thiscase, fromDate, toDate)
{
	var color = ""

	if (isAdmit(thiscase, fromDate, toDate)) {
		var Admit = document.getElementById("Admit")
		Admit.innerHTML = Number(Admit.innerHTML) + 1
	}
	if (isDischarge(thiscase, fromDate, toDate)) {
		var Discharge = document.getElementById("Discharge")
		Discharge.innerHTML = Number(Discharge.innerHTML) + 1
	}
	if (isOperation(thiscase)) {
		var Operation = document.getElementById("Operation")
		Operation.innerHTML = Number(Operation.innerHTML) + 1
	}
	if (isReadmission(thiscase)) {
		var Readmission = document.getElementById("Readmission")
		Readmission.innerHTML = Number(Readmission.innerHTML) + 1
		color = "Readmission"
	}
	if (isReoperation(thiscase)) {
		var Reoperation = document.getElementById("Reoperation")
		Reoperation.innerHTML = Number(Reoperation.innerHTML) + 1
		color = "Reoperation"
	}
	if (isInfection(thiscase)) {
		var Infection = document.getElementById("Infection")
		Infection.innerHTML = Number(Infection.innerHTML) + 1
		color = "Infection"
	}
	if (isMorbidity(thiscase)) {
		var Morbidity = document.getElementById("Morbidity")
		Morbidity.innerHTML = Number(Morbidity.innerHTML) + 1
		color = "Morbidity"
	}
	if (isDead(thiscase)) {
		var Dead = document.getElementById("Dead")
		Dead.innerHTML = Number(Dead.innerHTML) + 1
		color = "Dead"
	}
	return color
}

function isAdmit(thiscase, fromDate, toDate)
{
	if ((thiscase.admit >= fromDate) && (thiscase.admit <= toDate)) {
		return true
	}
}

function isDischarge(thiscase, fromDate, toDate)
{
	if ((thiscase.discharge >= fromDate) && (thiscase.discharge <= toDate)) {
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

function isReoperation(thiscase)
{
	if (/[Rr]e-op/.test(thiscase.treatment)) {
		return true
	}

	var diag = regexDate(thiscase.diagnosis)
	var treat = regexDate(thiscase.treatment)

	if (diag.length && treat.length) { //assume entry dd/mm/yy (Buddhist)
		var diagDate = new Date(diag[0].toISOdate())
		var treatDate = new Date(treat[0].toISOdate())
		var tempDate = ""
		for (var i = 1; i < diag.length; i++) {	//find max diagDate
			tempDate = new Date(diag[i].toISOdate())
			if (diagDate < tempDate) {
				diagDate = tempDate
			}
		}
		if ((diagDate <= treatDate) && (dateDiff(diagDate, treatDate) <= 30)) {
			return true
		}
	}
}

function isReadmission(thiscase)
{
	if (/[Rr]e-ad/.test(thiscase.admission)) {
		return true
	}

	var diag = regexDate(thiscase.diagnosis)
	var admit = regexDate(thiscase.admission)

	if (diag.length && admit.length) { //assume entry dd/mm/yy (Buddhist)
		var diagDate = new Date(diag[0].toISOdate())
		var admitDate = new Date(admit[0].toISOdate())
		var tempDate = ""
		for (var i = 1; i < diag.length; i++) {	//find max diagDate
			tempDate = new Date(diag[i].toISOdate())
			if (diagDate < tempDate) {
				diagDate = tempDate
			}
		}
		if ((diagDate <= admitDate) && (dateDiff(diagDate, admitDate) <= 30)) {
			return true
		}
	}
}

function isInfection(thiscase)
{
	if (/[Ii]mproved/.test(thiscase.final)) {
		return false
	}
	if (/SSI/i.test(thiscase.final)) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (/[Ii]mproved/.test(thiscase.final)) {
		return false
	}

	var Morbid = false
	$.each( neuroMorbid, function(i, each) {
		if (each.test(thiscase.final)) {
			Morbid = true
			return false
		}
	})
	return Morbid
}

function isDead(thiscase)
{
	if (/[Ii]mproved/.test(thiscase.final)) {
		return false
	}
	if (thiscase.final.indexOf("Dead") >= 0) {
		return true
	}
	if (thiscase.final.indexOf("passed away") >= 0) {
		return true
	}
}
