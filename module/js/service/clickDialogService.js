
import { PROFILESV } from "../model/const.js"
import { resetTimerCounter } from "../control/timer.js"
import { POINTER, clearEditcell } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"
import { countAllServices } from "./countAllServices.js"
import { getBOOKrowByQN } from "../util/getrows.js"

const UPDATECOUNTER = ["disease", "admitted", "operated", "infection", "morbid", "dead"]
const SERVICECOLOR = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"]

export function clickDialogService(event)
{
	let $servicetbl = $("#servicetbl"),
		target = event.target,
		onProfile = !!target.closest(".divRecord"),
		isHideColumn = target.cellIndex === PROFILESV,
		onDivRecord = /divRecord/.test(target.className),
		onImage = target.nodeName === "IMG"

	resetTimerCounter();
	event.stopPropagation()

	if (isHideColumn || onDivRecord || onImage) {
	  if ($servicetbl.find("th").eq(PROFILESV).width() < 200) {
		showProfile()
	  } else {
		hideProfile()
	  }
	  $("#dialogService .fixed").refixMe($servicetbl)
	}

	// click a button on divRecord gives 2 events => first SPAN and then INPUT
	// SPAN event is ignored
	// INPUT event comes after INPUT value was changed
	if (onProfile) {
	  clickProfile(event, target)
	} else {
	  clickCell(event, target)
    }
}

function showProfile() {
	$("#dialogService .fixed").addClass("showColumn8")
	$("#servicetbl").addClass("showColumn8")
	$("#servicetbl .divRecord").show()
	$("#servicetbl th .imgopen").hide()
	$("#servicetbl th .imgclose").show()
}

export function hideProfile() {
	$("#dialogService .fixed").removeClass("showColumn8")
	$("#servicetbl").removeClass("showColumn8")
	$("#servicetbl .divRecord").hide()
	$("#servicetbl th .imgopen").show()
	$("#servicetbl th .imgclose").hide()
}

function clickProfile(evt, target)
{
  let inCell = target.closest("td")

  if (target.nodeName === "INPUT") {
    let name = target.name.replace(/\d+/g, "")
    if (UPDATECOUNTER.includes(name)) {
	  if (SERVICECOLOR.includes(target.title)) {
	    showInputColor(target)
	  }
      countAllServices()
	}
	if (inCell !== POINTER) {
	  if (POINTER) {
		savePreviousCellService()
	  }
	  editPresentCellService(evt, inCell)
	}
  }
}

function clickCell(evt, target)
{
  let inCell = target.closest("td"),
	onNormalCell = (target.nodeName === "TD" && target.colSpan === 1)

  if (POINTER) {
	if (inCell !== POINTER) {
	  savePreviousCellService()
	  if (onNormalCell) {
		editPresentCellService(evt, inCell)
	  } else {
		clearEditcell()
	  }
	}
  } else {
	if (onNormalCell) {
	  editPresentCellService(evt, inCell)
	}
  }
}

function showInputColor(target)
{
	let	row = target.closest("tr"),
		classname = target.title

	if (target.checked || target.value > 1) {
		row.classList.add(classname)
	} else {
		row.classList.remove(classname)
	}
}
