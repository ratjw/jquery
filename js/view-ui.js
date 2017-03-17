
function DragDrop()
{
	$("#tbl tr:has(td)").draggable({
		revert: "true",
		helper: function(){
					var copy = $(this).clone();
					copy.find("td").css({
						"fontSize": "14px",
						"border": "solid 1px silver",
					})
					return copy;
				},
		appendTo: 'body',
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function (event) {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#tbl tr:has(td)").droppable({
		accept: "tr",

		over: function (event, ui){
			if ($(ui.helper).position().top < 50) {
				$('#tblcontainer').animate({
					scrollTop: $('#tblcontainer').scrollTop() - 200
				}, 200);
			}
			if ($(ui.helper).position().top > $('#tblcontainer').innerHeight() - 50) {
				$('#tblcontainer').animate({
					scrollTop: $('#tblcontainer').scrollTop() + 200
				}, 200);
			}
		},

		drop: function (event, ui) {
			var that_row = ui.draggable
			var this_row = $(this)
			var uihelper = ui.helper
			var prevdate
			var nextdate
			var dragTable = $(ui.draggable).closest("table").attr("id")
			var thatdate = $(ui.draggable).children("td").eq(OPDATE).html()
			var thisdate = $(this).children("td").eq(OPDATE).html()
			if (thatdate)
				thatdate = thatdate.numDate()
			if (thisdate)
				thisdate = thisdate.numDate()
			var thisqn = $(this).children("td").eq(QN).html()

			if (dragTable == "queuetbl") 
			{
				var thatqn = $(ui.draggable).children("td").eq(QQN).html()
				if (!thatqn)
					return false
			}
			else if (dragTable == "tbl")
			{
				var thatqn = $(ui.draggable).children("td").eq(QN).html()
				if (!thatqn)
					return false
			}

			var sql = "sqlReturnbook=UPDATE book SET "
			sql += "opdate='" + thisdate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ thatqn +";"

			Ajax(MYSQLIPHP, sql, callbackDragDrop);

			function callbackDragDrop(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response)
					if (dragTable == "tbl") {
						deleteRow(that_row, thatdate)
					}
						
					if (thisqn)
						this_row.after(this_row.clone());

					refillall()
					staffqueue($( "#titlename" ).html())

					DragDrop()
				}
			}
		}
	});
}

function DragDropStaff()
{
	$("#queuetbl tr:has(td)").draggable({
		helper: "clone",
		revert: "true",
		stack: ".ui-draggable",
		zIndex: 1000,
		start : function () {
			$("#editcell").hide()
			$(".ui-menu").hide()
		}
	});

	$("#queuetbl tr:has(td)").droppable({
		accept: "#tbl tr, #queuetbl tr",

		over: function (event, ui) {
			if ($(ui.helper).position().top < 50) {
				$('#queuecontainer').animate({
					scrollTop: $('#queuecontainer').scrollTop() - 100
				}, 200);
			}
			if ($(ui.helper).position().top > $('#queuecontainer').innerHeight() - 50) {
				$('#queuecontainer').animate({
					scrollTop: $('#queuecontainer').scrollTop() + 100
				}, 200);
			}
		},

		drop: function (event, ui) {
			var finalWaitnum, dropqn, nextqn
			var staffname = $( "#titlename" ).html()
			var thatRow = ui.draggable
			var uidrag = $(ui.draggable).children("td")
			var thatDate = uidrag.eq(OPDATE).html().numDate()	//only from '#tbl'
			var dropDate = $(this).children("td").eq(QOPDATE).html().numDate()
			var dragTable = $(ui.draggable).closest("table").attr("id")

			if (dragTable == "tbl") {
				var staffdrag = uidrag.eq(STAFFNAME).html()
				if (staffdrag != staffname)
					return
				var dragqn = uidrag.eq(QN).html()
			} else {
				var dragqn = uidrag.eq(QQN).html()
			}

			if (dropqn = $(this).children("td").eq(QQN).html()) {
				var dropWaitnum = findwaitnumQ(dropqn)
				if (nextqn = $(this).next().children("td").eq(QQN).html()) {
					if (nextqn == uidrag.eq(QQN).html()) {			//come from '#queuetbl'
						finalWaitnum = Math.round(dropWaitnum + 1)	//move to last row
					} else {
						var nextWaitnum = findwaitnumQ(nextqn)
						finalWaitnum = (nextWaitnum + dropWaitnum) / 2	//interposition
					}
				} else {	//come from '#tbl'
					finalWaitnum = Math.round(dropWaitnum + 1)	//move to last row
				}
			} else {		//added new last row
				var dropDate = $(this).prev().children("td").eq(QOPDATE).html()().numDate()
				var prevqn = $(this).prev().children("td").eq(QQN).html()
				var prevWaitnum = findwaitnumQ(prevqn)
				finalWaitnum = Math.round(prevWaitnum + 1)		//added new last row
			}

			var sql = "sqlReturnbook=UPDATE book SET Waitnum = "+ finalWaitnum
			sql += ", opdate='"+ dropDate
			sql += "', editor='"+ THISUSER
			sql += "' WHERE qn="+ dragqn +";"

			Ajax(MYSQLIPHP, sql, callbackDragDropStaff);

			function callbackDragDropStaff(response)
			{
				if (!response || response.indexOf("DBfailed") != -1)
				{
					alert ("Move failed!\n" + response)
				}
				else
				{
					updateBOOK(response);
					staffqueue(staffname)
					if (dragTable == "tbl") {
						deleteRow(thatRow, thatDate)
					}
					refillall()
					DragDropStaff()
				}
			}
		}
	});
}
