// 存储日记的数组（实际应用中应该使用后端数据库）
let diaries = [];
let currentCategory = 'all';  // 当前选中的分类
let selectedImages = [];  // 用于存储选中的图片
let isLoggedIn = false;

// 添加个人信息相关的代码
let profileData = {
    nickname: '小明0736',
    bio: '一个热爱生活、喜欢记录的博主',
    avatar: 'avatar.jpg',
    tags: ['摄影', '旅行', '美食', '读书'],
    email: 'example@email.com',
    wechat: 'my_wechat_id'
};

// 替换原来的 musicList 数组定义
let musicList = [];  // 将改为动态加载
let currentMusicIndex = 0;

// 添加加载音乐列表的函数
function loadMusicList() {
    // 直接设置音乐列表
    const musicFolder = 'music/';
    const musicFiles = [
        '云烟成雨(房东的猫).mp3', '空待(独唱版) - 王朝.mp3', '翼 (动画版) - 浓浓Vane.mp3', '主角 - 马里奥.mp3', 'APT. - ROSÉ、Bruno Mars.mp3',
        '6.mp3', '7.mp3', '8.mp3', '9.mp3', '10.mp3',
        '11.mp3', '12.mp3', '13.mp3', '14.mp3', '15.mp3',
        '16.mp3', '17.mp3', '18.mp3', '19.mp3', '20.mp3'
    ];
    
    musicList = musicFiles.map(file => ({
        title: file.replace('.mp3', ''),
        src: musicFolder + file
    }));
    
    // 初始化音乐播放器
    initMusicPlayer();
}



// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    checkLogin();
    
    // 添加登录表单提交事件监听
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 初始化日记列表
    initDiaries();
    // 初始化个人信息
    initProfile();
    // 初始化分类切换
    initCategories();

    // 添加标签输入事件监听
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim();
                if (tag) {
                    addTag(tag);
                    this.value = '';
                }
            }
        });
    }
    
    // 添加个人信息表单提交事件监听
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    // 添加头像上传事件监听
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // 添加日记表单提交事件监听
    const diaryForm = document.getElementById('diaryForm');
    if (diaryForm) {
        diaryForm.addEventListener('submit', addDiary);
    }

    // 添加图片上传事件监听
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }

    // 加载音乐列表
    loadMusicList();
});

// 初始化日记列表
function initDiaries() {
    // 从 localStorage 获取已保存的日记
    const savedDiaries = localStorage.getItem('diaries');
    if (savedDiaries) {
        diaries = JSON.parse(savedDiaries);
    }
    renderDiaries();
    renderLatestDiary();
}

// 初始化个人信息
function initProfile() {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
        profileData = JSON.parse(savedProfile);
    }
    renderProfile();
}

// 初始化分类切换
function initCategories() {
    document.querySelectorAll('.diary-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            switchCategory(category);
        });
    });
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    
    // 更新按钮状态
    document.querySelectorAll('.diary-nav-btn').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderDiaries();
}

