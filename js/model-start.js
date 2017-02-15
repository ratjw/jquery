function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
	$("#tbl").css("display", "block")
	$("#tbl").keydown( function (event) {
		countreset();
		if ($("#queuetbl").css("display") == "none")
			editing(event)
	})
	$("#queuetbl").parent().keydown( function (event) {
		countreset();
		if ($("#queuetbl").css("display") == "block")
			editingQueue(event)
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
	$("#queuetbl").parent().click( function (event) {
		countreset();
		Qclicktable(event)
		event.stopPropagation()
		event.preventDefault()
		return false
	})
	document.onscroll = scrollUpDown
	swipefinger();
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

function updateBOOKFILL()
{
	var q, k

	if (STATE[0] == "FILLUP")
	{
		BOOKFILL = BOOK
	}
	else if (STATE[0] == "FILLDAY")
	{
		BOOKFILL = []
		for (q=0; q < BOOK.length; q++)
		{
			k = (new Date(BOOK[q].opdate)).getDay()
			if (k == STATE[1] || k == 0)
				BOOKFILL.push(BOOK[q])
		}
	}
	else if (STATE[0] == "FILLSTAFF")
	{
		BOOKFILL = []
		for (q=0; q < BOOK.length; q++)
			if (BOOK[q].staffname == STATE[1])
				BOOKFILL.push(BOOK[q])
	}
}

function updateQWAITFILL(staffname)
{	//get temp QWAIT of only one staff
	QWAITFILL = []
	if (staffname)
	{
		for (q=0; q < QWAIT.length; q++)
		{
			if (QWAIT[q].staffname == staffname)
				QWAITFILL.push(QWAIT[q])
		}
	}
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
			refillall()
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

function refillall()
{	//called from : updatingback, callbackmove
	var foundqn

	//BOOKFILL will be updated in each fill
	if (STATE[0] == "FILLUP")
		filluprefill();		//display the same weeks
	else if (STATE[0] == "FILLDAY")
		fillday();		//display the same opday
	else if (STATE[0] == "FILLSTAFF")
		fillstaff();		//display the same staff
	if (foundqn)
		hiliteupdatefill(foundqn)
}
