// ================= GLOBAL STATE =================
let currentRole = "";
let currentIndex = 0;
let currentQuestion = "";
let scores = [];
let questions = [];

// ================= START INTERVIEW =================
window.startInterview = async function () {

    currentRole = document.getElementById("role").value;
    currentIndex = 0;
    scores = [];
    questions = [];

    document.getElementById("chatBox").innerHTML = "";

    addMessage("bot", "🚀 Interview Started");
    addMessage("bot", "🧠 Role: " + currentRole);

    await generateQuestions(currentRole);
    showQuestion();
};

// ================= GEMINI API CONFIG =================
const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AQ.Ab8RN6LCECz0AvN08BGNtb_yOtJOIBzUiei80mcDpvfEIO9eSQ";

// ================= GENERATE QUESTIONS =================
async function generateQuestions(role) {

    const prompt = `
You are an expert interviewer.

Generate 5 interview questions for ${role}.

Rules:
- Mix easy, medium, hard
- No answers
- Return ONLY JSON array:

["Q1","Q2","Q3","Q4","Q5"]
`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await res.json();

        console.log("Gemini response:", data);

        if (!data.candidates || !data.candidates.length) {
            addMessage("bot", "⚠️ Failed to generate questions (API error)");
            return;
        }

        let text = data.candidates[0].content.parts[0].text;

        let start = text.indexOf("[");
        let end = text.lastIndexOf("]");

        questions = JSON.parse(text.slice(start, end + 1));

        addMessage("bot", "🧠 AI generated questions");

    } catch (err) {
        console.error(err);
        addMessage("bot", "❌ Error generating questions");
    }
}

// ================= SHOW QUESTION =================
function showQuestion() {

    currentQuestion = questions[currentIndex];

    if (!currentQuestion) {
        showFinalResult();
        return;
    }

    addMessage("bot", "🎯 Question " + (currentIndex + 1));
    addMessage("bot", currentQuestion);
}

// ================= SEND ANSWER =================
window.sendAnswer = async function () {

    const answerBox = document.getElementById("answer");
    const answer = answerBox.value.trim();

    if (!answer) return;

    addMessage("user", answer);
    answerBox.value = "";

    const prompt = `
You are a strict interviewer.

Evaluate:

Role: ${currentRole}
Question: ${currentQuestion}
Answer: ${answer}

Return ONLY JSON:
{
  "score": 0,
  "feedback": "",
  "improvement": "",
  "correct_answer": ""
}
`;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await res.json();

        console.log("Evaluation response:", data);

        if (!data.candidates || !data.candidates.length) {
            addMessage("bot", "⚠️ Evaluation failed");
            return;
        }

        let text = data.candidates[0].content.parts[0].text;

        let start = text.indexOf("{");
        let end = text.lastIndexOf("}");

        let result = JSON.parse(text.slice(start, end + 1));

        scores.push(result.score);

        addMessage("bot", "📊 Score: " + result.score + "/10");
        addMessage("bot", "💬 Feedback: " + result.feedback);
        addMessage("bot", "📘 Correct Answer: " + result.correct_answer);
        addMessage("bot", "📈 Improvement: " + result.improvement);

        currentIndex++;
        setTimeout(showQuestion, 1200);

    } catch (err) {
        console.error(err);
        addMessage("bot", "❌ API Error in evaluation");
    }
};

// ================= FINAL RESULT =================
function showFinalResult() {

    let total = scores.reduce((a, b) => a + b, 0);
    let avg = scores.length ? (total / scores.length).toFixed(1) : 0;

    let result =
        avg >= 8 ? "🔥 Excellent" :
        avg >= 5 ? "🙂 Good" :
        "📚 Needs Improvement";

    addMessage("bot", "🏁 Interview Completed");
    addMessage("bot", "📊 Final Score: " + avg);
    addMessage("bot", "🎯 Result: " + result);
}

// ================= UI HELPER =================
function addMessage(sender, text) {

    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.className = sender;
    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}
window.startVoice = function () {

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;
        document.getElementById("answer").value = text;
    };

    recognition.onerror = function (err) {
        console.log("Voice error:", err);
        addMessage("bot", "❌ Voice recognition failed");
    };
};