
import { clickDate } from "./clickDate.js"

// initiate mouseover and underline the row to move to
export function mouseEvent(selected)
{
  let $allRows = $("#maintbl tr:has('td'), #queuetbl tr:has('td')")

  $allRows.mouseover(function() {
    $(this).addClass("pasteDate")
  })
  $allRows.mouseout(function() {
    $(this).removeClass("pasteDate")
  })
  $allRows.off("click").on("click", function(event) {
    clickDate(selected, this)
    event.stopPropagation()
  })
}
