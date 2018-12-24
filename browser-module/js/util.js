
import {
	OPDATE, STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT, QN,
	LARGESTDATE, THAIMONTH, NAMEOFDAYFULL, NAMEOFDAYABBR
} from "./const.js"

export {
	getBOOK, getCONSULT, getSTAFF, getONCALL, getHOLIDAY, gettimestamp,
	updateBOOK, showUpload, getBOOKrowByQN, getTableRowByQN, isConsultsTbl,
	getBOOKrowsByDate, getTableRowsByDate, putNameAge, rowDecoration, dayName,
	ISOdate, thDate, numDate, nextdays, getOpdate, hoverMain, getClass,
	putThdate, putAgeOpdate, calcWaitnum, URIcomponent, Alert, isSplit,
	winWidth, winHeight, menustyle, UndoManager, holiday, setONCALL, winResizeFix
}

export const isPACS = /10.6./.test(window.location),
	START = ISOdate(new Date(new Date().getFullYear(), new Date().getMonth()-1, 1))

//--- global variables --------------
// BOOK is for main table and individual staff's cases table
// CONSULT is for Consults table (special table in queuetbl)
// ONCALL is for exchanging between staffs for oncall consultation
// HOLIDAY is for Buddhist holiday entry of every year
// timestamp is the last time access from this client to the server
// can't check PACS (always unauthorized 401 with Firefox)

;(function($) {
	$.fn.fixMe = function($container) {
		let $this = $(this),
			$t_fixed,
			pad = $container.css("paddingLeft")
		init();
		$container.off("scroll").on("scroll", scrollFixed);

		function init() {
			$t_fixed = $this.clone();
			$t_fixed.attr("id", "fixed")
			$t_fixed.find("tbody").remove().end()
					.addClass("fixed").insertBefore($this);
			$container.scrollTop(0)
			resizeFixed();
			reposition($t_fixed, "left top", "left+" + pad + " top", $container)
			$t_fixed.hide()
		}
		function resizeFixed() {
			$t_fixed.find("th").each(function(index) {
				$(this).css("width",$this.find("th").eq(index).width() + "px");
			});
		}
		function scrollFixed() {
			let offset = $(this).scrollTop(),
			tableTop = $this[0].offsetTop,
			tableBottom = tableTop + $this.height() - $this.find("thead").height();
			if(offset < tableTop || offset > tableBottom) {
				$t_fixed.hide();
			}
			else if (offset >= tableTop && offset <= tableBottom && $t_fixed.is(":hidden")) {
				$t_fixed.show();
			}
		}
	};
})(jQuery);

let BOOK = [],
	CONSULT = [],
	STAFF = [],
	ONCALL = [],
	HOLIDAY = [],
	timestamp = ""

function getBOOK() { return BOOK }
function getCONSULT() { return CONSULT }
function getSTAFF() { return STAFF }
function getONCALL() { return ONCALL }
function getHOLIDAY() { return HOLIDAY }
function gettimestamp() { return timestamp }
function setONCALL(oncall) { ONCALL = oncall }

$.fn.refixMe = function($original) {
  let $fix = $original.find("thead tr").clone();

  resizeFixed($fix, $original);
  $(this).html($fix)
}

function resizeFixed($fix, $this)
{
  $fix.find("th").each(function(index) {
    let wide = $this.find("th").eq(index).width()

    $(this).css("width", wide + "px")
  });
}

function winResizeFix($this, $container) {
	let $fix = $("#fixed"),
		hide = $fix.css("display") === "none",
		pad = $container.css("paddingLeft")

	$fix.find("th").each(function(index) {
		$(this).css("width",$this.find("th").eq(index).width() + "px");
	});
	reposition($fix, "left top", "left+" + pad + " top", $container)
	hide && $fix.hide()
}

// Save data got from server
// Two main data for tables (BOOK, CONSULT) and a timestamp
// QTIME = datetime of last fetching : $mysqli->query("SELECT now();")
function updateBOOK(response) {
	if (response.BOOK) { BOOK = response.BOOK }
	if (response.CONSULT) { CONSULT = response.CONSULT }
	if (response.STAFF) { STAFF = response.STAFF }
	if (response.ONCALL) { ONCALL = response.ONCALL }
	if (response.HOLIDAY) { HOLIDAY = response.HOLIDAY }
	if (response.QTIME) { timestamp = response.QTIME }
}

