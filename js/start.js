
function initialize(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook=''", loading);

	globalvar.user = userid
	resetTimer()

	$("#login").remove()
	$("#logo").remove()
	$("#tblwrapper").show()

	sortable()
	//call sortable before render, otherwise, it renders very slowly

	//Prevent error message : call 'isOpen' before initialization
	$("#dialogAlert").dialog()
	$("#dialogAlert").dialog('close')
	$("#dialogDeleted").dialog()
	$("#dialogDeleted").dialog('close')
	$("#dialogEquip").dialog()
	$("#dialogEquip").dialog('close')
	$("#dialogFind").dialog()
	$("#dialogFind").dialog('close')
	$("#dialogService").dialog()
	$("#dialogService").dialog('close')
	$("#dialogDataHistory").dialog()
	$("#dialogDataHistory").dialog('close')

	if (userid === "000000") {
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
			fillEquipTable(globalvar.BOOK, rowi[0], qn)
			showNonEditableForScrub()
		})
		$("#wrapper").keydown(function(e) {
			e.preventDefault();
		})
		return
	}

	$("#editcell").on("click", function (event) {
		event.stopPropagation()
	})

	$("#wrapper").on("click", function (event) {
		resetTimer();
		globalvar.idleCounter = 0
		$(".bordergroove").removeClass("bordergroove")
		event.stopPropagation()
		var target = event.target
		if ($('#menu').is(":visible")) {
			if (!$(target).closest('#menu').length) {
				$('#menu').hide();
				clearEditcell()
			}
		}
		if ($('#stafflist').is(":visible")) {
			if (!$(target).closest('#stafflist').length) {
				$('#stafflist').hide();
				clearEditcell()
			}
		}
		if ($('#undelete').is(":visible")) {
			if ($(target).index()) {
				$('#undelete').hide()
				return false
			}
		}
		if (target.nodeName !== "TD") {
			clearEditcell()
			return	
		}

		clicktable(target)
	})

	$('#menu li > div').on("click", function(event){
		if ($(this).siblings('ul').length > 0){	//click on parent of submenu
			event.preventDefault()
			event.stopPropagation()
		}
	});

	$("#editcell").keydown( function (event) {
		resetTimer();
		globalvar.idleCounter = 0
		var keycode = event.which || window.event.keyCode
		var pointing = $("#editcell").data("pointing")
		if ($('#dialogService').is(':visible')) {
			Skeyin(event, keycode, pointing)
		} else {
			keyin(event, keycode, pointing)
		}
	})

	$("#editcell").keyup( function (event) {	//for resizing the editing cell
		var $editcell = $("#editcell")
		var pointing = $editcell.data("pointing")
		if (pointing.cellIndex < 2) {
			return		//not render in opdate & roomtime cells
		}
		var keycode = event.which || window.event.keyCode
		if (keycode < 32)	{
			return		//not render after non-char was pressed
		}
		pointing.innerHTML = $editcell.html()
		$editcell.css({
			height: $(pointing).height() + "px",
		})
		reposition($editcell, "center", "center", pointing)
	})

	$(document).contextmenu( function (event) {
		return false
	})

	$("html, body").css( {
		height: "100%",		//to make table scrollable while dragging
		overflow: "hidden",
		margin: "0px"
	})
}
		
function loading(response)
{
	if (/BOOK/.test(response)) {
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		if (globalvar.user === "000000") {
			fillForScrub()
		} else {
			fillupstart();
			setStafflist()
		}
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data"
		if (/BOOK/.test(response)) {
			alert("Server Error", error + "<br><br>Use localStorage instead");
			updateBOOK(response)
			fillupstart();
			setStafflist()
		} else {
			alert("Server Error", error + "<br><br>No localStorage backup");
		}
	}
}

function setStafflist()
{
	var stafflist = ''
	var staffmenu = ''
	for (var each = 0; each < STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each] + '</div></li>'
		staffmenu += '<li id="staffqueue"><div>' + STAFF[each] + '</div></li>'
	}
	staffmenu += '<li id="staffqueue"><div>Consults</div></li>'
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("staffmenu").innerHTML = staffmenu
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)
	var book = temp.BOOK? temp.BOOK : []
	var consult = temp.CONSULT? temp.CONSULT : []
	var timestamp = temp.QTIME
	globalvar.BOOK = book
	globalvar.CONSULT = consult
	globalvar.timestamp = timestamp
	//datetime of last fetching from server: $mysqli->query ("SELECT now();")
}

function resetTimer()
{
	clearTimeout(globalvar.timer); //globalvar.timer is just an id, not the clock
	globalvar.timer = setTimeout( updating, 10000)	//poke server every 10 sec.
}

function updating()
{
	if (onChange()) {	//making some change
		globalvar.idleCounter = 0
	} else {
		//idling
		Ajax(MYSQLIPHP, "functionName=checkupdate&time=" + globalvar.timestamp, updatingback);

		function updatingback(response)
		{
			//not being editing on screen
			if (globalvar.idleCounter === 5) {
				//idling 1 minute, clear editing setup
				//do this only once, not every 1 minute
				clearEditcell()
				$('#menu').hide()		//editcell may be on first column
				$('#stafflist').hide()	//editcell may be on staff
				clearMouseoverTR()
			}
			else if (globalvar.idleCounter > 59) {	//idling 10 minutes, logout
				window.location = window.location.href
			}
			globalvar.idleCounter += 1

			//some changes in database from other users
			if (/BOOK/.test(response)) {
				updateBOOK(response)
				if ($("#dialogService").dialog('isOpen')) {
					var fromDate = $('#monthpicking').val()
					var toDate = $('#monthpicker').val()
					var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
					refillService(SERVICE, fromDate, toDate)
				}
				refillall()
				if ($("#queuewrapper").css('display') === 'block') {
					refillstaffqueue()
				}
			}
		}
	}

	resetTimer()
}

function onChange()
{
	if ($("#editcell").is(":visible")) {
		var whereisEditcell = $("#editcell").siblings("table").attr("id")
		if (whereisEditcell === "servicetbl") {
			return savePreviousCellService()	//Service table
		} else {
			return savePreviousCell()			//Main and Staffqueue tables
		}
	}
	return false
}
