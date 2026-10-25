import openpyxl, json, os, shutil, sys
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8')

# =========================================================
# Script cập nhật danh sách Flight từ file Excel mới nhất
# File Excel: có 3 sheet: 'Tee 11h00', 'Tee 5h30', 'DS- Title'
# =========================================================

EXCEL_FILE = r'C:/Users/ntlon/.gemini/antigravity/brain/21d18f93-5330-444a-8cbb-52acc42d7ad6/.user_uploaded/media_1792886510801_ffe37bfa.xlsx'
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Backup golfers.json cũ
golfers_json = os.path.join(APP_DIR, 'golfers.json')
if os.path.exists(golfers_json):
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    shutil.copy(golfers_json, os.path.join(APP_DIR, f'golfers_backup_{ts}.json'))
    print(f'[OK] Da backup golfers.json -> golfers_backup_{ts}.json')

# Load dữ liệu cũ để giữ lại: SĐT, phòng, size áo, trạng thái check-in, v.v.
old_lookup = {}
if os.path.exists(golfers_json):
    with open(golfers_json, 'r', encoding='utf-8') as f:
        old_data = json.load(f)
    for g in old_data:
        old_lookup[g['name'].lower().strip()] = g
    print(f'[OK] Da load {len(old_data)} golfer cu de giu lai thong tin')

# Load Excel mới
wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
print(f'[OK] Da mo file Excel. Sheets: {wb.sheetnames}')

def clean_num(val):
    if val is None:
        return ''
    s = str(val).strip()
    if s.endswith('.0'):
        s = s[:-2]
    if s == 'None' or s == '0':
        return ''
    return s

golfers = []
flight_groups = {}

# =========================================================
# 1. Parse Ca Sáng - sheet "Tee 5h30"
#    Cột: A(skip), B=Flight, C=Holes, D=Name, E=VGA,
#         F=HDC index, G=Course HDC, H=Division, I=Nickname
# =========================================================
if 'Tee 5h30' in wb.sheetnames:
    ws = wb['Tee 5h30']
    cur_fl = ''
    cur_hl = ''
    count = 0
    for r in range(4, 200):  # Bắt đầu từ row 4 (bỏ header)
        b = ws.cell(r, 2).value  # Flight
        c = ws.cell(r, 3).value  # Holes
        d = ws.cell(r, 4).value  # Name

        if b is not None and str(b).strip() not in ['', 'Flight']:
            cur_fl = clean_num(b)
        if c is not None and str(c).strip() not in ['', 'Holes']:
            cur_hl = str(c).strip()

        if not d:
            continue
        name = str(d).strip()
        if name.lower() in ['goler name', 'họ và tên', 'tên', 'none', 'họ tên']:
            continue

        vga   = clean_num(ws.cell(r, 5).value)
        hdc   = clean_num(ws.cell(r, 6).value)
        chdc  = clean_num(ws.cell(r, 7).value)
        div   = str(ws.cell(r, 8).value or '').strip()
        nick  = str(ws.cell(r, 9).value or '').strip()

        old = old_lookup.get(name.lower(), {})
        g = {
            'id': f'g-sang-{r}',
            'stt': len(golfers) + 1,
            'name': name,
            'gender': old.get('gender', 'Ông'),
            'shift': 'Sáng',
            'teeTime': '6h00 ngày 25/10/2026',
            'flight': cur_fl,
            'hole': cur_hl,
            'vga': vga or old.get('vga', ''),
            'size': old.get('size', ''),
            'title': old.get('title', ''),
            'organization': old.get('organization', ''),
            'phone': old.get('phone', ''),
            'room': old.get('room', ''),
            'vip': old.get('vip', ''),
            'pic': old.get('pic', ''),
            'note': old.get('note', ''),
            'status': old.get('status', 'Confirm'),
            'handicapIndex': hdc or old.get('handicapIndex', ''),
            'courseHandicap': chdc or old.get('courseHandicap', ''),
            'division': div or old.get('division', ''),
            'vhandicapNickname': nick or old.get('vhandicapNickname', ''),
            'checkedIn': old.get('checkedIn', False),
            'checkInTime': old.get('checkInTime', None),
            'receivedShirt': old.get('receivedShirt', False),
            'receivedDoorGift': old.get('receivedDoorGift', False),
            'receivedCoupon': old.get('receivedCoupon', False),
            'teammates': []
        }
        golfers.append(g)
        k = ('Sáng', cur_fl)
        if k not in flight_groups:
            flight_groups[k] = []
        flight_groups[k].append(name)
        count += 1

    print(f'[OK] Ca Sang (Tee 5h30): {count} golfer')
else:
    print('[WARN] Khong tim thay sheet "Tee 5h30"')

