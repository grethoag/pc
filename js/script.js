const API_KEY = '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';
let isLoading = false;
let currentSound = null;

// Array of cute meme quotes
const memeQuotes = [
    "loading cuteness...",
    "error 404: sadness not found",
    "ctrl+s (save the dreams)",
    "happiness.exe is running",
    "downloading starlight",
    "buffering sparkles",
    "*happy computer noises*",
    "insert dream here",
    "digital butterflies loading",
    "spreading pixel magic",
    "connecting to cloud nine",
    "installing good vibes",
    "processing rainbows",
    "generating happiness",
    "uploading dreams"
];

// Sound handling
function stopCurrentSound() {
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
        currentSound = null;
    }
    const head = document.querySelector('.head-img');
    if (head) {
        head.classList.remove('talking');
    }
}

function startTalking() {
    try {
        stopCurrentSound();
        currentSound = new Audio('voice.mp3');
        currentSound.volume = 0.5;
        
        currentSound.addEventListener('loadedmetadata', () => {
            currentSound.currentTime = Math.random() * currentSound.duration;
            currentSound.play().catch(e => console.error('Sound play failed:', e));
        });

        document.querySelector('.head-img').classList.add('talking');
    } catch (e) {
        console.error('Sound creation failed:', e);
        stopCurrentSound();
    }
}

// Function to create and animate random floating quotes
function createFloatingQuote() {
    const quotesContainer = document.getElementById('floating-quotes');
    const quote = document.createElement('div');
    quote.className = 'floating-quote';
    
    const chatContainer = document.querySelector('.chat-container');
    const chatRect = chatContainer.getBoundingClientRect();
    const chatBuffer = 50;

    let x, y;
    do {
        x = Math.random() * (window.innerWidth - 200);
        y = Math.random() * (window.innerHeight - 50);
    } while (
        x > chatRect.left - chatBuffer &&
        x < chatRect.right + chatBuffer &&
        y > chatRect.top - chatBuffer &&
        y < chatRect.bottom + chatBuffer
    );
    
    quote.style.left = x + 'px';
    quote.style.top = y + 'px';
    quote.textContent = memeQuotes[Math.floor(Math.random() * memeQuotes.length)];
    
    quotesContainer.appendChild(quote);

    quote.addEventListener('animationend', () => {
        quotesContainer.removeChild(quote);
    });
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message || isLoading) return;

    const chatMessages = document.getElementById('chat-messages');
    
    // Add user message
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.textContent = message;
    chatMessages.appendChild(userDiv);
    
    // Clear input
    input.value = '';
    
    // Show loading
    isLoading = true;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = '<img src="images/loading.gif" alt="loading" class="loading">';
    chatMessages.appendChild(loadingDiv);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are a cute and friendly AI companion on VIRTUALS, named Pochi. Respond in a internet vibe, mysterious, helper, lighthearted manner using lowercase text without emojis. Keep responses concise and sweet."
                }, {
                    role: "user",
                    content: message
                }]
            })
        });

        const data = await response.json();
        chatMessages.removeChild(loadingDiv);
        
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot-message';
        chatMessages.appendChild(botDiv);
        
        // Start talking and type message
        startTalking();
        const text = data.choices[0].message.content;
        let currentText = '';
        
        for (let i = 0; i < text.length; i++) {
            currentText += text[i];
            botDiv.textContent = currentText;
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // If we're at the last character, stop the sound and animation
            if (i === text.length - 1) {
                stopCurrentSound();
            }
        }
    } catch (error) {
        chatMessages.removeChild(loadingDiv);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot-message';
        errorDiv.textContent = "oops, something went wrong. lets try again";
        chatMessages.appendChild(errorDiv);
    }

    isLoading = false;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add event listener for Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize audio on first user interaction
document.addEventListener('click', function initAudio() {
    const audio = new Audio('voice.mp3');
    audio.volume = 0;
    audio.play().then(() => {
        audio.pause();
        document.removeEventListener('click', initAudio);
    }).catch(e => console.error('Audio init failed:', e));
}, { once: true });

// Create floating quotes
function startFloatingQuotes() {
    createFloatingQuote(); // Create one immediately
    setInterval(createFloatingQuote, 1500); // Create new ones every 1.5 seconds
}

// Start creating floating quotes when page loads
window.addEventListener('load', startFloatingQuotes);
