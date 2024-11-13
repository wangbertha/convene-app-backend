const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

// Array of interests
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

// Array of activities
const activities = [
  {
    name: "Get coffee",
    logo: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg",
    locations: ["Local coffee shop", "Starbucks", "La Colombe", "Capital One Cafe"],
    summary: "Meet for coffee. Start with 30 minutes. Then see where it goes!",
    urlResources: ["https://www.google.com/maps", "https://www.yelp.com/"],
    categories: ["Beverages", "Food"],
  },
  {
    name: "Try a new restaurant",
    logo: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    summary: "Try a new restaurant! Cuisine ideas: Ethiopian, Peruvian, Chinese, Italian, Fusion",
    urlResources: ["https://www.google.com/maps", "https://www.yelp.com/", "https://beliapp.com/"],
    categories: ["Food"],
  },
  {
    name: "Watch a movie",
    logo: "https://images.pexels.com/photos/5662857/pexels-photo-5662857.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    locations: ["Local movie theatre", "Regal Cinemas", "AMC Theatres"],
    summary: "Check out the latest movie releases.",
    urlResources: ["https://www.google.com/maps", "https://www.regmovies.com/", "https://www.amctheatres.com/"],
    categories: ["Art", "Media"],
  },
  {
    name: "Walk on the beach",
    logo: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    locations: ["Nearby beach"],
    urlResources: ["https://www.google.com/maps"],
    summary: "Take a walk on the beach. Weather-permitting",
    categories: ["Exercise", "Nature"],
  },
  {
    name: "Take a hike",
    logo: "https://images.pexels.com/photos/701016/pexels-photo-701016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    locations: ["Nearby trails"],
    urlResources: ["https://www.alltrails.com/","https://www.google.com/maps"],
    summary: "Take a hike.",
    categories: ["Exercise", "Nature"],
  },
  {
    name: "Visit an art museum",
    logo: "https://images.pexels.com/photos/69903/pexels-photo-69903.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    locations: ["Local art museum"],
    urlResources: ["https://artclasscurator.com/82-questions-to-ask-about-a-work-of-art/"],
    summary: "Visit a local art museum.",
    categories: ["Art"],
  },
  {
    name: "Rock climbing",
    logo: "https://images.pexels.com/photos/6689596/pexels-photo-6689596.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    locations: ["Local climbing gym", "Nearby outdoor climbs", "Movement Climbing Gyms"],
    urlResources: ["https://www.google.com/maps", "https://kayaclimb.com/", "https://apps.apple.com/us/app/routeit-indoor-bouldering/id1521156087", "https://movementgyms.com/"],
    summary: "Rock climb.",
    categories: ["Exercise"],
  },
];

/**
 * function to select random unique interests or activities
 * @param {Array} element - array of interests or activities
 * @param {number} count - the max number of default interests or activities
 * @returns {Array}  array of randomly selected interests or activities
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
 * Creates users, interests, and activities to seed the database
 * @param {number} numUsers
 */
const seed = async (numUsers = 100) => {
  // Create interests in the database
  await prisma.interest.createMany({
    data: interests.map((interest) => ({ interest })),
  });

  await prisma.activity.createMany({ 
    data: activities,
  });

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

  // Get the recently created users from database
  const usersInDataBase = await prisma.user.findMany();

  // Get the recently created activities from database
  const activitiesInDataBase = await prisma.activity.findMany();

  // Get the recently created from database
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

  // Connect random users to each activity
  for (const activity of activitiesInDataBase) {
    const randomAttendees = getRandomFromDataBase(usersInDataBase, 10);
    await prisma.activity.update({
      where: { id: activity.id },
      data: {
        users: {
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
