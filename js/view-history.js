function editHistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	clearEditcell()

	function callbackeditHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Data history DBfailed!\n" + response)
		else
			makehistory(rowmain, response)
	}
}

function makehistory(rowmain, response)
{
	var history = JSON.parse(response)

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:30%">Diagnosis</th>';
	HTML_String += '<th style="width:30%">Treatment</th>';
	HTML_String += '<th style="width:25%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if ((history[j].action == 'insert' || history[j].action == 'update') && 
			!history[j].diagnosis && 
			!history[j].treatment && 
			!history[j].contact)
			continue
		if (history[j].action == 'delete') {
			HTML_String += '<tr style="background-color:#FFCCCC">';
		}
		else if (history[j].action == 'undelete') {
			HTML_String += '<tr style="background-color:#CCFFCC">';
		} else {
			HTML_String += '<tr>';
		}
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].contact +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogOplog").css("height", 0)
	$('#dialogOplog').html(HTML_String)
	$('#dialogOplog').dialog({
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		closeOnEscape: true,
		modal: true
	})

	$('#dialogOplog').dialog({
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function deleteHistory()
{
	var sql = "sqlReturnData=SELECT editdatetime, b.opdate, b.staffname, "
		sql += "b.hn, b.patient, b.diagnosis, b.treatment, b.contact, b.editor, b.qn "
		sql += "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
		sql += "WHERE b.waitnum IS NULL AND bh.waitnum IS NULL "
		sql += "ORDER BY editdatetime DESC;"

	Ajax(MYSQLIPHP, sql, callbackdeleteHistory)

	clearEditcell()

	function callbackdeleteHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Delete history DBfailed!\n" + response)
		else
			makeDeleteHistory(response)
	}
}

function makeDeleteHistory(response)
{
	var history = JSON.parse(response);

	$('#historytbl').attr('id', '')

	var HTML_String = '<table id = "historytbl">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:5%">Op.Date</th>';
	HTML_String += '<th style="width:5%">Staff</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:20%">Diagnosis</th>';
	HTML_String += '<th style="width:20%">Treatment</th>';
	HTML_String += '<th style="width:20%">Contact</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '<th style="display:none"></th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		HTML_String += '<tr>';
		HTML_String += '<td onclick="undelete(this)">' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].opdate +'</td>';
		HTML_String += '<td>' + history[j].staffname +'</td>';
		HTML_String += '<td>' + history[j].hn +'</td>';
		HTML_String += '<td>' + history[j].patient +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].contact +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '<td style="display:none">' + history[j].qn +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$("#dialogDeleted").css("height", 0)
	$('#dialogDeleted').find('table').replaceWith(HTML_String)
	$("#undelete").hide()
	$('#dialogDeleted').dialog({
		title: "Deleted Cases",
		closeOnEscape: true,
		modal: true
	})

	$('#dialogDeleted').dialog({
		width: window.innerWidth * 9 / 10,
		height: window.innerHeight * 8 / 10
	})
}

function undelete(that) 
{
	reposition("#undelete", "left center", "left center", that)

	doUndelete = function() 
	{
		var qn = $(that).siblings(":last").html()

		var sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += "waitnum = 1"
		sqlstring += ", editor = '"+ THISUSER
		sqlstring += "' WHERE qn = " + qn + ";"

		Ajax(MYSQLIPHP, sqlstring, callbackUndelete);

		$('#dialogDeleted').dialog("close")

		function callbackUndelete(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
			{
				alert("Failed! update database \n\n" + response)
			}
			else
			{
				updateBOOK(response);
				refillall()
			}
		}
	}
}

function closeUndel() 
{
	$('#undelete').hide()
}

function PACS(hn) 
{ 
	var sql = "PAC=http://synapse/explore.asp"

	Ajax(CHECKPAC, sql, callbackCHECKPAC)

	clearEditcell()

	function callbackCHECKPAC(response)
	{
		if (!response || response.indexOf("PAC") == -1)
			alert(response)
		else
			open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);
	}
} 

function serviceReview()
{
	$('#month').show()
	$('#monthpicker').show()
	$('#monthpicker').datepicker( {
		altField: $( "#monthpicking" ),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		minDate: "-1y",
		maxDate: "+1y",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function (year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		beforeShow: function () {
			$('.ui-datepicker-calendar').css('display', 'none')
		}
	}).datepicker("setDate",  "-1m")

	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน : ',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth - 10,
		height: window.innerHeight
	})
