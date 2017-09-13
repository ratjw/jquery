
;(function ()
{	//Enclose global variable to be local variable
	var BOOK = []
	var CONSULT = []
	var mobile = false
	var ispacs = false
	var user = ""
	var timestamp = ""
	var newWindow = null
	var timer = {}
	var IdleCounter = 0

	setBOOK = function (updatebook) {
		BOOK = updatebook
	}

	setCONSULT = function (updateconsult) {
		CONSULT = updateconsult
	}

	setMobile = function (device) {
		mobile = device
	}

	setPACS = function (pacs) {
		ispacs = pacs
	}

	setUser = function (userid) {
		user = userid
	}

	setTimeStamp = function (time) {
		timestamp = time
	}

	setIdleCounter = function (idle) {
		if (idle) {
			IdleCounter++
		} else {
			IdleCounter = 0
		}
	}

	getBOOK = function () {
		return BOOK
	}

	getCONSULT = function () {
		return CONSULT
	}

	isMobile = function () {
		return mobile
	}

	isPACS = function () {
		return ispacs
	}

	getUser = function () {
		return user
	}

	getTimeStamp = function (time) {
		return timestamp
	}

	getIdleCounter = function () {
		return IdleCounter
	}

	createWindow = function (hn, patient) {
		if (newWindow && !newWindow.closed) {
			newWindow.close();
		}
		newWindow = window.open("jQuery-File-Upload", "_blank")    
		newWindow.hnName = {"hn": hn, "patient": patient}
		//hnName is a pre-defined variable in child window
	}

	clearTimer = function ()
	{
		clearTimeout(timer);
	}

	resetTimer = function ()
	{
		clearTimeout(timer);
		timer = setTimeout("updating()",10000);	//poke server every 10 sec.
	}
})()

function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook=''", loading);

	setUser(userid)
	resetTimer()

	$("#login").remove()
	$("#logo").remove()
	$("#tblwrapper").show()

	//Prevent error message : call 'isOpen' before initialization
	$("#dialogTraceBack").dialog()
	$("#dialogTraceBack").dialog('close')
	$("#dialogDeleted").dialog()
	$("#dialogDeleted").dialog('close')
	$("#dialogFind").dialog()
	$("#dialogFind").dialog('close')
	$("#dialogEquip").dialog()
	$("#dialogEquip").dialog('close')
	$("#dialogService").dialog()
	$("#dialogService").dialog('close')
	$("#dialogAlert").dialog()
	$("#dialogAlert").dialog('close')

	if (userid === "000000") {
		$(document).on("click", function (event) {
			event.stopPropagation()
			var target = event.target
			var rowi = $(target).closest('tr')
			var qn = rowi.children('td').eq(QN).html()
			if ((target.nodeName !== "TD") || (!qn)) {
				event.preventDefault()
				event.stopPropagation()
				return false
			}
			fillEquipTable(getBOOK(), rowi[0], qn)
			showNonEditableForScrub()
		})
		$(document).keydown(function(e) {
			e.preventDefault();
		})
		return
	}

	$("#editcell").on("click", function (event) {
		event.stopPropagation()
	})

	$("#tbl, #queuetbl").on("click", function (event) {
		resetTimer();
		setIdleCounter(0)
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
		if (target.nodeName === "TH") {
			clearEditcell()
			return	
		}

		clicktable(target)
	})

	$("#servicetbl").on("click", function (event) {
		resetTimer();
		setIdleCounter(0)
		event.stopPropagation()
		var target = event.target
		if (target.nodeName === "TH") {
			clearEditcell()
			return	
		}

		clickservice(target)
	})

	$('#menu li > div').on("click", function(event){
		if ($(this).siblings('ul').length > 0){	//click on parent of submenu
			event.preventDefault()
			event.stopPropagation()
		}
	});

	$("#editcell").keydown( function (event) {
		resetTimer();
		setIdleCounter(0)
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

	$(window).resize(function() {	//for resizing dialogs
		if ($("#dialogService").dialog('isOpen')) {
			$("#dialogService").dialog({
				width: window.innerWidth * 95 / 100,
				height: window.innerHeight * 95 / 100
			})
		}
	})

	$(document).contextmenu( function (event) {
		return false
	})

	$("#btnExport").on("click", function(e) {
		e.preventDefault();
		exportToExcel()
	})

	$("html, body").css( {
		height: "100%",		//to make table scrollable while dragging
		overflow: "hidden",
		margin: "0px"
	})

	sortable()
	//call sortable before render, if after, it renders very slowly

	var mobile = false
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		mobile = true
	}
	setMobile(mobile)

	var pacs
	if (mobile) {
		pacs = false
	} else {

		Ajax("php/checkpac.php", "PAC=http://synapse/explore.asp", callbackCheckPACS)

		function callbackCheckPACS(response)
		{
			if (!response || response.indexOf("PAC") == -1) {
				pacs = false
			} else {
				pacs = true
				$.each($('#tbl tr:has(td)'), function() {
					var $this = $(this).children('td').eq(HN)
					if ($this.html()) {
						$this.addClass("pacs")
					}
				})
			}
			setPACS(pacs)
		}
	}
}
		
