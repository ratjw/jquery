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
	var history = JSON.parse(response);

	var HTML_String = '<table id = "historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:30%">Diagnosis</th>';
	HTML_String += '<th style="width:30%">Treatment</th>';
	HTML_String += '<th style="width:25%">Notice</th>';
	HTML_String += '<th style="width:5%">Editor</th>';
	HTML_String += '</tr>';
	for (var j = 0; j < history.length; j++) 
	{
		if (!history[j].diagnosis && !history[j].treatment && !history[j].tel)
			continue
		HTML_String += '<tr>';
		HTML_String += '<td>' + history[j].editdatetime +'</td>';
		HTML_String += '<td>' + history[j].diagnosis +'</td>';
		HTML_String += '<td>' + history[j].treatment +'</td>';
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$('#dialogContainer').html(HTML_String)
	var maxHeight = window.innerHeight * 8 / 10
	var height = $("#dialogContainer").height()
	height = (height > maxHeight)? maxHeight : height
	$('#dialogContainer').dialog({
		title: rowmain.cells[HN].innerHTML +' '+ rowmain.cells[NAME].innerHTML,
		width: $("#tblcontainer").width() * 6 / 10,
		closeOnEscape: true
	})
	$('#dialogContainer').css({
		height: height,
		overflow: "auto"
	})
}

function deleteHistory()
{
	var sql = "sqlReturnData=SELECT editdatetime, b.opdate, b.staffname, "
		sql += "b.hn, b.patient, b.diagnosis, b.treatment, b.tel, b.editor, b.qn "
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

	var HTML_String = '<table id = "historytable">';
	HTML_String += '<tr>';
	HTML_String += '<th style="width:10%">Date Time</th>';
	HTML_String += '<th style="width:5%">Op.Date</th>';
	HTML_String += '<th style="width:5%">Staff</th>';
	HTML_String += '<th style="width:5%">HN</th>';
	HTML_String += '<th style="width:10%">Patient Name</th>';
	HTML_String += '<th style="width:20%">Diagnosis</th>';
	HTML_String += '<th style="width:20%">Treatment</th>';
	HTML_String += '<th style="width:20%">Notice</th>';
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
		HTML_String += '<td>' + history[j].tel +'</td>';
		HTML_String += '<td>' + history[j].editor +'</td>';
		HTML_String += '<td style="display:none">' + history[j].qn +'</td>';
		HTML_String += '</tr>';
	}
	HTML_String += '</table>';

	$('#dialogContainer').html(HTML_String)
	$('#historytable').after($('#nondelete').clone().attr("id", "undelete"))
	var maxHeight = window.innerHeight * 8 / 10
	var height = $("#dialogContainer").height()
	height = (height > maxHeight)? maxHeight : height
	$('#dialogContainer').dialog({
		title: "Deleted Cases",
		width: $("#tblcontainer").width() * 7 / 10,
		closeOnEscape: true
	})
	$('#dialogContainer').css({
		height: height,
		overflow: "auto"
	})
}

function undelete(that) 
{
	$('#undelete').show()
	$('#undelete').position( {
		my: "left center",
		at: "left center",
		of: $(that)
	})

	doUndelete = function() 
	{
		var qn = $(that).siblings(":last").html()

		var sqlstring = "sqlReturnbook=UPDATE book SET "
		sqlstring += "waitnum = 0"
		sqlstring += ", editor = '"+ THISUSER
		sqlstring += "' WHERE qn = " + qn + ";"
		sqlstring += "DELETE FROM bookhistory "
		sqlstring += "WHERE qn = " + qn
		sqlstring += " AND waitnum IS NULL;"

		Ajax(MYSQLIPHP, sqlstring, callbackUndelete);

		$('#dialogContainer').dialog("close")

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
	var datepicker = '<span style="margin:20px 0px 40px"> เดือน :</span>'
	datepicker += '<input type="text" id="datepicker" style="margin-left:5px">'
	datepicker += '<input type="text" id="datepicking" style="display:none">'

	$('#dialogContainer').html(datepicker)

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

	$('#dialogContainer').dialog({
		title: 'Service Review',
		closeOnEscape: true,
		width: $('.ui-datepicker').width() + $('#datepicker').width()
	})
	$('#datepicker').click(function() { //setDate follows input boxes
		$('#datepicker').datepicker(
			"setDate", $('#datepicking').val()? new Date($('#datepicking').val()) : new Date()
		)
	})
}

function entireMonth(fromDate)
{
	var from = new Date(fromDate)
	var toDate = new Date(from.getFullYear(), from.getMonth()+1, 0)//day before 1st of next month
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogContainer input[type=button]').hide()
	showCases(fromDate, toDate)
}

function showCases(fromDate, toDate)
{
	$('#servicetable').remove()
	$('#dialogContainer').append($('#servicetbl').clone().attr("id", "servicetable").show())
	$.each( STAFF, function() {	// each == this
		var staffname = this.name
		$('#sdatatitle tr').clone()
			.insertAfter($('#servicetable tr:last'))
				.children().eq(OPDATE)
					.attr("colSpan", 6)
						.css({
							height: "40",
							fontWeight: "bold",
							fontSize: "14px"
						})
						.html(staffname)
							.siblings().hide()
		$.each( BOOK, function() {	// each == this
			if (this.staffname == staffname && 
				this.opdate >= fromDate &&
				this.opdate <= toDate) {
				$('#sdatatitle tr').clone()
					.insertAfter($('#servicetable tr:last'))
						.filldataQueue(this)
			}
		});
	})

	$('#dialogContainer').dialog().parent().css( {
		maxHeight: window.innerHeight * 8 / 10,
		width: $("#tblcontainer").width() * 7 / 10,
		overflow: "auto"
	}).position({
		my : "center center",
		at : "center center+20",
		of : window
	});
}
