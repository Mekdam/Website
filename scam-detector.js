async function analyzeText() {
    const text = document.getElementById('scamInput').value;
    const resultDiv = document.getElementById('riskResult');
    const riskTitle = document.getElementById('riskTitle');
    const riskMessage = document.getElementById('riskMessage');
    const detectedList = document.getElementById('detectedList');
    const btn = document.querySelector('.detector-btn');

    // 1. Validation
    if (!text.trim()) {
        alert('Please paste some text first!');
        return;
    }

    // 2. Set UI to "Loading" state
    btn.disabled = true;
    btn.textContent = "AI is thinking...";
    resultDiv.style.display = "none";

    // IMPORTANT: Replace this with your actual key from platform.openai.com
    const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; 

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast and cheap for this use case
                messages: [
                    {
                        role: "system",
                        content: "You are a professional cybersecurity analyst. Analyze the provided text for signs of scams, phishing, or fraud. Return a JSON object with: 'level' (Low, Medium, or High), 'color' (risk-low, risk-medium, or risk-high), and 'flags' (an array of specific red flags found)."
                    },
                    {
                        role: "user",
                        content: `Analyze this text: "${text}"`
                    }
                ],
                response_format: { "type": "json_object" }
            })
        });

        if (!response.ok) throw new Error("API Request Failed");

        const data = await response.json();
        const aiResult = JSON.parse(data.choices[0].message.content);

        // 3. Update the UI with AI results
        resultDiv.className = `risk-result show ${aiResult.color}`;
        riskTitle.textContent = `Risk Level: ${aiResult.level}`;
        riskMessage.textContent = `AI analysis found ${aiResult.flags.length} red flags.`;
        
        detectedList.innerHTML = aiResult.flags
            .map(flag => `<p>• ${flag}</p>`)
            .join('');

    } catch (error) {
        console.error("Error:", error);
        alert("Check your API key or internet connection.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Analyze Text";
    }
}
