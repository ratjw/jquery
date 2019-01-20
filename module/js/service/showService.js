
import {
  CASENUMSV, HNSV, NAMESV, DIAGNOSISSV, TREATMENTSV, ADMISSIONSV,
  FINALSV, PROFILESV, ADMITSV, OPDATESV, DISCHARGESV, QNSV
} from "../model/const.js"
import { POINTER, clearEditcell } from "../control/edit.js"
import { START, putThdate, putNameAge } from "../util/date.js"
import { getClass, inPicArea,  winWidth, winHeight, winResizeFix } from "../util/util.js"
import { isPACS } from "../util/variables.js"
import { refillall, refillstaffqueue } from "../view/fill.js"
import { fillConsults } from "../view/fillConsults.js"
import { coloring } from "./coloring.js"
import { countAllServices } from "./countAllServices.js"
import { getAdmitDischargeDate } from "./getAdmitDischargeDate.js"
import { savePreviousCellService } from "./savePreviousCellService.js"
import { SERVICE, seteditableSV, serviceFromDate } from "./setSERVICE.js"
import { clickDialogService, hideProfile } from "./clickDialogService.js"
import { showRecord } from "./showRecord.js"
import { clearSelection } from "../control/clearSelection.js"
import { profileHandler } from "./profileHandler.js"

export function showService() {
  let $dialogService = $("#dialogService"),
    $servicetbl = $("#servicetbl"),
    $servicecells = $("#servicecells"),
    staffname = "",
    scase = 0,
    classname = ""

  let resizeDialogSV = () => {
    $dialogService.dialog({
      width: winWidth(95),
      height: winHeight(95)
    })
    winResizeFix($servicetbl, $dialogService)
  }

  $("#monthpicker").hide()
  $("#servicehead").show()

  //delete previous servicetbl lest it accumulates
  $servicetbl.find("tr").slice(1).remove()
  $servicetbl.show()
  seteditableSV(serviceFromDate >= START)

  $.each( SERVICE, function() {
    if (this.staffname !== staffname) {
      staffname = this.staffname
      scase = 0
      $servicecells.find("tr").clone()
        .appendTo($servicetbl.find("tbody"))
          .children("td").eq(CASENUMSV)
            .prop("colSpan", QNSV - CASENUMSV)
              .addClass("serviceStaff")
                .html(staffname)
                  .siblings().hide()
    }
    scase++
    $servicecells.find("tr").clone()
      .appendTo($servicetbl.find("tbody"))
        .filldataService(this, scase)
  })

  // close: it is necessary NOT to close the non-visible jQuery dialogs,
  // because these may not have yet been initialized (which results in an error)
  $dialogService.dialog({
    hide: 200,
    width: winWidth(95),
    height: winHeight(95),
    close: function() {
      refillstaffqueue()
      refillall()
            fillConsults()
      $(".ui-dialog:visible").find(".ui-dialog-content").dialog("close")
      $(".fixed").remove()
      hideProfile()
      $(window).off("resize", resizeDialogSV)
      $dialogService.off("click", clickDialogService)
      if (!!POINTER) {
        savePreviousCellService()
      }
      clearEditcell()
      clearSelection()
    }
  })

  if (/surgery\.rama/.test(location.hostname)) {
    getAdmitDischargeDate()
  }
  countAllServices()
  $servicetbl.fixMe($dialogService)
  hoverService()
  profileHandler()
  $dialogService.on("click", clickDialogService)

  //for resizing dialogs in landscape / portrait view
  $(window).on("resize", resizeDialogSV)
}

// Use existing DOM table to refresh when editing
export function reViewService() {
  let $servicetbl = $("#servicetbl"),
    $rows = $servicetbl.find("tr"),
    $servicecells = $("#servicecells"),
    len = $rows.length,
    staffname = "",
    i = 0, scase = 0

  $.each( SERVICE, function() {
    if (this.staffname !== staffname) {
      staffname = this.staffname
      scase = 0
      i++
      let  $staff = $rows.eq(i).children("td").eq(CASENUMSV)
      if ($staff.prop("colSpan") === 1) {
        $staff.prop("colSpan", QNSV - CASENUMSV)
          .addClass("serviceStaff")
            .siblings().hide()
      }
      $staff.html(staffname)
    }
    i++
    scase++
    if (i === len) {
      $("#servicecells").find("tr").clone()
        .appendTo($("#servicetbl").find("tbody"))
      len++
    }
    let  $row = $rows.eq(i)
    let  $cells = $row.children("td")
    if ($cells.eq(CASENUMSV).prop("colSpan") > 1) {
      $cells.eq(CASENUMSV).prop("colSpan", 1)
        .nextUntil($cells.eq(QNSV)).show()
    }
    $row.filldataService(this, scase)
  })
  if (i < (len - 1)) {
    $rows.slice(i+1).remove()
  }
  countAllServices()
  $servicetbl.fixMe($("#dialogService"))
  hoverService()
  profileHandler()
}

jQuery.fn.extend({
  filldataService : function(bookq, scase) {
    let  row = this[0],
      cells = row.cells

    if (bookq.hn && isPACS) { cells[HNSV].className = "pacs" }
    if (bookq.hn) { cells[NAMESV].className = "upload" }

    cells[CASENUMSV].innerHTML = scase
    cells[HNSV].innerHTML = bookq.hn
    cells[NAMESV].innerHTML = putNameAge(bookq)
    cells[DIAGNOSISSV].innerHTML = bookq.diagnosis
    cells[TREATMENTSV].innerHTML = bookq.treatment
    cells[ADMISSIONSV].innerHTML = bookq.admission
    cells[FINALSV].innerHTML = bookq.final
    while(cells[PROFILESV].firstChild) cells[PROFILESV].firstChild.remove()
    cells[PROFILESV].appendChild(showRecord(bookq))
    cells[ADMITSV].innerHTML = putThdate(bookq.admit)
    cells[OPDATESV].innerHTML = putThdate(bookq.opdate)
    cells[DISCHARGESV].innerHTML = putThdate(bookq.discharge)
    cells[QNSV].innerHTML = bookq.qn

    coloring(row)
  }
})

// Simulate hover on icon by changing background pics
function hoverService()
{
  let  tdClass = "td.pacs, td.upload",
    paleClasses = ["pacs", "upload"],
    boldClasses = ["pacs2", "upload2"]

  $(tdClass)
    .mousemove(function(event) {
      if (inPicArea(event, this)) {
        getClass(this, paleClasses, boldClasses)
      } else {
        getClass(this, boldClasses, paleClasses)
      }
    })
    .mouseout(function (event) {
      getClass(this, boldClasses, paleClasses)
    })
}
