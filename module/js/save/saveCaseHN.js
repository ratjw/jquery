
import {
  STAFFNAME, HN, PATIENT, DIAGNOSIS, TREATMENT, CONTACT
} from "../model/const.js"
import { OLDCONTENT, clearEditcell } from "../control/edit.js"
import { sqlMoveCaseHN, sqlCopyCaseHN } from "../model/sqlsavehn.js"
import { putNameAge } from "../util/date.js"
import { updateBOOK } from "../util/updateBOOK.js"
import { Alert, winWidth } from "../util/util.js"
import { rowDecoration } from "../view/rowDecoration.js"

export function saveCaseHN(pointed, waiting)
{
let  wanting = {...waiting},
    tableID = pointed.closest("table").id,
    row = pointed.closest('tr'),
    cells = row.cells,
    opdate = row.dataset.opdate,
    staffname = row.dataset.staffname,
    diagnosis = row.dataset.diagnosis,
    treatment = row.dataset.treatment,
    contact = row.dataset.contact,
    qn = row.dataset.qn,
    noqn = !qn,

    hn = waiting.hn,
    patient = waiting.patient,
    dob = waiting.dob,

    $dialogMoveCaseHN = $("#dialogMoveCaseHN"),
    $movefrom = $("#movefrom").next(),
    $moveto = $("#moveto").next(),
    tblcells = $("#tblcells tr").html()

  // disregard if it's staffoncall
  if (/(<([^>]+)>)/i.test(staffname)) { staffname = "" }

  // May have other columns before, thus has some values already
  wanting.opdate = opdate
  wanting.patient = patient
  wanting.dob = dob
  if (staffname) { wanting.staffname = staffname }
  if (diagnosis) { wanting.diagnosis = diagnosis }
  if (treatment) { wanting.treatment = treatment }
  if (contact) { wanting.contact = contact }

  $movefrom.html(tblcells).filldataWaiting(waiting)
  $moveto.html(tblcells).filldataWaiting(wanting)
  let width = winWidth(95)
  width = width < 500
      ? 550
      : width > 800
      ? 800
      : width

  $dialogMoveCaseHN.dialog({
    title: "เคสซ้ำ",
    closeOnEscape: true,
    modal: true,
    autoResize: true,
    show: 200,
    hide: 200,
    width: width,
    buttons: [
      {
        text: "ย้ายมา ลบเคสเดิมออก",
        class: "moveButton",
        click: function() {
          moveCaseHN()
        }
      },
      {
        text: "ก็อปปี้มา คงเคสเดิม",
        class: "copyButton",
        click: function() {
          copyCaseHN()
        }
      },
      {
        text: "ยกเลิก ไม่ทำอะไร",
        click: function() {
          $dialogMoveCaseHN.dialog("close")
          cells[HN].innerHTML = OLDCONTENT
        }
      }
    ],
    close: function() {
      clearEditcell()
    }
  })

  function moveCaseHN()
  {
    sqlMoveCaseHN(pointed, waiting, wanting).then(response => {
      let hasData = function () {
        updateBOOK(response)
      }
      let noData = function () {
        Alert("saveCaseHN", response)
        pointed.innerHTML = OLDCONTENT
        // unsuccessful entry
      };

      typeof response === "object" ? hasData() : noData()
    }).catch(error => { })

    $dialogMoveCaseHN.dialog("close")
  }

  function copyCaseHN()
  {
    sqlCopyCaseHN(pointed, waiting, wanting).then(response => {
      let hasData = function () {
        updateBOOK(response)
      }
      let noData = function () {
        Alert("saveCaseHN", response)
        pointed.innerHTML = OLDCONTENT
        // unsuccessful entry
      };

      typeof response === "object" ? hasData() : noData()
    }).catch(error => { })

    $dialogMoveCaseHN.dialog("close")
  }
}

jQuery.fn.extend({
  filldataWaiting : function(bookq) {
    let  row = this[0],
      cells = row.cells

    rowDecoration(row, bookq.opdate)

    cells[STAFFNAME].innerHTML = bookq.staffname
    cells[HN].innerHTML = bookq.hn
    cells[PATIENT].innerHTML = putNameAge(bookq)
    cells[DIAGNOSIS].innerHTML = bookq.diagnosis
    cells[TREATMENT].innerHTML = bookq.treatment
    cells[CONTACT].innerHTML = bookq.contact
  }
})
