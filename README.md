Workcity Chat System - Backend

This repository contains the backend services for a real-time chat system designed for integration into an eCommerce platform. It enables authenticated users  to communicate seamlessly with customer support (designers, merchants, agents,admin). The system is built with Node.js, Express, and MongoDB, leveraging Socket.IO for real-time bidirectional communication.


Table of Contents

    Features

    Technologies Used

    Setup Instructions

    API Endpoints

    Challenges Faced

    Further Improvements

    Demo Video

    

Features

    JWT Authentication: Secure user registration and login using JSON Web Tokens.

    Role-Based Access Control: Supports various  roles: admin, agent, customer, designer, merchant.

    Real-time Messaging: Powered by Socket.IO for instant message delivery and updates.

    Conversation Management (CRUD):

        Create new conversations between users and customer support (admin, agent, designer, merchant).

        Retrieve historical messages within a conversation.

        Delete messages.

    

    Scalable Conversations: Designed to handle communication across different user types (e.g., buyer-to-designer, buyer-to-merchant, buyer-to-agent).

Technologies Used

    Node.js: JavaScript runtime environment.

    Express.js: Fast, unopinionated, minimalist web framework for Node.js.

    MongoDB: NoSQL database for flexible and scalable data storage.

    Mongoose: ODM (Object Data Modeling) library for MongoDB and Node.js.

    Socket.IO: Library for real-time web applications.

    jsonwebtoken: For implementing JWT authentication.

    bcryptjs: For password hashing.

    dotenv: For managing environment variables.

Setup Instructions
Prerequisites

    Node.js (v14 or higher)

    npm (Node Package Manager)

    MongoDB instance (local or cloud-hosted)

Steps

    Clone the repository:

    https://github.com/Nwike-badger/workcity-chat-backend.git
    cd workcity-chat-backend

    Install dependencies:

    npm install

    Create a .env file:
    In the root directory of the project, create a file named .env and add the following environment variables:

    PORT=5000
    MONGO_URI=mongodb://localhost:27017/workcity_chat
    JWT_SECRET=your_jwt_secret_key_here # Use a strong, random string
    FRONTEND_URL=http://localhost:5173

   

    Start the MongoDB server:
    Ensure your MongoDB server is running.

    Run the application:

    npm start

    The server will start on the specified PORT (default 5000).



The backend exposes a RESTful API for user management and conversation handling, augmented by Socket.IO events for real-time communication.
Authentication

    📡 REST API Endpoints

🔑 Auth

POST /api/auth/signup → Register new user

POST /api/auth/login → Login user

💬 Conversations

GET /api/conversations → Get all conversations for current user

POST /api/conversations → Create a new conversation

📩 Messages

GET /api/conversations/:id/messages → Get messages in a conversation

POST /api/conversations/:id/messages → Send a new message

Socket.IO Events

Client Emits:

    joinConversation: Joins a specific conversation room.

    sendMessage: Sends a new message to a conversation.


    typing: Notifies that the user is typing (bonus).

Server Emits:

    newMessage: A new message has been added to a conversation.

    messageRead: Messages in a conversation have been marked as read.

    userTyping: A user in the current conversation is typing (bonus).

    

Challenges Faced

    Real-time Synchronization: Ensuring messages are delivered instantly and consistently across all connected clients, especially with multiple user roles and concurrent conversations.

    Authentication and Authorization: Implementing robust JWT-based authentication and granular role-based authorization for various actions (e.g., who can create conversations with whom, who can view admin dashboard).

    Scalability for Diverse User Types: Designing the conversation and message schema to efficiently support communication flow between different user pairs (buyer-to-designer, buyer-to-merchant, etc.) while maintaining data integrity.

   

    

Further Improvements (Bonus Considerations)
    
    

    File Uploads: Integration with cloud storage (e.g., AWS S3, Cloudinary) for file sharing.

    Notifications: Implement push notifications or email notifications for unread messages.

    Online Status & Typing Indicators: Enhance the real-time experience with visible online statuses and typing indicators.

    Robust Error Logging: Integrate a more sophisticated logging system (e.g., Winston, Morgan).

    Rate Limiting: Protect API endpoints from abuse.

    Unit and Integration Tests: Add comprehensive test coverage.

                                        Video

      ## Demo Video

👉 [Watch the demo video here](https://www.loom.com/share/e5d9b76b29904052abe8765b3021f950?sid=4867e4be-f600-4dab-8679-6056740dd94e)
                                  
 
