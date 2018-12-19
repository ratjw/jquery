
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
	DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, QN, LARGESTDATE, equipSheet
} from "./const.js"

import {
	createEditcellOpdate, createEditcellRoomtime, getPointer, getOldcontent,
	getNewcontent, updateEditcellData, createEditcell, clearEditcell, reposition
} from "./edit.js"

import { clearMouseoverTR } from "./menu.js"
import { modelIdling } from "./model.js"
import { sortable } from "./sort.js"
import { savePreviousCellService } from "./serv.js"

import {
	modelStart, modelSyncServer, modelFindLatestEntry,
	modelSaveRoomTime, modelSaveContent, modelSaveNoQN, modelSaveByHN
} from "./model.js"

import {
	BOOK, CONSULT, STAFF, ONCALL, HOLIDAY,isPACS, START,
	getOpdate, ISOdate, thDate, calculateWaitnum, URIcomponent, Alert,
	UndoManager, updateBOOK, showUpload, menustyle, timestamp
} from "./util.js"

import {
	viewAll, viewLatestEntry, viewIdling, viewSaveRoomTime, viewSaveContent,
	viewSaveNoQN, viewSaveByHN, animateScroll, setClickStaff
} from "./view.js"

// Public functions
export {
	savePreviousCell, editPresentCell,
	PACS, userStaff, clearTimer, resetTimer
}

// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
let timer = 0,
    idleCounter = 0

//let onclick = {
//	"clickaddStaff": addStaff,
//	"clicksetHoliday": setHoliday,
//	"clickdoadddata": doadddata,
//	"clickdoupdatedata": doupdatedata,
//	"clickdodeletedata": dodeletedata,
//	"addholiday": addHoliday
//}
// id="staffmenu", onclick="delHoliday(this)"

//$.each(onclick, function(key, val) {
//	document.getElementById(key).onclick= val
//})

// function declaration (definition ) : public
// function expression (literal) : local

// For staff & residents with login id / password from Get_staff_detail
function userStaff() {
	modelStart().then(response => {
		typeof response === "object"
		? success(response)
		: failed(response)
	}).catch(error => {})

	document.oncontextmenu = () => false
}

// Success return from server
function success(response) {
  updateBOOK(response)

  // call sortable before render, otherwise it renders very slowly
  sortable()
  makeStart()

  // setting up equipments
  initEquipment()

  // make the document editable
  editcellEvent()
  wrapperEvent()
  documentEvent()
  scrolltoToday()
  setStafflist()
  fillConsults()

  disableOneRowMenu()
  disableExcelLINE()
  overrideJqueryUI()
  resetTimer()

  setTimeout( fillupfinish, 2000)
}

// *** offline browsing by service worker ***
function failed(response) {
	let title = "Server Error",
		error = error + "<br><br>Response from server has no data",

	// no data from server, load from localStorage
		local = localStorage.getItem('ALLBOOK')
	if (/BOOK/.test(local)) {
		let temp = JSON.parse(local)
		BOOK = temp.BOOK ? temp.BOOK : []
		CONSULT = temp.CONSULT ? temp.CONSULT : []

		makeStart()
		Alert(title, error + "<br><br>Use localStorage instead<br><br>Read Only mode")

		// add 7 days to QTIME in localStorage so that it will not be
		// overrided with backward data after access with failed server
		let date = nextdays(new Date(), 7)
		localStorage.setItem('localQTIME', date)
	} else {
		Alert(title, error + "No localStorage backup")
	}
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeStart = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = BOOK

	// No case from server
	if (book.length === 0) {
		book.push({"opdate" : START})
	}

	// Fill until 2 year from now
	let	nextyear = new Date().getFullYear() + 2,
		month = new Date().getMonth(),
		todate = new Date().getDate(),
		until = ISOdate((new Date(nextyear, month, todate)))

	viewAll(book, table, START, until)

	// scroll to today
	let	today = thDate(ISOdate(new Date())),
		thishead = $("tr:contains(" + today + ")")[0]

	animateScroll($('#tblcontainer'), thishead.offsetTop, 300)
}

