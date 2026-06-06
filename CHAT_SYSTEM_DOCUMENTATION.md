# MentorGuru Chat & Messaging System Documentation

## Overview
The MentorGuru platform now includes a comprehensive real-time messaging system enabling seamless communication between mentors and students. The system supports direct messaging, group chats, file sharing, and announcements.

---

## System Architecture

### Components

#### 1. **chat.html** - Messaging Center (New File)
- Primary interface for mentors and students to engage in conversations
- Location: `/chat.html`
- Features:
  - Real-time message display with 1-second polling
  - Group chat creation and management (Mentor only)
  - Direct messaging support
  - File and image sharing
  - Message history persistence
  - Unread message tracking
  - Chat information panel
  - Typing indicators (UI ready)

#### 2. **admin.html** - System Messages Panel (Existing)
- Built-in admin dashboard messaging interface (lines 524-605)
- Features:
  - System-wide messaging
  - Admin communication hub
  - Contact list management
  - File attachment support

#### 3. **student.html** - Student Portal Link (Updated)
- Added chat navigation button
- Redirects to `chat.html` via link
- New view: `sview-chat` (lines 1003-1017)

#### 4. **mentor.html** - Mentor Portal Link (Updated)
- Added chat navigation button  
- Redirects to `chat.html` via link
- New view: `mview-chat` (lines 408-420)

---

## Data Storage

### LocalStorage Keys

| Key | Description | Structure |
|-----|-------------|-----------|
| `mentorGuru_chats` | All chat conversations | Array of chat objects |
| `mentorGuru_messages` | Message data (legacy) | Object with message arrays |
| `chat_{chatId}` | Individual chat messages | Array of message objects |
| `mentorGuru_currentUser` | Current logged-in user | User object |
| `mentorGuru_students` | Student database | Array of student objects |
| `mentorGuru_mentors` | Mentor database | Array of mentor objects |

### Chat Object Structure
```javascript
{
  id: 1717538400000,                    // Timestamp-based unique ID
  name: "Cybersecurity 101 - Batch A",  // Chat name
  isGroupChat: true,                     // Boolean flag
  createdBy: "MNT001",                   // Mentor's login ID
  createdByName: "Dr. Priya Sharma",    // Mentor's full name
  participants: ["MNT001", "STU001", "STU002"], // All participants
  createdAt: "2026-06-05T...",          // ISO timestamp
  lastMessage: "Welcome to the group!",  // Preview text
  unreadBy: {                            // Unread counts per user
    "STU001": 0,
    "STU002": 3
  }
}
```

### Message Object Structure
```javascript
{
  id: 1717538400000,              // Unique message ID
  chatId: 1717538400000,          // Reference to chat
  senderId: "MNT001",             // Sender's login ID
  senderName: "Dr. Priya Sharma", // Sender's display name
  type: "text",                    // "text" | "image" | "file" | "announcement"
  content: "Hello students!",      // Message content or base64 data
  fileName: null,                  // For file/image types
  timestamp: "2026-06-05T...",    // ISO timestamp
  read: false                      // Read status
}
```

---

## Features

### 1. Real-Time Messaging
- **Message Polling**: 1-second automatic refresh
- **Delivery Confirmation**: Messages persist immediately to localStorage
- **Read Receipts**: Tracked per user per chat
- **Message History**: Full persistent history maintained

### 2. Group Chat Management (Mentor Only)
- **Create Group**: Select students, set group name
- **Member Management**: Add/remove students (future enhancement)
- **Edit Group**: Modify group details (future enhancement)
- **Delete Group**: Remove entire conversation (mentor only)
- **Member Listing**: View all participants in chat info panel

### 3. File & Media Sharing
- **Image Upload**: Embed images in conversations with base64 encoding
- **File Upload**: Share documents, PDFs, archives with preview
- **Download Support**: Direct download link in message
- **File Preview**: Visual representation in message list

### 4. Message Types
| Type | Icon | Use Case | Storage |
|------|------|----------|---------|
| Text | 💬 | Regular messages | String content |
| Image | 🖼️ | Shared images | Base64 encoded |
| File | 📄 | Documents, PDFs | Base64 + filename |
| Announcement | 📢 | System/mentor announcements | Special styling |

### 5. Chat Navigation
- **Search**: Filter chats by name in real-time
- **Sidebar**: Quick access to all conversations
- **Unread Badges**: Visual indicator of new messages
- **Chat Info Panel**: Detailed member/settings view (toggleable)

---

## User Workflows

### Mentor Workflow
1. **Login** → `mentor.html`
2. **Navigate** to "Messages" (sidebar button)
3. **Click** "Go to Messaging Center" link
4. **Redirected** to `chat.html`
5. **Create** new group chat:
   - Click "New Group Chat" button
   - Enter group name
   - Select students (checkboxes)
   - Click "Create"
6. **Send Messages**:
   - Type message
   - Optional: Attach file/image
   - Press Enter or click send button
7. **Share Resources**: Use file/image buttons
8. **Make Announcements**: Group-wide notifications
9. **Manage Groups**: Edit name, members, or delete

### Student Workflow
1. **Login** → `student.html`
2. **Navigate** to "Messages" (sidebar button)
3. **Click** "Go to Messaging Center" link
4. **Redirected** to `chat.html`
5. **Join Groups**: Auto-enrolled in mentor-created groups
6. **Participate**: Send messages, share files
7. **View History**: Scroll through conversation history
8. **Search**: Find specific conversations

### Admin Workflow
1. **Login** → `admin.html`
2. **Navigate** to "Chat" (sidebar: "System Messages")
3. **View** built-in system messages panel
4. **Send** system-wide communications
5. **Manage** contacts and message routing

