
export function setRowData(row, q)
{
  row.opdate = q.opdate
  row.waitnum = q.waitnum
  row.theatre = q.theatre
  row.oproom = q.oproom
  row.optime = q.optime
  row.casenum = q.casenum
  row.hn = q.hn
  row.staffname = q.staffname
	row.diagnosis = q.diagnosis
	row.treatment = q.treatment
	row.contact = q.contact
  row.qn = q.qn
}

export function blankRowData(row, opdate)
{
  row.opdate = opdate
  row.waitnum = null
  row.theatre = ""
  row.oproom = null
  row.optime = ""
  row.casenum = null
  row.hn = ""
  row.staffname = ""
	row.diagnosis = ""
	row.treatment = ""
	row.contact = ""
  row.qn = ""
}
