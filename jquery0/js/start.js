
function initialize(userid)
{
	// "=init" tells book.php to get staff oncall also
	Ajax(MYSQLIPHP, "nosqlReturnbook=init", loading);

	gv.user = userid
	resetTimer()

	$("#login").remove()
	$("#logo").remove()
	$("#tblwrapper").show()

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
		fillEquipTable(gv.BOOK, rowi, qn)
	})
	$("#wrapper").keydown(function(event) {
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
			fillupstart();
			fillConsults()
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data"
		if (/BOOK/.test(response)) {
			alert("Server Error", error + "<br><br>Use localStorage instead");
			updateBOOK(response)
			fillupstart();
			fillConsults()
		} else {
			alert("Server Error", error + "<br><br>No localStorage backup");
		}
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
	}

	resetTimer()
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
			alert ("getUpdate", response)
		}
	}
}