// 渲染日记列表
function renderDiaries() {
    const diaryList = document.getElementById('diary-list');
    if (!diaryList) return;

    // 根据当前分类筛选日记
    const filteredDiaries = currentCategory === 'all' 
        ? diaries 
        : diaries.filter(diary => diary.category === currentCategory);

    diaryList.innerHTML = filteredDiaries.map(diary => `
        <div class="diary-card animate__animated animate__fadeIn" onclick="showDiaryDetail(${JSON.stringify(diary).replace(/"/g, '&quot;')})">
            <div class="diary-card-header">
                <h3 class="diary-card-title">${diary.title}</h3>
                <span class="diary-card-category">${diary.category}</span>
            </div>
            <div class="diary-card-content">
                ${diary.content}
            </div>
            ${diary.images && diary.images.length > 0 ? `
                <div class="diary-card-images">
                    ${diary.images.slice(0, 3).map(img => `
                        <img src="${img}" alt="日记图片">
                    `).join('')}
                    ${diary.images.length > 3 ? `<span>+${diary.images.length - 3}</span>` : ''}
                </div>
            ` : ''}
            <div class="diary-card-footer">
                <span class="diary-card-date">
                    <i class="far fa-calendar-alt"></i> ${diary.date}
                </span>
                <div class="diary-card-actions">
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteDiary(${diary.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updateCategoryCounts();
}

// 添加删除日记的函数
function deleteDiary(id) {
    if (confirm('确定要删除这篇日记吗？')) {
        // 从数组中过滤掉要删除的日记
        diaries = diaries.filter(diary => diary.id !== id);
        
        // 更新 localStorage
        localStorage.setItem('diaries', JSON.stringify(diaries));
        
        // 重新渲染日记列表和最新日记
        renderDiaries();
        renderLatestDiary();
    }
}

// 渲染个人信息
function renderProfile() {
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;

    profileContent.innerHTML = `
        <div class="profile-image">
            <img src="${profileData.avatar}" alt="个人头像">
        </div>
        <div class="profile-info">
            <h3>你好，我是${profileData.nickname}</h3>
            <p class="bio">${profileData.bio}</p>
            <div class="interests">
                <h4>个人标签：</h4>
                ${profileData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="contact-info">
                <h4>联系我：</h4>
                <p>邮箱：${profileData.email}</p>
                <p>微信：${profileData.wechat}</p>
            </div>
        </div>
    `;
}

// 更新分类计数
function updateCategoryCounts() {
    const counts = {
        all: diaries.length,
        '生活随笔': diaries.filter(d => d.category === '生活随笔').length,
        '旅行记录': diaries.filter(d => d.category === '旅行记录').length,
        '美食日记': diaries.filter(d => d.category === '美食日记').length
    };

    document.querySelectorAll('.diary-nav-btn').forEach(btn => {
        const category = btn.dataset.category;
        const countSpan = btn.querySelector('.diary-count');
        if (countSpan) {
            countSpan.textContent = counts[category] || 0;
        }
    });
}

// 打开个人信息编辑表单
function openProfileForm() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // 填充表单数据
    document.getElementById('nickname').value = profileData.nickname || '';
    document.getElementById('bio').value = profileData.bio || '';
    document.getElementById('email').value = profileData.email || '';
    document.getElementById('wechat').value = profileData.wechat || '';
    
    // 设置头像预览
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) {
        avatarPreview.src = profileData.avatar || 'avatar.jpg';
    }
    
    renderTags();
}

// 关个人信息编辑表单
function closeProfileForm() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
}

// 渲染标签
function renderTags() {
    const tagContainer = document.getElementById('tagContainer');
    if (!tagContainer) return;
    
    tagContainer.innerHTML = profileData.tags.map(tag => `
        <span class="tag-item">
            ${tag}
            <span class="remove-tag" onclick="removeTag('${tag}')">&times;</span>
        </span>
    `).join('');
}

// 添加标签
function addTag(tag) {
    if (tag && !profileData.tags.includes(tag)) {
        profileData.tags.push(tag);
        renderTags();
    }
}

// 删除标签
function removeTag(tag) {
    profileData.tags = profileData.tags.filter(t => t !== tag);
    renderTags();
}

// 保存个人信息
function saveProfile(event) {
    event.preventDefault();
    
    // 获取头像文件
    const avatarFile = document.getElementById('avatarInput').files[0];
    
    if (avatarFile) {
        // 如果有新的头像文件，转换为Base64
        const reader = new FileReader();
        reader.onload = (e) => {
            profileData = {
                ...profileData,
                avatar: e.target.result, // 保存Base64格式的头像
                nickname: document.getElementById('nickname').value,
                bio: document.getElementById('bio').value,
                email: document.getElementById('email').value,
                wechat: document.getElementById('wechat').value
            };
            
            try {
                localStorage.setItem('profile', JSON.stringify(profileData));
                renderProfile();
                closeProfileForm();
                alert('个人信息保存成功！');
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    alert('存储空间不足，请使用较小的图片！');
                    return;
                }
                alert('保存失败，请重试！');
            }
        };
        reader.readAsDataURL(avatarFile);
    } else {
        // 如果没有新的头像文件，直接保存其他信息
        profileData = {
            ...profileData,
            nickname: document.getElementById('nickname').value,
            bio: document.getElementById('bio').value,
            email: document.getElementById('email').value,
            wechat: document.getElementById('wechat').value
        };
        
        try {
            localStorage.setItem('profile', JSON.stringify(profileData));
            renderProfile();
            closeProfileForm();
            alert('个人信息保存成功！');
        } catch (e) {
            alert('保存失败，请重试！');
        }
    }
}

// 处理头像上传
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileData.avatar = e.target.result;
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) {
                avatarPreview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
}

// 添加渲染最新日记的函数
function renderLatestDiary() {
    const latestDiaryContainer = document.getElementById('latest-diary');
    if (!latestDiaryContainer) return;

    if (diaries.length === 0) {
        latestDiaryContainer.innerHTML = `
            <div class="latest-diary-empty">
                <i class="fas fa-book-open"></i>
                <p>还没有日记，去写一篇吧！</p>
            </div>
        `;
        return;
    }

    const latestDiary = diaries[0]; // 获取最新的日记
    let imagesHtml = '';
    
    if (latestDiary.images && latestDiary.images.length > 0) {
        imagesHtml = `
            <div class="latest-diary-images">
                ${latestDiary.images.slice(0, 4).map(img => `
                    <img src="${img}" alt="日记图片" onclick="showFullImage('${img}')">
                `).join('')}
            </div>
        `;
    }

    latestDiaryContainer.innerHTML = `
        <div class="latest-diary-header">
            <h3 class="latest-diary-title">${latestDiary.title}</h3>
            <span class="latest-diary-category">${latestDiary.category}</span>
        </div>
        <div class="latest-diary-meta">
            <span><i class="far fa-calendar-alt"></i> ${latestDiary.date}</span>
        </div>
        <div class="latest-diary-content">
            ${latestDiary.content}
        </div>
        ${imagesHtml}
        <div class="latest-diary-footer">
            <a href="#diary" class="read-more-btn" onclick="showDiaryDetail(${JSON.stringify(latestDiary).replace(/"/g, '&quot;')})">
                阅读全文 <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}