// hnName is a pre-defined letiable in child window (jQuery-File-Upload)
// uploadWindow is to be replaced by new window, used for showUpload only
let uploadWindow = null
function showUpload(hn, patient) {
	uploadWindow && !uploadWindow.closed && uploadWindow.close();
	uploadWindow = window.open("../jQuery-File-Upload/index.html", "_blank")
	uploadWindow.hnName = {"hn": hn, "patient": patient}
}

// Javascript Date Object to MySQL date (ISOdate 2014-05-11)
function ISOdate(date) {
	if (!date) { return date }

	let mm = date.getMonth() + 1,
		dd = date.getDate();

	return [date.getFullYear(),
			(mm < 10) ? "0" + mm : "" + mm,
			(dd < 10) ? "0" + dd : "" + dd
			].join("-")
} 

// ISOdate (2014-05-11) to Thai date (11 พค. 2557) 
function thDate(opdate) {
	if (!opdate) { return opdate }

	// LARGESTDATE (9999-12-31)
	if (String(opdate) > "9999") { return "" }

	let date = opdate.split("-"),
		yyyy = Number(date[0]) + 543,
		mm = THAIMONTH[Number(date[1]) - 1]

	return [
		date[2],
		THAIMONTH[Number(date[1]) - 1],
		Number(date[0]) + 543
	].join(" ")
}

// Thai date (11 พค. 2557) to ISOdate (2014-05-11)
function numDate(opdate) {
	if (!opdate) { return "" }

	let date = opdate.split(" "),
		mm = THAIMONTH.indexOf(date[1]) + 1

    return [
		Number(date[2]) - 543,
		(mm < 10 ? '0' : '') + mm,
		date[0]
	].join("-")
} 

// Date Object or ISOdate to be added or substracted by days
// Result in ISOdate (2014-05-11)
function nextdays(date, days) {
	if (!date) { return date }

	let next = new Date(date);
		next.setDate(next.getDate() + days);

	return ISOdate(next);
}

// change Thai date from table to ISO date
function getOpdate (date) {
	// Undefined date will be taken care by numDate
	return (String(date) === "") ? LARGESTDATE : numDate(date)
}

// change date in book to show on table taking care of LARGESTDATE
function putThdate (date) {
	if (!date) { return date }

	return (String(date) === LARGESTDATE) ? "" : thDate(date)
}

function putAgeOpdate(dob, date)
{
	return (!date || !dob) ? "" : getAge(dob, date)
}

// Calculate age at (toDate) (iso format) from birth date
function getAge (birth, toDate) {
	// with LARGESTDATE as today
	if (!birth) { return "" }

	birth = new Date(birth);
	let today = (toDate === LARGESTDATE) ? new Date() : new Date(toDate),

		ayear = today.getFullYear(),
		amonth = today.getMonth(),
		adate = today.getDate(),
		byear = birth.getFullYear(),
		bmonth = birth.getMonth(),
		bdate = birth.getDate(),

		days = adate - bdate,
		months = amonth - bmonth,
		years = ayear - byear;
	if (days < 0)
	{
		months -= 1
		days = new Date(byear, bmonth+1, 0).getDate() + days;
	}
	if (months < 0)
	{
		years -= 1
		months += 12
	}

	let ageyears = years ? years + Math.floor(months / 6)  + " ปี " : "",
		agemonths = months ? months + Math.floor(days / 15)  + " ด." : "",
		agedays = days ? days + " ว." : "";

	return years ? ageyears : months ? agemonths : agedays;
}

// necessary when passing to http, not when export to excel
function URIcomponent(qoute) {
  if (/\W/.test(content)) {
    content = content.replace(/\s+$/,'')
    content = content.replace(/\"/g, "&#34;")  // double quotes
    content = content.replace(/\'/g, "&#39;")  // single quotes
    content = content.replace(/%/g, "&#37;")   // per cent, mysql: like "%...%"
    content = content.replace(/\\/g, "\\\\")
    content = encodeURIComponent(content)
  }
  return content
}

function getMaxQN(book)
{
	var qn = Math.max.apply(Math, $.map(book, function(row, i) {
			return row.qn
		}))
	return String(qn)
}

function getBOOKrowByQN(book, qn) {  
	return book.find(row => row.qn === qn )
}

function getTableRowByQN(tableID, qn)
{
	return $("#"+tableID+" tr:has(td)").toArray().find(row => row.cells[QN].innerHTML === qn)
}

function getWaitingBOOKrowByHN(hn)
{  
	var	todate = ISOdate(new Date())

	return BOOK.find(bookq => bookq.opdate > todate && bookq.hn === hn)
}

function getBOOKrowsByDate(book, opdate)
{
	return book.filter(function(q) {
		return (q.opdate === opdate);
	})
}

// main table (#tbl) only
function getTableRowsByDate(opdateth)
{
	if (!opdateth) { return [] }
	return $("#tbl tr").filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth;
	})
}

