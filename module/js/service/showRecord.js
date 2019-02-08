
import { editableSV } from "./setSERVICE.js"

export function showRecord(bookq)
{
  let $divRecord = $("#profileRecord > div").clone()

  initRecord(bookq, $divRecord)
  inputEditable($divRecord)
  return $divRecord[0]
}

// this.name === column in Mysql
// this.value === value of this item
// add qn to this.name to make it unique
// next sibling (span) right = wide pixels, to make it (span) contained in input box
function initRecord(bookq, $divRecord)
{
  let $input = $divRecord.find("input"),
    inputName = "",
    wide = ""

  $input.each(function() {
    inputName = this.name
    this.name = inputName + bookq.qn
    if (this.type === "number") {
      if ((inputName === "admitted") && (bookq.admit) && (!bookq.admitted)) {
        this.value = 1
      } else if ((inputName === "operated") && (bookq.disease) && (!bookq.operated)) {
        this.value = 1
      } else {
        this.value = bookq[inputName]
      }
    } else {
      this.checked = (this.value && (this.value === bookq[inputName]))
    }
  })
}

function inputEditable($divRecord)
{
  if (editableSV) {
    $divRecord.find("input").prop("disabled", false)
  } else {
    $divRecord.find("input").prop("disabled", true)
  }
}
