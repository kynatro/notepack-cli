const groupNames = [
  'Project 1 / 2020-07-31 Note 1',
  'Project 2 / 2020-07-30 Note 2',
  'Project 3 / 2020-07-29 Note 3',
  'Project 3 / 2020-07-28 Note 4'
];

const todos = [
  {
    id: 1,
    filePath: './Project 1/2020-07-31 Note 1.md',
    fileName: '2020-07-31 Note 1.md',
    groupName: 'Project 1 / 2020-07-31 Note 1',
    todo: '- [ ] Todo 1',
    assignedTo: 'Me',
    assignedToAlias: 'Me',
    fileCreateTime: '2020-08-01T04:37:31.480Z',
    fileDate: '2020-07-31'
  },
  {
    id: 2,
    filePath: './Project 2/2020-07-30 Note 2.md',
    fileName: '2020-07-30 Note 2.md',
    groupName: 'Project 2 / 2020-07-30 Note 2',
    todo: '- [ ] @John Todo 1',
    assignedTo: 'John',
    assignedToAlias: 'Johnathan Doe',
    fileCreateTime: '2020-08-01T04:37:31.480Z',
    fileDate: '2020-07-30'
  },
  {
    id: 3,
    filePath: './Project 3/2020-07-29 Note 3.md',
    fileName: '2020-07-29 Note 3.md',
    groupName: 'Project 3 / 2020-07-29 Note 3',
    todo: '- [ ] @Jane Todo 1',
    assignedTo: 'Jane',
    assignedToAlias: 'Jane Doe',
    fileCreateTime: '2020-08-01T04:37:31.480Z',
    fileDate: '2020-07-29'
  },
  {
    id: 4,
    filePath: './Project 3/2020-07-28 Note 4.md',
    fileName: '2020-07-28 Note 4.md',
    groupName: 'Project 3 / 2020-07-28 Note 4',
    todo: '- [ ] @Jane Todo 2',
    assignedTo: 'Jane',
    assignedToAlias: 'Jane Doe',
    fileCreateTime: '2020-08-01T04:37:31.480Z',
    fileDate: '2020-07-28'
  },
  {
    id: 4,
    filePath: './Project 3/2020-07-28 Note 4.md',
    fileName: '2020-07-28 Note 4.md',
    groupName: 'Project 3 / 2020-07-28 Note 4',
    todo: '- [ ] @Jane Todo 3',
    assignedTo: 'Jane',
    assignedToAlias: 'Jane Doe',
    fileCreateTime: '2020-08-01T04:37:31.480Z',
    fileDate: '2020-07-28'
  }
];

module.exports = {
  groupNames,
  todos,
}