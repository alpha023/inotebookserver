const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1 :Get All The notes of logged in user: GET "/api/notes/fetchallnotes": login-required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    //console.log(`error occured ${error}`);
    res.status(500).send(" internal server error some error occured");
  }
});

//ROUTE 2 :Add a new notes of logged in user: POST : login-required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "your title must contain atleast 3 characters").isLength({ min: 3 }),
    body("description", "your description must contain atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      //if errors return bad req and errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(),status:false });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const addedNote = await note.save();
      res.json(addedNote);
    } catch (error) {
      //console.log(`error occured ${error}`);
      res.status(500).send(" internal server error some error occured");
    }
  }
);

//ROUTE 3 :Update a Note of logged in user: PUT : /api/notes/updatenote/id" login-required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    //create a new note
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //no functionality to change date saved by defaul

    //check kro user logged-in apne hi note ko change krr rha
    //esa to nhi hai ki ye user dusre k note ko update to nhi krr rha
    //beware from attackers
    //check-it
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Not Found any Note");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    //valid-user and its note
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(note);
  } catch (error) {
    //console.log(`error occured ${error}`);
    res
      .status(500)
      .send("internal server error some error occured-in /updatenote");
  }
});

//ROUTE 4 :delete an existing Note of logged-in: DELETE /api/notes/deletenote" : login-required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  // const {title,description,tag}=req.body;

  //create a new note
  // const newNote={};
  // if(title){
  //     newNote.title=title;
  // }
  // if(description){
  //     newNote.description=description;
  // }
  // if(tag){
  //     newNote.tag=tag;
  // }

  //no functionality to change date saved by default

  //check kro user logged-in apne hi note ko delete krr rha
  //esa to nhi hai ki ye user dusre k note ko delete to nhi krr rha
  //beware from attackers
  //check-it

  try {
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Not Found any Note");
    }
    //allow deletion only if user owns note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed to delete");
    }

    //valid-user and its note
    note = await Notes.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Note Deleted Success fully--",
      note: `${note}`,
    });
  } catch (error) {

    //console.log(`error occured ${error}`);
    res.status(500).send(" internal server error some error occured-in /deletenote");


  }
});

module.exports = router;
