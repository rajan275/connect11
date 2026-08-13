// script.js
import { supabase } from "./supabase.js";

// Helper: Append a message to the chat container
function appendMessageToBox(username, content) {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;
  const msgDiv = document.createElement("div");
  msgDiv.className = "message";
  msgDiv.innerHTML = `<strong>${username || "Anonymous"}:</strong> ${content}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 1. Fetch past messages on page load
async function fetchMessages() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages from Supabase:", error);
    return;
  }

  chatBox.innerHTML = "";
  if (messages) {
    messages.forEach((msg) => {
      appendMessageToBox(msg.username, msg.content);
    });
  }
}

// 2. Send message and save to Supabase
async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  if (!messageInput) return;

  const message = messageInput.value.trim();
  const username = localStorage.getItem("chatUsername") || "Anonymous";

  if (message === "") {
    alert("Please enter a message");
    return;
  }

  // Clear input box immediately
  messageInput.value = "";

  // Show locally immediately for instant feedback
  appendMessageToBox(username, message);

  // Generate unique string ID to satisfy Supabase NOT NULL 'id' column
  const uniqueId = typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Date.now().toString() + Math.random().toString(36).substring(2, 9);

  // Send to Supabase backend
  const { error } = await supabase
    .from("messages")
    .insert([
      { 
        id: uniqueId,
        username: username, 
        content: message,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error("Error inserting to Supabase:", error);
    alert("Failed to send message to database: " + error.message);
  }
}

// 3. Realtime Listener for Incoming Messages
function subscribeToMessages() {
  supabase
    .channel("public:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const newMsg = payload.new;
        const currentUsername = localStorage.getItem("chatUsername") || "Anonymous";
        
        // Don't duplicate if already added locally
        if (newMsg.username !== currentUsername) {
          appendMessageToBox(newMsg.username, newMsg.content);
        }
      }
    )
    .subscribe();
}

// 4. Camera Handler
function toggleCamera() {
  const chatBox = document.getElementById("chatBox");
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.style.width = "100%";
  video.style.maxHeight = "200px";
  video.style.borderRadius = "12px";
  video.style.marginTop = "0.5rem";

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      if (chatBox) {
        chatBox.appendChild(video);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    })
    .catch((err) => {
      alert("Error accessing camera: " + err);
    });
}

// 5. Initialize and Attach Event Listeners safely when DOM is ready
function initChat() {
  const sendBtn = document.getElementById("sendBtn");
  const cameraBtn = document.getElementById("cameraBtn");
  const messageInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");
  const chatBox = document.getElementById("chatBox");

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (cameraBtn) {
    cameraBtn.addEventListener("click", toggleCamera);
  }

  if (messageInput) {
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const username = localStorage.getItem("chatUsername") || "You";
      const msgDiv = document.createElement("div");
      msgDiv.className = "message";
      msgDiv.innerHTML = `<strong>${username} attached:</strong> ${file.name}`;

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        img.style.display = "block";
        img.style.marginTop = "0.5rem";
        msgDiv.appendChild(img);
      }

      if (chatBox) {
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
      }
      event.target.value = "";
    });
  }

  if (chatBox) {
    fetchMessages();
    subscribeToMessages();
  }
}

// Attach listeners when DOM loads or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChat);
} else {
  initChat();
}

// Global scope fallbacks for inline HTML calls
window.sendMessage = sendMessage;
window.toggleCamera = toggleCamera;