function initEquipment()
{
  let equip = "", type = "", width = "", name = "", id = "", label = ""

  equipSheet.forEach(function(item) {
    type = item[0]
    width = item[1]
    name = item[2]
    id = item[3]
    label = item[4]
    if (type === "divbegin") {
	  equip += `<div title="${name}">`
    } else if (type === "divend") {
	  equip += `</div>`
    } else if (type === "span") {
	  equip += `<span class="${width}" id="${id}">${label}</span>`
    } else if (type === "spanInSpan") {
	  equip += `<span class="${width}">${label}<span id="${id}"></span></span>`
	} else if (type === "br") {
	  equip += `<br>`
	} else if (type === "radio" || type === "checkbox") {
	  equip += `<span class="${width}">
                  <input type="${type}" name="${name}" id="${id}">
                  <label for="${id}">${label}</label>
                </span>`
	} else if (type === "text") {
	  equip += `<span>
                  <input type="${type}" class="${name}" id="${id}" placeholder="${label}">
                </span>`
	} else if (type === "textarea") {
	  equip += `<span>
                  <textarea id="${id}" placeholder="${label}"></textarea>
                </span>`
	}
  })

  document.getElementById("dialogEquip").innerHTML = equip
}

// stafflist for enter name in Staff column
// staffmenu for dropdown sub-menu
let setStafflist = function () {
  let stafflist = '',
      staffmenu = ''
  STAFF.forEach(function(each) {
    stafflist += `<li><div>${each.staffname}</div></li>`
    staffmenu += `<li><a class="clickStaff ${each.staffname}">
                 <span>${each.staffname}</span></a></li>`
  })
  staffmenu += `<li><a class="clickStaff Consults"><span>Consults</span></a></li>`
  document.getElementById("stafflist").innerHTML = stafflist
  document.getElementById("staffmenu").innerHTML = staffmenu
  setClickStaff()
}

function editcellEvent()
{
  let $editcell = $("#editcell")

  $editcell.on("keydown", event => {
    let keyCode = event.which || window.event.keyCode
    let pointing = $editcell.data("pointing")

    if ($('#dialogService').is(':visible')) {
      Skeyin(event, keyCode, pointing)
    } else {
      keyin(event, keyCode, pointing)
    }
    if (!$("#spin").length) {
      resetTimer()
      idleCounter = 0
    }
  })

  // for resizing the editing cell
  $editcell.on("keyup", event => {
    let keyCode = event.which || window.event.keyCode
    $editcell.height($editcell[0].scrollHeight)
  })

  $editcell.on("click", event => {
    event.stopPropagation()
    return
  })
}

function wrapperEvent()
{
  document.getElementById("wrapper").addEventListener("wheel", event => {
    resetTimer();
    idleCounter = 0
    $(".marker").removeClass("marker")
  })
  
  document.getElementById("wrapper").addEventListener("mousemove", event => {
    resetTimer();
    idleCounter = 0
  })

  $("#wrapper").on("click", event => {
    let target = event.target
    let $stafflist = $('#stafflist')

    resetTimer();
    idleCounter = 0
    $(".marker").removeClass("marker")

    if ($(target).closest('#cssmenu').length) {
      return
    }
    if ($stafflist.is(":visible")) {
      if (!$(target).closest('#stafflist').length) {
        $stafflist.hide();
        clearEditcell()
      }
    }
    if (target.nodeName === "P") {
      target = $(target).closest('td')[0]
    }
    if (target.cellIndex === THEATRE) {
	  let $tbl = $("#tbl")
      if ($tbl.find("th").eq(THEATRE).width() < 10) {
        $tbl.addClass("showColumn2")
      }
	  else if (target.nodeName === "TH") {
        $tbl.removeClass("showColumn2")
      }
    }
    if (target.nodeName === "TD") {
      clicktable(event, target)
    } else {
      clearEditcell()
      clearMouseoverTR()
      clearSelection()
    }

    event.stopPropagation()
  })
}

