function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
//	$("html, body").css( {
//		height: "100%",
//		overflow: "hidden",
//		margin: "0"
//	})
//	$("#wrapper").append($("#tblcontainer"))
	$("#tblcontainer").show()

	$(document).click( function (event) {
		countReset();
		var clickedCell = event.target

		if ($(clickedCell).closest("table").attr("id") == "tbl")
			clicktable(clickedCell)
		else if ($(clickedCell).closest("table").attr("id") == "queuetbl")
			Qclicktable(clickedCell)
		return false
	})
	$(document).keydown( function (event) {
		countReset();
		var table = $("#editcell").data("located").closest("table").attr("id")
		if (table == "tbl")
			editing(event)
		else if (table == "queuetbl")
			editingqueue(event)
	})
	$(document).contextmenu( function (event) {
		countReset();
		return false
	})
//	$("#tblcontainer").scroll( function (event) {
//		countReset();
//		if(typeof timeout == "number") {
//			window.clearTimeout(timeout);
//			delete timeout;
//		}
//		timeout = window.setTimeout( scrollUpDown, 50);
//	})
//	$(document).scroll( function (event) {
//		countReset();
//		if(typeof timeout == "number") {
//			window.clearTimeout(timeout);
//			delete timeout;
//		}
//		timeout = window.setTimeout( scrollUpDown, 150);
//	})
	TIMER = setTimeout("updating()",10000)		//poke next 10 sec.
}

function loading(response)
{
	if (response && response.indexOf("[") != -1)
	{
		updateBOOK(response)
		fillupstart();
		dataStafflist()
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

function dataStafflist()
{
	var stafflist = ''
	var staffmenu = ''
	for (var each=0; each<STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each].name + '</div></li>'
		staffmenu += '<li><div id="item1">' + STAFF[each].name + '</div></li>'
	}
	$("#stafflist").html(stafflist)
	$("#item0").html(staffmenu)
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

function countReset()
{
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//poke after 10 sec.
}

function editcell(pointing)
{
	var pos = $(pointing).position()

	$("#editcell").html($(pointing).html())
	$("#editcell").data("located", $(pointing))
	$("#editcell").css({
		top: pos.top + "px",
		left: pos.left + "px",
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize"),
		display: "block"
	})
	$("#editcell").focus()
}

function initResize(id)
{
	$(id).resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			var divTwoWidth = (remainSpace-margin)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: (remainSpace-margin)/parent.width()*100+"%",
			});
		}
	});
}
