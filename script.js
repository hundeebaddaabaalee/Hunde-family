// LocalStorage DB Helpers
function getUsersDB() {
    return JSON.parse(localStorage.getItem('registeredUsers')) || [];
}

function saveUsersDB(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Socket.io Connection (Render Backend URL Kee Asitti Galchi)
const socket = io('https://hunde-family.onrender.com');

// 1. SIDEBAR TOGGLE GOCHUU (MOBILE)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-left');
    if (sidebar) sidebar.classList.toggle('open');
}

// 2. DROPDOWN PROFILE MENU TOGGLE GOCHUU
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

// 3. MODAL BANUU FI CUFUU (AUTH)
function openAuthModal(formType) {
    document.getElementById('auth-modal')?.classList.remove('hidden');
    showForm(formType === 'signup' ? 'signupForm' : 'loginForm');
    document.getElementById('profile-dropdown')?.classList.add('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal')?.classList.add('hidden');
}

function showForm(formId) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(formId)?.classList.remove('hidden');
}

// 4. SIGNUP HOJJECHUU
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phoneInput = document.getElementById('modal-phone')?.value || '';
    const countryCode = document.getElementById('country-code-input')?.value || '';
    const phone = countryCode + phoneInput;
    const password = document.getElementById('signupPassword').value;

    let users = getUsersDB();
    if (users.some(u => u.email === email)) {
        alert("Account'n imeela kanaan galmaa'e jira!");
        return;
    }

    const newUser = { name, email, phone, password, pic: '' };
    users.push(newUser);
    saveUsersDB(users);

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    closeAuthModal();
    updateProfileMenu();
}

// 5. LOGIN HOJJECHUU
function handleLogin(event) {
    event.preventDefault();
    const inputVal = document.getElementById('loginUsername').value;
    const passVal = document.getElementById('loginPassword').value;

    let users = getUsersDB();
    const user = users.find(u => (u.email === inputVal || u.name === inputVal) && u.password === passVal);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeAuthModal();
        updateProfileMenu();
    } else {
        alert("Imeela ykn Password dogoggoraa!");
    }
}

// 6. PROFILE MENU & UI UPDATE GOCHUU
function updateProfileMenu() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileBtn = document.querySelector('.profile-icon-btn');

    if (currentUser && profileBtn) {
        if (currentUser.pic) {
            profileBtn.innerHTML = `<img src="${currentUser.pic}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">`;
        } else {
            profileBtn.innerHTML = '👤';
        }
        
        document.getElementById('menu-signup')?.classList.add('hidden');
        document.getElementById('menu-login')?.classList.add('hidden');
        
        const menuProfile = document.getElementById('menu-profile');
        if (menuProfile) {
            menuProfile.innerText = `👤 ${currentUser.name} (Profile)`;
            menuProfile.classList.remove('hidden');
        }
        document.getElementById('menu-logout')?.classList.remove('hidden');
    }
}

// 7. PROFILE MODAL HOJJECHUU
function openProfileModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    if (document.getElementById('profileName')) document.getElementById('profileName').value = currentUser.name;
    if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = currentUser.email;
    if (currentUser.pic && document.getElementById('profile-img-preview')) {
        document.getElementById('profile-img-preview').src = currentUser.pic;
    }

    document.getElementById('profile-modal')?.classList.remove('hidden');
    document.getElementById('profile-dropdown')?.classList.add('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal')?.classList.add('hidden');
}

function handleUpdateProfile(event) {
    event.preventDefault();
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = getUsersDB();

    const newName = document.getElementById('profileName').value;
    const newPassword = document.getElementById('profilePassword').value;

    currentUser.name = newName;
    if (newPassword) currentUser.password = newPassword;

    users = users.map(u => u.email === currentUser.email ? currentUser : u);
    saveUsersDB(users);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    closeProfileModal();
    updateProfileMenu();
}

// 8. SUURAA PROFILE PREVIEW GOCHUU
function previewProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('profile-img-preview');
            if (previewImg) previewImg.src = e.target.result;

            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                currentUser.pic = e.target.result;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                let users = getUsersDB();
                users = users.map(u => u.email === currentUser.email ? currentUser : u);
                saveUsersDB(users);
            }
        };
        reader.readAsDataURL(file);
    }
}

// 9. LOGOUT GOCHUU
function handleLogout() {
    localStorage.removeItem('currentUser');
    updateProfileMenu();
    document.getElementById('profile-dropdown')?.classList.add('hidden');
    location.reload();
}

