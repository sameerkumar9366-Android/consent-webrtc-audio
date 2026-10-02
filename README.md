# Consent WebRTC Audio

A small two-device WebRTC microphone demo.

## Run locally
1. Install Node.js.
2. In this folder run:
   npm install
   npm start
3. Open http://localhost:3000 on the devices.

For a deployed site, use HTTPS. Browser microphone access generally requires a secure context.

## Important
This project is intentionally consent-based:
- The microphone owner must click "Allow & Start Mic".
- The browser permission prompt must be accepted.
- The owner can stop the microphone.
- It does not provide hidden microphone activation or covert recording.

For production use, add authentication, short-lived room tokens, access controls, logging, and a TURN server.