function findStartRowInBOOK(book, opdate)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < opdate)) {
		q++
	}
	return (q < book.length)? q : -1
}

function findLastDateInBOOK(book)
{
	var q = 0
	while ((q < book.length) && (book[q].opdate < LARGESTDATE)) {
		q++
	}
	return book[q-1].opdate
}

// main table (#tbl) only
function sameDateRoomTableQN(opdateth, room)
{
	if (!room) { return [] }

	var sameRoom = $('#tbl tr').filter(function() {
		return this.cells[OPDATE].innerHTML === opdateth
			&& this.cells[THEATRE].innerHTML === theatre
			&& this.cells[OPROOM].innerHTML === room;
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.cells[QN].innerHTML
	})
	return $.makeArray(sameRoom)
}

function sameDateRoomBookQN(book, opdate, room)
{
	if (!room) { return [] }

	var sameRoom = book.filter(function(row) {
		return row.opdate === opdate && Number(row.oproom) === Number(room);
	})
	$.each(sameRoom, function(i) {
		sameRoom[i] = this.qn
	})
	return sameRoom
}

// for main table (#tbl) only
function createThisdateTableRow(opdate, opdateth)
{
	if (opdate === LARGESTDATE) { return null }
	var rows = getTableRowsByDate(thDate(nextdays(opdate, -1))),
		$row = $(rows[rows.length-1]),
		$thisrow = $row && $row.clone().insertAfter($row)

	$thisrow && $thisrow.find("td").eq(OPDATE).html(opdateth)

	return $thisrow
}

function isSplit()
{  
	return $("#queuewrapper").css("display") === "block"
}

function isStaffname(staffname)
{  
	return $('#titlename').html() === staffname
}

// The table is Consults table
function isConsults()
{  
	return $('#titlename').html() === "Consults"
}

// This is on the split table and is Consults table
function isConsultsTbl(tableID)
{  
	var queuetbl = tableID === "queuetbl"

	return queuetbl && isConsults()
}

function returnFalse()
{
  return false
}

// waitnum is for ordering where there is no oproom, casenum
// nextWaitNum is undefined in case of new blank row
//Consults cases have negative waitnum
function calcWaitnum(thisOpdate, $prevrow, $nextrow)
{
  let prevWaitNum = Number($prevrow.prop("title")),
    nextWaitNum = Number($nextrow.prop("title")),

    $prevRowCell = $prevrow.children("td"),
    $nextRowCell = $nextrow.children("td"),
    prevOpdate = $prevRowCell.eq(OPDATE).html(),
    nextOpdate = $nextRowCell.eq(OPDATE).html(),
    tableID = $prevrow.closest("table").attr("id"),
    defaultWaitnum = (isConsultsTbl(tableID))? -1 : 1

	return (prevOpdate !== thisOpdate && thisOpdate !== nextOpdate)
			? defaultWaitnum
			: (prevOpdate === thisOpdate && thisOpdate !== nextOpdate)
			? prevWaitNum + defaultWaitnum
			: (prevOpdate !== thisOpdate && thisOpdate === nextOpdate)
			? nextWaitNum ? nextWaitNum / 2 : defaultWaitnum
			: nextWaitNum
			? ((prevWaitNum + nextWaitNum) / 2)
			: (prevWaitNum + defaultWaitnum)
}

function inPicArea(evt, pointing) {
  let $pointing = $(pointing),
    x = evt.pageX,
    y = evt.pageY,
    square = picArea(pointing),
    top = square.top,
    right = square.right,
    bottom = square.bottom,
    left = square.left,
    inX = (left < x) && (x < right),
    inY = (top < y) && (y < bottom)

  return inX && inY
}

