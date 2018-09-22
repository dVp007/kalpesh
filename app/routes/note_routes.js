module.exports = function(app, db) {
	app.post('/notes', (req, res) => {
    // You'll create your note here.
    console.log(req.body)
    res.send('Hello')
  });
	app.get('/notes',(req,res)=>{
		res.send("THis is a Great Website;")
	})
};