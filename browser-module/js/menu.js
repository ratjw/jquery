
import {
	OPDATE, OPROOM, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT,
	CONTACT, QN, LARGESTDATE
} from "./const.js"

import { clearEditcell, reposition } from "./edit.js"
import { makeEquipTable } from "./equip.js"
import {
	BOOK, updateBOOK, getOpdate, Alert, winWidth, winHeight, UndoManager
} from "./util.js"

import {
	modelChangeDate, modelAllCases, modelCaseHistory,
	modelAllDeletedCases, modelUndelete, modelFind, modelDeleteCase
} from "./model.js"

import {
	viewChangeDate, viewDeleteCase, viewAllCases,
	viewCaseHistory, viewDeletedCases, viewUndelete, viewFind,
	viewStaffqueue
} from "./view.js"

export { clearMouseoverTR }

let onclick = {
	"clicksearchCases": searchCases,
	"clickallCases": allCases,
	"clickdeletedCases": deletedCases,
	"clickreadme": readme,
	"clickaddnewrow": addnewrow,
	"clickpostponeCase": postponeCase,
	"clickchangeDate": changeDate,
	"clickeditHistory": editHistory,
	"clickdelCase": delCase,
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
		prevDate = $row.prev().find("td").eq(OPDATE).html() || ""
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

function disableOneRowMenu()
{
	let ids = ["#addrow", "#postpone", "#changedate", "#history", "#delete"]

	ids.forEach(function(each) {
		enable(false, each)
	})
}

function disableExcelLINE()
{
	$("#EXCEL").addClass("disabled")
	$("#LINE").addClass("disabled")
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
			.parent().find("td").eq(PATIENT).removeClass("camera")
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
		+ ",editor='" + gv.user
        + "' WHERE qn="+ qn + ";"

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		updateBOOK(response)
		refillOneDay(opdate)
		if ((isSplited()) && 
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
	let dateStaff = gv.BOOK.filter(function(patient) {
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
		if (isSplited()) {
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
async function delCase(args) {
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
		allCases, index, sql

	sql = "sqlReturnbook=UPDATE book SET "
		+ "deleted=1, "
		+ "editor = '" + gv.user
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
			if ((isSplited()) && 
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
/*
	let argsUndo = {}
	argsUndo = $.extend(argsUndo, args)
	args.waitnum = null
	deleteCase(args)

	UndoManager.add({
		undo: function() {
			if (!args.qn) {	
				addrow(args.tableID, args.$rowi)
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
		$row.children("td").eq(PATIENT).removeClass("camera")
		$row.children('td').eq(STAFFNAME).html(showStaffOnCall(opdate))
	}
}

/*
let deleteCase = function (args) {
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

		typeof response === "object"
		? hasData()
		: Alert ("delCase", response)
	}).catch(error => {})
}
*/
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
    if (gv.isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialog.find('.camera').on("click", function() {
    let hn = this.previousElementSibling.innerHTML
    let patient = this.innerHTML

    showUpload(hn, patient)
  })

  function showOneWeek(book, Monday, offset)
  {
    let  bookOneWeek, Sunday

    firstday = Monday.nextdays(offset)
    if (firstday < beginday) { firstday = getPrevMonday(beginday) }
    if (firstday > lastday) {
      firstday = getPrevMonday(lastday).nextdays(7)
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
    return today.ISOdate();
  }

  function getNextSunday(date)
  {
    let today = new Date(date);
    today.setDate(today.getDate() - today.getDay() + 7);
    return today.ISOdate();
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
    let  Mon = Monday && Monday.thDate() || "",
      Sun = Sunday && Sunday.thDate() || ""

    $dialog.dialog({
      title: search + " : " + Mon + " - " + Sun
    })
    // delete previous table lest it accumulates
    $tbl.find('tr').slice(1).remove()

    if (Monday) {
      let  $row, rowi, cells,
        date = Monday,
        nocase = true

      $.each( bookOneWeek, function() {
        while (this.opdate > date) {
          if (nocase) {
            $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
            rowi = $row[0]
            cells = rowi.cells
            rowDecoration(rowi, date)
          }
          date = date.nextdays(1)
          nocase = true
        }
        $('#allcells tr').clone()
          .appendTo($tbl.find('tbody'))
            .filldataAllcases(this)
        nocase = false
      })
      date = date.nextdays(1)
      while (date <= Sunday) {
        $row = $('#allcells tr').clone().appendTo($tbl.find('tbody'))
        rowi = $row[0]
        cells = rowi.cells
        rowDecoration(rowi, date)
        date = date.nextdays(1)
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
    let rowi = this[0],
      cells = rowi.cells,
      date = q.opdate,
      data = [
        putThdate(date),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    rowDecoration(rowi, date)
    dataforEachCell(cells, data)
  }
})

async function editHistory()
{
  let  $selected = $(".selected"),
    $row = $selected.closest('tr'),
    hn = $row.find("td")[HN].innerHTML,
    sql = "sqlReturnData=SELECT * FROM bookhistory "
      + "WHERE qn in (SELECT qn FROM book WHERE hn='" + hn + "') "
      + "ORDER BY editdatetime DESC;"

  clearEditcell()

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    makehistory($row, hn, response)
  } else {
    Alert("editHistory", response)
  }
}

function makehistory($row, hn, response)
{
  let  $historytbl = $('#historytbl'),
    nam = $row.find("td")[PATIENT].innerHTML,
    name = nam && nam.replace('<br>', ' '),
    $dialogHistory = $("#dialogHistory")
  
  // delete previous table lest it accumulates
  $historytbl.find('tr').slice(1).remove()

  $.each( response, function() {
    $('#historycells tr').clone()
      .appendTo($historytbl.find('tbody'))
        .filldataHistory(this)
  });

  $dialogHistory.dialog({
    title: hn +' '+ name,
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeHistory )
      $(".fixed").remove()
    }
  })

  $historytbl.fixMe($dialogHistory);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeHistory )

  function resizeHistory() {
    $dialogHistory.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($historytbl, $dialogHistory)
  }
}

jQuery.fn.extend({
  filldataHistory : function(q) {
    let  cells = this[0].cells,
      data = [
        putThdate(q.opdate) || "",
        q.oproom || "",
        q.casenum || "",
        q.staffname,
        q.diagnosis,
        q.treatment,
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact,
        q.editor,
        q.editdatetime
      ]

    // Define colors for deleted and undeleted rows
    q.action === 'delete'
    ? this.addClass("deleted")
    : (q.action === 'undelete') && this.addClass("undelete")

    dataforEachCell(cells, data)
  }
})

async function deletedCases()
{
  let sql = `sqlReturnData=SELECT editdatetime, b.* 
                             FROM book b 
							   LEFT JOIN bookhistory bh ON b.qn = bh.qn 
                             WHERE editdatetime>DATE_ADD(NOW(), INTERVAL -3 MONTH) 
							   AND b.deleted>0 
							   AND bh.action='delete' 
							 GROUP BY b.qn 
                             ORDER BY editdatetime DESC;`

  let response = await postData(MYSQLIPHP, sql)
  if (typeof response === "object") {
    makedeletedCases(response)
  } else {
    Alert("deletedCases", response)
  }
}

function makedeletedCases(deleted)
{
  let $deletedtbl = $('#deletedtbl')
    $deletedtr = $('#deletedcells tr')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  // display the first 20
  $.each( deleted, function(i) {
    $deletedtr.clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataDeleted(this)
    return i < 20;
  });

  let $dialogDeleted = $("#dialogDeleted")
  $dialogDeleted.dialog({
    title: "All Deleted Cases",
    closeOnEscape: true,
    modal: true,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDeleted )
      $(".fixed").remove()
    }
  })
  $deletedtbl.fixMe($dialogDeleted);

  let $undelete = $("#undelete")
  $undelete.hide()
  $undelete.off("click").on("click", function () { closeUndel() }).hide()
  $(".toUndelete").off("click").on("click", function () {
    toUndelete(this, deleted)
  })

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogDeleted.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($deletedtbl, $dialogDeleted)
  }

  // display the rest
  setTimeout(function() {
    $.each( deleted, function(i) {
      if (i < 21) return
      $deletedtr.clone()
        .appendTo($deletedtbl.find('tbody'))
          .filldataDeleted(this)
    });
  }, 100)
}

jQuery.fn.extend({
  filldataDeleted : function(q) {
    let  cells = this[0].cells,
      data = [
        putThdate(q.opdate),
        q.staffname,
        q.hn,
        q.patient,
        q.diagnosis,
        q.treatment,
        q.contact,
        q.editor,
        q.editdatetime,
        q.qn
      ]

    rowDecoration(this[0], q.opdate)
    dataforEachCell(cells, data)
    cells[0].className += " toUndelete"
  }
})

async function toUndelete(thisDate, deleted) 
{
  let UNDELOPDATE      = 0;
  let UNDELSTAFFNAME    = 1;
//  let UNDELHN        = 2;
//  let UNDELPATIENT    = 3;
//  let UNDELDIAGNOSIS    = 4;
//  let UNDELTREATMENT    = 5;
//  let UNDELCONTACT    = 6;
//  let UNDELEDITOR      = 7;
//  let UNDELEDITDATETIME  = 8;
  let UNDELQN        = 9;
  let $thisDate      = $(thisDate)
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

      book = (waitnum < 0)? gv.CONSULT : gv.BOOK,
      allCases = sameDateRoomBookQN(book, opdate, oproom),
      alllen

    allCases.splice(casenum, 0, qn)
    alllen = allCases.length

    for (let i=0; i<alllen; i++) {
      if (allCases[i] === qn) {
        sql += "UPDATE book SET "
            +  "deleted=0,"
            +  "editor='" + gv.user
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
      if (isSplited() && (isStaffname(staffname) || isConsults())) {
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
/*
// Trace all data changes history of specified case
// Sort edit datetime from newer to older
let caseHistory = function (rowi, qn) {
	modelCaseHistory(qn).then(response => {
		typeof response === "object"
		? viewCaseHistory(rowi, response)
		: Alert("caseHistory", response)
	}).catch(error => {})

	clearEditcell()
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

		typeof response === "object"
		? hasData()
		: Alert("undelete", response)
	}).catch(error => {})

	$('#dialogDeleted').dialog("close")
}
*/

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

  showtbl = showFind("tblcontainer", "tbl", qn)
  if (isSplited()) {
    showqueuetbl = showFind("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

function showFind(containerID, tableID, qn)
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
    if (gv.isPACS) {
      PACS(this.innerHTML)
    }
  })
  $dialogFind.find('.camera').on("click", function() {
    let patient = this.innerHTML
    let hn = this.previousElementSibling.innerHTML

    showUpload(hn)
  })

  //scroll to todate when there many cases
  let today = new Date(),
    todate = today.ISOdate(),
    thishead

  $findtbl.find("tr").each(function() {
    thishead = this
    return this.cells[OPDATE].innerHTML.numDate() < todate
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
        showEquip(q.equipment),
        q.admission,
        q.final,
        q.contact
      ]

    if (Number(q.deleted)) {
      this.addClass("deleted")
    } else {
      rowDecoration(row, q.opdate)
    }
    q.hn && gv.isPACS && (cells[2].className = "pacs")
    q.patient && (cells[3].className = "upload")

    dataforEachCell(cells, data)
  }
})

function PACS(hn)
{ 
  let pacs = 'http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn
  let sql = 'PAC=http://synapse/explore.asp'
  let ua = window.navigator.userAgent;
  let msie = ua.indexOf("MSIE")
  let edge = ua.indexOf("Edge")
  let IE = !!navigator.userAgent.match(/Trident.*rv\:11\./)
  let data_type = 'data:application/vnd.ms-internet explorer'

  if (msie > 0 || edge > 0 || IE) { // If Internet Explorer
    open(pacs);
  } else {
    let html = '<!DOCTYPE html><HTML><HEAD><script>function opener(){window.open("'
    html += pacs + '", "_self")}</script><body onload="opener()"></body></HEAD></HTML>'
    let a = document.createElement('a');
    document.body.appendChild(a);  // You need to add this line in FF
    a.href = data_type + ', ' + encodeURIComponent(html);
    a.download = "index.html"
    a.click();    //to test with Chrome and FF
  }
}

function showUpload(hn, patient)
{
  let win = gv.showUpload
  if (hn) {
    if (win && !win.closed) {
      win.close();
    }
    gv.showUpload = win = window.open("jQuery-File-Upload", "_blank")
    win.hnName = {"hn": hn, "patient": patient}
    //hnName is a pre-defined variable in child window (jQuery-File-Upload)
  }
}

function sendtoLINE()
{
    $('#dialogNotify').dialog({
      title: '<img src="css/pic/general/linenotify.png" width="40" style="float:left">'
           + '<span style="font-size:20px">Qbook: ' + gv.user + '</span>',
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
        'user': gv.user,
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
/*
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
		typeof response === "object"
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
*/