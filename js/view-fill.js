
function fillupstart()		
{	//Display all cases in each day of 5 weeks
	if (BOOK.length == 0)
		BOOK.push({"opdate" : getSunday()})

	var start = new Date()
	start = new Date(start.getFullYear(), start.getMonth()-3).mysqlDate()
	start = getSunday(start)

	fillall(start)

	//scroll to today
	var today = new Date().mysqlDate().thDate()
	var thishead = $("tr:contains(" + today + ")").eq(0).prevAll(":has(th)").first()
	$('html, body').animate({
		scrollTop: thishead.offset().top
	}, 300);
	DragDrop()
}

function fillall(start)
{
	var table = document.getElementById("tbl")
	var i = k = q = 0
	var rowi = {}
	var date = ""
	var madedate

	date = start
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//delete previous queuetbl lest it accumulates
	$('#tbl tr').slice(1).remove()

	//i for rows in table
	//q for rows in BOOK
	for (q; q < BOOK.length; q++)
	{	
		while (date < BOOK[q].opdate)
		{	//step over each day that is not in QBOOK
			if (date != madedate)
			{
				//make a blank row for matched opday which is not already in the table
				i++
				rowi = makenextrow(table.insertRow(i), date)	//insertRow
				
				madedate = date
			}
			date = date.nextdays(1)
			//make table head row before every Sunday
			if ((new Date(date).getDay())%7 == 0)
			{
				var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
				rowi.parentNode.appendChild(clone, rowi)
 				i++
			}
		}
		i++
		rowi = makenextrow(table.insertRow(i), date)	//insertRow
		filldata(BOOK[q], rowi)
		madedate = date
	}
	//fill until 1 year from now
	var nextyear = new Date().getFullYear() + 1
	var month = new Date().getMonth()
	var todate = new Date().getDate()
	var until = (new Date(nextyear, month, todate)).mysqlDate()

	date = date.nextdays(1)
	while (date < until)
	{
		//make a blank row
		i++
		rowi = makenextrow(table.insertRow(i), date)	//insertRow
		
		date = date.nextdays(1)
		//make table head row before every Sunday
		if (((new Date(date)).getDay())%7 == 0)
		{
			var clone = table.getElementsByTagName("TR")[0].cloneNode(true)
			rowi.parentNode.appendChild(clone, rowi)
			i++
		}
	}
}

function refillall()
{
	var table = document.getElementById("tbl")
	var rowi = {}
	var date = ""
	var madedate
	var start = $('#tbl > tbody > tr:not(:has("th")):first > td').eq(OPDATE).html().numDate()
	var tlength = $('#tbl > tbody > tr').length

	date = start	//find this row in BOOK

	//q for rows in BOOK
	var q = 0
	while ((q < BOOK.length) && (BOOK[q].opdate < start)) {
		q++
	}	

	//i for rows in table with head as the first row
	var i = 1
	while (i < tlength)
	{
		if (q < BOOK.length) {
			while (date < BOOK[q].opdate)
			{	//step over each day that is not in QBOOK
				if (date != madedate)
				{
					//make a blank row for matched opday which is not already in the table
					rowi = makenextrow(table.rows[i], date)	//existing row
					i++
					if (i >= tlength)
						return
					
					madedate = date
				}
				date = date.nextdays(1)
				//make table head row before every Sunday
				if ((new Date(date).getDay())%7 == 0)
				{
					table.rows[i].innerHTML = table.getElementsByTagName("TR")[0].innerHTML
					i++
					if (i >= tlength)
						return
				}
			}
			rowi = makenextrow(table.rows[i], date)	//existing row
			filldata(BOOK[q], rowi)
			madedate = date
			i++
			q++
		}
		else
		{
			date = date.nextdays(1)

			//make table head row before every Sunday
			if (((new Date(date)).getDay())%7 == 0)
			{
				table.rows[i].innerHTML = $('#tbl tr:first').html()
				i++
				if (i >= tlength)
					return
			}

			//make a blank row
			rowi = makenextrow(table.rows[i], date)	//existing row
			i++
		}
	}
}

function makenextrow(rowi, date)
{
	var datatitle = document.getElementById("datatitle")

	rowi.innerHTML = datatitle.innerHTML
	rowi.cells[OPDATE].innerHTML = date.thDate()
	rowi.cells[OPDATE].className = NAMEOFDAYABBR[(new Date(date)).getDay()]
	rowi.className = NAMEOFDAYFULL[(new Date(date)).getDay()]
	rowi.style.backgroundImage = holiday(date)
	return rowi
}

