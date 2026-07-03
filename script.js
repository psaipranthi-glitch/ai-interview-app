// GLOBAL VARIABLES
let currentRole = "";
let currentIndex = 0;
let currentQuestion = "";
let scores = [];
let questions = [];

// ---------------- START INTERVIEW ----------------
window.startInterview = async function () {

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
};

// ---------------- GENERATE QUESTIONS ----------------
async function generateQuestions(role) {

    const prompt = `
You are a FAANG interviewer.

Generate 5 interview questions for ${role}.
Return ONLY JSON array:
["Q1","Q2","Q3","Q4","Q5"]
`;

    try {
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await res.json();

        if (!data.candidates) {
            addMessage("bot", "⚠️ AI failed to generate questions");
            return;
        }

        let text = data.candidates[0].content.parts[0].text;

        let start = text.indexOf("[");
        let end = text.lastIndexOf("]");

        questions = JSON.parse(text.slice(start, end + 1));

        addMessage("bot", "🧠 AI generated your questions");

    } catch (err) {
        console.error(err);
        addMessage("bot", "❌ Error generating questions");
    }
}

// ---------------- SHOW QUESTION ----------------
function showQuestion() {

    currentQuestion = questions[currentIndex];

    if (!currentQuestion) {
        showFinalResult();
        return;
    }

    addMessage("bot", "🎯 Question #" + (currentIndex + 1));
    addMessage("bot", currentQuestion);
}

// ---------------- SEND ANSWER ----------------
window.sendAnswer = async function () {

    const answerBox = document.getElementById("answer");
    const answer = answerBox.value.trim();

    if (!answer) return;

    addMessage("user", answer);
    answerBox.value = "";

    const prompt = `
Evaluate this interview answer:

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
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AQ.Ab8RN6LB8756iGfY6csqLLbHfKsLqUq6llQV5KBCpbX0_3e9fA",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await res.json();

        let text = data.candidates[0].content.parts[0].text;

        let start = text.indexOf("{");
        let end = text.lastIndexOf("}");

        let result = JSON.parse(text.slice(start, end + 1));

        scores.push(result.score);

        addMessage("bot", "📊 AI Evaluation");
        addMessage("bot", "⭐ Score: " + result.score);
        addMessage("bot", "💬 Feedback: " + result.feedback);
        addMessage("bot", "📘 Correct Answer: " + result.correct_answer);
        addMessage("bot", "📈 Improvement: " + result.improvement);

        currentIndex++;
        setTimeout(showQuestion, 1200);

    } catch (err) {
        console.error(err);
        addMessage("bot", "❌ Evaluation failed");
    }
};

// ---------------- VOICE MODE ----------------
window.startVoice = function () {

    if (!('webkitSpeechRecognition' in window)) {
        alert("Use Chrome for voice mode");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

    addMessage("bot", "🎤 Listening...");

    recognition.start();

    recognition.onresult = function (event) {
        let text = event.results[0][0].transcript;
        document.getElementById("answer").value = text;
        addMessage("user", "🎤 " + text);
    };

    recognition.onerror = function () {
        addMessage("bot", "❌ Voice error");
    };
};

// ---------------- FINAL RESULT ----------------
function showFinalResult() {

    let total = scores.reduce((a, b) => a + b, 0);
    let avg = scores.length ? (total / scores.length).toFixed(1) : 0;

    addMessage("bot", "🏁 Interview Completed");
    addMessage("bot", "📊 Final Score: " + avg);
}

// ---------------- UI HELPER ----------------
function addMessage(sender, text) {

    const chatBox = document.getElementById("chatBox");

    const msg = document.createElement("div");
    msg.className = sender;
    msg.innerText = text;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;
}