function documentEvent()
{
  // Prevent the Backspace key from navigating back.
  // Esc to cancel everything
  $(document).off('keydown').on('keydown', event => {
    let keycode = event.which || window.event.keyCode,
      ctrl = event.ctrlKey,
      shift = event.shiftKey,
      home = keycode === 36,
      backspace = keycode === 8,
      esc = keycode === 27,
      y = keycode === 89,
      z = keycode === 90

    if (backspace) {
      let doPrevent = true
      let types = ["text", "password", "file", "number", "date", "time"]
      let d = $(event.srcElement || event.target)
      let disabled = d.prop("readonly") || d.prop("disabled")
      if (!disabled) {
        if (d[0].isContentEditable) {
          doPrevent = false
        } else if (d.is("input")) {
          let type = d.attr("type")
          if (type) {
            type = type.toLowerCase()
          }
          if (types.indexOf(type) > -1) {
            doPrevent = false
          }
        } else if (d.is("textarea")) {
          doPrevent = false
        }
      }
      if (doPrevent) {
        event.preventDefault()
        return false
      }
    }
    else if (esc) {
      clearAllEditing()
    }
    // ctrl+shift+Home to see last entries of local and server
    else if (home && ctrl && shift) {
      // Merge data to server
      latestEntry()
      event.preventDefault()
    }
    else if (y && ctrl) {
      UndoManager.redo()
      event.preventDefault()
    }
    else if (z && ctrl) {
      UndoManager.undo()
      event.preventDefault()
    }

    resetTimer()
    idleCounter = 0
  });

  $(document).contextmenu( event => {
    let target = event.target
    let oncall = /<p[^>]*>.*<\/p>/.test(target.outerHTML)

    if (oncall) {
      if (event.ctrlKey) {
        exchangeOncall(target)
      }
      else if (event.altKey) {
        addStaff(target)
      }
      event.preventDefault()
    }
  })

  window.addEventListener('resize', () => {
    $("#tblwrapper").css("height", window.innerHeight - $("#cssmenu").height())
    $("#queuecontainer").css({
      "height": $("#tblwrapper").height() - $("#titlebar").height()
    })
  })
}

function scrolltoToday()
{
  let today = new Date(),
    todate = today.ISOdate(),
    todateth = todate.thDate()
  $('#tblcontainer').scrollTop(0)
  let thishead = $("#tbl tr:contains(" + todateth + ")")[0]
  $('#tblcontainer').animate({
    scrollTop: thishead.offsetTop
  }, 300);
}

// allow the dialog title to contain HTML
function overrideJqueryUI()
{
  $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
    _title: function(title) {
        if (!this.options.title ) {
            title.html("&#160;");
        } else {
            title.html(this.options.title);
        }
    }
  }))
}

// poke server every 10 sec.
function clearTimer() {
	clearTimeout(timer)
}
function resetTimer() {
	clearTimer()
	timer = setTimeout( updating, 10000)
}

// While idling every 10 sec., get updated by itself and another clients
// 1. Visible editcell
// 	1.1 Editcell changed (update itself and from another client on the way)
//	1.2 Editcell not changed, check updated from another client
// 2. Not visible editcell, get update from another client
let updating = function () {
	if ($("#editcell").is(":visible") && onChange()) {
		idleCounter = 0
		updateEditcellData()
	} else {
		idling()
	}

	resetTimer(true, false)
}

// savePreviousCell and return with true (changed) or false (not changed)
let onChange = function () {
	let whereEditcell = $("#editcell").siblings("table").attr("id")

	// Service table : Main or Staffqueue tables
	return (whereEditcell === "servicetbl")
			? savePreviousCellService()
			: savePreviousCell()
}

// Check data in server changed from last loading timestamp
// if not being editing on screen (idling) 1 minute, clear editing setup
// if idling 10 minutes, logout
// if some changes in database from other users (while this user is idling),
// then sync data of editcell with underlying table cell
let idling = function () {

	modelIdling(timestamp).then(response => {
		idleCounter += 1
		if (idleCounter === 5) {
			clearMenu()
			clearEditcell()
			clearMouseoverTR()
		} else {
			if (idleCounter > 59) {
				window.location = window.location.href
			}
		}

		if (typeof response === "object") {
			updateBOOK(response)
			viewIdling()
			$("#editcell").is(":visible") && updateEditcellData()
		}
	}).catch(error => {})
}

