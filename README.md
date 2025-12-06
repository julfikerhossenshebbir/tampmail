# 📧 JHS Temp Mail API — Full Developer Documentation

The JHS Temp Mail API allows developers to create temporary email systems for websites, apps, and automation tools. This documentation explains how to integrate and use the API.

---

## 🔑 API Key (Required)
You must have a valid API Key to access the API.

Request your API Key:  
https://jhs.one/

Admin Website:
https://mdjhs.com/

---

## 🌐 Base URL
All API requests use the following endpoint:

https://api.mdjhs.com/

Notes:
- The API is primarily exposed over HTTP GET requests (examples below). If you need other methods, check the server settings or contact the API provider.
- All requests must include your API key unless otherwise noted.

---

# 1. Generate Temporary Email
Creates a new unique temporary email address.

Endpoint: action=gen_email

Parameters:
- action: gen_email
- key: Your API Key

Example Request
```http
GET https://api.mdjhs.com/?action=gen_email&key=YOUR_API_KEY
```

Success Response
```json
{
  "status": "success",
  "data": {
    "email": "x8z9q2w1@jhs.one"
  }
}
```

---

# 2. Check Inbox (Auto-refresh recommended)
Fetch messages received at your temporary email.

Endpoint: action=get_messages

Parameters:
- action: get_messages
- email: Your generated email
- key: API Key

Example Request
```http
GET https://api.mdjhs.com/?action=get_messages&email=abc@jhs.one&key=YOUR_API_KEY
```

Success Response
```json
{
  "status": "success",
  "data": {
    "count": 2,
    "messages": [
      {
        "id": 55,
        "sender": "Facebook",
        "subject": "Verification Code 1234",
        "date": "2025-01-01 10:00:00"
      }
    ]
  }
}
```

---

# 3. Read Full Email Message
Read the HTML body or full content of a specific message.

Endpoint: action=read_message

Example Request
```http
GET https://api.mdjhs.com/?action=read_message&id=55&key=YOUR_API_KEY
```

Success Response
```json
{
  "status": "success",
  "data": {
    "content": "<html><body><h1>Hello World</h1></body></html>"
  }
}
```

---

# 🔎 API Response Format (All Requests)

Success
```json
{
  "status": "success",
  "data": { ... }
}
```

Error
```json
{
  "status": "error",
  "message": "Invalid API key"
}
```

---

# ⚠ Common Error Codes

| Error             | Meaning                                      |
|-------------------|----------------------------------------------|
| Invalid API Key   | Your API key is wrong, revoked, or expired   |
| Missing Parameters| A required parameter was not provided        |
| Email Not Found   | Email does not exist or has expired          |
| Message Not Found | Message ID is invalid or message deleted     |


