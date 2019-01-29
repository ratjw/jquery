
import { rowDecoration } from "./rowDecoration.js"
import { putThdate } from "../util/date.js"
import { winWidth, winHeight, winResizeFix } from "../util/util.js"
import { toUndelete } from "../menu/allDeletedCases.js"

// Make dialog box dialogDeleted containing historytbl
export function viewAllDeletedCases(deleted) {
  let $deletedtbl = $('#deletedtbl'),
    $deletedtr = $('#deletedcells tr')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  // display the first 20
  $.each( deleted, function(i) {
    $deletedtr.clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataDeleted(this)
    return i < 20;
  });

  let $dialogDeleted = $("#dialogDeleted")
  $dialogDeleted.dialog({
    title: "All Deleted Cases",
    closeOnEscape: true,
    modal: true,
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      $(window).off("resize", resizeDeleted )
      $(".fixed").remove()
    }
  })
  $deletedtbl.fixMe($dialogDeleted);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogDeleted.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($deletedtbl, $dialogDeleted)
  }

  // display the rest
  setTimeout(function() {
    $.each( deleted, function(i) {
      if (i < 21) return
      $deletedtr.clone()
        .appendTo($deletedtbl.find('tbody'))
          .filldataDeleted(this)
    })

    // #undelete is the div to show span and closeclick
    // #undel is the span >Undelete< for click receiver
    // .toUndelete is attached to the first cell of every row
    let $undelete = $("#undelete")
    $undelete.hide()
    $undelete.off("click").on("click", () => $undelete.hide() )
    $(".toUndelete").off("click").on("click", function () {
      toUndelete(this, deleted)
    })
  }, 100)
}

jQuery.fn.extend({
	filldataDeleted : function(q) {
		let row = this[0]

    row.dataset.waitnum = q.waitnum,
    row.dataset.opdate = q.opdate,
    row.dataset.oproom = q.oproom,
    row.dataset.casenum = q.casenum,
    row.dataset.staffname = q.staffname,
    row.dataset.qn = q.qn,

		rowDecoration(row, q.opdate)
		row.cells[0].classList.add("toUndelete")

;		[	putThdate(q.opdate),
			q.staffname,
			q.hn,
			q.patient,
			q.diagnosis,
			q.treatment,
			q.contact,
			q.editor,
			q.editdatetime,
			q.qn
		].forEach((item, i) => { row.cells[i].innerHTML = item })
	}
})
