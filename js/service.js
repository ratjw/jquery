
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
	resetcountService()
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
	var SERVICE

	if (fromDate >= BOOK[0].opdate) {
		SERVICE = getfromBOOK(fromDate, toDate)
	} else {
		SERVICE = getfromServer(fromDate, toDate)
	}

	if (SERVICE) {
		showService(SERVICE, fromDate, toDate)
//		countService(SERVICE, fromDate, toDate)
	}
}

function getfromBOOK(fromDate, toDate)
{
	var SERV = []
	var i = 0
	for (var q = 0; q < BOOK.length; q++) {
		if ((BOOK[q].opdate >= fromDate) && (BOOK[q].opdate <= toDate)) {
			SERV[i] = BOOK[q]
			i++
		}
		if (BOOK[q].opdate > toDate) {
			break
		}
	}
	return SERV
}

function getfromServer(fromDate, toDate)
{
	var sql = "sqlReturnData=SELECT * FROM book "
	sql += "WHERE opdate BETWEEN '"+ fromDate +"' AND '"+ toDate +"' "
	sql += "AND waitnum > 0 ORDER BY staffname, opdate;"

	Ajax(MYSQLIPHP, sql, callbackService);

	function callbackService(response)
	{
		if ((!response) || (response.indexOf("DBfailed") != -1)) {
			alert("Failed! retrieve database \n\n" + response)
			return	//undefined
		} else {
			return JSON.parse(response)
		}
	}
}

