var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SavedSchema = new Schema({
  link: {
    type: String
  },
  headline: {
    type: String
  }
});

var Saved = mongoose.model("Saved", SavedSchema);

module.exports = Saved;