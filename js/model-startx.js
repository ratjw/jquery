function loadtable(userid)
{
	$("#login").remove()
	$("#tblcontainer").show()

	$("html, body").css( {
		height: "100%",
		overflow: "hidden",
		margin: "0"
	})
	$("#queuecontainer").show()
	$("#tblcontainer").css("width", "50%")
	$("#queuecontainer").css("width", "50%")
//	initResize("#tblcontainer")
//	$('.ui-resizable-e').css('height', $("#tbl").css("height"))
	$(".connected").sortable()

return

	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	$("#login").remove()
	$("#tblcontainer").show()

	$(document).click( function (event) {
		countReset();
		var clickedCell = event.target
		if(!$(clickedCell).closest('#menu').length) {
			if($('#menu').is(":visible")) {	//visible == take up space even can't be seen
				$('#menu').hide();
			}
		}
		if(!$(clickedCell).closest('#queuemenu').length) {
			if($('#queuemenu').is(":visible")) {
				$('#queuemenu').hide();
			}
		}
		if(!$(clickedCell).closest('#stafflist').length) {
			if($('#stafflist').is(":visible")) {
				$('#stafflist').hide();
			}
		}
		if(!$(clickedCell).closest('#editcell').length) {
			if($('#editcell').is(":visible")) {
				$('#editcell').hide();
			}
		}
		if ($(clickedCell).closest("table").attr("id") == "tbl")
			clicktable(clickedCell)
		else if ($(clickedCell).closest("table").attr("id") == "queuetbl")
			clicktable(clickedCell)
	})
	$(document).keydown( function (event) {
		countReset();
		if ($('#paperdiv').css('display') == 'block') {
			return
		}
		var tableID = $("#editcell").data('tableID')
		if (tableID == "tbl")
			editing(event)
		else if (tableID == "queuetbl")
			editing(event)
	})
	$(document).contextmenu( function (event) {
		countReset();
		return false
	})

	sortable()
	//let browser render fillupstart immediately
	//because sortable takes long time
	TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
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
	Ajax(MYSQLIPHP, "functionName=checkupdate&time="+TIMESTAMP, updatingback);

	function updatingback(response)	//only changed database by checkupdate&time
	{
		if (response && response.indexOf("opdate") != -1)
		{								//there is new entry after TIMESTAMP
			updateBOOK(response)
		}
		clearTimeout(TIMER);
		TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
		refillall()
		if ($("#titlecontainer").css('display') == 'block')
			refillstaffqueue()
	}
}

function countReset()
{
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//poke after 10 sec.
}
