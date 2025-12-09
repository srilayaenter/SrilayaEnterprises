# Security Logging Flow Diagrams

## Complete Authentication Flow with Security Logging

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Authentication Flow                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Login   │────▶│ Register │────▶│   Logout     │────▶│ Security │
│   Page   │     │   Page   │     │   Action     │     │Dashboard │
└──────────┘     └──────────┘     └──────────────┘     └──────────┘
     │                │                   │                   │
     │                │                   │                   │
     ▼                ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Security Logging System                      │
│  • Login Attempts  • Security Events  • Active Sessions         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Login Flow with Security Logging

```
User enters credentials
         │
         ▼
┌─────────────────────┐
│ Submit Login Form   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Supabase Auth       │
│ signInWithPassword  │
└─────────────────────┘
         │
         ├─────────────────────┐
         │                     │
    ❌ Failed            ✅ Success
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ logLoginAttempt()   │  │ logLoginAttempt()   │
│ - email             │  │ - email             │
│ - success: false    │  │ - success: true     │
│ - failure_reason    │  │                     │
│ - IP address        │  │ - IP address        │
└─────────────────────┘  └─────────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Show Error Toast    │  │ logSecurityEvent()  │
│ "登录失败"          │  │ - user_id           │
└─────────────────────┘  │ - type: 'login'     │
                         │ - description       │
                         │ - IP address        │
                         │ - user_agent        │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ createActiveSession │
                         │ - user_id           │
                         │ - session_token     │
                         │ - IP address        │
                         │ - user_agent        │
                         │ - expires_at (24h)  │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ Show Success Toast  │
                         │ "欢迎回来！"        │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ Navigate to App     │
                         └─────────────────────┘
```

---

## Registration Flow with Security Logging

```
User fills registration form
         │
         ▼
┌─────────────────────┐
│ Validate Password   │
│ - Match check       │
│ - Length check (6+) │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Supabase Auth       │
│ signUp()            │
└─────────────────────┘
         │
         ├─────────────────────┐
         │                     │
    ❌ Failed            ✅ Success
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Show Error Toast    │  │ logSecurityEvent()  │
│ "注册失败"          │  │ - user_id           │
└─────────────────────┘  │ - type: 'registration'│
                         │ - description       │
                         │ - metadata:         │
                         │   * email           │
                         │   * full_name       │
                         │ - IP address        │
                         │ - user_agent        │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ createActiveSession │
                         │ - user_id           │
                         │ - session_token     │
                         │ - IP address        │
                         │ - user_agent        │
                         │ - expires_at (24h)  │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ Show Success Toast  │
                         │ "账户创建成功！"    │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ Navigate to App     │
                         └─────────────────────┘
```

---

## Logout Flow with Security Logging

```
User clicks Logout button
         │
         ▼
┌─────────────────────┐
│ AuthProvider        │
│ signOut()           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ logSecurityEvent()  │
│ - user_id           │
│ - type: 'logout'    │
│ - description       │
│ - metadata:         │
│   * email           │
│ - IP address        │
│ - user_agent        │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ deleteActiveSession │
│ - user_id           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Supabase Auth       │
│ signOut()           │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Clear Local State   │
│ - user = null       │
│ - session = null    │
│ - profile = null    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Redirect to Login   │
└─────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                 │
│  │ Login.tsx│  │Register  │  │AuthProvider  │                 │
│  │          │  │.tsx      │  │.tsx          │                 │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘                 │
│       │             │                │                          │
│       └─────────────┴────────────────┘                          │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Utility Layer                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              /src/utils/security.ts                      │  │
│  │                                                          │  │
│  │  • getUserIP()                                           │  │
│  │  • getUserAgent()                                        │  │
│  │  • logLoginAttempt()                                     │  │
│  │  • logSecurityEventWrapper()                             │  │
│  │  • createActiveSession()                                 │  │
│  │  • deleteActiveSession()                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            /src/db/security-api.ts                       │  │
│  │                                                          │  │
│  │  • logSecurityEvent()                                    │  │
│  │  • recordLoginAttempt()                                  │  │
│  │  • getSecurityAuditLogs()                                │  │
│  │  • getLoginAttempts()                                    │  │
│  │  • getActiveSessions()                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │security_audit_   │  │login_attempts    │  │active_       │ │
│  │logs              │  │                  │  │sessions      │ │
│  │                  │  │                  │  │              │ │
│  │• id              │  │• id              │  │• id          │ │
│  │• user_id         │  │• email           │  │• user_id     │ │
│  │• event_type      │  │• ip_address      │  │• session_    │ │
│  │• event_desc      │  │• success         │  │  token       │ │
│  │• ip_address      │  │• failure_reason  │  │• ip_address  │ │
│  │• user_agent      │  │• created_at      │  │• user_agent  │ │
│  │• metadata        │  │                  │  │• last_       │ │
│  │• created_at      │  │                  │  │  activity    │ │
│  │                  │  │                  │  │• expires_at  │ │
│  │                  │  │                  │  │• created_at  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Event Types

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Events                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │   'login'    │  → User successfully logged in                │
│  └──────────────┘                                               │
│       │                                                          │
│       ├─ user_id: UUID of logged-in user                        │
│       ├─ description: "用户登录成功"                            │
│       ├─ metadata: { email }                                    │
│       ├─ ip_address: User's IP                                  │
│       └─ user_agent: Browser info                               │
│                                                                 │
│  ┌──────────────┐                                               │
│  │  'logout'    │  → User logged out                            │
│  └──────────────┘                                               │
│       │                                                          │
│       ├─ user_id: UUID of logged-out user                       │
│       ├─ description: "用户登出"                                │
│       ├─ metadata: { email }                                    │
│       ├─ ip_address: User's IP                                  │
│       └─ user_agent: Browser info                               │
│                                                                 │
│  ┌──────────────┐                                               │
│  │'registration'│  → New user registered                        │
│  └──────────────┘                                               │
│       │                                                          │
│       ├─ user_id: UUID of new user                              │
│       ├─ description: "新用户注册"                              │
│       ├─ metadata: { email, full_name }                         │
│       ├─ ip_address: User's IP                                  │
│       └─ user_agent: Browser info                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Session Lifecycle                          │
└─────────────────────────────────────────────────────────────────┘

Login/Registration
       │
       ▼
┌─────────────────────┐
│ Create Session      │
│ - Generate token    │
│ - Set expires_at    │
│   (now + 24 hours)  │
│ - Store IP & UA     │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Active Session      │
│ - User is logged in │
│ - Session valid     │
│ - Can update        │
│   last_activity     │
└─────────────────────┘
       │
       ├─────────────────────┐
       │                     │
   Logout              Expires (24h)
       │                     │
       ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Delete Session      │  │ Auto Cleanup        │
│ - Remove from DB    │  │ - Removed by cron   │
│ - Log logout event  │  │ - No logout event   │
└─────────────────────┘  └─────────────────────┘
```