/*
$('#monthpicker').position ({
	my: 'left',
	at: 'center',
	of: '.ui-dialog-title'
})
*/
	$('.ui-datepicker').click(function() {
		if (!$('#monthpicker').is(":focus")) {
			entireMonth($('#monthpicking').val())
			$('#monthpicker').datepicker( "hide" )
		} else {
			$('.ui-datepicker-calendar').css('display', 'none')
		}
	})
	$('#monthpicker').click(function() { //setDate follows input boxes
		$('#monthpicker').datepicker(
			"setDate", $('#monthpicking').val()? new Date($('#monthpicking').val()) : new Date()
		)
		$('.ui-datepicker').show()
		$('.ui-datepicker-calendar').css('display', 'none')
	})
	$( "#monthpicker" ).datepicker('setDate', new Date($('#monthpicking').val()))
	$('.ui-datepicker-calendar').css('display', 'none')
	$('#servicetbl').hide()
}

function entireMonth(fromDate)
{
	var from = new Date(fromDate)
	var toDate = new Date(from.getFullYear(), from.getMonth()+1, 0)//day before 1st of next month
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogService input[type=button]').hide()
	$('#monthpicker').data({
		fromDate: fromDate,
		toDate: toDate
	})
	getService(fromDate, toDate)
}

function getService(fromDate, toDate)
{
	var sql = "sqlReturnData=SELECT * FROM book "
	sql += "WHERE opdate BETWEEN '"+ fromDate +"' AND '"+ toDate +"' "
	sql += "AND waitnum > 0 ORDER BY staffname, opdate;"

	Ajax(MYSQLIPHP, sql, callbackService);

	function callbackService(response)
	{
		if ((!response) || (response.indexOf("DBfailed") != -1)) {
			alert("Failed! retrieve database \n\n" + response)
		} else {
			var service = JSON.parse(response)

			showService(service)
			countService(service, fromDate, toDate)
		}
	}
}

function showService(service)
{
	//delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()

	var scase = 0

	$.each( STAFF, function() {
		var staffname = this.name
		$('#sdatatitle tr').clone()
			.insertAfter($('#servicetbl tr:last'))
				.children().eq(OPDATE)
					.attr("colSpan", 8)
						.css({
							height: "40",
							fontWeight: "bold",
							fontSize: "14px",
							textAlign: "left",
							paddingLeft: "10px"
						})
						.html(staffname)
							.siblings().hide()
		$.each( service, function() {
			if (this.staffname == staffname) {
				scase++
				$('#sdatatitle tr').clone()
					.insertAfter($('#servicetbl tr:last'))
						.filldataService(this, scase)
			}
		});
	})

	$('#month').hide()
	$('#monthpicker').hide()
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน : ' + $('#monthpicker').val(),
		close: function() {
			$('#datepicker').hide()
		}
	})
}

