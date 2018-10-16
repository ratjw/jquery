
// tbl, queuetbl
import {
	OPDATE, OPROOM, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	BOOK, CONSULT, LARGESTDATE,
	updateBOOK
} from "./control.js"

import { clearEditcell, reposition } from "./edit.js"
import { makeEquipTable } from "./equip.js"
import { serviceReview } from "./serv.js"
import { getOpdate, Alert, winWidth, winHeight, UndoManager } from "./util.js"

import {
	modelChangeDate, modelAllCases, modelCaseHistory,
	modelAllDeletedCases, modelUndelete, modelFind, modelDeleteCase
} from "./model.js"

import {
	viewChangeDate, viewDeleteCase, viewAllCases,
	viewCaseHistory, viewDeletedCases, viewUndelete, viewFind,
	viewStaffqueue
} from "./view.js"

export { mainMenu, menustyle, clearMouseoverTR }

// function declaration (definition ) : public
// function expression (literal) : local

// Click on Date column -> disabled some menu-items for the current row
// Menu for the current row -> addrow, postpone, changedate, equip, history of editing, del
// Menu for all cases -> viewStaffqueue, service, all deleted, search, readme
function mainMenu(pointing) {
	let tableID = $(pointing).closest('table').attr('id'),
		$rowi = $(pointing).closest('tr'),
		rowi = $rowi[0],
		tcell = rowi.cells,
		waitnum = rowi.title,
		opdate = getOpdate(tcell[OPDATE].innerHTML),
		staffname = tcell[STAFFNAME].innerHTML,
		qn = tcell[QN].innerHTML

	disable(qn, "#addrow")

	disable((qn && staffname && (opdate !== LARGESTDATE)), "#postpone")

	disable(qn, "#changedate")

	disable(qn, "#equip")

	disable(qn, "#history")

	let unused = !!checkUnusedRow(BOOK, opdate, qn),
		del = !!qn || unused
	disable(del, "#del")

	let args = {
		"pointing": pointing,
		"tableID": tableID,
		"$rowi": $rowi,
		"rowi": rowi,
		"waitnum": waitnum,
		"opdate": opdate,	// Thai to ISO date
		"staffname": staffname,
		"qn": qn
	},
		$menu = $("#menu")
	$menu.menu({
		select: function( event, ui ) {

			let choose = $(ui.item).attr("id")
			let items = {
				"addrow": { fn: addnewrow, args: [tableID, $rowi] },
				"postpone": { fn: postpone, args: [args] },
				"changedate": { fn: changeDate, args: [args] },
				"equip": { fn: makeEquipTable, args: [$rowi, qn] },
				"history": { fn: caseHistory, args: [rowi, qn]},
				"del": { fn: deleteCase, args: [args] },
				"staffqueue": { fn: viewStaffqueue, args: [ui.item.text()] },
				"service": { fn: serviceReview, args: null },
				"deleted": { fn: allDeletedCases, args: null },
				"notdeleted": { fn: allCases, args: null },
				"search": { fn: find, args: null },
				"readme": { fn: readme, args: null }
			}

			items[choose].fn.apply(this, items[choose].args)
			clearEditcell()
			$menu.hide()		// to disappear after selection
			event.stopPropagation()
		}
	});

	// click on parent of submenu
	$('#menu li > div').off("click").on("click", function(event){
		if ($(this).siblings('ul').length > 0){
			event.preventDefault()
			event.stopPropagation()
		}
	});

	let width = $menu.outerWidth(),
		$container = $(pointing).closest('div')

	$menu.appendTo($container)
	reposition($menu, "left top", "left bottom", pointing, $container)
	menustyle($menu, pointing, width)
}

let disable = function (item, id) {
	let disabled = "ui-state-disabled"

	item ? $(id).removeClass(disabled) : $(id).addClass(disabled)
}

// Shadow down when menu is below target row (high on screen)
// Shadow up when menu is higher than target row (low on screen)
let menustyle = function ($me, target, width) {
	let shadow = ($me.position().top > $(target).position().top)
					? '10px 20px 30px slategray'
					: '10px -20px 30px slategray'
	$me.css({
		width: width,
		boxShadow: shadow
	})
}

// Unused row is user-added new row
// The row with no QN is
//	1. Has cases in this date, an unused row can be removed.
//	2. No case in this date, a null row can't be removed.
let checkUnusedRow = function (book, opdate, qn) { 
	return !qn && ($.grep( book, function (e) {
						return e.opdate === opdate
					})).length
}