# 💻 Example: Full Frontend Integration (HTML + JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JHS Temp Mail</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1f2937; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .loader {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-100 h-screen flex flex-col md:flex-row overflow-hidden">

    <aside class="w-full md:w-80 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div class="p-6 border-b border-gray-800 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">T</div>
            <h1 class="text-xl font-bold tracking-wide">Temp<span class="text-blue-500">Mail</span></h1>
        </div>

        <div class="p-5 bg-gray-800 border-b border-gray-700">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Your Temporary Email</p>
            <div class="relative group">
                <div onclick="copyEmail()" class="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-green-400 font-mono break-all cursor-pointer transition hover:border-blue-500 flex items-center justify-between">
                    <span id="emailText">Generating...</span>
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <div id="copyTooltip" class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 pointer-events-none">Copied!</div>
            </div>

            <div class="mt-4 flex gap-2">
                <button onclick="checkMail(true)" class="flex-1 bg-gray-700 hover:bg-gray-600 text-xs py-2 rounded transition flex items-center justify-center gap-1 border border-gray-600">
                    Refresh
                </button>
                <button onclick="createNewIdentity()" class="flex-1 bg-red-900/50 hover:bg-red-900/80 text-red-200 border border-red-800 text-xs py-2 rounded transition flex items-center justify-center gap-1">
                    New ID
                </button>
            </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden">
            <div class="px-5 py-3 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-400">INBOX</span>
                <span id="loadingIndicator" class="loader opacity-0 transition-opacity"></span>
            </div>
            
            <div id="inboxList" class="flex-1 overflow-y-auto p-2 space-y-1"></div>
        </div>
    </aside>

    <main class="flex-1 bg-gray-50 relative flex flex-col h-full">
        <div id="emptyState" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-10 bg-gray-50">
            <div class="bg-white p-6 rounded-full shadow-lg mb-4">
                <svg class="w-16 h-16 text-blue-100" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-600">Select a message</h2>
        </div>

        <div id="msgHeader" class="bg-white border-b px-8 py-5 shadow-sm hidden z-20">
            <h2 id="msgSubject" class="text-xl font-bold text-gray-800 mb-1">Subject</h2>
            <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-500">From:</span>
                <span id="msgSender" class="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Sender</span>
                <span class="text-gray-300">|</span>
                <span id="msgDate" class="text-gray-400">Time</span>
            </div>
        </div>

        <div class="flex-1 relative bg-white">
            <iframe id="emailFrame" class="w-full h-full border-0 absolute inset-0"></iframe>
        </div>
    </main>

    <script>
        // --- CONFIG ---
        const API_URL = 'https://api.mdjhs.com/';
        const API_KEY = 'your_api_key';

        let currentEmail = null;
        let refreshTimer = null;
        let messagesData = []; 

        window.addEventListener('DOMContentLoaded', () => {
            const savedEmail = localStorage.getItem('jhs_temp_mail_v4');
            if (savedEmail) setEmail(savedEmail);
            else generateEmail();
        });

        async function generateEmail() {
            document.getElementById('emailText').innerText = "Generating...";
            try {
                const res = await fetch(`${API_URL}?action=gen_email&key=${API_KEY}`);
                const data = await res.json();
                if (data.status === 'success') {
                    localStorage.setItem('jhs_temp_mail_v4', data.data.email);
                    setEmail(data.data.email);
                }
            } catch (error) { document.getElementById('emailText').innerText = "Error"; }
        }

        function setEmail(email) {
            currentEmail = email;
            document.getElementById('emailText').innerText = email;
            document.getElementById('inboxList').innerHTML = '';
            showEmptyState();
            if (refreshTimer) clearInterval(refreshTimer);
            checkMail();
            refreshTimer = setInterval(checkMail, 5000);
        }

        async function checkMail(manual = false) {
            if (!currentEmail) return;
            const loader = document.getElementById('loadingIndicator');
            if(manual) loader.classList.remove('opacity-0');

            try {
                const res = await fetch(`${API_URL}?action=get_messages&email=${currentEmail}&key=${API_KEY}`);
                const data = await res.json();

                if (data.status === 'success') {
                    messagesData = data.data.messages || []; 
                    renderInbox(messagesData);
                }
            } catch (e) {}
            
            if(manual) setTimeout(() => loader.classList.add('opacity-0'), 500);
        }

        function renderInbox(messages) {
            const list = document.getElementById('inboxList');
            if(messages.length === 0) {
                list.innerHTML = `<div class="text-center mt-10 text-gray-500 text-xs">No messages yet</div>`;
                return;
            }

            // Fix: Pass ID as string to be safe
            list.innerHTML = messages.map(msg => `
                <div onclick="readMessage('${msg.id}')" 
                     class="group bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer border-l-4 border-blue-500 transition-all shadow-sm hover:shadow-md mb-2 mx-1">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-sm text-gray-200 truncate w-2/3">${escapeHtml(msg.sender)}</span>
                        <span class="text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">${formatTime(msg.date)}</span>
                    </div>
                    <div class="text-xs text-gray-400 truncate">${escapeHtml(msg.subject)}</div>
                </div>
            `).join('');
        }

        async function readMessage(id) {
            // UI Updates - Show loading state immediately
            document.getElementById('emptyState').classList.add('hidden');
            document.getElementById('msgHeader').classList.remove('hidden');
            const iframe = document.getElementById('emailFrame');
            iframe.contentWindow.document.body.innerHTML = '<div style="font-family:sans-serif;text-align:center;padding:50px;color:#888;">Loading content...</div>';

            // Find message details locally (Fix: using == for loose comparison)
            const msg = messagesData.find(m => m.id == id);
            if(msg) {
                document.getElementById('msgSubject').innerText = msg.subject || '(No Subject)';
                document.getElementById('msgSender').innerText = msg.sender || 'Unknown';
                document.getElementById('msgDate').innerText = formatTime(msg.date);
            } else {
                // If not found in local list, set generic text
                document.getElementById('msgSubject').innerText = 'Message';
                document.getElementById('msgSender').innerText = '...';
            }

            try {
                // API Call
                const res = await fetch(`${API_URL}?action=read_message&id=${id}&email=${currentEmail}&key=${API_KEY}`);
                const data = await res.json();
                
                if(data.status === 'success') {
                    // Check various possible locations for content
                    const content = data.data.content || data.data.body || "No content found";
                    
                    const doc = iframe.contentWindow.document;
                    doc.open();
                    doc.write(content);
                    doc.close();
                } else {
                    iframe.contentWindow.document.body.innerHTML = `<div style="text-align:center;padding:20px;color:red;">Error: ${data.message}</div>`;
                }
            } catch (e) { 
                iframe.contentWindow.document.body.innerHTML = '<div style="text-align:center;padding:20px;">Connection Failed</div>';
            }
        }

        function createNewIdentity() {
            if(confirm("Generate new email?")) {
                localStorage.removeItem('jhs_temp_mail_v4');
                generateEmail();
            }
        }

        function copyEmail() {
            const text = document.getElementById('emailText').innerText;
            if(!text.includes('@')) return;
            navigator.clipboard.writeText(text).then(() => {
                const t = document.getElementById('copyTooltip');
                t.classList.remove('opacity-0');
                setTimeout(() => t.classList.add('opacity-0'), 2000);
            });
        }

        function showEmptyState() {
            document.getElementById('emptyState').classList.remove('hidden');
            document.getElementById('msgHeader').classList.add('hidden');
            const iframe = document.getElementById('emailFrame');
            if (iframe.contentWindow) {
                iframe.contentWindow.document.body.innerHTML = "";
            }
        }

        function formatTime(d) {
            return new Date(d).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        function escapeHtml(text) {
            return (text || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
    </script>
</body>
</html>
```

---

📞 Need an API Key?
https://jhs.one/

😎 Admin Website:
https://mdjhs.com/ 

# ✅ End of Documentation

This file is formatted for clarity and proper Markdown rendering. If you want, I can commit this updated Documentation.md to your repository (I will need the repo owner and branch to push). Otherwise you can copy this content into your Documentation.md file.
