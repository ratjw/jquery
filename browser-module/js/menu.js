
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT,
	CONTACT, QN, LARGESTDATE
} from "./const.js"
import { showStaffOnCall, clearSelection, PACS } from "./control.js"
import { createEditcell, clearEditcell } from "./edit.js"
import { USER } from "./main.js"

import {
	modelPostponeCase, modelChangeDate, modelAllCases, modelCaseHistory,
	modelAllDeletedCases, modelUndelete, modelSearchDB, modelDeleteCase
} from "./model.js"

import {
	viewPostponeCase, viewChangeDate, viewDeleteCase, viewAllCases,
	viewCaseHistory, viewDeletedCases, viewUndelete, viewSearchDB,
	viewStaffqueue, viewEquip
} from "./view.js"

import {
	getBOOK, getCONSULT, isPACS, updateBOOK, getOpdate, getBOOKrowByQN, getTableRowByQN,
	Alert, reposition, winWidth, winHeight, UndoManager, isSplit, winResizeFix, calcWaitnum,
	sameDateRoomBookQN, sameDateRoomTableQN
} from "./util.js"

export { oneRowMenu, clearMouseoverTR }

let onclick = {
	"clicksearchCases": searchCases,
	"clickallCases": allCases,
	"clickdeletedCases": deletedCases,
	"clickreadme": readme,
	"addrow": addnewrow,
	"postponecase": postponeCase,
	"changedate": changeDate,
	"clickeditHistory": editHistory,
	"delcase": delCase,
	"clicksendtoExcel": sendtoExcel,
	"clicksendtoLINE": sendtoLINE,
	"buttonLINE": toLINE,
	"clicksearchDB": searchDB
}

export function setClickMenu()
{
	$.each(onclick, function(key, val) {
		document.getElementById(key).onclick = val
	})
}

// disabled some menu-items for the current row
// Menu for the current row -> addrow, postpone, changedate, equip, history of editing, del
// Menu for all cases -> viewStaffqueue, service, all deleted, search, readme
function oneRowMenu()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		prevDate = $row.prev().find("td").eq(OPDATE).html() || "",
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		patient = $cell.eq(PATIENT).html(),
		qn = $cell.eq(QN).html(),
		notLARGE = (opdate !== LARGESTDATE)

	enable(qn, "#addrow")

	let postpone = qn && staffname && notLARGE
	if (postpone) {
		$("#postponecase").html("<b>Confirm เลื่อน ไม่กำหนดวัน  </b><br>" + patient)
	}
	enable(postpone, "#postpone")

	enable(qn, "#changedate")

	enable(qn, "#history")

	let Delete = qn || prevDate === opdateth
	if (Delete) {
		$("#delcase").html("<b>Confirm Delete </b><br>" + patient)
	}
	enable(Delete, "#delete")

	enable(true, "#EXCEL")

	enable(true, "#LINE")
}

function enable(able, id)
{
	if (able) {
		$(id).removeClass("disabled")
	} else {
		$(id).addClass("disabled")
	}
}

function addnewrow() {
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		keepcell = tableID === "tbl" ? OPDATE : STAFFNAME,
		$clone = $row.clone()

	// "tbl" copy title, Date, Room Time
	// "queuetbl" copy title, Date, Room Time, Staff
	let addrow = function ($clone, $row, keepcell) {
		$clone.removeClass("selected")
			.insertAfter($row)
				.find("td").eq(HN).removeClass("pacs")
				.parent().find("td").eq(PATIENT).removeClass("upload")
				.parent().find("td").eq(keepcell)
					.nextAll()
						.html("")
		clearSelection()
		createEditcell($clone.find("td")[HN])
	}

	addrow($clone, $row, keepcell)

	UndoManager.add({
		undo: function() {
			$row.next().remove()
		},
		redo: function() {
			addrow($clone, $row, keepcell)
		}
	})		
}

