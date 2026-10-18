let state = {
    money: 500,
    enclosures: 1,
    pets: [],
    multiplier: 1,
    claimedCodes: [],
    buyCounts: {
        '💩': 0, 'apple': 0, 'distorted': 0, 'gemini': 0, 'customEmoji': 0, 'customWord': 0
    }
};

let currentFoundCode = "";

const codeDatabase = {
    "Gemini": { type: "pet", value: "gemini" }
};

for (let i = 1; i < 100; i++) {
    let randomStr = "CODE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    codeDatabase[randomStr] = { type: "money", value: Math.floor(Math.random() * 500) + 100 };
}
const allCodeKeys = Object.keys(codeDatabase);

let world;

// Pricing Inflation Calculation
function getCost(type) {
    let count = state.buyCounts[type] || 0;
    if (type === '💩') {
        if (count === 0) return 0;
        return Math.floor(60 * Math.pow(1.15, count - 1));
    }
    const baseCosts = { 'apple': 150, 'distorted': 300, 'gemini': 500, 'customEmoji': 1000, 'customWord': 1000 };
    return Math.floor((baseCosts[type] || 0) * Math.pow(1.15, count));
}

function flashError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.color = '#dc3545'; 
        setTimeout(() => { el.style.color = ''; }, 500);
    }
}

function flashInputError(inputEl) {
    if (inputEl) {
        inputEl.style.borderColor = '#dc3545';
        inputEl.style.color = '#dc3545';
        setTimeout(() => {
            inputEl.style.borderColor = '#ccc';
            inputEl.style.color = '';
        }, 500);
    }
}

window.buyEnclosure = function() {
    if (state.money >= 500) {
        state.money -= 500;
        state.enclosures++;
        renderEnclosure();
        updateUI();
    } else {
        flashError('money-container');
    }
};

function renderEnclosure() {
    if (!world) world = document.getElementById('world-container');
    const enc = document.createElement('div');
    enc.className = 'enclosure';
    const currentCount = world.getElementsByClassName('enclosure').length + 1;
    enc.id = `enc-${currentCount}`;
    world.appendChild(enc);
}

window.buyPet = function(type) {
    const maxPets = state.enclosures * 3;
    const currentPets = state.pets.length;
    const cost = getCost(type);

    if (currentPets >= maxPets) {
        flashError('limit-container');
        return;
    }

    if (state.money < cost) {
        flashError('money-container');
        return;
    }

    state.money -= cost;
    state.buyCounts[type] = (state.buyCounts[type] || 0) + 1;
    const targetEncIdx = Math.floor(currentPets / 3) + 1;
    createPet(type, targetEncIdx);
    updateUI();
};

window.buyCustomEmoji = function() {
    const input = document.getElementById('custom-emoji');
    const emoji = input.value.trim();
    const maxPets = state.enclosures * 3;
    const cost = getCost('customEmoji');
    
    const emojiRegex = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D\p{Emoji_Modifier}]+$/u;
    
    if (!emoji || !emojiRegex.test(emoji) || [...emoji].length > 2) {
        flashInputError(input);
        return;
    }

    if (state.pets.length >= maxPets) {
        flashError('limit-container');
        return;
    }

    if (state.money < cost) {
        flashError('money-container');
        return;
    }

    state.money -= cost;
    state.buyCounts['customEmoji'] = (state.buyCounts['customEmoji'] || 0) + 1;
    state.multiplier = 2;
    const targetEncIdx = Math.floor(state.pets.length / 3) + 1;
    createPet(emoji, targetEncIdx);
    input.value = '';
    updateUI();
};

window.buyCustomWord = function() {
    const input = document.getElementById('custom-word');
    const word = input.value.trim();
    const maxPets = state.enclosures * 3;
    const cost = getCost('customWord');
    
    const emojiRegex = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;
    
    if (!word || word.length > 6 || emojiRegex.test(word)) {
        flashInputError(input);
        return;
    }

    if (state.pets.length >= maxPets) {
        flashError('limit-container');
        return;
    }

    if (state.money < cost) {
        flashError('money-container');
        return;
    }

    state.money -= cost;
    state.buyCounts['customWord'] = (state.buyCounts['customWord'] || 0) + 1;
    state.multiplier = 2;
    const targetEncIdx = Math.floor(state.pets.length / 3) + 1;
    createPet(word, targetEncIdx);
    input.value = '';
    updateUI();
};

