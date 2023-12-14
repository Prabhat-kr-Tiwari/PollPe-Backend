create database if not exists polldb;
use polldb;

CREATE table USERDATA(
userID INT  PRIMARY KEY,
name VARCHAR(256)
);
select * from USERDATA;
INSERT into USERDATA(
userID,name
) values (1,"prabhat"),(2,"John"),(3,"Max");

CREATE TABLE polls (
    poll_id INT  PRIMARY KEY,
    title VARCHAR(255),
    category VARCHAR(100),
    start_date DATE,
    end_date DATE,
    min_reward INT,
    max_reward INT,
    userID int,
    FOREIGN KEY (userID) REFERENCES USERDATA(userID) ON DELETE cascade
);
select * from polls;

INSERT INTO polls (poll_id,title, category, start_date, end_date, min_reward, max_reward,userID)
VALUES (1,'About Cricket', 'Sports', '2023-12-13', '2024-02-03', 10, 50,1);

CREATE TABLE question_sets (
    question_set_id INT  PRIMARY KEY,
    poll_id INT,
    question_type VARCHAR(50),
    question_text VARCHAR(255),
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id)
);
INSERT INTO question_sets (question_set_id,poll_id, question_type, question_text)
VALUES (1,1, 'single', 'Who is your favourite cricketer');
DELETE FROM question_sets
WHERE question_set_id = 1; 
select * from question_sets;


CREATE TABLE options (
    option_id INT  PRIMARY KEY,
    question_set_id INT,
    option_text VARCHAR(255),
    title VARCHAR(255),
    FOREIGN KEY (question_set_id) REFERENCES question_sets(question_set_id)
);
ALTER TABLE options
MODIFY COLUMN option_id INT AUTO_INCREMENT ;
ALTER TABLE votes DROP FOREIGN KEY votes_ibfk_2;
ALTER TABLE options MODIFY COLUMN option_id INT AUTO_INCREMENT ;

ALTER TABLE votes
ADD CONSTRAINT votes_ibfk_2
FOREIGN KEY (option_id) REFERENCES options(option_id);
ALTER TABLE OPTIONS drop COLUMN title
select * from options;





INSERT INTO options (option_id,question_set_id, option_text,title)
VALUES (1,1, 'Ms  Dhoni',"Who is your favourite cricketer"),
 (2,1, 'Virat kohli',"Who is your favourite cricketer"),
 (3,1, 'Md sammi',"Who is your favourite cricketer"),
 (4,1, 'Rahul',"Who is your favourite cricketer");
 
 select * from options;
use polldb;
SELECT * FROM options where question_set_id = 2;


CREATE TABLE votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT,
    option_id INT,
    user_id INT,
    -- Other relevant fields...
    FOREIGN KEY (poll_id) REFERENCES polls(poll_id),
    FOREIGN KEY (option_id) REFERENCES options(option_id),
    FOREIGN KEY (user_id) REFERENCES USERDATA(userID)
);
insert into votes(vote_id,poll_id,option_id,user_id) 
values(1,1,1,1);
ALTER TABLE votes
DROP FOREIGN KEY votes_ibfk_2;

ALTER TABLE votes
ADD CONSTRAINT votes_ibfk_2
FOREIGN KEY (option_id) REFERENCES options(option_id) ON DELETE CASCADE;

select * from votes;

select * from options

/* fetch all created polls */

SELECT 
    p.title AS poll_title, 
    p.category AS poll_category, 
    p.start_date, 
    p.end_date, 
    COUNT(v.poll_id) AS total_votes,
    COUNT(qs.question_set_id) AS num_question_sets
FROM polls p
LEFT JOIN votes v ON p.poll_id = v.poll_id
LEFT JOIN question_sets qs ON p.poll_id = qs.poll_id
GROUP BY p.poll_id;



-- //
SELECT 
        p.title AS poll_title, 
        p.category AS poll_category, 
        p.start_date, 
        p.end_date, 
        COUNT(v.poll_id) AS total_votes,
        COUNT(DISTINCT qs.question_set_id) AS num_question_sets,
        MIN(qst.question_text) AS sample_question
    FROM polls p
    LEFT JOIN votes v ON p.poll_id = v.poll_id
    LEFT JOIN question_sets qs ON p.poll_id = qs.poll_id
    LEFT JOIN question_sets qst ON qs.question_set_id = qst.question_set_id
    GROUP BY p.poll_id;

/*3.a Update Poll Details*/

UPDATE polls 
SET title = 'About cricket player', 
    category = 'Sports Man', 
    min_reward = 5, 
    max_reward = 40, 
    start_date = '2023-12-13',
    end_date =  '2024-02-03'
WHERE poll_id = 1;

select * from polls;
DELETE FROM polls
WHERE poll_id = 0; 

/*3.b Update a Particular Question Set  */

select * from question_sets;
UPDATE question_sets 
SET question_text = 'Who is your favourite cricket player'
WHERE poll_id = 1 AND question_set_id = 1;


START TRANSACTION;

UPDATE question_sets
SET question_text = 'Who is your favourite cricket player',
    question_type='single'
WHERE poll_id = 1 AND question_set_id = 1;

UPDATE options
SET option_text = 'Ms Dhoni'
WHERE question_set_id = 1 and option_id=1;

delete from options
where question_set_id=2;

INSERT INTO options (option_id,question_set_id, option_text,title)
VALUES (1,2, 'Ms  Dhoni',"Who is your favourite cricketer"),
 (2,1, 'Virat kohli',"Who is your favourite cricketer"),
 (3,1, 'Md sammi',"Who is your favourite cricketer");

COMMIT;

select * from options;



/* Fetch Poll Analytics for a Particular Poll  */

SELECT 
    poll_id,
    COUNT(*) AS total_votes,
    option_text,
    COUNT(*) AS option_votes
FROM votes v
LEFT JOIN options o ON v.option_id = o.option_id
WHERE poll_id = 1options
GROUP BY o.option_id;



/* Fetch Overall Poll Analytics */ 

SELECT 
    COUNT(*) AS total_votes,
    option_text,
    COUNT(*) AS option_votes
FROM votes v
LEFT JOIN options o ON v.option_id = o.option_id
GROUP BY o.option_id;