function clearAllEditing()
{
  $('#stafflist').hide();
  clearEditcell()
  clearMouseoverTR()
  clearSelection()
  if ($("#dialogNotify").hasClass('ui-dialog-content')) {
    $("#dialogNotify").dialog("close")
  }
  $(".marker").removeClass("marker")
}

// Click on main or staff table
function clicktable(clickedCell) {
	savePreviousCell()
	editPresentCell(clickedCell)
}

function savePreviousCell() {
	let pointed = getPointer(),
		oldcontent = getOldcontent(),
		newcontent = getNewcontent(),
		cell = pointed && pointed.cellIndex,
		save = {}

	save[OPDATE] = false
	save[OPROOM] = function () {
		saveOpRoom(pointed, newcontent)
		return true	
	}
	save[STAFFNAME] = false
	save[HN] = function () {
		if (newcontent.length === 7) {
			saveHN(pointed, "hn", newcontent)
			return true
		}
		return false
	}
	save[PATIENT] = false
	save[DIAGNOSIS] = function () {
		saveContent(pointed, "diagnosis", newcontent)
		return true
	}
	save[TREATMENT] = function () {
		saveContent(pointed, "treatment", newcontent)
		return true
	}
	save[CONTACT] = function () {
		saveContent(pointed, "contact", newcontent)
		return true
	}

	return pointed && (oldcontent !== newcontent) && save[cell] && save[cell]()
}

// negative waitnum in Consults cases
let saveOpRoom = function (pointed, newcontent) {
	let tableID = $(pointed).closest("table").attr("id"),
		waitnum = (ConsultsTbl(tableID)) ? -1 : 1,
		$cells = $(pointed).closest('tr').children("td"),
		opdate = getOpdate($cells[OPDATE].innerHTML),
		oproom = $cell[OPROOM].innerHTML,
		casenum = $cell[CASENUM].innerHTML,
		qn = $cells[QN].innerHTML,
		content = newcontent && newcontent.split("<br>"),
		args = {
			waitnum: waitnum,
			opdate: opdate,
			qn: qn,
			oproom: oproom,
			optime: optime
		},
		argsold = {
			waitnum: waitnum,
			opdate: opdate,
			qn: qn,
			oproom: oldroom,
			optime: oldtime
		}
	
	doSaveRoomTime(args)

	// make undo-able
	UndoManager.add({
		undo: function() {
			doSaveRoomTime(argsold)
		},
		redo: function() {
			doSaveRoomTime(args)
		}
	})		
}

var doSaveRoomTime = function(args) {
	modelSaveRoomTime(args).then(response => {
		let hasData = function () {
			updateBOOK(response)
			viewSaveRoomTime(args.opdate)
		};

		typeof response === "object"
		? hasData()
		: Alert ("saveRoomTime", response)
	}).catch(error => {})
}

// use only "pointed" to save data
let saveContent = function (pointed, column, newcontent) {
	// take care of white space, double qoute, single qoute, and back slash
	let content = URIcomponent(newcontent),
		args = {
			pointed: pointed, 
			column: column, 
			content: content, 
			cellindex: pointed.cellIndex,
			tableID: $(pointed).closest("table").attr("id"),
			$row: $(pointed).closest('tr'),
			$cells: args.$row.children("td"),
			opdate: getOpdate(args.$cells.eq(OPDATE).html()),
			oproom: args.$cells[OPROOM].innerHTML,
			casenum: args.$cells[CASENUM].innerHTML,
			staffname: args.$cells.eq(STAFFNAME).html(),
			qn: args.$cells.eq(QN).html() || 0,
			oldcontent: getOldcontent(),
			titlename: $('#titlename').html()
		},
		// Copy object
		argsold = {}
	argsold = $.extend(argsold, args)
	argsold.content = URIcomponent(oldcontent)
	argsold.newcontent = oldcontent
	argsold.oldcontent = newcontent

	qn ? saveContentQN(args, argsold) : saveContentNoQN(args, argsold)
}

