
DROP TRIGGER IF EXISTS bookau;

CREATE TRIGGER bookau AFTER UPDATE ON book FOR EACH ROW
	INSERT INTO bookhistory 
			(action, revision, editdatetime, deleted, waitnum, opdate, oproom, casenum, 
			staffname, hn, patient, diagnosis, treatment, admission, final, 
			equipment, contact, admit, discharge, qn, editor)
	VALUES (
			IF (OLD.deleted>0, 'undelete', IF (NEW.deleted>0, 'delete', 'update')),
			NULL,
			NOW(), 
			NEW.deleted,
			NEW.waitnum,
			IF (OLD.opdate=NEW.opdate, NULL, NEW.opdate),
			IF (OLD.oproom=NEW.oproom, NULL, NEW.oproom),
			IF (OLD.casenum=NEW.casenum, NULL, NEW.casenum),
			IF (OLD.staffname=NEW.staffname, '', NEW.staffname),
			IF (OLD.hn=NEW.hn, '', NEW.hn),
			IF (OLD.patient=NEW.patient, '', NEW.patient),
			IF (OLD.diagnosis=NEW.diagnosis, '', NEW.diagnosis),
			IF (OLD.treatment=NEW.treatment, '', NEW.treatment),
			IF (OLD.admission=NEW.admission, '', NEW.admission),
			IF (OLD.final=NEW.final, '', NEW.final),
			IF (OLD.equipment=NEW.equipment, '', NEW.equipment),
			IF (OLD.contact=NEW.contact, '', NEW.contact),
			IF (OLD.admit=NEW.admit, NULL, NEW.admit),
			IF (OLD.discharge=NEW.discharge, NULL, NEW.discharge),
			NEW.qn,
			NEW.editor);
