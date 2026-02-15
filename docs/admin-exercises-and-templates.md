# Admin: Exercises & Workout Templates Setup

This guide explains how to set up the **exercise library** and **workout templates** so users can log workouts from predefined plans.

---

## Order of setup

1. **Exercises first** – Build the exercise library (templates pick from this list).
2. **Workout templates second** – Create templates by selecting exercises and setting sets/reps/rest.

---

## Part 1: Exercise Management

**Path:** Admin → **Exercise Management** (sidebar or Dashboard “Exercises” card).  
**URL:** `/admin/exercises`

### Option A: Seed default exercises (fastest)

1. Go to **Exercise Management**.
2. The app **auto-seeds** 10 default exercises when the library is empty (or click **“Seed default exercises”**).
3. This adds common exercises (e.g. Bench Press, Squat, Deadlift, Pull-Up, Push-Up, Plank, etc.) to the library.

### Option B: Add exercises manually

1. Click **“Add Exercise”**.
2. Fill in:
   - **Name** (required)
   - **Category** (e.g. strength, cardio)
   - **Difficulty** (beginner / intermediate / advanced)
   - **Muscle groups** & **Equipment** (checkboxes)
   - **Description** and **Instructions** (optional)
   - **Video URL** (optional)
3. Click **“Create Exercise”**.

### Tips

- Use **Search** and **Category / Difficulty** filters to find exercises.
- **Edit** (pencil) or **Delete** (trash) from each exercise card as needed.
- Exercises in the library are what appear when creating **Workout Templates** and when users **Log a workout**.

---

## Part 2: Workout Templates

**Path:** Admin → **Workout Templates** (sidebar or Dashboard “Templates” card).  
**URL:** `/admin/workout-templates`

Templates are reusable workout plans (title + list of exercises with sets/reps/rest). Users can start a workout from a template.

### Option A: Seed default templates (fastest)

1. Ensure **Exercise Management** has exercises (seed defaults first).
2. Go to **Workout Templates**.
3. The app **auto-seeds** 4 default templates when the list is empty (or click **“Seed default templates”**).
4. Default templates: **Full Body Strength**, **Upper Body Push**, **Upper Body Pull & Legs**, **Beginner Full Body**. They use the same exercise names as the default exercise library.

### Create a template manually

1. Click **“Create Template”** (or “Create First Template” if the list is empty).
2. **Title** – e.g. “Full Body A”, “Push Day”, “Beginner Strength”.
3. **Description** (optional) – Short note about the workout.
4. **Add exercises:**
   - In **“Add Exercises”**, type in the search box to find exercises from the library.
   - Click an exercise to add it to **“Selected Exercises”**.
   - For each selected exercise set:
     - **Sets** (number)
     - **Reps** (e.g. `10` or `8–12`)
     - **Rest (s)** – rest in seconds between sets.
   - Reorder by moving exercises in the list; remove with the **X**.
5. Click **“Create Template”** (or **“Update Template”** when editing).

### Edit or delete a template

- **Expand** a template (chevron) to see its exercises.
- **Edit** (pencil) to change title, description, or exercise list/sets/reps/rest.
- **Delete** (trash) to remove the template.

### Important

- **Workout Templates** only show exercises that exist in **Exercise Management**. If the exercise library is empty, search in the template modal will show “No exercises found”. Seed or add exercises first.
- Templates you create are **public by default** (`isPublic: true`), so they appear on the user **Workouts** page under “Workout Templates”.

---

## Part 3: Workouts available for users

When you create workout templates as above, they become **workouts available for users** automatically.

1. **Where users see them**  
   Users go to **Workouts** (sidebar or dashboard). They see:

   - **My Workout Plans** – plans they’ve saved (if any).
   - **Workout Templates** – templates you created in Admin → Workout Templates. These are the “workouts available” from the admin side.

2. **Starting a workout from a template**  
   When a user clicks a template card, they are taken to **Log Workout** with that template **pre-filled**: title and exercises (with sets/reps) are already loaded. They only need to log weight and reps per set, then complete the workout.

3. **Checklist for admins**
   - Ensure **Exercise Management** has exercises (seed defaults or add manually).
   - In **Workout Templates**, create at least one template (title + exercises + sets/reps/rest).
   - Templates are public by default; users will see them under “Workout Templates” on the Workouts page.

**Optional – Firestore index:** If users don’t see any templates, the app may need a composite index on the `workout-templates` collection for `isPublic` and `createdAt`. Firebase Console will show a link to create the index when the query runs.

---

## Quick reference

| Task                  | Where                     | Action                                                              |
| --------------------- | ------------------------- | ------------------------------------------------------------------- |
| Add default exercises | Exercise Management       | Auto-seed when empty, or “Seed default exercises”                   |
| Add default templates | Workout Templates         | Auto-seed when empty (after exercises), or “Seed default templates” |
| Add custom exercise   | Exercise Management       | “Add Exercise” → fill form → Create                                 |
| Create a workout plan | Workout Templates         | “Create Template” → title → add exercises → Create                  |
| Change sets/reps/rest | Workout Templates (modal) | Add exercise, then edit in “Selected Exercises”                     |

---

## Running the app

From the repo root:

```bash
pnpm install
pnpm dev
```

Log in as an **admin** user, then open **Exercise Management** and **Workout Templates** from the admin sidebar or dashboard.
