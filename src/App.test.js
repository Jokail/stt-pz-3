/* eslint-env jest */

import {render, screen} from '@testing-library/react';
import renderer, {act} from "react-test-renderer";
import App from './App';
import {getListOfRestEndPoint} from './api/anapioficeandfire';

const endPoints = require('./__mocksData__/api.json')

// The App is tested against mocked API data, so the test suite
// never depends on a real network connection
jest.mock('./api/anapioficeandfire', () => ({
  __esModule: true,
  getListOfRestEndPoint: jest.fn(),
}));

// create-react-app runs Jest with `resetMocks: true`, so the mocked
// implementation has to be installed before every single test
beforeEach(() => {
  getListOfRestEndPoint.mockImplementation(() => Promise.resolve({entity: endPoints}));
});

test('renders learn anapioficeandfire link', async () => {
  render(<App/>);

  const linkElement = screen.getByText(/Learn An API of Ice And Fire/i);
  expect(linkElement).toBeInTheDocument();

  await screen.findByText('books');
});

test('requests the list of API end points once', async () => {
  render(<App/>);

  expect(getListOfRestEndPoint).toHaveBeenCalledTimes(1);

  await screen.findByText('books');
});

test('renders a link for every end point from the API', async () => {
  render(<App/>);

  await screen.findByText('books');

  const hrefs = screen.getAllByRole('link').map(link => link.getAttribute('href'));

  Object.entries(endPoints).forEach(([name, url]) => {
    expect(screen.getByText(name)).toBeInTheDocument();
    expect(hrefs).toContain(url);
  });
});

test("Matches DOM Snapshot", async () => {
  let tree;

  await act(async () => {
    tree = renderer.create(<App/>);
  });

  expect(tree.toJSON()).toMatchSnapshot();
});