// Undefined date booking has opdate = LARGESTDATE
// but was shown blank date on screen
function postponeCase()
{
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		oldwaitnum = $row[0].title,
		newwaitnum = getLargestWaitnum(staffname) + 1,
		allCases = []

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	}

	let doPostponeCase = function (waitnum, thisdate) {
		modelPostponeCase(allCases, waitnum, thisdate, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewPostponeCase(opdate, thisdate, staffname, qn)
			}

			typeof response === "object"
			? hasData()
			: Alert ("postponeCase", response)
		}).catch(error => {})
	}

    clearSelection()

	doPostponeCase(newwaitnum, LARGESTDATE)

	UndoManager.add({
		undo: function() {
			doPostponeCase(oldwaitnum, opdate)
		},
		redo: function() {
			doPostponeCase(newwaitnum, LARGESTDATE)
		}
	})
}

// The second parameter (, 0) ensure a default value if arrayAfter.map is empty
function getLargestWaitnum(staffname)
{
	let dateStaff = getBOOK().filter(function(patient) {
		return patient.staffname === staffname && patient.opdate === LARGESTDATE
	})

	return Math.max(...dateStaff.map(patient => patient.waitnum), 0)
}

// Mark the case and initiate mouseoverTR underline the date to move to
function changeDate()
{
	let $allRows = $("#tbl tr:has('td'), #queuetbl tr:has('td')")
	let	$selected = $(".selected")

	$allRows.mouseover(function() {
		$(this).addClass("pasteDate")
	})
	$allRows.mouseout(function() {
		$(this).removeClass("pasteDate")
	})
	$allRows.click(function(event) {
		clickDate(event, $selected, this)
	})

	$(".selected").removeClass("selected").addClass("changeDate")
}

function clickDate(event, $selected, cell)
{
	let	$moverow = $selected.closest('tr'),
		$movecell = $moverow.find("td"),
		moveOpdateth = $movecell.eq(OPDATE).html(),
		moveOpdate = getOpdate(moveOpdateth),
		staffname = $movecell.eq(STAFFNAME).html(),
		moveQN = $movecell.eq(QN).html(),
		moveWaitnum = $moverow[0].title,
		movetheatre = $moverow.find("td").eq(THEATRE).html(),
		moveroom = $moverow.find("td").eq(OPROOM).html(),

		$thisrow = $(cell).closest("tr"),
		$thiscell = $thisrow.children("td"),
		thisOpdateth = $thiscell.eq(OPDATE).html(),
		thisOpdate = getOpdate(thisOpdateth),
		thistheatre = $thiscell.eq(THEATRE).html(),
		thisroom = $thiscell.eq(OPROOM).html(),
		thisqn = $thiscell.eq(QN).html(),
		thisWaitnum = calcWaitnum(thisOpdateth, $thisrow, $thisrow.next()),
		allOldCases,
		allNewCases,
		thisindex

	// remove itself from old sameDateRoom
	allOldCases = sameDateRoomTableQN(moveOpdateth, moveroom, movetheatre)
					.filter(e => e !== moveQN);

	// remove itself in new sameDateRoom, in case new === old
	allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
					.filter(e => e !== moveQN);

	// insert itself into new sameDateRoom after the clicked row
	thisindex = allNewCases.indexOf(thisqn)
	allNewCases.splice(thisindex + 1, 0, moveQN)

	let doChangeDate = function (waitnum, movedateth, movedate, thisdate, room) {
		modelChangeDate(allOldCases, allNewCases, waitnum, thisdate, room, moveQN).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewChangeDate(movedateth, movedate, thisdate, staffname, moveQN)
			}

			typeof response === "object"
			? hasData()
			: Alert ("changeDate", response)
		}).catch(error => {})
	}

	event.stopPropagation()
	clearMouseoverTR()
    clearSelection()

	// click the same case
	if (thisqn === moveQN) { return }

	doChangeDate(thisWaitnum, moveOpdateth, moveOpdate, thisOpdate, thisroom)

	UndoManager.add({
		undo: function() {
			doChangeDate(moveWaitnum, thisOpdateth, thisOpdate, moveOpdate, moveroom)
		},
		redo: function() {
			doChangeDate(thisWaitnum, moveOpdateth, moveOpdate, thisOpdate, thisroom)
		}
	})		
}

