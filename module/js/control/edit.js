
import { savePreviousCell, editPresentCell } from "./clicktable.js"
import {
	PATIENT, DIAGNOSIS, TREATMENT, CONTACT,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV
} from "../model/const.js"
import { resetTimer, resetTimerCounter } from "./timer.js"
import { getTableRowByQN } from "../util/getrows.js"
import { reposition } from "../util/util.js"
import { savePreviousCellService } from "../service/savePreviousCellService.js"
import { editPresentCellService } from "../service/editPresentCellService.js"
import { clearAllEditing } from "./clearAllEditing.js"

const EDITABLESV = [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV]
const EDITABLETBL = [DIAGNOSIS, TREATMENT, CONTACT]

// the current position
export let POINTER = null

// the content before keyin
export let OLDCONTENT = ""

// get current content in the editing cell
export function getNewcontent() {
	let editcell = document.getElementById("editcell")
	let spin = document.getElementById("spin")

	if (!!spin) { return spin.value }

	return getHtmlText(editcell)
}

// newcontent is the content currently in editcell
// and must be fetched from editcell itself every time when wanted

// Initialize $editcell
// Attach events to editcell all the time
export function editcellEvent()
{
	let $editcell = $("#editcell")

	$editcell.off("click").on("click", (event) => {
		resetTimer();
		event.stopPropagation()
	}).keydown(event => {
		let keycode = event.which || window.event.keyCode

		keyin(event, keycode, POINTER)
		resetTimerCounter()
	// resize editcell along with underlying td
	}).keyup(event => {

		// not resize opdate & roomtime cells
		if (POINTER.cellIndex < 2) {
			return
		}

		let keycode = event.which || window.event.keyCode

		// not resize after non-char was pressed
		if (keycode < 32)	{ return }

		POINTER.innerHTML = $editcell.html()
		$editcell.height($(POINTER).height())
		reposition($editcell, "center", "center", POINTER)
	})
}

// function declaration (definition ) : public
// function expression (literal) : local

// Key on main or staff table
let keyin = function (evt, keycode) {
  let tableID = $(POINTER).closest('table').attr('id'),
    servicetbl = tableID === "servicetbl",
    editable = servicetbl ? EDITABLESV : EDITABLETBL,
    Shift = evt.shiftKey,
    Ctrl = evt.ctrlKey

	switch(keycode)
	{
		case 27: 
			clearAllEditing()
			evt.preventDefault()
			return false
		case 9: 
			servicetbl
			? serviceTable9(evt, editable, Shift)
			: mainTable9(evt, editable, Shift)
			evt.preventDefault()
			return false
		case 13: 
			servicetbl
			? serviceTable13(evt, editable, Shift, Ctrl)
			: mainTable13(evt, editable, Shift, Ctrl)
			evt.preventDefault()
			return false
	}

	if ($("#stafflist").is(":visible")) {
      evt.preventDefault()
	  return false
	}
}

let mainTable9 = function (evt, editable, Shift) {
	clearMenu()
	savePreviousCell()
	let thiscell = Shift
			? findPrevcell(editable, POINTER)
			: findNextcell(editable, POINTER)
	thiscell
		? editPresentCell(evt, thiscell)
		: clearEditcell()
}

let serviceTable9 = function (evt, editable, Shift) {
	savePreviousCellService()
	let thiscell = Shift
			? findPrevcell(editable, POINTER)
			: findNextcell(editable, POINTER)
	thiscell
		? editPresentCellService(evt, thiscell)
		: clearEditcell()
}

let mainTable13 = function (evt, editable, Shift, Ctrl) {
	clearMenu()
	if (Shift || Ctrl) { return }
	savePreviousCell()
	let thiscell = findNextRow(editable, POINTER)
	thiscell && !$("#spin").is(":visible")
		? editPresentCell(evt, thiscell)
		: clearEditcell()
}

let serviceTable13 = function (evt, editable, Shift, Ctrl) {
	if (Shift || Ctrl) { return }
	savePreviousCellService()
	let thiscell = findNextRow(editable, POINTER)
	thiscell
		? editPresentCellService(evt, thiscell)
		: clearEditcell()
}