let addnewrow = function (tableID, $rowi) {

	addrow(tableID, $rowi)

	UndoManager.add({
		undo: function() {
			$rowi.next().remove()
		},
		redo: function() {
			addrow(tableID, $rowi)
		}
	})		
}

// Only 2 tables :
// "tbl" copy title, Date, Room Time
// "queuetbl" copy title, Date, Room Time, Staff
let addrow = function (tableID, $rowi) {
	let keepcell = tableID === "tbl" ? OPDATE : STAFFNAME

	$rowi.clone()
		.insertAfter($rowi)
			.find("td").eq(HN).removeClass("pacs")
			.parent().find("td").eq(PATIENT).removeClass("camera")
			.parent().find("td").eq(keepcell)
				.nextAll()
					.html("")
}

// Undefined date booking has opdate = LARGESTDATE but was shown blank date on screen
let postpone = function (args) {

	args.thisDate = LARGESTDATE
	doChangeDate(args)

	UndoManager.add({
		undo: function() {
			args.thisDate = args.opdate
			doChangeDate(args)
		},
		redo: function() {
			args.thisDate = LARGESTDATE
			doChangeDate(args)
		}
	})		
}

// Mark the case and initiate mouseoverTR to move the case to
let changeDate = function (args) {
	let $mouseoverTR = $("#tbl tr, #queuetbl tr"),
		$pointing = $(args.pointing)

	$pointing.closest('tr').addClass("changeDate")
	$mouseoverTR.on({
		"mouseover": function() { $(this).addClass("pasteDate") },
		"mouseout": function() { $(this).removeClass("pasteDate") },
		"click": function(event) {
			event.stopPropagation()
			clearMouseoverTR()

			let thisDate = getOpdate($(this).children("td").eq(OPDATE).html())

			//!thisDate = click on th
			if (!thisDate || (args.opdate === thisDate)) {
				return false
			}

			let RoomTime = getRoomTime($pointing.closest('tr'), $(this))
			args.oproom = RoomTime[0]
			args.optime = RoomTime[1]
			args.thisDate = thisDate

			let argsUndo = {}
			argsUndo = $.extend(argsUndo, args)
			argsUndo.thisDate = args.opdate

			doChangeDate(args)

			UndoManager.add({
				undo: function() {
					doChangeDate(argsUndo)
				},
				redo: function() {
					doChangeDate(args)
				}
			})		
		}
	});
	$(document).off("keydown").on("keydown", function(event) {
		let keycode = event.which || window.event.keyCode
		if (keycode === 27)	{
			clearMouseoverTR()
		}
	})
}

let doChangeDate = function (args) {

	modelChangeDate(args).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewChangeDate(args)
		}

		;/BOOK/.test(response) ? hasData() : Alert ("changeDate", response)
	}).catch(error => {})
}

// Clear all changeDate setups
function clearMouseoverTR() {
	let $mouseoverTR = $("#tbl tr, #queuetbl tr")
	$mouseoverTR.off("mouseover");
	$mouseoverTR.off("click");
	$mouseoverTR.off("mouseout");
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
	$(document).off("keydown")
}

// Remove the row if more than one case on that date, or on staff table
// Just blank the row if there is only one case
let deleteCase = function (args) {

	let argsUndo = {}
	argsUndo = $.extend(argsUndo, args)
	args.waitnum = null
	delCase(args)

	UndoManager.add({
		undo: function() {
			if (!args.qn) {	
				addrow(args.tableID, args.$rowi)
				return
			}
			delCase(argsUndo)
		},
		redo: function() {
			args.waitnum = null
			delCase(args)
		}
	})		
}

let delCase = function (args) {
	let $rowi = args.$rowi,
		waitnum = args.waitnum,
		opdate= args.opdate,
		staffname = args.staffname,
		qn = args.qn

	// from add new row
	if (!qn) {	
		$rowi.remove()
		return
	}

	modelDeleteCase(waitnum, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewDeleteCase(opdate, staffname)
		}

		;/BOOK/.test(response) ? hasData() : Alert ("deleteCase", response)
	}).catch(error => {})
}

