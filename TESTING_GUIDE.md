# MentorGuru Chat System - Quick Testing Guide

## Pre-Testing Setup

### 1. Clear Browser Data (Optional but Recommended)
1. Open DevTools (F12)
2. Right-click in console → "Clear Console"
3. Go to Application tab → LocalStorage
4. Delete all entries (optional - to start fresh)

### 2. Verify Files Exist
- ✅ `chat.html` - New messaging center
- ✅ `admin.html` - Updated with form fixes
- ✅ `student.html` - Updated with chat link
- ✅ `mentor.html` - Updated with chat link

---

## Test 1: Mentor Account Creation

### Steps:
1. Open `admin.html` in browser
2. Click "Admin Desk" → Enter admin credentials
3. Navigate to "Mentors Desk"
4. Click "Add New Mentor"
5. Fill in form:
   - **Mentor ID**: `MNT001`
   - **Password**: `mentor123`
   - **Full Name**: `Dr. Priya Sharma`
   - **Email**: `priya@mentorguru.com`
   - **Phone**: `9841234567`
6. Click "Save Account"

### Expected Results:
- ✅ Form submits without errors
- ✅ Confirmation modal shows created credentials
- ✅ Mentor appears in mentors list
- ✅ No console errors

### Troubleshooting:
- If form doesn't submit: Check browser console (F12) for errors
- If error mentions "form control": Data issue - try refreshing page
- If duplicate ID error: MNT001 already exists - use MNT002

---

## Test 2: Student Account Creation

### Steps:
1. In `admin.html` admin panel
2. Navigate to "Students Desk"
3. Click "Add New Student"
4. Fill in form:
   - **Student ID**: `STU001`
   - **Password**: `student123`
   - **Full Name**: `Raj Kumar`
   - **Email**: `raj@student.com`
   - **Phone**: `9847654321`
5. Click "Save Account"

### Expected Results:
- ✅ Form submits successfully
- ✅ Confirmation shows credentials
- ✅ Student appears in students list
- ✅ Student can be selected for group chats

### Troubleshooting:
- Same as mentor creation test

---

## Test 3: Chat System - Mentor Group Creation

### Steps:
1. Open `mentor.html` in **new tab/window** (keep admin open)
2. Enter login credentials:
   - **Mentor ID**: `MNT001`
   - **Password**: `mentor123`
3. Click "Messages" button in sidebar
4. Click "Go to Messaging Center" link
5. Should redirect to `chat.html`
6. Click "New Group Chat" button (purple, top right)
7. Enter group name: `"Cybersecurity 101 - Batch A"`
8. Select student `STU001` (checkbox)
9. Click "Create Group Chat"

### Expected Results:
- ✅ Chat.html loads successfully
- ✅ Group creation modal appears
- ✅ Student appears in checklist
- ✅ Group chat is created
- ✅ New chat appears in left sidebar
- ✅ Chat is selected and ready for messages

### Troubleshooting:
- If no students appear: Check if students were created
- If modal doesn't open: Check console for JavaScript errors
- If chat doesn't appear: Refresh page manually

---

## Test 4: Sending Text Messages

### Steps (Mentor):
1. With group chat selected from Test 3
2. Click message input field
3. Type: `"Welcome to Cybersecurity 101! 🎓"`
4. Press Enter or click send button
5. Message should appear immediately

### Expected Results:
- ✅ Message appears in chat window
- ✅ Sender name shows as "Dr. Priya Sharma"
- ✅ Timestamp displays
- ✅ Message styling is correct (right-aligned for sender)

### Continue Testing (Student):
1. Open `student.html` in **new tab** (keep mentor tab open)
2. Login with:
   - **Student ID**: `STU001`
   - **Password**: `student123`
3. Click "Messages" → "Go to Messaging Center"
4. Should see "Cybersecurity 101 - Batch A" in chat list
5. Click on chat to open
6. Scroll to see mentor's message
7. Type student reply: `"Thank you for this course!"`
8. Send message

