const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

// sayfa yüklendiğinde yerel depodan(localStorage) veri yükler
const loadDataFromLocalStorage = () => {
  // tema rengini kontrol eder ve geçerli temayı uygular
  const themeColor = localStorage.getItem("theme-color");
  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  // tema rengini yerel depoda günceller
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
  // sohbet içeriğini yerel depodan alır veya varsayılan içeriği uygular
  const defaultText = `
      <div class="default-text">
        <h1>ChatGPT Clone</h1>
      </div>
    `;
  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  // sayfayı sohbetin en altına kaydırır
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};
loadDataFromLocalStorage();

const createElement = (html, className) => {
  // yeni div oluşturma ve belirtilen chat sınıfını ekleme
  // div'in html içeriğini ayarlama
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = html;
  return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const pElement = document.createElement("p");
    // api talebi için özellikleri ve verileri tanımlama
    const requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: `${userText}`,
        },
      ],
    };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestData),
    };
  //
  try {
    const response = await (await fetch(API_URL, requestOptions)).json();
    console.log(response);
    pElement.textContent = response.choices[0].message.content.trim();
  } catch (error) {
    console.log(error);
    pElement.textContent = "Opppss";
    pElement.style.color = "red";
  }
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
};

const showTypingAnimation = () => {
  // gösterilen metni silip tekrar gösterme anlamına gelir 
  const html = `
    <div class="chat-content">
    <div class="chat-details">
      <img src="images/chatbot.jpg" alt="chat-images" />
      <div class="typing-animation">
        <div class="typing-dot" style="--delay: 0.2s"></div>
        <div class="typing-dot" style="--delay: 0.3s"></div>
        <div class="typing-dot" style="--delay: 0.4s"></div>
      </div>
    </div>
    <span class="material-symbols-outlined"> content_copy </span>
  </div>`;
  const incomingChatDiv = createElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};

const handleOutGoingChat = () => {
  userText = chatInput.value.trim(); // chatInput değerini alır ve fazladan boşlukları siler
  if (!userText) return; // chatInputun içi boş işe çalışmasın
  const html = `<div class="chat-content">
    <div class="chat-details">
      <img src="images/user.jpg" alt="user-images" />
      <p>
        ${userText}
      </p>
    </div>
  </div> `;
  const outGoingChatDiv = createElement(html, "outgoing"); // div'e bir html ekler
  outGoingChatDiv.querySelector("p").textContent = userText;
  document.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outGoingChatDiv); // sohbet kutusuna yeni mesaj ekler
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // sohbet kutusunu en sona getirir
  chatInput.value = ""; // chatInput'i boşaltır
  setTimeout(showTypingAnimation, 500);
};

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

deleteButton.addEventListener("click", () => {
  if (confirm("Tüm sohbeti silmek istediğinizden emin misiniz?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalStorage();
  }
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${initialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleOutGoingChat();
  }
});

sendButton.addEventListener("click", handleOutGoingChat);

