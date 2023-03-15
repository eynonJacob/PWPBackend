const users = [
  {
    id: 1,
    name: "administrator",
    email: "1",
    password: "12345",
  },
  {
    id: 2,
    name: "Jacob Eynon",
    email: "2",
    password: "12345",
  },
  {
    id: 3,
    name: "Sam Booth",
    email: "3",
    password: "12345",
  },
];

const getUsers = () => users;

const getUserById = (id) => users.find((user) => user.id === id);

const getUserByEmail = (email) => users.find((user) => user.email === email);

const addUser = (user) => {
  user.id = users.length + 1;
  users.push(user);
};

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
};
