function sortable()
{
	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		start: function(e, ui){
			clearTimeout(TIMER);
			$('#menu').hide();
			$('#stafflist').hide();
			clearEditcellData("hide");
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
		delay: 100,
		revert: true,
		stop: function(e, ui){
			var $item = ui.item
			var $itemcell = $item.children()
			var receiver = $item.closest('table').attr('id')
				
			if (!$itemcell.eq(QN).html()) {
				return false
			}

			if (receiver == "queuetbl") {
				if ($itemcell.eq(STAFFNAME).html() != $('#titlename').html()) {
					return false
				}
				if ($item.attr("data-sender") == "tbl") {
					$itemcell.eq(STAFFNAME).css("display", "none")
				}
			} else {	//receiver == "tbl"
				if ($item.attr("data-sender") == "queuetbl") {
					$itemcell.eq(STAFFNAME).css("display", "block")
				}
			}

			var $thisdrop
			var $previtem = $item.prev()
			var $nextitem = $item.next()
			if (!$previtem.length || $previtem.has('th').length) {
				$thisdrop = $nextitem
			} else {
				if (!$nextitem.length || $nextitem.has('th').length) {
					$thisdrop = $previtem
				} else {		//ui.offset (no '()') = helper position
					var helperpos = ui.offset.top
					var prevpos = $previtem.offset().top
					var thispos = $item.offset().top
					var nextpos = $nextitem.offset().top
					var nearprev = Math.abs(helperpos - prevpos)
					var nearplace = Math.abs(helperpos - thispos)
					var nearnext = Math.abs(helperpos - nextpos)
					var nearest = Math.min(nearprev, nearplace, nearnext)
					if (nearest == nearprev) 
						$thisdrop = $previtem
					if (nearest == nearnext) 
						$thisdrop = $nextitem
					if (nearest == nearplace) 
						if (ui.placeholder.attr('data-previndex')
						  < ui.placeholder.attr('data-thisindex'))
							$thisdrop = $previtem
						else
							$thisdrop = $nextitem
				}
			}

			var thisopdate = getOpdate($thisdrop.children("td").eq(OPDATE).html())
			var staffname = $itemcell.eq(STAFFNAME).html()
			var finalWaitnum = calculateWaitnum($item, thisopdate, staffname)
			var thisqn = $itemcell.eq(QN).html()

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisopdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbacksortable);

			$item[0].title = finalWaitnum
			$itemcell.eq(STAFFNAME).css("height", $thisdrop.height())

			function callbacksortable(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Sortable", response)
					$("#tbl tbody" ).sortable( "cancel" )
				}
				else
				{
					updateBOOK(response)
					if (receiver == "tbl") {
//						requestAnimationFrame(refillall())
						refillall()
						if (($("#titlecontainer").css('display') == 'block') && 
							($('#titlename').html() == staffname)) {

//						requestAnimationFrame(refillstaffqueue())								
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
			$('#editcell').hide()
			//after sorting, sometimes editcell is placed at row 0 column 1
			//and display at placeholder position in entire width
		}
	})
}
