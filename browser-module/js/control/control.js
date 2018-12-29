import {
	clicktable, clearSelection, disableOneRowMenu, disableExcelLINE
} from "./click.js"

import {
	OPDATE, THEATRE, DIAGNOSIS, TREATMENT, CONTACT,
	DIAGNOSISSV, TREATMENTSV, ADMISSIONSV, FINALSV, PROFILESV,
	THAIMONTH, HOLIDAYENGTHAI, EQUIPSHEET
} from "../model/const.js"

import {
	editcellEvent, getPointer, getOldcontent, getNewcontent, editcellLocation,
	clearEditcell
} from "./edit.js"

import { setClickMenu, clearMouseoverTR } from "../model/menu.js"
import {
	modelStart, modelChangeOncall, modeldoUpdate, modelGetUpdate,
	modelSaveOnChange, modelSaveOnChangeService, modelDoadddata, modelDoupdatedata,
	modelDodeletedata
} from "../model/model.js"

import { saveProfileService } from "../model/serv.js"
import { sortable } from "../model/sort.js"

import {
	viewAll, setClickStaff, fillConsults, viewGetUpdate, viewOnIdling
} from "../view/view.js"

import {
	getBOOK, getSTAFF, setONCALL, setSTAFF, gettimestamp, getOpdate,
	ISOdate, thDate, numDate, START, Alert, UndoManager, updateBOOK, menustyle,
	holiday, reposition, dialogServiceShowing
} from "../model/util.js"

// timer is just an id number of setTimeout, not the clock object
// idleCounter is number of cycles of idle setTimeout
let timer = 0,
    idleCounter = 0

// For staff & residents with login id / password from Get_staff_detail
export function userStaff() {
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
  dialogServiceEvent()
  wrapperEvent()
  documentEvent()
  scrolltoToday()
  setStafflist()
  fillConsults()
  setClickMenu()
  setClickSetting()
  disableOneRowMenu()
  disableExcelLINE()
  overrideJqueryUI()
  resetTimer()

  setTimeout( makeFinish, 1000)
}

// *** plan -> offline browsing by service worker ***
function failed(response) {
	let title = "Server Error",
		error = error + "<br><br>Response from server has no data"

	Alert(title, error + "No localStorage backup")
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeStart = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = getBOOK()

	// No case from server
	if (book.length === 0) { book.push({"opdate" : START}) }

	// Fill until 20 days from now
	let	end = new Date().setDate(new Date().getDate() + 20),
		until = ISOdate(new Date(end))

	viewAll(book, table, START, until)
}

// Display everyday on main table 1 month back, and 2 years ahead
let makeFinish = function() {		
	// Start with 1st date of last month
	let	tableID = "tbl",
		table = document.getElementById(tableID),
		book = getBOOK()

	// No case from server
	if (book.length === 0) {
		book.push({"opdate" : START})
	}

	// Fill until 2 year from now
	let	today = new Date(),
		begin = today.setDate(today.getDate() + 21),
		start = ISOdate(new Date(begin)),
		nextyear = today.getFullYear() + 2,
		month = today.getMonth(),
		todate = today.getDate(),
		until = ISOdate((new Date(nextyear, month, todate)))

	viewAll(book, table, start, until, table.rows.length-1)
}

