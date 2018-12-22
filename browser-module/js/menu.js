
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT,
	CONTACT, QN, LARGESTDATE
} from "./const.js"
import { showStaffOnCall, clearSelection, PACS } from "./control.js"
import { createEditcell, clearEditcell, reposition } from "./edit.js"
import { USER } from "./main.js"

import {
	modelChangeDate, modelAllCases, modelCaseHistory,
	modelAllDeletedCases, modelUndelete, modelFind, modelDeleteCase
} from "./model.js"

import {
	viewChangeDate, viewDeleteCase, viewAllCases,
	viewCaseHistory, viewDeletedCases, viewUndelete, viewFind,
	viewStaffqueue, viewEquip
} from "./view.js"

import {
	getBOOK, getCONSULT, isPACS, updateBOOK, getOpdate, getTableRowByQN, Alert,
	winWidth, winHeight, UndoManager, isSplit, winResizeFix
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

$.each(onclick, function(key, val) {
	document.getElementById(key).onclick = val
})

// function declaration (definition ) : public
// function expression (literal) : local

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

// Only 2 tables :
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

// Undefined date booking has opdate = LARGESTDATE
// but was shown blank date on screen
async function postponeCase(args) {
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
		allCases,
		index,
		sql = "sqlReturnbook="

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)
		sql += updateCasenum(allCases)
	}

	waitnum = getLargestWaitnum(staffname) + 1

	sql += "UPDATE book SET opdate='" + LARGESTDATE
		+ "',waitnum=" + waitnum
		+ ",theatre='',oproom=null,casenum=null,optime=''"
		+ ",editor='" + USER
        + "' WHERE qn="+ qn + ";"

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		refillOneDay(opdate)
		if ((isSplit()) && 
			(isStaffname(staffname))) {
			// changeDate of this staffname's case
			refillstaffqueue()
		}
		scrolltoThisCase(qn)
	} else {
		Alert ("postpone", response)
	}

    clearSelection()
/*
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
	})	*/	
}
/*
// Mark the case and initiate mouseoverTR, a line on the date to move to
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
*/
let doChangeDate = function (args) {

	modelChangeDate(args).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewChangeDate(args)
		}

		typeof response === "object"
		? hasData()
		: Alert ("changeDate", response)
	}).catch(error => {})
}

// The second parameter (, 0) ensure a default value if arrayAfter.map is empty
function getLargestWaitnum(staffname)
{
	let dateStaff = BOOK.filter(function(patient) {
		return patient.staffname === staffname && patient.opdate === LARGESTDATE
	})

	return Math.max(...dateStaff.map(patient => patient.waitnum), 0)
}

function changeDate()
{
	let	$selected = $(".selected"),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		args = [
			$row,
			opdateth = $cell.eq(OPDATE).html(),
			opdate = getOpdate(opdateth),
			staffname = $cell.eq(STAFFNAME).html(),
			qn = $cell.eq(QN).html()
		],
		$allRows = $("#tbl tr:has('td'), #queuetbl tr:has('td')")

	$allRows.on("mouseover", overDate)
	$allRows.on("mouseout", outDate)
	$allRows.on("click", args, clickDate)

	$row.removeClass("selected").addClass("changeDate")
}

function overDate() { $(this).addClass("pasteDate") }

function outDate() { $(this).removeClass("pasteDate") }

