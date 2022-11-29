const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    { timestamps: true } // Mongoose will automatically add a created at and updated at field to every entry it add in the database.
    );

module.exports = mongoose.model('Booking', bookingSchema);