// 添加显示全屏图片的函数
function showFullImage(src) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer';
    viewer.onclick = () => document.body.removeChild(viewer);
    viewer.innerHTML = `<img src="${src}" alt="全屏图片">`;
    document.body.appendChild(viewer);
}

// 添加显示日记详情的函数
function showDiaryDetail(diary) {
    const detailModal = document.getElementById('diaryDetailModal');
    const detailContent = document.getElementById('diary-detail-content');

    let imagesHtml = '';
    if (diary.images && diary.images.length > 0) {
        imagesHtml = `
            <div class="diary-detail-images">
                ${diary.images.map(img => `
                    <img src="${img}" alt="日记图片" onclick="showFullImage('${img}')">
                `).join('')}
            </div>
        `;
    }

    detailContent.innerHTML = `
        <div class="diary-detail-header">
            <h2 class="diary-detail-title">${diary.title}</h2>
            <div class="diary-detail-meta">
                <span><i class="fas fa-folder"></i> ${diary.category}</span>
                <span><i class="far fa-calendar-alt"></i> ${diary.date}</span>
            </div>
        </div>
        <div class="diary-detail-body">
            ${diary.content.split('\n').map(para => `<p>${para}</p>`).join('')}
        </div>
        ${imagesHtml}
    `;

    detailModal.style.display = 'flex';
    detailModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 添加关闭日记详情的函数
function closeDiaryDetail() {
    const detailModal = document.getElementById('diaryDetailModal');
    detailModal.classList.remove('show');
    setTimeout(() => {
        detailModal.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
}

// 添加写日记相关的函数
function openDiaryForm() {
    const modal = document.getElementById('diaryModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // 清空表单和图片预览
    document.getElementById('diaryForm').reset();
    selectedImages = [];
    document.getElementById('image-preview').innerHTML = '';
}

function closeDiaryForm() {
    const modal = document.getElementById('diaryModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
}

// 添加日记
function addDiary(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;

    if (!title || !content) {
        alert('请填写标题和内容！');
        return;
    }

    const date = new Date().toLocaleDateString();
    const id = Date.now();

    // 处理图片 - 转换为Base64并存储
    const imagePromises = selectedImages.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 将图片转换为Base64格式
                resolve(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    });

    Promise.all(imagePromises).then(images => {
        const newDiary = {
            id,
            title,
            category,
            content,
            date,
            images
        };

        // 添加到日记数组的开头
        diaries.unshift(newDiary);
        
        // 保存到localStorage
        try {
            localStorage.setItem('diaries', JSON.stringify(diaries));
            // 提示成功
            alert('日记发布成功！');
        } catch (e) {
            // 处理存储配额超出的情况
            if (e.name === 'QuotaExceededError') {
                alert('存储空间不足，请删除一些旧日记或图片！');
                return;
            }
            alert('保存失败，请重试！');
            return;
        }
        
        // 重新渲染日记列表和最新日记
        renderDiaries();
        renderLatestDiary();
        
        // 关闭模态框
        closeDiaryForm();
        
        // 清空选中的图片
        selectedImages = [];
    });
}

// 添加图片处理相关函数
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            selectedImages.push(file);
        }
    });
    renderImagePreviews();
}

