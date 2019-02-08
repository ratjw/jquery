
import { getTableRowByQN } from "../util/rowsgetting.js"
import { isSplit } from "../util/util.js"
import { ISOdate } from "../util/date.js"

// Both main and staff tables
export function scrolltoThisCase(qn)
{
  let showtbl, showqueuetbl

  showtbl = locateFound("maincontainer", "maintbl", qn)
  if (isSplit()) {
    showqueuetbl = locateFound("queuecontainer", "queuetbl", qn)
  }
  return showtbl || showqueuetbl
}

export function scrolltoToday(tableID)
{
  let today = new Date(),
    todate = ISOdate(today),
    table = document.getElementById(tableID),
    container = table.closest('div'),
    thisrow = Array.from(table.querySelectorAll('tr')).find(e => e.dataset.opdate === todate)

  if (thisrow) {
    container.scrollTop = 0
    $(container).animate({
      scrollTop: thisrow.offsetTop
    }, 300);
  }
}

// Scroll to specified qn case and add a border
export function locateFound(containerID, tableID, qn)
{
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
        scrollTop: offset - height/3
      }, 500);
    }
    else if (offset > bottom) {
      $container.animate({
        scrollTop: offset - height*2/3
      }, 500);
    }
    return true
  }
}
