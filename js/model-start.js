function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
	$("#tbl").css("display", "block")

	$("#editcell").keydown( function (event) {
		countreset();
		if ($("#queuetbl").css("display") == "none")
			editing(event)
		else if ($("#queuetbl").css("display") == "block")
			editingQueue(event)
	})
	$("#editcell").click( function (event) {
		editing(event)
		return false
	})
	$("#tbl").click( function (event) {
		countreset();
		clicktable(event)
		return false
	})
	$("#tbl").contextmenu( function (event) {
		countreset();
		clicktable(event)
		return false
	})
	$("#queuetbl").click( function (event) {
		countreset();
		Qclicktable(event)
		return false
	})
	document.onscroll = scrollUpDown
	TIMER = setTimeout("updating()",10000)		//poke next 10 sec.
}

function loading(response)
{
	if (response && response.indexOf("[") != -1)
	{
		updateBOOK(response);	//eval response into BOOK and ALLLISTS
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
	ALLLISTS = temp.STAFF? temp.STAFF : []
}

function fillStafflist()
{
	var stafflist = ''
	for (var each=0; each<ALLLISTS.staff.length; each++)
	{
		stafflist += '<li><div id="' + ALLLISTS.staff[each][1] + '">'
		stafflist += ALLLISTS.staff[each][1] + '</div></li>'
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
