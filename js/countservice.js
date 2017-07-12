
function resetcountService()
{
	document.getElementById("Admit").innerHTML = 0
	document.getElementById("Discharge").innerHTML = 0
	document.getElementById("Operation").innerHTML = 0
	document.getElementById("Morbidity").innerHTML = 0
	document.getElementById("Readmission").innerHTML = 0
	document.getElementById("Infection").innerHTML = 0
	document.getElementById("Reoperation").innerHTML = 0
	document.getElementById("Dead").innerHTML = 0
}

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
	if (/\b[Rr]e-op/.test(thiscase.treatment)) {
		return true
	}
/*
	var treat = findDateArray(thiscase.treatment)
	if (treat.length) {
		var diagDate
		var treatDate
		treat.push(thiscase.opdate)
		for (var i = 0; i < treat.length; i++) {
			diagDate = new Date(treat[i].toISOdate())
			for (var j = i+1; j < treat.length; j++) {
				treatDate = new Date(treat[j].toISOdate())
				if (diagDate <= treatDate) {
					if (dateDiff(diagDate, treatDate) <= 30) {
						return true
					}
				}
			}
		}
	}*/
}

function isReadmission(thiscase)
{
	if (/\b[Rr]e-ad/.test(thiscase.admission)) {
		return true
	}

	var diag = findDateArray(thiscase.diagnosis)
	var admit = findDateArray(thiscase.admission)
	if (thiscase.admit) {
		admit.push(thiscase.admit)
	}
	if (diag.length && admit.length) {
		var diagDate
		var admitDate
		for (var i = 0; i < diag.length; i++) {
			diagDate = new Date(diag[i].toISOdate())
			for (var j = 0; j < admit.length; j++) {
				admitDate = new Date(admit[j].toISOdate())
				if (diagDate <= admitDate) {
					if (dateDiff(diagDate, admitDate) <= 30) {
						return true
					}
				}
			}
		}
	}
}

function isInfection(thiscase)
{
	if (/[Ii]mprove/.test(thiscase.final)) {
		return false
	}
	if (/SSI/i.test(thiscase.final)) {
		return true
	}
	if (/Infect/.test(thiscase.final)) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (/[Ii]mprove/.test(thiscase.final)) {
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
	if (/[Ii]mprove/.test(thiscase.final)) {
		return false
	}
	if (thiscase.final.indexOf("Dead") >= 0) {
		return true
	}
	if (thiscase.final.indexOf("passed away") >= 0) {
		return true
	}
}
