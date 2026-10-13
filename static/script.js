
document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message");
    const chatBox = document.getElementById("chat-box");
    const welcome = document.getElementById("welcome");
    const loading = document.getElementById("loading-indicator");
    const clearButton = document.getElementById("clear-chat");
    const newChatButton = document.getElementById("new-chat");
    const mobileMenu = document.getElementById("mobile-menu");
    const sidebar = document.getElementById("sidebar");
    const sendButton = chatForm?.querySelector(".send-button");

    if (!chatForm || !messageInput || !chatBox) {
        console.error("StudyBuddy: Required HTML elements are missing.");
        return;
    }

    function createConversationId() {
        if (window.crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return Date.now().toString(36) +
            Math.random().toString(36).slice(2);
    }

    let conversationId =
        localStorage.getItem("studybuddy_conversation_id");

    if (!conversationId) {
        conversationId = createConversationId();
        localStorage.setItem(
            "studybuddy_conversation_id",
            conversationId
        );
    }

    function showWelcome(show) {
        if (welcome) {
            welcome.hidden = !show;
        }
    }

    function displayMessage(role, content) {
        if (typeof content !== "string" || !content.trim()) {
            console.warn("StudyBuddy skipped an empty message.");
            return;
        }

        const element = document.createElement("div");
        const isUser = role === "user";

        element.className = isUser ? "user-message" : "bot-message";
        element.textContent =
            (isUser ? "You: " : "StudyBuddy: ") + content;

        showWelcome(false);
        chatBox.appendChild(element);

        const chatArea = document.querySelector(".chat-area");
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }
    }

    function setLoading(isLoading) {
        if (loading) {
            loading.hidden = !isLoading;
        }

        messageInput.disabled = isLoading;

        if (sendButton) {
            sendButton.disabled = isLoading;
        }
    }

    async function loadHistory() {
        chatBox.innerHTML = "";

        try {
            const response = await fetch(
                "/history?conversation_id=" +
                encodeURIComponent(conversationId)
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Could not load chat history."
                );
            }

            if (Array.isArray(data.messages)) {
                data.messages.forEach(function (item) {
                    displayMessage(item.role, item.content);
                });
            }

            showWelcome(chatBox.children.length === 0);

        } catch (error) {
            console.error("History error:", error);
            showWelcome(chatBox.children.length === 0);
        }
    }

    async function sendMessage(text) {
        const message = text.trim();

        if (!message || messageInput.disabled) {
            return;
        }

        displayMessage("user", message);
        messageInput.value = "";
        setLoading(true);

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: conversationId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "The AI service could not respond."
                );
            }

            if (typeof data.reply !== "string" || !data.reply.trim()) {
                throw new Error("The AI returned an empty response.");
            }

            displayMessage("assistant", data.reply);

        } catch (error) {
            console.error("Chat error:", error);

            displayMessage(
                "assistant",
                "Sorry, I couldn't respond right now. " +
                error.message
            );
        } finally {
            setLoading(false);
            messageInput.focus();
        }
    }

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        sendMessage(messageInput.value);
    });

    // Press Enter to send; Shift + Enter adds a new line
    messageInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            chatForm.requestSubmit();
        }
    });

    // Suggested learning prompts
    document.querySelectorAll("[data-prompt]").forEach(function (button) {
        button.addEventListener("click", function () {
            sendMessage(button.dataset.prompt || "");
        });
    });

    // Start a new conversation without deleting old messages
    if (newChatButton) {
        newChatButton.addEventListener("click", function () {
            conversationId = createConversationId();

            localStorage.setItem(
                "studybuddy_conversation_id",
                conversationId
            );

            chatBox.innerHTML = "";
            messageInput.value = "";
            showWelcome(true);

            if (sidebar) {
                sidebar.classList.remove("open");
            }

            messageInput.focus();
        });
    }

    // Clear only the current conversation
    if (clearButton) {
        clearButton.addEventListener("click", async function () {
            const confirmed = confirm(
                "Clear this conversation? Your saved memories will remain."
            );

            if (!confirmed) {
                return;
            }

            clearButton.disabled = true;

            try {
                const response = await fetch("/clear-chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        conversation_id: conversationId
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error || "Could not clear this conversation."
                    );
                }

                chatBox.innerHTML = "";
                messageInput.value = "";
                showWelcome(true);

            } catch (error) {
                console.error("Clear chat error:", error);
                alert("Could not clear chat: " + error.message);
            } finally {
                clearButton.disabled = false;
            }
        });
    }

    // Mobile sidebar
    if (mobileMenu && sidebar) {
        mobileMenu.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });
    }

    loadHistory();
});
