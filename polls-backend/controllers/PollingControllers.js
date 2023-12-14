const connection = require("../config/database");

class PollingControllers {

    //create polls
  static createPolls(req, res) {
    const {
      poll_id,
      title,
      category,
      startDate,
      endDate,
      minReward,
      maxReward,
      userID,
    } = req.body;

    console.log(req.body)
   // Perform validation checks
   if (!poll_id||!title || !category || !startDate || !endDate || !minReward || !maxReward||!userID) {
    return res.status(400).json({ error: 'All fields are required' });
  }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const minRewardValue = parseInt(minReward);
    const maxRewardValue = parseInt(maxReward);

    // Insert the new poll into the database
    const sql =
      "INSERT INTO polls (poll_id,title, category, start_date, end_date, min_reward, max_reward,userID) VALUES (?,?, ?, ?, ?, ?, ?,?)";
    connection.query(
      sql,
      [
        poll_id,
        title,
        category,
        startDate,
        endDate,
        minRewardValue,
        maxRewardValue,
        userID,
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating poll:", err);
          return res.status(500).json({ error: "Failed to create poll" });
        }
        // Respond with the ID of the created poll
        res
          .status(201)
          .json({
            message: "Poll created successfully",
            pollId: result.insertId,
          });
      }
    );
  }


  //get Allpolls
  static getAllPolls(req,res){
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



  }



  //updating a poll
  static updatePolls(req,res){
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
  }

  //get polls analytics by poll id
  static pollsAnalytics(req,res){

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

  }

  static getAllPollAnalytics(req,res){
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
  }



}

module.exports = PollingControllers;