// 10. NAVIGATION TAB FILTER GOCHUU
function filterView(type) {
    const chatTitle = document.getElementById('current-chat-title');
    const contactsUl = document.getElementById('contacts-ul');
    const callActions = document.getElementById('call-actions');
    
    if (type === 'private') {
        if (chatTitle) chatTitle.innerText = "Dhuunfaatti Qunnamuu";
        callActions?.classList.remove('hidden');
        if (contactsUl) {
            contactsUl.innerHTML = "";
            const users = getUsersDB();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            users.forEach(u => {
                if (!currentUser || u.email !== currentUser.email) {
                    const li = document.createElement('li');
                    li.style.cursor = 'pointer';
                    li.style.padding = '8px';
                    li.style.borderBottom = '1px solid #ccc';
                    li.onclick = () => selectContact(u.name, u.phone);
                    li.innerHTML = `<strong>${u.name}</strong><br><small>${u.phone || 'Lakkoofsa hin qabu'}</small>`;
                    contactsUl.appendChild(li);
                }
            });
        }
    } else if (type === 'family') {
        if (chatTitle) chatTitle.innerText = "Maatii Keenya";
        callActions?.classList.add('hidden');
    } else if (type === 'community') {
        if (chatTitle) chatTitle.innerText = "Community & Meeting";
        callActions?.classList.add('hidden');
    }

    const sidebar = document.querySelector('.sidebar-left');
    if (sidebar) sidebar.classList.remove('open');
}

function selectContact(name, phone) {
    const chatTitle = document.getElementById('current-chat-title');
    if (chatTitle) chatTitle.innerText = `${name} (${phone})`;
}

// 11. UI DISPLAY FUNCTION FOR MESSAGES
function appendMessageUI(sender, text, type, mediaType = 'text') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.style.alignSelf = type === 'outgoing' ? 'flex-end' : 'flex-start';
    msgDiv.style.backgroundColor = type === 'outgoing' ? '#dcf8c6' : '#ffffff';
    msgDiv.style.padding = '8px 12px';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.marginBottom = '8px';
    msgDiv.style.maxWidth = '75%';
    msgDiv.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';

    let contentHTML = `<small style="display:block; font-size:10px; color:#555; font-weight:bold;">${sender}</small>`;

    if (mediaType === 'image' || (typeof text === 'string' && text.startsWith('data:image/'))) {
        contentHTML += `<img src="${text}" class="chat-media-img" style="max-width:200px; max-height:200px; border-radius:8px; margin-top:4px; display:block;" alt="Uploaded Image">`;
    } else if (mediaType === 'audio' || (typeof text === 'string' && text.startsWith('data:audio/'))) {
        contentHTML += `<audio controls class="chat-media-audio" src="${text}" style="max-width:220px; margin-top:4px;"></audio>`;
    } else {
        contentHTML += `<p style="margin:2px 0 0 0;">${text}</p>`;
    }

    msgDiv.innerHTML = contentHTML;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 12. SOCKET.IO ERGAA ERGUU
function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'GUEST' };

    const msgData = {
        sender: currentUser.name,
        text: text,
        mediaType: 'text'
    };

    socket.emit('send-message', msgData);
    input.value = '';
}

// SOCKET.IO ERGAA DHUFU LISTEN GOCHUU
socket.on('receive-message', (data) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'GUEST' };
    const isOutgoing = data.sender === currentUser.name;
    
    appendMessageUI(
        data.sender, 
        data.text, 
        isOutgoing ? 'outgoing' : 'incoming', 
        data.mediaType || 'text'
    );
});

// MEDIA FILE UPLOAD (SOCKET.IO)
function handleMediaUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileUrl = e.target.result;
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'GUEST' };
        const mediaType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('audio/') ? 'audio' : 'file');

        socket.emit('send-message', {
            sender: currentUser.name,
            text: fileUrl,
            mediaType: mediaType
        });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

// CALL MODAL FUNCTIONS
function startCall(type) {
    const chatTitle = document.getElementById('current-chat-title')?.innerText || "Maatii Keenya";
    const modal = document.getElementById('call-modal');
    const nameElem = document.getElementById('call-user-name');
    const statusElem = document.getElementById('call-status');

    if (nameElem) nameElem.innerText = chatTitle;
    if (statusElem) statusElem.innerText = type === 'video' ? 'Calling Video...' : 'Calling Voice...';
    
    if (modal) modal.classList.remove('hidden');
}

function closeCallModal() {
    const modal = document.getElementById('call-modal');
    if (modal) modal.classList.add('hidden');
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    const msgInput = document.getElementById('message-input');
    if (msgInput) {
        msgInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    updateProfileMenu();
});
