const chatContainer = document.querySelector(".chatContainer");
const imageContainer = document.querySelector(".imageContainer");
const submitButton = document.querySelector(".inputContainer .generateButton");
const promptBox = document.querySelector(".inputContainer input[type='text']");

let imageIndex = 0;

// These are attached to event listeners
async function handlePromptSubmit(event) {
    const value = promptBox.value;

    if (event && promptBox.value.trim() != "" && (event.key == 'Enter' || event.type == 'click')) {
        let paragraph = attachPrompt(promptBox.value, "loading");

        promptBox.value = "";

        attachImage(await generateImage(value));
        paragraph.classList.replace("loading", "success");
    }
}

// Utility function
function attachPrompt(message, statusClass) { // Status can be: loading, success, failure
    const paragraph = document.createElement("p");
    paragraph.classList.add(statusClass);
    paragraph.innerText = message;

    chatContainer.appendChild(paragraph);

    return paragraph;
}

function makeDraggable(element) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    element.style.position = 'absolute'; // ensure the element can move

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = (e.clientX - offsetX) + 'px';
        element.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        element.style.cursor = 'grab';
    });

    // Optional: Set initial cursor
    element.style.cursor = 'grab';
}

function attachImage(base64Image) {
    const div = document.createElement("div");
    makeDraggable(div);

    div.classList.add("imageCard");
    div.style.backgroundImage = `url('${base64Image}')`;
    div.style.marginLeft = `${imageIndex++ * 30}px`

    div.innerHTML = `
        <div class="cardActions">
            <button><ion-icon name="save-outline"></ion-icon></button>
            <button onclick="this.closest('.imageCard').remove()">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        </div>
    `;

    imageContainer.appendChild(div);
}

async function generateImage(prompt) {
    const res = await fetch("http://localhost:8080/generate/?prompt=" + encodeURI(prompt))
    const base64Image = await res.text();

    console.log(base64Image);

    return `data:image/png;base64,${base64Image}`;
}


// Attaching events to functions
promptBox.onkeypress = handlePromptSubmit;
submitButton.onclick = handlePromptSubmit;
