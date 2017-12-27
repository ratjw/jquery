
function initialize(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook=init", loading);

	gv.user = userid
	resetTimer()

	$("#login").remove()
	$("#logo").remove()
	$("#tblwrapper").show()

	sortable()
	//call sortable before render, otherwise, it renders very slowly

	//Prevent error message : call 'isOpen' before initialization
	$("#dialogAlert").dialog()
	$("#dialogAlert").dialog('close')
	$("#dialogDeleted").dialog()
	$("#dialogDeleted").dialog('close')
	$("#dialogEquip").dialog()
	$("#dialogEquip").dialog('close')
	$("#dialogFind").dialog()
	$("#dialogFind").dialog('close')
	$("#dialogService").dialog()
	$("#dialogService").dialog('close')
	$("#dialogHistory").dialog()
	$("#dialogHistory").dialog('close')

	$(document).contextmenu( function (event) {
		event.preventDefault();
	})

	// Prevent the backspace key from navigating back.
	$(document).off('keydown').on('keydown', function (event) {
		if (event.keyCode === 8) {
			var doPrevent = true;
			var types = ["text", "password", "file", "search", "email", "number",
						"date", "color", "datetime", "datetime-local", "month", "range",
						"search", "tel", "time", "url", "week"];
			var d = $(event.srcElement || event.target);
			var disabled = d.prop("readonly") || d.prop("disabled");
			if (!disabled) {
				if (d[0].isContentEditable) {
					doPrevent = false;
				} else if (d.is("input")) {
					var type = d.attr("type");
					if (type) {
						type = type.toLowerCase();
					}
					if (types.indexOf(type) > -1) {
						doPrevent = false;
					}
				} else if (d.is("textarea")) {
					doPrevent = false;
				}
			}
			if (doPrevent) {
				event.preventDefault();
				return false;
			}
		}
	});

	if (userid === "000000") {
		$("#wrapper").on("click", function (event) {
			event.stopPropagation()
			var target = event.target
			var rowi = $(target).closest('tr')
			var qn = rowi.children('td').eq(QN).html()
			if ((target.nodeName !== "TD") || (!qn)) {
				event.preventDefault()
				event.stopPropagation()
				return false
			}
			fillEquipTable(gv.BOOK, rowi[0], qn)
			showNonEditableForScrub()
		})
		$("#wrapper").keydown(function(event) {
			event.preventDefault();
		})
		return
	}

	$("#editcell").on("click", function (event) {
		event.stopPropagation()
	})

	$("#wrapper").on("click", function (event) {
		resetTimer();
		gv.idleCounter = 0
		$(".bordergroove").removeClass("bordergroove")
		var target = event.target
		if ($('#menu').is(":visible")) {
			if (!$(target).closest('#menu').length) {
				$('#menu').hide();
				clearEditcell()
			}
		}
		if ($('#stafflist').is(":visible")) {
			if (!$(target).closest('#stafflist').length) {
				$('#stafflist').hide();
				clearEditcell()
			}
		}
		if (target.nodeName === "P") {
			target = $(target).closest('td')[0]
		}
		if (target.nodeName === "TD") {
			clicktable(target)
		} else {
			clearEditcell()
		}

		event.stopPropagation()
	})

	//click on parent of submenu
	$('#menu li > div').on("click", function(event){
		if ($(this).siblings('ul').length > 0){
			event.preventDefault()
			event.stopPropagation()
		}
	});

	$("#editcell").on("keydown", function (event) {
		resetTimer();
		gv.idleCounter = 0
		var keycode = event.which || window.event.keyCode
		var pointing = $("#editcell").data("pointing")
		if ($('#dialogService').is(':visible')) {
			Skeyin(event, keycode, pointing)
		} else {
			keyin(event, keycode, pointing)
		}
	})

	//for resizing the editing cell
	$("#editcell").on("keyup", function (event) {
		var $editcell = $("#editcell")
		var pointing = $editcell.data("pointing")
		if (pointing.cellIndex < 2) {
			return		//not render in opdate & roomtime cells
		}
		var keycode = event.which || window.event.keyCode
		if (keycode < 32)	{
			return		//not render after non-char was pressed
		}
		pointing.innerHTML = $editcell.html()
		$editcell.css({
			height: $(pointing).height() + "px",
		})
		reposition($editcell, "center", "center", pointing)
	})

	$("html, body").css( {
		height: "100%",		//to make table scrollable while dragging
		overflow: "hidden",
		margin: "0px"
	})
}
		
