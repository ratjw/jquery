function loadtable(userid)
{
	Ajax(MYSQLIPHP, "nosqlReturnbook=''", loading);

	$("#login").remove()
	$("#tblwrapper").show()
	$("#dialogOplog").dialog()
	$("#dialogOplog").dialog('close')
	$("#dialogDeleted").dialog()
	$("#dialogDeleted").dialog('close')
	$("#dialogFind").dialog()
	$("#dialogFind").dialog('close')
	$("#dialogEquip").dialog()
	$("#dialogEquip").dialog('close')
	$("#dialogService").dialog()
	$("#dialogService").dialog('close')	//prevent updateTables() call 'isOpen' before initialization
	$("#dialogAlert").dialog()
	$("#dialogAlert").dialog('close')
	$("#dialogUpload").dialog()
	$("#dialogUpload").dialog('close')

	THISUSER = userid
	if (THISUSER == "000000") {
		$(document).on("click", function (event) {
			event.stopPropagation()
			var target = event.target
			var rowi = $(target).closest('tr')
			var qn = rowi.children('td').eq(QN).html()
			if ((target.nodeName != "TD") || (!qn)) {
				event.preventDefault()
				event.stopPropagation()
				return false
			}
			fillEquipTable(BOOK, rowi[0], qn)
			showNonEditableForScrub()
		})
		$(document).keydown(function(e) {
			e.preventDefault();
		})
		return
	}

	$(document).on("click", function (event) {
		countReset();
		updating.timer = 0
		$(".bordergroove").removeClass("bordergroove")
		event.stopPropagation()
		var target = event.target
		if ($('#menu').is(":visible")) {//not visible == take up space even can't be seen
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
			clearEditcell()
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

	$('#menu li > div').on("click", function(event){
		if ($(this).siblings('ul').length > 0){	//click on parent of submenu
			event.preventDefault()
			event.stopPropagation()
		}
	});

	$(document).keydown( function (event) {
		countReset();
		updating.timer = 0
		if ($('#monthpicker').is(':focus')) {
			return
		}
		if ($('#dialogEquip').is(':visible')) {
			return
		}
		var keycode = event.which || window.event.keyCode
		var pointing = $("#editcell").data("pointing")
		if ($('#dialogService').is(':visible')) {
			Skeyin(event, keycode, pointing)
		} else {
			keyin(event, keycode, pointing)
		}
	})

	$(document).keyup( function (event) {	//for resizing the editing cell
		if ($('#monthpicker').is(':focus')) {
			return
		}
		if ($('#dialogEquip').is(':visible')) {
			return
		}
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

	TIMER = setTimeout("updating()",10000);	//poke server every 10 sec.
	updating.timer = 0
}
		
function loading(response)
{
	if (response && response.indexOf("BOOK") != -1) {
		localStorage.setItem('ALLBOOK', response)
		updateBOOK(response)
		if (THISUSER == "000000") {
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

	BOOK = temp.BOOK? temp.BOOK : []
	CONSULT = temp.CONSULT? temp.CONSULT : []
	TIMESTAMP = temp.QTIME? temp.QTIME : ""	//datetime of last change in server
}

function fillStafflist()
{
	var stafflist = ''
	var staffmenu = ''
	for (var each = 0; each < STAFF.length; each++)
	{
		stafflist += '<li><div>' + STAFF[each] + '</div></li>'
		staffmenu += '<li id="item88"><div>' + STAFF[each] + '</div></li>'
	}
	staffmenu += '<li id="item88"><div>Consults</div></li>'
	document.getElementById("stafflist").innerHTML = stafflist
	document.getElementById("item0").innerHTML = staffmenu
}

function updating()	//updating.timer : local variable
{
	var oldcontent = $("#editcell").data("oldcontent")
	var newcontent = getEditcellHtml()
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (oldcontent != newcontent)) {

		//making some change
		if ($(editPoint).closest("table").attr("id") == "servicetbl") {
			saveEditPointDataService(editPoint)		//Service table
		} else {
			saveEditPointData(editPoint)		//Main and Staffqueue tables
		}
		updating.timer = 0
	} else {
		//idling
		Ajax(MYSQLIPHP, "functionName=checkupdate&time="+TIMESTAMP, updatingback);

		function updatingback(response)
		{
			//not being editing on screen
			if (updating.timer == 10) {
				//delay 100 seconds and
				//do this only once even if idle for a long time
				clearEditcell()
				$('#menu').hide()		//editcell may be on first column
				$('#stafflist').hide()	//editcell may be on staff
				$('#datepicker').hide()
				$('#datepicker').datepicker("hide")
			}
			else if (updating.timer > 360) {
				window.location = window.location.href		//logout after 1 hr
			}
			updating.timer++

			//some changes in database from other users
			if (response && response.indexOf("opdate") != -1)
			{
				updateBOOK(response)
				updateTables()
			}
		}
	}

	countReset()
}

function updateTables()
{
	if ($("#dialogService").dialog('isOpen')) {
		var fromDate = $('#monthpicker').data('fromDate')
		var toDate = $('#monthpicker').data('toDate')
		var SERVICE = getfromBOOKCONSULT(fromDate, toDate)
		refillService(SERVICE, fromDate, toDate)
	}
	refillall(BOOK)
	if ($("#queuewrapper").css('display') == 'block') {
		refillstaffqueue()
	}
}

function countReset()
{
	clearTimeout(TIMER);
	TIMER = setTimeout("updating()",10000);	//poke server every 10 sec.
}

function exportToExcel()
{
	//getting data from our table
	var data_type = 'data:application/vnd.ms-excel';	//Chrome, FF, not IE
	var title = $('#dialogService').dialog( "option", "title" )
	var style = '\
		<style type="text/css">\
			#servicetbl {\
				border-right: solid 1px slategray;\
				border-collapse: collapse;\
			}\
			#servicetbl th {\
				font-size: 16px;\
				font-weight: bold;\
				height: 40px;\
				background-color: #7799AA;\
				color: white;\
				border: solid 1px silver;\
			}\
			#servicetbl td {\
				font-size: 14px;\
				vertical-align: middle;\
				padding-left: 3px;\
				border-left: solid 1px silver;\
				border-bottom: solid 1px silver;\
			}\
			#servicehead td {\
				height: 30px; \
				vertical-align: middle;\
				font-size: 22px;\
				text-align: center;\
			}\
			#servicehead td.Readmission,\
			#servicetbl tr.Readmission,\
			#servicetbl td.Readmission { background-color: #AACCCC; }\
			#servicehead td.Reoperation,\
			#servicetbl tr.Reoperation,\
			#servicetbl td.Reoperation { background-color: #CCCCAA; }\
			#servicehead td.Infection,\
			#servicetbl tr.Infection,\
			#servicetbl td.Infection { background-color: #CCAAAA; }\
			#servicehead td.Morbidity,\
			#servicetbl tr.Morbidity,\
			#servicetbl td.Morbidity { background-color: #AAAACC; }\
			#servicehead td.Dead,\
			#servicetbl tr.Dead,\
			#servicetbl td.Dead { background-color: #AAAAAA; }\
		</style>'
	var head = '\
		  <table id="servicehead">\
			<tr>\
			  <td></td>\
			  <td colspan="3" style="font-weight:bold;font-size:24px">' + title + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
			<tr>\
			  <td></td>\
			  <td>Admit : ' + $("#Admit").html() + '</td>\
			  <td>Discharge : ' + $("#Discharge").html() + '</td>\
			  <td>Operation : ' + $("#Operation").html() + '</td>\
			  <td class="Morbidity">Morbidity : ' + $("#Morbidity").html() + '</td>\
			</tr>\
			<tr>\
			  <td></td>\
			  <td class="Readmission">Re-admission : ' + $("#Readmission").html() + '</td>\
			  <td class="Infection">Infection SSI : ' + $("#Infection").html() + '</td>\
			  <td class="Reoperation">Re-operation : ' + $("#Reoperation").html() + '</td>\
			  <td class="Dead">Dead : ' + $("#Dead").html() + '</td>\
			</tr>\
			<tr></tr>\
			<tr></tr>\
		  </table>'
	$.each( $("#servicetbl tr"), function() {
		var multiclass = this.className.split(" ")
		if (multiclass.length > 1) {
			this.className = multiclass[multiclass.length-1]
		}	//use only the last class because excel ignore multiple classes
	})
	var table = $("#servicetbl")[0].outerHTML
	table = table.replace(/<br>/g, " ")

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
