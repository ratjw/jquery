function clicktable(clickedCell)
{
	savePreviouscell()
	storePresentcell(clickedCell)
}

function keyin(event)
{
	var keycode = event.which || window.event.keyCode
	var pointing = $("#editcell").data("pointing")
	var thiscell

	if (keycode == 27)	{
		$('#menu').hide();
		$('#stafflist').hide();
		clearEditcellData("hide")
		window.focus()
		event.preventDefault()
		return false
	}
	if (!pointing) {
		return
	}
	if (keycode == 9) {
		$('#menu').hide();
		$('#stafflist').hide();
		savePreviouscell()
		if (event.shiftKey) {
			thiscell = findPrevcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findPrevcell(event, EDITABLE, $(thiscell))
			}
		} else {
			thiscell = findNextcell(event, EDITABLE, pointing)
			if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
				thiscell = findNextcell(event, EDITABLE, $(thiscell))
			}
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData("hide")
			window.focus()
		}
		event.preventDefault()
		return false
	}
	if (keycode == 13) {
		$('#menu').hide();
		$('#stafflist').hide();
		if (event.shiftKey || event.ctrlKey) {
			return
		}
		savePreviouscell()
		thiscell = findNextRow(event, EDITABLE, pointing)
		if ((thiscell.cellIndex == HN) && (thiscell.innerHTML != "")) {
			thiscell = findNextcell(event, EDITABLE, $(thiscell))
		}
		if (thiscell) {
			storePresentcell(thiscell)
		} else {
			clearEditcellData("hide")
			window.focus()
		}
		event.preventDefault()
		return false
	}
}

function savePreviouscell() 
{
	var editPoint = $("#editcell").data("pointing")
	if (editPoint && (editPoint.innerHTML != getEditcellHtml())) {
		saveEditPointData(editPoint)
	}
}

function saveEditPointData(pointed)
{
	var content = ""
	switch(pointed.cellIndex)
	{
		case OPDATE:
			break
		case STAFFNAME:
			content = getEditcellHtml()
			saveContent(pointed, "staffname", content)
			break
		case HN:
			content = getEditcellHtml()
			if (content.length != 7) {
				return
			}
			saveHNinput(pointed, "hn", content)
			break
		case NAME:
		case AGE:
			break
		case DIAGNOSIS:
			content = getEditcellHtml()
			saveContent(pointed, "diagnosis", content)
			break
		case TREATMENT:
			content = getEditcellHtml()
			saveContent(pointed, "treatment", content)
			break
		case CONTACT:
			content = getEditcellHtml()
			saveContent(pointed, "contact", content)
			break
	}
}
 
function getEditcellHtml()
{
	return $("#editcell").html()
			.replace(TRIMHTML, '')
			.replace(HTMLNOTBR, '')
}

