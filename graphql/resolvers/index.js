const bcrypt = require('bcryptjs');
// Models
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

// Get user by Id
const user = (userId) => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      }
    })
    .catch(err => {
      throw err;
    })
}

// Get events by id
const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          // call user function
          creator: user.bind(this, event.creator),
          date: new Date(event._doc.date).toISOString(),
        };
      })
    })
    .catch(err => {
      throw err
    })
}

module.exports = {
  events: () => {
    return Event.find()
      .then((events) => {
        return events.map(event => {
          return {
            ...event._doc,
            creator: user.bind(this, event._doc.creator),
            date: new Date(event._doc.date).toISOString()
          }
        })
      })
      .catch((err) => {
        console.log('Failed to retrieve from events', err)
      })
  },
  createEvent: (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5e26679d4518f9800c79f702'
    });
    let createdEvent;

    return event.save()
      .then((result) => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator),
          date: new Date(event._doc.date).toISOString()
        }
        return User.findById('5e26679d4518f9800c79f702')
      })
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch((err) => {
        console.log('Failed to write to database', err);
        throw err;
      });
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          createdAt: new Date(booking._doc.createdAt).toIOSString(),
          updatedAt: new Date(booking._doc.updatedAt).toIOSString(),
        }
      })
    } catch (err) {
      throw err;
    }
  },
  createUser: (args) => {
    // check for duplicate user
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error('User already exists');
        }
        // return hashed password to store in database
        return bcrypt.hash(args.userInput.password, 12)
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return {
          ...result._doc,
          password: null
        }
      })
      .catch(err => {
        throw err
      })
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      userId: '5e26679d4518f9800c79f702',
      event: fetchedEvent
    });
    const result = await booking.save();
    console.log('RESULT: ', result.createdAt)
    return {
      ...result._doc,
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    }
  }
}