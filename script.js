// 导航栏滚动效果
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    // 滚动时添加阴影
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // 移动端菜单切换
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // 关闭移动端菜单
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });
    
    // 导航栏高亮当前区域
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
});

// 数字动画效果
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                const number = parseInt(text);
                const suffix = text.replace(/[0-9]/g, '');
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            element.textContent = number + suffix;
                            clearInterval(timer);
                        } else {
                            element.textContent = Math.floor(current) + suffix;
                        }
                    }, 30);
                }
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

document.addEventListener('DOMContentLoaded', function() {
    animateNumbers();
    renderGalleryTrack();
});

// 活动剪影照片池（34张）
const galleryPhotos = Array.from({length: 34}, (_, i) => `photo-${String(i + 1).padStart(2, '0')}.jpg`);

// 生成随机排列的照片顺序
function shuffleGalleryPhotos() {
    const shuffled = [...galleryPhotos];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 获取或生成随机顺序
function getGalleryOrder() {
    const saved = localStorage.getItem('galleryOrder');
    const savedTime = localStorage.getItem('galleryOrderTime');
    const now = Date.now();
    // 超过30分钟重新随机
    if (saved && savedTime && (now - parseInt(savedTime)) < 30 * 60 * 1000) {
        return JSON.parse(saved);
    }
    const newOrder = shuffleGalleryPhotos();
    localStorage.setItem('galleryOrder', JSON.stringify(newOrder));
    localStorage.setItem('galleryOrderTime', now.toString());
    return newOrder;
}

// 渲染活动剪影轨道
function renderGalleryTrack() {
    const order = getGalleryOrder();
    const track = document.querySelector('.gallery-track');
    if (!track) return;

    // 生成前半部分
    const itemsHtml = order.map((photo, idx) => `
        <div class="gallery-item" onclick="openGalleryModal(${idx})">
            <img src="${photo}" alt="活动剪影${idx + 1}">
            <div class="gallery-item-overlay"><span>活动剪影 ${idx + 1}</span></div>
        </div>
    `).join('');

    // 复制一份用于无缝滚动
    const cloneHtml = order.map((photo, idx) => `
        <div class="gallery-item" onclick="openGalleryModal(${idx})">
            <img src="${photo}" alt="活动剪影${idx + 1}">
            <div class="gallery-item-overlay"><span>活动剪影 ${idx + 1}</span></div>
        </div>
    `).join('');

    track.innerHTML = itemsHtml + cloneHtml;
}

// 活动剪影弹窗数据（基于随机顺序）
let galleryData = [];

let currentGalleryIndex = 0;

// 打开活动剪影弹窗（单张大图模式）
function openGalleryModal(index) {
    currentGalleryIndex = index;
    const order = getGalleryOrder();
    const photo = order[index];

    // 更新弹窗内容
    document.getElementById('galleryModalTitle').textContent = '活动剪影 ' + (index + 1);
    document.getElementById('galleryModalDesc').textContent = '';
    document.getElementById('galleryModalCounter').textContent = `${index + 1} / ${order.length}`;

    // 生成图片（当前图+前后各2张）
    const track = document.getElementById('galleryModalTrack');
    track.innerHTML = '';
    const surrounding = [];
    for (let i = -2; i <= 2; i++) {
        const idx = (index + i + order.length) % order.length;
        surrounding.push(order[idx]);
    }
    surrounding.forEach((img) => {
        const item = document.createElement('div');
        item.className = 'gallery-modal-item';
        item.innerHTML = `<img src="${img}" alt="活动剪影">`;
        track.appendChild(item);
        // 复制一份用于无缝滚动
        const clone = document.createElement('div');
        clone.className = 'gallery-modal-item';
        clone.innerHTML = `<img src="${img}" alt="活动剪影">`;
        track.appendChild(clone);
    });

    // 显示弹窗
    document.getElementById('galleryModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 上一张图片
function prevGalleryImage() {
    const order = getGalleryOrder();
    currentGalleryIndex = (currentGalleryIndex - 1 + order.length) % order.length;
    openGalleryModal(currentGalleryIndex);
}

// 下一张图片
function nextGalleryImage() {
    const order = getGalleryOrder();
    currentGalleryIndex = (currentGalleryIndex + 1) % order.length;
    openGalleryModal(currentGalleryIndex);
}

// ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGalleryModal();
        closeTeamModal();
        closeContributeModal();
    }
});