# =========================================================
# 2. Parse Ca Chiều - sheet "Tee 11h00"
#    Cột: A=STT, B=Flight, C=Holes, D=Gender, E=Name, F=VGA,
#         G=Title, H=HDC index, I=Course HDC, J=Division,
#         K=Nickname, L=Note
# =========================================================
if 'Tee 11h00' in wb.sheetnames:
    ws = wb['Tee 11h00']
    cur_fl = ''
    cur_hl = ''
    count = 0
    for r in range(5, 300):  # Bắt đầu từ row 5
        b = ws.cell(r, 2).value  # Flight
        c = ws.cell(r, 3).value  # Holes
        d = ws.cell(r, 4).value  # Gender
        e = ws.cell(r, 5).value  # Name

        if b is not None and str(b).strip() not in ['', 'Flight']:
            cur_fl = clean_num(b)
        if c is not None and str(c).strip() not in ['', 'Holes']:
            cur_hl = str(c).strip()

        if not e:
            continue
        name = str(e).strip()
        if name.lower() in ['goler name', 'họ và tên', 'tên', 'none', 'họ tên']:
            continue

        gender = str(d or '').strip()
        vga    = clean_num(ws.cell(r, 6).value)
        title  = str(ws.cell(r, 7).value or '').strip()
        if title == '0':
            title = ''
        hdc    = clean_num(ws.cell(r, 8).value)
        chdc   = clean_num(ws.cell(r, 9).value)
        div    = str(ws.cell(r, 10).value or '').strip()
        nick   = str(ws.cell(r, 11).value or '').strip()
        note_f = str(ws.cell(r, 12).value or '').strip()

        old = old_lookup.get(name.lower(), {})
        # Gộp note cũ + note từ flight (nếu khác nhau)
        old_note = old.get('note', '')
        full_note = old_note
        if note_f and note_f not in full_note:
            full_note = (full_note + ' | ' + note_f).strip(' | ')

        g = {
            'id': f'g-chieu-{r}',
            'stt': len(golfers) + 1,
            'name': name,
            'gender': gender or old.get('gender', 'Ông'),
            'shift': 'Chiều',
            'teeTime': '11h30 ngày 25/10/2026',
            'flight': cur_fl,
            'hole': cur_hl,
            'vga': vga or old.get('vga', ''),
            'size': old.get('size', ''),
            'title': title or old.get('title', ''),
            'organization': old.get('organization', ''),
            'phone': old.get('phone', ''),
            'room': old.get('room', ''),
            'vip': old.get('vip', ''),
            'pic': old.get('pic', ''),
            'note': full_note,
            'status': old.get('status', 'Confirm'),
            'handicapIndex': hdc or old.get('handicapIndex', ''),
            'courseHandicap': chdc or old.get('courseHandicap', ''),
            'division': div or old.get('division', ''),
            'vhandicapNickname': nick or old.get('vhandicapNickname', ''),
            'checkedIn': old.get('checkedIn', False),
            'checkInTime': old.get('checkInTime', None),
            'receivedShirt': old.get('receivedShirt', False),
            'receivedDoorGift': old.get('receivedDoorGift', False),
            'receivedCoupon': old.get('receivedCoupon', False),
            'teammates': []
        }
        golfers.append(g)
        k = ('Chiều', cur_fl)
        if k not in flight_groups:
            flight_groups[k] = []
        flight_groups[k].append(name)
        count += 1

    print(f'[OK] Ca Chieu (Tee 11h00): {count} golfer')
else:
    print('[WARN] Khong tim thay sheet "Tee 11h00"')

# =========================================================
# 3. Cập nhật danh sách bạn cùng flight (teammates)
# =========================================================
for g in golfers:
    k = (g['shift'], g['flight'])
    if k in flight_groups:
        g['teammates'] = [m for m in flight_groups[k] if m != g['name']]

# =========================================================
# 4. Lưu golfers.json và data.js
# =========================================================
with open(golfers_json, 'w', encoding='utf-8') as f:
    json.dump(golfers, f, ensure_ascii=False, indent=2)
print(f'[OK] Da luu golfers.json ({len(golfers)} golfer)')

data_js = os.path.join(APP_DIR, 'data.js')
with open(data_js, 'w', encoding='utf-8') as f:
    f.write('window.INITIAL_GOLFERS = ' + json.dumps(golfers, ensure_ascii=False, indent=2) + ';\n')
print(f'[OK] Da luu data.js')

# =========================================================
# 5. Tóm tắt kết quả
# =========================================================
sang_count  = sum(1 for g in golfers if g['shift'] == 'Sáng')
chieu_count = sum(1 for g in golfers if g['shift'] == 'Chiều')
print(f'\n===== KET QUA =====')
print(f'Tong: {len(golfers)} golfer')
print(f'Ca Sang (6h00): {sang_count} nguoi')
print(f'Ca Chieu (11h30): {chieu_count} nguoi')

# Thống kê theo flight
print(f'\nCa Sang - Flights:')
for k, v in sorted(flight_groups.items()):
    if k[0] == 'Sáng':
        print(f'  Flight {k[1]}: {len(v)} nguoi')
print(f'\nCa Chieu - Flights:')
for k, v in sorted(flight_groups.items()):
    if k[0] == 'Chiều':
        print(f'  Flight {k[1]}: {len(v)} nguoi')
