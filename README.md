# Discord AutoStore Bot

A comprehensive Discord bot for managing an automated store with products, mediation services, reputation system, and ticket management.

## Features

### 🛍️ Store Management
- **Product Management**: Add, edit, remove products with real-time updates
- **Midman Services**: Mediation services for secure transactions
- **Payment Methods**: Configurable payment options
- **Store Status**: Open/close store with visual indicators
- **Auto-updating Store Display**: Real-time embed updates every 5 seconds

### 👥 User Features
- **Reputation System**: Give and check reputation points
- **Report System**: Report users with moderation actions
- **Ticket System**: Automated ticket creation for purchases and mediation
- **Interactive UI**: Buttons and modals for seamless experience

### 🔧 Moderation Tools
- **Channel Configuration**: Set up various log and feedback channels
- **Report Management**: Handle reports with ban, kick, warn, or custom responses
- **Role Management**: Automatic role assignment for buyers and midman participants
- **Comprehensive Logging**: Track all activities with detailed logs

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Discord bot token and role IDs
   - Set up MongoDB connection string

4. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - The bot will automatically create the required collections

5. **Configure Discord**:
   - Create channels for store, logs, and categories
   - Set up roles (Seller, Buyer, Midman)
   - Update channel and role IDs in `.env`

## Configuration

### Required Environment Variables

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
SELLER_ROLE_ID=your_seller_role_id_here
BUYER_ROLE_ID=your_buyer_role_id_here
MIDMAN_ROLE_ID=your_midman_role_id_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017

# Channel IDs
MAIN_CHANNEL_ID=your_main_store_channel_id
BUY_CATEGORY_ID=your_buy_tickets_category_id
MIDMAN_CATEGORY_ID=your_midman_tickets_category_id
```

### Discord Setup

1. **Create Bot**: Go to Discord Developer Portal and create a new bot
2. **Get Token**: Copy the bot token to your `.env` file
3. **Bot Permissions**: Give your bot the following permissions:
   - Send Messages
   - Use Slash Commands
   - Manage Channels
   - Manage Messages
   - Embed Links
   - Read Message History
   - Ban Members
   - Kick Members

## Usage

### Running the Bot

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Commands

#### Customer Commands
- `/reps <user> <reason>` - Give reputation to a user
- `/repstat <user>` - Check user reputation status  
- `/report <user> <reason> [attachment]` - Report a user

#### Seller Commands
- `/addproduct <code> <name> <quantity> <price>` - Add new product
- `/editproduct <code> [newname] [newquantity] [newprice]` - Edit product
- `/removeproduct <code>` - Remove product
- `/addmidman <code> <nominal> <price>` - Add midman service
- `/editmidman <code> [nominal] [price]` - Edit midman service