let saveContentQN = function (args, argsold) {

	saveConQN(args)

	// make undo-able
	UndoManager.add({
		undo: function() {
			saveConQN(argsold)
		},
		redo: function() {
			saveConQN(args)
		}
	})		
}

let saveConQN = function (args) {

	// transfer from editcell to table cell, no re-render
	args.pointed.innerHTML = args.newcontent

	modelSaveContent(args).then(response => {
		let hasData = function () {

			updateBOOK(response)
			viewSaveContent(args)
		},
			noData = function () {
			Alert("saveContentQN", response)
			args.pointed.innerHTML = args.oldcontent
			// return to previous content
		};

		typeof response === "object" ? hasData() : noData()
	}).catch(error => {})
}

let saveContentNoQN = function (args, argsold) {

	// new case, calculate waitnum
	args.waitnum = calculateWaitnum(args.tableID, args.$row, args.opdate)

	saveNoQN(args).then(qn => {

		// make undo-able
		UndoManager.add({
			undo: function() {
				argsold.qn = qn
				saveNoQN(argsold).then(() => {}).catch(() => {})
			},
			redo: function() {
				args.qn = qn
				saveNoQN(args).then(() => {}).catch(() => {})
			}
		})
	}	)	
}

let saveNoQN = function (args) {

	// transfer from editcell to table cell, no re-render
	args.pointed.innerHTML = args.newcontent

	return new Promise((resolve, reject) => {
		modelSaveNoQN(args).then(response => {
			let hasData = function () {
				updateBOOK(response)
				resolve(viewSaveNoQN(args))
			}
			let noData = function () {
				Alert("saveContentNoQN", response)

				// return to previous content
				args.pointed.innerHTML = args.oldcontent
				reject()
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { reject() })
	})
}

// Use 7 digit hn to PHP
// PHP Get_demographic_short($hn) from hospital SOAP server
// PHP finds this patient's previous data in local server
let saveHN = function (pointed, hn, content) {
	if (!/^\d{7}$/.test(content)) {
		pointed.innerHTML = ""
		return false
	}

	var	waiting = getWaitingBOOKrowByHN(content)[0]

//	pointed.innerHTML = content
	if (waiting) {
		getCaseHN(pointed, waiting)
	} else {
		getNameHN(pointed, content)
	}
}

function getCaseHN(pointed, waiting)
{
	let	argsnew = {
		tableID: $(pointed).closest("table").attr("id"),
		$row: $(pointed).closest('tr'),
		rowi: argsnew.$row[0],
		$cells: argsnew.$row.find("td"),
		opdateth: argsnew.$cells[OPDATE].innerHTML,
		opdate: getOpdate(opdateth),
		staffname: argsnew.$cells[STAFFNAME].innerHTML,
		qn: argsnew.$cells[QN].innerHTML,
		noqn: !qn,

		hn: waiting.hn,
		patient: waiting.patient,
		dob: waiting.dob,

		oldcontent: $("#editcell").data("oldcontent"),
		sql: "sqlReturnbook=",

		$dialogMoveCase: $("#dialogMoveCase"),
		$movetbl: $("#movetbl"),
		$movefrom: $("#movefrom").next(),
		$moveto: $("#moveto").next(),
		tblcells: $("#tblcells tr").html()
	},
	// Copy object
	argsold = {}
	argsold = $.extend(argsold, argsnew)
	argsold.content = ""

	!qn && (argsnew.waitnum = calculateWaitnum(tableID, $row, opdate))

	modelSaveHN(argsnew).then(argsreturn => {

		// waitnum
		//	? qnnew
		//		? redoNew()
		//		: newCase()
		//	: qn
		//		? qnnew
		//			? content
		//				? redoExisted()
		//				: undoExisted()
		//			: existedCase()
		//		: undoNew()
		UndoManager.add({
			undo: function() {
				// new case will be deleted when undo
				$.extend(argsold, argsreturn)
				modelSaveHN(argsold).then(() => {}).catch(() => {})
			},
			redo: function() {
				$.extend(argsnew, argsreturn)
				modelSaveHN(argsnew).then(() => {}).catch(() => {})
			}
		})
	}).catch(error => {})

	// To immediately show new content
//	pointed.innerHTML = content
}

let modelSaveHN = function (argsnew) {
	return new Promise((resolve, reject) => {
		modelSaveByHN(argsnew).then(response => {
			let hasData = function () {
				updateBOOK(response)
				resolve(viewSaveByHN(argsnew))
				createEditcell(getPointer())
				// after callback from Ajax, editcell have got new position
				// New case may be higher than blank cell
			},
			noData = function () {
				Alert("saveHN", response)
				// return to previous content
				pointed.innerHTML = oldcontent
				reject()
			};

			typeof response === "object" ? hasData() : noData()
		}).catch(error => { reject() })
	})
}

// Set up editcell for keyin or menu/spinner selection
// redirect click to openPACS or file upload
function editPresentCell(pointing) {
	let cell = pointing && pointing.cellIndex,
		store = {}

	store[OPDATE] = function () {
		clearEditcell()
		clearMouseoverTR()
		selectRow(evt, pointing)
	}
	store[THEATRE] = function () {
		createEditcell(pointing)
		clearSelection()
	}
	store[OPROOM] = function () {
		getROOMCASE(pointing)
		clearSelection()
	}
	store[OPTIME] = function () {
		getOPTIME(pointing)
		clearSelection()
	}
	store[CASENUM] = function () {
		getROOMCASE(pointing)
		clearSelection()
	}
	store[STAFFNAME] = function () {
		getSTAFFNAME(pointing)
		clearSelection()
	}
	store[HN] = function () {
		getHN(evt, pointing)
		clearSelection()
	}
	store[PATIENT] = function () {
		getNAME(evt, pointing)
		clearSelection()
	}
	store[DIAGNOSIS] = function () {
		createEditcell(pointing)
		clearSelection()
	}
	store[TREATMENT] = function () {
		createEditcell(pointing)
		clearSelection()
	}
	store[EQUIPMENT] = function () {
		getEQUIP(pointing)
		clearSelection()
	}
	store[CONTACT] = function () {
		createEditcell(pointing)
		clearSelection()
	}

	store[cell] && store[cell]()
}

function selectRow(event, target)
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

function clearSelection()
{
  $('.selected').removeClass('selected lastselected');
  disableOneRowMenu()
  disableExcelLINE()
}

function disableOneRowMenu()
{
	let ids = ["#addrow", "#postpone", "#changedate", "#history", "#delete"]

	ids.forEach(function(each) {
		$(each).addClass("disabled")
	})
}

function disableExcelLINE()
{
	$("#EXCEL").addClass("disabled")
	$("#LINE").addClass("disabled")
}

function getROOMCASE(pointing)
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
	clearTimeout(gv.timer)
}

function getOPTIME(pointing)
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
	clearTimeout(gv.timer)
}