function picArea(pointing) {
  let $pointing = $(pointing),
    right = $pointing.offset().left + $pointing.width(),
    bottom = $pointing.offset().top + $pointing.height(),
    left = right - 25,
    top = bottom - 25

  return {
    top: top,
    bottom: bottom,
    left: left,
    right: right
  }
}

function dataforEachCell(cells, data)
{
  data.forEach(function(item, i) {
    cells[i].innerHTML = item
  })
}

function rowDecoration(row, date)
{
  let  cells = row.cells

  row.className = dayName(NAMEOFDAYFULL, date) || "nodate"
  cells[OPDATE].innerHTML = putThdate(date)
  cells[OPDATE].className = dayName(NAMEOFDAYABBR, date)
  cells[DIAGNOSIS].style.backgroundImage = holiday(date)
}

function dayName(DAYNAME, date)
{
	return date === LARGESTDATE
		? ""
		: DAYNAME[(new Date(date)).getDay()]
}

let putNameAge = function (q) {
	return q.patient + (q.dob ? ("<br>อายุ " + putAgeOpdate(q.dob, q.opdate)) : "")
}

// hover on background pics
function hoverMain()
{
	let	paleClasses = ["pacs", "upload"],
		boldClasses = ["pacs2", "upload2"]

	$("td.pacs, td.upload").mousemove(function(event) {
		if (inPicArea(event, this)) {
			getClass(this, paleClasses, boldClasses)
		} else {
			getClass(this, boldClasses, paleClasses)
		}
	})
	.mouseout(function (event) {
		getClass(this, boldClasses, paleClasses)
	})
}

function getClass(thiscell, fromClass, toClass)
{
	let	classname = thiscell.className,
		classes = classname.split(" "),
		oldClass = checkMatch(classes, fromClass)

	if (oldClass) {
		let hasIndex = fromClass.indexOf(oldClass),
			newClass = toClass[hasIndex]
		thiscell.className = classname.replace(oldClass, newClass)
	}
}

function checkMatch(classes, oldClasses)
{
	for (let i=0; i<classes.length; i++) {
		for (let j=0; j<oldClasses.length; j++) {
			if (classes[i] === oldClasses[j]) {
				return classes[i]
			}
		}
	}
}

// Make dialog box dialogAlert containing error message
function Alert(title, message) {
	let $dialogAlert = $("#dialogAlert")

	$dialogAlert.css({
		"fontSize":" 14px",
		"textAlign" : "center"
	})
	$dialogAlert.html(message)
	$dialogAlert.dialog({
		title: title,
		closeOnEscape: true,
		modal: true,
		hide: 200,
		minWidth: 400,
		height: 230
	}).fadeIn();
}

function winWidth() {
	return window.innerWidth
}

function winHeight(container) {
	return window.innerHeight
}

// Shadow down when menu is below target row (high on screen)
// Shadow up when menu is higher than target row (low on screen)
let menustyle = function ($me, target) {
	let shadow = ($me.offset().top > $(target).offset().top)
					? '10px 20px 30px slategray'
					: '10px -20px 30px slategray'
	$me.css({
		boxShadow: shadow
	})
}

