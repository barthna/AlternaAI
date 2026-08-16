# AlternaAI - AI-Powered Alternative Product Finder

AlternaAI is an intelligent, web-based alternative product finder designed for the Indian market. Built using **Flask** and powered by **Google Gemini 2.5 Flash**, AlternaAI helps users search for products, discover high-quality alternatives with real-time Indian market insights (prices in INR, availability, performance), and generate side-by-side comparisons.

## 🚀 Features

- **Smart Search & Alternative Finder**: Enter any product name to fetch concise details and find 4-5 practical alternatives.
- **Indian Market Oriented**: Displays realistic Indian market prices in INR (₹), local availability, and compatibility ratings.
- **Detailed Comparisons**: Select any alternative and generate side-by-side pros, cons, and performance comparisons.
- **Responsive Web Interface**: Sleek, modern, and interactive UI for seamless user experience.

---

## 🛠️ Technology Stack

- **Backend**: Python, Flask, Flask-CORS
- **AI Integration**: Google GenAI SDK (`gemini-2.5-flash`)
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
- **Environment**: Pydantic, Python-dotenv

---

## 📦 Installation & Setup

Follow these steps to set up and run AlternaAI locally:

### 1. Clone the Repository
```bash
git clone https://github.com/barthna/AlternaAI.git
cd AlternaAI
```

### 2. Set Up Virtual Environment (Optional but Recommended)
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Make sure you have the required dependencies installed:
```bash
pip install flask flask-cors google-genai pydantic python-dotenv
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run the Application
Launch the Flask development server:
```bash
python app.py
```
The app will run on `http://127.0.0.1:5000/`. Open it in your browser to start finding alternatives!

---

## 📂 Project Structure

```text
AlternaAI/
│
├── static/               # Frontend assets (CSS, JS)
├── templates/            # HTML templates (index.html)
├── app.py                # Main Flask application and API endpoints
├── gemini_service.py     # Gemini API integration service
├── main.py               # Entrypoint script
├── .env                  # Environment configuration (ignored by git)
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```
