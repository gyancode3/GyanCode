let auth, db, collection, getDocs, addDoc, setDoc, doc, serverTimestamp, onAuthStateChanged;

async function bootstrapFirebase() {
    try {
        const firestore = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        collection = firestore.collection;
        getDocs = firestore.getDocs;
        addDoc = firestore.addDoc;
        setDoc = firestore.setDoc;
        doc = firestore.doc;
        serverTimestamp = firestore.serverTimestamp;

        const fireauth = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js");
        onAuthStateChanged = fireauth.onAuthStateChanged;

        const config = await import('./firebase-config.js');
        auth = config.auth;
        db = config.db;
    } catch (e) {
        console.warn("Local execution: Firebase modules blocked by CORS. Using mock local data.", e);
    }
}

// app.js - MentorGuru Landing Page Core Logic

// 1. Course Seeding
const defaultCourses = [
    { 
        id: "cyber-001",
        name: 'Cybersecurity Essentials', 
        category: 'IT', 
        mode: 'Physical', 
        duration: '12 Weeks', 
        slots: '10 AM - 11 AM', 
        fee: 'NPR 15,000', 
        desc: 'Learn the fundamentals of cybersecurity, network defense, threat analysis, and ethical hacking. Hands-on laboratory training.',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        modules: [
            "Module 1: Introduction to Network Security",
            "Module 2: Cryptography Basics",
            "Module 3: Penetration Testing",
            "Module 4: Incident Response"
        ]
    },
    { 
        id: "uiux-002",
        name: 'UI/UX Design', 
        category: 'IT', 
        mode: 'Physical', 
        duration: '8 Weeks', 
        slots: '2 PM - 4 PM', 
        fee: 'NPR 12,000', 
        desc: 'Master user research, wireframing, high-fidelity UI design, prototyping, and user testing using Figma.',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80',
        modules: [
            "Module 1: User Research & Personas",
            "Module 2: Information Architecture & Wireframing",
            "Module 3: Visual Design Principles",
            "Module 4: Prototyping & Testing in Figma"
        ]
    },
    { 
        id: "python-003",
        name: 'Python Mastery', 
        category: 'IT', 
        mode: 'Online', 
        duration: '10 Weeks', 
        slots: '6 PM - 8 PM', 
        fee: 'NPR 10,000', 
        desc: 'Comprehensive Python coding training covering object-oriented programming, data structures, and automation scripts.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        modules: [
            "Module 1: Python Basics & Syntax",
            "Module 2: Object-Oriented Programming",
            "Module 3: Data Structures & Algorithms",
            "Module 4: Automation & Scripting Projects"
        ]
    },
    { 
        id: "dm-004",
        name: 'Digital Marketing Excellence', 
        category: 'Non-IT', 
        mode: 'Online', 
        duration: '6 Weeks', 
        slots: '8 AM - 10 AM', 
        fee: 'NPR 8,000', 
        desc: 'Master search engine optimization (SEO), copy writing, social media campaigns, and Google Analytics.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        modules: [
            "Module 1: SEO Fundamentals",
            "Module 2: Social Media Marketing",
            "Module 3: Copywriting & Content Strategy",
            "Module 4: Web Analytics & Reporting"
        ]
    }
];

let coursesCache = [];

async function initCourses() {
    try {
        // 1. Load from localStorage first (where Admin panel saves courses)
        const localCourses = JSON.parse(localStorage.getItem('mentorGuru_courses') || '[]');
        if (localCourses.length > 0) {
            coursesCache = localCourses;
            renderPublicCourses();
            return;
        }

        // 2. Fallback to Firebase
        if (!db || !collection || !getDocs) throw new Error("Firebase DB not initialized");
        const querySnapshot = await getDocs(collection(db, "courses"));
        if (querySnapshot.empty) {
            // Seed defaults
            console.log("Seeding default courses to Firestore...");
            for (const course of defaultCourses) {
                await setDoc(doc(db, "courses", course.id), course);
                coursesCache.push(course);
            }
            localStorage.setItem('mentorGuru_courses', JSON.stringify(coursesCache));
        } else {
            querySnapshot.forEach((doc) => {
                coursesCache.push({ id: doc.id, ...doc.data() });
            });
            localStorage.setItem('mentorGuru_courses', JSON.stringify(coursesCache));
        }
        renderPublicCourses();
    } catch (error) {
        console.error("Error fetching courses:", error);
        // Fallback to defaults if firestore fails
        coursesCache = defaultCourses;
        localStorage.setItem('mentorGuru_courses', JSON.stringify(coursesCache));
        renderPublicCourses();
    }
}

