
export function handleResponse(res: any, code: any, statusMsg: any, payload: any = {}) {
  /* Returns a user if user, else {status: message}
  * */
 try {
   if (payload) {
     if (payload.message) {
       console.error(`Payload with error message:`, payload.message)
     }
     payload.statusText = statusMsg;
     return res.status(code).json(payload);
   }
   res.status(code).json({
     status: code,
     statusText: statusMsg});
 } catch (err) {
   console.error(`Caught error on handleResponse: ${err}`)
 }
}

export function handleError(res: any, err: Error, endpoint: string) {
  console.warn(`Error on /${endpoint}: , ${err}`)
    return res.status(500).json({
      error: `${err}`
    })
}