document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================
       1. Custom Cursor Logic
    ======================================================== */
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    const interactables = document.querySelectorAll('.interactable, a, button');

    document.addEventListener('mousemove', (e) => {
        // Direct coordinates for the inner dot
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Slight delay for the follower text using transform
        follower.style.transform = `translate3d(${e.clientX - 15}px, ${e.clientY - 15}px, 0)`;
    });

    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
            follower.classList.add('hovering');
            playHoverSound(); // Fire subtle sound!
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
            follower.classList.remove('hovering');
        });
        el.addEventListener('click', () => {
            playTapSound();
        });
    });


    /* ========================================================
       2. Web Audio API Engine for Premium UI Sounds
    ======================================================== */
    // Using a user-interaction flag to unlock audio context reliably
    let audioCtx = null;
    let audioUnlocked = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        audioUnlocked = true;
    }

    // Unlock audio on first click anywhere
    document.body.addEventListener('click', () => {
        if(!audioUnlocked) initAudio();
    }, { once: true });

    function playHoverSound() {
        if (!audioUnlocked || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // High soft pitch
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    function playTapSound() {
        if (!audioUnlocked || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    }


    /* ========================================================
       3. Light / Dark Theme Toggle
    ======================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const themeIcon = themeToggleBtn.querySelector('i');

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            // Optional: You could adjust ThreeJS colors here if desired.
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });


    /* ========================================================
       4. GSAP ScrollTrigger Animations (Including Timeline Fill)
    ======================================================== */
    gsap.registerPlugin(ScrollTrigger);

    // Initial load animations
    gsap.from('.gsap-nav', { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
    gsap.from('.gsap-hero > *', { y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.3 });

    // Scroll reveals
    const revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Dynamic Timeline Fill!
    gsap.to('.timeline-fill', {
        scrollTrigger: {
            trigger: '.timeline',
            start: "top center",
            end: "bottom center",
            scrub: 1 // Link animation directly to scroll position for smooth fill
        },
        height: '100%',
        ease: "none"
    });

    // Floating Button
    gsap.from('.fab-cv', { scale: 0, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 1.5 });


    /* ========================================================
       5. Three.js 3D Interactive Background
    ======================================================== */
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    const cyanMaterial = new THREE.MeshPhongMaterial({ color: 0x00d2ff, emissive: 0x00d2ff, emissiveIntensity: 0.4, shininess: 100 });
    const purpleMaterial = new THREE.MeshPhongMaterial({ color: 0x8a2be2, emissive: 0x8a2be2, emissiveIntensity: 0.4, shininess: 100 });
    const connectionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });

    const numBases = 40;
    const helixRadius = 5;
    const ySpacing = 1.5;

    for(let i = 0; i < numBases; i++) {
        const offset = i * 0.4;
        const yPos = (i * ySpacing) - ((numBases * ySpacing) / 2);

        const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), cyanMaterial);
        sphere1.position.set(Math.cos(offset) * helixRadius, yPos, Math.sin(offset) * helixRadius);
        dnaGroup.add(sphere1);

        const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), purpleMaterial);
        sphere2.position.set(Math.cos(offset + Math.PI) * helixRadius, yPos, Math.sin(offset + Math.PI) * helixRadius);
        dnaGroup.add(sphere2);

        const path = new THREE.LineCurve3(sphere1.position, sphere2.position);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 1, 0.15, 8, false), connectionMaterial);
        dnaGroup.add(tube);
    }

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    let mouseX = 0; let mouseY = 0;
    let targetRotationX = 0; let targetRotationY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;
        
        const spotlight = document.querySelector('.cursor-spotlight');
        spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        dnaGroup.rotation.y += 0.005;
        dnaGroup.rotation.x += (targetRotationX - dnaGroup.rotation.x) * 0.05;
        dnaGroup.rotation.z += (targetRotationY - dnaGroup.rotation.z) * 0.05;
        renderer.render(scene, camera);
    }
    animate();

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
});