// 2. Active Session Gatekeeper Check & Navbar State Update
function checkNavSession() {
    if (!onAuthStateChanged || !auth) {
        // Fallback for mock environment
        const portalBtn = document.getElementById('portalActionButton');
        const mobilePortalBtn = document.getElementById('mobilePortalActionButton');
        let redirectUrl = 'login.html';
        let buttonText = 'Access Portal';

        const studentSession = sessionStorage.getItem('mentorGuruStudent');
        const mentorSession = sessionStorage.getItem('mentorGuruMentor');
        
        if (studentSession) {
            redirectUrl = 'student.html';
            buttonText = 'Go to Dashboard';
        } else if (mentorSession) {
            redirectUrl = 'mentor.html';
            buttonText = 'Go to Dashboard';
        }

        if (localStorage.getItem('mentorGuruAdmin') === 'true') {
            redirectUrl = 'admin.html';
            buttonText = 'Go to Dashboard';
        }
        
        if (portalBtn) {
            portalBtn.href = redirectUrl;
            portalBtn.textContent = buttonText;
        }
        if (mobilePortalBtn) {
            mobilePortalBtn.href = redirectUrl;
            mobilePortalBtn.textContent = buttonText;
        }
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        const portalBtn = document.getElementById('portalActionButton');
        const mobilePortalBtn = document.getElementById('mobilePortalActionButton');
        
        let redirectUrl = 'login.html';
        let buttonText = 'Access Portal';

        if (user) {
            const studentSession = sessionStorage.getItem('mentorGuruStudent');
            const mentorSession = sessionStorage.getItem('mentorGuruMentor');
            
            if (studentSession) {
                redirectUrl = 'student.html';
                buttonText = 'Go to Dashboard';
            } else if (mentorSession) {
                redirectUrl = 'mentor.html';
                buttonText = 'Go to Dashboard';
            }
        }

        // Admin fallback
        if (localStorage.getItem('mentorGuruAdmin') === 'true') {
            redirectUrl = 'admin.html';
            buttonText = 'Go to Dashboard';
        }
        
        if (portalBtn) {
            portalBtn.href = redirectUrl;
            portalBtn.textContent = buttonText;
        }
        if (mobilePortalBtn) {
            mobilePortalBtn.href = redirectUrl;
            mobilePortalBtn.textContent = buttonText;
        }
    });
}

