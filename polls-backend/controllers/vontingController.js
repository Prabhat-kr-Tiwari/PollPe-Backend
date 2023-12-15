const connection = require("../config/database");
class votingControllers{
    static vote(req,res){
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

    }
}
module.exports=votingControllers