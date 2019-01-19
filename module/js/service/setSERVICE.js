
import {
	KEYWORDS, SPINEOP, NOOPERATION, RADIOSURGERY, ENDOVASCULAR
} from "../model/const.js"

// SERVICE is retrieved from DB by getServiceOneMonth
// calSERVE modifies SERVICE at run time, if no user-defined value in DB

// admit : "date"							<- updated by getAdmitDischargeDate in PHP
// discharge : "date"						<- updated by getAdmitDischargeDate in PHP
// admitted : "", "1", "2", ...				<- updated by getAdmitDischargeDate in PHP
// doneby : "", "Staff", "Resident"			<- user-defined only
// manner : "", "Elective", "Emergency"		<- user-defined only
// scale : "", "Major", "Minor"				<- user-defined only
// infection : "", "Infection"				<- user-defined only
// morbid : "", "Morbidity"					<- user-defined only
// dead : "", "Dead"						<- user-defined only

// operated : "", "0", "1", "2", ...		<- user-defined "0" is NoOp
// disease : "", "No", "Brain Tumor",		\
// 		"Brain Vascular", "CSF related",	 |	if "", will be calc by operationFor
//		"Trauma", "Spine", "etc"			  > other value is user-defined
// radiosurgery : "", "No", "Radiosurgery"	 |
// endovascular : "", "No", "Endovascular"	/

export let SERVICE = [],
  serviceFromDate = "",
  serviceToDate = "",
  editableSV = true

export function setSERVICE(service) { SERVICE = calcSERVE(service) }

export function setfromDate(fromdate) { serviceFromDate = fromdate }

export function settoDate(todate) { serviceToDate = todate }

export function seteditableSV(editable) { editableSV = editable }

function calcSERVE(service)
{
	$.each(service, function() {
		if (!this.radiosurgery && isMatched(RADIOSURGERY, this.treatment)) {
			this.radiosurgery = "Radiosurgery"
		}

		if (!this.endovascular && isMatched(ENDOVASCULAR, this.treatment)) {
			this.endovascular = "Endovascular"
		}

		if (!this.disease) {
			let opwhat = operationFor(this)

			this.disease = opwhat
			if (opwhat && !this.operated) {
				this.operated = 1
			}
		}
	})

	return service
}

// matched NOOPERATION or no other match, return ""
// not return "NoOp" which is user-defined and saved into DB
function operationFor(thisrow)
{
	let	Rx = 0, RxNo = 1, Dx = 2, DxNo = 3, 
		opfor = Object.keys(KEYWORDS),
		diagnosis = thisrow.diagnosis,
		treatment = thisrow.treatment,
		endovascular = thisrow.endovascular === "Endovascular",
		opwhat = ""

	if (isMatched(NOOPERATION, treatment)) { return "" }

	opfor = isOpfor(KEYWORDS, opfor, Rx, treatment)
	if (opfor.length === 0) { opwhat = "" }
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
		opwhat = ""
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
