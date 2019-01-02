
import { clearSelection } from "../control/clearSelection.js"
import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV
} from "../model/const.js"
import { resetTimerCounter } from "../control/updating.js"
import { pointer, clearEditcell } from "../control/edit.js"
import { START, putThdate, putNameAge } from "../util/date.js"
import {
	isPACS, getClass, inPicArea,  winWidth, winHeight, winResizeFix
} from "../util/util.js"
import { refillall, refillstaffqueue } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"
import { countService, countAllServices } from "./countService.js"
import { getAdmitDischargeDate } from "./getAdmitDischargeDate.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { editPresentCellService } from "./editPresentCellService.js"
import {
	SERVICE, seteditableSV, serviceFromDate, serviceToDate, editableSV
} from "./setSERVICE.js"

export function showService() {
	let	$dialogService = $("#dialogService"),
		$servicetbl = $("#servicetbl"),
		$servicecells = $("#servicecells"),
		$imgopen = $("#servicetbl th .imgopen"),
		$imgclose = $("#servicetbl th .imgclose"),
		$divRecord = $("#servicetbl .divRecord"),
		staffname = "",
		scase = 0,
		classname = ""

	$("#monthpicker").hide()
	$("#servicehead").show()

	//delete previous servicetbl lest it accumulates
	$servicetbl.find("tr").slice(1).remove()
	$servicetbl.show()
	seteditableSV(serviceFromDate >= START)

	$.each( SERVICE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			$servicecells.find("tr").clone()
				.appendTo($servicetbl.find("tbody"))
					.children("td").eq(CASENUMSV)
						.prop("colSpan", QNSV - CASENUMSV)
							.addClass("serviceStaff")
								.html(staffname)
									.siblings().hide()
		}
		classname = countService(this)
		scase++
		$servicecells.find("tr").clone()
			.appendTo($servicetbl.find("tbody"))
				.filldataService(this, scase, classname)
	});

	$dialogService.dialog({
		hide: 200,
		width: winWidth(95),
		height: winHeight(95),
		close: function() {
			refillstaffqueue()
			refillall()
            fillConsults()
			$(".ui-dialog:visible").find(".ui-dialog-content").dialog("close");
			$(".fixed").remove()
			hideProfile()
			$(window).off("resize", resizeDialog)
			$dialogService.off("click", clickDialogService)
			if ($("#editcell").data("pointing")) {
				savePreviousCellService()
			}
			clearEditcell()
			clearSelection()
		}
	})
	
	if (/surgery\.rama/.test(location.hostname)) {
		getAdmitDischargeDate()
	}
	countAllServices()
	$servicetbl.fixMe($dialogService)
	hoverService()

	$dialogService.on("click", clickDialogService)

	//for resizing dialogs in landscape / portrait view
	$(window).on("resize", resizeDialog)

	function clickDialogService(event)
	{
		resetTimerCounter();
		event.stopPropagation()
		let	target = event.target,
			onProfile = !!target.closest(".divRecord"),
			onNormalCell = (target.nodeName === "TD" && target.colSpan === 1),
			isHideColumn = target.cellIndex === PROFILESV,
			onDivRecord = /divRecord/.test(target.className),
			onImage = target.nodeName === "IMG"

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
				showInputColor(target)
				return
			} else {
				target = target.closest('td')
			}
		}
		if (pointer) {
			if (target === pointer) {
				return
			}
			savePreviousCellService()
			if (onNormalCell || onProfile) {
				editPresentCellService(event, target)
			} else {
				clearEditcell()
			}
		} else {
			if (onNormalCell || onProfile) {
				editPresentCellService(event, target)
			}
		}
	}

	function showProfile() {
		$servicetbl.addClass("showColumn8")
		$dialogService.find(".fixed").addClass("showColumn8")
		$(".divRecord").show()
		$imgopen.hide()
		$imgclose.show()
	}

	function hideProfile() {
		$servicetbl.removeClass("showColumn8")
		$dialogService.find(".fixed").removeClass("showColumn8")
		$(".divRecord").hide()
		$imgopen.show()
		$imgclose.hide()
	}
			
	function resizeDialog()
	{
		$dialogService.dialog({
			width: winWidth(95),
			height: winHeight(95)
		})
		winResizeFix($servicetbl, $dialogService)
	}
}

