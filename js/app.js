document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons
    lucide.createIcons();

    // DOM Elements
    const modal = document.getElementById('upload-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const uploadForm = document.getElementById('upload-form');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const galleryGrid = document.getElementById('gallery-grid');

    // Default mock data (using the images we generated)
    const defaultData = [
        {
            id: 1,
            image: 'img/plant_cell_400x_1780392484199.png', // Fallback to a placeholder if this doesn't exist locally when running
            title: 'Tế bào biểu bì hành tây',
            magnification: '400x',
            staining: 'Xanh Methylen',
            notes: 'Quan sát rõ nhân tế bào và vách tế bào cellulose xếp sát nhau.'
        },
        {
            id: 2,
            image: 'img/tardigrade_100x_1780392497390.png',
            title: 'Bọ gấu nước (Tardigrade)',
            magnification: '100x',
            staining: 'Nền đen (Darkfield)',
            notes: 'Quan sát thấy bọ gấu nước đang di chuyển trong mẫu nước rêu.'
        },
        {
            id: 3,
            image: 'img/blood_cells_1000x_1780392512788.png',
            title: 'Hồng cầu',
            magnification: '1000x',
            staining: 'Giemsa',
            notes: 'Tế bào hồng cầu hình đĩa lõm hai mặt, không có nhân. Quan sát dưới vật kính dầu.'
        }
    ];

    // Load data from LocalStorage or use default
    let observations = JSON.parse(localStorage.getItem('microscopeData'));
    if (!observations || observations.length === 0) {
        observations = defaultData;
        localStorage.setItem('microscopeData', JSON.stringify(observations));
    }

    // --- Modal Logic ---
    const openModal = () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        uploadForm.reset();
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');
    };

    btnOpenModal.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Image Preview Logic ---
    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
                uploadPlaceholder.classList.add('hidden');
            }
            reader.readAsDataURL(file);
        }
    });

    // --- Render Grid ---
    const renderGrid = () => {
        galleryGrid.innerHTML = '';
        
        // Reverse to show newest first
        const displayData = [...observations].reverse();
        
        displayData.forEach((obs, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.1}s`; // Staggered animation
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${obs.image}" alt="${obs.title}" class="card-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                    <div class="card-mag-badge">${obs.magnification}</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${obs.title}</h3>
                    <div class="card-meta">
                        ${obs.staining ? `<div class="meta-item"><i data-lucide="droplet"></i> ${obs.staining}</div>` : ''}
                    </div>
                    ${obs.notes ? `<p class="card-notes">${obs.notes}</p>` : ''}
                </div>
            `;
            galleryGrid.appendChild(card);
        });
        
        // Re-initialize icons for newly added elements
        lucide.createIcons();
    };

    // --- Handle Form Submit ---
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const file = imageUpload.files[0];
        if (!file && imagePreview.src === '') {
            alert('Vui lòng chọn hình ảnh mẫu vật.');
            return;
        }

        const newObservation = {
            id: Date.now(),
            image: imagePreview.src, // Using DataURL for local demo
            title: document.getElementById('specimen-name').value,
            magnification: document.getElementById('magnification').value,
            staining: document.getElementById('staining').value,
            notes: document.getElementById('notes').value
        };

        observations.push(newObservation);
        localStorage.setItem('microscopeData', JSON.stringify(observations));
        
        renderGrid();
        closeModal();
    });

    // Initial render
    renderGrid();
});
