const mockInsertMany = jest.fn(async () => Promise.resolve('insertMany'));
const mockFindOne = jest.fn(async () => Promise.resolve('findOne'));
const mockFind = jest.fn().mockReturnThis();
const mockInsertOne = jest.fn(async () => Promise.resolve('insertOne'));
const mockLimit = jest.fn().mockReturnThis();
const mockSort = jest.fn().mockReturnThis();
const mockToArray = jest.fn().mockReturnThis();
const mockClose = jest.fn();

let mockCollection = jest.fn(() => ({
  insertMany: mockInsertMany,
  insertOne: mockInsertOne,
  findOne: mockFindOne,
  find: mockFind,
  limit: mockLimit,
  sort: mockSort,
  toArray: mockToArray,
}));

class MongoClient {
  constructor() {
    this.connect = async () => Promise.resolve('connected');
    this.close = mockClose;
    this.db = () => ({
      collection: mockCollection,
    });
  }
}

export {
  MongoClient,
  mockInsertMany,
  mockFindOne,
  mockFind,
  mockInsertOne,
  mockLimit,
  mockSort,
  mockToArray,
  mockClose,
};
