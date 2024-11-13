document.getElementById("generate").addEventListener("click", generatePassword);
document.getElementById("copy").addEventListener("click", copyToClipboard);
document.getElementById("show-password").addEventListener("change", togglePasswordVisibility);
document.getElementById('theme').addEventListener('change', changeTheme);
document.getElementById('uppercase').addEventListener('change', validatePasswordOptions);
document.getElementById('lowercase').addEventListener('change', validatePasswordOptions);
document.getElementById('numbers').addEventListener('change', validatePasswordOptions);
document.getElementById('symbols').addEventListener('change', validatePasswordOptions);
document.getElementById('length').addEventListener('input', updateLengthDisplay);
document.getElementById('language').addEventListener('change', changeLanguage);
document.getElementById('preset').addEventListener('change', applyPreset);

let passwordHistory = [];
let expirationTimers = {};

function updateLength() {
    const length = document.getElementById("length").value;
    document.getElementById("length-display").innerText = length;
}

function generatePassword() {
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    const useCustomPattern = document.getElementById('custom-pattern').checked;
    const customSymbols = document.getElementById('custom-symbols').value;

    let characterSet = '';
    if (useUppercase) characterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) characterSet += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) characterSet += '0123456789';
    if (useSymbols) characterSet += '!@#$%^&*()_+[]{}|;:,.<>?';

    if (excludeSimilar) {
        characterSet = characterSet.replace(/[O0l1I|]/g, ''); // Exclude similar characters
    }

    if (customSymbols) {
        characterSet += customSymbols; // Add custom symbols
    }

    let password = '';
    const length = document.getElementById('length').value;

    if (useCustomPattern) {
        // Example pattern: "A0a!" (Uppercase, Number, Lowercase, Symbol)
        const pattern = 'A0a!';
        for (let i = 0; i < length; i++) {
            const charType = pattern[i % pattern.length];
            switch (charType) {
                case 'A':
                    password += getRandomCharacter('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    break;
                case '0':
                    password += getRandomCharacter('0123456789');
                    break;
                case 'a':
                    password += getRandomCharacter('abcdefghijklmnopqrstuvwxyz');
                    break;
                case '!':
                    password += getRandomCharacter('!@#$%^&*()_+[]{}|;:,.<>?');
                    break;
                default:
                    password += getRandomCharacter(characterSet);
            }
        }
    } else {
        for (let i = 0; i < length; i++) {
            password += getRandomCharacter(characterSet);
        }
    }

    document.getElementById('password-display').value = password;
    updateStrengthIndicator(password);
    const passwordDisplay = document.getElementById('password-display');
    passwordDisplay.value = password;
    passwordDisplay.classList.add('password-visible');
    setTimeout(() => {
        passwordDisplay.classList.remove('password-visible');
    }, 500);
    if (passwordDisplay.value) {
        showFeedback('Password generated successfully!', true);
    } else {
        showFeedback('Failed to generate password. Please check your options.', false);
    }
    updateStrengthMeter(password);
    addToHistory(password);
    setExpirationTimer(password);
    provideStrengthSuggestions(password);
    updateComplexityMeter(password);
}

function copyToClipboard() {
    const passwordDisplay = document.getElementById('password-display');
    passwordDisplay.select();
    document.execCommand('copy');
    alert('Password copied to clipboard!');
}

function togglePasswordVisibility() {
    const passwordDisplay = document.getElementById('password-display');
    passwordDisplay.type = document.getElementById('show-password').checked ? 'text' : 'password';
}

function updateStrengthIndicator(password) {
    const strengthDisplay = document.getElementById('strength');
    const strength = calculatePasswordStrength(password);
    strengthDisplay.textContent = `Strength: ${strength}`;
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) strength += 20;
    return strength;
}

function showFeedback(message, success) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.style.color = success ? '#00796b' : '#d32f2f'; // Green for success, red for error
    feedback.style.visibility = 'visible';
    setTimeout(() => {
        feedback.style.visibility = 'hidden';
    }, 3000);
}

function updateStrengthMeter(password) {
    const strengthBar = document.getElementById('strength-bar');
    const strength = calculatePasswordStrength(password);
    strengthBar.style.width = `${strength}%`;

    if (strength < 40) {
        strengthBar.style.backgroundColor = '#d32f2f'; // Weak (red)
    } else if (strength < 70) {
        strengthBar.style.backgroundColor = '#fbc02d'; // Medium (yellow)
    } else {
        strengthBar.style.backgroundColor = '#388e3c'; // Strong (green)
    }
}

