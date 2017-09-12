
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
	var book = getBOOK()
	if ((tableID === "queuetbl") && ($('#titlename').html() === "Consults")) {
		book = getCONSULT()
		consult = true
	}

	disable(qn, "#addrow")

	//No noOpdate() in consults cases
	var addnodate = (tableID === "queuetbl")?
						((consult)? false : true )
							: false
	disable(addnodate, "#addnodate")

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
				case "addnodate":
					noOpdate()
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
					if (unuse) {		//from add new row
						$(rowi).remove()
					} else {
						deleteCase(tableID, rowi, opdate, staffname, qn)
					}
					break
				case "staffqueue":
					staffqueue(ui.item.text())
					if ($("#queuewrapper").css("display") !== "block")
						splitPane()
					break
				case "service":
					serviceReview()
					break
				case "deleted":
					deletedCases()
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

function stafflist(pointing)
{
	var $stafflist = $("#stafflist")
	$stafflist.menu({
		select: function( event, ui ) {
			var staffname = ui.item.text()
			saveContent(pointing, "staffname", staffname)
			$(pointing).html(staffname)
			clearEditcell()
			$stafflist.hide()		//to disappear after selection
			event.stopPropagation()
		}
	});

	var width = $stafflist.outerWidth()

	$stafflist.appendTo($(pointing).closest('div'))
	reposition($stafflist, "left top", "left bottom", pointing)
	menustyle($stafflist, pointing, width)
	reposition($stafflist, "left top", "left bottom", pointing)
	//To make it show on first click
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

function getRoomTime(pointing)
{
	const ORSURG 		= "XSU";
	const ORNEURO 		= "4"
	const ORTIME 		= "09.00"
	var roomtime = pointing.innerHTML
	roomtime = roomtime? roomtime.split("<br>") : ""
	var oproom = roomtime[0]? roomtime[0] : ""
	var optime = roomtime[1]? roomtime[1] : ""
	var theatre = (oproom && oproom.match(/\D+/))? oproom.match(/\D+/)[0] : ORSURG
	var $editcell = $("#editcell")
	$editcell.css("height", "")
	$editcell.html(theatre)
	$editcell.append('<input id="orroom"><br><input id="ortime">')
	var $orroom = $("#orroom")
	var $ortime = $("#ortime")
	$orroom.val(oproom? oproom.match(/\d+/)[0] : "(" + ORNEURO + ")")

	var orroom = ""
	$orroom.spinner({
		min: 1,
		max: 20,
		step: -1,
		spin: function( event, ui ) {
			if ($orroom.val() === "(" + ORNEURO + ")") {
				orroom = ORNEURO
			}
		},
		stop: function( event, ui ) {
			if (orroom) {
				$orroom.val(orroom)
				orroom = ""	
			}
		}
	});

	var ortime
	$ortime.spinner({
		min: 00,
		max: 24,
		step: -0.5,
		create: function( event, ui ) {
			$ortime.val(optime? optime : "(" + ORTIME + ")")
		},
		spin: function( event, ui ) {
			if ($ortime.val() === "(" + ORTIME + ")") {
				ortime = ORTIME
			} else {
				ortime = decimalToTime(ui.value)
			}
		},
		stop: function( event, ui ) {
			if (ortime) {
				$ortime.val(ortime)
				ortime = ""	
			}
		}
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

function timeToDecimal(time)
{
	var integer = Math.floor(time);
	time = (time - integer) * 100 / 60;
	return integer + time;
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

function noOpdate()
{
	//must use jQuery in order to be recognized
	$("#queuetbl tr:last").clone()
							.appendTo($("#queuetbl tbody"))
								.children("td").html("")

	//change pointing to STAFFNAME
	var staffname = $('#titlename').html()
	var pointing = $("#queuetbl tr:last td")[STAFFNAME]
	var $addedRow = $("#queuetbl tr:last")
	saveContent(pointing, "staffname", staffname)
	addColor($addedRow, LARGESTDATE)

	var $queuecontainer = $("#queuecontainer")
	var queue = $("#queuetbl").height()
	var container = $queuecontainer.height()
	var scrolltop = $queuecontainer.scrollTop()
	var toscroll = queue - container + scrolltop
	$queuecontainer.animate({
		scrollTop: toscroll + 300
	}, 500);
}

function changeDate(tableID, opdate, staffname, qn, pointing)
{
	var $trNOth = $("#tbl tr:not(:has(th)), #queuetbl tr:not(:has(th))")
	var $datepicker = $('#datepickertbl')
	var $container
	if (tableID === "tbl") {
		$datepicker = $('#datepickertbl')
		$container = $('#tblcontainer')
	}
	else if (tableID === "queuetbl") {
		$datepicker = $('#datepickerqueuetbl')
		$container = $('#queuecontainer')
	}
	$container.css("position", "relative")
	$datepicker.css({
		height: $(pointing).height(),
		width: $(pointing).width()
	})
	reposition($datepicker, "center", "center", pointing)	//position the input

	var $widget = $datepicker.datepicker( 'widget' )
	$datepicker.datepicker( {
		dateFormat: "yy-mm-dd",
		minDate: "-2m",
		maxDate: "+1y",
		showButtonPanel: true,
		closeText : "No Date",
		beforeShow: function(input, obj) {
			$datepicker.after($widget);
		},
		onClose: function (datepicker, obj) {
			function isDonePressed() {	//copy from stackoverflow
				var classes = 'ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all ui-state-hover'
				return ($('#ui-datepicker-div').html().indexOf(classes) > -1);    
			}
			//use Done button as LARGESTDATE
			if (isDonePressed()) {
				if (staffname) {
					datepicker = LARGESTDATE
				}
			}
			//onClose can be triggered by click outside calendar
			//and execute before $trNOth.on("click");
			if ($(".pasteDate").length || opdate === datepicker) {
				return false
			}//give way to $trNOth.on("click") function

			clearDatepickerMouseover($container, $trNOth, $datepicker)
			var sql = "sqlReturnbook=UPDATE book SET opdate='" + datepicker + "', "
			sql += "editor = '" + getUser() + "' WHERE qn="+ qn + ";"

			Ajax(MYSQLIPHP, sql, callbackchangeDatepicker)

			function callbackchangeDatepicker(response)
			{
				if (!response || response.indexOf("DBfailed") !== -1) {
					alert ("changeDate", response)
				} else {
					updateBOOK(response);
					refillOneDay(opdate)
					refillOneDay(datepicker)
					if (($("#queuewrapper").css('display') === 'block') && 
						($('#titlename').html() === staffname)) {
						//changeDate of this staffname's case
						refillstaffqueue()
					}
					scrolltoThisCase(qn)
				}
			}
		}
	})
	$datepicker.datepicker("setDate", new Date(opdate))
	$datepicker.datepicker( 'show' )
	$widget.css("fontSize", "10px")
	reposition($widget, "left top", "left bottom", pointing)	//position the calendar

	$(pointing).closest('tr').addClass("changeDate")
	$trNOth.on({
		"mouseover": function() { $(this).addClass("pasteDate"); },
		"click": function(event) {
			event.stopPropagation()
			clearDatepickerMouseover($container, $trNOth, $datepicker)
			var thisDate = $(this).children("td").eq(OPDATE).html()
			thisDate = getOpdate(thisDate)
			if (opdate === thisDate) {
				return false
			}
			//If moverow has roomtime, use that
			//If not, use roomtime of the row that moved to
			var RoomTime = calculateRoomTime($(pointing).closest('tr'), $(this))

			var sql = "sqlReturnbook=UPDATE book SET opdate='" + thisDate + "', "
			if (RoomTime) {
				sql += "oproom = '" + RoomTime[0] + "', "
				sql += "optime = '" + RoomTime[1] + "', "
			}
			sql += "editor = '" + getUser() + "' WHERE qn="+ qn + ";"

			Ajax(MYSQLIPHP, sql, callbackchangeDateClick)

			function callbackchangeDateClick(response)
			{
				if (!response || response.indexOf("DBfailed") !== -1) {
					alert ("changeDate", response)
				} else {
					updateBOOK(response);
					refillOneDay(opdate)
					refillOneDay(thisDate)
					if (($("#queuewrapper").css('display') === 'block') && 
						($('#titlename').html() === staffname)) {
						//changeDate of this staffname's case
						refillstaffqueue()
					}
					scrolltoThisCase(qn)
				}
			}
		}
	});
	$trNOth.on("mouseout", function() { $(this).removeClass("pasteDate"); }); 
}

function clearDatepickerMouseover($container, $trNOth, $datepicker)
{
	$container.css("position", "")
	$("body").append($datepicker.datepicker("widget"));
	$datepicker.datepicker('widget').css("fontSize", "")
	$datepicker.datepicker("destroy").hide()
	$trNOth.off("mouseover");
	$trNOth.off("click");
	$trNOth.off("mouseout");
	$(".pasteDate").removeClass("pasteDate")
	$(".changeDate").removeClass("changeDate")
}

function calculateRoomTime($moverow, $thisrow)
{
	var moveRoom = $moverow.children("td").eq(ROOMTIME).html()
	moveRoom = moveRoom? moveRoom.split("<br>") : ""
	var moveroom = moveRoom[0]? moveRoom[0] : ""

	var thisRoom = $thisrow.children("td").eq(ROOMTIME).html()
	thisRoom = thisRoom? thisRoom.split("<br>") : ""
	var thisroom = thisRoom[0]? thisRoom[0] : ""

	if ((thisroom) && (!moveroom)) {
		return thisRoom
	}
	return false
}

function deleteCase(tableID, rowi, opdate, staffname, qn)
{
	//not actually delete the case but set waitnum=NULL
	var sql = "sqlReturnbook=UPDATE book SET waitnum=NULL, "
	sql += "editor = '" + getUser() + "' WHERE qn="+ qn + ";"

	Ajax(MYSQLIPHP, sql, callbackdeleterow)

	function callbackdeleterow(response)
	{
		if (!response || response.indexOf("DBfailed") !== -1) {
			alert ("deleteCase", response)
		} else {
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

	$.each($(table + ' tr:has(th)'), function(i, tr) {
		tohead = tr
		return ($(tohead).offset().top < 0)
	})
	return tohead
}