function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')")
		.off("mouseover")
		.off("mouseout")
		.off("click")
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
}

// not actually delete the case but set deleted = 1
// Remove the row if more than one case on that date, or on staff table
// Just blank the row if there is only one case
function delCase() {
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases = []

	if (!qn) {
		$row.remove()
		return
	}

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	}

	let deleteCase = function (del) {
		modelDeleteCase(allCases, qn, del).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewDeleteCase(tableID, $row, opdate, staffname)
			}

			typeof response === "object"
			? hasData()
			: Alert ("delCase", response)
		}).catch(error => {})
	}

	clearSelection()
	deleteCase(1)

	UndoManager.add({
		undo: function() {
			if (!args.qn) {	
				addrow(args.tableID, args.$row)
				return
			}
			deleteCase(0)
		},
		redo: function() {
			args.waitnum = null
			deleteCase(1)
		}
	})
}

// All cases (exclude the deleted ones)
function allCases() {
	modelAllCases().then(response => {
		typeof response === "object"
		? viewAllCases(response)
		: Alert("allCases", response)
	}).catch(error => {})

	clearEditcell()
}

function editHistory()
{
	let	selected = document.querySelector(".selected"),
		row = selected.closest('tr'),
		hn = row.cells[HN].innerHTML

	modelCaseHistory(hn).then(response => {
		typeof response === "object"
		? viewCaseHistory(row, hn, response)
		: Alert("caseHistory", response)
	}).catch(error => {})

	clearEditcell()
}

function deletedCases()
{
	modelAllDeletedCases().then(response => {
		if (typeof response === "object") {
			viewDeletedCases(response)
			$(".toUndelete").off("click").on("click", function () {
				toUndelete(this, response)
			})
		} else {
			Alert("allDeletedCases", response)
		}
	}).catch(error => {})
}

function toUndelete(thisdate, deleted) 
{
  let UNDELOPDATE      = 0;
  let UNDELSTAFFNAME   = 1;
//  let UNDELHN        = 2;
//  let UNDELPATIENT   = 3;
//  let UNDELDIAGNOSIS = 4;
//  let UNDELTREATMENT = 5;
//  let UNDELCONTACT   = 6;
//  let UNDELEDITOR    = 7;
//  let UNDELEDITDATETIME  = 8;
  let UNDELQN         = 9;
  let $thisdate = $(thisdate)
  let $undelete = $("#undelete")

  reposition($undelete, "left center", "left center", $thisdate)

  $("#undel").off().on("click", function() {
    let $thiscase = $thisdate.closest("tr").children("td"),
      opdateth = $thiscase.eq(UNDELOPDATE).html(),
      opdate = getOpdate(opdateth),
      staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
      qn = $thiscase.eq(UNDELQN).html(),

      delrow = getBOOKrowByQN(deleted, qn),
      waitnum = delrow.waitnum || 1,
      oproom = delrow.oproom,
      casenum = delrow.casenum,

      book = (waitnum < 0)? getCONSULT() : getBOOK(),
      allCases = sameDateRoomBookQN(book, opdate, oproom),
	  del

    allCases.splice(casenum, 0, qn)

	doUndel(allCases, opdate, staffname, qn, 0)

	UndoManager.add({
		undo: function() {
			doUndel(allCases, opdate, staffname, qn, 1)
		},
		redo: function() {
			doUndel(allCases, opdate, staffname, qn, 0)
		}
	})
  })
}

function closeUndel() 
{
  $('#undelete').hide()
}

function doUndel(allCases, opdate, staffname, qn, del) {

	modelUndelete(allCases, qn, del).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewUndelete(opdate, staffname, qn)
		};

		typeof response === "object"
		? hasData()
		: Alert("doUndel", response)
	}).catch(error => {})

	$('#dialogDeleted').dialog("close")
}