function loading(response)
{
	if (response && response.indexOf("BOOK") !== -1) {
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		if (getUser() === "000000") {
			fillForScrub()
		} else {
			fillupstart();
			fillStafflist()
		}
	} else {
		response = localStorage.getItem('ALLBOOK')
		var error = "<br><br>Response from server has no data"
		if (response) {
			alert("Server Error", error + "<br><br>Use localStorage instead");
			updateBOOK(response)
			fillupstart();
			fillStafflist()
		} else {
			alert("Server Error", error + "<br><br>No localStorage backup");
		}
	}
}

function updateBOOK(response)
{
	var temp = JSON.parse(response)
	var book = temp.BOOK? temp.BOOK : []
	var consult = temp.CONSULT? temp.CONSULT : []

	setBOOK(book)
	setCONSULT(consult)
	setTimeStamp(temp.QTIME)	//datetime of last change in server
}

function fillStafflist()
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

function updating()
{
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (oldcontent !== newcontent)) {

		//making some change
		if ($(editPoint).closest("table").attr("id") === "servicetbl") {
			saveEditPointDataService(editPoint)		//Service table
		} else {
			saveEditPointData(editPoint)		//Main and Staffqueue tables
		}
		setIdleCounter(0)
	} else {
		//idling
		Ajax(MYSQLIPHP, "functionName=checkupdate&time=" + getTimeStamp(), updatingback);

		function updatingback(response)
		{
			//not being editing on screen
			var idle = getIdleCounter()
			if (idle === 5) {
				//idling 1 minute, clear editing setup
				//do this only once, not every 1 minute
				clearEditcell()
				$('#menu').hide()		//editcell may be on first column
				$('#stafflist').hide()	//editcell may be on staff
				$('#datepicker').hide()
				$('#datepicker').datepicker("hide")
			}
			else if (idle > 59) {	//idling 10 minutes, logout
				window.location = window.location.href
			}
			setIdleCounter(1)

			//some changes in database from other users
			if (response && response.indexOf("opdate") !== -1)
			{
				updateBOOK(response)
				updateTables()
			}
		}
	}

	resetTimer()
}

function updateTables()
{
	if ($("#dialogService").dialog('isOpen')) {
		var fromDate = $('#monthpicker').data('fromDate')
		var toDate = $('#monthpicker').data('toDate')
		var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
		refillService(SERVICE, fromDate, toDate)
	}
	refillall()
	if ($("#queuewrapper").css('display') === 'block') {
		refillstaffqueue()
	}
}