---

## Technical Implementation

### Real-Time Behavior
- **Polling Interval**: `setInterval(() => loadChatMessages(), 1000)`
- **Message Sync**: Automatic every second when chat is open
- **Chat List Refresh**: Synchronizes on each poll cycle
- **Cleanup**: Polling cleared on page unload

### Data Validation
- **Mentor ID Format**: Must start with "MNT" + numbers (e.g., MNT001)
- **Student ID Format**: Must start with "STU" + numbers (e.g., STU001)
- **Message Content**: Required non-empty string
- **Group Name**: Required, minimum 3 characters
- **Participants**: At least 1 student required

### Security Features (Client-Side)
- **XSS Prevention**: HTML escaping in message display
- **Login State Verification**: User authentication check
- **Role-Based Access**: Mentors-only features gated by role
- **Unread Tracking**: User-specific message status

---

## Navigation Links

### Student Portal
- Path: `student.html`
- Button: "Messages" in sidebar (line 244)
- Action: Displays chat view with link to `chat.html`

### Mentor Portal
- Path: `mentor.html`
- Button: "Messages" in sidebar (line 116)
- Action: Displays chat view with link to `chat.html`

### Admin Dashboard
- Path: `admin.html`
- Button: "Chat" in sidebar (line 196)
- View: Built-in system messages (view-chat, lines 524-605)

---

## Current Limitations & Future Enhancements

### Current Limitations
- **No Server/Backend**: Uses localStorage only (single device)
- **No Persistent Cloud Storage**: Data lost if browser cache cleared
- **No Typing Indicators**: UI ready but not functional
- **No Edit/Delete Messages**: One-way message flow
- **No Rich Text Formatting**: Plain text only

### Future Enhancements
1. **Backend Integration**: Firebase/database for multi-device sync
2. **Real WebSocket Support**: Live updates without polling
3. **Message Reactions**: Emoji reactions to messages
4. **Message Editing**: Modify sent messages
5. **Call Integration**: Audio/video calling
6. **Notification System**: Desktop notifications
7. **Message Search**: Full-text search in conversations
8. **Pinned Messages**: Important message marking
9. **Auto-Save Draft**: Unsent message recovery
10. **Scheduled Messages**: Send at specific time

---

## Troubleshooting

### Messages Not Appearing
- **Check**: Browser localStorage not cleared
- **Solution**: Refresh page, check console for errors
- **Verify**: `localStorage.getItem('chat_<id>')` exists

### Chat Not Loading
- **Check**: User logged in via `mentorGuru_currentUser`
- **Solution**: Login first, then access chat
- **Verify**: User role is 'Student' or 'Mentor'

### File Upload Not Working
- **Check**: File size limit (localStorage ~5-10MB)
- **Solution**: Use smaller files
- **Verify**: File input element functional

### Unread Count Not Updating
- **Check**: Polling interval active
- **Solution**: Open chat to reset unread
- **Verify**: `loadChats()` function running

---

## File Changes Summary

| File | Changes | Lines |
|------|---------|-------|
| `admin.html` | Added name attributes to form fields | 730-758 |
| `student.html` | Added chat navigation & view | 244, 1003-1017 |
| `mentor.html` | Added chat navigation & view | 116, 408-420 |
| **chat.html** | **NEW** - Complete messaging system | 1-600 |

---

## Testing Checklist

- [ ] Create mentor account with MNT001 format
- [ ] Create student account with STU001 format
- [ ] Mentor login → navigate to chat → create group
- [ ] Select multiple students
- [ ] Send text message
- [ ] Upload and share image
- [ ] Upload and share file
- [ ] Send announcement
- [ ] Student login → see group chat
- [ ] Student send message in group
- [ ] Verify message appears in real-time
- [ ] Check unread count updates
- [ ] Toggle chat info panel
- [ ] Search and filter chats
- [ ] Verify message history persists
- [ ] Test logout and re-login
- [ ] Verify message history still present

---

## Code Examples

### Starting Chat System
```javascript
// Auto-runs on page load
window.addEventListener('load', init);

// Check current user
const user = localStorage.getItem('mentorGuru_currentUser');
if (!user) window.location.href = 'index.html';
```

### Creating a Group Chat
```javascript
const newChat = {
  id: Date.now(),
  name: "Class Name",
  isGroupChat: true,
  createdBy: currentUser.loginId,
  createdByName: currentUser.name,
  participants: [currentUser.loginId, ...selectedStudents],
  createdAt: new Date().toISOString(),
  lastMessage: 'Group created',
  unreadBy: {}
};

allChats.push(newChat);
localStorage.setItem('mentorGuru_chats', JSON.stringify(allChats));
```

### Sending a Message
```javascript
const message = {
  id: Date.now(),
  chatId: currentChat.id,
  senderId: currentUser.loginId,
  senderName: currentUser.name,
  type: 'text',
  content: messageText,
  timestamp: new Date().toISOString(),
  read: false
};

const messages = JSON.parse(localStorage.getItem(`chat_${currentChat.id}`)) || [];
messages.push(message);
localStorage.setItem(`chat_${currentChat.id}`, JSON.stringify(messages));
```

---

## Support & Maintenance

For issues or enhancements:
1. Check browser console for JavaScript errors
2. Verify localStorage quota (5-10MB typical limit)
3. Clear browser cache if data inconsistencies occur
4. Review console logs for authentication failures
5. Ensure user accounts properly formatted (MNT/STU prefix)

---

**Last Updated**: June 5, 2026  
**Version**: 1.0 (Beta)  
**Status**: Ready for Testing
