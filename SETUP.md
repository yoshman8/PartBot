## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/PartMan7/PartBot.git
   cd PartBot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   Modify the `.env` file (which is automatically copied from `.env.example`). Usually you'll only have `USE_PS=true`;
   the other modules likely won't be used.

4. **Start the bot**
   ```bash
   npm start
   ```

To connect to a localhost instance, modify `@/ps/index.ts` to have `server: 'localhost:8000'` and `serverProtocol: 'ws'`.
