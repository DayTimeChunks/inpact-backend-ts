import request = require('supertest');
import app from '../../index'
import { BaseConfiguration } from '../../conf';
import { PostgresService } from '../../services';
import SQL = require('sql-template');

async function deleteUser(email: string) {
  const configuration = new BaseConfiguration();
  const pgService = new PostgresService(configuration.InpactRdsConfig)
  await pgService.query(SQL`
    DELETE FROM public.users
    WHERE email = ${email}
  `)
}
describe('api/register', () => {

  const body = {
    "email": "peter@test1.com",
    "password": "password",
    "first_name": "Peter",
    "last_name": "Still",
  }

  describe('GET: general /test endpoint', () => {
    test('should return user of pablo as admin', async () => {
      const res = await request(app).get('/api/test')
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('email')
      expect(res.body.email).toBe('pablo@admin.com')
    }, 20000)
  })

  describe('POST: register new user', () => {

    afterAll(async (done) => {
      await deleteUser('peter@test1.com')
      done();
    })

    test('should not create new user if not all details are included', async () => {

      const incompleteBody = {
        "email": "peter@test1.com",
        "password": "password",
        "first_name": "",
        "last_name": "",
      }
      const res = await request(app).post('/api/register').send(Object.assign(incompleteBody, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(400)
      expect(res).toHaveProperty('text');
    })

    test('should create new user in DB', async () => {
      const res = await request(app).post('/api/register').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user_name');
    })

    test('should not create new user if email already exists', async () => {
      const res = await request(app).post('/api/register').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(400)
      expect(res.body.statusText).toBe('User email already exists');
    })
  })
})

