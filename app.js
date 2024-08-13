let pdfDoc = null;
let scale = 1.5;

function renderPage(pageNum, canvas) {
    pdfDoc.getPage(pageNum).then(function(page) {
        let viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        let ctx = canvas.getContext('2d');
        let renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderContext);
    });
}

document.getElementById('pdf-file').onchange = function(event) {
    let file = event.target.files[0];
    let fileReader = new FileReader();
    
    fileReader.onload = function() {
        let typedarray = new Uint8Array(this.result);
        
        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            pdfDoc = pdf;
            let viewer = document.getElementById('pdf-viewer');
            viewer.innerHTML = '';
            
            for(let i = 1; i <= pdf.numPages; i++) {
                let canvas = document.createElement('canvas');
                viewer.appendChild(canvas);
                renderPage(i, canvas);
            }
        });
    };
    
    fileReader.readAsArrayBuffer(file);
};

let isDrawing = false;
let currentCanvas = null;
let currentCtx = null;

function startDrawing(e) {
    isDrawing = true;
    currentCanvas = e.target;
    currentCtx = currentCanvas.getContext('2d');
    let rect = currentCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    currentCtx.beginPath();
    currentCtx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    let rect = currentCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    currentCtx.lineTo(x, y);
    currentCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

document.getElementById('sign-button').onclick = function() {
    let viewer = document.getElementById('pdf-viewer');
    viewer.addEventListener('mousedown', startDrawing);
    viewer.addEventListener('mousemove', draw);
    viewer.addEventListener('mouseup', stopDrawing);
    viewer.addEventListener('mouseout', stopDrawing);
};

document.getElementById('save-button').onclick = function() {
let viewer = document.getElementById('pdf-viewer');
let canvases = viewer.querySelectorAll('canvas');

// Obtener las dimensiones del primer canvas
let firstCanvas = canvases[0];
let scale = firstCanvas.width / firstCanvas.height;

// Crear un nuevo PDF con las dimensiones correctas
let pdf = new jspdf.jsPDF({
orientation: scale > 1 ? 'landscape' : 'portrait',
unit: 'pt',
format: [firstCanvas.width, firstCanvas.height]
});

canvases.forEach((canvas, index) => {
if (index > 0) pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'landscape' : 'portrait');
let imgData = canvas.toDataURL('image/png');
pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
});

pdf.save('documento_firmado.pdf');
};