// 3. Course Card Catalog Rendering & Filtering
let activeFilter = 'all';
function renderPublicCourses() {
    const grid = document.getElementById('publicCourseGrid');
    if (!grid) return;
    
    const courses = coursesCache;
    const filtered = courses.filter(c => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'Online') return (c.mode || '').toLowerCase() === 'online';
        if (activeFilter === 'Physical') return (c.mode || '').toLowerCase() === 'physical';
        return true;
    });
    
    grid.innerHTML = '';
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">No courses available in this category.</div>`;
        return;
    }
    
    filtered.forEach(course => {
        const thumbnailHtml = course.thumbnail 
            ? `<div class="w-full h-40 rounded-xl overflow-hidden mb-3 border border-slate-200 shadow-sm"><img src="${course.thumbnail}" class="w-full h-full object-cover"></div>`
            : `<div class="w-full h-40 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm"><i class="fa-regular fa-image text-3xl"></i></div>`;

        const isOnline = (course.mode || '').toLowerCase() === 'online';
        const modeBadge = isOnline
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider bg-cyan-50 text-cyan-600 border border-cyan-100"><i class="fa-solid fa-wifi"></i> Online</span>`
            : `<span class="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100"><i class="fa-solid fa-building"></i> Physical</span>`;

        grid.innerHTML += `
            <div class="glass-card rounded-2xl p-6 flex flex-col justify-between h-full space-y-4">
                <div class="space-y-3 flex-grow">
                    ${thumbnailHtml}
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                        <span class="px-2.5 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider ${course.category === 'IT' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}">${course.category} Track</span>
                        ${modeBadge}
                        <span class="ml-auto text-xs font-bold text-slate-500"><i class="fa-solid fa-clock mr-1 text-slate-400"></i>${course.duration}</span>
                    </div>
                    <h4 class="text-lg font-bold text-slate-900 leading-tight">${course.name}</h4>
                    <p class="text-slate-600 text-xs line-clamp-2">${course.desc || 'Live interactive industrial training cohort.'}</p>
                    
                    <div class="space-y-2 pt-2 text-xs text-slate-700">
                        <div class="flex items-center gap-2"><i class="fa-solid fa-calendar text-red-500 w-4"></i>Shift: ${course.slots}</div>
                        <div class="flex items-center gap-2"><i class="fa-solid fa-wallet text-red-500 w-4"></i>Fee: ${course.fee}</div>
                    </div>
                </div>
                
                <div class="flex gap-2 pt-2">
                    <button onclick="openLearnMoreModal('${course.name}')" class="w-1/2 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition border border-slate-200">Details</button>
                    <button onclick="enrollCourseSecurityCheck('${course.name}')" class="w-1/2 btn-red py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"><i class="fa-solid fa-paper-plane text-[9px]"></i> Enroll Now</button>
                </div>
            </div>
        `;
    });

}

function switchCategory(cat) {
    activeFilter = cat;
    ['all', 'Online', 'Physical'].forEach(c => {
        const btn = document.getElementById(`tab-${c}`);
        if (btn) {
            if (c === cat) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
              	btn.classList.remove('bg-red-600', 'text-white');
            }
        }
    });
    renderPublicCourses();
}

