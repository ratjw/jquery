
import { PROFILESV } from "../model/const.js"
import { resetTimerCounter } from "../control/timer.js"
import { clickProfile } from "./clickProfile.js"
import { clickCellSV } from "./clickCellSV.js"

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
	  clickCellSV(event, target)
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
