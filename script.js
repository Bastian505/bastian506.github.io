document.addEventListener('DOMContentLoaded', function() {
    let cropper;
    const subirArchivoBoton = document.getElementById('subir-archivo-boton'),
          imagenResultado = document.getElementById('imagen-resultado'),
          imagenProcesada = document.getElementById('imagen-procesada'),
          textoConvertido = document.getElementById('texto-convertido'),
          seccionSubirArchivo = document.getElementById('area'), // Sección para subir archivo
          seccionProcesarImagen = document.getElementById('seccionProcesarImagen'),
          seccionResultados = document.getElementById('seccionResultados'),
          modal = document.getElementById('modalRecortar'),
          botonRecortar = document.getElementById('botonRecortar'),
          botonCancelar = document.getElementById('botonCancelar'),
          botonCerrar = document.getElementsByClassName("close")[0];

    subirArchivoBoton.addEventListener('change', function() {
        displayImage();
    });

    function displayImage() {
        const reader = new FileReader();
        reader.onload = () => {
            imagenResultado.src = reader.result;
            modal.style.display = "block";
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(imagenResultado, {
                aspectRatio: NaN,
                preview: '.img-sample',
                zoomable: false,
                viewMode: 1,
                responsive: true,
                dragMode: 'none',
                autoCropArea: 1,
            });
        };
        reader.readAsDataURL(subirArchivoBoton.files[0]);
    }

    botonRecortar.addEventListener('click', function() {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob(function(blob) {
            imagenProcesada.src = URL.createObjectURL(blob);
            recognizeText(blob);
            modal.style.display = "none";
            if (cropper) {
                cropper.destroy();
            }
            seccionProcesarImagen.classList.remove('hidden');
            seccionSubirArchivo.classList.add('hidden'); // Ocultar sección de subida de archivo
        });
    });

    botonCerrar.onclick = botonCancelar.onclick = function() {
        modal.style.display = "none";
        if (cropper) {
            cropper.destroy();
            imagenResultado.src = '';
        }
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (cropper) {
                cropper.destroy();
                imagenResultado.src = '';
            }
        }
    };

    function recognizeText(file) {
        Tesseract.recognize(file, {
            lang: 'spa'
        })
        .progress(function (p) {
            updateProgress(p);
        })
        .then(function (result) {
            textoConvertido.value = result.text;
            document.getElementById('progreso').textContent = "Proceso completado";
            seccionResultados.classList.remove('hidden');
        })
        .catch(function (error) {
            console.error('Error al reconocer el texto:', error);
        });
    }
    
    function updateProgress(p) {
        if (p.status === 'recognizing text') {
            const progreso = Math.round(p.progress * 100);
            document.getElementById('progreso').textContent = `Progreso: ${progreso}%`;
        }
    }
});
