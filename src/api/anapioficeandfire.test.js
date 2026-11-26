/* eslint-env jest */

const apiIceAndFire = require('./anapioficeandfire')

const endPoints = require('../__mocksData__/api.json')
const book3 = require('../__mocksData__/book3.json')
const houses = require('../__mocksData__/houses.json')
const houseAllyrion = require('../__mocksData__/houseAllyrion.json')

const HOUSE_ALLYRION = 'House Allyrion of Godsgrace';

jest.mock('./anapioficeandfire', () => {
    const originalModule = jest.requireActual('./anapioficeandfire');

    return {
        __esModule: true,
        ...originalModule,
        getListOfRestEndPoint: jest.fn(),
        getBookById: jest.fn(),
        getHouses: jest.fn(),
        getHouseByName: jest.fn(),
    };
});

// Every mocked end point answers the same way the `rest` client does:
// a promise resolved with a response object that keeps the payload in `entity`
const respondWith = (entity) => Promise.resolve({entity, status: {code: 200}, request: {}});

// create-react-app runs Jest with `resetMocks: true`, so the mocked
// implementations have to be installed before every single test
beforeEach(() => {
    apiIceAndFire.getListOfRestEndPoint.mockImplementation(() => respondWith(endPoints));
    apiIceAndFire.getBookById.mockImplementation((id) => respondWith(Number(id) === 3 ? book3 : {}));
    apiIceAndFire.getHouses.mockImplementation(() => respondWith(houses));
    apiIceAndFire.getHouseByName.mockImplementation((name) => respondWith(
        name === HOUSE_ALLYRION ? houseAllyrion : []
    ));
});

describe('#getListOfRestEndPoint() using Promises', () => {
    it('should load the list of end points', () => {
        expect.assertions(4);

        return apiIceAndFire.getListOfRestEndPoint()
            .then(data => {
                expect(data.entity.books).toBeDefined()
                expect(data.entity.books).toEqual('https://www.anapioficeandfire.com/api/books')
                expect(data.entity.houses).toBeDefined()
                expect(data.entity.houses).toEqual('https://www.anapioficeandfire.com/api/houses')
            })
    })

    it('should be called once without arguments', async () => {
        await apiIceAndFire.getListOfRestEndPoint();

        expect(apiIceAndFire.getListOfRestEndPoint).toHaveBeenCalledTimes(1)
        expect(apiIceAndFire.getListOfRestEndPoint).toHaveBeenCalledWith()
    })
});

describe('#getBookById(3) - https://www.anapioficeandfire.com/api/books/3', () => {
    it('should request the book with id 3', async () => {
        await apiIceAndFire.getBookById(3);

        expect(apiIceAndFire.getBookById).toHaveBeenCalledTimes(1)
        expect(apiIceAndFire.getBookById).toHaveBeenCalledWith(3)
    })

    it('should respond with status code 200', async () => {
        const {status} = await apiIceAndFire.getBookById(3);

        expect(status.code).toEqual(200)
    })

    it('should load "A Storm of Swords" book data', async () => {
        const {entity} = await apiIceAndFire.getBookById(3);

        expect(entity).toBeDefined()
        expect(entity.url).toEqual('https://www.anapioficeandfire.com/api/books/3')
        expect(entity.name).toEqual('A Storm of Swords')
        expect(entity.isbn).toEqual('978-0553106633')
        expect(entity.numberOfPages).toEqual(992)
        expect(entity.publisher).toEqual('Bantam Books')
        expect(entity.country).toEqual('United States')
        expect(entity.mediaType).toEqual('Hardcover')
        expect(entity.released).toEqual('2000-10-31T00:00:00')
    })

    it('should contain the book author', async () => {
        const {entity} = await apiIceAndFire.getBookById(3);

        expect(Array.isArray(entity.authors)).toBe(true)
        expect(entity.authors).toContain('George R. R. Martin')
    })

    it('should contain the whole book contract', async () => {
        const {entity} = await apiIceAndFire.getBookById(3);

        expect(entity).toEqual(expect.objectContaining({
            url: expect.any(String),
            name: expect.any(String),
            isbn: expect.any(String),
            authors: expect.any(Array),
            numberOfPages: expect.any(Number),
            publisher: expect.any(String),
            country: expect.any(String),
            mediaType: expect.any(String),
            released: expect.any(String),
            characters: expect.any(Array),
            povCharacters: expect.any(Array)
        }))
    })

    it('should contain links to characters and POV characters', async () => {
        const {entity} = await apiIceAndFire.getBookById(3);

        expect(entity.characters.length).toBeGreaterThan(0)
        expect(entity.povCharacters.length).toBeGreaterThan(0)
        entity.characters.forEach(character => {
            expect(character).toMatch(/^https:\/\/www\.anapioficeandfire\.com\/api\/characters\/\d+$/)
        })
    })

    it('should return an empty entity for an unknown book id', async () => {
        const {entity} = await apiIceAndFire.getBookById(99999);

        expect(entity).toEqual({})
    })
});