// 4. Details Modal Controls
function openLearnMoreModal(courseName) {
    const course = coursesCache.find(c => c.name === courseName);
    if (!course) return;
    
    document.getElementById('infoCourseTitle').textContent = course.name;
    document.getElementById('infoCourseDesc').textContent = course.desc || 'No description available.';
    document.getElementById('infoCourseSlots').textContent = course.slots;
    document.getElementById('infoCoursePrice').textContent = course.fee;
    document.getElementById('infoCourseDuration').textContent = course.duration;
    document.getElementById('infoCourseMode').textContent = course.mode;

    // Render modules in Learn More Modal
    const moduleContainer = document.getElementById('infoCourseModules');
    if (moduleContainer) {
        moduleContainer.innerHTML = '';
        const modules = course.modules || [];
        if (modules.length === 0) {
            moduleContainer.innerHTML = '<p class="text-xs text-gray-400 italic">No syllabus modules defined.</p>';
        } else {
            modules.forEach(mod => {
                const item = document.createElement('div');
                item.className = 'flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600';
                item.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span> <span class="truncate">${mod}</span>`;
                moduleContainer.appendChild(item);
            });
        }
    }
    
    const overlay = document.getElementById('learnMoreModalOverlay');
    const box = document.getElementById('learnMoreModalBox');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    box.classList.remove('scale-[0.95]');
    box.classList.add('scale-100');
}

function closeLearnMoreModal() {
    const overlay = document.getElementById('learnMoreModalOverlay');
    const box = document.getElementById('learnMoreModalBox');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    box.classList.add('scale-[0.95]');
    box.classList.remove('scale-100');
}

// 5. Enrollment Modals & Security Verification
let currentEnrollingCourse = '';

function enrollCourseSecurityCheck(courseName) {
    currentEnrollingCourse = courseName;
    document.getElementById('enrollCourseTitle').value = courseName;
    
    const overlay = document.getElementById('enrollModalOverlay');
    const box = document.getElementById('enrollModalBox');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    box.classList.remove('scale-[0.95]');
    box.classList.add('scale-100');
}

function closeEnrollModal() {
    const overlay = document.getElementById('enrollModalOverlay');
    const box = document.getElementById('enrollModalBox');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    box.classList.add('scale-[0.95]');
    box.classList.remove('scale-100');
}

// 6. Fee Payment & Mock eSewa Gateway
document.getElementById('enrollForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const payFee = document.getElementById('payFee').checked;
    
    if (!name || !email || !phone) {
        alert('Please fill out all fields.');
        return;
    }
    
    if (phone.length < 7) {
        alert('Please enter a valid phone number (at least 7 digits).');
        return;
    }
    
    if (payFee) {
        closeEnrollModal();
        openEsewaModal();
    } else {
        saveEnrollment(name, email, phone, currentEnrollingCourse, 'Pending', 'Unpaid', '');
    }
});

function openEsewaModal() {
    const overlay = document.getElementById('esewaModalOverlay');
    const box = document.getElementById('esewaModalBox');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    box.classList.remove('scale-[0.95]');
    box.classList.add('scale-100');
}

function closeEsewaModal() {
    const overlay = document.getElementById('esewaModalOverlay');
    const box = document.getElementById('esewaModalBox');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    box.classList.add('scale-[0.95]');
    box.classList.remove('scale-100');
}

function copyEsewaId() {
    navigator.clipboard.writeText('9843641509');
    alert('eSewa ID 9843641509 copied to clipboard!');
}

function confirmManualPayment(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const txnRef = document.getElementById('esewaTxnInput').value.trim();
    
    saveEnrollment(name, email, phone, currentEnrollingCourse, 'Approved', 'Paid', txnRef);
    closeEsewaModal();
}

async function saveEnrollment(name, email, phone, courseName, status, paymentStatus, txnRef) {
    const LS_ENROLLMENTS = 'mentorGuru_enrollments';
    const newApp = {
        id: 'enroll-' + Date.now(),
        name,
        email,
        phone,
        course: courseName,
        status,
        paymentStatus,
        txnRef,
        accountCreated: false,
        timestamp: new Date().toISOString()
    };

    // Always save to localStorage — admin reads from here
    try {
        const existing = JSON.parse(localStorage.getItem(LS_ENROLLMENTS) || '[]');
        existing.push(newApp);
        localStorage.setItem(LS_ENROLLMENTS, JSON.stringify(existing));
    } catch (lsErr) {
        console.warn('localStorage save failed:', lsErr);
    }

    // Also attempt Firebase save (best-effort)
    try {
        const fbApp = { name, email, phone, course: courseName, status, paymentStatus, txnRef, timestamp: serverTimestamp() };
        await addDoc(collection(db, 'enrollments'), fbApp);
    } catch (fbErr) {
        console.warn('Firebase save failed (running offline/local mode):', fbErr);
    }

    alert(
        `✅ Enrollment Submitted Successfully!\n\n` +
        `Your application for "${courseName}" has been received.\n\n` +
        `📋 Next Steps:\n` +
        `• The Admin will review your enrollment details.\n` +
        `• A unique Student Portal ID & Password will be generated for you.\n` +
        `• Your login credentials will be sent to you via WhatsApp shortly.\n\n` +
        `Thank you for choosing MentorGuru! 🎓`
    );
    closeEnrollModal();
}

// 7. Embedded support Chatbot
function toggleChatbot() {
    const chat = document.getElementById('chatContainer');
    const icon = document.getElementById('chatTriggerIcon');
    
    if (chat.classList.contains('show')) {
        chat.classList.remove('show');
        icon.className = 'fa-solid fa-message text-lg';
    } else {
        chat.classList.add('show');
        icon.className = 'fa-solid fa-chevron-down text-lg';
        updateChatStatusIndicator();
    }
}

function toggleChatSettings() {
    const panel = document.getElementById('chatSettingsPanel');
    panel.classList.toggle('hidden');
}

function saveGeminiApiKey() {
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    if (key) {
        localStorage.setItem('mentorGuruGeminiKey', key);
        alert('Gemini API key saved successfully!');
        toggleChatSettings();
    } else {
        localStorage.removeItem('mentorGuruGeminiKey');
        alert('Gemini API key cleared. Simulator fallback active.');
    }
    updateChatStatusIndicator();
}

function updateChatStatusIndicator() {
    const key = localStorage.getItem('mentorGuruGeminiKey');
    const statusText = document.getElementById('chatStatusText');
    const keyInput = document.getElementById('geminiApiKeyInput');
    
    if (key) {
        statusText.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Gemini API Active';
        if (keyInput) keyInput.value = key;
    } else {
        statusText.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Offline Simulation';
        if (keyInput) keyInput.value = '';
    }
}

function appendChatMessage(sender, text) {
    const stream = document.getElementById('chatMessages');
    const msgBox = document.createElement('div');
    msgBox.className = sender === 'user' 
        ? 'flex items-start justify-end gap-2.5 max-w-[85%] ml-auto'
        : 'flex items-start gap-2.5 max-w-[85%]';
        
    const avatar = sender === 'user' 
        ? '<div class="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">U</div>'
        : '<div class="w-6 h-6 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-[10px] flex-shrink-0"><i class="fa-solid fa-robot"></i></div>';
        
    const bubble = document.createElement('div');
    bubble.className = sender === 'user'
        ? 'p-3 rounded-2xl rounded-tr-none bg-red-600 text-white leading-relaxed space-y-1.5'
        : 'p-3 rounded-2xl rounded-tl-none bg-white border border-gray-150 shadow-sm leading-relaxed space-y-1.5';
        
    // Standard markdown link parser helper for simple link renders
    bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    if (sender === 'user') {
        msgBox.appendChild(bubble);
        msgBox.appendChild(avatar);
    } else {
        msgBox.appendChild(avatar);
        msgBox.appendChild(bubble);
    }
    
    stream.appendChild(msgBox);
    stream.scrollTop = stream.scrollHeight;
}

function sendQuickQuery(query) {
    appendChatMessage('user', query);
    processChatbotResponse(query);
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const query = input.value.trim();
    if (!query) return;
    
    appendChatMessage('user', query);
    input.value = '';
    processChatbotResponse(query);
});

async function processChatbotResponse(userMessage) {
    const apiKey = localStorage.getItem('mentorGuruGeminiKey');
    
    if (apiKey) {
        // Show typing indicator
        const stream = document.getElementById('chatMessages');
        const typingEl = document.createElement('div');
        typingEl.id = 'chatTypingIndicator';
        typingEl.className = 'flex items-start gap-2.5 max-w-[85%]';
        typingEl.innerHTML = `
            <div class="w-6 h-6 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-[10px] flex-shrink-0"><i class="fa-solid fa-robot"></i></div>
            <div class="p-3 rounded-2xl rounded-tl-none bg-white border border-gray-150 shadow-sm text-gray-400 italic">Thinking...</div>
        `;
        stream.appendChild(typingEl);
        stream.scrollTop = stream.scrollHeight;
        
        try {
            const courses = JSON.stringify(coursesCache);
            const sysInstructions = `You are the MentorGuru Assistant, a premium educational guide. Answer details regarding the courses, timing, fee structures, and location. Natively reply in English or Nepali. The available courses in our database are: ${courses}. Office Location: New Baneshwor, Kathmandu, Nepal. Timings are morning and evening shifts. Enrollment fee is NPR 500.`;
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: sysInstructions + "\n\nUser Question: " + userMessage }] }]
                })
            });
            
            const data = await response.json();
            const replyText = data.candidates[0].content.parts[0].text;
            
            // Remove typing
            const typingIndicator = document.getElementById('chatTypingIndicator');
            if (typingIndicator) typingIndicator.remove();
            
            appendChatMessage('bot', replyText);
        } catch (err) {
            // Remove typing
            const typingIndicator = document.getElementById('chatTypingIndicator');
            if (typingIndicator) typingIndicator.remove();
            
            appendChatMessage('bot', 'Sorry, I encountered an issue connecting to the Gemini API. Falling back to offline simulator... 🔌');
            simulatedResponse(userMessage);
        }
    } else {
        simulatedResponse(userMessage);
    }
}

function simulatedResponse(msg) {
    const text = msg.toLowerCase();
    let reply = "";
    
    if (text.includes('course') || text.includes('track') || text.includes('program') || text.includes('विषय') || text.includes('कोर्ष')) {
        reply = "We offer the following premium live cohort tracks:<br>" +
                "1. **Cybersecurity Essentials** (IT Physical - NPR 15,000)<br>" +
                "2. **UI/UX Design** (IT Physical - NPR 12,000)<br>" +
                "3. **Python Mastery** (IT Online - NPR 10,000)<br>" +
                "4. **Digital Marketing Excellence** (Non-IT Online - NPR 8,000)";
    } else if (text.includes('fee') || text.includes('price') || text.includes('cost') || text.includes('पैसा') || text.includes('शुल्क')) {
        reply = "Our course tuition fees are highly optimized:<br>" +
                "- Cybersecurity Essentials: **NPR 15,000**<br>" +
                "- UI/UX Design: **NPR 12,000**<br>" +
                "- Python Mastery: **NPR 10,000**<br>" +
                "- Digital Marketing: **NPR 8,000**<br>" +
                "The enrollment booking fee is **NPR 500** payable via eSewa ID 9843641509.";
    } else if (text.includes('time') || text.includes('timing') || text.includes('schedule') || text.includes('shift') || text.includes('समय')) {
        reply = "We offer flexible class timings for both working professionals and students:<br>" +
                "- Morning Shift: **10 AM - 11 AM** or **8 AM - 10 AM**<br>" +
                "- Evening Shift: **2 PM - 4 PM**, **4 PM - 5 PM** or **6 PM - 8 PM**";
    } else if (text.includes('location') || text.includes('located') || text.includes('center') || text.includes('where') || text.includes('ठाउँ') || text.includes('कहाँ')) {
        reply = "Our corporate training headquarters is located at:<br>**New Baneshwor, Kathmandu, Nepal** (near the Baneshwor Plaza).";
    } else if (text.includes('hello') || text.includes('hi') || text.includes('नमस्ते') || text.includes('namaste')) {
        reply = "नमस्ते / Hello! I can help you with course catalogs, timing shifts, pricing, and locations. What track would you like to explore?";
    } else {
        reply = "I am currently in Offline Simulation mode. I can help with information about courses, timings, fees, and location. Enter a Gemini API Key in the settings (top gear icon) to activate live AI generation!";
    }
    
    setTimeout(() => {
        appendChatMessage('bot', reply);
    }, 450);
}

// Initial Bootstrapping
function initializeApp() {
    checkNavSession();
    renderPublicCourses();
    updateChatStatusIndicator();

    // Add real-time phone validation
    const phoneInput = document.getElementById('studentPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const val = this.value.trim();
            const validationIcon = document.getElementById('phoneValidationStatusIcon');
            const phoneIcon = document.getElementById('phoneIcon');
            const errorMsg = document.getElementById('phoneErrorMsg');
            
            if (val.length === 0) {
                this.classList.remove('enroll-input-valid', 'enroll-input-invalid');
                if (validationIcon) validationIcon.innerHTML = '';
                if (phoneIcon) phoneIcon.className = 'fa-solid fa-phone text-sm text-red-400';
                if (errorMsg) {
                    errorMsg.classList.add('opacity-0', 'h-0');
                    errorMsg.classList.remove('opacity-100', 'h-auto');
                }
            } else if (val.length >= 7) {
                this.classList.add('enroll-input-valid');
                this.classList.remove('enroll-input-invalid');
                if (validationIcon) validationIcon.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500 text-sm"></i>';
                if (phoneIcon) phoneIcon.className = 'fa-solid fa-phone text-sm text-emerald-500';
                if (errorMsg) {
                    errorMsg.classList.add('opacity-0', 'h-0');
                    errorMsg.classList.remove('opacity-100', 'h-auto');
                }
            } else {
                this.classList.add('enroll-input-invalid');
                this.classList.remove('enroll-input-valid');
                if (validationIcon) validationIcon.innerHTML = '<i class="fa-solid fa-circle-xmark text-red-500 text-sm"></i>';
                if (phoneIcon) {
                    phoneIcon.className = 'fa-solid fa-phone text-sm text-red-500';
                    phoneIcon.classList.add('animate-phone-wiggle');
                    setTimeout(() => phoneIcon.classList.remove('animate-phone-wiggle'), 600);
                }
                if (errorMsg) {
                    errorMsg.classList.remove('opacity-0', 'h-0');
                    errorMsg.classList.add('opacity-100', 'h-auto');
                }
            }
        });
    }
}

// 8. Shared Cross-Portal Logic (Chat & Course Requests)
function generateId(prefix = 'id') {
    return prefix + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Global Storage Listener for Real-Time UI Updates across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'mentorGuru_messages') {
        window.dispatchEvent(new CustomEvent('mg_messages_updated'));
    }
    if (e.key === 'mentorGuru_courseRequests') {
        window.dispatchEvent(new CustomEvent('mg_requests_updated'));
    }
    if (e.key === 'mentorGuru_enrollments') {
        window.dispatchEvent(new CustomEvent('mg_enrollments_updated'));
    }
    if (e.key === 'mentorGuru_batches') {
        window.dispatchEvent(new CustomEvent('mg_batches_updated'));
    }
});

function getMessages() {
    return JSON.parse(localStorage.getItem('mentorGuru_messages') || '[]');
}

function saveMessage(senderId, senderRole, receiverId, receiverRole, text, attachment = null, batchId = null) {
    const messages = getMessages();
    const newMsg = {
        id: generateId('msg'),
        senderId,
        senderRole,
        receiverId, // For direct messages
        receiverRole, // For direct messages
        batchId, // For group chats
        text,
        attachment,
        timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    localStorage.setItem('mentorGuru_messages', JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('mg_messages_updated')); // Trigger local update
    return newMsg;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        // Size limit check (approx 500kb to prevent localStorage crash)
        if (file.size > 500 * 1024) {
            // Simulate upload for larger files
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                simulated: true,
                data: null // We don't store the actual data
            });
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            simulated: false,
            data: reader.result
        });
        reader.onerror = error => reject(error);
    });
}

function getCourseRequests() {
    return JSON.parse(localStorage.getItem('mentorGuru_courseRequests') || '[]');
}

function createCourseRequest(studentId, studentName, courseName) {
    const reqs = getCourseRequests();
    const newReq = {
        id: generateId('req'),
        studentId,
        studentName,
        courseName,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };
    reqs.push(newReq);
    localStorage.setItem('mentorGuru_courseRequests', JSON.stringify(reqs));
    window.dispatchEvent(new CustomEvent('mg_requests_updated'));
    return newReq;
}

function getBatches() {
    return JSON.parse(localStorage.getItem('mentorGuru_batches') || '[]');
}

function createBatch(name, mentorId, course, studentIds = []) {
    const batches = getBatches();
    const newBatch = {
        id: generateId('batch'),
        name,
        mentorId,
        course,
        studentIds,
        timestamp: new Date().toISOString()
    };
    batches.push(newBatch);
    localStorage.setItem('mentorGuru_batches', JSON.stringify(batches));
    window.dispatchEvent(new CustomEvent('mg_batches_updated'));
    return newBatch;
}

// Expose functions to window for HTML handlers
window.switchCategory = switchCategory;
window.openLearnMoreModal = openLearnMoreModal;
window.closeLearnMoreModal = closeLearnMoreModal;
window.enrollCourseSecurityCheck = enrollCourseSecurityCheck;
window.closeEnrollModal = closeEnrollModal;
window.openEsewaModal = openEsewaModal;
window.closeEsewaModal = closeEsewaModal;
window.copyEsewaId = copyEsewaId;
window.confirmManualPayment = confirmManualPayment;
window.toggleChatbot = toggleChatbot;
window.toggleChatSettings = toggleChatSettings;
window.saveGeminiApiKey = saveGeminiApiKey;
window.sendQuickQuery = sendQuickQuery;
window.initCourses = initCourses;

window.getMessages = getMessages;
window.saveMessage = saveMessage;
window.fileToBase64 = fileToBase64;
window.getCourseRequests = getCourseRequests;
window.createCourseRequest = createCourseRequest;
window.getBatches = getBatches;
window.createBatch = createBatch;

// Trigger course init after Firebase bootstrap
bootstrapFirebase().then(() => {
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => {
            initializeApp();
            initCourses();
        });
    } else {
        initializeApp();
        initCourses();
    }
});