// args = [$row, opdateth, opdate, staffname, qn]
async function clickDate(event)
{
	let args = event.data,
		$moverow = args[0],
		moveOpdateth = args[1],
		moveOpdate = args[2],
		staffname = args[3],
		moveQN = args[4],
		movetheatre = $moverow.find("td").eq(THEATRE).html(),
		moveroom = $moverow.find("td").eq(OPROOM).html(),

		$thisrow = $(this),
		$thiscell = $thisrow.children("td"),
		thisOpdateth = $thiscell.eq(OPDATE).html(),
		thisOpdate = getOpdate(thisOpdateth),
		thistheatre = $thiscell.eq(THEATRE).html(),
		thisroom = $thiscell.eq(OPROOM).html(),
		thisqn = $thiscell.eq(QN).html(),
		thisWaitnum = calcWaitnum(thisOpdateth, $thisrow, $thisrow.next()),
		allSameDate,
		allOldCases, moveindex,
		allNewCases, index, thisindex, casenum,
		sql = ""

	// remove itself from old sameDateRoom
	allOldCases = sameDateRoomTableQN(moveOpdateth, moveroom, movetheatre)
					.filter(e => e !== moveQN);

	// remove itself in new sameDateRoom, in case new === old
	allNewCases = sameDateRoomTableQN(thisOpdateth, thisroom, thistheatre)
					.filter(e => e !== moveQN);

	// insert itself into new sameDateRoom after the clicked row
	thisindex = allNewCases.indexOf(thisqn)
	allNewCases.splice(thisindex + 1, 0, moveQN)

	event.stopPropagation()
	clearMouseoverTR()
	// click the same case
	if (thisqn === moveQN) { return }

	sql += updateCasenum(allOldCases)

	for (let i=0; i<allNewCases.length; i++) {
		if (allNewCases[i] === moveQN) {
			casenum = thisroom? (i + 1) : null
			sql += sqlMover(thisWaitnum, thisOpdate, thisroom || null, casenum, moveQN)
		} else {
			sql += sqlCaseNum(i + 1, allNewCases[i])
		}
	}

	if (!sql) { return }
	sql = "sqlReturnbook=" + sql

    clearSelection()

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response);
		if (moveOpdateth) {
			refillOneDay(moveOpdate)
		}
		if (moveOpdate !== thisOpdate) {
			refillOneDay(thisOpdate)
		}
		if (isSplit()) {
			let titlename = $('#titlename').html()
			if ((titlename === staffname) ||
				(titlename === "Consults")) {
				// changeDate of this staffname's case
				refillstaffqueue()
			}
		} 
		scrolltoThisCase(moveQN)
	} else {
		Alert ("changeDate", response)
	}
}

function clearMouseoverTR()
{
	$("#tbl tr:has('td'), #queuetbl tr:has('td')").off({
		"mouseover": overDate,
		"mouseout": outDate,
		"click": clickDate
	})
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
		allCases, index, sql,
		waitnum = null
deleteCase(waitnum)
return
/*
	sql = "sqlReturnbook=UPDATE book SET "
		+ "deleted=1, "
		+ "editor = '" + USER
		+ "' WHERE qn="+ qn + ";"

	if (!qn) {
		$row.remove()
		return
	}

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
		index = allCases.indexOf(qn)
		allCases.splice(index, 1)
		sql += updateCasenum(allCases)
	}

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		if (tableID === "tbl") {
			refillOneDay(opdate)
			if ((isSplit()) && 
				(isStaffname(staffname))) {
				refillstaffqueue()
			}
		} else {
			if (isConsults()) {
				deleteRow($row, opdate)
			} else {
				$row.remove()
			}
			refillOneDay(opdate)
		}
	} else {
		Alert ("delCase", response)
	}

	clearSelection()
//-----
	let argsUndo = {}
	argsUndo = $.extend(argsUndo, args)
	args.waitnum = null
	deleteCase(waitnum)

	UndoManager.add({
		undo: function() {
			if (!args.qn) {	
				addrow(args.tableID, args.$row)
				return
			}
			deleteCase(argsUndo)
		},
		redo: function() {
			args.waitnum = null
			deleteCase(args)
		}
	})		*/
}

function deleteRow($row, opdate)
{
	let prevDate = $row.prev().children("td").eq(OPDATE).html()
	let nextDate = $row.next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate === opdate)
	|| (nextDate === opdate)
	|| $row.closest("tr").is(":last-child")) {
		$row.remove()
	} else {
		$row.children("td").eq(OPDATE).siblings().html("")
		$row.children("td").eq(HN).removeClass("pacs")
		$row.children("td").eq(PATIENT).removeClass("upload")
		$row.children('td').eq(STAFFNAME).html(showStaffOnCall(opdate))
	}
}

