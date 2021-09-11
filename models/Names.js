const { model, Schema } = require('mongoose');

const NameSchema = new Schema({
    name : {
        required: true,
        type: "string"
    },
    texts: [{
        type: String
    }]
})

const Name = model('name',NameSchema);

module.exports = Name;