---

## Admin Dashboard View

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Dashboard                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Statistics                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Failed Logins (24h):      12                            │  │
│  │  Successful Logins (24h):  45                            │  │
│  │  Active Sessions:          23                            │  │
│  │  Security Events (7d):     156                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Audit Logs                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Time       │ User      │ Event  │ IP Address │ Details   │  │
│  ├────────────┼───────────┼────────┼────────────┼───────────┤  │
│  │ 10:30 AM   │ user@...  │ login  │ 192.168... │ Success   │  │
│  │ 10:25 AM   │ admin@... │ logout │ 192.168... │ Normal    │  │
│  │ 10:20 AM   │ new@...   │ regist │ 192.168... │ New user  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Login Attempts                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ Time       │ Email     │ Success│ IP Address │ Reason    │  │
│  ├────────────┼───────────┼────────┼────────────┼───────────┤  │
│  │ 10:30 AM   │ user@...  │ ✅     │ 192.168... │ -         │  │
│  │ 10:28 AM   │ user@...  │ ❌     │ 192.168... │ Wrong pwd │  │
│  │ 10:25 AM   │ admin@... │ ✅     │ 192.168... │ -         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Active Sessions                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ User      │ IP Address │ Browser    │ Last Activity      │  │
│  ├───────────┼────────────┼────────────┼────────────────────┤  │
│  │ user@...  │ 192.168... │ Chrome 120 │ 2 minutes ago      │  │
│  │ admin@... │ 192.168... │ Firefox 121│ 5 minutes ago      │  │
│  │ test@...  │ 192.168... │ Safari 17  │ 10 minutes ago     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
Security Logging Function Called
         │
         ▼
┌─────────────────────┐
│ Try to Execute      │
└─────────────────────┘
         │
         ├─────────────────────┐
         │                     │
    ✅ Success           ❌ Error
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Log to Database     │  │ Catch Error         │
│ Return Success      │  │ Log to Console      │
└─────────────────────┘  │ Don't Throw         │
                         │ Continue Execution  │
                         └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │ Authentication      │
                         │ Continues Normally  │
                         │ (Not Blocked)       │
                         └─────────────────────┘
```

---

## IP Address Detection Flow

```
getUserIP() Called
         │
         ▼
┌─────────────────────┐
│ Fetch from          │
│ api.ipify.org       │
└─────────────────────┘
         │
         ├─────────────────────┐
         │                     │
    ✅ Success           ❌ Error
         │                     │
         ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ Return IP Address   │  │ Return 'unknown'    │
│ (e.g., 192.168.1.1) │  │ Log Error           │
└─────────────────────┘  └─────────────────────┘
```

---

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Logging System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT                    PROCESSING                OUTPUT      │
│                                                                 │
│  User Actions            Security Utils           Database      │
│  ┌──────────┐           ┌──────────┐            ┌──────────┐   │
│  │ Login    │──────────▶│ Log      │───────────▶│ Audit    │   │
│  │ Register │           │ Attempt  │            │ Logs     │   │
│  │ Logout   │           └──────────┘            └──────────┘   │
│  └──────────┘                 │                                │
│       │                       │                 ┌──────────┐   │
│       │                       ├────────────────▶│ Login    │   │
│       │                       │                 │ Attempts │   │
│       │                       │                 └──────────┘   │
│       │                       │                                │
│       │                       │                 ┌──────────┐   │
│       │                       └────────────────▶│ Active   │   │
│       │                                         │ Sessions │   │
│       │                                         └──────────┘   │
│       │                                                        │
│       └────────────────────────────────────────────────────────┤
│                                                                 │
│                         MONITORING                              │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │ Security         │                         │
│                    │ Dashboard        │                         │
│                    │                  │                         │
│                    │ • Statistics     │                         │
│                    │ • Audit Logs     │                         │
│                    │ • Login Attempts │                         │
│                    │ • Active Sessions│                         │
│                    └──────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
