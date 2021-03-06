
import { saveCaseHN } from "./saveCaseHN.js"
import { saveNameHN } from "./saveNameHN.js"
import { ISOdate } from "../util/date.js"
import { BOOK } from "../util/updateBOOK.js"

export function saveHN(pointed, content) {
  if (!/^\d{7}$/.test(content)) {
    pointed.innerHTML = ""
    return false
  }

  let  todate = ISOdate(new Date())
  let waiting = BOOK.find(q => (q.opdate > todate) && (q.hn === content))

  // already having case in waiting list
  if (waiting) {
    saveCaseHN(pointed, waiting)
  } else {
    saveNameHN(pointed, content)
  }
}
