
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

	var diag = regexDate(thiscase.diagnosis)
	var treat = regexDate(thiscase.treatment)

	if (treat.length > 1) {
		return true
	}

	if (diag.length && treat.length) {
		var diagDate = new Date(diag[0].toJavascriptDate())
		var treatDate = new Date(treat[0].toJavascriptDate())
		var tempDate = ""
		for (var i = 1; i < diag.length; i++) {	//find max diagDate
			tempDate = new Date(diag[i].toJavascriptDate())
			if (diagDate < tempDate) { //assume entry dd/mm/yy (Buddhist)
				diagDate = tempDate
			}
		}
		for (var i = 0; i < treat.length; i++) {	//find min treatDate
			tempDate = new Date(treat[i].toJavascriptDate())
			if (treatDate > tempDate) { //assume entry dd/mm/yy (Buddhist)
				treatDate = tempDate
			}
		}
		if (dateDiff(diagDate, treatDate) <= 30) {
			return true
		}
	}
}

function isReadmission(thiscase)
{
	if (thiscase.admission.toLowerCase().indexOf("re-ad") >= 0) {
		return true
	}

	var diag = regexDate(thiscase.diagnosis)
	var admit = regexDate(thiscase.admission)

	if (admit.length > 1) {
		return true
	}

	if (diag.length && admit.length) {
		var diagDate = new Date(diag[0].toJavascriptDate())
		var admitDate = new Date(admit[0].toJavascriptDate())
		var tempDate = ""
		for (var i = 1; i < diag.length; i++) {	//find max diagDate
			tempDate = new Date(diag[i].toJavascriptDate())
			if (diagDate < tempDate) { //assume entry dd/mm/yy (Buddhist)
				diagDate = tempDate
			}
		}
		for (var i = 0; i < admit.length; i++) {	//find min treatDate
			tempDate = new Date(admit[i].toJavascriptDate())
			if (admitDate > tempDate) { //assume entry dd/mm/yy (Buddhist)
				admitDate = tempDate
			}
		}
		if (dateDiff(diagDate, admitDate) <= 30) {
			return true
		}
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
	if (thiscase.final.toLowerCase().indexOf("spastic") >= 0) {
		return true
	}
	if (thiscase.final.toLowerCase().indexOf("leak") >= 0) {
		return true
	}
	if (thiscase.final.toLowerCase().indexOf("donor") >= 0) {
		return true
	}
	if (thiscase.final.toLowerCase().indexOf("seizure") >= 0) {
		return true
	}
	if (thiscase.final.toLowerCase().indexOf("delirium") >= 0) {
		return true
	}
	if (thiscase.final.toLowerCase().indexOf("post-op") >= 0) {
		if (thiscase.final.toLowerCase().indexOf("paresis") >= 0) {
			return true
		}
		if (thiscase.final.toLowerCase().indexOf("palsy") >= 0) {
			return true
		}
		if (thiscase.final.toLowerCase().indexOf("weakness") >= 0) {
			return true
		}
	}
}

function isDead(thiscase)
{
	if (thiscase.final.indexOf("Dead") >= 0) {
		return true
	}
}
