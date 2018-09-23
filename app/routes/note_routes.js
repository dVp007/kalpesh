module.exports = function(app, db) {
  const collection = 
  app.post('/notes', (req, res) => {
    const note = { text: req.body.body, title: req.body.title };
    db.collection('notes').insert(note, (err, result) => {
      if (err) { 
        res.send({ 'error': 'An error has occurred' }); 
      } else {
        res.send(result.ops[0]);
      }
    });
  });
  app.get('/notes',(req,res)=>{
  	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"Title":"this is an Awesome WebPage"}));
  })
};