function getSTAFFNAME(pointing)
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

function getHN(evt, pointing)
{
	if (pointing.innerHTML) {
		clearEditcell()
		if (gv.isPACS) {
			if (inPicArea(evt, pointing)) {
				PACS(pointing.innerHTML)
			}
		}
	} else {
		createEditcell(pointing)
	}
}

function getNAME(evt, pointing)
{
	let hn = $(pointing).closest('tr').children("td")[HN].innerHTML
	let patient = pointing.innerHTML

	if (inPicArea(evt, pointing)) {
		showUpload(hn, patient)
	}
	clearEditcell()
}

function getEQUIP(pointing)
{
	let tableID = $(pointing).closest('table').attr('id'),
		book = ConsultsTbl(tableID)? gv.CONSULT : gv.BOOK,
		$row = $(pointing).closest('tr'),
		qn = $row.find("td")[QN].innerHTML

	if (qn) {
		fillEquipTable(book, $row, qn)
	}
}
 
function getText($cell)
{
	// TRIM excess spaces at begin, mid, end
	// remove html tags except <br>
	let HTMLTRIM		= /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	let HTMLNOTBR		= /(<((?!br)[^>]+)>)/ig

	return $cell.length && $cell.html()
							.replace(HTMLTRIM, '')
							.replace(HTMLNOTBR, '')
}

