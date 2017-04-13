function editHistory(rowmain, qn)
{
	if (rowmain.cells[QN].innerHTML)
	{
		var sql = "sqlReturnData=SELECT * FROM bookhistory "
		sql += "WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackeditHistory)
	}

	function callbackeditHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Data history DBfailed!\n" + response)
		else
			makehistory(rowmain, response)

		$("#editcell").hide()
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
	adjustDialogSize('wrapper', '#dialogOplog', '#historytbl')
}

function deleteHistory()
{
	var sql = "sqlReturnData=SELECT editdatetime, b.opdate, b.staffname, "
		sql += "b.hn, b.patient, b.diagnosis, b.treatment, b.contact, b.editor, b.qn "
		sql += "FROM book b INNER JOIN bookhistory bh ON b.qn = bh.qn "
		sql += "WHERE b.waitnum IS NULL AND bh.waitnum IS NULL "
		sql += "ORDER BY editdatetime DESC;"

		Ajax(MYSQLIPHP, sql, callbackdeleteHistory)

	function callbackdeleteHistory(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert("Delete history DBfailed!\n" + response)
		else
			makeDeleteHistory(response)

		$("#editcell").hide()
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
	adjustDialogSize('wrapper', '#dialogDeleted', '#historytbl')
}

function adjustDialogSize(wrapper, dialogContainer, dialogTable) 
{
	var height = $(dialogContainer).height()
	var maxHeight = window.innerHeight * 8 / 10
	var width = $(dialogTable).outerWidth()
	var	maxWidth = $(wrapper).width() * 9 / 10

	$(dialogContainer).css({
		width: width,
		height: height
	})

	$(dialogContainer).dialog({
//		minWidth: 500,
		width: $(dialogContainer).outerWidth() + 20,
		maxWidth: maxWidth,
		maxHeight: maxHeight
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

	function callbackCHECKPAC(response)
	{
		if (!response || response.indexOf("PAC") == -1)
			alert(response)
		else
			open('http://synapse/explore.asp?path=/All Patients/InternalPatientUID='+hn);

		$("#editcell").hide()
	}

} 

function serviceReview()
{
	$('#datepicker').datepicker( {
		altField: $( "#datepicking" ),
		altFormat: "yy-mm-dd",
		autoSize: true,
		dateFormat: "MM yy",
		minDate: "-1y",
		maxDate: "+1y",
		monthNames: [ "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
					  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม" ],
		onChangeMonthYear: function(year, month, inst) {
			$(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1))
		},
		onClose: function(){
			entireMonth($('#datepicking').val())
		}
	}).datepicker("setDate", new Date());//first time show instantly on input boxes

	$('#dialogService').dialog({
		title: 'Service Review',
		closeOnEscape: true,
		modal: true,
		width: $('.ui-datepicker').width() + $('#datepicker').width()
	})
	$('.ui-datepicker').click(function() {
		if (!$('#datepicker').is(":focus")) {
			entireMonth($('#datepicking').val())
			$('#datepicker').datepicker( "hide" )
		}
	})
	$('#datepicker').click(function() { //setDate follows input boxes
		$('#datepicker').datepicker(
			"setDate", $('#datepicking').val()? new Date($('#datepicking').val()) : new Date()
		)
	})
	$('#servicetbl').hide()
}

function entireMonth(fromDate)
{
	var from = new Date(fromDate)
	var toDate = new Date(from.getFullYear(), from.getMonth()+1, 0)//day before 1st of next month
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogService input[type=button]').hide()
	showCases(fromDate, toDate)
}

function showCases(fromDate, toDate)
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
							textAlign: "left"
						})
						.html(staffname)
							.siblings().hide()
		$.each( BOOK, function() {
			if (this.staffname == staffname
				&& this.opdate >= fromDate
				&& this.opdate <= toDate) {

				scase++
				$('#sdatatitle tr').clone()
					.insertAfter($('#servicetbl tr:last'))
						.filldataService(this, scase)
			}
		});
	})

	adjustDialogSize('wrapper', '#dialogService', '#servicetbl')
}