jQuery.fn.extend({
	filldataService : function(bookq, scase) {
		var rowcell = this[0].cells
		rowcell[CASE].innerHTML = scase
		rowcell[PATIENT].innerHTML = bookq.hn
			+ " " + bookq.patient
			+ " " + (bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
		rowcell[SDIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[STREATMENT].innerHTML = bookq.treatment
		rowcell[ADMISSION].innerHTML = bookq.admission
		rowcell[FINAL].innerHTML = bookq.final
		rowcell[ADMIT].innerHTML = (bookq.admit? bookq.admit : "")
		rowcell[DISCHARGE].innerHTML = (bookq.discharge? bookq.discharge : "")
		rowcell[SQN].innerHTML = bookq.qn
	}
})

function countService(service, fromDate, toDate)
{
	var Admission = 0
	var Discharge = 0
	var Operation = 0
	var Reoperation = 0
	var Readmission = 0
	var Infection = 0
	var Morbidity = 0
	var Dead = 0

	$.each( service, function() {
		if ((this.admission >= fromDate) && (this.admission <= toDate)) {
			Admission++
		}
		if ((this.discharge >= fromDate) && (this.discharge <= toDate)) {
			Discharge++
		}
		var that = this.treatment
		$.each( neuroSx, function(i, each) {
			if (that.toLowerCase().indexOf(each) >= 0) {
				Operation++
				return false
			}
		})
		if (this.treatment.toLowerCase().indexOf("re-op") >= 0) {
			Reoperation++
		}
		if (this.admission.toLowerCase().indexOf("re-ad") >= 0) {
			Readmission++
		}
		if (this.admission.toLowerCase().indexOf("infect") >= 0) {
			Infection++
		}
		if (this.admission.toLowerCase().indexOf("morbid") >= 0) {
			Morbidity++
		}
		if (this.final.toLowerCase().indexOf("dead") >= 0) {
			Dead++
		}
	})
	document.getElementById("Admission").innerHTML = Admission
	document.getElementById("Discharge").innerHTML = Discharge
	document.getElementById("Operation").innerHTML = Operation
	document.getElementById("Morbidity").innerHTML = Morbidity
	document.getElementById("Re-admission").innerHTML = Readmission
	document.getElementById("Infection").innerHTML = Infection
	document.getElementById("Re-operation").innerHTML = Reoperation
	document.getElementById("Dead").innerHTML = Dead
	
}

function clickservice(clickedCell)
{
	savePreviousScell()
	storePresentScell(clickedCell)
}

function Skeyin(event)
{
	var keycode = event.which || window.event.keyCode
	var tableID = "#servicetbl"
	var editable = SEDITABLE
	var pointing = $($("#editcell").data("editCell"))
	var thiscell

	if (keycode == 9)
	{
		savePreviousScell()
		if (event.shiftKey)
			thiscell = findPrevcell(event, editable, pointing)
		else
			thiscell = findNextcell(event, tableID, editable, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 13)
	{
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviousScell()
		thiscell = findNextRow(event, tableID, editable, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcell()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		clearEditcell()
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviousScell() 
{
	switch($("#editcell").data("cellIndex"))
	{
		case CASE:
		case PATIENT:
			break
		case SDIAGNOSIS:
			if ((content = getContent())) {
				saveSContent("diagnosis", content)
			}
			break
		case STREATMENT:
			if ((content = getContent())) {
				saveSContent("treatment", content)
			}
			break
		case ADMISSION:
			if ((content = getContent())) {
				saveSContent("admission", content)
			}
			break
		case FINAL:
			if ((content = getContent())) {
				saveSContent("final", content)
			}
			break
		case ADMIT:
			if ($('#datepicker').val() != $("#editcell").data("content")) {
				saveSContent("admit", $('#datepicker').val())
			}
			$('#datepicker').hide()
			break
		case DISCHARGE:
			if ($('#datepicker').val() != $("#editcell").data("content")) {
				saveSContent("discharge", $('#datepicker').val())
			}
			$('#datepicker').hide()
			break
	}
}
 
function getContent()
{
	var content = getData()
	if (content == $("#editcell").data("content")) {
		return false
	} else {
		return content
	}
}
 
function getData()
{
	var trimHTML = /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var content = $("#editcell").html().replace(trimHTML, '')
	var HTMLnotBR =/(<((?!br)[^>]+)>)/ig
	content = $("#editcell").html().replace(HTMLnotBR, '')
	return content
}

function saveSContent(column, content)	//column name in MYSQL
{
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var qn = rowcell.eq(SQN).html()
	var fromDate = $('#monthpicker').data('fromDate')
	var toDate = $('#monthpicker').data('toDate')

	$($("#editcell").data("editCell")).html(content)	//just for show instantly

	content = URIcomponent(content)			//take care of white space, double qoute, 
											//single qoute, and back slash
	var sql = "sqlReturnData=UPDATE book SET "
	sql += column +" = '"+ content
	sql += "', editor='"+ THISUSER
	sql += "' WHERE qn = "+ qn +";"
	sql += "SELECT * FROM book "
	sql += "WHERE opdate BETWEEN '"+ fromDate +"' AND '"+ toDate +"' "
	sql += "AND waitnum > 0 ORDER BY staffname, opdate;"

	Ajax(MYSQLIPHP, sql, callbacksaveSContent);

	function callbacksaveSContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("Failed! update database \n\n" + response)
			$($("#editcell").data("editCell")).html($("#editcell").data("content"))
			//return to previous content
		}
		else
		{
			var fromDate = $('#monthpicker').data('fromDate')
			var toDate = $('#monthpicker').data('toDate')
			var service = JSON.parse(response)

			showService(service)
			countService(service, fromDate, toDate)
		}
	}
}

function storePresentScell(pointing)
{
	var cindex = $(pointing).closest("td").index()

	switch(cindex)
	{
		case CASE:
		case PATIENT:
			clearEditcell()
			break
		case SDIAGNOSIS:
		case STREATMENT:
		case ADMISSION:
		case FINAL:
			editcell(pointing)
			saveDataPoint("#editcell", pointing)
			break
		case ADMIT:
		case DISCHARGE:
			editcell(pointing)
			saveDataPoint("#editcell", pointing)
			$('#editcell').hide()
			selectDate(pointing)
			break
	}
}

function selectDate(pointing)
{
	$('#datepicker').css({
		height: $(pointing).height(),
		width: $(pointing).width()
	})
	reposition("#datepicker", "center", "center", pointing)

	$('#datepicker').datepicker( {
		dateFormat: "yy-mm-dd",
		minDate: "-1y",
		maxDate: "+1y",
		onClose: function () {
			$('.ui-datepicker').css( {
				fontSize: ''
			}).hide()
			$(pointing).html($('#datepicker').val())
			savePreviousScell() 
		}
	})
	$('#datepicker').datepicker("setDate", $(pointing).html()? new Date($(pointing).html()) 
												: $('#monthpicking').val())
	$('.ui-datepicker').css( {
		fontSize: '12px'
	})
	$('#datepicker').datepicker( 'show' )
}
