function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
	var table = document.getElementById("tbl")
	table.style.display = ""
	table.onmousedown = function() { MOUSEDOWNCELL = whichElement(event); clicktable() }
	table.onmouseup = function() { MOUSEUPCELL = whichElement(event) }
	table.onclick = function() { MOUSECLICKCELL = whichElement(event) }
	document.oncontextmenu = function() { window.focus; return false }
	document.onkeyup = function(e) { editing(e) }	//for Esc key to cancel any popup
	swipefinger();
	initMouseWheel();
	TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
	document.onclick = countreset;
	document.onkeydown = countreset;
	document.onscroll = countreset;
}

function loading(response)
{
	if (response && response.indexOf("[") != -1)
	{
		updateQBOOK(response);	//eval response into QBOOK and ALLLISTS
		fillupstart();
	}
	else
		alert("Cannot load QBOOK");
}

function updateQBOOK(response)
{
	var temp = JSON.parse(response)

	QBOOK = temp.QBOOK? temp.QBOOK : []
	TIMESTAMP = temp.QTIME? temp.QTIME : ""	//last update time of QBOOK in server
	QWAIT = temp.QWAIT? temp.QWAIT : []
	ALLLISTS = temp.STAFF? temp.STAFF : []
}

function updateQBOOKFILL()
{
	var q, k

	if (STATE[0] == "FILLUP")
	{
		QBOOKFILL = QBOOK
	}
	else if (STATE[0] == "FILLDAY")
	{
		QBOOKFILL = []
		for (q=0; q < QBOOK.length; q++)
		{
			k = QBOOK[q].opdate.mysqltojsdate().getDay()
			if (k == STATE[1] || k == 0)
				QBOOKFILL.push(QBOOK[q])
		}
	}
	else if (STATE[0] == "FILLSTAFF")
	{
		QBOOKFILL = []
		for (q=0; q < QBOOK.length; q++)
			if (QBOOK[q].staffname == STATE[1])
				QBOOKFILL.push(QBOOK[q])
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

	function updatingback(response)	//only changed by concurrent another user
	{
		if (response && response.indexOf("opdate") != -1)	//there is new entry after TIMESTAMP
		{
			updateQBOOK(response);
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

	//QBOOKFILL will be updated in each fill
	if (document.getElementById("findrow"))
		foundqn = document.getElementById("findrow").cells[QN].innerHTML
	if (STATE[0] == "FILLUP")
		filluprefill();		//display the same weeks
	else if (STATE[0] == "FILLDAY")
		fillday();		//display the same opday
	else if (STATE[0] == "FILLSTAFF")
		fillstaff();		//display the same staff
	if (foundqn)
		hiliteupdatefill(foundqn)
}
