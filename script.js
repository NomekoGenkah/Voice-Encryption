// Variables globales
let recordAttempts = 0; // Contador de intentos de grabación
const maxAttempts = 3; // Número máximo de intentos
let recordings = []; // Array para almacenar las grabaciones de audio
let voiceKey; // Clave de voz

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

// Función para mostrar el modal de registro
function showRegisterModal(){
    document.getElementById("register-modal").style.display = "block";
}

// Función para cerrar el modal de registro y reiniciar los intentos
function closeRegisterModal() {
    document.getElementById("register-modal").style.display = "none";
    recordAttempts = 0; // Reiniciar el contador de intentos al cerrar
    recordings = []; // Limpiar las grabaciones almacenadas
    document.getElementById("record-attempts").textContent = "Recording attempts: 0/3";
    document.getElementById("record-status").textContent = ""; // Limpiar el estado del registro
}

// Función para iniciar la grabación de voz con intentos
function startRecording() {
    if (recordAttempts >= maxAttempts) {
        document.getElementById("record-status").textContent = "You've reached the maximum number of attempts.";
        return;
    }

    const recordButton = document.querySelector("#register-modal button[onclick='startRecording()']");
    recordButton.textContent = "Recording..."; // Cambiar el texto del botón a "Grabando..."

    // Solicitar acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            let mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                recordings.push(audioBlob);

                // Validar el archivo grabado
                if (audioBlob.size > 0) {
                    recordAttempts++;
                    document.getElementById("record-attempts").textContent = `Recording attempts: ${recordAttempts}/${maxAttempts}`;
                    
                    if (recordAttempts === maxAttempts) {
                        document.getElementById("record-status").textContent = "Successful registration.";
                        voiceKey = "claveDeEjemplo"; // Aquí podrías asignar la clave de voz real

                        // Espera un momento y cierra el modal
                        setTimeout(() => {
                            closeRegisterModal();
                        }, 1500); // Cierra el modal después de 1.5 segundos
                    }
                } else {
                    document.getElementById("record-status").textContent = "Corrupted file.";
                }

                // Restaurar el texto del botón
                recordButton.textContent = "Record";
            };

            // Iniciar la grabación y detenerla después de 3 segundos
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
            }, 3000); // 3000 milisegundos (3 segundos)
        })
        .catch(function(err) {
            console.log('Error al acceder al micrófono: ' + err);
            document.getElementById("record-status").textContent = "Error al acceder al micrófono.";
            // Restaurar el texto del botón en caso de error
            recordButton.textContent = "Record";
        });
}

// Función para iniciar el reconocimiento de voz y obtener la clave de encriptación
function startVoiceEncryption() {
    let mediaRecorder;
    let audioChunks = [];
    let audioUrl;

    // Solicitar acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
        // Crear el MediaRecorder
        mediaRecorder = new MediaRecorder(stream);
        
        // Capturar los datos cuando el grabador esté grabando
        mediaRecorder.ondataavailable = function(event) {
            audioChunks.push(event.data);
        };

        // Detener la grabación
        mediaRecorder.onstop = function() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play(); // Reproducir el audio grabado

            // Crear un enlace para descargar el archivo grabado
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = 'audio_grabado.wav';
            a.click();
        };

        // Iniciar la grabación
        mediaRecorder.start();

        // Detener la grabación automáticamente después de 3 segundos
        setTimeout(function() {
            mediaRecorder.stop(); // Detener la grabación después de 3 segundos
        }, 3000); // 3000 milisegundos (3 segundos)
        
        // Devolver el objeto mediaRecorder para controlarlo desde el botón de detener
        return mediaRecorder;
    })
    .catch(function(err) {
        console.log('Error al acceder al micrófono: ' + err);
    });
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
        alert("Please select a file to encrypt.");
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
        alert("Please select a file to decrypt.");
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
