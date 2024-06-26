document.addEventListener('DOMContentLoaded', () => {
    const textArea = document.getElementById('textArea');
    const list = document.getElementById('list');
    const helpBtn = document.getElementById('helpBtn');
    const autoCopySwitch = document.getElementById('autoCopySwitch');
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') {
            list.innerHTML = '';
            loadData();
        } else {
            const searchText = searchInput.value.trim().toLowerCase();
            filterList(searchText);
        }
    });

    function filterList(searchText) {
        list.innerHTML='';
        let contador = 0 ;
        const storedData = JSON.parse(localStorage.getItem('listData')) || [];
        storedData.forEach((text) => {
            if (text.toLowerCase().includes(searchText.toLowerCase())){
                const li = createListItem(text);
                list.appendChild(li);
                contador = contador + 1;
            }
        });
        if (contador === 0) {
            const li = document.createElement('li');
            li.textContent = "No se encontraron resultados.";
            li.classList.add('text-center', 'list-group-item');
            list.appendChild(li);
        }
    }

    clearBtn.addEventListener('click', () => {
        textArea.value = '';
    });

    window.addEventListener('load', () => {
        const hasSeenModal = localStorage.getItem('hasSeenModal');
        const autoCopySwitchState = localStorage.getItem('autoCopySwitch') === 'true';

        autoCopySwitch.checked = autoCopySwitchState;

        if (hasSeenModal !== 'true') {
            const howToUseModal = new bootstrap.Modal(document.getElementById('howToUseModal'));
            howToUseModal.show();

            const howToUseModalElement = document.getElementById('howToUseModal');
            howToUseModalElement.addEventListener('hidden.bs.modal', () => {
                localStorage.setItem('hasSeenModal', 'true');
            });
        }
    });

    textArea.addEventListener('contextmenu', async (e) => {
        e.preventDefault(); // Evitar que se muestre el menú contextual predeterminado

        try {
            const clipboardContent = await navigator.clipboard.readText();
            const startPosition = textArea.selectionStart;
            const endPosition = textArea.selectionEnd;

            textArea.value = textArea.value.substring(0, startPosition) + clipboardContent + textArea.value.substring(endPosition);

            // Establecer la nueva posición del cursor después de pegar el contenido
            textArea.selectionStart = startPosition + clipboardContent.length;
            textArea.selectionEnd = startPosition + clipboardContent.length;
        } catch (error) {
            console.error('Error al acceder al portapapeles:', error);
        }
    });

    function showToast() {
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
    }

    function loadData() {
        const storedData = JSON.parse(localStorage.getItem('listData')) || [];
        storedData.forEach((text) => {
            const li = createListItem(text);
            list.appendChild(li);
        });
    }

    function saveData() {
        const listItems = Array.from(list.children).map((li) => li.textContent.trim().replace(/delete/i, ''));
        localStorage.setItem('listData', JSON.stringify(listItems));
    }

    function createListItem(text) {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

        const span = document.createElement('span');
        span.textContent = text;
        li.appendChild(span);

        // Agregar evento de clic para copiar el texto del elemento
        li.addEventListener('click', (e) => {
            if (e.target !== deleteBtn) { // Verificar si el clic fue en el botón "delete"
                navigator.clipboard.writeText(text);
                showToast();
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-danger', 'ms-2');
        deleteBtn.innerHTML = '<i class="material-icons">delete</i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Detener la propagación del evento de clic
            li.remove();
            saveData(); // Guardar los datos en el localStorage
        });

        li.appendChild(deleteBtn);
        return li;
    }


    function addItemToList() {
        const text = textArea.value;
        if (text.trim()) {
            const li = createListItem(text);
            list.appendChild(li);
            textArea.value = '';
            saveData(); // Guardar los datos en el localStorage

            if (autoCopySwitch.checked) {
                navigator.clipboard.writeText(text);
                showToast();
            }
        }
    }

    autoCopySwitch.addEventListener('change', () => {
        localStorage.setItem('autoCopySwitch', autoCopySwitch.checked);
    });

    textArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addItemToList();
        }
    });

    helpBtn.addEventListener('click', () => {
        const howToUseModal = new bootstrap.Modal(document.getElementById('howToUseModal'));
        howToUseModal.show();
    });

    // Event listeners para la funcionalidad de búsqueda
    searchBtn.addEventListener('click', () => {
        const searchText = searchInput.value.trim().toLowerCase();
        filterList(searchText);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const searchText = searchInput.value.trim().toLowerCase();
            filterList(searchText);
        }
    });

    loadData(); // Cargar los datos almacenados en el localStorage
});