// Simulate hover on icon by changing background pics
function hoverService()
{
	let	tdClass = "td.pacs, td.upload"

	hoverCell(tdClass)
}

function hoverCell(tdClass)
{
	let	paleClasses = ["pacs", "upload"],
		boldClasses = ["pacs2", "upload2"]

	$(tdClass)
		.mousemove(function(event) {
			if (inPicArea(event, this)) {
				getClass(this, paleClasses, boldClasses)
			} else {
				getClass(this, boldClasses, paleClasses)
			}
		})
		.mouseout(function (event) {
			getClass(this, boldClasses, paleClasses)
		})
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

// Use existing DOM table to refresh when editing
export function reViewService() {
	let $servicetbl = $("#servicetbl"),
		$rows = $servicetbl.find("tr"),
		$servicecells = $("#servicecells"),
		len = $rows.length
		staffname = "",
		i = 0, scase = 0,
		classname = ""

	$.each( SERVICE, function() {
		if (this.staffname !== staffname) {
			staffname = this.staffname
			scase = 0
			i++
			$staff = $rows.eq(i).children("td").eq(CASENUMSV)
			if ($staff.prop("colSpan") === 1) {
				$staff.prop("colSpan", QNSV - CASENUMSV)
					.addClass("serviceStaff")
						.siblings().hide()
			}
			$staff.html(staffname)
		}
		i++
		scase++
		if (i === len) {
			$("#servicecells").find("tr").clone()
				.appendTo($("#servicetbl").find("tbody"))
			len++
		}
		classname = countService(this)
		$row = $rows.eq(i)
		$cells = $row.children("td")
		if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
			$cells.eq(CASENUMSV).prop("colSpan", 1)
				.nextUntil($cells.eq(QNSV)).show()
		}
		$row.filldataService(this, scase, classname)
	});
	if (i < (len - 1)) {
		$rows.slice(i+1).remove()
	}
	countAllServices()
}

jQuery.fn.extend({
	filldataService : function(bookq, scase, classes) {
		let	row = this[0],
			cells = row.cells

		row.className = classes
		if (bookq.hn && isPACS) { cells[HNSV].className = "pacs" }
		if (bookq.hn) { cells[NAMESV].className = "upload" }

		cells[CASENUMSV].innerHTML = scase
		cells[HNSV].innerHTML = bookq.hn
		cells[NAMESV].innerHTML = putNameAge(bookq)
		cells[DIAGNOSISSV].innerHTML = bookq.diagnosis
		cells[TREATMENTSV].innerHTML = bookq.treatment
		cells[ADMISSIONSV].innerHTML = bookq.admission
		cells[FINALSV].innerHTML = bookq.final
		while(cells[PROFILESV].firstChild) cells[PROFILESV].firstChild.remove()
		cells[PROFILESV].appendChild(showRecord(bookq))
		cells[ADMITSV].innerHTML = putThdate(bookq.admit)
		cells[OPDATESV].innerHTML = putThdate(bookq.opdate)
		cells[DISCHARGESV].innerHTML = putThdate(bookq.discharge)
		cells[QNSV].innerHTML = bookq.qn
	}
})

function showRecord(bookq)
{
	let $divRecord = $("#profileRecord > div").clone()

	initRecord(bookq, $divRecord)
	inputEditable($divRecord)
	return $divRecord[0]
}

// this.name === column in Mysql
// this.title === value of this item
// add qn to this.name to make it unique
// next sibling (span) right = wide pixels, to make it (span) contained in input box
function initRecord(bookq, $divRecord)
{
	let $input = $divRecord.find("input"),
		inputName = "",
		wide = ""

	$input.each(function() {
		inputName = this.name
		this.checked = this.title === bookq[inputName]
		this.name = inputName + bookq.qn
		wide = this.className.replace("w", "") + "px"
		this.nextElementSibling.style.right = wide
	})
}

function inputEditable($divRecord)
{
	if (editableSV) {
		$divRecord.find("input").prop("disabled", false)
	} else {
		$divRecord.find("input").prop("disabled", true)
	}
}
