const connection = require("../config/database");

class QuestionsController{

    //creating the questionset
    static createQuestionSet(req,res){
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
    }


    //create options
    static createOption(req,res){

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

    }
    //update a specific question set
    static updateQuestionSet(req,res){
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
    }

}
module.exports=QuestionsController