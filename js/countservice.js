
function countService(thiscase, fromDate, toDate)
{
	var color

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
	if (isReoperation(thiscase)) {
		var Reoperation = document.getElementById("Reoperation")
		Reoperation.innerHTML = Number(Reoperation.innerHTML) + 1
		color = "Reoperation"
	}
	if (isReadmission(thiscase)) {
		var Readmission = document.getElementById("Readmission")
		Readmission.innerHTML = Number(Readmission.innerHTML) + 1
		color = "Readmission"
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
		if (thiscase.treatment.toLowerCase().indexOf(each) >= 0) {
			Operation = true
			return false
		}
		if (thiscase.treatment.toLowerCase().indexOf("op") >= 0) {
			Operation = true
			return false
		}
	})
	return Operation
}

function isReoperation(thiscase)
{
	if (thiscase.treatment.toLowerCase().indexOf("re-op") >= 0) {
		return true
	}
/*
	var diag = regexDate(thiscase.diagnosis)
	var treat = regexDate(thiscase.treatment)

	if (treat.length > 1) {
		for (var i = 0; i < treat.length; i++) {
			treat[i] = treat[i].toJavascriptDate() //assume entry dd/mm/yy (Buddhist)
			treat[i] = new Date(treat[i])
		}
		for (var i = 0; i < treat.length; i++) {
			treat[i] = treat[i].toJavascriptDate() //assume entry dd/mm/yy (Buddhist)
			treat[i] = new Date(treat[i])
		}
	}

	return true
	}

	var diagDate = 0
	var treatDate = 0
	var tempDate = 0
	if (diag.length && treat.length) {
		for (var i = 0; i < diag.length; i++) {
			tempDate = new Date(diag[i])
			if (diagDate <= tempDate) {
				diagDate = tempDate
			}
		}
		treatDate = new Date(treat[i])
		var timeDiff = Math.abs(treatDate.getTime() - diagDate.getTime())
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
		if (diffDays <= 30) {
			return true
		}
	}*/
}

function isReadmission(thiscase)
{
	if (thiscase.admission.toLowerCase().indexOf("re-ad") >= 0) {
		return true
	}
	if (regexDate(thiscase.treatment).length > 1) {
		return true
	}
}

function isInfection(thiscase)
{
	if (thiscase.final.toLowerCase().indexOf("infect") >= 0) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (thiscase.final.toLowerCase().indexOf("morbid") >= 0) {
		return true
	}
}//spastic, leak, donor, seizure, post-op paresis, post-op palsy, delirium, post-op weakness

function isDead(thiscase)
{
	if (thiscase.final.indexOf("Dead") >= 0) {
		return true
	}
}