function renderImagePreviews() {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';

    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="预览图片">
                <button class="remove-image" onclick="removeImage(${index})">&times;</button>
            `;
            previewContainer.appendChild(preview);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    renderImagePreviews();
}

// 添加登录相关函数
function checkLogin() {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
        isLoggedIn = true;
        showMainContent();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const mainContent = document.getElementById('mainContent');
    loginModal.style.display = 'flex';
    mainContent.style.display = 'none';
}

function showMainContent() {
    const loginModal = document.getElementById('loginModal');
    const mainContent = document.getElementById('mainContent');
    loginModal.style.display = 'none';
    mainContent.style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 这里简单示例，实际应用中应该使用后端验证
    if (username === 'admin' && password === '748198') {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        showMainContent();
    } else {
        alert('用户名或密码错误！');
    }
}

// 添加登出功能
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    showLoginModal();
}

// 修改初始化音乐播放器函数
function initMusicPlayer() {
    const audio = document.getElementById('bgMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const musicListContainer = document.getElementById('musicList');
    const currentMusicSpan = document.getElementById('currentMusic');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    // 设置初始音量
    audio.volume = 0.5;
    volumeSlider.value = 50;

    // 渲染音乐列表
    renderMusicList();

    // 设置初始音乐
    if (musicList.length > 0) {
        audio.src = musicList[0].src;
        currentMusicSpan.textContent = musicList[0].title;
        
        // 加载完成后自动播放
        audio.addEventListener('loadeddata', () => {
            audio.play().catch(error => {
                console.log('自动播放失败:', error);
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
    }

    // 播放/暂停按钮点击事件
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(error => {
                console.log('播放失败:', error);
            });
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // 更新进度条
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progress}%`;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
        }
    });

    // 加载完成后显示总时长
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });

    // 点击进度条跳转
    const musicProgress = document.querySelector('.music-progress');
    musicProgress.addEventListener('click', (e) => {
        const rect = musicProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (!isNaN(audio.duration)) {
            audio.currentTime = percent * audio.duration;
        }
    });

    // 音量控制
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audio.volume = volume;
        // 更新音量图标
        const volumeIcon = document.querySelector('.volume-control i');
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });

    // 音乐结束时自动播放下一首
    audio.addEventListener('ended', () => {
        playNextMusic();
    });

    // 错误处理
    audio.addEventListener('error', (e) => {
        console.error('音频加载错误:', e);
        alert('音频加载失败，请检查文件是否存在');
    });

     // 在这后面添加新的事件监听器
    prevBtn.addEventListener('click', () => {
        playPrevMusic();
    });
    
    nextBtn.addEventListener('click', () => {
        playNextMusic();
     });
}


// 在 initMusicPlayer 函数后面添加这些新函数
function playNextMusic() {
    const nextIndex = (currentMusicIndex + 1) % musicList.length;
    playMusic(nextIndex);
}

function playPrevMusic() {
    const prevIndex = (currentMusicIndex - 1 + musicList.length) % musicList.length;
    playMusic(prevIndex);
}

function playMusic(index) {
    const audio = document.getElementById('bgMusic');
    const currentMusicSpan = document.getElementById('currentMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    currentMusicIndex = index;
    audio.src = musicList[index].src;
    currentMusicSpan.textContent = musicList[index].title;
    
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    renderMusicList();
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 渲染音乐列表
function renderMusicList() {
    const musicListContainer = document.getElementById('musicList');
    musicListContainer.innerHTML = musicList.map((music, index) => `
        <div class="music-item ${index === currentMusicIndex ? 'active' : ''}" 
             onclick="playMusic(${index})">
            ${music.title}
        </div>
    `).join('');
}

// 播放指定索引的音乐
function playMusic(index) {
    const audio = document.getElementById('bgMusic');
    const currentMusicSpan = document.getElementById('currentMusic');
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    currentMusicIndex = index;
    audio.src = musicList[index].src;
    currentMusicSpan.textContent = musicList[index].title;
    
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    renderMusicList();
}

// 播放下一首
function playNextMusic() {
    const nextIndex = (currentMusicIndex + 1) % musicList.length;
    playMusic(nextIndex);
}

// 播放上一首
function playPrevMusic() {
    const prevIndex = (currentMusicIndex - 1 + musicList.length) % musicList.length;
    playMusic(prevIndex);
}

// 切换音乐列表显示
function toggleMusicList() {
    const musicList = document.getElementById('musicList');
    musicList.style.display = musicList.style.display === 'none' ? 'block' : 'none';
}

// 添加清理存储空间的函数
function clearStorage() {
    if (confirm('确定要清除所有本地数据吗？这将删除所有日记和个人信息！')) {
        localStorage.clear();
        location.reload();
    }
}

// 添加导出数据的函数
function exportData() {
    const data = {
        diaries: JSON.parse(localStorage.getItem('diaries') || '[]'),
        profile: JSON.parse(localStorage.getItem('profile') || '{}')
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 添加导入数据的函数
function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                localStorage.setItem('diaries', JSON.stringify(data.diaries));
                localStorage.setItem('profile', JSON.stringify(data.profile));
                location.reload();
            } catch (e) {
                alert('导入失败，请确保文件格式正确！');
            }
        };
        reader.readAsText(file);
    }
}

