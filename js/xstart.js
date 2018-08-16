
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

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./service-worker.js')
	}

	gv.user = userid
	resetTimer()

	$("#wrapper").on("click", function (event) {
		resetTimer();
		event.stopPropagation()
		var target = event.target
		var $row = $(target).closest('tr')
		var qn = $row.children('td').eq(QN).html()
		if ((target.nodeName !== "TD") || (!qn)) {
			return false
		}
		fillEquipTable(gv.BOOK, $row, qn)
	})

	$(document).contextmenu( function (event) {
		event.preventDefault();
	})

	$(document).keydown(function(event) {
		event.preventDefault();
	})

	// to make table scrollable while dragging
	$("html, body").css( {
		height: "100%",
		overflow: "hidden",
		margin: "0px"
	})
}
		
function loading(response)
{
	if (/BOOK/.test(response)) {
		updateBOOK(response)
		if (/^\d{1,2}$/.test(gv.user)) {
			fillForRoom(new Date().ISOdate())
		}
		else /*if (/nurse/.test(gv.user))*/ {
			$("#wrapper").show()
			$("#tblhead").show()
			fillupstart();
			fillConsults()
		}
	} else {
		Alert("Server Error", "<br><br>Response from server has no data")
	}
}

function fillForRoom(opdate)
{
	var book = gv.BOOK,
		room = gv.user,
		sameDateRoom = sameDateRoomBookQN(book, opdate, room),
		slen = sameDateRoom.length,
		i = 0,
		showCase = function() {
			fillEquipTable(book, $(), sameDateRoom[i])
		},
		blank = {
			casenum: "",
			diagnosis: "",
			equipment: "",
			hn: "",
			opdate: opdate,
			oproom: room,
			optime: "",
			patient: "",
			staffname: "",
			treatment: ""
		}

	if (slen) {
		showCase()
	} else {
		fillEquipTable(book, $(), null, blank)
	}
	$('#dialogEquip').dialog("option", "buttons", [
		{
			text: "<< Previous Date",
			width: "140",
			class: "silver floatleft",
			click: function () {
				fillForRoom(opdate.nextdays(-1))
			}
		},
		{
			text: "< Previous Case",
			width: "140",
			class: "floatleft",
			click: function () {
				if (i > 0) {
					i = i-1
					showCase()
				}
			}
		},
		{
			text: "Next Case >",
			width: "120",
			click: function () {
				if (i < slen-1) {
					i = i+1
					showCase()
				}
			}
		},
		{
			text: "Next Date >>",
			width: "120",
			class: "silver",
			click: function () {
				fillForRoom(opdate.nextdays(+1))
			}
		},
		{
			text: "Print",
			width: "70",
			click: function () {
				printpaper()
			}
		}
	])
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)

	if (temp.BOOK) { gv.BOOK = temp.BOOK }
	if (temp.CONSULT) { gv.CONSULT = temp.CONSULT }
	if (temp.STAFF) { gv.STAFF = temp.STAFF }
	if (temp.ONCALL) { gv.ONCALL = temp.ONCALL }
	if (temp.HOLIDAY) { gv.HOLIDAY = temp.HOLIDAY }
	if (temp.QTIME) { gv.timestamp = temp.QTIME }
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

	// find staff to start
	while ((index < slen) && (staffoncall[index].staffname !== staffstart)) {
		index++
	}

	// find first date to start immediately after today
	while (dateoncall <= today) {
		dateoncall = dateoncall.nextdays(7)
		index++
	}

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

	nextrow = 1
	gv.ONCALL.forEach(function(oncall) {
		dateoncall = oncall.dateoncall
		if (dateoncall > today) {
			oncallRow = findOncallRow(rows, nextrow, tlen, dateoncall)
			if (oncallRow && !oncallRow.cells[QN].innerHTML) {
				oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(staffoncall[index].staffname)
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

function htmlwrap(staffname) {
	return '<p style="color:#999999;font-size:14px">Consult<br>' + staffname + '</p>'
}

function resetTimer()
{
	// gv.timer is just an id, not the clock
	// poke server every 1000 sec.
	clearTimeout(gv.timer)
	gv.timer = setTimeout( updating, 1000000)
	gv.idleCounter = 0
}

function updating()
{
	var sql = "sqlReturnData=SELECT MAX(editdatetime) as timestamp from bookhistory;"

	Ajax(MYSQLIPHP, sql, updatingback);

	function updatingback(response)
	{
		// gv.timestamp is this client last edit
		// timestamp is from server
		if (/timestamp/.test(response)) {
			var timeserver = JSON.parse(response),
				timestamp = timeserver[0].timestamp
			if (gv.timestamp < timestamp) {
				getUpdate()
			}
		}
		// idle not more than 1000 min.
		gv.idleCounter += 1
		if (gv.idleCounter > 59 && !gv.mobile) {
			history.back()
		}
	}
}

// There is some changes in database from other users
function getUpdate()
{
	Ajax(MYSQLIPHP, "nosqlReturnbook=''", callbackGetUpdate);

	function callbackGetUpdate(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			refillall()
		} else {
			Alert ("getUpdate", response)
		}
	}
}
