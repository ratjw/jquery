
function Start(userid)
{
	var sql = "UPDATE staff,(SELECT MAX(dateoncall) AS max FROM staff) as oncall "
			+	"SET staffoncall=staffname,"
			+		"dateoncall=DATE_ADD(oncall.max,INTERVAL 1 WEEK) "
			+	"WHERE dateoncall<=CURDATE();"
			+	"SELECT * FROM staff ORDER BY number;"

	Ajax(MYSQLIPHP, "start=" + sql, loading);

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
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		if (/^\d{6}$/.test(gv.user)) {
			$("#login").remove()
			$("#logo").remove()
			$("#wrapper").show()
			$("#tblhead").show()
			fillupstart();
			fillConsults()
		}
		else if (/^\d{1,2}$/.test(gv.user)) {
			fillForRoom(new Date().ISOdate())
		}
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data"
		if (/BOOK/.test(response)) {
			Alert("Server Error", error + "<br><br>Use localStorage instead");
			updateBOOK(response)
			fillupstart();
			fillConsults()
		} else {
			Alert("Server Error", error + "<br><br>No localStorage backup");
		}
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
			width: "150",
			class: "silver floatleft",
			click: function () {
				fillForRoom(opdate.nextdays(-1))
			}
		},
		{
			text: "< Previous Case",
			width: "150",
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
			width: "150",
			click: function () {
				if (i < slen-1) {
					i = i+1
					showCase()
				}
			}
		},
		{
			text: "Next Date >>",
			width: "150",
			class: "silver",
			click: function () {
				fillForRoom(opdate.nextdays(+1))
			}
		}
	])
}

function updateBOOK(response)
{
	var temp = JSON.parse(response),
		book = temp.BOOK? temp.BOOK : [],
		consult = temp.CONSULT? temp.CONSULT : [],
		staff = temp.STAFF? temp.STAFF : [],
		timestamp = temp.QTIME
	gv.BOOK = book
	gv.CONSULT = consult
	if (staff.length) { gv.STAFF = staff }
	gv.timestamp = timestamp
	// datetime of last fetching from server: $mysqli->query ("SELECT now();")
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
		oncallRow = findOncallRow(rows, tlen, gv.STAFF[q].dateoncall)
		if (oncallRow && !oncallRow.cells[QN].innerHTML) {
			oncallRow.cells[STAFFNAME].innerHTML = htmlwrap(gv.STAFF[q].staffoncall)
		}
	}
}

function findOncallRow(rows, tlen, dateoncall) {
	
	var opdateth = dateoncall && dateoncall.thDate()

	for (var i = 1; i < tlen; i++) {
		if (rows[i].cells[OPDATE].innerHTML === opdateth) {
			return rows[i]
		}
	}
}

function htmlwrap(staffname) {
	return '<p style="color:#999999;font-size:14px">' + staffname + '</p>'
}

function showStaffOnCall(opdate) {
	var i = gv.STAFF.length

	while (i--) {
		if (gv.STAFF[i].dateoncall === opdate) {
			return htmlwrap(gv.STAFF[i].staffoncall)
		}
	}
}

function resetTimer()
{
	// gv.timer is just an id, not the clock
	// poke server every 10 sec.
	clearTimeout(gv.timer)
	gv.timer = setTimeout( updating, 10000)
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
		// idle not more than 10 min.
		gv.idleCounter += 1
		if (gv.idleCounter > 59) {
			window.location = window.location.href
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
