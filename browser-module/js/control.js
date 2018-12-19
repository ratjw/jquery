
import {
	OPDATE, THEATRE, OPROOM, OPTIME, CASENUM, STAFFNAME, HN, PATIENT,
	DIAGNOSIS, TREATMENT, EQUIPMENT, CONTACT, QN, LARGESTDATE
} from "./const.js"

import {
	createEditcellOpdate, createEditcellRoomtime, getPointer, getOldcontent,
	getNewcontent, updateEditcellData, createEditcell, clearEditcell, reposition
} from "./edit.js"

import { clearMouseoverTR } from "./menu.js"
import { sortable } from "./sort.js"
import { savePreviousCellService } from "./serv.js"

import {
	modelStart, modelSyncServer, modelFindLatestEntry,
	modelSaveRoomTime, modelSaveContent, modelSaveNoQN, modelSaveByHN
} from "./model.js"

import {
	BOOK, CONSULT, STAFF, ONCALL, HOLIDAY,isPACS, START,
	getOpdate, ISOdate, thDate, calculateWaitnum, URIcomponent, Alert,
	UndoManager, updateBOOK, showUpload, resetTimer, updating, menustyle
} from "./util.js"

import {
	viewAll, viewLatestEntry, viewIdling, viewSaveRoomTime, viewSaveContent,
	viewSaveNoQN, viewSaveByHN, animateScroll, setClickStaff
} from "./view.js"

// Public functions
export {
	savePreviousCell, editPresentCell,
	PACS, userStaff
}

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
	setStafflist()
	resetTimer()

	$("#wrapper").on("click", function (event) {
		resetTimer();
		$(".borderfound").removeClass("borderfound")
		event.stopPropagation()
		let	target = event.target,
			clickOutside = function (id) {
				if (($(id).is(":visible")) && (!$(target).closest(id).length)) {
					$(id).hide();
					clearEditcell()
				}
			}

		// clickOutside these 3 pop-ups to close
		clickOutside("#menu")
		clickOutside("#stafflist")
		clickOutside("#undelete")

		if (target.nodeName !== "TD") {
			clearEditcell()
			if (target.nodeName === "TH") {
				if (target.cellIndex === 0) {
					UndoManager.undo()
				}
				else if (target.cellIndex === 1) {
					UndoManager.redo()
				}
			}
			return	
		}
		// Both main and staff tables (same wrapper)
		clicktable(event.target)
	})

	// ctrl+shift+Home to see last entries of local and server
	$(window).on("keydown", function (event) {
		let	keycode = event.which || window.event.keyCode,
			home = keycode === 36,
			y = keycode === 89,
			z = keycode === 90

		if (home && event.ctrlKey && event.shiftKey) {
			// Merge data to server
			latestEntry()
			event.preventDefault()
		}
		else if (y && event.ctrlKey) {
			UndoManager.redo()
			event.preventDefault()
		}
		else if (z && event.ctrlKey) {
			UndoManager.undo()
			event.preventDefault()
		}
	})
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

let clearMenu = function() {
	$('#menu').hide();
	$('#stafflist').hide();
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
		createEditcellOpdate(pointing)
		mainMenu(pointing)
		$("#editcell").blur()
		// prevent mobile keyboard popup
	}
	store[OPROOM] = function () {
		selectRoomTime(pointing)
		createEditcellRoomtime(pointing)
	}
	store[STAFFNAME] = function () {
		createEditcell(pointing)
		stafflist(pointing)
	}
	store[HN] = function () {
		pointing.innerHTML
		? (clearEditcell(),
		   pointing.className === "pacs" && PACS(pointing.innerHTML))
		: createEditcell(pointing)
	}
	store[PATIENT] = function () {
		let hn = $(pointing).closest('tr').children("td").eq(HN).html(),
			patient = pointing.innerHTML

		clearEditcell()
		hn && showUpload(hn, patient)
	}
	store[DIAGNOSIS] = function () {
		createEditcell(pointing)
	}
	store[TREATMENT] = function () {
		createEditcell(pointing)
	}
	store[CONTACT] = function () {
		createEditcell(pointing)
	};

	store[cell] && store[cell]()
}

let selectRoomTime = function (pointing) {
	let ORSURG	= "XSU",
		ORNEURO	= "4",
		ORTIME	= "09.00",
		roomtime = pointing.innerHTML
	roomtime = roomtime ? roomtime.split("<br>") : ""
	let oproom = roomtime[0] ? roomtime[0] : "",
		optime = roomtime[1] ? roomtime[1] : "",
		theatre = oproom && oproom.match(/\D+/) || ORSURG,
		$editcell = $("#editcell")
	$editcell.css("height", "")
	$editcell.html(theatre)
	$editcell.append('<input id="orroom"><br><input id="ortime">')
	let $orroom = $("#orroom"),
		$ortime = $("#ortime")
	$orroom.val(oproom ? oproom.match(/\d+/)[0] : "(" + ORNEURO + ")")

	let orroom = ""
	$orroom.spinner({
		min: 1,
		max: 20,
		step: -1,
		spin: function( event, ui ) {
			if ($orroom.val() === "(" + ORNEURO + ")") {
				orroom = ORNEURO
			}
		},
		stop: function( event, ui ) {
			if (orroom) {
				$orroom.val(orroom)
				orroom = ""	
			}
		}
	})

	let ortime
	$ortime.spinner({
		min: 0,
		max: 24,
		step: -0.5,
		create: function( event, ui ) {
			$ortime.val(optime ? optime : "(" + ORTIME + ")")
		},
		spin: function( event, ui ) {
			ortime = ($ortime.val() === "(" + ORTIME + ")") ? ORTIME : decimalToTime(ui.value)
		},
		stop: function( event, ui ) {
			if (ortime) {
				$ortime.val(ortime)
				ortime = ""	
			}
		}
	})
}

// Decimal 9.5 to time 09.30
let decimalToTime = function (dec) {
	let	integer = Math.floor(dec),
		decimal = dec - integer

	return [
		(integer < 10) ? "0" + integer : "" + integer,
		decimal ? String(decimal * 60) : "00"
	].join(".")
}

// Menu on Staff column to select staff name
let stafflist = function (pointing) {
	let $stafflist = $("#stafflist"),
		width = $stafflist.outerWidth()

	$stafflist.menu({
		select: function( event, ui ) {
			let staffname = ui.item.text()
			saveContent(pointing, "staffname", staffname)
			$(pointing).html(staffname)
			clearEditcell()
			$stafflist.hide()		// to disappear after selection
			event.stopPropagation()
		}
	});

	$stafflist.appendTo($(pointing).closest('div'))
	reposition($stafflist, "left top", "left bottom", pointing)
	menustyle($stafflist, pointing, width)
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

	$.each( gv.HOLIDAY, function(i) {
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
			gv.HOLIDAY = response
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
		gv.HOLIDAY = response
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
	let relHoliday = gv.HOLIDAY.find(day => day.holidate === date)
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