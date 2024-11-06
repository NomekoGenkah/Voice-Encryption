// Variables globales
let voiceKey = "";

// Función de inicio de sesión
function login() {
  const username = document.getElementById("username").value;
  if (username) {
    localStorage.setItem("username", username);
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    document.getElementById("display-username").textContent = username;
  } else {
    alert("Por favor, ingresa un nombre de usuario.");
  }
}

// Función para iniciar el reconocimiento de voz y obtener la clave de encriptación
function startVoiceEncryption() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Lo siento, tu navegador no soporta el reconocimiento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  
  recognition.onresult = (event) => {
    voiceKey = event.results[0][0].transcript;
    alert("Clave de voz capturada: " + voiceKey);
    encryptFile();
  };

  recognition.start();
}

// Función para capturar la clave de desencriptación por voz
function startVoiceDecryption() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Lo siento, tu navegador no soporta el reconocimiento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  
  recognition.onresult = (event) => {
    const decryptionKey = event.results[0][0].transcript;
    if (decryptionKey === voiceKey) {
      alert("Clave de voz coincidente. Desencriptando...");
      decryptFile(decryptionKey);
    } else {
      alert("La clave de voz no coincide. Inténtalo de nuevo.");
    }
  };

  recognition.start();
}

// Función de cifrado utilizando la clave de voz
function encryptFile() {
  const fileInput = document.getElementById("encrypt-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor, selecciona un archivo para encriptar.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileContent = e.target.result;
    const encryptedContent = simpleEncrypt(fileContent, voiceKey);

    const encryptedBlob = new Blob([encryptedContent], { type: file.type });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(encryptedBlob);
    downloadLink.download = "encrypted_" + file.name;
    downloadLink.click();

    document.getElementById("encryption-progress").style.display = "block";
  };

  reader.readAsText(file);
}

// Función de desencriptación utilizando la clave de voz
function decryptFile(decryptionKey) {
  const fileInput = document.getElementById("decrypt-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor, selecciona un archivo para desencriptar.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileContent = e.target.result;
    const decryptedContent = simpleEncrypt(fileContent, decryptionKey);

    const decryptedBlob = new Blob([decryptedContent], { type: file.type });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(decryptedBlob);
    downloadLink.download = "decrypted_" + file.name;
    downloadLink.click();

    document.getElementById("decryption-progress").style.display = "block";
  };

  reader.readAsText(file);
}

// Función de encriptación/desencriptación básica (simple XOR)
function simpleEncrypt(content, key) {
  let result = "";
  for (let i = 0; i < content.length; i++) {
    result += String.fromCharCode(content.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}
