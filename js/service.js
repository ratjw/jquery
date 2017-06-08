
function serviceReview()
{
	$('#monthpicker').show()
	$('#servicehead').hide()
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
	}).datepicker("setDate", new Date(new Date().getFullYear(), new Date().getMonth(), 1))

	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน : ',
		closeOnEscape: true,
		modal: true,
		width: window.innerWidth * 95 / 100,
		height: window.innerHeight * 95 / 100
	})
	$('.ui-datepicker').click(function() {
		if (!$('#monthpicker').is(":focus")) {	//click on month name
			entireMonth($('#monthpicking').val())
		} else {
			$('.ui-datepicker-calendar').css('display', 'none')
			//click on <prev next> month
			//display the month without date
		}
	})
	$('#monthpicker').click(function() { //setDate follows input box
		$('#monthpicker').datepicker(
			"setDate", $('#monthpicking').val()
						? new Date($('#monthpicking').val())
						: new Date()
		)
//		$('.ui-datepicker').show()
		$('.ui-datepicker-calendar').css('display', 'none')
	})
	$( "#monthpicker" ).datepicker('setDate', new Date($('#monthpicking').val()))
	$('.ui-datepicker-calendar').css('display', 'none')
	$('#servicetbl').hide()
	resetcountService()
	reposition('.ui-datepicker', 'left center', 'left center', $('#monthpicker'))
}

function entireMonth(fromDate)
{
	var from = new Date(fromDate)
	var toDate = new Date(from.getFullYear(), from.getMonth()+1, 0)
	toDate = $.datepicker.formatDate('yy-mm-dd', toDate);	//end of this month
	$('#dialogService input[type=button]').hide()
	$('#monthpicker').data({
		fromDate: fromDate,
		toDate: toDate
	})

	var SERVICE = getfromBOOK(fromDate, toDate)
	showService(SERVICE, fromDate, toDate)
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

function showService(SERVICE, fromDate, toDate)
{
	resetcountService()

	//delete previous servicetbl lest it accumulates
	$('#servicetbl tr').slice(1).remove()
	$('#servicetbl').show()

	$.each( STAFF, function() {
		var staffname = this
		$('#servicerowcell tr').clone()
			.insertAfter($('#servicetbl tr:last'))
				.children("td").eq(OPDATE)
					.prop("colSpan", 8)
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
				$('#servicerowcell tr').clone()
					.insertAfter($('#servicetbl tr:last'))
						.filldataService(this, scase, color)
			}
		});
	})

	$('#monthpicker').hide()
	$('#monthpicker').datepicker( "hide" )
	$('#servicehead').show()
//	$('.ui-datepicker').off("click")
	$('#dialogService').dialog({
		title: 'Service Neurosurgery เดือน : ' + $('#monthpicker').val(),
		close: function() {
			$('#datepicker').hide()
		}
	})
	getAdmitDischargeDate(SERVICE, fromDate, toDate)
}

function refillService(SERVICE, fromDate, toDate)
{
	resetcountService()

	var i = 0
	$.each( STAFF, function() {
		var staffname = this
		i++
		var $thisCase = $('#servicetbl tr').eq(i).children("td").eq(CASE)
		if ($thisCase.prop("colSpan") == 1) {
			$thisCase.prop("colSpan", 8)
				.css({
					height: "40",
					fontWeight: "bold",
					fontSize: "14px",
					textAlign: "left",
					paddingLeft: "10px"
				})
				.siblings().hide()
		}
		$thisCase.html(staffname)

		var scase = 0
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				var color = countService(this, fromDate, toDate)
				i++
				scase++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				if ($thisRow.eq(CASE).prop("colSpan") > 1) {
					$thisRow.eq(CASE).prop("colSpan", 1)
						.nextUntil($thisRow.eq(SQN)).show()
				}
				$('#servicetbl tr').eq(i)
						.filldataService(this, scase, color)
			}
		});
	})
	if (i < ($('#servicetbl tr').length - 1))
		$('#servicetbl tr').slice(i+1).remove()
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

