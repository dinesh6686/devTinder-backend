# DevTinder APIs

authRouter(auth)

- POST /signup
- POST /login
- POST /logout

profileRouter(profile)

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password //forgot password-> take existing and new password, validate it, hash the new password only if the old password matched

connectionRequestRouter

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

userRouter

- GET /user/connections
- GET /user/requests
- GET /user/feed - Gets you the other users of the profile

Status: interested, ignored
reviewer status: accepted, rejected
