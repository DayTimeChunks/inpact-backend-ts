// import { PostgresService } from "../../services/PostgresService";
// import { BaseConfiguration } from "../../conf/BaseConfiguration";
import request = require('supertest');
import app from '../../index'

describe('/api', () => {
  describe('GET /test', () => {
    test('should return one user', async () => {
      const res = await request(app).get('/api/test')
      expect(res.status).toEqual(200)
      expect(res.body).toHaveProperty('email')
      expect(res.body.email).toBe('pablo@admin.com')
    })
  })
})