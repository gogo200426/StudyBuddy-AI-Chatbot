# StudyBuddy — AI Memory Chatbot

StudyBuddy is an AI-powered learning chatbot built with Python and Flask. It provides a simple chat interface and maintains conversation history so users can continue multi-turn conversations.

## Features

- AI-powered responses using the Google Gemini API
- Flask backend and web-based chat interface
- SQLite database for conversation history
- Long-term memory for selected user preferences and facts
- Context-window management using recent conversation messages
- Error handling for API failures and rate limits
- Chat clearing functionality while preserving saved memories

## Technologies Used

- Python
- Flask
- Google Gemini API
- SQLite
- HTML, CSS and JavaScript

## Setup Instructions

1. Install Python and Git.
2. Clone this repository.
3. Install the dependencies:

   `pip install -r requirements.txt`

4. Create a `.env` file in the project root:

   `GEMINI_API_KEY=your_api_key_here`

5. Run the application:

   `python app.py`

6. Open `http://127.0.0.1:5000` in your browser.

## Security

Never commit your `.env` file, API keys, or private database to GitHub.

## Project Status

Developed as an AI chatbot project for learning and internship practice.