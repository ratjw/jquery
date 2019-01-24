
import { getTableRowByQN } from "../util/getrows.js"
import {isSplit } from "../util/util.js"

// Both main and staff tables
export function scrolltoThisCase(qn)
{
  let showtbl, showqueuetbl

  showtbl = locateFound("tblcontainer", "tbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

// Scroll to specified qn case and add a border
let locateFound = function (containerID, tableID, qn) {
  let container = document.getElementById(containerID),
    row = getTableRowByQN(tableID, qn),
    scrolledTop = container.scrollTop,
    offset = row && row.offsetTop,
    rowHeight = row && row.offsetHeight,
    height = container.clientHeight - rowHeight,
    bottom = scrolledTop + height,
    $container = $("#" + containerID)

  $("#" + tableID + " tr.marker").removeClass("marker")
  if (row) {
    $(row).addClass("marker")
    if (offset < scrolledTop) {
      $container.animate({
        scrollTop: offset
      }, 500);
    }
    else if (offset > bottom) {
      $container.animate({
        scrollTop: offset - height
      }, 500);
    }
    return true
  }
}
