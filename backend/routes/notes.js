const express = require('express');
const router = express.Router();
const fetchuser = require("../middleware/fetchuser")
const Note = require("../models/Note")
const { body, validationResult } = require("express-validator")


//Route:1 Get all the notes GET "api/auth/fetchallnotes" login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    const notes = await Note.find({ user: req.user.id })
    res.json(notes)
})

//Route:2 Add  notes POST "api/auth/addnote" login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })], async (req, res) => {
        //if thre are error ,,show bad request and error
        try {
            const { title, description, tag } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()
            res.json(savedNote)
        } catch (error) {
            console.error(error.message)
            res.status(500).send("Internal server error")
        }

    })

//Route:3 Update  notes PUT "api/auth/updatenote" login required
router.put('/updatenote/:id', fetchuser,async (req, res) => {
    const { title, description, tag } = req.body;

    try {
    const newNote ={} 
    if(title){newNote.title=title}
    if(description){newNote.description=description}
    if(tag){newNote.tag=tag}
    //find the note to be updated and update it
    let note =await Note.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}

    if(note.user.toString() !== req.user.id){
        return  res.status(401).send("Not Allowed")
    }
    note= await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})

    res.json(note);
}  catch (error) {
    console.error(error.message)
    res.status(500).send("Internal server error")
}

})

//Route:4 DELETE  notes delete "api/auth/deletenote" login required
router.delete('/deletenote/:id', fetchuser,async (req, res) => {
    try {
    //find the note to be deleted and delete it
    let note =await Note.findById(req.params.id)
    if(!note){return res.status(404).send("Not Found")}

    //allow deletetion  only if user owns this note
    if(note.user.toString() !== req.user.id){
        return  res.status(401).send("Not Allowed")
    }
    note= await Note.findByIdAndDelete(req.params.id)

    res.json({"Success":"Note successfully deleted",note:note});

} catch (error) {
    console.error(error.message)
    res.status(500).send("Internal server error")
}
})

module.exports = router