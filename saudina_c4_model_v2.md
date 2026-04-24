# SaudiNA Platform – C4 Model (v2)

## Level 1 – System Context
- Public User: searches meetings, uses chatbot, joins meetings
- Member: participates and receives notifications
- Moderator: claims Zoom host using host key
- Admin: manages platform
- PR Committee: uses reports

External Systems:
- Zoom API
- Maps API
- Notification Services
- AI Chatbot

---

## Level 2 – Container Diagram

Frontend:
- Next.js (Public + Admin)

Backend (NestJS):
- API Gateway
- User Service
- Meeting Service
- Governance Service
- Zoom Integration Service
- Chatbot Service
- Reporting Service

Data:
- PostgreSQL
- Redis

External:
- Zoom, Maps, Notifications, AI

---

## Level 3 – Component Diagram

Meeting Service:
- Controller
- Application Service
- Repository

Zoom Integration:
- Zoom Adapter
- Host Claim Manager
- Moderator Authorization

Chatbot:
- Query Interpreter
- Meeting Finder

---

## Level 4 – Code Level (Zoom Flow)

POST /zoom/claim-host

Flow:
1. Validate JWT
2. Check Moderator role
3. Validate meeting
4. Validate host key
5. Call Zoom API
6. Assign host
7. Update DB

Pseudocode:

function claimHost(user, meetingId, hostKey):
    assert user.role == "MODERATOR"
    meeting = meetingRepo.find(meetingId)
    if meeting.hostAssigned:
        throw Error("Already assigned")
    zoom.assignHost(meeting.zoomId)
    meetingRepo.update(meetingId)
