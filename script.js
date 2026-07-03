let currentRole = "";
let currentIndex = 0;
let currentQuestion = "";
let scores = [];
let questions = [];

// START INTERVIEW
async function startInterview() {

    currentRole = document.getElementById("role").value;
    currentIndex = 0;
    scores = [];
    questions = [];

    document.getElementById("chatBox").innerHTML = "";

    addMessage("bot", "🚀 Session Started");
    addMessage("bot", "🧠 Role: " + currentRole);
    addMessage("bot", "⚡ AI Interview Engine Active");

    await generateQuestions(currentRole);
    showQuestion();
}

// 🤖 AI GENERATED QUESTIONS (ONLY AI — NO STATIC FALLBACK)
async function generateQuestions(role) {

    const prompt = `
You are a FAANG-level interviewer.

Generate 5 real interview questions for ${role}.

Rules:
- Mix easy, medium, hard
- No answers
- Return ONLY JSON array:
["Q1","Q2","Q3","Q4","Q5"]
`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    const data = await res.json();

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let start = text.indexOf("[");
    let end = text.lastIndexOf("]");

    questions = JSON.parse(text.slice(start, end + 1));

    addMessage("bot", "🧠 AI generated your interview questions");
}

// SHOW QUESTION
function showQuestion() {

    currentQuestion = questions[currentIndex];

    if (!currentQuestion) {
        showFinalResult();
        return;
    }

    addMessage("bot", `🎯 Question #${currentIndex + 1}`);
    addMessage("bot", currentQuestion);
}

// SEND ANSWER + AI EVALUATION
async function sendAnswer() {

    const answerBox = document.getElementById("answer");
    const answer = answerBox.value.trim();

    if (!answer) return;

    addMessage("user", "💬 " + answer);
    answerBox.value = "";

    const prompt = `
You are a strict FAANG interviewer.

Evaluate answer:

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

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AQ.Ab8RN6LB8756iGfY6csqLLbHfKsLqUq6llQV5KBCpbX0_3e9fA`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        }
    );

    const data = await res.json();

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    let result;

    let start = text.indexOf("{");
    let end = text.lastIndexOf("}");

    result = JSON.parse(text.slice(start, end + 1));

    scores.push(result.score);

    addMessage("bot", "📊 AI Evaluation Report");
    addMessage("bot", "⭐ Score: " + result.score + "/10");
    addMessage("bot", "💬 Feedback: " + result.feedback);
    addMessage("bot", "📘 Correct Answer: " + result.correct_answer);
    addMessage("bot", "📈 Improvement: " + result.improvement);

    currentIndex++;
    setTimeout(showQuestion, 1200);
}

// 🎤 VOICE MODE
function startVoice() {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice not supported in this browser (use Chrome)");
        return;
    }

    let recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    addMessage("bot", "🎤 Listening... speak now");

    recognition.start();

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("answer").value = transcript;
        addMessage("user", "🎤 " + transcript);
    };

    recognition.onerror = function() {
        addMessage("bot", "❌ Voice input failed");
    };

    recognition.onend = function() {
        addMessage("bot", "🧠 Voice captured successfully");
    };
}

// FINAL RESULT
function showFinalResult() {

    let total = scores.reduce((a, b) => a + b, 0);
    let avg = scores.length ? (total / scores.length).toFixed(1) : 0;

    let performance =
        avg >= 8 ? "🔥 Excellent Performance" :
        avg >= 5 ? "🙂 Good Performance" :
        "📚 Needs Improvement";

    addMessage("bot", "🏁 Interview Completed");
    addMessage("bot", "📊 Final Score: " + avg + "/10");
    addMessage("bot", "🎯 Result: " + performance);
}

// UI HELPER
function addMessage(sender, text) {

    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.classList.add(sender);
    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}