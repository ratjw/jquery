
import { isConsults, isSplit, isStaffname } from "../util/util.js"
import { refillstaffqueue } from "./staffqueue.js"

export function viewSplit(staffname) {
  if (isSplit() && (isStaffname(staffname) || isConsults())) {
    refillstaffqueue()
  }
}
