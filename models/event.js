const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number // Tßhere is not Float in Javascript
    },
    date: {
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Two arguments
// The first one is the name of the model (Event)
// The second one is a pointer at the Schema we want to use for that model.
module.exports = mongoose.model('Event', eventSchema)