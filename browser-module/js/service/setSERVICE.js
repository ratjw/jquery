
import {
	KEYWORDS, SPINEOP, NOOPERATION, RADIOSURGERY, ENDOVASCULAR
} from "../model/const.js"

// SERVICE is retrieved from DB by getServiceOneMonth
// SERVE is calculated from SERVICE by calcSERVE
export let SERVICE = [],
  SERVE = [],
  serviceFromDate = "",
  serviceToDate = "",
  editableSV = true

export function setSERVICE(service) { SERVICE = calcSERVE(service) }

export function setfromDate(fromdate) { serviceFromDate = fromdate }

export function settoDate(todate) { serviceToDate = todate }

export function seteditableSV(editable) { editableSV = editable }

// By calSERVE, SERVICE contains some calculated values at run time
//    i.e. - diagnosis, treatment, admit
// All service values are stored in the corresponding table row : $row.data()
// Operation is determined by operationFor() in JS
// Admission is updated by getAdmitDischargeDate in PHP
// Values in DB are user-defined to override runtime-calc values
// admitted : "", "No", "Readmission"			<- admit
// operated : "", "No", "Reoperation"			<- treatment
// doneby : "", "Staff", "Resident"				<- default "Staff"
// manner : "", "Elective", "Emergency"			<- default "Elective"
// scale : "", "Major", "Minor"					<- default "Major"
// disease : "", "No", "Brain Tumor", "Brain Vascular",
//		"CSF related", "Trauma", "Spine", "etc" <- treatment + diagnosis
// radiosurgery : "", "No", "Radiosurgery"		<- treatment
// endovascular : "", "No", "Endovascular"		<- treatment
// infection : "", "Infection"					<- user-defined only
// morbid : "", "Morbidity"						<- user-defined only
// dead : "", "Dead"							<- user-defined only
function calcSERVE(service)
{
	$.each(service, function() {
		let	treatment = this.treatment

		if (!this.radiosurgery && isMatched(RADIOSURGERY, treatment)) {
			this.radiosurgery = "Radiosurgery"
		}

		if (!this.endovascular && isMatched(ENDOVASCULAR, treatment)) {
			this.endovascular = "Endovascular"
		}

		// If DB value is blank, calc the value
		this.disease = this.disease || operationFor(this)

		// "No" from DB or no matched
		if (this.disease !== "No") {
			if (!this.operated) { this.operated = "" }
			if (!this.doneby) { this.doneby = "Staff" }
			if (!this.scale) { this.scale = "Major" }
			if (!this.manner) { this.manner = "Elective" }
		}
	})

	return service
}

function operationFor(thisrow)
{
	let	Rx = 0, RxNo = 1, Dx = 2, DxNo = 3, 
		opfor = Object.keys(KEYWORDS),
		diagnosis = thisrow.diagnosis,
		treatment = thisrow.treatment,
		endovascular = thisrow.endovascular === "Endovascular",
		opwhat
	// "No" from match NOOPERATION
	if (isMatched(NOOPERATION, treatment)) { return "No" }

	// "No" from no match
	opfor = isOpfor(KEYWORDS, opfor, Rx, treatment)
	if (opfor.length === 0) { opwhat = "No" }
	else if (opfor.length === 1) { opwhat = opfor[0] }
	else {
		opfor = isNotOpfor(KEYWORDS, opfor, RxNo, treatment)
		if (opfor.length === 1) { opwhat = opfor[0] }
		else {
			opfor = isOpfor(KEYWORDS, opfor, Dx, diagnosis)
			if (opfor.length === 0) { opwhat = "etc" }
			else if (opfor.length === 1) { opwhat = opfor[0] }
			else {
				// in case all cancelled each other out
				opwhat = opfor[0]
				opfor = isNotOpfor(KEYWORDS, opfor, DxNo, diagnosis)
				if (opfor.length > 0) { opwhat = opfor[0] }
			}
		}
	}
	if (opwhat === "Spine" && endovascular && !isMatched(SPINEOP, treatment)) {
		opwhat = "No"
	}
	return opwhat
}

function isMatched(keyword, diagtreat)
{
	let test = false

	$.each( keyword, function() {
		return !(test = this.test(diagtreat))
	})
	return test
}

function isOpfor(keyword, opfor, RxDx, diagRx)
{
	for (let i=opfor.length-1; i>=0; i--) {
		if (!isMatched(keyword[opfor[i]][RxDx], diagRx)) {
			opfor.splice(i, 1)
		}
	}
	return opfor
}

function isNotOpfor(keyword, opfor, RxDx, diagRx)
{
	for (let i=opfor.length-1; i>=0; i--) {
		if (isMatched(keyword[opfor[i]][RxDx], diagRx)) {
			opfor.splice(i, 1)
		}
	}
	return opfor
}