function addToHistory(password) {
    if (passwordHistory.length >= 10) {
        passwordHistory.shift(); // Keep only the last 10 passwords
    }
    passwordHistory.push(password);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    passwordHistory.forEach((pwd, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}: ${pwd}`;
        historyList.appendChild(listItem);
    });
}

function getRandomCharacter(set) {
    return set.charAt(Math.floor(Math.random() * set.length));
}

function setExpirationTimer(password) {
    const expirationTime = parseInt(document.getElementById('expiration-time').value, 10) * 60000; // Convert minutes to milliseconds
    if (expirationTimers[password]) {
        clearTimeout(expirationTimers[password]);
    }
    expirationTimers[password] = setTimeout(() => {
        alert(`The password "${password}" has expired.`);
        delete expirationTimers[password];
    }, expirationTime);
}

function changeTheme() {
    const selectedTheme = document.getElementById('theme').value;
    document.body.className = selectedTheme;
    document.querySelector('.container').className = `container ${selectedTheme}`;
}

function provideStrengthSuggestions(password) {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';

    const suggestions = [];
    if (password.length < 12) {
        suggestions.push('Increase the password length to at least 12 characters.');
    }
    if (!/[A-Z]/.test(password)) {
        suggestions.push('Add uppercase letters to increase strength.');
    }
    if (!/[a-z]/.test(password)) {
        suggestions.push('Add lowercase letters to increase strength.');
    }
    if (!/\d/.test(password)) {
        suggestions.push('Include numbers to make the password stronger.');
    }
    if (!/[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(password)) {
        suggestions.push('Include symbols to enhance security.');
    }

    if (suggestions.length === 0) {
        suggestions.push('Your password is strong!');
    }

    suggestions.forEach(suggestion => {
        const listItem = document.createElement('li');
        listItem.textContent = suggestion;
        suggestionsList.appendChild(listItem);
    });
}

function validatePasswordOptions() {
    const messageElement = document.getElementById('real-time-message');
    const useUppercase = document.getElementById('uppercase').checked;
    const useLowercase = document.getElementById('lowercase').checked;
    const useNumbers = document.getElementById('numbers').checked;
    const useSymbols = document.getElementById('symbols').checked;

    let message = 'Your password is weak. Consider adding: ';
    let suggestions = [];

    if (!useUppercase) suggestions.push('uppercase letters');
    if (!useLowercase) suggestions.push('lowercase letters');
    if (!useNumbers) suggestions.push('numbers');
    if (!useSymbols) suggestions.push('symbols');

    if (suggestions.length === 0) {
        message = 'Your password settings are strong!';
    } else {
        message += suggestions.join(', ') + '.';
    }

    messageElement.textContent = message;
}

function updateLengthDisplay() {
    const length = document.getElementById('length').value;
    document.getElementById('length-display').textContent = length;
}

const translations = {
    en: {
        title: "Password Generator",
        lengthLabel: "Password Length:",
        enableSymbols: "Enable Symbols",
        // Add more translations as needed
    },
    es: {
        title: "Generador de Contraseñas",
        lengthLabel: "Longitud de la Contraseña:",
        enableSymbols: "Habilitar Símbolos",
        // Add more translations as needed
    },
    fr: {
        title: "Générateur de Mots de Passe",
        lengthLabel: "Longueur du Mot de Passe:",
        enableSymbols: "Activer les Symboles",
        // Add more translations as needed
    }
};

function changeLanguage() {
    const selectedLanguage = document.getElementById('language').value;
    const translation = translations[selectedLanguage];

    document.getElementById('title').textContent = translation.title;
    document.querySelector('label[for="length"]').textContent = translation.lengthLabel;
    document.querySelector('label[for="symbols"]').textContent = translation.enableSymbols;
    // Update other text elements as needed
}

// Call changeLanguage initially to set the default language
changeLanguage();

// Call validatePasswordOptions initially to set the message
validatePasswordOptions();

function updateComplexityMeter(password) {
    const complexityBar = document.getElementById('complexity-bar').querySelector('::after');
    const strength = calculatePasswordStrength(password);
    complexityBar.style.width = `${strength}%`;

    if (strength < 40) {
        complexityBar.style.backgroundColor = '#d32f2f'; // Weak (red)
    } else if (strength < 70) {
        complexityBar.style.backgroundColor = '#fbc02d'; // Medium (yellow)
    } else {
        complexityBar.style.backgroundColor = '#388e3c'; // Strong (green)
    }
}

function applyPreset() {
    const preset = document.getElementById('preset').value;
    const uppercase = document.getElementById('uppercase');
    const lowercase = document.getElementById('lowercase');
    const numbers = document.getElementById('numbers');
    const symbols = document.getElementById('symbols');
    const length = document.getElementById('length');

    switch (preset) {
        case 'strong':
            uppercase.checked = true;
            lowercase.checked = true;
            numbers.checked = true;
            symbols.checked = true;
            length.value = 16;
            break;
        case 'memorable':
            uppercase.checked = false;
            lowercase.checked = true;
            numbers.checked = false;
            symbols.checked = false;
            length.value = 12;
            break;
        case 'numeric':
            uppercase.checked = false;
            lowercase.checked = false;
            numbers.checked = true;
            symbols.checked = false;
            length.value = 8;
            break;
        default:
            // Custom settings, do nothing
            break;
    }

    updateLengthDisplay();
}

// Ensure the length display is updated when presets change the length
function updateLengthDisplay() {
    const length = document.getElementById('length').value;
    document.getElementById('length-display').textContent = length;
}

// Call updateLengthDisplay initially to set the default length display
updateLengthDisplay();
