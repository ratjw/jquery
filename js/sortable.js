function sortable()
{
	var prevplace
	var thisplace
	var sender

	$("#tbl tbody, #queuetbl tbody").sortable({
		items: "tr",
		connectWith: "#tbl tbody, #queuetbl tbody",
		forceHelperSize: true,
		forcePlaceholderSize: true,
		delay: 100,
		revert: true,
		start: function(e, ui){
			clearTimeout(TIMER);
			$('#menu').hide();
			$('#stafflist').hide();
			clearEditcellData();
			ui.placeholder.innerHeight(ui.item.outerHeight())
			prevplace = ui.placeholder.index()
			thisplace = ui.placeholder.index()
			sender = ui.item.closest('table').attr('id')
			if ($("#tblwrapper").is('.ui-resizable')) {
				$("#tblwrapper").resizable("destroy")
			}
		},
		change: function(e, ui){
			prevplace = thisplace
			thisplace = ui.placeholder.index()
		},
		stop: function(e, ui){
			var $item = ui.item
			var $itemcell = $item.children("td")
			var receiver = $item.closest('table').attr('id')
			var titlename = $('#titlename').html()

			if (receiver == "queuetbl") {
				if ($itemcell.eq(STAFFNAME).html() != titlename) {
					stopsorting()
					return false
				}
			}
				
			if (!$itemcell.eq(QN).html()) {
				stopsorting()
				return false
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
					if (nearest == nearplace) {
						if ((prevplace == thisplace) && (sender == receiver)) {
							stopsorting()	//same place as before sorting
							return false
						}
						if (prevplace < thisplace) {
							$thisdrop = $previtem
						} else {
							$thisdrop = $nextitem
						}
					}
				}
			}

			var thisopdate = getOpdate($thisdrop.children("td").eq(OPDATE).html())
			var staffname = $itemcell.eq(STAFFNAME).html()
			var finalWaitnum = calculateWaitnum($item, thisopdate)
			var thisqn = $itemcell.eq(QN).html()

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='" + thisopdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thisqn +";"

			Ajax(MYSQLIPHP, sql, callbacksortable);
			
			$item[0].title = finalWaitnum
			stopsorting()

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
						refillall()
						if (($("#queuewrapper").css('display') == 'block') && 
							(titlename == staffname)) {

						refillstaffqueue()
						}
					} else {	//receiver == "queuetbl"
						refillstaffqueue()
						refillall()
					}
				}
			}
		}
	})
}

function stopsorting()
{
	TIMER = setTimeout("updating()",10000);	//poke next 10 sec.
	if (!$("#tblwrapper").is('.ui-resizable')) {
		initResize("#tblwrapper")
		$('.ui-resizable-e').css('height', $("#tbl").css("height"))
	}
	$('#editcell').hide()
	//after sorting, editcell was placed at row 0 column 1
	//and display at placeholder position in entire width
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