### Expected Results:
- ✅ Student sees mentor message
- ✅ Student can send reply
- ✅ Messages appear in correct order
- ✅ Both user names display correctly

---

## Test 5: Real-Time Message Updates

### Steps:
1. Keep both mentor and student tabs open
2. In **mentor tab**: Send message `"Can everyone see this?"`
3. Switch to **student tab** within 2 seconds
4. **Student** should see new message appear automatically

### Expected Results:
- ✅ Message appears within 2 seconds (1-second polling)
- ✅ No manual refresh needed
- ✅ Unread count shows `1` on student side

### Troubleshooting:
- If message doesn't appear: Try refreshing student tab
- If taking too long: Check browser console for errors
- Polling should be visible: F12 → Console (watch for repeated calls)

---

## Test 6: File/Image Sharing

### Steps (Mentor):
1. In chat with group
2. Click attachment button (📎 paperclip icon)
3. Select an image or document file
4. File preview should show
5. Type optional message: `"Here's the course material"`
6. Press Enter to send

### Expected Results:
- ✅ File picker opens
- ✅ File preview shows in message area
- ✅ Message sends with file
- ✅ File displays in message with download link
- ✅ File name visible below message

### Student Receives:
1. In student tab, message with attachment should appear
2. Click download link
3. File should download to computer

### Expected Results:
- ✅ File message appears within 2 seconds
- ✅ File preview shows correctly
- ✅ Download link works
- ✅ File is original file

### Troubleshooting:
- If file upload fails: File might be too large (try <5MB)
- If download fails: Check browser download settings
- If preview doesn't show: Browser might need refresh

---

## Test 7: Unread Message Tracking

### Steps:
1. Keep mentor and student tabs open
2. In **mentor tab**: Send message `"Important announcement!"`
3. Check **student tab**: Should show red badge with count
4. Badge should show `1` (indicating 1 unread message)
5. Click on chat to open it
6. Badge should disappear

### Expected Results:
- ✅ Unread badge appears in chat list
- ✅ Badge shows correct count
- ✅ Badge disappears when chat is opened
- ✅ Mark as read happens automatically

### Troubleshooting:
- If badge doesn't appear: Try refreshing student tab
- If count incorrect: Check that all messages loaded properly

---

## Test 8: Chat Search

### Steps:
1. In chat.html
2. Click search box at top of chat list
3. Start typing: `"Cyber"`
4. List should filter

### Expected Results:
- ✅ Search filters chats by name
- ✅ "Cybersecurity 101 - Batch A" appears
- ✅ Typing more refines results
- ✅ Clear search shows all chats

---

## Test 9: Chat Info Panel

### Steps (Mentor):
1. Open a group chat
2. Click chat info button (ℹ️ icon or gear)
3. Right panel should slide in

### Expected Results:
- ✅ Panel shows group name
- ✅ Shows all member names
- ✅ Shows "Created by" information
- ✅ Delete group button visible
- ✅ Panel closes when clicking outside

### Student View:
- Same steps but delete button should NOT be visible

### Expected Results:
- ✅ Student sees members list
- ✅ No delete/edit options for student
- ✅ Panel shows read-only info

---

## Test 10: Multi-Student Group Chat

### Steps:
1. Create another student in admin:
   - **Student ID**: `STU002`
   - **Password**: `student456`
   - **Name**: `Priya Singh`

2. Back in mentor chat, click "New Group Chat"
3. Enter: `"Advanced Topics"`
4. Select BOTH `STU001` and `STU002`
5. Create group

6. Send message: `"Welcome both of you!"`

7. Open `student.html` in new tab, login as `STU002`
8. Go to Messages
9. Should see "Advanced Topics" chat
10. Send message: `"Thanks for including me!"`

### Expected Results:
- ✅ Both students see mentor message
- ✅ Both students can send replies
- ✅ Mentor sees both students' messages
- ✅ Chat works with 3+ people

---

## Test 11: Message Persistence

