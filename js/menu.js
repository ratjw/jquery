
function mainMenu(pointing)
{
	var tableID = $(pointing).closest('table').attr('id')
	var rowi = $(pointing).closest('tr')[0]
	var tcell = rowi.cells
	var opdateth = tcell[OPDATE].innerHTML
	var opdate = getOpdate(opdateth)		//Thai to ISO date
	var staffname = tcell[STAFFNAME].innerHTML
	var hn = tcell[HN].innerHTML
	var qn = tcell[QN].innerHTML
	var consult = false
	var book = gv.BOOK
	if (ConsultsTbl(tableID)) {
		book = gv.CONSULT
		consult = true
	}

	disable(qn, "#addrow")

	disable((qn && staffname && (opdate !== LARGESTDATE)), "#postpone")

	disable(qn, "#changedate")

	disable(qn, "#equip")

	disable(qn, "#history")

	var unuse = (checkblank(book, opdate, qn))? true : false
	var del = (qn || unuse)? true : false
	disable(del, "#del")

	var $menu = $("#menu")
	$menu.menu({
		select: function( event, ui ) {

			var item = $(ui.item).attr("id")

			switch(item)
			{
				case "addrow":
					addnewrow(tableID, rowi, qn)
					break
				case "postpone":
					postpone(rowi, opdate, staffname, qn)
					break
				case "changedate":
					changeDate(tableID, opdate, staffname, qn, pointing)
					break
				case "equip":
					fillEquipTable(book, rowi, qn)
					break
				case "history":
					editHistory(rowi, qn)
					break
				case "del":
					deleteMenu(unuse, tableID, rowi, opdate, staffname, qn)
					break
				case "staffqueue":
					staffqueue(ui.item.text())
					break
				case "service":
					serviceReview()
					break
				case "deleted":
					deletedCases()
					break
				case "notdeleted":
					allCases()
					break
				case "search":
					find()
					break
				case "readme":
					readme()
					break
			}

			clearEditcell()
			$menu.hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $menu.outerWidth()
	var $container = $(pointing).closest('div')

	$menu.appendTo($container)
	reposition($menu, "left top", "left bottom", pointing, $container)
	menustyle($menu, pointing, width)
}


function disable(item, id)
{
	var disabled = "ui-state-disabled"
	if (item) {
		$(id).removeClass(disabled)
	} else {
		$(id).addClass(disabled)
	}
}

function menustyle($me, target, width)
{
	if ($me.position().top > $(target).position().top) {
		var shadow = '10px 20px 30px slategray'
	} else {
		var shadow = '10px -20px 30px slategray'
	}

	$me.css({
		width: width,
		boxShadow: shadow
	})
}

function decimalToTime(dec)
{
	var time = []
	var integer = Math.floor(dec)
	var decimal = dec - integer
	time[0] = (("" + integer).length === 1)? "0" + integer : "" + integer
	time[1] = decimal? String(decimal * 60) : "00"
	return time.join(".")
}

function checkblank(book, opdate, qn)
{	//Is this a blank row?
	//If blank, is there a case(s) in this date? 
	var q = 0

	if (qn) {
		return false	//No, this is not a blank row
	}
	//the following is a blank row
	while (opdate > book[q].opdate)	//find this opdate in book
	{
		q++
		if (q >= book.length) {			//not found
			return false	//beyond book, do not delete blank row
		}
	}
	if (opdate === book[q].opdate) {	//found
		return true	//there is a case(s) in this opdate, can delete blank row
	} else {
		return false	//No case in this opdate, do not delete blank row
	}
}

function addnewrow(tableID, rowi)
{
	if (tableID === "tbl") {
		$(rowi).clone()
			.insertAfter($(rowi))
				.find("td").eq(HN).removeClass("pacs")
				.parent().find("td").eq(NAME).removeClass("camera")
				.parent().find("td").eq(ROOMTIME)
					.nextAll()
						.html("")
	}
	else if (tableID === "queuetbl") {
		$(rowi).clone()
			.insertAfter($(rowi))
				.find("td").eq(HN).removeClass("pacs")
				.parent().find("td").eq(NAME).removeClass("camera")
				.parent().find("td").eq(STAFFNAME)
					.nextAll()
						.html("")
	}
}

function postpone(rowi, opdate, staffname, qn)
{
	var sql = "sqlReturnbook=UPDATE book SET opdate='" + LARGESTDATE
	sql += "', editor='" + gv.user
	sql += "' WHERE qn="+ qn + ";"

	Ajax(MYSQLIPHP, sql, callbackpostpone)

	function callbackpostpone(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			deleteRow(rowi, opdate)
			if (($("#queuewrapper").css('display') === 'block') && 
				($('#titlename').html() === staffname)) {
				//changeDate of this staffname's case
				refillstaffqueue()
			}
			scrolltoThisCase(qn)
		} else {
			alert ("postpone", response)
		}
	}
}

function changeDate(tableID, opdate, staffname, qn, pointing)
{
	var $mouseoverTR = $("#tbl tr, #queuetbl tr")
	var $pointing = $(pointing)

	$pointing.closest('tr').addClass("changeDate")
	$mouseoverTR.on({
		"mouseover": function() { $(this).addClass("pasteDate") },
		"mouseout": function() { $(this).removeClass("pasteDate") },
		"click": function(event) {
			event.stopPropagation()
			clearMouseoverTR()

			var thisDate = $(this).children("td").eq(OPDATE).html()
			thisDate = getOpdate(thisDate)
			//!thisDate = click on th
			if (!thisDate || (opdate === thisDate)) {
				return false
			}

			var RoomTime = getRoomTime($pointing.closest('tr'), $(this))
			var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisDate + "', "
			if (RoomTime) {
				sql += "oproom = '" + RoomTime[0] + "', "
				sql += "optime = '" + RoomTime[1] + "', "
			}
			sql += "editor = '" + gv.user + "' WHERE qn="+ qn + ";"

			Ajax(MYSQLIPHP, sql, callbackchangeDateClick)

			function callbackchangeDateClick(response)
			{
				if (/BOOK/.test(response)) {
					updateBOOK(response);
					refillOneDay(opdate)
					refillOneDay(thisDate)
					if (($("#queuewrapper").css('display') === 'block') && 
						($('#titlename').html() === staffname)) {
						//changeDate of this staffname's case
						refillstaffqueue()
					}
					scrolltoThisCase(qn)
				} else {
					alert ("changeDate", response)
				}
			}
		}
	});
	$(document).on("keydown", function(event) {
		var keycode = event.which || window.event.keyCode
		if (keycode === 27)	{
			clearMouseoverTR()
		}
	})
}

function clearMouseoverTR()
{
	var $mouseoverTR = $("#tbl tr, #queuetbl tr")
	$mouseoverTR.off("mouseover");
	$mouseoverTR.off("click");
	$mouseoverTR.off("mouseout");
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
	$(document).off("keydown")
}

//If moverow has roomtime, use that (moveRoom)
//If not, use roomtime of the row it moved to (thisRoom)
function getRoomTime($moverow, $thisrow)
{
	var moveRoom = $moverow.children("td").eq(ROOMTIME).html()
	moveRoom = moveRoom? moveRoom.split("<br>") : ""

	var thisRoom = $thisrow.children("td").eq(ROOMTIME).html()
	thisRoom = thisRoom? thisRoom.split("<br>") : ""

	if ((thisRoom.length) && (!moveRoom.length)) {
		return thisRoom
	}
	return ""
}

function deleteMenu(unuse, tableID, rowi, opdate, staffname, qn)
{
	//from add new row
	if (unuse) {
		$(rowi).remove()
	} else {
		deleteCase(tableID, rowi, opdate, staffname, qn)
	}
	showStaffImage(opdate, $(rowi).find('td')[STAFFNAME])
}

function deleteCase(tableID, rowi, opdate, staffname, qn)
{
	//not actually delete the case but set waitnum=NULL
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL, "
	sql += "editor = '" + gv.user + "' WHERE qn="+ qn + ";"

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (/BOOK/.test(response)) {
			updateBOOK(response)
			if (tableID === "tbl") {
				deleteRow(rowi, opdate)
				if (($("#queuewrapper").css('display') === 'block') && 
					($('#titlename').html() === staffname)) {
					refillstaffqueue()
				}
			} else {
				if ($('#titlename').html() === "Consults") {
					deleteRow(rowi, opdate)
				} else {
					$(rowi).remove()
				}
				refillOneDay(opdate)
			}
		} else {
			alert ("deleteCase", response)
		}
	}
}

function deleteRow(rowi, opdate)
{
	var prevDate = $(rowi).prev().children("td").eq(OPDATE).html()
	var nextDate = $(rowi).next().children("td").eq(OPDATE).html()

	prevDate = getOpdate(prevDate)
	nextDate = getOpdate(nextDate)

	if ((prevDate === opdate)
	|| (nextDate === opdate)
	|| $(rowi).closest("tr").is(":last-child")) {
		$(rowi).remove()
	} else {
		$(rowi).children("td").eq(OPDATE).siblings().html("")
		$(rowi).children("td").eq(HN).removeClass("pacs")
		$(rowi).children("td").eq(NAME).removeClass("camera")
	}
}

function splitPane()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	var width = screen.availWidth
	var height = screen.availHeight

	$("#queuewrapper").show()
	$("#tblwrapper").css({"float":"left", "height":"100%", "width":"50%"})
	$("#queuewrapper").css({"float":"right", "height":"100%", "width":"50%"})
	initResize($("#tblwrapper"))
	$('.ui-resizable-e').css('height', $("#tbl").css("height"))

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

function initResize($wrapper)
{
	$wrapper.resizable(
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
			var margin = divTwo.outerWidth() - divTwo.innerWidth()
			ui.element.css(
			{
				width: ui.element.outerWidth()/parent.width()*100+"%",
			});
			ui.element.next().css(
			{
				width: (remainSpace-margin)/parent.width()*100+"%",
			});
		}
	});
}

function closequeue()
{
	var scrolledTop = document.getElementById("tblcontainer").scrollTop
	var tohead = findVisibleHead('#tbl')
	
	$("#queuewrapper").hide()
	$("#tblwrapper").css({
		"height": "100%", "width": "100%"
	})

	fakeScrollAnimate("tblcontainer", "tbl", scrolledTop, tohead.offsetTop)
}

function fakeScrollAnimate(containerID, tableID, scrolledTop, offsetTop)
{
	var $container = $('#' + containerID)
	var $table = $('#' + tableID)
	var pixel = 300
	if ((scrolledTop > offsetTop) || (offsetTop < 300)) {
		pixel = -300
	}
	if ((offsetTop + $container.height()) < $table.height()) {
		$container.scrollTop(offsetTop - pixel)
		$container.animate({
			scrollTop: $container.scrollTop() + pixel
		}, 500);
	} else {
		$container.scrollTop(offsetTop)
	}	//table end
}

function findVisibleHead(table)
{
	var tohead

	$.each($(table + ' tr'), function(i, tr) {
		tohead = tr
		return ($(tohead).offset().top < 0)
	})
	return tohead
}
