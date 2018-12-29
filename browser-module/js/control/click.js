
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
	DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, QN
} from "../model/const.js"

import {
	getPointer, getOldcontent, getNewcontent, createEditcell, clearEditcell
} from "./edit.js"

import { makeEquipTable } from "../model/equip.js"
import { oneRowMenu, clearMouseoverTR } from "../model/menu.js"
import {
	modelSaveOpRoom, modelSaveContentQN, modelSaveContentNoQN, modelGetNameHN
} from "../model/model.js"

import {
	viewSaveContentQN, viewSaveContentNoQN, viewGetNameHN
} from "../view/view.js"

import {
	getBOOK, getCONSULT, isPACS, gettimestamp, getOpdate, calcWaitnum, URIcomponent,
	Alert, UndoManager, updateBOOK, showUpload, menustyle, reposition, isConsultsTbl,
	inPicArea
} from "../model/util.js"

// Click on main or staff table
export function clicktable(evt, clickedCell) {
	savePreviousCell()
	editPresentCell(evt, clickedCell)
}

export function savePreviousCell() {
	let pointed = getPointer(),
		oldcontent = getOldcontent(),
		newcontent = getNewcontent(),
		cell = pointed && pointed.cellIndex,
		save = {}

	if ($("#spin").is(":visible")) { newcontent = $("#spin").val() }

	if (!pointed || (oldcontent === newcontent)) { return }

	save[OPDATE] = null
	save[THEATRE] = function () { saveTheatre(pointed, newcontent) }
	save[OPROOM] = function () { saveOpRoom(pointed, newcontent) }
	save[OPTIME] = function () { saveContent(pointed, "optime", newcontent) }
	save[CASENUM] = function () { saveCaseNum(pointed, newcontent) }
	save[STAFFNAME] = null
	save[HN] = function () { saveHN(pointed, newcontent) }
	save[PATIENT] = null
	save[DIAGNOSIS] = function () { saveContent(pointed, "diagnosis", newcontent) }
	save[TREATMENT] = function () { saveContent(pointed, "treatment", newcontent) }
	save[CONTACT] = function () { saveContent(pointed, "contact", newcontent) }
	save[CONTACT] = function () { saveContent(pointed, "contact", newcontent) }

	if (save[cell]) { save[cell]() }
}

export function saveTheatre(pointed, newcontent)
{
	let	$cell = $(pointed).closest("tr").find("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cell[QN].innerHTML,
		allOldCases = [],
		allNewCases = []

	allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	allOldCases.filter(e => e !== qn)

	allNewCases = sameDateRoomTableQN(opdateth, oproom, newcontent)
	if (casenum) {
		allNewCases.splice(casenum-1, 0, qn)
	} else {
		allNewCases.push(qn)
	}

	if (!allOldCases.length && !allNewCases.length) { return }

	modelSaveTheatre(allOldCases, allNewCases, newcontent, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSaveTheatre(opdate, staffname)
		}

		typeof response === "object"
		? hasData()
		: Alert ("saveTheatre", response)
	})
}

export function saveOpRoom(pointed, newcontent) {
	let $cells = $(pointed).closest('tr').children("td"),
		opdateth = $cell[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cell[THEATRE].innerHTML,
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cells[QN].innerHTML,
		oldcontent = getOldcontent(),
		allOldCases = [],
		allNewCases = []

	if (oproom) {
		allOldCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		allOldCases = allOldCases.filter(e => e !== qn)
	}

	if (newcontent) {
		allNewCases = sameDateRoomTableQN(opdateth, newcontent, theatre)
		if (casenum) {
			allNewCases.splice(casenum-1, 0, qn)
		} else {
			allNewCases.push(qn)
		}
	}

	if (!allOldCases.length && !allNewCases.length) { return }

	let doSaveOpRoom = function() {
		modelSaveOpRoom(allOldCases, allNewCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}


	let undoSaveOpRoom = function() {
		modelSaveOpRoom(allNewCases, allOldCases, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveOpRoom(opdate, staffname)
			};

			typeof response === "object"
			? hasData()
			: Alert ("saveOpRoom", response)
		}).catch(error => {})
	}
	
	doSaveOpRoom()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveOpRoom()
		},
		redo: function() {
			doSaveOpRoom()
		}
	})		
}