let deleteCase = function (num) {
	let	$selected = $(".selected"),
		tableID = $selected.closest('table').attr('id'),
		$row = $selected.closest('tr'),
		$cell = $row.find("td"),
		waitnum = num,
		opdateth = $cell.eq(OPDATE).html(),
		opdate = getOpdate(opdateth),
		staffname = $cell.eq(STAFFNAME).html(),
		qn = $cell.eq(QN).html(),
		theatre = $cell.eq(THEATRE).html(),
		oproom = $cell.eq(OPROOM).html(),
		allCases, index, sql

	// from add new row
	if (!qn) {	
		$row.remove()
		return
	}

	modelDeleteCase(waitnum, qn).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewDeleteCase(opdate, staffname)
		}

		typeof response === "object"
		? hasData()
		: Alert ("delCase", response)
	}).catch(error => {})
}

// All cases (exclude the deleted ones)
async function allCases() {
  let sql = "sqlReturnData=SELECT * FROM book WHERE deleted=0 ORDER BY opdate;"

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    // Make paginated dialog box containing alltbl
    pagination($("#dialogAll"), $("#alltbl"), response, "All Saved Cases")
  } else {
    Alert("allCases", response)
  }
/*	modelAllCases().then(response => {
		typeof response === "object"
		? viewAllCases(response)
		: Alert("allCases", response)
	}).catch(error => {})

	clearEditcell()*/
}

function pagination($dialog, $tbl, book, search)
{
  let  beginday = book[0].opdate,
    lastday = findLastDateInBOOK(book),
    firstday = getPrevMonday()

  $dialog.dialog({
    title: search,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDialog )
      $(".fixed").remove()
    },
    buttons: [
      {
        text: "<<< Year",
        class: "yearbut",
        click: function () {
          showOneWeek(book, firstday, -364)
        }
      },
      {
        text: "<< Month",
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? -35 : -28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "< Week",
        click: function () {
          showOneWeek(book, firstday, -7)
        }
      },
      {
        click: function () { return }
      },
      {
        text: "Week >",
        click: function () {
          showOneWeek(book, firstday, 7)
        }
      },
      {
        text: "Month >>",
        class: "monthbut",
        click: function () {
          offset = firstday.slice(-2) > 28 ? 35 : 28
          showOneWeek(book, firstday, offset)
        }
      },
      {
        text: "Year >>>",
        class: "yearbut",
        click: function () {
          showOneWeek(book, firstday, 364)
        }
      }
    ]
  })

  showOneWeek(book, firstday, 0)
  $tbl.fixMe($dialog)

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDialog )

  $dialog.find('.pacs').on("click", function() {
    if (isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialog.find('.upload').on("click", function() {
    let hn = this.previousElementSibling.innerHTML
    let patient = this.innerHTML

    showUpload(hn, patient)
  })

  function showOneWeek(book, Monday, offset)
  {
    let  bookOneWeek, Sunday

    firstday = nextdays(Monday, offset)
    if (firstday < beginday) { firstday = getPrevMonday(beginday) }
    if (firstday > lastday) {
      firstday = nextdays(getPrevMonday(lastday), 7)
      bookOneWeek = getBookNoDate(book)
      showAllCases(bookOneWeek)
    } else {
      Sunday = getNextSunday(firstday)
      bookOneWeek = getBookOneWeek(book, firstday, Sunday)
      showAllCases(bookOneWeek, firstday, Sunday)
    }
  }

  function getPrevMonday(date)
  {
    let today = date
          ? new Date(date.replace(/-/g, "/"))
          : new Date();
    today.setDate(today.getDate() - today.getDay() + 1);
    return ISOdate(today);
  }

  function getNextSunday(date)
  {
    let today = new Date(date);
    today.setDate(today.getDate() - today.getDay() + 7);
    return ISOdate(today);
  }

  function getBookOneWeek(book, Monday, Sunday)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate >= Monday && bookq.opdate <= Sunday
    })
  }

  function getBookNoDate(book)
  {
    return $.grep(book, function(bookq) {
      return bookq.opdate === LARGESTDATE
    })
  }

  function showAllCases(bookOneWeek, Monday, Sunday)
  {
    let  Mon = Monday && thDate(Monday) || "",
      Sun = Sunday && thDate(Sunday) || ""

    $dialog.dialog({
      title: search + " : " + Mon + " - " + Sun
    })
    // delete previous table lest it accumulates
    $tbl.find('tr').slice(1).remove()

    if (Monday) {
      let  $row, row, cells,
        date = Monday,
        nocase = true

      $.each( bookOneWeek, function() {
        while (this.opdate > date) {
          if (nocase) {
            $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
            row = $row[0]
            cells = row.cells
            rowDecoration(row, date)
          }
          date = nextdays(date, 1)
          nocase = true
        }
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
        nocase = false
      })
      date = nextdays(date, 1)
      while (date <= Sunday) {
        $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
        row = $row[0]
        cells = row.cells
        rowDecoration(row, date)
        date = nextdays(date, 1)
      }
    } else {
      $.each( bookOneWeek, function() {
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
      });
    }
  }

  function resizeDialog() {
    $dialog.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($tbl, $dialog)
  }
}