describe('#getHouses() - https://www.anapioficeandfire.com/api/houses', () => {
    it('should request the list of houses without arguments', async () => {
        await apiIceAndFire.getHouses();

        expect(apiIceAndFire.getHouses).toHaveBeenCalledTimes(1)
        expect(apiIceAndFire.getHouses).toHaveBeenCalledWith()
    })

    it('should load a non empty list of houses', async () => {
        const {entity} = await apiIceAndFire.getHouses();

        expect(entity).toBeDefined()
        expect(Array.isArray(entity)).toBe(true)
        expect(entity.length).toBeGreaterThan(0)
    })

    it('should return houses with the expected contract', async () => {
        const {entity} = await apiIceAndFire.getHouses();

        entity.forEach(house => {
            expect(house).toEqual(expect.objectContaining({
                url: expect.any(String),
                name: expect.any(String),
                region: expect.any(String),
                coatOfArms: expect.any(String),
                words: expect.any(String),
                titles: expect.any(Array),
                seats: expect.any(Array),
                ancestralWeapons: expect.any(Array),
                cadetBranches: expect.any(Array),
                swornMembers: expect.any(Array)
            }))
        })
    })

    it('should contain the first house of the first page', async () => {
        const {entity} = await apiIceAndFire.getHouses();

        expect(entity[0].name).toEqual('House Algood')
        expect(entity[0].url).toEqual('https://www.anapioficeandfire.com/api/houses/1')
    })

    it(`should contain "${HOUSE_ALLYRION}"`, async () => {
        const {entity} = await apiIceAndFire.getHouses();
        const names = entity.map(house => house.name);

        expect(names).toContain(HOUSE_ALLYRION)
    })
});

describe(`#getHouseByName() - "${HOUSE_ALLYRION}"`, () => {
    it('should request the house by its exact name', async () => {
        await apiIceAndFire.getHouseByName(HOUSE_ALLYRION);

        expect(apiIceAndFire.getHouseByName).toHaveBeenCalledTimes(1)
        expect(apiIceAndFire.getHouseByName).toHaveBeenCalledWith(HOUSE_ALLYRION)
    })

    it('should return exactly one house', async () => {
        const {entity} = await apiIceAndFire.getHouseByName(HOUSE_ALLYRION);

        expect(Array.isArray(entity)).toBe(true)
        expect(entity).toHaveLength(1)
    })

    it('should load the house data', async () => {
        const [house] = (await apiIceAndFire.getHouseByName(HOUSE_ALLYRION)).entity;

        expect(house.url).toEqual('https://www.anapioficeandfire.com/api/houses/2')
        expect(house.name).toEqual(HOUSE_ALLYRION)
        expect(house.region).toEqual('Dorne')
        expect(house.coatOfArms).toEqual('Gyronny Gules and Sable, a hand couped Or')
        expect(house.words).toEqual('No Foe May Pass')
        expect(house.seats).toEqual(['Godsgrace'])
    })

    it('should have a current lord, an heir and an overlord', async () => {
        const [house] = (await apiIceAndFire.getHouseByName(HOUSE_ALLYRION)).entity;

        expect(house.currentLord).toEqual('https://www.anapioficeandfire.com/api/characters/298')
        expect(house.heir).toEqual('https://www.anapioficeandfire.com/api/characters/1922')
        expect(house.overlord).toEqual('https://www.anapioficeandfire.com/api/houses/285')
    })

    it('should have sworn members and no cadet branches', async () => {
        const [house] = (await apiIceAndFire.getHouseByName(HOUSE_ALLYRION)).entity;

        expect(house.swornMembers).toHaveLength(4)
        expect(house.swornMembers).toContain('https://www.anapioficeandfire.com/api/characters/298')
        expect(house.cadetBranches).toEqual([])
        expect(house.ancestralWeapons).toEqual([])
    })

    it('should not be died out', async () => {
        const [house] = (await apiIceAndFire.getHouseByName(HOUSE_ALLYRION)).entity;

        expect(house.diedOut).toEqual('')
    })

    it('should match the stored snapshot', async () => {
        const {entity} = await apiIceAndFire.getHouseByName(HOUSE_ALLYRION);

        expect(entity).toMatchSnapshot()
    })

    it('should return an empty list for an unknown house name', async () => {
        const {entity} = await apiIceAndFire.getHouseByName('House Of The Dragon');

        expect(entity).toEqual([])
    })
});
