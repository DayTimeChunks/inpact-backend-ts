import { PostgresService } from "../../services/PostgresService";
import { BaseConfiguration } from "../../conf/BaseConfiguration";
import SQL = require("sql-template");
import request = require('supertest');
import app from '../../index'

describe('/api', () => {

  describe('Check database setup', () => {
    test('DB should not be empty', async () => {
      const dbService = new PostgresService(BaseConfiguration.getTestRdsValues())
      const result = await dbService.query(SQL`
        SELECT * from users
      `)
      expect(result.rows.length).toBe(4)
    }, 5000)
  })

  describe('GET /test', () => {
    test('should return one user', async () => {
      const res = await request(app).get('/api/test')
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('email')
      expect(res.body.email).toBe('pablo@admin.com')
    }, 20000)
  })

  describe('POST /users/login with WRONG password', () => {

    test('Should not return user object', async () => {
      const body = { "user": {
          "email": "pablo@admin.com",
          "password": "wrong-password"
        }
      }
      const res = await request(app).post('/api/users/login').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(404)
      expect(res.body).toHaveProperty('statusText') // User not found
      expect(res.body.statusText).toBe('User not found or password was incorrect');
    }, 5000) // add timeout to allow time for completion

  })

  describe('POST /users/login with GOOD password', () => {
    test('Should return user with token', async () => {
      const body = { "user": {
          "email": "pablo@admin.com",
          "password": "password"
        }
      }
      const res = await request(app).post('/api/users/login').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('username');
      expect(res.body).toHaveProperty('token');
      expect(res.body.statusText).toBe('success');
    }, 5000) // add timeout to allow time for completion
  })


})