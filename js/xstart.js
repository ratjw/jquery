
function start(userid)
{
	// "=" for isset in PHP
	Ajax(MYSQLIPHP, "start=", loading);

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
			$("#tblwrapper").show()
			fillupstart();
			fillConsults()
		}
		else if (/^\d{1,2}$/.test(gv.user)) {
			fillForRoom()
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

// gv.user is room number
function fillForRoom()
{
	var today = new Date().ISOdate(),
		book = gv.BOOK,
		sameDateRoom = sameDateRoomBookQN(book, today, gv.user),
		slen = sameDateRoom.length,
		i = 0,
		showCase = function() {
			fillEquipTable(book, $(), sameDateRoom[i])
		}

	if (slen) {
		showCase()
		$('#dialogEquip').dialog("option", "buttons", [
			{
				text: "Previous",
				width: "100",
				click: function () {
					if (i > 0) {
						i = i-1
						showCase()
					}
				}
			},
			{
				text: "Next",
				width: "100",
				click: function () {
					if (i < slen-1) {
						i = i+1
						showCase()
					}
				}
			}
		])
	} else {
		Alert("dialogEquip", "<br><br>No Case")
	}
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
