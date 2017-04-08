function sortable()
{
	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		start: function(e, ui){
			clearTimeout(TIMER);
			closemenu()
			$('#editcell').hide();
			ui.placeholder.innerHeight(ui.item.outerHeight())
			ui.placeholder.attr('data-thisindex', ui.placeholder.index());
			ui.item.attr("data-sender", ui.item.closest('table').attr('id'))
		},
		forceHelperSize: true,
		forcePlaceholderSize: true,
		change: function(e, ui){
			ui.placeholder.attr('data-previndex', ui.placeholder.attr('data-thisindex'));
			ui.placeholder.attr('data-thisindex', ui.placeholder.index());
		},
		stop: function(e, ui){
			ui.item.attr("data-receiver", ui.item.closest('table').attr('id'))
				
			if (!ui.item.children().eq(QN).html()) {
				return false
			}

			if (ui.item.attr("data-receiver") == "queuetbl") {
				if (ui.item.children().eq(STAFFNAME).html() != $('#titlename').html()) {
					return false
				}
				if (ui.item.attr("data-sender") == "tbl") {
					ui.item.children().eq(SINCE).css("display", "block")
					ui.item.children().eq(STAFFNAME).css("display", "none")
				}
			} else {
				if (ui.item.attr("data-sender") == "queuetbl") {
					ui.item.children().eq(SINCE).css("display", "none")
					ui.item.children().eq(STAFFNAME).css("display", "block")
				}
			}

			var thisdrop
			var finalWaitnum
			var previtem = ui.item.prev()
			var thisitem = ui.item
			var nextitem = ui.item.next()
			if (!previtem.length || previtem.has('th').length) {
				thisdrop = nextitem
			} else {
				if (!nextitem.length || nextitem.has('th').length) {
					thisdrop = previtem
				} else {
					var helperpos = ui.offset.top	//ui.offset (no '()') = helper position
					var prevpos = previtem.offset().top
					var thispos = thisitem.offset().top
					var nextpos = nextitem.offset().top
					var nearprev = Math.abs(helperpos - prevpos)
					var nearplace = Math.abs(helperpos - thispos)
					var nearnext = Math.abs(helperpos - nextpos)
					var nearest = Math.min(nearprev, nearplace, nearnext)
					if (nearest == nearprev) 
						thisdrop = previtem
					if (nearest == nearnext) 
						thisdrop = nextitem
					if (nearest == nearplace) 
						if (ui.placeholder.attr('data-previndex') < 
							ui.placeholder.attr('data-thisindex'))
							thisdrop = previtem
						else
							thisdrop = nextitem
				}
			}

			var thisopdate = thisdrop.children("td").eq(OPDATE).html().numDate()
			var staffname = thisitem.children("td").eq(STAFFNAME).html()
			var thisqn = thisitem.children("td").eq(QN).html()
			if (thisdrop == previtem) {
				var prevqn = previtem.children("td").eq(QN).html()
				finalWaitnum = prevWaitnum(prevqn, thisopdate)
			}
			if (thisdrop == nextitem) {
				var nextqn = nextitem.children("td").eq(QN).html()
				finalWaitnum = nextWaitnum(nextqn, thisopdate)
			}

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisopdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbacksortable);

			function callbacksortable(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
					$("#tbl tbody" ).sortable( "cancel" )
				}
				else
				{
					updateBOOK(response)
					if (ui.item.attr("data-receiver") == "tbl") {
//						requestAnimationFrame(refillall())
						refillall()
						if (($("#titlecontainer").css('display') == 'block') && 
							($('#titlename').html() == staffname)) {

//								requestAnimationFrame(refillstaffqueue())								
						refillstaffqueue()
						}
					} else {
//						requestAnimationFrame(refillstaffqueue())
						refillstaffqueue()
//						requestAnimationFrame(refillall())
						refillall()
					}
				}
			}
			TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
		}
	})
}

function findcaseNum(qn)
{  
	var i = 0
	while (i < BOOK.length && BOOK[i].qn != qn)
		i++

	return i
}

function prevWaitnum(prevqn, dropDate)
{  
	if (!prevqn)
		return 1
	var caseNum = findcaseNum(prevqn)
	var dropWaitnum = Number(BOOK[caseNum].waitnum)
	caseNum++
	if ((caseNum > BOOK.length - 1) ||
		(BOOK[caseNum].opdate != dropDate)) {
		return dropWaitnum + 1
	} else {
		var afterWaitnum = Number(BOOK[caseNum].waitnum)
		return (afterWaitnum + dropWaitnum) / 2
	}
}

function nextWaitnum(nextqn, dropDate)
{  
	if (!nextqn)
		return 1
	var caseNum = findcaseNum(nextqn)
	var dropWaitnum = Number(BOOK[caseNum].waitnum)
	caseNum--
	if ((caseNum < 0) ||
		(BOOK[caseNum].opdate != dropDate)) {
		return dropWaitnum / 2
	} else {
		var beforeWaitnum = Number(BOOK[caseNum].waitnum)
		return (beforeWaitnum + dropWaitnum) / 2
	}
}