export function saveCaseNum(pointed, newcontent)
{
	let $cells = $(pointed).closest("tr").find("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		theatre = $cells[THEATRE].innerHTML,
		oproom = $cells[OPROOM].innerHTML,
		qn = $cells[QN].innerHTML,
		oldcontent = getOldcontent()

	// must have oproom, if no, can't be clicked
	allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	allCases = allCases.filter(e => e !== qn)

	let doSaveCaseNum = function() {
		modelSaveCaseNum(allOldCases, allNewCases, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveCaseNum(opdate, staffname)
			}
			let noData = function() {
				Alert ("saveCaseNum", response)
				clearEditcell()
			}

			typeof response === "object"
			? hasData()
			: noData()
		}).catch(error => {})
	}
	let undoSaveCaseNum = function() {
		modelSaveCaseNum(allNewCases, allOldCases, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveCaseNum(opdate, staffname)
			}
			let noData = function() {
				Alert ("saveCaseNum", response)
				clearEditcell()
			}

			typeof response === "object"
			? hasData()
			: noData()
		}).catch(error => {})
	}
	
	doSaveCaseNum()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveCaseNum()
		},
		redo: function() {
			doSaveCaseNum()
		}
	})		
}

// use only "pointed" to save data
export let saveContent = function (pointed, column, newcontent) {
	let qn = $(pointed).siblings("td").last().html()

	// just for show instantly
	pointed.innerHTML = newcontent

	// take care of white space, double qoute, single qoute, and back slash
	newcontent = URIcomponent(newcontent)

	qn
	? saveContentQN(pointed, column, newcontent)
	: saveContentNoQN(pointed, column, newcontent)
}

// Remote effect from editing on main table to queuetbl
// 1. if staffname that match titlename gets involved
//    (either change to or from this staffname)
//    -> refill queuetbl
// 2. make change to the row which match titlename
//    (input is not staffname, but on staff that match titlename)
//    -> refill corresponding cell in another table
// Remote effect from editing on queuetbl to main table
// -> refill corresponding cell
// consults are not apparent on main table, no remote effect
export function saveContentQN(pointed, column, newcontent)
{
	let	cellindex = pointed.cellIndex,
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		oproom = $cells[OPROOM].innerHTML,
		casenum = $cells[CASENUM].innerHTML,
		staffname = $cells[STAFFNAME].innerHTML,
		qn = $cells[QN].innerHTML,
		oldcontent = getOldcontent()

	let doSaveContentQN = function () {
		modelSaveContentQN(column, newcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, oldcontent)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = oldcontent
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}
	let undoSaveContentQN = function () {
		modelSaveContentQN(column, oldcontent, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewSaveContentQN(pointed, newcontent)
			}
			let noData = function () {
				Alert("saveContentQN", response)
				pointed.innerHTML = newcontent
				// return to previous content
			}

			typeof response === "object" ? hasData() : noData()
		}).catch(error => {})
	}

	doSaveContentQN()

	// make undo-able
	UndoManager.add({
		undo: function() {
			undoSaveContentQN()
		},
		redo: function() {
			doSaveContentQN()
		}
	})		
}

export function saveContentNoQN(pointed, column, newcontent)
{
	// transfer from editcell to table cell, no re-render
	pointed.innerHTML = newcontent

	modelSaveContentNoQN(pointed, column, newcontent).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSaveContentNoQN(pointed, column)
		}
		let noData = function () {
			Alert("saveContentNoQN", response)

			// return to previous content
			pointed.innerHTML = getOldcontent()
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => {  })
}

export let saveHN = function (pointed, hn, content) {
	if (!/^\d{7}$/.test(content)) {
		pointed.innerHTML = ""
		return false
	}

	var	waiting = getWaitingBOOKrowByHN(content)

	if (waiting) {
		getCaseHN(pointed, waiting)
	} else {
		getNameHN(pointed, content)
	}
}

