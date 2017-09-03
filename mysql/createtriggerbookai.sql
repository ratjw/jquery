	
DROP TRIGGER IF EXISTS bookai;

CREATE TRIGGER bookai AFTER INSERT ON book FOR EACH ROW
	INSERT INTO bookhistory 
			(action, revision, editdatetime, waitnum, opdate, oproom, optime, 
			staffname, hn, patient, diagnosis, treatment, admission, final, 
			equipment, contact, admit, discharge, qn, editor)
	VALUES ('insert', NULL, NOW(), 
			NEW.waitnum,
			NEW.opdate,
			NEW.oproom,
			NEW.optime,
			NEW.staffname,
			NEW.hn,
			NEW.patient,
			NEW.diagnosis,
			NEW.treatment,
			NEW.admission,
			NEW.final,
			NEW.equipment,
			NEW.contact,
			NEW.admit,
			NEW.discharge,
			NEW.qn,
			NEW.editor);