// 甘特图点击跳转抖音
const douyinUrl = 'https://www.douyin.com/user/MS4wLjABAAAAW7OQHKfGKdgdcPNMLEWX5XNPaw-KcYgcMlG8XSWpDzY9MPbiR44v78sva7mGFT7_?from_tab_name=main';

// 切换甘特图展开/收起
function toggleGantt() {
    const ganttCard = document.querySelector('.gantt-card');
    ganttCard.classList.toggle('expanded');
}

// 为甘特图行添加点击事件
document.querySelectorAll('.gantt-row').forEach(row => {
    row.addEventListener('click', function(e) {
        // 弹出确认框
        if (confirm('即将跳转至我们的抖音主页，了解更多精彩内容～\n\n是否继续？')) {
            window.open(douyinUrl, '_blank');
        }
    });
});

// Toast提示函数
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==================== 团队成员管理 ====================
const defaultTeamMembers = [
    { name: '李涛', role: '项目负责人', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', bio: '项目负责人，负责整体统筹与协调工作。' },
    { name: '桑若曦', role: '成员', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', bio: '' },
    { name: '姚晨', role: '成员', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', bio: '' },
    { name: '刘欣玉', role: '成员', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', bio: '' },
    { name: '郑天慧', role: '成员', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', bio: '' },
    { name: '张选宇', role: '成员', college: '大数据与统计学院', gradient: 'linear-gradient(135deg, #30cfd0, #330867)', bio: '' },
    { name: '王瀚文', role: '成员', college: '经济学院', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', bio: '' },
    { name: '金怡', role: '成员', college: '经济学院', gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', bio: '' },
    { name: '张帆', role: '成员', college: '计算机科学与技术学院', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', bio: '' },
    { name: '王媛媛', role: '成员', college: '外语学院', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', bio: '' },
    { name: '张越', role: '成员', college: '社会与政治学院', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', bio: '' },
    { name: '陶思雨', role: '成员', college: '管理学院', gradient: 'linear-gradient(135deg, #ff8a80, #ea6100)', bio: '' },
    { name: '陈晨', role: '成员', college: '外语学院', gradient: 'linear-gradient(135deg, #c2e9fb, #a1c4fd)', bio: '' },
    { name: '鲍可可', role: '成员', college: '社会与政治学院', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)', bio: '' },
    { name: '王嘉成', role: '成员', college: '化学化工学院', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', bio: '' }
];

let teamMembers = [];
let currentTeamIndex = 0;

function getTeamMembers() {
    const saved = localStorage.getItem('teamMembers');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('解析团队成员数据失败', e);
        }
    }
    return JSON.parse(JSON.stringify(defaultTeamMembers));
}

function saveTeamMembers() {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
}

function renderTeam() {
    teamMembers = getTeamMembers();
    const grid = document.getElementById('teamGrid');
    if (!grid) return;
    grid.innerHTML = teamMembers.map((member, index) => `
        <div class="team-card" onclick="openTeamModal(${index})">
            <div class="team-avatar" style="background: ${member.gradient};">
                <span>${member.name.charAt(0)}</span>
            </div>
            <h3>${member.name}</h3>
            <p>${member.role}</p>
            <div class="team-college">安徽大学 · ${member.college}</div>
        </div>
    `).join('');
}

function openTeamModal(index) {
    currentTeamIndex = index;
    const member = teamMembers[index];
    document.getElementById('modalAvatar').style.background = member.gradient;
    document.getElementById('modalAvatar').innerHTML = `<span>${member.name.charAt(0)}</span>`;
    document.getElementById('modalName').textContent = member.name;
    document.getElementById('modalRole').textContent = member.role;
    document.getElementById('modalCollege').textContent = '安徽大学 · ' + member.college;
    document.getElementById('modalBio').textContent = member.bio || '暂无介绍，点击“编辑介绍”添加内容～';
    document.getElementById('teamViewMode').style.display = 'block';
    document.getElementById('teamEditMode').style.display = 'none';
    document.getElementById('teamModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTeamModal() {
    document.getElementById('teamModal').classList.remove('active');
    document.body.style.overflow = '';
}

function enableTeamEdit() {
    const member = teamMembers[currentTeamIndex];
    document.getElementById('editName').value = member.name;
    document.getElementById('editRole').value = member.role;
    document.getElementById('editCollege').value = member.college;
    document.getElementById('editBio').value = member.bio || '';
    document.getElementById('teamViewMode').style.display = 'none';
    document.getElementById('teamEditMode').style.display = 'block';
}

function disableTeamEdit() {
    document.getElementById('teamViewMode').style.display = 'block';
    document.getElementById('teamEditMode').style.display = 'none';
}

function saveTeamEdit() {
    teamMembers[currentTeamIndex].name = document.getElementById('editName').value.trim();
    teamMembers[currentTeamIndex].role = document.getElementById('editRole').value.trim();
    teamMembers[currentTeamIndex].college = document.getElementById('editCollege').value.trim();
    teamMembers[currentTeamIndex].bio = document.getElementById('editBio').value.trim();
    saveTeamMembers();
    renderTeam();
    openTeamModal(currentTeamIndex);
    showToast('保存成功！');
}

function resetTeamData() {
    if (confirm('确定要恢复默认团队成员数据吗？所有自定义修改将丢失。')) {
        localStorage.removeItem('teamMembers');
        renderTeam();
        showToast('已恢复默认成员');
    }
}

document.addEventListener('DOMContentLoaded', renderTeam);

// ==================== 青春笔记投稿 ====================
function getUserNotes() {
    const saved = localStorage.getItem('userNotes');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('解析投稿数据失败', e);
        }
    }
    return [];
}

function saveUserNotes(notes) {
    localStorage.setItem('userNotes', JSON.stringify(notes));
}

function renderUserNotes() {
    const notes = getUserNotes();
    const grid = document.getElementById('notesGrid');
    if (!grid) return;
    // 移除之前动态添加的投稿卡片（保留前7个静态卡片：3个原始+4个post展示）
    while (grid.children.length > 7) {
        grid.removeChild(grid.lastChild);
    }
    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        // 基于 note.id 伪随机分配素材照片，让封面分布更自然
        const photoNum = ((note.id * 9301 + 49297) % 34) + 1;
        const photoSrc = `photo-${String(photoNum).padStart(2, '0')}.jpg`;
        card.innerHTML = `
            <div class="note-image">
                <img src="${photoSrc}" alt="笔记故事">
            </div>
            <div class="note-header">
                <span class="note-author">${note.author || '匿名'}</span>
                <span class="note-time">${note.time}</span>
            </div>
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div class="note-tags">
                ${note.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        `;
        grid.appendChild(card);
    });
}

function showContributeModal() {
    document.getElementById('contributeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeContributeModal() {
    document.getElementById('contributeModal').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleCustomTag() {
    const otherChecked = document.getElementById('tagOther').checked;
    const customInput = document.getElementById('customTagInput');
    customInput.style.display = otherChecked ? 'block' : 'none';
    if (!otherChecked) customInput.value = '';
}

function submitContribute(event) {
    event.preventDefault();
    const name = document.getElementById('contributeName').value.trim();
    const title = document.getElementById('contributeTitle').value.trim();
    const content = document.getElementById('contributeContent').value.trim();
    let tags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(cb => cb.value);

    // 处理自定义标签
    if (tags.includes('其他')) {
        tags = tags.filter(t => t !== '其他');
        const custom = document.getElementById('customTagInput').value.trim();
        if (custom) {
            const customTags = custom.split(/[,，]/).map(t => t.trim()).filter(t => t);
            tags = tags.concat(customTags);
        }
    }

    if (!title || !content) {
        showToast('请填写标题和内容');
        return;
    }

    const notes = getUserNotes();
    const newNote = {
        id: Date.now(),
        author: name || '匿名',
        title: title,
        content: content,
        tags: tags.length > 0 ? tags : ['笔记故事'],
        time: new Date().toLocaleDateString('zh-CN')
    };
    notes.unshift(newNote);
    saveUserNotes(notes);
    renderUserNotes();

    // 清空表单
    document.getElementById('contributeName').value = '';
    document.getElementById('contributeTitle').value = '';
    document.getElementById('contributeContent').value = '';
    document.querySelectorAll('input[name="tag"]').forEach(cb => cb.checked = false);
    document.getElementById('customTagInput').value = '';
    document.getElementById('customTagInput').style.display = 'none';

    closeContributeModal();
    showToast('投稿成功！你的笔记已发布');
}

document.addEventListener('DOMContentLoaded', renderUserNotes);

// ==================== 加入我们 ====================
function getJoinCount() {
    const saved = localStorage.getItem('joinTeamCount');
    return saved ? parseInt(saved, 10) : 0;
}

function saveJoinCount(count) {
    localStorage.setItem('joinTeamCount', count.toString());
}

function updateStatNumber() {
    const baseNumber = 1000;
    const extra = getJoinCount();
    const total = baseNumber + extra;
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        statNumbers[0].innerHTML = total + '<span class="stat-unit">+</span>';
    }
}

function showJoinTeamModal() {
    document.getElementById('joinTeamModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeJoinTeamModal() {
    document.getElementById('joinTeamModal').classList.remove('active');
    document.body.style.overflow = '';
}

function submitJoinTeam(event) {
    event.preventDefault();
    const name = document.getElementById('joinName').value.trim();
    const college = document.getElementById('joinCollege').value.trim();
    const phone = document.getElementById('joinPhone').value.trim();
    const reason = document.getElementById('joinReason').value.trim();

    if (!name || !college || !phone) {
        showToast('请填写完整信息');
        return;
    }

    // 增加参与人数
    const newCount = getJoinCount() + 1;
    saveJoinCount(newCount);
    updateStatNumber();

    // 构建邮件内容
    const subject = encodeURIComponent('【加入我们】新成员申请 - ' + name);
    const body = encodeURIComponent(
        '姓名：' + name + '\n' +
        '学院：' + college + '\n' +
        '联系电话：' + phone + '\n' +
        '申请理由：' + (reason || '无') + '\n\n' +
        '—— 来自安大乡村教育笔记网站自动提交'
    );

    // 打开邮件客户端
    window.location.href = 'mailto:227794112@qq.com?subject=' + subject + '&body=' + body;

    // 清空表单
    document.getElementById('joinName').value = '';
    document.getElementById('joinCollege').value = '';
    document.getElementById('joinPhone').value = '';
    document.getElementById('joinReason').value = '';

    closeJoinTeamModal();
    showToast('申请提交成功！邮件已准备发送，欢迎加入');
}

// ==================== FAQ弹窗 ====================
function showFaqModal() {
    document.getElementById('faqModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFaqModal() {
    document.getElementById('faqModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 提交FAQ留言
function submitFaqMessage(event) {
    event.preventDefault();
    const name = document.getElementById('faqMsgName').value.trim();
    const content = document.getElementById('faqMsgContent').value.trim();

    if (!name || !content) {
        showToast('请填写完整信息');
        return;
    }

    const subject = encodeURIComponent('【FAQ留言】来自 ' + name + ' 的问题');
    const body = encodeURIComponent('留言人：' + name + '\n\n问题内容：\n' + content);
    window.location.href = 'mailto:227794112@qq.com?subject=' + subject + '&body=' + body;

    document.getElementById('faqMsgName').value = '';
    document.getElementById('faqMsgContent').value = '';
    showToast('问题已准备发送，感谢您的留言！');
}

document.addEventListener('DOMContentLoaded', updateStatNumber);




