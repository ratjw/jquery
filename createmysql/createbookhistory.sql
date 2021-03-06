
DROP TABLE IF EXISTS bookhistory;

CREATE TABLE bookhistory LIKE book;

ALTER TABLE bookhistory 
	MODIFY COLUMN qn int(10) UNSIGNED NOT NULL, 
	DROP PRIMARY KEY, 
	DROP KEY opdate, 
	DROP KEY hn, 
	ENGINE = INNODB,
	ADD action VARCHAR(8) DEFAULT 'update' FIRST, 
	ADD editdatetime DATETIME NOT NULL AFTER action,
	ADD KEY (qn);
