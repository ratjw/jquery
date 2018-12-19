
import {
	HN, DIAGNOSIS, TREATMENT, CONTACT, QN,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV
} from "./const.js"

import { savePreviousCell, editPresentCell } from "./control.js"
import { savePreviousCellService, editPresentCellService } from "./serv.js"
import { resetTimer } from "./util.js"
export {
	createEditcellOpdate, createEditcellRoomtime, createEditcell,
	updateEditcellData, clearEditcell, reposition,
	getPointer, getOldcontent, getNewcontent
}

// Store $("#editcell") instance for use in this entire module
let $editcell = null

// pointer is the current position
// pointing is new coming position to update to
let pointer = null

// oldcontent is the content before keyin
let oldcontent = ""

// newcontent is the content currently in editcell
// and must be fetched from editcell every time when wanted

// to check the pointer still points to same case after reViewAll while idling
let qn = 0

// Initialize $editcell
// Attach events to editcell all the time
$(function() {
	$editcell = $("#editcell")
	$editcell.on("click", function (event) {
		resetTimer();
		event.stopPropagation()
	}).on("keydown", function (event) {
		let keycode = event.which || window.event.keyCode

		resetTimer();
		keyin(event, keycode)
	
	// resize editcell along with underlying td
	}).on("keyup", function (event) {

		// not resize opdate & roomtime cells
		if (pointer.cellIndex < 2) {
			return
		}

		let keycode = event.which || window.event.keyCode

		// not resize after non-char was pressed
		if (keycode < 32)	{
			return
		}

		pointer.innerHTML = $editcell.html()
		$editcell.css({
			height: $(pointer).height() + "px"
		})
		reposition($editcell, "center", "center", pointer)
	})
})

// function declaration (definition ) : public
// function expression (literal) : local

// Key on main or staff table
let keyin = function (event, keycode) {
	let	tableID = $(pointer).closest('table').attr('id'),
		servicetbl = tableID === "servicetbl",
		EDITABLE = servicetbl
				? [DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV]
				: [DIAGNOSIS, TREATMENT, CONTACT],
		Shift = event.shiftKey,
		Ctrl = event.ctrlKey,
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
				? editPresentCell(thiscell)
				: clearEditcell()
		},
		serviceTable = function () {
			savePreviousCellService()
			thiscell = Shift
					? findPrevcell(EDITABLE, pointer)
					: findNextcell(EDITABLE, pointer)
			thiscell
				? editPresentCellService(thiscell)
				: clearEditcell()
		}

		servicetbl ? serviceTable() : mainTable()
		event.preventDefault()
		return false
	}
	code[13] = function () {
		let mainTable = function () {
			clearMenu()
			if (Shift || Ctrl) { return }
			savePreviousCell()
			thiscell = findNextRow(EDITABLE, pointer)
			thiscell
				? editPresentCell(thiscell)
				: clearEditcell()
		},
		serviceTable = function () {
			if (Shift || Ctrl) { return }
			savePreviousCellService()
			thiscell = findNextRow(EDITABLE, pointer)
			thiscell
				? editPresentCellService(thiscell)
				: clearEditcell()
		}

		servicetbl ? serviceTable() : mainTable()
		event.preventDefault()
		return false
	}

	let	anyOthers = function () {
		// no keyin on date
		if (pointer.cellIndex === 0) {
			event.preventDefault()
			return false
		}
		return true
	}

	return (code[keycode] || anyOthers)()
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

// On first column, editcell include CSS:before Thai name of day
function createEditcellOpdate(pointing) {
	let $pointing = $(pointing),
		height = $pointing.height() + "px",
		width = $pointing.width() + "px",
		context = ""

	// to show Thai name of day in editcell div
	context = window.getComputedStyle(pointing,':before').content
	context = context.replace(/\"/g, "")
	context = context + pointing.innerHTML
	$editcell.html(context)
	editcellSaveData(pointing, context)
	showEditcell($pointing, height, width)
}

// Make editcell for selectRoomTime spinner
function createEditcellRoomtime(pointing) {
	let $pointing = $(pointing),
		height = "",
		width = 77 + "px",
		context = pointing.innerHTML

	editcellSaveData(pointing, context)
	showEditcell($pointing, height, width)
}

function createEditcell(pointing) {
	let $pointing = $(pointing),
		height = $pointing.height() + "px",
		width = $pointing.width() + "px",
		context = getHtmlText($pointing)

	$editcell.html(context)
	editcellSaveData(pointing, context)
	showEditcell($pointing, height, width)
}

// Update module variables
// Include qn to check if editcell stay on same case
// after update from other user while idling
let editcellSaveData = function (pointing, context) {
	pointer = pointing
	oldcontent = context
	qn = $(pointing).closest('tr').find("td")[QN].innerHTML
}

let showEditcell = function ($pointing, height, width) {

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
function updateEditcellData() {
	let $pointer = $(pointer),
		data = getHtmlText($pointer),
		newqn = $pointer.length
			&& $pointer.closest('tr').find("td")[QN].innerHTML

	qn === newqn
	? oldcontent !== data && (oldcontent = data, $editcell.html(data))
	: clearEditcell()
}

function clearEditcell() {
	pointer = ""
	oldcontent = ""
	qn = ""
	$editcell.html("")
	$editcell.hide()
}

// Retrieve data stored in edit module
function getPointer() {
	return pointer
}

function getOldcontent() {
	return oldcontent
}

function getNewcontent() {
	return getHtmlText($editcell)
}

// Strip html to text
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

function reposition($me, mypos, atpos, target, within) {
	$me.show()
	$me.position({
		my: mypos,
		at: atpos,
		of: target,
		within: within
	})
}
