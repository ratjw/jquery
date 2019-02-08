
export function setRowData(row, q)
{
  let rowdata = row.dataset

  rowdata.waitnum = q.waitnum
  rowdata.opdate = q.opdate
  rowdata.theatre = q.theatre
  rowdata.oproom = q.oproom || ""
  rowdata.optime = q.optime
  rowdata.casenum = q.casenum || ""
  rowdata.staffname = q.staffname
  rowdata.hn = q.hn
  rowdata.patient = q.patient
  rowdata.dob = q.dob || ""
  rowdata.diagnosis = q.diagnosis
  rowdata.treatment = q.treatment
  rowdata.equipment = q.equipment
  rowdata.contact = q.contact
  rowdata.qn = q.qn
}

export function blankRowData(row, opdate)
{
  let rowdata = row.dataset

  rowdata.waitnum = ""
  rowdata.opdate = opdate
  rowdata.theatre = ""
  rowdata.oproom = ""
  rowdata.optime = ""
  rowdata.casenum = ""
  rowdata.staffname = ""
  rowdata.hn = ""
  rowdata.patient = ""
  rowdata.dob = ""
  rowdata.diagnosis = ""
  rowdata.treatment = ""
  rowdata.equipment = ""
  rowdata.contact = ""
  rowdata.qn = ""
}