// May have other columns before, thus has qn already
function getCaseHN(pointed, waiting)
{
	let	wanting = $.extend({}, waiting)
		tableID = $(pointed).closest("table").attr("id"),
		$row = $(pointed).closest('tr'),
		$cells = $row.children("td"),
		opdateth = $cells[OPDATE].innerHTML,
		opdate = getOpdate(opdateth),
		staffname = $cells[STAFFNAME].innerHTML,
		diagnosis = $cells[DIAGNOSIS].innerHTML,
		treatment = $cells[TREATMENT].innerHTML,
		contact = $cells[CONTACT].innerHTML,
		qn = $cells[QN].innerHTML,
		noqn = !qn,

		hn = waiting.hn,
		patient = waiting.patient,
		dob = waiting.dob,

		oldcontent = getOldcontent(),

		$dialogMoveCase = $("#dialogMoveCase"),
		$movetbl = $("#movetbl"),
		$movefrom = $("#movefrom").next(),
		$moveto = $("#moveto").next(),
		tblcells = $("#tblcells tr").html()

	// not use staffoncall in patient's data
	if (/(<([^>]+)>)/i.test(staffname)) { staffname = "" }
	wanting.opdate = opdate
	wanting.patient = patient
	wanting.dob = dob
	if (staffname) { wanting.staffname = staffname }
	if (diagnosis) { wanting.diagnosis = diagnosis }
	if (treatment) { wanting.treatment = treatment }
	if (contact) { wanting.contact = contact }

	$movefrom.html(tblcells).filldataWaiting(waiting)
	$moveto.html(tblcells).filldataWaiting(wanting)
	let width = winWidth(95)
	width = width < 500
		  ? 550
		  : width > 800
		  ? 800
		  : width

	$dialogMoveCase.dialog({
		title: "เคสซ้ำ",
		closeOnEscape: true,
		modal: true,
		autoResize: true,
		show: 200,
		hide: 200,
		width: width,
		buttons: [
			{
				text: "ย้ายมา ลบเคสเดิมออก",
				class: "moveButton",
				click: function() {
					moveCaseHN()
				}
			},
			{
				text: "ก็อปปี้มา คงเคสเดิม",
				class: "copyButton",
				click: function() {
					copyCaseHN()
				}
			},
			{
				text: "ยกเลิก ไม่ทำอะไร",
				click: function() {
					$dialogMoveCase.dialog("close")
				}
			}
		],
		close: function() {
			clearEditcell()
		}
	})

	function moveCaseHN()
	{
		modelMoveCaseHN(pointed, column, newcontent).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewMoveCaseHN(pointed, column)
			}
			let noData = function () {
				Alert("saveCaseHN", response)
				pointed.innerHTML = oldcontent
				// unsuccessful entry
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { })

		$dialogMoveCase.dialog("close")
	}

	function copyCaseHN()
	{
		modelCopyCaseHN(pointed, column, newcontent).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewCopyCaseHN(pointed, column)
			}
			let noData = function () {
				Alert("saveCaseHN", response)
				pointed.innerHTML = oldcontent
				// unsuccessful entry
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { })

		$dialogMoveCase.dialog("close")
	}
}

function getNameHN(pointed, content)
{
	let oldcontent = getOldcontent()

	modelGetNameHN(pointed, content).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewGetNameHN(pointed)
		}
		let noData = function () {
			Alert("getNameHN", response)
			pointed.innerHTML = oldcontent
			// unsuccessful entry
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => { })
}

// Set up editcell for keyin or menu/spinner selection
// redirect click to openPACS or file upload
export function editPresentCell(evt, pointing) {
	let cell = pointing && pointing.cellIndex
	let store = {}

	store[OPDATE] = () => selectRow(evt, pointing)
	store[THEATRE] = () => createEditcell(pointing)
	store[OPROOM] = () => getROOMCASE(pointing)
	store[OPTIME] = () => getOPTIME(pointing)
	store[CASENUM] = () => getROOMCASE(pointing)
	store[STAFFNAME] = () => getSTAFFNAME(pointing)
	store[HN] = () => getHN(evt, pointing)
	store[PATIENT] = () => getNAME(evt, pointing)
	store[DIAGNOSIS] = () => createEditcell(pointing)
	store[TREATMENT] = () => createEditcell(pointing)
	store[EQUIPMENT] = () => getEQUIP(pointing)
	store[CONTACT] = () => createEditcell(pointing)

	store[cell] && store[cell]()
	if (cell === OPDATE) {
		clearEditcell()
		clearMouseoverTR()
	} else {
		clearSelection()
	}
}

export function selectRow(event, target)
{
  let $target = $(target).closest("tr"),
      $targetTRs = $(target).closest("table").find("tr"),
      $allTRs = $("tr")

  if (event.ctrlKey) {
    $targetTRs.removeClass("lastselected")
    $target.addClass("selected lastselected")
    disableOneRowMenu()
  } else if (event.shiftKey) {
    $targetTRs.not(".lastselected").removeClass("selected")
    shiftSelect($target)
    disableOneRowMenu()
  } else {
    $allTRs.removeClass("selected lastselected")
    $target.addClass("selected lastselected")
    oneRowMenu()
  }
}

function shiftSelect($target)
{
  let $lastselected = $(".lastselected").closest("tr"),
      lastIndex = $lastselected.index(),
      targetIndex = $target.index(),
      $select = {}

  if (targetIndex > lastIndex) {
    $select = $target.prevUntil('.lastselected')
  } else if (targetIndex < lastIndex) {
    $select = $target.nextUntil('.lastselected')
  } else {
    return
  }
  $select.addClass("selected")
  $target.addClass("selected")
}

export function clearSelection()
{
  $('.selected').removeClass('selected lastselected');
  disableOneRowMenu()
  disableExcelLINE()
}