jQuery.fn.extend({
  filldataAllcases : function(q) {
    let row = this[0],
      cells = row.cells,
      date = q.opdate,
      data = [
        putThdate(date),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        viewEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    rowDecoration(row, date)
    dataforEachCell(cells, data)
  }
})

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
			$("#undel").off("click").on("click", function () {
				toUndelete(this)
			})
		} else {
			Alert("allDeletedCases", response)
		}
	}).catch(error => {})
}

async function toUndelete(thisDate, deleted) 
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
  let $thisDate = $(thisDate)
  let $undelete = $("#undelete")

  // jquery position not work in hidden elements
  $undelete.show()
  reposition($undelete, "left center", "left center", $thisDate)

  $("#undel").off().on("click", async function() {
    let $thiscase = $thisDate.closest("tr").children("td"),
      opdateth = $thiscase.eq(UNDELOPDATE).html(),
      opdate = getOpdate(opdateth),
      staffname = $thiscase.eq(UNDELSTAFFNAME).html(),
      qn = $thiscase.eq(UNDELQN).html(),
      sql = "sqlReturnbook=",

      delrow = getBOOKrowByQN(deleted, qn),
      waitnum = delrow.waitnum || 1,
      oproom = delrow.oproom,
      casenum = delrow.casenum,

      book = (waitnum < 0)? getCONSULT() : getBOOK(),
      allCases = sameDateRoomBookQN(book, opdate, oproom),
      alllen

    allCases.splice(casenum, 0, qn)
    alllen = allCases.length

    for (let i=0; i<alllen; i++) {
      if (allCases[i] === qn) {
        sql += "UPDATE book SET "
            +  "deleted=0,"
            +  "editor='" + USER
            +  "' WHERE qn="+ qn + ";"
      } else {
        sql += sqlCaseNum(i + 1, allCases[i])
      }
    }

    $('#dialogDeleted').dialog("close")

    let response = await postData(MYSQLIPHP, sql)
    if (typeof response === "object") {
      updateBOOK(response);
      refillOneDay(opdate)
      //undelete this staff's case or a Consults case
      if (isSplit() && (isStaffname(staffname) || isConsults())) {
        refillstaffqueue()
      }
      scrolltoThisCase(qn)
    } else {
      Alert("toUndelete", response)
    }
  })
}

function closeUndel() 
{
  $('#undelete').hide()
}

