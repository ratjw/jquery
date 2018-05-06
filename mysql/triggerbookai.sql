	
DROP TRIGGER IF EXISTS bookai;

CREATE TRIGGER bookai AFTER INSERT ON book FOR EACH ROW
	INSERT INTO bookhistory 
			(action, editdatetime, deleted, waitnum, opdate, oproom, casenum, 
			theatre, staffname, hn, patient, diagnosis, treatment, admission, final, 
			equipment, contact, qn, editor)
	VALUES ('insert', NOW(), 
			NEW.deleted,
			NEW.waitnum,
			NEW.opdate,
			NEW.oproom,
			NEW.casenum,
			NEW.theatre,
			NEW.staffname,
			NEW.hn,
			NEW.patient,
			NEW.diagnosis,
			NEW.treatment,
			NEW.admission,
			NEW.final,
			NEW.equipment,
			NEW.contact,
			NEW.qn,
			NEW.editor);