function searchCases()
{
  let $dialogInput = $("#dialogInput"),
    $stafflist = $('#stafflist')

  $dialogInput.dialog({
    title: "Search",
    closeOnEscape: true,
    modal: true,
    width: 500,
    height: 250,
    close: function() {
      $stafflist.hide()
    }
  })

  $dialogInput.off("click").on("click", function(event) {
    let target = event.target

    if ($stafflist.is(":visible")) {
      $stafflist.hide();
    } else {
      if ($(target).closest('input[name="staffname"]').length) {
        getSaffName(target)
      }
    }
  })
  .off("keydown").on("keydown", function(event) {
    let keycode = event.which || window.event.keyCode
    if (keycode === 13) { searchDB() }
  })
}

function getSaffName(pointing)
{
  let $stafflist = $("#stafflist"),
    $pointing = $(pointing)

  $stafflist.appendTo($pointing.closest('div')).show()
  $stafflist.menu({
    select: function( event, ui ) {
      pointing.value = ui.item.text()
      $stafflist.hide()
      event.stopPropagation()
    }
  })

  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
}

function searchDB()
{
  let hn = $('input[name="hn"]').val(),
    staffname = $('input[name="staffname"]').val(),
    others = $('input[name="others"]').val(),
    sql = "", search = ""

  // Close before open another dialog
  $("#dialogInput").dialog("close")

  // for dialog title
  search += hn
  search += (search && staffname ? ", " : "") + staffname
  search += (search && others ? ", " : "") + others
  if (search) {
	modelSearchDB(hn).then(response => {
		typeof response === "object"
		? viewSearchDB(row, hn, response)
		: Alert("Search: " + search, response)
	}).catch(error => {})
  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
}

function sendtoLINE()
{
    $('#dialogNotify').dialog({
      title: '<img src="css/pic/general/linenotify.png" width="40" style="float:left">'
           + '<span style="font-size:20px">Qbook: ' + USER + '</span>',
      closeOnEscape: true,
      modal: true,
      show: 200,
      hide: 200,
      width: 270,
      height: 300
    })
}

function toLINE()
{
  let capture = document.querySelector("#capture")
  let $capture = $("#capture")
  let $captureTRs = $capture.find('tr')
  let $selected = $(".selected")
  let row = ""
  let hide = [1, 3, 4, 12]
  let $dialogNotify = $('#dialogNotify')
  let message


  message = $dialogNotify.find('textarea').val()
  $dialogNotify.dialog('close')

  $captureTRs.slice(1).remove()
  $capture.show()
  $.each($selected, function() {
    $capture.find("tbody").append($(this).clone())
  })
  $captureTRs = $capture.find('tr')
  $captureTRs.removeClass('selected lastselected')

  hide.forEach(function(i) {
    $.each($captureTRs, function() {
      this.cells[i].style.display = 'none'
    })
  })

  html2canvas(capture).then(function(canvas) {
    $.post(LINENOTIFY, {
        'user': USER,
        'message': message,
        'image': canvas.toDataURL('image/png', 1.0)
    })
    $capture.hide()
  })
}

function sendtoExcel()
{
  let capture = document.querySelector("#capture")
  let $capture = $("#capture")
  let $captureTRs = $capture.find('tr')
  let $selected = $(".selected")
  let row = ""
  let hide = [1, 3, 4, 12]

  $captureTRs.slice(1).remove()

  $.each($selected, function() {
    $capture.find("tbody").append($(this).clone())
  })
  $captureTRs = $capture.find('tr')
  $captureTRs.removeClass('selected lastselected')

  hide.forEach(function(i) {
    $.each($captureTRs, function() {
      this.cells[i].style.display = 'none'
    })
  })

  exportQbookToExcel()
}

function readme()
{
  let $dialogReadme = $('#dialogReadme'),
    object = "<object data='.\\readme.pdf' type='application/pdf' "
           + "width='400px' height='500px'>"
           + "</object>"
  $dialogReadme.show()
  $dialogReadme.dialog({
    title: "ReadMe",
    closeOnEscape: true,
    modal: true,
    width: 430,
    height: 570,
    open: function () {
      $dialogReadme.html(object)
    }
  }).fadeIn();
}