function exportToExcel()
{
	//getting data from our table
	var data_type = 'data:application/vnd.ms-excel';	//Chrome, FF, not IE
	var title = $('#dialogService').dialog( "option", "title" )
	var style = '\
		<style type="text/css">\
			#exceltbl {\
				border-right: solid 1px slategray;\
				border-collapse: collapse;\
			}\
			#exceltbl th {\
				font-size: 16px;\
				font-weight: bold;\
				height: 40px;\
				background-color: #7799AA;\
				color: white;\
				border: solid 1px silver;\
			}\
			#exceltbl td {\
				font-size: 14px;\
				vertical-align: middle;\
				padding-left: 3px;\
				border-left: solid 1px silver;\
				border-bottom: solid 1px silver;\
			}\
			#excelhead td {\
				height: 30px; \
				vertical-align: middle;\
				font-size: 22px;\
				text-align: center;\
			}\
			#excelhead td.Readmission,\
			#exceltbl tr.Readmission,\
			#exceltbl td.Readmission { background-color: #AACCCC; }\
			#excelhead td.Reoperation,\
			#exceltbl tr.Reoperation,\
			#exceltbl td.Reoperation { background-color: #CCCCAA; }\
			#excelhead td.Infection,\
			#exceltbl tr.Infection,\
			#exceltbl td.Infection { background-color: #CCAAAA; }\
			#excelhead td.Morbidity,\
			#exceltbl tr.Morbidity,\
			#exceltbl td.Morbidity { background-color: #AAAACC; }\
			#excelhead td.Dead,\
			#exceltbl tr.Dead,\
			#exceltbl td.Dead { background-color: #AAAAAA; }\
		</style>'
	var head = '\
		  <table id="excelhead">\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td colspan="4" style="font-weight:bold;font-size:24px">' + title + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td>Admit : ' + $("#Admit").html() + '</td>\
			  <td>Discharge : ' + $("#Discharge").html() + '</td>\
			  <td>Operation : ' + $("#Operation").html() + '</td>\
			  <td class="Morbidity">Morbidity : ' + $("#Morbidity").html() + '</td>\
			</tr>\
			<tr>\
			  <td></td>\
			  <td></td>\
			  <td class="Readmission">Re-admission : ' + $("#Readmission").html() + '</td>\
			  <td class="Infection">Infection SSI : ' + $("#Infection").html() + '</td>\
			  <td class="Reoperation">Re-operation : ' + $("#Reoperation").html() + '</td>\
			  <td class="Dead">Dead : ' + $("#Dead").html() + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
		  </table>'

	if ($("#exceltbl").length) {
		$("#exceltbl").remove()
	}
	$("#servicetbl").clone(true).attr("id", "exceltbl").appendTo("body")
	$.each( $("#exceltbl tr"), function() {
		var multiclass = this.className.split(" ")
		if (multiclass.length > 1) {
			this.className = multiclass[multiclass.length-1]
		}	//use only the last class because excel not accept multiple classes
	})
	$.each( $("#exceltbl tr td, #exceltbl tr th"), function() {
		if ($(this).css("display") === "none") {
			$(this).remove()
		}	//remove trailing hidden cells in excel
	})
	var table = $("#exceltbl")[0].outerHTML
	table = table.replace(/<br>/g, " ")	//excel split <br> to another cell inside that cell 

	var tableToExcel = '<!DOCTYPE html><HTML><HEAD><meta charset="utf-8"/>' + style + '</HEAD><BODY>'
	tableToExcel += head + table
	tableToExcel += '</BODY></HTML>'
	var month = $("#monthpicking").val()
	month = month.substring(0, month.lastIndexOf("-"))	//use yyyy-mm for filename
	var filename = 'Service Neurosurgery ' + month + '.xls'

	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE")
	var edge = ua.indexOf("Edge"); 

	if (msie > 0 || edge > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
	{
	  if (typeof Blob !== "undefined") {
		//use blobs if we can
		tableToExcel = [tableToExcel];
		//convert to array
		var blob1 = new Blob(tableToExcel, {
		  type: "text/html"
		});
		window.navigator.msSaveBlob(blob1, filename);	//tested with Egde
	  } else {
		txtArea1.document.open("txt/html", "replace");
		txtArea1.document.write(tableToExcel);
		txtArea1.document.close();
		txtArea1.focus();
		sa = txtArea1.document.execCommand("SaveAs", true, filename);
		return (sa);	//not tested
	  }
	} else {
		var a = document.createElement('a');
		document.body.appendChild(a);  // You need to add this line in FF
		a.href = data_type + ', ' + encodeURIComponent(tableToExcel);
		a.download = filename
		a.click();		//tested with Chrome and FF
	}
}
