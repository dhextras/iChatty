# iChatty

iChatty is a web application that offers real-time chat-based support for individuals seeking therapy or emotional assistance. It combines the power of AI-driven mood detection with live chat to create a personalized, responsive mental health experience.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dhextras/iChatty.git
   ```

2. Install dependencies:

   ```bash
   cd iChatty
   npm install
   ```

3. Set up Supabase:

   - Create a new Supabase project at [https://supabase.com](https://supabase.com).
   - After creating the project, Supabase will provide you with the API URL and the `anon` key.
   - Run the below command to generate a session secret:

     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

   - Create a new GPT API key at [Openai API Keys page](https://platform.openai.com/account/api-keys).

   - Copy the `.env.example` file to a new file called `.env`:

     ```bash
     cp .env.example .env
     ```

   - Open the `.env` file and replace the placeholders with your actual Supabase API URL, `anon` key, and session secret:

     ```
     SUPABASE_URL=YOUR_SUPABASE_URL
     SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     SESSION_SECRET=THE_32_BYTES_SESSION_SECRET

     OPENAI_API_KEY=YOUR-SECRET-OPENAI-API-KEY
     ```

4. Create the necessary database tables by running the following SQL queries in the Supabase SQL Editor:

   ```sql
   -- Create devices table
   CREATE TABLE devices (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     device_id TEXT NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create chat_sessions table
   CREATE TABLE chat_sessions (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     device_id TEXT NOT NULL REFERENCES devices(device_id),
     start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     end_time TIMESTAMP WITH TIME ZONE,
     summary TEXT,
     mood_score INTEGER NOT NULL, -- Scale from 0-100
   );

   -- Enable Row Level Security
   ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

   -- Create policies for devices table
   CREATE POLICY "Public read access for devices" 
   ON devices FOR SELECT USING (true);

   CREATE POLICY "Insert allowed for anyone with device_id" 
   ON devices FOR INSERT WITH CHECK (true);

   CREATE POLICY "Update allowed for device owners" 
   ON devices FOR UPDATE USING (device_id = current_setting('app.current_device_id', true)::text);

   -- Create policies for chat_sessions table
   CREATE POLICY "Public read access for sessions by device_id" 
   ON chat_sessions FOR SELECT USING (device_id = current_setting('app.current_device_id', true)::text);

   CREATE POLICY "Insert allowed for device owners" 
   ON chat_sessions FOR INSERT WITH CHECK (device_id = current_setting('app.current_device_id', true)::text);

   CREATE POLICY "Update allowed for device owners" 
   ON chat_sessions FOR UPDATE USING (device_id = current_setting('app.current_device_id', true)::text);

   -- Create function to set device_id as a parameter for policies
   CREATE OR REPLACE FUNCTION set_device_id_claim(device_id TEXT)
   RETURNS void AS $$
   BEGIN
     PERFORM set_config('app.current_device_id', device_id, false);
   END;
   $$ LANGUAGE plpgsql;
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be running at `http://localhost:3000`.

## Deployment to VPS

To deploy iChatty to a VPS and manage it using PM2 for process management and Caddy for SSL and reverse proxy:

1. Install PM2 globally (if not already installed):

   ```bash
   npm install pm2 -g
   ```

2. Build and start the server with PM2:

   ```bash
   pm2 start npm --name "i_chatty" -- start --watch
   ```

   This command will start the application using PM2, which will manage the Node.js process, restart it on failures, and allow easy monitoring.

3. Set up Caddy for SSL and reverse proxy:

   - Install Caddy on your VPS. Visit [Caddy's official website](https://caddyserver.com/) for installation instructions.

   - Configure Caddy to serve your application and manage SSL certificates for HTTPS. Here's a basic Caddyfile example:

     ```
     yourdomain.com {
       reverse_proxy localhost:3000
       tls your@email.com
     }
     ```

     Replace `yourdomain.com` with your actual domain and `localhost:3000` with the address where your Node.js application is running.

4. Configure DNS forwarding:

   Configure DNS forwarding on your hosting provider to link your domain with your VPS's IP address.

5. Access your application:

   Once DNS propagation is complete, you can access iChatty at your configured domain over HTTPS.

---

# FOR THE DEVS!!

Following these coding guidelines will help keep our codebase clean, consistent, and easier to maintain. Trust me, your future self (and your fellow devs) will thank you!

[Check them out here](https://gist.github.com/dhextras/77cffdb7eaaa574952828067c79de1a2):