// All deleted and still deleted cases (exclude the undeleted ones)
let allDeletedCases = function () {
	modelAllDeletedCases().then(response => {
		if (typeof response === "object") {
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

	// .data("case", this) from viewDeletedCases
	let thiscase = $(thatcase).data("case"),
		$thiscase = $(thiscase).parent(),
		$thiscell = $thiscase.children("td"),
		opdate = getOpdate($thiscell.eq(UNDELOPDATE).html()),
		staffname = $thiscell.eq(UNDELSTAFFNAME).html(),
		qn = $thiscell.eq(UNDELQN).html(),
		args = {}
	args.$row = $thiscase
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

		typeof response === "object"
		? hasData()
		: Alert("undelete", response)
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

async function searchDB()
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
    sql = "hn=" + hn
      + "&staffname=" + staffname
      + "&others=" + others

    let response = await postData(SEARCH, sql)
    if (typeof response === "object") {
      makeFind(response, search)
    } else {
      Alert("Search: " + search, response)
    }
  } else {
    Alert("Search: ''", "<br><br>No Result")
  }
}

function makeFind(found, search)
{
  let flen = found.length,
    $dialogFind = $("#dialogFind"),
    $findtbl = $("#findtbl"),
    show = scrolltoThisCase(found[flen-1].qn)

  if (!show || (flen > 1)) {
    if (flen > 100) {
      pagination($dialogFind, $findtbl, found, search)
    } else {
      makeDialogFound($dialogFind, $findtbl, found, search)
    }
  }
}

function scrolltoThisCase(qn)
{
  let showtbl, showqueuetbl

  showtbl = locateFound("tblcontainer", "tbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

function locateFound(containerID, tableID, qn)
{
  let container = document.getElementById(containerID),
    row = getTableRowByQN(tableID, qn),
    scrolledTop = container.scrollTop,
    offset = row && row.offsetTop,
    rowHeight = row && row.offsetHeight,
    height = container.clientHeight - rowHeight,
    bottom = scrolledTop + height,
    $container = $("#" + containerID)

  $("#" + tableID + " tr.marker").removeClass("marker")
  if (row) {
    $(row).addClass("marker")
    if (offset < scrolledTop) {
      $container.animate({
        scrollTop: offset
      }, 500);
    }
    else if (offset > bottom) {
      $container.animate({
        scrollTop: offset - height
      }, 500);
    }
    return true
  }
}

function makeDialogFound($dialogFind, $findtbl, found, search)
{
  $dialogFind.dialog({
    title: "Search: " + search,
    closeOnEscape: true,
    modal: true,
    width: winWidth(95),
    height: winHeight(95),
    buttons: [
      {
        text: "Export to xls",
        click: function() {
          exportFindToExcel(search)
        }
      }
    ],
    close: function() {
      $(window).off("resize", resizeFind )
      $(".fixed").remove()
      $("#dialogInput").dialog("close")
      $(".marker").removeClass("marker")
    }
  })

  // delete previous table lest it accumulates
  $findtbl.find('tr').slice(1).remove()

  $.each( found, function() {  // each === this
    $('#findcells tr').clone()
      .appendTo($findtbl.find('tbody'))
        .filldataFind(this)
  });
  $findtbl.fixMe($dialogFind);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeFind )

  function resizeFind() {
    $dialogFind.dialog({
      width: window.innerWidth,
      height: window.innerHeight
    })
    winResizeFix($findtbl, $dialogFind)
  }

  $dialogFind.find('.pacs').on("click", function() {
    if (isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialogFind.find('.upload').on("click", function() {
    let patient = this.innerHTML
    let hn = this.previousElementSibling.innerHTML

    showUpload(hn)
  })

  //scroll to todate when there many cases
  let today = new Date(),
    todate = ISOdate(today),
    thishead

  $findtbl.find("tr").each(function() {
    thishead = this
    return numDate(this.cells[OPDATE].innerHTML) < todate
  })
  $dialogFind.animate({
    scrollTop: $(thishead).offset().top - $dialogFind.height()
  }, 300);
}

jQuery.fn.extend({
  filldataFind : function(q) {
    let  row = this[0],
      cells = row.cells,
      data = [
        putThdate(q.opdate),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        viewEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    if (Number(q.deleted)) {
      this.addClass("deleted")
    } else {
      rowDecoration(row, q.opdate)
    }
    q.hn && isPACS && (cells[2].className = "pacs")
    q.patient && (cells[3].className = "upload")

    dataforEachCell(cells, data)
  }
})

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