function getAdmitDischargeDate(SERVICE, fromDate, toDate)
{
	Ajax(GETIPD, "from=" + fromDate + "&to=" + toDate, callbackgetipd)

	function callbackgetipd(response)
	{
		if (!response) {
			return
		}
		if (response.indexOf("{") == -1) {
			alert("getAdmitDischargeDate", response)
		} else {
			updateBOOK(response)
			var SERVICE = getfromBOOK(fromDate, toDate)
			fillAdmitDischargeDate(SERVICE)
		}
	}
}

function fillAdmitDischargeDate(SERVICE)
{
	var i = 0
	$.each( STAFF, function() {
		var staffname = this
		i++
		$.each( SERVICE, function() {
			if (this.staffname == staffname) {
				i++
				var $thisRow = $('#servicetbl tr').eq(i).children("td")
				$thisRow.eq(ADMIT).html(this.admit)
				$thisRow.eq(DISCHARGE).html(this.discharge)
			}
		});
	})
}

function clickservice(clickedCell)
{
	savePreviouscellService()
	storePresentScell(clickedCell)
}

function Skeyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = $("#editcell").data("pointing")
	var thiscell

	if (keycode == 27) {
		clearEditcellData()
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode == 9) {
		savePreviouscellService()
		if (event.shiftKey)
			thiscell = findPrevcell(event, SEDITABLE, pointing)
		else
			thiscell = findNextcell(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode == 13) {
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscellService()
		thiscell = findNextRow(event, SEDITABLE, pointing)
		if (thiscell) {
			storePresentScell(thiscell)
		} else {
			clearEditcellData()
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviouscellService()
{
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (editPoint.innerHTML != getEditcellHtml())) {
		saveEditPointDataService(editPoint)
	}
}

function saveEditPointDataService(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case CASE:
		case PATIENT:
			break
		case SDIAGNOSIS:
			content = getEditcellHtml()
			saveSContent(pointed, "diagnosis", content)
			break
		case STREATMENT:
			content = getEditcellHtml()
			saveSContent(pointed, "treatment", content)
			break
		case ADMISSION:
			content = getEditcellHtml()
			saveSContent(pointed, "admission", content)
			break
		case FINAL:
			content = getEditcellHtml()
			saveSContent(pointed, "final", content)
			break
		case ADMIT:
		case DISCHARGE:
			break
	}
}

function saveSContent(pointed, column, content)	//column name in MYSQL
{
	var rowmain = $(pointed).closest('tr')[0]
	var qn = rowmain.cells[SQN].innerHTML
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content? content : ''	//just for show instantly

	if (content) {
		content = URIcomponent(content)	//take care of white space, double qoute, 
										//single qoute, and back slash
	}
	var sql = "sqlReturnbook=UPDATE book SET "
		sql += column +" = '"+ content
		sql += "', editor='"+ THISUSER
		sql += "' WHERE qn = "+ qn +";"

	Ajax(MYSQLIPHP, sql, callbacksaveSContent);

	function callbacksaveSContent(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("saveSContent", response)
			pointed.innerHTML = oldContent		//return to previous content
		} else {
			updateBOOK(response)

			var fromDate = $('#monthpicker').data('fromDate')
			var toDate = $('#monthpicker').data('toDate')
			var bookq = BOOK[findBOOKrow(qn)]

			rowmain.className = countService(bookq, fromDate, toDate)

			//Not refill because it may make next editTD return to old value when fast entry
			//due to slow return from Ajax of previous input
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
			clearEditcellData()
			var hn = pointing.innerHTML
			hn = hn.match(/\d{7}/)[0]
			PACS(hn)
			break
		case SDIAGNOSIS:
		case STREATMENT:
		case ADMISSION:
		case FINAL:
			createEditcell(pointing)
			break
		case ADMIT:
		case DISCHARGE:
			clearEditcellData()
			break
	}
}
