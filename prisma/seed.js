const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

/**
 * Array of interests
 */
const interests = [
  "Dance",
  "Gardening",
  "Hiking",
  "Kayaking",
  "Photography",
  "Learning",
  "Painting",
  "Rock climbing",
  "Calligraphy",
  "Camping",
  "Knitting",
  "Origami",
  "Woodworking",
  "Writing",
  "Archery",
  "Bird watching",
  "Cooking",
  "Drawing",
  "Filmmaking",
  "Fishing",
  "Golf",
  "Jewelry making",
  "Movies",
  "Gaming",
  "Soccer",
];

/**
 * function to select random unique interests
 * @param {Array} element - array of interests or events
 * @param {number} count - the max number of default interests or events
 * @returns {Array}  array of randomly selected interests or events
 */
function getRandomFromDataBase(element, count) {
  const selectedRandom = new Set();

  while (selectedRandom.size < count) {
    const randomIndex = Math.floor(Math.random() * element.length);
    selectedRandom.add(element[randomIndex]);
  }

  return Array.from(selectedRandom);
}

/**
 * Creates users and interests to seed the database
 * @param {number} numUsers
 * @param {number} numEvents
 */
const seed = async (numUsers = 100, numEvents = 10) => {
  // Create interests in the database
  await prisma.interest.createMany({
    data: interests.map((interest) => ({ interest })),
  });

  //Creates events in database
  const events = Array.from({ length: numEvents }, () => ({
    name: faker.music.genre(),
    logo: faker.image.url(),
    startTime: faker.date.anytime(),
    endTime: faker.date.anytime(),
    venue: faker.location.streetAddress(),
    summary: faker.lorem.lines(2),
    url: faker.internet.url(),
    category: faker.commerce.department(),
  }));

  await prisma.event.createMany({ data: events });

  // Create users in the database
  for (let i = 0; i < numUsers; i++) {
    const gender = faker.person.sex();
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        profilePicture: faker.image.avatar(),
        email: faker.internet.email({
          firstName: firstname,
          lastName: lastname,
        }),
        password: faker.internet.password(),
        bio: faker.person.bio(),
        city: faker.location.city(),
        state: faker.location.state(),
        age: Math.floor(Math.random() * (60 - 20 + 1)) + 20,
        gender,
        genderPreference: gender === "male" ? "female" : "male",
        lookingFor: faker.lorem.word(),
        profileActive: true,
      },
    });
  }

  // get the recently created users from database
  const usersInDataBase = await prisma.user.findMany();

  //get the recently created events from database
  const eventsInDataBase = await prisma.event.findMany();

  // get the recently created from database
  const interestsInDataBase = await prisma.interest.findMany();

  // Connect random interests to each user
  for (const user of usersInDataBase) {
    const randomInterests = getRandomFromDataBase(interestsInDataBase, 5);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        interests: {
          //this is geting only the id (number) of the random interests
          //and connecting it to the ussers interest ids.
          connect: randomInterests.map((interest) => ({ id: interest.id })),
        },
      },
    });
  }

  //Connect random users to each event
  for (const event of eventsInDataBase) {
    const randomAttendees = getRandomFromDataBase(usersInDataBase, 10);
    await prisma.event.update({
      where: { id: event.id },
      data: {
        attendingUsers: {
          connect: randomAttendees.map((attendee) => ({ id: attendee.id })),
        },
      },
    });
  }
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
