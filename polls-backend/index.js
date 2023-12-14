const express =require('express')
const connection=require('./database');
const { forEach } = require('lodash');

const app=express()

app.use(express.json())



// At first create the user
app.post('/createUser', (req, res) => {
    const { userID, name } = req.body;
  
    // Ensure userID and name are provided
    if (!userID || !name) {
      return res.status(400).json({ error: 'userID and name are required' });
    }
  
    const userData = { userID, name };
  
    // Insert the user into the USERDATA table
    connection.query('INSERT INTO USERDATA SET ?', userData, (error, results, fields) => {
      if (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      console.log('User created successfully');
      res.status(201).json({ message: 'User created successfully', userID });
    });
  });

//poll creation
app.post('/polls',(req,res)=>{

   /* CREATE TABLE polls (
        poll_id INT  PRIMARY KEY,
        title VARCHAR(255),
        category VARCHAR(100),
        start_date DATE,
        end_date DATE,
        min_reward INT,
        max_reward INT,
        userID int,
        FOREIGN KEY (userID) REFERENCES USERDATA(userID) ON DELETE cascade
    );*/


    const { poll_id,title, category, startDate, endDate, minReward, maxReward,userID } = req.body;

    // Perform validation checks
  if (!poll_id||!title || !category || !startDate || !endDate || !minReward || !maxReward||!userID) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Convert reward values to integers
  const minRewardValue = parseInt(minReward);
  const maxRewardValue = parseInt(maxReward);

  // Perform additional checks if needed (e.g., minReward < maxReward)

  // Insert the new poll into the database
  const sql = 'INSERT INTO polls (poll_id,title, category, start_date, end_date, min_reward, max_reward,userID) VALUES (?,?, ?, ?, ?, ?, ?,?)';
  connection.query(sql, [poll_id,title, category, startDate, endDate, minRewardValue, maxRewardValue,userID], (err, result) => {
    if (err) {
      console.error('Error creating poll:', err);
      return res.status(500).json({ error: 'Failed to create poll' });
    }
    // Respond with the ID of the created poll
    res.status(201).json({ message: 'Poll created successfully', pollId: result.insertId });
  });

})

// Route to create a question set
app.post('/createQuestionSet', (req, res) => {
    const { question_set_id, poll_id, question_type, question_text } = req.body;
  
    // Ensure required fields are provided
    if (!question_set_id || !poll_id || !question_type || !question_text) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const questionSetData = {
      question_set_id,
      poll_id,
      question_type,
      question_text
    };
  
    // Insert the question set into the question_sets table
    connection.query('INSERT INTO question_sets SET ?', questionSetData, (error, results, fields) => {
      if (error) {
        console.error('Error creating question set:', error);
        return res.status(500).json({ error: 'Failed to create question set' });
      }
      console.log('Question set created successfully');
      res.status(201).json({ message: 'Question set created successfully', question_set_id });
    });
  });


 

  app.post('/createOption', (req, res) => {
    const optionsData = req.body; // Assuming the request body contains an array of options
  
    // Ensure there are options in the request body
    if (!Array.isArray(optionsData) || optionsData.length === 0) {
      return res.status(400).json({ error: 'No options provided in the request body' });
    }
  
    // Insert options into the options table
    const insertedOptions = [];
    optionsData.forEach((option) => {
      const {  question_set_id, option_text } = option;
      
      // Ensure required fields are provided for each option
      if ( !question_set_id || !option_text) {
        return res.status(400).json({ error: 'All fields are required for each option' });
      }
  
      const optionData = {
      
        question_set_id,
        option_text
      
      };
  
      // Insert the option into the options table
      connection.query('INSERT INTO options SET ?', optionData, (error, results, fields) => {
        if (error) {
          console.error('Error creating option:', error);
          return res.status(500).json({ error: 'Failed to create option' });
        }
        console.log('Option created successfully');
        insertedOptions.push(optionData);
        if (insertedOptions.length === optionsData.length) {
          res.status(201).json({ message: 'Options created successfully', insertedOptions });
        }
      });
    });
  });
  
  // Route for voting
app.post('/vote', (req, res) => {
    const { poll_id, option_id, user_id } = req.body;
    console.log(req.body.poll_id)
  
    // Ensure required fields are provided
    if (!poll_id || !option_id || !user_id) {
      return res.status(400).json({ error: 'All fields (poll_id, option_id, user_id) are required' });
    }
  
    // Check if the user has already voted for the same poll
    connection.query('SELECT * FROM votes WHERE poll_id = ? AND user_id = ?', [poll_id, user_id], (error, results) => {
      if (error) {
        console.error('Error checking previous vote:', error);
        return res.status(500).json({ error: 'Failed to check previous vote' });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ error: 'User has already voted for this poll' });
      }
  
      // Insert the vote into the votes table
      connection.query('INSERT INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)', [poll_id, option_id, user_id], (err, result) => {
        if (err) {
          console.error('Error voting:', err);
          return res.status(500).json({ error: 'Failed to vote' });
        }
        console.log('Vote recorded successfully');
        res.status(201).json({ message: 'Vote recorded successfully' });
      });
    });
  });

  // Route to get all polls with associated information
