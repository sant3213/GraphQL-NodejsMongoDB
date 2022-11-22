const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event' // Allows me to set up a relation and let mongoose know that two models are related which will help us later to fetch data
            // We use the name of the model which we want to connect with, in this case is Event
        }
    ]
});

module.exports = mongoose.model('User', userSchema);