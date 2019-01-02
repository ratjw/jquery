import { savePreviousCell, editPresentCell } from "./clicktable.js"
import {
	STAFFNAME, HN, DIAGNOSIS, TREATMENT, CONTACT, QN,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV
} from "../model/const.js"
import { resetTimer, resetTimerCounter } from "./updating.js"
import { getTableRowByQN } from "../util/getrows.js"
import { reposition } from "../util/util.js"
import { savePreviousCellService } from "../service/savePreviousCellService.js"
import { editPresentCellService } from "../service/editPresentCellService.js"
import { clearAllEditing } from "./clearAllEditing.js"

// pointer is the current position
// pointing is new coming position to update to
export let pointer = null

// oldcontent is the content before keyin
export let oldcontent = ""

// get current content in the editing cell
export function getNewcontent() {
	return getHtmlText($("#editcell"))
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

		keyin(event, keycode, pointer)

		if (!$("#spin").length) {
		  resetTimerCounter()
		}
		if (editcellLocation() === "tblcontainer" && pointer.cellIndex === STAFFNAME) {
		  return false
		}
		if (keycode === 27) {
			clearAllEditing()
			return false
		}
	// resize editcell along with underlying td
	}).keyup(event => {

		// not resize opdate & roomtime cells
		if (pointer.cellIndex < 2) {
			return
		}

		let keycode = event.which || window.event.keyCode

		// not resize after non-char was pressed
		if (keycode < 32)	{ return }

		pointer.innerHTML = $editcell.html()
		$editcell.height($(pointer).height())
		reposition($editcell, "center", "center", pointer)
	})
}

// function declaration (definition ) : public
// function expression (literal) : local

// Key on main or staff table
let keyin = function (evt, keycode) {
	let	tableID = $(pointer).closest('table').attr('id'),
		servicetbl = tableID === "servicetbl",
		EDITABLE = servicetbl
				? [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV]
				: [DIAGNOSIS, TREATMENT, CONTACT],
		Shift = evt.shiftKey,
		Ctrl = evt.ctrlKey,
		thiscell,
		code = {}

	code[27] = function () {
		// Restore oldcontent
		pointer.innerHTML = oldcontent
		clearMenu()
		clearEditcell()
	}
	code[9] = function () {
		let mainTable = function () {
			clearMenu()
			savePreviousCell()
			thiscell = Shift
					? findPrevcell(EDITABLE, pointer)
					: findNextcell(EDITABLE, pointer)
			thiscell
				? editPresentCell(evt, thiscell)
				: clearEditcell()
		},
		serviceTable = function () {
			savePreviousCellService()
			thiscell = Shift
					? findPrevcell(EDITABLE, pointer)
					: findNextcell(EDITABLE, pointer)
			thiscell
				? editPresentCellService(evt, thiscell)
				: clearEditcell()
		}

		servicetbl ? serviceTable() : mainTable()
		evt.preventDefault()
		return false
	}
	code[13] = function () {
		let mainTable = function () {
			clearMenu()
			if (Shift || Ctrl) { return }
			savePreviousCell()
			thiscell = findNextRow(EDITABLE, pointer)
			thiscell
				? editPresentCell(evt, thiscell)
				: clearEditcell()
		},
		serviceTable = function () {
			if (Shift || Ctrl) { return }
			savePreviousCellService()
			thiscell = findNextRow(EDITABLE, pointer)
			thiscell
				? editPresentCellService(evt, thiscell)
				: clearEditcell()
		}

		servicetbl ? serviceTable() : mainTable()
		evt.preventDefault()
		return false
	}

	return code[keycode] && code[keycode]()
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
	let context = getHtmlText($pointing).replace(/Consult<br>.*$/, "")

	$("#editcell").html(context)
	showEditcell($pointing, height, width)
	editcellSaveData(pointing, context)
}

// Update module variables
// after update from other user while idling
export function editcellSaveData(pointing, content) {
	pointer = pointing
	oldcontent = content
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

// Another client updated table while this is idling with visible editcell
// Update editcell content to the same as underlying table cell
export function updateEditcellContent() {
	let $pointer = $(pointer),
		content = getHtmlText($pointer)

	oldcontent = content
	$("#editcell").html(content)
}

// after DOM refresh by refillall, pointer remains in its row but its parent is null
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
  let qn = $(pointer).siblings(":last").html()
  let row = id && getTableRowByQN(id, qn)
  let cell = pointer.cellIndex

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

	pointer = ""
	oldcontent = ""
	$editcell.html("")
	$editcell.hide()
}

// TRIM excess spaces at begin, mid, end
// remove html tags except <br>
let getHtmlText = function ($cell) {
	let HTMLTRIM		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g,
		HTMLNOBR		= /(<((?!br)[^>]+)>)/ig

	return $cell.length && $cell.html()
							.replace(HTMLTRIM, '')
							.replace(HTMLNOBR, '')
}

let clearMenu = function() {
	$('#menu').hide();
	$('#stafflist').hide();
}
