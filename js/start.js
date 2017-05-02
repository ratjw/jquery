function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook", loading);

	THISUSER = userid
	document.body.removeChild(document.getElementById("login"))
	document.getElementById("tblcontainer").style.display = "block"
	$("#dialogOplog").dialog()
	$("#dialogOplog").dialog('close')
	$("#dialogDeleted").dialog()
	$("#dialogDeleted").dialog('close')
	$("#dialogEquip").dialog()
	$("#dialogEquip").dialog('close')
	$("#dialogService").dialog()
	$("#dialogService").dialog('close')	//prevent updateTables() call 'isOpen' before initialization

	$(document).click( function (event) {
		countReset();
		event.stopPropagation()
		var target = event.target
		if ($('#menu').is(":visible")) {	//visible == take up space even can't be seen
			if (!$(target).closest('#menu').length) {
				$('#menu').hide();
				clearEditcellData("hide")
			}
		}
		if ($('#stafflist').is(":visible")) {
			if (!$(target).closest('#stafflist').length) {
				$('#stafflist').hide();
				clearEditcellData("hide")
			}
		}
		if ($('#delete').is(":visible")) {
			if(!$(target).closest('#delete').length) {
				$('#delete').hide();
			}
		}
		if ($('#undelete').is(":visible")) {
			if ($(target).index()) {
				$('#undelete').hide()
				return false
			}
		}

		if (target.id == "editcell") {
			return
		}
		
		if (target.nodeName == "TH") {
			clearEditcellData("hide")
			return	
		}

		if ($(target).closest('table').attr('id') == 'tbl' ||
			$(target).closest('table').attr('id') == 'queuetbl') {

			clicktable(target)
		}
		else if ($(target).closest('table').attr('id') == 'servicetbl') {
			clickservice(target)
		}
	})
	$('#menu li > div').click(function(e){	//click on parent of submenu
		if ($(this).siblings('ul').length > 0){
			e.preventDefault()
			e.stopPropagation()
		}
	});
	$(document).keydown( function (event) {
		countReset();
		if ($('#equip').is(':focus') ||
			$('#monthpicker').is(':focus')) {

			return false
		}
		if ($('#dialogService').is(':visible')) {
			Skeyin(event)
		} else {
			keyin(event)
		}
	})
	$(document).contextmenu( function (event) {
		return false
	})

	$("html, body").css( {
		height: "100%",		//to make table scrollable while dragging
		overflow: "hidden",
		margin: "0px"
	})
	sortable()
	//call sortable before render, if after, it renders very slowly
	TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
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
	TIMESTAMP = temp.QTIME? temp.QTIME : ""	//last update BOOK in server
	QWAIT = temp.QWAIT? temp.QWAIT : []
}

function fillStafflist()
{
	var stafflist = ''
	var staffmenu = ''
	for (var each = 0; each < STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each] + '</div></li>'
		staffmenu += '<li id="item1"><div>' + STAFF[each] + '</div></li>'
	}
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("item0").innerHTML = staffmenu
}

function updating()	//update or save data every 10 sec.
{
	var notEditing
	var editPoint = $("#editcell").data("pointing")
	if (editPoint) {
		notEditing = (editPoint.innerHTML == getData())? true : false
	} else {
		notEditing = true
	}
	if (notEditing) {

		Ajax(MYSQLIPHP, "functionName=checkupdate&time="+TIMESTAMP, updatingback);

		function updatingback(response)
		{
			//not being editing on screen
			clearEditcellData("hide")
			$('#menu').hide()	//editcell may be on first column
			$('#stafflist').hide()	//editcell may be on staff
			$('#datepicker').hide()
			$('#datepicker').datepicker("hide")
			if (response && response.indexOf("opdate") != -1)	//some changes in database
			{
				updateBOOK(response)
				updateTables()
			}
		}
	} else {

		//being editing on screen
		if ($(editcell).data("tableID") == "servicetbl") {
			savePreviousScell()		//Service table
		} else {
			savePreviouscell()		//Main and Staffqueue tables
		}
	}
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//idle, poke next 5 sec.
}

function updateTables()
{
	if ($("#dialogService").dialog('isOpen')) {
		var fromDate = $('#monthpicker').data('fromDate')
		var toDate = $('#monthpicker').data('toDate')
		var SERVICE = getfromBOOK(fromDate, toDate)
		refillService(SERVICE, fromDate, toDate)
	}
	refillall()
	if ($("#titlecontainer").css('display') == 'block') {
		refillstaffqueue()
	}
}

function findpresentRow(qn)
{
	$('#editcell').data("rowIndex")
}

function countReset()
{
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//active, poke after 10 sec.
}