function saveContent(pointed, column, content)	//column name in MYSQL
{
	var $row = $(pointed).closest('tr')
	var $rowcell = $row.children("td")
	var opdate = getOpdate($rowcell.eq(OPDATE).html())
	var qn = $rowcell.eq(QN).html()
	var oldContent = pointed.innerHTML
	var sql

	pointed.innerHTML = content	//just for show instantly
	var staffname = $rowcell.eq(STAFFNAME).html()

	if (content) {
		 content = URIcomponent(content)	//take care of white space, double qoute, 
	}										//single qoute, and back slash
	if (column == "staffname") {
		var waitnum = calculateWaitnum($row, opdate)
		$row[0].title = waitnum
		if (qn) {
			sql = "sqlReturnbook=UPDATE book SET "
			sql += "waitnum = "+ waitnum + ", "
			sql += column +" = '"+ content
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn = "+ qn +";"
		} else {
			sql = "sqlReturnbook=INSERT INTO book ("
			sql += "waitnum, opdate, "+ column +", editor) VALUES ("
			sql += waitnum + ", '" + opdate +"', '"+ content +"', '"+ THISUSER +"');"
		}
	} else {
		if (qn) {
			sql = "sqlReturnbook=UPDATE book SET "
			sql += column +" = '"+ content
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn = "+ qn +";"
		} else {
			sql = "sqlReturnbook=INSERT INTO book ("
			sql += "opdate, "+ column +", editor) VALUES ('"
			sql += opdate +"', '"+ content +"', '"+ THISUSER +"');"
		}
	}

	Ajax(MYSQLIPHP, sql, callbacksaveContent);

	var tableID = $(pointed).closest("table").attr("id")
	var cellindex = pointed.cellIndex

	function callbacksaveContent(response)
	{
 		if (!response || response.indexOf("DBfailed") != -1)
		{
			alert("saveContent", response)
			pointed.innerHTML = oldContent
			//return to previous content
		}
		else
		{
			updateBOOK(response);
			if (!qn) {	//New case input
				var NewRow = findNewRowBOOK(opdate)
				$rowcell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {
				if ($("#titlecontainer").css('display') == 'block') {
					if ((column == "staffname")
					&& ($('#titlename').html() == pointed.innerHTML)) {
						refillstaffqueue()		//New case or change staffname from tbl
					} else {
						if ($('#titlename').html() == staffname) {
							refillanother('queuetbl', cellindex, qn)
						}
					}
				}
			} else {
				if (qn) {
					refillanother('tbl', cellindex, qn)
				} else {
					refillall()		//New case input from queuetbl
				}
			}
		}
	}
}

function saveHNinput(pointed, hn, content)
{
	var $row = $(pointed).closest('tr')
	var $rowcell = $row.children("td")
	var opdate = getOpdate($rowcell.eq(OPDATE).html())
	var staffname = $rowcell.eq(STAFFNAME).html()
	var patient = $rowcell.eq(NAME).html()
	var qn = $rowcell.eq(QN).html()
	var oldContent = pointed.innerHTML

	pointed.innerHTML = content

	var sql = "hn=" + content
	sql += "&opdate="+ opdate
	sql += "&qn="+ qn
	sql += "&username="+ THISUSER

	Ajax(GETNAMEHN, sql, callbackgetByHN)

	var tableID = $(pointed).closest("table").attr("id")
	var cellindex = pointed.cellIndex

	function callbackgetByHN(response)
	{
		if ((!response) || (response.indexOf("patient") == -1) || (response.indexOf("{") == -1)) 
		{
			alert("saveHNinput", response)
			pointed.innerHTML = oldContent		//return to previous content
		}
		else 
		{
			updateBOOK(response)

			var NewRow = findNewRowBOOK(opdate)
			var bookq = BOOK[NewRow]
			$rowcell.eq(NAME).html(bookq.patient)
			$rowcell.eq(AGE).html(putAgeOpdate(bookq.dob, bookq.opdate))
			if (!qn) {	//New case input
				$rowcell.eq(QN).html(BOOK[NewRow].qn)
			}

			if (tableID == 'tbl') {	//New case has no staffname
				if (($("#titlecontainer").css('display') == 'block') && 
					($('#titlename').html() == staffname)) {

					refillanother('queuetbl', cellindex, qn)
				}
			} else {	//New case row was already in tbl
				refillanother('tbl', cellindex, qn)
			}
		}
	}
}

function storePresentcell(pointing)
{
	createEditcell(pointing)

	switch(pointing.cellIndex)
	{
		case OPDATE:
			clearEditcellData()
			var context = ""
			//to show Thai name of day in editcell div
			if ($(pointing).closest('table').attr('id') == 'tbl') {
				context = window.getComputedStyle(pointing,':before').content
				context = context.replace(/\"/g, "")
			}
			context = context + pointing.innerHTML
			$("#editcell").html(context)
			fillSetTable(pointing)
			break
		case STAFFNAME:
			saveEditcellData(pointing)
			stafflist(pointing)
			break
		case HN:
			if (!pointing.innerHTML) {
				saveEditcellData(pointing)
				break
			}
		case NAME:
		case AGE:
			clearEditcellData("hide")
			break
		case DIAGNOSIS:
		case TREATMENT:
		case CONTACT:
			saveEditcellData(pointing)
			break
	}
}

function createEditcell(pointing)
{
	var $editcell = $("#editcell")
	$editcell.css({
		height: $(pointing).height() + "px",
		width: $(pointing).width() + "px",
		fontSize: $(pointing).css("fontSize")
	})

	$editcell.appendTo($(pointing).closest('div'))
	reposition("#editcell", "center", "center", pointing)
	$editcell.focus()
}

function reposition(me, mypos, atpos, target)
{
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
	$(me).position({
		my: mypos,
		at: atpos,
		of: target
	}).show()
}	//Don't know why have to repeat 2 times

function saveEditcellData(pointing)
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", pointing)
	$editcell.html(pointing.innerHTML)
}	//the data is normal HTML, not jQuery

function clearEditcellData(display)
{
	var $editcell = $("#editcell")
	$editcell.data("pointing", "")
	$editcell.html("")
	if (display == "hide") {
		$editcell.hide()
	}
}