function filldata(bookq, rowi)		//bookq = BOOK[q]
{
	rowi.cells[STAFFNAME].innerHTML = bookq.staffname
	rowi.cells[HN].innerHTML = bookq.hn
	rowi.cells[NAME].innerHTML = bookq.patient
	rowi.cells[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
	rowi.cells[DIAGNOSIS].innerHTML = bookq.diagnosis
	rowi.cells[TREATMENT].innerHTML = bookq.treatment
	rowi.cells[TEL].innerHTML = bookq.tel
	rowi.cells[QN].innerHTML = bookq.qn
}

function staffqueue(staffname)
{
	var todate = new Date().mysqlDate()
	var i = q = 0
	var scrolled = $("#queuecontainer").scrollTop()

	$('#titlename').html(staffname)
	
	//delete previous queuetbl lest it accumulates
	$('#queuetbl tr').slice(1).remove()

	$.each( BOOK, function() {	// each == this
		if (( this.staffname == staffname ) && this.opdate >= todate) {
			$('#qdatatitle tr').clone()
				.insertAfter($('#queuetbl tr:last'))
					.filldataQueue(this)
		}
	});

	$("#queuecontainer").scrollTop(scrolled)

	DragDropStaff()
}

jQuery.fn.extend({
	filldataQueue : function(bookq) {
		var rowcell = this[0].cells
		rowcell[OPDATE].innerHTML = bookq.opdate.thDate()
		rowcell[SINCE].innerHTML = bookq.qsince.thDate().slice(0,-4)
		rowcell[STAFFNAME].innerHTML = bookq.staffname
		rowcell[HN].innerHTML = bookq.hn
		rowcell[NAME].innerHTML = bookq.patient
		rowcell[AGE].innerHTML = bookq.dob? bookq.dob.getAge(bookq.opdate) : ""
		rowcell[DIAGNOSIS].innerHTML = bookq.diagnosis
		rowcell[TREATMENT].innerHTML = bookq.treatment
		rowcell[TEL].innerHTML = bookq.tel
		rowcell[QN].innerHTML = bookq.qn
	}
})

function addnewrow(rowmain)
{
	if (rowmain.cells[QN].innerHTML)	//not empty
	{
		var clone = rowmain.cloneNode(true)

		rowmain.parentNode.insertBefore(clone,rowmain)
		for (i=1; i<rowmain.cells.length; i++)
			rowmain.cells[i].innerHTML = ""	
		DragDrop()
	}
}

function deleteCase(rowmain, opdate, qn)
{
	$('#delete').show()
	$('#delete').position( {
		my: "left center",
		at: "left center",
		of: $(rowmain)
	})

	doDelete = function() 
	{
		//not actually delete the case but set waitnum=NULL
		var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL WHERE qn="+ qn +";"

		Ajax(MYSQLIPHP, sql, callbackdeleterow)

		function callbackdeleterow(response)
		{
			if (!response || response.indexOf("DBfailed") != -1)
				alert ("Delete & Refresh failed!\n" + response)
			else
			{
				updateBOOK(response);
				deleteRow(rowmain, opdate)
			}
		}
		$('#delete').hide()
	}
}

function closeDel() 
{
	$('#delete').hide()
}

function deleteRow(rowmain, opdate)
{
	var prevDate = $(rowmain).prev().children().eq(OPDATE).html()
	var nextDate = $(rowmain).next().children().eq(OPDATE).html()

	if (prevDate)	//avoid "undefined" error message
		prevDate = prevDate.numDate()

	if (nextDate)
		nextDate = nextDate.numDate()

	if ((prevDate == opdate) ||
		(nextDate == opdate))
	{
		$(rowmain).remove()
	} else {
		$(rowmain).children().eq(OPDATE).siblings().html("")
	}
}

function editcell(pointing)
{
	var editcell = "#editcell"
	saveDataPoint(editcell, pointing)
	positioning(editcell, pointing)
	$(editcell).show()
	$(editcell).focus()
}

function saveDataPoint(editcell, pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowIndex = $(pointing).closest('tr').index()
	var cellIndex = $(pointing).index()

	$(editcell).data("location", "#"+ tableID +" tr:eq("+ rowIndex +") td:eq("+ cellIndex +")")
	$(editcell).data("tableRow", "#"+ tableID +" tr:eq("+ rowIndex +")")
	$(editcell).data("tableID", tableID)
	$(editcell).data("rowIndex", rowIndex)
	$(editcell).data("cellIndex", cellIndex)
	$(editcell).html($(pointing).html())
}

function positioning(editcell, pointing)
{
	var pos = $(pointing).position()

	$(editcell).css({
		top: pos.top + "px",
		left: pos.left + "px",
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize"),
	})
}

function SplitPane()
{
	var tohead = findVisibleHead('#tbl')

	$("html, body").css( {
		height: "100%",
		overflow: "hidden",
		margin: "0"
	})
	$("#queuecontainer").show()
	$("#tblcontainer").css("width", "60%")
	$("#queuecontainer").css("width", "40%")
	initResize("#tblcontainer")
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	scrollto('#tblcontainer', tohead, 300, 500)
	DragDrop()
}

function closequeue()
{
	var tohead = findVisibleHead('#tbl')
	
	$("html, body").css( {
		height: "",
		overflow: "",
		margin: ""
	})
	$("#tblcontainer").css("width", "100%")
	$("#queuecontainer").css("width", "0%")
	$("#queuecontainer").hide()
	$("#tblcontainer").resizable('destroy');

	scrollto('html, body', tohead, 300, 500)
	DragDrop()
}

function findVisibleHead(table)
{
	var tohead
	var topscroll = $('html, body').scrollTop()

	$.each($(table + ' tr:has(th)'), function() {
		tohead = this
		return ($(this).offset().top < topscroll)
	})
	return tohead
}

function scrollto(container, tohead, pixel, time)
{
	$(container).scrollTop($(tohead).offset().top - pixel)
	$(container).animate({
		scrollTop: $(container).scrollTop() + pixel
	}, time);
}

function initResize(id)
{
	$(id).resizable(
	{
		autoHide: true,
		handles: 'e',
		resize: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			var divTwoWidth = (remainSpace-margin)/parent.width()*100+"%";
			divTwo.css("width", divTwoWidth);
		},
		stop: function(e, ui) 
		{
			var parent = ui.element.parent();
			var remainSpace = parent.width() - ui.element.outerWidth()
			var divTwo = ui.element.next()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: remainSpace/parent.width()*100+"%",
			});
		}
	});
}
