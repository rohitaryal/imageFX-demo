const chatContainer = document.querySelector(".chatContainer");
const imageContainer = document.querySelector(".imageContainer");
const submitButton = document.querySelector(".inputContainer .generateButton");
const promptBox = document.querySelector(".inputContainer input[type='text']");

let imageIndex = 0;

// These are attached to event listeners
async function handlePromptSubmit(event) {
    const value = promptBox.value;

    if (event && promptBox.value.trim() != "" && (event.key == 'Enter' || event.type == 'click')) {
        // Create prompt element with loading state
        let paragraph = attachPrompt(promptBox.value, "loading");

        promptBox.value = "";

        try {
            const base64Image = await generateImage(value);
            attachImage(base64Image);

            // Update to success state
            updatePromptStatus(paragraph, "success");
        } catch (error) {
            console.error(error);
            updatePromptStatus(paragraph, "failure");
        }
    }
}

// Utility function to attach prompt
function attachPrompt(message, status) {
    const paragraph = document.createElement("p");
    paragraph.innerText = message;

    // Create status icon
    const statusIcon = document.createElement("div");
    statusIcon.classList.add("status-icon", status);

    // Add icon based on status
    if (status === 'loading') {
        const icon = document.createElement("ion-icon");
        icon.name = "sync-outline";
        statusIcon.appendChild(icon);
    } else if (status === 'success') {
        const icon = document.createElement("ion-icon");
        icon.name = "checkmark-outline";
        statusIcon.appendChild(icon);
    } else if (status === 'failure') {
        const icon = document.createElement("ion-icon");
        icon.name = "alert-outline";
        statusIcon.appendChild(icon);
    }

    paragraph.appendChild(statusIcon);
    chatContainer.appendChild(paragraph);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return paragraph;
}

function updatePromptStatus(paragraph, status) {
    const statusIcon = paragraph.querySelector(".status-icon");
    if (statusIcon) {
        statusIcon.className = `status-icon ${status}`;
        statusIcon.innerHTML = ''; // Clear existing icon

        const icon = document.createElement("ion-icon");
        if (status === 'success') {
            icon.name = "checkmark-outline";
        } else if (status === 'failure') {
            icon.name = "alert-outline";
        }
        statusIcon.appendChild(icon);
    }
}


function makeDraggable(element) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    // Mouse events
    element.addEventListener('mousedown', (e) => {
        // Don't drag if clicking buttons
        if (e.target.closest('button')) return;

        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = 'grabbing';

        // Bring to front
        element.style.zIndex = 1000;

        // Remove z-index from others logic could go here if needed, 
        // but hover handles temporary z-index. 
        // Permanent z-index for dragged item is good.
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent selection
        element.style.left = (e.clientX - offsetX) + 'px';
        element.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
            element.style.zIndex = ''; // Reset to allow CSS hover z-index to work
        }
    });

    // Touch events
    element.addEventListener('touchstart', (e) => {
        if (e.target.closest('button')) return;

        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - element.offsetLeft;
        offsetY = touch.clientY - element.offsetTop;

        element.style.zIndex = 1000;
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        element.style.left = (touch.clientX - offsetX) + 'px';
        element.style.top = (touch.clientY - offsetY) + 'px';
    }, { passive: false });

    document.addEventListener('touchend', () => {
        isDragging = false;
        element.style.zIndex = '';
    });
}

function attachImage(base64Image) {
    const div = document.createElement("div");
    makeDraggable(div);

    div.classList.add("imageCard");
    div.style.backgroundImage = `url('${base64Image}')`;

    // Improved Stacking Logic: Random scatter
    // Random angle between -15 and 15 degrees
    const randomAngle = Math.random() * 30 - 15;
    // Random offset
    const randomX = Math.random() * 50 - 25;
    const randomY = Math.random() * 50 - 25;

    div.style.transform = `rotate(${randomAngle}deg) translate(${randomX}px, ${randomY}px)`;

    // Store the random rotation for hover effect reset (handled in CSS mostly, but initial state needs it)
    div.dataset.rotation = randomAngle;

    div.innerHTML = `
        <div class="cardActions">
            <button onclick="downloadImage('${base64Image}')" title="Save">
                <ion-icon name="save-outline"></ion-icon>
            </button>
            <button onclick="this.closest('.imageCard').remove()" title="Delete">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        </div>
    `;

    imageContainer.appendChild(div);
}

function downloadImage(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `imagefx-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function generateImage(prompt) {
    try {
        const res = await fetch("/generate?prompt=" + encodeURI(prompt));
        if (!res.ok) throw new Error("Generation failed");

        const base64Image = await res.text();
        return `data:image/png;base64,${base64Image}`;
    } catch (e) {
        console.error("Error generating image:", e);
        throw e;
    }
}


// Attaching events to functions
promptBox.onkeypress = handlePromptSubmit;
submitButton.onclick = handlePromptSubmit;