let UndoManager = (function () {

	let commands = [],
		index = -1,
		limit = 0,
		isExecuting = false,
		callback,
		
		// functions
		execute;

	execute = function(command, action) {
		if (!command || typeof command[action] !== "function") {
			return this;
		}
		isExecuting = true;

		command[action]();

		isExecuting = false;
		return this;
	};

	return {

		// Add a command to the queue.
		add: function (command) {
			if (isExecuting) {
				return this;
			}
			// if we are here after having called undo,
			// invalidate items higher on the stack
			commands.splice(index + 1, commands.length - index);

			commands.push(command);
			
			// if limit is set, remove items from the start
			if (limit && commands.length > limit) {
				removeFromTo(commands, 0, -(limit+1));
			}
			
			// set the current index to the end
			index = commands.length - 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Pass a function to be called on undo and redo actions.
		setCallback: function (callbackFunc) {
			callback = callbackFunc;
		},

		// Perform undo: call the undo function at the current index
		// and decrease the index by 1.
		undo: function () {
			let command = commands[index];
			if (!command) {
				return this;
			}
			execute(command, "undo");
			index -= 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Perform redo: call the redo function at the next index
		// and increase the index by 1.
		redo: function () {
			let command = commands[index + 1];
			if (!command) {
				return this;
			}
			execute(command, "redo");
			index += 1;
			if (callback) {
				callback();
			}
			return this;
		},

		// Clears the memory, losing all stored states. Reset the index.
		clear: function () {
			let prev_size = commands.length;

			commands = [];
			index = -1;

			if (callback && (prev_size > 0)) {
				callback();
			}
		},

		hasUndo: function () {
			return index !== -1;
		},

		hasRedo: function () {
			return index < (commands.length - 1);
		},

		getIndex: function() {
			return index;
		}
	};
})();

function holiday(date)
{
	// Buddhist holiday and compensation for religious day on weekend
	let Buddhist = HOLIDAY.find(day => day.holidate === date)
	if (Buddhist) {
		return `url('css/pic/holiday/${Buddhist.dayname}.png')`
	}

	let monthdate = date.substring(5),
		dayofweek = (new Date(date)).getDay(),
		Mon = dayofweek === 1,
		Tue = dayofweek === 2,
		Wed = dayofweek === 3,

	// Thai official holiday & Compensation
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

	return govHoliday && `url('css/pic/holiday/${govHoliday}.png')`
}

function exportQbookToExcel()
{
  //getting data from our table
  let data_type = 'data:application/vnd.ms-excel';  //Chrome, FF, not IE
  let title = 'Qbook Selected '
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #exceltbl tr.Sunday { background-color: #FFDDEE; }\
      #exceltbl tr.Monday { background-color: #FFFFE0; }\
      #exceltbl tr.Tuesday { background-color: #FFF0F9; }\
      #exceltbl tr.Wednesday { background-color: #EEFFEE; }\
      #exceltbl tr.Thursday { background-color: #FFF7EE; }\
      #exceltbl tr.Friday { background-color: #E7F7FF; }\
      #exceltbl tr.Saturday { background-color: #E7E7FF; }\
\
      #exceltbl td.Sun { background-color: #F099BB; }\
      #exceltbl td.Mon { background-color: #F0F0BB; }\
      #exceltbl td.Tue { background-color: #F0CCEE; }\
      #exceltbl td.Wed { background-color: #CCF0CC; }\
      #exceltbl td.Thu { background-color: #F0DDBB; }\
      #exceltbl td.Fri { background-color: #BBDDF0; }\
      #exceltbl td.Sat { background-color: #CCBBF0; }\
\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = title + Date.now() + '.xls'

  exportToExcel("capture", data_type, title, style, head, filename)    
}

function exportServiceToExcel()
{
  //getting data from our table
  let data_type = 'data:application/vnd.ms-excel';  //Chrome, FF, not IE
  let title = $('#dialogService').dialog( "option", "title" )
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
      #excelhead td.Readmission,\
      #exceltbl tr.Readmission,\
      #exceltbl td.Readmission { background-color: #AACCCC; }\
      #excelhead td.Reoperation,\
      #exceltbl tr.Reoperation,\
      #exceltbl td.Reoperation { background-color: #CCCCAA; }\
      #excelhead td.Infection,\
      #exceltbl tr.Infection,\
      #exceltbl td.Infection { background-color: #CCAAAA; }\
      #excelhead td.Morbidity,\
      #exceltbl tr.Morbidity,\
      #exceltbl td.Morbidity { background-color: #AAAACC; }\
      #excelhead td.Dead,\
      #exceltbl tr.Dead,\
      #exceltbl td.Dead { background-color: #AAAAAA; }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td>Admission : ' + $("#Admission").html() + '</td>\
        <td>Discharge : ' + $("#Discharge").html() + '</td>\
        <td>Operation : ' + $("#Operation").html() + '</td>\
        <td class="Morbidity">Morbidity : ' + $("#Morbidity").html() + '</td>\
      </tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td class="Readmission">Re-admission : ' + $("#Readmission").html() + '</td>\
        <td class="Infection">Infection SSI : ' + $("#Infection").html() + '</td>\
        <td class="Reoperation">Re-operation : ' + $("#Reoperation").html() + '</td>\
        <td class="Dead">Dead : ' + $("#Dead").html() + '</td>\
      </tr>\
      <tr></tr>\
      <tr></tr>\
      </table>'
  let month = $("#monthstart").val()
  month = month.substring(0, month.lastIndexOf("-"))  //use yyyy-mm for filename
  let filename = 'Service Neurosurgery ' + month + '.xls'

  exportToExcel("servicetbl", data_type, title, style, head, filename)    
}

function exportFindToExcel(search)
{
  // getting data from our table
  // data_type is for Chrome, FF
  // IE uses "txt/html", "replace" with blob
  let data_type = 'data:application/vnd.ms-excel'
  let title = $('#dialogFind').dialog( "option", "title" )
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td></td>\
        <td></td>\
        <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = 'Search ' + search + '.xls'

  exportToExcel("findtbl", data_type, title, style, head, filename)    
}

function exportReportToExcel(title)
{
  // getting data from our table
  // data_type is for Chrome, FF
  // IE uses "txt/html", "replace" with blob
  let data_type = 'data:application/vnd.ms-excel'
  let style = '\
    <style type="text/css">\
      #exceltbl {\
        border-right: solid 1px gray;\
        border-collapse: collapse;\
      }\
      #exceltbl tr:nth-child(odd) {\
        background-color: #E0FFE0;\
      }\
      #exceltbl th {\
        font-size: 16px;\
        font-weight: bold;\
        height: 40px;\
        background-color: #7799AA;\
        color: white;\
        border: solid 1px silver;\
      }\
      #exceltbl td {\
        font-size: 14px;\
        text-align: center;\
        vertical-align: middle;\
        padding-left: 3px;\
        border-left: solid 1px silver;\
        border-bottom: solid 1px silver;\
      }\
      #exceltbl td:first-child {\
        text-align: left;\
      }\
      #exceltbl tr.nonsurgical {\
        background-color: LightGrey;\
      }\
      #exceltbl tr#total {\
        background-color: BurlyWood;\
      }\
      #exceltbl tr#grand {\
        background-color: Turquoise;\
      }\
      #excelhead td {\
        height: 30px; \
        vertical-align: middle;\
        font-size: 22px;\
        text-align: center;\
      }\
    </style>'
  let head = '\
      <table id="excelhead">\
      <tr></tr>\
      <tr>\
        <td colspan="9" style="font-weight:bold;font-size:24px">' + title + '</td>\
      </tr>\
      <tr></tr>\
      </table>'
  let filename = 'Report ' + title + '.xls'

  exportToExcel("reviewtbl", data_type, title, style, head, filename)    
}

function exportToExcel(id, data_type, title, style, head, filename)
{
  if ($("#exceltbl").length) {
    $("#exceltbl").remove()
  }

  $("#" + id).clone(true).attr("id", "exceltbl").appendTo("body")

  // use only the last class because Excel does not accept multiple classes
  $.each( $("#exceltbl tr"), function() {
    let multiclass = this.className.split(" ")
    if (multiclass.length > 1) {
      this.className = multiclass[multiclass.length-1]
    }
  })

  // remove blank cells in Excel caused by hidden cells
  $.each( $("#exceltbl tr td, #exceltbl tr th"), function() {
    if ($(this).css("display") === "none") {
      $(this).remove()
    }
  })

  let $exceltbl = $("#exceltbl")

  // make line breaks show in single cell
  $exceltbl.find('br').attr('style', "mso-data-placement:same-cell");

  //remove img in equipment
  $exceltbl.find('img').remove();

  let table = $exceltbl[0].outerHTML
  let tableToExcel = '<!DOCTYPE html><HTML><HEAD><meta charset="utf-8"/>'
                    + style + '</HEAD><BODY>'
      tableToExcel += head + table
      tableToExcel += '</BODY></HTML>'

  let ua = window.navigator.userAgent;
  let msie = ua.indexOf("MSIE")
  let edge = ua.indexOf("Edge"); 

  if (msie > 0 || edge > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
  {
    if (typeof Blob !== "undefined") {
    //use blobs if we can
    tableToExcel = [tableToExcel];
    //convert to array
    let blob1 = new Blob(tableToExcel, {
      type: "text/html"
    });
    window.navigator.msSaveBlob(blob1, filename);
    } else {
    txtArea1.document.open("txt/html", "replace");
    txtArea1.document.write(tableToExcel);
    txtArea1.document.close();
    txtArea1.focus();
    sa = txtArea1.document.execCommand("SaveAs", true, filename);
    return (sa);  //not tested
    }
  } else {
    let a = document.createElement('a');
    document.body.appendChild(a);  // You need to add this line in FF
    a.href = data_type + ', ' + encodeURIComponent(tableToExcel);
    a.download = filename
    a.click();    //tested with Chrome and FF
  }
}
