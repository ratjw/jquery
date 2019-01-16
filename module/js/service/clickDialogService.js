
import { PROFILESV } from "../model/const.js"
import { resetTimerCounter } from "../control/timer.js"
import { POINTER, clearEditcell } from "../control/edit.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"

const SERVICECOLOR = ["Readmission", "Reoperation", "Infection", "Morbidity", "Dead"]

export function clickDialogService(event)
{
	let $servicetbl = $("#servicetbl"),
		target = event.target,
		inCell = target.closest("td"),
		onProfile = !!target.closest(".divRecord"),
		onNormalCell = (target.nodeName === "TD" && target.colSpan === 1),
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
	// Before INPUT value was changed, get the old record content
	// INPUT event comes after INPUT value was changed, just show colors
	if (onProfile) {
	  if (target.nodeName === "INPUT") {
		if (inCell !== POINTER) {
	      if (POINTER) {
		    savePreviousCellService()
		  }
		  editPresentCellService(event, inCell)
	      if (SERVICECOLOR.includes(target.title)) {
		    showInputColor(target)
	      }
		}
	  }
	} else {
	  if (POINTER) {
		if (inCell !== POINTER) {
		  savePreviousCellService()
		  if (onNormalCell) {
		    editPresentCellService(event, inCell)
		  } else {
		    clearEditcell()
		  }
		}
	  } else {
	    if (onNormalCell) {
		  editPresentCellService(event, inCell)
	    }
	  }
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

function showInputColor(target)
{
	let	row = target.closest("tr"),
		classname = target.title

	if (target.checked) {
		row.classList.add(classname)
	} else {
		row.classList.remove(classname)
	}
}