app.get('/getAllpolls', (req, res) => {
    const sql = `
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
    `;
  
    // Execute the SQL query
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('Error fetching polls:', error);
        return res.status(500).json({ error: 'Failed to fetch polls' });
      }
  
      // Respond with the retrieved poll data
      res.status(200).json({ polls: results });
    });
  });


  
 // Route to handle updating a poll by ID
app.put('/polls/:poll_id', (req, res) => {
  const poll_id = req.params.poll_id;
  const { title, category, start_date, end_date, min_reward, max_reward } = req.body;
  console.log(req.body)

  // Create the SQL query to update the poll
  const updateQuery = `
  UPDATE polls 
  SET 
    title = ?,
    category = ?,
    start_date = ?,
    end_date = ?,
    min_reward = ?,
    max_reward = ?
  WHERE poll_id = ?
`;

  // Execute the update query with input values
  connection.query(
    updateQuery,
    [title, category,start_date, end_date, min_reward, max_reward,  poll_id],
    (error, results, fields) => {
      if (error) {
        console.error('Error updating poll:', error);
        res.status(500).send('Error updating poll');
        return;
      }
      console.log('Poll updated successfully');
      res.status(200).send('Poll updated successfully');
    }
  );
});


// Route to update a specific question set
app.put('/questionSets/:pollId/:questionSetId',express.json(), (req, res) => {
  const { pollId, questionSetId } = req.params;
  const { question_text,options,question_type } = req.body;
  console.log(req.body)
  
  // Check if question_text is provided and not empty
  if (!question_text||!options||!question_type) {
    return res.status(400).json({ error: 'All feilds are required' });
  }


  // Check if questionSetId is a valid number
  if (isNaN(questionSetId)) {
    return res.status(400).json({ error: 'Invalid questionSetId' });
  }



connection.beginTransaction(err => {
  if (err) {
    console.error('Error beginning transaction:', err);
    return res.status(500).json({ error: 'Failed to begin transaction' });
  }

  const updateQuery = `
    UPDATE question_sets
    SET question_text = ?,
        question_type = ?
    WHERE poll_id = ? AND question_set_id = ?;
  `;

  connection.query(updateQuery, [question_text, question_type, pollId, questionSetId], (error, results) => {
    if (error) {
      return connection.rollback(() => {
        console.error('Error updating question set:', error);
        res.status(500).json({ error: 'Failed to update question set' });
      });
    }

    const deleteQuery = `
      DELETE FROM options
      WHERE question_set_id = ?;
    `;

    connection.query(deleteQuery, [questionSetId], (error, results) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Error deleting options:', error);
          res.status(500).json({ error: 'Failed to delete options' });
        });
      }

      const optionsArray = options.map(option => [questionSetId, option]);
      const insertQuery = `
        INSERT INTO options (question_set_id, option_text) VALUES ?;
      `;

      connection.query(insertQuery, [optionsArray], (error, results) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error inserting options:', error);
            res.status(500).json({ error: 'Failed to insert options' });
          });
        }

        connection.commit(err => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Failed to commit transaction' });
            });
          }

          res.status(200).json({ message: 'Question set updated successfully' });
        });
      });
    });
  });
});

});

app.get('/polls/:poll_id/analytics', (req, res) => {
  const pollId = req.params.poll_id;

  const pollAnalyticsQuery = `
    SELECT 
        p.poll_id,
        COUNT(v.option_id) AS total_votes,
        o.option_text,
        COUNT(v.option_id) AS option_votes
    FROM options o
    LEFT JOIN votes v ON v.option_id = o.option_id
    LEFT JOIN question_sets qs ON o.question_set_id = qs.question_set_id
    LEFT JOIN polls p ON qs.poll_id = p.poll_id
    WHERE p.poll_id = ?
    GROUP BY o.option_id;
  `;

  connection.query(pollAnalyticsQuery, [pollId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching poll analytics:', error);
      res.status(500).send('Error fetching poll analytics');
      return;
    }
    console.log('Poll analytics fetched successfully');
    res.status(200).json(results);
  });
});

app.get('/polls/analytics', (req, res) => {
  const pollAnalyticsQuery = `
    SELECT 
        COUNT(v.option_id) AS total_votes,
        o.option_text,
        COUNT(v.option_id) AS option_votes
    FROM options o
    LEFT JOIN votes v ON v.option_id = o.option_id
    GROUP BY o.option_id;
  `;

  connection.query(pollAnalyticsQuery, (error, results, fields) => {
    if (error) {
      console.error('Error fetching all poll analytics:', error);
      res.status(500).send('Error fetching all poll analytics');
      return;
    }
    console.log('All poll analytics fetched successfully');
    res.status(200).json(results);
  });
});




const PORT= process.env.PORT||5000 
app.listen(PORT,()=>{
    console.log(`Listening on the ${PORT}`)



})