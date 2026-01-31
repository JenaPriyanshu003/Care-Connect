# Care-Connect

## Setup
### MongoDB
To use the Medication Tracker, you must set up a MongoDB database:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Get the connection string (URI).
3. Add it to your `.env` locally (if using `vercel dev`) or Vercel Environment Variables as `MONGODB_URI`.

### AI Features
Add `VITE_GEMINI_API_KEY` and `VITE_GROQ_API_KEY` to your environment variables.