function createPet(type, encId, savedX, savedY) {
    const pet = document.createElement('div');
    pet.className = 'mini-friend';
    
    if (type === 'apple') {
        pet.innerHTML = `<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwshoRezxIcrZ0JGoKk48Bf8qaHc-pABVatW3LJIwNdg&s=10">`;
    } else if (type === 'distorted') {
        pet.innerHTML = `<img src="https://i.imghippo.com/files/rbO9451SEE.png">`;
    } else if (type === 'gemini') {
        pet.innerHTML = `<img src="https://i.imghippo.com/files/Ki3447tmI.png">`;
    } else {
        pet.innerText = type;
        if ([...type].length > 2) {
            pet.style.fontSize = "16px";
            pet.style.fontWeight = "bold";
            pet.style.color = "var(--text)";
        }
    }

    let parent = document.getElementById(`enc-${encId}`);
    if (!parent) parent = document.getElementById('enc-1');
    parent.appendChild(pet);

    let petObj = {
        el: pet,
        type: type,
        encId: encId,
        x: savedX || Math.random() * 200,
        y: savedY || Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3
    };

    setInterval(() => {
        if (!pet.dataset.dragging) {
            petObj.x += petObj.vx;
            petObj.y += petObj.vy;
            if (petObj.x < 0 || petObj.x > 230) petObj.vx *= -1;
            if (petObj.y < 0 || petObj.y > 230) petObj.vy *= -1;
            pet.style.left = petObj.x + 'px';
            pet.style.top = petObj.y + 'px';
        }
    }, 40);

    const startDrag = (e) => { 
        pet.dataset.dragging = "true"; 
        pet.style.zIndex = 1000; 
        if (e.type === 'touchstart') { document.body.style.overflow = 'hidden'; }
    };

    const moveDrag = (e) => {
        if (pet.dataset.dragging) {
            e.preventDefault(); 
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const rect = parent.getBoundingClientRect();
            petObj.x = clientX - rect.left - 25;
            petObj.y = clientY - rect.top - 25;
            pet.style.left = petObj.x + 'px';
            pet.style.top = petObj.y + 'px';
        }
    };

    const endDrag = () => { 
        pet.dataset.dragging = ""; 
        pet.style.zIndex = 10; 
        document.body.style.overflow = ''; 
        saveGame(); 
    };

    pet.addEventListener('mousedown', startDrag);
    pet.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    state.pets.push(petObj);
}

function updateUI() {
    document.getElementById('money-display').innerText = Math.floor(state.money);
    document.getElementById('pet-count').innerText = state.pets.length;
    document.getElementById('pet-max').innerText = state.enclosures * 3;
    
    if (state.multiplier > 1) {
        document.getElementById('multiplier-display').style.display = 'inline';
    }

    document.getElementById('btn-poop').innerText = `💩 Poop ($${getCost('💩')})`;
    document.getElementById('btn-apple').innerText = `🍎 Apple ($${getCost('apple')})`;
    document.getElementById('btn-distorted').innerText = `🌀 Distorted ($${getCost('distorted')})`;
    document.getElementById('btn-gemini').innerText = `✨ Gemini ($${getCost('gemini')})`;
    
    let cEmojiCost = getCost('customEmoji');
    document.getElementById('btn-customEmoji').innerText = cEmojiCost >= 1000 ? `Buy Emoji ($${cEmojiCost/1000}k)` : `Buy Emoji ($${cEmojiCost})`;
    
    let cWordCost = getCost('customWord');
    document.getElementById('btn-customWord').innerText = cWordCost >= 1000 ? `Buy Word ($${cWordCost/1000}k)` : `Buy Word ($${cWordCost})`;
}

window.openPromoPanel = function() {
    document.getElementById('promo-panel').style.display = 'block';
    document.getElementById('promo-msg').innerText = '';
    document.getElementById('promo-msg').style.color = 'black';
};

