# 📧 JHS Temp Mail API — Full Developer Documentation

The **JHS Temp Mail API** allows developers to create temporary email systems for websites, apps, and automation tools.  
This documentation explains how to integrate and use the API in the most efficient way.

---

## 🔑 API Key (Required)
You must have a **valid API Key** to access the API.

👉 Request your API Key here:  
https://mdjhs.com/

---

## 🌐 Base URL
All API requests use the following endpoint:

**https://api.mdjhs.com/**

All requests must be sent using **HTTP GET**.

---

# 📌 1. Generate Temporary Email
Creates a new unique temp email address.

### ▶ Endpoint
``action=gen_email``

### ▶ Parameters
| Name | Description |
|------|-------------|
| action | gen_email |
| key | Your API Key |

### ▶ Example Request
``
GET https://api.mdjhs.com/?action=gen_email&key=YOUR_API_KEY
``

### ▶ Success Response
``json
{
  "status": "success",
  "data": {
    "email": "x8z9q2w1@jhs.one"
  }
}
``

---

# 📌 2. Check Inbox (Auto-Refresh Recommended)
Fetches messages received at your temporary email.

### ▶ Endpoint
``action=get_messages``

### ▶ Parameters
| Name | Description |
|------|-------------|
| action | get_messages |
| email | Your generated email |
| key | API Key |

### ▶ Example Request
``
GET https://api.mdjhs.com/?action=get_messages&email=abc@jhs.one&key=YOUR_API_KEY
``

### ▶ Success Response
``json
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
``

---

# 📌 3. Read Full Email Message
Reads the HTML body of any message.

### ▶ Endpoint
``action=read_message``

### ▶ Parameters
| Name | Description |
|------|-------------|
| action | read_message |
| id | Message ID |
| key | API Key |

### ▶ Example Request
``
GET https://api.mdjhs.com/?action=read_message&id=55&key=YOUR_API_KEY
``

### ▶ Success Response
``json
{
  "status": "success",
  "data": {
    "content": "<html><body><h1>Hello World</h1></body></html>"
  }
}
``

---

# 🔎 API Response Format (All Requests)

### ✔ Success
``json
{
  "status": "success",
  "data": { ... }
}
``

### ❌ Error
``json
{
  "status": "error",
  "message": "Invalid API key"
}
``

---

# ⚠ Common Error Codes
| Error | Meaning |
|-------|---------|
| Invalid API Key | Your API key is wrong or expired |
| Missing Parameters | A required parameter was not provided |
| Email Not Found | Email does not exist or expired |
| Message Not Found | Message ID is invalid |

---

# 🚩 Rate Limit (Important)
To avoid abuse, follow these limits:

| Action | Limit |
|--------|--------|
| Generate Email | Max 1 request per 3 seconds |
| Get Messages | Refresh every **5–10 seconds** |
| Read Message | Normal usage allowed |

---

# 🔧 Complete Workflow Diagram

``
 [Generate Email]  
        ↓  
[Get Messages Every 5 Seconds]  
        ↓  
 [New Message Arrived?] → Yes → [Read Message Content]  
        ↓  
        End
``

---

# 💻 Example: Full Frontend Integration (HTML + JS)

``html
<!DOCTYPE html>
<html>
<body>
    <h1>My Temp Mail Site</h1>
    <p>Email: <b id="email">Loading...</b></p>
    <button onclick="getMail()">Refresh Inbox</button>
    <ul id="inbox"></ul>

    <script>
        const API_KEY = "YOUR_API_KEY_HERE";
        const API_URL = "https://api.mdjhs.com/";
        let myEmail = "";

        // Generate Email
        fetch(`${API_URL}?action=gen_email&key=${API_KEY}`)
            .then(res => res.json())
            .then(data => {
                myEmail = data.data.email;
                document.getElementById("email").innerText = myEmail;
            });

        // Check Inbox
        function getMail() {
            if (!myEmail) return;

            fetch(`${API_URL}?action=get_messages&email=${myEmail}&key=${API_KEY}`)
                .then(res => res.json())
                .then(data => {
                    const list = document.getElementById("inbox");
                    list.innerHTML = "";

                    if (data.data.count === 0) {
                        list.innerHTML = "<li>No messages yet...</li>";
                        return;
                    }

                    data.data.messages.forEach(msg => {
                        list.innerHTML += `<li><b>${msg.sender}</b>: ${msg.subject}</li>`;
                    });
                });
        }
    </script>
</body>
</html>
``

---

# 📞 Need an API Key?
👉 https://mdjhs.com/

---

# 📝 Notes & Best Practices
- Temporary emails automatically expire after a system-defined time.
- Do not spam the API.
- Always check `"status"` before processing data.
- Use proper error handling in production apps.
- Recommended refresh interval: **5–10 seconds** (not faster).

---

# ✅ End of Documentation
This file is ready to use as a **README.md** for your GitHub project or website.
