import app from '../../index'
import request = require('supertest')

describe('api/get-profile', () => {
  // let server: any;

  describe('POST: get user profile with wrong user email', () => {

    // beforeAll(() => {
    //   server = app.listen()
    // })

    // afterEach(async () => {
    //   server.close()
    // });

    const body = {
      "user": {
        "email": "pablo@admin2.com",
      }
    }

    test('should NOT return profile', async () => {
      const res = await request(app).post('/api/get-profile').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(404)
      expect(res.text).toBe('User does not exist')
      expect(res.error).not.toBe(undefined)
    })
  })

  describe('POST: get user profile with correct user email', () => {
    const email = 'pablo@admin.com'
    const body = {
      "user": {
        "email": email,
      }
    }

    test('should return user', async () => {
      const res = await request(app).post('/api/get-profile').send(Object.assign(body, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }))
      expect(res.status).toEqual(200)
      expect(res.body.statusText).toBe('success')
      expect(res.body.email).toBe(email)
      expect(res.body.user_name).toBe('pablo')
    })
  })
})