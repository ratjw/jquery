function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
	$("#tbl").css("display", "block")

	$(document).click( function (event) {
		countreset();
		var clickedCell = event.target

		if ($(clickedCell).closest("table").attr("id") == "tbl")
			clicktable(clickedCell)
		else if ($(clickedCell).closest("table").attr("id") == "queuetbl")
			Qclicktable(clickedCell)
		return false
	})
	$(document).keydown( function (event) {
		countreset();
		if (!$(".ui-dialog").length || ($(".ui-dialog").css("display") == "none"))
			editing(event)
		else if ($(".ui-dialog").css("display") == "block")
			editingQueue(event)
	})
	$(document).contextmenu( function (event) {
		countreset();
		return false
	})
	$(document).scroll( function (event) {
		countreset();
		scrollUpDown(event)
		return false
	})
	TIMER = setTimeout("updating()",10000)		//poke next 10 sec.
}

function loading(response)
{
	if (response && response.indexOf("[") != -1)
	{
		updateBOOK(response)
		fillupstart();
		fillStafflist()
	}
	else
		alert("Cannot load BOOK");
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)

	BOOK = temp.BOOK? temp.BOOK : []
	TIMESTAMP = temp.QTIME? temp.QTIME : ""	//last update time of BOOK in server
	QWAIT = temp.QWAIT? temp.QWAIT : []
	STAFF = temp.STAFF? temp.STAFF : []
}

function fillStafflist()
{
	var stafflist = ''
	for (var each=0; each<STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each].name + '</div></li>'
	}
	$("#stafflist").html(stafflist)
	$("#item40").append(stafflist)
}

function updating()
{
	if (document.getElementById("editmode") || document.getElementById("movemode"))
	{
		clearTimeout(TIMER);
		TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
		return;
	}
	//poke database if not editmode, not movemode and not adding new case

	Ajax(MYSQLIPHP, "functionName=checkupdate&time="+TIMESTAMP, updatingback);

	function updatingback(response)	//only changed database by checkupdate&time
	{
		if (response && response.indexOf("opdate") != -1)	//there is new entry after TIMESTAMP
		{
			updateBOOK(response);
			filluprefill()
		}
		clearTimeout(TIMER);
		TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
	}
}

function countreset()
{
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//poke after 10 sec.
}
