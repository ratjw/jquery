
import { rowDecoration } from "./rowDecoration.js"
import { putThdate } from "../util/date.js"
import { winWidth, winHeight, winResizeFix } from "../util/util.js"
import { toUndelete } from "../menu/allDeletedCases.js"
import { setRowData } from "../model/rowdata.js"

// Make dialog box dialogAllDeleted containing historytbl
export function viewAllDeletedCases(deleted) {
  let $deletedtbl = $('#deletedtbl'),
    $deletedtr = $('#deletedcells tr')

  // delete previous table lest it accumulates
  $deletedtbl.find('tr').slice(1).remove()

  // display the first 20
  $.each( deleted, function(i) {
    $deletedtr.clone()
      .appendTo($deletedtbl.find('tbody'))
        .filldataAllDeleted(this)
    return i < 20;
  });

  let $dialogAllDeleted = $("#dialogAllDeleted")
  $dialogAllDeleted.dialog({
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
  $deletedtbl.fixMe($dialogAllDeleted);

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDeleted )

  function resizeDeleted() {
    $dialogAllDeleted.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($deletedtbl, $dialogAllDeleted)
  }

  // display the rest
  setTimeout(function() {
    $.each( deleted, function(i) {
      if (i < 21) return
      $deletedtr.clone()
        .appendTo($deletedtbl.find('tbody'))
          .filldataAllDeleted(this)
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
  filldataAllDeleted : function(q) {
    let row = this[0]

    setRowData(row, q)
    rowDecoration(row, q.opdate)
    row.cells[0].classList.add("toUndelete")

;    [  putThdate(q.opdate),
      q.staffname,
      q.hn,
      q.patient,
      q.diagnosis,
      q.treatment,
      q.contact,
      q.editor,
      q.editdatetime
    ].forEach((item, i) => { row.cells[i].innerHTML = item })
  }
})