jQuery.fn.extend({
	filldataService : function(bookq, scase) {
		var rowcell = this[0].cells
		rowcell[SCASE].innerHTML = scase
		rowcell[SNAME].innerHTML = bookq.hn
			+ " " + bookq.patient
			+ " " + (bookq.dob? bookq.dob.getAge(bookq.opdate) : "")
		rowcell[SDIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[STREATMENT].innerHTML = bookq.treatment
		rowcell[SADMISSION].innerHTML = bookq.admission
		rowcell[SFINAL].innerHTML = bookq.final
		rowcell[SADMIT].innerHTML = bookq.admit
		rowcell[SDISCHARGE].innerHTML = bookq.discharge
		rowcell[SQN].innerHTML = bookq.qn
	}
})

function clickservice(clickedCell)
{
	savePreviousScell()
	storePresentScell(clickedCell)
}

function Skeyin(event)
{
	var keycode = event.which || window.event.keyCode
	var thiscell

	if (keycode == 9)
	{
		savePreviousScell()
		if (event.shiftKey)
			thiscell = findPrevScell(event)
		else
			thiscell = findNextScell(event)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			$("#editcell").hide()
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
		thiscell = findNextSHN(event)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			$("#editcell").hide()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		$('#menu').hide();
		$('#stafflist').hide();
		$("#editcell").hide()
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviousScell() 
{
	if (!$("#editcell").data("editCell"))
		return

	var trimHTML = /^(\s*<[^>]*>)*\s*|\s*(<[^>]*>\s*)*$/g
	var content = $("#editcell").html().replace(trimHTML, '')
	var HTMLnotBR =/(<((?!br)[^>]+)>)/ig
	content = $("#editcell").html().replace(HTMLnotBR, '')
	if (content == $("#editcell").data("content"))
		return

	switch($("#editcell").data("cellIndex"))
	{
		case SDIAGNOSIS:
			saveSContent("diagnosis", content)	//column name in MYSQL
			break
		case STREATMENT:
			saveSContent("treatment", content)
			break
		case SADMISSION:
			saveSContent("admission", content)
			break
		case SFINAL:
			saveSContent("final", content)
			break
		case SADMIT:
			saveSContent("admit", content)
			break
		case SDISCHARGE:
			saveSContent("discharge", content)
			break
	}
}
 
function saveSContent(column, content)	//column name in MYSQL
{
	var tableID = $("#editcell").data("tableID")
	var cellindex = $("#editcell").data("cellIndex")
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var opdate = rowcell.eq(OPDATE).html().numDate()
	var staffname = rowcell.eq(STAFFNAME).html()
	var qn = rowcell.eq(QN).html()
	var sqlstring
	var since

	$($("#editcell").data("editCell")).html(content)	//just for show instantly

	content = URIcomponent(content)			//take care of white space, double qoute, 
											//single qoute, and back slash
	sqlstring = "sqlReturnbook=UPDATE book SET "
	sqlstring += column +" = '"+ content
	sqlstring += "', editor='"+ THISUSER
	sqlstring += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sqlstring, callbacksaveSContent);

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
			updateBOOK(response);
			refillSthis('servicetbl', cellindex, qn)
		}
	}
}

function storePresentScell(pointing)
{
	editcell(pointing)
	$("#editcell").data("content", pointing.innerHTML)
}

function findPrevScell(event) 
{
	var prevcell = $($("#editcell").data("editCell"))
	var column = prevcell.index()

	if ((column = SEDITABLE[($.inArray(column, SEDITABLE) - 1)]))
	{
		prevcell = $(prevcell).parent().children().eq(column)
	}
	else
	{
		if ($(prevcell).parent().index() > 1)
		{	//go to prev row last editable
			do {
				prevcell = $(prevcell).parent().prev("tr").children().eq(SEDITABLE[SEDITABLE.length-1])
			}
			while ($(prevcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:1 td:1
			event.preventDefault()
			return false
		}
	}

	return $(prevcell).get(0)
}

function findNextScell(event) 
{
	var nextcell = $($("#editcell").data("editCell"))
	var column = nextcell.index()
	var lastrow = $('#tbl tr:last-child').index()

	if ((column = SEDITABLE[($.inArray(column, SEDITABLE) + 1)]))
	{
		nextcell = $(nextcell).parent().children().eq(column)
	}
	else
	{
		if ($(nextcell).parent().index() < lastrow)
		{	//go to next row first editable
			do {
				if (!((nextcell = $(nextcell).parent().next("tr").children().eq(SEDITABLE[0])))) {
					event.preventDefault()
					return false
				}
			}
			while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
		}
		else
		{	//#tbl tr:last-child td:last-child
			event.preventDefault()
			return false
		}
	}

	return $(nextcell).get(0)
}

function findNextSHN(event) 
{
	var nextcell = $($("#editcell").data("editCell"))
	var lastrow = $('#tbl tr:last-child').index()

	if ($(nextcell).parent().index() < lastrow)
	{	//go to next row first editable
		do {
			if (!((nextcell = $(nextcell).parent().next("tr").children().eq(SEDITABLE[0])))) {
				event.preventDefault()
				return false	
			}
		}
		while ($(nextcell).get(0).nodeName == "TH")	//THEAD row
	}
	else
	{	//#tbl tr:last-child td:last-child
		event.preventDefault()
		return false
	}

	return $(nextcell).get(0)
}
