const dragZone = document.querySelector('.upload-container');
const brwoseBtn = document.querySelector('.browse');
const fileInput = document.getElementById('myFile');

const progressContainer = document.querySelector('.progress-container');
const progressBg = document.querySelector('.progress-bg');
const percentDiv = document.getElementById('percent');
const progressBar = document.querySelector('.progress-bar');

const linkEmailSection = document.querySelector('.link-email-container');
const linkInput = document.getElementById('link');
const copyBtn = document.getElementById('copy');

const formElem = document.getElementById('emailForm');

const alertMessage = document.querySelector('.alertMessage');

const host = 'http://localhost:8000';
const fileUploadApi = `${host}/file/uploadFile`;
const sendEmailApi = `${host}/file/sendEmail`;
const maxSize = 100 * 1024 * 1024;

dragZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragZone.classList.contains('dragged')) {
        dragZone.classList.add('dragged');
    }
}, false);

dragZone.addEventListener('dragleave', () => {
    dragZone.classList.remove('dragged');
});

dragZone.addEventListener("drop", (e) => {
    fileInput.value = '';
    e.preventDefault();
    dragZone.classList.remove('dragged');
    fileInput.files = e.dataTransfer.files;
    if (0 < fileInput.files.length) {
        uploadFile();
    }
});

brwoseBtn.addEventListener("click", () => {
    fileInput.value = '';
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    uploadFile();
})

const uploadFile = () => {
    if (fileInput.files.length > 1) {
        showAlert('Upload only one file at a time.');
        return;
    }

    if (fileInput.files[0].size > maxSize) {
        showAlert('Please upload files upto size 100 MB');
        return;
    }

    formElem.elements.sendEmail.removeAttribute('disabled');
    progressContainer.style.display = "block";
    const formData = new FormData();
    formData.append('myFile', fileInput.files[0]);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            displayDownloads(JSON.parse(xhr.response));
        }
    }
    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = () => {
        showAlert(xhr.statusText)
    }
    xhr.open('POST', fileUploadApi);
    xhr.send(formData);
}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    progressBg.style.width = `${percent}%`;
    percentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`;
}

const displayDownloads = ({ file }) => {
    linkInput.value = file;
    progressContainer.style.display = "none";
    linkEmailSection.style.display = "block";
}

copyBtn.addEventListener('click', () => {
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value);
    showAlert('Copied to clipboard!!')
})


formElem.addEventListener('submit', async (e) => {
    e.preventDefault();
    formElem.elements.sendEmail.setAttribute('disabled', 'true')

    const formData = {
        sender: formElem.elements.sender.value,
        receiver: formElem.elements.receiver.value,
        uuid: linkInput.value.split("/").pop()
    }

    const emailResponse = await fetch(sendEmailApi, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
    const response = await emailResponse.json();
    if (response.success) {
        progressContainer.style.display = "none";
        linkEmailSection.style.display = "none";
        formElem.reset();
        showAlert('Email sent!!');
    }
})

let timeOut;
const showAlert = (message) => {
    fileInput.value = '';
    alertMessage.innerText = message;
    alertMessage.style.transform = 'translate(-50%, 60px)';
    clearTimeout(timeOut);
    timeOut = setTimeout(() => {
        alertMessage.style.transform = 'translate(-50%, 105px)';
    }, 2000);
}