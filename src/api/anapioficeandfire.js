const rest = require('rest');
const mime = require('rest/interceptor/mime');

const request = rest.wrap(mime);

const BASE_URL = 'https://www.anapioficeandfire.com/api';

/**
 * Returns the map of all available REST end points
 * @returns {Promise<{entity: Object}>}
 */
const getListOfRestEndPoint = () => request(`${BASE_URL}`)

/**
 * Returns the list of all books
 * @returns {Promise<{entity: Object[]}>}
 */
const getBooks = () => request(`${BASE_URL}/books`)

/**
 * Returns a single book by its id, e.g. 3 for "A Storm of Swords"
 * @param id {number|string}
 * @returns {Promise<{entity: Object}>}
 */
const getBookById = (id) => request(`${BASE_URL}/books/${id}`)

/**
 * Returns the list of houses
 * @returns {Promise<{entity: Object[]}>}
 */
const getHouses = () => request(`${BASE_URL}/houses`)

/**
 * Returns the list of houses filtered by an exact name,
 * e.g. 'House Allyrion of Godsgrace'
 * @param name {string}
 * @returns {Promise<{entity: Object[]}>}
 */
const getHouseByName = (name) => request(`${BASE_URL}/houses?name=${encodeURIComponent(name)}`)

export {getListOfRestEndPoint, getBooks, getBookById, getHouses, getHouseByName}
