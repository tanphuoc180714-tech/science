// Dữ liệu ảnh mẫu (Mock Data)
const mockImages = [
    {
        id: 1,
        title: "Tinh thể Axit Amin",
        src: "assets/amino_acid.png",
        mag: "400x",
        date: "15/05/2026",
        desc: "Các tinh thể axit amin phân cực dưới ánh sáng giao thoa, tạo ra những mảng màu rực rỡ và cấu trúc hình học độc đáo."
    },
    {
        id: 2,
        title: "Tế bào biểu bì Hành tây",
        src: "assets/onion_cells.png",
        mag: "1000x",
        date: "20/05/2026",
        desc: "Cấu trúc vách tế bào rõ nét của lớp biểu bì củ hành tây được nhuộm màu để làm nổi bật nhân tế bào."
    },
    {
        id: 3,
        title: "Sợi Vải Tổng Hợp",
        src: "assets/fabric.png",
        mag: "200x",
        date: "01/06/2026",
        desc: "Sự đan xen phức tạp của các sợi vải tổng hợp qua lăng kính hiển vi nổi."
    },
    {
        id: 4,
        title: "Bào tử Nấm",
        src: "assets/spores.png",
        mag: "800x",
        date: "05/06/2026",
        desc: "Hình thái đa dạng của các bào tử nấm đang trong quá trình phát tán, nhuộm huỳnh quang."
    }
];

// Khởi tạo DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery');
    
    // Modal Xem Ảnh
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalMag = document.getElementById('modal-mag');
    const modalDate = document.getElementById('modal-date');
    const modalDesc = document.getElementById('modal-desc');
    const closeImageBtn = document.getElementById('close-modal');

    // Modal Upload
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeUploadBtn = document.getElementById('close-upload');

    // Hàm render Gallery
    function renderGallery() {
        galleryGrid.innerHTML = '';
        
        mockImages.forEach((img, index) => {
            const delay = index * 0.1; // Staggered animation
            
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.animationDelay = `${delay}s`;
            item.innerHTML = `
                <img src="${img.src}" alt="${img.title}" loading="lazy">
                <div class="item-overlay">
                    <h3 class="item-title">${img.title}</h3>
                    <span class="item-mag">${img.mag}</span>
                </div>
            `;
            
            item.addEventListener('click', () => openImageModal(img));
            galleryGrid.appendChild(item);
        });
    }

    // Xử lý Image Modal
    function openImageModal(data) {
        modalImg.src = data.src;
        modalTitle.textContent = data.title;
        modalMag.textContent = data.mag;
        modalDate.textContent = data.date;
        modalDesc.textContent = data.desc;
        
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Ngăn cuộn trang
    }

    function closeImageModal() {
        imageModal.classList.remove('active');
        document.body.style.overflow = '';
        // Đợi animation xong mới xóa src để mượt
        setTimeout(() => { modalImg.src = ''; }, 300);
    }

    // Xử lý Upload Modal
    uploadBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
    });

    function closeUploadModal() {
        uploadModal.classList.remove('active');
    }

    // Đóng Modal khi bấm nút X
    closeImageBtn.addEventListener('click', closeImageModal);
    closeUploadBtn.addEventListener('click', closeUploadModal);

    // Xử lý form upload
    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('upload-title').value;
        const mag = document.getElementById('upload-mag').value;
        const desc = document.getElementById('upload-desc').value;
        const fileInput = document.getElementById('upload-file');
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        
        if (fileInput.files && fileInput.files[0]) {
            // Đổi trạng thái nút
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Đang tải lên...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('title', title);
            formData.append('mag', mag);
            formData.append('desc', desc);
            formData.append('image', fileInput.files[0]);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.newImage) {
                        mockImages.unshift(result.newImage);
                        renderGallery();
                    }
                    uploadForm.reset();
                    closeUploadModal();
                    alert('Tải ảnh lên thành công!');
                } else {
                    let errMsg = 'Máy chủ trả về lỗi nhưng không rõ nguyên nhân.';
                    try {
                        const err = await response.json();
                        errMsg = err.error + (err.details ? ': ' + err.details : '');
                    } catch (e) {
                        errMsg = `Mã lỗi HTTP: ${response.status} (Có thể API chưa hoạt động hoặc sai URL).`;
                    }
                    alert('Lỗi máy chủ: ' + errMsg);
                }
            } catch (error) {
                console.error('Chi tiết lỗi:', error);
                alert('Lỗi kết nối mạng: ' + error.message + '\n(Lưu ý: Nếu bạn mở file index.html trực tiếp, hãy chạy qua localhost hoặc vercel dev)');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });

    // Đóng Modal khi bấm ra ngoài (backdrop)
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            closeImageModal();
            closeUploadModal();
        });
    });

    // Đóng Modal khi bấm phím ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            closeUploadModal();
        }
    });

    // Khởi chạy với mock data ban đầu
    renderGallery();
    
    // Fetch dữ liệu thật từ Google Sheets (nếu có cấu hình)
    fetchImages();

    async function fetchImages() {
        try {
            const response = await fetch('/api/images');
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    // Xóa mảng cũ và thêm dữ liệu thực tế vào
                    mockImages.length = 0;
                    data.forEach(img => mockImages.push(img));
                    renderGallery();
                }
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu ảnh từ Sheet:', error);
        }
    }
});
