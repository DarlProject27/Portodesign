/* =========================================
   1. SOUND LOGIC
   ========================================= */
const playlist = [
    'assets/audio/music/Fah.mp3', 
    'assets/audio/music/goodforyu.mp3',
    'assets/audio/music/lovminot.mp3',
    'assets/audio/music/ASU.mp3'
];

let audioPlayer = new Audio();
let isPlaying = false;
const soundBtn = document.getElementById('soundBtn');
const soundText = soundBtn.querySelector('span:last-child');

function toggleSound() {
    if (isPlaying) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0; 
        isPlaying = false;
        soundBtn.classList.remove('is-playing');
        soundText.textContent = "Sound Off";
    } else {
        const randomTrack = playlist[Math.floor(Math.random() * playlist.length)];
        audioPlayer.src = randomTrack;
        audioPlayer.loop = false;
        audioPlayer.play();
        isPlaying = true;
        soundBtn.classList.add('is-playing');
        soundText.textContent = "Playing...";
        
        audioPlayer.onended = function() {
            isPlaying = false;
            soundBtn.classList.remove('is-playing');
            soundText.textContent = "Sound Off";
        };
    }
}

/* =========================================
   2. CAROUSEL
   ========================================= */
function scrollCarousel(trackId, amount) {
    document.getElementById(trackId).scrollBy({ left: amount, behavior: 'smooth' });
}

/* =========================================
   3. MODAL POP-UP
   ========================================= */
let currentScale = 1;
let pX = 0, pY = 0;
let isDragging = false, startX = 0, startY = 0;

function openModal(src, type, title, desc) {
    const modal = document.getElementById('projectModal');
    const mediaContainer = document.getElementById('modalMediaContainer');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDesc').textContent = desc;
    
    resetZoom();

    if (type === 'image') {
        mediaContainer.innerHTML = `<img src="${src}" id="zoomedMedia" draggable="false">`;
    } else {
        mediaContainer.innerHTML = `<video src="${src}" id="zoomedMedia" controls autoplay loop draggable="false"></video>`;
    }

    const media = document.getElementById('zoomedMedia');
    media.addEventListener('mousedown', startPan);
    window.addEventListener('mousemove', panMedia);
    window.addEventListener('mouseup', endPan);
    // Touch events for Modal Zoom Pan
    media.addEventListener('touchstart', startPan);
    window.addEventListener('touchmove', panMedia, {passive: false});
    window.addEventListener('touchend', endPan);

    mediaContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        (e.deltaY < 0) ? zoomIn() : zoomOut();
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('projectModal').classList.remove('active');
    document.body.style.overflow = '';
    const v = document.querySelector('.modal-content video');
    if(v) v.pause();
}

function updateTransform() {
    const m = document.getElementById('zoomedMedia');
    if(m) m.style.transform = `scale(${currentScale}) translate(${pX}px, ${pY}px)`;
}

function zoomIn() { currentScale += 0.2; updateTransform(); }
function zoomOut() { 
    if (currentScale > 1) { 
        currentScale -= 0.2; 
        if (currentScale < 1) currentScale = 1; 
        if (currentScale === 1) { pX = 0; pY = 0; }
        updateTransform(); 
    } 
}
function resetZoom() { currentScale = 1; pX = 0; pY = 0; updateTransform(); }

function startPan(e) {
    if (currentScale > 1) {
        isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX - pX;
        startY = clientY - pY;
        document.getElementById('modalMediaContainer').style.cursor = "grabbing";
    }
}

function panMedia(e) {
    if (isDragging) {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        pX = clientX - startX;
        pY = clientY - startY;
        updateTransform();
    }
}

function endPan() {
    isDragging = false;
    const c = document.getElementById('modalMediaContainer');
    if(c) c.style.cursor = "grab";
}

/* =========================================
   4. THEME & DRAGGABLE BUBBLES
   ========================================= */
const themeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.body.classList.toggle('is-dark', entry.target.getAttribute('data-theme') === 'dark');
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('[data-theme]').forEach(section => themeObserver.observe(section));

// BUBBLE DRAG LOGIC (MOUSE & TOUCH)
const bubbles = document.querySelectorAll('.float-bubble');
bubbles.forEach(bubble => {
    let dragging = false, startX, startY, initialLeft, initialTop;

    const start = (e) => { 
        // Allow touch to start drag
        dragging = true; 
        bubble.classList.add('is-dragging'); 
        bubble.style.animation = 'none'; 
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX; 
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; 
        
        startX = clientX; 
        startY = clientY; 
        
        // Use offsetLeft/Top for relative positioning
        initialLeft = bubble.offsetLeft; 
        initialTop = bubble.offsetTop; 
    };

    const move = (e) => { 
        if(!dragging) return; 
        
        // Only prevent default if we are dragging the bubble
        if(e.cancelable) e.preventDefault(); 
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX; 
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; 
        
        const dx = clientX - startX;
        const dy = clientY - startY;

        bubble.style.left = `${initialLeft + dx}px`; 
        bubble.style.top = `${initialTop + dy}px`; 
        
        // Unset bottom/right to allow free movement
        bubble.style.bottom = 'auto';
        bubble.style.right = 'auto';
    };

    const end = () => { 
        if(dragging) { 
            dragging = false; 
            bubble.classList.remove('is-dragging'); 
        } 
    };

    // Mouse Events
    bubble.addEventListener('mousedown', start); 
    window.addEventListener('mousemove', move); 
    window.addEventListener('mouseup', end);
    
    // Touch Events (Passive: false required to prevent scroll)
    bubble.addEventListener('touchstart', start, {passive: false}); 
    window.addEventListener('touchmove', move, {passive: false}); 
    window.addEventListener('touchend', end);
});

const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach((reveal) => {
        if (reveal.getBoundingClientRect().top < windowHeight - 100) {
            reveal.classList.add('active');
        }
    });
};
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();