# Smart Grievance System - Restructure Plan

## Step 1: index.html (Public Website) ✅ DONE
- [x] Remove Grievance Dashboard stats section (Total, Resolved, Pending, In Progress counters)
- [x] Keep: Header, Hero, Quick Actions (Submit & Track), Mandals, Complaint Form, Track Section, Footer
- [x] Remove "Dashboard" and "Admin" nav links from public navigation
- [x] Mandal cards: make clickable, link to filtered development works view
- [x] Add "Latest Development Works & Activities" sliding carousel section
- [x] Add Contact section with helpline info
- [x] Public site does NOT show any complaint statistics

## Step 2: admin.html (Admin Panel) ✅ DONE
- [x] Login screen (username + password, centered branded card)
- [x] After login: Dashboard layout with sidebar + topbar
- [x] Admin sidebar: Dashboard, Complaints, Manage Works, View Public Site, Logout
- [x] Dashboard cards: Total Complaints, Pending, Resolved, In Progress
- [x] Complaints table: ID, Name, Phone, Mandal, Issue, Status (editable dropdown), Date, Action
- [x] Add Works form: Title, Mandal, Image URL, Status
- [x] Basic JS auth with sessionStorage
- [x] Admin-only access - no link from public page

## Step 3: style.css ✅ DONE
- [x] Complete all public site styles
- [x] Add sliding carousel styles
- [x] Add admin panel styles (sidebar, topbar, stat cards, tables, login page)
- [x] Add responsive styles

## Step 4: script.js ✅ DONE
- [x] Keep all existing public functionality
- [x] Add admin login/logout with sessionStorage
- [x] Load complaints table in admin with status update dropdown
- [x] Admin dashboard stats calculation
- [x] Add works functionality
- [x] Mandal filter for public site works display
- [x] Latest works carousel with auto-scroll

## Step 5: Test
- [ ] Verify index.html loads correctly
- [ ] Verify admin.html login/logout flow
- [ ] Verify complaint submission and tracking