let findPrevcell = function (editable, pointing) {
	let $prevcell = $(pointing),
		column = $prevcell.index(),
		prevcell = function () {
			// go to prev row last editable
			// null : the first row of main table tr.index() = 1
			// Service Table cell may invisible due to colspan
			do {
				$prevcell = $prevcell.parent().index() > 1
							? $prevcell.parent().prev()
								.children().eq(editable[editable.length-1])
							: null
			}
			while ($prevcell && $prevcell.get(0).nodeName === "TH"
				|| $prevcell && !$prevcell.is(':visible'))

			return $prevcell && $prevcell[0]
		}
	
	column = editable[($.inArray(column, editable) - 1)]
	return column
			? $prevcell.parent().find("td")[column]
			: prevcell()
}

let findNextcell = function (editable, pointing) {
	let $nextcell = $(pointing),
		column = $nextcell.index()

	column = editable[($.inArray(column, editable) + 1)]

	return column
			? $nextcell.parent().find("td")[column]
			: findNextRow(editable, pointing)
}

let findNextRow = function (editable, pointing) {
	let $nextcell = $(pointing)

	// go to next row first editable
	// $nextcell.length = 0 when reach end of table
	// Service Table cell may invisible due to colspan
	do {
		$nextcell = $nextcell.parent().next().children().eq(editable[0])
	}
	while ($nextcell.length && ((!$nextcell.is(':visible'))
		|| ($nextcell.get(0).nodeName === "TH")))

	return $nextcell.length && $nextcell[0]
}

export function createEditcell(pointing)
{
	let $pointing = $(pointing)
	let height = $pointing.height() + "px"
	let width = $pointing.width() + "px"
	let context = getHtmlText(pointing).replace(/Consult<br>.*$/, "")

	$("#editcell").html(context)
	showEditcell($pointing, height, width)
	editcellSaveData(pointing, context)
}

// re-render editcell for keyin cell only
export function reCreateEditcell()
{
	if (POINTER.cellIndex > PATIENT) {
		createEditcell(POINTER)
	}
}

// Update module variables
// after update from other user while idling
export function editcellSaveData(pointing, content) {
	POINTER = pointing
	OLDCONTENT = content
}

let showEditcell = function ($pointing, height, width) {
	let $editcell = $("#editcell")

	$editcell.css({
		height: height,
		width: width,
		fontSize: $pointing.css("fontSize")
	})
	$editcell.appendTo($pointing.closest('div'))
	reposition($editcell, "left center", "left center", $pointing)
	$editcell.focus()
}

// after DOM refresh by refillall, POINTER remains in its row but its parent is null
// must get qn to find current row position
export function renewEditcell()
{
  let whereisEditcell = editcellLocation()
  let id = (whereisEditcell === "tblcontainer")
         ? "tbl"
		 : (whereisEditcell === "queuecontainer")
		 ? "queuetbl"
		 : (whereisEditcell === "dialogService")
		 ? "servicetbl"
		 : ""
  let qn = $(POINTER).siblings(":last").html()
  let row = id && qn && getTableRowByQN(id, qn)
  let cell = POINTER.cellIndex

  if (row) {
    let pointing = row.cells[cell]
    createEditcell(pointing)
  }
}

export function editcellLocation()
{
	return $("#editcell").parent("div").attr("id")
}

export function clearEditcell() {
	let $editcell = $("#editcell")

	POINTER = ""
	OLDCONTENT = ""
	$editcell.html("")
	$editcell.hide()
}

// TRIM excess spaces at begin, mid, end
// remove html tags except <br>
let getHtmlText = function (cell) {
	let HTMLTRIM		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g,
		HTMLNOBR		= /(<((?!br)[^>]+)>)/ig

	return cell && cell.innerHTML.replace(HTMLTRIM, '').replace(HTMLNOBR, '')
}

let clearMenu = function() {
	$('#menu').hide();
	$('#stafflist').hide();
}
