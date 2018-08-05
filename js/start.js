
function Start(userid)
{
	var sql = "start="

	Ajax(MYSQLIPHP, sql, loading);

	$("#login").remove()
	$("#logo").remove()
	$("head script:contains('function')").remove()
	$("head style").remove()
	$("head").append($("body link"))
	$("#wrapper").show()

//	if (/*location.protocol === "https:" && */'serviceWorker' in navigator) {
//		navigator.serviceWorker.register('./service-worker.js')
//	}

	gv.user = userid
	resetTimer()
}
	
function loading(response)
{
	if (/BOOK/.test(response)) {
		startEditable()
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		fillupstart()
		setStafflist()
		fillConsults()
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data."
		if (/BOOK/.test(response)) {
			Alert("Server Error",
					error
					+ "<br><br>Use localStorage instead."
					+ "<br><br><h3>Read Only, not editable.</h3>");
			updateBOOK(response)
			fillupstart();
			setStafflist()
			fillConsults()
		} else {
			Alert("Server Error", error + "<br><br>No localStorage backup");
		}
	}
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)

	if (temp.BOOK) { gv.BOOK = temp.BOOK }
	if (temp.CONSULT) { gv.CONSULT = temp.CONSULT }
	if (temp.SERVICE) { gv.SERVICE = temp.SERVICE }
	if (temp.STAFF) { gv.STAFF = temp.STAFF }
	if (temp.ONCALL) { gv.ONCALL = temp.ONCALL }
	if (temp.HOLIDAY) { gv.HOLIDAY = temp.HOLIDAY }
	if (temp.QTIME) { gv.timestamp = temp.QTIME }
	// datetime of last fetching from server: $mysqli->query ("SELECT now();")
}

