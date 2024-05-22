// helpers/uuid.js
const { v4: uuidv4 } = require('uuid');

const generateCustomId = (name, color) => {
    return `${name}-${color}-${uuidv4()}`;
};

module.exports = { generateCustomId };
