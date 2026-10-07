let player;
let isPlaying = false;
let currentScene = 0;
const scenes = document.querySelectorAll('.scene');
const totalScenes = scenes.length;
let isTransitioning = false;
let isNextLocked = false;
let phase2Timeout;

function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params || {});
    }
}

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 2 + 1;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.animationDuration = (Math.random() * 15 + 15) + 's';
        p.style.animationDelay = (Math.random() * 15) + 's';
        container.appendChild(p);
    }
}

function onYouTubeIframeAPIReady() {}

function initPlayer() {
    if (player) return;
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'n0VNjUNjB-g',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': 'n0VNjUNjB-g',
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.setVolume(35);
    event.target.playVideo();
    isPlaying = true;
    document.getElementById('music-control').classList.remove('hidden');
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        document.getElementById('music-control').classList.remove('paused');
    } else {
        isPlaying = false;
        document.getElementById('music-control').classList.add('paused');
    }
}

function toggleMusic() {
    if (!player) return;
    if (isPlaying) {
        player.pauseVideo();
        trackEvent('toggle_music', { action: 'pause' });
    } else {
        player.playVideo();
        trackEvent('toggle_music', { action: 'play' });
    }
}

function updateProgress() {
    const progress = (currentScene / (totalScenes - 1)) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    
    const nav = document.getElementById('navigation');
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');

    if (currentScene === 0) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
        if (currentScene === 1) {
            prev.style.visibility = 'hidden';
        } else {
            prev.style.visibility = 'visible';
        }
        
        if (currentScene === totalScenes - 1 || isNextLocked) {
            next.style.visibility = 'hidden';
            next.style.opacity = 1;
        } else {
            next.style.visibility = 'visible';
            next.style.opacity = 1;
        }
    }
}

function goToScene(index) {
    if (index < 0 || index >= totalScenes || isTransitioning) return;
    
    isTransitioning = true;
    clearTimeout(phase2Timeout);
    
    trackEvent('view_scene', { scene_index: index });
    
    // Lock next button if entering scene 5 (Memory Fragments)
    isNextLocked = (index === 5);
    
    scenes.forEach(s => {
        if (s !== scenes[currentScene] && s !== scenes[index]) {
            s.classList.remove('active', 'fade-out');
        }
    });

    scenes[currentScene].classList.remove('active');
    scenes[currentScene].classList.add('fade-out');
    
    const currentScrollContainer = scenes[currentScene].querySelector('.scene-scroll-content');
    if (currentScrollContainer) currentScrollContainer.scrollTop = 0;
    
    setTimeout(() => {
        scenes[currentScene].classList.remove('fade-out');
        currentScene = index;
        scenes[currentScene].classList.add('active');
        
        if (currentScene === 5) {
            const fragments = scenes[5].querySelectorAll('.memory-card p');
            const cards = scenes[5].querySelectorAll('.memory-card');
            
            fragments.forEach(f => {
                f.innerText = f.getAttribute('data-phase1');
                f.classList.remove('phase-blur');
            });
            
            cards.forEach(c => {
                c.style.animation = 'none';
                c.offsetHeight; 
                c.style.animation = null; 
            });
            
            phase2Timeout = setTimeout(() => {
                fragments.forEach((f, i) => {
                    setTimeout(() => {
                        f.classList.add('phase-blur');
                        setTimeout(() => {
                            f.innerText = f.getAttribute('data-phase2');
                            f.classList.remove('phase-blur');
                        }, 1200);
                    }, i * 800);
                });
                
                setTimeout(() => {
                    isNextLocked = false;
                    updateProgress();
                    const nextBtn = document.getElementById('next-btn');
                    nextBtn.style.opacity = 0;
                    nextBtn.animate([{opacity: 0}, {opacity: 1}], {duration: 1500, fill: 'forwards'});
                }, fragments.length * 800 + 2000);
                
            }, 9000); // 9 sec absorb time
        }
        
        updateProgress();
        isTransitioning = false;
    }, 1200);
}

document.getElementById('begin-btn').addEventListener('click', () => {
    trackEvent('begin_experience');
    initPlayer();
    goToScene(1);
});

document.getElementById('music-control').addEventListener('click', toggleMusic);

document.getElementById('next-btn').addEventListener('click', () => {
    if (!isNextLocked) goToScene(currentScene + 1);
});

document.getElementById('prev-btn').addEventListener('click', () => {
    goToScene(currentScene - 1);
});

window.addEventListener('keydown', (e) => {
    if (currentScene === 0) return;
    if (e.key === 'ArrowRight' && !isNextLocked) {
        goToScene(currentScene + 1);
    } else if (e.key === 'ArrowLeft') {
        goToScene(currentScene - 1);
    }
});

window.onload = () => {
    createParticles();
    scenes.forEach((s, i) => {
        if (i === 0) s.classList.add('active');
        else s.classList.remove('active', 'fade-out');
    });
};
