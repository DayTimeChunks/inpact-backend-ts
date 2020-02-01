import request = require('supertest');
import app from '../../index'
import SQL = require('sql-template');
import { BaseConfiguration } from '../../conf';
import { PostgresService } from '../../services';


async function resetUser(email: string) {
  const configuration = new BaseConfiguration();
  const pgService = new PostgresService(configuration.InpactRdsConfig)
  await pgService.query(SQL`
    UPDATE users
    SET interests=NULL
    WHERE email = ${email}
  `)
}

describe('api/update-profile', () => {

  afterAll(async () => await resetUser('pablo@admin.com'))

  describe('POST: update user profile "interests" field', () => {
    const email = 'pablo@admin.com'
    const body = {
      "user": {
        "email": email,
        "interests": "surfing"
      }
    }

    test('should return updated user', async (done) => {
      const res = await request(app).post('/api/update-profile').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(200)
      expect(res.body.statusText).toBe('success')
      expect(res.body.email).toBe(email)
      expect(res.body.username).toBe('pablo')
      expect(res.body.interests).toBe('surfing')
      done()
    })
  })
})