function PACS(hn) { 
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
/*
function setHoliday()
{
	let	$dialogHoliday = $("#dialogHoliday"),
		$holidaytbl = $("#holidaytbl"),
		$holidateth = $("#holidateth"),
		$holidayname = $("#holidayname"),
		holidaylist = '<option style="display:none"></option>'

	fillHoliday($holidaytbl)
	$dialogHoliday.dialog({
		title: "Holiday",
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: 350,
		height: 600,
		buttons: [{
			text: "Save",
			id: "buttonHoliday",
			click: function () {
				saveHoliday()
			}
		}],
		close: function() {
			let	$inputRow = $("#holidaytbl tr:has('input')")

			if ($inputRow.length) {
				holidayInputBack($inputRow)
			}
		}
	})

	let $buttonHoliday = $("#buttonHoliday")
	$buttonHoliday.hide()

	// select date by calendar
	$holidateth.datepicker({
		autoSize: true,
		dateFormat: "dd M yy",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		// use Short names to be consistent with the month converted by numDate()
		monthNamesShort: THAIMONTH,
		yearSuffix: new Date().getFullYear() +  543,
		beforeShow: function (input, inst) {
			if (inst.selectedYear) {
				// prevent using Buddhist year from <input>
				$(this).datepicker("setDate",
					new Date(inst.currentYear, inst.currentMonth, inst.currentDay))
			} else {
				$(this).datepicker("setDate", new Date())
			}
			$holidateth.one("click", function() {
				if (input.value) {
					$holidateth.val(input.value.slice(0, -4) + (inst.selectedYear + 543))
				}
			})
		},
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker("setDate",
				new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay))
			inst.settings.yearSuffix = inst.selectedYear + 543
			$holidateth.val($holidateth.val().slice(0, -4) + (inst.selectedYear + 543))
		},
		onSelect: function (input, inst) {
			$holidateth.val(input.slice(0, -4) + (inst.selectedYear + 543))
			if ($holidayname.val()) {
				$buttonHoliday.show()
			}
		}
	})

	// option holidays Eng: Thai
	$.each(HOLIDAYENGTHAI, function(key, val) {
		holidaylist += `<option value="${key}">${val}</option>`
	})
	$holidayname.html(holidaylist)
	$holidayname.change(function() {
		if ($holidateth.val()) {
			$buttonHoliday.show()
		}
	})
}

function fillHoliday($holidaytbl)
{
	$holidaytbl.find('tr').slice(1).remove()

	$.each( HOLIDAY, function(i) {
		$('#holidaycells tr').clone()
			.appendTo($holidaytbl.find('tbody'))
				.filldataHoliday(this)
	});
}

jQuery.fn.extend({
	filldataHoliday : function(q) {
		let	cells = this[0].cells,
			data = [
				putThdate(q.holidate),
				HOLIDAYENGTHAI[q.dayname]
			]

		dataforEachCell(cells, data)
	}
})

function addHoliday()
{
	let	$dialogHoliday = $("#dialogHoliday"),
		$holidaytbl = $("#holidaytbl")

	// already has an <input> row
	if ($holidaytbl.find("input").length) { return }

	$holidaytbl.find("tbody")
		.append($("#holidayInput tr"))

	let	append = $holidaytbl.height(),
		height = $dialogHoliday.height()
	if (append > height) {
		$dialogHoliday.scrollTop(append - height)
	}
}

document.querySelectorAll("delholiday").forEach(function(item) {
	item.addEventListener("click", function() {
		delHoliday(this)
	})
})

async function delHoliday(that)
{
	let	$row = $(that).closest("tr")

	if ($row.find("input").length) {
		holidayInputBack($row)
	} else {
		let	$cell = $row.find("td"),
			vdateth = $cell[0].innerHTML,
			vdate = vdateth.numDate(),
			vname = $cell[1].innerHTML.replace(/<button.*$/, ""),
			rows = getTableRowsByDate(vdateth),
			holidayEng = getHolidayEng(vname),

			sql = "sqlReturnData=DELETE FROM holiday WHERE "
				+ "holidate='" + vdate
				+ "' AND dayname='" + holidayEng
				+ "';SELECT * FROM holiday ORDER BY holidate;"

		let response = await postData(MYSQLIPHP, sql)
		if (typeof response === "object") {
			HOLIDAY = response
			$(rows).each(function() {
				this.cells[DIAGNOSIS].style.backgroundImage = ""
			})
			$row.remove()
		} else {
			alert(response)
		}
	}
}
/*
async function saveHoliday()
{
	let	vdateth = document.getElementById("holidateth").value,
		vdate = vdateth.numDate(),
		vname = document.getElementById("holidayname").value,
		rows = getTableRowsByDate(vdateth),

		sql = "sqlReturnData="
			+ "INSERT INTO holiday (holidate,dayname) VALUES('"
			+ vdate + "','"+ vname
			+ "');SELECT * FROM holiday ORDER BY holidate;"

	if (!vdate || !vname) { return }

	let response = await postData(MYSQLIPHP, sql)
	if (typeof response === "object") {
		HOLIDAY = response
		holidayInputBack($("#holidateth").closest("tr"))
		fillHoliday($("#holidaytbl"))
		$("#buttonHoliday").hide()
		$(rows).each(function() {
			this.cells[DIAGNOSIS].style.backgroundImage = holiday(vdate)
		})
	} else {
		alert(response)
	}
}

function getHolidayEng(vname) {
	return Object.keys(HOLIDAYENGTHAI).find(key => HOLIDAYENGTHAI[key] === vname)
}

// Have to move $inputRow back and forth because datepicker is sticked to #holidateth
function holidayInputBack($inputRow)
{
	$("#holidateth").val("")
	$("#holidayname").val("")
	$('#holidayInput tbody').append($inputRow)
}

function holiday(date)
{
	if (date !== LARGESTDATE) {
		return religiousHoliday(date) || officialHoliday(date)
	}
}

// Thai official holiday & Compensation
function religiousHoliday(date)
{
	let relHoliday = HOLIDAY.find(day => day.holidate === date)
	if (relHoliday) {
		return `url('css/pic/holiday/${relHoliday.dayname}.png')`
	}
}

// Thai official holiday & Compensation
function officialHoliday(date)
{
	const monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		Mon = (dayofweek === 1),
		Tue = (dayofweek === 2),
		Wed = (dayofweek === 3),
		Thai = {
			"12-31": "Yearend",
			"01-01": "Newyear",
			"01-02": (Mon || Tue) && "Yearendsub",
			"01-03": (Mon || Tue) && "Newyearsub",
			"04-06": "Chakri",
			"04-07": Mon && "Chakrisub",
			"04-08": Mon && "Chakrisub",
			"04-13": "Songkran",
			"04-14": "Songkran",
			"04-15": "Songkran",
			"04-16": (Mon || Tue || Wed) && "Songkransub",
			"04-17": (Mon || Tue || Wed) && "Songkransub",
			"07-28": "King10",
			"07-29": Mon && "King10sub",
			"07-30": Mon && "King10sub",
			"08-12": "Queen",
			"08-13": Mon && "Queensub",
			"08-14": Mon && "Queensub",
			"10-13": "King09",
			"10-14": Mon && "King09sub",
			"10-15": Mon && "King09sub",
			"10-23": "Piya",
			"10-24": Mon && "Piyasub",
			"10-25": Mon && "Piyasub",
			"12-05": "King9",
			"12-06": Mon && "King9sub",
			"12-07": Mon && "King9sub",
			"12-10": "Constitution",
			"12-11": Mon && "Constitutionsub",
			"12-12": Mon && "Constitutionsub"
		},
		govHoliday = Thai[monthdate]

	if (govHoliday) {
		return `url('css/pic/holiday/${govHoliday}.png')`
	}
}
*/