function loading(response)
{
	if (/BOOK/.test(response)) {
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		getSTAFF()
		if (gv.user === "000000") {
			fillForScrub()
		} else {
			fillupstart();
			setStafflist()
			fillConsults()
		}
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data"
		if (/BOOK/.test(response)) {
			alert("Server Error", error + "<br><br>Use localStorage instead");
			updateBOOK(response)
			getSTAFF()
			fillupstart();
			setStafflist()
			fillConsults()
		} else {
			alert("Server Error", error + "<br><br>No localStorage backup");
		}
	}
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)
	var book = temp.BOOK? temp.BOOK : []
	var consult = temp.CONSULT? temp.CONSULT : []
	var timestamp = temp.QTIME
	gv.BOOK = book
	gv.CONSULT = consult
	gv.timestamp = timestamp
	//datetime of last fetching from server: $mysqli->query ("SELECT now();")
}

// gv.STAFF[q].opdate = the oncall date
// gv.STAFF[q].staffname = staffname oncall on this date
// gv.STAFF[q].hn = staff sequence order
// gv.STAFF[q].patient = staffname in sequence order
// gv.STAFF[q].diagnosis = staffname png
function getSTAFF()
{
	var i = gv.CONSULT.length
	while (i--) {
		if (gv.CONSULT[i].waitnum === "0") {
			gv.STAFF[gv.CONSULT[i].hn] = gv.CONSULT[i]
			gv.CONSULT.splice(i, 1)
		}
	}
}

function setStafflist()
{
	var stafflist = ''
	var staffmenu = ''

	for (var each = 0; each < gv.STAFF.length; each++)
	{
		stafflist += '<li><div>' + gv.STAFF[each].patient + '</div></li>'
		staffmenu += '<li id="staffqueue"><div>' + gv.STAFF[each].patient + '</div></li>'
	}
	staffmenu += '<li id="staffqueue"><div>Consults</div></li>'
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("staffmenu").innerHTML = staffmenu
}

// Only on main table
function fillConsults()
{
	var table = document.getElementById("tbl")
	var rows = table.rows
	var tlen = rows.length
	var slen = gv.STAFF.length
	var oncallRow = {}

	for (var q = 0; q < slen; q++) {
		oncallRow = findOncallRow(rows, tlen, gv.STAFF[q].opdate)
		if (!oncallRow.cells[QN].innerHTML) {
			oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(gv.STAFF[q].staffname)
		}
		nowRow = oncallRow.rowIndex
	}
}

function findOncallRow(rows, tlen, opdate) {
	var opdateth = opdate.thDate()

	for (var i = 1; i < tlen; i++) {
		if (rows[i].cells[OPDATE].innerHTML === opdateth) {
			return rows[i]
		}
	}
}

function htmlwrap(staffname) {
	return '<p style="color:#B0B0B0;font-size:14px">' + staffname + '</p>'
}

function showStaffImage(opdate) {
	var i = gv.STAFF.length

	while (i--) {
		if (gv.STAFF[i].opdate === opdate) {
			return htmlwrap(gv.STAFF[i].staffname)
		}
	}
}

function resetTimer()
{
	clearTimeout(gv.timer); //gv.timer is just an id, not the clock
	gv.timer = setTimeout( updating, 10000)	//poke server every 10 sec.
}

function updating()
{
	if (onChange()) {	//making some change
		gv.idleCounter = 0
	} else {
		//idling
		Ajax(MYSQLIPHP, "functionName=checkupdate&time=" + gv.timestamp, updatingback);

		function updatingback(response)
		{
			//not being editing on screen
			if (gv.idleCounter === 5) {
				//idling 1 minute, clear editing setup
				//do this only once, not every 1 minute
				clearEditcell()
				$('#menu').hide()		//editcell may be on first column
				$('#stafflist').hide()	//editcell may be on staff
				clearMouseoverTR()
			}
			else if (gv.idleCounter > 59) {	//idling 10 minutes, logout
				window.location = window.location.href
			}
			gv.idleCounter += 1

			//some changes in database from other users
			if (/BOOK/.test(response)) {
				updateBOOK(response)
				if ($("#dialogService").dialog('isOpen')) {
					var fromDate = $('#monthpicking').val()
					var toDate = $('#monthpicker').val()
					var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
					refillService(SERVICE, fromDate, toDate)
				}
				refillall()
				if ($("#queuewrapper").css('display') === 'block') {
					refillstaffqueue()
				}
			}
		}
	}

	resetTimer()
}

function onChange()
{
	if ($("#editcell").is(":visible")) {
		var whereisEditcell = $($("#editcell").data("pointing")).closest("table").attr("id")
		if (whereisEditcell === "servicetbl") {
			return savePreviousCellService()	//Service table
		} else {
			return savePreviousCell()			//Main and Staffqueue tables
		}
	}
	return false
}
