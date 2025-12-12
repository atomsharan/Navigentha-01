from rest_framework.decorators import api_view
from rest_framework.response import Response
from chat.career_bot import chat_with_bot
"""Careerbot minimal endpoints.

Note: We avoid DB writes here to keep local setup simple.
"""

# Dummy knowledge base (you can replace with AI or database later)
career_roadmaps = {
    "computer science": [
        "Learn Programming Fundamentals (Python, Java, C++)",
        "Data Structures & Algorithms",
        "Database Management & SQL",
        "Web Development (Frontend + Backend)",
        "Operating Systems & Computer Networks",
        "Machine Learning / AI (optional specialization)",
        "Internships + Projects",
        "Placements / Higher Studies",
    ],
    "data science": [
        "Learn Python & Statistics",
        "Data Analysis with Pandas, Numpy",
        "SQL & Databases",
        "Machine Learning (Scikit-learn, TensorFlow)",
        "Data Visualization (Matplotlib, PowerBI, Tableau)",
        "Big Data Tools (Spark, Hadoop)",
        "Capstone Projects & Internships",
    ],
    "web development": [
        "HTML, CSS, JavaScript",
        "Frontend Framework (React / Angular / Vue)",
        "Backend Framework (Django / Node.js / Flask)",
        "Databases (MySQL, MongoDB, PostgreSQL)",
        "APIs & Authentication",
        "Cloud Deployment (AWS, Azure, Heroku)",
        "Projects + Freelance/Internships",
    ],
}

# Chat API
@api_view(['POST'])
def ask_chatbot(request):
    user_question = request.data.get("question", "")

    if not user_question:
        return Response({"error": "Please provide a question"}, status=400)

    # Simple rule-based bot
    if "hello" in user_question.lower():
        bot_reply = "Hello! How can I help you today?"
    elif "career" in user_question.lower():
        bot_reply = "Tell me your field of interest, I can suggest a roadmap."
    else:
        bot_reply = "I'm still learning 🤖, but I can help with careers like Computer Science, Data Science, or Web Development."

    return Response({"question": user_question, "answer": bot_reply})


# Career Roadmap API
@api_view(['GET'])
def career_roadmap(request):
    career = request.GET.get("career", "").lower()

    if not career:
        return Response({"error": "Please provide a career field"}, status=400)

    roadmap = career_roadmaps.get(career)

    if not roadmap:
        return Response({"error": "Career not found. Try Computer Science, Data Science, or Web Development."}, status=404)

    return Response({"career": career.title(), "roadmap": roadmap})


# Assessment API used by frontend ChatbotDialog
@api_view(['POST'])
def assessment(request):
    """Accepts a lightweight assessment form and returns AI-generated summary and career guidance.

    Expected JSON:
    { name, educationLevel, interests, goals }
    """
    payload = {
        "name": request.data.get("name", ""),
        "educationLevel": request.data.get("educationLevel", ""),
        "interests": request.data.get("interests", ""),
        "goals": request.data.get("goals", ""),
    }

    # Minimal validation
    if not payload["name"]:
        return Response({"error": "Name is required"}, status=400)

    # Build a comprehensive prompt for AI to generate summary and guidance
    assessment_prompt = f"""Based on the following assessment, provide:
1. A brief summary of the person (2-3 sentences)
2. Top 3-4 career recommendations that match their profile
3. A clear action plan/roadmap with 5-7 specific next steps

Assessment Details:
- Name: {payload['name']}
- Education Level: {payload['educationLevel']}
- Interests: {payload['interests']}
- Career Goals: {payload['goals']}

Please format your response as:
SUMMARY: [2-3 sentence summary about the person]
CAREERS: [Career 1 (confidence: X%), Career 2 (confidence: Y%), Career 3 (confidence: Z%)]
ROADMAP: [Step 1, Step 2, Step 3, Step 4, Step 5]"""

    try:
        # Use AI to generate summary and guidance
        ai_response = chat_with_bot(assessment_prompt)
        ai_text = ai_response.get("reply", "")
        
        # Parse the AI response
        summary = ""
        careers = []
        roadmap = []
        
        # Extract summary
        if "SUMMARY:" in ai_text:
            summary_part = ai_text.split("SUMMARY:")[1].split("CAREERS:")[0].strip()
            summary = summary_part
        else:
            # Fallback: use first paragraph as summary
            summary = ai_text.split("\n\n")[0] if "\n\n" in ai_text else ai_text[:200]
        
        # Extract careers
        if "CAREERS:" in ai_text:
            careers_part = ai_text.split("CAREERS:")[1].split("ROADMAP:")[0].strip()
            # Parse career recommendations
            career_lines = [line.strip() for line in careers_part.split("\n") if line.strip() and "(" in line]
            for line in career_lines[:4]:  # Max 4 careers
                if "(" in line and ")" in line:
                    career_name = line.split("(")[0].strip()
                    confidence_str = line.split("(")[1].split(")")[0].replace("confidence:", "").replace("%", "").strip()
                    try:
                        confidence = float(confidence_str) / 100.0 if confidence_str else 0.75
                    except:
                        confidence = 0.75
                    careers.append({"title": career_name, "confidence": confidence})
        
        # Extract roadmap
        if "ROADMAP:" in ai_text:
            roadmap_part = ai_text.split("ROADMAP:")[1].strip()
            roadmap = [step.strip().lstrip("- ").lstrip("• ") for step in roadmap_part.split("\n") if step.strip()][:7]
        
        # Fallback if parsing fails
        if not careers:
            careers = [
                {"title": "Software Engineer", "confidence": 0.80},
                {"title": "Data Scientist", "confidence": 0.70},
            ]
        if not roadmap:
            roadmap = [
                "Strengthen your core skills in your area of interest",
                "Build practical projects to showcase your abilities",
                "Seek mentorship or guidance from professionals in your field",
                "Explore internship or entry-level opportunities",
                "Continue learning and stay updated with industry trends"
            ]
        if not summary:
            summary = f"Based on your assessment, {payload['name']} shows strong potential in their chosen field. With dedication and the right guidance, you can achieve your career goals."
        
        dashboard = {
            "summary": {
                "greeting": f"Great to meet you, {payload['name']}!",
                "text": summary,
                "recommendation": f"Based on your {payload['educationLevel']} level and interests in {payload['interests'][:50]}..., here's your personalized career guidance."
            },
            "suggestedCareers": careers,
            "nextSteps": roadmap,
        }
        
        return Response(dashboard)
        
    except Exception as e:
        # Fallback response if AI fails
        return Response({
            "summary": {
                "greeting": f"Great to meet you, {payload['name']}!",
                "text": f"You're currently at {payload['educationLevel']} level with interests in {payload['interests'][:100] if payload['interests'] else 'various fields'}. Your goal is to {payload['goals'][:100] if payload['goals'] else 'succeed in your career'}.",
                "recommendation": "Based on your assessment, we recommend exploring careers that align with your interests and goals."
            },
            "suggestedCareers": [
                {"title": "Career Path 1", "confidence": 0.80},
                {"title": "Career Path 2", "confidence": 0.70},
            ],
            "nextSteps": [
                "Research careers that match your interests",
                "Build skills relevant to your chosen field",
                "Connect with professionals in your area of interest",
                "Create a learning plan and timeline",
                "Start building projects or gaining experience"
            ],
        })