function initEquipment()
{
  let equip = "", type = "", width = "", name = "", id = "", label = ""

  EQUIPSHEET.forEach(function(item) {
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

// poke server every 10 sec.
export function clearTimer() {
	clearTimeout(timer)
}
export function resetTimer() {
	clearTimer()
	timer = setTimeout( updating, 10000)
}

export function resetTimerCounter()
{
	resetTimer();
	idleCounter = 0
}

function dialogServiceEvent()
{
	document.getElementById("dialogService").addEventListener("wheel", resetTimerCounter)
	
	document.getElementById("dialogService").addEventListener("mousemove", resetTimerCounter)
}

function wrapperEvent()
{
  document.getElementById("wrapper").addEventListener("wheel", () => {
    resetTimerCounter()
    $(".marker").removeClass("marker")
  })
  
  document.getElementById("wrapper").addEventListener("mousemove", resetTimerCounter)

  $("#wrapper").on("click", event => {
    let target = event.target
    let $stafflist = $('#stafflist')

    resetTimerCounter()
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
//    else if (home && ctrl && shift) {
      // Merge data to server
//      latestEntry()
//      event.preventDefault()
//    }
    else if (y && ctrl) {
      UndoManager.redo()
      event.preventDefault()
    }
    else if (z && ctrl) {
      UndoManager.undo()
      event.preventDefault()
    }

    resetTimerCounter()
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
    todate = ISOdate(today),
    todateth = thDate(todate)
  $('#tblcontainer').scrollTop(0)
  let thishead = $("#tbl tr:contains(" + todateth + ")")[0]
  $('#tblcontainer').animate({
    scrollTop: thishead.offsetTop
  }, 300);
}

// stafflist for enter name in Staff column
// staffmenu for dropdown sub-menu
let setStafflist = function () {
  let stafflist = '',
      staffmenu = ''
  getSTAFF().forEach(function(each) {
    stafflist += `<li><div>${each.staffname}</div></li>`
    staffmenu += `<li><a class="clickStaff ${each.staffname}">
                 <span>${each.staffname}</span></a></li>`
  })
  staffmenu += `<li><a class="clickStaff Consults"><span>Consults</span></a></li>`
  document.getElementById("stafflist").innerHTML = stafflist
  document.getElementById("staffmenu").innerHTML = staffmenu
  setClickStaff()
}

function exchangeOncall(pointing)
{
  let $stafflist = $("#stafflist")
  let $pointing = $(pointing)

  $stafflist.menu({
    select: ( event, ui ) => {
      let staffname = ui.item.text()
      let opdateth = $pointing.closest('tr').find("td")[OPDATE].innerHTML
      let opdate = getOpdate(opdateth)

      changeOncall(pointing, opdate, staffname)
      $stafflist.hide()
    }
  })

  $stafflist.show()
  reposition($stafflist, "left top", "left bottom", $pointing)
  menustyle($stafflist, $pointing)
  clearEditcell()
}

function changeOncall(pointing, opdate, staffname)
{
  modelChangeOncall(pointing, opdate, staffname).then(response => {
    if (typeof response === "object") {
      pointing.innerHTML = htmlwrap(staffname)
      setONCALL(response)
    } else {
      Alert("changeOncall", response)
    }
  })
}

function setClickSetting()
{
	let onclick = {
		"clickaddStaff": addStaff,
		"clicksetHoliday": setHoliday,
		"clickdoadddata": doadddata,
		"clickdoupdatedata": doupdatedata,
		"clickdodeletedata": dodeletedata,
		"addholiday": addHoliday
	}

	$.each(onclick, function(key, val) {
		document.getElementById(key).onclick= val
	})

	document.querySelectorAll(".delholiday").forEach(function(item) {
		item.addEventListener("click", function() {
			delHoliday(this)
		})
	})
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

// While idling every 10 sec., get updated by itself and another clients
// 1. Visible editcell
// 	1.1 Editcell changed (update itself and from another client on the way)
//	1.2 Editcell not changed, check updated from another client
// 2. Not visible editcell, get update from another client
let updating = function () {
	if (onChange()) {
		idleCounter = 0
	} else {
		doUpdate()
	}

	resetTimer()
}

// savePreviousCell and return with true (changed) or false (not changed)
let onChange = function () {

  // When editcell is not pointing, there must be no change by this editor
  if (!getPointer()) { return false }

  let oldcontent = getOldcontent(),
      newcontent = getNewcontent(),
      pointed = getPointer(),
      index = pointed.cellIndex,
      whereisEditcell = editcellLocation(),
	  qn = $(pointed).siblings(":last").html()

  if (oldcontent === newcontent) {
    return false
  }

  if (whereisEditcell === "dialogService") {
    return saveOnChangeService(pointed, index, newcontent, qn)
  } else {
    return saveOnChange(pointed, index, newcontent, qn)
  }
}

// Check data changed in server
// if some changes in database from other users (while this user is idling),
// then sync data of editcell with underlying table cell
// gettimestamp is this client last save to server
function doUpdate()
{
  modeldoUpdate().then(response => {
    if (typeof response === "object") {
      if (gettimestamp() < response[0].timestamp) {
        getUpdate()
      } else {
        onIdling()
	  }
    }
  })
}

// There is some changes in database from other users
function getUpdate()
{
  let fromDate = ""
  let toDate = ""

  if (dialogServiceShowing()) {
    fromDate = $('#monthstart').val()
    toDate = $('#monthpicker').val()
  }	  
  modelGetUpdate(fromDate, toDate).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
	  viewGetUpdate(response)
    } else {
      Alert ("getUpdate", response)
    }
  })
}

// if not being editing on screen (idling) 1 minute, clear editing setup
// if idling 10 minutes, logout
function onIdling()
{
    if (idleCounter && !(idleCounter % 6)) {
      clearAllEditing()
	  viewOnIdling()
    } else if (idleCounter > 59) {
      history.back()
    }

    idleCounter += 1
}

function saveOnChange(pointed, index, content, qn)
{
  let column = index === DIAGNOSIS
                ? "diagnosis"
                : index === TREATMENT
                ? "treatment"
                : index === CONTACT
                ? "contact"
                : ""

  if (!column) { return false }

  modelSaveOnChange(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChange", response)
    }
  })

  pointed.innerHTML = content
  return true
}

function saveOnChangeService(pointed, index, content, qn)
{
  let column = index === DIAGNOSISSV
                ? "diagnosis"
                : index === TREATMENTSV
                ? "treatment"
                : index === ADMISSIONSV
                ? "admission"
                : index === FINALSV
                ? "final"
                : ""

  if (index === PROFILESV) { saveProfileService(pointed) }
  if (!column) { return false }

  modelSaveOnChangeService(column, content, qn).then(response => {
    if (typeof response === "object") {
      updateBOOK(response)
    } else {
      Alert ("saveOnChangeService", response)
    }
  })

  pointed.innerHTML = content
  return true
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

function addStaff()
{
  $("#dialogStaff").dialog({
    title: "Subspecialty Staff",
    closeOnEscape: true,
    modal: true,
    show: 200,
    hide: 200,
    width: 600,
    height: 400
  })
  viewAddStaff()
}

function doadddata()
{
	modelDoadddata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
}

function doupdatedata()
{
  if (confirm("ต้องการแก้ไขข้อมูลนี้")) {
	modelDoupdatedata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
  }
} // end of function doupdatedata

function dodeletedata()
{
  if (confirm("ต้องการลบข้อมูลนี้หรือไม่")) {
	modelDodeletedata().then(response => {
		let hasData = function () {
			updateBOOK(response)
			showAddStaff(response)
		}

		typeof response === "object"
		? hasData()
		: Alert ("dodeletedata", response)
	})
  }
}

function showAddStaff(response)
{
	setSTAFF(response.STAFF)
	setStafflist()
	fillConsults()
	addStaff()
}

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
		let	cells = this[0].cells

		cells[0].innerHTML = putThdate(q.holidate)
		cells[1].innerHTML = HOLIDAYENGTHAI[q.dayname]
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

async function delHoliday(that)
{
	let	$row = $(that).closest("tr")

	if ($row.find("input").length) {
		holidayInputBack($row)
	} else {
		let	$cell = $row.find("td"),
			vdateth = $cell[0].innerHTML,
			vdate = numDate(vdateth),
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

async function saveHoliday()
{
	let	vdateth = document.getElementById("holidateth").value,
		vdate = numDate(vdateth),
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