// All cases (exclude the deleted ones)
let allCases = function () {
	modelAllCases().then(response => {
		if (/dob/.test(response)) {
			viewAllCases(response)
		} else {
			Alert("allCases", response)
		}
	}).catch(error => {})

	clearEditcell()
}

// Trace all data changes history of specified case
// Sort edit datetime from newer to older
let caseHistory = function (rowi, qn) {
	modelCaseHistory(qn).then(response => {
		/dob/.test(response)
		? viewCaseHistory(rowi, response)
		: Alert("caseHistory", response)
	}).catch(error => {})

	clearEditcell()
}

// All deleted and still deleted cases (exclude the undeleted ones)
let allDeletedCases = function () {
	modelAllDeletedCases().then(response => {
		if (/editdatetime/.test(response)) {
			viewDeletedCases(response)
			$("#undel").off("click").on("click", function () {
				doUndelete(this)
			})
		} else {
			Alert("allDeletedCases", response)
		}
	}).catch(error => {})

	clearEditcell()
}

function doUndelete (thatcase) {
//	let UNDELEDITDATETIME	= 0;
	let UNDELOPDATE			= 1;
	let UNDELSTAFFNAME		= 2;
//	let UNDELHN				= 3;
//	let UNDELPATIENT		= 4;
//	let UNDELDIAGNOSIS		= 5;
//	let UNDELTREATMENT		= 6;
//	let UNDELCONTACT		= 7;
//	let UNDELEDITOR			= 8;
	let UNDELQN				= 9;

	// .data("case", this) from viewDeletedCases
	let thiscase = $(thatcase).data("case"),
		$thiscase = $(thiscase).parent(),
		$thiscell = $thiscase.children("td"),
		opdate = getOpdate($thiscell.eq(UNDELOPDATE).html()),
		staffname = $thiscell.eq(UNDELSTAFFNAME).html(),
		qn = $thiscell.eq(UNDELQN).html(),
		args = {}
	args.$rowi = $thiscase
	args.waitnum = null
	args.opdate = opdate
	args.staffname = staffname
	args.qn = qn

	doUndel(opdate, staffname, qn)

	UndoManager.add({
		undo: function() {
			delCase(args)
			allDeletedCases()
		},
		redo: function() {
			doUndel(opdate, staffname, qn)
		}
	})		
}

function doUndel (opdate, staffname, qn) {

	modelUndelete(opdate, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewUndelete(opdate, staffname, qn)
		};

		;/BOOK/.test(response) ? hasData() : Alert("undelete", response)
	}).catch(error => {})

	$('#dialogDeleted').dialog("close")
}

// Make dialog box find to get inputs for searching
// This searches all cases in database
// Intrinsic browser find (ctrl-F) search strings on current table only
let find = function () {
	let $find = $("#find")
		$find.css("height", 0)
	let findinput = $find.dialog({
		title: "Find",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: 350,
		height: 350,
		buttons: [
			{
				text: "OK",
				click: function() {
					let hn = $('input[name="hn"]').val()
					let patient = $('input[name="patient"]').val()
					let diagnosis = $('input[name="diagnosis"]').val()
					let treatment = $('input[name="treatment"]').val()
					let contact = $('input[name="contact"]').val()
					if (!hn && !patient && !diagnosis && !treatment && !contact) {
						return
					}
					sqlFind(hn, patient, diagnosis, treatment, contact)
					$( this ).dialog( "close" );
				}
			}
		]
	})
	// Make Enter key to immitate OK button click
	$find.off("keydown").on("keydown", function(event) {
		let buttons = findinput.dialog('option', 'buttons'),
			keycode = event.which || window.event.keyCode;

		(keycode === 13) && buttons[0].click.apply(findinput)
	})
}

let sqlFind = function (hn, patient, diagnosis, treatment, contact) {

	modelFind(hn, patient, diagnosis, treatment, contact).then(response => {
		;/dob/.test(response)
		? viewFind(response, hn)
		: Alert("Find", "Not found " + response)
	}).catch(error => {})

	clearEditcell()
}

// Make dialog box dialogReadme containing <div id="dialogReadme"> Readme/Help
let readme = function () {
	$('#dialogReadme').show()
	$('#dialogReadme').dialog({
		title: "ReadMe",
		closeOnEscape: true,
		modal: true,
		hide: 200,
		width: winWidth() * 5 / 10,
		minWidth: 400,
		height: winHeight() * 9 / 10
	}).fadeIn();
}