// 创建日记文件夹并保存内容
async function saveDiaryWithFolder(directoryHandle, diary) {
    try {
        // 创建以"标题_日期"命名的文件夹
        const folderName = `${diary.title}_${diary.date.replace(/\//g, '-')}`;
        const diaryFolder = await directoryHandle.getDirectoryHandle(folderName, { create: true });
        
        // 保存日记内容为 content.txt
        const contentHandle = await diaryFolder.getFileHandle('content.txt', { create: true });
        const contentWritable = await contentHandle.createWritable();
        const diaryContent = `标题: ${diary.title}
分类: ${diary.category}
日期: ${diary.date}
内容:
${diary.content}`;
        await contentWritable.write(diaryContent);
        await contentWritable.close();

        // 如果有图片，创建 images 子文件夹
        if (diary.images && diary.images.length > 0) {
            const imagesFolder = await diaryFolder.getDirectoryHandle('images', { create: true });
            
            // 保存每张图片
            for (const [index, image] of diary.images.entries()) {
                const imageHandle = await imagesFolder.getFileHandle(`image_${index + 1}.png`, { create: true });
                const imageWritable = await imageHandle.createWritable();
                const response = await fetch(image);
                const blob = await response.blob();
                await imageWritable.write(blob);
                await imageWritable.close();
            }
        }

        // 创建元数据文件 metadata.json
        const metadataHandle = await diaryFolder.getFileHandle('metadata.json', { create: true });
        const metadataWritable = await metadataHandle.createWritable();
        const metadata = {
            id: diary.id,
            title: diary.title,
            category: diary.category,
            date: diary.date,
            imageCount: diary.images ? diary.images.length : 0
        };
        await metadataWritable.write(JSON.stringify(metadata, null, 2));
        await metadataWritable.close();

        console.log('日记保存成功:', folderName);
        return true;
    } catch (error) {
        console.error('保存日记失败:', error);
        return false;
    }
}

// 修改添加日记的函数
async function addDiary(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;

    if (!title || !content) {
        alert('请填写标题和内容！');
        return;
    }

    // 检查标题是否包含非法字符
    const invalidChars = /[\\/:*?"<>|]/g;
    if (invalidChars.test(title)) {
        alert('标题不能包含以下字符: \\ / : * ? " < > |');
        return;
    }

    const date = new Date().toLocaleDateString();
    const id = Date.now();

    try {
        // 转换图片为 Base64
        const imagePromises = selectedImages.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        const images = await Promise.all(imagePromises);
        
        const newDiary = {
            id,
            title,
            category,
            content,
            date,
            images
        };

        // 请求访问 data 文件夹
        const directoryHandle = await requestDataDirectoryAccess();
        if (!directoryHandle) {
            alert('无法访问存储目录，请确保选择了正确的 data 文件夹！');
            return;
        }

        // 保存日记到本地文件夹
        const savedSuccessfully = await saveDiaryWithFolder(directoryHandle, newDiary);
        
        if (savedSuccessfully) {
            // 保存到 localStorage
            diaries.unshift(newDiary);
            localStorage.setItem('diaries', JSON.stringify(diaries));
            
            // 更新界面
            renderDiaries();
            renderLatestDiary();
            
            // 关闭表单并清理
            closeDiaryForm();
            selectedImages = [];
            
            alert('日记发布成功！');
        } else {
            alert('日记保存失败，请重试！');
        }

    } catch (error) {
        console.error('发布日记时出错:', error);
        alert('发布日记时出错，请重试！');
    }
}

// 请求访问 data 文件夹
async function requestDataDirectoryAccess() {
    try {
        // 尝试获取之前保存的目录句柄
        let directoryHandle = window.dataDirectoryHandle;
        
        if (!directoryHandle) {
            directoryHandle = await window.showDirectoryPicker();
            // 验证是否为 data 文件夹
            if (directoryHandle.name !== 'data') {
                alert('请选择 data 文件夹作为存储目录。');
                return null;
            }
            // 保存目录句柄以供后续使用
            window.dataDirectoryHandle = directoryHandle;
        }
        
        return directoryHandle;
    } catch (error) {
        console.error('目录访问被拒绝或不支持:', error);
        return null;
    }
}