function startEditable()
{
	// call sortable before render, otherwise, it renders very slowly
	sortable()

	$(document).contextmenu( function (event) {
		var	target = event.target,
			oncall = /<p[^>]*>.*<\/p>/.test(target.outerHTML)

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

	// Prevent the backspace key from navigating back.
	$(document).off('keydown').on('keydown', function (event) {
		if (event.keydate === 8) {
			var doPrevent = true
			var types = ["text", "password", "file", "search", "email", "number",
						"date", "color", "datetime", "datetime-local", "month", "range",
						"search", "tel", "time", "url", "week"]
			var d = $(event.srcElement || event.target)
			var disabled = d.prop("readonly") || d.prop("disabled")
			if (!disabled) {
				if (d[0].isContentEditable) {
					doPrevent = false
				} else if (d.is("input")) {
					var type = d.attr("type")
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
	});

	var $editcell = $("#editcell")
	$editcell.on("keydown", function (event) {
		var keydate = event.which || window.event.keydate
		var pointing = $editcell.data("pointing")
		if ($('#dialogService').is(':visible')) {
			Skeyin(event, keydate, pointing)
		} else {
			keyin(event, keydate, pointing)
		}
		if (!$("#spin").length) {
			resetTimer()
			gv.idleCounter = 0
		}
	})

	// for resizing the editing cell
	$editcell.on("keyup", function (event) {
		var keydate = event.which || window.event.keydate

		$editcell.height($editcell[0].scrollHeight)
	})

	$editcell.on("click", function (event) {
		event.stopPropagation()
		return
	})

	// click on parent of submenu = no action
	// except click on #search => search()
	$('#menu li:not(#search) > div').on("click", function(event){
		if ($(this).siblings('ul').length > 0){
			event.preventDefault()
			event.stopPropagation()
		}
	});

	$("#wrapper").on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		$(".bordergroove").removeClass("bordergroove")
		var target = event.target,
			$menu = $('#menu'),
			$stafflist = $('#stafflist')
		if ($menu.is(":visible")) {
			if (!$(target).closest('#menu').length) {
				$menu.hide();
				clearEditcell()
			}
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
		if (target.nodeName === "TD") {
			clicktable(event, target)
		} else {
			clearEditcell()
			$menu.hide()
			$stafflist.hide()
			clearMouseoverTR()
		}

		event.stopPropagation()
	})

	// to make table scrollable while dragging
	$("html, body").css( {
		height: "100%",
		overflow: "hidden",
		margin: "0px"
	})
}

// stafflist: menu of Staff column
// staffmenu: submenu of Date column
// gv.STAFF[each].staffname: fixed order
function setStafflist()
{
	var	stafflist = '',
		staffmenu = ''

	for (var each = 0; each < gv.STAFF.length; each++)
	{
		stafflist += '<li><div>' + gv.STAFF[each].staffname + '</div></li>'
		staffmenu += '<li id="staffqueue"><div>' + gv.STAFF[each].staffname + '</div></li>'
	}
	staffmenu += '<li id="staffqueue"><div>Consults</div></li>'
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("staffmenu").innerHTML = staffmenu
}

// Only on main table
function fillConsults()
{
	var	table = document.getElementById("tbl"),
		rows = table.rows,
		tlen = rows.length,
		today = new Date().ISOdate(),
		lastopdate = rows[tlen-1].cells[OPDATE].innerHTML.numDate(),
		staffoncall = gv.STAFF.filter(function(staff) {
			return staff.oncall === "1"
		}),
		slen = staffoncall.length,
		nextrow = 1,
		index = 0,
		start = staffoncall.filter(function(staff) {
			return staff.startoncall
		}).reduce(function(a, b) {
			return a.startoncall > b.startoncall ? a : b
		}, 0),
		dateoncall = start.startoncall,
		staffstart = start.staffname,
		oncallRow = {}

	// find staff to start using latest startoncall date
	while ((index < slen) && (staffoncall[index].staffname !== staffstart)) {
		index++
	}

	// find first date to write immediately after today
	while (dateoncall <= today) {
		dateoncall = dateoncall.nextdays(7)
		index++
	}

	// write staffoncall if no patient
	index = index % slen
	while (dateoncall <= lastopdate) {
		oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
		if (oncallRow && !oncallRow.cells[QN].innerHTML) {
			oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(staffoncall[index].staffname)
		}
		nextrow = oncallRow.rowIndex + 1
		dateoncall = dateoncall.nextdays(7)
		index = (index + 1) % slen
	}

	// write substitute oncall
	nextrow = 1
	gv.ONCALL.forEach(function(oncall) {
		dateoncall = oncall.dateoncall
		if (dateoncall > today) {
			oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
			if (oncallRow && !oncallRow.cells[QN].innerHTML) {
				oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(oncall.staffname)
			}
			nextrow = oncallRow.rowIndex + 1
		}
	})
}

function findOncallRow(rows, nextrow, tlen, dateoncall)
{
	var opdateth = dateoncall && dateoncall.thDate()

	for (var i = nextrow; i < tlen; i++) {
		if (rows[i].cells[OPDATE].innerHTML === opdateth) {
			return rows[i]
		}
	}
}

function htmlwrap(staffname)
{
	return '<p style="color:#999999;font-size:12px">Consult<br>' + staffname + '</p>'
}

// refill after deleted or written over
function showStaffOnCall(opdate)
{
	if (new Date(opdate).getDay() === 6) {
		fillConsults()
	}
}

function exchangeOncall(pointing)
{
	var $stafflist = $("#stafflist"),
		$pointing = $(pointing)

	$stafflist.menu({
		select: function( event, ui ) {
			var	staffname = ui.item.text(),
				opdateth = $pointing.closest('tr').find("td")[OPDATE].innerHTML,
				opdate = getOpdate(opdateth)

			changeOncall(pointing, opdate, staffname)
			$stafflist.hide()
		}
	})

	// reposition from main menu to determine shadow
	reposition($stafflist, "left top", "left bottom", $pointing)
	menustyle($stafflist, $pointing)
	clearEditcell()
}

function changeOncall(pointing, opdate, staffname)
{
	var sql = "sqlReturnStaff=INSERT INTO oncall "
			+ "(dateoncall, staffname, edittime) "
			+ "VALUES ('" + opdate
			+ "','" + staffname
			+ "',NOW());"

	Ajax(MYSQLIPHP, sql, callbackchangeOncall);

	function callbackchangeOncall(response)
	{
		if (/ONCALL/.test(response)) {
			pointing.innerHTML = htmlwrap(staffname)
			gv.ONCALL = JSON.parse(response)
		} else {
			Alert("changeOncall", response)
		}
	}
}

function resetTimer()
{
	// gv.timer is just an id, not the clock
	// poke server every 10 sec.
	clearTimeout(gv.timer)
	gv.timer = setTimeout( updating, 10000)
}

function updating()
{
	// If there is some changes, reset idle time
	// If not, continue counting idle time
	// Both ways get update from server
	if (onChange()) {
		gv.idleCounter = 0
	} else {
		var sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

		Ajax(MYSQLIPHP, sql, updatingback);

		function updatingback(response)
		{
			// idling (5+1)*10 = 1 minute, clear editing setup
			// editcell may be on first column, on staff, during changeDate
			if (gv.idleCounter === 5) {
				clearEditcell()
				$('#menu').hide()
				$('#stafflist').hide()
				clearMouseoverTR()
			}
			// idling (59+1)*10 = 10 minutes, logout
			else if (gv.idleCounter > 59 && !gv.mobile) {
				history.back()
				gv.idleCounter = 0
				// may not successfully access the history
			}
			gv.idleCounter += 1

			// gv.timestamp is this client last edit
			// timestamp is from server
			if (/timestamp/.test(response)) {
				var timeserver = JSON.parse(response),
					timestamp = timeserver[0].timestamp
				if (gv.timestamp < timestamp) {
					getUpdate()
				}
			}
		}
	}

	resetTimer()
}

// There is some changes in database from other users
function getUpdate()
{
	var fromDate = $('#monthstart').val(),
		toDate = $('#monthpicker').val(),
		sql = "sqlReturnService=" + sqlOneMonth(fromDate, toDate)

	Ajax(MYSQLIPHP, sql, callbackGetUpdate);

	function callbackGetUpdate(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			if ($("#dialogService").hasClass('ui-dialog-content')
				&& $("#dialogService").dialog('isOpen')) {
				gv.SERVE = calcSERVE()
				refillService(fromDate, toDate)
			}
			refillall()
			if (isSplited()) {
				refillstaffqueue()
			}
		} else {
			Alert ("getUpdate", response)
		}
	}
}

function onChange()
{
	// savePreviousCell is for Main and Staffqueue tables
	// When editcell is not seen, there must be no change
	if ($("#editcell").is(":visible")) {
		var whereisEditcell = $($("#editcell").data("pointing")).closest("table").attr("id")
		if (whereisEditcell === "servicetbl") {
			return savePreviousCellService()
		} else {
			return savePreviousCell()
		}
	}
	return false
}

function addStaff()
{
	var	scbb = document.getElementById("scbb"),
		$dialogStaff = $("#dialogStaff"),
		$stafftbl = $("#stafftbl")

	for (var each=0; each<SPECIALTY.length; each++) {
		scbb.innerHTML += "<option value=" + SPECIALTY[each]+ ">"
						+ SPECIALTY[each] + "</option>"
	}

	clearval()
	$stafftbl.find('tr').slice(3).remove()

	$.each( gv.STAFF, function(i, item) {
		$('#staffcells tr').clone()
			.appendTo($stafftbl.find('tbody'))
				.filldataStaff(i, item)
	});

	$dialogStaff.dialog({
		title: "Subspecialty Staff",
		closeOnEscape: true,
		modal: true,
		show: 200,
		hide: 200,
		width: 600,
		height: 400
	})
}

jQuery.fn.extend({
	filldataStaff : function(i, q) {
		var	cells = this[0].cells,
			data = [
				"<a href=\"javascript:getval('" + i + "')\">"
				+ q.staffname + "</a>",
				q.specialty,
				q.startoncall
			]

		dataforEachCell(cells, data)
	}
})

function getval(each)
{	
	document.getElementById("sname").value = gv.STAFF[each].staffname;
	document.getElementById("scbb").value = gv.STAFF[each].specialty;
	document.getElementById("sdate").value = gv.STAFF[each].startoncall; 
	document.getElementById("shidden").value = gv.STAFF[each].number;
}

function clearval()
{	
	document.getElementById("sname").value = ""
	document.getElementById("scbb").value = ""
	document.getElementById("sdate").value = ""
	document.getElementById("shidden").value = ""
}

function doadddata()
{
	var	vname = document.getElementById("sname").value,
		vspecialty = document.getElementById("scbb").value,
		vdate = document.getElementById("sdate").value,
		vnum = Math.max.apply(Math, gv.STAFF.map(function(staff) { return staff.number })) + 1,
		sql = "sqlReturnStaff="
			+ "INSERT INTO staff (number,staffname,specialty) VALUES("
			+ vnum + ",'"+ vname  +"','"+ vspecialty
			+ "');"

	Ajax(MYSQLIPHP, sql, callbackdodata);
}

function doupdatedata()
{
	if (confirm("ต้องการแก้ไขข้อมูลนี้หรือไม่")) {
		var	vname = document.getElementById("sname").value,
			vspecialty = document.getElementById("scbb").value,
			vdate = document.getElementById("sdate").value, 
			vshidden = document.getElementById("shidden").value,
			sql = "sqlReturnStaff=UPDATE staff SET "
				+ ", staffname='" + vname
				+ "', specialty='" + vspecialty
				+ "' WHERE number=" + vshidden
				+ ";"

		Ajax(MYSQLIPHP, sql, callbackdodata);
	}
} // end of function doupdatedata

function dodeletedata()
{
	if (confirm("ต้องการลบข้อมูลนี้หรือไม่")) {
		var	vshidden = document.getElementById("shidden").value,
			sql = "sqlReturnStaff=DELETE FROM staff WHERE number=" + vshidden + ";"

		Ajax(MYSQLIPHP, sql, callbackdodata);
	}
}

function callbackdodata(response)
{
	if (/STAFF/.test(response)) {
		showAddStaff(response)
	} else {
		alert(response)
	}
}

function showAddStaff(response)
{
	gv.STAFF = JSON.parse(response).STAFF
	setStafflist()
	fillConsults()
	addStaff()
}
