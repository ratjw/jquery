
function Start()
{
//	if ('serviceWorker' in navigator) {
//		navigator.serviceWorker.register('service-worker.js')
//	}

	Ajax(MYSQLIPHP, "start=start", loading);

	$("#tblcontainer").show()
	resetTimer()

	$("#tblcontainer").on("click", function (event) {
		resetTimer();
		event.stopPropagation()
		var target = event.target
		if (target.nodeName !== "TD") { return }
		var $row = $(target).closest('tr')
		var	$cell = $row.children('td')
		var opdate = $cell.eq(OPDATE).html().numDate()
		var room = $cell.eq(OPROOM).html()
		var qn = $cell.eq(QN).html()

		if (target.nodeName === "TD") {
			fillForRoom(opdate, room, qn)
		}
	})

	$(document).contextmenu( function (event) {
		event.preventDefault();
	})

	$(document).keydown(function(event) {
		event.preventDefault();
	})

	function loading(response) {
		if (typeof response === "object") {
			updateBOOK(response)
//		if (/^\d{1,2}$/.test(gv.user)) {
//			fillForRoom(new Date().ISOdate(), room)
//		} else {
			fillupstart();
			fillConsults()
		}
	}
}

function fillForRoom(opdate, room, qn)
{
	var	book = gv.BOOK
	var	sameRoomQN = sameDateRoomBookQN(book, opdate, room)
	var	slen = sameRoomQN.length
	var	row = {}
	var q = 0
	var	blank = {
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
	var	showCase = function() {
			if (qn) {
				q = sameRoomQN.indexOf(qn)
			} else {
				qn = sameRoomQN[q]
			}
			if (qn) {
				row = getTableRowByQN("tbl", qn)
			} else {
				row = getTableRowsByDate(opdate.thDate())[0]
			}
			fillEquipTable(book, $(row), sameRoomQN[q], blank)
			showButtons()
			showFind($("#tblcontainer"), row)
		}

	function showButtons() {
		$('#dialogEquip').dialog("option", "buttons", [
			{
				text: "<< Previous Date",
				width: "140",
				class: "silver floatleft",
				click: function () {
					fillForRoom(opdate.nextdays(-1), room)
				}
			},
			{
				text: "< Previous Case",
				width: "140",
				class: "floatleft",
				click: function () {
					if (q > 0) {
						q = q - 1
						qn = 0
						showCase()
					}
				}
			},
			{
				text: "Next Case >",
				width: "120",
				click: function () {
					if (q < slen-1) {
						q = q + 1
						qn = 0
						showCase()
					}
				}
			},
			{
				text: "Next Date >>",
				width: "120",
				class: "silver",
				click: function () {
					fillForRoom(opdate.nextdays(+1), room)
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

	showCase()
}

function updateBOOK(result)
{
	if (result.BOOK) { gv.BOOK = result.BOOK }
	if (result.CONSULT) { gv.CONSULT = result.CONSULT }
	if (result.STAFF) { gv.STAFF = result.STAFF }
	if (result.ONCALL) { gv.ONCALL = result.ONCALL }
	if (result.HOLIDAY) { gv.HOLIDAY = result.HOLIDAY }
	if (result.QTIME) { gv.timestamp = result.QTIME }
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
		// timestamp is from server bookhistory last editdatetime
		if (typeof response === "object") {
			if (gv.timestamp < response[0].timestamp) {
				getUpdate()
			}
		}
		// idle not more than 1000 min.
		gv.idleCounter += 1
		if (gv.idleCounter > 6000 && !gv.isMobile) {
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
		if (typeof response === "object") {
			updateBOOK(response)
		} else {
			Alert ("getUpdate", response)
		}
	}
}
