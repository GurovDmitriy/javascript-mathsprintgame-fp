/* eslint-disable no-undef */
/* eslint-disable no-console */
const fs = require("fs")
const faker = require("faker")
const POSTS_COUNT = 10
const USERS_COUNT = 10
const data = {
  posts: [],
  users: [
    {
      id: 1,
      userName: "admin",
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: "admin@admin.com",
      password: "$2a$12$nzHIs73F29fZTgYs3nNYz.Ihe8uIyS.zYZ6cmwgXSt2DEsKcY/6eu",
    },
  ],
}

function randomInteger(min, max) {
  const rand = min - 0.5 + Math.random() * (max - min + 1)
  return Math.round(rand)
}

for (let i = 1; i <= POSTS_COUNT; i++) {
  data.posts.push({
    id: i,
    userId: randomInteger(1, USERS_COUNT),
    title: faker.lorem.word(),
    previewText: faker.lorem.words(),
    content: faker.lorem.paragraph(),
    thumbnail: faker.image.image(),
  })
}

for (let i = 2; i <= USERS_COUNT; i++) {
  data.users.push({
    id: i,
    userName: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  })
}

fs.writeFile("data/db.json", JSON.stringify(data), (err) => {
  if (err) {
    console.log("error", err)
  }
})

console.log(
  `DB successfully created!
    ---
    default username: admin,
            password: 123456`
)
