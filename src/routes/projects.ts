import * as express from 'express';
import { LoremIpsum } from 'lorem-ipsum';
import { handleResponse, handleError } from './helpers';
const appApi = express.Router()

appApi.post('/get-project', async (req, res, next)  => {
  const id = req.body.id;
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
  });
  try {
    // TODO: get project by ID and its metadata
    // const result = await dbService.query(SQL`
    //   SELECT * from projects
    //   WHERE id = ${id};
    //   `)
    // const user = result.rows[0]
    const devBudget = [
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
      { name: lorem.generateSentences(1), description: lorem.generateSentences(2), amount: Math.round(100 * Math.random() * 100) / 100 },
    ]
    const totalBudget = devBudget.reduce((acc, val) => acc + val.amount, 0)
    let project = {
      id,
      projectTitle: 'Amazing Project',
      shortDescription: lorem.generateSentences(1),
      summary: lorem.generateSentences(5),
      background: lorem.generateParagraphs(2),
      detailedDescription: lorem.generateParagraphs(4),
      projectImpact: lorem.generateSentences(5),
      location: "Buenos Aires, Argentina",
      selectedCategories: [
        { text: "Education", id: 1 },
        { text: "Environment", id: 2 },
        { text: "Children", id: 7 },
      ],
      organizationName: 'The amazing organization',
      organizationDescription: 'Helping people do amazing things',
      organizationWebsite: 'www.amazing.com',
      projectAdministrators: ['Pablo Gordo'],
      projectAmbassadors: ['Antoine Vaquero'],
      milestones: [
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
        { name: lorem.generateSentences(1), description: lorem.generateSentences(3), start: new Date() },
      ],
      budget: devBudget,
      totalBudget,
      raised: totalBudget * Math.random(),
      threshold: totalBudget,
      startDate: new Date(),
      whatWith5: lorem.generateSentences(1),
      whatWith10: lorem.generateSentences(1),
      whatWith25: lorem.generateSentences(1),
      whatWith100: lorem.generateSentences(1),
      whatWith200: lorem.generateSentences(1),
      whatWith500: lorem.generateSentences(1),
    }

    let projectWithMetadata = Object.assign(project, {
      projectHolder: {
        email: 'dummy@email.com',
        userName: 'El Vaquero',
        firstName: 'Antonio',
        lastName: 'Vaquero',
        avatar: 'any;',}
    });

    if (projectWithMetadata) {
      return handleResponse(res, 200, 'success', projectWithMetadata);
    }
    return res.status(404).send("No campaigns found")
  } catch (err) {
    return handleError(res, err, 'get-campaigns')
  }
})

module.exports = appApi;