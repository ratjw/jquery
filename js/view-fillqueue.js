function staffqueue(staffname)
{	//Display all cases of only one staff in dialog box
	var queuetbl = document.getElementById("queuetbl")
	var i, q
	var rowi = {}

	//delete previous queuetbl lest it accumulates
		$('#queuetbl tr').slice(1).remove()

	for (i=0,q=0; q < QWAIT.length; q++)
	{
		if (QWAIT[q].staffname == staffname)
		{
			rowi = makenextrowQueue(queuetbl, ++i)
			filldataQueue(QWAIT[q], $(rowi).children("td"))
		}
	}
	if (i==0)	//no patient in waiting list
	{
		rowi = makenextrowQueue(queuetbl, ++i)
		rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	}
	$("#container").html($("#queuetbl"));
	$("#container").dialog({
		title: staffname,
		height: window.innerHeight * 50 / 100,
		width: window.innerWidth * 70 / 100
	});
	$("#queuetbl").css("display", "block")
	$(".ui-dialog").css("display", "block")
	DragDropStaff()
}
//$("#container").parent().find('.ui-dialog-titlebar').click(function() {
//    alert("test");
//});
//$("#container").dialog('option', 'title', 'New Title');
function makenextrowQueue(table, i)
{	// i = the row to be made
	var cols = table.rows[0].cells.length
	var rowi
	var j = 0

	rowi = table.insertRow(i)
	table.rows[i].innerHTML = qdatatitle.innerHTML
	rowi.cells[QQN].style.display = "none"
	return rowi
}

function fillselectQueue(rowcell, waitnum, qn)	//seek the QWAIT row
{
	var q = 0
	if (waitnum)	//come from old queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].waitnum != waitnum))
			q++	
	else			//come from new queuetbl row
		while ((q < QWAIT.length) && (QWAIT[q].qn != qn))
			q++	

	filldataQueue(QWAIT[q], rowcell)
}

function filldataQueue(bookq, rowcell)		
{
	rowcell.eq(QSINCE).html(bookq.qsince? bookq.qsince.thDate() : "")
	rowcell.eq(QHN).html(bookq.hn)
	rowcell.eq(QNAME).html(bookq.patient)
	rowcell.eq(QAGE).html(bookq.dob? bookq.dob.getAge(bookq.qsince) : "")
	rowcell.eq(QDIAGNOSIS).html(bookq.diagnosis? bookq.diagnosis : "")
	rowcell.eq(QTREATMENT).html(bookq.treatment? bookq.treatment : "")
	rowcell.eq(QTEL).html(bookq.tel)
	rowcell.eq(QQN).html(bookq.qn)
}

function fillSetTableQueue(pointing, rindex)
{
	var table = document.getElementById("queuetbl")
	var rowmain = table.rows[rindex]
	var tcell = rowmain.cells
	var casename = tcell[QNAME].innerHTML
	var thisqqn = tcell[QQN].innerHTML
	var disabled = "ui-state-disabled"

	casename = casename.substring(0, casename.indexOf(' '))
	i = table.rows.length
	lastqqn = table.rows[i-1].cells[QQN].innerHTML

	$("#qitem1").html("เพิ่ม case")
	if (lastqqn)
		$("#qitem1").removeClass(disabled)
	else
		$("#qitem1").addClass(disabled)
	$("#qitem2").html("ลบ case " + casename)
	if (thisqqn)
		$("#qitem2").removeClass(disabled)
	else
		$("#qitem2").addClass(disabled)

	$("#queuemenu").menu({
		select: function( event, ui ) {
			var item = this.getAttribute("aria-activedescendant")
			switch(item)
			{
				case "qitem1":
					addnewrowQ()
					break
				case "qitem2":
					deletecaseQ(rowmain, thisqqn)
					break
			}
			$("#editcell").hide()
			$("#queuemenu").hide()
			event.stopPropagation()
			return false
		}
	});

	$("#queuemenu").insertAfter($("#queuetbl"))
	showupQueue(pointing, '#queuemenu')
}

function showupQueue(pointing, menuID)
{
	var pos = $(pointing).position();
	var height = pos.top + $(pointing).outerHeight()
	var width = pos.left  + $(pointing).outerWidth();

	$(menuID).css({
		position: "absolute",
		top: height + "px",
		left: width + "px",
		zIndex: 1000,
		modal:true,
		display: "block",
		boxShadow: "10px 20px 30px slategray"
	})
}

function addnewrowQ()
{
	var queuetbl = document.getElementById("queuetbl")

	rownum = $("#queuetbl tr").length	//always append to table end
	rowi = makenextrowQueue(queuetbl, rownum)
	rowi.cells[QSINCE].innerHTML = new Date().MysqlDate().thDate()
	DragDropStaff()
}

function deletecaseQ(rowmain, qn)
{
	var staffname = $( "#container" ).dialog( "option", "title" )
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL WHERE qn="+ qn +";"

	Ajax(MYSQLIPHP, sql, qcallbackdeleterow)

	function qcallbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") != -1)
			alert ("Delete & Refresh failed!\n" + response)
		else
			updateBOOK(response);
			$(rowmain).remove()
	}
}
