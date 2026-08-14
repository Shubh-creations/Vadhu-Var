# Vadhu Var — Private Admin Manual Verification Guide

This document explains how to manually review candidate verification documents and award trust badges directly in the **Supabase Dashboard**.

> [!NOTE]
> All admin operations are performed strictly in the Supabase Dashboard Table Editor. There is **zero admin UI** exposed on the deployed frontend application for maximum security.

---

## 🛠️ Step-by-Step Verification Procedure

### Step 1: Open Supabase Dashboard
1. Go to **[https://supabase.com/dashboard](https://supabase.com/dashboard)**.
2. Select your **Vadhu Var** project.
3. Click **Table Editor** from the left navigation menu.

---

### Step 2: Inspect Pending Verification Requests
1. Open the **`verification_requests`** table.
2. Filter or sort rows by `status = 'pending'`.
3. Copy the `id_document_url`, `family_consent_document_url`, or `career_proof_url` link.
4. Open the image/document URL in a browser tab to review:
   - **Government ID**: Verify candidate photo, full name, and age.
   - **Family Consent**: Verify family signature or declaration letter.
   - **Career Certificate**: Verify degree certificate, offer letter, or professional ID card.

---

### Step 3: Update Verification Status
1. In **`verification_requests`** table, edit the target request row:
   - Change `status` to `'approved'` (or `'rejected'`).
   - Set `reviewed_at` to `NOW()`.

2. Open the **`profiles`** table for the candidate's `user_id`:
   - To award **ID Verified** badge: Set `is_id_verified = true`.
   - To award **100% Verified** badge: Set `is_fully_verified = true` and `is_id_verified = true`.
   - To award **Career Verified** badge: Set `is_profession_verified = true`.

---

## 🔒 Security RLS Policies Enforced
- The frontend codebase has **zero admin routes, zero admin links, and zero client-side password checks**.
- Database RLS policies restrict regular users so they can only read public verified profiles and edit their own row.
- Table updates to `verification_requests` and `profiles` status flags are permitted **only** via project owner credentials in the Supabase Dashboard.
