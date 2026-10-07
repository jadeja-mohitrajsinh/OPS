# OPS Tasks Widget Architecture

## Existing task architecture

| Layer | Existing source | Responsibility |
| --- | --- | --- |
| Frontend | `app/tasks/page.js` | Fetches, creates, edits, completes, and deletes tasks. |
| API | `app/api/tasks/route.js`, `app/api/tasks/[id]/route.js` | Account-scoped task CRUD. |
| MongoDB | `models/Task.js` | Canonical task schema: `name`, `status`, `deadline`, `area`, and ownership metadata. |
| Authentication | `lib/require-session.js`, `lib/auth.js` | Cookie-backed Google-authenticated session. |
| Android | `capacitor.config.json`, `android/app/src/main/java/me/mohitrajsinh/ops/MainActivity.java` | Capacitor host; package `me.mohitrajsinh.ops`. |

There is no task Zustand/context store, no `starred` field, and no project task category in the current schema. The widget consequently uses existing `All Tasks`, `Today`, `College`, and `Personal` filters rather than creating a parallel data model.

## Widget data flow

```text
MongoDB -> OPS authenticated API -> Tasks page service -> OpsWidget Capacitor plugin
        -> Android SharedPreferences cache -> Jetpack Glance TasksWidget
```

The Kotlin widget can also refresh the cache through the same authenticated `/api/tasks` endpoint using the existing WebView session cookie. It never accesses MongoDB or packages database credentials.

Completion is optimistic: the widget immediately marks its local cache item done, queues the task ID, then writes through the existing `PUT /api/tasks/[id]` endpoint. A failed request stays queued and is retried by the next widget sync. Native Google sign-in flushes the cookie jar before redirecting so the session and widget authentication survive an app restart.

## Native files

- `android/app/src/main/java/me/mohitrajsinh/ops/OpsWidgetPlugin.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/TasksWidget.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/TasksWidgetReceiver.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/WidgetTask.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/WidgetTaskCache.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/WidgetTaskRepository.kt`
- `android/app/src/main/java/me/mohitrajsinh/ops/widget/WidgetSyncWorker.kt`

The Android module adds Kotlin 2.1.20, Jetpack Glance 1.1.1, and WorkManager 2.9.1. WorkManager requests a connected-network sync at Android's minimum 15-minute periodic interval; task-page events refresh the local cache immediately.
