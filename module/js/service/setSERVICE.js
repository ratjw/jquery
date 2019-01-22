
import {
	KEYWORDS, SPINEOP, NOOPERATION, RADIOSURGERY, ENDOVASCULAR
} from "../model/const.js"

// SERVICE is retrieved from DB by getServiceOneMonth
// calSERVE modifies SERVICE at run time, if no user-defined value in DB

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
if (this.hn == "5489111")
	editableSV = editableSV
		if (!this.disease && this.operated !== "0") {
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
	return keyword.some(v => v.test(diagtreat))
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
