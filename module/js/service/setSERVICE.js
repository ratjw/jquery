
import {
	KEYWORDS, SPINEOP, NOOPERATION, RADIOSURGERY, ENDOVASCULAR
} from "../model/const.js"

// SERVICE is retrieved from DB by getServiceOneMonth
// admit : "date"							<- updated by getAdmitDischargeDate in PHP
// discharge : "date"						<- updated by getAdmitDischargeDate in PHP
// admitted : "", "1", "2", ...				<- from admit
// operated : "", "1", "2",	...				<- from disease
// doneby : "", "Staff", "Resident"			<- user-defined
// manner : "", "Elective", "Emergency"		<- user-defined
// scale : "", "Major", "Minor"				<- user-defined
// disease : "", "No", "Brain Tumor",
// 		"Brain Vascular", "CSF related", 
//		"Trauma", "Spine", "etc"			<- from treatment + diagnosis by operationFor
// radiosurgery : "", "No", "Radiosurgery"	<- from treatment by operationFor
// endovascular : "", "No", "Endovascular"	<- from treatment by operationFor
// infection : "", "Infection"				<- user-defined
// morbid : "", "Morbidity"					<- user-defined
// dead : "", "Dead"						<- user-defined
export let SERVICE = [],
  serviceFromDate = "",
  serviceToDate = "",
  editableSV = true

export function setSERVICE(service) { SERVICE = calcSERVE(service) }

export function setfromDate(fromdate) { serviceFromDate = fromdate }

export function settoDate(todate) { serviceToDate = todate }

export function seteditableSV(editable) { editableSV = editable }

// By calSERVE, SERVICE contains some calculated values at run time
//    i.e. - disease, radiosurgery, endovascular
// only when there is no user-defined value in DB
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

		if (!this.disease) {
			let opwhat = operationFor(this)

			this.disease = opwhat
			if ((opwhat !== "NoOp") && (this.operated === "0")) {
				this.operated = 1
			}
		}
	})

	return service
}

// "NoOp" is from matched NOOPERATION, or no other match
function operationFor(thisrow)
{
	let	Rx = 0, RxNo = 1, Dx = 2, DxNo = 3, 
		opfor = Object.keys(KEYWORDS),
		diagnosis = thisrow.diagnosis,
		treatment = thisrow.treatment,
		endovascular = thisrow.endovascular === "Endovascular",
		opwhat

	if (isMatched(NOOPERATION, treatment)) { return "NoOp" }

	opfor = isOpfor(KEYWORDS, opfor, Rx, treatment)
	if (opfor.length === 0) { opwhat = "NoOp" }
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
		opwhat = "NoOp"
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