window.openCodeBook = function() {
    document.getElementById('code-book-panel').style.display = 'block';
    document.getElementById('notif-dot').style.display = 'none';
    if (currentFoundCode) {
        document.getElementById('book-message').innerText = `Hey, here is a code: ${currentFoundCode}`;
    } else {
        document.getElementById('book-message').innerText = "The pages are empty right now... Check back later!";
    }
};

window.redeemCode = function() {
    const inputStr = document.getElementById('promo-input').value.trim();
    const msgBox = document.getElementById('promo-msg');
    if (!inputStr) return;

    if (state.claimedCodes.includes(inputStr)) {
        msgBox.style.color = "#dc3545";
        msgBox.innerText = "Error: You already claimed this code!";
        return;
    }

    if (codeDatabase[inputStr]) {
        let reward = codeDatabase[inputStr];
        if (reward.type === 'pet') {
            const maxPets = state.enclosures * 3;
            if (state.pets.length >= maxPets) {
                msgBox.style.color = "#dc3545";
                msgBox.innerText = "Error: You need more enclosures first!";
                return;
            }
            const targetEncIdx = Math.floor(state.pets.length / 3) + 1;
            createPet(reward.value, targetEncIdx); 
            msgBox.style.color = "#28a745";
            msgBox.innerText = "Success! Free Gemini pet added!";
        } else if (reward.type === 'money') {
            state.money += reward.value;
            msgBox.style.color = "#28a745";
            msgBox.innerText = `Success! You received $${reward.value}!`;
        }

        state.claimedCodes.push(inputStr);
        document.getElementById('promo-input').value = '';
        if (inputStr === currentFoundCode) currentFoundCode = "";
        updateUI();
    } else {
        msgBox.style.color = "#dc3545";
        msgBox.innerText = "Error: Invalid code!";
    }
};

setInterval(() => {
    let availableKeys = allCodeKeys.filter(k => !state.claimedCodes.includes(k));
    if (availableKeys.length > 0 && !currentFoundCode) {
        currentFoundCode = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        document.getElementById('notif-dot').style.display = 'block';
    }
}, 20000); 

window.openAdmin = function() { document.getElementById('admin-panel').style.display = 'block'; };

window.checkAdmin = function() { 
    const passInput = document.getElementById('admin-pass');
    if (passInput.value === "TREYADMIN") {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-tools').style.display = 'flex'; 
    } else {
        flashInputError(passInput);
    }
};

window.closeModal = function(id) { 
    document.getElementById(id).style.display = 'none'; 
    if (id === 'admin-panel') {
        document.getElementById('admin-tools').style.display = 'none';
        document.getElementById('admin-login').style.display = 'flex';
        document.getElementById('admin-pass').value = '';
    }
};

window.clearSave = function() {
    localStorage.removeItem('emojiSiteOriginalSave');
    location.reload();
};

function saveGame() {
    const petData = state.pets.map(p => ({ type: p.type, encId: p.encId, x: p.x, y: p.y }));
    localStorage.setItem('emojiSiteOriginalSave', JSON.stringify({
        money: state.money,
        enclosures: state.enclosures,
        pets: petData,
        multiplier: state.multiplier,
        claimedCodes: state.claimedCodes,
        buyCounts: state.buyCounts 
    }));
}

function loadGame() {
    world = document.getElementById('world-container');
    const saved = localStorage.getItem('emojiSiteOriginalSave');
    if (saved) {
        const data = JSON.parse(saved);
        state.money = data.money;
        state.enclosures = data.enclosures || 1;
        state.multiplier = data.multiplier || 1;
        state.claimedCodes = data.claimedCodes || [];
        state.buyCounts = data.buyCounts || {
            '💩': 0, 'apple': 0, 'distorted': 0, 'gemini': 0, 'customEmoji': 0, 'customWord': 0
        };

        for (let i = 0; i < state.enclosures; i++) {
            renderEnclosure();
        }
        data.pets.forEach(p => createPet(p.type, p.encId, p.x, p.y));
    } else {
        state.enclosures = 1;
        renderEnclosure();
    }
    updateUI();
}

setInterval(() => { state.money += (state.pets.length * 1.5 * state.multiplier); updateUI(); }, 1000);
setInterval(saveGame, 1000);
window.onload = loadGame;
      
