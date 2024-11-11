// Variables globales
let recordAttempts = 0; // Contador de intentos de grabación
const maxAttempts = 3; // Número máximo de intentos
let recordings = []; // Array para almacenar las grabaciones de audio
let voiceKey; // Clave de voz
let audio; // Variable global para almacenar el audio grabado
let username
let grabando = false;
// Función de inicio de sesión
function log(username) {

    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "block";
    document.getElementById("display-username").textContent = username;
}

function loginRecord(){
    const recordButton = document.querySelector("#login-modal button[onclick='loginRecord()']");
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
            audio = new Blob(audioChunks, { type: 'audio/wav' }); // Guardar el audio en la variable global

            // Validar el archivo grabado
            if (audio.size > 0) {
                //document.getElementById("record-status").textContent = "Successful registration.";
                //voiceKey = "claveDeEjemplo"; // Aquí podrías asignar la clave de voz real

                // Espera un momento y cierra el modal
                setTimeout(() => {
                    closeLoginModal();
                }, 1500); // Cierra el modal después de 1.5 segundos
                login(audio);

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

async function login(audio) {
    try {
        username = document.getElementById("usernameLogin").value;
        const formData = new FormData();
        formData.append("audioFile", audio, "audio.wav");

        formData.append("username", username);
        console.log(formData);

        const response = await fetch('https://voice-backend-dnam.onrender.com/login', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            log(username);
            const respuestaTexto = await response.text();
            console.log("Respuesta del backend:", respuestaTexto);
        } else {
            console.log("Error al enviar los datos. Código de estado:", response.status);
        }
        
    } catch (error) {
        console.error("Error en la conexión con el backend: logeando", error);
    }
}

function showLoginModal(){
    document.getElementById("login-modal").style.display = "block";
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

function closeLoginModal() {
    document.getElementById("login-modal").style.display = "none";
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
    if(grabando){
        return
    }

    const recordButton = document.querySelector("#register-modal button[onclick='startRecording()']");
    recordButton.textContent = "Recording..."; // Cambiar el texto del botón a "Grabando..."

    // Solicitar acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            let mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = function(event) {
                grabando = true;
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = function() {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                recordings.push(audioBlob);
                grabando = false;

                // Validar el archivo grabado
                if (audioBlob.size > 0) {
                    recordAttempts++;
                    document.getElementById("record-attempts").textContent = `Recording attempts: ${recordAttempts}/${maxAttempts}`;
                    
                    if (recordAttempts === maxAttempts) {
                        enviarAudiosYNombre();
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


function encriptar(){
    fileInput = document.getElementById("encrypt-file");
    uploadAndDownloadFile("https://voice-backend-dnam.onrender.com/encrypt", fileInput);
}

function desencriptar(){
    fileInput = document.getElementById("decrypt-file");
    uploadAndDownloadFile("https://voice-backend-dnam.onrender.com/decrypt", fileInput);
}

// Función para enviar el archivo y recibir el archivo de vuelta

async function uploadAndDownloadFile(url, fileInput) {
    const username = document.getElementById("usernameLogin").value;

    // Verificar que un archivo ha sido seleccionado
    if (fileInput.files.length === 0) {
        alert("Por favor selecciona un archivo.");
        return;
    }

    const file = fileInput.files[0];

    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);

    try {
        // Enviar el archivo al backend
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        // Verificar que la respuesta del backend fue exitosa
        if (!response.ok) {
            throw new Error("Error al subir el archivo al servidor.");
        }

        // Obtener el archivo de la respuesta (esto depende de cómo se devuelve el archivo desde el backend)
        const blob = await response.blob();

        const disposition = response.headers.get('Content-Disposition');
        const fileName = fileInput.files[0] ? fileInput.files[0].name : 'No file selected';

        if (disposition && disposition.includes('filename=')) {
            let filenameMatch = disposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                fileName = filenameMatch[1];
            }
        }

        // Crear un enlace para descargar el archivo
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;  // El nombre que desees para el archivo descargado
        downloadLink.click();  // Simula el clic para descargar el archivo

    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema al procesar la solicitud.");
    }
}

// Supongamos que las variables globales 'audios' y 'username' ya están definidas

// Supongamos que las variables globales 'audios' y 'username' ya están definidas

function enviarAudiosYNombre() {
    username = document.getElementById("usernameRegister").value;
  const formData = new FormData();
  
  // Agregar los tres archivos de audio al FormData manualmente
  formData.append('audioFile1', recordings[0], 'audio1.wav');
  formData.append('audioFile2', recordings[1], 'audio2.wav');
  formData.append('audioFile3', recordings[2], 'audio3.wav');

  // Agregar el nombre de usuario al FormData
  formData.append('username', username);

  // Enviar los datos al backend con un POST request
  fetch('https://voice-backend-dnam.onrender.com/uploadRegister', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Respuesta del servidor:', data);
  })
  .catch(error => {
    console.error('Error al enviar los datos:', error);
  });
}
