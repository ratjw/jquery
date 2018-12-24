
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT,
	CONTACT, QN, LARGESTDATE
} from "./const.js"
import { showStaffOnCall, clearSelection, PACS } from "./control.js"
import { createEditcell, clearEditcell } from "./edit.js"
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
		allCases = [],
		index,
		sql = "sqlReturnbook="

	if (oproom) {
		allCases = sameDateRoomTableQN(opdateth, oproom, theatre)
	}

	let doPostponeCase = function (waitnum, thisdate) {
		modelPostponeCase(allCases, waitnum, thisdate, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewPostponeCase(opdate, thisDate, staffname, qn)
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
	let dateStaff = BOOK.filter(function(patient) {
		return patient.staffname === staffname && patient.opdate === LARGESTDATE
	})

	return Math.max(...dateStaff.map(patient => patient.waitnum), 0)
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
		allSameDate,
		allOldCases, moveindex,
		allNewCases, thisindex, casenum,
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

	let doChangeDate = function (waitnum, movedate, thisdate, room, qn) {
		modelChangeDate(allOldCases, allNewCases, waitnum, thisdate, room, qn).then(response => {
			let hasData = function () {
				updateBOOK(response)
				viewChangeDate(movedate, thisdate, staffname, qn)
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

	doChangeDate(thisWaitnum, moveOpdate, thisOpdate, thisroom, thisqn)

	UndoManager.add({
		undo: function() {
			doChangeDate(moveWaitnum, thisOpdate, moveOpdate, moveroom, moveQN)
		},
		redo: function() {
			doChangeDate(thisWaitnum, moveOpdate, thisOpdate, thisroom, thisqn)
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

// All cases (exclude the deleted ones)
async function allCases() {
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