### Steps:
1. Create messages in group chat (at least 3)
2. **Completely close browser tab** with chat
3. Open `chat.html` in new tab
4. Login with same account
5. Open same group chat

### Expected Results:
- ✅ All messages are still there
- ✅ Message order is correct
- ✅ Timestamps are correct
- ✅ Sender names are preserved

### Test Logout/Login:
1. In chat, note the messages visible
2. Close tab
3. Open `student.html` again
4. Login with same credentials
5. Go to Messages again

### Expected Results:
- ✅ Same messages visible
- ✅ Full history preserved
- ✅ No data loss on logout

---

## Test 12: Announcement Messages

### Steps (Mentor):
1. In group chat
2. Scroll down to message area
3. Look for "Announcement" button (should be visible)
4. Click to send announcement-type message
5. Type: `"IMPORTANT: Classes moved to 10 AM"`
6. Send

### Expected Results:
- ✅ Message appears with special styling (📢 icon or highlight)
- ✅ Different appearance from regular messages
- ✅ Student receives announcement-styled message

### Troubleshooting:
- If announcement button missing: UI needs adjustment (check HTML)
- If styling incorrect: CSS needs tweaking

---

## Complete System Validation Checklist

### Admin Functions
- [ ] Mentor account creation works
- [ ] Student account creation works
- [ ] Form validation prevents invalid data
- [ ] No console errors on any admin action

### Mentor Functions
- [ ] Can login with created MNT credentials
- [ ] Can navigate to chat.html
- [ ] Can create group chats
- [ ] Can send text messages
- [ ] Can upload files
- [ ] Can upload images
- [ ] Can send announcements
- [ ] Can see all group members
- [ ] Can delete groups
- [ ] Can search chats

### Student Functions
- [ ] Can login with created STU credentials
- [ ] Can navigate to chat.html
- [ ] Can see assigned group chats
- [ ] Can send text messages
- [ ] Can upload files
- [ ] Can upload images
- [ ] Can download shared files
- [ ] Can see message history
- [ ] Can search chats
- [ ] See unread badges

### System Functions
- [ ] Real-time message updates work (within 2 seconds)
- [ ] Message history persists after logout
- [ ] Multiple users can chat simultaneously
- [ ] Group chats work with 3+ participants
- [ ] Unread count is accurate
- [ ] No data loss on page refresh
- [ ] No console errors during usage

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Form won't submit | Refresh page, check all required fields filled |
| Chat.html blank | Login first, check mentorGuru_currentUser in localStorage |
| No students in selector | Create students first in admin panel |
| Messages not appearing | Wait 2 seconds, refresh page |
| File upload fails | Try smaller file, check localStorage quota |
| Unread count wrong | Close and reopen chat, logout/login |
| Can't see other user's messages | Ensure both accounts created, check console for errors |

---

## Browser DevTools Commands

### Check Current User
```javascript
JSON.parse(localStorage.getItem('mentorGuru_currentUser'))
```

### View All Chats
```javascript
JSON.parse(localStorage.getItem('mentorGuru_chats'))
```

### View Messages in Specific Chat
```javascript
JSON.parse(localStorage.getItem('chat_<chatId>'))
```

### View All Students
```javascript
JSON.parse(localStorage.getItem('mentorGuru_students'))
```

### View All Mentors
```javascript
JSON.parse(localStorage.getItem('mentorGuru_mentors'))
```

### Clear All Data (WARNING: LOSES ALL DATA)
```javascript
localStorage.clear()
```

---

## Performance Notes

- **First Chat Load**: ~500ms
- **Message Send**: ~100ms
- **Message Receive (polling)**: 1-2 seconds
- **File Upload**: Depends on file size
- **Search**: Real-time (<100ms)
- **localStorage Quota**: ~5-10MB (enough for ~1000 messages)

---

**Testing Duration**: 30-45 minutes for complete validation  
**Next Steps**: Once all tests pass, system is production-ready  
**Issues Found**: Report with screenshots and console errors
