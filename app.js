// MƯỜNG THANH GOLF TOURNAMENT CHECK-IN SYSTEM 2026
// Sân Golf Tràng An - Ninh Bình - 25.10.2026
// Tối ưu hóa cho GitHub Pages & Chạy Offline

(function () {
  'use strict';

  // --- 1. LOCAL STORAGE & INITIAL DATA ---
  const STORAGE_KEY = 'muongthanh_golf_checkin_2026';
  
  function getStoredGolfers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    return window.INITIAL_GOLFERS || [];
  }

  let golfers = getStoredGolfers();
  let currentFilterShift = 'all';
  let currentFilterStatus = 'all';
  let currentFilterSize = 'all';
  let currentSearchQuery = '';
  let activeGolferId = null;

  // --- 2. VIETNAMESE ACCENT REMOVER FOR FUZZY SEARCH ---
  function removeVietnameseTones(str) {
    if (!str) return '';
    str = String(str).toLowerCase().trim();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/[\u0300-\u036f]/g, '');
    return str;
  }

  // --- 3. SAVE & SYNC ---
  function saveGolfers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(golfers));
    } catch (e) {
      console.error('Save to localStorage failed:', e);
    }
    
    // Attempt local python server sync if available (only on localhost/127.0.0.1)
    try {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(golfers)
        }).catch(() => {});
      }
    } catch (e) {}

    updateStats();
    renderList();
  }

  // --- 4. STATS CALCULATION ---
  function updateStats() {
    const total = golfers.length;
    const checkedInList = golfers.filter(g => g.checkedIn);
    const checkedIn = checkedInList.length;
    const remaining = total - checkedIn;
    const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    const sangTotal = golfers.filter(g => g.shift === 'Sáng').length;
    const sangChecked = golfers.filter(g => g.shift === 'Sáng' && g.checkedIn).length;

    const chieuTotal = golfers.filter(g => g.shift === 'Chiều').length;
    const chieuChecked = golfers.filter(g => g.shift === 'Chiều' && g.checkedIn).length;

    const vipTotal = golfers.filter(g => g.vip && g.vip.trim() !== '').length;
    const vipChecked = golfers.filter(g => g.vip && g.vip.trim() !== '' && g.checkedIn).length;

    // DOM Elements
    const elTotal = document.getElementById('stat-total');
    if (elTotal) elTotal.textContent = total;
    const elChecked = document.getElementById('stat-checked');
    if (elChecked) elChecked.textContent = `${checkedIn} (${pct}%)`;
    const elRemaining = document.getElementById('stat-remaining');
    if (elRemaining) elRemaining.textContent = remaining;
    const elSang = document.getElementById('stat-sang');
    if (elSang) elSang.textContent = `${sangChecked}/${sangTotal}`;
    const elChieu = document.getElementById('stat-chieu');
    if (elChieu) elChieu.textContent = `${chieuChecked}/${chieuTotal}`;
    const elVip = document.getElementById('stat-vip');
    if (elVip) elVip.textContent = `${vipChecked}/${vipTotal}`;
    const elProg = document.getElementById('stat-progress-bar');
    if (elProg) elProg.style.width = `${pct}%`;

    // Shirt inventory counters
    const sizeStats = { 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, 'Khác': 0 };
    const sizeChecked = { 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0, 'Khác': 0 };
    golfers.forEach(g => {
      const s = (g.size || '').toUpperCase().trim();
      const key = sizeStats[s] !== undefined ? s : 'Khác';
      sizeStats[key] = (sizeStats[key] || 0) + 1;
      if (g.checkedIn || g.receivedShirt) {
        sizeChecked[key] = (sizeChecked[key] || 0) + 1;
      }
    });

    const sizeContainer = document.getElementById('size-inventory-badges');
    if (sizeContainer) {
      sizeContainer.innerHTML = ['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
        const count = sizeStats[sz] || 0;
        const out = sizeChecked[sz] || 0;
        const left = count - out;
        return `
          <div class="bg-gray-800 text-white px-3 py-1.5 rounded-lg border border-gray-700 text-xs flex flex-col items-center">
            <span class="font-bold text-amber-400">Size ${sz}</span>
            <span class="text-gray-300">Đã phát: <strong class="text-green-400">${out}</strong>/${count}</span>
            <span class="text-xs text-gray-400">Còn: <strong class="${left <= 2 ? 'text-red-400 font-bold' : 'text-blue-300'}">${left}</strong></span>
          </div>
        `;
      }).join('');
    }
  }

  // --- 5. SEARCH & FILTER ---
  function getFilteredGolfers() {
    const qClean = removeVietnameseTones(currentSearchQuery);

    return golfers.filter(g => {
      // Shift filter
      if (currentFilterShift !== 'all' && g.shift !== currentFilterShift) {
        return false;
      }

      // Status filter
      if (currentFilterStatus === 'checkedIn' && !g.checkedIn) return false;
      if (currentFilterStatus === 'notCheckedIn' && g.checkedIn) return false;
      if (currentFilterStatus === 'vip' && (!g.vip || g.vip.trim() === '')) return false;

      // Size filter
      if (currentFilterSize !== 'all') {
        const s = (g.size || '').toUpperCase().trim();
        if (s !== currentFilterSize) return false;
      }

      // Search query
      if (!qClean) return true;

      const nameClean = removeVietnameseTones(g.name);
      const vgaClean = String(g.vga || '').toLowerCase();
      const phoneClean = String(g.phone || '').toLowerCase();
      const flightClean = String(g.flight || '').toLowerCase();
      const holeClean = removeVietnameseTones(g.hole);
      const orgClean = removeVietnameseTones(g.organization);
      const titleClean = removeVietnameseTones(g.title);
      const nickClean = removeVietnameseTones(g.vhandicapNickname);

      return (
        nameClean.includes(qClean) ||
        vgaClean.includes(qClean) ||
        phoneClean.includes(qClean) ||
        flightClean === qClean ||
        `flight ${flightClean}`.includes(qClean) ||
        holeClean.includes(qClean) ||
        `ho ${holeClean}`.includes(qClean) ||
        orgClean.includes(qClean) ||
        titleClean.includes(qClean) ||
        nickClean.includes(qClean)
      );
    });
  }

  // --- 6. RENDER GOLFER CARD ---
  function renderList() {
    const listEl = document.getElementById('golfer-list');
    if (!listEl) return;

    const filtered = getFilteredGolfers();
    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = `Hiển thị ${filtered.length} / ${golfers.length} golfer`;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div class="text-5xl mb-3">🔍</div>
          <h3 class="text-lg font-bold text-gray-700">Không tìm thấy golfer phù hợp</h3>
          <p class="text-sm text-gray-500 mt-1">Vui lòng kiểm tra lại họ tên, số VGA hoặc bộ lọc tìm kiếm.</p>
          <button onclick="window.clearSearch()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Xóa tìm kiếm & Xem tất cả
          </button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(g => {
      const isChecked = g.checkedIn;
      const sizeColor = getSizeColor(g.size);
      const teammatesHtml = (g.teammates && g.teammates.length > 0)
        ? `<div class="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
             <span class="text-gray-400 font-medium">Cùng Flight:</span>
             ${g.teammates.map(t => `<span class="bg-gray-100 px-2 py-0.5 rounded text-gray-700">${escapeHtml(t)}</span>`).join('')}
           </div>`
        : '';

      return `
        <div class="bg-white rounded-xl shadow-sm border ${isChecked ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'} p-4 transition-all duration-150 hover:shadow-md">
          <!-- TOP ROW: Name & Badges -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-full ${isChecked ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'} flex items-center justify-center text-lg font-bold shrink-0">
                ${isChecked ? '✓' : (g.gender === 'Bà' ? '👩' : '🏌️‍♂️')}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-lg font-bold text-gray-900">${escapeHtml(g.name)}</h3>
                  ${g.gender ? `<span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">${escapeHtml(g.gender)}</span>` : ''}
                  ${g.vip ? `<span class="text-xs px-2 py-0.5 rounded bg-amber-500 text-white font-bold flex items-center gap-1">⭐ ${escapeHtml(g.vip)}</span>` : ''}
                </div>
                <div class="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                  ${g.title ? `<span>${escapeHtml(g.title)}</span>` : ''}
                  ${g.title && g.organization ? `<span>•</span>` : ''}
                  ${g.organization ? `<span class="font-medium text-gray-700">${escapeHtml(g.organization)}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Check-in status badge -->
            <div class="shrink-0 flex items-center gap-2">
              ${isChecked ? `
                <div class="text-right">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    ĐÃ CHECK-IN
                  </span>
                  <div class="text-[11px] text-gray-500 mt-0.5 font-mono">${escapeHtml(g.checkInTime || '')}</div>
                </div>
              ` : `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  ⏳ Chưa check-in
                </span>
              `}
            </div>
          </div>

          <!-- HIGHLIGHT INFO GRID (VGA, SIZE, FLIGHT, HOLE, TIME) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
            <!-- VGA -->
            <div class="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-2.5 flex flex-col justify-between relative group">
              <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                <span>MÃ VGA</span>
                <button onclick="window.openEditModal('${g.id}')" title="Chỉnh sửa VGA" class="text-emerald-700 hover:text-emerald-900 bg-white p-1 rounded shadow-xs hover:bg-emerald-100 cursor-pointer">
                  ✏️
                </button>
              </div>
              <div class="text-lg font-black text-emerald-900 font-mono mt-0.5">
                ${g.vga ? escapeHtml(g.vga) : '<span class="text-red-500 font-normal italic text-xs">⚠️ Chưa có VGA</span>'}
              </div>
              ${g.vhandicapNickname ? `<div class="text-[10px] text-emerald-700 truncate mt-0.5">Nick: ${escapeHtml(g.vhandicapNickname)}</div>` : ''}
            </div>

            <!-- SIZE ÁO -->
            <div class="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 flex flex-col justify-between">
              <div class="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                <span>SIZE ÁO</span>
                <button onclick="window.openEditModal('${g.id}')" title="Đổi Size áo" class="text-amber-700 hover:text-amber-900 bg-white p-1 rounded shadow-xs hover:bg-amber-100 cursor-pointer">
                  ✏️
                </button>
              </div>
              <div class="text-lg font-black ${sizeColor} mt-0.5 flex items-center gap-1.5">
                <span>${g.size ? escapeHtml(g.size) : '<span class="text-gray-400 text-xs font-normal">Chưa chọn</span>'}</span>
                ${g.receivedShirt ? '<span class="text-xs bg-green-600 text-white px-1.5 py-0.2 rounded font-normal">Đã phát</span>' : ''}
              </div>
              <div class="text-[10px] text-amber-700 truncate mt-0.5">Áo giải & Door gift</div>
            </div>

            <!-- FLIGHT & HỐ (HOLE) -->
            <div class="bg-blue-50/80 border border-blue-200/80 rounded-lg p-2.5 flex flex-col justify-between">
              <div class="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
                FLIGHT & HỐ
              </div>
              <div class="text-base font-black text-blue-900 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span class="bg-blue-600 text-white px-2 py-0.5 rounded text-sm">Hố ${escapeHtml(g.hole || '--')}</span>
                <span class="text-xs text-blue-800 font-bold">F.${escapeHtml(g.flight || '--')}</span>
              </div>
              <div class="text-[10px] text-blue-700 truncate mt-0.5">Xuất phát đồng loạt</div>
            </div>

            <!-- CA & GIỜ ĐÁNH -->
            <div class="bg-purple-50/80 border border-purple-200/80 rounded-lg p-2.5 flex flex-col justify-between">
              <div class="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">
                GIỜ XUẤT PHÁT
              </div>
              <div class="text-base font-black text-purple-900 mt-0.5">
                ${g.shift === 'Sáng' ? '🌅 6h00 Sáng' : '☀️ 11h30 Trưa'}
              </div>
              <div class="text-[10px] text-purple-700 truncate mt-0.5">25/10 - Sân Tràng An</div>
            </div>
          </div>

          <!-- EXTRA INFO (SĐT, Phòng, Note) -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 py-1.5">
            ${g.phone ? `
              <div class="flex items-center gap-1">
                <span class="text-gray-400">📞 SĐT:</span>
                <a href="tel:${escapeHtml(g.phone)}" class="text-blue-600 font-semibold hover:underline">${escapeHtml(g.phone)}</a>
              </div>
            ` : ''}
            ${g.room ? `
              <div class="flex items-center gap-1">
                <span class="text-gray-400">🏨 Phòng:</span>
                <span class="font-medium text-gray-800">${escapeHtml(g.room)}</span>
              </div>
            ` : ''}
            ${g.pic ? `
              <div class="flex items-center gap-1">
                <span class="text-gray-400">👤 PIC:</span>
                <span class="font-medium text-gray-800">${escapeHtml(g.pic)}</span>
              </div>
            ` : ''}
            ${g.note ? `
              <div class="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                <span class="font-bold">📝 Note:</span>
                <span>${escapeHtml(g.note)}</span>
              </div>
            ` : ''}
          </div>

          <!-- TEAMMATES IN FLIGHT -->
          ${teammatesHtml}

          <!-- ACTIONS BAR -->
          <div class="mt-3.5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <!-- Fast checklist pills -->
            <div class="flex items-center gap-2 flex-wrap text-xs">
              <label class="inline-flex items-center gap-1 cursor-pointer select-none">
                <input type="checkbox" ${g.receivedShirt ? 'checked' : ''} onchange="window.toggleGift('${g.id}', 'receivedShirt', this.checked)" class="rounded text-emerald-600 focus:ring-emerald-500">
                <span class="${g.receivedShirt ? 'text-emerald-700 font-semibold' : 'text-gray-500'}">Áo đấu</span>
              </label>
              <label class="inline-flex items-center gap-1 cursor-pointer select-none">
                <input type="checkbox" ${g.receivedDoorGift ? 'checked' : ''} onchange="window.toggleGift('${g.id}', 'receivedDoorGift', this.checked)" class="rounded text-emerald-600 focus:ring-emerald-500">
                <span class="${g.receivedDoorGift ? 'text-emerald-700 font-semibold' : 'text-gray-500'}">Door Gift</span>
              </label>
              <label class="inline-flex items-center gap-1 cursor-pointer select-none">
                <input type="checkbox" ${g.receivedCoupon ? 'checked' : ''} onchange="window.toggleGift('${g.id}', 'receivedCoupon', this.checked)" class="rounded text-emerald-600 focus:ring-emerald-500">
                <span class="${g.receivedCoupon ? 'text-emerald-700 font-semibold' : 'text-gray-500'}">Coupon ăn</span>
              </label>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2 ml-auto">
              <button onclick="window.openEditModal('${g.id}')" class="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1 cursor-pointer">
                ✏️ Sửa VGA / Info
              </button>

              ${isChecked ? `
                <button onclick="window.undoCheckIn('${g.id}')" class="px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg text-xs font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer">
                  ↩️ Hủy Check-in
                </button>
              ` : `
                <button onclick="window.confirmCheckIn('${g.id}')" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer">
                  ✅ XÁC NHẬN CHECK-IN
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getSizeColor(size) {
    switch ((size || '').toUpperCase().trim()) {
      case 'S': return 'text-purple-700';
      case 'M': return 'text-blue-700';
      case 'L': return 'text-emerald-700';
      case 'XL': return 'text-orange-700';
      case 'XXL': return 'text-red-700';
      default: return 'text-gray-700';
    }
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- 7. CHECK-IN WORKFLOW ---
  window.confirmCheckIn = function (id) {
    const golfer = golfers.find(g => g.id === id);
    if (!golfer) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

    golfer.checkedIn = true;
    golfer.checkInTime = timeStr;
    golfer.receivedShirt = true;
    golfer.receivedDoorGift = true;
    golfer.receivedCoupon = true;

    saveGolfers();
    showToast(`✅ Đã check-in thành công cho: ${golfer.name}!`);
  };

  window.undoCheckIn = function (id) {
    const golfer = golfers.find(g => g.id === id);
    if (!golfer) return;

    if (confirm(`Bạn có chắc muốn hủy trạng thái check-in của ${golfer.name}?`)) {
      golfer.checkedIn = false;
      golfer.checkInTime = null;
      golfer.receivedShirt = false;
      golfer.receivedDoorGift = false;
      golfer.receivedCoupon = false;

      saveGolfers();
      showToast(`Đã hoàn tác check-in của: ${golfer.name}`);
    }
  };

  window.toggleGift = function (id, field, value) {
    const golfer = golfers.find(g => g.id === id);
    if (!golfer) return;
    golfer[field] = value;
    saveGolfers();
  };

  // --- 8. EDIT MODAL (VGA, SIZE, NOTE, ETC.) ---
  window.openEditModal = function (id) {
    activeGolferId = id;
    const golfer = golfers.find(g => g.id === id);
    if (!golfer) return;

    document.getElementById('edit-modal-name').textContent = golfer.name;
    document.getElementById('edit-vga').value = golfer.vga || '';
    document.getElementById('edit-size').value = (golfer.size || '').toUpperCase();
    document.getElementById('edit-flight').value = golfer.flight || '';
    document.getElementById('edit-hole').value = golfer.hole || '';
    document.getElementById('edit-phone').value = golfer.phone || '';
    document.getElementById('edit-room').value = golfer.room || '';
    document.getElementById('edit-note').value = golfer.note || '';

    const modal = document.getElementById('edit-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('edit-vga').focus(), 100);
  };

  window.closeEditModal = function () {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    activeGolferId = null;
  };

  window.saveEditModal = function () {
    if (!activeGolferId) return;
    const golfer = golfers.find(g => g.id === activeGolferId);
    if (!golfer) return;

    const newVGA = document.getElementById('edit-vga').value.trim();
    const newSize = document.getElementById('edit-size').value.trim();
    const newFlight = document.getElementById('edit-flight').value.trim();
    const newHole = document.getElementById('edit-hole').value.trim();
    const newPhone = document.getElementById('edit-phone').value.trim();
    const newRoom = document.getElementById('edit-room').value.trim();
    const newNote = document.getElementById('edit-note').value.trim();

    golfer.vga = newVGA;
    golfer.size = newSize;
    golfer.flight = newFlight;
    golfer.hole = newHole;
    golfer.phone = newPhone;
    golfer.room = newRoom;
    golfer.note = newNote;

    saveGolfers();
    window.closeEditModal();
    showToast(`Đã cập nhật thông tin golfer ${golfer.name}!`);
  };

  // --- 9. EXCEL EXPORT (USING SHEETJS) ---
  window.exportToExcel = function () {
    if (typeof XLSX === 'undefined') {
      alert('Thư viện Excel đang tải, vui lòng thử lại sau vài giây.');
      return;
    }

    // 1. Data Sheet
    const exportRows = golfers.map((g, index) => ({
      'STT': index + 1,
      'Trạng thái': g.checkedIn ? 'Đã Check-in' : 'Chưa Check-in',
      'Giờ Check-in': g.checkInTime || '',
      'Họ và tên': g.name,
      'Danh xưng': g.gender || '',
      'Mã VGA': g.vga || '',
      'Size áo': g.size || '',
      'Ca thi đấu': g.shift || '',
      'Hố xuất phát': g.hole || '',
      'Flight': g.flight || '',
      'Giờ xuất phát': g.teeTime || '',
      'Chức vụ': g.title || '',
      'Đơn vị': g.organization || '',
      'Số điện thoại': g.phone || '',
      'Phòng': g.room || '',
      'VIP': g.vip || '',
      'Đã nhận áo': g.receivedShirt ? 'X' : '',
      'Đã nhận Door gift': g.receivedDoorGift ? 'X' : '',
      'Đã nhận Coupon': g.receivedCoupon ? 'X' : '',
      'Ghi chú': g.note || '',
      'PIC': g.pic || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'DS_Checkin');

    const now = new Date();
    const fname = `Ket_qua_Checkin_Golf_MuongThanh_2026_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.xlsx`;
    XLSX.writeFile(wb, fname);
    showToast(`Đã xuất file: ${fname}`);
  };

  // --- 10. BACKUP & RESTORE JSON ---
  window.exportBackupJSON = function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(golfers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `golfers_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã tải file sao lưu JSON!');
  };

  window.importBackupJSON = function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          golfers = imported;
          saveGolfers();
          showToast(`Đã khôi phục thành công ${imported.length} golfer!`);
        } else {
          alert('File JSON không hợp lệ hoặc danh sách rỗng!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- 11. RESET DATA TO ORIGINAL ---
  window.resetData = function () {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ lịch sử check-in và đưa dữ liệu về ban đầu từ ban tổ chức?')) {
      localStorage.removeItem(STORAGE_KEY);
      golfers = JSON.parse(JSON.stringify(window.INITIAL_GOLFERS || []));
      saveGolfers();
      showToast('Đã khôi phục dữ liệu gốc!');
    }
  };

  // --- 12. TOAST NOTIFICATION ---
  function showToast(msg) {
    let toast = document.getElementById('toast-box');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-box';
      toast.className = 'fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform duration-200 border border-gray-700 text-sm font-medium';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'flex';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => { toast.style.display = 'none'; }, 200);
    }, 2800);
  }

  // --- 13. EVENT LISTENERS & FILTER CLICKS ---
  window.clearSearch = function () {
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    currentSearchQuery = '';
    renderList();
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        renderList();
      });
    }

    // Keyboard shortcut /
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') {
        window.closeEditModal();
      }
    });

    // Filter Shift buttons
    document.querySelectorAll('[data-filter-shift]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-shift]').forEach(b => b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm'));
        document.querySelectorAll('[data-filter-shift]').forEach(b => b.classList.add('bg-white', 'text-gray-700'));
        btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-gray-700');
        currentFilterShift = btn.getAttribute('data-filter-shift');
        renderList();
      });
    });

    // Filter Status buttons
    document.querySelectorAll('[data-filter-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.remove('bg-gray-900', 'text-white'));
        document.querySelectorAll('[data-filter-status]').forEach(b => b.classList.add('bg-gray-100', 'text-gray-600'));
        btn.classList.add('bg-gray-900', 'text-white');
        btn.classList.remove('bg-gray-100', 'text-gray-600');
        currentFilterStatus = btn.getAttribute('data-filter-status');
        renderList();
      });
    });

    // Initial render
    updateStats();
    renderList();
  });

})();