export function disableOneRowMenu()
{
	let ids = ["#addrow", "#postpone", "#changedate", "#history", "#delete"]

	ids.forEach(function(each) {
		$(each).addClass("disabled")
	})
}

export function disableExcelLINE()
{
	$("#EXCEL").addClass("disabled")
	$("#LINE").addClass("disabled")
}

export function getROOMCASE(pointing)
{
	let	noPatient = !$(pointing).siblings(":last").html(),
		noRoom = !$(pointing).closest("tr").find("td").eq(OPROOM).html(),
		getCasenum = pointing.cellIndex === CASENUM,
		oldval = pointing.innerHTML,
		$editcell = $("#editcell"),
		newval = null,
		html = '<input id="spin">'

	if ( noPatient || getCasenum && noRoom ) {
		savePreviousCell()
		clearEditcell()
		return
	}

	createEditcell(pointing)
	$editcell.css("width", 40)
	$editcell.html(html)

	let	$spin = $("#spin")
	$spin.css("width", 35)
	$spin.val(oldval)
	$spin.spinner({
		min: 0,
		max: 99,
		step: 1,
		// make newval 0 as blank value
		spin: function( event, ui ) {
			newval = ui.value || ""
		},
		stop: function( event, ui ) {
			if (newval !== null) {
				$spin.val(newval)
				newval = null
			}
		}
	})
	$spin.focus()
	clearTimeout(timer)
}

export function getOPTIME(pointing)
{
	let	oldtime = pointing.innerHTML || "09.00",
		$editcell = $("#editcell"),
		newtime,
		html = '<input id="spin">'

	// no case
	if ( !$(pointing).siblings(":last").html() ) { return }

	createEditcell(pointing)
	$editcell.css("width", 65)
	$editcell.html(html)

	$spin = $("#spin")
	$spin.css("width", 60)
	$spin.spinner({
		min: 0,
		max: 24,
		step: 0.5,
		create: function( event, ui ) {
			$spin.val(oldtime)
		},
		spin: function( event, ui ) {
			newtime = decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (newtime !== undefined) {
				$spin.val(newtime)
				newtime = ""
			}
		}
	})
	$spin.focus()
	clearTimeout(timer)
}

export function getSTAFFNAME(pointing)
{
	let $stafflist = $("#stafflist"),
		$pointing = $(pointing)

	createEditcell(pointing)
	$stafflist.appendTo($pointing.closest('div')).show()

	$stafflist.menu({
		select: function( event, ui ) {
			saveContent(pointing, "staffname", ui.item.text())
			clearEditcell()
			$stafflist.hide()
			event.stopPropagation()
		}
	});

	// reposition from main menu to determine shadow
	reposition($stafflist, "left top", "left bottom", $pointing)
	menustyle($stafflist, $pointing)
}

export function getHN(evt, pointing)
{
	if (pointing.innerHTML) {
		clearEditcell()
		if (isPACS) {
			if (inPicArea(evt, pointing)) {
				PACS(pointing.innerHTML)
			}
		}
	} else {
		createEditcell(pointing)
	}
}

export function getNAME(evt, pointing)
{
	let hn = pointing.nextElementSibling.innerHTML
	let patient = pointing.innerHTML

	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
	clearEditcell()
}

export function getEQUIP(pointing)
{
	let tableID = $(pointing).closest('table').attr('id'),
		book = isConsultsTbl(tableID)? getCONSULT() : getBOOK(),
		$row = $(pointing).closest('tr'),
		qn = $row.find("td")[QN].innerHTML

	if (qn) {
		makeEquipTable(book, $row, qn)
	}
}

export function PACS(hn) { 
	let pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn,
		ua = window.navigator.userAgent,
		msie = ua.indexOf("MSIE"),
		edge = ua.indexOf("Edge"),
		IE = navigator.userAgent.match(/Trident.*rv\:11\./),

		// Chrome, FF send html for download and open by default browser (IE)
		// The html contains javascript to open a window with PACS url
		data_type = 'data:application/vnd.ms-internet explorer',
		openMSIE = function () {
			let html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
					 + pacs
					 + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>',
				a = document.createElement('a');
			document.body.appendChild(a);  // You need to add this line in FF
			a.href = data_type + ', ' + encodeURIComponent(html);
			a.download = "index.html"
			a.click()
		};

	(msie > 0 || edge > 0 || IE) ? window.open(pacs) : openMSIE()
}

function decimalToTime(dec)
{
  if (dec === 0) { return "" }

  let  integer = Math.floor(dec),
    decimal = dec - integer

  return [
    (integer < 10) ? "0" + integer : "" + integer,
    decimal ? String(decimal * 60) : "00"
  ].join(".")
}