function showService(SERVICE, fromDate, toDate)
{
	resetcountService()

	//delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()

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
		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				var color = countService(this, fromDate, toDate)
				scase++
				$('#sdatatitle tr').clone()
					.insertAfter($('#servicetbl tr:last'))
						.filldataService(this, scase, color)
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
	filldataService : function(bookq, scase, color) {
		this[0].className = color
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

function resetcountService()
{
	document.getElementById("Admit").innerHTML = 0
	document.getElementById("Discharge").innerHTML = 0
	document.getElementById("Operation").innerHTML = 0
	document.getElementById("Morbidity").innerHTML = 0
	document.getElementById("Readmission").innerHTML = 0
	document.getElementById("Infection").innerHTML = 0
	document.getElementById("Reoperation").innerHTML = 0
	document.getElementById("Dead").innerHTML = 0
}

function countService(thiscase, fromDate, toDate)
{
	var color

	if (isAdmit(thiscase, fromDate, toDate)) {
		var Admit = document.getElementById("Admit")
		Admit.innerHTML = Number(Admit.innerHTML) + 1
	}
	if (isDischarge(thiscase, fromDate, toDate)) {
		var Discharge = document.getElementById("Discharge")
		Discharge.innerHTML = Number(Discharge.innerHTML) + 1
	}
	if (isOperation(thiscase)) {
		var Operation = document.getElementById("Operation")
		Operation.innerHTML = Number(Operation.innerHTML) + 1
	}
	if (isReoperation(thiscase)) {
		var Reoperation = document.getElementById("Reoperation")
		Reoperation.innerHTML = Number(Reoperation.innerHTML) + 1
		color = "Reoperation"
	}
	if (isReadmission(thiscase)) {
		var Readmission = document.getElementById("Readmission")
		Readmission.innerHTML = Number(Readmission.innerHTML) + 1
		color = "Readmission"
	}
	if (isInfection(thiscase)) {
		var Infection = document.getElementById("Infection")
		Infection.innerHTML = Number(Infection.innerHTML) + 1
		color = "Infection"
	}
	if (isMorbidity(thiscase)) {
		var Morbidity = document.getElementById("Morbidity")
		Morbidity.innerHTML = Number(Morbidity.innerHTML) + 1
		color = "Morbidity"
	}
	if (isDead(thiscase)) {
		var Dead = document.getElementById("Dead")
		Dead.innerHTML = Number(Dead.innerHTML) + 1
		color = "Dead"
	}
	return color
}

function isAdmit(thiscase, fromDate, toDate)
{
	if ((thiscase.admit >= fromDate) && (thiscase.admit <= toDate)) {
		return true
	}
}

function isDischarge(thiscase, fromDate, toDate)
{
	if ((thiscase.discharge >= fromDate) && (thiscase.discharge <= toDate)) {
		return true
	}
}

function regexDate(str)
{
//	dd/mm/yyyy ==> \b(?:[012][1-9]|3[01])/(?:0[1-9]|1[012])/\d{4}\b
//	dd/mm/yy ==> \b(?:[012][1-9]|3[01])/(?:0[1-9]|1[012])/\d{2}\b
//	mm/yy ==> \b(?:0[1-9]|1[012])/\d\d\b
//	d/m/yy ==> \b[1-9]/[1-9]/\d\d\b

//	var fullDate = /\b([012][1-9]|3[01])/(0[1-9]|1[012])/\d{4}\b/g
//	var halfDate = /\b([012][1-9]|3[01])/(0[1-9]|1[012])/\d{2}\b/g
//	var abbrDate = /\b[1-9]/[1-9]/\d\d\b/g

	return str.match(fullDate)
				.concat(str.match(halfDate))
					.concat(str.match(abbrDate))
}

function isOperation(thiscase)
{
	var Operation = false
	$.each( neuroSx, function(i, each) {
		if (thiscase.treatment.toLowerCase().indexOf(each) >= 0) {
			Operation = true
			return false
		}
		if (thiscase.treatment.toLowerCase().indexOf("op") >= 0) {
			Operation = true
			return false
		}
	})
	return Operation
}

function isReoperation(thiscase)
{
	if (thiscase.treatment.toLowerCase().indexOf("re-op") >= 0) {
		return true
	}
	if (thiscase.treatment.slashDateparse()) {
		return true
	}
}

function isReadmission(thiscase)
{
	if (thiscase.admission.toLowerCase().indexOf("re-ad") >= 0) {
		return true
	}
}

function isInfection(thiscase)
{
	if (thiscase.final.toLowerCase().indexOf("infect") >= 0) {
		return true
	}
}

function isMorbidity(thiscase)
{
	if (thiscase.final.toLowerCase().indexOf("morbid") >= 0) {
		return true
	}
}

function isDead(thiscase)
{
	if (thiscase.final.indexOf("Dead") >= 0) {
		return true
	}
}

function clickservice(clickedCell)
{
	savePreviousScell()
	storePresentScell(clickedCell)
}

function Skeyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = getEditTD()
	var thiscell

	if (!pointing) {
		return
	}

	if (keycode == 9)
	{
		savePreviousScell()
		if (event.shiftKey)
			thiscell = findPrevcell(event, SEDITABLE, pointing)
		else
			thiscell = findNextcell(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData("hide")
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
		thiscell = findNextRow(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData("hide")
			window.focus()
		}
		event.preventDefault()
		return false
	}
	else if (keycode == 27)
	{
		clearEditcellData("hide")
		window.focus()
		event.preventDefault()
		return false
	}
}

function savePreviousScell() 
{
	if (!getEditTD())
		return

	var content = ""
	switch($("#editcell").data("cellIndex"))
	{
		case CASE:
		case PATIENT:
			break
		case SDIAGNOSIS:
			content = getData()
			saveSContent("diagnosis", content)
			break
		case STREATMENT:
			content = getData()
			saveSContent("treatment", content)
			break
		case ADMISSION:
			content = getData()
			saveSContent("admission", content)
			break
		case FINAL:
			content = getData()
			saveSContent("final", content)
			break
		case ADMIT:
			content = $('#datepicker').val()
			if (content != $("#editcell").data("content")) {
				if (!content || !content.mysqlDateparse()) {
					content = null
				}
				saveSContent("admit", content)
			}
			$('#datepicker').hide()
			break
		case DISCHARGE:
			content = $('#datepicker').val()
			if (content != $("#editcell").data("content")) {
				if (!content || !content.mysqlDateparse()) {
					content = null
				}
				saveSContent("discharge", content)
			}
			$('#datepicker').hide()
			break
	}
}

function saveSContent(column, content)	//column name in MYSQL
{
	var rowcell = $($("#editcell").data("editRow")).children("td")
	var qn = rowcell.eq(SQN).html()
	var fromDate = $('#monthpicker').data('fromDate')
	var toDate = $('#monthpicker').data('toDate')

	if (content == $("#editcell").data("content")) {
		return
	}
	getEditTD().html(content)	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
		content = "'" + content + "'"
	}
	var sql = "sqlReturnData=UPDATE book SET "
	sql += column +" = "+ content
	sql += ", editor='"+ THISUSER
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
			getEditTD().html($("#editcell").data("content"))
			//return to previous content
		}
		else
		{
			var fromDate = $('#monthpicker').data('fromDate')
			var toDate = $('#monthpicker').data('toDate')
			var service = JSON.parse(response)

			showService(service, fromDate, toDate)
		}
	}
}

function storePresentScell(pointing)
{
	var cindex = pointing.cellIndex

	switch(cindex)
	{
		case CASE:
		case PATIENT:
			$('#datepicker').hide()
			$('#datepicker').datepicker( 'hide' )
			clearEditcellData("hide")
			break
		case SDIAGNOSIS:
		case STREATMENT:
		case ADMISSION:
		case FINAL:
			$('#datepicker').hide()
			$('#datepicker').datepicker( 'hide' )
			editcell(pointing)
			saveDataPoint("#editcell", pointing)
			break
		case ADMIT:
		case DISCHARGE:
			$('#editcell').hide()
			saveDataPoint("#editcell", pointing)
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
